import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import { triggerPublish } from '../../lib/publish';
import { validateProductDraft } from '../../lib/products';
import { PRODUCT_COLUMNS, productToRow, rowToDraft, templateExampleRow, findDuplicateCodes, normalizeHeaderRow, HEADER_ROW, type ProductRow } from '../../lib/product-xlsx';
import { configKey } from '../../lib/product-configurations';
import type { ProductConfiguration, ConfigTranslations } from '../../lib/product-configurations';
import { cleanI18n } from '../../lib/categories';
import type { Product, ProductDraft } from '../../types/product';

const PAGE = 1000;
const CHUNK = 500;
const HEADER = PRODUCT_COLUMNS as unknown as string[];

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

/** Build a worksheet from machine-key rows, then relabel the header row with the
 *  human-friendly column names (the sheet shows friendly headers; import accepts both). */
function buildSheet(rows: ProductRow[]): XLSX.WorkSheet {
  const ws = XLSX.utils.json_to_sheet(rows, { header: HEADER });
  XLSX.utils.sheet_add_aoa(ws, [HEADER_ROW], { origin: 'A1' });
  return ws;
}

type CategoryRow = { slug: string; product_category_name: string | null; name_i18n: Record<string, string> | null };
type SubcatRow = { category_slug: string; name: string; name_i18n: Record<string, string> | null };

/** All categories (for product_category_name → slug + existing name_i18n). */
async function loadCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase.from('product_categories').select('slug, product_category_name, name_i18n');
  if (error) throw new Error(error.message);
  return (data ?? []) as CategoryRow[];
}

/** category_name (Excel value) → category slug. */
function slugByNameFrom(cats: CategoryRow[]): Map<string, string> {
  return new Map(cats.filter((c) => c.product_category_name).map((c) => [c.product_category_name as string, c.slug]));
}

type Result = { total: number; ok: number; failed: number; errors: string[] } | null;

export default function ProductBulkBar({ onChanged }: { onChanged: () => void }) {
  const [busy, setBusy] = useState<null | 'import' | 'export'>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, buildSheet([templateExampleRow()]), 'Products');
    XLSX.writeFile(wb, 'product-import-template.xlsx');
  };

  const exportAll = async () => {
    setBusy('export'); setError(null); setResult(null);
    try {
      const products: Product[] = [];
      for (let from = 0; ; from += PAGE) {
        const { data, error: e } = await supabase.from('products').select('*').order('sort_order').range(from, from + PAGE - 1);
        if (e) throw new Error(e.message);
        if (!data || data.length === 0) break;
        products.push(...(data as Product[]));
        if (data.length < PAGE) break;
      }
      const byCode = new Map<string, string[]>();
      for (let from = 0; ; from += PAGE) {
        const { data, error: e } = await supabase.from('product_group_memberships').select('product_code, group_code').order('product_code').range(from, from + PAGE - 1);
        if (e) throw new Error(e.message);
        if (!data || data.length === 0) break;
        for (const m of data as { product_code: string; group_code: string }[]) {
          const arr = byCode.get(m.product_code) ?? [];
          arr.push(m.group_code); byCode.set(m.product_code, arr);
        }
        if (data.length < PAGE) break;
      }
      // Configuration-level translations, keyed like the URL resolver.
      const cfgRows: ProductConfiguration[] = [];
      for (let from = 0; ; from += PAGE) {
        const { data, error: e } = await supabase.from('product_configurations').select('*').order('category_slug').range(from, from + PAGE - 1);
        if (e) throw new Error(e.message);
        if (!data || data.length === 0) break;
        cfgRows.push(...(data as ProductConfiguration[]));
        if (data.length < PAGE) break;
      }
      const configByKey = new Map(cfgRows.map((c) => [`${c.category_slug}/${c.config_slug}`, c]));
      const cats = await loadCategories();
      const slugByName = slugByNameFrom(cats);
      // Category name translations keyed by Excel name; series translations keyed by slug|name.
      const catI18nByName = new Map(cats.filter((c) => c.product_category_name)
        .map((c) => [c.product_category_name as string, c.name_i18n ?? {}]));
      const subcats: SubcatRow[] = [];
      for (let from = 0; ; from += PAGE) {
        const { data, error: e } = await supabase.from('product_subcategories').select('category_slug, name, name_i18n').range(from, from + PAGE - 1);
        if (e) throw new Error(e.message);
        if (!data || data.length === 0) break;
        subcats.push(...(data as SubcatRow[]));
        if (data.length < PAGE) break;
      }
      const subI18nByKey = new Map(subcats.map((s) => [`${s.category_slug}|${s.name}`, s.name_i18n ?? {}]));
      const rows = products.map((p) => {
        const cat = p.category_name ? slugByName.get(p.category_name) : undefined;
        const key = cat ? configKey({ category_slug: cat, sub_category: p.sub_category, family_code: p.family_code, code: p.code }) : null;
        const rec = key ? configByKey.get(`${key.category_slug}/${key.config_slug}`) ?? null : null;
        const catI18n = p.category_name ? catI18nByName.get(p.category_name) ?? null : null;
        const subI18n = cat && p.sub_category ? subI18nByKey.get(`${cat}|${p.sub_category}`) ?? null : null;
        return productToRow(p, (byCode.get(p.code) ?? []).sort(), rec, catI18n, subI18n);
      });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, buildSheet(rows), 'Products');
      XLSX.writeFile(wb, `products-export-${products.length}.xlsx`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed.');
    } finally { setBusy(null); }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (fileRef.current) fileRef.current.value = '';
    if (!file) return;
    setBusy('import'); setError(null); setResult(null);
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      // Accept BOTH the new friendly-header template and legacy machine-key files.
      const rows = XLSX.utils.sheet_to_json<ProductRow>(sheet, { defval: '' }).map(normalizeHeaderRow);
      const errors: string[] = [];
      const valid: {
        draft: Omit<ProductDraft, 'sort_order'>; groups: string[]; translations: ConfigTranslations | null;
        categoryI18n: Record<string, string>; subCategoryI18n: Record<string, string>;
      }[] = [];
      rows.forEach((row, i) => {
        const { draft, groups, translations, categoryI18n, subCategoryI18n, error: rowErr } = rowToDraft(row);
        if (rowErr || !draft) { errors.push(`Row ${i + 2}: ${rowErr ?? 'invalid row'}`); return; }
        const vMsg = validateProductDraft(draft);
        if (vMsg) { errors.push(`Row ${i + 2} (${draft.code}): ${vMsg}`); return; }
        valid.push({ draft, groups, translations, categoryI18n, subCategoryI18n });
      });

      // Upsert products in chunks; on a chunk failure, retry that chunk row-by-row
      // so one bad row doesn't reject the whole batch.
      const okCodes: string[] = [];
      for (const part of chunk(valid, CHUNK)) {
        const { error: upErr } = await supabase.from('products').upsert(part.map((v) => v.draft), { onConflict: 'code' });
        if (!upErr) { okCodes.push(...part.map((v) => v.draft.code)); continue; }
        for (const v of part) {
          const { error: e2 } = await supabase.from('products').upsert(v.draft, { onConflict: 'code' });
          if (e2) errors.push(`${v.draft.code}: ${e2.message}`); else okCodes.push(v.draft.code);
        }
      }

      // Replace group memberships for the successfully-imported products.
      const okSet = new Set(okCodes);
      for (const part of chunk(okCodes, CHUNK)) {
        await supabase.from('product_group_memberships').delete().in('product_code', part);
      }
      const memberRows = valid
        .filter((v) => okSet.has(v.draft.code))
        .flatMap((v) => v.groups.map((g) => ({ product_code: v.draft.code, group_code: g })));
      for (const part of chunk(memberRows, CHUNK)) {
        if (!part.length) continue;
        const { error: mErr } = await supabase.from('product_group_memberships').insert(part);
        if (mErr) errors.push(`Group memberships: ${mErr.message}`);
      }

      // Translations that depend on the category map (configuration-level, plus
      // category-name and series translations from the new template columns).
      const needsCats = valid.some((v) =>
        v.translations || Object.keys(v.categoryI18n).length || Object.keys(v.subCategoryI18n).length);
      if (needsCats) {
        const cats = await loadCategories();
        const slugByName = slugByNameFrom(cats);

        // 1) Configuration-level translations (display name + per-language), only
        // when the sheet carried those columns. One upsert per configuration.
        if (valid.some((v) => v.translations)) {
          const cfgByKey = new Map<string, ProductConfiguration>();
          for (const v of valid) {
            if (!v.translations) continue;
            const cat = v.draft.category_name ? slugByName.get(v.draft.category_name) : undefined;
            if (!cat) continue;
            const key = configKey({ category_slug: cat, sub_category: v.draft.sub_category, family_code: v.draft.family_code, code: v.draft.code });
            cfgByKey.set(`${key.category_slug}/${key.config_slug}`, {
              category_slug: key.category_slug,
              config_slug: key.config_slug,
              name: v.translations.name.trim() || null,
              description: v.translations.description.trim() || null,
              name_i18n: cleanI18n(v.translations.name_i18n),
              description_i18n: cleanI18n(v.translations.description_i18n),
            });
          }
          for (const part of chunk([...cfgByKey.values()], CHUNK)) {
            if (!part.length) continue;
            const { error: cErr } = await supabase.from('product_configurations').upsert(part, { onConflict: 'category_slug,config_slug' });
            if (cErr) errors.push(`Translations: ${cErr.message}`);
          }
        }

        // 2) Category-name translations → product_categories.name_i18n (merged,
        // existing categories only — categories are created in the Categories tab).
        const catByName = new Map(cats.filter((c) => c.product_category_name).map((c) => [c.product_category_name as string, c]));
        const catTr = new Map<string, Record<string, string>>();
        for (const v of valid) {
          const name = v.draft.category_name;
          if (!name || !Object.keys(v.categoryI18n).length) continue;
          catTr.set(name, { ...(catTr.get(name) ?? {}), ...v.categoryI18n });
        }
        for (const [name, i18n] of catTr) {
          const c = catByName.get(name);
          if (!c) { errors.push(`Category translation skipped — no category "${name}"`); continue; }
          const merged = cleanI18n({ ...(c.name_i18n ?? {}), ...i18n });
          const { error: e2 } = await supabase.from('product_categories').update({ name_i18n: merged }).eq('slug', c.slug);
          if (e2) errors.push(`Category "${name}" translation: ${e2.message}`);
        }

        // 3) Series (sub-category) translations → product_subcategories.name_i18n,
        // upserted by (category_slug, name) and merged non-destructively.
        const subTr = new Map<string, { slug: string; name: string; i18n: Record<string, string> }>();
        for (const v of valid) {
          const name = v.draft.category_name, sub = v.draft.sub_category;
          if (!name || !sub || !Object.keys(v.subCategoryI18n).length) continue;
          const slug = slugByName.get(name);
          if (!slug) { errors.push(`Series translation skipped — no category "${name}"`); continue; }
          const k = `${slug}|${sub}`;
          subTr.set(k, { slug, name: sub, i18n: { ...(subTr.get(k)?.i18n ?? {}), ...v.subCategoryI18n } });
        }
        if (subTr.size) {
          const slugs = [...new Set([...subTr.values()].map((s) => s.slug))];
          const { data: exRows } = await supabase.from('product_subcategories').select('category_slug, name, name_i18n').in('category_slug', slugs);
          const existing = new Map<string, Record<string, string>>();
          for (const r of (exRows ?? []) as SubcatRow[]) existing.set(`${r.category_slug}|${r.name}`, r.name_i18n ?? {});
          const upserts = [...subTr.values()].map((s) => ({
            category_slug: s.slug, name: s.name,
            name_i18n: cleanI18n({ ...(existing.get(`${s.slug}|${s.name}`) ?? {}), ...s.i18n }),
          }));
          for (const part of chunk(upserts, CHUNK)) {
            const { error: e3 } = await supabase.from('product_subcategories').upsert(part, { onConflict: 'category_slug,name' });
            if (e3) errors.push(`Series translations: ${e3.message}`);
          }
        }
      }

      // Record duplicate codes within the uploaded file (the PK collapses stored
      // dupes), then run the full server-side data check so Data Errors is current.
      const dupes = findDuplicateCodes(rows.map((r) => String((r as Record<string, unknown>).code ?? '')));
      await supabase.rpc('record_file_duplicate_codes', { p_codes: dupes });
      await supabase.rpc('run_product_data_checks');

      const ok = okCodes.length;
      setResult({ total: rows.length, ok, failed: rows.length - ok, errors: errors.slice(0, 25) });
      if (ok) { onChanged(); triggerPublish(); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
    } finally { setBusy(null); }
  };

  const btn = 'text-[11px] uppercase tracking-[0.2em] px-4 py-2 border border-ink/15 hover:border-brand-500 hover:text-brand-500 transition-colors duration-200 disabled:opacity-50 cursor-pointer';

  return (
    <div className="border border-ink/10 bg-surface-alt/40 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55 mr-1">Bulk</span>
        <label className={`${btn} ${busy ? 'pointer-events-none opacity-50' : ''}`}>
          {busy === 'import' ? 'Importing…' : '↑ Import Excel'}
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="sr-only" disabled={!!busy} onChange={onFile} />
        </label>
        <button type="button" onClick={exportAll} disabled={!!busy} className={btn}>
          {busy === 'export' ? 'Exporting…' : '↓ Export Excel'}
        </button>
        <button type="button" onClick={downloadTemplate} disabled={!!busy} className={btn}>
          Download template
        </button>
        <span className="text-[11px] text-ink/45">Import matches by <code className="font-mono">code</code> (adds new, updates existing).</span>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2 mt-3">{error}</p>
      )}
      {result && (
        <div className="mt-3 text-sm">
          <p className="text-ink">
            <span className="text-green-700 font-semibold">{result.ok}</span> imported/updated
            {result.failed > 0 && <> · <span className="text-red-700 font-semibold">{result.failed}</span> skipped</>}
            {' '}<span className="text-ink/50">of {result.total} rows</span>
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 max-h-40 overflow-y-auto text-[12px] text-red-700 space-y-0.5">
              {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
              {result.failed > result.errors.length && <li className="text-ink/50">…and more</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
