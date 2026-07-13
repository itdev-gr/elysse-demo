-- 0044_rename_library_image.sql — REAL image rename with a zero-breakage
-- lifecycle: copy → atomic DB rewrite → deferred re-checked claim-and-remove.
--
-- The client copies the storage object to its new path FIRST (old object
-- untouched), then calls rename_library_image() to rewrite every reference
-- in one transaction, which also enqueues the old path for cleanup. The old
-- object is deleted only by the client's cleanup pass, ≥24h later, via
-- claim_image_cleanup() — which atomically re-verifies nothing references
-- the path AND deletes the queue row in the same statement, so a late
-- re-insert can never race the file removal — so cached pages, open admin
-- tabs and back/forward navigations keep rendering, and a stale tab
-- re-inserting the old URL simply keeps that path's queue row alive forever
-- (self-healing; the data checker stays quiet).
--
-- Invariant: a referenced URL never, at any instant, lacks its storage object.
--
-- Pre-existing blind spot shared with the delete flow: a product-images URL
-- manually pasted into news_posts.cover_image / research_posts.cover_image is
-- invisible to the rewrite, the cleanup re-check, and the data checker.
--
-- SECURITY INVOKER (default) on all three functions: RLS applies, and per
-- the 0041 rule every new function is revoked from BOTH public AND anon
-- (this project's default privileges grant anon EXECUTE on new functions).

-- ── 1. Cleanup queue ────────────────────────────────────────────────────────

create table if not exists public.image_cleanup_queue (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null,
  enqueued_at  timestamptz not null default now()
);

alter table public.image_cleanup_queue enable row level security;

drop policy if exists "authenticated full access on image_cleanup_queue"
  on public.image_cleanup_queue;
create policy "authenticated full access on image_cleanup_queue"
on public.image_cleanup_queue for all to authenticated
using (true) with check (true);
-- No anon policies: the queue is admin plumbing.

-- ── 2. Restore url_decode EXECUTE for authenticated ─────────────────────────
-- url_decode was revoked from authenticated in 0041 (Data API tidiness).
-- rename_library_image / due_image_cleanups are SECURITY INVOKER and run as
-- authenticated, so EXECUTE on this pure immutable helper is required again.
grant execute on function public.url_decode(text) to authenticated;

-- ── 3. Atomic rename ────────────────────────────────────────────────────────

create or replace function public.rename_library_image(
  p_id uuid,
  p_new_url text,
  p_new_filename text
)
returns jsonb
language plpgsql
as $$
declare
  v_old_url  text;
  v_old_path text;
  v_gallery  int;
begin
  if p_new_url is null or btrim(p_new_url) = ''
     or p_new_filename is null or btrim(p_new_filename) = '' then
    return jsonb_build_object('renamed', false, 'reason', 'bad_input');
  end if;

  select url into v_old_url
  from public.product_images where id = p_id
  for update;
  if v_old_url is null then
    return jsonb_build_object('renamed', false, 'reason', 'not_found');
  end if;
  if v_old_url = p_new_url then
    return jsonb_build_object('renamed', false, 'reason', 'same_url');
  end if;
  if exists (select 1 from public.product_images
             where url = p_new_url and id <> p_id) then
    return jsonb_build_object('renamed', false, 'reason', 'url_taken');
  end if;

  update public.product_images
     set url = p_new_url, filename = p_new_filename
   where id = p_id;

  -- Every gallery row follows in the same transaction — the public catalog
  -- (SSR from live DB) flips to the new URL atomically with the library row.
  update public.product_family_images
     set url = p_new_url
   where url = v_old_url;
  get diagnostics v_gallery = row_count;

  -- Enqueue the OLD object for deferred cleanup (same path expression the
  -- data checker uses). url_decode('') is NULL, and url_decode of a URL
  -- outside the bucket is also NULL-or-empty; `<> ''` correctly skips both
  -- (NULL is not true), so non-bucket URLs have nothing enqueued.
  v_old_path := public.url_decode(
    split_part(v_old_url, '/storage/v1/object/public/product-images/', 2));
  if v_old_path <> '' then
    insert into public.image_cleanup_queue (storage_path) values (v_old_path);
  end if;

  return jsonb_build_object(
    'renamed', true, 'old_url', v_old_url, 'gallery_rows', v_gallery);
end;
$$;

revoke all on function public.rename_library_image(uuid, text, text) from public;
revoke all on function public.rename_library_image(uuid, text, text) from anon;
grant execute on function public.rename_library_image(uuid, text, text) to authenticated;

-- ── 4. Re-checked cleanup feed ──────────────────────────────────────────────
-- Due = enqueued >24h ago AND no library or gallery row still resolves to the
-- path. The re-check is what makes cleanup safe against stale-tab re-inserts.
-- This only enumerates candidates; claim_image_cleanup() below re-verifies
-- and deletes atomically, closing the TOCTOU window between this SELECT and
-- the client's later storage.remove().

create or replace function public.due_image_cleanups()
returns table (id uuid, storage_path text)
language sql
stable
as $$
  select q.id, q.storage_path
  from public.image_cleanup_queue q
  where q.enqueued_at < now() - interval '24 hours'
    and not exists (
      select 1 from public.product_images i
      where public.url_decode(split_part(i.url,
        '/storage/v1/object/public/product-images/', 2)) = q.storage_path)
    and not exists (
      select 1 from public.product_family_images g
      where public.url_decode(split_part(g.url,
        '/storage/v1/object/public/product-images/', 2)) = q.storage_path);
$$;

revoke all on function public.due_image_cleanups() from public;
revoke all on function public.due_image_cleanups() from anon;
grant execute on function public.due_image_cleanups() to authenticated;

-- ── 5. Atomic claim-and-remove ──────────────────────────────────────────────
-- Atomically re-verify and claim one queue entry: the row is deleted in the
-- same statement that proves the path is unreferenced, so a late re-insert
-- can no longer race the file removal. Returns the path to remove, or NULL
-- when the row is gone or the path is referenced again (keep the row: the
-- old object must then outlive the reference).
create or replace function public.claim_image_cleanup(p_id uuid)
returns text
language sql
as $$
  delete from public.image_cleanup_queue q
  where q.id = p_id
    and q.enqueued_at < now() - interval '24 hours'
    and not exists (
      select 1 from public.product_images i
      where public.url_decode(split_part(i.url,
        '/storage/v1/object/public/product-images/', 2)) = q.storage_path)
    and not exists (
      select 1 from public.product_family_images g
      where public.url_decode(split_part(g.url,
        '/storage/v1/object/public/product-images/', 2)) = q.storage_path)
  returning q.storage_path;
$$;

revoke all on function public.claim_image_cleanup(uuid) from public;
revoke all on function public.claim_image_cleanup(uuid) from anon;
grant execute on function public.claim_image_cleanup(uuid) to authenticated;
