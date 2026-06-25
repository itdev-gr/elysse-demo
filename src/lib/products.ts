import { supabase } from './supabase';
import type { CatalogProduct, CategorySlug } from '../scripts/catalog/types';
import type { Product, ProductGroup, GroupCountry, ProductDraft } from '../types/product';
import { expandCountriesForGroups } from './product-groups';
import { getFamilies } from './families';
import {
  configSlug,
  fetchConfigsByCategorySlug,
  resolveNameI18n,
  resolveDescriptionI18n,
} from './product-configurations';

const PLACEHOLDER_IMAGE = '/images/products/categories/compression-fittings.png';

/** Catalogue slug → Excel "Category Description" for the Supabase-backed categories. */
export const EXCEL_CATEGORY_NAME: Record<string, string> = {
  'compression-fittings': 'Compression Fittings',
  'hydraulic-fittings': 'Hydraulic Fittings',
  'saddles': 'Saddles',
};

// `configSlug` (+ slugify) lives in ./product-configurations so that module can
// own the configuration key without a circular import; re-exported here for
// backward compatibility with existing importers.
export { configSlug };

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
export function toCatalogProduct(p: Product, countries: string[], categorySlug: CategorySlug): CatalogProduct {
  const pn = parsePnFromSubCategory(p.sub_category);
  return {
    slug: p.code,
    name: p.description ?? [p.configuration, p.size].filter(Boolean).join(' — '),
    code: p.code,
    categorySlug,
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
      supabase.from('products').select('*').eq('category_name', categoryName)
        .eq('is_active', true).eq('is_hidden', false)
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
export async function fetchCatalogProducts(categoryName: string, categorySlug: CategorySlug): Promise<CatalogProduct[]> {
  const { products, countriesByCode } = await loadCategory(categoryName);
  return products.map((p) => toCatalogProduct(p, countriesByCode.get(p.code) ?? [], categorySlug));
}

/** A product configuration (catalogue No.) as a card — sizes collapsed away. */
function configToCatalogProduct(
  rep: Product,
  countries: string[],
  categorySlug: CategorySlug,
  nameI18n?: Record<string, string>,
): CatalogProduct {
  const ref = rep.family_code ?? rep.code; // catalogue number, e.g. "330A"
  return {
    slug: configSlug(rep.sub_category, ref),
    name: nameI18n?.en ?? rep.configuration ?? rep.description ?? ref,
    nameI18n,
    code: ref,
    categorySlug,
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

/** Minimal shape needed to order configuration cards. */
export interface ConfigOrderEntry {
  rep: { sub_category: string | null; family_code: string | null; code: string };
  /** Aggregated product sort_order for this configuration (min across sizes). */
  order: number;
}

/**
 * Order configuration cards for display: series order is preserved (by the
 * series' lowest product sort_order, as before), then WITHIN each series cards
 * are ordered by their family code's `sort_order` (admin-controlled, from
 * product_families), falling back to the product sort_order. Pure + testable.
 */
export function orderConfigEntries<T extends ConfigOrderEntry>(entries: T[], famSort: Map<string, number>): T[] {
  const seriesRank = new Map<string, number>();
  for (const e of entries) {
    const s = e.rep.sub_category ?? '';
    const cur = seriesRank.get(s);
    if (cur === undefined || e.order < cur) seriesRank.set(s, e.order);
  }
  return [...entries].sort((a, b) => {
    const sa = seriesRank.get(a.rep.sub_category ?? '') ?? 0;
    const sb = seriesRank.get(b.rep.sub_category ?? '') ?? 0;
    if (sa !== sb) return sa - sb;                                  // series order (unchanged)
    const fa = famSort.get(a.rep.family_code ?? a.rep.code) ?? Infinity;
    const fb = famSort.get(b.rep.family_code ?? b.rep.code) ?? Infinity;
    if (fa !== fb) return fa - fb;                                  // family order within series
    return a.order - b.order;                                       // fallback: product sort_order
  });
}

/** code → sort_order for one category's managed family codes. */
async function familySortMap(categorySlug: string): Promise<Map<string, number>> {
  const fams = await getFamilies({ includeHidden: true });
  return new Map(fams.filter((f) => f.category_slug === categorySlug).map((f) => [f.code, f.sort_order]));
}

/**
 * Build-time fetch: one CatalogProduct per configuration (catalogue No.),
 * collapsing all size variants. A configuration is shown for a country when any
 * of its sizes is available there (union of memberships).
 */
export async function fetchCatalogConfigurations(categoryName: string, categorySlug: CategorySlug): Promise<CatalogProduct[]> {
  const [{ products, countriesByCode }, configRecords, famSort] = await Promise.all([
    loadCategory(categoryName),
    fetchConfigsByCategorySlug(categorySlug),
    familySortMap(categorySlug),
  ]);
  const groups = new Map<
    string,
    { rep: Product; countries: Set<string>; order: number; perRow: Record<string, string> }
  >();
  for (const p of products) {
    const key = configSlug(p.sub_category, p.family_code ?? p.code);
    const countries = countriesByCode.get(p.code) ?? [];
    let g = groups.get(key);
    if (!g) {
      g = { rep: p, countries: new Set(countries), order: p.sort_order, perRow: {} };
      groups.set(key, g);
    } else {
      for (const c of countries) g.countries.add(c);
      if (p.sort_order < g.order) g.order = p.sort_order;
    }
    // Merge per-row name translations (first non-empty wins) — the fallback for
    // any configuration without a product_configurations record.
    const ni = p.name_i18n ?? {};
    for (const lang of I18N_LANGS) {
      if (ni[lang]?.trim() && !g.perRow[lang]) g.perRow[lang] = ni[lang]!.trim();
    }
  }
  const entries = [...groups.entries()].map(([key, g]) => ({ key, rep: g.rep, order: g.order, g }));
  return orderConfigEntries(entries, famSort)
    .map(({ key, g }) => {
      const derivedName = g.rep.configuration ?? g.rep.description ?? (g.rep.family_code ?? g.rep.code);
      // Same resolution as the detail page: product_configurations record wins,
      // per-row merged map is the fallback, English always present.
      const nameI18n = resolveNameI18n(derivedName, g.perRow, configRecords.get(key));
      return configToCatalogProduct(g.rep, [...g.countries], categorySlug, nameI18n);
    });
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
  /** Plain-English description (representative row). */
  description: string | null;
  /** Name (configuration) by language, incl. `en`. Falls back to English. */
  nameI18n: Record<string, string>;
  /** Description by language, incl. `en`. Falls back to English. */
  descriptionI18n: Record<string, string>;
  subCategory: string;
  categorySlug: CategorySlug;
  categoryName: string;
  image: string | null;
  availableCountries: string[];
  sizes: ConfigSize[];
}

/** Languages with optional translations (English is the source + fallback). */
const I18N_LANGS = ['el', 'de', 'es', 'fr'] as const;

/** Build-time fetch: every configuration in a category, each with its sizes. */
export async function fetchConfigurationDetails(categoryName: string, categorySlug: CategorySlug): Promise<ConfigurationDetail[]> {
  const [{ products, countriesByCode }, configRecords, famSort] = await Promise.all([
    loadCategory(categoryName),
    fetchConfigsByCategorySlug(categorySlug),
    familySortMap(categorySlug),
  ]);
  const map = new Map<string, ConfigurationDetail>();
  const cfgOrder = new Map<string, number>();   // slug → min product sort_order
  for (const p of products) {
    const familyCode = p.family_code ?? p.code;
    const slug = configSlug(p.sub_category, familyCode);
    cfgOrder.set(slug, Math.min(cfgOrder.get(slug) ?? Infinity, p.sort_order));
    const countries = countriesByCode.get(p.code) ?? [];
    let cfg = map.get(slug);
    if (!cfg) {
      const enName = p.configuration ?? p.description ?? familyCode;
      cfg = {
        slug,
        familyCode,
        configuration: enName,
        description: p.description ?? null,
        nameI18n: { en: enName },
        descriptionI18n: p.description ? { en: p.description } : {},
        subCategory: p.sub_category ?? '',
        categorySlug,
        categoryName: p.category_name ?? categoryName,
        image: p.image_url ?? null,
        availableCountries: [],
        sizes: [],
      };
      map.set(slug, cfg);
    }
    if (!cfg.image && p.image_url) cfg.image = p.image_url;
    // Merge in any per-language translations from this row (first non-empty wins).
    const ni = p.name_i18n ?? {};
    const di = p.description_i18n ?? {};
    for (const lang of I18N_LANGS) {
      if (ni[lang]?.trim() && !cfg.nameI18n[lang]) cfg.nameI18n[lang] = ni[lang].trim();
      if (di[lang]?.trim() && !cfg.descriptionI18n[lang]) cfg.descriptionI18n[lang] = di[lang].trim();
    }
    cfg.sizes.push({
      code: p.code, size: p.size, packing_bag: p.packing_bag, packing_box: p.packing_box,
      moq: p.moq, box_size: p.box_size, countries,
    });
    for (const c of countries) if (!cfg.availableCountries.includes(c)) cfg.availableCountries.push(c);
  }
  // Overlay product-level translations (product_configurations). The record is
  // the source of truth for name + translations; the per-row merge built above
  // is the fallback for any configuration with no record yet.
  for (const cfg of map.values()) {
    const rec = configRecords.get(cfg.slug);
    const derivedName = cfg.configuration;
    const perRowName = { ...cfg.nameI18n };
    delete perRowName.en;
    cfg.nameI18n = resolveNameI18n(derivedName, perRowName, rec);
    cfg.configuration = cfg.nameI18n.en;

    const derivedDesc = cfg.description;
    const perRowDesc = { ...cfg.descriptionI18n };
    delete perRowDesc.en;
    cfg.descriptionI18n = resolveDescriptionI18n(derivedDesc, perRowDesc, rec);
    cfg.description = cfg.descriptionI18n.en ?? null;
  }
  // Order configurations the same way as the listing: series order, then by the
  // family code's admin-set sort_order within each series.
  const entries = [...map.values()].map((cfg) => ({
    rep: { sub_category: cfg.subCategory || null, family_code: cfg.familyCode, code: cfg.familyCode },
    order: cfgOrder.get(cfg.slug) ?? 0,
    cfg,
  }));
  return orderConfigEntries(entries, famSort).map((e) => e.cfg);
}

/** Map a configuration to a catalogue card (for "Related products"). */
export function configDetailToCard(c: ConfigurationDetail): CatalogProduct {
  return {
    slug: c.slug,
    name: c.configuration,
    nameI18n: c.nameI18n,
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
  if (!d.category_name || !d.category_name.trim()) return 'Category name is required.';
  if (!d.description || !d.description.trim()) return 'Description is required.';
  return null;
}

export function nextProductSortOrder(rows: Pick<Product, 'sort_order'>[]): number {
  return rows.reduce((max, r) => Math.max(max, r.sort_order), 0) + 1;
}

export type { Product, ProductGroup, GroupCountry };
