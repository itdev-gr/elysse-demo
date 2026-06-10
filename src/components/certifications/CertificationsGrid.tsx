import { useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { sortCertifications } from '../../lib/certifications';
import type { Certification, CertGroup } from '../../types/certification';

/** Subset of Certification needed to render a card (fallback rows use this). */
export interface CertCard {
  name: string;
  description: string | null;
  scope: string | null;
  tag: string | null;
  logo: string | null;
  pdf_url: string | null;
}

interface Props {
  group: CertGroup;
  /** Server-rendered fallback used when Supabase is unreachable or empty. */
  fallback: CertCard[];
}

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; certs: CertCard[] };

export default function CertificationsGrid({ group, fallback }: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const gridRef = useRef<HTMLOListElement | null>(null);

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
        .eq('cert_group', group)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      // On any failure (or an empty/pre-migration table) keep the page whole
      // with the server-provided fallback rather than rendering a hole.
      if (error || !data || data.length === 0) {
        setState({ kind: 'ready', certs: fallback });
        return;
      }
      setState({ kind: 'ready', certs: sortCertifications(data as Certification[]) });
    })();
    return () => {
      cancelled = true;
    };
  }, [group]);

  // Keep "N standards / N certifications" copy elsewhere on the page truthful.
  useEffect(() => {
    if (state.kind !== 'ready') return;
    document.querySelectorAll('[data-cert-count]').forEach((el) => {
      el.textContent = String(state.certs.length);
    });
  }, [state]);

  // Stamp-in animation — ported from the page's previous inline GSAP script.
  useEffect(() => {
    if (state.kind !== 'ready' || !gridRef.current) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const grid = gridRef.current;
    const cards = Array.from(grid.querySelectorAll('[data-cert-card]')) as HTMLElement[];
    const badges = Array.from(grid.querySelectorAll('[data-cert-badge]')) as HTMLElement[];
    if (reduce) {
      [...cards, ...badges].forEach((el) => {
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
        gsap.set(badges, { rotate: -8, scale: 0.85, opacity: 0, transformOrigin: '50% 50%' });
        ScrollTrigger.create({
          trigger: grid,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(cards, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 });
            gsap.to(badges, { rotate: 0, scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(2.4)', stagger: 0.1, delay: 0.15 });
          },
        });
        ScrollTrigger.refresh();
      }, grid);
    })();
    return () => ctx?.revert();
  }, [state]);

  if (state.kind === 'loading') {
    return (
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10 border border-ink/10" aria-busy="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <li key={i} className="bg-surface min-h-[420px] animate-pulse">
            <div className="bg-surface-alt border-b border-ink/10 aspect-[4/3]"></div>
            <div className="p-7 space-y-3">
              <div className="h-3 w-16 bg-ink/10 rounded"></div>
              <div className="h-6 w-3/4 bg-ink/10 rounded"></div>
              <div className="h-3 w-full bg-ink/10 rounded"></div>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  const prefix = group === 'green' ? 'Cert.' : 'Cat.';

  return (
    <ol ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10 border border-ink/10">
      {state.certs.map((c, i) => {
        const num = String(i + 1).padStart(2, '0');
        return (
          <li key={`${c.name}-${i}`} data-cert-card className="group relative bg-surface flex flex-col overflow-hidden">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-3 right-3 font-display font-heavy text-brand-500/10 leading-none select-none transition-colors duration-500 group-hover:text-brand-500/30 z-10"
              style={{ fontSize: 'clamp(4.5rem, 7vw, 7rem)' }}
            >{num}</span>

            <div className="bg-surface-alt border-b border-ink/10 aspect-[4/3] flex items-center justify-center p-8 md:p-10 overflow-hidden">
              {c.logo ? (
                <img
                  data-cert-badge
                  src={c.logo}
                  alt={`${c.name} certification badge`}
                  width="200"
                  height="200"
                  loading="lazy"
                  decoding="async"
                  className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                />
              ) : (
                <span className="text-[10px] uppercase tracking-[0.25em] text-ink/40">Certified</span>
              )}
            </div>

            <div className="relative p-7 md:p-8 flex-1 flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">
                {prefix}{num}{c.tag ? ` · ${c.tag}` : ''}
              </span>
              <h3 className="mt-4 font-display font-heavy leading-tight text-xl md:text-2xl text-ink">{c.name}</h3>
              {c.description && <p className="mt-1 text-sm text-ink/70 leading-snug">{c.description}</p>}
              <div aria-hidden="true" className="mt-5 h-px w-10 bg-brand-500 transition-[width] duration-500 ease-out group-hover:w-20"></div>
              {c.scope && <p className="mt-4 text-sm text-ink/70 leading-[1.6] flex-1">{c.scope}</p>}
              {c.pdf_url && (
                <a
                  href={c.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink hover:text-brand-500 transition-colors duration-200 cursor-pointer"
                  aria-label={`Download ${c.name} certificate (PDF)`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span>Download PDF</span>
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
