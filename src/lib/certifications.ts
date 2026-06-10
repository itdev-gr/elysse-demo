import { supabase } from './supabase';
import type { Certification } from '../types/certification';

/** Stable sort: sort_order ascending, ties broken by name. */
export function sortCertifications(certs: Certification[]): Certification[] {
  return [...certs].sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
  );
}

/** Next sort_order for a new certification within a group. */
export function nextSortOrder(certs: Pick<Certification, 'sort_order'>[]): number {
  return certs.reduce((max, c) => Math.max(max, c.sort_order), 0) + 1;
}

const PDF_MAX = 10 * 1024 * 1024;
const BADGE_MAX = 2 * 1024 * 1024;
const BADGE_MIME = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];

/** Returns an error message, or null when the file is acceptable. */
export function validateCertificationFile(
  file: { type: string; size: number },
  kind: 'pdf' | 'badge',
): string | null {
  if (kind === 'pdf') {
    if (file.type !== 'application/pdf') return 'Certificate must be a PDF file.';
    if (file.size > PDF_MAX) return 'PDF must be 10 MB or smaller.';
    return null;
  }
  if (!BADGE_MIME.includes(file.type)) return 'Badge must be an image (SVG, PNG, JPEG or WebP).';
  if (file.size > BADGE_MAX) return 'Badge image must be 2 MB or smaller.';
  return null;
}

const EXT_FALLBACK: Record<'pdf' | 'badge', string> = { pdf: 'pdf', badge: 'png' };

/** Upload a certificate asset (PDF or badge image) and return its public URL. */
export async function uploadCertificationAsset(
  file: File,
  certId: string,
  kind: 'pdf' | 'badge',
): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() ?? EXT_FALLBACK[kind]).toLowerCase();
  const path = `${certId}/${kind}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('certificates')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('certificates').getPublicUrl(path);
  return { url: data.publicUrl };
}
