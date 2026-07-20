import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { validateProductDraft, nextProductSortOrder } from '../../lib/products';
import { configKey, fetchConfigTranslations, upsertConfigTranslations } from '../../lib/product-configurations';
import type { ConfigTranslations } from '../../lib/product-configurations';
import { mergeFamilyCodes } from '../../lib/families';
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
  box_size: null, description: null, name_i18n: {}, description_i18n: {},
  sort_order: 0, is_active: true, is_hidden: false,
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
  // Managed family codes from product_families (likewise selectable before any
  // product uses them).
  const [managedFamilies, setManagedFamilies] = useState<{ category_name: string; code: string }[]>([]);
  // Product-level translations (product_configurations), edited here but shared
  // by every size of this configuration.
  const [cfgTr, setCfgTr] = useState<ConfigTranslations>({ name: '', description: '', name_i18n: {}, description_i18n: {} });
  const [slugByName, setSlugByName] = useState<Map<string, string>>(new Map());
  // Category letter ⇄ category name, so picking one auto-fills the other.
  const [letterByCategory, setLetterByCategory] = useState<Map<string, string>>(new Map());
  const [categoryByLetter, setCategoryByLetter] = useState<Map<string, string>>(new Map());
  const [loadedKey, setLoadedKey] = useState<string>('');
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

  // Managed series + family codes (incl. ones added in the Categories / Family
  // tabs with no products yet).
  useEffect(() => {
    (async () => {
      const [{ data: pcats }, { data: psubs }, { data: pfams }] = await Promise.all([
        supabase.from('product_categories').select('slug, product_category_name, category_letter'),
        supabase.from('product_subcategories').select('category_slug, name').eq('is_active', true),
        supabase.from('product_families').select('category_slug, code').eq('is_active', true),
      ]);
      const pcatRows = (pcats ?? []) as { slug: string; product_category_name: string | null; category_letter: string | null }[];
      const nameBySlug = new Map(pcatRows.map((c) => [c.slug, c.product_category_name]));
      setSlugByName(new Map(
        pcatRows.filter((c) => c.product_category_name).map((c) => [c.product_category_name as string, c.slug]),
      ));
      // Build the letter ⇄ category-name lookups (only rows that have both).
      const byCat = new Map<string, string>();
      const byLetter = new Map<string, string>();
      for (const c of pcatRows) {
        if (c.product_category_name && c.category_letter) {
          byCat.set(c.product_category_name, c.category_letter);
          byLetter.set(c.category_letter.toUpperCase(), c.product_category_name);
        }
      }
      setLetterByCategory(byCat);
      setCategoryByLetter(byLetter);
      setManagedSubs(
        ((psubs ?? []) as { category_slug: string; name: string }[])
          .map((s) => ({ category_name: nameBySlug.get(s.category_slug) ?? null, sub_category: s.name }))
          .filter((x): x is { category_name: string; sub_category: string } => !!x.category_name),
      );
      setManagedFamilies(
        ((pfams ?? []) as { category_slug: string; code: string }[])
          .map((f) => ({ category_name: nameBySlug.get(f.category_slug) ?? null, code: f.code }))
          .filter((x): x is { category_name: string; code: string } => !!x.category_name),
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
  const setCfgField = (k: 'name' | 'description', v: string) => setCfgTr((p) => ({ ...p, [k]: v }));
  const setCfgI18n = (field: 'name_i18n' | 'description_i18n', lang: string, value: string) =>
    setCfgTr((p) => ({ ...p, [field]: { ...p[field], [lang]: value } }));

  // The configuration key (category_slug + config_slug) for the current draft,
  // or null until enough fields are chosen.
  const cfgKeyOf = (draft: ProductDraft) => {
    const category_slug = draft.category_name ? slugByName.get(draft.category_name) : undefined;
    if (!category_slug || !(draft.family_code ?? draft.code)) return null;
    return configKey({ category_slug, sub_category: draft.sub_category, family_code: draft.family_code, code: draft.code });
  };

  // Load the product-level translations whenever the resolved configuration
  // changes (once in edit mode; when series/code are picked in create mode).
  useEffect(() => {
    const key = cfgKeyOf(d);
    const ks = key ? `${key.category_slug}/${key.config_slug}` : '';
    if (!key || ks === loadedKey) return;
    let cancelled = false;
    fetchConfigTranslations(key).then((rec) => {
      if (cancelled) return;
      setCfgTr({
        name: rec?.name ?? '',
        description: rec?.description ?? '',
        name_i18n: rec?.name_i18n ?? {},
        description_i18n: rec?.description_i18n ?? {},
      });
      setLoadedKey(ks);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugByName, d.category_name, d.sub_category, d.family_code, d.code]);

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
    const trKey = cfgKeyOf(payload);
    if (trKey) {
      const { error: trErr } = await upsertConfigTranslations(trKey, cfgTr);
      if (trErr) { setBusy(false); return setError(`Product saved, but translations failed: ${trErr}`); }
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
  // Category names from existing products merged with the managed categories
  // (product_categories), so newly-added ones with no products yet are selectable.
  // Ordered by catalogue letter (A → B → C…) to match the "letter - name" option
  // labels; categories with no letter sink to the end, alphabetical by name.
  const categoryOpts = uniqSorted([
    ...opts.map((o) => o.category_name),
    ...slugByName.keys(),
  ]).sort((a, b) => {
    const la = letterByCategory.get(a);
    const lb = letterByCategory.get(b);
    if (la && lb) return la.localeCompare(lb) || a.localeCompare(b);
    return la ? -1 : lb ? 1 : a.localeCompare(b);
  });
  // Sub-categories belong to a category, so only show them once a category is
  // chosen, scoped to that category. (Category name is required — see validateProductDraft.)
  const subCategoryOpts = d.category_name ? uniqSorted([
    ...opts.filter((o) => o.category_name === d.category_name).map((o) => o.sub_category),
    ...managedSubs.filter((o) => o.category_name === d.category_name).map((o) => o.sub_category),
  ]) : [];
  // Codes already on products (filtered by the chosen category + series) merged
  // with the managed codes for the category (which may have no products yet).
  const familyCodeOpts = mergeFamilyCodes(
    opts
      .filter((o) => (!d.category_name || o.category_name === d.category_name) && (!d.sub_category || o.sub_category === d.sub_category))
      .map((o) => o.family_code),
    managedFamilies
      .filter((m) => !d.category_name || m.category_name === d.category_name)
      .map((m) => m.code),
  );

  // Pick a family code. Images are family-owned (Families tab → Manage
  // images) — the product row carries no image link of its own.
  const pickFamilyCode = (v: string | null) =>
    setD((p) => ({ ...p, family_code: v }));

  // Pick a category name: auto-fill its letter and reset the dependent fields.
  const pickCategory = (v: string | null) =>
    setD((p) => ({
      ...p,
      category_name: v,
      category: v ? (letterByCategory.get(v) ?? null) : null,
      sub_category: null,
      family_code: null,
    }));

  // Type a category letter: if it maps to a category, auto-fill the name (and
  // reset dependent fields when it actually changes the category).
  const pickLetter = (raw: string) =>
    setD((p) => {
      const letter = raw.trim() || null;
      const mapped = letter ? categoryByLetter.get(letter.toUpperCase()) : undefined;
      if (mapped) {
        // Store the category's canonical letter; switch the name when it changed.
        const canonical = letterByCategory.get(mapped) ?? letter;
        return mapped !== p.category_name
          ? { ...p, category: canonical, category_name: mapped, sub_category: null, family_code: null }
          : { ...p, category: canonical };
      }
      return { ...p, category: letter };
    });

  // labelFor customises the visible option text only — the option VALUE (and
  // what gets stored) is always the bare string.
  const selectField = (label: string, value: string | null, options: string[], onPick: (v: string | null) => void, labelFor: (v: string) => string = (v) => v) => (
    <label className="block mb-3">
      <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">{label}</span>
      <select value={value ?? ''} onChange={(e) => onPick(e.currentTarget.value || null)}
        className="w-full bg-transparent border-b border-ink/25 py-2 text-sm focus:outline-none focus:border-brand-500">
        <option value="">— select —</option>
        {value && !options.includes(value) && <option value={value}>{labelFor(value)}</option>}
        {options.map((o) => <option key={o} value={o}>{labelFor(o)}</option>)}
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
        {selectField('Category name', d.category_name, categoryOpts, pickCategory, (name) => {
          const letter = letterByCategory.get(name);
          return letter ? `${letter} - ${name}` : name;
        })}
        <label className="block mb-3">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Category letter</span>
          <input value={d.category ?? ''} onChange={(e) => pickLetter(e.currentTarget.value)}
            className="w-full bg-transparent border-b border-ink/25 py-2 text-sm focus:outline-none focus:border-brand-500" />
        </label>
        {selectField('Sub-category', d.sub_category, subCategoryOpts, (v) =>
          setD((p) => ({ ...p, sub_category: v, family_code: null })))}
        {field('Configuration', 'configuration')}
        {field('Size', 'size')}
        {selectField('Family code', d.family_code, familyCodeOpts, pickFamilyCode)}
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
        <legend className="text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Translations — apply to the whole product (all sizes)</legend>
        <p className="text-[10px] text-ink/45 mb-3">
          The name + description shown on the product page, per language. These apply to every size of this
          configuration. Leave a language blank to fall back to English; leave the English display name blank to use
          the Configuration value.
        </p>
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-ink/70 mb-1">English (display name)</p>
          <input
            value={cfgTr.name}
            onChange={(e) => setCfgField('name', e.currentTarget.value)}
            placeholder="Display name — overrides the Configuration on the page"
            className="w-full bg-transparent border-b border-ink/25 py-1.5 text-sm mb-2 focus:outline-none focus:border-brand-500" />
          <textarea
            value={cfgTr.description}
            onChange={(e) => setCfgField('description', e.currentTarget.value)}
            placeholder="Description — English"
            rows={2}
            className="w-full bg-transparent border border-ink/20 p-2 text-sm focus:outline-none focus:border-brand-500" />
        </div>
        {I18N_LANGS.map((l) => (
          <div key={l.code} className="mb-4">
            <p className="text-[11px] font-semibold text-ink/70 mb-1">{l.label}</p>
            <input
              value={cfgTr.name_i18n?.[l.code] ?? ''}
              onChange={(e) => setCfgI18n('name_i18n', l.code, e.currentTarget.value)}
              placeholder={`Name — ${l.label}`}
              className="w-full bg-transparent border-b border-ink/25 py-1.5 text-sm mb-2 focus:outline-none focus:border-brand-500" />
            <textarea
              value={cfgTr.description_i18n?.[l.code] ?? ''}
              onChange={(e) => setCfgI18n('description_i18n', l.code, e.currentTarget.value)}
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
                onChange={(e) => {
                  // Read `checked` synchronously: React nulls e.currentTarget once the
                  // handler returns, so reading it inside the deferred setGroups updater
                  // would throw and crash the form.
                  const checked = e.currentTarget.checked;
                  setGroups((prev) => (checked ? [...prev, g] : prev.filter((x) => x !== g)));
                }} />
              {g}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm mb-3">
        <input type="checkbox" checked={d.is_active} className="accent-brand-500"
          onChange={(e) => set('is_active', e.currentTarget.checked)} /> Active
      </label>
      <label className="flex items-center gap-2 text-sm mb-6">
        <input type="checkbox" checked={d.is_hidden} className="accent-brand-500"
          onChange={(e) => set('is_hidden', e.currentTarget.checked)} /> Hidden (remove from site &amp; admin list)
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
