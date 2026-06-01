import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Country } from '../../types/country';
import { filterCountries } from '../../lib/countries';
import CountryForm from './CountryForm';

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; country: Country };

export default function CountriesTab() {
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [query, setQuery] = useState('');

  const load = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from('countries')
      .select('*')
      .order('country', { ascending: true });
    if (err) {
      setError(err.message);
      return;
    }
    setCountries((data ?? []) as Country[]);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (countries ? filterCountries(countries, query) : []),
    [countries, query],
  );

  const toggleActive = async (country: Country) => {
    const { error: err } = await supabase
      .from('countries')
      .update({ is_active: !country.is_active })
      .eq('code', country.code);
    if (err) return setError(err.message);
    await load();
  };

  const remove = async (country: Country) => {
    if (!confirm(`Delete "${country.country}" (${country.code})? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('countries').delete().eq('code', country.code);
    if (err) return setError(err.message);
    await load();
  };

  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
          {error}
        </p>
      )}

      {mode.kind === 'list' && (
        <>
          <div className="mb-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMode({ kind: 'create' })}
              className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer"
            >
              + New country
            </button>
          </div>

          <div className="mb-6">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Search by country, code, or label…"
              className="w-full max-w-md bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500"
            />
          </div>

          {countries === null ? (
            <p className="text-sm text-ink/60">Loading…</p>
          ) : countries.length === 0 ? (
            <p className="text-sm text-ink/60">No countries yet. Create the first one.</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-ink/60">
              No countries match &ldquo;{query}&rdquo;. Clear the search or add a new country.
            </p>
          ) : (
            <div className="overflow-x-auto bg-surface border border-ink/10">
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] uppercase tracking-[0.25em] text-ink/55 border-b border-ink/10">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Label</th>
                    <th className="px-4 py-3">Kind</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.code} className="border-b border-ink/5 last:border-b-0">
                      <td className="px-4 py-3 text-ink uppercase">{c.code}</td>
                      <td className="px-4 py-3 text-ink">{c.country}</td>
                      <td className="px-4 py-3 text-ink/75">{c.label}</td>
                      <td className="px-4 py-3 text-ink/75 capitalize">{c.kind}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            c.is_active
                              ? 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-brand-500/15 text-brand-700'
                              : 'inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] bg-ink/10 text-ink/70'
                          }
                        >
                          {c.is_active ? 'Live' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
                          <button onClick={() => setMode({ kind: 'edit', country: c })} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                            Edit
                          </button>
                          <button onClick={() => toggleActive(c)} className="text-ink/70 hover:text-brand-500 cursor-pointer">
                            {c.is_active ? 'Deactivate' : 'Activate'}
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
        <CountryForm
          onSaved={async () => {
            setMode({ kind: 'list' });
            await load();
          }}
          onCancel={() => setMode({ kind: 'list' })}
        />
      )}

      {mode.kind === 'edit' && (
        <CountryForm
          initial={mode.country}
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
