import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Certification, CertGroup } from '../../types/certification';
import { sortCertifications, nextSortOrder } from '../../lib/certifications';
import { QUALITY_CATEGORIES } from '../../data/quality-certificates';
import CertificationForm from './CertificationForm';

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; cert: Certification };

const GROUPS: { value: CertGroup; label: string }[] = [
  { value: 'green', label: 'Green Elysée' },
  { value: 'quality', label: 'Quality certificates' },
];

const categoryTitle = (slug: string | null) =>
  QUALITY_CATEGORIES.find((c) => c.slug === slug)?.title ?? slug ?? '—';

export default function CertificationsTab() {
  const [certs, setCerts] = useState<Certification[] | null>(null);
  const [group, setGroup] = useState<CertGroup>('green');
  const [category, setCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('certifications')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err) {
      setError(err.message);
      return;
    }
    setCerts((data ?? []) as Certification[]);
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(
    () =>
      sortCertifications(
        (certs ?? []).filter(
          (c) =>
            c.cert_group === group &&
            (group !== 'quality' || category === 'all' || c.category === category),
        ),
      ),
    [certs, group, category],
  );

  const toggleActive = async (cert: Certification) => {
    const { error: err } = await supabase
      .from('certifications')
      .update({ is_active: !cert.is_active })
      .eq('id', cert.id);
    if (err) return setError(err.message);
    await load();
  };

  const remove = async (cert: Certification) => {
    if (!confirm(`Delete "${cert.name}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('certifications').delete().eq('id', cert.id);
    if (err) return setError(err.message);
    await load();
  };

  const groupBtn = (g: CertGroup) =>
    `px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] cursor-pointer transition-colors duration-200 ${
      group === g ? 'bg-ink text-surface' : 'text-ink/60 hover:text-brand-500'
    }`;

  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
          {error}
        </p>
      )}

      {mode.kind === 'list' && (
        <>
          <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1 border border-ink/10">
              {GROUPS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => { setGroup(g.value); setCategory('all'); }}
                  className={groupBtn(g.value)}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMode({ kind: 'create' })}
              className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
            >
              + New certificate
            </button>
          </div>

          {group === 'quality' && (
            <div className="mb-6 flex items-center gap-2 flex-wrap text-[11px] uppercase tracking-[0.2em]">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`px-2.5 py-1 cursor-pointer transition-colors duration-200 ${category === 'all' ? 'bg-brand-500/15 text-brand-700' : 'text-ink/55 hover:text-brand-500'}`}
              >
                All categories
              </button>
              {QUALITY_CATEGORIES.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setCategory(c.slug)}
                  className={`px-2.5 py-1 cursor-pointer transition-colors duration-200 ${category === c.slug ? 'bg-brand-500/15 text-brand-700' : 'text-ink/55 hover:text-brand-500'}`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          )}

          {certs === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-ink/60">No certifications in this group yet. Create the first one.</p>
          ) : (
            <div className="overflow-x-auto bg-surface border border-ink/10">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] uppercase tracking-[0.25em] text-ink/55 border-b border-ink/10">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    {group === 'quality' && <th className="px-4 py-3">Category</th>}
                    {group === 'green' && <th className="px-4 py-3">Badge</th>}
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">PDF</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((c) => (
                    <tr key={c.id} className="border-b border-ink/5 last:border-b-0">
                      <td className="px-4 py-3 text-ink/60">{c.sort_order}</td>
                      {group === 'quality' && (
                        <td className="px-4 py-3 text-ink/75">{categoryTitle(c.category)}</td>
                      )}
                      {group === 'green' && (
                        <td className="px-4 py-3">
                          {c.logo ? (
                            <img src={c.logo} alt="" className="w-10 h-10 object-contain" />
                          ) : (
                            <span className="text-ink/40">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <span className="text-ink">{c.name}</span>
                        {c.description && <span className="block text-[11px] text-ink/55">{c.description}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {c.pdf_url ? (
                          <a
                            href={c.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] uppercase tracking-[0.2em] text-brand-700 hover:text-brand-500 cursor-pointer"
                          >
                            View PDF
                          </a>
                        ) : (
                          <span className="text-ink/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            c.is_active
                              ? 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-brand-500/15 text-brand-700'
                              : 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-ink/10 text-ink/70'
                          }
                        >
                          {c.is_active ? 'Live' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
                          <button onClick={() => setMode({ kind: 'edit', cert: c })} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                            Edit
                          </button>
                          <button onClick={() => toggleActive(c)} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                            {c.is_active ? 'Hide' : 'Show'}
                          </button>
                          <button onClick={() => remove(c)} className="text-red-600 hover:text-red-800 cursor-pointer">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {mode.kind === 'create' && (
        <CertificationForm
          group={group}
          defaultCategory={group === 'quality' && category !== 'all' ? category : undefined}
          initialSortOrder={nextSortOrder(visible)}
          onSaved={async () => {
            setMode({ kind: 'list' });
            await load();
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {mode.kind === 'edit' && (
        <CertificationForm
          group={group}
          initialSortOrder={mode.cert.sort_order}
          initial={mode.cert}
          onSaved={async () => {
            setMode({ kind: 'list' });
            await load();
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}
    </>
  );
}
