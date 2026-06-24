import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { renderPostBody } from '../../lib/posts';
import type { Ebook } from '../../types/ebook';

type Props = { slug: string };

type State =
  | { kind: 'loading' }
  | { kind: 'not-found' }
  | { kind: 'error' }
  | { kind: 'ready'; ebook: Ebook };

export default function EbookDetailView({ slug }: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'error' });
        return;
      }
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (cancelled) return;
      if (error) return setState({ kind: 'error' });
      if (!data) return setState({ kind: 'not-found' });
      setState({ kind: 'ready', ebook: data as Ebook });
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const hero = (title: string) => (
    <section className="pt-32 md:pt-40 pb-12 md:pb-16 bg-brand-500 text-surface">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <p className="text-xs md:text-sm uppercase tracking-widest font-medium text-surface/80 mb-3">Insights · eBooks</p>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-sans font-heavy">{title}</h1>
      </div>
    </section>
  );

  if (state.kind === 'loading') {
    return (
      <>
        {hero('Loading…')}
        <div className="mx-auto max-w-screen-lg px-4 md:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 animate-pulse">
          <div className="md:col-span-4 aspect-[3/4] bg-ink/10 rounded"></div>
          <div className="md:col-span-8 space-y-4">
            <div className="h-3 bg-ink/10 rounded"></div>
            <div className="h-3 w-5/6 bg-ink/10 rounded"></div>
          </div>
        </div>
      </>
    );
  }

  if (state.kind === 'not-found' || state.kind === 'error') {
    const heading = state.kind === 'not-found' ? 'eBook not found.' : 'Temporarily unavailable.';
    return (
      <>
        {hero(heading)}
        <div className="mx-auto max-w-screen-lg px-4 md:px-8 py-12 md:py-16">
          <p className="text-base text-ink/75 leading-relaxed">
            The publication you are looking for may have been moved or unpublished.
          </p>
          <a
            href="/insights/ebooks/"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-accent transition-colors duration-150"
          >
            <span aria-hidden="true">←</span> Back to eBooks
          </a>
        </div>
      </>
    );
  }

  const b = state.ebook;
  return (
    <>
      {hero(b.title)}
      <article className="mx-auto max-w-screen-lg px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          <aside className="md:col-span-4">
            <div className="md:sticky md:top-28 space-y-6">
              {b.cover_image && (
                <figure className="overflow-hidden bg-brand-500/5 border border-ink/10 rounded-sm aspect-[3/4]">
                  <img src={b.cover_image} alt={b.image_alt ?? `${b.title} cover`} loading="eager" className="w-full h-full object-cover" />
                </figure>
              )}
              {b.year && <p className="text-xs uppercase tracking-widest text-ink/60">Published {b.year}</p>}
              {b.download_url ? (
                <a href={b.download_url} download className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 text-surface text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200">Download PDF</a>
              ) : (
                <a href="/contact/local/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 text-surface text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200">Request a copy</a>
              )}
            </div>
          </aside>
          <div className="md:col-span-8 space-y-6">
            <div
              className="space-y-4 text-ink/80 leading-relaxed [&_h2]:font-display [&_h2]:font-heavy [&_h2]:text-2xl [&_h2]:text-ink [&_h2]:mt-8 [&_h3]:font-display [&_h3]:font-heavy [&_h3]:text-xl [&_h3]:text-ink [&_a]:text-brand-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:font-semibold [&_strong]:text-ink [&_img]:w-full [&_img]:h-auto [&_img]:my-6"
              dangerouslySetInnerHTML={{ __html: renderPostBody(b.body ?? '') }}
            />
            <nav aria-label="Back to eBooks" className="pt-8 mt-8 border-t border-ink/10">
              <a href="/insights/ebooks/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-accent transition-colors duration-150">
                <span aria-hidden="true">←</span> Back to eBooks
              </a>
            </nav>
          </div>
        </div>
      </article>
    </>
  );
}
