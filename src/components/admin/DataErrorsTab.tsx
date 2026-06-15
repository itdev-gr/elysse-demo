import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ProductImportIssue } from '../../types/product';

export default function DataErrorsTab() {
  const [rows, setRows] = useState<ProductImportIssue[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('product_import_issues')
      .select('*')
      .eq('status', 'open')
      .order('severity')
      .order('issue_type');
    if (err) return setError(err.message);
    setRows((data ?? []) as ProductImportIssue[]);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: 'resolved' | 'ignored') => {
    const patch: Record<string, unknown> = { status };
    if (status === 'resolved') patch.resolved_at = new Date().toISOString();
    const { error: err } = await supabase.from('product_import_issues').update(patch).eq('id', id);
    if (err) return setError(err.message);
    await load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this issue?')) return;
    const { error: err } = await supabase.from('product_import_issues').delete().eq('id', id);
    if (err) return setError(err.message);
    await load();
  };

  if (rows === null && !error) return <p className="text-sm text-ink/60">Loading…</p>;
  if (rows === null) return (
    <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
      {error}
    </p>
  );

  const errors = rows.filter((r) => r.severity === 'error');
  const warnings = rows.filter((r) => r.severity === 'warning');

  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
          {error}
        </p>
      )}
      <p className="text-sm text-ink/70 mb-6">
        {errors.length} errors · {warnings.length} warnings open.
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-ink/60">No open data issues.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className={`border-l-2 p-4 ${
                r.severity === 'error'
                  ? 'border-red-500 bg-red-50/40'
                  : 'border-amber-500 bg-amber-50/40'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="font-mono text-xs">{r.code ?? '—'}</span>
                  <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-ink/55">
                    {r.issue_type}
                  </span>
                  <p className="text-sm mt-1">{r.message}</p>
                </div>
                <div className="flex-shrink-0 flex gap-3 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setStatus(r.id, 'resolved')}
                    className="text-brand-500"
                  >
                    Mark fixed
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(r.id, 'ignored')}
                    className="text-ink/60"
                  >
                    Ignore
                  </button>
                  <button
                    type="button"
                    onClick={() => del(r.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <details className="mt-2">
                <summary className="text-[11px] text-ink/50 cursor-pointer">Raw row</summary>
                <pre className="text-[11px] bg-ink/5 p-2 mt-1 overflow-x-auto">
                  {JSON.stringify(r.raw, null, 2)}
                </pre>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
