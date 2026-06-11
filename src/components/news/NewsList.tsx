import { useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { NewsArticle } from '../../types/news';

/** Card shape shared by live data and the server-provided fallback. */
export interface NewsCardNode {
  slug: string | null;
  title: string;
  excerpt: string;
  cover_image: string | null;
  author: string | null;
  published_at: string | null;
  reading_minutes: number | null;
}

interface Props {
  /** Server-rendered fallback used when Supabase is unreachable. */
  fallback: NewsCardNode[];
}

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; items: NewsCardNode[] };

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

function meta(a: NewsCardNode): string {
  const author = a.author?.trim() || 'Elysée Group';
  return [author, formatDate(a.published_at), a.reading_minutes ? `${a.reading_minutes} min read` : '']
    .filter(Boolean)
    .join(' · ');
}

const ArrowR = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);

const CoverOrMark = ({ src, className }: { src: string | null; className?: string }) =>
  src ? (
    <img src={src} alt="" loading="lazy" className={`absolute inset-0 w-full h-full object-cover ${className ?? ''}`} />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center bg-brand-500/5">
      <span className="font-display font-heavy text-brand-500/25" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}>E</span>
    </div>
  );

export default function NewsList({ fallback }: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'ready', items: fallback });
        return;
      }
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false, nullsFirst: false });
      if (cancelled) return;
      if (error || !data || data.length === 0) {
        setState({ kind: 'ready', items: error ? fallback : [] });
        return;
      }
      setState({ kind: 'ready', items: (data as NewsArticle[]) as NewsCardNode[] });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Staggered reveal for the grid cards, consistent with the rest of the site.
  useEffect(() => {
    if (state.kind !== 'ready' || !gridRef.current) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const grid = gridRef.current;
    const cards = Array.from(grid.querySelectorAll('[data-news-card]')) as HTMLElement[];
    if (reduce) {
      cards.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }
    let ctx: { revert: () => void } | undefined;
    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.set(cards, { y: 28, opacity: 0 });
        ScrollTrigger.create({
          trigger: grid,
          start: 'top 85%',
          once: true,
          onEnter: () => gsap.to(cards, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 }),
        });
        ScrollTrigger.refresh();
      }, grid);
    })();
    return () => ctx?.revert();
  }, [state]);

  if (state.kind === 'loading') {
    return (
      <div className="space-y-10">
        <div className="bg-surface-alt border-l-4 border-brand-500/40 min-h-[320px] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-surface-alt border-l-4 border-brand-500/40 min-h-[360px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="bg-surface-alt border-l-4 border-brand-500/40 p-8 md:p-10 max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">Nothing yet</p>
        <h3 className="font-display font-heavy text-xl md:text-2xl text-ink leading-tight">No news yet.</h3>
        <p className="mt-4 text-base text-ink/75 leading-relaxed">
          Check back soon — we publish launches, milestones and updates from across the group regularly.
        </p>
      </div>
    );
  }

  const [featured, ...rest] = state.items;
  const featuredHref = featured.slug ? `/insights/news/${featured.slug}/` : undefined;
  const FeaturedTag = featuredHref ? 'a' : 'div';

  return (
    <div>
      {/* ===== FEATURED — latest article ===== */}
      <FeaturedTag
        {...(featuredHref ? { href: featuredHref } : {})}
        className={`group grid grid-cols-1 lg:grid-cols-2 bg-surface border border-ink/10 overflow-hidden ${featuredHref ? 'cursor-pointer' : ''}`}
      >
        <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[380px] bg-surface-alt overflow-hidden">
          <CoverOrMark src={featured.cover_image} className="transition-transform duration-700 ease-out group-hover:scale-105" />
          <span className="absolute top-4 left-4 inline-block bg-brand-500 text-surface text-[10px] uppercase tracking-[0.25em] px-3 py-1.5">
            Latest
          </span>
        </div>
        <div className="p-7 md:p-10 lg:p-12 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold">{meta(featured)}</p>
          <h2 className="mt-4 font-display font-heavy leading-[1.05] tracking-tight text-ink transition-colors duration-300 group-hover:text-brand-500" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)' }}>
            {featured.title}
          </h2>
          <div aria-hidden="true" className="mt-6 h-px w-12 bg-brand-500 transition-[width] duration-500 ease-out group-hover:w-24"></div>
          <p className="mt-6 text-base md:text-lg text-ink/70 leading-[1.6] line-clamp-3">{featured.excerpt}</p>
          {featuredHref && (
            <span className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-brand-500 font-medium">
              Read article <ArrowR className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          )}
        </div>
      </FeaturedTag>

      {/* ===== REST — card grid ===== */}
      {rest.length > 0 && (
        <div ref={gridRef} className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {rest.map((a, i) => {
            const href = a.slug ? `/insights/news/${a.slug}/` : undefined;
            const Tag = href ? 'a' : 'div';
            return (
              <Tag
                key={a.slug ?? `${a.title}-${i}`}
                data-news-card
                {...(href ? { href } : {})}
                className={`group bg-surface border-l-4 border-brand-500 flex flex-col transition-colors duration-300 hover:bg-surface-alt ${href ? 'cursor-pointer' : ''}`}
              >
                <div className="relative w-full aspect-video bg-surface-alt overflow-hidden">
                  <CoverOrMark src={a.cover_image} className="transition-transform duration-700 ease-out group-hover:scale-105" />
                </div>
                <div className="p-6 md:p-7 flex flex-col flex-1">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold">{meta(a)}</p>
                  <h3 className="mt-3 font-display font-heavy text-lg md:text-xl text-ink leading-tight group-hover:text-brand-500 transition-colors duration-300">
                    {a.title}
                  </h3>
                  <div aria-hidden="true" className="mt-4 h-px w-10 bg-brand-500"></div>
                  <p className="mt-4 text-sm md:text-base text-ink/70 leading-[1.6] line-clamp-3 flex-1">{a.excerpt}</p>
                  {href && (
                    <span className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-brand-500 font-medium">
                      Read article <ArrowR className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  )}
                </div>
              </Tag>
            );
          })}
        </div>
      )}
    </div>
  );
}
