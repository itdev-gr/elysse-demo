import { describe, it, expect } from 'vitest';
import { storagePathFromUrl, deleteBlockedMessage } from './image-refs';

describe('storagePathFromUrl', () => {
  const base = 'https://x.supabase.co/storage/v1/object/public/product-images/';
  it('extracts and decodes the object path', () => {
    expect(storagePathFromUrl(`${base}uploads/abc-photo.jpg`)).toBe('uploads/abc-photo.jpg');
    expect(storagePathFromUrl(`${base}lambda-series/370t.jpg`)).toBe('lambda-series/370t.jpg');
  });
  it('decodes percent-escapes (%20 → space)', () => {
    expect(storagePathFromUrl(`${base}uploads/my%20photo.jpg`)).toBe('uploads/my photo.jpg');
  });
  it('returns null for other buckets, external hosts and static assets', () => {
    expect(storagePathFromUrl('https://x.supabase.co/storage/v1/object/public/blog-covers/a.jpg')).toBeNull();
    expect(storagePathFromUrl('https://example.com/a.jpg')).toBeNull();
    expect(storagePathFromUrl('/images/products/categories/compression-fittings.png')).toBeNull();
    expect(storagePathFromUrl(base)).toBeNull(); // bare prefix, no object
  });
  it('survives malformed escapes without throwing', () => {
    expect(storagePathFromUrl(`${base}uploads/bad%zz.jpg`)).toBe('uploads/bad%zz.jpg');
  });
});

describe('deleteBlockedMessage', () => {
  it('names the blocking galleries with correct pluralisation', () => {
    const msg = deleteBlockedMessage('370t.jpg', { gallery_rows: 1, families: ['370T'] });
    expect(msg).toContain('"370t.jpg"');
    expect(msg).toContain('1 family gallery image (families: 370T)');
  });
  it('pluralises and lists multiple families', () => {
    const msg = deleteBlockedMessage('a.jpg', { gallery_rows: 3, families: ['330', '370T'] });
    expect(msg).toContain('3 family gallery images (families: 330, 370T)');
  });
});
