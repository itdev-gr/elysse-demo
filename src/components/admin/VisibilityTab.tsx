import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { triggerPublish } from '../../lib/publish';
import type { ProductCategory } from '../../lib/categories';
import {
  buildVisibilityTree, triState, codesForConfig, codesForSeries, matchesQuery,
  isZetaSeries,
  type VisibilityRow, type TriState,
} from '../../lib/visibility';

/** The two market groups shown as per-size checkmarks on Zeta rows. */
const MARKET_GROUPS = ['A', 'B'] as const;

const PAGE = 1000;
const CHUNK = 500;

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

/** Checkbox that can render the browser's native "mixed" (indeterminate) state. */
function TriBox({ state, onChange, label }: { state: TriState; onChange: () => void; label: string }) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={state === 'all'}
      ref={(el) => { if (el) el.indeterminate = state === 'mixed'; }}
      onChange={onChange}
      className="h-4 w-4 accent-brand-500 shrink-0"
    />
  );
}

/**
 * Per-category, per-size visibility checklist. One checkbox per size
 * (products.code); checked = shows on the public site (NOT is_hidden).
 * Bulk tri-state boxes on series and configuration headers. is_active and
 * country groups are untouched — this is the site-wide switch only.
 */
export default function VisibilityTab() {
  const [cats, setCats] = useState<ProductCategory[] | null>(null);
  const [picked, setPicked] = useState<string>('');       // category slug
  const [rows, setRows] = useState<VisibilityRow[] | null>(null);
  // code → subset of MARKET_GROUPS the size belongs to (Zeta rows only render it).
  const [abMembers, setAbMembers] = useState<Map<string, Set<string>> | null>(null);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from('product_categories').select('*').order('sort_order');
      if (err) return setError(err.message);
      const list = ((data ?? []) as ProductCategory[]).filter((c) => c.product_category_name);
      setCats(list);
      if (list.length) setPicked((p) => p || list[0].slug);
    })();
  }, []);

  const pickedCat = cats?.find((c) => c.slug === picked) ?? null;

  // Group A/B memberships (global, small: ~2 rows per size). Loaded once.
  const loadMemberships = async () => {
    const mem = new Map<string, Set<string>>();
    for (let from = 0; ; from += PAGE) {
      const { data, error: err } = await supabase
        .from('product_group_memberships')
        .select('product_code, group_code')
        .in('group_code', [...MARKET_GROUPS])
        .order('product_code').order('group_code')
        .range(from, from + PAGE - 1);
      if (err) return setError(err.message);
      const batch = (data ?? []) as { product_code: string; group_code: string }[];
      for (const m of batch) {
        const set = mem.get(m.product_code) ?? new Set<string>();
        set.add(m.group_code);
        mem.set(m.product_code, set);
      }
      if (batch.length < PAGE) break;
    }
    setAbMembers(mem);
  };

  useEffect(() => { void loadMemberships(); }, []);

  // Tick/untick a Zeta size's membership in market group A or B.
  const setGroupMembership = async (code: string, group: string, on: boolean) => {
    if (busy || !abMembers) return;
    setBusy(true); setError(null);
    const next = new Map(abMembers);
    const set = new Set(next.get(code) ?? []);
    if (on) set.add(group); else set.delete(group);
    next.set(code, set);
    setAbMembers(next);
    const { error: err } = on
      ? await supabase.from('product_group_memberships')
          .insert({ product_code: code, group_code: group })
      : await supabase.from('product_group_memberships')
          .delete().eq('product_code', code).eq('group_code', group);
    // 23505 = already a member (double click raced) — the desired state holds.
    if (err && err.code !== '23505') {
      setError(`Save failed: ${err.message} — group list reloaded.`);
      await loadMemberships();
      setBusy(false);
      return;
    }
    setBusy(false);
    triggerPublish();
  };

  const loadRows = async (cat: ProductCategory) => {
    setRows(null); setError(null);
    const all: VisibilityRow[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error: err } = await supabase.from('products')
        .select('code, sub_category, family_code, configuration, size, sort_order, is_hidden')
        .eq('category_name', cat.product_category_name!)
        .order('code')
        .range(from, from + PAGE - 1);
      if (err) return setError(err.message);
      const batch = (data ?? []) as VisibilityRow[];
      all.push(...batch);
      if (batch.length < PAGE) break;
    }
    setRows(all);
  };

  useEffect(() => {
    if (pickedCat) void loadRows(pickedCat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, cats === null]);

  // Flip is_hidden for a set of codes: optimistic, chunked, resync on failure.
  const setHidden = async (codes: string[], hidden: boolean) => {
    if (!codes.length || busy || !rows || !pickedCat) return;
    setBusy(true); setError(null);
    const codeSet = new Set(codes);
    setRows(rows.map((r) => (codeSet.has(r.code) ? { ...r, is_hidden: hidden } : r)));
    for (const part of chunk(codes, CHUNK)) {
      const { error: err } = await supabase
        .from('products').update({ is_hidden: hidden }).in('code', part);
      if (err) {
        setError(`Save failed: ${err.message} — list reloaded.`);
        await loadRows(pickedCat);
        setBusy(false);
        return;
      }
    }
    setBusy(false);
    triggerPublish();
  };

  // Bulk semantics: 'all' visible → hide everything; 'mixed'/'none' → show everything.
  const bulkTarget = (state: TriState) => state === 'all';

  const visibleTotal = rows ? rows.filter((r) => !r.is_hidden).length : 0;
  const filtered = rows ? rows.filter((r) => matchesQuery(r, query)) : [];
  const tree = buildVisibilityTree(filtered);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-ink/60 max-w-2xl">
        Tick = the size shows on the website; untick = hidden everywhere (category page,
        sizes table, search). Country availability is separate (Country Groups tab).
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Category picker */}
      <div className="flex flex-wrap gap-2">
        {(cats ?? []).map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setPicked(c.slug)}
            aria-pressed={picked === c.slug}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] border transition-colors duration-150 ${
              picked === c.slug
                ? 'bg-brand-500 text-surface border-brand-500'
                : 'border-ink/20 text-ink/70 hover:border-brand-500/50'
            } ${c.is_active ? '' : 'opacity-60'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {rows === null ? (
        <p className="text-sm text-ink/50">Loading…</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Filter by code, name or size…"
              className="flex-1 min-w-[220px] max-w-sm bg-transparent border-b border-ink/25 py-1.5 text-sm focus:outline-none focus:border-brand-500"
            />
            <p className="text-[11px] uppercase tracking-[0.2em] text-ink/60">
              {visibleTotal} of {rows.length} sizes visible
            </p>
          </div>

          {tree.length === 0 && (
            <p className="text-sm text-ink/50">
              {rows.length === 0 ? 'No products in this category.' : 'Nothing matches the filter.'}
            </p>
          )}

          {tree.map((s) => {
            const sState = triState(s.visible, s.total);
            return (
              <section key={s.series ?? '__none'}>
                <header className="flex items-center gap-3 border-b border-ink/15 pb-1.5 mb-2">
                  <TriBox
                    state={sState}
                    label={`Toggle every size in ${s.series ?? 'products without a series'}`}
                    onChange={() => setHidden(codesForSeries(s), bulkTarget(sState))}
                  />
                  <h3 className="font-heavy text-base text-ink">{s.series ?? 'No series'}</h3>
                  <span className="text-[11px] text-ink/45">{s.visible}/{s.total} visible</span>
                  {isZetaSeries(s.series) && (
                    <span className="ml-auto text-[10px] uppercase tracking-[0.15em] text-ink/45">
                      A / B = market groups (Country Groups tab)
                    </span>
                  )}
                </header>

                <ul className="flex flex-col gap-3">
                  {s.configs.map((c) => {
                    const cState = triState(c.visible, c.total);
                    return (
                      <li key={c.key}>
                        <div className="flex items-center gap-3">
                          <TriBox
                            state={cState}
                            label={`Toggle every size of ${c.name}`}
                            onChange={() => setHidden(codesForConfig(c), bulkTarget(cState))}
                          />
                          <span className="font-semibold text-sm text-ink">{c.name}</span>
                          {c.familyCode && (
                            <span className="font-mono text-[11px] text-ink/45">No.{c.familyCode}</span>
                          )}
                          <span className="text-[11px] text-ink/45">{c.visible}/{c.total}</span>
                        </div>
                        <ul className="mt-1 ml-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                          {c.sizes.map((z) => (
                            <li key={z.code} className={`flex items-center gap-2 py-0.5 text-sm ${z.hidden ? 'opacity-50' : ''}`}>
                              <input
                                type="checkbox"
                                aria-label={`Show ${z.code} on the site`}
                                checked={!z.hidden}
                                onChange={() => setHidden([z.code], !z.hidden)}
                                className="h-3.5 w-3.5 accent-brand-500 shrink-0"
                              />
                              <span className="font-mono text-xs text-ink/70">{z.code}</span>
                              {z.size && <span className="text-xs text-ink/50 truncate">{z.size}</span>}
                              {isZetaSeries(c.series) && (
                                <span className="ml-auto flex items-center gap-2 shrink-0">
                                  {MARKET_GROUPS.map((g) => (
                                    <label
                                      key={g}
                                      title={`Show ${z.code} for Group ${g} countries`}
                                      className="flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-ink/60"
                                    >
                                      <input
                                        type="checkbox"
                                        aria-label={`${z.code} in Group ${g}`}
                                        checked={abMembers?.get(z.code)?.has(g) ?? false}
                                        disabled={abMembers === null}
                                        onChange={() =>
                                          setGroupMembership(z.code, g, !(abMembers?.get(z.code)?.has(g) ?? false))
                                        }
                                        className="h-3.5 w-3.5 accent-brand-500"
                                      />
                                      {g}
                                    </label>
                                  ))}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
