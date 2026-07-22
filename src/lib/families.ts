import { supabase } from './supabase';
import { matchesFields } from './admin-search';

export interface ProductFamily {
  id: string;
  category_slug: string;
  code: string;             // matches products.family_code (e.g. '330', '330T')
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

/** Minimal product row needed to derive a family code's series + counts. */
export interface ProductFactRow {
  code: string;
  category_name: string | null;
  sub_category: string | null;
  family_code: string | null;
  configuration: string | null;
}

/** Product-derived facts for one family code, within one series. */
export interface SeriesFacts {
  count: number;
  /** English configuration name (products.configuration), first non-empty. */
  configuration: string | null;
}

/** Product-derived facts for one family code, across every series it appears in. */
export interface CodeFacts {
  /** Total products in the code (across all series). */
  count: number;
  /** First non-empty configuration name (fallback when no series in scope). */
  configuration: string | null;
  /** Every series (products.sub_category) the code has products in, first-seen order. */
  series: string[];
  /** Per-series counts + configuration name, keyed by sub_category. */
  perSeries: Map<string, SeriesFacts>;
}

/**
 * Fold raw product rows into per-family-code facts, keyed by
 * `${category_name}|${family_code}`. A family code can span more than one series
 * (its A/M/Z-suffixed SKUs live under different `sub_category` values), so
 * `series` lists ALL of them — the admin Families tab renders the code under
 * each. Rows without a category or family code are skipped. Pure + testable.
 */
export function buildCodeFacts(rows: ProductFactRow[]): {
  facts: Record<string, CodeFacts>;
  codesByFam: Record<string, string[]>;
} {
  const facts: Record<string, CodeFacts> = {};
  const codesByFam: Record<string, string[]> = {};
  for (const r of rows) {
    if (!r.category_name || !r.family_code) continue;
    const k = `${r.category_name}|${r.family_code}`;
    const f = (facts[k] ??= { count: 0, configuration: null, series: [], perSeries: new Map() });
    const config = r.configuration?.trim() || null;
    f.count += 1;
    f.configuration ??= config;
    if (r.sub_category) {
      let sf = f.perSeries.get(r.sub_category);
      if (!sf) {
        sf = { count: 0, configuration: null };
        f.perSeries.set(r.sub_category, sf);
        f.series.push(r.sub_category);
      }
      sf.count += 1;
      sf.configuration ??= config;
    }
    (codesByFam[k] ??= []).push(r.code);
  }
  return { facts, codesByFam };
}

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
