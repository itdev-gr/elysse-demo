import { useEffect, useState } from 'react';
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

export default function QualityCertificatesList({ category, fallback }: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' });

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

  if (state.kind === 'loading') {
    return (
      <ol className="border border-ink/10 divide-y divide-ink/10 bg-surface" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="p-6 md:p-7 animate-pulse">
            <div className="h-3 w-16 bg-ink/10 rounded"></div>
            <div className="mt-3 h-5 w-2/3 bg-ink/10 rounded"></div>
          </li>
        ))}
      </ol>
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
    <ol className="border border-ink/10 divide-y divide-ink/10 bg-surface">
      {state.certs.map((c, i) => {
        const num = String(i + 1).padStart(2, '0');
        const inner = (
          <>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45 w-10 shrink-0 pt-1.5">
              {num}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-display font-heavy text-lg md:text-xl text-ink leading-snug group-hover:text-brand-500 transition-colors duration-200">
                {c.name}
              </span>
              {c.description && (
                <span className="block mt-1 text-sm text-ink/65 leading-snug">{c.description}</span>
              )}
            </span>
            <span className="shrink-0 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink/70 group-hover:text-brand-500 transition-colors duration-200 pt-1.5">
              {c.pdf_url && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span className="hidden sm:inline">PDF</span>
                </>
              )}
            </span>
          </>
        );
        return (
          <li key={`${c.name}-${i}`}>
            {c.pdf_url ? (
              <a
                href={c.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Download ${c.name} certificate (PDF)`}
                className="group flex items-start gap-4 p-6 md:p-7 cursor-pointer hover:bg-brand-500/5 transition-colors duration-200"
              >
                {inner}
              </a>
            ) : (
              <div className="group flex items-start gap-4 p-6 md:p-7">{inner}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
