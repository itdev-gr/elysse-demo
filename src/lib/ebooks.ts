import { supabase } from './supabase';
import type { Ebook } from '../types/ebook';
export { slugify, renderPostBody } from './posts';

export async function listEbooks(): Promise<Ebook[]> {
  const { data, error } = await supabase
    .from('ebooks').select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Ebook[];
}

export async function getEbookBySlug(slug: string): Promise<Ebook | null> {
  const { data, error } = await supabase
    .from('ebooks').select('*')
    .eq('slug', slug).eq('is_published', true).maybeSingle();
  if (error || !data) return null;
  return data as Ebook;
}

export async function uploadEbookImage(file: File, rowId: string): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const path = `ebooks/${rowId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('insights')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('insights').getPublicUrl(path);
  return { url: data.publicUrl };
}
