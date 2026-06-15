import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types/product';
import ProductForm from './ProductForm';

type Mode = { kind: 'list' } | { kind: 'create' } | { kind: 'edit'; product: Product };

export default function ProductsTab() {
  const [rows, setRows] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'list' });
  const [query, setQuery] = useState('');

  const load = async () => {
    setError(null);
    // PostgREST caps each response at 1000 rows; page through so the admin
    // sees and can search the full catalogue (currently ~2,200 products).
    const PAGE = 1000;
    const all: Product[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error: err } = await supabase
        .from('products').select('*').order('sort_order', { ascending: true })
        .range(from, from + PAGE - 1);
      if (err) return setError(err.message);
      if (!data || data.length === 0) break;
      all.push(...(data as Product[]));
      if (data.length < PAGE) break;
    }
    setRows(all);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rows.slice(0, 200);
    return rows.filter((r) =>
      [r.code, r.description, r.sub_category, r.configuration, r.category_name]
        .some((v) => v?.toLowerCase().includes(q)),
    ).slice(0, 200);
  }, [rows, query]);

  const toggleActive = async (p: Product) => {
    const { error: err } = await supabase.from('products')
      .update({ is_active: !p.is_active }).eq('code', p.code);
    if (err) return setError(err.message);
    await load();
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete product "${p.code}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('products').delete().eq('code', p.code);
    if (err) return setError(err.message);
    await load();
  };

  if (mode.kind === 'create')
    return <ProductForm onDone={() => { setMode({ kind: 'list' }); load(); }} onCancel={() => setMode({ kind: 'list' })} />;
  if (mode.kind === 'edit')
    return <ProductForm initial={mode.product} onDone={() => { setMode({ kind: 'list' }); load(); }} onCancel={() => setMode({ kind: 'list' })} />;

  return (
    <>
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">{error}</p>}
      <div className="mb-4 flex items-center gap-4">
        <button type="button" onClick={() => setMode({ kind: 'create' })}
          className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 cursor-pointer">
          + New product
        </button>
        <span className="text-xs text-ink/55">{rows ? `${rows.length} total` : ''}</span>
      </div>
      <div className="mb-6">
        <input type="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search code, description, series…"
          className="w-full max-w-md bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500" />
        {!query && rows && rows.length > 200 && (
          <p className="text-[11px] text-ink/50 mt-2">Showing first 200 — search to narrow.</p>
        )}
      </div>
      {rows === null ? <p className="text-sm text-ink/60">Loading…</p> : (
        <div className="overflow-x-auto bg-surface border border-ink/10">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[10px] uppercase tracking-[0.2em] text-ink/55 border-b border-ink/10">
              <th className="py-2 pr-3">Code</th><th className="py-2 pr-3">Description</th>
              <th className="py-2 pr-3">Series</th><th className="py-2 pr-3">Active</th><th className="py-2">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-sm text-ink/60">No products match.</td></tr>
              )}
              {filtered.map((p) => (
                <tr key={p.code} className="border-b border-ink/5">
                  <td className="py-2 pr-3 font-mono text-[12px]">{p.code}</td>
                  <td className="py-2 pr-3">{p.description}</td>
                  <td className="py-2 pr-3 text-ink/70">{p.sub_category}</td>
                  <td className="py-2 pr-3">
                    <button type="button" onClick={() => toggleActive(p)} className="text-[11px] underline">
                      {p.is_active ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="py-2"><div className="flex gap-3">
                    <button type="button" onClick={() => setMode({ kind: 'edit', product: p })} className="text-[11px] text-brand-500">Edit</button>
                    <button type="button" onClick={() => remove(p)} className="text-[11px] text-red-600">Delete</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
