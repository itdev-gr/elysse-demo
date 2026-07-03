/** A family's images are capped at this many (enforced in app logic, not the DB). */
export const MAX_FAMILY_IMAGES = 5;

/** One row of product_family_images. */
export interface FamilyImageRow {
  id: string;
  family_id: string;
  url: string;
  sort_order: number;
}

/** Ordered image URLs for a family, primary (lowest sort_order) first. */
export function orderFamilyImages(rows: Pick<FamilyImageRow, 'url' | 'sort_order'>[]): string[] {
  return [...rows].sort((a, b) => a.sort_order - b.sort_order).map((r) => r.url);
}

/** Append a url unless the list is full or already contains it. Returns a new list. */
export function addFamilyImage(list: string[], url: string): string[] {
  if (list.includes(url) || list.length >= MAX_FAMILY_IMAGES) return list;
  return [...list, url];
}

/** Remove the url at `index` (no-op if out of range). Returns a new list. */
export function removeFamilyImage(list: string[], index: number): string[] {
  if (index < 0 || index >= list.length) return list;
  return list.filter((_, i) => i !== index);
}

/** Move the url at `index` to the front (primary); others keep order. Returns a new list. */
export function setPrimaryFamilyImage(list: string[], index: number): string[] {
  if (index <= 0 || index >= list.length) return list;
  const next = [...list];
  const [moved] = next.splice(index, 1);
  next.unshift(moved);
  return next;
}

/** Move the url at `index` one step left/right, clamped at the edges. Returns a new list. */
export function moveFamilyImage(list: string[], index: number, dir: 'left' | 'right'): string[] {
  const target = dir === 'left' ? index - 1 : index + 1;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Group raw image rows by family_id → ordered URL list (primary first). */
export function groupImagesByFamily(rows: FamilyImageRow[]): Map<string, string[]> {
  const byId = new Map<string, FamilyImageRow[]>();
  for (const r of rows) {
    const arr = byId.get(r.family_id) ?? [];
    arr.push(r);
    byId.set(r.family_id, arr);
  }
  const out = new Map<string, string[]>();
  for (const [id, rs] of byId) out.set(id, orderFamilyImages(rs));
  return out;
}

/** Re-key a family_id→urls map to family_code→urls. Families with no images are omitted. */
export function imagesByCode(
  families: { id: string; code: string }[],
  byFamilyId: Map<string, string[]>,
): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const f of families) {
    const urls = byFamilyId.get(f.id);
    if (urls && urls.length) out.set(f.code, urls);
  }
  return out;
}
