import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ProductGroup, GroupCountry } from '../../types/product';
import GroupCountryForm from './GroupCountryForm';
import { triggerPublish } from '../../lib/publish';
import { filterGroups } from '../../lib/product-groups';
import SearchInput from './SearchInput';

export default function GroupsTab() {
  const [groups, setGroups] = useState<ProductGroup[] | null>(null);
  const [countries, setCountries] = useState<GroupCountry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = async () => {
    setError(null);
    const [{ data: g, error: gErr }, { data: c, error: cErr }] = await Promise.all([
      supabase.from('product_groups').select('*').order('sort_order'),
      supabase.from('group_countries').select('*').order('sort_order'),
    ]);
    if (gErr || cErr) return setError((gErr ?? cErr)!.message);
    setGroups((g ?? []) as ProductGroup[]);
    setCountries((c ?? []) as GroupCountry[]);
  };

  useEffect(() => { load(); }, []);

  const removeCountry = async (gc: GroupCountry) => {
    if (!confirm(`Remove ${gc.country} from group ${gc.group_code}?`)) return;
    const { error: err } = await supabase.from('group_countries').delete().eq('id', gc.id);
    if (err) return setError(err.message);
    await load();
    triggerPublish();
  };

  // Keep the group whose add-country form is open visible even when the search
  // filters it out, so the form can't vanish mid-typing (same guard as FamiliesTab).
  const matched = filterGroups(groups ?? [], countries, query);
  const shown = (groups ?? []).flatMap((g) => {
    const m = matched.find((x) => x.group.code === g.code);
    if (m) return [m];
    if (adding !== g.code) return [];
    return [{ group: g, countries: countries.filter((c) => c.group_code === g.code) }];
  });

  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">
          {error}
        </p>
      )}
      {groups === null && <p className="text-sm text-ink/60">Loading…</p>}
      {groups !== null && (
        <div className="mb-6">
          <SearchInput value={query} onChange={setQuery} placeholder="Search group or country…" />
        </div>
      )}
      {groups !== null && shown.length === 0 && query.trim() !== '' && (
        <p className="text-sm text-ink/60">Nothing matches &ldquo;{query}&rdquo;.</p>
      )}
      {groups !== null && (
        <div className="space-y-8">
          {shown.map(({ group: g, countries: cs }) => (
            <section key={g.code} className="border border-ink/10 p-5">
              <header className="flex items-center justify-between mb-3">
                <h3 className="font-heavy text-lg">
                  Group {g.code}{' '}
                  <span className="text-ink/50 text-sm">· {g.label}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setAdding(g.code)}
                  className="text-[11px] text-brand-500 uppercase tracking-[0.2em]"
                >
                  + Add country
                </button>
              </header>
              {adding === g.code && (
                <GroupCountryForm
                  groupCode={g.code}
                  onDone={() => { setAdding(null); load(); }}
                  onCancel={() => setAdding(null)}
                />
              )}
              <ul className="flex flex-wrap gap-2">
                {cs.map((c) => (
                  <li key={c.id} className="inline-flex items-center gap-2 bg-ink/5 px-3 py-1 text-sm">
                    {c.country}
                    <span className="font-mono text-[10px] text-ink/50">{c.country_code}</span>
                    <button
                      type="button"
                      onClick={() => removeCountry(c)}
                      className="text-red-600"
                      aria-label={`Remove ${c.country} from group ${g.code}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
