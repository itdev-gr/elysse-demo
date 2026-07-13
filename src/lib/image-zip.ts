/**
 * Pure naming for the Images tab's bulk ZIP download. Archive entries carry
 * the admin-facing display filename; duplicate names are deduped because ZIP
 * archives with repeated entry names extract unpredictably (or refuse to) in
 * some tools. Colocated tests in image-zip.test.ts.
 */
import { storagePathFromUrl } from './image-refs';

/** Split "name.ext" so the dedupe suffix lands before the extension. */
function splitExt(name: string): { stem: string; ext: string } {
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return { stem: name, ext: '' };
  return { stem: name.slice(0, dot), ext: name.slice(dot) };
}

/**
 * One collision-free archive entry name per image, order-preserving.
 * Base name: display filename → storage basename → "image-<n>".
 * Collisions (case-insensitive) get " (2)", " (3)"… before the extension.
 */
export function zipEntryNames(images: { filename: string | null; url: string }[]): string[] {
  const taken = new Set<string>();
  return images.map((img, i) => {
    const base =
      (img.filename ?? '').trim() ||
      (storagePathFromUrl(img.url)?.split('/').pop() ?? '') ||
      `image-${i + 1}`;
    let name = base;
    const { stem, ext } = splitExt(base);
    for (let n = 2; taken.has(name.toLowerCase()); n++) {
      name = `${stem} (${n})${ext}`;
    }
    taken.add(name.toLowerCase());
    return name;
  });
}
