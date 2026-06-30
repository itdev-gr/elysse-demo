# Catalogue PDFs by Country — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Commit & migration policy (from user memory):**
> 1. Never `git commit` / `git push` until the user has explicitly reviewed and approved that task's changes.
> 2. Applying SQL migrations to the live Supabase DB requires explicit user consent **each time**. Use the Management API per `reference_supabase_mgmt_api.md` (build JSON with Python, not `jq`).
> 3. After every code change, run the typecheck/test commands listed in the step — do not claim "done" before seeing the output.

**Goal:** Each Catalogue row gets two PDF slots (Black + Blue), each gated by a subset of country groups A–E. A single neutral "Download catalogue" button on the category and product pages serves the right PDF based on the visitor's selected country, or hides itself if no PDF matches.

**Architecture:** Approach A — six new nullable columns on `public.catalogues` (two `pdf_url_*`, two `groups_*`, plus `category_slug` and `product_sub_category` linkage fields). A pure `pickCataloguePdf(row, groupCode)` helper is shared between admin preview and a new `CatalogueButton.astro` client island. Country → group resolution uses the existing `group_countries` table cached client-side in module scope.

**Tech Stack:** Astro 5, React (admin only), TypeScript, Supabase (PostgreSQL + Storage), Tailwind, vitest. Spec: `docs/superpowers/specs/2026-06-30-catalogue-pdfs-by-country-design.md`.

---

## File Map

**Create**
- `supabase/migrations/0032_catalogue_pdfs_by_country.sql` — additive schema migration + backfill.
- `src/scripts/catalog/country-group.ts` — module-cached `loadCountryGroups()`.
- `src/components/catalog/CatalogueButton.astro` — SSR-hidden anchor + client island that resolves which PDF to show.

**Modify**
- `src/types/catalogue.ts` — six new optional fields on `Catalogue`.
- `src/lib/catalogues.ts` — `uploadCataloguePdf(file, id, slot)` gains a slot arg; new pure `pickCataloguePdf(row, groupCode)` helper.
- `src/lib/catalogues.test.ts` — tests for `pickCataloguePdf`.
- `src/components/admin/CatalogueForm.tsx` — replace single PDF block with Black + Blue blocks, add `category_slug` and `product_sub_category` dropdowns, validation.
- `src/components/admin/CataloguesTab.tsx` — split `PDF` column into Black + Blue with group chips, add "unlinked" warning chip.
- `src/pages/catalog/[category]/index.astro` — fetch top-level catalogue row + render `CatalogueButton` next to the H1.
- `src/pages/catalog/[category]/[product].astro` — fetch subcategory row via inner join on parent + render `CatalogueButton`.

---

## Task 1 — Schema migration (file only)

**Files:**
- Create: `supabase/migrations/0032_catalogue_pdfs_by_country.sql`

- [ ] **Step 1 — Write the migration file**

Create `supabase/migrations/0032_catalogue_pdfs_by_country.sql`:

```sql
-- Two PDF slots (Black + Blue) per catalogue row, each gated by a subset
-- of country groups (A–E). Plus explicit linkage from a catalogue row to
-- a product category page (or product series, for subcategory rows).
-- Additive only; the legacy pdf_url column is kept for one release.

alter table public.catalogues
  add column if not exists pdf_url_black        text,
  add column if not exists pdf_url_blue         text,
  add column if not exists groups_black         text[],
  add column if not exists groups_blue          text[],
  add column if not exists category_slug        text,
  add column if not exists product_sub_category text;

-- Backfill: the existing single pdf_url becomes Black, visible to every market.
update public.catalogues
set pdf_url_black = coalesce(pdf_url_black, pdf_url),
    groups_black  = coalesce(groups_black, array['A','B','C','D','E']),
    groups_blue   = coalesce(groups_blue, array[]::text[])
where pdf_url is not null and pdf_url_black is null;

create index if not exists idx_catalogues_category_slug
  on public.catalogues (category_slug);
```

- [ ] **Step 2 — Ask user before applying**

Print: "Migration `0032_catalogue_pdfs_by_country.sql` is staged. Apply it to live Supabase via the Management API? (Yes/No)"

Wait for explicit user "yes" before Step 3.

- [ ] **Step 3 — Apply via Management API**

Use Python (jq is broken on this machine — see memory). Run:

```bash
python3 - <<'PY'
import json, os, urllib.request
sql = open('supabase/migrations/0032_catalogue_pdfs_by_country.sql').read()
req = urllib.request.Request(
    'https://api.supabase.com/v1/projects/hsamhykaqmiiheneonxz/database/query',
    data=json.dumps({'query': sql}).encode(),
    headers={
        'Authorization': f'Bearer {os.environ["SUPABASE_MGMT_TOKEN"]}',
        'Content-Type': 'application/json',
        'User-Agent': 'curl/8.7.1',
    },
    method='POST',
)
print(urllib.request.urlopen(req).read().decode())
PY
```

Expected: `[]` (no rows returned for a DDL statement).

- [ ] **Step 4 — Verify backfill assertion**

```bash
python3 - <<'PY'
import json, os, urllib.request
sql = "select count(*) as missing from public.catalogues where pdf_url is not null and pdf_url_black is null;"
req = urllib.request.Request(
    'https://api.supabase.com/v1/projects/hsamhykaqmiiheneonxz/database/query',
    data=json.dumps({'query': sql}).encode(),
    headers={
        'Authorization': f'Bearer {os.environ["SUPABASE_MGMT_TOKEN"]}',
        'Content-Type': 'application/json',
        'User-Agent': 'curl/8.7.1',
    },
    method='POST',
)
print(urllib.request.urlopen(req).read().decode())
PY
```

Expected: `[{"missing":0}]`.

- [ ] **Step 5 — Commit (await user OK)**

```bash
git add supabase/migrations/0032_catalogue_pdfs_by_country.sql
git commit -m "feat(catalogues): add Black/Blue PDF slots + category linkage columns

Six new nullable columns on public.catalogues:
  pdf_url_black, pdf_url_blue, groups_black, groups_blue,
  category_slug, product_sub_category.
Backfills existing pdf_url into the Black slot, visible to every market.
Legacy pdf_url kept for one release for the CatalogueForm URL input."
```

---

## Task 2 — Update the `Catalogue` type

**Files:**
- Modify: `src/types/catalogue.ts`

- [ ] **Step 1 — Add the six new optional fields**

Open `src/types/catalogue.ts` and replace the `Catalogue` interface:

```ts
export interface Catalogue {
  id: string;
  /** Null for top-level categories; set to a category id for subcategories. */
  parent_id: string | null;
  name: string;
  description: string | null;
  /** Legacy single-PDF field. Read-only fallback during migration. */
  pdf_url: string | null;
  /** Primary PDF slot. Black wins when both slots match the visitor's group. */
  pdf_url_black: string | null;
  /** Secondary PDF slot. */
  pdf_url_blue: string | null;
  /** Country groups (A–E) that should see the Black PDF. */
  groups_black: string[] | null;
  /** Country groups (A–E) that should see the Blue PDF. */
  groups_blue: string[] | null;
  /** On category rows: the product_categories.slug this catalogue serves. */
  category_slug: string | null;
  /** On subcategory rows: the products.sub_category this catalogue serves. */
  product_sub_category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CatalogueDraft = Omit<Catalogue, 'id' | 'created_at' | 'updated_at'>;
```

- [ ] **Step 2 — Run the typecheck**

```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -v "TS5101: Option 'baseUrl'"
```

Expected: no errors. (TS5101 is the pre-existing baseUrl deprecation; filter it out.)

- [ ] **Step 3 — Commit (await user OK)**

```bash
git add src/types/catalogue.ts
git commit -m "types(catalogue): add Black/Blue PDF slots + linkage fields"
```

---

## Task 3 — `pickCataloguePdf` helper (TDD)

**Files:**
- Modify: `src/lib/catalogues.test.ts`
- Modify: `src/lib/catalogues.ts`

- [ ] **Step 1 — Write the failing tests**

Append to `src/lib/catalogues.test.ts`:

```ts
import { pickCataloguePdf } from './catalogues';

describe('pickCataloguePdf', () => {
  const make = (over: Parameters<typeof pickCataloguePdf>[0]) => over;

  it('returns Black when only Black matches', () => {
    expect(pickCataloguePdf(make({
      pdf_url_black: 'BLACK.pdf', pdf_url_blue: null,
      groups_black: ['A', 'B'], groups_blue: null,
    }), 'A')).toEqual({ url: 'BLACK.pdf', slot: 'black' });
  });

  it('returns Blue when only Blue matches', () => {
    expect(pickCataloguePdf(make({
      pdf_url_black: 'BLACK.pdf', pdf_url_blue: 'BLUE.pdf',
      groups_black: ['A'], groups_blue: ['C', 'D'],
    }), 'C')).toEqual({ url: 'BLUE.pdf', slot: 'blue' });
  });

  it('returns Black when both slots match (Black wins)', () => {
    expect(pickCataloguePdf(make({
      pdf_url_black: 'BLACK.pdf', pdf_url_blue: 'BLUE.pdf',
      groups_black: ['A', 'B'], groups_blue: ['B', 'C'],
    }), 'B')).toEqual({ url: 'BLACK.pdf', slot: 'black' });
  });

  it('returns null when the group matches neither slot', () => {
    expect(pickCataloguePdf(make({
      pdf_url_black: 'BLACK.pdf', pdf_url_blue: 'BLUE.pdf',
      groups_black: ['A'], groups_blue: ['C'],
    }), 'E')).toBeNull();
  });

  it('returns null when the matching slot has no PDF set', () => {
    expect(pickCataloguePdf(make({
      pdf_url_black: null, pdf_url_blue: null,
      groups_black: ['A'], groups_blue: ['A'],
    }), 'A')).toBeNull();
  });

  it('returns null when both slots are empty', () => {
    expect(pickCataloguePdf(make({
      pdf_url_black: null, pdf_url_blue: null,
      groups_black: null, groups_blue: null,
    }), 'A')).toBeNull();
  });

  it('returns null when groupCode is null', () => {
    expect(pickCataloguePdf(make({
      pdf_url_black: 'BLACK.pdf', pdf_url_blue: null,
      groups_black: ['A'], groups_blue: null,
    }), null)).toBeNull();
  });
});
```

- [ ] **Step 2 — Run tests, confirm they fail**

```bash
npx vitest run src/lib/catalogues.test.ts 2>&1 | tail -25
```

Expected: tests under `pickCataloguePdf` fail with `pickCataloguePdf is not a function` (or similar import error).

- [ ] **Step 3 — Implement the helper**

Append to `src/lib/catalogues.ts`:

```ts
type CataloguePdfRow = {
  pdf_url_black: string | null;
  pdf_url_blue: string | null;
  groups_black: string[] | null;
  groups_blue: string[] | null;
};

/** Resolve which PDF (if any) to serve the visitor.
 *  Black wins when the visitor's group appears in both slots. */
export function pickCataloguePdf(
  row: CataloguePdfRow,
  groupCode: string | null,
): { url: string; slot: 'black' | 'blue' } | null {
  if (!groupCode) return null;
  const black = row.groups_black ?? [];
  const blue = row.groups_blue ?? [];
  if (row.pdf_url_black && black.includes(groupCode))
    return { url: row.pdf_url_black, slot: 'black' };
  if (row.pdf_url_blue && blue.includes(groupCode))
    return { url: row.pdf_url_blue, slot: 'blue' };
  return null;
}
```

- [ ] **Step 4 — Run tests, confirm they pass**

```bash
npx vitest run src/lib/catalogues.test.ts 2>&1 | tail -10
```

Expected: all tests pass (the 7 new `pickCataloguePdf` cases plus the existing 7).

- [ ] **Step 5 — Commit (await user OK)**

```bash
git add src/lib/catalogues.ts src/lib/catalogues.test.ts
git commit -m "feat(catalogues): pickCataloguePdf resolver — Black wins overlap"
```

---

## Task 4 — `uploadCataloguePdf` gains a `slot` arg

**Files:**
- Modify: `src/lib/catalogues.ts`

- [ ] **Step 1 — Update the signature and storage path**

Find the existing `uploadCataloguePdf` function in `src/lib/catalogues.ts` and replace it:

```ts
/** Upload a catalogue PDF and return its public URL.
 *  Storage path: `{catalogueId}/{slot}-{uuid}.pdf` — slot visible in the URL
 *  helps debugging and rules out cross-slot collisions. */
export async function uploadCataloguePdf(
  file: File,
  catalogueId: string,
  slot: 'black' | 'blue' = 'black',
): Promise<{ url: string }> {
  const path = `${catalogueId}/${slot}-${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage
    .from('catalogues')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('catalogues').getPublicUrl(path);
  return { url: data.publicUrl };
}
```

The `'black'` default keeps the legacy CatalogueForm call working until Task 5 lands.

- [ ] **Step 2 — Run the test suite to confirm nothing else regressed**

```bash
npx vitest run src/lib/catalogues.test.ts 2>&1 | tail -10
```

Expected: all 14 tests still pass.

- [ ] **Step 3 — Commit (await user OK)**

```bash
git add src/lib/catalogues.ts
git commit -m "feat(catalogues): uploadCataloguePdf takes slot, namespaces storage path"
```

---

## Task 5 — `CatalogueForm.tsx`: Black/Blue blocks + linkage dropdowns

**Files:**
- Modify: `src/components/admin/CatalogueForm.tsx`

This is the largest task; it replaces a single PDF picker with two parallel blocks plus two new dropdowns and validation.

- [ ] **Step 1 — Add the new state and prop dependencies**

At the top of `src/components/admin/CatalogueForm.tsx`, update the imports:

```ts
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadCataloguePdf, validateCataloguePdf, pickCataloguePdf } from '../../lib/catalogues';
import type { Catalogue, CatalogueDraft } from '../../types/catalogue';

const GROUP_CODES = ['A', 'B', 'C', 'D', 'E'] as const;
type GroupCode = typeof GROUP_CODES[number];
type Slot = 'black' | 'blue';
```

Replace `emptyDraft` so new rows start with empty PDF/group fields:

```ts
function emptyDraft(parentId: string | null, sortOrder: number): CatalogueDraft {
  return {
    parent_id: parentId, name: '', description: null, pdf_url: null,
    pdf_url_black: null, pdf_url_blue: null,
    groups_black: [], groups_blue: [],
    category_slug: null, product_sub_category: null,
    sort_order: sortOrder, is_active: true,
  };
}
```

Inside `CatalogueForm`, replace the single `pendingPdf` state with two slots:

```ts
const [pendingBlack, setPendingBlack] = useState<File | null>(null);
const [pendingBlue, setPendingBlue] = useState<File | null>(null);
const blackInputRef = useRef<HTMLInputElement | null>(null);
const blueInputRef = useRef<HTMLInputElement | null>(null);
```

Delete the old `pendingPdf` / `pdfInputRef` declarations.

- [ ] **Step 2 — Add dropdown data loaders (categories + series)**

Add a hook inside the component, right after `update`:

```ts
const [productCategories, setProductCategories] = useState<{ slug: string; name: string }[]>([]);
const [productSeries, setProductSeries] = useState<string[]>([]);

useEffect(() => {
  let cancelled = false;
  supabase.from('product_categories').select('slug, name').order('name')
    .then(({ data }) => {
      if (cancelled) return;
      setProductCategories((data ?? []) as { slug: string; name: string }[]);
    });
  return () => { cancelled = true; };
}, []);

// Subcategory rows: series dropdown is scoped to the parent's linked category.
useEffect(() => {
  if (!draft.parent_id) { setProductSeries([]); return; }
  const parent = categories.find((c) => c.id === draft.parent_id);
  const parentSlug = parent?.category_slug ?? null;
  if (!parentSlug) { setProductSeries([]); return; }
  const parentName = productCategories.find((c) => c.slug === parentSlug)?.name;
  // products.category_name is the Excel name; product_categories.product_category_name
  // is the mapping. The simplest path: fetch all distinct sub_category for the parent slug.
  let cancelled = false;
  supabase.from('product_categories').select('product_category_name').eq('slug', parentSlug).single()
    .then(({ data }) => {
      const excel = (data?.product_category_name ?? parentName) as string | null;
      if (!excel) { setProductSeries([]); return; }
      return supabase.from('products').select('sub_category').eq('category_name', excel)
        .then(({ data: rows }) => {
          if (cancelled) return;
          const set = new Set<string>();
          for (const r of (rows ?? []) as { sub_category: string | null }[]) {
            if (r.sub_category) set.add(r.sub_category);
          }
          setProductSeries([...set].sort());
        });
    });
  return () => { cancelled = true; };
}, [draft.parent_id, categories, productCategories]);
```

- [ ] **Step 3 — Replace the file-picker handler with per-slot handlers**

Delete the old `onPdfChange`. Add:

```ts
const onPdfChange = (slot: Slot) => (e: React.ChangeEvent<HTMLInputElement>) => {
  setError(null);
  const f = e.target.files?.[0] ?? null;
  if (!f) return;
  const problem = validateCataloguePdf(f);
  if (problem) { setError(problem); e.target.value = ''; return; }
  if (slot === 'black') setPendingBlack(f); else setPendingBlue(f);
};

const toggleGroup = (slot: Slot, code: GroupCode) => {
  const key = slot === 'black' ? 'groups_black' : 'groups_blue';
  const current = (draft[key] ?? []) as string[];
  const next = current.includes(code) ? current.filter((c) => c !== code) : [...current, code];
  update(key, next.sort());
};
```

- [ ] **Step 4 — Replace `onSubmit` with validation + two-slot upload**

Replace the existing `onSubmit` function:

```ts
const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError(null);

  const black = (draft.groups_black ?? []) as string[];
  const blue = (draft.groups_blue ?? []) as string[];
  const blackUrl = draft.pdf_url_black?.trim() || null;
  const blueUrl = draft.pdf_url_blue?.trim() || null;

  if (black.length && !blackUrl && !pendingBlack) {
    setError('Pick a PDF for the Black slot, or clear its country groups.');
    return;
  }
  if (blue.length && !blueUrl && !pendingBlue) {
    setError('Pick a PDF for the Blue slot, or clear its country groups.');
    return;
  }
  const isSub = Boolean(draft.parent_id);
  if (!isSub && draft.category_slug && !productCategories.some((c) => c.slug === draft.category_slug)) {
    setError('Linked product category no longer exists. Pick another.');
    return;
  }
  // Soft warning (does not block submit): overlapping group → Black wins.
  const overlap = black.filter((g) => blue.includes(g));
  if (overlap.length && !window.confirm(
    `Country group${overlap.length > 1 ? 's' : ''} ${overlap.join(', ')} appear in both slots. Black will win for those groups. Save anyway?`
  )) return;

  setSubmitting(true);
  try {
    const payload: CatalogueDraft = {
      ...draft,
      name: draft.name.trim(),
      description: draft.description?.trim() || null,
      pdf_url: draft.pdf_url?.trim() || null,
      pdf_url_black: blackUrl,
      pdf_url_blue: blueUrl,
      groups_black: black,
      groups_blue: blue,
      category_slug: draft.category_slug?.trim() || null,
      product_sub_category: draft.product_sub_category?.trim() || null,
      parent_id: draft.parent_id || null,
    };
    if (!payload.name) throw new Error('Name is required.');

    // Step 1: create/update the row first — uploads are namespaced by row id.
    let cat: Catalogue;
    if (initial) {
      const { data, error: err } = await supabase
        .from('catalogues').update(payload).eq('id', initial.id).select().single();
      if (err) throw err;
      cat = data as Catalogue;
    } else {
      const { data, error: err } = await supabase
        .from('catalogues').insert(payload).select().single();
      if (err) throw err;
      cat = data as Catalogue;
    }

    // Step 2: upload any pending PDFs and patch their URLs.
    const patch: Partial<CatalogueDraft> = {};
    if (pendingBlack) {
      const { url } = await uploadCataloguePdf(pendingBlack, cat.id, 'black');
      patch.pdf_url_black = url;
    }
    if (pendingBlue) {
      const { url } = await uploadCataloguePdf(pendingBlue, cat.id, 'blue');
      patch.pdf_url_blue = url;
    }
    if (Object.keys(patch).length) {
      const { error: err } = await supabase
        .from('catalogues').update(patch).eq('id', cat.id);
      if (err) throw err;
    }
    onSaved();
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setSubmitting(false);
  }
};
```

- [ ] **Step 5 — Add a reusable PDF-block render helper**

Add inside the component, before the `return`:

```tsx
const renderPdfBlock = (slot: Slot) => {
  const urlKey = slot === 'black' ? 'pdf_url_black' : 'pdf_url_blue';
  const groupsKey = slot === 'black' ? 'groups_black' : 'groups_blue';
  const url = draft[urlKey];
  const groups = (draft[groupsKey] ?? []) as string[];
  const pending = slot === 'black' ? pendingBlack : pendingBlue;
  const ref = slot === 'black' ? blackInputRef : blueInputRef;
  const label = slot === 'black' ? 'Black PDF' : 'Blue PDF';
  return (
    <fieldset className="border border-ink/15 p-4 space-y-3">
      <legend className="px-1 text-[10px] uppercase tracking-[0.25em] text-ink/55">{label}</legend>
      <div className="space-y-2">
        <input
          ref={ref}
          type="file"
          accept="application/pdf"
          onChange={onPdfChange(slot)}
          className="text-sm text-ink/80"
        />
        {pending && <p className="text-[11px] text-ink/60">Will upload: {pending.name}</p>}
        <input
          type="url"
          value={url ?? ''}
          placeholder="https://… (paste an existing PDF URL)"
          onChange={(e) => update(urlKey, e.currentTarget.value || null)}
          className={inputClass}
        />
        {url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] underline text-brand-700">View current PDF ↗</a>}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Country groups</span>
        {GROUP_CODES.map((code) => (
          <label key={code} className="inline-flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={groups.includes(code)}
              onChange={() => toggleGroup(slot, code)}
            />
            {code}
          </label>
        ))}
      </div>
    </fieldset>
  );
};
```

- [ ] **Step 6 — Replace the JSX block: insert linkage dropdowns + two PDF blocks**

In the return statement, find the existing single `<Field label="Catalogue PDF" …>…</Field>` block (around lines 153–173 of the current file). Delete it. In its place, insert the conditional linkage dropdown plus the two PDF blocks:

```tsx
{!isSub && (
  <Field label="Linked product category" hint="Drives the 'Download catalogue' button on /catalog/[category].">
    <select
      value={draft.category_slug ?? ''}
      onChange={(e) => update('category_slug', e.currentTarget.value || null)}
      className={inputClass}
    >
      <option value="">— None (admin only) —</option>
      {productCategories.map((c) => (
        <option key={c.slug} value={c.slug}>{c.name}</option>
      ))}
    </select>
  </Field>
)}

{isSub && (
  <Field label="Applies to product series" hint="Drives the 'Download catalogue' button on the product page.">
    <select
      value={draft.product_sub_category ?? ''}
      onChange={(e) => update('product_sub_category', e.currentTarget.value || null)}
      className={inputClass}
    >
      <option value="">— None (admin only) —</option>
      {productSeries.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  </Field>
)}

<div className="space-y-3">
  {renderPdfBlock('black')}
  {renderPdfBlock('blue')}
</div>
```

Do **not** touch the other `<Field>` blocks (Belongs to, Name, Description, Sort order, is_active checkbox, submit button). They remain exactly as they are in the current file.

- [ ] **Step 7 — Manual smoke + typecheck**

```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -v "TS5101: Option 'baseUrl'" | head -20
npx vitest run src/lib/catalogues.test.ts 2>&1 | tail -10
```

Expected: typecheck clean, vitest 14/14.

Then start the dev server (`npm run dev`), open the admin Catalogues tab, edit one row:
- Black block should pre-populate from the legacy `pdf_url` value (via the backfill from Task 1) — group chips A-E all on.
- Blue block should be empty with no groups.
- Save without changes → no error, no upload, row unchanged in DB.

- [ ] **Step 8 — Commit (await user OK)**

```bash
git add src/components/admin/CatalogueForm.tsx
git commit -m "feat(admin): catalogue form gets Black/Blue PDF slots + linkage dropdowns"
```

---

## Task 6 — `CataloguesTab.tsx`: split PDF column + unlinked chip

**Files:**
- Modify: `src/components/admin/CataloguesTab.tsx`

- [ ] **Step 1 — Replace `pdfCell` with a slot-aware version**

Replace the existing `pdfCell` function (after the `actions` definition):

```tsx
const pdfSlotCell = (cat: Catalogue, slot: 'black' | 'blue') => {
  const url = slot === 'black' ? cat.pdf_url_black : cat.pdf_url_blue;
  const groups = ((slot === 'black' ? cat.groups_black : cat.groups_blue) ?? []) as string[];
  if (!url) return <span className="text-ink/40">—</span>;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] uppercase tracking-[0.2em] text-brand-700 hover:text-brand-500 cursor-pointer"
      >
        View ↗
      </a>
      {groups.length > 0 && (
        <span className="flex gap-0.5">
          {groups.map((g) => (
            <span key={g} className="inline-block px-1.5 py-0.5 text-[9px] uppercase tracking-[0.15em] bg-ink/8 text-ink/70 rounded">{g}</span>
          ))}
        </span>
      )}
    </div>
  );
};

const unlinkedChip = (cat: Catalogue) => {
  const isCategory = !cat.parent_id;
  const linked = isCategory ? !!cat.category_slug : !!cat.product_sub_category;
  if (linked) return null;
  return (
    <span className="inline-block ml-2 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] bg-amber-100 text-amber-800 rounded">
      unlinked
    </span>
  );
};
```

Delete the old `pdfCell` declaration.

- [ ] **Step 2 — Update the table header**

Inside the existing `<thead>`, replace the single `<th className="px-4 py-3">PDF</th>` with two columns:

```tsx
<th className="px-4 py-3">Black</th>
<th className="px-4 py-3">Blue</th>
```

So the row becomes: `# | Name | Black | Blue | Active | Actions`.

- [ ] **Step 3 — Update the two row renders**

In the top-level category row (`tree.map((cat) => …`), find the line `<td className="px-4 py-3">{pdfCell(cat)}</td>` and replace with:

```tsx
<td className="px-4 py-3">{pdfSlotCell(cat, 'black')}</td>
<td className="px-4 py-3">{pdfSlotCell(cat, 'blue')}</td>
```

Inside the same row, add the unlinked chip next to the name. Find:
```tsx
<span className="font-medium text-ink">{cat.name}</span>
```
and change it to:
```tsx
<span className="font-medium text-ink">{cat.name}{unlinkedChip(cat)}</span>
```

Do the same for the subcategory row: replace `<td className="px-4 py-3">{pdfCell(sub)}</td>` with the two-cell version (using `sub` instead of `cat`), and add `{unlinkedChip(sub)}` after the subcategory name span.

- [ ] **Step 4 — Typecheck**

```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -v "TS5101: Option 'baseUrl'" | head -20
```

Expected: no errors.

- [ ] **Step 5 — Commit (await user OK)**

```bash
git add src/components/admin/CataloguesTab.tsx
git commit -m "feat(admin): catalogues table splits PDF into Black/Blue + group chips"
```

---

## Task 7 — Country → group resolver

**Files:**
- Create: `src/scripts/catalog/country-group.ts`

- [ ] **Step 1 — Create the helper**

Create `src/scripts/catalog/country-group.ts`:

```ts
import { supabase } from '../../lib/supabase';
import type { Country } from './types';

let cache: Map<Country, string> | null = null;

/** Country code → group code (A–E). Cached in module scope; refreshed on a
 *  full page reload (which already happens when the visitor switches country). */
export async function loadCountryGroups(): Promise<Map<Country, string>> {
  if (cache) return cache;
  const { data } = await supabase
    .from('group_countries')
    .select('country_code, group_code');
  const next = new Map<Country, string>();
  for (const r of (data ?? []) as { country_code: string | null; group_code: string | null }[]) {
    if (r.country_code && r.group_code) next.set(r.country_code as Country, r.group_code);
  }
  cache = next;
  return cache;
}

export function groupForCountry(country: Country | null): Promise<string | null> {
  if (!country) return Promise.resolve(null);
  return loadCountryGroups().then((m) => m.get(country) ?? null);
}

/** Test-only — drop the in-memory cache. */
export function _resetCountryGroupCache(): void { cache = null; }
```

- [ ] **Step 2 — Typecheck**

```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -v "TS5101: Option 'baseUrl'" | head -20
```

Expected: no errors.

- [ ] **Step 3 — Commit (await user OK)**

```bash
git add src/scripts/catalog/country-group.ts
git commit -m "feat(catalog): country→group resolver with module-scoped cache"
```

---

## Task 8 — `CatalogueButton.astro` client island

**Files:**
- Create: `src/components/catalog/CatalogueButton.astro`

- [ ] **Step 1 — Create the component**

Create `src/components/catalog/CatalogueButton.astro`:

```astro
---
// SSR-hidden anchor that becomes a download link once the client resolves
// the visitor's country → group → matching PDF (Black wins overlap).
type CatalogueRow = {
  pdf_url_black: string | null;
  pdf_url_blue: string | null;
  groups_black: string[] | null;
  groups_blue: string[] | null;
};
const { catalogue } = Astro.props as { catalogue: CatalogueRow | null };
const dataJson = JSON.stringify(catalogue ?? null);
---
<a
  data-catalogue-button
  hidden
  href="#"
  target="_blank"
  rel="noopener noreferrer"
  class="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-ink/70 hover:text-brand-500 transition-colors duration-200"
>
  <span aria-hidden="true">↓</span>
  <span>Download catalogue</span>
</a>
<script type="application/json" data-catalogue-payload set:html={dataJson} />

<script>
  import { readCountry } from '../../scripts/catalog/country';
  import { groupForCountry } from '../../scripts/catalog/country-group';
  import { pickCataloguePdf } from '../../lib/catalogues';

  async function hydrate() {
    const anchors = document.querySelectorAll<HTMLAnchorElement>('[data-catalogue-button]');
    if (!anchors.length) return;
    const country = readCountry();
    const group = await groupForCountry(country);
    anchors.forEach((a) => {
      const payloadEl = a.nextElementSibling as HTMLScriptElement | null;
      if (!payloadEl || payloadEl.getAttribute('data-catalogue-payload') === null) return;
      const row = JSON.parse(payloadEl.textContent ?? 'null');
      if (!row) return;
      const picked = pickCataloguePdf(row, group);
      if (!picked) return;
      a.href = picked.url;
      a.removeAttribute('hidden');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hydrate);
  else hydrate();
</script>
```

- [ ] **Step 2 — Typecheck**

```bash
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -v "TS5101: Option 'baseUrl'" | head -20
```

Expected: no errors. (If Astro complains about untyped frontmatter props, the local `type CatalogueRow` declaration handles it.)

- [ ] **Step 3 — Commit (await user OK)**

```bash
git add src/components/catalog/CatalogueButton.astro
git commit -m "feat(catalog): CatalogueButton client island — country-gated download"
```

---

## Task 9 — Category landing page: fetch + render button

**Files:**
- Modify: `src/pages/catalog/[category]/index.astro`

- [ ] **Step 1 — Add the supabase import + lookup**

Open `src/pages/catalog/[category]/index.astro`. Add the imports near the top of the frontmatter:

```ts
import { supabase } from '../../../lib/supabase';
import CatalogueButton from '../../../components/catalog/CatalogueButton.astro';
```

After the existing `categoryEntry` block (the line `if (!categoryEntry) return new Response(null, { status: 404 });`), add:

```ts
const { data: catalogueRow } = await supabase
  .from('catalogues')
  .select('pdf_url_black, pdf_url_blue, groups_black, groups_blue')
  .eq('category_slug', categoryEntry.slug)
  .is('parent_id', null)
  .eq('is_active', true)
  .maybeSingle();
```

- [ ] **Step 2 — Render the button next to the H1**

Find the `<header>` around line 69-71:

```astro
<header class="mt-6 mb-8">
  <h1 class="text-3xl md:text-4xl font-heavy text-ink" data-i18n={JSON.stringify(categoryEntry.name_i18n ?? {})}>{categoryEntry.name}</h1>
</header>
```

Replace it with:

```astro
<header class="mt-6 mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
  <h1 class="text-3xl md:text-4xl font-heavy text-ink" data-i18n={JSON.stringify(categoryEntry.name_i18n ?? {})}>{categoryEntry.name}</h1>
  <CatalogueButton catalogue={catalogueRow ?? null} />
</header>
```

- [ ] **Step 3 — Run the build to catch import errors**

```bash
npm run build 2>&1 | tail -30
```

Expected: build completes; no errors mentioning `CatalogueButton` or `catalogueRow`.

- [ ] **Step 4 — Commit (await user OK)**

```bash
git add src/pages/catalog/[category]/index.astro
git commit -m "feat(catalog): category page surfaces country-gated catalogue button"
```

---

## Task 10 — Product page: subcategory PDF button

**Files:**
- Modify: `src/components/catalog/ConfigDetail.astro` (add a slot next to the H1)
- Modify: `src/pages/catalog/[category]/[product].astro` (query catalogue subcategory + pass via slot)

**Why a slot:** the product page's H1 is rendered inside `ConfigDetail.astro` (`<h1>` at line 35), not in the page file. Adding a named slot keeps the data query in the page (where `categoryEntry` and `config` already live) while letting `ConfigDetail` decide layout.

- [ ] **Step 1 — Add a slot in `ConfigDetail.astro`**

Open `src/components/catalog/ConfigDetail.astro`. Find the `<header>` block (around lines 33–40):

```astro
<header class="mt-6 md:mt-8">
  <p class="font-mono text-lg md:text-xl font-medium text-ink/70">No.{c.familyCode}</p>
  <h1 data-i18n-name={nameI18nJson} class="mt-1 font-heavy text-4xl lg:text-5xl leading-tight text-ink">{c.configuration}</h1>
  <p class="mt-2 text-sm text-ink/60" data-i18n={JSON.stringify(subCategoryI18n)}>{c.subCategory}</p>
  {hasDescription && (
    <p data-i18n-desc={descI18nJson} class="mt-4 max-w-2xl text-base text-ink/75 leading-relaxed whitespace-pre-line">{c.description}</p>
  )}
</header>
```

Replace it with:

```astro
<header class="mt-6 md:mt-8">
  <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
    <div>
      <p class="font-mono text-lg md:text-xl font-medium text-ink/70">No.{c.familyCode}</p>
      <h1 data-i18n-name={nameI18nJson} class="mt-1 font-heavy text-4xl lg:text-5xl leading-tight text-ink">{c.configuration}</h1>
    </div>
    <slot name="catalogue-button" />
  </div>
  <p class="mt-2 text-sm text-ink/60" data-i18n={JSON.stringify(subCategoryI18n)}>{c.subCategory}</p>
  {hasDescription && (
    <p data-i18n-desc={descI18nJson} class="mt-4 max-w-2xl text-base text-ink/75 leading-relaxed whitespace-pre-line">{c.description}</p>
  )}
</header>
```

- [ ] **Step 2 — Add the supabase import + CatalogueButton import to the page**

Open `src/pages/catalog/[category]/[product].astro`. At the top of the frontmatter, alongside the existing imports, add:

```ts
import { supabase } from '../../../lib/supabase';
import CatalogueButton from '../../../components/catalog/CatalogueButton.astro';
```

(The page does **not** currently import `supabase` — confirmed by reading the file. Both imports are new.)

- [ ] **Step 3 — Query the matching subcategory row**

After the line `if (!config) return new Response(null, { status: 404 });` (around line 33), add:

```ts
type CatalogueSubRow = {
  pdf_url_black: string | null;
  pdf_url_blue: string | null;
  groups_black: string[] | null;
  groups_blue: string[] | null;
};
let subRow: CatalogueSubRow | null = null;
if (config.subCategory) {
  const { data } = await supabase
    .from('catalogues')
    .select(`
      pdf_url_black, pdf_url_blue, groups_black, groups_blue,
      parent:parent_id!inner ( category_slug )
    `)
    .eq('product_sub_category', config.subCategory)
    .eq('parent.category_slug', categoryEntry.slug)
    .eq('is_active', true)
    .maybeSingle();
  if (data) {
    subRow = {
      pdf_url_black: data.pdf_url_black,
      pdf_url_blue: data.pdf_url_blue,
      groups_black: data.groups_black,
      groups_blue: data.groups_blue,
    };
  }
}
```

Note: the field is `config.subCategory` (camelCase), not `product.sub_category` — `product` is the URL param string, `config` is the loaded row.

- [ ] **Step 4 — Pass the button into the ConfigDetail slot**

Find the line `<ConfigDetail config={config} related={related} subCategoryI18n={subCategoryI18n} />` (around line 70). Replace it with:

```astro
<ConfigDetail config={config} related={related} subCategoryI18n={subCategoryI18n}>
  <CatalogueButton slot="catalogue-button" catalogue={subRow} />
</ConfigDetail>
```

- [ ] **Step 5 — Run the build**

```bash
npm run build 2>&1 | tail -30
```

Expected: build completes; no errors mentioning `CatalogueButton`, `subRow`, or the subcategory query.

- [ ] **Step 6 — Commit (await user OK)**

```bash
git add src/components/catalog/ConfigDetail.astro src/pages/catalog/[category]/[product].astro
git commit -m "feat(catalog): product page surfaces country-gated subcategory PDF button"
```

---

## Task 11 — Manual smoke test

**Files:** none.

- [ ] **Step 1 — Start the dev server**

```bash
npm run dev
```

Wait for "Local: http://localhost:4321" (or whichever port Astro picks).

- [ ] **Step 2 — Admin smoke: open Catalogues tab**

Navigate to `/admin` → Catalogues. For one top-level row:

1. Confirm the Black cell pre-populates with the legacy PDF link and shows chips `[A] [B] [C] [D] [E]`.
2. Confirm the Blue cell shows `—`.
3. Click **Edit**. Confirm the Black block is pre-populated, the Blue block is empty.
4. Set "Linked product category" to e.g. `compression-fittings`.
5. Upload a small test PDF to the Blue slot; check groups `[C] [D]`. Save. Confirm CataloguesTab now shows the Blue cell with the file and the two chips.

- [ ] **Step 3 — Public smoke: category page**

Open `/catalog/compression-fittings` in an incognito window:

1. Country modal appears. Pick a country in group A. Confirm the "Download catalogue ↓" button appears next to the H1 and downloads the Black PDF.
2. Open localStorage devtools → change `elysee.country` to a country in group C → reload. Confirm the button now serves the Blue PDF.
3. Change to a country in group E → reload. Confirm the button does **not** appear (E is in neither slot if you set them as in Step 2 above).

- [ ] **Step 4 — Public smoke: product page**

Open a product under `/catalog/compression-fittings/[product]` whose `sub_category` matches a catalogue subcategory you've configured:

1. Confirm the button appears next to the product title with the expected PDF.
2. Open a product whose `sub_category` has no catalogue subcategory configured. Confirm the button does not appear.

- [ ] **Step 5 — Report results to user**

Summarize: which scenarios passed, which failed, screenshots if any. Stop and ask for sign-off before declaring the feature complete.

---

## After all tasks

- All commits are local; **do not push** until the user reviews.
- Once approved, push with `git push origin main` (or open a PR, depending on the user's preference).
- Follow-up migration to drop the legacy `pdf_url` column is **not** part of this plan — it ships in a later release after we confirm nothing reads it.
