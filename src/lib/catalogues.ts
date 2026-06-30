import { supabase } from './supabase';
import type { Catalogue } from '../types/catalogue';

export interface CatalogueNode extends Catalogue {
  children: Catalogue[];
}

/**
 * Build the two-level catalogue tree: top-level categories with their
 * subcategories nested, both ordered by sort_order then name. Subcategories
 * whose parent is absent (deleted or hidden) are dropped.
 */
export function buildCatalogueTree(rows: Catalogue[]): CatalogueNode[] {
  const sorted = [...rows].sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
  );
  const categories: CatalogueNode[] = sorted
    .filter((r) => !r.parent_id)
    .map((r) => ({ ...r, children: [] }));
  const byId = new Map(categories.map((c) => [c.id, c]));
  for (const r of sorted) {
    if (r.parent_id) byId.get(r.parent_id)?.children.push(r);
  }
  return categories;
}

const PDF_MAX = 25 * 1024 * 1024;

/** Returns an error message, or null when the file is acceptable. */
export function validateCataloguePdf(file: { type: string; size: number }): string | null {
  if (file.type !== 'application/pdf') return 'Catalogue must be a PDF file.';
  if (file.size > PDF_MAX) return 'PDF must be 25 MB or smaller.';
  return null;
}

type CataloguePdfRow = {
  pdf_url_black: string | null;
  pdf_url_blue: string | null;
  groups_black: string[] | null;
  groups_blue: string[] | null;
};

/** Resolve which PDF (if any) to serve the visitor.
 *  Black wins when the visitor's group appears in both slots. */
export function pickCataloguePdf(
  row: CataloguePdfRow,
  groupCode: string | null,
): { url: string; slot: 'black' | 'blue' } | null {
  if (!groupCode) return null;
  const black = row.groups_black ?? [];
  const blue = row.groups_blue ?? [];
  if (row.pdf_url_black && black.includes(groupCode))
    return { url: row.pdf_url_black, slot: 'black' };
  if (row.pdf_url_blue && blue.includes(groupCode))
    return { url: row.pdf_url_blue, slot: 'blue' };
  return null;
}

/** Upload a catalogue PDF and return its public URL.
 *  Storage path: `{catalogueId}/{slot}-{uuid}.pdf` — slot visible in the URL
 *  helps debugging and rules out cross-slot collisions. */
export async function uploadCataloguePdf(
  file: File,
  catalogueId: string,
  slot: 'black' | 'blue' = 'black',
): Promise<{ url: string }> {
  const path = `${catalogueId}/${slot}-${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage
    .from('catalogues')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('catalogues').getPublicUrl(path);
  return { url: data.publicUrl };
}
