import { supabase } from './supabase';
export { slugify } from './posts';

export async function uploadEbookImage(file: File, rowId: string): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const path = `ebooks/${rowId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('insights')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('insights').getPublicUrl(path);
  return { url: data.publicUrl };
}
