import { supabase } from './supabase';
import type { Media } from '../types/media';
export { slugify, renderPostBody } from './posts';

export async function listMedia(): Promise<Media[]> {
  const { data, error } = await supabase
    .from('media').select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Media[];
}

export async function getMediaBySlug(slug: string): Promise<Media | null> {
  const { data, error } = await supabase
    .from('media').select('*')
    .eq('slug', slug).eq('is_published', true).maybeSingle();
  if (error || !data) return null;
  return data as Media;
}

export async function uploadMediaImage(file: File, rowId: string): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const path = `media/${rowId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('insights')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('insights').getPublicUrl(path);
  return { url: data.publicUrl };
}
