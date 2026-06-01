import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { supabase } from './supabase';

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calcReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 1;
  return Math.max(1, Math.ceil(words / 200));
}

marked.setOptions({ gfm: true, breaks: true });

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a',
  'h2', 'h3', 'blockquote', 'code', 'pre',
];

export function renderPostBody(markdown: string): string {
  const html = marked.parse(markdown, { async: false }) as string;
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'rel', 'target'],
  });
  // Force safe link attrs on any surviving anchor (dedupe existing ones).
  return sanitized.replace(
    /<a\s+([^>]*?)>/g,
    (_m, attrs) => {
      const clean = attrs.replace(/\s*(rel|target)="[^"]*"/g, '').trim();
      return `<a ${clean} rel="noopener noreferrer" target="_blank">`;
    },
  );
}

/** Upload a cover image and return its public URL. */
export async function uploadCoverImage(
  file: File,
  postId: string,
): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const path = `${postId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('blog-covers')
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from('blog-covers').getPublicUrl(path);
  return { url: data.publicUrl };
}
