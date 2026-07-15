import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { FundedProject } from '../../types/funded-project';
import { i18nAttr } from '../../lib/i18n';
import { renderProjectBody } from '../../lib/funded-projects';

type Props = { slug: string };

type State =
  | { kind: 'loading' }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; project: FundedProject };

const statusColor = (status: FundedProject['status']) =>
  status === 'Ongoing'
    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
    : 'bg-ink/5 text-ink/70 border-ink/15';

export default function FundedProjectView({ slug }: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'error', message: 'Supabase not configured' });
        return;
      }
      const { data, error } = await supabase
        .from('funded_projects')
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
      setState({ kind: 'ready', project: data as FundedProject });
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Re-apply the active language once the data-driven tree has rendered.
  useEffect(() => {
    try {
      const l = localStorage.getItem('elysee.lang');
      if (l && l !== 'en') document.dispatchEvent(new CustomEvent('elysee:lang', { detail: { lang: l } }));
    } catch {}
  }, [state]);

  if (state.kind === 'loading') {
    return (
      <div className="max-w-screen-md mx-auto px-4 md:px-8 py-16 md:py-24 animate-pulse">
        <div className="h-4 w-40 bg-ink/10 rounded" />
        <div className="mt-6 h-12 w-3/4 bg-ink/10 rounded" />
        <div className="mt-10 h-56 bg-ink/10 rounded" />
        <div className="mt-8 space-y-3">
          <div className="h-3 bg-ink/10 rounded" />
          <div className="h-3 bg-ink/10 rounded" />
          <div className="h-3 w-5/6 bg-ink/10 rounded" />
        </div>
      </div>
    );
  }

  if (state.kind === 'not-found' || state.kind === 'error') {
    const heading = state.kind === 'not-found' ? 'Project not found.' : 'Project temporarily unavailable.';
    const eyebrow = state.kind === 'not-found' ? 'Not found' : 'Temporarily unavailable';
    return (
      <div className="max-w-screen-md mx-auto px-4 md:px-8 py-20 md:py-28">
        <p data-i18n={i18nAttr(eyebrow)} className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">{eyebrow}</p>
        <h1 data-i18n={i18nAttr(heading)} className="font-display font-heavy text-3xl md:text-4xl text-ink leading-tight">{heading}</h1>
        <p data-i18n={i18nAttr('The project you are looking for may have been moved or unpublished. Browse all our funded research projects below.')} className="mt-4 text-base text-ink/75 leading-relaxed">
          The project you are looking for may have been moved or unpublished. Browse all our funded research projects below.
        </p>
        <a
          href="/innovation/funded-research-projects/"
          className="mt-8 inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200"
        >
          <span data-i18n={i18nAttr('Back to Funded Research Projects')}>Back to Funded Research Projects</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>
    );
  }

  const p = state.project;

  return (
    <article>
      {/* Hero band — mirrors PageHero (brand band, no cover image) */}
      <header className="bg-brand-500 text-surface">
        <div className="mx-auto max-w-screen-md px-4 md:px-8 py-14 md:py-20">
          <p data-i18n={i18nAttr('Innovation · Funded Research Projects')} className="text-[11px] uppercase tracking-[0.4em] text-surface/80 font-semibold">
            Innovation · Funded Research Projects
          </p>
          <h1 className="mt-5 font-display font-heavy leading-[1.05] tracking-tight" style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
            {p.name}
          </h1>
          {p.excerpt && <p className="mt-5 max-w-2xl text-base md:text-lg text-surface/85 leading-relaxed">{p.excerpt}</p>}
        </div>
      </header>

      <div className="mx-auto max-w-screen-md px-4 md:px-8 py-12 md:py-16 space-y-6">
        {/* Project logo — object-contain on a soft tint, mirroring the card */}
        {p.image && (
          <figure className="bg-brand-500/5 border border-ink/10 rounded-sm overflow-hidden">
            <img
              src={p.image}
              alt={p.image_alt || `${p.name} project logo`}
              loading="eager"
              width={640}
              height={400}
              className="w-full max-h-72 object-contain p-8 md:p-10"
            />
          </figure>
        )}

        {/* Funding metadata band */}
        <section aria-label="Project facts" className="bg-surface border border-ink/10 rounded-sm p-6 md:p-8">
          <div className="flex items-center gap-3 flex-wrap mb-5">
            <span data-i18n={i18nAttr(p.status)} className={`inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-medium border rounded-sm ${statusColor(p.status)}`}>
              {p.status}
            </span>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <dt data-i18n={i18nAttr('Duration')} className="text-[10px] uppercase tracking-widest text-ink/60 font-medium">Duration</dt>
              <dd className="mt-1 font-heavy text-ink">{p.duration}</dd>
            </div>
            <div>
              <dt data-i18n={i18nAttr('Total Funding')} className="text-[10px] uppercase tracking-widest text-ink/60 font-medium">Total Funding</dt>
              <dd className="mt-1 font-heavy text-ink">{p.total_funding}</dd>
            </div>
            {p.elysee_funding && (
              <div>
                <dt data-i18n={i18nAttr('Elysée Funding')} className="text-[10px] uppercase tracking-widest text-ink/60 font-medium">Elysée Funding</dt>
                <dd className="mt-1 font-heavy text-ink">{p.elysee_funding}</dd>
              </div>
            )}
          </dl>
          {p.partners && p.partners.length > 0 && (
            <div className="mt-6 pt-6 border-t border-ink/10">
              <p data-i18n={i18nAttr('Partners')} className="text-[10px] uppercase tracking-widest text-ink/60 font-medium">Partners</p>
              <ul className="mt-3 space-y-2 text-sm md:text-base text-ink/85">
                {p.partners.map((partner, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span aria-hidden="true" className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    {partner}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Rich body */}
        {p.body.trim() && (
          <div
            className="text-base md:text-lg text-ink/85 leading-[1.7] [&_h2]:font-display [&_h2]:font-heavy [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:text-ink [&_h2]:mt-10 [&_h2]:mb-5 [&_h3]:font-display [&_h3]:font-heavy [&_h3]:text-xl [&_h3]:text-ink [&_h3]:mt-8 [&_h3]:mb-4 [&_p]:mb-5 [&_a]:text-brand-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-6 [&_strong]:font-semibold [&_strong]:text-ink"
            // Sanitized via DOMPurify in renderProjectBody.
            dangerouslySetInnerHTML={{ __html: renderProjectBody(p.body) }}
          />
        )}

        <nav aria-label="Back to funded research projects" className="pt-8 mt-8 border-t border-ink/10">
          <a
            href="/innovation/funded-research-projects/"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-accent transition-colors duration-150"
          >
            <span aria-hidden="true">←</span> <span data-i18n={i18nAttr('Back to Funded Research Projects')}>Back to Funded Research Projects</span>
          </a>
        </nav>
      </div>
    </article>
  );
}
