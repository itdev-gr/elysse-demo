import { describe, expect, it } from 'vitest';
import { planImageRename, sanitiseName } from './image-rename';

const BUCKET = 'https://x.supabase.co/storage/v1/object/public/product-images/';
const img = (path: string, filename: string | null) =>
  ({ url: `${BUCKET}${path}`, filename });

describe('sanitiseName', () => {
  it('replaces runs of disallowed characters with a single dash', () => {
    expect(sanitiseName('my photo (2).jpg')).toBe('my-photo-2-.jpg');
  });
  it('keeps letters, digits, dots and dashes', () => {
    expect(sanitiseName('Epsilon-1.2.png')).toBe('Epsilon-1.2.png');
  });
});

describe('planImageRename', () => {
  const current = img('uploads/u1-old-name.jpg', 'old-name.jpg');

  it('rejects an empty or whitespace name', () => {
    expect(planImageRename(current, '', 'u2')).toEqual({ error: 'Enter a name for the image.' });
    expect(planImageRename(current, '   ', 'u2')).toEqual({ error: 'Enter a name for the image.' });
  });
  it('rejects renaming to the current name', () => {
    expect(planImageRename(current, 'old-name.jpg', 'u2'))
      .toEqual({ error: 'The image is already called that.' });
    expect(planImageRename(current, 'old-name', 'u2'))
      .toEqual({ error: 'The image is already called that.' });
  });
  it('appends the stored extension when the admin types none', () => {
    expect(planImageRename(current, 'epsilon-valve', 'u2')).toEqual({
      plan: { newFilename: 'epsilon-valve.jpg', newPath: 'uploads/u2-epsilon-valve.jpg' },
    });
  });
  it('replaces a typed extension with the stored one (type cannot change)', () => {
    expect(planImageRename(current, 'epsilon-valve.png', 'u2')).toEqual({
      plan: { newFilename: 'epsilon-valve.jpg', newPath: 'uploads/u2-epsilon-valve.jpg' },
    });
  });
  it('keeps dots inside the base name', () => {
    expect(planImageRename(current, 'valve-v1.2', 'u2')).toEqual({
      plan: { newFilename: 'valve-v1.2.jpg', newPath: 'uploads/u2-valve-v1.2.jpg' },
    });
  });
  it('sanitises the path but keeps the raw display name', () => {
    expect(planImageRename(current, 'my summer photo', 'u2')).toEqual({
      plan: { newFilename: 'my summer photo.jpg', newPath: 'uploads/u2-my-summer-photo.jpg' },
    });
  });
  it('uses the typed name as-is when the stored object has no extension', () => {
    expect(planImageRename(img('uploads/u1-scan', 'scan'), 'better-scan.jpg', 'u2')).toEqual({
      plan: { newFilename: 'better-scan.jpg', newPath: 'uploads/u2-better-scan.jpg' },
    });
  });
  it('falls back to the filename extension for URLs outside the bucket', () => {
    expect(planImageRename({ url: 'https://example.com/a', filename: 'a.png' }, 'b', 'u2')).toEqual({
      plan: { newFilename: 'b.png', newPath: 'uploads/u2-b.png' },
    });
  });
  it('rejects a name with no letters or numbers', () => {
    expect(planImageRename(current, '???.jpg', 'u2'))
      .toEqual({ error: 'The name must contain at least one letter or number.' });
  });
});
