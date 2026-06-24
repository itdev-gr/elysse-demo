import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { triggerPublish } from '../../lib/publish';
import { CATEGORY_I18N_LANGS, cleanI18n, type ProductCategory } from '../../lib/categories';

const EMPTY: ProductCategory = {
  slug: '', name: '', sort_order: 0, image: '', source_image: null,
  leaflet_pdf: null, blurb: null, product_category_name: null, is_active: true,
  name_i18n: {}, blurb_i18n: {},
};

export default function CategoryForm({ initial, onDone, onCancel }:
  { initial?: ProductCategory; onCancel: () => void; onDone: () => void }) {
  const [d, setD] = useState<ProductCategory>(initial ? { ...initial } : { ...EMPTY });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const editing = !!initial;

  const set = <K extends keyof ProductCategory>(k: K, v: ProductCategory[K]) =>
    setD((p) => ({ ...p, [k]: v }));

  const setI18n = (field: 'name_i18n' | 'blurb_i18n', lang: string, value: string) =>
    setD((p) => ({ ...p, [field]: { ...(p[field] ?? {}), [lang]: value } }));

  const submit = async () => {
    if (!d.slug.trim()) return setError('Slug is required.');
    if (!d.name.trim()) return setError('Name is required.');
    if (!d.image.trim()) return setError('Image path is required.');
    setBusy(true); setError(null);
    const payload = {
      ...d,
      slug: d.slug.trim(),
      // The Excel link is what ties products to this category and populates the
      // product form's category dropdown. Default it to the name when left blank
      // so every category is selectable/linkable without touching the advanced field.
      product_category_name: d.product_category_name?.trim() || d.name.trim(),
      name_i18n: cleanI18n(d.name_i18n),
      blurb_i18n: cleanI18n(d.blurb_i18n),
    };
    const { error: err } = editing
      ? await supabase.from('product_categories').update(payload).eq('slug', initial!.slug)
      : await supabase.from('product_categories').insert(payload);
    if (err) { setBusy(false); return setError(err.message); }
    setBusy(false); triggerPublish(); onDone();
  };

  const field = (label: string, k: keyof ProductCategory, type: 'text' | 'number' = 'text', help?: string) => (
    <label className="block mb-3">
      <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">{label}</span>
      <input
        type={type}
        value={(d[k] as string | number | null) ?? ''}
        onChange={(e) => set(k, (type === 'number'
          ? Number(e.currentTarget.value || 0)
          : (e.currentTarget.value || (k === 'name' || k === 'slug' || k === 'image' ? '' : null))) as never)}
        className="w-full bg-transparent border-b border-ink/25 py-2 text-sm focus:outline-none focus:border-brand-500" />
      {help && <span className="block text-[10px] text-ink/40 mt-1">{help}</span>}
    </label>
  );

  return (
    <div className="max-w-2xl border border-ink/10 p-5 mb-6">
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-4">{error}</p>}
      <div className="grid grid-cols-2 gap-x-6">
        <label className="block mb-3">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Slug (URL, primary key)</span>
          <input value={d.slug} disabled={editing} onChange={(e) => set('slug', e.currentTarget.value)}
            className="w-full bg-transparent border-b border-ink/25 py-2 text-sm font-mono disabled:opacity-50 focus:outline-none focus:border-brand-500" />
        </label>
        {field('Name', 'name')}
        {field('Sort order', 'sort_order', 'number')}
        {field('Image path', 'image', 'text', '/images/products/categories/<slug>.png')}
        {field('Leaflet PDF', 'leaflet_pdf')}
        {field('Excel category link (advanced)', 'product_category_name', 'text', 'Defaults to the Name. Must equal products.category_name to show catalogue items')}
      </div>
      <label className="block mb-4">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Blurb</span>
        <textarea value={d.blurb ?? ''} onChange={(e) => set('blurb', e.currentTarget.value || null)}
          className="w-full bg-transparent border border-ink/20 p-2 text-sm focus:outline-none focus:border-brand-500" rows={2} />
      </label>

      <fieldset className="border border-ink/10 p-4 mb-5">
        <legend className="text-[10px] uppercase tracking-[0.2em] text-ink/55 px-1">Translations</legend>
        <p className="text-[10px] text-ink/40 mb-3">
          Name and blurb per language. Anything left blank falls back to English on the site.
        </p>
        {CATEGORY_I18N_LANGS.map((l) => (
          <div key={l.code} className="mb-4 last:mb-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">{l.label}</p>
            <input
              value={d.name_i18n?.[l.code] ?? ''}
              onChange={(e) => setI18n('name_i18n', l.code, e.currentTarget.value)}
              placeholder={`Name (${l.label})`}
              className="w-full bg-transparent border-b border-ink/25 py-1.5 text-sm focus:outline-none focus:border-brand-500 mb-2" />
            <textarea
              value={d.blurb_i18n?.[l.code] ?? ''}
              onChange={(e) => setI18n('blurb_i18n', l.code, e.currentTarget.value)}
              placeholder={`Blurb (${l.label})`}
              rows={2}
              className="w-full bg-transparent border border-ink/20 p-2 text-sm focus:outline-none focus:border-brand-500" />
          </div>
        ))}
      </fieldset>

      <label className="flex items-center gap-2 text-sm mb-5">
        <input type="checkbox" checked={d.is_active} className="accent-brand-500"
          onChange={(e) => set('is_active', e.currentTarget.checked)} /> Active (visible on the site)
      </label>
      <div className="flex gap-3">
        <button type="button" disabled={busy} onClick={submit}
          className="bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] disabled:opacity-50">
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Create category'}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] text-ink/70">Cancel</button>
      </div>
    </div>
  );
}
