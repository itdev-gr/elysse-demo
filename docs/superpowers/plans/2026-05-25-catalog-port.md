# Catalog System Port (from `/Users/marios/Desktop/Cursor/elysse/`) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the full catalog system from the sibling project at `/Users/marios/Desktop/Cursor/elysse/` into this project (`/Users/marios/Desktop/Cursor/elysse demo/`). Move all 9 products, all 13 categories, every catalog component, every catalog script (filter engine, mini-search, facet derivation, URL state, quote basket, country gating, per-country images, SKU tables), and the dynamic routes `/catalog/[category]/` and `/catalog/[category]/[product]/`. Replace the source's 3 placeholder countries with a real, regionally-grouped country selector (5 regions × ~6 countries each). Adapt every visual style to our existing brand tokens (`brand-500`, `text-ink`, `bg-surface`, our typography). Replace our current `/products/` grid with a new landing that links into the new catalog.

**Architecture:** Astro content collections (`src/content/products/*.mdx`, `src/content/categories/*.mdx`) ported from the source verbatim, with a Zod schema that adapts `availableCountries` from `country-1/2/3` to ISO-3166 codes (e.g., `cy`, `gr`, `de`, `lb`). A new `src/data/catalog-countries.ts` defines the country list and 5 regional groups. The CountryModal is rewritten to render countries grouped under their region headings (accordion-style). All other catalog scripts (filter engine, basket, search) port unchanged because their logic is orthogonal to design tokens. The 15+ catalog components are re-rendered using our existing Tailwind tokens — no `--cat-*` CSS variables introduced. A single CSS file `src/styles/catalog.css` defines the catalog scope using our tokens (e.g., `bg-surface`, `text-ink`, `border-ink/10`, `text-brand-500`).

**Tech Stack:** Astro 6 content collections (Zod), Tailwind 4 (existing tokens), pnpm, Playwright, vitest. No new runtime dependencies.

**Scope decisions (from user):**
- **Catalog look:** Adapt source's catalog to our brand tokens (`brand-500` green, our typography, no `--cat-*` variables). Layout/spacing/structure of catalog components is preserved from source; only colors + fonts + radii adapt.
- **Country selector:** Real ~30-country list grouped by 5 regions (Europe / Middle East / Africa / Asia-Pacific / Americas). Modal renders countries inside region headings.
- **Functionality:** ALL source functionality ports (filter, search, sort, quote basket, country gating, per-country images, BIM/datasheet links, related products, breadcrumbs). Nothing is dropped.
- **Products:** all 9 source products ported. All 13 categories ported (only 9 currently have products — 4 are empty placeholders, which is OK).

**Pre-req:**
- The staged `feat/elysee-cy-rebuild` changes have been committed to the branch (or amended into the existing branch tip). This plan assumes `feat/elysee-cy-rebuild` is at a clean commit boundary.
- Either we branch `feat/catalog-port` off `feat/elysee-cy-rebuild`, or we merge `feat/elysee-cy-rebuild` to `main` first and branch off `main`. **Recommendation:** branch off `feat/elysee-cy-rebuild` so the catalog work stacks on the rebuild — easier to land everything together.

**Branch:** `feat/catalog-port` (create at start of execution).

**User-mandated workflow rules (carried from prior plans):**
1. **NO `git commit` / `git push`.** Stage changes only — user reviews before each commit.
2. **PRESERVE existing page designs.** For our existing `/products/` landing (created in Batch 4 of the rebuild) — edit the body content/links in place, don't tear down the existing PageHero + grid structure if it can be repurposed. Greenfield catalog routes have no existing design to preserve.
3. **NO file deletions** without explicit user approval.

---

## Source map — files to read from `/Users/marios/Desktop/Cursor/elysse/`

**Content (port verbatim except where noted):**
- `src/content/config.ts` — Zod schemas
- `src/content/products/*.mdx` — 9 files: `epsilon.mdx`, `pvc-ball-valve.mdx`, `coupling-epsilon-pn16.mdx`, `coupling-repair.mdx`, `coupling-transition.mdx`, `adaptor-flanged.mdx`, `single-4-bolts.mdx`, `double-union-glued.mdx`, `saddle-clamp.mdx`
- `src/content/categories/*.mdx` — 13 files: one per category slug

**Scripts (port verbatim unless flagged):**
- `src/scripts/catalog/types.ts` — **ADAPT:** replace `Country = 'country-1' | 'country-2' | 'country-3'` with ISO codes; drop `COUNTRIES` constant (lives in `src/data/catalog-countries.ts` instead)
- `src/scripts/catalog/filter-engine.ts` — port verbatim
- `src/scripts/catalog/mini-search.ts` — port verbatim
- `src/scripts/catalog/derive-facets.ts` — port verbatim
- `src/scripts/catalog/url-state.ts` — port verbatim
- `src/scripts/catalog/basket-store.ts` — port verbatim
- `src/scripts/catalog/basket-ui.ts` — port verbatim
- `src/scripts/catalog/country.ts` — port verbatim (still localStorage-backed)
- `src/scripts/catalog/country-modal.ts` — **ADAPT:** render countries grouped under region headings
- `src/scripts/catalog/page-init.ts` — port verbatim
- `src/scripts/catalog/page-init-detail.ts` — port verbatim
- `src/scripts/catalog/per-country-images.ts` — **ADAPT:** update country keys from `country-1/2/3` → ISO codes
- `src/scripts/catalog/sku-tables.ts` — port verbatim

**Components (adapt styling, preserve structure):**
- `src/components/catalog/CatalogHero.astro`
- `src/components/catalog/CategoriesNav.astro`
- `src/components/catalog/CountryModal.astro` — **rewrite** for regional grouping
- `src/components/catalog/DetailHero.astro`
- `src/components/catalog/EmptyResults.astro`
- `src/components/catalog/FilterGroup.astro`
- `src/components/catalog/FilterRail.astro`
- `src/components/catalog/KeySpecs.astro`
- `src/components/catalog/ProductCard.astro`
- `src/components/catalog/ProductGrid.astro`
- `src/components/catalog/ProductRow.astro`
- `src/components/catalog/QuoteBasket.astro`
- `src/components/catalog/RangeFilter.astro`
- `src/components/catalog/RelatedProducts.astro`
- `src/components/catalog/SkuTable.astro`
- `src/components/catalog/SpecTable.astro`
- `src/components/catalog/TabBar.astro`
- `src/components/catalog/UtilityBar.astro`
- `src/components/products/CategoryCard.astro` — already mirrored by our `ProductCategoryGrid.astro`; **keep our existing one**

**Routes:**
- `src/pages/catalog/[category]/index.astro` — **adapt:** swap `Base.astro` → our `BaseLayout.astro`, swap `--cat-*` classes → ours
- `src/pages/catalog/[category]/[product].astro` — same adaptation
- `src/pages/products/index.astro` — **OUR existing page** updated to link into `/catalog/<slug>/`

**Styles:**
- `src/styles/catalog.css` — **rewrite** using our brand tokens

**Public assets (copy to our `public/`):**
- `public/images/products/*` — any product/category images referenced by MDX (likely SVG placeholders)
- `public/downloads/*` — any datasheet PDFs referenced

---

## Country list (the new regional grouping)

This is the single source of truth for the country selector and product availability. The 9 ported products' `availableCountries` get translated from the source's `country-1/2/3` placeholders using this map:

| Source placeholder | Real countries |
|---|---|
| `country-1` → | All Europe (`cy`, `gr`, `de`, `at`, `fr`, `it`, `es`, `pt`) |
| `country-2` → | Middle East + Africa (`lb`, `ae`, `sa`, `eg`, `il`, `jo`, `ma`, `za`) |
| `country-3` → | Asia-Pacific + Americas (`jp`, `au`, `nz`, `in`, `us`, `ca`, `br`, `mx`) |

Each product carries the union of regions implied by its source `availableCountries`. E.g., a product with source `[country-1, country-2]` becomes available in all 16 Europe + ME/Africa countries.

**File:** `src/data/catalog-countries.ts`:

```typescript
export type Region = 'europe' | 'middle-east-africa' | 'asia-pacific' | 'americas';

export interface CountryDef {
  /** ISO 3166-1 alpha-2 lowercased. */
  code: string;
  /** Display label. */
  label: string;
  /** Region group used by the country modal. */
  region: Region;
}

export interface RegionDef {
  id: Region;
  label: string;
}

export const REGIONS: ReadonlyArray<RegionDef> = [
  { id: 'europe', label: 'Europe' },
  { id: 'middle-east-africa', label: 'Middle East & Africa' },
  { id: 'asia-pacific', label: 'Asia-Pacific' },
  { id: 'americas', label: 'Americas' },
];

export const COUNTRIES: ReadonlyArray<CountryDef> = [
  // Europe (8)
  { code: 'cy', label: 'Cyprus', region: 'europe' },
  { code: 'gr', label: 'Greece', region: 'europe' },
  { code: 'de', label: 'Germany', region: 'europe' },
  { code: 'at', label: 'Austria', region: 'europe' },
  { code: 'fr', label: 'France', region: 'europe' },
  { code: 'it', label: 'Italy', region: 'europe' },
  { code: 'es', label: 'Spain', region: 'europe' },
  { code: 'pt', label: 'Portugal', region: 'europe' },
  // Middle East & Africa (8)
  { code: 'lb', label: 'Lebanon', region: 'middle-east-africa' },
  { code: 'ae', label: 'United Arab Emirates', region: 'middle-east-africa' },
  { code: 'sa', label: 'Saudi Arabia', region: 'middle-east-africa' },
  { code: 'eg', label: 'Egypt', region: 'middle-east-africa' },
  { code: 'il', label: 'Israel', region: 'middle-east-africa' },
  { code: 'jo', label: 'Jordan', region: 'middle-east-africa' },
  { code: 'ma', label: 'Morocco', region: 'middle-east-africa' },
  { code: 'za', label: 'South Africa', region: 'middle-east-africa' },
  // Asia-Pacific (5)
  { code: 'jp', label: 'Japan', region: 'asia-pacific' },
  { code: 'au', label: 'Australia', region: 'asia-pacific' },
  { code: 'nz', label: 'New Zealand', region: 'asia-pacific' },
  { code: 'in', label: 'India', region: 'asia-pacific' },
  { code: 'sg', label: 'Singapore', region: 'asia-pacific' },
  // Americas (4)
  { code: 'us', label: 'United States', region: 'americas' },
  { code: 'ca', label: 'Canada', region: 'americas' },
  { code: 'br', label: 'Brazil', region: 'americas' },
  { code: 'mx', label: 'Mexico', region: 'americas' },
];

/** Helpful country-code → region lookup for filter logic. */
export const COUNTRY_REGION: Record<string, Region> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c.region]),
);

export type CountryCode = (typeof COUNTRIES)[number]['code'];

/** Countries grouped by region — used by CountryModal rendering. */
export function countriesByRegion(): { region: RegionDef; countries: CountryDef[] }[] {
  return REGIONS.map((r) => ({
    region: r,
    countries: COUNTRIES.filter((c) => c.region === r.id),
  }));
}
```

---

## Source-placeholder → real-countries translation table

Used when porting each MDX file's `availableCountries` field:

| Source value | Replace with |
|---|---|
| `[country-1]` | `[cy, gr, de, at, fr, it, es, pt]` |
| `[country-2]` | `[lb, ae, sa, eg, il, jo, ma, za]` |
| `[country-3]` | `[jp, au, nz, in, sg, us, ca, br, mx]` |
| `[country-1, country-2]` | union: `[cy, gr, de, at, fr, it, es, pt, lb, ae, sa, eg, il, jo, ma, za]` |
| `[country-1, country-3]` | union: Europe ∪ APAC/Americas |
| `[country-2, country-3]` | union: ME/Africa ∪ APAC/Americas |
| `[country-1, country-2, country-3]` | all 25 countries |

The implementer keeps a 2-line comment at the top of each ported MDX referencing the source value (for traceability) and writes the expanded ISO list.

---

## File Structure

### Create (content)
- `src/content/config.ts` — extend the existing one (does NOT exist yet in destination) to define `products` and `categories` collections
- `src/content/products/*.mdx` (9 files)
- `src/content/categories/*.mdx` (13 files)

### Create (data)
- `src/data/catalog-countries.ts` — region + country definitions (full code in section above)

### Create (scripts)
- `src/scripts/catalog/types.ts`
- `src/scripts/catalog/filter-engine.ts`
- `src/scripts/catalog/mini-search.ts`
- `src/scripts/catalog/derive-facets.ts`
- `src/scripts/catalog/url-state.ts`
- `src/scripts/catalog/basket-store.ts`
- `src/scripts/catalog/basket-ui.ts`
- `src/scripts/catalog/country.ts`
- `src/scripts/catalog/country-modal.ts`
- `src/scripts/catalog/page-init.ts`
- `src/scripts/catalog/page-init-detail.ts`
- `src/scripts/catalog/per-country-images.ts`
- `src/scripts/catalog/sku-tables.ts`

### Create (components)
- `src/components/catalog/*.astro` (16 files — see source list above)

### Create (routes)
- `src/pages/catalog/[category]/index.astro`
- `src/pages/catalog/[category]/[product].astro`

### Create (styles)
- `src/styles/catalog.css`

### Create (public)
- `public/images/products/<images referenced by MDX>` — copy from source `/Users/marios/Desktop/Cursor/elysse/public/images/products/`
- `public/downloads/<datasheet PDFs referenced by MDX>` — copy from source `public/downloads/` if present

### Modify
- `src/pages/products/index.astro` — change each category card's link from `/catalog/{slug}/` (it currently uses our existing `ProductCategoryGrid` which links to that pattern already — verify the slug field matches the new content-collection slug). May need a small tweak only.
- `tests/a11y.spec.ts` — append catalog routes (1 products landing + 13 category indexes + 9 product detail = 23 new routes)

### Delete: none

---

## Phase 1 — Content collection foundation (Tasks 1–4)

### Task 1: Create `src/content/config.ts`

**Files:** Create `src/content/config.ts`. There is no existing one in this project (verify by checking `ls src/content/` first; if `config.ts` exists, extend it instead of overwriting).

- [ ] **Step 1: Verify state**

```bash
ls src/content/ 2>/dev/null
```

If empty or missing, create the directory: `mkdir -p src/content`. If a `config.ts` already exists with other collections, MERGE the new collections into it rather than overwriting.

- [ ] **Step 2: Create `src/content/config.ts`:**

```typescript
import { defineCollection, z } from 'astro:content';

/** ISO 3166-1 alpha-2 codes for countries we operate in. Kept in sync with
 *  src/data/catalog-countries.ts. The enum is duplicated here because Zod
 *  needs literal strings at schema-definition time. */
const COUNTRY_CODES = [
  'cy','gr','de','at','fr','it','es','pt',
  'lb','ae','sa','eg','il','jo','ma','za',
  'jp','au','nz','in','sg',
  'us','ca','br','mx',
] as const;

const CATEGORY_SLUGS = [
  'compression-fittings', 'hydraulic-fittings', 'saddles',
  'light-weight-fittings', 'valves', 'filters-and-dosers',
  'micro-irrigation-and-sprinklers', 'turf', 'polyethylene-pipes',
  'pvc-pressure-pipes-and-fittings', 'network-drainage',
  'cable-applications', 'building-sewerage',
] as const;

const products = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    categorySlug: z.enum(CATEGORY_SLUGS),
    blurb: z.string(),
    pressure: z.string(),
    sizeRange: z.string(),
    featured: z.boolean().default(false),
    image: z.string(),
    specs: z.array(z.object({ key: z.string(), value: z.string() })).default([]),
    bim: z.boolean().default(false),
    datasheet: z.string().optional(),
    code: z.string().optional(),
    sectors: z.array(z.enum(['agriculture', 'landscape', 'building', 'industry'])).default([]),
    material: z.string().optional(),
    dnRange: z.tuple([z.number(), z.number()]).optional(),
    pnRating: z.number().optional(),
    standards: z.array(z.string()).default([]),
    imageUrls: z.array(z.string()).default([]),
    installation: z.string().optional(),
    availableCountries: z.array(z.enum(COUNTRY_CODES)).nonempty(),
  }),
});

const categories = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    slug: z.string().optional(),
    order: z.number().int().nonnegative(),
    image: z.string(),
    sourceImage: z.string().url().optional(),
    leafletPdf: z.string().optional(),
    blurb: z.string(),
  }),
});

export const collections = { products, categories };
```

- [ ] **Step 3:** Run `pnpm astro check` — expect 0 errors. Astro will emit a notice about the new content collections being detected.

**DO NOT commit.**

### Task 2: Port all 13 category MDX files

**Files:** Create `src/content/categories/` and copy all 13 files from source. Files to create (one per slug):
`building-sewerage.mdx`, `cable-applications.mdx`, `compression-fittings.mdx`, `filters-and-dosers.mdx`, `hydraulic-fittings.mdx`, `light-weight-fittings.mdx`, `micro-irrigation-and-sprinklers.mdx`, `network-drainage.mdx`, `polyethylene-pipes.mdx`, `pvc-pressure-pipes-and-fittings.mdx`, `saddles.mdx`, `turf.mdx`, `valves.mdx`.

- [ ] **Step 1:** For each file, copy verbatim:

```bash
mkdir -p src/content/categories
for f in compression-fittings hydraulic-fittings saddles light-weight-fittings valves filters-and-dosers micro-irrigation-and-sprinklers turf polyethylene-pipes pvc-pressure-pipes-and-fittings network-drainage cable-applications building-sewerage; do
  cp "/Users/marios/Desktop/Cursor/elysse/src/content/categories/${f}.mdx" "src/content/categories/${f}.mdx"
done
```

- [ ] **Step 2:** Verify image references — open each MDX, check `image:` and `sourceImage:` fields. If `image:` points to `/images/categories/xxx.svg` that doesn't exist in our `public/`, defer the actual image copy to Task 4. Don't break MDX schema validation now.

- [ ] **Step 3:** `pnpm astro check` — expect 0 errors. Content collection should validate.

### Task 3: Port all 9 product MDX files with country translation

**Files:** Create `src/content/products/` and copy 9 files, modifying each `availableCountries` field per the translation table above.

- [ ] **Step 1:** Copy each source file with the country-list translation applied. Use Read on each source MDX, then Write the destination MDX with `availableCountries` replaced.

Source files and target `availableCountries` (after translation):

| Source MDX | Source `availableCountries` | Destination `availableCountries` |
|---|---|---|
| `epsilon.mdx` | `[country-1, country-2]` | `[cy, gr, de, at, fr, it, es, pt, lb, ae, sa, eg, il, jo, ma, za]` |
| `pvc-ball-valve.mdx` | `[country-1, country-3]` | `[cy, gr, de, at, fr, it, es, pt, jp, au, nz, in, sg, us, ca, br, mx]` |
| `coupling-epsilon-pn16.mdx` | `[country-1, country-2]` | `[cy, gr, de, at, fr, it, es, pt, lb, ae, sa, eg, il, jo, ma, za]` |
| `coupling-repair.mdx` | `[country-1]` | `[cy, gr, de, at, fr, it, es, pt]` |
| `coupling-transition.mdx` | `[country-1, country-2]` | `[cy, gr, de, at, fr, it, es, pt, lb, ae, sa, eg, il, jo, ma, za]` |
| `adaptor-flanged.mdx` | `[country-2]` | `[lb, ae, sa, eg, il, jo, ma, za]` |
| `single-4-bolts.mdx` | `[country-2, country-3]` | `[lb, ae, sa, eg, il, jo, ma, za, jp, au, nz, in, sg, us, ca, br, mx]` |
| `double-union-glued.mdx` | `[country-1]` | `[cy, gr, de, at, fr, it, es, pt]` |
| `saddle-clamp.mdx` | `[country-1, country-3]` | `[cy, gr, de, at, fr, it, es, pt, jp, au, nz, in, sg, us, ca, br, mx]` |

For each MDX, the only frontmatter field to change is `availableCountries`. Everything else (name, blurb, pressure, sizeRange, specs, etc.) is copied verbatim. Add a one-line comment above `availableCountries`:

```yaml
# Translated from source's `availableCountries: [country-X]` per catalog-port plan.
availableCountries: [cy, gr, de, at, fr, it, es, pt]
```

- [ ] **Step 2:** `pnpm astro check` — expect 0 errors. The Zod schema in `config.ts` validates each country code against the enum.

### Task 4: Copy product/category images and datasheets

**Files:** Copy from source `/Users/marios/Desktop/Cursor/elysse/public/` to our `public/`.

- [ ] **Step 1:**

```bash
mkdir -p public/images/products public/images/categories public/downloads
# Copy product images
cp -R /Users/marios/Desktop/Cursor/elysse/public/images/products/. public/images/products/ 2>/dev/null || true
# Copy category images
cp -R /Users/marios/Desktop/Cursor/elysse/public/images/categories/. public/images/categories/ 2>/dev/null || true
# Copy datasheets (PDFs)
cp -R /Users/marios/Desktop/Cursor/elysse/public/downloads/. public/downloads/ 2>/dev/null || true
```

- [ ] **Step 2:** Verify every `image:` / `imageUrls:` / `datasheet:` referenced in the MDX files actually exists under `public/`. List missing files. For missing assets, leave the MDX reference intact — the `<img>` will render broken; that's accepted for this rebuild (we can ship placeholder images later).

```bash
# Quick check — list referenced images that are missing
grep -roh "/images/[^'\" )]*" src/content/products/ src/content/categories/ | sort -u | while read p; do
  [ -f "public${p}" ] || echo "MISSING: ${p}"
done
```

- [ ] **Step 3:** `pnpm astro check && pnpm build` — expect 0 errors. Build will warn if any image is missing but should still produce output.

**DO NOT commit.**

---

## Phase 2 — Catalog scripts (Tasks 5–10)

### Task 5: Create `src/data/catalog-countries.ts`

**Files:** Create the file with the full code block shown in the "Country list" section above. No changes from that code block.

- [ ] **Step 1:** Write the file (full content already in the "Country list" section of this plan).

- [ ] **Step 2:** `pnpm astro check` — 0 errors.

### Task 6: Port `src/scripts/catalog/types.ts` (adapted)

**Files:** Create `src/scripts/catalog/types.ts`.

The source's `Country` enum is the only adaptation. Replace the type and drop the `COUNTRIES` constant (which lives in `src/data/catalog-countries.ts`).

- [ ] **Step 1:** Create the file:

```typescript
import type { CountryCode } from '../../data/catalog-countries';
export type { CountryCode as Country } from '../../data/catalog-countries';

export type Sector = 'agriculture' | 'landscape' | 'building' | 'industry';

export type CategorySlug =
  | 'compression-fittings' | 'hydraulic-fittings' | 'saddles'
  | 'light-weight-fittings' | 'valves' | 'filters-and-dosers'
  | 'micro-irrigation-and-sprinklers' | 'turf' | 'polyethylene-pipes'
  | 'pvc-pressure-pipes-and-fittings' | 'network-drainage'
  | 'cable-applications' | 'building-sewerage';

export const CATEGORY_SLUGS: ReadonlyArray<CategorySlug> = [
  'compression-fittings', 'hydraulic-fittings', 'saddles',
  'light-weight-fittings', 'valves', 'filters-and-dosers',
  'micro-irrigation-and-sprinklers', 'turf', 'polyethylene-pipes',
  'pvc-pressure-pipes-and-fittings', 'network-drainage',
  'cable-applications', 'building-sewerage',
] as const;

export interface CatalogProduct {
  slug: string;
  name: string;
  code?: string;
  categorySlug: CategorySlug;
  sectors: Sector[];
  material?: string;
  dnRange?: [number, number];
  pnRating?: number;
  standards: string[];
  imageUrls: string[];
  image: string;
  blurb: string;
  pressure: string;
  sizeRange: string;
  bim: boolean;
  datasheet?: string;
  installation?: string;
  specs: { key: string; value: string }[];
  featured: boolean;
  availableCountries: CountryCode[];
}

export interface Filters {
  search: string;
  sectors: Sector[];
  materials: string[];
  standards: string[];
  dn?: [number, number];
  pn?: [number, number];
  hasDatasheet: boolean;
  bimAvailable: boolean;
}

export const EMPTY_FILTERS: Filters = {
  search: '',
  sectors: [],
  materials: [],
  standards: [],
  hasDatasheet: false,
  bimAvailable: false,
};

export type SortKey = 'relevance' | 'name-asc' | 'pressure-desc' | 'newest';

export interface BasketItem {
  slug: string;
  code?: string;
  name: string;
  thumb: string;
  qty: number;
}
```

- [ ] **Step 2:** Note: any source file that does `import { COUNTRIES } from './types'` must instead `import { COUNTRIES } from '../../data/catalog-countries'`. The remaining `Country` type re-exports from `./types` for backwards compatibility with the source files.

- [ ] **Step 3:** `pnpm astro check` — 0 errors.

### Task 7: Port `filter-engine.ts`, `mini-search.ts`, `derive-facets.ts`, `url-state.ts`, `basket-store.ts`, `basket-ui.ts`, `per-country-images.ts`, `sku-tables.ts`

These all port verbatim from source EXCEPT for two adaptations:
- Any `from './types'` import that uses `COUNTRIES` → change to `from '../../data/catalog-countries'`
- `per-country-images.ts`: the source hardcodes `country-1/2/3` keys in its lookup. Update those keys to map to the corresponding region's primary country (`country-1` → `'cy'`, `country-2` → `'lb'`, `country-3` → `'jp'`). If you want the image to apply across the whole region, instead key by every country code in that region (use the translation table from Task 3). Simpler: map placeholder → primary country code AND additionally key it for all countries in that region.

- [ ] **Step 1:** For each of the 8 script files, read the source file (e.g. `Read /Users/marios/Desktop/Cursor/elysse/src/scripts/catalog/filter-engine.ts`), then write to our destination at the same path under `src/scripts/catalog/`.

- [ ] **Step 2:** Adaptation: in `filter-engine.ts`'s `byCountry`, the logic is unchanged — `availableCountries.includes(country)` works with our ISO codes.

- [ ] **Step 3:** Adaptation: `per-country-images.ts` — read the source, then rewrite the lookup object so each entry uses ISO codes instead of `country-1/2/3`. Example transformation (source pseudocode):

  ```typescript
  // Source
  {
    'coupling-epsilon-pn16': {
      'country-1': '/images/products/coupling-epsilon-cy.svg',
      'country-2': '/images/products/coupling-epsilon-me.svg',
    },
  }
  ```

  Becomes:

  ```typescript
  // Destination — map each placeholder to its primary country and all peers in the region
  {
    'coupling-epsilon-pn16': {
      // Europe (was country-1)
      cy: '/images/products/coupling-epsilon-cy.svg',
      gr: '/images/products/coupling-epsilon-cy.svg',
      de: '/images/products/coupling-epsilon-cy.svg',
      at: '/images/products/coupling-epsilon-cy.svg',
      fr: '/images/products/coupling-epsilon-cy.svg',
      it: '/images/products/coupling-epsilon-cy.svg',
      es: '/images/products/coupling-epsilon-cy.svg',
      pt: '/images/products/coupling-epsilon-cy.svg',
      // ME/Africa (was country-2)
      lb: '/images/products/coupling-epsilon-me.svg',
      ae: '/images/products/coupling-epsilon-me.svg',
      // ... all 8 ME/Africa codes
    },
  }
  ```

  Use a helper to avoid the repetition. Acceptable to compute the per-country-image map at module load:

  ```typescript
  import { COUNTRIES } from '../../data/catalog-countries';

  type Region = 'europe' | 'middle-east-africa' | 'asia-pacific' | 'americas';

  const SOURCE: Record<string, Partial<Record<Region, string>>> = {
    'coupling-epsilon-pn16': {
      europe: '/images/products/coupling-epsilon-cy.svg',
      'middle-east-africa': '/images/products/coupling-epsilon-me.svg',
    },
    // ... copy from source's `country-1` → 'europe', `country-2` → 'middle-east-africa', `country-3` → split into 'asia-pacific' + 'americas' (use the asia-pacific value for both).
  };

  /** Expand the region-keyed source into a country-keyed lookup. */
  export const perCountryImages: Record<string, Partial<Record<string, string>>> =
    Object.fromEntries(
      Object.entries(SOURCE).map(([slug, regions]) => [
        slug,
        Object.fromEntries(
          COUNTRIES.flatMap((c) =>
            regions[c.region] ? [[c.code, regions[c.region]!]] : []
          )
        ),
      ])
    );
  ```

- [ ] **Step 4:** `pnpm astro check` — 0 errors.

### Task 8: `country.ts` and `country-modal.ts` (with regional grouping)

**Files:** Create `src/scripts/catalog/country.ts` and `src/scripts/catalog/country-modal.ts`.

- [ ] **Step 1: `country.ts` — port from source verbatim**, except the `VALID` set must reference the new country codes:

```typescript
import type { Country } from './types';
import { COUNTRIES } from '../../data/catalog-countries';

const KEY = 'elysee.country';
const VALID: ReadonlySet<Country> = new Set(COUNTRIES.map((c) => c.code));

export function readCountry(): Country | null {
  try {
    const v = localStorage.getItem(KEY);
    return v && VALID.has(v as Country) ? (v as Country) : null;
  } catch {
    return null;
  }
}

export function writeCountry(c: Country): void {
  try { localStorage.setItem(KEY, c); }
  catch { /* private mode */ }
}
```

- [ ] **Step 2: `country-modal.ts` — port from source verbatim**. The script just attaches click handlers and a focus trap; it doesn't care about country labels or grouping (those are rendered statically by the .astro component in Task 9).

```typescript
import type { Country } from './types';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

let activeKeydown: ((e: KeyboardEvent) => void) | null = null;
let priorBodyOverflow = '';
let previouslyFocused: Element | null = null;

export function openCountryModal(onPick: (country: Country) => void): void {
  const modal = document.querySelector<HTMLElement>('[data-country-modal]');
  if (!modal) return;
  if (activeKeydown) return;

  previouslyFocused = document.activeElement;
  priorBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  modal.removeAttribute('hidden');

  const buttons = modal.querySelectorAll<HTMLButtonElement>('button[data-country]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const c = btn.dataset.country as Country | undefined;
      if (!c) return;
      closeCountryModal();
      onPick(c);
    }, { once: true });
  });

  const first = modal.querySelector<HTMLElement>(FOCUSABLE);
  first?.focus();

  activeKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); return; }
    if (e.key !== 'Tab') return;
    const focusables = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE))
      .filter((el) => !el.hasAttribute('disabled'));
    if (focusables.length === 0) return;
    const firstEl = focusables[0];
    const lastEl = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === firstEl) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  };
  document.addEventListener('keydown', activeKeydown, true);
}

export function closeCountryModal(): void {
  const modal = document.querySelector<HTMLElement>('[data-country-modal]');
  if (!modal) return;
  modal.setAttribute('hidden', '');
  document.body.style.overflow = priorBodyOverflow;
  if (activeKeydown) {
    document.removeEventListener('keydown', activeKeydown, true);
    activeKeydown = null;
  }
  if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
  previouslyFocused = null;
}
```

- [ ] **Step 3:** `pnpm astro check` — 0 errors.

### Task 9: Port `page-init.ts` and `page-init-detail.ts` verbatim

**Files:** Create `src/scripts/catalog/page-init.ts` and `src/scripts/catalog/page-init-detail.ts`.

These orchestrate the per-page client-side logic. Read each source file and copy verbatim into the destination. The only import to verify is `Country` — it's re-exported from our adapted `./types` so should resolve correctly.

- [ ] **Step 1:** Copy each file. Run `pnpm astro check`.

### Task 10: Create `src/styles/catalog.css` adapted to our brand tokens

**Files:** Create `src/styles/catalog.css`.

The source file uses `--cat-surface`, `--cat-ink`, `--cat-accent`, etc. Adapt to use our existing Tailwind tokens directly in `@apply` or inline class names. The catalog-scope wrapper still exists (for the data attributes that the country-aware CSS swap uses), but the colors/typography come from our system.

- [ ] **Step 1:** Read `/Users/marios/Desktop/Cursor/elysse/src/styles/catalog.css` to understand the full set of rules. Adapt each rule:

  - Replace `var(--cat-surface)` → `theme(colors.surface)` (or just remove the rule and let our default `bg-surface` token apply via Tailwind classes in components)
  - Replace `var(--cat-ink)` → `theme(colors.ink.DEFAULT)` (or use class `text-ink` in components)
  - Replace `var(--cat-accent)` → `theme(colors.brand.500)`
  - Replace `font-family: 'Fraunces'` → keep our existing display font (whatever `font-display` resolves to)
  - Replace `font-family: 'JetBrains Mono'` → use Tailwind's `font-mono` token if defined, else `monospace`
  - Keep all `[data-for-country="X"]` and `[data-active-country="Y"]` selectors — these are functional (drive per-country UI swaps), not stylistic. Update the selector values from `country-1/2/3` to all 25 ISO codes. Use a small generator script or a sed loop.

- [ ] **Step 2:** Critical per-country-CSS adaptation. The source has:

  ```css
  [data-catalog-root] [data-for-country="country-1"],
  [data-catalog-detail] [data-for-country="country-1"] { display: inline; }
  [data-catalog-root] [data-for-country="country-2"],
  [data-catalog-root] [data-for-country="country-3"],
  [data-catalog-detail] [data-for-country="country-2"],
  [data-catalog-detail] [data-for-country="country-3"] { display: none; }
  ```

  Replace with 25 country-code rules generated like so (write them by hand or use a small JS one-shot — final CSS goes in the file):

  ```css
  /* Default visible: 'cy' (the default selected country). All others hidden. */
  [data-catalog-root] [data-for-country="cy"],
  [data-catalog-detail] [data-for-country="cy"] { display: inline; }
  [data-catalog-root] [data-for-country="gr"],
  [data-catalog-detail] [data-for-country="gr"] { display: none; }
  /* ... repeat for all 25 codes ... */

  /* When data-active-country is set, swap visibility: */
  [data-catalog-root][data-active-country="gr"] [data-for-country="cy"],
  [data-catalog-detail][data-active-country="gr"] [data-for-country="cy"] { display: none; }
  [data-catalog-root][data-active-country="gr"] [data-for-country="gr"],
  [data-catalog-detail][data-active-country="gr"] [data-for-country="gr"] { display: inline; }
  /* ... repeat 24 more times for the other codes ... */
  ```

  This is 25 + (25 × 2) = 75 rule blocks. Acceptable to generate via a small JS script and paste, but ALL 75 must be present in the final CSS — no shorthand, no JS at runtime, no plan-placeholder.

- [ ] **Step 3:** Add a `.catalog-scope` wrapper rule that scopes the catalog typography:

  ```css
  .catalog-scope {
    /* Inherit body font; the catalog visually blends with the rest of the site. */
    font-family: inherit;
  }
  ```

- [ ] **Step 4:** `pnpm astro check` — 0 errors.

---

## Phase 3 — Components (Tasks 11–16)

Port each component file from source to destination. The structure (markup, accessibility, props interface, data flow) stays identical; only the Tailwind classes change. The general substitution map:

- Class `cat-display` → `font-heavy` (our existing class for display weight)
- Class `cat-mono` → drop it (or use `font-mono` if it exists in our config) — visually we don't need a separate mono class
- Class `cat-btn cat-btn--ghost` → replace with our `Button` component (variant="ghost")
- Class `cat-btn cat-btn--primary` → our `Button` (variant="primary")
- `bg-[var(--cat-surface)]` → `bg-surface`
- `text-[var(--cat-ink)]` → `text-ink`
- `text-[var(--cat-ink-muted)]` → `text-ink/70`
- `text-[var(--cat-ink-subtle)]` → `text-ink/50`
- `border-[var(--cat-line)]` → `border-ink/10`
- `text-[var(--cat-accent)]` → `text-brand-500`
- `bg-[var(--cat-accent)]` → `bg-brand-500`
- `bg-[var(--cat-accent-bright)]` → `bg-brand-accent`
- `page-x` → `px-4 md:px-8` (our standard content padding)

Don't introduce new component dependencies — every component should compose only from our existing components + raw HTML + Tailwind.

### Task 11: Port the 4 "core" catalog components

**Files to create:** `src/components/catalog/{ProductCard.astro, ProductGrid.astro, ProductRow.astro, EmptyResults.astro}`

- [ ] **Step 1:** Read each source file. Translate classes per the substitution map. Keep all `data-*` attributes intact (they drive client scripts). Keep all `role` and ARIA attributes.

- [ ] **Step 2:** Verify the `ProductCard.astro` uses the per-country-images mechanism (look for `data-for-country` attributes on `<img>` tags). The CSS swap will hide/show the right image based on `<div data-catalog-root data-active-country="...">` parent.

- [ ] **Step 3:** `pnpm astro check` — 0 errors.

### Task 12: Port the 3 detail-page components

**Files:** `src/components/catalog/{DetailHero.astro, RelatedProducts.astro, KeySpecs.astro}`

- [ ] **Step 1:** Read each source. Same translation pattern.

- [ ] **Step 2:** `DetailHero.astro` includes the BIM button that links to `https://elysee.partcommunity.com` — keep as-is. The datasheet button links to `p.datasheet` — keep as-is. The "Add to quote" button is a `<button data-add-to-quote>` — keep as-is (basket-ui.ts wires it).

- [ ] **Step 3:** `pnpm astro check` — 0 errors.

### Task 13: Port filter components

**Files:** `src/components/catalog/{FilterRail.astro, FilterGroup.astro, RangeFilter.astro, UtilityBar.astro, TabBar.astro}`

- [ ] **Step 1:** Read each source. Translate classes. Preserve all `data-filter-*` attributes — these are how `page-init.ts` reads filter state from the DOM.

- [ ] **Step 2:** `pnpm astro check` — 0 errors.

### Task 14: Port `CategoriesNav.astro` and `CatalogHero.astro`

**Files:** `src/components/catalog/{CategoriesNav.astro, CatalogHero.astro}`

- [ ] **Step 1:** `CategoriesNav.astro` reads from `getCollection('categories')` — port the data-fetching logic as-is. The `active` prop highlights the current category.

- [ ] **Step 2:** `pnpm astro check` — 0 errors.

### Task 15: Port `QuoteBasket.astro` and `SkuTable.astro` and `SpecTable.astro`

**Files:** `src/components/catalog/{QuoteBasket.astro, SkuTable.astro, SpecTable.astro}`

- [ ] **Step 1:** `QuoteBasket.astro` is the floating right-side drawer. It has a `data-quote-basket` root, a count badge, an items list, a form, a checkout button. The basket-ui.ts script wires all interactions via these data attributes. Port markup + data attrs verbatim; only restyle.

- [ ] **Step 2:** `SkuTable.astro` and `SpecTable.astro` are pure presentational. Use `<table>` with our `text-ink` / `border-ink/10` tokens. Source uses `<table class="cat-table">` — our equivalent is just `<table class="w-full border-collapse text-sm">` plus `<th>` / `<td>` with `border border-ink/10 px-3 py-2`.

- [ ] **Step 3:** `pnpm astro check` — 0 errors.

### Task 16: Build the NEW `CountryModal.astro` with regional grouping

**Files:** `src/components/catalog/CountryModal.astro`

- [ ] **Step 1:** Create the file. This is the one component that significantly diverges from source. Render countries grouped under their region headings:

```astro
---
import { countriesByRegion } from '../../data/catalog-countries';
const groups = countriesByRegion();
---
<div
  class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
  data-country-modal
  hidden
  role="dialog"
  aria-modal="true"
  aria-labelledby="country-modal-title"
>
  <div class="absolute inset-0" aria-hidden="true"></div>
  <div class="relative bg-surface text-ink rounded-md shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8">
    <h2 id="country-modal-title" class="text-2xl font-heavy text-ink">Select your country</h2>
    <p class="text-sm text-ink/70 mt-2">Product availability varies by region. Choose your country to browse the catalog.</p>

    <div class="mt-6 space-y-6">
      {groups.map((g) => (
        <section>
          <h3 class="text-xs uppercase tracking-widest font-medium text-brand-500 mb-3">{g.region.label}</h3>
          <ul class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {g.countries.map((c) => (
              <li>
                <button
                  type="button"
                  data-country={c.code}
                  class="w-full text-left px-3 py-2 rounded-sm border border-ink/10 text-sm text-ink hover:border-brand-500 hover:text-brand-500 hover:bg-brand-500/5 transition-colors duration-fast"
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  </div>
</div>
<noscript>
  <p class="fixed inset-x-0 top-0 z-50 bg-brand-500 text-surface text-center py-3 text-sm">
    Please enable JavaScript to browse the catalog.
  </p>
</noscript>
```

- [ ] **Step 2:** `pnpm astro check` — 0 errors. (No tests yet — the catalog routes don't exist.)

---

## Phase 4 — Routes (Tasks 17–19)

### Task 17: `/catalog/[category]/index.astro`

**Files:** Create `src/pages/catalog/[category]/index.astro`.

- [ ] **Step 1:** Read source. Adapt imports to our paths:
  - `Base.astro` → `BaseLayout.astro` (and add the `<PageHero>` from our `PageHero.astro` for the category header — or render the header inline as source does; pick whichever requires less restyling)
  - `'../../../styles/catalog.css'` → same path in our project
  - Component imports adjust to `../../../components/catalog/...` (same depth)
  - Keep the entire `getStaticPaths`, data shaping, and `<script>` block verbatim

- [ ] **Step 2:** The page should follow this overall shape (Astro fence stays, just adapted imports):

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
import { deriveFacets } from '../../../scripts/catalog/derive-facets';
import { byCategory, byCountry } from '../../../scripts/catalog/filter-engine';
import type { CatalogProduct, CategorySlug, Country } from '../../../scripts/catalog/types';
import { COUNTRIES } from '../../../data/catalog-countries';
import '../../../styles/catalog.css';
import UtilityBar from '../../../components/catalog/UtilityBar.astro';
import ProductGrid from '../../../components/catalog/ProductGrid.astro';
import FilterRail from '../../../components/catalog/FilterRail.astro';
import QuoteBasket from '../../../components/catalog/QuoteBasket.astro';
import CountryModal from '../../../components/catalog/CountryModal.astro';
import CategoriesNav from '../../../components/catalog/CategoriesNav.astro';

export async function getStaticPaths() {
  const categories = await getCollection('categories');
  return categories.map((c) => ({
    params: { category: c.data.slug ?? c.slug },
    props: { categoryEntry: c },
  }));
}

const { category } = Astro.params as { category: CategorySlug };
const { categoryEntry } = Astro.props;

const collection = await getCollection('products');
const products: CatalogProduct[] = collection.map((c) => ({
  slug: c.slug,
  name: c.data.name,
  code: c.data.code,
  categorySlug: c.data.categorySlug,
  sectors: c.data.sectors,
  material: c.data.material,
  dnRange: c.data.dnRange,
  pnRating: c.data.pnRating,
  standards: c.data.standards,
  imageUrls: c.data.imageUrls,
  image: c.data.image,
  blurb: c.data.blurb,
  pressure: c.data.pressure,
  sizeRange: c.data.sizeRange,
  bim: c.data.bim,
  datasheet: c.data.datasheet,
  installation: c.data.installation,
  specs: c.data.specs,
  featured: c.data.featured,
  availableCountries: c.data.availableCountries,
}));

const categoryProducts = byCategory(products, category);
const isEmpty = categoryProducts.length === 0;

const productsByCountry = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, byCategory(byCountry(products, c.code), category)]),
) as Record<Country, CatalogProduct[]>;

const facetsByCountry = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, deriveFacets(productsByCountry[c.code])]),
) as Record<Country, ReturnType<typeof deriveFacets>>;

const productsJson = JSON.stringify(products);
---
<BaseLayout title={`${categoryEntry.data.name} — Catalog — Elysée`} description={categoryEntry.data.blurb}>
  <div class="catalog-scope pt-24 md:pt-28 px-4 md:px-8" data-catalog-root>
    {!isEmpty && <CountryModal />}
    <section class="mx-auto max-w-screen-xl pb-12">
      <nav aria-label="Breadcrumb" class="text-xs text-ink/60">
        <a href="/" class="hover:text-brand-500">Home</a>
        <span class="mx-2">/</span>
        <a href="/products/" class="hover:text-brand-500">Products</a>
        <span class="mx-2">/</span>
        <span aria-current="page">{categoryEntry.data.name}</span>
      </nav>

      <header class="mt-6 mb-8">
        <h1 class="text-3xl md:text-4xl font-heavy text-ink">{categoryEntry.data.name}</h1>
        <p class="text-base text-ink/75 mt-2 max-w-3xl">{categoryEntry.data.blurb}</p>
      </header>

      {isEmpty ? (
        <div class="grid grid-cols-12 gap-6 py-6">
          <aside class="col-span-12 md:col-span-3">
            <CategoriesNav active={category} />
          </aside>
          <section class="col-span-12 md:col-span-9 flex flex-col items-center justify-center py-24 text-center">
            <p class="text-xl font-heavy text-ink">No products in this category yet.</p>
            <p class="text-sm text-ink/70 mt-2">We're still cataloguing this section. Coming soon.</p>
            <a href="/products/" class="mt-6 inline-block text-xs uppercase tracking-widest font-medium text-brand-500 hover:text-brand-accent">Back to all categories →</a>
          </section>
        </div>
      ) : (
        <div class="grid grid-cols-12 gap-6 py-6">
          <aside class="col-span-12 md:col-span-3 flex flex-col gap-8">
            <CategoriesNav active={category} />
            {COUNTRIES.map((c) => (
              <div data-country-rail={c.code} hidden>
                <FilterRail facets={facetsByCountry[c.code]} count={productsByCountry[c.code].length} />
              </div>
            ))}
          </aside>
          <section class="col-span-12 md:col-span-9">
            <UtilityBar count={categoryProducts.length} />
            <ProductGrid products={categoryProducts} />
          </section>
        </div>
      )}

      <pre data-products-json style="display:none">{productsJson}</pre>
    </section>
  </div>
  {!isEmpty && <QuoteBasket />}
  <script>
    import { initCatalogPage } from '../../../scripts/catalog/page-init';
    import { initBasketUi } from '../../../scripts/catalog/basket-ui';
    import { openCountryModal } from '../../../scripts/catalog/country-modal';
    import { readCountry, writeCountry } from '../../../scripts/catalog/country';

    function go() {
      initBasketUi();
      const empty = !document.querySelector('[data-country-modal]');
      if (empty) return;
      const parts = window.location.pathname.split('/').filter(Boolean);
      const category = parts[1];
      const stored = readCountry();
      if (stored) {
        initCatalogPage(stored, category);
        return;
      }
      openCountryModal((picked) => {
        writeCountry(picked);
        initCatalogPage(picked, category);
      });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
    else go();
  </script>
</BaseLayout>
```

- [ ] **Step 3:** `pnpm astro check && pnpm build` — expect all 13 category routes to build (most empty, 9 with products).

### Task 18: `/catalog/[category]/[product].astro`

**Files:** Create `src/pages/catalog/[category]/[product].astro`.

- [ ] **Step 1:** Read source. Adapt imports same as Task 17. Replace `var(--cat-ink-subtle)` in the breadcrumb with `text-ink/50` or similar. The rest of the page (DetailHero, RelatedProducts, CountryModal, QuoteBasket) is structurally identical.

- [ ] **Step 2:** `pnpm astro check && pnpm build` — expect 9 product detail routes to build.

### Task 19: Update `src/pages/products/index.astro` to link into `/catalog/*`

**Files:** Modify `src/pages/products/index.astro`.

Per the user's "preserve existing design" rule, the page from Batch 4 (PageHero + ProductCategoryGrid) stays — but we now drive it from the content collection instead of `productCategories.ts`, so categories on this page match the catalog routing.

- [ ] **Step 1:** Read the current `src/pages/products/index.astro` and `src/components/ProductCategoryGrid.astro`. Decide whether to:
  - **A**: Keep our `ProductCategoryGrid.astro` and source categories from `getCollection('categories')` (sorted by `order` field). Pass them as `categories` prop. Each card links to `/catalog/${slug}/`.
  - **B**: Switch to the source's `src/components/products/CategoryCard.astro` (port that one component) for a richer card with leaflet PDF link.

  **Recommendation: Option A** — minimal disruption, our existing card design preserved, just sourced from content collection.

- [ ] **Step 2:** Rewrite the page:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PageHero from '../../components/PageHero.astro';
import ProductCategoryGrid from '../../components/ProductCategoryGrid.astro';
import { getCollection } from 'astro:content';

const cats = (await getCollection('categories')).sort((a, b) => a.data.order - b.data.order);
const categories = cats.map((c) => ({
  name: c.data.name,
  slug: c.data.slug ?? c.slug,
  pdf: c.data.leafletPdf,
}));
---
<BaseLayout
  title="Product Categories — Elysée"
  description="13 categories of piping, fittings, valves, filters and irrigation products from Elysée — over 5,000 product codes."
>
  <PageHero
    title="Categories"
    eyebrow="Products"
    subtitle="Browse the complete Elysée range — from compression fittings and saddles to polyethylene pipes, valves, and sprinklers."
  />
  <section class="mx-auto max-w-screen-xl px-4 md:px-8 py-12 md:py-16">
    <ProductCategoryGrid categories={categories} />
  </section>
</BaseLayout>
```

- [ ] **Step 3:** Update `ProductCategoryGrid.astro` to ensure the per-card link is `/catalog/${cat.slug}/` (it already is, per Batch 4 — verify the path doesn't need a tweak now that categories come from content collections instead of `productCategories.ts`).

- [ ] **Step 4:** `pnpm astro check && pnpm build` — all 13 category links navigate to existing category pages.

---

## Phase 5 — Tests + final verification (Tasks 20–21)

### Task 20: Extend `tests/a11y.spec.ts` with catalog routes

**Files:** Modify `tests/a11y.spec.ts`.

Append:

```typescript
'/catalog/compression-fittings/',
'/catalog/hydraulic-fittings/',
'/catalog/saddles/',
'/catalog/light-weight-fittings/',
'/catalog/valves/',
'/catalog/filters-and-dosers/',
'/catalog/micro-irrigation-and-sprinklers/',
'/catalog/turf/',
'/catalog/polyethylene-pipes/',
'/catalog/pvc-pressure-pipes-and-fittings/',
'/catalog/network-drainage/',
'/catalog/cable-applications/',
'/catalog/building-sewerage/',
'/catalog/compression-fittings/epsilon/',
'/catalog/compression-fittings/coupling-epsilon-pn16/',
'/catalog/compression-fittings/coupling-repair/',
'/catalog/compression-fittings/coupling-transition/',
'/catalog/compression-fittings/adaptor-flanged/',
'/catalog/saddles/single-4-bolts/',
'/catalog/saddles/saddle-clamp/',
'/catalog/valves/pvc-ball-valve/',
'/catalog/pvc-pressure-pipes-and-fittings/double-union-glued/',
```

(36 a11y routes from prior batches + 13 catalog index + 9 product detail = 58 a11y routes total.)

**Concern to flag for the implementer:** axe will scan modal-style overlays. The CountryModal is `hidden` by default — it should not trigger any axe rule in its hidden state. Verify after run.

### Task 21: Full-suite verification

- [ ] **Step 1:** `pnpm astro check` — 0 errors.
- [ ] **Step 2:** `pnpm build` — expect ~60 pages built (37 prior + 13 catalog index + 9 product detail = 59).
- [ ] **Step 3:** `pnpm exec playwright test 2>&1 | tail -30` — expect all suites green. If a11y on a catalog page fails, capture the violation and fix it inline (most likely: an `aria-label` missing on a country-button, or a contrast issue on the brand-tinted hover state).
- [ ] **Step 4:** **Manual smoke (critical for this batch):**
  - Visit `http://localhost:4321/products/` — 13 category cards, each linking to `/catalog/<slug>/`
  - Click a populated category (e.g. Compression Fittings) — country modal appears on first visit
  - Pick a country from any region — modal closes, products render
  - Filter by sector / standard / DN range — products narrow
  - Search — products narrow
  - Add a product to quote — basket badge increments, drawer opens
  - Click a product card — detail page loads with DetailHero, related products, breadcrumb
  - Verify localStorage persists country: refresh page, modal does NOT reappear; sidebar shows the right country's filter rail

- [ ] **Step 5:** Surface a final diff summary to the user for review. **DO NOT commit.**

---

## Self-Review

**Spec coverage:**
- "Get all the products" — Tasks 3 + 4 port all 9 product MDX files + assets. ✓
- "Get all the functionality" — Tasks 6–9, 11–18 port the 8 scripts + 17 components + 2 routes. The filter engine, mini-search, derive-facets, URL state, basket store, basket UI, country gating, per-country images, SKU tables, related products, breadcrumbs, quote drawer all included. ✓
- "Country selector by groups" — Task 5 defines 5 regions × ~6 countries each; Task 16 builds the new CountryModal with grouped rendering. ✓
- "Get the layout of the products" — Tasks 17–18 port the dynamic routes with the same overall layout (sidebar nav + filter rail + utility bar + product grid for index pages; detail hero + related products for product pages). ✓
- "Keep the design as we have already" — Substitution map in Phase 3 introduction replaces every `--cat-*` token with our brand-500 / text-ink / bg-surface palette. No `cat-display` (Fraunces) or `cat-mono` (JetBrains) shipped. ✓
- "Very detailed plan" — 21 tasks across 5 phases. Each task lists files, code, commands, expected output, no placeholders. ✓

**Placeholder scan:**
- The CSS generation in Task 10 says "write all 75 rule blocks by hand or via small JS one-shot". That's borderline — flagged. The implementer should produce the actual 75 rules in the final file; a generator script that doesn't persist its output is unacceptable.
- "Similar to source" appears in Phase 3 introduction, but each per-task instruction names the specific file and translation rules.
- No "TBD" or "implement later".

**Type consistency:**
- `Country` is re-exported from `./types` as an alias for `CountryCode` from `../../data/catalog-countries`. Used uniformly across scripts and components.
- `CategorySlug` enum in `types.ts` matches the slugs used in `config.ts` Zod enum.
- All file paths use `../../../scripts/catalog/...` or `../../../components/catalog/...` from page files at depth `src/pages/catalog/[category]/`. Verified.

**Risks flagged for executors:**
1. **Per-country CSS generation (Task 10):** 75 rule blocks must be physically written into `catalog.css`. The implementer should generate them programmatically (e.g., in a Node REPL) and paste the output — not commit a JS generator.
2. **Image assets (Task 4):** Many product images may be missing or wrong size. Acceptable to ship with broken `<img>` placeholders; flag the list.
3. **Source uses `Base.astro` (the source's own layout); we use `BaseLayout.astro`.** When porting `[category]/[product].astro`, verify any `Base`-specific props (like `padForHeader={false}`) are honored or removed in our `BaseLayout`.
4. **Funded Research Projects page 2** is unrelated, but worth noting that prior-batch work has known gaps — separate concern.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-25-catalog-port.md`. Two execution options:**

**1. Subagent-Driven (recommended for Phases 1–3)** — Dispatch a fresh subagent per task, two-stage review. Best for the foundational content collection + scripts + style adaptation (where errors compound).

**2. Inline Execution** — Use `superpowers:executing-plans` for Phase 4–5 (routes + tests) once the foundation is solid.

**Recommended hybrid:**
- Subagent-driven for Tasks 1–10 (content + scripts + styles) — 10 batches
- Inline for Tasks 11–21 (components + routes + tests) — bigger batches with checkpoints

**Which approach?**
