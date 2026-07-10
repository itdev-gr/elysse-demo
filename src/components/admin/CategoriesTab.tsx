import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { triggerPublish } from '../../lib/publish';
import { filterCategoryCards } from '../../lib/categories';
import type { ProductCategory, ProductSubcategory } from '../../lib/categories';
import CategoryForm from './CategoryForm';
import SubcategoryEditForm from './SubcategoryEditForm';
import SearchInput from './SearchInput';

export default function CategoriesTab() {
  const [cats, setCats] = useState<ProductCategory[] | null>(null);
  const [subs, setSubs] = useState<ProductSubcategory[]>([]);
  const [catCounts, setCatCounts] = useState<Record<string, number>>({});   // by product_category_name
  const [subCounts, setSubCounts] = useState<Record<string, number>>({});   // by "categoryName|sub"
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);              // slug being edited
  const [creating, setCreating] = useState(false);
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null);    // category slug adding a series to
  const [newSubName, setNewSubName] = useState('');
  const [editingSub, setEditingSub] = useState<string | null>(null);        // subcategory id being edited
  const [query, setQuery] = useState('');

  const load = async () => {
    setError(null);
    const [{ data: c, error: cErr }, { data: s, error: sErr }] = await Promise.all([
      supabase.from('product_categories').select('*').order('sort_order'),
      supabase.from('product_subcategories').select('*').order('sort_order'),
    ]);
    if (cErr || sErr) return setError((cErr ?? sErr)!.message);
    setCats((c ?? []) as ProductCategory[]);
    setSubs((s ?? []) as ProductSubcategory[]);

    // product counts (paginated past the 1000-row cap)
    const PAGE = 1000;
    const rows: { category_name: string | null; sub_category: string | null }[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data } = await supabase.from('products').select('category_name, sub_category').range(from, from + PAGE - 1);
      if (!data || data.length === 0) break;
      rows.push(...data);
      if (data.length < PAGE) break;
    }
    const cc: Record<string, number> = {};
    const sc: Record<string, number> = {};
    for (const r of rows) {
      if (r.category_name) cc[r.category_name] = (cc[r.category_name] ?? 0) + 1;
      if (r.category_name && r.sub_category) {
        const k = `${r.category_name}|${r.sub_category}`;
        sc[k] = (sc[k] ?? 0) + 1;
      }
    }
    setCatCounts(cc); setSubCounts(sc);
  };

  useEffect(() => { load(); }, []);

  const toggleCat = async (cat: ProductCategory) => {
    const { error: err } = await supabase.from('product_categories')
      .update({ is_active: !cat.is_active }).eq('slug', cat.slug);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  // Display order of a category on the live site (lower shows first). No-op when
  // unchanged or not a number.
  const setCatOrder = async (cat: ProductCategory, value: string) => {
    const n = Math.trunc(Number(value));
    if (!Number.isFinite(n) || n === cat.sort_order) return;
    const { error: err } = await supabase.from('product_categories')
      .update({ sort_order: n }).eq('slug', cat.slug);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  const deleteCat = async (cat: ProductCategory) => {
    const count = cat.product_category_name ? (catCounts[cat.product_category_name] ?? 0) : 0;
    if (count > 0) return setError(`"${cat.name}" still has ${count} products — hide it instead of deleting.`);
    if (!confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('product_categories').delete().eq('slug', cat.slug);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  const toggleSub = async (sub: ProductSubcategory) => {
    const { error: err } = await supabase.from('product_subcategories')
      .update({ is_active: !sub.is_active }).eq('id', sub.id);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  // Display order of a series WITHIN its category (each category numbers its own
  // series 1,2,3…). Lower shows first on the live site.
  const setSubOrder = async (sub: ProductSubcategory, value: string) => {
    const n = Math.trunc(Number(value));
    if (!Number.isFinite(n) || n === sub.sort_order) return;
    const { error: err } = await supabase.from('product_subcategories')
      .update({ sort_order: n }).eq('id', sub.id);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  const deleteSub = async (sub: ProductSubcategory, excelName: string | null) => {
    const count = excelName ? (subCounts[`${excelName}|${sub.name}`] ?? 0) : 0;
    if (count > 0) return setError(`Series "${sub.name}" still has ${count} products — hide it instead of deleting.`);
    if (!confirm(`Delete series "${sub.name}"?`)) return;
    const { error: err } = await supabase.from('product_subcategories').delete().eq('id', sub.id);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  // Add a brand-new series under a category.
  const addSub = async (cat: ProductCategory) => {
    const name = newSubName.trim();
    if (!name) return;
    if (subs.some((s) => s.category_slug === cat.slug && s.name.toLowerCase() === name.toLowerCase())) {
      return setError(`"${name}" already exists under ${cat.name}.`);
    }
    const base = subs.filter((s) => s.category_slug === cat.slug).length;
    const { error: err } = await supabase.from('product_subcategories')
      .insert({ category_slug: cat.slug, name, sort_order: base });
    if (err) return setError(err.message);
    setAddingSubFor(null); setNewSubName('');
    await load(); triggerPublish();
  };

  // Insert overlay rows for any products.sub_category not yet present for this category.
  const rescan = async (cat: ProductCategory) => {
    if (!cat.product_category_name) return;
    const PAGE = 1000;
    const seen = new Set<string>();
    for (let from = 0; ; from += PAGE) {
      const { data } = await supabase.from('products').select('sub_category')
        .eq('category_name', cat.product_category_name).range(from, from + PAGE - 1);
      if (!data || data.length === 0) break;
      for (const r of data) if (r.sub_category) seen.add(r.sub_category);
      if (data.length < PAGE) break;
    }
    const existing = new Set(subs.filter((s) => s.category_slug === cat.slug).map((s) => s.name));
    const missing = [...seen].filter((n) => !existing.has(n));
    if (missing.length === 0) { setError(`No new series found for "${cat.name}".`); return; }
    const base = subs.filter((s) => s.category_slug === cat.slug).length;
    const { error: err } = await supabase.from('product_subcategories')
      .insert(missing.map((name, i) => ({ category_slug: cat.slug, name, sort_order: base + i })));
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  return (
    <>
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">{error}</p>}

      <div className="flex justify-end mb-4">
        <button type="button" onClick={() => { setCreating(true); setEditing(null); }}
          className="text-[11px] text-brand-500 uppercase tracking-[0.2em]">+ New category</button>
      </div>
      <div className="mb-6">
        <SearchInput value={query} onChange={setQuery} placeholder="Search category or series…" />
      </div>
      {creating && <CategoryForm onDone={() => { setCreating(false); load(); }} onCancel={() => setCreating(false)} />}

      {cats === null && <p className="text-sm text-ink/60">Loading…</p>}
      {cats !== null && filterCategoryCards(cats, subs, query).length === 0 && query.trim() !== '' && (
        <p className="text-sm text-ink/60">Nothing matches &ldquo;{query}&rdquo;.</p>
      )}
      {cats !== null && (
        <div className="space-y-6">
          {filterCategoryCards(cats, subs, query).map(({ cat, subs: catSubs }) => {
            const excel = cat.product_category_name;
            return (
              <section key={cat.slug} className={`border p-5 ${cat.is_active ? 'border-ink/10' : 'border-ink/10 bg-ink/[0.03] opacity-70'}`}>
                <header className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 shrink-0" title="Display order on the site (lower shows first)">
                      <span className="text-[9px] uppercase tracking-[0.15em] text-ink/40">Order</span>
                      <input
                        key={cat.sort_order}
                        type="number"
                        defaultValue={cat.sort_order}
                        onBlur={(e) => setCatOrder(cat, e.currentTarget.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                        className="w-14 bg-transparent border-b border-ink/25 py-1 text-sm text-center focus:outline-none focus:border-brand-500" />
                    </label>
                    <h3 className="font-heavy text-lg">
                      {cat.name}{' '}
                      <span className="font-mono text-[11px] text-ink/45">/{cat.slug}</span>
                      {!cat.is_active && <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-ink/45">hidden</span>}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em]">
                    <button type="button" onClick={() => { setEditing(cat.slug); setCreating(false); }} className="text-brand-500">Edit</button>
                    <button type="button" onClick={() => toggleCat(cat)} className="text-ink/70">{cat.is_active ? 'Hide' : 'Show'}</button>
                    <button type="button" onClick={() => deleteCat(cat)} className="text-red-600">Delete</button>
                  </div>
                </header>

                {editing === cat.slug && (
                  <CategoryForm initial={cat} onDone={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />
                )}

                <div className="flex items-center justify-between mt-2 mb-2">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-ink/45">Sub-categories (series)</p>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => { setAddingSubFor(cat.slug); setNewSubName(''); setError(null); }}
                      className="text-[10px] uppercase tracking-[0.2em] text-brand-500">+ Add subcategory</button>
                    {excel && (
                      <button type="button" onClick={() => rescan(cat)} className="text-[10px] uppercase tracking-[0.2em] text-ink/55">Rescan from products</button>
                    )}
                  </div>
                </div>
                {addingSubFor === cat.slug && (
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      autoFocus
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.currentTarget.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addSub(cat);
                        if (e.key === 'Escape') { setAddingSubFor(null); setNewSubName(''); }
                      }}
                      placeholder="New series name"
                      className="flex-1 bg-transparent border-b border-ink/25 py-1.5 text-sm focus:outline-none focus:border-brand-500" />
                    <button type="button" onClick={() => addSub(cat)}
                      className="bg-brand-500 text-surface px-4 py-1.5 text-[11px] uppercase tracking-[0.2em]">Add</button>
                    <button type="button" onClick={() => { setAddingSubFor(null); setNewSubName(''); }}
                      className="px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-ink/60">Cancel</button>
                  </div>
                )}
                {catSubs.length === 0 && addingSubFor !== cat.slug && (
                  <p className="text-sm text-ink/50">{query.trim() !== '' ? 'No matching series.' : 'No series.'}</p>
                )}
                <ul className="flex flex-col gap-1">
                  {catSubs.map((sub) => {
                    const count = excel ? (subCounts[`${excel}|${sub.name}`] ?? 0) : 0;
                    const langCount = sub.name_i18n ? Object.keys(sub.name_i18n).length : 0;
                    return (
                      <li key={sub.id} className={`border-b border-ink/5 ${sub.is_active ? '' : 'opacity-60'}`}>
                        <div className="flex items-center gap-3 text-sm py-1.5">
                          <label className="flex items-center gap-1 shrink-0" title="Order within this category (lower shows first)">
                            <span className="text-[9px] uppercase tracking-[0.15em] text-ink/40">Order</span>
                            <input
                              key={sub.sort_order}
                              type="number"
                              defaultValue={sub.sort_order}
                              onBlur={(e) => setSubOrder(sub, e.currentTarget.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                              className="w-14 bg-transparent border-b border-ink/25 py-1 text-sm text-center focus:outline-none focus:border-brand-500" />
                          </label>
                          <span className="flex-1">{sub.name}</span>
                          {langCount > 0 && <span className="text-[10px] uppercase tracking-[0.15em] text-brand-500/70">{langCount} lang</span>}
                          <span className="font-mono text-[10px] text-ink/45">{count} prod</span>
                          {!sub.is_active && <span className="text-[10px] uppercase tracking-[0.2em] text-ink/45">hidden</span>}
                          <button type="button" onClick={() => setEditingSub(editingSub === sub.id ? null : sub.id)} className="text-[11px] text-brand-500 uppercase tracking-[0.15em]">Edit</button>
                          <button type="button" onClick={() => toggleSub(sub)} className="text-[11px] text-ink/60 uppercase tracking-[0.15em]">{sub.is_active ? 'Hide' : 'Show'}</button>
                          <button type="button" onClick={() => deleteSub(sub, excel)} className="text-red-600" aria-label={`Delete ${sub.name}`}>×</button>
                        </div>
                        {editingSub === sub.id && (
                          <SubcategoryEditForm
                            sub={sub}
                            excelName={excel}
                            onDone={() => { setEditingSub(null); load(); }}
                            onCancel={() => setEditingSub(null)} />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
