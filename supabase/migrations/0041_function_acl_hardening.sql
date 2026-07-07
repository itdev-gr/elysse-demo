-- 0041_function_acl_hardening.sql — close the anon-EXECUTE gap on admin RPCs
-- and make the delete guard honest about what it deleted.
--
-- ⚠ Supabase default-privilege trap (why this migration exists): this project
-- has `ALTER DEFAULT PRIVILEGES ... GRANT EXECUTE ON FUNCTIONS TO anon,
-- authenticated, service_role`, so EVERY newly created public function is
-- anon-executable from birth. The `revoke all ... from public; grant ... to
-- authenticated;` pattern used in 0034/0037/0038/0039 does NOT remove that
-- per-role anon grant — `public` and `anon` are separate grantees. Verified
-- 2026-07-07: anon could execute set_family_images(uuid,jsonb) and
-- delete_library_image(uuid) (both no-op'd/were contained by RLS — anon has
-- read-only policies on the affected tables — so no data was ever at risk,
-- but the execute surface was wider than intended).
--
-- Rule for future migrations: after CREATE FUNCTION, revoke from BOTH
-- `public` AND `anon` unless the function is meant for the public site.
--
-- Post-0041 intended surface:
--   anon:          search_site only
--   authenticated: search_site + set_family_images + delete_library_image
--                  + run_product_data_checks + record_file_duplicate_codes
--   (set_updated_at is a trigger function — PostgREST cannot expose it and
--   direct calls error "trigger functions can only be called as triggers";
--   left untouched so trigger wiring carries zero risk.)

-- ── 1. delete_library_image v3: row-count-honest ───────────────────────────
-- v2 returned {'deleted': true} without checking the DELETE's row count. The
-- admin client removes the storage FILE after a deleted:true, so a false
-- positive (row vanished concurrently, or a caller whose RLS hides the row)
-- would orphan a still-referenced file — the exact incident class this guard
-- exists to prevent. Now it reports not_found unless a row was truly deleted.
-- (CREATE OR REPLACE preserves the existing ACL; the revoke below fixes it.)

create or replace function public.delete_library_image(p_id uuid)
returns jsonb
language plpgsql
as $$
declare
  v_url     text;
  v_gallery int;
  v_fams    text[];
  v_deleted int;
begin
  select url into v_url from public.product_images where id = p_id;
  if v_url is null then
    return jsonb_build_object('deleted', false, 'reason', 'not_found');
  end if;

  select count(*), coalesce(array_agg(distinct f.code), '{}')
    into v_gallery, v_fams
  from public.product_family_images i
  join public.product_families f on f.id = i.family_id
  where i.url = v_url;

  if v_gallery > 0 then
    return jsonb_build_object(
      'deleted', false, 'reason', 'in_use',
      'gallery_rows', v_gallery, 'families', to_jsonb(v_fams));
  end if;

  delete from public.product_images where id = p_id;
  get diagnostics v_deleted = row_count;
  if v_deleted = 0 then
    return jsonb_build_object('deleted', false, 'reason', 'not_found');
  end if;
  return jsonb_build_object('deleted', true, 'url', v_url);
end;
$$;

-- ── 2. Revoke the default-privilege anon grants on admin RPCs ──────────────

revoke execute on function public.set_family_images(uuid, jsonb) from anon;
revoke execute on function public.delete_library_image(uuid) from anon;

-- ── 3. Tidy redundant grants ────────────────────────────────────────────────
-- search_site keeps its explicit anon + authenticated grants (the public
-- site's search calls it as anon); the extra PUBLIC grant is redundant.
revoke all on function public.search_site(text, text, int) from public;

-- url_decode is an internal helper for the checker (SECURITY DEFINER, runs
-- as owner) — no client calls it; remove it from the Data API surface.
revoke all on function public.url_decode(text) from public, anon, authenticated;
