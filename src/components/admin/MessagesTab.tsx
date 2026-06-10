import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ContactStatus, ContactSubmission } from '../../types/contact';

type StatusFilter = 'all' | ContactStatus;

const STATUS_STYLES: Record<ContactStatus, string> = {
  new: 'bg-brand-500/15 text-brand-700',
  read: 'bg-ink/10 text-ink/70',
  archived: 'bg-ink/5 text-ink/45',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function MessagesTab() {
  const [rows, setRows] = useState<ContactSubmission[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) return setError(err.message);
    setRows((data ?? []) as ContactSubmission[]);
  };

  useEffect(() => {
    load();
  }, []);

  const sources = useMemo(() => {
    if (!rows) return [];
    return Array.from(new Set(rows.map((r) => r.source))).sort();
  }, [rows]);

  const visible = useMemo(() => {
    if (!rows) return [];
    return rows.filter(
      (r) =>
        (statusFilter === 'all' || r.status === statusFilter) &&
        (sourceFilter === 'all' || r.source === sourceFilter),
    );
  }, [rows, statusFilter, sourceFilter]);

  const setStatus = async (row: ContactSubmission, status: ContactStatus) => {
    const { error: err } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', row.id);
    if (err) return setError(err.message);
    await load();
  };

  const remove = async (row: ContactSubmission) => {
    if (!confirm(`Delete the enquiry from "${row.name}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('contact_submissions').delete().eq('id', row.id);
    if (err) return setError(err.message);
    if (openId === row.id) setOpenId(null);
    await load();
  };

  const toggleOpen = async (row: ContactSubmission) => {
    const next = openId === row.id ? null : row.id;
    setOpenId(next);
    // Opening an unread message marks it read.
    if (next && row.status === 'new') await setStatus(row, 'read');
  };

  const filterBtn = (active: boolean) =>
    `px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] cursor-pointer transition-colors duration-200 ${
      active ? 'bg-ink text-surface' : 'text-ink/60 hover:text-brand-500'
    }`;

  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
          {error}
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-1 border border-ink/10">
          {(['all', 'new', 'read', 'archived'] as StatusFilter[]).map((s) => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)} className={filterBtn(statusFilter === s)}>
              {s}
            </button>
          ))}
        </div>
        {sources.length > 1 && (
          <div className="flex items-center gap-1 border border-ink/10">
            <button type="button" onClick={() => setSourceFilter('all')} className={filterBtn(sourceFilter === 'all')}>
              all sources
            </button>
            {sources.map((s) => (
              <button key={s} type="button" onClick={() => setSourceFilter(s)} className={filterBtn(sourceFilter === s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {rows === null ? (
        <p className="text-sm text-ink/60">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-ink/60">No enquiries{statusFilter !== 'all' || sourceFilter !== 'all' ? ' match this filter' : ' yet'}.</p>
      ) : (
        <div className="bg-surface border border-ink/10 divide-y divide-ink/5">
          {visible.map((r) => {
            const open = openId === r.id;
            return (
              <div key={r.id}>
                <button
                  type="button"
                  onClick={() => toggleOpen(r)}
                  className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-surface-alt transition-colors duration-150 cursor-pointer"
                >
                  <span className={`shrink-0 inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${STATUS_STYLES[r.status]}`}>
                    {r.status}
                  </span>
                  <span className="shrink-0 w-20 text-[10px] uppercase tracking-[0.2em] text-brand-700">{r.source}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-ink truncate">{r.name} · {r.email}</span>
                    <span className="block text-xs text-ink/55 truncate">{r.message}</span>
                  </span>
                  <span className="shrink-0 text-xs text-ink/50 hidden md:block">{formatDate(r.created_at)}</span>
                </button>

                {open && (
                  <div className="px-4 pb-5 pt-1 bg-surface-alt/50">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm mb-4">
                      <Row label="Name" value={r.name} />
                      <Row label="Email" value={<a href={`mailto:${r.email}`} className="text-brand-700 hover:underline">{r.email}</a>} />
                      <Row label="Company" value={r.company ?? '—'} />
                      <Row label="Phone" value={r.phone ? <a href={`tel:${r.phone}`} className="text-brand-700 hover:underline">{r.phone}</a> : '—'} />
                      <Row label="Source" value={r.source} />
                      <Row label="Page" value={r.page_path ?? '—'} />
                      <Row label="Received" value={formatDate(r.created_at)} />
                      <Row label="Notified" value={r.notified_at ? formatDate(r.notified_at) : 'not sent'} />
                    </dl>
                    <p className="text-sm text-ink/85 whitespace-pre-wrap border-l-2 border-brand-500 pl-4 mb-5">{r.message}</p>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.25em]">
                      <a href={`mailto:${r.email}?subject=Re:%20your%20enquiry`} className="text-brand-700 hover:text-brand-500 cursor-pointer">Reply</a>
                      {r.status !== 'read' && <button type="button" onClick={() => setStatus(r, 'read')} className="text-ink/70 hover:text-brand-500 cursor-pointer">Mark read</button>}
                      {r.status !== 'archived' && <button type="button" onClick={() => setStatus(r, 'archived')} className="text-ink/70 hover:text-brand-500 cursor-pointer">Archive</button>}
                      {r.status === 'archived' && <button type="button" onClick={() => setStatus(r, 'new')} className="text-ink/70 hover:text-brand-500 cursor-pointer">Restore</button>}
                      <button type="button" onClick={() => remove(r)} className="text-red-600 hover:text-red-800 cursor-pointer">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-[10px] uppercase tracking-[0.2em] text-ink/50 pt-0.5">{label}</dt>
      <dd className="text-ink/85">{value}</dd>
    </div>
  );
}
