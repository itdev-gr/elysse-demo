import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { validateProductDraft, nextProductSortOrder } from '../../lib/products';
import { triggerPublish } from '../../lib/publish';
import type { Product, ProductDraft } from '../../types/product';

const GROUPS = ['A', 'B', 'C', 'D', 'E'];
const I18N_LANGS: { code: string; label: string }[] = [
  { code: 'el', label: 'Greek' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
];
const EMPTY: ProductDraft = {
  code: '', category: null, category_name: null, sub_category: null, family_code: null,
  configuration: null, size: null, packing_bag: null, packing_box: null, moq: null,
  box_size: null, description: null, name_i18n: {}, description_i18n: {}, sort_order: 0, is_active: true,
};

export default function ProductForm({ initial, onDone, onCancel }:
  { initial?: Product; onCancel: () => void; onDone: () => void }) {
  const [d, setD] = useState<ProductDraft>(initial ? { ...initial } : EMPTY);
  const [groups, setGroups] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [opts, setOpts] = useState<{ category_name: string | null; sub_category: string | null; family_code: string | null }[]>([]);
  // Managed series from product_subcategories (so newly-added ones with no
  // products yet are still selectable here), keyed by the Excel category name.
  const [managedSubs, setManagedSubs] = useState<{ category_name: string; sub_category: string }[]>([]);
  const editing = !!initial;

  useEffect(() => {
    if (!initial) return;
    supabase.from('product_group_memberships').select('group_code').eq('product_code', initial.code)
      .then(({ data }) => setGroups((data ?? []).map((r: { group_code: string }) => r.group_code)));
  }, [initial]);

  // Distinct category / sub-category / family-code combos from existing products,
  // used to populate the dropdowns.
  useEffect(() => {
    (async () => {
      const PAGE = 1000;
      const rows: typeof opts = [];
      for (let from = 0; ; from += PAGE) {
        const { data } = await supabase.from('products')
          .select('category_name, sub_category, family_code').range(from, from + PAGE - 1);
        if (!data || data.length === 0) break;
        rows.push(...(data as typeof opts));
        if (data.length < PAGE) break;
      }
      const seen = new Set<string>();
      setOpts(rows.filter((r) => {
        const k = `${r.category_name}|${r.sub_category}|${r.family_code}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      }));
    })();
  }, []);

  // Managed series (incl. ones added in the Categories tab with no products yet).
  useEffect(() => {
    (async () => {
      const [{ data: pcats }, { data: psubs }] = await Promise.all([
        supabase.from('product_categories').select('slug, product_category_name'),
        supabase.from('product_subcategories').select('category_slug, name').eq('is_active', true),
      ]);
      const nameBySlug = new Map(
        ((pcats ?? []) as { slug: string; product_category_name: string | null }[]).map((c) => [c.slug, c.product_category_name]),
      );
      setManagedSubs(
        ((psubs ?? []) as { category_slug: string; name: string }[])
          .map((s) => ({ category_name: nameBySlug.get(s.category_slug) ?? null, sub_category: s.name }))
          .filter((x): x is { category_name: string; sub_category: string } => !!x.category_name),
      );
    })();
  }, []);

  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) => setD((p) => ({ ...p, [k]: v }));
  const num = (v: string): number | null => {
    if (v.trim() === '') return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };
  // Packing counts must be positive: 0 or a negative value clears the field.
  const posNum = (v: string): number | null => {
    if (v.trim() === '') return null;
    const n = Number(v);
    return !Number.isFinite(n) || n <= 0 ? null : Math.trunc(n);
  };
  const setI18n = (field: 'name_i18n' | 'description_i18n', lang: string, value: string) =>
    setD((p) => ({ ...p, [field]: { ...(p[field] ?? {}), [lang]: value } }));

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

  // Packing bag/box: positive integers only; 0 or negatives clear the field.
  const packField = (label: string, k: 'packing_bag' | 'packing_box') => (
    <label className="block mb-3">
      <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">{label}</span>
      <input type="number" min={1} step={1} value={(d[k] as number | null) || ''}
        onChange={(e) => set(k, posNum(e.currentTarget.value) as never)}
        onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
        className="w-full bg-transparent border-b border-ink/25 py-2 text-sm focus:outline-none focus:border-brand-500" />
    </label>
  );

  const uniqSorted = (vals: (string | null)[]) =>
    [...new Set(vals.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b));
  const categoryOpts = uniqSorted(opts.map((o) => o.category_name));
  const subCategoryOpts = uniqSorted([
    ...opts.filter((o) => !d.category_name || o.category_name === d.category_name).map((o) => o.sub_category),
    ...managedSubs.filter((o) => !d.category_name || o.category_name === d.category_name).map((o) => o.sub_category),
  ]);
  const familyCodeOpts = uniqSorted(
    opts
      .filter((o) => (!d.category_name || o.category_name === d.category_name) && (!d.sub_category || o.sub_category === d.sub_category))
      .map((o) => o.family_code),
  );

  const selectField = (label: string, value: string | null, options: string[], onPick: (v: string | null) => void) => (
    <label className="block mb-3">
      <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">{label}</span>
      <select value={value ?? ''} onChange={(e) => onPick(e.currentTarget.value || null)}
        className="w-full bg-transparent border-b border-ink/25 py-2 text-sm focus:outline-none focus:border-brand-500">
        <option value="">— select —</option>
        {value && !options.includes(value) && <option value={value}>{value}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
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
        {selectField('Category name', d.category_name, categoryOpts, (v) =>
          setD((p) => ({ ...p, category_name: v, sub_category: null, family_code: null })))}
        {field('Category letter', 'category')}
        {selectField('Sub-category', d.sub_category, subCategoryOpts, (v) =>
          setD((p) => ({ ...p, sub_category: v, family_code: null })))}
        {field('Configuration', 'configuration')}
        {field('Size', 'size')}
        {selectField('Family code', d.family_code, familyCodeOpts, (v) => set('family_code', v))}
        {field('Box size', 'box_size')}
        {packField('Packing bag', 'packing_bag')}
        {packField('Packing box', 'packing_box')}
        {field('MOQ', 'moq', 'number')}
      </div>
      <label className="block mb-3">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Description (English)</span>
        <textarea value={d.description ?? ''} onChange={(e) => set('description', e.currentTarget.value)}
          className="w-full bg-transparent border border-ink/20 p-2 text-sm focus:outline-none focus:border-brand-500" rows={2} />
      </label>

      <fieldset className="mb-5 border-t border-ink/10 pt-4">
        <legend className="text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Translations</legend>
        <p className="text-[10px] text-ink/45 mb-3">Name translates the Configuration. Anything left blank falls back to English on the site.</p>
        {I18N_LANGS.map((l) => (
          <div key={l.code} className="mb-4">
            <p className="text-[11px] font-semibold text-ink/70 mb-1">{l.label}</p>
            <input
              value={d.name_i18n?.[l.code] ?? ''}
              onChange={(e) => setI18n('name_i18n', l.code, e.currentTarget.value)}
              placeholder={`Name — ${l.label}`}
              className="w-full bg-transparent border-b border-ink/25 py-1.5 text-sm mb-2 focus:outline-none focus:border-brand-500" />
            <textarea
              value={d.description_i18n?.[l.code] ?? ''}
              onChange={(e) => setI18n('description_i18n', l.code, e.currentTarget.value)}
              placeholder={`Description — ${l.label}`}
              rows={2}
              className="w-full bg-transparent border border-ink/20 p-2 text-sm focus:outline-none focus:border-brand-500" />
          </div>
        ))}
      </fieldset>

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
