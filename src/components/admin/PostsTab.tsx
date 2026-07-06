import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Post } from '../../types/post';
import PostForm from './PostForm';
import FeaturedToggle from './FeaturedToggle';
import { triggerPublish } from '../../lib/publish';

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; post: Post };

type StatusFilter = 'all' | 'live' | 'draft';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function PostsTab() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    if (!posts) return [];
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (statusFilter === 'live' && !p.is_published) return false;
      if (statusFilter === 'draft' && p.is_published) return false;
      if (!q) return true;
      return [p.title, p.author, p.excerpt, p.slug].some((v) =>
        v?.toLowerCase().includes(q),
      );
    });
  }, [posts, query, statusFilter]);

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
      return;
    }
    setPosts((data ?? []) as Post[]);
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (post: Post) => {
    const { error: err } = await supabase
      .from('posts')
      .update({ is_published: !post.is_published })
      .eq('id', post.id);
    if (err) return setError(err.message);
    await load();
    triggerPublish();
  };

  const remove = async (post: Post) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('posts').delete().eq('id', post.id);
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
              + New blog
            </button>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-4">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Search title, author, excerpt…"
              className="w-full max-w-md bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500"
            />
            <div className="flex items-center gap-1 border border-ink/10">
              {(['all', 'live', 'draft'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] cursor-pointer transition-colors duration-200 ${
                    statusFilter === s ? 'bg-ink text-surface' : 'text-ink/60 hover:text-brand-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {posts && (query.trim() || statusFilter !== 'all') && (
              <span className="text-xs text-ink/55">
                {filtered.length} of {posts.length}
              </span>
            )}
          </div>

          {posts === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-ink/60">No blogs yet. Create the first one.</p>
          ) : (
            <div className="overflow-x-auto bg-surface border border-ink/10">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] uppercase tracking-[0.25em] text-ink/55 border-b border-ink/10">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Published</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Home</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-sm text-ink/60">
                        No blogs match this filter.
                      </td>
                    </tr>
                  )}
                  {filtered.map((p) => {
                    const status = p.is_published ? 'Live' : 'Draft';
                    return (
                      <tr key={p.id} className="border-b border-ink/5 last:border-b-0">
                        <td className="px-4 py-3 text-ink">{p.title}</td>
                        <td className="px-4 py-3 text-ink/75">{p.author?.trim() || 'Elysée Group'}</td>
                        <td className="px-4 py-3 text-ink/75">{formatDate(p.published_at)}</td>
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
                        <td className="px-4 py-3">
                          <FeaturedToggle
                            table="posts"
                            id={p.id}
                            featured={p.featured_home}
                            rank={p.featured_rank}
                            onSaved={load}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
                            <button onClick={() => setMode({ kind: 'edit', post: p })} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                              Edit
                            </button>
                            <button onClick={() => togglePublish(p)} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                              {p.is_published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button onClick={() => remove(p)} className="text-red-600 hover:text-red-800 cursor-pointer">
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
        <PostForm
          onSaved={async () => {
            setMode({ kind: 'list' });
            await load();
            triggerPublish();
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {mode.kind === 'edit' && (
        <PostForm
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
