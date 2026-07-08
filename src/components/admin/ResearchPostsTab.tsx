import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ResearchPost } from '../../types/research-post';
import ResearchPostForm from './ResearchPostForm';
import ListFilterBar, { filterRows, type StatusFilter } from './ListFilterBar';
import { triggerPublish } from '../../lib/publish';

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; post: ResearchPost };

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ResearchPostsTab() {
  const [items, setItems] = useState<ResearchPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(
    () => filterRows(items, query, statusFilter, (a) => [a.title, a.author, a.excerpt, a.slug]),
    [items, query, statusFilter],
  );

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('research_posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false });
    if (err) {
      setError(err.message);
      return;
    }
    setItems((data ?? []) as ResearchPost[]);
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (post: ResearchPost) => {
    const { error: err } = await supabase
      .from('research_posts')
      .update({ is_published: !post.is_published })
      .eq('id', post.id);
    if (err) return setError(err.message);
    await load();
    triggerPublish();
  };

  const remove = async (post: ResearchPost) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('research_posts').delete().eq('id', post.id);
    if (err) return setError(err.message);
    await load();
    triggerPublish();
  };

  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
          {error}
        </p>
      )}

      {mode.kind === 'list' && (
        <>
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setMode({ kind: 'create' })}
              className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
            >
              + New entry
            </button>
          </div>

          <ListFilterBar
            query={query}
            onQueryChange={setQuery}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            placeholder="Search title, author, excerpt…"
            shown={filtered.length}
            total={items?.length ?? null}
          />

          {items === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-ink/60">No R&D entries yet. Create the first one.</p>
          ) : (
            <div className="overflow-x-auto bg-surface border border-ink/10">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] uppercase tracking-[0.25em] text-ink/55 border-b border-ink/10">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Published</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-sm text-ink/60">
                        No entries match this filter.
                      </td>
                    </tr>
                  )}
                  {filtered.map((a) => {
                    const status = a.is_published ? 'Live' : 'Draft';
                    return (
                      <tr key={a.id} className="border-b border-ink/5 last:border-b-0">
                        <td className="px-4 py-3 text-ink">{a.title}</td>
                        <td className="px-4 py-3 text-ink/75">{a.author?.trim() || 'Elysée Group'}</td>
                        <td className="px-4 py-3 text-ink/75">{formatDate(a.published_at)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              status === 'Live'
                                ? 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-brand-500/15 text-brand-700'
                                : 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-ink/10 text-ink/70'
                            }
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
                            <button onClick={() => setMode({ kind: 'edit', post: a })} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                              Edit
                            </button>
                            <button onClick={() => togglePublish(a)} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                              {a.is_published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button onClick={() => remove(a)} className="text-red-600 hover:text-red-800 cursor-pointer">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {mode.kind === 'create' && (
        <ResearchPostForm
          onSaved={async () => {
            setMode({ kind: 'list' });
            await load();
            triggerPublish();
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {mode.kind === 'edit' && (
        <ResearchPostForm
          initial={mode.post}
          onSaved={async () => {
            setMode({ kind: 'list' });
            await load();
            triggerPublish();
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}
    </>
  );
}
