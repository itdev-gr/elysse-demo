import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Post } from '../../types/post';
import { i18nAttr } from '../../lib/i18n';
import BlogCard from './BlogCard';
import FeaturedCard from '../FeaturedCard';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Author · date · read-time line, matching BlogCard. */
function postMeta(post: Post): string {
  const author = post.author?.trim() || 'Elysée Group';
  return [author, formatDate(post.published_at), `${post.reading_minutes ?? 1} min read`].filter(Boolean).join(' · ');
}

type State =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; posts: Post[] };

export default function BlogList() {
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
        .eq('is_published', true)
        .order('published_at', { ascending: false, nullsFirst: false });

      if (cancelled) return;

      if (error) {
        setState({ kind: 'error', message: error.message });
        return;
      }
      if (!data || data.length === 0) {
        setState({ kind: 'empty' });
        return;
      }
      setState({ kind: 'ready', posts: data as Post[] });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-apply the active language once the data-driven tree has rendered.
  useEffect(() => {
    try {
      const l = localStorage.getItem('elysee.lang');
      if (l && l !== 'en') document.dispatchEvent(new CustomEvent('elysee:lang', { detail: { lang: l } }));
    } catch {}
  }, [state]);

  if (state.kind === 'loading') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-surface-alt border-l-4 border-brand-500/40 min-h-[420px] animate-pulse">
            <div className="aspect-video bg-ink/10"></div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="h-3 w-32 bg-ink/10 rounded"></div>
              <div className="h-6 w-3/4 bg-ink/10 rounded"></div>
              <div className="h-3 w-full bg-ink/10 rounded"></div>
              <div className="h-3 w-2/3 bg-ink/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (state.kind === 'empty' || state.kind === 'error') {
    const heading = state.kind === 'empty'
      ? 'No posts yet.'
      : 'Posts are temporarily unavailable.';
    const body = state.kind === 'empty'
      ? 'Check back soon — we publish new pieces from across the group regularly.'
      : 'Please come back shortly. In the meantime, you can browse our newsroom for the latest updates.';
    const eyebrow = state.kind === 'empty' ? 'Nothing yet' : 'Temporarily unavailable';
    return (
      <div className="bg-surface-alt border-l-4 border-brand-500/40 p-8 md:p-10 max-w-3xl">
        <p data-i18n={i18nAttr(eyebrow)} className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">
          {eyebrow}
        </p>
        <h3 data-i18n={i18nAttr(heading)} className="font-display font-heavy text-xl md:text-2xl text-ink leading-tight">{heading}</h3>
        <p data-i18n={i18nAttr(body)} className="mt-4 text-base text-ink/75 leading-relaxed">{body}</p>
        <a
          href="/insights/news/"
          className="mt-6 inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200"
        >
          <span data-i18n={i18nAttr('Visit the newsroom')}>Visit the newsroom</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>
    );
  }

  const [featured, ...rest] = state.posts;

  return (
    <div>
      {/* ===== FEATURED — latest post ===== */}
      <FeaturedCard
        href={`/insights/blog/${featured.slug}/`}
        image={featured.cover_image}
        title={featured.title}
        excerpt={featured.excerpt}
        meta={postMeta(featured)}
        badgeLabel="Latest"
        ctaLabel="Read article"
      />

      {/* ===== REST — card grid ===== */}
      {rest.length > 0 && (
        <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {rest.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
