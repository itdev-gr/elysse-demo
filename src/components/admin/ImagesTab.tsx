import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { triggerPublish } from '../../lib/publish';

// ─── Local types ────────────────────────────────────────────────────────────

interface ProductImage {
  id: string;
  url: string;
  filename: string;
  family_code: string | null;
  source: string | null;
  created_at: string;
}

interface ProductRow {
  code: string;
  category_name: string | null;
  sub_category: string | null;
  family_code: string | null;
  configuration: string | null;
  image_url: string | null;
}

interface ConfigEntry {
  key: string;
  category_name: string | null;
  sub_category: string;
  family_code: string;
  configuration: string | null;
  currentImage: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function sanitiseName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-]+/g, '-');
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ImageCard({
  img,
  onDelete,
  onPick,
}: {
  img: ProductImage;
  onDelete: (img: ProductImage) => void;
  onPick?: (img: ProductImage) => void;
}) {
  return (
    <div className="flex flex-col bg-surface border border-ink/10 overflow-hidden">
      <div className="aspect-square bg-surface-alt flex items-center justify-center overflow-hidden">
        <img
          src={img.url}
          alt={img.filename}
          className="object-contain w-full h-full"
          loading="lazy"
        />
      </div>
      <div className="p-2 flex-1 flex flex-col gap-1">
        <p className="text-[11px] text-ink truncate" title={img.filename}>
          {img.filename}
        </p>
        {img.family_code && (
          <p className="text-[10px] text-ink/55 uppercase tracking-[0.15em] truncate">
            {img.family_code}
          </p>
        )}
        <div className="mt-auto pt-1 flex gap-2">
          {onPick && (
            <button
              type="button"
              onClick={() => onPick(img)}
              className="flex-1 text-[11px] uppercase tracking-[0.2em] bg-brand-500 text-surface px-2 py-1 hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
            >
              Select
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(img)}
            className="flex-1 text-[11px] uppercase tracking-[0.2em] text-red-600 hover:text-red-800 transition-colors duration-200 cursor-pointer border border-red-200 px-2 py-1"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function LibraryGrid({
  images,
  onDelete,
  onPick,
}: {
  images: ProductImage[];
  onDelete: (img: ProductImage) => void;
  onPick?: (img: ProductImage) => void;
}) {
  if (images.length === 0) {
    return <p className="text-sm text-ink/60">No images in the library yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
      {images.map((img) => (
        <ImageCard key={img.id} img={img} onDelete={onDelete} onPick={onPick} />
      ))}
    </div>
  );
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

  // ── configurations state ──
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [prodError, setProdError] = useState<string | null>(null);
  const [configQuery, setConfigQuery] = useState('');

  // ── assign modal state ──
  const [assignTarget, setAssignTarget] = useState<ConfigEntry | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

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

  const loadProducts = useCallback(async () => {
    setProdError(null);
    const PAGE = 1000;
    const all: ProductRow[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from('products')
        .select('code,category_name,sub_category,family_code,configuration,image_url')
        .range(from, from + PAGE - 1);
      if (error) { setProdError(error.message); return; }
      if (!data || data.length === 0) break;
      all.push(...(data as ProductRow[]));
      if (data.length < PAGE) break;
    }
    setProducts(all);
  }, []);

  useEffect(() => {
    loadImages();
    loadProducts();
  }, [loadImages, loadProducts]);

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
    const { error } = await supabase.from('product_images').delete().eq('id', img.id);
    if (error) { setLibError(error.message); return; }
    await loadImages();
    triggerPublish();
  };

  // ── configurations ───────────────────────────────────────────────────────

  const configs = useMemo<ConfigEntry[]>(() => {
    if (!products) return [];
    const map = new Map<string, ConfigEntry>();
    for (const p of products) {
      const sub = p.sub_category ?? '';
      const fam = p.family_code ?? '';
      const key = `${sub}|${fam}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          category_name: p.category_name,
          sub_category: sub,
          family_code: fam,
          configuration: p.configuration,
          currentImage: p.image_url,
        });
      } else {
        // update currentImage if this product has one and the stored one doesn't
        const existing = map.get(key)!;
        if (!existing.currentImage && p.image_url) {
          map.set(key, { ...existing, currentImage: p.image_url });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      (a.sub_category + a.family_code).localeCompare(b.sub_category + b.family_code),
    );
  }, [products]);

  const filteredConfigs = useMemo(() => {
    const q = configQuery.trim().toLowerCase();
    if (!q) return configs.slice(0, 60);
    return configs
      .filter(
        (c) =>
          c.family_code.toLowerCase().includes(q) ||
          (c.configuration ?? '').toLowerCase().includes(q) ||
          c.sub_category.toLowerCase().includes(q),
      )
      .slice(0, 200);
  }, [configs, configQuery]);

  // ── assign actions ───────────────────────────────────────────────────────

  const handleChooseImage = (target: ConfigEntry) => {
    setAssignTarget(target);
    setAssignError(null);
  };

  const handleAssign = async (img: ProductImage) => {
    if (!assignTarget) return;
    const { sub_category: subCat, family_code: fam } = assignTarget;
    const { error } = await supabase
      .from('products')
      .update({ image_url: img.url })
      .eq('sub_category', subCat)
      .eq('family_code', fam);
    if (error) { setAssignError(error.message); return; }
    setAssignTarget(null);
    await loadProducts();
    triggerPublish();
  };

  const handleClear = async () => {
    if (!assignTarget) return;
    const { sub_category: subCat, family_code: fam } = assignTarget;
    const { error } = await supabase
      .from('products')
      .update({ image_url: null })
      .eq('sub_category', subCat)
      .eq('family_code', fam);
    if (error) { setAssignError(error.message); return; }
    setAssignTarget(null);
    await loadProducts();
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

      {/* ── 3. Allocate to products ────────────────────────────────────── */}
      <section className="order-2">
        <h2 className="font-display font-heavy text-base text-ink mb-4">
          Allocate images to configurations
        </h2>

        {prodError && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-4">
            {prodError}
          </p>
        )}

        <div className="mb-5">
          <input
            type="search"
            value={configQuery}
            onChange={(e) => setConfigQuery(e.currentTarget.value)}
            placeholder="Search by family code, configuration, or series…"
            className="w-full max-w-md bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500"
          />
          {!configQuery && configs.length > 60 && (
            <p className="text-[11px] text-ink/50 mt-2">
              Showing first 60 — search to narrow.
            </p>
          )}
        </div>

        {products === null ? (
          <p className="text-sm text-ink/60">Loading…</p>
        ) : filteredConfigs.length === 0 ? (
          <p className="text-sm text-ink/60">No configurations match.</p>
        ) : (
          <div className="overflow-x-auto bg-surface border border-ink/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-ink/55 border-b border-ink/10">
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Configuration</th>
                  <th className="px-4 py-3">Series</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredConfigs.map((c) => (
                  <tr key={c.key} className="border-b border-ink/5 last:border-b-0">
                    <td className="px-4 py-3">
                      {c.currentImage ? (
                        <img
                          src={c.currentImage}
                          alt=""
                          className="w-12 h-12 object-contain bg-surface-alt border border-ink/10"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-surface-alt border border-ink/10 flex items-center justify-center text-[10px] text-ink/30">
                          None
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-ink">
                        No.{c.family_code} · {c.configuration ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink/60 text-[12px]">
                      {c.sub_category}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleChooseImage(c)}
                        className="text-[11px] uppercase tracking-[0.2em] text-brand-500 hover:text-brand-700 transition-colors duration-200 cursor-pointer"
                      >
                        Choose image
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Modal: choose image ────────────────────────────────────────── */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
          <div className="relative w-full max-w-4xl bg-surface border border-ink/15 shadow-xl">
            {/* Header */}
            <div className="sticky top-0 bg-surface border-b border-ink/10 px-5 py-4 flex items-center justify-between gap-4 z-10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-brand-500 font-semibold mb-0.5">
                  Choose image
                </p>
                <p className="text-sm text-ink font-medium">
                  No.{assignTarget.family_code} · {assignTarget.configuration ?? assignTarget.sub_category}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {assignTarget.currentImage && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[11px] uppercase tracking-[0.2em] text-red-600 hover:text-red-800 transition-colors duration-200 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAssignTarget(null)}
                  className="text-[11px] uppercase tracking-[0.2em] text-ink/60 hover:text-ink transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5">
              {assignError && (
                <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-4">
                  {assignError}
                </p>
              )}

              {images === null ? (
                <p className="text-sm text-ink/60">Loading…</p>
              ) : images.length === 0 ? (
                <p className="text-sm text-ink/60">
                  No images in the library. Upload some first.
                </p>
              ) : (
                <LibraryGrid
                  images={images}
                  onDelete={handleDelete}
                  onPick={handleAssign}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
