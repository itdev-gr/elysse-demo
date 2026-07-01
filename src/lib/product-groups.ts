import type { GroupCountry } from '../types/product';

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
