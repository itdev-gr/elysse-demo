import { describe, expect, it } from 'vitest';
import { zipEntryNames } from './image-zip';

const BUCKET = 'https://x.supabase.co/storage/v1/object/public/product-images/';
const img = (filename: string | null, path = 'uploads/u1-file.jpg') =>
  ({ filename, url: `${BUCKET}${path}` });

describe('zipEntryNames', () => {
  it('uses the display filename as-is', () => {
    expect(zipEntryNames([img('Epsilon Valve 1.2.png')])).toEqual(['Epsilon Valve 1.2.png']);
  });
  it('preserves input order', () => {
    expect(zipEntryNames([img('b.jpg'), img('a.jpg')])).toEqual(['b.jpg', 'a.jpg']);
  });
  it('falls back to the storage basename when filename is null or empty', () => {
    expect(zipEntryNames([img(null, 'uploads/u1-pipe.png')])).toEqual(['u1-pipe.png']);
    expect(zipEntryNames([img('', 'uploads/u1-pipe.png')])).toEqual(['u1-pipe.png']);
  });
  it('falls back to image-<n> when there is no usable name at all', () => {
    expect(zipEntryNames([{ filename: null, url: 'not-a-bucket-url' }])).toEqual(['image-1']);
  });
  it('dedupes collisions with a numbered suffix before the extension', () => {
    expect(zipEntryNames([img('pipe.jpg'), img('pipe.jpg'), img('pipe.jpg')]))
      .toEqual(['pipe.jpg', 'pipe (2).jpg', 'pipe (3).jpg']);
  });
  it('dedupes case-insensitively', () => {
    expect(zipEntryNames([img('Pipe.JPG'), img('pipe.jpg')]))
      .toEqual(['Pipe.JPG', 'pipe (2).jpg']);
  });
  it('suffixes extension-less names at the end', () => {
    expect(zipEntryNames([img('scan'), img('scan')])).toEqual(['scan', 'scan (2)']);
  });
  it('keeps counting past suffixes that are already taken', () => {
    expect(zipEntryNames([img('pipe.jpg'), img('pipe (2).jpg'), img('pipe.jpg')]))
      .toEqual(['pipe.jpg', 'pipe (2).jpg', 'pipe (3).jpg']);
  });
});
