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
