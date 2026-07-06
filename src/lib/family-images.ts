/** A family's images are capped at this many (enforced in app logic, not the DB). */
export const MAX_FAMILY_IMAGES = 5;

/** One row of product_family_images. */
export interface FamilyImageRow {
  id: string;
  family_id: string;
  url: string;
  /** Series (products.sub_category) this image is specific to; null = general. */
  series: string | null;
  sort_order: number;
}

/**
 * One image of a family's gallery as edited/rendered: the URL plus the series
 * it is tagged for (null = shown for every series). The FAMILY owns its images
 * — products carry no image links of their own.
 */
export interface FamilyImageEntry {
  url: string;
  series: string | null;
}

/** Ordered gallery entries for a family, primary (lowest sort_order) first. */
export function orderFamilyImages(
  rows: Pick<FamilyImageRow, 'url' | 'series' | 'sort_order'>[],
): FamilyImageEntry[] {
  return [...rows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((r) => ({ url: r.url, series: r.series ?? null }));
}

/** Append a url (untagged) unless the list is full or already contains it. */
export function addFamilyImage(list: FamilyImageEntry[], url: string): FamilyImageEntry[] {
  if (list.some((e) => e.url === url) || list.length >= MAX_FAMILY_IMAGES) return list;
  return [...list, { url, series: null }];
}

/** Remove the entry at `index` (no-op if out of range). Returns a new list. */
export function removeFamilyImage(list: FamilyImageEntry[], index: number): FamilyImageEntry[] {
  if (index < 0 || index >= list.length) return list;
  return list.filter((_, i) => i !== index);
}

/** Move the entry at `index` to the front (primary); others keep order. */
export function setPrimaryFamilyImage(list: FamilyImageEntry[], index: number): FamilyImageEntry[] {
  if (index <= 0 || index >= list.length) return list;
  const next = [...list];
  const [moved] = next.splice(index, 1);
  next.unshift(moved);
  return next;
}

/** Move the entry at `index` one step left/right, clamped at the edges. */
export function moveFamilyImage(list: FamilyImageEntry[], index: number, dir: 'left' | 'right'): FamilyImageEntry[] {
  const target = dir === 'left' ? index - 1 : index + 1;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Tag the entry at `index` for a series ('' or null clears the tag). */
export function setFamilyImageSeries(
  list: FamilyImageEntry[], index: number, series: string | null,
): FamilyImageEntry[] {
  if (index < 0 || index >= list.length) return list;
  return list.map((e, i) => (i === index ? { ...e, series: series?.trim() ? series : null } : e));
}

/** Group raw image rows by family_id → ordered entry list (primary first). */
export function groupImagesByFamily(rows: FamilyImageRow[]): Map<string, FamilyImageEntry[]> {
  const byId = new Map<string, FamilyImageRow[]>();
  for (const r of rows) {
    const arr = byId.get(r.family_id) ?? [];
    arr.push(r);
    byId.set(r.family_id, arr);
  }
  const out = new Map<string, FamilyImageEntry[]>();
  for (const [id, rs] of byId) out.set(id, orderFamilyImages(rs));
  return out;
}

/** Re-key a family_id→entries map to family_code→entries. Empty families are omitted. */
export function imagesByCode(
  families: { id: string; code: string }[],
  byFamilyId: Map<string, FamilyImageEntry[]>,
): Map<string, FamilyImageEntry[]> {
  const out = new Map<string, FamilyImageEntry[]>();
  for (const f of families) {
    const entries = byFamilyId.get(f.id);
    if (entries && entries.length) out.set(f.code, entries);
  }
  return out;
}

/**
 * The images a configuration shows, resolved from its family's gallery:
 * images tagged for the configuration's series first (in gallery order), then
 * the untagged (general) ones — de-duplicated by URL. When nothing matches
 * (e.g. every image is tagged for other series), fall back to the whole
 * gallery rather than showing nothing.
 */
export function resolveSeriesImages(
  entries: FamilyImageEntry[] | undefined,
  series: string | null,
): string[] {
  if (!entries || entries.length === 0) return [];
  const tagged = series ? entries.filter((e) => e.series === series) : [];
  const untagged = entries.filter((e) => e.series === null);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of [...tagged, ...untagged]) {
    if (!seen.has(e.url)) { seen.add(e.url); out.push(e.url); }
  }
  if (out.length) return out;
  for (const e of entries) {
    if (!seen.has(e.url)) { seen.add(e.url); out.push(e.url); }
  }
  return out;
}
