import { useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { FundedProject } from '../../types/funded-project';
import { i18nAttr } from '../../lib/i18n';

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; items: FundedProject[] };

const GROUPS: { status: FundedProject['status']; heading: string }[] = [
  { status: 'Ongoing', heading: 'Ongoing Projects' },
  { status: 'Completed', heading: 'Completed Projects' },
];

const statusColor = (status: FundedProject['status']) =>
  status === 'Ongoing'
    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
    : 'bg-ink/5 text-ink/70 border-ink/15';

const ArrowR = ({ className }: { className?: string }) => (
  <span aria-hidden="true" className={className}>→</span>
);

function ProjectCard({ p }: { p: FundedProject }) {
  const href = `/innovation/funded-research-projects/${p.slug}/`;
  return (
    <a
      href={href}
      data-funded-card
      className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-0 bg-surface border border-ink/10 rounded-sm overflow-hidden transition-all duration-200 ease-out hover:border-brand-500/40 hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.20)]"
    >
      <div className="md:col-span-4 aspect-[16/10] md:aspect-auto bg-brand-500/5 overflow-hidden flex items-center justify-center">
        {p.image ? (
          <img
            src={p.image}
            alt={p.image_alt || `${p.name} project banner`}
            loading="lazy"
            width={640}
            height={400}
            className="w-full h-full object-contain p-6 md:p-8 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <span className="font-display font-heavy text-brand-500/25" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            {p.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="md:col-span-8 p-6 md:p-8 flex flex-col">
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <span
            data-i18n={i18nAttr(p.status)}
            className={`inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-medium border rounded-sm ${statusColor(p.status)}`}
          >
            {p.status}
          </span>
          <span className="text-xs uppercase tracking-widest text-ink/60">{p.duration}</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-heavy text-ink leading-tight">{p.name}</h3>
        {p.excerpt && (
          <p className="mt-3 text-sm md:text-base text-ink/80 leading-relaxed">{p.excerpt}</p>
        )}
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
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
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-500 group-hover:text-brand-accent transition-colors duration-150">
          <span data-i18n={i18nAttr('Read more')}>Read more</span>{' '}
          <ArrowR className="transition-transform duration-150 group-hover:translate-x-1" />
        </span>
      </div>
    </a>
  );
}

export default function FundedProjectsList() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'ready', items: [] });
        return;
      }
      const { data, error } = await supabase
        .from('funded_projects')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (cancelled) return;
      setState({ kind: 'ready', items: error || !data ? [] : (data as FundedProject[]) });
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

  // Staggered reveal, consistent with the rest of the site (island nodes are
  // added after hydration, so the global [data-reveal] observer won't see them).
  useEffect(() => {
    if (state.kind !== 'ready' || !rootRef.current) return;
    const root = rootRef.current;
    const cards = Array.from(root.querySelectorAll('[data-funded-card]')) as HTMLElement[];
    if (cards.length === 0) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
          trigger: root,
          start: 'top 85%',
          once: true,
          onEnter: () => gsap.to(cards, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 }),
        });
        ScrollTrigger.refresh();
      }, root);
    })();
    return () => ctx?.revert();
  }, [state]);

  if (state.kind === 'loading') {
    return (
      <div className="space-y-6 md:space-y-8">
        {[0, 1].map((i) => (
          <div key={i} className="bg-surface-alt border border-ink/10 rounded-sm min-h-[220px] animate-pulse" />
        ))}
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="bg-surface-alt border-l-4 border-brand-500/40 p-8 md:p-10 max-w-3xl">
        <p data-i18n={i18nAttr('Nothing yet')} className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">Nothing yet</p>
        <h3 data-i18n={i18nAttr('No funded projects yet.')} className="font-display font-heavy text-xl md:text-2xl text-ink leading-tight">No funded projects yet.</h3>
        <p data-i18n={i18nAttr('Check back soon — we publish our funded research initiatives here as they begin.')} className="mt-4 text-base text-ink/75 leading-relaxed">
          Check back soon — we publish our funded research initiatives here as they begin.
        </p>
      </div>
    );
  }

  return (
    <div ref={rootRef}>
      {GROUPS.map(({ status, heading }) => {
        const items = state.items.filter((p) => p.status === status);
        if (items.length === 0) return null;
        return (
          <section key={status} className="my-10 md:my-14 first:mt-0">
            <h2 data-i18n={i18nAttr(heading)} className="text-2xl md:text-3xl font-heavy text-ink mb-6">{heading}</h2>
            <div className="space-y-6 md:space-y-8">
              {items.map((p) => <ProjectCard key={p.id} p={p} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
