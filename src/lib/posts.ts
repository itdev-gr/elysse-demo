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
  'h2', 'h3', 'blockquote', 'code', 'pre', 'img',
];

/** Hostname of our own Supabase project, derived from the public env var. */
function supabaseHost(): string | null {
  const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Images may only be served from our own Supabase Storage — never hot-linked
 * from the source site. Accepts absolute URLs on our project host, or any
 * Supabase Storage public object URL.
 */
function isAllowedImgSrc(src: string): boolean {
  let u: URL;
  try {
    u = new URL(src);
  } catch {
    return false; // relative / malformed → reject
  }
  const host = u.hostname.toLowerCase();
  if (host === 'elysee.com.cy' || host.endsWith('.elysee.com.cy')) return false;
  const own = supabaseHost();
  if (own && host === own) return true;
  return host.endsWith('.supabase.co') && u.pathname.includes('/storage/v1/object/public/');
}

/** A link is "off-site" if it is relative or points back at the source site. */
function isOffsiteHref(href: string): boolean {
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(href)) return true; // relative
  try {
    const host = new URL(href).hostname.toLowerCase();
    return host === 'elysee.com.cy' || host.endsWith('.elysee.com.cy');
  } catch {
    return true;
  }
}

export function renderPostBody(markdown: string): string {
  const html = marked.parse(markdown, { async: false }) as string;
  let sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'rel', 'target', 'src', 'alt'],
  });

  // Drop any image not served from our own Supabase Storage.
  sanitized = sanitized.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = (tag.match(/\ssrc="([^"]*)"/i) || [])[1] ?? '';
    if (!isAllowedImgSrc(src)) return '';
    return tag.replace(/^<img\b/i, '<img loading="lazy" decoding="async"');
  });

  // Unwrap links that point back at the source site (keep their text).
  sanitized = sanitized.replace(
    /<a\b([^>]*)>([\s\S]*?)<\/a>/gi,
    (full, attrs, text) => {
      const href = (attrs.match(/\shref="([^"]*)"/i) || [])[1] ?? '';
      return isOffsiteHref(href) ? text : full;
    },
  );

  // Force safe link attrs on any surviving (off-site-free) anchor.
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
