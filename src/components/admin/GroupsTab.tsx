import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ProductGroup, GroupCountry } from '../../types/product';
import GroupCountryForm from './GroupCountryForm';
import { triggerPublish } from '../../lib/publish';
import { filterGroups } from '../../lib/product-groups';
import SearchInput from './SearchInput';
import { featuredPickerList, moveFeatured } from '../../lib/picker-countries';

export default function GroupsTab() {
  const [groups, setGroups] = useState<ProductGroup[] | null>(null);
  const [countries, setCountries] = useState<GroupCountry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [addId, setAddId] = useState('');
  const [savingFeatured, setSavingFeatured] = useState(false);

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

  // ── Country picker top list (group_countries.featured_order) ─────────────
  const featured = featuredPickerList(countries);
  // One entry per ISO code, alphabetical, excluding the already-pinned ones.
  const featuredCodesLower = new Set(
    featured.map((f) => f.country_code?.toLowerCase()).filter(Boolean),
  );
  const addPool = countries
    .filter((c) => c.country_code && c.featured_order == null
      && !featuredCodesLower.has(c.country_code.toLowerCase()))
    .filter((c, i, arr) => arr.findIndex(
      (x) => x.country_code!.toLowerCase() === c.country_code!.toLowerCase()) === i)
    .sort((a, b) => a.country.localeCompare(b.country));

  // Persist the full new top list: renumber 1..n, null-out anything dropped.
  const persistFeatured = async (next: GroupCountry[]) => {
    if (savingFeatured) return;
    setSavingFeatured(true);
    setError(null);
    const dropped = featured.filter((f) => !next.some((n) => n.id === f.id));
    const results = await Promise.all([
      ...next.map((r, i) =>
        supabase.from('group_countries').update({ featured_order: i + 1 }).eq('id', r.id)),
      ...dropped.map((r) =>
        supabase.from('group_countries').update({ featured_order: null }).eq('id', r.id)),
    ]);
    const failed = results.find((r) => r.error);
    await load();
    // After load(): load() clears the strip, so set the message afterwards or
    // a failure would be wiped in the same render batch.
    if (failed?.error) setError(failed.error.message);
    setSavingFeatured(false);
    triggerPublish();
  };

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
        <section className="border border-ink/10 p-5 mb-8">
          <h3 className="font-heavy text-lg">Country picker — top countries</h3>
          <p className="text-xs text-ink/55 mb-4">
            Pinned above the separator in the catalog&rsquo;s &ldquo;Select your country&rdquo; popup, in this order.
          </p>
          {featured.length === 0 ? (
            <p className="text-sm text-ink/50 mb-4">None — the popup shows one flat alphabetical list.</p>
          ) : (
            <ol className="flex flex-col gap-1 mb-4 max-w-md">
              {featured.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-[10px] text-ink/40 w-4 text-right">{i + 1}</span>
                  <span>{c.country}</span>
                  <span className="font-mono text-[10px] text-ink/50 uppercase">{c.country_code}</span>
                  <span className="ml-auto inline-flex items-center gap-1">
                    <button type="button" aria-label={`Move ${c.country} up`} disabled={savingFeatured || i === 0}
                      onClick={() => persistFeatured(moveFeatured(featured, i, 'up'))}
                      className="px-1.5 text-ink/60 hover:text-brand-500 disabled:opacity-30 cursor-pointer">↑</button>
                    <button type="button" aria-label={`Move ${c.country} down`} disabled={savingFeatured || i === featured.length - 1}
                      onClick={() => persistFeatured(moveFeatured(featured, i, 'down'))}
                      className="px-1.5 text-ink/60 hover:text-brand-500 disabled:opacity-30 cursor-pointer">↓</button>
                    <button type="button" aria-label={`Remove ${c.country} from the top list`} disabled={savingFeatured}
                      onClick={() => persistFeatured(featured.filter((x) => x.id !== c.id))}
                      className="px-1.5 text-red-600 hover:text-red-800 disabled:opacity-30 cursor-pointer">×</button>
                  </span>
                </li>
              ))}
            </ol>
          )}
          <div className="flex items-center gap-3">
            <select value={addId} onChange={(e) => setAddId(e.currentTarget.value)} disabled={savingFeatured}
              aria-label="Add country to the top list"
              className="bg-transparent border-b border-ink/25 py-1.5 text-sm focus:outline-none focus:border-brand-500">
              <option value="">— add country —</option>
              {addPool.map((c) => (
                <option key={c.id} value={c.id}>{c.country}</option>
              ))}
            </select>
            <button type="button" disabled={savingFeatured || !addId}
              onClick={() => {
                const chosen = countries.find((c) => c.id === addId);
                if (chosen) { persistFeatured([...featured, chosen]); setAddId(''); }
              }}
              className="text-[11px] text-brand-500 uppercase tracking-[0.2em] disabled:opacity-40 cursor-pointer">
              Add
            </button>
          </div>
        </section>
      )}
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
