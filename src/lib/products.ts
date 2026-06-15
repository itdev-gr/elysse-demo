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

/** Catalogue slug → Excel "Category Description" for the Supabase-backed categories. */
export const EXCEL_CATEGORY_NAME: Record<string, string> = {
  'compression-fittings': 'Compression Fittings',
  'hydraulic-fittings': 'Hydraulic Fittings',
  'saddles': 'Saddles',
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Stable URL slug for a configuration within a category: "{series}-{familyCode}". */
export function configSlug(subCategory: string | null, familyCode: string): string {
  return `${slugify(subCategory ?? '')}-${slugify(familyCode)}`.replace(/^-|-$/g, '');
}

export function parsePnFromSubCategory(sub: string | null): number | undefined {
  const m = sub?.match(/PN\s*(\d+)/i);
  return m ? Number(m[1]) : undefined;
}

// The leading number is the nominal diameter (DN); any later figure (e.g. "20 x 15") is a
// thread/connection spec, not a range bound — so the range is intentionally [n, n].
export function parseDnFromSize(size: string | null): [number, number] | undefined {
  const m = size?.match(/(\d+)/);
  return m ? [Number(m[1]), Number(m[1])] : undefined;
}

/** Map a DB product + its expanded country list into the existing CatalogProduct shape. */
export function toCatalogProduct(p: Product, countries: string[]): CatalogProduct {
  const pn = parsePnFromSubCategory(p.sub_category);
  const slug = CATEGORY_SLUG_BY_NAME[p.category_name ?? ''];
  if (!slug && p.category_name) console.warn(`toCatalogProduct: unmapped category_name "${p.category_name}" for ${p.code}`);
  return {
    slug: p.code,
    name: p.description ?? [p.configuration, p.size].filter(Boolean).join(' — '),
    code: p.code,
    categorySlug: (slug ?? 'compression-fittings'),
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

const PAGE = 1000;

/** Fetch every row of a table (optionally filtered) past PostgREST's 1000-row cap. */
async function fetchAll<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

/** Build-time fetch: raw products for a category + each one's ISO country list. */
async function loadCategory(
  categoryName: string,
): Promise<{ products: Product[]; countriesByCode: Map<string, string[]> }> {
  const [products, memberships, groupCountries] = await Promise.all([
    fetchAll<Product>((from, to) =>
      supabase.from('products').select('*').eq('category_name', categoryName).eq('is_active', true)
        .order('sort_order', { ascending: true }).range(from, to),
    ),
    fetchAll<{ product_code: string; group_code: string }>((from, to) =>
      supabase.from('product_group_memberships').select('product_code, group_code')
        .order('product_code', { ascending: true }).range(from, to),
    ),
    // Paginated for consistency, though this table is small and bounded.
    fetchAll<GroupCountry>((from, to) =>
      supabase.from('group_countries').select('*').order('group_code', { ascending: true }).range(from, to),
    ),
  ]);
  const byCode = new Map<string, string[]>();
  for (const m of memberships) {
    const arr = byCode.get(m.product_code) ?? [];
    arr.push(m.group_code);
    byCode.set(m.product_code, arr);
  }
  const countriesByCode = new Map<string, string[]>();
  for (const p of products) {
    countriesByCode.set(p.code, expandCountriesForGroups(byCode.get(p.code) ?? [], groupCountries));
  }
  return { products, countriesByCode };
}

/** Build-time fetch: one CatalogProduct per SKU (every size variant). */
export async function fetchCatalogProducts(categoryName: string): Promise<CatalogProduct[]> {
  const { products, countriesByCode } = await loadCategory(categoryName);
  return products.map((p) => toCatalogProduct(p, countriesByCode.get(p.code) ?? []));
}

/** A product configuration (catalogue No.) as a card — sizes collapsed away. */
function configToCatalogProduct(rep: Product, countries: string[]): CatalogProduct {
  const slug = CATEGORY_SLUG_BY_NAME[rep.category_name ?? ''];
  const ref = rep.family_code ?? rep.code; // catalogue number, e.g. "330A"
  return {
    slug: configSlug(rep.sub_category, ref),
    name: rep.configuration ?? rep.description ?? ref,
    code: ref,
    categorySlug: slug ?? 'compression-fittings',
    sectors: [],
    material: rep.sub_category ?? undefined, // series facet
    dnRange: undefined,
    pnRating: parsePnFromSubCategory(rep.sub_category),
    standards: [],
    imageUrls: [],
    image: rep.image_url ?? '', // real photo when assigned, else card placeholder
    blurb: '',
    pressure: '',
    sizeRange: '',
    bim: false,
    datasheet: undefined,
    installation: undefined,
    specs: [],
    featured: false,
    hasDetailPage: true, // opens /catalog/<cat>/<configSlug> with the size table
    availableCountries: countries as CatalogProduct['availableCountries'],
  };
}

/**
 * Build-time fetch: one CatalogProduct per configuration (catalogue No.),
 * collapsing all size variants. A configuration is shown for a country when any
 * of its sizes is available there (union of memberships).
 */
export async function fetchCatalogConfigurations(categoryName: string): Promise<CatalogProduct[]> {
  const { products, countriesByCode } = await loadCategory(categoryName);
  const groups = new Map<string, { rep: Product; countries: Set<string>; order: number }>();
  for (const p of products) {
    const key = configSlug(p.sub_category, p.family_code ?? p.code);
    const g = groups.get(key);
    const countries = countriesByCode.get(p.code) ?? [];
    if (!g) {
      groups.set(key, { rep: p, countries: new Set(countries), order: p.sort_order });
    } else {
      for (const c of countries) g.countries.add(c);
      if (p.sort_order < g.order) g.order = p.sort_order;
    }
  }
  return [...groups.values()]
    .sort((a, b) => a.order - b.order)
    .map((g) => configToCatalogProduct(g.rep, [...g.countries]));
}

/** One size (SKU) within a configuration. */
export interface ConfigSize {
  code: string;
  size: string | null;
  packing_bag: number | null;
  packing_box: number | null;
  moq: number | null;
  box_size: string | null;
  countries: string[];
}

/** A configuration (catalogue No.) with its full list of sizes — the detail page. */
export interface ConfigurationDetail {
  slug: string;
  familyCode: string;
  configuration: string;
  subCategory: string;
  categorySlug: CategorySlug;
  categoryName: string;
  image: string | null;
  availableCountries: string[];
  sizes: ConfigSize[];
}

/** Build-time fetch: every configuration in a category, each with its sizes. */
export async function fetchConfigurationDetails(categoryName: string): Promise<ConfigurationDetail[]> {
  const { products, countriesByCode } = await loadCategory(categoryName);
  const map = new Map<string, ConfigurationDetail>();
  for (const p of products) {
    const familyCode = p.family_code ?? p.code;
    const slug = configSlug(p.sub_category, familyCode);
    const countries = countriesByCode.get(p.code) ?? [];
    let cfg = map.get(slug);
    if (!cfg) {
      cfg = {
        slug,
        familyCode,
        configuration: p.configuration ?? p.description ?? familyCode,
        subCategory: p.sub_category ?? '',
        categorySlug: CATEGORY_SLUG_BY_NAME[p.category_name ?? ''] ?? 'compression-fittings',
        categoryName: p.category_name ?? categoryName,
        image: p.image_url ?? null,
        availableCountries: [],
        sizes: [],
      };
      map.set(slug, cfg);
    }
    if (!cfg.image && p.image_url) cfg.image = p.image_url;
    cfg.sizes.push({
      code: p.code, size: p.size, packing_bag: p.packing_bag, packing_box: p.packing_box,
      moq: p.moq, box_size: p.box_size, countries,
    });
    for (const c of countries) if (!cfg.availableCountries.includes(c)) cfg.availableCountries.push(c);
  }
  return [...map.values()];
}

/** Map a configuration to a catalogue card (for "Related products"). */
export function configDetailToCard(c: ConfigurationDetail): CatalogProduct {
  return {
    slug: c.slug,
    name: c.configuration,
    code: c.familyCode,
    categorySlug: c.categorySlug,
    sectors: [],
    material: c.subCategory || undefined,
    dnRange: undefined,
    pnRating: undefined,
    standards: [],
    imageUrls: [],
    image: c.image ?? '',
    blurb: '',
    pressure: '',
    sizeRange: '',
    bim: false,
    datasheet: undefined,
    installation: undefined,
    specs: [],
    featured: false,
    hasDetailPage: true,
    availableCountries: c.availableCountries as CatalogProduct['availableCountries'],
  };
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
