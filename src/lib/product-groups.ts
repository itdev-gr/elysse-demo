import type { GroupCountry, ProductGroup } from '../types/product';
import { matchesFields } from './admin-search';

/** All ISO country codes that belong to a single group. Lowercased — the
 *  site-wide COUNTRIES list uses lowercase codes, so a stray uppercase DB row
 *  (e.g. 'PL') must still match. */
export function groupCountryCodes(group: string, all: GroupCountry[]): string[] {
  return all
    .filter((g) => g.group_code === group && g.country_code)
    .map((g) => g.country_code!.toLowerCase());
}

/** Union of country codes across every group a product belongs to. */
export function expandCountriesForGroups(groups: string[], all: GroupCountry[]): string[] {
  const set = new Set<string>();
  for (const g of groups) for (const code of groupCountryCodes(g, all)) set.add(code);
  return [...set];
}

export interface GroupMatch {
  group: ProductGroup;
  countries: GroupCountry[];
}

/** Admin search over the Country Groups tab. A group matching by code or label
 *  keeps its full country list; otherwise only matching country chips remain,
 *  and groups with no match at all drop out. */
export function filterGroups(
  groups: ProductGroup[],
  countries: GroupCountry[],
  query: string,
): GroupMatch[] {
  const forGroup = (g: ProductGroup) => countries.filter((c) => c.group_code === g.code);
  if (query.trim() === '') return groups.map((g) => ({ group: g, countries: forGroup(g) }));
  const out: GroupMatch[] = [];
  for (const g of groups) {
    const all = forGroup(g);
    if (matchesFields(query, [g.code, g.label])) {
      out.push({ group: g, countries: all });
      continue;
    }
    const matching = all.filter((c) => matchesFields(query, [c.country, c.country_code]));
    if (matching.length > 0) out.push({ group: g, countries: matching });
  }
  return out;
}
