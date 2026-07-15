import { supabase } from './supabase';

// Funded projects reuse the blog's markdown/slug helpers — single source of
// truth, re-exported so funded-project modules import from one place.
export { slugify, renderPostBody as renderProjectBody } from './posts';

/** Upload a project logo and return its public URL. */
export async function uploadProjectLogo(
  file: File,
  projectId: string,
): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() ?? 'png').toLowerCase();
  const path = `${projectId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('project-logos')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('project-logos').getPublicUrl(path);
  return { url: data.publicUrl };
}
