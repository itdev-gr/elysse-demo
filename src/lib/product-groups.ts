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
