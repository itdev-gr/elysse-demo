import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { validateProductDraft, nextProductSortOrder } from '../../lib/products';
import { triggerPublish } from '../../lib/publish';
import type { Product, ProductDraft } from '../../types/product';

const GROUPS = ['A', 'B', 'C', 'D', 'E'];
const EMPTY: ProductDraft = {
  code: '', category: null, category_name: null, sub_category: null, family_code: null,
  configuration: null, size: null, packing_bag: null, packing_box: null, moq: null,
  box_size: null, description: null, sort_order: 0, is_active: true,
};

export default function ProductForm({ initial, onDone, onCancel }:
  { initial?: Product; onCancel: () => void; onDone: () => void }) {
  const [d, setD] = useState<ProductDraft>(initial ? { ...initial } : EMPTY);
  const [groups, setGroups] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const editing = !!initial;

  useEffect(() => {
    if (!initial) return;
    supabase.from('product_group_memberships').select('group_code').eq('product_code', initial.code)
      .then(({ data }) => setGroups((data ?? []).map((r: { group_code: string }) => r.group_code)));
  }, [initial]);

  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) => setD((p) => ({ ...p, [k]: v }));
  const num = (v: string): number | null => {
    if (v.trim() === '') return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  const submit = async () => {
    const msg = validateProductDraft(d);
    if (msg) return setError(msg);
    setBusy(true); setError(null);
    let payload: ProductDraft;
    if (!editing) {
      const { data: all } = await supabase.from('products').select('sort_order');
      payload = { ...d, sort_order: nextProductSortOrder((all ?? []) as Product[]) };
    } else {
      payload = { ...d };
    }
    const { error: err } = editing
      ? await supabase.from('products').update(payload).eq('code', initial!.code)
      : await supabase.from('products').insert(payload);
    if (err) { setBusy(false); return setError(err.message); }
    const productCode = editing ? initial!.code : payload.code;
    const { error: delErr } = await supabase.from('product_group_memberships').delete().eq('product_code', productCode);
    if (delErr) { setBusy(false); return setError(`Product saved, but updating groups failed: ${delErr.message}`); }
    if (groups.length) {
      const { error: insErr } = await supabase.from('product_group_memberships')
        .insert(groups.map((g) => ({ product_code: productCode, group_code: g })));
      if (insErr) { setBusy(false); return setError(`Product saved, but updating groups failed: ${insErr.message}`); }
    }
    setBusy(false); triggerPublish(); onDone();
  };

  const field = (label: string, k: keyof ProductDraft, type: 'text' | 'number' = 'text') => (
    <label className="block mb-3">
      <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">{label}</span>
      <input type={type} value={(d[k] as string | number | null) ?? ''}
        onChange={(e) => set(k, (type === 'number' ? num(e.currentTarget.value) : e.currentTarget.value) as never)}
        className="w-full bg-transparent border-b border-ink/25 py-2 text-sm focus:outline-none focus:border-brand-500" />
    </label>
  );

  return (
    <div className="max-w-2xl">
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">{error}</p>}
      <div className="grid grid-cols-2 gap-x-6">
        <label className="block mb-3">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Code (primary key)</span>
          <input value={d.code} disabled={editing} onChange={(e) => set('code', e.currentTarget.value)}
            className="w-full bg-transparent border-b border-ink/25 py-2 text-sm font-mono disabled:opacity-50 focus:outline-none focus:border-brand-500" />
        </label>
        {field('Category name', 'category_name')}
        {field('Category letter', 'category')}
        {field('Sub-category', 'sub_category')}
        {field('Configuration', 'configuration')}
        {field('Size', 'size')}
        {field('Family code', 'family_code')}
        {field('Box size', 'box_size')}
        {field('Packing bag', 'packing_bag', 'number')}
        {field('Packing box', 'packing_box', 'number')}
        {field('MOQ', 'moq', 'number')}
      </div>
      <label className="block mb-3">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Description</span>
        <textarea value={d.description ?? ''} onChange={(e) => set('description', e.currentTarget.value)}
          className="w-full bg-transparent border border-ink/20 p-2 text-sm focus:outline-none focus:border-brand-500" rows={2} />
      </label>
      <fieldset className="mb-5">
        <legend className="text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-2">Groups (countries that can see it)</legend>
        <div className="flex gap-4">
          {GROUPS.map((g) => (
            <label key={g} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={groups.includes(g)} className="accent-brand-500"
                onChange={(e) => setGroups((prev) => e.currentTarget.checked ? [...prev, g] : prev.filter((x) => x !== g))} />
              {g}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm mb-6">
        <input type="checkbox" checked={d.is_active} className="accent-brand-500"
          onChange={(e) => set('is_active', e.currentTarget.checked)} /> Active
      </label>
      <div className="flex gap-3">
        <button type="button" disabled={busy} onClick={submit}
          className="bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] disabled:opacity-50">
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] text-ink/70">Cancel</button>
      </div>
    </div>
  );
}
