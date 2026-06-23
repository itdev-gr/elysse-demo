// Shared image-library grid used by both the Images tab and the Family tab, so
// the two can't drift. The Images tab owns uploading; this module only renders
// the library and exposes optional per-card "Select" (pick) / "Delete" actions.

export interface ProductImage {
  id: string;
  url: string;
  filename: string;
  family_code: string | null;
  source: string | null;
  created_at: string;
}

export function ImageCard({
  img,
  onDelete,
  onPick,
}: {
  img: ProductImage;
  onDelete?: (img: ProductImage) => void;
  onPick?: (img: ProductImage) => void;
}) {
  return (
    <div className="flex flex-col bg-surface border border-ink/10 overflow-hidden">
      <div className="aspect-square bg-surface-alt flex items-center justify-center overflow-hidden">
        <img src={img.url} alt={img.filename} className="object-contain w-full h-full" loading="lazy" />
      </div>
      <div className="p-2 flex-1 flex flex-col gap-1">
        <p className="text-[11px] text-ink truncate" title={img.filename}>
          {img.filename}
        </p>
        {img.family_code && (
          <p className="text-[10px] text-ink/55 uppercase tracking-[0.15em] truncate">{img.family_code}</p>
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
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(img)}
              className="flex-1 text-[11px] uppercase tracking-[0.2em] text-red-600 hover:text-red-800 transition-colors duration-200 cursor-pointer border border-red-200 px-2 py-1"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function LibraryGrid({
  images,
  onDelete,
  onPick,
  emptyLabel = 'No images in the library yet.',
}: {
  images: ProductImage[];
  onDelete?: (img: ProductImage) => void;
  onPick?: (img: ProductImage) => void;
  emptyLabel?: string;
}) {
  if (images.length === 0) {
    return <p className="text-sm text-ink/60">{emptyLabel}</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
      {images.map((img) => (
        <ImageCard key={img.id} img={img} onDelete={onDelete} onPick={onPick} />
      ))}
    </div>
  );
}
