/**
 * Pure helpers for renaming a library image (admin Images tab).
 * The rename is REAL — the storage object moves to a new path — so the tab
 * executes: storage copy → atomic DB rewrite (rename_library_image RPC) →
 * deferred re-checked cleanup of the old object. This module only computes
 * the plan; colocated tests in image-rename.test.ts.
 */
import { storagePathFromUrl } from './image-refs';

/** Storage-safe object name — the same rule the upload paths use. */
export function sanitiseName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-]+/g, '-');
}

export interface RenamePlan {
  /** New display name (extension preserved from the stored object). */
  newFilename: string;
  /** New storage object path: uploads/{uuid}-{sanitised newFilename}. */
  newPath: string;
}

const IMAGE_EXTS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.bmp', '.tif', '.tiff', '.ico',
]);

/** Extension (with dot) at the end of a name, '' when there is none. */
function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return '';
  const ext = name.slice(dot);
  return /^\.[a-zA-Z0-9]+$/.test(ext) ? ext : '';
}

/**
 * Validate a requested name and compute the new display name + storage path.
 * The file's bytes never change, so the stored extension always wins: a typed
 * IMAGE extension (or one matching the stored extension) is stripped and the
 * original re-appended — but a dotted version suffix like "valve-v1.2" is
 * kept as part of the name. When the stored object has no extension the
 * typed name is used as-is.
 */
export function planImageRename(
  current: { url: string; filename: string | null },
  requestedName: string,
  uuid: string,
): { plan: RenamePlan } | { error: string } {
  const typed = requestedName.trim();
  if (typed === '') return { error: 'Enter a name for the image.' };

  const storedName = storagePathFromUrl(current.url)?.split('/').pop() ?? '';
  const ext = extensionOf(storedName) || extensionOf(current.filename ?? '');

  const typedExt = extensionOf(typed);
  const stripTyped =
    ext !== '' &&
    typedExt !== '' &&
    (IMAGE_EXTS.has(typedExt.toLowerCase()) || typedExt.toLowerCase() === ext.toLowerCase());
  const base = stripTyped ? typed.slice(0, typed.length - typedExt.length) : typed;
  if (base === '') return { error: 'Enter a name for the image.' };
  if (!/[a-zA-Z0-9]/.test(base)) {
    return { error: 'The name must contain at least one letter or number.' };
  }

  const newFilename = base + ext;
  if (newFilename === current.filename) {
    return { error: 'The image is already called that.' };
  }

  return { plan: { newFilename, newPath: `uploads/${uuid}-${sanitiseName(newFilename)}` } };
}
