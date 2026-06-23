import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { renderPostBody } from '../../lib/posts';
import type { Media } from '../../types/media';

type Props = { slug: string };

type State =
  | { kind: 'loading' }
  | { kind: 'not-found' }
  | { kind: 'error' }
  | { kind: 'ready'; media: Media };

export default function MediaDetailView({ slug }: Props) {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'error' });
        return;
      }
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (cancelled) return;
      if (error) return setState({ kind: 'error' });
      if (!data) return setState({ kind: 'not-found' });
      setState({ kind: 'ready', media: data as Media });
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const hero = (title: string) => (
    <section className="pt-32 md:pt-40 pb-12 md:pb-16 bg-brand-500 text-surface">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <p className="text-xs md:text-sm uppercase tracking-widest font-medium text-surface/80 mb-3">Insights · Media</p>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-sans font-heavy">{title}</h1>
      </div>
    </section>
  );

  if (state.kind === 'loading') {
    return (
      <>
        {hero('Loading…')}
        <div className="mx-auto max-w-screen-md px-4 md:px-8 py-12 md:py-16 animate-pulse space-y-4">
          <div className="aspect-video bg-ink/10 rounded"></div>
          <div className="h-3 bg-ink/10 rounded"></div>
          <div className="h-3 w-5/6 bg-ink/10 rounded"></div>
        </div>
      </>
    );
  }

  if (state.kind === 'not-found' || state.kind === 'error') {
    const heading = state.kind === 'not-found' ? 'Media not found.' : 'Temporarily unavailable.';
    return (
      <>
        {hero(heading)}
        <div className="mx-auto max-w-screen-md px-4 md:px-8 py-12 md:py-16">
          <p className="text-base text-ink/75 leading-relaxed">
            The item you are looking for may have been moved or unpublished.
          </p>
          <a
            href="/insights/media/"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-accent transition-colors duration-150"
          >
            <span aria-hidden="true">←</span> Back to Media
          </a>
        </div>
      </>
    );
  }

  const m = state.media;
  return (
    <>
      {hero(m.title)}
      <article className="mx-auto max-w-screen-md px-4 md:px-8 py-12 md:py-16 space-y-6">
        {m.video_url && (
          <figure className="overflow-hidden bg-ink/5 rounded-sm aspect-video">
            <iframe
              src={m.video_url}
              title={m.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            ></iframe>
          </figure>
        )}
        <div
          className="space-y-4 text-ink/80 leading-relaxed [&_h2]:font-display [&_h2]:font-heavy [&_h2]:text-2xl [&_h2]:text-ink [&_h2]:mt-8 [&_h3]:font-display [&_h3]:font-heavy [&_h3]:text-xl [&_h3]:text-ink [&_a]:text-brand-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:font-semibold [&_strong]:text-ink [&_img]:w-full [&_img]:h-auto [&_img]:my-6"
          dangerouslySetInnerHTML={{ __html: renderPostBody(m.body ?? '') }}
        />
        <nav aria-label="Back to media" className="pt-8 mt-8 border-t border-ink/10">
          <a href="/insights/media/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-accent transition-colors duration-150">
            <span aria-hidden="true">←</span> Back to Media
          </a>
        </nav>
      </article>
    </>
  );
}
