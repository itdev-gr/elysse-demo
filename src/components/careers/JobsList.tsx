import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Job } from '../../types/job';
import JobCard from './JobCard';

type State =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; jobs: Job[] };

export default function JobsList() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: 'error', message: 'Supabase not configured' });
        return;
      }
      // RLS already enforces these — the explicit filters here are defence-in-depth.
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_published', true)
        .or(`deadline.is.null,deadline.gte.${today}`)
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        setState({ kind: 'error', message: error.message });
        return;
      }
      if (!data || data.length === 0) {
        setState({ kind: 'empty' });
        return;
      }
      setState({ kind: 'ready', jobs: data as Job[] });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === 'loading') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-surface-alt border-l-4 border-brand-500/40 p-6 md:p-8 min-h-[260px] animate-pulse">
            <div className="h-3 w-24 bg-ink/10 rounded"></div>
            <div className="mt-4 h-6 w-3/4 bg-ink/10 rounded"></div>
            <div className="mt-6 h-3 w-1/3 bg-ink/10 rounded"></div>
            <div className="mt-2 h-3 w-1/4 bg-ink/10 rounded"></div>
            <div className="mt-6 h-3 w-full bg-ink/10 rounded"></div>
            <div className="mt-2 h-3 w-2/3 bg-ink/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (state.kind === 'empty' || state.kind === 'error') {
    const heading = state.kind === 'empty'
      ? 'No open positions right now.'
      : 'Open positions are temporarily unavailable.';
    const body = state.kind === 'empty'
      ? 'We hire people, not seats — send your CV anyway and we will get in touch when something matches.'
      : 'Please reach out by email and we will reply with the current openings.';
    return (
      <div className="bg-surface-alt border-l-4 border-brand-500/40 p-8 md:p-10 max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-3">
          {state.kind === 'empty' ? 'No openings' : 'Temporarily unavailable'}
        </p>
        <h3 className="font-display font-heavy text-xl md:text-2xl text-ink leading-tight">{heading}</h3>
        <p className="mt-4 text-base text-ink/75 leading-relaxed">{body}</p>
        <a
          href="mailto:careers@elysee.com.cy"
          className="mt-6 inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200"
        >
          Email careers@elysee.com.cy
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {state.jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
