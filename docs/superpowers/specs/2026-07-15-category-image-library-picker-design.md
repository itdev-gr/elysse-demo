# Category image via the shared product image library

**Date:** 2026-07-15
**Status:** Approved (design), pending implementation plan

## Goal

Replace the category admin form's plain "Image path" **text box** with the same
image experience products use: open the shared **Image Library**, **pick** an
existing image or **upload** a new one, and save the chosen image's public URL
to `product_categories.image`.

## Scope

- **Categories only.** Subcategories have no image column, field, or display and
  are explicitly out of scope (confirmed with the user).
- Do not change the shared library's semantics or the Families "assign images"
  flow. The only shared-code change is extracting the upload helper.
- The category picker is **pick + upload only**; image management
  (delete/rename) stays in the Images tab.

## Current state (verified)

- `product_categories.image` is a `text` column holding a URL/path string,
  rendered across the site (mega-menu `MegaNav`/`MobileMegaNav`/`MegaCard`,
  `ProductCategoryGrid`, etc.). `CategoryForm.tsx` edits it via a required
  free-text input ("Image path", e.g. `/images/products/categories/<slug>.png`).
- The products image system: files upload to the `product-images` storage
  bucket and get a row in the shared `product_images` table
  (`id, url, filename, family_code, source, created_at`). Forms render the
  existing `LibraryGrid`/`ImageCard` (`ImageLibraryGrid.tsx`) and `onPick` an
  image. Upload logic lives inline in `ImagesTab.tsx` `handleFileChange`:
  `storage.from('product-images').upload('uploads/<uuid>-<sanitised>', file, {upsert:true})`
  → `getPublicUrl` → `insert product_images {url, filename, family_code:null, source:'upload'}`.
- Subcategories: `product_subcategories` has no image column;
  `SubcategoryEditForm.tsx` only edits name/i18n.

## Design

### 1. Shared upload helper — `src/lib/image-library.ts`
Extract the inline upload into a reusable async function:

```
uploadLibraryImage(file: File): Promise<ProductImage>
```

Behaviour (identical to today's `ImagesTab` upload): `sanitiseName` the file
name → upload to `product-images` at `uploads/<uuid>-<sanitised>` with
`upsert:true` → `getPublicUrl` → insert a `product_images` row
(`{ url, filename: file.name, family_code: null, source: 'upload' }`) → return
the inserted row. Throws on any storage/insert error.

Refactor `ImagesTab.handleFileChange` to call this helper (one upload path, no
behaviour change) so the picker and the Images tab can't drift.

### 2. `ImageLibraryPicker` component — `src/components/admin/ImageLibraryPicker.tsx`
A modal opened from the category form. Responsibilities:
- Load the library: `supabase.from('product_images').select('*').order('created_at', { ascending: false })`.
- Render the existing `LibraryGrid` with `onPick={(img) => { onPick(img.url); onClose(); }}` (no `onDelete`/`onRename` passed — pick-only).
- An "Upload new" file input that calls `uploadLibraryImage`, then reloads the
  grid and auto-picks the freshly uploaded image. Shows an inline error on
  failure and a busy state while uploading. Accepts image files
  (`accept="image/*"`), mirroring the Images tab (no new size gate beyond what
  the Images tab already does).

Props: `{ onPick: (url: string) => void; onClose: () => void }`.

### 3. `CategoryForm` integration
Replace the `field('Image path', 'image', …)` text input with an image control:
- A thumbnail **preview** of the current `d.image` (or an empty-state box).
- A **"Choose from library"** button that opens `ImageLibraryPicker`; on pick,
  `set('image', url)`.
- Keep the required-image validation (`if (!d.image.trim()) …`).

No other CategoryForm fields change.

## Data flow & backward compatibility

`product_categories.image` still stores a URL string. A Supabase public URL
renders identically to today's static `/images/...` paths, so **nothing that
displays category images changes**. Existing categories keep working; editing
one shows its current image as the preview and lets the editor replace it via
the picker. Categories whose image is a static path simply aren't rows in
`product_images` — that's fine; the picker is for choosing/uploading, not for
reflecting the current value's library membership.

## Error handling

- Upload failures (storage or `product_images` insert) surface as an inline
  error in the picker; the modal stays open so the user can retry.
- Save still blocks on a missing image (existing validation).

## Testing / verification

- Unit-test `uploadLibraryImage` with a mocked Supabase client: asserts the
  bucket path shape, the `getPublicUrl` call, the inserted row fields, and that
  it returns the new image / throws on error.
- Browser: edit a category → open the picker → upload a new file (confirm it
  appears in the grid and in the Images tab library) → it becomes the category
  image → save → confirm the new image renders in the mega-menu. Also confirm
  picking an existing library image works, and that an existing static-path
  category still renders until changed.

## Non-goals

- Subcategory images (no column/display today).
- Changing the Families assign-images flow or library management UI.
- Migrating existing static category image paths into the library.
