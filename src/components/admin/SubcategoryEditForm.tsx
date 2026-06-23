import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { triggerPublish } from '../../lib/publish';
import { CATEGORY_I18N_LANGS, cleanI18n, type ProductSubcategory } from '../../lib/categories';

// Inline panel for renaming a series and editing its translations. Replaces the
// old prompt()-based rename. The English `name` is the matching key against
// products.sub_category, so renaming it also propagates to the linked products.
export default function SubcategoryEditForm({ sub, excelName, onDone, onCancel }: {
  sub: ProductSubcategory;
  excelName: string | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(sub.name);
  const [i18n, setI18nState] = useState<Record<string, string>>({ ...(sub.name_i18n ?? {}) });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const setI18n = (lang: string, value: string) =>
    setI18nState((p) => ({ ...p, [lang]: value }));

  const submit = async () => {
    const newName = name.trim();
    if (!newName) return setError('Name is required.');
    setBusy(true); setError(null);
    const { error: e1 } = await supabase.from('product_subcategories')
      .update({ name: newName, name_i18n: cleanI18n(i18n) }).eq('id', sub.id);
    if (e1) { setBusy(false); return setError(e1.message); }
    // An English rename must follow through to the catalogue rows that match on it.
    if (newName !== sub.name && excelName) {
      const { error: e2 } = await supabase.from('products')
        .update({ sub_category: newName }).eq('category_name', excelName).eq('sub_category', sub.name);
      if (e2) { setBusy(false); return setError(`Saved, but updating products failed: ${e2.message}`); }
    }
    setBusy(false); triggerPublish(); onDone();
  };

  return (
    <div className="border border-ink/10 bg-ink/[0.02] p-4 my-2">
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-3">{error}</p>}
      <label className="block mb-3">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Name (English)</span>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
          className="w-full bg-transparent border-b border-ink/25 py-1.5 text-sm focus:outline-none focus:border-brand-500" />
      </label>
      <p className="text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">Translations</p>
      <p className="text-[10px] text-ink/40 mb-3">Anything left blank falls back to English on the site.</p>
      <div className="grid grid-cols-2 gap-x-4">
        {CATEGORY_I18N_LANGS.map((l) => (
          <label key={l.code} className="block mb-3">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/55 mb-1">{l.label}</span>
            <input
              value={i18n[l.code] ?? ''}
              onChange={(e) => setI18n(l.code, e.currentTarget.value)}
              placeholder={l.label}
              className="w-full bg-transparent border-b border-ink/25 py-1.5 text-sm focus:outline-none focus:border-brand-500" />
          </label>
        ))}
      </div>
      <div className="flex gap-3 mt-1">
        <button type="button" disabled={busy} onClick={submit}
          className="bg-brand-500 text-surface px-4 py-2 text-[11px] uppercase tracking-[0.2em] disabled:opacity-50">
          {busy ? 'Saving…' : 'Save changes'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-ink/70">Cancel</button>
      </div>
    </div>
  );
}
