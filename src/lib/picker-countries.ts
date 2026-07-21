/** The slice of a group_countries row the picker helpers need. */
export interface PickerFeaturedRow {
  country_code: string | null;
  featured_order: number | null;
}

/** Lowercased ISO code → featured position. Lowest order wins on duplicates. */
export function featuredCodes(rows: PickerFeaturedRow[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    if (r.featured_order == null || !r.country_code) continue;
    const code = r.country_code.toLowerCase();
    const cur = m.get(code);
    if (cur === undefined || r.featured_order < cur) m.set(code, r.featured_order);
  }
  return m;
}

/**
 * Split the picker's country pool into the admin-pinned top section (in the
 * admin's order) and the rest (alphabetical) — the popup renders a separator
 * between the two when both are non-empty.
 */
export function partitionPickerCountries<T extends { code: string; label: string }>(
  pool: T[],
  featured: Map<string, number>,
): { top: T[]; rest: T[] } {
  const top = pool
    .filter((c) => featured.has(c.code))
    .sort((a, b) => featured.get(a.code)! - featured.get(b.code)!);
  const rest = pool
    .filter((c) => !featured.has(c.code))
    .sort((a, b) => a.label.localeCompare(b.label));
  return { top, rest };
}

/**
 * Featured rows only, in featured_order — the admin panel's list. Defensive:
 * if two rows share an ISO code (case-insensitively), only the lowest-order
 * one is kept, matching featuredCodes' lowest-wins semantics.
 */
export function featuredPickerList<T extends PickerFeaturedRow>(rows: T[]): T[] {
  const sorted = rows
    .filter((r) => r.featured_order != null)
    .sort((a, b) => a.featured_order! - b.featured_order!);
  const seen = new Set<string>();
  return sorted.filter((r) => {
    if (!r.country_code) return true;
    const code = r.country_code.toLowerCase();
    if (seen.has(code)) return false;
    seen.add(code);
    return true;
  });
}

/** Swap one step up/down, clamped at the edges. */
export function moveFeatured<T>(list: T[], index: number, dir: 'up' | 'down'): T[] {
  const to = dir === 'up' ? index - 1 : index + 1;
  if (index < 0 || index >= list.length || to < 0 || to >= list.length) return [...list];
  const next = [...list];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}
