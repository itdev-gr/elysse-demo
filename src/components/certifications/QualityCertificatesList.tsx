import { useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { sortCertifications } from '../../lib/certifications';
import type { Certification } from '../../types/certification';

/** Row shape shared by live data and the server-provided fallback. */
export interface CertificateRow {
  name: string;
  description: string | null;
  pdf_url: string | null;
}

interface Props {
  /** Category slug, e.g. 'pe-pipes'. */
  category: string;
  /** Server-rendered fallback used when Supabase is unreachable. */
  fallback: CertificateRow[];
}

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; certs: CertificateRow[] };

/** Official-looking seal/rosette mark — the visual anchor for each document. */
const SealMark = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="9" r="6" />
    <path d="M9 13.5 7.5 22l4.5-2.5L16.5 22 15 13.5" />
    <path d="m9.5 9 1.6 1.6L14.5 7" />
  </svg>
);

const DownloadGlyph = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function QualityCertificatesList({ category, fallback }: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const listRef = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'ready', certs: fallback });
        return;
      }
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('cert_group', 'quality')
        .eq('category', category)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      if (error || !data || data.length === 0) {
        setState({ kind: 'ready', certs: fallback });
        return;
      }
      setState({ kind: 'ready', certs: sortCertifications(data as Certification[]) });
    })();
    return () => {
      cancelled = true;
    };
  }, [category]);

  // Staggered reveal, consistent with the certification/catalogue grids.
  useEffect(() => {
    if (state.kind !== 'ready' || !listRef.current) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const list = listRef.current;
    const items = Array.from(list.querySelectorAll('[data-cert-row]')) as HTMLElement[];
    if (reduce) {
      items.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }
    let ctx: { revert: () => void } | undefined;
    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.set(items, { x: -18, opacity: 0 });
        ScrollTrigger.create({
          trigger: list,
          start: 'top 85%',
          once: true,
          onEnter: () =>
            gsap.to(items, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.07 }),
        });
        ScrollTrigger.refresh();
      }, list);
    })();
    return () => ctx?.revert();
  }, [state]);

  if (state.kind === 'loading') {
    return (
      <div className="space-y-px" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-5 bg-surface border border-ink/10 p-5 md:p-6 animate-pulse">
            <div className="w-14 h-14 bg-ink/5 shrink-0"></div>
            <div className="flex-1">
              <div className="h-3 w-16 bg-ink/10 rounded"></div>
              <div className="mt-3 h-5 w-2/3 bg-ink/10 rounded"></div>
            </div>
            <div className="h-9 w-28 bg-ink/10 rounded hidden sm:block"></div>
          </div>
        ))}
      </div>
    );
  }

  if (state.certs.length === 0) {
    return (
      <p className="text-base text-ink/60">
        No certificates have been published in this category yet.
      </p>
    );
  }

  return (
    <ol ref={listRef} className="space-y-3 md:space-y-4">
      {state.certs.map((c, i) => {
        const num = String(i + 1).padStart(2, '0');

        const body = (
          <>
            {/* Seal tile + ghost index */}
            <span className="relative shrink-0">
              <span className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-surface-alt text-brand-500/70 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-surface">
                <SealMark className="w-7 h-7 md:w-8 md:h-8" />
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-3 -left-2 font-display font-heavy text-2xl md:text-3xl leading-none text-ink/[0.07] select-none"
              >
                {num}
              </span>
            </span>

            {/* Name + description */}
            <span className="flex-1 min-w-0 py-0.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/45">
                Certificate · {num}
              </span>
              <span className="mt-1 block font-display font-heavy text-lg md:text-xl text-ink leading-snug transition-colors duration-200 group-hover:text-brand-500">
                {c.name}
              </span>
              {c.description && (
                <span className="mt-1 block text-sm text-ink/60 leading-snug">{c.description}</span>
              )}
            </span>

            {/* Download affordance */}
            {c.pdf_url ? (
              <span className="shrink-0 self-center inline-flex items-center gap-2 px-4 py-2.5 border border-ink/15 text-[11px] uppercase tracking-[0.25em] text-ink transition-colors duration-200 group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-surface">
                <DownloadGlyph className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">PDF</span>
              </span>
            ) : (
              <span className="shrink-0 self-center text-[10px] uppercase tracking-[0.2em] text-ink/35">
                On request
              </span>
            )}
          </>
        );

        const shellClass =
          'group relative flex items-stretch gap-4 md:gap-5 bg-surface border border-ink/10 ' +
          'pl-5 md:pl-6 pr-4 md:pr-5 py-4 md:py-5 overflow-hidden ' +
          'transition-[box-shadow,border-color] duration-300 hover:border-brand-500/40 hover:shadow-[0_12px_40px_-24px_rgba(0,0,0,0.45)]';

        // The signature growing brand bar on the left edge.
        const accentBar = (
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-500 origin-top scale-y-0 transition-transform duration-300 ease-out group-hover:scale-y-100"
          ></span>
        );

        return (
          <li key={`${c.name}-${i}`} data-cert-row>
            {c.pdf_url ? (
              <a
                href={c.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Download ${c.name} certificate (PDF)`}
                className={`${shellClass} cursor-pointer`}
              >
                {accentBar}
                {body}
              </a>
            ) : (
              <div className={shellClass}>
                {accentBar}
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
