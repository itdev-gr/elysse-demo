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
      if (oa == null && ob == null) return a.i - b.i;
      if (oa == null) return 1;
      if (ob == null) return -1;
      return oa - ob;
    })
    .map((x) => x.name);
}
