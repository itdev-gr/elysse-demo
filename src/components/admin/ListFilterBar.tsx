export type StatusFilter = 'all' | 'live' | 'draft';

/** Client-side search + Live/Draft filter shared by the admin list tabs. */
export function filterRows<T extends { is_published: boolean }>(
  rows: T[] | null,
  query: string,
  status: StatusFilter,
  fields: (row: T) => (string | null | undefined)[],
): T[] {
  if (!rows) return [];
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    if (status === 'live' && !row.is_published) return false;
    if (status === 'draft' && row.is_published) return false;
    if (!q) return true;
    return fields(row).some((v) => v?.toLowerCase().includes(q));
  });
}

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  placeholder: string;
  /** Rows currently shown after filtering. */
  shown: number;
  /** Total rows loaded, or null while loading. */
  total: number | null;
}

export default function ListFilterBar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  placeholder,
  shown,
  total,
}: Props) {
  const filterActive = query.trim() !== '' || status !== 'all';
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.currentTarget.value)}
        placeholder={placeholder}
        className="w-full max-w-md bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500"
      />
      <div className="flex items-center gap-1 border border-ink/10">
        {(['all', 'live', 'draft'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusChange(s)}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] cursor-pointer transition-colors duration-200 ${
              status === s ? 'bg-ink text-surface' : 'text-ink/60 hover:text-brand-500'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {total !== null && filterActive && (
        <span className="text-xs text-ink/55">
          {shown} of {total}
        </span>
      )}
    </div>
  );
}
