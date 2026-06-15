# Product Catalog (Supabase + country→group) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/catalog/[category]` a real, database-driven catalog: products come from Supabase (imported from the client's Excel master), a visitor picks a country which resolves to a group (A–E), and only that group's products show — with full add/edit/delete of products and country↔group management in the admin dashboard, plus a "Data Errors" review queue.

**Architecture:** The existing catalog UI (CountryModal → CategoriesNav + FilterRail + UtilityBar + ProductGrid, with client-side filtering in `scripts/catalog/page-init.ts`) is **preserved unchanged**. Only the *data source* swaps from the Astro `products` content collection to Supabase. Each product's group memberships are expanded at build time into a `availableCountries` array, so the existing `byCountry(p.availableCountries.includes(country))` filter keeps working verbatim. The admin dashboard gains three tabs (Products, Groups, Data Errors) mirroring the existing `CertificationsTab`/`CountriesTab` CRUD pattern.

**Tech Stack:** Astro 6 (SSG), React islands (admin), Supabase (Postgres + Auth + RLS), TypeScript, Tailwind. Build-time fetch via the public anon client (`src/lib/supabase.ts`).

**Status:** **Phase 1 (schema + import) is COMPLETE and verified live** on project `hsamhykaqmiiheneonxz`:
- `supabase/migrations/0016_products.sql` applied. Tables: `products` (2,236), `product_groups` (5), `group_countries` (14), `product_group_memberships` (5,668), `product_import_issues` (26 = 1 duplicate-code error + 25 missing-group warnings).
- Verified: Australia → Group D → 1,196 products; duplicate `38T02503AM` queued.
- Import script archived at `/tmp/import_products.py` (re-runnable; reads the Excel, applies the migration via the Management API, bulk-loads via PostgREST).

---

## File Structure

**New files**
- `src/types/product.ts` — `Product`, `ProductGroup`, `GroupCountry`, `ProductImportIssue`, `*Draft` types.
- `src/lib/products.ts` — fetch + map helpers (`fetchCatalogProducts`, `toCatalogProduct`, `parsePnFromSubCategory`, `parseDnFromSize`), shared validation (`validateProductDraft`), `nextProductSortOrder`.
- `src/lib/product-groups.ts` — `groupCountryCodes(groupCountries)`, `expandCountriesForGroups(groupCodes, groupCountries)`.
- `src/components/admin/ProductsTab.tsx` + `ProductForm.tsx`
- `src/components/admin/GroupsTab.tsx` + `GroupCountryForm.tsx`
- `src/components/admin/DataErrorsTab.tsx`
- `src/lib/products.test.ts` — unit tests for the pure mappers/validators.

**Modified files**
- `src/pages/catalog/[category]/index.astro` — swap content-collection source for Supabase fetch + mapping (lines 26–61 region).
- `src/components/catalog/CountryModal.astro` — drive options from `group_countries` (Supabase) instead of the static 25-country list, so only group-mapped countries are selectable.
- `src/components/catalog/CategoriesNav.astro` — unchanged (still content-collection categories); the 3 Excel categories light up, others stay empty as today.
- `src/components/admin/Dashboard.tsx` — add `products`, `groups`, `errors` tabs.
- `src/data/catalog-countries.ts` — add `bg`, `ro`, `gb`, `ie` country defs (Bulgaria, Romania, United Kingdom, Ireland) so `country.ts` validation and per-country plumbing accept them.

**Category mapping** (Excel `Category Description` → existing category slug):
`Compression Fittings`→`compression-fittings`, `Hydraulic Fittings`→`hydraulic-fittings`, `Saddles`→`saddles`. The other 10 categories have no Excel data and render empty exactly as they do now.

**Key decision — build-time SSG (recommended):** products are fetched from Supabase in the `.astro` frontmatter at build time (anon client; RLS allows public read of active rows) and embedded per-category as JSON, exactly like the current content-collection flow. Dashboard edits publish on the next deploy (Vercel rebuilds on push; a manual "Redeploy" also works). This keeps the page a static, fast, zero-client-fetch catalog and preserves the existing architecture. *(Alternative: convert the list to a runtime client fetch for instant edits — more change, not needed for v1.)*

---

## Phase 2 — Product data layer

### Task 1: Product types

**Files:**
- Create: `src/types/product.ts`

- [ ] **Step 1: Write the types**

```ts
// Mirrors public.products and the group model (migration 0016_products.sql).
export interface Product {
  code: string;
  category: string | null;        // 'A' | 'B' | 'C'
  category_name: string | null;   // 'Compression Fittings' | ...
  sub_category: string | null;
  family_code: string | null;
  configuration: string | null;
  size: string | null;
  packing_bag: number | null;
  packing_box: number | null;
  moq: number | null;
  box_size: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type ProductDraft = Omit<Product, 'created_at' | 'updated_at'>;

export interface ProductGroup {
  code: string;                   // 'A'..'E'
  label: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupCountry {
  id: string;
  group_code: string;
  country: string;
  country_code: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
export type GroupCountryDraft = Omit<GroupCountry, 'id' | 'created_at' | 'updated_at'>;

export type IssueType =
  | 'duplicate_code' | 'missing_code' | 'missing_field' | 'missing_group' | 'invalid_value';
export type IssueSeverity = 'error' | 'warning';
export type IssueStatus = 'open' | 'resolved' | 'ignored';

export interface ProductImportIssue {
  id: string;
  code: string | null;
  raw: Record<string, unknown>;
  issue_type: IssueType;
  severity: IssueSeverity;
  message: string | null;
  status: IssueStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}
```

- [ ] **Step 2: Typecheck**

Run: `cd "/Users/marios/Desktop/Cursor/elysse demo" && npx tsc --noEmit`
Expected: no new errors from `src/types/product.ts`.

- [ ] **Step 3: Commit** (do NOT push — repo rule: no commit/push until user review; this "commit" step is local only and may be deferred to a single review checkpoint)

```bash
git add src/types/product.ts
git commit -m "feat(products): add product + group + import-issue types"
```

### Task 2: Group→country expansion helper (pure, tested)

**Files:**
- Create: `src/lib/product-groups.ts`
- Test: `src/lib/products.test.ts` (shared test file; create here)

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { expandCountriesForGroups } from './product-groups';
import type { GroupCountry } from '../types/product';

const gc = (group_code: string, country_code: string): GroupCountry => ({
  id: country_code, group_code, country: country_code.toUpperCase(),
  country_code, sort_order: 0, created_at: '', updated_at: '',
});

describe('expandCountriesForGroups', () => {
  const all: GroupCountry[] = [gc('A', 'gr'), gc('A', 'es'), gc('C', 'cy'), gc('D', 'au')];
  it('expands a product\'s groups to the union of their country codes', () => {
    expect(expandCountriesForGroups(['A', 'D'], all).sort()).toEqual(['au', 'es', 'gr']);
  });
  it('returns [] for no groups', () => {
    expect(expandCountriesForGroups([], all)).toEqual([]);
  });
  it('ignores group codes with no countries', () => {
    expect(expandCountriesForGroups(['B'], all)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

Run: `cd "/Users/marios/Desktop/Cursor/elysse demo" && npx vitest run src/lib/products.test.ts`
Expected: FAIL ("expandCountriesForGroups is not a function" / module not found). *(If vitest is not yet a dependency, add it: `npm i -D vitest` and a `"test": "vitest"` script. Confirm with the user before adding a dev dependency.)*

- [ ] **Step 3: Implement**

```ts
import type { GroupCountry } from '../types/product';

/** All ISO country codes that belong to a single group. */
export function groupCountryCodes(group: string, all: GroupCountry[]): string[] {
  return all.filter((g) => g.group_code === group && g.country_code).map((g) => g.country_code!);
}

/** Union of country codes across every group a product belongs to. */
export function expandCountriesForGroups(groups: string[], all: GroupCountry[]): string[] {
  const set = new Set<string>();
  for (const g of groups) for (const code of groupCountryCodes(g, all)) set.add(code);
  return [...set];
}
```

- [ ] **Step 4: Run test — verify it passes**

Run: `npx vitest run src/lib/products.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/product-groups.ts src/lib/products.test.ts
git commit -m "feat(products): group→country expansion helper"
```

### Task 3: Product→CatalogProduct mapper + PN/DN parsers (pure, tested)

**Files:**
- Create: `src/lib/products.ts`
- Test: append to `src/lib/products.test.ts`

- [ ] **Step 1: Write the failing tests** (append)

```ts
import { parsePnFromSubCategory, parseDnFromSize, toCatalogProduct } from './products';
import type { Product } from '../types/product';

describe('parsePnFromSubCategory', () => {
  it('reads PN rating', () => {
    expect(parsePnFromSubCategory('Epsilon Series PN16')).toBe(16);
    expect(parsePnFromSubCategory('Lambda Series PN10')).toBe(10);
    expect(parsePnFromSubCategory('Spare Parts')).toBeUndefined();
  });
});
describe('parseDnFromSize', () => {
  it('reads the leading diameter', () => {
    expect(parseDnFromSize('16 x ⅜"')).toEqual([16, 16]);
    expect(parseDnFromSize('20 x ¾"')).toEqual([20, 20]);
    expect(parseDnFromSize(null)).toBeUndefined();
  });
});
describe('toCatalogProduct', () => {
  const p: Product = {
    code: '330001610', category: 'A', category_name: 'Compression Fittings',
    sub_category: 'Epsilon Series PN16', family_code: '330', configuration: 'Adaptor Male',
    size: '16 x ⅜"', packing_bag: 25, packing_box: 750, moq: 0, box_size: 'L',
    description: 'Adaptor Male Epsilon Series PN16 - 16 x ⅜"', sort_order: 1,
    is_active: true, created_at: '', updated_at: '',
  };
  it('maps fields and country availability', () => {
    const cp = toCatalogProduct(p, ['gr', 'au']);
    expect(cp.slug).toBe('330001610');
    expect(cp.code).toBe('330001610');
    expect(cp.categorySlug).toBe('compression-fittings');
    expect(cp.name).toBe('Adaptor Male Epsilon Series PN16 - 16 x ⅜"');
    expect(cp.pnRating).toBe(16);
    expect(cp.dnRange).toEqual([16, 16]);
    expect(cp.availableCountries).toEqual(['gr', 'au']);
    expect(cp.material).toBe('Epsilon Series PN16'); // sub_category reused as the "series" facet
  });
});
```

- [ ] **Step 2: Run — verify fail**

Run: `npx vitest run src/lib/products.test.ts` → FAIL (functions undefined).

- [ ] **Step 3: Implement**

```ts
import { supabase } from './supabase';
import type { CatalogProduct, CategorySlug } from '../scripts/catalog/types';
import type { Product, ProductGroup, GroupCountry, ProductDraft } from '../types/product';
import { expandCountriesForGroups } from './product-groups';

const CATEGORY_SLUG_BY_NAME: Record<string, CategorySlug> = {
  'Compression Fittings': 'compression-fittings',
  'Hydraulic Fittings': 'hydraulic-fittings',
  'Saddles': 'saddles',
};

const PLACEHOLDER_IMAGE = '/images/products/categories/compression-fittings.png';

export function parsePnFromSubCategory(sub: string | null): number | undefined {
  const m = sub?.match(/PN\s*(\d+)/i);
  return m ? Number(m[1]) : undefined;
}

export function parseDnFromSize(size: string | null): [number, number] | undefined {
  const m = size?.match(/(\d+)/);
  return m ? [Number(m[1]), Number(m[1])] : undefined;
}

/** Map a DB product + its expanded country list into the existing CatalogProduct shape. */
export function toCatalogProduct(p: Product, countries: string[]): CatalogProduct {
  const pn = parsePnFromSubCategory(p.sub_category);
  return {
    slug: p.code,
    name: p.description ?? [p.configuration, p.size].filter(Boolean).join(' — '),
    code: p.code,
    categorySlug: (CATEGORY_SLUG_BY_NAME[p.category_name ?? ''] ?? 'compression-fittings'),
    sectors: [],
    material: p.sub_category ?? undefined,   // reused as the "Series" facet group
    dnRange: parseDnFromSize(p.size),
    pnRating: pn,
    standards: [],
    imageUrls: [],
    image: PLACEHOLDER_IMAGE,
    blurb: [p.configuration, p.size].filter(Boolean).join(' · '),
    pressure: pn ? `PN ${pn}` : '',
    sizeRange: p.size ?? '',
    bim: false,
    datasheet: undefined,
    installation: undefined,
    specs: [
      ...(p.packing_bag != null ? [{ key: 'Packing (bag)', value: String(p.packing_bag) }] : []),
      ...(p.packing_box != null ? [{ key: 'Packing (box)', value: String(p.packing_box) }] : []),
      ...(p.moq != null ? [{ key: 'MOQ', value: String(p.moq) }] : []),
      ...(p.box_size ? [{ key: 'Box size', value: p.box_size }] : []),
    ],
    featured: false,
    availableCountries: countries as CatalogProduct['availableCountries'],
  };
}

/** Build-time fetch: products for a category + their country availability. */
export async function fetchCatalogProducts(categoryName: string): Promise<CatalogProduct[]> {
  const [{ data: products }, { data: memberships }, { data: groupCountries }] = await Promise.all([
    supabase.from('products').select('*').eq('category_name', categoryName).eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase.from('product_group_memberships').select('product_code, group_code'),
    supabase.from('group_countries').select('*'),
  ]);
  if (!products) return [];
  const byCode = new Map<string, string[]>();
  for (const m of (memberships ?? []) as { product_code: string; group_code: string }[]) {
    const arr = byCode.get(m.product_code) ?? [];
    arr.push(m.group_code);
    byCode.set(m.product_code, arr);
  }
  const gc = (groupCountries ?? []) as GroupCountry[];
  return (products as Product[]).map((p) =>
    toCatalogProduct(p, expandCountriesForGroups(byCode.get(p.code) ?? [], gc)),
  );
}

/** Shared validation used by ProductForm and the Data-Errors promote flow. */
export function validateProductDraft(d: Partial<ProductDraft>): string | null {
  if (!d.code || !d.code.trim()) return 'Code is required (it is the primary key).';
  if (!d.description || !d.description.trim()) return 'Description is required.';
  return null;
}

export function nextProductSortOrder(rows: Pick<Product, 'sort_order'>[]): number {
  return rows.reduce((max, r) => Math.max(max, r.sort_order), 0) + 1;
}

export type { Product, ProductGroup, GroupCountry };
```

- [ ] **Step 4: Run — verify pass**

Run: `npx vitest run src/lib/products.test.ts` → PASS (all describe blocks).

- [ ] **Step 5: Commit**

```bash
git add src/lib/products.ts src/lib/products.test.ts
git commit -m "feat(products): DB→CatalogProduct mapper, PN/DN parsers, validation"
```

---

## Phase 3 — Wire `/catalog/[category]` to Supabase (preserve structure)

### Task 4: Swap the page data source

**Files:**
- Modify: `src/pages/catalog/[category]/index.astro` (replace lines 26–61, the content-collection block)

- [ ] **Step 1: Replace the product source**

Replace the `const collection = await getCollection('products'); ... const productsJson = JSON.stringify(products);` block (current lines 26–61) with:

```astro
import { fetchCatalogProducts } from '../../../lib/products';

// Excel-backed categories pull from Supabase; the rest stay empty as before.
const EXCEL_CATEGORY_NAME: Partial<Record<string, string>> = {
  'compression-fittings': 'Compression Fittings',
  'hydraulic-fittings': 'Hydraulic Fittings',
  'saddles': 'Saddles',
};
const excelName = EXCEL_CATEGORY_NAME[category];
const products: CatalogProduct[] = excelName ? await fetchCatalogProducts(excelName) : [];

const categoryProducts = products; // already filtered to this category
const isEmpty = categoryProducts.length === 0;

const productsByCountry = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, byCountry(products, c.code)]),
) as Record<Country, CatalogProduct[]>;

const facetsByCountry = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, deriveFacets(productsByCountry[c.code])]),
) as Record<Country, ReturnType<typeof deriveFacets>>;

const productsJson = JSON.stringify(products);
```

Notes: `byCategory` import becomes unused for the Excel path (each fetch is already one category); keep importing it only if still referenced, else drop the import to avoid a lint error. Everything downstream (`ProductGrid`, `FilterRail`, hidden per-country rails, `page-init`) is untouched.

- [ ] **Step 2: Build**

Run: `cd "/Users/marios/Desktop/Cursor/elysse demo" && npm run build`
Expected: build succeeds; `compression-fittings`, `hydraulic-fittings`, `saddles` pages render product cards; other categories show the existing "No products in this category yet."

- [ ] **Step 3: Verify in the running app** (manual)

Run: `npm run preview -- --port 4329`, open `http://localhost:4329/catalog/compression-fittings/`, pick **Australia** in the modal. Expected: ~1,196 products visible; pick **Cyprus** → ~822; FilterRail PN/DN/Series filters and search work; grid/list toggle works.

- [ ] **Step 4: Commit**

```bash
git add "src/pages/catalog/[category]/index.astro"
git commit -m "feat(catalog): source products from Supabase, country→group filtering"
```

### Task 5: Country modal from `group_countries`

**Files:**
- Modify: `src/components/catalog/CountryModal.astro`
- Modify: `src/data/catalog-countries.ts` (add bg, ro, gb, ie)

- [ ] **Step 1: Add the four missing countries** to `COUNTRIES` in `catalog-countries.ts`:

```ts
  { code: 'bg', label: 'Bulgaria', region: 'europe' },
  { code: 'ro', label: 'Romania', region: 'europe' },
  { code: 'gb', label: 'United Kingdom', region: 'europe' },
  { code: 'ie', label: 'Ireland', region: 'europe' },
```

- [ ] **Step 2: Drive the modal options from Supabase** — in `CountryModal.astro` frontmatter, fetch the mapped countries so only group-mapped countries are offered:

```astro
import { supabase } from '../../lib/supabase';
const { data: mapped } = await supabase
  .from('group_countries').select('country_code, country').order('country', { ascending: true });
const codes = new Set((mapped ?? []).map((m) => m.country_code).filter(Boolean));
const selectable = COUNTRIES.filter((c) => codes.has(c.code));
```

Render `selectable` instead of `topCountries`/`otherCountries` (keep the same markup/classes). If `selectable` is empty (Supabase unreachable at build), fall back to the existing static list.

- [ ] **Step 3: Build + manual verify** the modal lists exactly the 14 mapped countries (incl. Bulgaria, Romania, UK, Ireland).

Run: `npm run build` then preview; confirm the picker.

- [ ] **Step 4: Commit**

```bash
git add src/components/catalog/CountryModal.astro src/data/catalog-countries.ts
git commit -m "feat(catalog): country picker driven by group_countries"
```

---

## Phase 4 — Admin: Products tab

Mirror `CertificationsTab.tsx` + `CertificationForm.tsx` exactly (list with search, create/edit/delete, toggle active). Products also manage group-membership checkboxes (A–E) written to `product_group_memberships`.

### Task 6: `ProductsTab.tsx`

**Files:**
- Create: `src/components/admin/ProductsTab.tsx`
- Modify: `src/components/admin/Dashboard.tsx`

- [ ] **Step 1: Implement the tab** (full CRUD list)

```tsx
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types/product';
import ProductForm from './ProductForm';

type Mode = { kind: 'list' } | { kind: 'create' } | { kind: 'edit'; product: Product };

export default function ProductsTab() {
  const [rows, setRows] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [query, setQuery] = useState('');

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('products').select('*').order('sort_order', { ascending: true }).limit(5000);
    if (err) return setError(err.message);
    setRows((data ?? []) as Product[]);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rows.slice(0, 200);
    return rows.filter((r) =>
      [r.code, r.description, r.sub_category, r.configuration, r.category_name]
        .some((v) => v?.toLowerCase().includes(q)),
    ).slice(0, 200);
  }, [rows, query]);

  const toggleActive = async (p: Product) => {
    const { error: err } = await supabase.from('products')
      .update({ is_active: !p.is_active }).eq('code', p.code);
    if (err) return setError(err.message);
    await load();
  };
  const remove = async (p: Product) => {
    if (!confirm(`Delete product "${p.code}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('products').delete().eq('code', p.code);
    if (err) return setError(err.message);
    await load();
  };

  if (mode.kind === 'create')
    return <ProductForm onDone={() => { setMode({ kind: 'list' }); load(); }} onCancel={() => setMode({ kind: 'list' })} />;
  if (mode.kind === 'edit')
    return <ProductForm initial={mode.product} onDone={() => { setMode({ kind: 'list' }); load(); }} onCancel={() => setMode({ kind: 'list' })} />;

  return (
    <>
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">{error}</p>}
      <div className="mb-4 flex items-center gap-4">
        <button type="button" onClick={() => setMode({ kind: 'create' })}
          className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer">
          + New product
        </button>
        <span className="text-xs text-ink/55">{rows ? `${rows.length} total` : ''}</span>
      </div>
      <div className="mb-6">
        <input type="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search code, description, series…"
          className="w-full max-w-md bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500" />
        {!query && rows && rows.length > 200 && (
          <p className="text-[11px] text-ink/50 mt-2">Showing first 200 — search to narrow.</p>
        )}
      </div>
      {rows === null ? <p className="text-sm text-ink/60">Loading…</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[10px] uppercase tracking-[0.2em] text-ink/55 border-b border-ink/10">
              <th className="py-2 pr-3">Code</th><th className="py-2 pr-3">Description</th>
              <th className="py-2 pr-3">Series</th><th className="py-2 pr-3">Active</th><th className="py-2">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.code} className="border-b border-ink/5">
                  <td className="py-2 pr-3 font-mono text-[12px]">{p.code}</td>
                  <td className="py-2 pr-3">{p.description}</td>
                  <td className="py-2 pr-3 text-ink/70">{p.sub_category}</td>
                  <td className="py-2 pr-3">
                    <button type="button" onClick={() => toggleActive(p)} className="text-[11px] underline">
                      {p.is_active ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="py-2 flex gap-3">
                    <button type="button" onClick={() => setMode({ kind: 'edit', product: p })} className="text-[11px] text-brand-500">Edit</button>
                    <button type="button" onClick={() => remove(p)} className="text-[11px] text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Wire into Dashboard** — add `'products'` to the `Tab` union, `HEADINGS` (`products: 'Products.'`), a nav button, and `{tab === 'products' && <ProductsTab />}`; import it.

- [ ] **Step 3: Build + manual verify** — sign into `/admin`, open Products, search a code, confirm the list renders.

Run: `npm run build` (and manual preview/login).

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/ProductsTab.tsx src/components/admin/Dashboard.tsx
git commit -m "feat(admin): products tab (list/search/toggle/delete)"
```

### Task 7: `ProductForm.tsx` (create/edit + group checkboxes)

**Files:**
- Create: `src/components/admin/ProductForm.tsx`

- [ ] **Step 1: Implement** — fields for every product column + A–E group checkboxes. On save: upsert the product (`insert` for create / `update` for edit, keyed on `code`), then replace its membership rows (`delete` where `product_code` then `insert` the checked groups). Use `validateProductDraft` from `src/lib/products.ts` before submit.

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { validateProductDraft, nextProductSortOrder } from '../../lib/products';
import type { Product, ProductDraft } from '../../types/product';

const GROUPS = ['A', 'B', 'C', 'D', 'E'];
const EMPTY: ProductDraft = {
  code: '', category: null, category_name: null, sub_category: null, family_code: null,
  configuration: null, size: null, packing_bag: null, packing_box: null, moq: null,
  box_size: null, description: null, sort_order: 0, is_active: true,
};

export default function ProductForm({ initial, onDone, onCancel }:
  { initial?: Product; onCancel: () => void; onDone: () => void }) {
  const [d, setD] = useState<ProductDraft>(initial ? { ...initial } : EMPTY);
  const [groups, setGroups] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const editing = !!initial;

  useEffect(() => {
    if (!initial) return;
    supabase.from('product_group_memberships').select('group_code').eq('product_code', initial.code)
      .then(({ data }) => setGroups((data ?? []).map((r: { group_code: string }) => r.group_code)));
  }, [initial]);

  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) => setD((p) => ({ ...p, [k]: v }));
  const num = (v: string): number | null => (v.trim() === '' ? null : Number(v));

  const submit = async () => {
    const msg = validateProductDraft(d);
    if (msg) return setError(msg);
    setBusy(true); setError(null);
    if (!editing) {
      const { data: all } = await supabase.from('products').select('sort_order');
      d.sort_order = nextProductSortOrder((all ?? []) as Product[]);
    }
    const { error: err } = editing
      ? await supabase.from('products').update(d).eq('code', initial!.code)
      : await supabase.from('products').insert(d);
    if (err) { setBusy(false); return setError(err.message); }
    await supabase.from('product_group_memberships').delete().eq('product_code', d.code);
    if (groups.length)
      await supabase.from('product_group_memberships')
        .insert(groups.map((g) => ({ product_code: d.code, group_code: g })));
    setBusy(false); onDone();
  };

  const field = (label: string, k: keyof ProductDraft, type: 'text' | 'number' = 'text') => (
    <label className="block mb-3">
      <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">{label}</span>
      <input type={type} value={(d[k] as string | number | null) ?? ''}
        onChange={(e) => set(k, (type === 'number' ? num(e.currentTarget.value) : e.currentTarget.value) as never)}
        className="w-full bg-transparent border-b border-ink/25 py-2 text-sm focus:outline-none focus:border-brand-500" />
    </label>
  );

  return (
    <div className="max-w-2xl">
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">{error}</p>}
      <div className="grid grid-cols-2 gap-x-6">
        <label className="block mb-3">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Code (primary key)</span>
          <input value={d.code} disabled={editing} onChange={(e) => set('code', e.currentTarget.value)}
            className="w-full bg-transparent border-b border-ink/25 py-2 text-sm font-mono disabled:opacity-50 focus:outline-none focus:border-brand-500" />
        </label>
        {field('Category name', 'category_name')}
        {field('Category letter', 'category')}
        {field('Sub-category', 'sub_category')}
        {field('Configuration', 'configuration')}
        {field('Size', 'size')}
        {field('Family code', 'family_code')}
        {field('Box size', 'box_size')}
        {field('Packing bag', 'packing_bag', 'number')}
        {field('Packing box', 'packing_box', 'number')}
        {field('MOQ', 'moq', 'number')}
      </div>
      <label className="block mb-3">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Description</span>
        <textarea value={d.description ?? ''} onChange={(e) => set('description', e.currentTarget.value)}
          className="w-full bg-transparent border border-ink/20 p-2 text-sm focus:outline-none focus:border-brand-500" rows={2} />
      </label>
      <fieldset className="mb-5">
        <legend className="text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-2">Groups (countries that can see it)</legend>
        <div className="flex gap-4">
          {GROUPS.map((g) => (
            <label key={g} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={groups.includes(g)} className="accent-brand-500"
                onChange={(e) => setGroups((prev) => e.currentTarget.checked ? [...prev, g] : prev.filter((x) => x !== g))} />
              {g}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm mb-6">
        <input type="checkbox" checked={d.is_active} className="accent-brand-500"
          onChange={(e) => set('is_active', e.currentTarget.checked)} /> Active
      </label>
      <div className="flex gap-3">
        <button type="button" disabled={busy} onClick={submit}
          className="bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] disabled:opacity-50">
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] text-ink/70">Cancel</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build + manual verify** — create a test product with groups C+D, confirm it appears for Cyprus/Australia after a rebuild; edit it; delete it.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/ProductForm.tsx
git commit -m "feat(admin): product create/edit form with group membership"
```

---

## Phase 5 — Admin: Groups tab (country↔group management)

### Task 8: `GroupsTab.tsx` + `GroupCountryForm.tsx`

**Files:**
- Create: `src/components/admin/GroupsTab.tsx`, `src/components/admin/GroupCountryForm.tsx`
- Modify: `src/components/admin/Dashboard.tsx` (add `groups` tab)

- [ ] **Step 1: Implement GroupsTab** — list the 5 groups (from `product_groups`); under each, list its `group_countries` rows with **Remove** buttons and an **+ Add country** action (opens `GroupCountryForm`: country name + ISO code + group select; inserts into `group_countries`). Editing a group's `label`/`description` is an inline update to `product_groups`.

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ProductGroup, GroupCountry } from '../../types/product';
import GroupCountryForm from './GroupCountryForm';

export default function GroupsTab() {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [countries, setCountries] = useState<GroupCountry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  const load = async () => {
    const [{ data: g }, { data: c }] = await Promise.all([
      supabase.from('product_groups').select('*').order('sort_order'),
      supabase.from('group_countries').select('*').order('sort_order'),
    ]);
    setGroups((g ?? []) as ProductGroup[]);
    setCountries((c ?? []) as GroupCountry[]);
  };
  useEffect(() => { load(); }, []);

  const removeCountry = async (gc: GroupCountry) => {
    if (!confirm(`Remove ${gc.country} from group ${gc.group_code}?`)) return;
    const { error: err } = await supabase.from('group_countries').delete().eq('id', gc.id);
    if (err) return setError(err.message);
    await load();
  };

  return (
    <>
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">{error}</p>}
      <div className="space-y-8">
        {groups.map((g) => (
          <section key={g.code} className="border border-ink/10 p-5">
            <header className="flex items-center justify-between mb-3">
              <h3 className="font-heavy text-lg">Group {g.code} <span className="text-ink/50 text-sm">· {g.label}</span></h3>
              <button type="button" onClick={() => setAdding(g.code)} className="text-[11px] text-brand-500 uppercase tracking-[0.2em]">+ Add country</button>
            </header>
            {adding === g.code && (
              <GroupCountryForm groupCode={g.code} onDone={() => { setAdding(null); load(); }} onCancel={() => setAdding(null)} />
            )}
            <ul className="flex flex-wrap gap-2">
              {countries.filter((c) => c.group_code === g.code).map((c) => (
                <li key={c.id} className="inline-flex items-center gap-2 bg-ink/5 px-3 py-1 text-sm">
                  {c.country}<span className="font-mono text-[10px] text-ink/50">{c.country_code}</span>
                  <button type="button" onClick={() => removeCountry(c)} className="text-red-600">×</button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
```

```tsx
// GroupCountryForm.tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function GroupCountryForm({ groupCode, onDone, onCancel }:
  { groupCode: string; onDone: () => void; onCancel: () => void }) {
  const [country, setCountry] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!country.trim()) return setError('Country name is required.');
    const { error: err } = await supabase.from('group_countries')
      .insert({ group_code: groupCode, country: country.trim(), country_code: code.trim() || null });
    if (err) return setError(err.message.includes('unique') ? 'That country is already mapped to a group.' : err.message);
    onDone();
  };

  return (
    <div className="mb-4 flex items-end gap-3">
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      <label className="text-xs">Country
        <input value={country} onChange={(e) => setCountry(e.currentTarget.value)} className="block border-b border-ink/25 py-1 text-sm" /></label>
      <label className="text-xs">ISO code
        <input value={code} onChange={(e) => setCode(e.currentTarget.value)} placeholder="au" className="block border-b border-ink/25 py-1 text-sm w-16 font-mono" /></label>
      <button type="button" onClick={submit} className="bg-brand-500 text-surface px-3 py-1.5 text-[11px] uppercase">Add</button>
      <button type="button" onClick={onCancel} className="text-[11px] text-ink/60">Cancel</button>
    </div>
  );
}
```

- [ ] **Step 2: Wire `groups` tab into Dashboard** (union + heading `groups: 'Groups.'` + nav button + render).

- [ ] **Step 3: Build + manual verify** — add a country to a group, confirm it appears in the catalog country picker after rebuild; remove it.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/GroupsTab.tsx src/components/admin/GroupCountryForm.tsx src/components/admin/Dashboard.tsx
git commit -m "feat(admin): groups tab — manage countries per group"
```

---

## Phase 6 — Admin: Data Errors tab

### Task 9: `DataErrorsTab.tsx`

**Files:**
- Create: `src/components/admin/DataErrorsTab.tsx`
- Modify: `src/components/admin/Dashboard.tsx` (add `errors` tab + open-count badge)

- [ ] **Step 1: Implement** — list `product_import_issues` where `status='open'`, grouped by `issue_type`, showing `code`, `message`, and the `raw` payload (expandable). Per row: **Fix & promote** (opens an editable form pre-filled from `raw`; on save runs `validateProductDraft`, inserts into `products` + memberships, then sets the issue `status='resolved', resolved_at=now()`), **Ignore** (`status='ignored'`), **Delete** (`delete`). A header count shows open errors vs warnings.

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ProductImportIssue } from '../../types/product';

export default function DataErrorsTab() {
  const [rows, setRows] = useState<ProductImportIssue[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data, error: err } = await supabase.from('product_import_issues')
      .select('*').eq('status', 'open').order('severity').order('issue_type');
    if (err) return setError(err.message);
    setRows((data ?? []) as ProductImportIssue[]);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: 'resolved' | 'ignored') => {
    const patch: Record<string, unknown> = { status };
    if (status === 'resolved') patch.resolved_at = new Date().toISOString();
    const { error: err } = await supabase.from('product_import_issues').update(patch).eq('id', id);
    if (err) return setError(err.message);
    await load();
  };
  const del = async (id: string) => {
    if (!confirm('Delete this issue?')) return;
    const { error: err } = await supabase.from('product_import_issues').delete().eq('id', id);
    if (err) return setError(err.message);
    await load();
  };

  if (rows === null) return <p className="text-sm text-ink/60">Loading…</p>;
  const errors = rows.filter((r) => r.severity === 'error');
  const warnings = rows.filter((r) => r.severity === 'warning');

  return (
    <>
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">{error}</p>}
      <p className="text-sm text-ink/70 mb-6">{errors.length} errors · {warnings.length} warnings open.</p>
      {rows.length === 0 ? <p className="text-sm text-ink/60">No open data issues. 🎉</p> : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className={`border-l-2 p-4 ${r.severity === 'error' ? 'border-red-500 bg-red-50/40' : 'border-amber-500 bg-amber-50/40'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs">{r.code ?? '—'}</span>
                  <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-ink/55">{r.issue_type}</span>
                  <p className="text-sm mt-1">{r.message}</p>
                </div>
                <div className="flex gap-3 text-[11px]">
                  <button type="button" onClick={() => setStatus(r.id, 'resolved')} className="text-brand-500">Mark fixed</button>
                  <button type="button" onClick={() => setStatus(r.id, 'ignored')} className="text-ink/60">Ignore</button>
                  <button type="button" onClick={() => del(r.id)} className="text-red-600">Delete</button>
                </div>
              </div>
              <details className="mt-2"><summary className="text-[11px] text-ink/50 cursor-pointer">Raw row</summary>
                <pre className="text-[11px] bg-ink/5 p-2 mt-1 overflow-x-auto">{JSON.stringify(r.raw, null, 2)}</pre>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
```

*(v1 ships Mark-fixed / Ignore / Delete + raw view. The richer "Fix & promote into a new product" editor is a fast-follow — it reuses `ProductForm` pre-filled from `raw`. Confirm with the user whether v1 inline-promote is needed now.)*

- [ ] **Step 2: Wire `errors` tab + open-count badge** into Dashboard.

- [ ] **Step 3: Build + manual verify** — open Data Errors, confirm the 1 duplicate error + 25 missing-group warnings show; mark one fixed.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/DataErrorsTab.tsx src/components/admin/Dashboard.tsx
git commit -m "feat(admin): data-errors review queue"
```

---

## Self-Review

- **Spec coverage:** products from Excel→Supabase ✔ (Phase 1); country→group filtering on the product page ✔ (Tasks 2–4); add/edit/delete products ✔ (Tasks 6–7); add/remove countries from groups ✔ (Task 8); error page for duplicates/any errors ✔ (Phase 1 queue + Task 9); same catalog structure ✔ (Tasks 4–5 reuse all existing components); photos deferred ✔ (placeholder image, `imageUrls: []`).
- **Type consistency:** `Product`/`ProductDraft` keyed on `code`; `toCatalogProduct` returns the existing `CatalogProduct`; membership rows always `{ product_code, group_code }`.
- **Open decisions to confirm before/while executing:**
  1. Build-time SSG (edits publish on redeploy) vs runtime fetch (instant) — plan assumes **build-time**.
  2. Whether the Data-Errors **inline "Fix & promote into product"** editor is needed in v1 or as a fast-follow.
  3. Product **detail pages** (`/catalog/[category]/[product]`) for Excel products — currently no detail page; cards' "View details" would 404. Options: hide the link for DB products, or generate minimal detail pages. Recommend hiding the link until photos/spec sheets arrive.
  4. Adding **vitest** as a dev dependency for Tasks 2–3 (or skip unit tests and rely on manual verification).
- **Repo rules:** never `git commit`/`git push` until the user reviews and approves (the per-task "commit" steps batch into a single review checkpoint). Preserve existing design — this plan only swaps data sources and reuses all catalog components.
