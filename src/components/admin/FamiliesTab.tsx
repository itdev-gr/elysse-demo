import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { triggerPublish } from '../../lib/publish';
import type { ProductCategory } from '../../lib/categories';
import type { ProductFamily } from '../../lib/families';
import { LibraryGrid, type ProductImage } from './ImageLibraryGrid';

// A family code's derived facts from the products that use it.
interface CodeFacts {
  count: number;
  series: string | null;
}

export default function FamiliesTab() {
  const [cats, setCats] = useState<ProductCategory[] | null>(null);
  const [families, setFamilies] = useState<ProductFamily[]>([]);
  const [images, setImages] = useState<ProductImage[] | null>(null);
  // Keyed by `${excelCategoryName}|${code}` — product count + series from products.
  const [facts, setFacts] = useState<Record<string, CodeFacts>>({});
  const [error, setError] = useState<string | null>(null);

  const [addingFor, setAddingFor] = useState<string | null>(null);   // category slug
  const [newCode, setNewCode] = useState('');
  const [assignTarget, setAssignTarget] = useState<ProductFamily | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const [{ data: c, error: cErr }, { data: f, error: fErr }, { data: imgs, error: iErr }] =
      await Promise.all([
        supabase.from('product_categories').select('*').order('sort_order'),
        supabase.from('product_families').select('*').order('category_slug').order('sort_order'),
        supabase.from('product_images').select('*').order('created_at', { ascending: false }),
      ]);
    if (cErr || fErr || iErr) return setError((cErr ?? fErr ?? iErr)!.message);
    setCats((c ?? []) as ProductCategory[]);
    setFamilies((f ?? []) as ProductFamily[]);
    setImages((imgs ?? []) as ProductImage[]);

    // product-derived counts + series (paginated past the 1000-row cap)
    const PAGE = 1000;
    const rows: { category_name: string | null; sub_category: string | null; family_code: string | null }[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data } = await supabase.from('products')
        .select('category_name, sub_category, family_code').range(from, from + PAGE - 1);
      if (!data || data.length === 0) break;
      rows.push(...data);
      if (data.length < PAGE) break;
    }
    const fx: Record<string, CodeFacts> = {};
    for (const r of rows) {
      if (!r.category_name || !r.family_code) continue;
      const k = `${r.category_name}|${r.family_code}`;
      const cur = fx[k] ?? { count: 0, series: null };
      fx[k] = { count: cur.count + 1, series: cur.series ?? r.sub_category };
    }
    setFacts(fx);
  };

  useEffect(() => { load(); }, []);

  const excelName = (cat: ProductCategory) => cat.product_category_name;
  const factsFor = (cat: ProductCategory, code: string): CodeFacts =>
    (excelName(cat) ? facts[`${excelName(cat)}|${code}`] : undefined) ?? { count: 0, series: null };

  // ── mutations ──────────────────────────────────────────────────────────────

  const addCode = async (cat: ProductCategory) => {
    const code = newCode.trim();
    if (!code) return;
    if (families.some((f) => f.category_slug === cat.slug && f.code.toLowerCase() === code.toLowerCase())) {
      return setError(`Code "${code}" already exists under ${cat.name}.`);
    }
    const base = families.filter((f) => f.category_slug === cat.slug).length;
    const { error: err } = await supabase.from('product_families')
      .insert({ category_slug: cat.slug, code, sort_order: base });
    if (err) return setError(err.message);
    setAddingFor(null); setNewCode('');
    await load(); triggerPublish();
  };

  const renameCode = async (cat: ProductCategory, fam: ProductFamily) => {
    const next = prompt(`Rename code "${fam.code}" to:`, fam.code);
    if (!next || next.trim() === '' || next.trim() === fam.code) return;
    const code = next.trim();
    if (families.some((f) => f.category_slug === cat.slug && f.id !== fam.id && f.code.toLowerCase() === code.toLowerCase())) {
      return setError(`Code "${code}" already exists under ${cat.name}.`);
    }
    const { error: e1 } = await supabase.from('product_families').update({ code }).eq('id', fam.id);
    if (e1) return setError(e1.message);
    const excel = excelName(cat);
    if (excel) {
      const { error: e2 } = await supabase.from('products')
        .update({ family_code: code }).eq('category_name', excel).eq('family_code', fam.code);
      if (e2) return setError(`Code renamed, but updating products failed: ${e2.message}`);
    }
    await load(); triggerPublish();
  };

  const toggleCode = async (fam: ProductFamily) => {
    const { error: err } = await supabase.from('product_families')
      .update({ is_active: !fam.is_active }).eq('id', fam.id);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  const deleteCode = async (cat: ProductCategory, fam: ProductFamily) => {
    const count = factsFor(cat, fam.code).count;
    if (count > 0) return setError(`Code "${fam.code}" still has ${count} products — hide it instead of deleting.`);
    if (!confirm(`Delete code "${fam.code}"?`)) return;
    const { error: err } = await supabase.from('product_families').delete().eq('id', fam.id);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  // ── image allocation ─────────────────────────────────────────────────────

  const catForFamily = (fam: ProductFamily | null) =>
    fam ? (cats ?? []).find((c) => c.slug === fam.category_slug) ?? null : null;

  const applyImage = async (url: string | null) => {
    if (!assignTarget) return;
    setAssignError(null);
    const { error: e1 } = await supabase.from('product_families')
      .update({ image_url: url }).eq('id', assignTarget.id);
    if (e1) return setAssignError(e1.message);
    const excel = catForFamily(assignTarget)?.product_category_name ?? null;
    if (excel) {
      const { error: e2 } = await supabase.from('products')
        .update({ image_url: url }).eq('category_name', excel).eq('family_code', assignTarget.code);
      if (e2) return setAssignError(`Image saved on the family, but updating products failed: ${e2.message}`);
    }
    setAssignTarget(null);
    await load(); triggerPublish();
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">{error}</p>}

      <p className="text-sm text-ink/60 mb-6 max-w-2xl">
        Each category is a <strong>family</strong>; the codes below (e.g. 330, 330A, 330T) are its
        <strong> family codes</strong>. Add a code to make it selectable in the product form, and
        allocate it an image — the image applies to every product in that code and stays in the
        Images library.
      </p>

      {cats === null && <p className="text-sm text-ink/60">Loading…</p>}
      {cats !== null && (
        <div className="space-y-6">
          {cats.map((cat) => {
            const codes = families.filter((f) => f.category_slug === cat.slug);
            return (
              <section key={cat.slug} className={`border p-5 ${cat.is_active ? 'border-ink/10' : 'border-ink/10 bg-ink/[0.03] opacity-70'}`}>
                <header className="flex items-center justify-between mb-3">
                  <h3 className="font-heavy text-lg">
                    {cat.name}{' '}
                    <span className="font-mono text-[11px] text-ink/45">/{cat.slug}</span>
                    {!cat.is_active && <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-ink/45">hidden</span>}
                  </h3>
                  <button type="button" onClick={() => { setAddingFor(cat.slug); setNewCode(''); setError(null); }}
                    className="text-[10px] uppercase tracking-[0.2em] text-brand-500">+ Add code</button>
                </header>

                <p className="text-[10px] uppercase tracking-[0.25em] text-ink/45 mb-2">Family codes</p>

                {addingFor === cat.slug && (
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      autoFocus
                      value={newCode}
                      onChange={(e) => setNewCode(e.currentTarget.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addCode(cat);
                        if (e.key === 'Escape') { setAddingFor(null); setNewCode(''); }
                      }}
                      placeholder="New code, e.g. 330T"
                      className="flex-1 bg-transparent border-b border-ink/25 py-1.5 text-sm focus:outline-none focus:border-brand-500" />
                    <button type="button" onClick={() => addCode(cat)}
                      className="bg-brand-500 text-surface px-4 py-1.5 text-[11px] uppercase tracking-[0.2em]">Add</button>
                    <button type="button" onClick={() => { setAddingFor(null); setNewCode(''); }}
                      className="px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-ink/60">Cancel</button>
                  </div>
                )}

                {codes.length === 0 && addingFor !== cat.slug && <p className="text-sm text-ink/50">No codes yet.</p>}

                <ul className="flex flex-col gap-1">
                  {codes.map((fam) => {
                    const { count, series } = factsFor(cat, fam.code);
                    return (
                      <li key={fam.id} className={`flex items-center gap-3 text-sm border-b border-ink/5 py-1.5 ${fam.is_active ? '' : 'opacity-60'}`}>
                        {fam.image_url ? (
                          <img src={fam.image_url} alt="" className="w-9 h-9 object-contain bg-surface-alt border border-ink/10 shrink-0" />
                        ) : (
                          <div className="w-9 h-9 bg-surface-alt border border-ink/10 shrink-0 flex items-center justify-center text-[9px] text-ink/30">None</div>
                        )}
                        <span className="font-mono">{fam.code}</span>
                        <span className="flex-1 text-ink/55 text-[12px] truncate">{series ?? '—'}</span>
                        <span className="font-mono text-[10px] text-ink/45">{count} prod</span>
                        {!fam.is_active && <span className="text-[10px] uppercase tracking-[0.2em] text-ink/45">hidden</span>}
                        <button type="button" onClick={() => { setAssignTarget(fam); setAssignError(null); }} className="text-[11px] text-brand-500 uppercase tracking-[0.15em]">Allocate image</button>
                        <button type="button" onClick={() => renameCode(cat, fam)} className="text-[11px] text-brand-500 uppercase tracking-[0.15em]">Rename</button>
                        <button type="button" onClick={() => toggleCode(fam)} className="text-[11px] text-ink/60 uppercase tracking-[0.15em]">{fam.is_active ? 'Hide' : 'Show'}</button>
                        <button type="button" onClick={() => deleteCode(cat, fam)} className="text-red-600" aria-label={`Delete ${fam.code}`}>×</button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* Modal: choose image for a family code */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
          <div className="relative w-full max-w-4xl bg-surface border border-ink/15 shadow-xl">
            <div className="sticky top-0 bg-surface border-b border-ink/10 px-5 py-4 flex items-center justify-between gap-4 z-10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-brand-500 font-semibold mb-0.5">Allocate image</p>
                <p className="text-sm text-ink font-medium">
                  {catForFamily(assignTarget)?.name} · No.{assignTarget.code}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {assignTarget.image_url && (
                  <button type="button" onClick={() => applyImage(null)}
                    className="text-[11px] uppercase tracking-[0.2em] text-red-600 hover:text-red-800 transition-colors duration-200 cursor-pointer">Clear</button>
                )}
                <button type="button" onClick={() => setAssignTarget(null)}
                  className="text-[11px] uppercase tracking-[0.2em] text-ink/60 hover:text-ink transition-colors duration-200 cursor-pointer">Cancel</button>
              </div>
            </div>
            <div className="p-5">
              {assignError && (
                <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-4">{assignError}</p>
              )}
              {images === null ? (
                <p className="text-sm text-ink/60">Loading…</p>
              ) : (
                <LibraryGrid
                  images={images}
                  onPick={(img) => applyImage(img.url)}
                  emptyLabel="No images in the library. Upload some in the Images tab first."
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
