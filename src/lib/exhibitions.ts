import { supabase } from './supabase';
import type { Exhibition } from '../types/exhibition';
export { slugify, renderPostBody } from './posts';

export async function listExhibitions(): Promise<Exhibition[]> {
  const { data, error } = await supabase
    .from('exhibitions').select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Exhibition[];
}

export async function getExhibitionBySlug(slug: string): Promise<Exhibition | null> {
  const { data, error } = await supabase
    .from('exhibitions').select('*')
    .eq('slug', slug).eq('is_published', true).maybeSingle();
  if (error || !data) return null;
  return data as Exhibition;
}

export async function uploadExhibitionImage(file: File, rowId: string): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const path = `exhibitions/${rowId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('insights')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('insights').getPublicUrl(path);
  return { url: data.publicUrl };
}
