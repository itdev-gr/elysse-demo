/**
 * Helpers for reference-aware image deletion (admin Images tab).
 * Pure — colocated tests in image-refs.test.ts.
 */

/** Usage counts returned by the delete_library_image RPC when it refuses. */
export interface ImageUsage {
  products: number;
  family_mirrors: number;
  gallery_rows: number;
  families: string[];
}

const PUBLIC_PREFIX = '/storage/v1/object/public/product-images/';

/**
 * Storage object path (decoded) for a product-images public URL, or null when
 * the URL points elsewhere (other bucket, external host, static asset).
 * supabase-js storage.remove() expects the DECODED object name.
 */
export function storagePathFromUrl(url: string): string | null {
  const idx = url.indexOf(PUBLIC_PREFIX);
  if (idx === -1) return null;
  const raw = url.slice(idx + PUBLIC_PREFIX.length);
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw; // malformed escape — best effort, matches how it was stored
  }
}

/** Human message for a blocked delete, listing what still uses the image. */
export function deleteBlockedMessage(filename: string, usage: ImageUsage): string {
  const parts: string[] = [];
  if (usage.products > 0) parts.push(`${usage.products} product${usage.products === 1 ? '' : 's'}`);
  if (usage.family_mirrors > 0) parts.push(`${usage.family_mirrors} family cover${usage.family_mirrors === 1 ? '' : 's'}`);
  if (usage.gallery_rows > 0) {
    const fams = usage.families.length ? ` (families: ${usage.families.join(', ')})` : '';
    parts.push(`${usage.gallery_rows} family gallery image${usage.gallery_rows === 1 ? '' : 's'}${fams}`);
  }
  return `Cannot delete "${filename}" — still used by ${parts.join(', ')}. ` +
    'Remove it from the family galleries first (Families tab → Manage images). ' +
    'Legacy per-product references can only be cleared in the product form until the image-column retirement.';
}
