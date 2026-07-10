import { supabase } from './supabase';
import { matchesFields } from './admin-search';

/** Non-English languages categories/subcategories can be translated into.
 *  English is the base column and the fallback, so it is not listed here. */
export const CATEGORY_I18N_LANGS: { code: string; label: string }[] = [
  { code: 'el', label: 'Greek' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
];

export interface ProductCategory {
  slug: string;
  name: string;
  sort_order: number;
  image: string;
  source_image: string | null;
  leaflet_pdf: string | null;
  blurb: string | null;
  product_category_name: string | null;
  /** Single-letter catalogue code (A, B, C…). Auto-filled with the product's
   *  category letter in the product form, and vice-versa. */
  category_letter: string | null;
  is_active: boolean;
  /** Non-English name translations keyed by language code (el/de/es/fr). */
  name_i18n: Record<string, string> | null;
  /** Non-English blurb translations keyed by language code. */
  blurb_i18n: Record<string, string> | null;
}

/** Drop empty/whitespace entries so only real translations are stored. */
export function cleanI18n(map: Record<string, string> | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(map ?? {})) if (v && v.trim()) out[k] = v.trim();
  return out;
}

export interface ProductSubcategory {
  id: string;
  category_slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  /** Non-English name translations keyed by language code (el/de/es/fr). */
  name_i18n: Record<string, string> | null;
}

export interface CategoryCardMatch {
  cat: ProductCategory;
  subs: ProductSubcategory[];
}

/** Admin search over the Categories tab cards. A category whose name or slug
 *  matches keeps its full series list; otherwise only matching series remain,
 *  and categories with no match at all drop out. */
export function filterCategoryCards(
  cats: ProductCategory[],
  subs: ProductSubcategory[],
  query: string,
): CategoryCardMatch[] {
  const subsFor = (cat: ProductCategory) => subs.filter((s) => s.category_slug === cat.slug);
  if (query.trim() === '') return cats.map((cat) => ({ cat, subs: subsFor(cat) }));
  const out: CategoryCardMatch[] = [];
  for (const cat of cats) {
    const all = subsFor(cat);
    if (matchesFields(query, [cat.name, cat.slug])) {
      out.push({ cat, subs: all });
      continue;
    }
    const matching = all.filter((s) => matchesFields(query, [s.name]));
    if (matching.length > 0) out.push({ cat, subs: matching });
  }
  return out;
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
      if (oa == null && ob == null) return a.i - b.i;
      if (oa == null) return 1;
      if (ob == null) return -1;
      return oa - ob;
    })
    .map((x) => x.name);
}
