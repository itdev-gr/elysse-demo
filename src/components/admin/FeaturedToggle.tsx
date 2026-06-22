import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

// Inline control for the admin News/Blog lists: feature a row in the home
// "Latest from Elysée" section and set its position. The checkbox saves
// immediately; the position commits on blur (Enter blurs too) so editing the
// number doesn't reload the list on every keystroke.

interface Props {
  table: 'news' | 'posts';
  id: string;
  featured: boolean;
  rank: number | null;
  /** Refresh the parent list after a successful save. */
  onSaved: () => void | Promise<void>;
}

export default function FeaturedToggle({ table, id, featured, rank, onSaved }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rankText, setRankText] = useState(rank == null ? '' : String(rank));

  // Keep the local field in sync when the parent reloads with new data.
  useEffect(() => {
    setRankText(rank == null ? '' : String(rank));
  }, [rank]);

  const save = async (patch: { featured_home?: boolean; featured_rank?: number | null }) => {
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from(table).update(patch).eq('id', id);
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    await onSaved();
  };

  const toggle = (checked: boolean) =>
    save({ featured_home: checked, featured_rank: checked ? rank : null });

  const commitRank = () => {
    const trimmed = rankText.trim();
    const next = trimmed === '' ? null : Math.max(1, Math.trunc(Number(trimmed)));
    if (trimmed !== '' && !Number.isFinite(next as number)) return;
    if ((next ?? null) === (rank ?? null)) return; // unchanged
    save({ featured_rank: next });
  };

  return (
    <div className="inline-flex items-center gap-2" title={error ?? undefined}>
      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={featured}
          disabled={busy}
          onChange={(e) => toggle(e.target.checked)}
          className="accent-brand-500 cursor-pointer"
        />
        <span className="text-[10px] uppercase tracking-[0.2em] text-ink/60">Home</span>
      </label>
      {featured && (
        <input
          type="number"
          min={1}
          step={1}
          value={rankText}
          disabled={busy}
          placeholder="#"
          title="Position (lower shows first)"
          onChange={(e) => setRankText(e.target.value)}
          onBlur={commitRank}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          className="w-12 border border-ink/15 bg-surface px-1.5 py-0.5 text-xs text-ink"
        />
      )}
      {error && <span className="text-[10px] text-red-600">!</span>}
    </div>
  );
}
