import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadCataloguePdf, validateCataloguePdf } from '../../lib/catalogues';
import type { Catalogue, CatalogueDraft } from '../../types/catalogue';

const GROUP_CODES = ['A', 'B', 'C', 'D', 'E'] as const;
type GroupCode = typeof GROUP_CODES[number];
type Slot = 'black' | 'blue';

type Props = {
  /** Top-level categories available as parents. */
  categories: Catalogue[];
  /** Preselected parent for a new subcategory; null = top-level category. */
  defaultParentId?: string | null;
  initialSortOrder: number;
  initial?: Catalogue;
  onSaved: () => void;
  onCancel: () => void;
};

function emptyDraft(parentId: string | null, sortOrder: number): CatalogueDraft {
  return {
    parent_id: parentId, name: '', description: null, pdf_url: null,
    pdf_url_black: null, pdf_url_blue: null,
    groups_black: [], groups_blue: [],
    category_slug: null, product_sub_category: null,
    sort_order: sortOrder, is_active: true,
  };
}

function toDraft(c: Catalogue): CatalogueDraft {
  const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = c;
  return rest;
}

export default function CatalogueForm({
  categories, defaultParentId = null, initialSortOrder, initial, onSaved, onCancel,
}: Props) {
  const [draft, setDraft] = useState<CatalogueDraft>(() =>
    initial ? toDraft(initial) : emptyDraft(defaultParentId, initialSortOrder));
  const [pendingBlack, setPendingBlack] = useState<File | null>(null);
  const [pendingBlue, setPendingBlue] = useState<File | null>(null);
  const blackInputRef = useRef<HTMLInputElement | null>(null);
  const blueInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof CatalogueDraft>(key: K, value: CatalogueDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const [productCategories, setProductCategories] = useState<{ slug: string; name: string }[]>([]);
  const [productSeries, setProductSeries] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    supabase.from('product_categories').select('slug, name').order('name')
      .then(({ data }) => {
        if (cancelled) return;
        setProductCategories((data ?? []) as { slug: string; name: string }[]);
      });
    return () => { cancelled = true; };
  }, []);

  // Subcategory rows: series dropdown is scoped to the parent's linked category.
  useEffect(() => {
    if (!draft.parent_id) { setProductSeries([]); return; }
    const parent = categories.find((c) => c.id === draft.parent_id);
    const parentSlug = parent?.category_slug ?? null;
    if (!parentSlug) { setProductSeries([]); return; }
    const parentName = productCategories.find((c) => c.slug === parentSlug)?.name;
    // products.category_name is the Excel name; product_categories.product_category_name
    // is the mapping. The simplest path: fetch all distinct sub_category for the parent slug.
    let cancelled = false;
    supabase.from('product_categories').select('product_category_name').eq('slug', parentSlug).single()
      .then(({ data }) => {
        const excel = (data?.product_category_name ?? parentName) as string | null;
        if (!excel) { setProductSeries([]); return; }
        return supabase.from('products').select('sub_category').eq('category_name', excel)
          .then(({ data: rows }) => {
            if (cancelled) return;
            const set = new Set<string>();
            for (const r of (rows ?? []) as { sub_category: string | null }[]) {
              if (r.sub_category) set.add(r.sub_category);
            }
            setProductSeries([...set].sort());
          });
      });
    return () => { cancelled = true; };
  }, [draft.parent_id, categories, productCategories]);

  const onPdfChange = (slot: Slot) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const problem = validateCataloguePdf(f);
    if (problem) { setError(problem); e.target.value = ''; return; }
    if (slot === 'black') setPendingBlack(f); else setPendingBlue(f);
  };

  const toggleGroup = (slot: Slot, code: GroupCode) => {
    const key = slot === 'black' ? 'groups_black' : 'groups_blue';
    const current = (draft[key] ?? []) as string[];
    const next = current.includes(code) ? current.filter((c) => c !== code) : [...current, code];
    update(key, next.sort());
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const black = (draft.groups_black ?? []) as string[];
    const blue = (draft.groups_blue ?? []) as string[];
    const blackUrl = draft.pdf_url_black?.trim() || null;
    const blueUrl = draft.pdf_url_blue?.trim() || null;

    if (black.length && !blackUrl && !pendingBlack) {
      setError('Pick a PDF for the Black slot, or clear its country groups.');
      return;
    }
    if (blue.length && !blueUrl && !pendingBlue) {
      setError('Pick a PDF for the Blue slot, or clear its country groups.');
      return;
    }
    const isSub = Boolean(draft.parent_id);
    if (!isSub && draft.category_slug && !productCategories.some((c) => c.slug === draft.category_slug)) {
      setError('Linked product category no longer exists. Pick another.');
      return;
    }
    // Soft warning (does not block submit): overlapping group → Black wins.
    const overlap = black.filter((g) => blue.includes(g));
    if (overlap.length && !window.confirm(
      `Country group${overlap.length > 1 ? 's' : ''} ${overlap.join(', ')} appear in both slots. Black will win for those groups. Save anyway?`
    )) return;

    setSubmitting(true);
    try {
      const payload: CatalogueDraft = {
        ...draft,
        name: draft.name.trim(),
        description: draft.description?.trim() || null,
        pdf_url: draft.pdf_url?.trim() || null,
        pdf_url_black: blackUrl,
        pdf_url_blue: blueUrl,
        groups_black: black,
        groups_blue: blue,
        category_slug: draft.category_slug?.trim() || null,
        product_sub_category: draft.product_sub_category?.trim() || null,
        parent_id: draft.parent_id || null,
      };
      if (!payload.name) throw new Error('Name is required.');

      // Step 1: create/update the row first — uploads are namespaced by row id.
      let cat: Catalogue;
      if (initial) {
        const { data, error: err } = await supabase
          .from('catalogues').update(payload).eq('id', initial.id).select().single();
        if (err) throw err;
        cat = data as Catalogue;
      } else {
        const { data, error: err } = await supabase
          .from('catalogues').insert(payload).select().single();
        if (err) throw err;
        cat = data as Catalogue;
      }

      // Step 2: upload any pending PDFs and patch their URLs.
      const patch: Partial<CatalogueDraft> = {};
      if (pendingBlack) {
        const { url } = await uploadCataloguePdf(pendingBlack, cat.id, 'black');
        patch.pdf_url_black = url;
      }
      if (pendingBlue) {
        const { url } = await uploadCataloguePdf(pendingBlue, cat.id, 'blue');
        patch.pdf_url_blue = url;
      }
      if (Object.keys(patch).length) {
        const { error: err } = await supabase
          .from('catalogues').update(patch).eq('id', cat.id);
        if (err) throw err;
      }
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const isSub = Boolean(draft.parent_id);

  const renderPdfBlock = (slot: Slot) => {
    const urlKey = slot === 'black' ? 'pdf_url_black' : 'pdf_url_blue';
    const groupsKey = slot === 'black' ? 'groups_black' : 'groups_blue';
    const url = draft[urlKey];
    const groups = (draft[groupsKey] ?? []) as string[];
    const pending = slot === 'black' ? pendingBlack : pendingBlue;
    const ref = slot === 'black' ? blackInputRef : blueInputRef;
    const label = slot === 'black' ? 'Black PDF' : 'Blue PDF';
    return (
      <fieldset className="border border-ink/15 p-4 space-y-3">
        <legend className="px-1 text-[10px] uppercase tracking-[0.25em] text-ink/55">{label}</legend>
        <div className="space-y-2">
          <input
            ref={ref}
            type="file"
            accept="application/pdf"
            onChange={onPdfChange(slot)}
            className="text-sm text-ink/80"
          />
          {pending && <p className="text-[11px] text-ink/60">Will upload: {pending.name}</p>}
          <input
            type="url"
            value={url ?? ''}
            placeholder="https://… (paste an existing PDF URL)"
            onChange={(e) => update(urlKey, e.currentTarget.value || null)}
            className={inputClass}
          />
          {url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] underline text-brand-700">View current PDF ↗</a>}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">Country groups</span>
          {GROUP_CODES.map((code) => (
            <label key={code} className="inline-flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={groups.includes(code)}
                onChange={() => toggleGroup(slot, code)}
              />
              {code}
            </label>
          ))}
        </div>
      </fieldset>
    );
  };

  return (
    <form onSubmit={onSubmit} className="bg-surface border-l-4 border-brand-500 p-6 md:p-8 space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="font-display font-heavy text-xl text-ink">
          {initial
            ? `Edit ${isSub ? 'subcategory' : 'category'}`
            : `New ${isSub ? 'subcategory' : 'category'}`}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-[11px] uppercase tracking-[0.25em] text-ink/60 hover:text-ink cursor-pointer"
        >
          Cancel
        </button>
      </header>

      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2">
          {error}
        </p>
      )}

      <Field label="Belongs to" hint="Top level = a category; pick a category to make this a subcategory.">
        <select
          value={draft.parent_id ?? ''}
          onChange={(e) => update('parent_id', e.currentTarget.value || null)}
          className={inputClass}
        >
          <option value="">— Top level (category) —</option>
          {categories
            .filter((c) => c.id !== initial?.id)
            .map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
        </select>
      </Field>

      <Field label="Name" required>
        <input
          type="text"
          required
          value={draft.name}
          onChange={(e) => update('name', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Description" hint="Optional short line shown under the name.">
        <input
          type="text"
          value={draft.description ?? ''}
          onChange={(e) => update('description', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      {!isSub && (
        <Field label="Linked product category" hint="Drives the 'Download catalogue' button on /catalog/[category].">
          <select
            value={draft.category_slug ?? ''}
            onChange={(e) => update('category_slug', e.currentTarget.value || null)}
            className={inputClass}
          >
            <option value="">— None (admin only) —</option>
            {productCategories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </Field>
      )}

      {isSub && (
        <Field label="Applies to product series" hint="Drives the 'Download catalogue' button on the product page.">
          <select
            value={draft.product_sub_category ?? ''}
            onChange={(e) => update('product_sub_category', e.currentTarget.value || null)}
            className={inputClass}
          >
            <option value="">— None (admin only) —</option>
            {productSeries.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      )}

      <div className="space-y-3">
        {renderPdfBlock('black')}
        {renderPdfBlock('blue')}
      </div>

      <Field label="Sort order" hint="Items are ordered by this number, ascending.">
        <input
          type="number"
          value={draft.sort_order}
          onChange={(e) => update('sort_order', Number(e.currentTarget.value))}
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.is_active}
          onChange={(e) => update('is_active', e.currentTarget.checked)}
        />
        <span className="text-sm text-ink/85">Visible on the website</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 disabled:opacity-60 cursor-pointer"
        >
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create'}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  'mt-1 w-full bg-transparent border-b border-ink/25 px-1 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-brand-500';

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-ink/55">
        {label}{required && <span className="text-brand-500"> *</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-ink/55">{hint}</span>}
    </label>
  );
}
