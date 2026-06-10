import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ContactSetting } from '../../types/contact';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SettingsTab() {
  const [rows, setRows] = useState<ContactSetting[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [savingSource, setSavingSource] = useState<string | null>(null);
  const [savedSource, setSavedSource] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('contact_settings')
      .select('*')
      .order('source', { ascending: true });
    if (err) return setError(err.message);
    const list = (data ?? []) as ContactSetting[];
    setRows(list);
    setDrafts(Object.fromEntries(list.map((r) => [r.source, r.recipient_email])));
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (row: ContactSetting) => {
    const next = (drafts[row.source] ?? '').trim();
    if (!EMAIL_RE.test(next)) {
      setError(`"${next}" is not a valid email address.`);
      return;
    }
    setError(null);
    setSavingSource(row.source);
    const { error: err } = await supabase
      .from('contact_settings')
      .update({ recipient_email: next })
      .eq('source', row.source);
    setSavingSource(null);
    if (err) return setError(err.message);
    setSavedSource(row.source);
    setTimeout(() => setSavedSource((s) => (s === row.source ? null : s)), 2000);
    await load();
  };

  return (
    <>
      <p className="text-sm text-ink/65 mb-6 max-w-2xl">
        Each contact form on the site routes to one of these addresses, chosen by its <em>source</em>.
        Changes take effect immediately — no redeploy needed. Forms with no matching source fall back to <strong>general</strong>.
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
          {error}
        </p>
      )}

      {rows === null ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-ink/60">No contact sources configured. Run migration 0007.</p>
      ) : (
        <div className="bg-surface border border-ink/10 divide-y divide-ink/5">
          {rows.map((r) => {
            const dirty = (drafts[r.source] ?? '') !== r.recipient_email;
            return (
              <div key={r.source} className="px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="sm:w-48 shrink-0">
                  <p className="text-sm text-ink font-medium">{r.label}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ink/45">{r.source}</p>
                </div>
                <input
                  type="email"
                  value={drafts[r.source] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [r.source]: e.target.value }))}
                  className="flex-1 bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink focus:outline-none focus:border-brand-500"
                />
                <div className="flex items-center gap-3 sm:w-28 shrink-0 justify-end">
                  {savedSource === r.source && <span className="text-[11px] uppercase tracking-[0.2em] text-brand-700">Saved</span>}
                  <button
                    type="button"
                    disabled={!dirty || savingSource === r.source}
                    onClick={() => save(r)}
                    className="text-[11px] uppercase tracking-[0.25em] text-ink/70 hover:text-brand-500 disabled:opacity-40 disabled:hover:text-ink/70 cursor-pointer disabled:cursor-default"
                  >
                    {savingSource === r.source ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
