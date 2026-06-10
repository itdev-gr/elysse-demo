import { useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { buildCatalogueTree } from '../../lib/catalogues';
import type { Catalogue } from '../../types/catalogue';

/** Render shape shared by live data and the server-provided fallback. */
export interface CatalogueCardNode {
  name: string;
  description: string | null;
  pdf_url: string | null;
  children: { name: string; description: string | null; pdf_url: string | null }[];
}

interface Props {
  /** Server-rendered fallback used when Supabase is unreachable. */
  fallback: CatalogueCardNode[];
}

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; categories: CatalogueCardNode[] };

const downloadIcon = (cls: string) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

export default function CataloguesList({ fallback }: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'ready', categories: fallback });
        return;
      }
      const { data, error } = await supabase
        .from('catalogues')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      if (error || !data || data.length === 0) {
        setState({ kind: 'ready', categories: fallback });
        return;
      }
      setState({ kind: 'ready', categories: buildCatalogueTree(data as Catalogue[]) });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep "N catalogues" copy elsewhere on the page truthful.
  useEffect(() => {
    if (state.kind !== 'ready') return;
    document.querySelectorAll('[data-catalogue-count]').forEach((el) => {
      el.textContent = String(state.categories.length);
    });
  }, [state]);

  // Soft stagger reveal, consistent with the certification grids.
  useEffect(() => {
    if (state.kind !== 'ready' || !gridRef.current) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const grid = gridRef.current;
    const cards = Array.from(grid.querySelectorAll('[data-catalogue-card]')) as HTMLElement[];
    if (reduce) {
      cards.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }
    let ctx: { revert: () => void } | undefined;
    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.set(cards, { y: 32, opacity: 0 });
        ScrollTrigger.create({
          trigger: grid,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(cards, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.06 });
          },
        });
        ScrollTrigger.refresh();
      }, grid);
    })();
    return () => ctx?.revert();
  }, [state]);

  // Modal: close on Escape, lock body scroll while open.
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex]);

  if (state.kind === 'loading') {
    return (
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10 border border-ink/10" aria-busy="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <li key={i} className="bg-surface min-h-[220px] p-7 animate-pulse">
            <div className="h-3 w-16 bg-ink/10 rounded"></div>
            <div className="mt-4 h-6 w-3/4 bg-ink/10 rounded"></div>
            <div className="mt-3 h-3 w-full bg-ink/10 rounded"></div>
            <div className="mt-8 h-3 w-28 bg-ink/10 rounded"></div>
          </li>
        ))}
      </ol>
    );
  }

  const open = openIndex !== null ? state.categories[openIndex] : null;
  const openNum = openIndex !== null ? String(openIndex + 1).padStart(2, '0') : '';

  return (
    <>
      <ol ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10 border border-ink/10">
        {state.categories.map((cat, i) => {
          const num = String(i + 1).padStart(2, '0');
          return (
            <li key={`${cat.name}-${i}`} data-catalogue-card className="group relative bg-surface flex">
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-haspopup="dialog"
                className="relative flex-1 flex flex-col text-left p-7 md:p-8 cursor-pointer overflow-hidden transition-colors duration-300 hover:bg-brand-500/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-3 right-3 font-display font-heavy text-brand-500/10 leading-none select-none transition-colors duration-500 group-hover:text-brand-500/30 z-10"
                  style={{ fontSize: 'clamp(4.5rem, 7vw, 7rem)' }}
                >{num}</span>

                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">Catalogue.{num}</span>
                <span className="mt-4 font-display font-heavy leading-tight text-xl md:text-2xl text-ink pr-10 group-hover:text-brand-500 transition-colors duration-200">
                  {cat.name}
                </span>
                {cat.description && (
                  <span className="mt-2 text-sm text-ink/70 leading-snug">{cat.description}</span>
                )}
                <span aria-hidden="true" className="mt-5 h-px w-10 bg-brand-500 transition-[width] duration-500 ease-out group-hover:w-20"></span>

                <span className="mt-auto pt-6 flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.25em]">
                  <span className="text-ink/55">
                    {cat.children.length > 0
                      ? `${cat.children.length} ${cat.children.length === 1 ? 'leaflet' : 'leaflets'} inside`
                      : 'Full section PDF'}
                  </span>
                  <span className="inline-flex items-center gap-2 text-ink group-hover:text-brand-500 transition-colors duration-200">
                    <span>View</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* ===== POPUP — category contents + downloads ===== */}
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${open.name} catalogue contents`}
        >
          <div
            aria-hidden="true"
            onClick={() => setOpenIndex(null)}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm cursor-pointer"
          ></div>

          <div className="relative w-full sm:max-w-xl max-h-[85vh] overflow-y-auto bg-surface border-t-4 sm:border-t-0 sm:border-l-4 border-brand-500 shadow-2xl">
            <div className="sticky top-0 bg-surface border-b border-ink/10 px-6 md:px-8 py-5 flex items-start justify-between gap-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">Catalogue.{openNum}</p>
                <h3 className="mt-1 font-display font-heavy leading-tight text-xl md:text-2xl text-ink">{open.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                aria-label="Close"
                className="shrink-0 -mr-2 p-2 text-ink/60 hover:text-ink cursor-pointer transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="px-6 md:px-8 py-6">
              {open.description && (
                <p className="text-sm text-ink/70 leading-relaxed">{open.description}</p>
              )}

              {open.pdf_url && (
                <a
                  href={open.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Download ${open.name} catalogue (PDF)`}
                  className="mt-5 inline-flex items-center gap-3 px-5 py-2.5 bg-brand-500 text-surface hover:bg-brand-700 text-[11px] uppercase tracking-[0.25em] transition-colors duration-200 cursor-pointer"
                >
                  {downloadIcon('w-4 h-4')}
                  <span>Download full catalogue</span>
                </a>
              )}

              {open.children.length > 0 ? (
                <>
                  <p className="mt-8 text-[11px] uppercase tracking-[0.3em] text-brand-500">
                    In this section
                  </p>
                  <ol className="mt-3 border border-ink/10 divide-y divide-ink/10">
                    {open.children.map((sub, j) => {
                      const subNum = String(j + 1).padStart(2, '0');
                      const inner = (
                        <>
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45 w-8 shrink-0 pt-1">{subNum}</span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-ink leading-snug group-hover/sub:text-brand-500 transition-colors duration-200">{sub.name}</span>
                            {sub.description && (
                              <span className="block mt-0.5 text-xs text-ink/60 leading-snug">{sub.description}</span>
                            )}
                          </span>
                          {sub.pdf_url && (
                            <span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-ink/70 group-hover/sub:text-brand-500 transition-colors duration-200 pt-1">
                              {downloadIcon('w-3 h-3')}
                              <span>PDF</span>
                            </span>
                          )}
                        </>
                      );
                      return (
                        <li key={`${sub.name}-${j}`}>
                          {sub.pdf_url ? (
                            <a
                              href={sub.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Download ${sub.name} (PDF)`}
                              className="group/sub flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-brand-500/5 transition-colors duration-200"
                            >
                              {inner}
                            </a>
                          ) : (
                            <div className="group/sub flex items-start gap-3 px-4 py-3.5">{inner}</div>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </>
              ) : (
                <p className="mt-8 text-sm text-ink/55">
                  This section has no separate leaflets — the full catalogue above covers the whole range.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
