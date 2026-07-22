# Family Cross-Listing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a catalog card (a `product_families` row — a catalogue No. with all its sizes) also appear on other categories' catalog pages, display-only, managed from the admin Families tab.

**Architecture:** A new join table `product_family_extra_categories` (family_id → extra category_slug) drives everything. The category page appends "borrowed" cards after its native ones by reusing the existing `fetchCatalogConfigurations` pipeline per home category and filtering to the cross-listed codes. Borrowed cards carry the **extra** category's slug in `categorySlug` (so the client-side `byCategory` filter keeps them) and a new optional `detailCategorySlug` pointing home (so the card links to its canonical page). The admin Families tab gets a per-row "Also in…" modal with category checkboxes.

**Tech Stack:** Astro (SSR pages, edge-cached), React admin islands, Supabase (Postgres + RLS), Vitest.

**Spec:** `docs/superpowers/specs/2026-07-22-family-cross-listing-design.md`

## Global Constraints

- **Commits are LOCAL only.** Per the user's standing rule, do NOT `git push` until the user reviews the finished feature. Commit after each task as instructed (all commits end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`).
- Migration file is `supabase/migrations/0050_family_cross_listing.sql` (0048/0049 are taken).
- Migrations are applied to the LIVE Supabase project via the Management API — jq is broken on this machine; build the JSON payload with Python. Follow `~/.claude/projects/-Users-marios-Desktop-Cursor-elysse-demo/memory/reference_supabase_mgmt_api.md`.
- Any new SQL function would need `revoke execute ... from anon` (0041 convention). This plan adds NO new functions, only replaces `run_product_data_checks()` (ACLs survive CREATE OR REPLACE; re-asserted anyway).
- `run_product_data_checks()`'s authoritative source is the repo migration `0039_retire_image_mirrors_functions.sql` (v4). Before replacing it live, diff the live definition (`pg_get_functiondef`) against 0039 — the search_site drift incident must not repeat.
- Option values / stored keys stay bare (`category_slug`, family `code`); nothing about products, the Excel flow, or existing URLs changes.
- Node/npm scripts: `npm test` (vitest), `npx astro check` for the Astro/TS surface.
- Test files live next to their lib (`src/lib/foo.test.ts`), style follows `src/lib/families.test.ts` (plain `describe`/`it`/`expect`, small fixture builders).

---

### Task 1: Migration 0050 — table + data checker v5, applied live

**Files:**
- Create: `supabase/migrations/0050_family_cross_listing.sql`

**Interfaces:**
- Produces: table `public.product_family_extra_categories (family_id uuid, category_slug text, created_at timestamptz, PK (family_id, category_slug))`, readable by `anon`; checker v5 with issue types `cross_listing_self` (error) and `cross_listing_empty` (warning). The admin `DataErrorsTab` renders `issue_type` strings generically — no client change needed for the new types.

- [ ] **Step 1: Write the migration file — part A (table)**

Create `supabase/migrations/0050_family_cross_listing.sql` starting with:

```sql
-- 0050_family_cross_listing.sql — cross-list a family (catalogue No.) into
-- additional categories.
--
-- A row says: family <family_id> ALSO appears on category <category_slug>'s
-- catalog page. Display-only — products stay under their home category (the
-- category_name link, Excel flow and product URLs are untouched); the page
-- for the extra category appends the family's cards after its native ones.
-- Spec: docs/superpowers/specs/2026-07-22-family-cross-listing-design.md

-- ============================================== product_family_extra_categories
create table if not exists public.product_family_extra_categories (
  family_id     uuid not null references public.product_families(id) on delete cascade,
  category_slug text not null references public.product_categories(slug) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (family_id, category_slug)
);

-- The catalog page looks listings up by the extra category.
create index if not exists pfec_category_idx
  on public.product_family_extra_categories (category_slug);

-- ============================================================ RLS
alter table public.product_family_extra_categories enable row level security;

-- public reads all rows (the live site renders with the anon key), like product_families
drop policy if exists "public read product_family_extra_categories" on public.product_family_extra_categories;
create policy "public read product_family_extra_categories"
on public.product_family_extra_categories for select to anon, authenticated
using (true);

drop policy if exists "authenticated full access on product_family_extra_categories" on public.product_family_extra_categories;
create policy "authenticated full access on product_family_extra_categories"
on public.product_family_extra_categories for all to authenticated
using (true) with check (true);
```

- [ ] **Step 2: Write the migration file — part B (checker v5)**

Append to the same file a header comment and the checker:

```sql
-- ============================================================ checker v5
-- Identical to 0039's v4 plus two cross-listing checks (self / empty).
-- This file is now the authoritative source for run_product_data_checks.
```

Then copy the ENTIRE `CREATE OR REPLACE FUNCTION public.run_product_data_checks() … $function$;` block **verbatim from `supabase/migrations/0039_retire_image_mirrors_functions.sql` lines 84–284**, and make exactly one edit: immediately after the `orphan_membership` branch — i.e. after this line:

```sql
  where not exists (select 1 from products p where p.code = m.product_code)
```

and BEFORE the next `union all` (the one preceding the `-- Image references whose storage object no longer exists` comment), insert:

```sql
  union all
  -- Cross-listing hygiene (0050): a listing into the family's OWN category is
  -- meaningless — the admin UI never offers it, so a row here means bad data.
  select 'cross_listing_self:'||f.category_slug||'/'||f.code, f.code,
         'cross_listing_self','error',
         'Family "'||f.code||'" is cross-listed into its own category "'||f.category_slug||'".',
         jsonb_build_object('category_slug', x.category_slug, 'family_code', f.code)
  from product_family_extra_categories x
  join product_families f on f.id = x.family_id
  where x.category_slug = f.category_slug
  union all
  -- A cross-listing that renders nothing: the family has no active, visible
  -- products in its home category, so the extra placement shows no cards.
  select 'cross_listing_empty:'||f.category_slug||'/'||f.code||':'||x.category_slug, f.code,
         'cross_listing_empty','warning',
         'Family "'||f.code||'" is cross-listed into "'||x.category_slug||'" but has no active products — the placement shows nothing.',
         jsonb_build_object('extra_category_slug', x.category_slug,
                            'home_category_slug', f.category_slug, 'family_code', f.code)
  from product_family_extra_categories x
  join product_families f on f.id = x.family_id
  join product_categories home on home.slug = f.category_slug
  where x.category_slug <> f.category_slug
    and not exists (
      select 1 from products p
      where p.category_name = home.product_category_name
        and p.family_code = f.code
        and p.is_active and not coalesce(p.is_hidden, false))
```

Close the file after the function with re-asserted ACLs:

```sql
-- Belt & braces: CREATE OR REPLACE keeps existing ACLs, but re-assert the
-- 0041 hardening so the function can never be callable by anon.
revoke all on function public.run_product_data_checks() from public, anon;
grant execute on function public.run_product_data_checks() to authenticated;
```

- [ ] **Step 3: Drift check the live checker before replacing it**

Via the Supabase Management API (or `mcp__plugin_supabase_supabase__execute_sql`), run:

```sql
select pg_get_functiondef('public.run_product_data_checks()'::regprocedure);
```

Compare the result against the 0039 definition (lines 84–284). Expected: they match apart from whitespace/`CREATE OR REPLACE` header normalisation. **If they differ materially, STOP and report — base the v5 edit on the live definition instead, and flag the drift to the user.**

- [ ] **Step 4: Apply the migration live**

Apply the full contents of `0050_family_cross_listing.sql` via the Management API (Python-built JSON payload, per the memory reference file).

- [ ] **Step 5: Verify live**

Run (execute_sql / Management API):

```sql
select count(*) from public.product_family_extra_categories;  -- expect: 0
select public.run_product_data_checks();                       -- expect: an integer, no error
select policyname from pg_policies where tablename = 'product_family_extra_categories';
-- expect: both policies from Step 1
```

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0050_family_cross_listing.sql
git commit -m "feat(db): product_family_extra_categories + cross-listing data checks (0050)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Pure cross-listing helpers + tests

**Files:**
- Create: `src/lib/cross-listings.ts`
- Test: `src/lib/cross-listings.test.ts`

**Interfaces:**
- Consumes: `ProductFamily` from `src/lib/families.ts` (`{ id, category_slug, code, sort_order, is_active }`), `CatalogProduct`/`CategorySlug` from `src/scripts/catalog/types.ts`.
- Produces (used by Tasks 4 & 5):
  - `interface CrossListingRow { family_id: string; category_slug: string }`
  - `extraSlugsByFamily(listings: CrossListingRow[]): Record<string, string[]>`
  - `diffCrossListings(current: string[], next: string[]): { toAdd: string[]; toRemove: string[] }`
  - `crossListedFamiliesFor(listings: CrossListingRow[], families: ProductFamily[], extraSlug: string): ProductFamily[]`
  - `buildCrossListedCards(homeCards: CatalogProduct[], codes: Set<string>, hiddenHomeSeries: Set<string>, extraSlug: CategorySlug): CatalogProduct[]`
- NOTE: `buildCrossListedCards` sets `detailCategorySlug` — the type field is added in **Task 3**. Task 2 and Task 3 must land together before `npx astro check` is clean; run only `npm test` in this task (vitest doesn't type-check the spread).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/cross-listings.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  extraSlugsByFamily, diffCrossListings, crossListedFamiliesFor, buildCrossListedCards,
  type CrossListingRow,
} from './cross-listings';
import type { ProductFamily } from './families';
import type { CatalogProduct } from '../scripts/catalog/types';

const fam = (over: Partial<ProductFamily>): ProductFamily => ({
  id: 'f1', category_slug: 'compression-fittings', code: '330A',
  sort_order: 0, is_active: true, ...over,
});

const card = (over: Partial<CatalogProduct>): CatalogProduct => ({
  slug: 'series-330a', name: 'Coupling', code: '330A',
  categorySlug: 'compression-fittings', sectors: [], material: 'Compression Fittings PN16',
  standards: [], imageUrls: [], image: '', blurb: '', pressure: '', sizeRange: '',
  bim: false, specs: [], featured: false, hasDetailPage: true,
  availableCountries: [], ...over,
});

describe('extraSlugsByFamily', () => {
  it('groups listing rows by family id', () => {
    const rows: CrossListingRow[] = [
      { family_id: 'f1', category_slug: 'turf' },
      { family_id: 'f1', category_slug: 'valves' },
      { family_id: 'f2', category_slug: 'turf' },
    ];
    expect(extraSlugsByFamily(rows)).toEqual({ f1: ['turf', 'valves'], f2: ['turf'] });
  });
  it('returns {} for no listings', () => {
    expect(extraSlugsByFamily([])).toEqual({});
  });
});

describe('diffCrossListings', () => {
  it('splits into inserts and deletes', () => {
    expect(diffCrossListings(['turf', 'valves'], ['valves', 'saddles']))
      .toEqual({ toAdd: ['saddles'], toRemove: ['turf'] });
  });
  it('is empty when nothing changed', () => {
    expect(diffCrossListings(['turf'], ['turf'])).toEqual({ toAdd: [], toRemove: [] });
  });
  it('handles starting from none', () => {
    expect(diffCrossListings([], ['turf'])).toEqual({ toAdd: ['turf'], toRemove: [] });
  });
});

describe('crossListedFamiliesFor', () => {
  const families = [
    fam({ id: 'f1', code: '330A' }),
    fam({ id: 'f2', code: '440', category_slug: 'saddles' }),
    fam({ id: 'f3', code: '990', category_slug: 'turf' }),
  ];
  it('returns only families listed into the given category', () => {
    const rows: CrossListingRow[] = [
      { family_id: 'f1', category_slug: 'turf' },
      { family_id: 'f2', category_slug: 'valves' },
    ];
    expect(crossListedFamiliesFor(rows, families, 'turf').map((f) => f.id)).toEqual(['f1']);
  });
  it('drops self-listings (family already home in that category)', () => {
    const rows: CrossListingRow[] = [{ family_id: 'f3', category_slug: 'turf' }];
    expect(crossListedFamiliesFor(rows, families, 'turf')).toEqual([]);
  });
  it('ignores listings whose family no longer exists', () => {
    const rows: CrossListingRow[] = [{ family_id: 'gone', category_slug: 'turf' }];
    expect(crossListedFamiliesFor(rows, families, 'turf')).toEqual([]);
  });
});

describe('buildCrossListedCards', () => {
  it('keeps only cross-listed codes and rebrands for the extra page', () => {
    const cards = [card({ code: '330A' }), card({ code: '331', slug: 'series-331' })];
    const out = buildCrossListedCards(cards, new Set(['330A']), new Set(), 'turf');
    expect(out).toHaveLength(1);
    expect(out[0].categorySlug).toBe('turf');                       // client filter keeps it
    expect(out[0].detailCategorySlug).toBe('compression-fittings'); // link stays canonical
    expect(out[0].slug).toBe('series-330a');
  });
  it('drops cards whose series is hidden in the home category', () => {
    const cards = [card({ code: '330A', material: 'Hidden Series' })];
    expect(buildCrossListedCards(cards, new Set(['330A']), new Set(['Hidden Series']), 'turf'))
      .toEqual([]);
  });
  it('keeps cards with no series when a hidden set exists', () => {
    const cards = [card({ code: '330A', material: undefined })];
    expect(buildCrossListedCards(cards, new Set(['330A']), new Set(['X']), 'turf')).toHaveLength(1);
  });
  it('does not mutate the input cards', () => {
    const original = card({ code: '330A' });
    buildCrossListedCards([original], new Set(['330A']), new Set(), 'turf');
    expect(original.categorySlug).toBe('compression-fittings');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/cross-listings.test.ts`
Expected: FAIL — `Cannot find module './cross-listings'` (or equivalent resolve error).

- [ ] **Step 3: Write the implementation (pure part)**

Create `src/lib/cross-listings.ts`:

```ts
import type { CatalogProduct, CategorySlug } from '../scripts/catalog/types';
import type { ProductFamily } from './families';

/** One row of product_family_extra_categories. */
export interface CrossListingRow {
  family_id: string;
  /** The EXTRA category the family also appears in (not its home). */
  category_slug: string;
}

/** family_id → extra category slugs, for the admin row badges + search. */
export function extraSlugsByFamily(listings: CrossListingRow[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const l of listings) (out[l.family_id] ??= []).push(l.category_slug);
  return out;
}

/** Admin save: which slugs to insert and which to delete. */
export function diffCrossListings(
  current: string[],
  next: string[],
): { toAdd: string[]; toRemove: string[] } {
  const cur = new Set(current);
  const nxt = new Set(next);
  return {
    toAdd: [...nxt].filter((s) => !cur.has(s)),
    toRemove: [...cur].filter((s) => !nxt.has(s)),
  };
}

/** The families cross-listed into one extra category. Self-listings (family
 *  already home there) are bad data — dropped defensively; the checker flags them. */
export function crossListedFamiliesFor(
  listings: CrossListingRow[],
  families: ProductFamily[],
  extraSlug: string,
): ProductFamily[] {
  const ids = new Set(listings.filter((l) => l.category_slug === extraSlug).map((l) => l.family_id));
  return families.filter((f) => ids.has(f.id) && f.category_slug !== extraSlug);
}

/**
 * Rebrand a home category's cards for display inside the extra category: keep
 * only the cross-listed codes, drop series hidden at home, and tag with the
 * extra slug so the client-side category filter keeps them — while the card's
 * link stays canonical via detailCategorySlug (the home slug).
 */
export function buildCrossListedCards(
  homeCards: CatalogProduct[],
  codes: Set<string>,
  hiddenHomeSeries: Set<string>,
  extraSlug: CategorySlug,
): CatalogProduct[] {
  return homeCards
    .filter((c) => c.code != null && codes.has(c.code))
    .filter((c) => !c.material || !hiddenHomeSeries.has(c.material))
    .map((c) => ({ ...c, categorySlug: extraSlug, detailCategorySlug: c.categorySlug }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/cross-listings.test.ts`
Expected: PASS (all tests). TypeScript may flag `detailCategorySlug` until Task 3 — vitest still runs; the `npx astro check` gate comes after Task 3.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cross-listings.ts src/lib/cross-listings.test.ts
git commit -m "feat(catalog): pure cross-listing helpers (diff, grouping, card rebranding)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: `detailCategorySlug` on CatalogProduct + canonical card link

**Files:**
- Modify: `src/scripts/catalog/types.ts` (CatalogProduct interface, after the `categorySlug` field, line ~27)
- Modify: `src/components/catalog/ProductCard.astro:8`

**Interfaces:**
- Consumes: nothing new.
- Produces: `CatalogProduct.detailCategorySlug?: CategorySlug` — Task 2's `buildCrossListedCards` sets it; `ProductCard.astro` reads it. (`ProductRow.astro` renders no link at all — no change there. `byCategory` in `filter-engine.ts` keeps filtering on `categorySlug` — intentionally unchanged.)

- [ ] **Step 1: Add the type field**

In `src/scripts/catalog/types.ts`, inside `interface CatalogProduct`, directly under `categorySlug: CategorySlug;` add:

```ts
  /** When set, the detail link points at THIS category instead of
   *  `categorySlug`. Used by cross-listed cards: they sit on the extra
   *  category's page (categorySlug = that page, so the client-side category
   *  filter keeps them) but link to their canonical home page. */
  detailCategorySlug?: CategorySlug;
```

- [ ] **Step 2: Use it for the card link**

In `src/components/catalog/ProductCard.astro`, change line 8 from:

```ts
const detailUrl = `/catalog/${p.categorySlug}/${p.slug}`;
```

to:

```ts
const detailUrl = `/catalog/${p.detailCategorySlug ?? p.categorySlug}/${p.slug}`;
```

(Both the image link and the title link already use `detailUrl` — no other edit.)

- [ ] **Step 3: Verify types + full suite**

Run: `npx astro check` — Expected: no NEW errors (the pre-existing `baseUrl` deprecation notice from tsconfig may appear; ignore it).
Run: `npm test` — Expected: all suites PASS (incl. Task 2's).

- [ ] **Step 4: Commit**

```bash
git add src/scripts/catalog/types.ts src/components/catalog/ProductCard.astro
git commit -m "feat(catalog): canonical detail link for cross-listed cards (detailCategorySlug)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Fetch borrowed cards + wire the category page

**Files:**
- Modify: `src/lib/cross-listings.ts` (append the async fetch)
- Modify: `src/pages/catalog/[category]/index.astro` (lines ~34–65)

**Interfaces:**
- Consumes: `getFamilies({ includeHidden: true })` (`src/lib/families.ts`), `getCategories()` / `getSubcategories()` (`src/lib/categories.ts` — `getCategories()` is active-only by default; `getSubcategories()` includes hidden rows by default), `fetchCatalogConfigurations(categoryName, categorySlug)` (`src/lib/products.ts`), plus Task 2's pure helpers.
- Produces: `fetchCrossListedCards(extraSlug: CategorySlug): Promise<{ cards: CatalogProduct[]; seriesI18n: Record<string, Record<string, string>> }>` — cards ready to append to the page's `products` array; `seriesI18n` entries for the borrowed series (from their HOME categories' overlays).

- [ ] **Step 1: Append the fetch to `src/lib/cross-listings.ts`**

Add these imports at the top (keeping the existing type imports):

```ts
import { supabase } from './supabase';
import { getFamilies } from './families';
import { getCategories, getSubcategories } from './categories';
import { fetchCatalogConfigurations } from './products';
```

Append at the end of the file:

```ts
/**
 * The borrowed cards to append to one category's catalog page, plus the
 * series-name translations their sidebar entries need (from each family's
 * HOME category overlay). Empty result when the category has no listings.
 * Errors are logged and degrade to "no borrowed cards" — a bad listing must
 * never 500 the category page.
 */
export async function fetchCrossListedCards(extraSlug: CategorySlug): Promise<{
  cards: CatalogProduct[];
  seriesI18n: Record<string, Record<string, string>>;
}> {
  const empty = { cards: [], seriesI18n: {} };
  const { data, error } = await supabase
    .from('product_family_extra_categories')
    .select('family_id, category_slug')
    .eq('category_slug', extraSlug);
  if (error) { console.error('fetchCrossListedCards:', error.message); return empty; }
  const listings = (data ?? []) as CrossListingRow[];
  if (listings.length === 0) return empty;

  const [families, categories, subcats] = await Promise.all([
    getFamilies({ includeHidden: true }),   // mirror the home grid, which doesn't gate on family is_active
    getCategories(),                         // active only — a hidden home category lends nothing
    getSubcategories(),                      // includes hidden rows; they filter the borrowed cards
  ]);
  const fams = crossListedFamiliesFor(listings, families, extraSlug);
  // Home category slug → the family codes borrowed from it. getFamilies is
  // ordered (category_slug, sort_order), so iteration order is deterministic.
  const byHome = new Map<string, Set<string>>();
  for (const f of fams) {
    let set = byHome.get(f.category_slug);
    if (!set) { set = new Set(); byHome.set(f.category_slug, set); }
    set.add(f.code);
  }

  const cards: CatalogProduct[] = [];
  const seriesI18n: Record<string, Record<string, string>> = {};
  for (const [homeSlug, codes] of byHome) {
    const home = categories.find((c) => c.slug === homeSlug);
    if (!home?.product_category_name) continue;   // hidden or unlinked home category
    const overlay = subcats.filter((s) => s.category_slug === homeSlug);
    const hidden = new Set(overlay.filter((s) => !s.is_active).map((s) => s.name));
    let homeCards: CatalogProduct[] = [];
    try {
      homeCards = await fetchCatalogConfigurations(home.product_category_name, homeSlug as CategorySlug);
    } catch (err) {
      console.error(`fetchCrossListedCards: home "${homeSlug}" fetch failed, skipping`, err);
      continue;
    }
    const borrowed = buildCrossListedCards(homeCards, codes, hidden, extraSlug);
    cards.push(...borrowed);
    for (const o of overlay) {
      if (o.name_i18n && Object.keys(o.name_i18n).length && borrowed.some((c) => c.material === o.name)) {
        seriesI18n[o.name] = o.name_i18n;
      }
    }
  }
  return { cards, seriesI18n };
}
```

- [ ] **Step 2: Wire the category page**

In `src/pages/catalog/[category]/index.astro`:

(a) Add the import (with the other lib imports at the top):

```ts
import { fetchCrossListedCards } from '../../../lib/cross-listings';
```

(b) Directly AFTER the existing native-products block (the `if (excelName) { … }` that fills `let products`) and BEFORE the line `const categoryProducts = products;`, insert:

```ts
// Cards cross-listed into this category from other families ("borrowed"):
// appended after the native cards, linking back to their canonical home pages.
let crossSeriesI18n: Record<string, Record<string, string>> = {};
try {
  const cross = await fetchCrossListedCards(categoryEntry.slug as CategorySlug);
  products = [...products, ...cross.cards];
  crossSeriesI18n = cross.seriesI18n;
} catch (err) {
  console.error(`catalog "${category}": cross-listed fetch failed, skipping`, err);
}
```

(c) Directly AFTER the existing `seriesI18n` build loop (`for (const o of overlay) if (o.name_i18n && …) seriesI18n[o.name] = o.name_i18n;`), insert:

```ts
// Borrowed series translations come from their HOME categories' overlays.
// This category's own overlay wins on a name clash.
for (const [name, tr] of Object.entries(crossSeriesI18n)) seriesI18n[name] ??= tr;
```

No other page change: `rawSeries` is derived from `products` AFTER the append, so borrowed series land at the end of the sidebar (this category's `applySubcategoryOverlay` keeps unmanaged names in original order at the end); `isEmpty`/counts include borrowed cards; the country modal and filters already work off card data.

- [ ] **Step 3: Verify build surface**

Run: `npm test` — Expected: PASS.
Run: `npx astro check` — Expected: no new errors.

- [ ] **Step 4: Live-data smoke test in the browser**

1. Start the dev server: `npm run dev` (uses the live Supabase project).
2. Insert a temporary listing (Management API / execute_sql), using a real family — pick one visible on `/catalog/compression-fittings/`:

```sql
insert into product_family_extra_categories (family_id, category_slug)
select f.id, 'turf' from product_families f
where f.category_slug = 'compression-fittings' and f.code = '<PICK A REAL CODE>';
```

3. Open `http://localhost:4321/catalog/turf/` — Expected: the borrowed card renders after Turf's native cards, its series appears at the end of the left sidebar, and clicking the card opens `/catalog/compression-fittings/<slug>/`.
4. Check the card is filterable: tick its series in the sidebar — the grid narrows to it.
5. Delete the temporary row:

```sql
delete from product_family_extra_categories
where category_slug = 'turf';
```

6. Reload `/catalog/turf/` — Expected: the borrowed card is gone.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cross-listings.ts "src/pages/catalog/[category]/index.astro"
git commit -m "feat(catalog): render cross-listed family cards on extra category pages

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Admin Families tab — "Also in…" modal, badges, search

**Files:**
- Modify: `src/lib/families.ts` (filterFamilies, lines ~84–97)
- Test: `src/lib/families.test.ts` (extend the filterFamilies describe block)
- Modify: `src/components/admin/FamiliesTab.tsx`

**Interfaces:**
- Consumes: Task 2's `extraSlugsByFamily`, `diffCrossListings`; table `product_family_extra_categories` (Task 1); existing `load()` / `triggerPublish()` / `catForFamily` patterns in FamiliesTab.
- Produces: `filterFamilies(fams, query, factsFor, extraFieldsFor?)` — new OPTIONAL 4th param `extraFieldsFor?: (fam: ProductFamily) => (string | null)[]`; existing callers stay valid.

- [ ] **Step 1: Write the failing test for the search extension**

In `src/lib/families.test.ts`, add inside the existing `describe('filterFamilies', …)` block (create the same fixture style as the neighbouring cases — `fams`/`factsFor` already exist in that block; if the block builds them inline per test, follow that pattern):

```ts
  it('matches via extraFieldsFor (cross-listed category names)', () => {
    const fams: ProductFamily[] = [
      { id: 'f1', category_slug: 'compression-fittings', code: '330A', sort_order: 0, is_active: true },
      { id: 'f2', category_slug: 'compression-fittings', code: '331', sort_order: 1, is_active: true },
    ];
    const noFacts = (): CodeFacts => ({ count: 0, configuration: null, series: [], perSeries: new Map() });
    const extras = (fam: ProductFamily) => (fam.id === 'f1' ? ['turf', 'Turf'] : []);
    expect(filterFamilies(fams, 'turf', noFacts, extras).map((f) => f.code)).toEqual(['330A']);
    expect(filterFamilies(fams, '330', noFacts, extras).map((f) => f.code)).toEqual(['330A']);
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/families.test.ts`
Expected: FAIL — filterFamilies accepts no 4th argument / result mismatch.

- [ ] **Step 3: Extend filterFamilies**

In `src/lib/families.ts` replace the `filterFamilies` function with:

```ts
/** Admin search over family codes: matches the code itself, any of the
 *  family's configuration names (overall or per-series), or any extra fields
 *  the caller supplies (e.g. cross-listed category slugs/names). */
export function filterFamilies(
  fams: ProductFamily[],
  query: string,
  factsFor: (fam: ProductFamily) => CodeFacts,
  extraFieldsFor?: (fam: ProductFamily) => (string | null)[],
): ProductFamily[] {
  if (query.trim() === '') return fams;
  return fams.filter((fam) => {
    const f = factsFor(fam);
    const configs = [f.configuration, ...[...f.perSeries.values()].map((s) => s.configuration)];
    return matchesFields(query, [fam.code, ...configs, ...(extraFieldsFor?.(fam) ?? [])]);
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/families.test.ts`
Expected: PASS (all, including pre-existing cases).

- [ ] **Step 5: Wire FamiliesTab — state + load**

In `src/components/admin/FamiliesTab.tsx`:

(a) Add the import:

```ts
import { extraSlugsByFamily, diffCrossListings, type CrossListingRow } from '../../lib/cross-listings';
```

(b) Add state (next to the other useState declarations, after `primaryByFam`):

```ts
  // family_id → extra category slugs the family is cross-listed into.
  const [crossByFam, setCrossByFam] = useState<Record<string, string[]>>({});
  // Family open in the "Also show in…" modal + its draft selection.
  const [crossTarget, setCrossTarget] = useState<ProductFamily | null>(null);
  const [crossDraft, setCrossDraft] = useState<Set<string>>(new Set());
  const [crossSaving, setCrossSaving] = useState(false);
  const [crossError, setCrossError] = useState<string | null>(null);
```

(c) In `load()`, extend the first `Promise.all` destructuring with a sixth query. Change:

```ts
    const [
      { data: c, error: cErr }, { data: f, error: fErr }, { data: imgs, error: iErr },
      { data: grps, error: gErr }, { data: gcRows, error: gcErr },
    ] = await Promise.all([
      supabase.from('product_categories').select('*').order('sort_order'),
      supabase.from('product_families').select('*').order('category_slug').order('sort_order'),
      supabase.from('product_images').select('*').order('created_at', { ascending: false }),
      supabase.from('product_groups').select('code').order('sort_order'),
      supabase.from('group_countries').select('group_code, country').order('group_code').order('country'),
    ]);
    if (cErr || fErr || iErr || gErr || gcErr) return setError((cErr ?? fErr ?? iErr ?? gErr ?? gcErr)!.message);
```

to:

```ts
    const [
      { data: c, error: cErr }, { data: f, error: fErr }, { data: imgs, error: iErr },
      { data: grps, error: gErr }, { data: gcRows, error: gcErr }, { data: xRows, error: xErr },
    ] = await Promise.all([
      supabase.from('product_categories').select('*').order('sort_order'),
      supabase.from('product_families').select('*').order('category_slug').order('sort_order'),
      supabase.from('product_images').select('*').order('created_at', { ascending: false }),
      supabase.from('product_groups').select('code').order('sort_order'),
      supabase.from('group_countries').select('group_code, country').order('group_code').order('country'),
      supabase.from('product_family_extra_categories').select('family_id, category_slug').order('category_slug'),
    ]);
    if (cErr || fErr || iErr || gErr || gcErr || xErr) {
      return setError((cErr ?? fErr ?? iErr ?? gErr ?? gcErr ?? xErr)!.message);
    }
```

and after `setGroupCountries(gcMap);` add:

```ts
    setCrossByFam(extraSlugsByFamily((xRows ?? []) as CrossListingRow[]));
```

- [ ] **Step 6: Wire FamiliesTab — search + handlers**

(a) In the `sections` computation, pass the extra fields. Change the `filterFamilies(...)` call to:

```ts
      codes: filterFamilies(
        families.filter((f) => f.category_slug === cat.slug),
        query,
        (fam) => factsFor(cat, fam.code),
        (fam) => (crossByFam[fam.id] ?? []).flatMap((slug) => {
          const c = (cats ?? []).find((x) => x.slug === slug);
          return [slug, c?.name ?? null];
        }),
      ),
```

(b) Add the handlers (next to the other mutations, e.g. after `deleteCode`):

```ts
  // ── cross-listing ("Also show in…") ──────────────────────────────────────

  const openCrossListing = (fam: ProductFamily) => {
    setCrossTarget(fam);
    setCrossError(null);
    setCrossDraft(new Set(crossByFam[fam.id] ?? []));
  };

  const saveCrossListing = async () => {
    if (!crossTarget) return;
    setCrossSaving(true);
    setCrossError(null);
    try {
      const { toAdd, toRemove } = diffCrossListings(crossByFam[crossTarget.id] ?? [], [...crossDraft]);
      if (toAdd.length) {
        const { error: err } = await supabase.from('product_family_extra_categories')
          .insert(toAdd.map((slug) => ({ family_id: crossTarget.id, category_slug: slug })));
        if (err) throw new Error(err.message);
      }
      if (toRemove.length) {
        const { error: err } = await supabase.from('product_family_extra_categories')
          .delete().eq('family_id', crossTarget.id).in('category_slug', toRemove);
        if (err) throw new Error(err.message);
      }
      setCrossTarget(null);
      await load();
      triggerPublish();
    } catch (e) {
      setCrossError(e instanceof Error ? e.message : 'Saving cross-listing failed.');
    } finally {
      setCrossSaving(false);
    }
  };
```

- [ ] **Step 7: Wire FamiliesTab — row badges + button + modal**

(a) In the row `<li>`, directly after the configuration span (`<span className="flex-1 min-w-0 truncate …">{configuration ?? '—'}</span>`), add the badges:

```tsx
                            {(crossByFam[fam.id] ?? []).map((slug) => {
                              const c = (cats ?? []).find((x) => x.slug === slug);
                              return (
                                <span key={slug} title={`Also shown in ${c?.name ?? slug}`}
                                  className="shrink-0 inline-block px-1.5 py-0.5 text-[9px] uppercase tracking-[0.15em] bg-brand-500/10 text-brand-500 rounded">
                                  + {c?.name ?? slug}
                                </span>
                              );
                            })}
```

(b) Next to the row's "Manage images" button, add BEFORE it:

```tsx
                            <button type="button" onClick={() => openCrossListing(fam)} className="text-[11px] text-brand-500 uppercase tracking-[0.15em]">Also in…</button>
```

(c) Add the modal as a sibling BEFORE the existing image-manager modal (`{assignTarget && (…)}`):

```tsx
      {/* Modal: cross-list a family into additional categories */}
      {crossTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
          <div className="relative w-full max-w-md bg-surface border border-ink/15 shadow-xl">
            <div className="border-b border-ink/10 px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-brand-500 font-semibold mb-0.5">Also show in</p>
              <p className="text-sm text-ink font-medium">
                {catForFamily(crossTarget)?.name} · No.{crossTarget.code}
              </p>
            </div>
            <div className="p-5">
              {crossError && (
                <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-4">{crossError}</p>
              )}
              <p className="text-xs text-ink/60 mb-3">
                The card (with all its sizes) also appears on the ticked categories&rsquo; pages.
                It keeps its product page under {catForFamily(crossTarget)?.name ?? 'its own category'}.
              </p>
              <ul className="flex flex-col gap-1.5">
                {(cats ?? []).filter((c) => c.is_active && c.slug !== crossTarget.category_slug).map((c) => (
                  <li key={c.slug}>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" className="accent-brand-500"
                        checked={crossDraft.has(c.slug)}
                        onChange={(e) => {
                          const next = new Set(crossDraft);
                          if (e.currentTarget.checked) next.add(c.slug); else next.delete(c.slug);
                          setCrossDraft(next);
                        }} />
                      {c.name}
                    </label>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-end gap-3 mt-5">
                <button type="button" onClick={() => setCrossTarget(null)}
                  className="px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-ink/60">Cancel</button>
                <button type="button" disabled={crossSaving} onClick={saveCrossListing}
                  className="bg-brand-500 text-surface px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] disabled:opacity-50">
                  {crossSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
```

- [ ] **Step 8: Verify**

Run: `npm test` — Expected: PASS.
Run: `npx astro check` — Expected: no new errors.
Browser (`npm run dev`, log into `/admin`, Families tab):
1. Open "Also in…" on a compression-fittings family, tick **Turf**, Save — Expected: modal closes, row shows a `+ Turf` badge.
2. Search "turf" in the tab search — Expected: that family's row is found.
3. `/catalog/turf/` shows the card (within ~a minute on the deployed site; instantly on dev reload).
4. Re-open "Also in…", untick, Save — badge gone, card gone on reload.

- [ ] **Step 9: Commit**

```bash
git add src/lib/families.ts src/lib/families.test.ts src/components/admin/FamiliesTab.tsx
git commit -m "feat(admin): cross-list families into extra categories from the Families tab

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Full verification + data-checker exercise

**Files:**
- No new files; verification only (fix-forward anything found).

- [ ] **Step 1: Full test + type gates**

Run: `npm test` — Expected: all suites PASS.
Run: `npx astro check` — Expected: no new errors vs. main.

- [ ] **Step 2: Exercise the new data checks live**

Via execute_sql / Management API:

```sql
-- Self-listing (bad data the UI can't create):
insert into product_family_extra_categories (family_id, category_slug)
select id, category_slug from product_families limit 1;

select run_product_data_checks();

select check_key, issue_type, severity from product_import_issues
where issue_type in ('cross_listing_self', 'cross_listing_empty') and status = 'open';
-- Expected: one cross_listing_self row (error).

-- Clean up and re-run so the issue auto-resolves:
delete from product_family_extra_categories;
select run_product_data_checks();

select count(*) from product_import_issues
where issue_type = 'cross_listing_self' and status = 'open';
-- Expected: 0
```

Also confirm the issue appeared in the admin **Data Errors** tab while open (renders `issue_type` generically).

- [ ] **Step 3: End-to-end walkthrough (the real flow)**

With `npm run dev`:
1. Admin → Families → cross-list one real family into Turf via "Also in…".
2. `/catalog/turf/`: card present after native cards; series in sidebar (translated when Greek is active); card click lands on `/catalog/compression-fittings/<slug>/`; country filter still gates it.
3. Remove the listing in the admin; card disappears on reload.

- [ ] **Step 4: Report to the user**

Summarise what was built and verified. **Do NOT push** — ask the user to review first (their standing rule), then push all local commits on approval.

---

## Self-Review Notes (already applied)

- Spec's "FamilyForm" adapted to reality: families are managed inline in `FamiliesTab.tsx` (no form component exists), so the field became a per-row "Also in…" modal — same behaviour, correct surface.
- Spec coverage: table+RLS+cascades (Task 1), checker checks (Tasks 1, 6), borrowed cards + canonical links + series/i18n/ordering/visibility (Tasks 2–4), admin field + badges + search (Task 5), out-of-scope items untouched anywhere.
- `byCategory` client filter: solved via `categorySlug = extra slug` + `detailCategorySlug = home slug` (Tasks 2–3) — the spec's "canonical links" requirement holds because only `ProductCard.astro` builds links.
- Type consistency: `CrossListingRow`, `extraSlugsByFamily`, `diffCrossListings`, `crossListedFamiliesFor`, `buildCrossListedCards`, `fetchCrossListedCards`, `detailCategorySlug`, `extraFieldsFor` are used with identical names/signatures across Tasks 2–5.
