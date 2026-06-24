import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { i18nAttr } from '../../lib/i18n';
import { exhibitionToCard, mediaToCard, ebookToCard, type InsightCard } from '../../lib/insights-cards';
import type { Exhibition } from '../../types/exhibition';
import type { Media } from '../../types/media';
import type { Ebook } from '../../types/ebook';

/**
 * Client-side grid for the Insights listing pages (Exhibitions, Media, eBooks).
 *
 * These pages fetch in the browser — mirroring how the Blog/News islands work —
 * so content goes live the moment it is published in the dashboard, with no
 * rebuild. Fetching here (rather than during SSR) also keeps the markdown
 * sanitiser (jsdom via isomorphic-dompurify) off the serverless runtime, where
 * it crashes; in the browser DOMPurify is native.
 */

type Kind = 'exhibitions' | 'media' | 'ebooks';

const MAPPERS: Record<Kind, (row: any) => InsightCard> = {
  exhibitions: (r: Exhibition) => exhibitionToCard(r),
  media: (r: Media) => mediaToCard(r),
  ebooks: (r: Ebook) => ebookToCard(r),
};

interface Props {
  kind: Kind;
  /** Shown when there is nothing published yet. */
  emptyMessage?: string;
}

type State =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error' }
  | { kind: 'ready'; items: InsightCard[] };

export default function InsightsList({ kind, emptyMessage = 'Nothing here yet — check back soon.' }: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'error' });
        return;
      }
      const { data, error } = await supabase
        .from(kind)
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        setState({ kind: 'error' });
        return;
      }
      if (!data || data.length === 0) {
        setState({ kind: 'empty' });
        return;
      }
      setState({ kind: 'ready', items: data.map(MAPPERS[kind]) });
    })();
    return () => {
      cancelled = true;
    };
  }, [kind]);

  // This island renders its tree after hydration and swaps between
  // loading / empty / error / ready states; re-fire the swap so the loaded
  // listener applies the active language to the freshly rendered nodes.
  useEffect(() => {
    try {
      const l = localStorage.getItem('elysee.lang');
      if (l && l !== 'en') document.dispatchEvent(new CustomEvent('elysee:lang', { detail: { lang: l } }));
    } catch {}
  }, [state]);

  if (state.kind === 'loading') {
    return (
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <li key={i} className="border border-ink/10 rounded-sm overflow-hidden bg-surface animate-pulse">
            <div className="aspect-[16/9] bg-ink/5"></div>
            <div className="p-5 space-y-3">
              <div className="h-3 w-24 bg-ink/10 rounded"></div>
              <div className="h-5 w-3/4 bg-ink/10 rounded"></div>
              <div className="h-3 w-full bg-ink/10 rounded"></div>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (state.kind === 'empty' || state.kind === 'error') {
    const message = state.kind === 'empty' ? emptyMessage : 'Temporarily unavailable — please try again shortly.';
    return <p className="text-center text-ink/60 py-16" data-i18n={i18nAttr(message)}>{message}</p>;
  }

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {state.items.map((it) => (
        <li
          key={it.href}
          className="group border border-ink/10 rounded-sm overflow-hidden bg-surface transition-all duration-200 ease-out hover:border-brand-500/40 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)]"
        >
          <a href={it.href} className="block">
            <div className="aspect-[16/9] bg-brand-500/5 overflow-hidden">
              {it.image ? (
                <img
                  src={it.image}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display font-heavy text-brand-500/25" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>E</span>
                </div>
              )}
            </div>
          </a>
          <div className="p-5">
            {it.date && <time className="text-xs uppercase tracking-widest text-ink/60">{it.date}</time>}
            <h3 className="mt-2 text-lg font-heavy text-ink">
              <a href={it.href} className="hover:text-brand-500 transition-colors duration-150">{it.title}</a>
            </h3>
            {it.excerpt && <p className="mt-2 text-sm text-ink/75 line-clamp-3">{it.excerpt}</p>}
            <a
              href={it.href}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-accent transition-colors duration-150"
            >
              <span data-i18n={i18nAttr('Read more')}>Read more</span> <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
