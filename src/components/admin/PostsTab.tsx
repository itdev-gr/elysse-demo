import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Post } from '../../types/post';
import PostForm from './PostForm';

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; post: Post };

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
  };

  const remove = async (post: Post) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('posts').delete().eq('id', post.id);
    if (err) return setError(err.message);
    await load();
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
              + New post
            </button>
          </div>

          {posts === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-ink/60">No posts yet. Create the first one.</p>
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
                  {posts.map((p) => {
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
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}
    </>
  );
}
