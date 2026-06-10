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

/** Upload a catalogue PDF and return its public URL. */
export async function uploadCataloguePdf(
  file: File,
  catalogueId: string,
): Promise<{ url: string }> {
  const path = `${catalogueId}/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage
    .from('catalogues')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('catalogues').getPublicUrl(path);
  return { url: data.publicUrl };
}
