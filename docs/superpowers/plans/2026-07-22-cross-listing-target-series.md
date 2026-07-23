# Cross-listing Target Series Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When cross-listing a family into another category, let the admin pick a destination **series**, and render the borrowed card under that series (instead of carrying over its home series).

**Architecture:** Add a `sub_category` column to `product_family_extra_categories` (FK to the destination category's managed subcategories). The category page's borrowed-card builder overrides each card's `material` (series facet) with the chosen destination series, so it slots into that series' existing sidebar/grid section — no more borrowed `seriesI18n`. The admin modal becomes a per-category series `<select>`.

**Tech Stack:** Astro (SSR, edge-cached), React admin islands, Supabase (Postgres + RLS), Vitest.

**Spec:** `docs/superpowers/specs/2026-07-22-cross-listing-target-series-design.md`
**Builds on shipped feature:** commits 9a27df0..00c082e (`docs/superpowers/plans/2026-07-22-family-cross-listing.md`).

## Global Constraints

- **Per-task LOCAL commits; do NOT `git push`** until the user reviews the finished change. Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Migration file: `supabase/migrations/0051_cross_listing_target_series.sql`.
- Live SQL (apply/verify/smoke) via the **Supabase MCP tools** (`mcp__plugin_supabase_supabase__execute_sql` / `apply_migration`, project `hsamhykaqmiiheneonxz`). The raw Management-API token and older sbp token are dead — do not use them. **The MCP connection may need re-authorization (it expired mid-session); if a call returns "requires re-authorization", STOP that step and report — the user must re-auth.** Applying migration 0051 to prod needs explicit user consent (part of this approved plan).
- The live `product_family_extra_categories` table is currently EMPTY (0 rows) — the ALTER needs no backfill.
- Test files sit next to their lib; style follows `src/lib/cross-listings.test.ts` / `families.test.ts`.
- Pre-existing unrelated `astro check` issues to ignore: `src/lib/catalogues.test.ts:5`, and a TS5101 baseUrl notice under raw tsc. Anything NEW in touched files is in scope.
- The destination series offered in the admin and stored MUST be a member of the destination category's `product_subcategories` (the FK enforces it) — never a free-typed string.

---

### Task 1: Migration 0051 — destination-series column + FK, applied live

**Files:**
- Create: `supabase/migrations/0051_cross_listing_target_series.sql`

**Interfaces:**
- Produces: `product_family_extra_categories` gains `sub_category text not null`; composite FK `(category_slug, sub_category) → product_subcategories(category_slug, name) on delete cascade`; PK stays `(family_id, category_slug)`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0051_cross_listing_target_series.sql`:

```sql
-- 0051_cross_listing_target_series.sql — add a destination series to a
-- cross-listing.
--
-- A cross-listing row now says: family <family_id> appears on category
-- <category_slug>'s page UNDER series <sub_category> (a managed subcategory of
-- that destination category). The home category still owns the product page,
-- image and country gating. The live table is empty, so no backfill.
-- Spec: docs/superpowers/specs/2026-07-22-cross-listing-target-series-design.md

alter table public.product_family_extra_categories
  add column if not exists sub_category text not null;

-- The destination series must be a managed subcategory of the destination
-- category. product_subcategories has unique (category_slug, name).
alter table public.product_family_extra_categories
  drop constraint if exists pfec_dest_series_fk;
alter table public.product_family_extra_categories
  add constraint pfec_dest_series_fk
  foreign key (category_slug, sub_category)
  references public.product_subcategories (category_slug, name)
  on delete cascade;
```

(PK `(family_id, category_slug)` is unchanged, so one destination series per
(family, category). RLS + `pfec_category_idx` are untouched. No function/checker
change: the `0050` self/empty checks remain correct and their check_keys stay
unique at one row per (family, category).)

- [ ] **Step 2: Apply live**

Apply the file via `mcp__plugin_supabase_supabase__apply_migration` (name `cross_listing_target_series`, project `hsamhykaqmiiheneonxz`). If the MCP needs re-auth, STOP and report.

- [ ] **Step 3: Verify live**

Run via `execute_sql`:

```sql
select column_name, is_nullable from information_schema.columns
 where table_name = 'product_family_extra_categories' order by ordinal_position;
-- expect sub_category present, NO
select conname from pg_constraint where conrelid = 'public.product_family_extra_categories'::regclass;
-- expect pfec_dest_series_fk present
select count(*) from public.product_family_extra_categories;   -- expect 0
select public.run_product_data_checks();                        -- integer, no error
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0051_cross_listing_target_series.sql
git commit -m "feat(db): destination series column on product_family_extra_categories (0051)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Reshape pure helpers for destination series + tests

**Files:**
- Modify: `src/lib/cross-listings.ts` (the pure section — imports/fetch stay for Task 3)
- Modify: `src/lib/cross-listings.test.ts`

**Interfaces:**
- Consumes: `ProductFamily`, `CatalogProduct`, `CategorySlug` (unchanged).
- Produces (used by Tasks 3 & 4):
  - `interface CrossListingRow { family_id: string; category_slug: string; sub_category: string }`
  - `interface Placement { category_slug: string; sub_category: string }`
  - `placementsByFamily(listings: CrossListingRow[]): Record<string, Placement[]>` (replaces `extraSlugsByFamily`)
  - `diffPlacements(current: Record<string, string>, next: Record<string, string>): { upserts: Placement[]; deletes: string[] }` (replaces `diffCrossListings`) — keys are category_slug, values are the chosen series (`''`/absent = not shown)
  - `crossListedFamiliesFor(listings, families, extraSlug)` — unchanged signature/behaviour
  - `buildCrossListedCards(homeCards: CatalogProduct[], seriesByCode: Map<string,string>, hiddenHomeSeries: Set<string>, extraSlug: CategorySlug): CatalogProduct[]` — now sets `material` to the destination series from `seriesByCode` (keyed by card `code`)

- [ ] **Step 1: Rewrite the test file**

Replace `src/lib/cross-listings.test.ts` with:

```ts
import { describe, it, expect } from 'vitest';
import {
  placementsByFamily, diffPlacements, crossListedFamiliesFor, buildCrossListedCards,
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

describe('placementsByFamily', () => {
  it('groups rows by family with their category + series', () => {
    const rows: CrossListingRow[] = [
      { family_id: 'f1', category_slug: 'turf', sub_category: 'Turf Drippers' },
      { family_id: 'f1', category_slug: 'valves', sub_category: 'Ball Valves' },
      { family_id: 'f2', category_slug: 'turf', sub_category: 'Turf Pipe' },
    ];
    expect(placementsByFamily(rows)).toEqual({
      f1: [{ category_slug: 'turf', sub_category: 'Turf Drippers' },
           { category_slug: 'valves', sub_category: 'Ball Valves' }],
      f2: [{ category_slug: 'turf', sub_category: 'Turf Pipe' }],
    });
  });
  it('returns {} for no listings', () => {
    expect(placementsByFamily([])).toEqual({});
  });
});

describe('diffPlacements', () => {
  it('upserts added and changed series, deletes cleared ones', () => {
    const current = { turf: 'Turf Drippers', valves: 'Ball Valves' };
    const next = { turf: 'Turf Pipe', saddles: 'Clamp Saddles', valves: '' };
    expect(diffPlacements(current, next)).toEqual({
      upserts: [
        { category_slug: 'turf', sub_category: 'Turf Pipe' },     // changed series
        { category_slug: 'saddles', sub_category: 'Clamp Saddles' }, // new
      ],
      deletes: ['valves'],                                        // cleared
    });
  });
  it('is empty when nothing changed', () => {
    expect(diffPlacements({ turf: 'A' }, { turf: 'A' })).toEqual({ upserts: [], deletes: [] });
  });
  it('treats absent and empty-string keys as not shown', () => {
    expect(diffPlacements({ turf: 'A' }, {})).toEqual({ upserts: [], deletes: ['turf'] });
    expect(diffPlacements({}, { turf: '' })).toEqual({ upserts: [], deletes: [] });
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
      { family_id: 'f1', category_slug: 'turf', sub_category: 'S' },
      { family_id: 'f2', category_slug: 'valves', sub_category: 'S' },
    ];
    expect(crossListedFamiliesFor(rows, families, 'turf').map((f) => f.id)).toEqual(['f1']);
  });
  it('drops self-listings and unknown families', () => {
    const rows: CrossListingRow[] = [
      { family_id: 'f3', category_slug: 'turf', sub_category: 'S' },  // f3 is home in turf
      { family_id: 'gone', category_slug: 'turf', sub_category: 'S' },
    ];
    expect(crossListedFamiliesFor(rows, families, 'turf')).toEqual([]);
  });
});

describe('buildCrossListedCards', () => {
  it('relabels the card to the destination series and rebrands for the extra page', () => {
    const cards = [card({ code: '330A' }), card({ code: '331', slug: 'series-331' })];
    const out = buildCrossListedCards(cards, new Map([['330A', 'Turf Drippers']]), new Set(), 'turf');
    expect(out).toHaveLength(1);
    expect(out[0].categorySlug).toBe('turf');
    expect(out[0].detailCategorySlug).toBe('compression-fittings');
    expect(out[0].material).toBe('Turf Drippers');   // destination series, not home series
    expect(out[0].slug).toBe('series-330a');          // slug (detail link) unchanged
  });
  it('assigns each code its own destination series', () => {
    const cards = [card({ code: '330A' }), card({ code: '331', slug: 'series-331' })];
    const out = buildCrossListedCards(
      cards, new Map([['330A', 'Series A'], ['331', 'Series B']]), new Set(), 'turf');
    expect(out.map((c) => [c.code, c.material])).toEqual([['330A', 'Series A'], ['331', 'Series B']]);
  });
  it('drops cards whose HOME series is hidden', () => {
    const cards = [card({ code: '330A', material: 'Hidden Home Series' })];
    expect(buildCrossListedCards(cards, new Map([['330A', 'Turf Drippers']]),
      new Set(['Hidden Home Series']), 'turf')).toEqual([]);
  });
  it('does not mutate the input cards', () => {
    const original = card({ code: '330A' });
    buildCrossListedCards([original], new Map([['330A', 'X']]), new Set(), 'turf');
    expect(original.categorySlug).toBe('compression-fittings');
    expect(original.material).toBe('Compression Fittings PN16');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/cross-listings.test.ts`
Expected: FAIL (`placementsByFamily`/`diffPlacements` not exported; `buildCrossListedCards` signature mismatch).

- [ ] **Step 3: Rewrite the pure section of `src/lib/cross-listings.ts`**

Replace the interface + the four pure helpers (keep the file's async `fetchCrossListedCards` for Task 3 to rewrite; keep the existing top imports). The pure section becomes:

```ts
/** One row of product_family_extra_categories. */
export interface CrossListingRow {
  family_id: string;
  /** The destination category the family also appears in (not its home). */
  category_slug: string;
  /** The destination series (a managed subcategory of category_slug). */
  sub_category: string;
}

/** A family's placement into one destination category, under one series. */
export interface Placement {
  category_slug: string;
  sub_category: string;
}

/** family_id → its placements, for the admin row badges + modal + search. */
export function placementsByFamily(listings: CrossListingRow[]): Record<string, Placement[]> {
  const out: Record<string, Placement[]> = {};
  for (const l of listings) {
    (out[l.family_id] ??= []).push({ category_slug: l.category_slug, sub_category: l.sub_category });
  }
  return out;
}

/**
 * Admin save diff. `current`/`next` map category_slug → chosen series (an empty
 * string or a missing key means "not shown"). Returns the placements to upsert
 * (added or series-changed) and the category slugs to delete (cleared).
 */
export function diffPlacements(
  current: Record<string, string>,
  next: Record<string, string>,
): { upserts: Placement[]; deletes: string[] } {
  const upserts: Placement[] = [];
  const deletes: string[] = [];
  const cats = new Set([...Object.keys(current), ...Object.keys(next)]);
  for (const category_slug of cats) {
    const was = current[category_slug] ?? '';
    const now = next[category_slug] ?? '';
    if (now === was) continue;
    if (now === '') deletes.push(category_slug);
    else upserts.push({ category_slug, sub_category: now });
  }
  return { upserts, deletes };
}

/** The families cross-listed into one destination category. Self-listings
 *  (family already home there) are bad data — dropped defensively. */
export function crossListedFamiliesFor(
  listings: CrossListingRow[],
  families: ProductFamily[],
  extraSlug: string,
): ProductFamily[] {
  const ids = new Set(listings.filter((l) => l.category_slug === extraSlug).map((l) => l.family_id));
  return families.filter((f) => ids.has(f.id) && f.category_slug !== extraSlug);
}

/**
 * Rebrand a home category's cards for display inside the destination category:
 * keep only the borrowed codes (present in seriesByCode), drop cards whose HOME
 * series is hidden, then relabel each surviving card's series (`material`) to
 * its chosen destination series and tag it with the destination slug — while
 * the card's link stays canonical via detailCategorySlug (the home slug).
 */
export function buildCrossListedCards(
  homeCards: CatalogProduct[],
  seriesByCode: Map<string, string>,
  hiddenHomeSeries: Set<string>,
  extraSlug: CategorySlug,
): CatalogProduct[] {
  return homeCards
    .filter((c) => c.code != null && seriesByCode.has(c.code))
    .filter((c) => !c.material || !hiddenHomeSeries.has(c.material))
    .map((c) => ({
      ...c,
      categorySlug: extraSlug,
      detailCategorySlug: c.categorySlug,
      material: seriesByCode.get(c.code as string),
    }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/cross-listings.test.ts`
Expected: PASS. (TypeScript for the not-yet-updated `fetchCrossListedCards` may complain — that's Task 3; vitest still runs. Don't run `astro check` yet.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/cross-listings.ts src/lib/cross-listings.test.ts
git commit -m "refactor(catalog): cross-listing helpers carry a destination series

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Rework the fetch + simplify the category page

**Files:**
- Modify: `src/lib/cross-listings.ts` (`fetchCrossListedCards`)
- Modify: `src/pages/catalog/[category]/index.astro`

**Interfaces:**
- Consumes: Task 2 helpers; `getFamilies({includeHidden:true})`, `getCategories()`, `getSubcategories()`, `fetchCatalogConfigurations`.
- Produces: `fetchCrossListedCards(extraSlug: CategorySlug): Promise<CatalogProduct[]>` — borrowed cards ready to append, each relabelled to its destination series. **No `seriesI18n` return anymore.**

- [ ] **Step 1: Rewrite `fetchCrossListedCards`**

Replace the existing `fetchCrossListedCards` in `src/lib/cross-listings.ts` with (keep the imports added in the shipped version — `supabase`, `getFamilies`, `getCategories`, `getSubcategories`, `fetchCatalogConfigurations`):

```ts
/**
 * The borrowed cards to append to one category's catalog page. Each card is
 * relabelled to the destination series the admin chose, so it slots into that
 * (managed) series' existing section — its translations already come from this
 * category's own overlay, so no borrowed i18n is needed. Errors degrade to [];
 * a bad listing must never 500 the page.
 */
export async function fetchCrossListedCards(extraSlug: CategorySlug): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from('product_family_extra_categories')
    .select('family_id, category_slug, sub_category')
    .eq('category_slug', extraSlug);
  if (error) { console.error('fetchCrossListedCards:', error.message); return []; }
  const listings = (data ?? []) as CrossListingRow[];
  if (listings.length === 0) return [];

  const [families, categories, subcats] = await Promise.all([
    getFamilies({ includeHidden: true }),   // mirror the home grid
    getCategories(),                         // active only — a hidden home lends nothing
    getSubcategories(),                      // includes hidden; used for the home-hidden filter
  ]);
  const fams = crossListedFamiliesFor(listings, families, extraSlug);
  const famById = new Map(fams.map((f) => [f.id, f]));
  // home category slug → Map(code → destination series), from each placement.
  const byHome = new Map<string, Map<string, string>>();
  for (const l of listings) {
    const f = famById.get(l.family_id);
    if (!f) continue;                         // filtered out (self-listing / unknown)
    let m = byHome.get(f.category_slug);
    if (!m) { m = new Map(); byHome.set(f.category_slug, m); }
    m.set(f.code, l.sub_category);
  }

  const cards: CatalogProduct[] = [];
  for (const [homeSlug, seriesByCode] of byHome) {
    const home = categories.find((c) => c.slug === homeSlug);
    if (!home?.product_category_name) continue;   // hidden/unlinked home category
    const overlay = subcats.filter((s) => s.category_slug === homeSlug);
    const hidden = new Set(overlay.filter((s) => !s.is_active).map((s) => s.name));
    let homeCards: CatalogProduct[] = [];
    try {
      homeCards = await fetchCatalogConfigurations(home.product_category_name, homeSlug as CategorySlug);
    } catch (err) {
      console.error(`fetchCrossListedCards: home "${homeSlug}" fetch failed, skipping`, err);
      continue;
    }
    cards.push(...buildCrossListedCards(homeCards, seriesByCode, hidden, extraSlug));
  }
  return cards;
}
```

- [ ] **Step 2: Simplify the category page**

In `src/pages/catalog/[category]/index.astro`:

(a) Change the borrowed-fetch block (added in the shipped version) so it no
longer collects `crossSeriesI18n`. Replace:

```ts
let crossSeriesI18n: Record<string, Record<string, string>> = {};
try {
  const cross = await fetchCrossListedCards(categoryEntry.slug as CategorySlug);
  products = [...products, ...cross.cards];
  crossSeriesI18n = cross.seriesI18n;
} catch (err) {
  console.error(`catalog "${category}": cross-listed fetch failed, skipping`, err);
}
```

with:

```ts
try {
  const crossCards = await fetchCrossListedCards(categoryEntry.slug as CategorySlug);
  products = [...products, ...crossCards];
} catch (err) {
  console.error(`catalog "${category}": cross-listed fetch failed, skipping`, err);
}
```

(b) Remove the now-dead merge line added in the shipped version:

```ts
for (const [name, tr] of Object.entries(crossSeriesI18n)) seriesI18n[name] ??= tr;
```

(The destination series are managed subcategories of THIS category, so they are
already covered by the existing `for (const o of overlay) …` seriesI18n loop.)

- [ ] **Step 3: Verify build surface**

Run: `npm test` — Expected: PASS.
Run: `npx astro check` — Expected: no new errors (only the pre-existing `catalogues.test.ts:5`).

- [ ] **Step 4: Live smoke test**

Use the Supabase MCP + `npm run dev` (curl the SSR HTML). Pick a real Turf managed subcategory and a real Compression Fittings family that renders on `/catalog/compression-fittings/`:

```sql
select name from product_subcategories where category_slug = 'turf' and is_active order by sort_order limit 5;
-- pick one, e.g. '<TURF_SERIES>'
insert into product_family_extra_categories (family_id, category_slug, sub_category)
select f.id, 'turf', '<TURF_SERIES>' from product_families f
where f.category_slug = 'compression-fittings' and f.code = '<REAL_CODE>';
```

Then `curl -s 'http://localhost:4321/catalog/turf/?smoke=1'` and confirm in the
`data-products-json`: the borrowed card has `"categorySlug":"turf"`,
`"detailCategorySlug":"compression-fittings"`, and `"material":"<TURF_SERIES>"`
(the destination series, NOT its home series). Confirm the card renders under
the `<TURF_SERIES>` section heading. Then:

```sql
delete from product_family_extra_categories where category_slug = 'turf';
```

Confirm the card disappears; confirm `select count(*)` is back to 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cross-listings.ts "src/pages/catalog/[category]/index.astro"
git commit -m "feat(catalog): render cross-listed cards under their chosen destination series

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Admin Families tab — series-per-category picker

**Files:**
- Modify: `src/components/admin/FamiliesTab.tsx`

**Interfaces:**
- Consumes: Task 2's `placementsByFamily`, `diffPlacements`, `type Placement`, `type CrossListingRow`; the `sub_category` column (Task 1); existing `load()`/`triggerPublish()`/`catForFamily`/`subcats` state.
- Produces: admin UI only.

- [ ] **Step 1: Swap imports + state**

(a) Change the cross-listing import to:

```ts
import { placementsByFamily, diffPlacements, type Placement, type CrossListingRow } from '../../lib/cross-listings';
```

(b) Replace the `crossByFam`/`crossDraft` state added in the shipped version with:

```ts
  // family_id → its placements (destination category + series).
  const [crossByFam, setCrossByFam] = useState<Record<string, Placement[]>>({});
  const [crossTarget, setCrossTarget] = useState<ProductFamily | null>(null);
  // draft: destination category_slug → chosen series ('' = not shown).
  const [crossDraft, setCrossDraft] = useState<Record<string, string>>({});
  const [crossSaving, setCrossSaving] = useState(false);
  const [crossError, setCrossError] = useState<string | null>(null);
```

- [ ] **Step 2: Update load() + the sixth query select**

In `load()`, change the 6th query's select to include `sub_category`:

```ts
      supabase.from('product_family_extra_categories').select('family_id, category_slug, sub_category').order('category_slug'),
```

and the setter to:

```ts
    setCrossByFam(placementsByFamily((xRows ?? []) as CrossListingRow[]));
```

- [ ] **Step 3: Update the search extra-fields + handlers**

(a) In the `sections` `filterFamilies` call, replace the `extraFieldsFor` mapper with one that adds each placement's category name AND series:

```ts
        (fam) => (crossByFam[fam.id] ?? []).flatMap((p) => {
          const c = (cats ?? []).find((x) => x.slug === p.category_slug);
          return [p.category_slug, c?.name ?? null, p.sub_category];
        }),
```

(b) Replace `openCrossListing`/`saveCrossListing` with:

```ts
  const openCrossListing = (fam: ProductFamily) => {
    setCrossTarget(fam);
    setCrossError(null);
    const draft: Record<string, string> = {};
    for (const p of crossByFam[fam.id] ?? []) draft[p.category_slug] = p.sub_category;
    setCrossDraft(draft);
  };

  const saveCrossListing = async () => {
    if (!crossTarget) return;
    setCrossSaving(true);
    setCrossError(null);
    try {
      const current: Record<string, string> = {};
      for (const p of crossByFam[crossTarget.id] ?? []) current[p.category_slug] = p.sub_category;
      const { upserts, deletes } = diffPlacements(current, crossDraft);
      if (upserts.length) {
        const { error: err } = await supabase.from('product_family_extra_categories')
          .upsert(upserts.map((u) => ({ family_id: crossTarget.id, ...u })),
                  { onConflict: 'family_id,category_slug' });
        if (err) throw new Error(err.message);
      }
      if (deletes.length) {
        const { error: err } = await supabase.from('product_family_extra_categories')
          .delete().eq('family_id', crossTarget.id).in('category_slug', deletes);
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

- [ ] **Step 4: Update the row badges**

Replace the badge map added in the shipped version with one that shows the series:

```tsx
                            {(crossByFam[fam.id] ?? []).map((p) => {
                              const c = (cats ?? []).find((x) => x.slug === p.category_slug);
                              return (
                                <span key={p.category_slug} title={`Also in ${c?.name ?? p.category_slug} / ${p.sub_category}`}
                                  className="shrink-0 inline-block px-1.5 py-0.5 text-[9px] uppercase tracking-[0.15em] bg-brand-500/10 text-brand-500 rounded">
                                  + {c?.name ?? p.category_slug} / {p.sub_category}
                                </span>
                              );
                            })}
```

- [ ] **Step 5: Replace the modal body with per-category series selects**

Replace the modal's category-checkbox `<ul>` (added in the shipped version) with a per-category `<select>` of that category's active subcategories:

```tsx
              <ul className="flex flex-col gap-2">
                {(cats ?? []).filter((c) => c.is_active && c.slug !== crossTarget.category_slug).map((c) => {
                  const series = subcats.filter((s) => s.category_slug === c.slug && s.is_active);
                  return (
                    <li key={c.slug} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate">{c.name}</span>
                      <select
                        value={crossDraft[c.slug] ?? ''}
                        disabled={series.length === 0}
                        onChange={(e) => setCrossDraft((d) => ({ ...d, [c.slug]: e.currentTarget.value }))}
                        className="shrink-0 bg-transparent border-b border-ink/25 py-1 text-sm focus:outline-none focus:border-brand-500"
                      >
                        <option value="">— not shown —</option>
                        {series.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </li>
                  );
                })}
              </ul>
```

(The modal already reads `subcats` — loaded in `load()` via `getSubcategories({ includeHidden: true })`; filtering to `is_active` here offers only live series. `crossDraft` values are series names, matching the stored `sub_category`.)

- [ ] **Step 6: Verify**

Run: `npm test` — Expected: PASS.
Run: `npx astro check` — Expected: no new errors.
Browser (`npm run dev`, `/admin`, Families):
1. Open "Also in…" on a compression-fittings family, set Turf's `<select>` to a Turf series, Save → row shows `+ Turf / <series>`.
2. Search that series name in the tab search → the family is found.
3. `/catalog/turf/` shows the card under that series section (dev reload).
4. Re-open, set Turf back to "— not shown —", Save → badge + card gone.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/FamiliesTab.tsx
git commit -m "feat(admin): pick a destination series when cross-listing a family

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Full verification + final whole-branch review

**Files:** none (verification; fix-forward anything found).

- [ ] **Step 1: Gates** — `npm test` (all pass) and `npx astro check` (only the pre-existing `catalogues.test.ts:5`).

- [ ] **Step 2: Live E2E** — via `npm run dev` + Supabase MCP: place a real family under a real Turf series through the admin; confirm on `/catalog/turf/` the card renders in that series section with a canonical `/catalog/compression-fittings/<slug>/` link; change the series and confirm it moves; set "— not shown —" and confirm it disappears; confirm the live table is back to 0 rows and `run_product_data_checks()` returns cleanly.

- [ ] **Step 3: Final whole-branch review** — dispatch a reviewer (most capable model) over the diff `00c082e..HEAD` with the spec, focusing on: the destination-series override not breaking the client filter/sidebar/country/search pipeline; slug behaviour with one-series-per-category; the FK preventing bad series; graceful degradation (hidden home category, deleted series cascade, empty family). Fix any Critical/Important via one fix subagent, then re-review.

- [ ] **Step 4: Report to the user. Do NOT push** — await review, then push all local commits on approval.

---

## Self-Review Notes (already applied)

- Spec coverage: destination-series column + FK (Task 1), reshaped helpers (Task 2), series override in fetch + page simplification (Task 3), admin series picker + badges + search + save diff (Task 4), verification + review (Task 5).
- Type consistency: `CrossListingRow{+sub_category}`, `Placement`, `placementsByFamily`, `diffPlacements`, `crossListedFamiliesFor`, `buildCrossListedCards(seriesByCode)`, `fetchCrossListedCards→CatalogProduct[]` are named/typed identically across Tasks 2–4.
- The shipped `extraSlugsByFamily`/`diffCrossListings` are fully replaced (not left dangling) — Task 2 rewrites the pure section and Task 4 updates the only React consumer; no other importers exist.
- Removed capability (intentional): the old "borrowed series appended at the end + borrowed seriesI18n" is gone; destination series are now native managed subcategories, so their i18n comes from the destination category's own overlay.
