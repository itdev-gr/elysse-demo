import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import MarkdownEditor from './MarkdownEditor';
import { slugify, uploadProjectLogo } from '../../lib/funded-projects';
import type { FundedProject, FundedProjectDraft } from '../../types/funded-project';
import { triggerPublish } from '../../lib/publish';

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

type Props = {
  initial?: FundedProject;
  onSaved: () => void;
  onCancel: () => void;
};

function emptyDraft(): FundedProjectDraft {
  return {
    slug: '',
    name: '',
    status: 'Ongoing',
    duration: '',
    total_funding: '',
    elysee_funding: null,
    partners: [],
    image: null,
    image_alt: null,
    excerpt: '',
    body: '',
    sort_order: 0,
    is_published: true,
  };
}

function toDraft(p: FundedProject): FundedProjectDraft {
  // Strip server-managed columns; the form only writes the editable draft.
  const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = p;
  return rest;
}

export default function FundedProjectForm({ initial, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<FundedProjectDraft>(() => (initial ? toDraft(initial) : emptyDraft()));
  // Partners edited as one-per-line text; converted to string[] on submit.
  const [partnersText, setPartnersText] = useState<string>(() => (initial?.partners ?? []).join('\n'));
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.image ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const update = <K extends keyof FundedProjectDraft>(key: K, value: FundedProjectDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onNameBlur = () => {
    if (draft.slug.trim() === '' && draft.name.trim() !== '') {
      update('slug', slugify(draft.name));
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!ALLOWED_MIME.includes(f.type)) {
      setError('Logo must be JPEG, PNG or WebP.');
      e.target.value = '';
      return;
    }
    if (f.size > MAX_BYTES) {
      setError('Logo must be 4 MB or smaller.');
      e.target.value = '';
      return;
    }
    setPendingFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const removeLogo = () => {
    setPendingFile(null);
    setPreviewUrl(null);
    update('image', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const slug = slugify(draft.slug.trim()) || slugify(draft.name.trim());
      if (!slug) throw new Error('Slug is required.');

      const partners = partnersText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      let project: FundedProject;
      const payload: FundedProjectDraft = {
        ...draft,
        slug,
        elysee_funding: draft.elysee_funding?.trim() || null,
        image_alt: draft.image_alt?.trim() || null,
        partners,
      };

      if (initial) {
        const { data, error: err } = await supabase
          .from('funded_projects')
          .update(payload)
          .eq('id', initial.id)
          .select()
          .single();
        if (err) throw err;
        project = data as FundedProject;
      } else {
        const { data, error: err } = await supabase
          .from('funded_projects')
          .insert(payload)
          .select()
          .single();
        if (err) throw err;
        project = data as FundedProject;
      }

      if (pendingFile) {
        const { url } = await uploadProjectLogo(pendingFile, project.id);
        const { error: err } = await supabase
          .from('funded_projects')
          .update({ image: url })
          .eq('id', project.id);
        if (err) throw err;
      }

      triggerPublish();
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const excerptCount = draft.excerpt.length;
  const excerptOver = excerptCount > 300;

  return (
    <form onSubmit={onSubmit} className="bg-surface border-l-4 border-brand-500 p-6 md:p-8 space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="font-display font-heavy text-xl text-ink">
          {initial ? 'Edit project' : 'New project'}
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
          onBlur={onNameBlur}
          className={inputClass}
        />
      </Field>

      <Field label="Slug" required hint="Lowercase letters, digits, hyphens. Used in the project URL.">
        <input
          type="text"
          required
          pattern="[a-z0-9-]+"
          value={draft.slug}
          onChange={(e) => update('slug', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Stage" required>
          <select
            required
            value={draft.status}
            onChange={(e) => update('status', e.currentTarget.value as FundedProject['status'])}
            className={inputClass}
          >
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </Field>

        <Field label="Order" hint="Lower shows first within its stage.">
          <input
            type="number"
            value={draft.sort_order}
            onChange={(e) => update('sort_order', Number(e.currentTarget.value) || 0)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Duration" required hint="e.g. 1/8/2025 – 30/4/2026">
        <input
          type="text"
          required
          value={draft.duration}
          onChange={(e) => update('duration', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Total funding" required hint="e.g. €196,125">
          <input
            type="text"
            required
            value={draft.total_funding}
            onChange={(e) => update('total_funding', e.currentTarget.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Elysée funding" hint="Optional — leave empty if not applicable.">
          <input
            type="text"
            value={draft.elysee_funding ?? ''}
            onChange={(e) => update('elysee_funding', e.currentTarget.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Partners" hint="One partner per line. Optional.">
        <textarea
          rows={3}
          value={partnersText}
          onChange={(e) => setPartnersText(e.currentTarget.value)}
          placeholder={'University of Cyprus (UCY/HO)\nCyprus University of Technology (CUT/PA1)'}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field label="Excerpt" required hint={`${excerptCount}/300 characters — shown on the project card and as the summary.`}>
        <textarea
          required
          rows={2}
          maxLength={300}
          value={draft.excerpt}
          onChange={(e) => update('excerpt', e.currentTarget.value)}
          className={`${inputClass} resize-y ${excerptOver ? 'border-red-500' : ''}`}
        />
      </Field>

      <Field label="Logo" hint="JPEG, PNG, or WebP. Max 4 MB. Shown object-contained on a tint.">
        <div className="mt-2 flex items-center gap-4">
          {previewUrl ? (
            <div className="relative w-40 aspect-video bg-brand-500/5 rounded overflow-hidden border border-ink/10">
              <img src={previewUrl} alt="" className="absolute inset-0 w-full h-full object-contain p-3" />
            </div>
          ) : (
            <div className="w-40 aspect-video bg-surface-alt rounded border border-dashed border-ink/30 flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-[0.25em] text-ink/45">No logo</span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileChange}
              className="text-sm text-ink/80"
            />
            {(previewUrl || pendingFile) && (
              <button
                type="button"
                onClick={removeLogo}
                className="text-[11px] uppercase tracking-[0.25em] text-red-600 hover:text-red-800 cursor-pointer text-left"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </Field>

      <Field label="Logo alt text" hint="Describes the logo for screen readers.">
        <input
          type="text"
          value={draft.image_alt ?? ''}
          onChange={(e) => update('image_alt', e.currentTarget.value)}
          placeholder={draft.name ? `${draft.name} project logo` : 'Project logo'}
          className={inputClass}
        />
      </Field>

      <Field label="Body" hint="Markdown supported (headings ##, lists, links, **bold**).">
        <MarkdownEditor
          rows={15}
          value={draft.body}
          onChange={(v) => update('body', v)}
          className={`${inputClass} font-mono resize-y`}
        />
      </Field>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.is_published}
          onChange={(e) => update('is_published', e.currentTarget.checked)}
        />
        <span className="text-sm text-ink/85">Published</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 disabled:opacity-60 cursor-pointer"
        >
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create project'}
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
        {label}
        {required && <span className="text-brand-500"> *</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-ink/55">{hint}</span>}
    </label>
  );
}
