import { supabase } from './supabase';

// R&D posts share the blog's markdown/slug/reading-time helpers — single source
// of truth, re-exported so R&D modules import from one place.
export { slugify, calcReadingMinutes, renderPostBody as renderResearchBody } from './posts';

/** Upload an R&D post cover image and return its public URL. */
export async function uploadResearchCover(
  file: File,
  postId: string,
): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const path = `${postId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('research-covers')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('research-covers').getPublicUrl(path);
  return { url: data.publicUrl };
}
