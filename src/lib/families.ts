import { supabase } from './supabase';

export interface ProductFamily {
  id: string;
  category_slug: string;
  code: string;             // matches products.family_code (e.g. '330', '330T')
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

/** Family codes ordered by (category_slug, sort_order). Active-only unless includeHidden. */
export async function getFamilies(opts: { includeHidden?: boolean } = {}): Promise<ProductFamily[]> {
  let q = supabase.from('product_families').select('*').order('category_slug').order('sort_order');
  if (!opts.includeHidden) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) { console.error('getFamilies:', error.message); return []; }
  return (data ?? []) as ProductFamily[];
}

/**
 * The family-code options to show in the product form for a category: the union
 * of codes already on products and the managed codes from product_families,
 * de-duplicated and sorted. Either list may contain nulls/blanks (filtered out).
 */
export function mergeFamilyCodes(
  productCodes: (string | null)[],
  managedCodes: (string | null)[],
): string[] {
  const all = [...productCodes, ...managedCodes].filter((v): v is string => !!v);
  return [...new Set(all)].sort((a, b) => a.localeCompare(b));
}
