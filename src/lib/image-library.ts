import { supabase } from './supabase';
import { sanitiseName } from './image-rename';
import type { ProductImage } from '../components/admin/ImageLibraryGrid';

/**
 * Failure from uploadLibraryImage. `stage` lets callers keep distinct copy for
 * "nothing was saved" (upload) vs "file stored but the record insert failed"
 * (insert) — the Images tab shows different messages for the two.
 */
export class LibraryUploadError extends Error {
  stage: 'upload' | 'insert';
  constructor(stage: 'upload' | 'insert', message: string) {
    super(message);
    this.name = 'LibraryUploadError';
    this.stage = stage;
  }
}

/**
 * The one upload path into the shared image library: storage object in the
 * `product-images` bucket at uploads/<uuid>-<sanitised name>, then a
 * `product_images` row ({ url, filename, family_code: null, source: 'upload' }).
 * Returns the inserted row. The client parameter exists for tests.
 */
export async function uploadLibraryImage(
  file: File,
  client: typeof supabase = supabase,
): Promise<ProductImage> {
  const path = `uploads/${crypto.randomUUID()}-${sanitiseName(file.name)}`;

  const { error: upErr } = await client.storage
    .from('product-images')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw new LibraryUploadError('upload', upErr.message);

  const { data: urlData } = client.storage.from('product-images').getPublicUrl(path);

  const { data, error: insErr } = await client
    .from('product_images')
    .insert({ url: urlData.publicUrl, filename: file.name, family_code: null, source: 'upload' })
    .select()
    .single();
  if (insErr) throw new LibraryUploadError('insert', insErr.message);
  return data as ProductImage;
}
