# Category Image via Shared Image Library — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-07-15-category-image-library-picker-design.md`

**Goal:** Replace the category admin form's free-text "Image path" input with a pick-or-upload modal backed by the shared product image library, saving the chosen image's public URL to `product_categories.image`.

**Architecture:** Extract the Images-tab inline upload into a reusable `uploadLibraryImage()` helper in `src/lib/image-library.ts` (dependency-injected Supabase client so it's unit-testable). A new `ImageLibraryPicker` modal component loads the `product_images` library, renders the existing `LibraryGrid` pick-only, and offers an "Upload new" input that auto-picks the fresh upload. `CategoryForm` swaps the text field for a thumbnail preview + "Choose from library" button.

**Tech Stack:** Astro + React islands (TypeScript, Tailwind), Supabase (storage bucket `product-images`, table `product_images`), Vitest.

## Global Constraints

- **NO `git commit` at any step.** Standing user preference: the user reviews and approves the diff first. Where a plan would normally commit, just stop; the final task presents the diff for review.
- Display sites of `product_categories.image` (MegaNav, MobileMegaNav, MegaCard, ProductCategoryGrid, catalog pages) must NOT change — the column still holds a URL/path string.
- No behaviour change to the Images tab upload (same storage path shape `uploads/<uuid>-<sanitised>`, same `product_images` row fields, same error messages) or to the Families "assign images" flow (its inline upload stays as-is; it inserts `family_code`, out of scope).
- Subcategories are out of scope (no image column).
- The picker is pick + upload only — no delete/rename (those stay in the Images tab).
- Tests run with `npm test` (vitest run). Typecheck with `npx astro check`.
- Existing tests must keep passing.

## File Structure

- Create: `src/lib/image-library.ts` — `LibraryUploadError` + `uploadLibraryImage(file, client?)`; the ONLY upload path for library images used by ImagesTab + the picker.
- Create: `src/lib/image-library.test.ts` — unit tests with a stubbed client.
- Create: `src/components/admin/ImageLibraryPicker.tsx` — pick/upload modal.
- Modify: `src/components/admin/ImagesTab.tsx` — `handleFileChange` delegates to the helper.
- Modify: `src/components/admin/CategoryForm.tsx` — image field → preview + picker.

---

### Task 1: `uploadLibraryImage` helper (`src/lib/image-library.ts`)

**Files:**
- Create: `src/lib/image-library.ts`
- Test: `src/lib/image-library.test.ts`

**Interfaces:**
- Consumes: `sanitiseName(name: string): string` from `src/lib/image-rename.ts` (replaces runs of `[^a-zA-Z0-9.\-]` with `-`); `supabase` client from `src/lib/supabase.ts` (import-safe without env vars — falls back to a placeholder client); type `ProductImage` from `src/components/admin/ImageLibraryGrid.tsx` (`{ id, url, filename, family_code, source, created_at }`).
- Produces: `class LibraryUploadError extends Error { stage: 'upload' | 'insert' }` and `uploadLibraryImage(file: File, client = supabase): Promise<ProductImage>` — Tasks 2 and 3 call these exact names.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/image-library.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { uploadLibraryImage, LibraryUploadError } from './image-library';

type Client = NonNullable<Parameters<typeof uploadLibraryImage>[1]>;

const ROW = {
  id: 'img-1',
  url: 'https://cdn.test/product-images/uploads/whatever.png',
  filename: 'photo.png',
  family_code: null,
  source: 'upload',
  created_at: '2026-07-20T00:00:00Z',
};

function makeClient({ uploadError = null, insertError = null }: {
  uploadError?: { message: string } | null;
  insertError?: { message: string } | null;
} = {}) {
  const upload = vi.fn(
    async (_path: string, _file: File, _opts: { upsert: boolean; contentType: string }) =>
      ({ error: uploadError }),
  );
  const getPublicUrl = vi.fn((path: string) => ({
    data: { publicUrl: `https://cdn.test/product-images/${path}` },
  }));
  const single = vi.fn(async () =>
    insertError ? { data: null, error: insertError } : { data: ROW, error: null });
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn((_values: Record<string, unknown>) => ({ select }));
  const client = {
    storage: { from: vi.fn(() => ({ upload, getPublicUrl })) },
    from: vi.fn(() => ({ insert })),
  };
  return { client: client as unknown as Client, upload, getPublicUrl, insert };
}

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

describe('uploadLibraryImage', () => {
  it('uploads to uploads/<uuid>-<sanitised>, records the row, returns it', async () => {
    const { client, upload, getPublicUrl, insert } = makeClient();
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    const row = await uploadLibraryImage(file, client);

    expect(row).toEqual(ROW);
    const [path, sentFile, opts] = upload.mock.calls[0];
    expect(path).toMatch(new RegExp(`^uploads/${UUID}-photo\\.png$`));
    expect(sentFile).toBe(file);
    expect(opts).toEqual({ upsert: true, contentType: 'image/png' });
    expect(getPublicUrl).toHaveBeenCalledWith(path);
    expect(insert).toHaveBeenCalledWith({
      url: `https://cdn.test/product-images/${path}`,
      filename: 'photo.png',
      family_code: null,
      source: 'upload',
    });
  });

  it('sanitises the storage path but keeps the original filename in the record', async () => {
    const { client, upload, insert } = makeClient();
    await uploadLibraryImage(new File(['x'], 'my photo (1).png', { type: 'image/png' }), client);
    expect(upload.mock.calls[0][0]).toMatch(/-my-photo-1-\.png$/);
    expect(insert.mock.calls[0][0]).toMatchObject({ filename: 'my photo (1).png' });
  });

  it('throws a stage "upload" error and skips the insert when storage fails', async () => {
    const { client, insert } = makeClient({ uploadError: { message: 'quota exceeded' } });
    const err = await uploadLibraryImage(new File(['x'], 'a.png', { type: 'image/png' }), client)
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(LibraryUploadError);
    expect((err as LibraryUploadError).stage).toBe('upload');
    expect((err as LibraryUploadError).message).toBe('quota exceeded');
    expect(insert).not.toHaveBeenCalled();
  });

  it('throws a stage "insert" error when the record insert fails', async () => {
    const { client } = makeClient({ insertError: { message: 'RLS says no' } });
    const err = await uploadLibraryImage(new File(['x'], 'a.png', { type: 'image/png' }), client)
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(LibraryUploadError);
    expect((err as LibraryUploadError).stage).toBe('insert');
    expect((err as LibraryUploadError).message).toBe('RLS says no');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/lib/image-library.test.ts`
Expected: FAIL — cannot resolve `./image-library`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/image-library.ts`:

```ts
import { supabase } from './supabase';
import { sanitiseName } from './image-rename';
import type { ProductImage } from '../components/admin/ImageLibraryGrid';

/**
 * Failure from uploadLibraryImage. `stage` lets callers keep distinct copy for
 * "nothing was saved" (upload) vs "file stored but the record insert failed"
 * (insert) — the Images tab shows different messages for the two.
 */
export class LibraryUploadError extends Error {
  stage: 'upload' | 'insert';
  constructor(stage: 'upload' | 'insert', message: string) {
    super(message);
    this.name = 'LibraryUploadError';
    this.stage = stage;
  }
}

/**
 * The one upload path into the shared image library: storage object in the
 * `product-images` bucket at uploads/<uuid>-<sanitised name>, then a
 * `product_images` row ({ url, filename, family_code: null, source: 'upload' }).
 * Returns the inserted row. The client parameter exists for tests.
 */
export async function uploadLibraryImage(
  file: File,
  client: typeof supabase = supabase,
): Promise<ProductImage> {
  const path = `uploads/${crypto.randomUUID()}-${sanitiseName(file.name)}`;

  const { error: upErr } = await client.storage
    .from('product-images')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw new LibraryUploadError('upload', upErr.message);

  const { data: urlData } = client.storage.from('product-images').getPublicUrl(path);

  const { data, error: insErr } = await client
    .from('product_images')
    .insert({ url: urlData.publicUrl, filename: file.name, family_code: null, source: 'upload' })
    .select()
    .single();
  if (insErr) throw new LibraryUploadError('insert', insErr.message);
  return data as ProductImage;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/lib/image-library.test.ts`
Expected: 4 tests PASS.

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: all tests PASS (no existing test touches these paths).

---

### Task 2: Refactor `ImagesTab.handleFileChange` to the helper

**Files:**
- Modify: `src/components/admin/ImagesTab.tsx:5` (imports) and `:67-112` (`handleFileChange`)

**Interfaces:**
- Consumes: `uploadLibraryImage(file: File): Promise<ProductImage>` and `LibraryUploadError` from Task 1.
- Produces: nothing new — behaviour-preserving refactor. Error copy must stay EXACTLY: `Failed to upload "<name>": <msg>` (upload stage) and `Uploaded "<name>" but failed to save record: <msg>` (insert stage). Multi-file loop still stops at the first failure; success log, input reset, `loadImages()`, `triggerPublish()` unchanged.

- [ ] **Step 1: Update the imports**

In `src/components/admin/ImagesTab.tsx`, line 5 currently reads:

```ts
import { planImageRename, sanitiseName } from '../../lib/image-rename';
```

`sanitiseName` is only used inside `handleFileChange` (the code being replaced); `planImageRename` stays (used by `handleRename`). Replace with:

```ts
import { planImageRename } from '../../lib/image-rename';
import { uploadLibraryImage, LibraryUploadError } from '../../lib/image-library';
```

- [ ] **Step 2: Replace the body of `handleFileChange`**

Replace the whole `handleFileChange` (lines 67–112) with:

```ts
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setUploadLog([]);

    for (const file of files) {
      try {
        await uploadLibraryImage(file);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setUploadError(err instanceof LibraryUploadError && err.stage === 'insert'
          ? `Uploaded "${file.name}" but failed to save record: ${msg}`
          : `Failed to upload "${file.name}": ${msg}`);
        break;
      }
      setUploadLog((prev) => [...prev, file.name]);
    }

    setUploading(false);
    // Reset input so the same file can be re-uploaded if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
    await loadImages();
    triggerPublish();
  };
```

(The only intended behaviour difference is invisible to the tab: the insert now ends in `.select().single()` so the helper can return the row — the admin role already SELECTs `product_images` to render the library, so RLS permits it.)

- [ ] **Step 3: Verify**

Run: `npm test` → all PASS.
Run: `npx astro check` → no NEW errors in `ImagesTab.tsx` (compare against a pre-change run if the baseline isn't clean).

---

### Task 3: `ImageLibraryPicker` modal component

**Files:**
- Create: `src/components/admin/ImageLibraryPicker.tsx`

**Interfaces:**
- Consumes: `LibraryGrid` + `ProductImage` from `./ImageLibraryGrid`; `uploadLibraryImage` from Task 1; `supabase` from `../../lib/supabase`.
- Produces: `export default function ImageLibraryPicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void })` — Task 4 renders it with exactly these props.

- [ ] **Step 1: Write the component**

Create `src/components/admin/ImageLibraryPicker.tsx`. Modal chrome mirrors the FamiliesTab "Manage images" modal (`FamiliesTab.tsx:579-592`); pick-only grid (no `onDelete`/`onRename`); a successful upload auto-picks the new image — same code path as clicking Select, so no grid reload is needed. No `triggerPublish()` here: a library row alone renders nowhere on the site; the category save publishes.

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadLibraryImage } from '../../lib/image-library';
import { LibraryGrid, type ProductImage } from './ImageLibraryGrid';

// Pick-or-upload modal for the shared image library. Selection semantics only —
// managing the library (delete/rename) stays in the Images tab.
export default function ImageLibraryPicker({ onPick, onClose }:
  { onPick: (url: string) => void; onClose: () => void }) {
  const [images, setImages] = useState<ProductImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from('product_images')
        .select('*')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (err) { setError(err.message); setImages([]); return; }
      setImages((data ?? []) as ProductImage[]);
    })();
    return () => { cancelled = true; };
  }, []);

  const pick = (img: ProductImage) => { onPick(img.url); onClose(); };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = '';
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    try {
      const img = await uploadLibraryImage(file);
      pick(img); // fresh upload is auto-picked, same path as clicking Select
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
      <div className="relative w-full max-w-4xl bg-surface border border-ink/15 shadow-xl">
        <div className="sticky top-0 bg-surface border-b border-ink/10 px-5 py-4 flex items-center justify-between gap-4 z-10">
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-500 font-semibold">Choose image</p>
          <div className="flex items-center gap-4">
            <label className={`text-[11px] uppercase tracking-[0.15em] text-brand-500 cursor-pointer ${uploading ? 'opacity-40 pointer-events-none' : ''}`}>
              {uploading ? 'Uploading…' : '+ Upload new'}
              <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={handleUpload} />
            </label>
            <button type="button" onClick={onClose}
              className="text-[11px] uppercase tracking-[0.2em] text-ink/60 hover:text-ink transition-colors duration-200 cursor-pointer">Cancel</button>
          </div>
        </div>
        <div className="p-5">
          {error && (
            <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-4">{error}</p>
          )}
          {images === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : (
            <LibraryGrid
              images={images}
              onPick={pick}
              emptyLabel="No images in the library yet. Upload one above."
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx astro check`
Expected: no NEW errors. (Component behaviour is exercised in Task 5's browser verification; this codebase has no component-level unit tests.)

---

### Task 4: `CategoryForm` — preview + "Choose from library"

**Files:**
- Modify: `src/components/admin/CategoryForm.tsx:73` (the `field('Image path', …)` call), plus imports/state.

**Interfaces:**
- Consumes: `ImageLibraryPicker` from Task 3 (`onPick: (url: string) => void`, `onClose: () => void`).
- Produces: no API change — `product_categories.image` still receives a URL string; required-image validation stays.

- [ ] **Step 1: Add import and modal state**

In `src/components/admin/CategoryForm.tsx` add to the imports:

```ts
import ImageLibraryPicker from './ImageLibraryPicker';
```

Inside the component (next to the existing `useState` calls, after line 16):

```ts
  const [pickerOpen, setPickerOpen] = useState(false);
```

- [ ] **Step 2: Replace the text field with the image control**

Replace line 73:

```tsx
        {field('Image path', 'image', 'text', '/images/products/categories/<slug>.png')}
```

with:

```tsx
        <div className="mb-3">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Image</span>
          <div className="flex items-center gap-3">
            {d.image.trim() ? (
              <div className="w-16 h-16 bg-surface-alt border border-ink/10 flex items-center justify-center overflow-hidden shrink-0">
                <img src={d.image} alt="" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 border border-dashed border-ink/25 flex items-center justify-center text-[9px] uppercase tracking-[0.15em] text-ink/40 text-center shrink-0">No image</div>
            )}
            <button type="button" onClick={() => setPickerOpen(true)}
              className="text-[11px] uppercase tracking-[0.2em] text-brand-500 border border-ink/15 px-3 py-2 hover:border-brand-500 transition-colors duration-200 cursor-pointer">
              Choose from library
            </button>
          </div>
        </div>
```

- [ ] **Step 3: Update the validation copy**

Line 28 currently reads:

```ts
    if (!d.image.trim()) return setError('Image path is required.');
```

Change the message only (the check stays):

```ts
    if (!d.image.trim()) return setError('Image is required.');
```

- [ ] **Step 4: Render the picker**

Just before the closing `</div>` of the component's root (after the buttons row, line 116):

```tsx
      {pickerOpen && (
        <ImageLibraryPicker
          onPick={(url) => set('image', url)}
          onClose={() => setPickerOpen(false)}
        />
      )}
```

- [ ] **Step 5: Verify**

Run: `npm test` → all PASS.
Run: `npx astro check` → no NEW errors.

---

### Task 5: End-to-end verification + user review (NO commit)

**Files:** none (verification only)

- [ ] **Step 1: Full test suite + typecheck**

Run: `npm test` and `npx astro check`.
Expected: all tests PASS; no new check errors.

- [ ] **Step 2: Browser verification on the dev server**

Start `npm run dev`, open `/admin` (the admin dashboard), log in, then verify per the spec:

1. Categories tab → edit an existing category → its current image shows as the thumbnail preview (a legacy static `/images/...` path renders fine).
2. "Choose from library" opens the modal listing the shared library (newest first).
3. Picking an existing library image sets the preview and closes the modal; Save succeeds.
4. Re-open, "+ Upload new" with a fresh file → it becomes the category image; the file also appears in the Images tab library.
5. On the public site, the mega-menu (Products submenu) shows the new category image (client fetch — no rebuild needed).
6. A category left on its old static path still renders unchanged in the mega-menu.
7. Images tab: normal multi-file upload still works (same success log / error copy).

- [ ] **Step 3: Present the diff to the user for review**

Show `git status` + a summary of the diff. **Do not commit** — wait for explicit approval.
