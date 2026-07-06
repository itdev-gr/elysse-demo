import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { triggerPublish } from '../../lib/publish';
import { storagePathFromUrl, deleteBlockedMessage, type ImageUsage } from '../../lib/image-refs';
import { LibraryGrid, type ProductImage } from './ImageLibraryGrid';

// ─── Helpers ────────────────────────────────────────────────────────────────

function sanitiseName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-]+/g, '-');
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function ImagesTab() {
  // ── library state ──
  const [images, setImages] = useState<ProductImage[] | null>(null);
  const [libError, setLibError] = useState<string | null>(null);

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

  useEffect(() => {
    loadImages();
  }, [loadImages]);

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
            <span className="text-xs text-ink/55">{images.length} image{images.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {libError && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-4">
            {libError}
          </p>
        )}

        {images === null ? (
          <p className="text-sm text-ink/60">Loading…</p>
        ) : (
          <LibraryGrid images={images} onDelete={handleDelete} />
        )}
      </section>

      {/* ── 3. Allocation now lives on the family (Families tab) ────────── */}
      <p className="order-2 text-sm text-ink/50">
        Images are assigned per family in the Families tab (Manage images).
      </p>
    </div>
  );
}
