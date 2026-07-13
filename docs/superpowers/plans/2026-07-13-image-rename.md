# Image Rename (Real File Rename) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admins can rename an image in the Images library and the storage object really moves — new URL, new display name — while the live site keeps working at every instant and under every failure mode.

**Architecture:** Copy the storage object to its new path first (old file untouched), rewrite all DB references in ONE transaction via a new `rename_library_image` RPC, and delete the old file lazily ≥24h later through a re-checked cleanup queue (`due_image_cleanups` returns only unreferenced paths). Catalog pages are `prerender = false` (SSR from live DB), so the committed rewrite takes effect immediately; the grace window covers caches and stale tabs. Invariant for every step: **a referenced URL never, at any instant, lacks its storage object.**

**Tech Stack:** Astro 6 + React 19 islands, Supabase (Postgres RPC + Storage), vitest.

**Spec:** `docs/superpowers/specs/2026-07-13-image-rename-design.md`

## Global Constraints

- **NO `git commit` / `git push` at any point.** The user reviews the working tree first (standing rule — overrides this template's commit steps). New files get `git add -N` (intent-to-add) so they appear in diffs.
- **NEVER apply the migration to the live database during implementation.** The SQL file lands in the repo; applying it happens at release, only with explicit user consent (Management API; jq is broken on this machine — use Python for JSON payloads).
- Supabase ACL trap (0041): this project has `ALTER DEFAULT PRIVILEGES … GRANT EXECUTE ON FUNCTIONS TO anon`, so every new function MUST get `revoke all … from public;` AND `revoke all … from anon;` then `grant execute … to authenticated;`.
- The rename invariant above; the old storage object is only ever deleted by the re-checked cleanup, never by the rename flow itself.
- Storage path scheme stays `uploads/{uuid}-{sanitisedName}` with the exact sanitise rule `name.replace(/[^a-zA-Z0-9.\-]+/g, '-')`.
- Extension is preserved from the stored object; typed extensions are stripped and the original re-appended; a stored object with no extension keeps the typed name as-is.
- Families-tab image picker is unchanged (no Rename there).
- Tests: `npx vitest run <file>` per task; full `npm test` + `npm run build` at the end.

---

### Task 1: Pure helpers — `sanitiseName` + `planImageRename` (and dedupe the two private copies)

**Files:**
- Create: `src/lib/image-rename.ts`
- Create: `src/lib/image-rename.test.ts`
- Modify: `src/components/admin/ImagesTab.tsx:9-13` (delete local `sanitiseName`, import from lib)
- Modify: `src/components/admin/FamiliesTab.tsx:22-24` (delete local `sanitiseName`, import from lib)

**Interfaces:**
- Consumes: `storagePathFromUrl(url: string): string | null` from `src/lib/image-refs.ts` (existing).
- Produces: `sanitiseName(name: string): string`; `interface RenamePlan { newFilename: string; newPath: string }`; `planImageRename(current: { url: string; filename: string | null }, requestedName: string, uuid: string): { plan: RenamePlan } | { error: string }` — Task 4 calls it and narrows with `'error' in result`.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/image-rename.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { planImageRename, sanitiseName } from './image-rename';

const BUCKET = 'https://x.supabase.co/storage/v1/object/public/product-images/';
const img = (path: string, filename: string | null) =>
  ({ url: `${BUCKET}${path}`, filename });

describe('sanitiseName', () => {
  it('replaces runs of disallowed characters with a single dash', () => {
    expect(sanitiseName('my photo (2).jpg')).toBe('my-photo-2-.jpg');
  });
  it('keeps letters, digits, dots and dashes', () => {
    expect(sanitiseName('Epsilon-1.2.png')).toBe('Epsilon-1.2.png');
  });
});

describe('planImageRename', () => {
  const current = img('uploads/u1-old-name.jpg', 'old-name.jpg');

  it('rejects an empty or whitespace name', () => {
    expect(planImageRename(current, '', 'u2')).toEqual({ error: 'Enter a name for the image.' });
    expect(planImageRename(current, '   ', 'u2')).toEqual({ error: 'Enter a name for the image.' });
  });
  it('rejects renaming to the current name', () => {
    expect(planImageRename(current, 'old-name.jpg', 'u2'))
      .toEqual({ error: 'The image is already called that.' });
    expect(planImageRename(current, 'old-name', 'u2'))
      .toEqual({ error: 'The image is already called that.' });
  });
  it('appends the stored extension when the admin types none', () => {
    expect(planImageRename(current, 'epsilon-valve', 'u2')).toEqual({
      plan: { newFilename: 'epsilon-valve.jpg', newPath: 'uploads/u2-epsilon-valve.jpg' },
    });
  });
  it('replaces a typed extension with the stored one (type cannot change)', () => {
    expect(planImageRename(current, 'epsilon-valve.png', 'u2')).toEqual({
      plan: { newFilename: 'epsilon-valve.jpg', newPath: 'uploads/u2-epsilon-valve.jpg' },
    });
  });
  it('keeps dots inside the base name', () => {
    expect(planImageRename(current, 'valve-v1.2', 'u2')).toEqual({
      plan: { newFilename: 'valve-v1.2.jpg', newPath: 'uploads/u2-valve-v1.2.jpg' },
    });
  });
  it('sanitises the path but keeps the raw display name', () => {
    expect(planImageRename(current, 'my summer photo', 'u2')).toEqual({
      plan: { newFilename: 'my summer photo.jpg', newPath: 'uploads/u2-my-summer-photo.jpg' },
    });
  });
  it('uses the typed name as-is when the stored object has no extension', () => {
    expect(planImageRename(img('uploads/u1-scan', 'scan'), 'better-scan.jpg', 'u2')).toEqual({
      plan: { newFilename: 'better-scan.jpg', newPath: 'uploads/u2-better-scan.jpg' },
    });
  });
  it('falls back to the filename extension for URLs outside the bucket', () => {
    expect(planImageRename({ url: 'https://example.com/a', filename: 'a.png' }, 'b', 'u2')).toEqual({
      plan: { newFilename: 'b.png', newPath: 'uploads/u2-b.png' },
    });
  });
  it('rejects a name with no letters or numbers', () => {
    expect(planImageRename(current, '???.jpg', 'u2'))
      .toEqual({ error: 'The name must contain at least one letter or number.' });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/image-rename.test.ts`
Expected: FAIL — cannot resolve `./image-rename`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/image-rename.ts`:

```ts
/**
 * Pure helpers for renaming a library image (admin Images tab).
 * The rename is REAL — the storage object moves to a new path — so the tab
 * executes: storage copy → atomic DB rewrite (rename_library_image RPC) →
 * deferred re-checked cleanup of the old object. This module only computes
 * the plan; colocated tests in image-rename.test.ts.
 */
import { storagePathFromUrl } from './image-refs';

/** Storage-safe object name — the same rule the upload paths use. */
export function sanitiseName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-]+/g, '-');
}

export interface RenamePlan {
  /** New display name (extension preserved from the stored object). */
  newFilename: string;
  /** New storage object path: uploads/{uuid}-{sanitised newFilename}. */
  newPath: string;
}

const IMAGE_EXTS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.bmp', '.tif', '.tiff', '.ico',
]);

/** Extension (with dot) at the end of a name, '' when there is none. */
function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return '';
  const ext = name.slice(dot);
  return /^\.[a-zA-Z0-9]+$/.test(ext) ? ext : '';
}

/**
 * Validate a requested name and compute the new display name + storage path.
 * The file's bytes never change, so the stored extension always wins: a typed
 * IMAGE extension (or one matching the stored extension) is stripped and the
 * original re-appended — but a dotted version suffix like "valve-v1.2" is
 * kept as part of the name. When the stored object has no extension the
 * typed name is used as-is.
 */
export function planImageRename(
  current: { url: string; filename: string | null },
  requestedName: string,
  uuid: string,
): { plan: RenamePlan } | { error: string } {
  const typed = requestedName.trim();
  if (typed === '') return { error: 'Enter a name for the image.' };

  const storedName = storagePathFromUrl(current.url)?.split('/').pop() ?? '';
  const ext = extensionOf(storedName) || extensionOf(current.filename ?? '');

  const typedExt = extensionOf(typed);
  const stripTyped =
    ext !== '' &&
    typedExt !== '' &&
    (IMAGE_EXTS.has(typedExt.toLowerCase()) || typedExt.toLowerCase() === ext.toLowerCase());
  const base = stripTyped ? typed.slice(0, typed.length - typedExt.length) : typed;
  if (base === '') return { error: 'Enter a name for the image.' };
  if (!/[a-zA-Z0-9]/.test(base)) {
    return { error: 'The name must contain at least one letter or number.' };
  }

  const newFilename = base + ext;
  if (newFilename === current.filename) {
    return { error: 'The image is already called that.' };
  }

  return { plan: { newFilename, newPath: `uploads/${uuid}-${sanitiseName(newFilename)}` } };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/image-rename.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 5: Point both tabs at the shared copy**

In `src/components/admin/ImagesTab.tsx`, delete the local helper block:

```tsx
// ─── Helpers ────────────────────────────────────────────────────────────────

function sanitiseName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-]+/g, '-');
}
```

and add to the imports:

```tsx
import { sanitiseName } from '../../lib/image-rename';
```

In `src/components/admin/FamiliesTab.tsx`, delete its identical local `sanitiseName` function (lines 22-24) and add the same import:

```tsx
import { sanitiseName } from '../../lib/image-rename';
```

- [ ] **Step 6: Verify no regressions and stage new files**

Run: `npx vitest run`
Expected: all suites PASS.

Run: `git add -N src/lib/image-rename.ts src/lib/image-rename.test.ts`
(No commit — intent-to-add only.)

---

### Task 2: Migration `0044_rename_library_image.sql`

**Files:**
- Create: `supabase/migrations/0044_rename_library_image.sql`

**Interfaces:**
- Consumes: `public.url_decode(text)` (created in 0036), `public.product_images`, `public.product_family_images`.
- Produces: table `public.image_cleanup_queue (id uuid, storage_path text, enqueued_at timestamptz)`; RPC `rename_library_image(p_id uuid, p_new_url text, p_new_filename text) returns jsonb` (`{renamed:true, old_url, gallery_rows}` or `{renamed:false, reason:'bad_input'|'not_found'|'same_url'|'url_taken'}`); RPC `due_image_cleanups() returns table (id uuid, storage_path text)`. Task 4's client code calls both RPCs and deletes queue rows directly.

- [ ] **Step 1: Write the migration file**

Create `supabase/migrations/0044_rename_library_image.sql`:

```sql
-- 0044_rename_library_image.sql — REAL image rename with a zero-breakage
-- lifecycle: copy → atomic DB rewrite → deferred re-checked cleanup.
--
-- The client copies the storage object to its new path FIRST (old object
-- untouched), then calls rename_library_image() to rewrite every reference
-- in one transaction, which also enqueues the old path for cleanup. The old
-- object is deleted only by the client's cleanup pass, ≥24h later, and only
-- after due_image_cleanups() re-verifies nothing references it — so cached
-- pages, open admin tabs and back/forward navigations keep rendering, and a
-- stale tab re-inserting the old URL simply makes the cleanup skip that path
-- forever (self-healing; the data checker stays quiet).
--
-- Invariant: a referenced URL never, at any instant, lacks its storage object.
--
-- SECURITY INVOKER (default) on both functions: RLS applies, and per the
-- 0041 rule every new function is revoked from BOTH public AND anon (this
-- project's default privileges grant anon EXECUTE on new functions).

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

-- ── 2. Atomic rename ────────────────────────────────────────────────────────

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
  -- data checker uses). URLs outside the bucket have nothing to clean up.
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

-- ── 3. Re-checked cleanup feed ──────────────────────────────────────────────
-- Due = enqueued >24h ago AND no library or gallery row still resolves to the
-- path. The re-check is what makes cleanup safe against stale-tab re-inserts.

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
```

- [ ] **Step 2: Sanity-check the SQL against its consumers**

No local database exists — verification is by inspection against the exact call sites this plan creates in Task 4:
- `supabase.rpc('rename_library_image', { p_id, p_new_url, p_new_filename })` — names match the parameter names above.
- `supabase.rpc('due_image_cleanups')` — no args; returns rows `{ id, storage_path }`.
- `supabase.from('image_cleanup_queue').delete().eq('id', row.id)` — allowed by the authenticated RLS policy.
Confirm `public.url_decode` exists in `supabase/migrations/0036_image_data_checks.sql` (line 26) — it does; the migration only reuses it.

- [ ] **Step 3: Verify the repo still tests/builds and stage the file**

Run: `npx vitest run`
Expected: all suites PASS (the SQL file is inert locally).

Run: `git add -N supabase/migrations/0044_rename_library_image.sql`

**Do NOT apply this migration to the live database — release step, user consent required.**

---

### Task 3: `ImageCard` / `LibraryGrid` — optional Rename action

**Files:**
- Modify: `src/components/admin/ImageLibraryGrid.tsx`

**Interfaces:**
- Produces: `ImageCard` and `LibraryGrid` each accept an optional `onRename?: (img: ProductImage) => void`; when absent (Families-tab picker) nothing renders — the picker is unchanged.

- [ ] **Step 1: Add the prop to ImageCard**

In `src/components/admin/ImageLibraryGrid.tsx`, change the `ImageCard` signature from:

```tsx
export function ImageCard({
  img,
  onDelete,
  onPick,
}: {
  img: ProductImage;
  onDelete?: (img: ProductImage) => void;
  onPick?: (img: ProductImage) => void;
}) {
```

to:

```tsx
export function ImageCard({
  img,
  onDelete,
  onPick,
  onRename,
}: {
  img: ProductImage;
  onDelete?: (img: ProductImage) => void;
  onPick?: (img: ProductImage) => void;
  onRename?: (img: ProductImage) => void;
}) {
```

In the actions row (`<div className="mt-auto pt-1 flex gap-2">`), insert the Rename button between the `onPick` and `onDelete` blocks:

```tsx
          {onRename && (
            <button
              type="button"
              onClick={() => onRename(img)}
              className="flex-1 text-[11px] uppercase tracking-[0.2em] text-ink/70 hover:text-brand-500 transition-colors duration-200 cursor-pointer border border-ink/15 px-2 py-1"
            >
              Rename
            </button>
          )}
```

- [ ] **Step 2: Pass it through LibraryGrid**

Change the `LibraryGrid` signature from:

```tsx
export function LibraryGrid({
  images,
  onDelete,
  onPick,
  emptyLabel = 'No images in the library yet.',
}: {
  images: ProductImage[];
  onDelete?: (img: ProductImage) => void;
  onPick?: (img: ProductImage) => void;
  emptyLabel?: string;
}) {
```

to:

```tsx
export function LibraryGrid({
  images,
  onDelete,
  onPick,
  onRename,
  emptyLabel = 'No images in the library yet.',
}: {
  images: ProductImage[];
  onDelete?: (img: ProductImage) => void;
  onPick?: (img: ProductImage) => void;
  onRename?: (img: ProductImage) => void;
  emptyLabel?: string;
}) {
```

and the card render from:

```tsx
        <ImageCard key={img.id} img={img} onDelete={onDelete} onPick={onPick} />
```

to:

```tsx
        <ImageCard key={img.id} img={img} onDelete={onDelete} onPick={onPick} onRename={onRename} />
```

- [ ] **Step 3: Verify no regressions**

Run: `npx vitest run`
Expected: all suites PASS. (FamiliesTab and the Families modal pass no `onRename`, so their grids render exactly as before.)

---

### Task 4: ImagesTab — rename flow + deferred cleanup

**Files:**
- Modify: `src/components/admin/ImagesTab.tsx`

**Interfaces:**
- Consumes: `planImageRename`, `RenamePlan` behavior from Task 1; `rename_library_image` / `due_image_cleanups` RPCs and `image_cleanup_queue` table from Task 2; `onRename` prop from Task 3; existing `storagePathFromUrl`, `loadImages`, `triggerPublish`, `libError`.

- [ ] **Step 1: Extend imports and state**

In `src/components/admin/ImagesTab.tsx`, the Task 1 import line becomes:

```tsx
import { planImageRename, sanitiseName } from '../../lib/image-rename';
```

Below `const [libError, setLibError] = useState<string | null>(null);` add:

```tsx
  const [renaming, setRenaming] = useState(false);
```

- [ ] **Step 2: Add the deferred cleanup pass (runs once on mount)**

After the `loadImages` callback, add:

```tsx
  // Deferred rename cleanup: old storage objects whose 24h grace window has
  // passed AND that nothing references anymore (due_image_cleanups re-checks
  // in SQL). Remove the file first, then the queue row — a failed removal
  // leaves the row to retry on the next visit; a removed file with a failed
  // row-delete just yields a harmless no-op retry.
  const runDueCleanups = useCallback(async () => {
    const { data, error } = await supabase.rpc('due_image_cleanups');
    if (error) return; // silent — cleanup is background plumbing
    for (const row of (data ?? []) as { id: string; storage_path: string }[]) {
      const { error: rmErr } = await supabase.storage
        .from('product-images').remove([row.storage_path]);
      if (rmErr) continue;
      await supabase.from('image_cleanup_queue').delete().eq('id', row.id);
    }
  }, []);

  useEffect(() => { void runDueCleanups(); }, [runDueCleanups]);
```

- [ ] **Step 3: Add the rename handler**

After `handleDelete`, add:

```tsx
  // ── rename handler ───────────────────────────────────────────────────────
  // REAL rename: copy to the new path (old file untouched) → atomic DB
  // rewrite via RPC (library row + every gallery row + cleanup enqueue in one
  // transaction) → reload. The old object outlives all references by ≥24h
  // (removed by runDueCleanups), so nothing cached can break. Any failure
  // leaves the site fully on the old URL.
  const handleRename = async (img: ProductImage) => {
    if (renaming || uploading) return;
    const requested = prompt(`Rename "${img.filename ?? 'image'}" to:`, img.filename ?? '');
    if (requested === null) return;

    const result = planImageRename({ url: img.url, filename: img.filename }, requested, crypto.randomUUID());
    if ('error' in result) { setLibError(result.error); return; }

    const oldPath = storagePathFromUrl(img.url);
    if (!oldPath) {
      setLibError('This image is not stored in the product-images bucket, so it cannot be renamed.');
      return;
    }

    setRenaming(true);
    setLibError(null);
    try {
      const { error: cpErr } = await supabase.storage
        .from('product-images').copy(oldPath, result.plan.newPath);
      if (cpErr) {
        setLibError(`Could not copy the file to its new name: ${cpErr.message}`);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('product-images').getPublicUrl(result.plan.newPath);
      const { data, error } = await supabase.rpc('rename_library_image', {
        p_id: img.id,
        p_new_url: urlData.publicUrl,
        p_new_filename: result.plan.newFilename,
      });
      if (error || !data?.renamed) {
        // Roll back the copy (best-effort — an orphan is harmless, nothing
        // references it) and leave everything on the old URL.
        await supabase.storage.from('product-images').remove([result.plan.newPath]);
        setLibError(error ? error.message : `Could not rename (${data?.reason ?? 'unknown error'}).`);
        return;
      }

      await loadImages();
      triggerPublish();
    } finally {
      setRenaming(false);
    }
  };
```

Also guard `handleDelete` against a concurrent rename — its first line

```tsx
    if (!confirm(`Delete image "${img.filename}"? This cannot be undone.`)) return;
```

becomes:

```tsx
    if (renaming) return;
    if (!confirm(`Delete image "${img.filename}"? This cannot be undone.`)) return;
```

- [ ] **Step 4: Wire the button**

Change the grid render from:

```tsx
          <LibraryGrid
            images={visible}
            onDelete={handleDelete}
            emptyLabel={query.trim() !== '' ? `No images match “${query}”.` : 'No images in the library yet.'}
          />
```

to:

```tsx
          <LibraryGrid
            images={visible}
            onDelete={handleDelete}
            onRename={handleRename}
            emptyLabel={query.trim() !== '' ? `No images match “${query}”.` : 'No images in the library yet.'}
          />
```

- [ ] **Step 5: Verify no regressions**

Run: `npx vitest run`
Expected: all suites PASS.

---

### Task 5: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Full suite + production build**

Run: `npm test` — every suite PASS (including the 11 new image-rename tests).
Run: `npm run build` — completes with no TypeScript/JSX errors.

- [ ] **Step 2: Confirm the untouched surfaces**

- `git diff HEAD --stat` shows ONLY: `src/lib/image-rename.ts` (+test), `src/components/admin/ImagesTab.tsx`, `src/components/admin/ImageLibraryGrid.tsx`, `src/components/admin/FamiliesTab.tsx` (sanitiseName import only), `supabase/migrations/0044_rename_library_image.sql`.
- FamiliesTab's diff contains nothing beyond the import swap.

- [ ] **Step 3: Release checklist (deferred — do NOT execute without user consent)**

1. Pre-apply spot-check: this repo has recorded live-vs-repo function drift (see `search_site` RPC drift), so before applying 0044, pull the LIVE definitions of `url_decode` (its current ACL — is `authenticated` EXECUTE already present or was it actually revoked by 0041?) and `set_family_images` via `pg_get_functiondef`, and diff them against what the repo assumes, rather than trusting the migration history alone.
2. Apply `0044_rename_library_image.sql` to the live DB via the Supabase Management API (Python for the JSON payload).
3. Verify grants: `select proname from pg_proc` + `has_function_privilege('anon', 'public.rename_library_image(uuid,text,text)', 'execute')` must be false; same for `due_image_cleanups()`. Also verify `has_function_privilege('authenticated', 'public.url_decode(text)', 'execute')` is **true** after applying 0044 (0044 re-grants EXECUTE that 0041 had revoked; without it every rename and every cleanup pass fails at runtime with `permission denied for function url_decode`).
4. Manual walkthrough on the deployed admin: rename an image allocated to a family → catalog page shows the image immediately under the new URL; the OLD URL still resolves (grace window); Data Errors tab: run check → no `broken_image_ref`; next day, opening the Images tab removes the old file and empties the queue.
5. Only then: user reviews, commits, pushes.
