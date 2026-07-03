import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { triggerPublish } from '../../lib/publish';
import { getSubcategories } from '../../lib/categories';
import type { ProductCategory, ProductSubcategory } from '../../lib/categories';
import type { ProductFamily, CodeFacts, ProductFactRow } from '../../lib/families';
import { buildCodeFacts } from '../../lib/families';
import { LibraryGrid, type ProductImage } from './ImageLibraryGrid';
import { planConfigSlugRemap, applyConfigSlugRemap } from '../../lib/remap-config-slugs';
import {
  MAX_FAMILY_IMAGES, orderFamilyImages, addFamilyImage,
  removeFamilyImage, setPrimaryFamilyImage, moveFamilyImage, type FamilyImageRow,
} from '../../lib/family-images';

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export default function FamiliesTab() {
  const [cats, setCats] = useState<ProductCategory[] | null>(null);
  const [subcats, setSubcats] = useState<ProductSubcategory[]>([]);
  const [families, setFamilies] = useState<ProductFamily[]>([]);
  const [images, setImages] = useState<ProductImage[] | null>(null);
  // Keyed by `${excelCategoryName}|${code}` — product count + series from products.
  const [facts, setFacts] = useState<Record<string, CodeFacts>>({});
  const [error, setError] = useState<string | null>(null);

  const [addingFor, setAddingFor] = useState<string | null>(null);   // category slug
  const [newCode, setNewCode] = useState('');
  const [assignTarget, setAssignTarget] = useState<ProductFamily | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  // Ordered image URLs for the family open in the manager modal.
  const [assignImages, setAssignImages] = useState<string[]>([]);
  // True while the family's current images are being fetched — guards against
  // clicks on the (already-mounted) library grid racing the fetch and wiping
  // out images that haven't loaded into assignImages yet.
  const [imagesLoading, setImagesLoading] = useState(false);
  // family_id → image count, for the row badge.
  const [imageCounts, setImageCounts] = useState<Record<string, number>>({});

  // Country-group coverage per family (drives the public catalog's country
  // gating). Group codes come from product_groups; coverage counts how many of
  // the family's products belong to each group.
  const [groupCodes, setGroupCodes] = useState<string[]>([]);
  const [groupCountries, setGroupCountries] = useState<Record<string, string>>({});
  const [famProducts, setFamProducts] = useState<Record<string, string[]>>({});
  const [groupCover, setGroupCover] = useState<Record<string, Record<string, number>>>({});
  const [busyGroup, setBusyGroup] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const [
      { data: c, error: cErr }, { data: f, error: fErr }, { data: imgs, error: iErr },
      { data: grps, error: gErr }, { data: gcRows, error: gcErr },
    ] = await Promise.all([
      supabase.from('product_categories').select('*').order('sort_order'),
      supabase.from('product_families').select('*').order('category_slug').order('sort_order'),
      supabase.from('product_images').select('*').order('created_at', { ascending: false }),
      supabase.from('product_groups').select('code').order('sort_order'),
      supabase.from('group_countries').select('group_code, country').order('group_code').order('country'),
    ]);
    if (cErr || fErr || iErr || gErr || gcErr) return setError((cErr ?? fErr ?? iErr ?? gErr ?? gcErr)!.message);
    setCats((c ?? []) as ProductCategory[]);
    setFamilies((f ?? []) as ProductFamily[]);
    setImages((imgs ?? []) as ProductImage[]);
    setGroupCodes(((grps ?? []) as { code: string }[]).map((g) => g.code));
    const gcMap: Record<string, string> = {};
    for (const r of (gcRows ?? []) as { group_code: string; country: string }[]) {
      gcMap[r.group_code] = gcMap[r.group_code] ? `${gcMap[r.group_code]}, ${r.country}` : r.country;
    }
    setGroupCountries(gcMap);
    setSubcats(await getSubcategories({ includeHidden: true }));   // for series order + grouping

    // product-derived counts + series (paginated past the 1000-row cap)
    const PAGE = 1000;
    const rows: ProductFactRow[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data } = await supabase.from('products')
        .select('code, category_name, sub_category, family_code, configuration')
        .order('code').range(from, from + PAGE - 1);
      if (!data || data.length === 0) break;
      rows.push(...(data as ProductFactRow[]));
      if (data.length < PAGE) break;
    }
    const { facts: fx, codesByFam } = buildCodeFacts(rows);
    setFacts(fx);
    setFamProducts(codesByFam);

    // Memberships (paginated; PK order keeps the pages stable).
    const memb: { product_code: string; group_code: string }[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data } = await supabase.from('product_group_memberships')
        .select('product_code, group_code')
        .order('product_code').order('group_code').range(from, from + PAGE - 1);
      if (!data || data.length === 0) break;
      memb.push(...(data as { product_code: string; group_code: string }[]));
      if (data.length < PAGE) break;
    }
    const groupsByProduct = new Map<string, Set<string>>();
    for (const m of memb) {
      const s = groupsByProduct.get(m.product_code) ?? new Set<string>();
      s.add(m.group_code);
      groupsByProduct.set(m.product_code, s);
    }
    const cover: Record<string, Record<string, number>> = {};
    for (const [k, codes] of Object.entries(codesByFam)) {
      const per: Record<string, number> = {};
      for (const code of codes) {
        for (const g of groupsByProduct.get(code) ?? []) per[g] = (per[g] ?? 0) + 1;
      }
      cover[k] = per;
    }
    setGroupCover(cover);

    // Image counts per family (for the row badge).
    const { data: imgRows } = await supabase
      .from('product_family_images').select('family_id');
    const counts: Record<string, number> = {};
    for (const r of (imgRows ?? []) as { family_id: string }[]) {
      counts[r.family_id] = (counts[r.family_id] ?? 0) + 1;
    }
    setImageCounts(counts);
  };

  useEffect(() => { load(); }, []);

  const excelName = (cat: ProductCategory) => cat.product_category_name;
  const factsFor = (cat: ProductCategory, code: string): CodeFacts =>
    (excelName(cat) ? facts[`${excelName(cat)}|${code}`] : undefined) ??
    { count: 0, configuration: null, series: [], perSeries: new Map() };
  const famKey = (cat: ProductCategory, code: string) => `${excelName(cat)}|${code}`;

  // ── mutations ──────────────────────────────────────────────────────────────

  /** Tick/untick a country group for a whole family: applies the membership to
   *  every product in the family. Full coverage → remove the market; partial or
   *  none → make it full. */
  const toggleFamilyGroup = async (cat: ProductCategory, fam: ProductFamily, g: string) => {
    const key = famKey(cat, fam.code);
    const codes = famProducts[key] ?? [];
    if (!codes.length) return;
    const busyKey = `${key}|${g}`;
    setBusyGroup(busyKey);
    setError(null);
    try {
      const covered = groupCover[key]?.[g] ?? 0;
      if (covered === codes.length) {
        for (const part of chunk(codes, 500)) {
          const { error: err } = await supabase.from('product_group_memberships')
            .delete().in('product_code', part).eq('group_code', g);
          if (err) throw new Error(err.message);
        }
      } else {
        const rows = codes.map((code) => ({ product_code: code, group_code: g }));
        for (const part of chunk(rows, 500)) {
          const { error: err } = await supabase.from('product_group_memberships')
            .upsert(part, { onConflict: 'product_code,group_code', ignoreDuplicates: true });
          if (err) throw new Error(err.message);
        }
      }
      await load();
      triggerPublish();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Updating country groups failed.');
    } finally {
      setBusyGroup(null);
    }
  };

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
      // Keep product_configurations translations attached after the slug changes.
      const { data: affected } = await supabase.from('products')
        .select('sub_category, family_code, code')
        .eq('category_name', excel).eq('family_code', code); // already renamed to `code`
      const plan = planConfigSlugRemap(
        (affected ?? []).map((r) => ({ ...r, family_code: fam.code })), // old ref for slug-from
        { kind: 'family', from: fam.code, to: code },
      );
      const remapErr = await applyConfigSlugRemap(cat.slug, plan);
      if (remapErr) return setError(`Code renamed, but updating translations failed: ${remapErr}`);
    }
    await load(); triggerPublish();
  };

  const toggleCode = async (fam: ProductFamily) => {
    const { error: err } = await supabase.from('product_families')
      .update({ is_active: !fam.is_active }).eq('id', fam.id);
    if (err) return setError(err.message);
    await load(); triggerPublish();
  };

  // Set the display order of a family code within its series (drives the live
  // catalog card order). No-op when unchanged or not a number.
  const setOrder = async (fam: ProductFamily, value: string) => {
    const n = Math.trunc(Number(value));
    if (!Number.isFinite(n) || n === fam.sort_order) return;
    const { error: err } = await supabase.from('product_families')
      .update({ sort_order: n }).eq('id', fam.id);
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

  // ── image management ─────────────────────────────────────────────────────

  const catForFamily = (fam: ProductFamily | null) =>
    fam ? (cats ?? []).find((c) => c.slug === fam.category_slug) ?? null : null;

  // Open the manager: load the family's current images (ordered). Guarded by
  // imagesLoading so the library grid (already interactive from page mount)
  // can't be clicked mid-fetch and persist a truncated list.
  const openImageManager = async (fam: ProductFamily) => {
    setAssignTarget(fam);
    setAssignError(null);
    setAssignImages([]);
    setImagesLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_family_images').select('id, family_id, url, sort_order')
        .eq('family_id', fam.id);
      if (error) return setAssignError(error.message);
      setAssignImages(orderFamilyImages((data ?? []) as FamilyImageRow[]));
    } finally {
      setImagesLoading(false);
    }
  };

  // On any persist failure, re-sync the modal + row badges to the DB's actual
  // state (a partial delete/insert can diverge from the optimistic list).
  const failResync = async (fam: ProductFamily, message: string) => {
    setAssignError(message);
    const { data } = await supabase
      .from('product_family_images').select('id, family_id, url, sort_order')
      .eq('family_id', fam.id);
    setAssignImages(orderFamilyImages((data ?? []) as FamilyImageRow[]));
    await load();
  };

  // Persist the whole ordered list: rewrite the family's rows, then mirror the
  // primary onto product_families.image_url + every member product.image_url.
  const persistImages = async (fam: ProductFamily, list: string[]) => {
    setAssignError(null);
    const { error: delErr } = await supabase
      .from('product_family_images').delete().eq('family_id', fam.id);
    if (delErr) return failResync(fam, delErr.message);
    if (list.length) {
      const rows = list.map((url, i) => ({ family_id: fam.id, url, sort_order: i }));
      const { error: insErr } = await supabase.from('product_family_images').insert(rows);
      if (insErr) return failResync(fam, insErr.message);
    }
    const primary = list[0] ?? null;
    const { error: e1 } = await supabase
      .from('product_families').update({ image_url: primary }).eq('id', fam.id);
    if (e1) return failResync(fam, e1.message);
    const excel = catForFamily(fam)?.product_category_name ?? null;
    if (excel) {
      const { error: e2 } = await supabase.from('products')
        .update({ image_url: primary }).eq('category_name', excel).eq('family_code', fam.code);
      if (e2) return failResync(fam, `Images saved, but updating products failed: ${e2.message}`);
    }
    await load(); triggerPublish();
  };

  // Apply a pure mutation, update local state, then persist. Safety net: while
  // the family's images are still loading, assignImages may not yet reflect
  // the DB — bail out so a stray click can't persist a truncated list.
  const mutateImages = async (fam: ProductFamily, next: string[]) => {
    if (imagesLoading) return;
    setAssignImages(next);
    await persistImages(fam, next);
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-6">{error}</p>}

      <p className="text-sm text-ink/60 mb-6 max-w-2xl">
        Each category is a <strong>family</strong>; the codes below (e.g. 330, 330A, 330T) are its
        <strong> family codes</strong>. Add a code to make it selectable in the product form, and
        allocate it an image — the image applies to every product in that code and stays in the
        Images library. The <strong>country-group checkboxes</strong> control which markets see the
        family on the website: ticking a group applies it to every product in the code, unticking
        removes it. A dash means only some of the family's products carry that group.
      </p>

      {cats === null && <p className="text-sm text-ink/60">Loading…</p>}
      {cats !== null && (
        <div className="space-y-6">
          {cats.map((cat) => {
            const codes = families.filter((f) => f.category_slug === cat.slug);
            // Group family codes under EACH (product-derived) series they have
            // products in — a code with SKUs in two series (e.g. its A/M/Z code
            // variants) appears under both. No products yet → the null bucket.
            const bySeries = new Map<string | null, ProductFamily[]>();
            for (const fam of codes) {
              const seriesList = factsFor(cat, fam.code).series;
              for (const s of seriesList.length ? seriesList : [null]) {
                const arr = bySeries.get(s) ?? []; arr.push(fam); bySeries.set(s, arr);
              }
            }
            const overlay = subcats.filter((s) => s.category_slug === cat.slug);
            const byName = new Map(overlay.map((s) => [s.name, s]));
            const presentSeries = [...bySeries.keys()].filter((s): s is string => !!s);
            // Admin view: keep hidden series rendered too (otherwise their family
            // codes silently disappear). Sort by overlay order; hidden series sink
            // to the bottom and carry a chip so the admin can spot them.
            const orderedSeries = presentSeries
              .map((name, i) => ({ name, i, o: byName.get(name) }))
              .sort((a, b) => {
                const aHidden = a.o ? !a.o.is_active : false;
                const bHidden = b.o ? !b.o.is_active : false;
                if (aHidden !== bHidden) return aHidden ? 1 : -1;
                const oa = a.o?.sort_order; const ob = b.o?.sort_order;
                if (oa == null && ob == null) return a.i - b.i;
                if (oa == null) return 1;
                if (ob == null) return -1;
                return oa - ob;
              });
            const sortFams = (arr: ProductFamily[]) =>
              [...arr].sort((a, b) => a.sort_order - b.sort_order || a.code.localeCompare(b.code));
            const groups: { series: string | null; fams: ProductFamily[]; hidden: boolean }[] = [
              ...orderedSeries.map(({ name, o }) => ({
                series: name as string | null,
                fams: sortFams(bySeries.get(name) ?? []),
                hidden: o ? !o.is_active : false,
              })),
              ...(bySeries.has(null) ? [{ series: null, fams: sortFams(bySeries.get(null) ?? []), hidden: false }] : []),
            ];
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

                {groups.map(({ series, fams, hidden }) => (
                  <div key={series ?? '__none'} className="mb-4 last:mb-0">
                    <p className="text-[11px] font-semibold text-ink/70 border-b border-ink/10 pb-1 mb-1.5">
                      {series ?? '— No series yet'}
                      <span className="ml-2 font-normal text-ink/40">{fams.length}</span>
                      {hidden && <span className="ml-2 inline-block px-1.5 py-0.5 text-[9px] font-normal uppercase tracking-[0.15em] bg-ink/[0.08] text-ink/55 rounded">hidden series</span>}
                    </p>
                    <ul className="flex flex-col gap-1">
                      {fams.map((fam) => {
                        // Show the count + configuration name for THIS series (the
                        // code may also have products under another series' heading).
                        const f = factsFor(cat, fam.code);
                        const sf = series ? f.perSeries.get(series) : undefined;
                        const count = sf?.count ?? f.count;
                        const configuration = sf?.configuration ?? f.configuration;
                        return (
                          <li key={fam.id} className={`flex items-center gap-3 text-sm border-b border-ink/5 py-1.5 ${fam.is_active ? '' : 'opacity-60'}`}>
                            <label className="flex items-center gap-1 shrink-0" title="Display order within this series (lower shows first)">
                              <span className="text-[9px] uppercase tracking-[0.15em] text-ink/40">Order</span>
                              <input
                                key={fam.sort_order}
                                type="number"
                                defaultValue={fam.sort_order}
                                onBlur={(e) => setOrder(fam, e.currentTarget.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                                className="w-14 bg-transparent border-b border-ink/25 py-1 text-sm text-center focus:outline-none focus:border-brand-500" />
                            </label>
                            {fam.image_url ? (
                              <div className="relative w-9 h-9 shrink-0">
                                <img src={fam.image_url} alt="" className="w-9 h-9 object-contain bg-surface-alt border border-ink/10" />
                                {(imageCounts[fam.id] ?? 0) > 1 && (
                                  <span className="absolute -top-1 -right-1 bg-brand-500 text-surface text-[9px] leading-none px-1 py-0.5 rounded-full">{imageCounts[fam.id]}</span>
                                )}
                              </div>
                            ) : (
                              <div className="w-9 h-9 bg-surface-alt border border-ink/10 shrink-0 flex items-center justify-center text-[9px] text-ink/30">None</div>
                            )}
                            <span className="font-mono w-16 shrink-0">{fam.code}</span>
                            {/* Configuration (English) — display only. */}
                            <span className="flex-1 min-w-0 truncate text-ink/70" title={configuration ?? undefined}>{configuration ?? '—'}</span>
                            <span className="flex items-center gap-1.5 shrink-0" aria-label={`Country groups for ${fam.code}`}>
                              {groupCodes.map((g) => {
                                const key = famKey(cat, fam.code);
                                const total = (famProducts[key] ?? []).length;
                                const covered = groupCover[key]?.[g] ?? 0;
                                const all = total > 0 && covered === total;
                                const some = covered > 0 && !all;
                                const saving = busyGroup === `${key}|${g}`;
                                return (
                                  <label
                                    key={g}
                                    title={`Group ${g}${groupCountries[g] ? ` — ${groupCountries[g]}` : ''}${some ? ` (${covered}/${total} products)` : ''}`}
                                    className={`flex items-center gap-0.5 ${total === 0 ? 'opacity-40' : 'cursor-pointer'}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={all}
                                      ref={(el) => { if (el) el.indeterminate = some; }}
                                      disabled={total === 0 || saving}
                                      onChange={() => toggleFamilyGroup(cat, fam, g)}
                                      className="accent-brand-500"
                                    />
                                    <span className="text-[9px] uppercase text-ink/50">{g}</span>
                                  </label>
                                );
                              })}
                            </span>
                            <span className="font-mono text-[10px] text-ink/45">{count} prod</span>
                            {!fam.is_active && <span className="text-[10px] uppercase tracking-[0.2em] text-ink/45">hidden</span>}
                            <button type="button" onClick={() => openImageManager(fam)} className="text-[11px] text-brand-500 uppercase tracking-[0.15em]">Manage images</button>
                            <button type="button" onClick={() => renameCode(cat, fam)} className="text-[11px] text-brand-500 uppercase tracking-[0.15em]">Rename</button>
                            <button type="button" onClick={() => toggleCode(fam)} className="text-[11px] text-ink/60 uppercase tracking-[0.15em]">{fam.is_active ? 'Hide' : 'Show'}</button>
                            <button type="button" onClick={() => deleteCode(cat, fam)} className="text-red-600" aria-label={`Delete ${fam.code}`}>×</button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </section>
            );
          })}
        </div>
      )}

      {/* Modal: manage images for a family code */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
          <div className="relative w-full max-w-4xl bg-surface border border-ink/15 shadow-xl">
            <div className="sticky top-0 bg-surface border-b border-ink/10 px-5 py-4 flex items-center justify-between gap-4 z-10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-brand-500 font-semibold mb-0.5">Manage images</p>
                <p className="text-sm text-ink font-medium">
                  {catForFamily(assignTarget)?.name} · No.{assignTarget.code}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setAssignTarget(null)}
                  className="text-[11px] uppercase tracking-[0.2em] text-ink/60 hover:text-ink transition-colors duration-200 cursor-pointer">Cancel</button>
              </div>
            </div>
            <div className="p-5">
              {assignError && (
                <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mb-4">{assignError}</p>
              )}

              {imagesLoading ? (
                <p className="text-sm text-ink/60">Loading…</p>
              ) : (
                <>
                  {/* Selected images, in order — first is the primary. */}
                  <p className="text-[10px] uppercase tracking-[0.25em] text-ink/45 mb-2">
                    Selected ({assignImages.length}/{MAX_FAMILY_IMAGES}) — first is primary
                  </p>
                  {assignImages.length === 0 ? (
                    <p className="text-sm text-ink/50 mb-4">No images yet. Pick from the library below.</p>
                  ) : (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {assignImages.map((url, i) => (
                        <div key={url} className="relative w-24">
                          <div className="aspect-square bg-surface-alt border border-ink/10 overflow-hidden flex items-center justify-center">
                            <img src={url} alt="" className="w-full h-full object-contain" />
                          </div>
                          {i === 0 && (
                            <span className="absolute top-1 left-1 bg-brand-500 text-surface text-[9px] uppercase tracking-[0.15em] px-1 py-0.5">Primary</span>
                          )}
                          <div className="flex items-center justify-between mt-1 text-[11px]">
                            <button type="button" aria-label="Move left" disabled={i === 0}
                              onClick={() => assignTarget && mutateImages(assignTarget, moveFamilyImage(assignImages, i, 'left'))}
                              className="px-1 text-ink/60 disabled:opacity-30">←</button>
                            {i !== 0 && (
                              <button type="button"
                                onClick={() => assignTarget && mutateImages(assignTarget, setPrimaryFamilyImage(assignImages, i))}
                                className="text-brand-500 uppercase tracking-[0.1em]">★</button>
                            )}
                            <button type="button" aria-label="Remove"
                              onClick={() => assignTarget && mutateImages(assignTarget, removeFamilyImage(assignImages, i))}
                              className="px-1 text-red-600">×</button>
                            <button type="button" aria-label="Move right" disabled={i === assignImages.length - 1}
                              onClick={() => assignTarget && mutateImages(assignTarget, moveFamilyImage(assignImages, i, 'right'))}
                              className="px-1 text-ink/60 disabled:opacity-30">→</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add from the library (disabled when full). */}
                  <p className="text-[10px] uppercase tracking-[0.25em] text-ink/45 mb-2">
                    {assignImages.length >= MAX_FAMILY_IMAGES ? 'Maximum reached — remove one to add another' : 'Add from library'}
                  </p>
                  {images === null ? (
                    <p className="text-sm text-ink/60">Loading…</p>
                  ) : assignImages.length >= MAX_FAMILY_IMAGES ? null : (
                    <LibraryGrid
                      images={images}
                      onPick={(img) => assignTarget && mutateImages(assignTarget, addFamilyImage(assignImages, img.url))}
                      emptyLabel="No images in the library. Upload some in the Images tab first."
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
