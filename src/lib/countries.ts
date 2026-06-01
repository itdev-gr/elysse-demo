import type { Country } from '../types/country';

export function filterCountries(rows: Country[], query: string): Country[] {
  const q = query.trim().toLowerCase();
  if (q === '') return rows;
  return rows.filter((r) =>
    r.code.toLowerCase().includes(q) ||
    r.country.toLowerCase().includes(q) ||
    r.label.toLowerCase().includes(q),
  );
}
