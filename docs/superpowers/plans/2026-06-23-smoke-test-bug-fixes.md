# Smoke-Test Bug Fixes (HIGH + MEDIUM) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 9 HIGH/MEDIUM bugs found in the 2026-06-23 full smoke test of the Elysée site.

**Architecture:** Each task is an independent fix (different subsystem/file); they can be done and committed in any order. Most are small, targeted edits; #8 is the only one needing a shared helper. Where a pure unit is extractable, the task is test-first; UI/Astro/CSS fixes use a concrete verification command (`astro check`, a grep, build, or a documented manual route check) instead.

**Tech Stack:** Astro 6 (Vercel adapter, `prerender = false` data routes), React islands (admin), Supabase (Postgres + RLS), Tailwind v4, Vitest.

**Source report:** the smoke test in the 2026-06-23 session. Findings referenced as #1–#9 below.

**Commit policy:** The user's standing rule is *no commit until they review and approve*. Each task lists a commit step per convention, but the executor must follow the user's current instruction (e.g. local feature-branch commits, or hold commits) before running it.

**Branch:** create `fix/smoke-test-bugs` off `main` before starting (do not work on `main`).

---

## Task 1: Fix the 2 TypeScript errors in Insights detail components (#9)

`astro check` reports 2 errors: `ogImage` expects `string | undefined`, but the DB columns are `string | null`.

**Files:**
- Modify: `src/components/insights/MediaDetail.astro:11`
- Modify: `src/components/insights/EbookDetail.astro:11`

- [ ] **Step 1: Confirm the errors exist**

Run: `npx astro check 2>&1 | grep -E "MediaDetail|EbookDetail"`
Expected: two `error ts(2322): Type 'string | null' is not assignable to type 'string | undefined'` lines.

- [ ] **Step 2: Fix MediaDetail.astro**

In `src/components/insights/MediaDetail.astro`, change the `<BaseLayout>` open tag:
```astro
<BaseLayout title={media.title} description={media.excerpt} ogImage={media.poster_image ?? undefined}>
```
(only `ogImage={media.poster_image}` → `ogImage={media.poster_image ?? undefined}`)

- [ ] **Step 3: Fix EbookDetail.astro**

In `src/components/insights/EbookDetail.astro`:
```astro
<BaseLayout title={ebook.title} description={ebook.excerpt} ogImage={ebook.cover_image ?? undefined}>
```

- [ ] **Step 4: Verify**

Run: `npx astro check 2>&1 | tail -3`
Expected: `0 errors` (warnings/hints unchanged).

- [ ] **Step 5: Commit**

```bash
git add src/components/insights/MediaDetail.astro src/components/insights/EbookDetail.astro
git commit -m "fix(insights): ogImage accepts string|null (coalesce to undefined)"
```

---

## Task 2: Add per-country catalog CSS for bg, ro, gb, ie (#2)

`catalog-countries.ts` defines 29 country codes; `catalog.css` only has rules for 25. `bg, ro, gb, ie` have **0** rules — so their `<img data-for-country="…">` tags aren't hidden on the default (Cyprus) view (duplicate/stacked images), and selecting those countries never swaps content.

**Files:**
- Modify: `src/styles/catalog.css`

- [ ] **Step 1: Confirm the gap**

Run: `for c in bg ro gb ie; do echo "$c: $(grep -c "country=\"$c\"" src/styles/catalog.css) refs"; done`
Expected: each `0 refs`.

- [ ] **Step 2: Add the four `[data-for-country]` hide rules**

In `src/styles/catalog.css`, in the "per-country visibility rules" block (right after the existing `data-for-country="za"` rule, around line 210), add:
```css
[data-catalog-root] [data-for-country="bg"],
[data-catalog-detail] [data-for-country="bg"] { display: none; }
[data-catalog-root] [data-for-country="ro"],
[data-catalog-detail] [data-for-country="ro"] { display: none; }
[data-catalog-root] [data-for-country="gb"],
[data-catalog-detail] [data-for-country="gb"] { display: none; }
[data-catalog-root] [data-for-country="ie"],
[data-catalog-detail] [data-for-country="ie"] { display: none; }
```

- [ ] **Step 3: Add the four `img[data-for-country]` hide rules**

After the existing `img[data-for-country="za"]` rule (around line 260), add:
```css
[data-catalog-root] img[data-for-country="bg"],
[data-catalog-detail] img[data-for-country="bg"] { display: none; }
[data-catalog-root] img[data-for-country="ro"],
[data-catalog-detail] img[data-for-country="ro"] { display: none; }
[data-catalog-root] img[data-for-country="gb"],
[data-catalog-detail] img[data-for-country="gb"] { display: none; }
[data-catalog-root] img[data-for-country="ie"],
[data-catalog-detail] img[data-for-country="ie"] { display: none; }
```

- [ ] **Step 4: Add the four `data-active-country` swap blocks**

At the end of the active-country section (after the last existing block), add one block per code (shown for `bg`; repeat with `ro`, `gb`, `ie`):
```css
/* When data-active-country="bg": hide cy, show bg */
[data-catalog-root][data-active-country="bg"] [data-for-country="cy"],
[data-catalog-detail][data-active-country="bg"] [data-for-country="cy"] { display: none; }
[data-catalog-root][data-active-country="bg"] [data-for-country="bg"],
[data-catalog-detail][data-active-country="bg"] [data-for-country="bg"] { display: inline; }
[data-catalog-root][data-active-country="bg"] img[data-for-country="cy"],
[data-catalog-detail][data-active-country="bg"] img[data-for-country="cy"] { display: none; }
[data-catalog-root][data-active-country="bg"] img[data-for-country="bg"],
[data-catalog-detail][data-active-country="bg"] img[data-for-country="bg"] { display: block; }

/* When data-active-country="ro": hide cy, show ro */
[data-catalog-root][data-active-country="ro"] [data-for-country="cy"],
[data-catalog-detail][data-active-country="ro"] [data-for-country="cy"] { display: none; }
[data-catalog-root][data-active-country="ro"] [data-for-country="ro"],
[data-catalog-detail][data-active-country="ro"] [data-for-country="ro"] { display: inline; }
[data-catalog-root][data-active-country="ro"] img[data-for-country="cy"],
[data-catalog-detail][data-active-country="ro"] img[data-for-country="cy"] { display: none; }
[data-catalog-root][data-active-country="ro"] img[data-for-country="ro"],
[data-catalog-detail][data-active-country="ro"] img[data-for-country="ro"] { display: block; }

/* When data-active-country="gb": hide cy, show gb */
[data-catalog-root][data-active-country="gb"] [data-for-country="cy"],
[data-catalog-detail][data-active-country="gb"] [data-for-country="cy"] { display: none; }
[data-catalog-root][data-active-country="gb"] [data-for-country="gb"],
[data-catalog-detail][data-active-country="gb"] [data-for-country="gb"] { display: inline; }
[data-catalog-root][data-active-country="gb"] img[data-for-country="cy"],
[data-catalog-detail][data-active-country="gb"] img[data-for-country="cy"] { display: none; }
[data-catalog-root][data-active-country="gb"] img[data-for-country="gb"],
[data-catalog-detail][data-active-country="gb"] img[data-for-country="gb"] { display: block; }

/* When data-active-country="ie": hide cy, show ie */
[data-catalog-root][data-active-country="ie"] [data-for-country="cy"],
[data-catalog-detail][data-active-country="ie"] [data-for-country="cy"] { display: none; }
[data-catalog-root][data-active-country="ie"] [data-for-country="ie"],
[data-catalog-detail][data-active-country="ie"] [data-for-country="ie"] { display: inline; }
[data-catalog-root][data-active-country="ie"] img[data-for-country="cy"],
[data-catalog-detail][data-active-country="ie"] img[data-for-country="cy"] { display: none; }
[data-catalog-root][data-active-country="ie"] img[data-for-country="ie"],
[data-catalog-detail][data-active-country="ie"] img[data-for-country="ie"] { display: block; }
```

- [ ] **Step 5: Update the "25 codes" comment**

Find the comment near line 143 (`25 codes: cy, gr, de, …`) and change `25 codes` → `29 codes` and append `bg, ro, gb, ie` to the list.

- [ ] **Step 6: Verify**

Run: `for c in bg ro gb ie; do echo "$c: $(grep -c "country=\"$c\"" src/styles/catalog.css) refs"; done && npx astro build 2>&1 | tail -2`
Expected: each code now has **6** refs (2 for-country + 2 img + 2 active hide-cy/show, plus the show rules — confirm ≥6, non-zero), build completes.
Optional manual check: `npm run dev`, open a catalog category, select Bulgaria in the modal → content swaps (no stuck-on-Cyprus), and on the default view product images are not stacked/duplicated.

- [ ] **Step 7: Commit**

```bash
git add src/styles/catalog.css
git commit -m "fix(catalog): add per-country CSS for bg/ro/gb/ie (Europe)"
```

---

## Task 3: Guard catalog SSR pages against Supabase errors (#1)

`fetchAll()` (`src/lib/products.ts`) throws on any PostgREST error; the two `prerender = false` catalog pages await it with no try/catch, so a query error (or missing env var) returns HTTP 500 instead of degrading like every other data page.

**Files:**
- Modify: `src/pages/catalog/[category]/index.astro`
- Modify: `src/pages/catalog/[category]/[product].astro`

- [ ] **Step 1: Guard the category listing page**

In `src/pages/catalog/[category]/index.astro`, replace:
```astro
const products: CatalogProduct[] = excelName ? await fetchCatalogConfigurations(excelName) : [];
```
with:
```astro
let products: CatalogProduct[] = [];
if (excelName) {
  try {
    products = await fetchCatalogConfigurations(excelName);
  } catch (err) {
    console.error(`catalog "${category}": product fetch failed, rendering empty`, err);
    products = [];
  }
}
```
(The page already handles `isEmpty` from `products.length === 0`, so an error now shows the empty state instead of a 500.)

- [ ] **Step 2: Guard the product detail page**

In `src/pages/catalog/[category]/[product].astro`, replace:
```astro
const configs = await fetchConfigurationDetails(categoryEntry.product_category_name);
```
with:
```astro
let configs;
try {
  configs = await fetchConfigurationDetails(categoryEntry.product_category_name);
} catch (err) {
  console.error(`catalog product "${product}": fetch failed`, err);
  return new Response(null, { status: 404 });
}
```
(Leave the existing `const config = configs.find(...); if (!config) return new Response(null, { status: 404 });` lines as-is.)

- [ ] **Step 3: Verify**

Run: `npx astro build 2>&1 | tail -2`
Expected: build completes. Reasoning check: a thrown products query now resolves to an empty grid (listing) or a 404 (detail), never a 500. (Optional: temporarily point `PUBLIC_SUPABASE_URL` at an invalid host in a scratch env and confirm the listing renders its empty state rather than erroring — revert after.)

- [ ] **Step 4: Commit**

```bash
git add "src/pages/catalog/[category]/index.astro" "src/pages/catalog/[category]/[product].astro"
git commit -m "fix(catalog): degrade gracefully when the products query errors (no 500)"
```

---

## Task 4: Scope ImagesTab image assign/clear by category (#3)

`ImagesTab` keys configurations by `${sub_category}|${family_code}` (no category) and updates `products` filtered only by `sub_category` + `family_code`. Two categories sharing a `(sub_category, family_code)` pair collapse into one row and overwrite each other's `image_url`.

**Files:**
- Modify: `src/components/admin/ImagesTab.tsx` (the `configs` useMemo + `handleAssign` + `handleClear`)

- [ ] **Step 1: Include category in the config key**

In the `configs` useMemo, change the key line:
```tsx
const key = `${sub}|${fam}`;
```
to:
```tsx
const key = `${p.category_name ?? ''}|${sub}|${fam}`;
```
(`category_name` is already stored on each `ConfigEntry`, so each category now gets its own row.)

- [ ] **Step 2: Scope `handleAssign` by category**

Replace the `handleAssign` body's update with:
```tsx
const { category_name: cat, sub_category: subCat, family_code: fam } = assignTarget;
const { error } = await supabase
  .from('products')
  .update({ image_url: img.url })
  .eq('category_name', cat)
  .eq('sub_category', subCat)
  .eq('family_code', fam);
```

- [ ] **Step 3: Scope `handleClear` by category**

Replace the `handleClear` update the same way:
```tsx
const { category_name: cat, sub_category: subCat, family_code: fam } = assignTarget;
const { error } = await supabase
  .from('products')
  .update({ image_url: null })
  .eq('category_name', cat)
  .eq('sub_category', subCat)
  .eq('family_code', fam);
```

- [ ] **Step 4: Verify**

Run: `npx astro build 2>&1 | tail -2`
Expected: build green. Reasoning: assigning/clearing an image now updates only the products in the targeted category. (Manual: in the admin Images tab, assign an image to a config whose `(sub_category, family_code)` also exists under another category, and confirm the other category's product image is unchanged.)

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/ImagesTab.tsx
git commit -m "fix(admin): scope catalog image assign/clear by category_name"
```

---

## Task 5: Require the ISO code in GroupCountryForm (#4)

`group_countries.country_code` is nullable and the form lets it be blank, but `groupCountryCodes` filters out blank-code rows — so a country added without an ISO code is silently unavailable in the catalog.

**Files:**
- Modify: `src/components/admin/GroupCountryForm.tsx`

- [ ] **Step 1: Require the code and stop inserting null**

In `submit`, after the existing `if (!country.trim()) return setError('Country name is required.');` line, add:
```tsx
if (!code.trim()) return setError('ISO code is required (e.g. au) — without it the country is unavailable in the catalog.');
```
Then change the insert's `country_code`:
```tsx
.insert({ group_code: groupCode, country: country.trim(), country_code: code.trim() })
```
(drop the `|| null`).

- [ ] **Step 2: Verify**

Run: `npx astro build 2>&1 | tail -2`
Expected: build green. Reasoning: a group-country can no longer be saved without an ISO code, so `groupCountryCodes` will never silently drop it. (Manual: try to add a country with a blank ISO code → inline error; add one with a code → it appears in the group and in catalog availability.)

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/GroupCountryForm.tsx
git commit -m "fix(admin): require ISO code when mapping a country to a group"
```

---

## Task 6: Stop News/Post edit from clobbering featured state (#5)

`toDraft` in both forms strips only `id/created_at/updated_at`, so `featured_home`/`featured_rank` survive in `...rest` and are re-written by `.update(payload)` with the stale values loaded when the form opened — reverting any change made via `FeaturedToggle`.

**Files:**
- Modify: `src/components/admin/NewsForm.tsx` (the `toDraft` function)
- Modify: `src/components/admin/PostForm.tsx` (the `toDraft` function)

- [ ] **Step 1: Strip featured columns in NewsForm.toDraft**

Change:
```tsx
function toDraft(a: NewsArticle): NewsDraft {
  const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = a;
  return rest;
}
```
to:
```tsx
function toDraft(a: NewsArticle): NewsDraft {
  // Strip server-managed + home-featured columns; FeaturedToggle owns the
  // latter, so the edit form must not write them back (lost-update bug).
  const { id: _id, created_at: _ca, updated_at: _ua, featured_home: _fh, featured_rank: _fr, ...rest } = a;
  return rest;
}
```

- [ ] **Step 2: Strip featured columns in PostForm.toDraft**

Apply the identical change to `toDraft(p: Post): PostDraft` in `src/components/admin/PostForm.tsx` (destructure `featured_home: _fh, featured_rank: _fr` out alongside `id/created_at/updated_at`).

- [ ] **Step 3: Verify**

Run: `npx astro build 2>&1 | tail -2 && npx vitest run 2>&1 | tail -3`
Expected: build green; tests still pass. Reasoning: the update payload (`NewsDraft`/`PostDraft`) no longer carries `featured_home`/`featured_rank`, so editing an article leaves its home-featured state untouched. (Manual: feature an article on the home dashboard, edit its body, save → it stays featured.)

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/NewsForm.tsx src/components/admin/PostForm.tsx
git commit -m "fix(admin): don't overwrite featured_home/rank on news/post edit"
```

---

## Task 7: Show the "Other" series heading when its products are visible (#6)

`page-init.ts` builds `visibleSeries` from `p.material` with `.filter(Boolean)`, so products with no series (`material` null, grouped under the `data-series="Other"` heading) never mark "Other" visible — the heading is `display:none` on every render even though its cards show.

**Files:**
- Modify: `src/scripts/catalog/page-init.ts` (the `render()` function)

- [ ] **Step 1: Map falsy series to 'Other'**

Change:
```ts
const visibleSeries = new Set(sorted.map(p => p.material).filter(Boolean));
```
to:
```ts
// Products without a series render under the "Other" heading (ProductGrid uses
// `p.material ?? 'Other'`); map falsy materials to 'Other' so that heading shows.
const visibleSeries = new Set(sorted.map(p => p.material || 'Other'));
```

- [ ] **Step 2: Verify**

Run: `npx astro build 2>&1 | tail -2`
Expected: build green. Reasoning: when un-seried products are visible, `'Other'` is in `visibleSeries`, so the heading's `display` is `''` (shown) and the first-visible margin logic includes it. (Manual: open a category that has products with no sub_category → the "Other" section now has its heading.)

- [ ] **Step 3: Commit**

```bash
git add src/scripts/catalog/page-init.ts
git commit -m "fix(catalog): show the 'Other' series heading when its products are visible"
```

---

## Task 8: Show empty-results message in list view (#7)

`<EmptyResults>` (`[data-catalog-empty]`) lives **inside** `[data-products-grid]`. In list view the grid is hidden, so a 0-match filter in list view shows nothing.

**Files:**
- Modify: `src/components/catalog/ProductGrid.astro`

- [ ] **Step 1: Move EmptyResults out of the grid**

In `src/components/catalog/ProductGrid.astro`, remove the `<EmptyResults />` line from inside the `<div data-products-grid …>` block, and add it as a sibling **after both** the grid and list `<div>`s:
```astro
<div data-products-grid class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mt-8">
  {sections.map((sec) => (
    <Fragment>
      <div data-series-heading data-series={sec.title} class="col-span-full mt-8 first:mt-2">
        <h2 class="font-heavy text-lg md:text-xl text-ink">{sec.title}</h2>
        <div aria-hidden="true" class="mt-2 h-px bg-ink/10"></div>
      </div>
      {sec.items.map((p) => <ProductCard product={p} />)}
    </Fragment>
  ))}
</div>
<div data-products-list class="hidden flex-col gap-3 mt-8">
  {sections.map((sec) => (
    <Fragment>
      <div data-series-heading data-series={sec.title} class="mt-6 first:mt-0">
        <h2 class="font-heavy text-lg text-ink">{sec.title}</h2>
        <div aria-hidden="true" class="mt-2 h-px bg-ink/10"></div>
      </div>
      {sec.items.map((p) => <ProductRow product={p} />)}
    </Fragment>
  ))}
</div>
<EmptyResults />
```

- [ ] **Step 2: Verify**

Run: `npx astro build 2>&1 | tail -2`
Expected: build green. Reasoning: `[data-catalog-empty]` is no longer nested in the (hidden-in-list-view) grid, so `render()`'s `empty.classList.toggle('hidden', …)` controls it in both views. (Manual: switch to list view, apply a filter that matches nothing → the empty message shows.)

- [ ] **Step 3: Commit**

```bash
git add src/components/catalog/ProductGrid.astro
git commit -m "fix(catalog): show empty-results message in list view"
```

---

## Task 9: Keep product-configuration translations on family/sub-category rename (#8)

**This is the suspect/complex one — confirm the repro before shipping.** `product_configurations` (category_slug, config_slug → name/description + i18n) is keyed by `config_slug = configSlug(sub_category, family_code ?? code)`. Renaming a `family_code` (FamiliesTab) or `sub_category` (SubcategoryEditForm) updates `products` but not `product_configurations`, so the derived `config_slug` changes and the translation rows are orphaned (GR/DE product translations vanish from the site).

**Files:**
- Create: `src/lib/remap-config-slugs.ts` (pure planner + a Supabase applier) + `src/lib/remap-config-slugs.test.ts`
- Modify: `src/components/admin/FamiliesTab.tsx` (`renameCode`)
- Modify: `src/components/admin/SubcategoryEditForm.tsx` (`submit`)

- [ ] **Step 1: Confirm the orphan (repro)**

Against the live DB (Management API, per `memory/reference_supabase_mgmt_api.md`), pick a configuration that has a `product_configurations` row, note its `(category_slug, config_slug)`, and confirm the slug is `slugify(sub_category)-slugify(family_code-or-code)`. Document one concrete example in the task notes (old slug, the sub/family it derives from). If no `product_configurations` rows exist for any renameable family/sub, mark this finding NOT-REPRODUCIBLE and skip the rest of the task.

- [ ] **Step 2: Write the failing test for the pure slug-remap planner**

Create `src/lib/remap-config-slugs.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { planConfigSlugRemap } from './remap-config-slugs';

// Each affected product contributes a (sub_category, ref) pair, where
// ref = family_code ?? code. The planner returns old->new config_slug pairs.
it('remaps slugs when the family code changes', () => {
  const rows = [
    { sub_category: 'Epsilon Series PN 16 bar', family_code: '330', code: '330' },
    { sub_category: 'Epsilon Series PN 16 bar', family_code: '331', code: '331' },
  ];
  const plan = planConfigSlugRemap(rows, { kind: 'family', from: '330', to: '330X' });
  expect(plan).toEqual([
    { from: 'epsilon-series-pn-16-bar-330', to: 'epsilon-series-pn-16-bar-330x' },
  ]);
});

it('remaps slugs when the sub_category changes', () => {
  const rows = [
    { sub_category: 'Old Series', family_code: '330', code: '330' },
    { sub_category: 'Old Series', family_code: null, code: '999' },
  ];
  const plan = planConfigSlugRemap(rows, { kind: 'sub', from: 'Old Series', to: 'New Series' });
  expect(plan).toEqual([
    { from: 'old-series-330', to: 'new-series-330' },
    { from: 'old-series-999', to: 'new-series-999' },
  ]);
});

it('ignores rows the rename does not touch and de-dupes', () => {
  const rows = [
    { sub_category: 'A', family_code: '1', code: '1' },
    { sub_category: 'A', family_code: '1', code: '1' },
    { sub_category: 'B', family_code: '2', code: '2' },
  ];
  const plan = planConfigSlugRemap(rows, { kind: 'family', from: '1', to: '1b' });
  expect(plan).toEqual([{ from: 'a-1', to: 'a-1b' }]);
});
```

- [ ] **Step 3: Run it, verify it fails**

Run: `npx vitest run src/lib/remap-config-slugs.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement the planner + applier**

Create `src/lib/remap-config-slugs.ts`:
```ts
import { supabase } from './supabase';
import { configSlug } from './product-configurations';

export interface AffectedProductRow {
  sub_category: string | null;
  family_code: string | null;
  code: string;
}
export type RenameSpec =
  | { kind: 'family'; from: string; to: string }
  | { kind: 'sub'; from: string; to: string };

export interface SlugRemap { from: string; to: string }

/** Pure: from the products affected by a rename, compute old->new config_slug pairs. */
export function planConfigSlugRemap(rows: AffectedProductRow[], spec: RenameSpec): SlugRemap[] {
  const seen = new Set<string>();
  const out: SlugRemap[] = [];
  for (const r of rows) {
    const ref = r.family_code ?? r.code;
    let oldSub = r.sub_category;
    let oldRef = ref;
    let newSub = r.sub_category;
    let newRef = ref;
    if (spec.kind === 'family') {
      if (ref !== spec.from) continue;     // only rows whose ref is the renamed family
      newRef = spec.to;
    } else {
      if ((r.sub_category ?? '') !== spec.from) continue;
      oldSub = spec.from;
      newSub = spec.to;
    }
    const from = configSlug(oldSub, oldRef);
    const to = configSlug(newSub, newRef);
    if (from === to || seen.has(from)) continue;
    seen.add(from);
    out.push({ from, to });
  }
  return out;
}

/** Apply the remap to product_configurations for one category. Returns an error message or null. */
export async function applyConfigSlugRemap(categorySlug: string, plan: SlugRemap[]): Promise<string | null> {
  for (const { from, to } of plan) {
    const { error } = await supabase.from('product_configurations')
      .update({ config_slug: to })
      .eq('category_slug', categorySlug)
      .eq('config_slug', from);
    if (error) return error.message;
  }
  return null;
}
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `npx vitest run src/lib/remap-config-slugs.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Wire into FamiliesTab.renameCode**

In `src/components/admin/FamiliesTab.tsx` `renameCode`, after the `products` `family_code` update succeeds (inside the `if (excel)` block, before `await load()`), add: read the affected rows, plan, and apply the remap.
```tsx
// Keep product_configurations translations attached after the slug changes.
const { data: affected } = await supabase.from('products')
  .select('sub_category, family_code, code')
  .eq('category_name', excel).eq('family_code', code); // already renamed to `code`
const plan = planConfigSlugRemap(
  (affected ?? []).map((r) => ({ ...r, family_code: fam.code })), // old ref for slug-from
  { kind: 'family', from: fam.code, to: code },
);
const remapErr = await applyConfigSlugRemap(cat.slug, plan);
if (remapErr) return setError(`Code renamed, but updating translations failed: ${remapErr}`);
```
Add the import at the top: `import { planConfigSlugRemap, applyConfigSlugRemap } from '../../lib/remap-config-slugs';`
(Note: the affected rows now carry the NEW `family_code`; we substitute `fam.code` as the ref so `planConfigSlugRemap` computes the OLD slug as `from` and `code` as `to`.)

- [ ] **Step 7: Wire into SubcategoryEditForm.submit**

In `src/components/admin/SubcategoryEditForm.tsx` `submit`, inside the `if (newName !== sub.name && excelName)` block, after the `products` `sub_category` update succeeds, add:
```tsx
const { data: affected } = await supabase.from('products')
  .select('sub_category, family_code, code')
  .eq('category_name', excelName).eq('sub_category', newName); // already renamed
const plan = planConfigSlugRemap(
  (affected ?? []).map((r) => ({ ...r, sub_category: sub.name })), // old sub for slug-from
  { kind: 'sub', from: sub.name, to: newName },
);
const remapErr = await applyConfigSlugRemap(sub.category_slug, plan);
if (remapErr) { setBusy(false); return setError(`Saved, but updating translations failed: ${remapErr}`); }
```
Add the import: `import { planConfigSlugRemap, applyConfigSlugRemap } from '../../lib/remap-config-slugs';`
(Verify `ProductSubcategory` exposes `category_slug`; it's used as `s.category_slug` elsewhere in the categories code. If the prop name differs, use the correct one.)

- [ ] **Step 8: Verify**

Run: `npx vitest run 2>&1 | tail -3 && npx astro build 2>&1 | tail -2`
Expected: all tests pass (planner tests included); build green. Manual (against a scratch/dev row): enter a translation on a configuration, rename its family code or series, reload the catalog detail page → the translation still shows.

- [ ] **Step 9: Commit**

```bash
git add src/lib/remap-config-slugs.ts src/lib/remap-config-slugs.test.ts src/components/admin/FamiliesTab.tsx src/components/admin/SubcategoryEditForm.tsx
git commit -m "fix(admin): re-key product_configurations on family/sub-category rename"
```

---

## Self-review notes

- **Scope:** covers findings #1–#9 (HIGH + MEDIUM). Out of scope by user choice: #10 (`family_code` null → `.eq('','')` no-op), #11 (`<html lang>`), #12 (Elysse/Elysée branding), #13 (stale README), #14 (trailing-slash), #15 (unused vars), #16 (dormant page-init code), #17 (orphaned detail wiring).
- **#9 ImagesTab `family_code = null`** (finding #10) is adjacent to Task 4 but intentionally left out; if it surfaces during Task 4, note it but don't expand scope without asking.
- **Task 9 is the risky one** — its Step 1 repro gate exists because the finding was SUSPECT; if `product_configurations` has no rows for renameable configs, skip it.
- **Type assumptions to verify during execution:** `NewsArticle`/`Post` include `featured_home`/`featured_rank` (Task 6 destructure); `ProductSubcategory.category_slug` exists (Task 9 Step 7); `ConfigEntry.category_name` is non-null enough for the `.eq` (Task 4) — products always have a `category_name` in this data set.
- **Verification:** every task ends green on `npx astro build`; Tasks 6 & 9 also run `npx vitest run`; Tasks 1, 2 use targeted `astro check`/grep checks. No task is verified by assertion alone.
