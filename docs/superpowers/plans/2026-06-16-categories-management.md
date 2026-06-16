# Categories & Sub-categories Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the admin a "Categories" page where the 13 product categories and their sub-categories (series) can be created, edited, renamed, reordered, hidden, and deleted — all stored in Supabase and reflected across the catalog and navigation.

**Architecture:** Today categories live in an Astro markdown content collection (`src/content/categories/*.md`) and sub-categories are derived ad-hoc from `products.sub_category`. This plan moves categories into a Supabase table `product_categories` (single source of truth, replacing the markdown collection) and adds an overlay table `product_subcategories` that controls each series' display order and visibility. A new build-time helper `src/lib/categories.ts` reads both tables; the 6 existing `getCollection('categories')` consumers switch to it. A new admin `CategoriesTab` performs CRUD on both tables and calls `triggerPublish()` so the static site rebuilds.

**Tech Stack:** Astro 6 (static SSG, build-time Supabase fetch via the anon client), React islands for admin, Supabase Postgres + RLS, Tailwind v4, TypeScript.

---

## Decisions baked into this plan (tell me to change any before execution)

1. **Categories move fully to Supabase.** The markdown collection `src/content/categories/` and its `categories` entry in `src/content/config.ts` are deleted — Supabase becomes the only source. (Category *images* in `public/images/products/categories/*.png` stay; only the markdown metadata moves.)
2. **Hiding a category (`is_active = false`) removes it everywhere on the next rebuild** — the Products mega-nav, the `/products/` grid, and its `/catalog/<slug>` route are all rebuilt without it. Re-showing brings it back.
3. **Renaming a sub-category propagates to products.** Because a series *is* the `products.sub_category` text value, renaming "Epsilon Series" → "Epsilon" runs `UPDATE products SET sub_category = … WHERE sub_category = … AND category_name = …` so the catalog grouping stays consistent. Renaming a category's *display name* does **not** touch products (the Excel link is a separate `product_category_name` field).
4. **Delete is guarded.** A category or sub-category can be hard-deleted only when no products reference it; otherwise the UI offers Hide instead. This prevents orphaned products that belong to no visible group.
5. **Like everything else on this SSG site, changes go live only after a rebuild** (the Publish panel / deploy hook). The admin calls `triggerPublish()` after writes.

## Codebase reality notes (read before starting)

- **No unit-test framework exists in this repo.** "Verify" steps below use the project's real verification path: `npx tsc --noEmit` (types), `npm run build` (the static build, which also catches any stray `getCollection('categories')`), and a headless-Chrome runtime check. Do not add a test runner.
- **Build-time Supabase fetch already works.** `src/pages/catalog/[category]/index.astro` already calls Supabase from `getStaticPaths` via `src/lib/products.ts`, which uses the `supabase` anon client from `src/lib/supabase.ts`. The new `src/lib/categories.ts` uses the same client the same way. Categories must therefore be **publicly readable** (RLS `select to anon`), exactly like `products`.
- **Migrations in this project are applied through the Supabase Management API** (the `database/query` endpoint), not `supabase db push`. The apply step uses `curl` with a `User-Agent: curl/8.7.1` header (Cloudflare blocks default agents with error 1010). Provide the token via an env var — never hardcode it.
- **`ProductForm` sub-category field is now a dropdown of existing values**, so new sub-categories can only enter the system through a bulk Excel import. The migration seeds the overlay for every existing pair; Task 4 adds a "Rescan from products" action to pick up any post-import drift.

## File structure

| File | Responsibility | Action |
|---|---|---|
| `supabase/migrations/0019_product_categories.sql` | `product_categories` + `product_subcategories` tables, RLS, triggers, seed | Create |
| `src/lib/categories.ts` | Build-time/client read helpers + `ProductCategory` / `ProductSubcategory` types + `applySubcategoryOverlay()` | Create |
| `src/components/PrimaryNav.astro` | Desktop Products mega-nav | Modify (swap source) |
| `src/components/MobileNav.astro` | Mobile Products accordion | Modify (swap source) |
| `src/components/catalog/CategoriesNav.astro` | Catalog left sidebar | Modify (swap source) |
| `src/pages/products/index.astro` | `/products/` category grid | Modify (swap source) |
| `src/pages/catalog/[category]/index.astro` | Category catalog page + series overlay | Modify (swap source, apply overlay) |
| `src/pages/catalog/[category]/[product].astro` | Config detail `getStaticPaths` | Modify (swap source) |
| `src/content/config.ts` | Content collections | Modify (remove `categories` collection) |
| `src/content/categories/*.md` | Old markdown categories | Delete |
| `src/components/admin/CategoriesTab.tsx` | Admin: list + sub-category ops | Create |
| `src/components/admin/CategoryForm.tsx` | Admin: create/edit one category | Create |
| `src/components/admin/Dashboard.tsx` | Admin sidebar + routing | Modify (add tab) |

---

## Task 1: Database schema + seed

**Files:**
- Create: `supabase/migrations/0019_product_categories.sql`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0019_product_categories.sql`:

```sql
-- public.product_categories + public.product_subcategories
--
-- product_categories replaces the old Astro markdown collection
-- (src/content/categories/*.md) as the single source of truth for the 13
-- product categories. It backs the Products mega-nav, the /products/ grid, and
-- the /catalog/<slug> routes. `product_category_name` links a category to the
-- Excel `products.category_name` value for the catalogue-backed categories
-- (Compression Fittings, Hydraulic Fittings, Saddles); it is null for the rest.
--
-- product_subcategories is an OVERLAY over the series that already exist as
-- products.sub_category values. It only stores display order + visibility (and
-- lets the admin rename a series). The catalog still derives the real set of
-- series from products, then applies this overlay, so no product is ever
-- orphaned by a missing overlay row.

-- ============================================================ product_categories
create table if not exists public.product_categories (
  slug                  text primary key,
  name                  text not null,
  sort_order            integer not null default 0,
  image                 text not null,
  source_image          text,
  leaflet_pdf           text,
  blurb                 text,
  product_category_name text,        -- Excel products.category_name (nullable)
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================ product_subcategories
create table if not exists public.product_subcategories (
  id            uuid primary key default gen_random_uuid(),
  category_slug text not null references public.product_categories(slug) on delete cascade,
  name          text not null,       -- matches products.sub_category
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (category_slug, name)
);

create index if not exists product_subcategories_cat_idx
  on public.product_subcategories (category_slug, sort_order);

-- ============================================================ updated_at triggers
-- Reuse public.set_updated_at() from 0001_jobs.sql.
drop trigger if exists set_product_categories_updated_at on public.product_categories;
create trigger set_product_categories_updated_at
  before update on public.product_categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_product_subcategories_updated_at on public.product_subcategories;
create trigger set_product_subcategories_updated_at
  before update on public.product_subcategories
  for each row execute function public.set_updated_at();

-- ============================================================ RLS
alter table public.product_categories    enable row level security;
alter table public.product_subcategories enable row level security;

-- product_categories: public reads active rows (build + live site use anon key)
drop policy if exists "public read active product_categories" on public.product_categories;
create policy "public read active product_categories"
on public.product_categories for select to anon, authenticated
using (is_active = true);

drop policy if exists "authenticated full access on product_categories" on public.product_categories;
create policy "authenticated full access on product_categories"
on public.product_categories for all to authenticated
using (true) with check (true);

-- product_subcategories: public reads ALL rows (catalog needs hidden rows too,
-- so it can remove hidden series from the derived list)
drop policy if exists "public read product_subcategories" on public.product_subcategories;
create policy "public read product_subcategories"
on public.product_subcategories for select to anon, authenticated
using (true);

drop policy if exists "authenticated full access on product_subcategories" on public.product_subcategories;
create policy "authenticated full access on product_subcategories"
on public.product_subcategories for all to authenticated
using (true) with check (true);

-- ============================================================ seed: categories
-- Transcribed from src/content/categories/*.md (order = sort_order).
insert into public.product_categories
  (slug, name, sort_order, image, source_image, blurb, product_category_name) values
  ('compression-fittings', 'Compression Fittings', 0,
   '/images/products/categories/compression-fittings.png',
   'https://elysee.com.cy/portal-img/default/246/a-11000-compression-fittings.png?ver=20201216085420',
   'Quick-fit re-usable fittings for PE pipes — Epsilon, Lambda, Zeta, Omicron, Eta series.',
   'Compression Fittings'),
  ('hydraulic-fittings', 'Hydraulic Fittings', 1,
   '/images/products/categories/hydraulic-fittings.png',
   'https://elysee.com.cy/portal-img/default/246/b-11100-hydraulic-fittings.png?ver=20201216085420',
   'Flanged adaptors and high-pressure connectors for PE mains and metallic infrastructure.',
   'Hydraulic Fittings'),
  ('saddles', 'Saddles', 2,
   '/images/products/categories/saddles.png',
   'https://elysee.com.cy/portal-img/default/246/c-11200-saddles.png?ver=20201216085420',
   'Tapping saddles for PE mains — fast branch connections without cutting the line.',
   'Saddles'),
  ('light-weight-fittings', 'Light-Weight Fittings', 3,
   '/images/products/categories/light-weight-fittings.png',
   'https://elysee.com.cy/portal-img/default/246/d-11300-light-weight-fittings.png?ver=20201216085420',
   'Compact fittings for low-pressure irrigation and drainage runs.',
   null),
  ('valves', 'Valves', 4,
   '/images/products/categories/valves.png',
   'https://elysee.com.cy/portal-img/default/246/e-11400-valves.png?ver=20201216085420',
   'PVC ball valves, double-union valves, gate valves for water and chemical lines.',
   null),
  ('filters-and-dosers', 'Filters & Dosers', 5,
   '/images/products/categories/filters-and-dosers.png',
   'https://elysee.com.cy/portal-img/default/246/f-11500-filters-dosers.png?ver=20201216085420',
   'Disc and screen filters, fertigation dosers for irrigation networks.',
   null),
  ('micro-irrigation-and-sprinklers', 'Micro-Irrigation & Sprinklers', 6,
   '/images/products/categories/micro-irrigation-and-sprinklers.png',
   'https://elysee.com.cy/portal-img/default/246/g-11600-micro-irrigation-sprinklers.png?ver=20201216085420',
   'Drippers, micro-sprinklers, and emitters for precision agriculture and landscape.',
   null),
  ('turf', 'Turf', 7,
   '/images/products/categories/turf.png',
   'https://elysee.com.cy/portal-img/default/246/h-11700-turf.png?ver=20201216085420',
   'Pop-up sprinklers and turf irrigation systems for sports fields and landscapes.',
   null),
  ('polyethylene-pipes', 'Polyethylene Pipes', 8,
   '/images/products/categories/polyethylene-pipes.png',
   'https://elysee.com.cy/portal-img/default/246/i-11800-polyethylene-pipes.png?ver=20201216085420',
   'PE pipes for water mains, gas distribution, and industrial fluid transport.',
   null),
  ('pvc-pressure-pipes-and-fittings', 'PVC Pressure Pipes & Fittings', 9,
   '/images/products/categories/pvc-pressure-pipes-and-fittings.png',
   'https://elysee.com.cy/portal-img/default/249/pvc-pressure-pipes-fittings-B2tsX.png?ver=20201216085420',
   'PVC pressure pipes and solvent-weld fittings for water supply and chemical lines.',
   null),
  ('network-drainage', 'Network Drainage', 10,
   '/images/products/categories/network-drainage.png',
   'https://elysee.com.cy/portal-img/default/246/k-12000-network-drainage.png?ver=20201216085420',
   'Drainage pipes and fittings for stormwater and surface runoff networks.',
   null),
  ('cable-applications', 'Cable Applications', 11,
   '/images/products/categories/cable-applications.png',
   'https://elysee.com.cy/portal-img/default/246/l-12100-cable-applications.png?ver=20201216085420',
   'Cable conduit and protection systems for buried utility runs.',
   null),
  ('building-sewerage', 'Building Sewerage', 12,
   '/images/products/categories/building-sewerage.png',
   'https://elysee.com.cy/portal-img/default/246/m-12200-building-sewerage.png?ver=20201216085420',
   'Soil and waste pipe systems for residential and commercial buildings.',
   null)
on conflict (slug) do nothing;

-- ============================================================ seed: subcategories
-- One overlay row per distinct (category, series) already present in products,
-- ordered by the series' first appearance (min sort_order) in the catalogue.
insert into public.product_subcategories (category_slug, name, sort_order)
select pc.slug, sub.sub_category, sub.ord
from (
  select category_name, sub_category, min(sort_order) as ord
  from public.products
  where sub_category is not null and sub_category <> ''
  group by category_name, sub_category
) sub
join public.product_categories pc on pc.product_category_name = sub.category_name
on conflict (category_slug, name) do nothing;
```

- [ ] **Step 2: Apply the migration via the Management API**

Set the token in your shell first (do NOT paste it into a file):

```bash
export SUPABASE_MGMT_TOKEN='sbp_...'   # the project management token
export SUPABASE_REF='hsamhykaqmiiheneonxz'
```

Apply it:

```bash
cd "/Users/marios/Desktop/Cursor/elysse demo"
curl -sS -X POST \
  "https://api.supabase.com/v1/projects/${SUPABASE_REF}/database/query" \
  -H "Authorization: Bearer ${SUPABASE_MGMT_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "User-Agent: curl/8.7.1" \
  --data "$(jq -Rs '{query: .}' supabase/migrations/0019_product_categories.sql)"
```

Expected: a JSON array (often `[]` for DDL) and HTTP 200, no `error` key.

- [ ] **Step 3: Verify the seed landed**

```bash
curl -sS -X POST \
  "https://api.supabase.com/v1/projects/${SUPABASE_REF}/database/query" \
  -H "Authorization: Bearer ${SUPABASE_MGMT_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "User-Agent: curl/8.7.1" \
  --data '{"query":"select (select count(*) from public.product_categories) as cats, (select count(*) from public.product_subcategories) as subs, (select count(*) from public.product_categories where product_category_name is not null) as excel_linked;"}'
```

Expected: `cats` = 13, `excel_linked` = 3, `subs` ≈ the number of distinct series across the 3 Excel categories (non-zero, e.g. ~30+).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0019_product_categories.sql
git commit -m "feat(db): product_categories + product_subcategories tables with seed"
```

---

## Task 2: Build-time read helper `src/lib/categories.ts`

**Files:**
- Create: `src/lib/categories.ts`

- [ ] **Step 1: Write the helper**

Create `src/lib/categories.ts`:

```ts
import { supabase } from './supabase';

export interface ProductCategory {
  slug: string;
  name: string;
  sort_order: number;
  image: string;
  source_image: string | null;
  leaflet_pdf: string | null;
  blurb: string | null;
  product_category_name: string | null;
  is_active: boolean;
}

export interface ProductSubcategory {
  id: string;
  category_slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

/** Categories ordered by sort_order. Active-only unless includeHidden. */
export async function getCategories(opts: { includeHidden?: boolean } = {}): Promise<ProductCategory[]> {
  let q = supabase.from('product_categories').select('*').order('sort_order');
  if (!opts.includeHidden) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) { console.error('getCategories:', error.message); return []; }
  return (data ?? []) as ProductCategory[];
}

/** Sub-category overlay rows ordered by sort_order. Includes hidden rows by
 *  default because the catalog needs them to remove hidden series. */
export async function getSubcategories(opts: { includeHidden?: boolean } = {}): Promise<ProductSubcategory[]> {
  let q = supabase.from('product_subcategories').select('*').order('sort_order');
  if (opts.includeHidden === false) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) { console.error('getSubcategories:', error.message); return []; }
  return (data ?? []) as ProductSubcategory[];
}

/**
 * Given a category's raw series list derived from products (in catalogue
 * order) and that category's overlay rows, return the series to display:
 * hidden series removed, overlay sort_order applied, and any series with no
 * overlay row kept in their original order at the end.
 */
export function applySubcategoryOverlay(
  rawSeries: string[],
  overlay: ProductSubcategory[],
): string[] {
  const byName = new Map(overlay.map((s) => [s.name, s]));
  const indexed = rawSeries.map((name, i) => ({ name, i, o: byName.get(name) }));
  return indexed
    .filter((x) => !x.o || x.o.is_active)
    .sort((a, b) => {
      const oa = a.o?.sort_order;
      const ob = b.o?.sort_order;
      if (oa == null && ob == null) return a.i - b.i;   // both unknown: keep original order
      if (oa == null) return 1;                          // unknown sinks below known
      if (ob == null) return -1;
      return oa - ob;
    })
    .map((x) => x.name);
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/lib/categories.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/categories.ts
git commit -m "feat(lib): Supabase-backed category/sub-category read helpers"
```

---

## Task 3: Switch the 6 consumers from the markdown collection to Supabase

**Files:**
- Modify: `src/pages/products/index.astro`
- Modify: `src/components/catalog/CategoriesNav.astro`
- Modify: `src/components/PrimaryNav.astro`
- Modify: `src/components/MobileNav.astro`
- Modify: `src/pages/catalog/[category]/index.astro`
- Modify: `src/pages/catalog/[category]/[product].astro`
- Modify: `src/content/config.ts`
- Delete: `src/content/categories/` (13 files)

- [ ] **Step 1: `src/pages/products/index.astro`** — replace the frontmatter import + `cats` lines.

Replace:
```astro
import { getCollection } from 'astro:content';

const cats = (await getCollection('categories')).sort((a, b) => a.data.order - b.data.order);
const categories = cats.map((c) => ({
  name: c.data.name,
  slug: c.data.slug ?? c.id,
  pdf: c.data.leafletPdf,
  image: c.data.image,
}));
```
With:
```astro
import { getCategories } from '../../lib/categories';

const categories = (await getCategories()).map((c) => ({
  name: c.name,
  slug: c.slug,
  pdf: c.leaflet_pdf ?? undefined,
  image: c.image,
}));
```

- [ ] **Step 2: `src/components/catalog/CategoriesNav.astro`** — replace the import + `categories` line, and the per-item field access.

Replace:
```astro
import { getCollection } from 'astro:content';
```
With:
```astro
import { getCategories } from '../../lib/categories';
```
Replace:
```astro
const categories = (await getCollection('categories')).sort((a, b) => a.data.order - b.data.order);
```
With:
```astro
const categories = await getCategories();
```
Then inside the `categories.map((c) => { ... })` block replace `const slug = c.data.slug ?? c.id;` with `const slug = c.slug;` and replace `{c.data.name}` with `{c.name}`.

- [ ] **Step 3: `src/components/PrimaryNav.astro`** — replace the import + `productItems`.

Replace:
```astro
import { getCollection } from 'astro:content';
```
With:
```astro
import { getCategories } from '../lib/categories';
```
Replace:
```astro
const productItems: NavItem[] = (await getCollection('categories'))
  .sort((a, b) => a.data.order - b.data.order)
  .map((c) => ({
    label: c.data.name,
    href: `/catalog/${c.data.slug ?? c.id}/?country=ask`,
    image: c.data.image,
    caption: c.data.blurb,
  }));
```
With:
```astro
const productItems: NavItem[] = (await getCategories()).map((c) => ({
  label: c.name,
  href: `/catalog/${c.slug}/?country=ask`,
  image: c.image,
  caption: c.blurb ?? undefined,
}));
```

- [ ] **Step 4: `src/components/MobileNav.astro`** — identical change to Step 3.

Replace:
```astro
import { getCollection } from 'astro:content';
```
With:
```astro
import { getCategories } from '../lib/categories';
```
Replace:
```astro
const productItems: NavItem[] = (await getCollection('categories'))
  .sort((a, b) => a.data.order - b.data.order)
  .map((c) => ({
    label: c.data.name,
    href: `/catalog/${c.data.slug ?? c.id}/?country=ask`,
    image: c.data.image,
    caption: c.data.blurb,
  }));
```
With:
```astro
const productItems: NavItem[] = (await getCategories()).map((c) => ({
  label: c.name,
  href: `/catalog/${c.slug}/?country=ask`,
  image: c.image,
  caption: c.blurb ?? undefined,
}));
```

- [ ] **Step 5: `src/pages/catalog/[category]/index.astro`** — swap the source, drop the hardcoded Excel map, and apply the overlay.

Replace:
```astro
import { getCollection } from 'astro:content';
```
With:
```astro
import { getCategories, getSubcategories, applySubcategoryOverlay } from '../../../lib/categories';
```
Replace the `getStaticPaths` body:
```astro
export async function getStaticPaths() {
  const categories = await getCollection('categories');
  return categories.map((c) => ({
    params: { category: c.data.slug ?? c.id },
    props: { categoryEntry: c },
  }));
}
```
With:
```astro
export async function getStaticPaths() {
  const categories = await getCategories();
  return categories.map((c) => ({
    params: { category: c.slug },
    props: { categoryEntry: c },
  }));
}
```
Replace the hardcoded Excel-name lookup:
```astro
// Excel-backed categories pull from Supabase; the rest stay empty as before.
const EXCEL_CATEGORY_NAME: Partial<Record<string, string>> = {
  'compression-fittings': 'Compression Fittings',
  'hydraulic-fittings': 'Hydraulic Fittings',
  'saddles': 'Saddles',
};
const excelName = EXCEL_CATEGORY_NAME[category];
```
With:
```astro
const excelName = categoryEntry.product_category_name ?? undefined;
```
After the existing series-building loop (which fills the `series` array), replace:
```astro
const series: string[] = [];
for (const p of products) {
  const s = p.material;
  if (s && !seriesSeen.has(s)) {
    seriesSeen.add(s);
    series.push(s);
  }
}
```
With:
```astro
const rawSeries: string[] = [];
for (const p of products) {
  const s = p.material;
  if (s && !seriesSeen.has(s)) {
    seriesSeen.add(s);
    rawSeries.push(s);
  }
}
const overlay = (await getSubcategories()).filter((s) => s.category_slug === categoryEntry.slug);
const series = applySubcategoryOverlay(rawSeries, overlay);
```
Finally replace the two `categoryEntry.data.*` reads: `categoryEntry.data.name` → `categoryEntry.name` (both the `<BaseLayout title=…>` and the `<h1>` and the breadcrumb `<span>`), and `categoryEntry.data.blurb` → `categoryEntry.blurb ?? ''` (the `<BaseLayout description=…>`).

- [ ] **Step 6: `src/pages/catalog/[category]/[product].astro`** — swap the source in `getStaticPaths`.

Replace:
```astro
import { getCollection } from 'astro:content';
import ConfigDetail from '../../../components/catalog/ConfigDetail.astro';
import { EXCEL_CATEGORY_NAME, fetchConfigurationDetails, configDetailToCard } from '../../../lib/products';
```
With:
```astro
import ConfigDetail from '../../../components/catalog/ConfigDetail.astro';
import { fetchConfigurationDetails, configDetailToCard } from '../../../lib/products';
import { getCategories } from '../../../lib/categories';
```
Replace the `getStaticPaths` body:
```astro
export async function getStaticPaths() {
  const categories = await getCollection('categories');
  const nameBySlug: Record<string, string> = Object.fromEntries(
    categories.map((c) => [c.data.slug ?? c.id, c.data.name]),
  );
  const paths: Array<{
    params: { category: string; product: string };
    props: { config: ConfigurationDetail; categoryName: string; related: CatalogProduct[] };
  }> = [];
  for (const [slug, name] of Object.entries(EXCEL_CATEGORY_NAME)) {
    const configs = await fetchConfigurationDetails(name);
    for (const config of configs) {
      // Related: other configurations in the same series first, then the rest.
      const sameSeries = configs.filter((x) => x.slug !== config.slug && x.subCategory === config.subCategory);
      const others = configs.filter((x) => x.slug !== config.slug && x.subCategory !== config.subCategory);
      const related = [...sameSeries, ...others].slice(0, 4).map(configDetailToCard);
      paths.push({
        params: { category: slug, product: config.slug },
        props: { config, categoryName: nameBySlug[slug] ?? config.categoryName, related },
      });
    }
  }
  return paths;
}
```
With:
```astro
export async function getStaticPaths() {
  const categories = await getCategories();
  const paths: Array<{
    params: { category: string; product: string };
    props: { config: ConfigurationDetail; categoryName: string; related: CatalogProduct[] };
  }> = [];
  for (const c of categories) {
    if (!c.product_category_name) continue;
    const configs = await fetchConfigurationDetails(c.product_category_name);
    for (const config of configs) {
      // Related: other configurations in the same series first, then the rest.
      const sameSeries = configs.filter((x) => x.slug !== config.slug && x.subCategory === config.subCategory);
      const others = configs.filter((x) => x.slug !== config.slug && x.subCategory !== config.subCategory);
      const related = [...sameSeries, ...others].slice(0, 4).map(configDetailToCard);
      paths.push({
        params: { category: c.slug, product: config.slug },
        props: { config, categoryName: c.name, related },
      });
    }
  }
  return paths;
}
```
(Leave `EXCEL_CATEGORY_NAME` exported in `src/lib/products.ts` untouched — only the two `.astro` imports stop using it.)

- [ ] **Step 7: Remove the markdown collection.**

In `src/content/config.ts` delete the entire `const categories = defineCollection({ … });` block, and change the final export from:
```ts
export const collections = { products, categories };
```
to:
```ts
export const collections = { products };
```
Then delete the markdown directory:
```bash
git rm -r src/content/categories
```

- [ ] **Step 8: Confirm nothing still references the old collection.**

Run: `grep -rn "getCollection('categories')\|getCollection(\"categories\")\|categoryEntry.data\|\.data\.leafletPdf" src/`
Expected: **no output**.

- [ ] **Step 9: Type-check and build.**

Run: `npx tsc --noEmit && npm run build`
Expected: type-check clean; build completes with the same catalog/product pages generated (no "Cannot find collection 'categories'" error).

- [ ] **Step 10: Runtime verify.**

Start the dev server (`npm run dev`) and run a headless check that the Products grid, the mega-nav, and a category page still render all 13 categories and their series. Minimal script:

```bash
cat > /tmp/cat-check.mjs <<'EOF'
import { chromium } from 'playwright-core';
const exe = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const b = await chromium.launch({ executablePath: exe, headless: true });
const p = await b.newPage();
await p.goto('http://localhost:4321/products/', { waitUntil: 'domcontentloaded', timeout: 60000 });
const grid = await p.locator('a[href^="/catalog/"]').count();
await p.goto('http://localhost:4321/catalog/compression-fittings/', { waitUntil: 'domcontentloaded', timeout: 60000 });
const navItems = await p.locator('nav[aria-label="Categories"] a').count();
const series = await p.locator('input[data-facet="materials"]').count();
console.log(JSON.stringify({ grid, navItems, series }));
await b.close();
EOF
node /tmp/cat-check.mjs; rm -f /tmp/cat-check.mjs
```
Expected: `grid` ≥ 13, `navItems` = 13, `series` > 0.

- [ ] **Step 11: Commit.**

```bash
git add -A
git commit -m "refactor(catalog): read categories/sub-categories from Supabase, drop markdown collection"
```

---

## Task 4: Admin Categories tab

**Files:**
- Create: `src/components/admin/CategoryForm.tsx`
- Create: `src/components/admin/CategoriesTab.tsx`

- [ ] **Step 1: Write `src/components/admin/CategoryForm.tsx`** (create/edit one category).

```tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { triggerPublish } from '../../lib/publish';
import type { ProductCategory } from '../../lib/categories';

const EMPTY: Omit<ProductCategory, 'is_active'> & { is_active: boolean } = {
  slug: '', name: '', sort_order: 0, image: '', source_image: null,
  leaflet_pdf: null, blurb: null, product_category_name: null, is_active: true,
};

export default function CategoryForm({ initial, onDone, onCancel }:
  { initial?: ProductCategory; onCancel: () => void; onDone: () => void }) {
  const [d, setD] = useState<ProductCategory>(initial ? { ...initial } : { ...EMPTY });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const editing = !!initial;

  const set = <K extends keyof ProductCategory>(k: K, v: ProductCategory[K]) =>
    setD((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!d.slug.trim()) return setError('Slug is required.');
    if (!d.name.trim()) return setError('Name is required.');
    if (!d.image.trim()) return setError('Image path is required.');
    setBusy(true); setError(null);
    const payload = { ...d, slug: d.slug.trim() };
    const { error: err } = editing
      ? await supabase.from('product_categories').update(payload).eq('slug', initial!.slug)
      : await supabase.from('product_categories').insert(payload);
    if (err) { setBusy(false); return setError(err.message); }
    setBusy(false); triggerPublish(); onDone();
  };

  const field = (label: string, k: keyof ProductCategory, type: 'text' | 'number' = 'text', help?: string) => (
    <label className="block mb-3">
      <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">{label}</span>
      <input
        type={type}
        value={(d[k] as string | number | null) ?? ''}
        onChange={(e) => set(k, (type === 'number'
          ? Number(e.currentTarget.value || 0)
          : (e.currentTarget.value || (k === 'name' || k === 'slug' || k === 'image' ? '' : null))) as never)}
        className="w-full bg-transparent border-b border-ink/25 py-2 text-sm focus:outline-none focus:border-brand-500" />
      {help && <span className="block text-[10px] text-ink/40 mt-1">{help}</span>}
    </label>
  );

  return (
    <div className="max-w-2xl border border-ink/10 p-5 mb-6">
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-4">{error}</p>}
      <div className="grid grid-cols-2 gap-x-6">
        <label className="block mb-3">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Slug (URL, primary key)</span>
          <input value={d.slug} disabled={editing} onChange={(e) => set('slug', e.currentTarget.value)}
            className="w-full bg-transparent border-b border-ink/25 py-2 text-sm font-mono disabled:opacity-50 focus:outline-none focus:border-brand-500" />
        </label>
        {field('Name', 'name')}
        {field('Sort order', 'sort_order', 'number')}
        {field('Image path', 'image', 'text', '/images/products/categories/<slug>.png')}
        {field('Leaflet PDF', 'leaflet_pdf')}
        {field('Excel category link (advanced)', 'product_category_name', 'text', 'Must equal products.category_name to show catalogue items')}
      </div>
      <label className="block mb-4">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Blurb</span>
        <textarea value={d.blurb ?? ''} onChange={(e) => set('blurb', e.currentTarget.value || null)}
          className="w-full bg-transparent border border-ink/20 p-2 text-sm focus:outline-none focus:border-brand-500" rows={2} />
      </label>
      <label className="flex items-center gap-2 text-sm mb-5">
        <input type="checkbox" checked={d.is_active} className="accent-brand-500"
          onChange={(e) => set('is_active', e.currentTarget.checked)} /> Active (visible on the site)
      </label>
      <div className="flex gap-3">
        <button type="button" disabled={busy} onClick={submit}
          className="bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] disabled:opacity-50">
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Create category'}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] text-ink/70">Cancel</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/admin/CategoriesTab.tsx`** (list, hide, delete, sub-category ops).

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { triggerPublish } from '../../lib/publish';
import type { ProductCategory, ProductSubcategory } from '../../lib/categories';
import CategoryForm from './CategoryForm';

export default function CategoriesTab() {
  const [cats, setCats] = useState<ProductCategory[] | null>(null);
  const [subs, setSubs] = useState<ProductSubcategory[]>([]);
  const [catCounts, setCatCounts] = useState<Record<string, number>>({});   // by product_category_name
  const [subCounts, setSubCounts] = useState<Record<string, number>>({});   // by "categoryName|sub"
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);              // slug being edited
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setError(null);
    const [{ data: c, error: cErr }, { data: s, error: sErr }] = await Promise.all([
      supabase.from('product_categories').select('*').order('sort_order'),
      supabase.from('product_subcategories').select('*').order('sort_order'),
    ]);
    if (cErr || sErr) return setError((cErr ?? sErr)!.message);
    setCats((c ?? []) as ProductCategory[]);
    setSubs((s ?? []) as ProductSubcategory[]);

    // product counts (paginated past the 1000-row cap)
    const PAGE = 1000;
    const rows: { category_name: string | null; sub_category: string | null }[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data } = await supabase.from('products').select('category_name, sub_category').range(from, from + PAGE - 1);
      if (!data || data.length === 0) break;
      rows.push(...data);
      if (data.length < PAGE) break;
    }
    const cc: Record<string, number> = {};
    const sc: Record<string, number> = {};
    for (const r of rows) {
      if (r.category_name) cc[r.category_name] = (cc[r.category_name] ?? 0) + 1;
      if (r.category_name && r.sub_category) {
        const k = `${r.category_name}|${r.sub_category}`;
        sc[k] = (sc[k] ?? 0) + 1;
      }
    }
    setCatCounts(cc); setSubCounts(sc);
  };

  useEffect(() => { load(); }, []);

  const toggleCat = async (cat: ProductCategory) => {
    const { error: err } = await supabase.from('product_categories')
      .update({ is_active: !cat.is_active }).eq('slug', cat.slug);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  const deleteCat = async (cat: ProductCategory) => {
    const count = cat.product_category_name ? (catCounts[cat.product_category_name] ?? 0) : 0;
    if (count > 0) return setError(`"${cat.name}" still has ${count} products — hide it instead of deleting.`);
    if (!confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('product_categories').delete().eq('slug', cat.slug);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  const toggleSub = async (sub: ProductSubcategory) => {
    const { error: err } = await supabase.from('product_subcategories')
      .update({ is_active: !sub.is_active }).eq('id', sub.id);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  const reorderSub = async (sub: ProductSubcategory, value: number) => {
    const { error: err } = await supabase.from('product_subcategories')
      .update({ sort_order: value }).eq('id', sub.id);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  const renameSub = async (sub: ProductSubcategory, excelName: string | null) => {
    const next = prompt(`Rename series "${sub.name}" to:`, sub.name);
    if (!next || next.trim() === '' || next.trim() === sub.name) return;
    const newName = next.trim();
    // 1) update overlay row
    const { error: e1 } = await supabase.from('product_subcategories')
      .update({ name: newName }).eq('id', sub.id);
    if (e1) return setError(e1.message);
    // 2) propagate to products (only meaningful for Excel-linked categories)
    if (excelName) {
      const { error: e2 } = await supabase.from('products')
        .update({ sub_category: newName }).eq('category_name', excelName).eq('sub_category', sub.name);
      if (e2) return setError(`Series renamed, but updating products failed: ${e2.message}`);
    }
    await load(); triggerPublish();
  };

  const deleteSub = async (sub: ProductSubcategory, excelName: string | null) => {
    const count = excelName ? (subCounts[`${excelName}|${sub.name}`] ?? 0) : 0;
    if (count > 0) return setError(`Series "${sub.name}" still has ${count} products — hide it instead of deleting.`);
    if (!confirm(`Delete series "${sub.name}"?`)) return;
    const { error: err } = await supabase.from('product_subcategories').delete().eq('id', sub.id);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  // Insert overlay rows for any products.sub_category not yet present for this category.
  const rescan = async (cat: ProductCategory) => {
    if (!cat.product_category_name) return;
    const PAGE = 1000;
    const seen = new Set<string>();
    for (let from = 0; ; from += PAGE) {
      const { data } = await supabase.from('products').select('sub_category')
        .eq('category_name', cat.product_category_name).range(from, from + PAGE - 1);
      if (!data || data.length === 0) break;
      for (const r of data) if (r.sub_category) seen.add(r.sub_category);
      if (data.length < PAGE) break;
    }
    const existing = new Set(subs.filter((s) => s.category_slug === cat.slug).map((s) => s.name));
    const missing = [...seen].filter((n) => !existing.has(n));
    if (missing.length === 0) { setError(`No new series found for "${cat.name}".`); return; }
    const base = subs.filter((s) => s.category_slug === cat.slug).length;
    const { error: err } = await supabase.from('product_subcategories')
      .insert(missing.map((name, i) => ({ category_slug: cat.slug, name, sort_order: base + i })));
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  return (
    <>
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">{error}</p>}

      <div className="flex justify-end mb-4">
        <button type="button" onClick={() => { setCreating(true); setEditing(null); }}
          className="text-[11px] text-brand-500 uppercase tracking-[0.2em]">+ New category</button>
      </div>
      {creating && <CategoryForm onDone={() => { setCreating(false); load(); }} onCancel={() => setCreating(false)} />}

      {cats === null && <p className="text-sm text-ink/60">Loading…</p>}
      {cats !== null && (
        <div className="space-y-6">
          {cats.map((cat) => {
            const catSubs = subs.filter((s) => s.category_slug === cat.slug);
            const excel = cat.product_category_name;
            return (
              <section key={cat.slug} className={`border p-5 ${cat.is_active ? 'border-ink/10' : 'border-ink/10 bg-ink/[0.03] opacity-70'}`}>
                <header className="flex items-center justify-between mb-3">
                  <h3 className="font-heavy text-lg">
                    {cat.name}{' '}
                    <span className="font-mono text-[11px] text-ink/45">/{cat.slug}</span>
                    {!cat.is_active && <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-ink/45">hidden</span>}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em]">
                    <button type="button" onClick={() => { setEditing(cat.slug); setCreating(false); }} className="text-brand-500">Edit</button>
                    <button type="button" onClick={() => toggleCat(cat)} className="text-ink/70">{cat.is_active ? 'Hide' : 'Show'}</button>
                    <button type="button" onClick={() => deleteCat(cat)} className="text-red-600">Delete</button>
                  </div>
                </header>

                {editing === cat.slug && (
                  <CategoryForm initial={cat} onDone={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />
                )}

                <div className="flex items-center justify-between mt-2 mb-2">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-ink/45">Sub-categories (series)</p>
                  {excel && (
                    <button type="button" onClick={() => rescan(cat)} className="text-[10px] uppercase tracking-[0.2em] text-ink/55">Rescan from products</button>
                  )}
                </div>
                {catSubs.length === 0 && <p className="text-sm text-ink/50">No series.</p>}
                <ul className="flex flex-col gap-1">
                  {catSubs.map((sub) => {
                    const count = excel ? (subCounts[`${excel}|${sub.name}`] ?? 0) : 0;
                    return (
                      <li key={sub.id} className={`flex items-center gap-3 text-sm border-b border-ink/5 py-1.5 ${sub.is_active ? '' : 'opacity-60'}`}>
                        <input type="number" defaultValue={sub.sort_order} onBlur={(e) => reorderSub(sub, Number(e.currentTarget.value || 0))}
                          className="w-12 bg-transparent border-b border-ink/15 text-xs text-center" aria-label={`Order of ${sub.name}`} />
                        <span className="flex-1">{sub.name}</span>
                        <span className="font-mono text-[10px] text-ink/45">{count} prod</span>
                        {!sub.is_active && <span className="text-[10px] uppercase tracking-[0.2em] text-ink/45">hidden</span>}
                        <button type="button" onClick={() => renameSub(sub, excel)} className="text-[11px] text-brand-500 uppercase tracking-[0.15em]">Rename</button>
                        <button type="button" onClick={() => toggleSub(sub)} className="text-[11px] text-ink/60 uppercase tracking-[0.15em]">{sub.is_active ? 'Hide' : 'Show'}</button>
                        <button type="button" onClick={() => deleteSub(sub, excel)} className="text-red-600" aria-label={`Delete ${sub.name}`}>×</button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Type-check.**

Run: `npx tsc --noEmit`
Expected: no errors in `CategoriesTab.tsx` / `CategoryForm.tsx`.

- [ ] **Step 4: Commit.**

```bash
git add src/components/admin/CategoryForm.tsx src/components/admin/CategoriesTab.tsx
git commit -m "feat(admin): Categories tab — CRUD, hide, reorder, rename series"
```

---

## Task 5: Wire the tab into the dashboard

**Files:**
- Modify: `src/components/admin/Dashboard.tsx`

- [ ] **Step 1: Add the import** after the other tab imports (near `import ProductsTab from './ProductsTab';`):

```tsx
import CategoriesTab from './CategoriesTab';
```

- [ ] **Step 2: Add `'categories'` to the `Tab` union:**

Replace:
```tsx
type Tab =
  | 'jobs' | 'posts' | 'news' | 'countries' | 'certs' | 'catalogues'
  | 'products' | 'groups' | 'errors' | 'messages' | 'settings' | 'images';
```
With:
```tsx
type Tab =
  | 'jobs' | 'posts' | 'news' | 'countries' | 'certs' | 'catalogues'
  | 'products' | 'categories' | 'groups' | 'errors' | 'messages' | 'settings' | 'images';
```

- [ ] **Step 3: Add the heading.** In `HEADINGS`, add after the `products` line:
```tsx
  categories: 'Categories.',
```

- [ ] **Step 4: Add the sidebar item.** In the `Products` group's `items` array, insert after the `products` entry:
```tsx
      { id: 'categories', label: 'Categories' },
```

- [ ] **Step 5: Render the tab.** After the `{tab === 'products' && <ProductsTab />}` line add:
```tsx
          {tab === 'categories' && <CategoriesTab />}
```

- [ ] **Step 6: Type-check and build.**

Run: `npx tsc --noEmit && npm run build`
Expected: clean.

- [ ] **Step 7: Runtime verify the admin tab.**

With the dev server running, create a temporary `src/pages/admin/preview.astro` that renders `<Dashboard client:only="react" />` (mirroring the existing admin entry), then drive it headlessly: click **Categories**, confirm 13 category sections render, each with its series list, count badges, and Hide/Delete/Rename controls. Delete `preview.astro` afterward.

```bash
cat > src/pages/admin/preview.astro <<'EOF'
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Dashboard from '../../components/admin/Dashboard.tsx';
---
<BaseLayout title="preview" description="preview" padForHeader={false} hideHeader hideFooter>
  <Dashboard client:only="react" />
</BaseLayout>
EOF
cat > /tmp/admin-cat.mjs <<'EOF'
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1100, height: 950 } });
await p.goto('http://localhost:4321/admin/preview/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForSelector('aside nav', { timeout: 30000 });
await p.click('button:has-text("Categories")');
await p.waitForTimeout(2500);
const sections = await p.locator('section:has(h3)').count();
const rescan = await p.locator('button:has-text("Rescan from products")').count();
console.log(JSON.stringify({ sections, rescan }));
await b.close();
EOF
node /tmp/admin-cat.mjs; rm -f src/pages/admin/preview.astro /tmp/admin-cat.mjs
```
Expected: `sections` = 13, `rescan` = 3 (the Excel-linked categories).

- [ ] **Step 8: Commit.**

```bash
git add src/components/admin/Dashboard.tsx
git commit -m "feat(admin): add Categories to the Products sidebar group"
```

---

## Task 6: Final end-to-end check + push

- [ ] **Step 1: Full build from clean.**

Run: `npm run build`
Expected: completes; the same set of `/catalog/*` pages generated as before the refactor.

- [ ] **Step 2: Manual smoke (dev server).**
  - In the admin, hide a category → the deploy publishes → confirm a rebuild drops it from the nav/grid (or, locally, restart dev and confirm it's gone).
  - Rename a series in an Excel-linked category → confirm the catalog grouping uses the new name after rebuild.
  - Reorder a series via the order field → confirm the catalog series order changes.

- [ ] **Step 3: Push.**

```bash
git push origin main
```

---

## Self-review (completed during planning)

- **Spec coverage:** manage/edit categories → Task 4 CategoryForm + Task 5 wiring; hide categories → `toggleCat`; delete categories → `deleteCat` (guarded); manage/edit/hide/delete sub-categories → `renameSub`/`toggleSub`/`deleteSub`/`reorderSub`; "update Supabase" → Task 1 tables + every admin write hits Supabase + `triggerPublish`. Catalog/nav reflect the data → Task 3.
- **Placeholder scan:** every code step contains full code; no TODO/TBD. Verification steps use real commands (`tsc`, `npm run build`, headless Chrome) because the repo has no test runner — called out explicitly in "Codebase reality notes".
- **Type consistency:** `ProductCategory` / `ProductSubcategory` are defined once in `src/lib/categories.ts` and imported by the admin components; field names (`slug`, `name`, `sort_order`, `image`, `source_image`, `leaflet_pdf`, `blurb`, `product_category_name`, `is_active`; sub: `id`, `category_slug`, `name`, `sort_order`, `is_active`) match the migration columns and the `applySubcategoryOverlay` usage.
- **Open risk to confirm at execution:** deleting `src/content/categories` is irreversible via git only — the markdown content is preserved in history and fully re-seeded into `product_categories`, so this is safe, but it is the one destructive structural change.
