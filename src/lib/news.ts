import { supabase } from './supabase';

// News shares the blog's markdown/slug/reading-time helpers — single source of
// truth, re-exported so news modules import from one place.
export { slugify, calcReadingMinutes, renderPostBody as renderNewsBody } from './posts';

/** Upload a news cover image and return its public URL. */
export async function uploadNewsCover(
  file: File,
  articleId: string,
): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const path = `${articleId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('news-covers')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('news-covers').getPublicUrl(path);
  return { url: data.publicUrl };
}
