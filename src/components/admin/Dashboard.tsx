import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Job } from '../../types/job';
import { getStatus } from '../../lib/jobs';
import JobForm from './JobForm';

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; job: Job };

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
      return;
    }
    setJobs((data ?? []) as Job[]);
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublish = async (job: Job) => {
    const { error: err } = await supabase
      .from('jobs')
      .update({ is_published: !job.is_published })
      .eq('id', job.id);
    if (err) return setError(err.message);
    await load();
  };

  const remove = async (job: Job) => {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('jobs').delete().eq('id', job.id);
    if (err) return setError(err.message);
    await load();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-surface-alt">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <header className="flex items-end justify-between border-b border-ink/10 pb-6 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-500 font-semibold mb-2">Admin</p>
            <h1 className="font-display font-heavy text-2xl md:text-3xl text-ink">Jobs.</h1>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="text-[11px] uppercase tracking-[0.25em] text-ink/70 hover:text-brand-500 transition-colors duration-200 cursor-pointer"
          >
            Sign out
          </button>
        </header>

        {error && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
            {error}
          </p>
        )}

        {mode.kind === 'list' && (
          <>
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setMode({ kind: 'create' })}
                className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
              >
                + New job
              </button>
            </div>

            {jobs === null ? (
              <p className="text-sm text-ink/60">Loading…</p>
            ) : jobs.length === 0 ? (
              <p className="text-sm text-ink/60">No jobs yet. Create the first one.</p>
            ) : (
              <div className="overflow-x-auto bg-surface border border-ink/10">
                <table className="w-full text-sm">
                  <thead className="text-left text-[10px] uppercase tracking-[0.25em] text-ink/55 border-b border-ink/10">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Dept</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Deadline</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((j) => {
                      const status = getStatus(j);
                      return (
                        <tr key={j.id} className="border-b border-ink/5 last:border-b-0">
                          <td className="px-4 py-3 text-ink">{j.title}</td>
                          <td className="px-4 py-3 text-ink/75">{j.department}</td>
                          <td className="px-4 py-3 text-ink/75">{j.employment_type}</td>
                          <td className="px-4 py-3 text-ink/75">{j.deadline ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={
                                status === 'Live'
                                  ? 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-brand-500/15 text-brand-700'
                                  : status === 'Draft'
                                  ? 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-ink/10 text-ink/70'
                                  : 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-red-100 text-red-700'
                              }
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
                              <button onClick={() => setMode({ kind: 'edit', job: j })} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                                Edit
                              </button>
                              <button onClick={() => togglePublish(j)} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                                {j.is_published ? 'Unpublish' : 'Publish'}
                              </button>
                              <button onClick={() => remove(j)} className="text-red-600 hover:text-red-800 cursor-pointer">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {mode.kind === 'create' && (
          <JobForm
            onSaved={async () => {
              setMode({ kind: 'list' });
              await load();
            }}
            onCancel={() => setMode({ kind: 'list' })}
          />
        )}

        {mode.kind === 'edit' && (
          <JobForm
            initial={mode.job}
            onSaved={async () => {
              setMode({ kind: 'list' });
              await load();
            }}
            onCancel={() => setMode({ kind: 'list' })}
          />
        )}
      </div>
    </div>
  );
}
