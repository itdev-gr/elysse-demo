import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadCertificationAsset, validateCertificationFile } from '../../lib/certifications';
import type { Certification, CertificationDraft, CertGroup } from '../../types/certification';

type Props = {
  group: CertGroup;
  initialSortOrder: number;
  initial?: Certification;
  onSaved: () => void;
  onCancel: () => void;
};

function emptyDraft(group: CertGroup, sortOrder: number): CertificationDraft {
  return {
    cert_group: group, name: '', description: '', scope: null, tag: null,
    logo: null, pdf_url: null, sort_order: sortOrder, is_active: true,
  };
}

function toDraft(c: Certification): CertificationDraft {
  const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = c;
  return rest;
}

export default function CertificationForm({ group, initialSortOrder, initial, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<CertificationDraft>(() =>
    initial ? toDraft(initial) : emptyDraft(group, initialSortOrder));
  const [pendingBadge, setPendingBadge] = useState<File | null>(null);
  const [pendingPdf, setPendingPdf] = useState<File | null>(null);
  const [badgePreview, setBadgePreview] = useState<string | null>(initial?.logo ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const badgeInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const update = <K extends keyof CertificationDraft>(key: K, value: CertificationDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onBadgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const problem = validateCertificationFile(f, 'badge');
    if (problem) { setError(problem); e.target.value = ''; return; }
    setPendingBadge(f);
    setBadgePreview(URL.createObjectURL(f));
  };

  const onPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const problem = validateCertificationFile(f, 'pdf');
    if (problem) { setError(problem); e.target.value = ''; return; }
    setPendingPdf(f);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: CertificationDraft = {
        ...draft,
        name: draft.name.trim(),
        description: draft.description.trim(),
        scope: draft.scope?.trim() || null,
        tag: draft.tag?.trim() || null,
        pdf_url: draft.pdf_url?.trim() || null,
      };
      if (!payload.name) throw new Error('Name is required.');

      // Step 1: create/update the row first — uploads are namespaced by row id.
      let cert: Certification;
      if (initial) {
        const { data, error: err } = await supabase
          .from('certifications').update(payload).eq('id', initial.id).select().single();
        if (err) throw err;
        cert = data as Certification;
      } else {
        const { data, error: err } = await supabase
          .from('certifications').insert(payload).select().single();
        if (err) throw err;
        cert = data as Certification;
      }

      // Step 2: uploads, then patch the row with the new URLs.
      const patch: Partial<CertificationDraft> = {};
      if (pendingBadge) patch.logo = (await uploadCertificationAsset(pendingBadge, cert.id, 'badge')).url;
      if (pendingPdf) patch.pdf_url = (await uploadCertificationAsset(pendingPdf, cert.id, 'pdf')).url;
      if (Object.keys(patch).length > 0) {
        const { error: err } = await supabase.from('certifications').update(patch).eq('id', cert.id);
        if (err) throw err;
      }
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-surface border-l-4 border-brand-500 p-6 md:p-8 space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="font-display font-heavy text-xl text-ink">
          {initial ? 'Edit certification' : 'New certification'}
          <span className="ml-3 text-[10px] uppercase tracking-[0.25em] text-ink/50 align-middle">
            {group === 'green' ? 'Green Elysée' : 'Quality'}
          </span>
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

      <Field label="Name" required>
        <input
          type="text"
          required
          value={draft.name}
          onChange={(e) => update('name', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Description" required hint="Short line shown under the name.">
        <input
          type="text"
          required
          value={draft.description}
          onChange={(e) => update('description', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Scope" hint="Optional longer text shown on the card.">
        <textarea
          rows={2}
          value={draft.scope ?? ''}
          onChange={(e) => update('scope', e.currentTarget.value)}
          className={`${inputClass} resize-y`}
        />
      </Field>

      {group === 'quality' && (
        <Field label="Tag" hint="Short code shown on the card header, e.g. MGMT, PE, PVC.">
          <input
            type="text"
            maxLength={6}
            value={draft.tag ?? ''}
            onChange={(e) => update('tag', e.currentTarget.value.toUpperCase())}
            className={inputClass}
          />
        </Field>
      )}

      <Field label="Badge image" hint="SVG, PNG, JPEG or WebP. Max 2 MB.">
        <div className="mt-2 flex items-center gap-4">
          {badgePreview ? (
            <div className="relative w-28 h-28 bg-surface-alt rounded overflow-hidden border border-ink/10 flex items-center justify-center p-2">
              <img src={badgePreview} alt="" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-28 h-28 bg-surface-alt rounded border border-dashed border-ink/30 flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-[0.25em] text-ink/45">No badge</span>
            </div>
          )}
          <input
            ref={badgeInputRef}
            type="file"
            accept="image/svg+xml,image/png,image/jpeg,image/webp"
            onChange={onBadgeChange}
            className="text-sm text-ink/80"
          />
        </div>
      </Field>

      <Field label="Certificate PDF" hint="Upload a PDF (max 10 MB) — or paste an external URL below.">
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

      <Field label="Sort order" hint="Cards are ordered by this number, ascending.">
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
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create certification'}
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
