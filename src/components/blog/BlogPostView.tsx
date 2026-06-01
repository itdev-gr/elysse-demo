import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Post } from '../../types/post';
import { renderPostBody } from '../../lib/posts';

type Props = { slug: string };

type State =
  | { kind: 'loading' }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; post: Post };

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPostView({ slug }: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'error', message: 'Supabase not configured' });
        return;
      }
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setState({ kind: 'error', message: error.message });
        return;
      }
      if (!data) {
        setState({ kind: 'not-found' });
        return;
      }
      setState({ kind: 'ready', post: data as Post });
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state.kind === 'loading') {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24 animate-pulse">
        <div className="h-4 w-32 bg-ink/10 rounded"></div>
        <div className="mt-6 h-12 w-3/4 bg-ink/10 rounded"></div>
        <div className="mt-6 h-4 w-1/3 bg-ink/10 rounded"></div>
        <div className="mt-10 space-y-3">
          <div className="h-3 bg-ink/10 rounded"></div>
          <div className="h-3 bg-ink/10 rounded"></div>
          <div className="h-3 w-5/6 bg-ink/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (state.kind === 'not-found' || state.kind === 'error') {
    const heading = state.kind === 'not-found' ? 'Post not found.' : 'Article temporarily unavailable.';
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-20 md:py-28">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">
          {state.kind === 'not-found' ? 'Not found' : 'Temporarily unavailable'}
        </p>
        <h1 className="font-display font-heavy text-3xl md:text-4xl text-ink leading-tight">{heading}</h1>
        <p className="mt-4 text-base text-ink/75 leading-relaxed">
          The article you are looking for may have been moved or unpublished. Browse all our latest pieces below.
        </p>
        <a
          href="/insights/blog/"
          className="mt-8 inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200"
        >
          Back to all posts
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>
    );
  }

  const post = state.post;
  const author = post.author?.trim() || 'Elysée Group';
  const date = formatDate(post.published_at);
  const minutes = post.reading_minutes ?? 1;

  return (
    <article>
      {post.cover_image && (
        <div className="w-full aspect-video bg-surface-alt overflow-hidden max-h-[60vh]">
          <img
            src={post.cover_image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <p className="text-[11px] uppercase tracking-[0.4em] text-brand-500 font-semibold">Insights · Blog</p>
        <h1
          className="mt-6 font-display font-heavy leading-[1.05] tracking-tight text-ink"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}
        >
          {post.title}
        </h1>
        <div aria-hidden="true" className="mt-8 h-px w-12 bg-brand-500"></div>
        <p className="mt-6 text-sm text-ink/65">
          {[author, date, `${minutes} min read`].filter(Boolean).join(' · ')}
        </p>

        <div
          className="mt-10 text-base md:text-lg text-ink/85 leading-[1.7] [&_h2]:font-display [&_h2]:font-heavy [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:text-ink [&_h2]:mt-10 [&_h2]:mb-5 [&_h3]:font-display [&_h3]:font-heavy [&_h3]:text-xl [&_h3]:text-ink [&_h3]:mt-8 [&_h3]:mb-4 [&_p]:mb-5 [&_a]:text-brand-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-6 [&_strong]:font-semibold [&_strong]:text-ink"
          // Sanitized via DOMPurify in renderPostBody.
          dangerouslySetInnerHTML={{ __html: renderPostBody(post.body) }}
        />

        <a
          href="/insights/blog/"
          className="mt-14 inline-flex items-center gap-2 px-5 py-2.5 border border-ink/40 hover:bg-ink hover:border-ink hover:text-surface text-ink text-[11px] uppercase tracking-[0.25em] transition-colors duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back to all posts
        </a>
      </div>
    </article>
  );
}
