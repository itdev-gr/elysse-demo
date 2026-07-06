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
  it('lists every non-zero usage with correct pluralisation', () => {
    const msg = deleteBlockedMessage('370t.jpg', {
      products: 23, family_mirrors: 1, gallery_rows: 1, families: ['370T'],
    });
    expect(msg).toContain('"370t.jpg"');
    expect(msg).toContain('23 products');
    expect(msg).toContain('1 family cover');
    expect(msg).toContain('1 family gallery image (families: 370T)');
  });
  it('omits zero-count parts', () => {
    const msg = deleteBlockedMessage('a.jpg', {
      products: 1, family_mirrors: 0, gallery_rows: 0, families: [],
    });
    expect(msg).toContain('1 product');
    expect(msg).not.toContain('family cover');
    expect(msg).not.toContain('gallery image');
  });
});
