import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { triggerPublish } from '../../lib/publish';
import { storagePathFromUrl, deleteBlockedMessage, type ImageUsage } from '../../lib/image-refs';
import { planImageRename, sanitiseName } from '../../lib/image-rename';
import { LibraryGrid, type ProductImage } from './ImageLibraryGrid';
import { matchesFields } from '../../lib/admin-search';
import SearchInput from './SearchInput';

// ─── Main component ──────────────────────────────────────────────────────────

export default function ImagesTab() {
  // ── library state ──
  const [images, setImages] = useState<ProductImage[] | null>(null);
  const [libError, setLibError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [query, setQuery] = useState('');

  // ── upload state ──
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadLog, setUploadLog] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── loaders ──────────────────────────────────────────────────────────────

  const loadImages = useCallback(async () => {
    setLibError(null);
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { setLibError(error.message); return; }
    setImages((data ?? []) as ProductImage[]);
  }, []);

  // Deferred rename cleanup: old storage objects whose 24h grace window has
  // passed AND that nothing references anymore. due_image_cleanups() only
  // enumerates candidates; the actual claim is atomic (claim_image_cleanup
  // re-verifies unreferenced-ness and deletes the queue row in the same
  // statement) so a late re-insert can never race the file removal — the row
  // is only ever gone once removing the file is safe. Only then do we call
  // storage.remove(); a failure after the claim just orphans a file, which
  // is harmless and invisible to the data checker.
  const runDueCleanups = useCallback(async () => {
    const { data, error } = await supabase.rpc('due_image_cleanups');
    if (error) return; // silent — cleanup is background plumbing
    for (const row of (data ?? []) as { id: string; storage_path: string }[]) {
      const { data: claimedPath, error: claimErr } = await supabase.rpc('claim_image_cleanup', { p_id: row.id });
      if (claimErr || !claimedPath) continue;
      await supabase.storage.from('product-images').remove([claimedPath as string]);
    }
  }, []);

  const visible = useMemo(
    () => (images ?? []).filter((img) => matchesFields(query, [img.filename, img.family_code])),
    [images, query],
  );

  useEffect(() => { loadImages().then(() => runDueCleanups()); }, [loadImages, runDueCleanups]);

  // ── upload handler ───────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setUploadLog([]);

    for (const file of files) {
      const path = `uploads/${crypto.randomUUID()}-${sanitiseName(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) {
        setUploadError(`Failed to upload "${file.name}": ${upErr.message}`);
        break;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      const { error: insErr } = await supabase.from('product_images').insert({
        url: publicUrl,
        filename: file.name,
        family_code: null,
        source: 'upload',
      });

      if (insErr) {
        setUploadError(`Uploaded "${file.name}" but failed to save record: ${insErr.message}`);
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

  // ── delete handler ───────────────────────────────────────────────────────

  const handleDelete = async (img: ProductImage) => {
    if (renaming) return;
    if (!confirm(`Delete image "${img.filename}"? This cannot be undone.`)) return;
    // Reference-aware: the RPC refuses (atomically) while the URL is still used
    // by products / family covers / family galleries — a used image can never
    // silently vanish from the live site again.
    const { data, error } = await supabase.rpc('delete_library_image', { p_id: img.id });
    if (error) { setLibError(error.message); return; }
    if (!data?.deleted) {
      if (data?.reason === 'in_use') setLibError(deleteBlockedMessage(img.filename, data as ImageUsage & typeof data));
      else setLibError(`Could not delete "${img.filename}" (${data?.reason ?? 'unknown error'}).`);
      return;
    }
    // Row is gone — remove the file too so admin is the one safe delete path.
    // A failed removal only orphans the file (nothing references it anymore).
    const path = storagePathFromUrl(data.url as string);
    if (path) {
      const { error: rmErr } = await supabase.storage.from('product-images').remove([path]);
      if (rmErr) setLibError(`Image record deleted, but removing the file from storage failed: ${rmErr.message}`);
    }
    await loadImages();
    triggerPublish();
  };

  // ── rename handler ───────────────────────────────────────────────────────
  // REAL rename: copy to the new path (old file untouched) → atomic DB
  // rewrite via RPC (library row + every gallery row + cleanup enqueue in one
  // transaction) → reload. The old object outlives all references by ≥24h
  // (removed by runDueCleanups), so nothing cached can break. Any failure
  // leaves the site fully on the old URL.
  const handleRename = async (img: ProductImage) => {
    if (renaming || uploading) return;
    const requested = prompt(`Rename "${img.filename ?? 'image'}" to:`, img.filename ?? '');
    if (requested === null) return;

    const result = planImageRename({ url: img.url, filename: img.filename }, requested, crypto.randomUUID());
    if ('error' in result) { setLibError(result.error); return; }

    const oldPath = storagePathFromUrl(img.url);
    if (!oldPath) {
      setLibError('This image is not stored in the product-images bucket, so it cannot be renamed.');
      return;
    }

    setRenaming(true);
    setLibError(null);
    try {
      const { error: cpErr } = await supabase.storage
        .from('product-images').copy(oldPath, result.plan.newPath);
      if (cpErr) {
        setLibError(`Could not copy the file to its new name: ${cpErr.message}`);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('product-images').getPublicUrl(result.plan.newPath);
      const { data, error } = await supabase.rpc('rename_library_image', {
        p_id: img.id,
        p_new_url: urlData.publicUrl,
        p_new_filename: result.plan.newFilename,
      });
      if (error || !data?.renamed) {
        // Roll back the copy (best-effort — an orphan is harmless, nothing
        // references it) and leave everything on the old URL.
        await supabase.storage.from('product-images').remove([result.plan.newPath]);
        setLibError(error ? error.message : `Could not rename (${data?.reason ?? 'unknown error'}).`);
        return;
      }

      await loadImages();
      triggerPublish();
    } finally {
      setRenaming(false);
    }
  };

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-12">

      {/* ── 1. Upload ──────────────────────────────────────────────────── */}
      <section className="order-1">
        <h2 className="font-display font-heavy text-base text-ink mb-4">
          Upload images
        </h2>

        {uploadError && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-4">
            {uploadError}
          </p>
        )}

        <label
          className={`inline-flex items-center gap-3 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          {uploading ? 'Uploading…' : '+ Choose files'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>

        {uploadLog.length > 0 && (
          <ul className="mt-3 space-y-0.5">
            {uploadLog.map((name) => (
              <li key={name} className="text-[11px] text-brand-700">
                ✓ {name}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── 2. Library ─────────────────────────────────────────────────── */}
      <section className="order-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-heavy text-base text-ink">
            Image library
          </h2>
          {images && (
            <span className="text-xs text-ink/55">
              {query.trim() !== ''
                ? `${visible.length} of ${images.length}`
                : `${images.length} image${images.length !== 1 ? 's' : ''}`}
            </span>
          )}
        </div>

        <div className="mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search filename or family code…" />
        </div>

        {libError && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-4">
            {libError}
          </p>
        )}

        {images === null ? (
          <p className="text-sm text-ink/60">Loading…</p>
        ) : (
          <LibraryGrid
            images={visible}
            onDelete={handleDelete}
            onRename={handleRename}
            emptyLabel={query.trim() !== '' ? `No images match “${query}”.` : 'No images in the library yet.'}
          />
        )}
      </section>

      {/* ── 3. Allocation now lives on the family (Families tab) ────────── */}
      <p className="order-2 text-sm text-ink/50">
        Images are assigned per family in the Families tab (Manage images).
      </p>
    </div>
  );
}
