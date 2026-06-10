import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadCataloguePdf, validateCataloguePdf } from '../../lib/catalogues';
import type { Catalogue, CatalogueDraft } from '../../types/catalogue';

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
  const [pendingPdf, setPendingPdf] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const update = <K extends keyof CatalogueDraft>(key: K, value: CatalogueDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const problem = validateCataloguePdf(f);
    if (problem) { setError(problem); e.target.value = ''; return; }
    setPendingPdf(f);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: CatalogueDraft = {
        ...draft,
        name: draft.name.trim(),
        description: draft.description?.trim() || null,
        pdf_url: draft.pdf_url?.trim() || null,
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

      // Step 2: upload the PDF, then patch the row with its URL.
      if (pendingPdf) {
        const { url } = await uploadCataloguePdf(pendingPdf, cat.id);
        const { error: err } = await supabase
          .from('catalogues').update({ pdf_url: url }).eq('id', cat.id);
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

      <Field label="Catalogue PDF" hint="Upload a PDF (max 25 MB) — or paste an external URL below.">
        <div className="mt-2 space-y-2">
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            onChange={onPdfChange}
            className="text-sm text-ink/80"
          />
          {pendingPdf && (
            <p className="text-[11px] text-ink/60">Will upload: {pendingPdf.name}</p>
          )}
          <input
            type="url"
            value={draft.pdf_url ?? ''}
            placeholder="https://… (current PDF link)"
            onChange={(e) => update('pdf_url', e.currentTarget.value)}
            className={inputClass}
          />
        </div>
      </Field>

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
