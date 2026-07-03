# Family Images (up to 5 per family) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let each product family hold up to 5 images with an admin-chosen primary and ordered others, rendered as a thumbnail gallery on the product detail page.

**Architecture:** A new `product_family_images` table (FK to `product_families`, ordered by `sort_order`, lowest = primary). Pure helpers order/mutate the URL list; the admin FamiliesTab manages the set and mirrors the primary back to `product_families.image_url` + `products.image_url` (so cards keep working unchanged). `products.ts` attaches the ordered `images[]` to each configuration; `ConfigDetail.astro` renders a main image + thumbnail strip with an inline vanilla swap script.

**Tech Stack:** Astro (SSR) + React admin islands, Supabase (Postgres + Storage `product-images` bucket), TypeScript, Vitest.

## Global Constraints

- **Max images per family: 5** — enforced in app logic via `MAX_FAMILY_IMAGES = 5` (no DB constraint).
- **Primary = lowest `sort_order`** (index 0 of the ordered list). No `is_primary` column.
- **No Excel changes** — `product-xlsx.ts` is untouched.
- **Preserve existing design** — edit `ConfigDetail.astro` / `FamiliesTab.tsx` in place; keep current layout/classes.
- **No commit/push until the user reviews** (project rule) — the "Commit" steps stage + `git commit` locally; do not `git push` until the user approves.
- **Migrations run via the Supabase Management API** (`POST https://api.supabase.com/v1/projects/hsamhykaqmiiheneonxz/database/query`, Bearer `sbp_…`, header `User-Agent: curl/8.7.1`, JSON built with Python). Applying a schema migration to prod requires **explicit user consent each time**.
- **RLS pattern** (copy from `0023_product_families.sql`): public `select` for `anon, authenticated`; full access for `authenticated`.

---

### Task 1: Migration — `product_family_images` table

**Files:**
- Create: `supabase/migrations/0033_product_family_images.sql`

**Interfaces:**
- Produces: table `public.product_family_images (id uuid pk, family_id uuid fk→product_families.id, url text, sort_order int, created_at timestamptz)`; backfilled one row per existing `product_families.image_url`.

- [ ] **Step 1: Write the migration file**

Create `supabase/migrations/0033_product_family_images.sql`:

```sql
-- Up to 5 images per product family, ordered; the lowest sort_order is the primary.
-- product_families.image_url stays as a mirror of the primary (kept in sync by the
-- admin), so listing cards and products.image_url propagation are unaffected.

create table if not exists public.product_family_images (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.product_families(id) on delete cascade,
  url         text not null,               -- an uploaded product-images library URL
  sort_order  integer not null default 0,  -- 0 = primary, then 1..4
  created_at  timestamptz not null default now()
);

create index if not exists product_family_images_family_idx
  on public.product_family_images (family_id, sort_order);

-- RLS mirrors product_families (0023): public reads, authenticated full access.
alter table public.product_family_images enable row level security;

drop policy if exists "public read product_family_images" on public.product_family_images;
create policy "public read product_family_images"
on public.product_family_images for select to anon, authenticated using (true);

drop policy if exists "authenticated full access on product_family_images" on public.product_family_images;
create policy "authenticated full access on product_family_images"
on public.product_family_images for all to authenticated using (true) with check (true);

-- Backfill: today's single family image becomes the primary (sort_order 0).
insert into public.product_family_images (family_id, url, sort_order)
select f.id, f.image_url, 0
from public.product_families f
where f.image_url is not null and f.image_url <> ''
  and not exists (
    select 1 from public.product_family_images i where i.family_id = f.id
  );
```

- [ ] **Step 2: Apply to prod via the Management API (requires user consent)**

Ask the user to confirm applying the migration. On consent, run (from the scratchpad, reusing the `sbq.py` helper pattern):

```python
import json, os, urllib.request
REF = "hsamhykaqmiiheneonxz"
TOKEN = os.environ["SUPABASE_MGMT_TOKEN"]  # sbp_… management token — never commit it; see the reference_supabase_mgmt_api memory
sql = open("supabase/migrations/0033_product_family_images.sql").read()
req = urllib.request.Request(
    f"https://api.supabase.com/v1/projects/{REF}/database/query",
    data=json.dumps({"query": sql}).encode(), method="POST")
req.add_header("Authorization", f"Bearer {TOKEN}")
req.add_header("Content-Type", "application/json")
req.add_header("User-Agent", "curl/8.7.1")
print(urllib.request.urlopen(req).read().decode())
```

- [ ] **Step 3: Verify table + backfill**

Run this query via the same API:

```sql
select
  (select count(*) from public.product_family_images) as image_rows,
  (select count(*) from public.product_families where image_url is not null and image_url <> '') as families_with_image;
```

Expected: `image_rows` >= `families_with_image` (every previously-imaged family now has one row at sort_order 0).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0033_product_family_images.sql
git commit -m "feat(catalog): product_family_images table (up to 5 per family, primary = sort_order 0)"
```

---

### Task 2: Pure helpers — order & mutate the image list

**Files:**
- Create: `src/lib/family-images.ts`
- Test: `src/lib/family-images.test.ts`

**Interfaces:**
- Produces:
  - `MAX_FAMILY_IMAGES = 5`
  - `interface FamilyImageRow { id: string; family_id: string; url: string; sort_order: number }`
  - `orderFamilyImages(rows: Pick<FamilyImageRow,'url'|'sort_order'>[]): string[]`
  - `addFamilyImage(list: string[], url: string): string[]`
  - `removeFamilyImage(list: string[], index: number): string[]`
  - `setPrimaryFamilyImage(list: string[], index: number): string[]`
  - `moveFamilyImage(list: string[], index: number, dir: 'left' | 'right'): string[]`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/family-images.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  MAX_FAMILY_IMAGES, orderFamilyImages, addFamilyImage,
  removeFamilyImage, setPrimaryFamilyImage, moveFamilyImage,
} from './family-images';

describe('orderFamilyImages', () => {
  it('sorts by sort_order, primary (lowest) first', () => {
    expect(orderFamilyImages([
      { url: 'c', sort_order: 2 }, { url: 'a', sort_order: 0 }, { url: 'b', sort_order: 1 },
    ])).toEqual(['a', 'b', 'c']);
  });
});

describe('addFamilyImage', () => {
  it('appends a new url', () => {
    expect(addFamilyImage(['a'], 'b')).toEqual(['a', 'b']);
  });
  it('is a no-op when the url is already present', () => {
    expect(addFamilyImage(['a', 'b'], 'a')).toEqual(['a', 'b']);
  });
  it('is a no-op once MAX_FAMILY_IMAGES is reached', () => {
    const full = ['a', 'b', 'c', 'd', 'e'];
    expect(full).toHaveLength(MAX_FAMILY_IMAGES);
    expect(addFamilyImage(full, 'f')).toEqual(full);
  });
});

describe('removeFamilyImage', () => {
  it('removes the url at the index', () => {
    expect(removeFamilyImage(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
  });
  it('is a no-op for an out-of-range index', () => {
    expect(removeFamilyImage(['a'], 5)).toEqual(['a']);
  });
});

describe('setPrimaryFamilyImage', () => {
  it('moves the chosen image to the front, others keep order', () => {
    expect(setPrimaryFamilyImage(['a', 'b', 'c'], 2)).toEqual(['c', 'a', 'b']);
  });
  it('is a no-op when it is already primary', () => {
    expect(setPrimaryFamilyImage(['a', 'b'], 0)).toEqual(['a', 'b']);
  });
});

describe('moveFamilyImage', () => {
  it('moves an image one step left', () => {
    expect(moveFamilyImage(['a', 'b', 'c'], 2, 'left')).toEqual(['a', 'c', 'b']);
  });
  it('moves an image one step right', () => {
    expect(moveFamilyImage(['a', 'b', 'c'], 0, 'right')).toEqual(['b', 'a', 'c']);
  });
  it('clamps at the edges (no-op)', () => {
    expect(moveFamilyImage(['a', 'b'], 0, 'left')).toEqual(['a', 'b']);
    expect(moveFamilyImage(['a', 'b'], 1, 'right')).toEqual(['a', 'b']);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/family-images.test.ts`
Expected: FAIL — "Failed to resolve import './family-images'" / functions not defined.

- [ ] **Step 3: Write the implementation**

Create `src/lib/family-images.ts`:

```ts
/** A family's images are capped at this many (enforced in app logic, not the DB). */
export const MAX_FAMILY_IMAGES = 5;

/** One row of product_family_images. */
export interface FamilyImageRow {
  id: string;
  family_id: string;
  url: string;
  sort_order: number;
}

/** Ordered image URLs for a family, primary (lowest sort_order) first. */
export function orderFamilyImages(rows: Pick<FamilyImageRow, 'url' | 'sort_order'>[]): string[] {
  return [...rows].sort((a, b) => a.sort_order - b.sort_order).map((r) => r.url);
}

/** Append a url unless the list is full or already contains it. Returns a new list. */
export function addFamilyImage(list: string[], url: string): string[] {
  if (list.includes(url) || list.length >= MAX_FAMILY_IMAGES) return list;
  return [...list, url];
}

/** Remove the url at `index` (no-op if out of range). Returns a new list. */
export function removeFamilyImage(list: string[], index: number): string[] {
  if (index < 0 || index >= list.length) return list;
  return list.filter((_, i) => i !== index);
}

/** Move the url at `index` to the front (primary); others keep order. Returns a new list. */
export function setPrimaryFamilyImage(list: string[], index: number): string[] {
  if (index <= 0 || index >= list.length) return list;
  const next = [...list];
  const [moved] = next.splice(index, 1);
  next.unshift(moved);
  return next;
}

/** Move the url at `index` one step left/right, clamped at the edges. Returns a new list. */
export function moveFamilyImage(list: string[], index: number, dir: 'left' | 'right'): string[] {
  const target = dir === 'left' ? index - 1 : index + 1;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/family-images.test.ts`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add src/lib/family-images.ts src/lib/family-images.test.ts
git commit -m "feat(catalog): pure helpers to order + mutate a family's image list"
```

---

### Task 3: Pure grouping helpers (family_id → urls, and re-key by code)

**Files:**
- Modify: `src/lib/family-images.ts` (append)
- Modify: `src/lib/family-images.test.ts` (append)

**Interfaces:**
- Consumes: `FamilyImageRow`, `orderFamilyImages` (Task 2).
- Produces:
  - `groupImagesByFamily(rows: FamilyImageRow[]): Map<string, string[]>` (keyed by `family_id`, ordered)
  - `imagesByCode(families: { id: string; code: string }[], byFamilyId: Map<string, string[]>): Map<string, string[]>`

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/family-images.test.ts`:

```ts
import { groupImagesByFamily, imagesByCode, type FamilyImageRow } from './family-images';

describe('groupImagesByFamily', () => {
  const rows: FamilyImageRow[] = [
    { id: '1', family_id: 'F1', url: 'a', sort_order: 1 },
    { id: '2', family_id: 'F1', url: 'p', sort_order: 0 },
    { id: '3', family_id: 'F2', url: 'x', sort_order: 0 },
  ];
  it('groups by family_id with primary first', () => {
    const m = groupImagesByFamily(rows);
    expect(m.get('F1')).toEqual(['p', 'a']);
    expect(m.get('F2')).toEqual(['x']);
  });
});

describe('imagesByCode', () => {
  it('re-keys a family_id→urls map to code→urls', () => {
    const byId = new Map<string, string[]>([['F1', ['p', 'a']], ['F2', ['x']]]);
    const fams = [{ id: 'F1', code: '382B' }, { id: 'F2', code: '380C' }];
    const byCode = imagesByCode(fams, byId);
    expect(byCode.get('382B')).toEqual(['p', 'a']);
    expect(byCode.get('380C')).toEqual(['x']);
  });
  it('omits families that have no images', () => {
    const byCode = imagesByCode([{ id: 'F3', code: '999' }], new Map());
    expect(byCode.has('999')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/family-images.test.ts`
Expected: FAIL — `groupImagesByFamily`/`imagesByCode` not exported.

- [ ] **Step 3: Write the implementation**

Append to `src/lib/family-images.ts`:

```ts
/** Group raw image rows by family_id → ordered URL list (primary first). */
export function groupImagesByFamily(rows: FamilyImageRow[]): Map<string, string[]> {
  const byId = new Map<string, FamilyImageRow[]>();
  for (const r of rows) {
    const arr = byId.get(r.family_id) ?? [];
    arr.push(r);
    byId.set(r.family_id, arr);
  }
  const out = new Map<string, string[]>();
  for (const [id, rs] of byId) out.set(id, orderFamilyImages(rs));
  return out;
}

/** Re-key a family_id→urls map to family_code→urls. Families with no images are omitted. */
export function imagesByCode(
  families: { id: string; code: string }[],
  byFamilyId: Map<string, string[]>,
): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const f of families) {
    const urls = byFamilyId.get(f.id);
    if (urls && urls.length) out.set(f.code, urls);
  }
  return out;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/family-images.test.ts`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add src/lib/family-images.ts src/lib/family-images.test.ts
git commit -m "feat(catalog): group family images by id and re-key by family code"
```

---

### Task 4: Attach ordered `images[]` to each configuration

**Files:**
- Modify: `src/lib/products.ts` (type `ConfigurationDetail`; add helper `resolveConfigImages`; call it in `fetchConfigurationDetails`)
- Modify: `src/lib/products.test.ts` (append a test for `resolveConfigImages`)

**Interfaces:**
- Consumes: `imagesByCode` (Task 3), `getFamilies` (`src/lib/families.ts`).
- Produces:
  - `ConfigurationDetail.images: string[]` (ordered, primary first; `[]` when the family has none)
  - `resolveConfigImages(familyImages: string[] | undefined, fallbackImage: string | null): { images: string[]; image: string | null }`

- [ ] **Step 1: Write the failing test**

Append to `src/lib/products.test.ts`:

```ts
import { resolveConfigImages } from './products';

describe('resolveConfigImages', () => {
  it('uses the family images and makes the first the primary', () => {
    expect(resolveConfigImages(['p', 'a', 'b'], '/old.png')).toEqual({
      images: ['p', 'a', 'b'], image: 'p',
    });
  });
  it('falls back to the existing single image when the family has none', () => {
    expect(resolveConfigImages(undefined, '/old.png')).toEqual({ images: [], image: '/old.png' });
    expect(resolveConfigImages([], null)).toEqual({ images: [], image: null });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/products.test.ts`
Expected: FAIL — `resolveConfigImages` not exported.

- [ ] **Step 3: Add the type field + helper + wire it in**

In `src/lib/products.ts`:

1. Add an import near the top (with the other `./family-images`-adjacent imports):

```ts
import { getFamilies } from './families';
import { imagesByCode, groupImagesByFamily, type FamilyImageRow } from './family-images';
```

(Note: `getFamilies` is already imported — extend that line rather than duplicating.)

2. In the `ConfigurationDetail` interface, add the field next to `image`:

```ts
  image: string | null;
  /** Ordered family images (primary first); [] when the family has none. */
  images: string[];
```

3. Add the pure helper (near `configDetailToCard`):

```ts
/** A configuration's ordered images + primary, from its family's image list. */
export function resolveConfigImages(
  familyImages: string[] | undefined,
  fallbackImage: string | null,
): { images: string[]; image: string | null } {
  const images = familyImages ?? [];
  return { images, image: images[0] ?? fallbackImage };
}
```

4. In `fetchConfigurationDetails`, initialise `images: []` where the `cfg` object is first built (alongside `image: p.image_url ?? null`):

```ts
        image: p.image_url ?? null,
        images: [],
```

5. Still in `fetchConfigurationDetails`, after the existing `for (const cfg of map.values()) { … }` translation-overlay loop and before the final `orderConfigEntries(...)` return, attach images:

```ts
  // Attach each family's ordered images (primary first). Keyed by family_code:
  // product_family_images is keyed by family_id, so join through the category's
  // product_families rows. A family shared across two series gets the same gallery.
  const fams = (await getFamilies({ includeHidden: true })).filter((f) => f.category_slug === categorySlug);
  const { data: imgRows } = await supabase
    .from('product_family_images').select('id, family_id, url, sort_order');
  const byCode = imagesByCode(fams, groupImagesByFamily((imgRows ?? []) as FamilyImageRow[]));
  for (const cfg of map.values()) {
    const { images, image } = resolveConfigImages(byCode.get(cfg.familyCode), cfg.image);
    cfg.images = images;
    cfg.image = image;
  }
```

- [ ] **Step 4: Run the test suite**

Run: `npx vitest run src/lib/products.test.ts`
Expected: PASS. Then `npx vitest run` — all files pass.

- [ ] **Step 5: Typecheck**

Run: `npx astro check`
Expected: no NEW errors in `products.ts` (the pre-existing `catalogues.test.ts` error is unrelated).

- [ ] **Step 6: Commit**

```bash
git add src/lib/products.ts src/lib/products.test.ts
git commit -m "feat(catalog): attach ordered family images to each configuration"
```

---

### Task 5: Admin FamiliesTab — image manager modal

**Files:**
- Modify: `src/components/admin/FamiliesTab.tsx`

**Interfaces:**
- Consumes: `addFamilyImage`, `removeFamilyImage`, `setPrimaryFamilyImage`, `moveFamilyImage`, `orderFamilyImages`, `MAX_FAMILY_IMAGES` (Task 2); `FamilyImageRow` (Task 2).
- Produces: (admin UI only — no exported interface)

- [ ] **Step 1: Add imports**

At the top of `FamiliesTab.tsx`, add:

```ts
import {
  MAX_FAMILY_IMAGES, orderFamilyImages, addFamilyImage,
  removeFamilyImage, setPrimaryFamilyImage, moveFamilyImage, type FamilyImageRow,
} from '../../lib/family-images';
```

- [ ] **Step 2: Add state for the managed image list + per-family counts**

Next to the existing `const [assignTarget, setAssignTarget] = useState<ProductFamily | null>(null);` and `assignError` state, add:

```ts
  // Ordered image URLs for the family open in the manager modal.
  const [assignImages, setAssignImages] = useState<string[]>([]);
  // family_id → image count, for the row badge.
  const [imageCounts, setImageCounts] = useState<Record<string, number>>({});
```

- [ ] **Step 3: Load image counts in `load()`**

Inside `load()`, after the memberships/coverage block (just before `setGroupCover(cover);` or right after it), add:

```ts
    // Image counts per family (for the row badge).
    const { data: imgRows } = await supabase
      .from('product_family_images').select('family_id');
    const counts: Record<string, number> = {};
    for (const r of (imgRows ?? []) as { family_id: string }[]) {
      counts[r.family_id] = (counts[r.family_id] ?? 0) + 1;
    }
    setImageCounts(counts);
```

- [ ] **Step 4: Replace `applyImage` with the manager handlers**

Delete the existing `applyImage` function and replace it with:

```ts
  // Open the manager: load the family's current images (ordered).
  const openImageManager = async (fam: ProductFamily) => {
    setAssignTarget(fam);
    setAssignError(null);
    setAssignImages([]);
    const { data, error } = await supabase
      .from('product_family_images').select('id, family_id, url, sort_order')
      .eq('family_id', fam.id);
    if (error) return setAssignError(error.message);
    setAssignImages(orderFamilyImages((data ?? []) as FamilyImageRow[]));
  };

  // Persist the whole ordered list: rewrite the family's rows, then mirror the
  // primary onto product_families.image_url + every member product.image_url.
  const persistImages = async (fam: ProductFamily, list: string[]) => {
    setAssignError(null);
    const { error: delErr } = await supabase
      .from('product_family_images').delete().eq('family_id', fam.id);
    if (delErr) return setAssignError(delErr.message);
    if (list.length) {
      const rows = list.map((url, i) => ({ family_id: fam.id, url, sort_order: i }));
      const { error: insErr } = await supabase.from('product_family_images').insert(rows);
      if (insErr) return setAssignError(insErr.message);
    }
    const primary = list[0] ?? null;
    const { error: e1 } = await supabase
      .from('product_families').update({ image_url: primary }).eq('id', fam.id);
    if (e1) return setAssignError(e1.message);
    const excel = catForFamily(fam)?.product_category_name ?? null;
    if (excel) {
      const { error: e2 } = await supabase.from('products')
        .update({ image_url: primary }).eq('category_name', excel).eq('family_code', fam.code);
      if (e2) return setAssignError(`Images saved, but updating products failed: ${e2.message}`);
    }
    await load(); triggerPublish();
  };

  // Apply a pure mutation, update local state, then persist.
  const mutateImages = async (fam: ProductFamily, next: string[]) => {
    setAssignImages(next);
    await persistImages(fam, next);
  };
```

- [ ] **Step 5: Update the family-row thumbnail + button**

Find the row markup with the `fam.image_url` thumbnail and the `Allocate image` button. Change the "Allocate image" button's `onClick` to open the manager, and add a count badge to the thumbnail. Replace the thumbnail block:

```tsx
                            {fam.image_url ? (
                              <div className="relative w-9 h-9 shrink-0">
                                <img src={fam.image_url} alt="" className="w-9 h-9 object-contain bg-surface-alt border border-ink/10" />
                                {(imageCounts[fam.id] ?? 0) > 1 && (
                                  <span className="absolute -top-1 -right-1 bg-brand-500 text-surface text-[9px] leading-none px-1 py-0.5 rounded-full">{imageCounts[fam.id]}</span>
                                )}
                              </div>
                            ) : (
                              <div className="w-9 h-9 bg-surface-alt border border-ink/10 shrink-0 flex items-center justify-center text-[9px] text-ink/30">None</div>
                            )}
```

And change the button:

```tsx
                            <button type="button" onClick={() => openImageManager(fam)} className="text-[11px] text-brand-500 uppercase tracking-[0.15em]">Manage images</button>
```

- [ ] **Step 6: Replace the modal body with the image manager**

In the `{assignTarget && ( … )}` modal, replace the `<LibraryGrid … />` body (the `<div className="p-5">…</div>` inner content) with the manager: the ordered strip on top, then the library grid to add more.

```tsx
            <div className="p-5">
              {assignError && (
                <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-4">{assignError}</p>
              )}

              {/* Selected images, in order — first is the primary. */}
              <p className="text-[10px] uppercase tracking-[0.25em] text-ink/45 mb-2">
                Selected ({assignImages.length}/{MAX_FAMILY_IMAGES}) — first is primary
              </p>
              {assignImages.length === 0 ? (
                <p className="text-sm text-ink/50 mb-4">No images yet. Pick from the library below.</p>
              ) : (
                <div className="flex flex-wrap gap-3 mb-6">
                  {assignImages.map((url, i) => (
                    <div key={url} className="relative w-24">
                      <div className="aspect-square bg-surface-alt border border-ink/10 overflow-hidden flex items-center justify-center">
                        <img src={url} alt="" className="w-full h-full object-contain" />
                      </div>
                      {i === 0 && (
                        <span className="absolute top-1 left-1 bg-brand-500 text-surface text-[9px] uppercase tracking-[0.15em] px-1 py-0.5">Primary</span>
                      )}
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <button type="button" aria-label="Move left" disabled={i === 0}
                          onClick={() => assignTarget && mutateImages(assignTarget, moveFamilyImage(assignImages, i, 'left'))}
                          className="px-1 text-ink/60 disabled:opacity-30">←</button>
                        {i !== 0 && (
                          <button type="button"
                            onClick={() => assignTarget && mutateImages(assignTarget, setPrimaryFamilyImage(assignImages, i))}
                            className="text-brand-500 uppercase tracking-[0.1em]">★</button>
                        )}
                        <button type="button" aria-label="Remove"
                          onClick={() => assignTarget && mutateImages(assignTarget, removeFamilyImage(assignImages, i))}
                          className="px-1 text-red-600">×</button>
                        <button type="button" aria-label="Move right" disabled={i === assignImages.length - 1}
                          onClick={() => assignTarget && mutateImages(assignTarget, moveFamilyImage(assignImages, i, 'right'))}
                          className="px-1 text-ink/60 disabled:opacity-30">→</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add from the library (disabled when full). */}
              <p className="text-[10px] uppercase tracking-[0.25em] text-ink/45 mb-2">
                {assignImages.length >= MAX_FAMILY_IMAGES ? 'Maximum reached — remove one to add another' : 'Add from library'}
              </p>
              {images === null ? (
                <p className="text-sm text-ink/60">Loading…</p>
              ) : assignImages.length >= MAX_FAMILY_IMAGES ? null : (
                <LibraryGrid
                  images={images}
                  onPick={(img) => assignTarget && mutateImages(assignTarget, addFamilyImage(assignImages, img.url))}
                  emptyLabel="No images in the library. Upload some in the Images tab first."
                />
              )}
            </div>
```

Also update the modal header: the old header may say "Allocate image" and reference `assignTarget.image_url` for a "Clear" button. Remove the "Clear" button (clearing is now "remove each image"), and change the label to "Manage images". Keep the `Cancel` button (`onClick={() => setAssignTarget(null)}`).

- [ ] **Step 7: Verify build + typecheck**

Run: `npx astro check`
Expected: no NEW errors in `FamiliesTab.tsx`.

Run: `npx vitest run`
Expected: all pass (unchanged — this task adds no unit tests; the logic it uses is covered by Task 2).

- [ ] **Step 8: Commit**

```bash
git add src/components/admin/FamiliesTab.tsx
git commit -m "feat(admin): manage up to 5 images per family (primary + reorder) in Families tab"
```

---

### Task 6: Product detail page — thumbnail gallery

**Files:**
- Modify: `src/components/catalog/ConfigDetail.astro`

**Interfaces:**
- Consumes: `ConfigurationDetail.images` (Task 4).
- Produces: (rendered gallery — no exported interface)

- [ ] **Step 1: Compute the image list in the frontmatter**

In `ConfigDetail.astro`, after the `hasDescription` line in the frontmatter (`---` block), add:

```ts
// Gallery: prefer the family's ordered images; fall back to the single image.
const galleryImages = c.images && c.images.length ? c.images : (c.image ? [c.image] : []);
```

- [ ] **Step 2: Replace the single `<img>` with the gallery**

Replace the image block (the `<div class="bg-surface-alt border … aspect-square …">{c.image ? (<img …/>) : (<svg …/>)}</div>` inside the sticky column) with:

```astro
    <div class="bg-surface-alt border border-ink/10 rounded-md aspect-square flex items-center justify-center text-ink/15 overflow-hidden">
      {galleryImages.length > 0 ? (
        <img id="cfg-main-image" src={galleryImages[0]} alt={c.configuration} width="800" height="800" class="w-full h-full object-contain p-8 scale-[0.85]" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" class="w-28 h-28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="7" width="18" height="10" rx="2" />
          <circle cx="8.5" cy="12" r="2.5" />
          <path d="M11.5 12H19" />
        </svg>
      )}
    </div>
    {galleryImages.length > 1 && (
      <div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="Product images">
        {galleryImages.map((src, i) => (
          <button type="button" data-thumb data-src={src} aria-current={i === 0 ? 'true' : 'false'}
            class="w-16 h-16 border border-ink/10 bg-surface-alt overflow-hidden aria-[current=true]:border-brand-500 aria-[current=true]:ring-1 aria-[current=true]:ring-brand-500">
            <img src={src} alt={`${c.configuration} — view ${i + 1}`} class="w-full h-full object-contain p-1" loading="lazy" />
          </button>
        ))}
      </div>
    )}
```

- [ ] **Step 3: Add the inline swap script**

At the very bottom of `ConfigDetail.astro` (after the closing markup, as a sibling `<script>` like the back-link pattern in `[product].astro`), add:

```astro
<script>
  // Swap the main product image when a thumbnail is clicked. All images are
  // server-rendered; this only toggles the visible src + active state.
  const main = document.getElementById('cfg-main-image') as HTMLImageElement | null;
  const thumbs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-thumb]'));
  for (const t of thumbs) {
    t.addEventListener('click', () => {
      const src = t.getAttribute('data-src');
      if (!main || !src) return;
      main.src = src;
      for (const o of thumbs) o.setAttribute('aria-current', o === t ? 'true' : 'false');
    });
  }
</script>
```

- [ ] **Step 4: Verify build**

Run: `npx astro check`
Expected: no NEW errors in `ConfigDetail.astro`.

- [ ] **Step 5: Manual verification (real app)**

Start the dev server (`npm run dev`), open a product detail page for a family that has >1 image (allocate 2–3 in the admin Families tab first), and confirm: the primary shows as the main image; thumbnails render; clicking a thumbnail swaps the main image and highlights the active thumbnail. A family with 0–1 images renders exactly as before.

- [ ] **Step 6: Commit**

```bash
git add src/components/catalog/ConfigDetail.astro
git commit -m "feat(catalog): product detail thumbnail gallery for family images"
```

---

## Self-Review

**Spec coverage:**
- Data model (`product_family_images`, primary = lowest sort_order, RLS, backfill, max 5) → Task 1 + `MAX_FAMILY_IMAGES` in Task 2. ✓
- Primary mirror to `product_families.image_url` + `products.image_url` → Task 5 `persistImages`. ✓
- Admin manager (add/remove/set-primary/reorder, ≤5, count badge, clear-to-placeholder) → Task 5. ✓
- Public gallery (main + thumbnails, inline swap, ≤1 image unchanged, a11y) → Task 6. ✓
- `ConfigurationDetail.images` + join by family_code → Task 4. ✓
- Pure TDD helpers → Tasks 2–4. ✓
- No Excel changes → not touched. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code. ✓

**Type consistency:** `orderFamilyImages`, `addFamilyImage`, `removeFamilyImage`, `setPrimaryFamilyImage`, `moveFamilyImage`, `groupImagesByFamily`, `imagesByCode`, `FamilyImageRow`, `resolveConfigImages`, `ConfigurationDetail.images` are named identically wherever referenced across Tasks 2–6. ✓
