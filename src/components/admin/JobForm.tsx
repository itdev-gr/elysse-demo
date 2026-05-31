import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Job, JobDraft, EmploymentType } from '../../types/job';

const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const DEPARTMENT_SUGGESTIONS = ['R&D', 'Manufacturing', 'Commercial', 'Quality', 'IT', 'Logistics', 'HR'];

type Props = {
  initial?: Job;
  onSaved: () => void;
  onCancel: () => void;
};

function emptyDraft(): JobDraft {
  return {
    title: '',
    location: '',
    employment_type: 'Full-time',
    department: '',
    description: '',
    salary_range: null,
    deadline: null,
    apply_email: null,
    apply_url: null,
    is_published: true,
  };
}

function toDraft(j: Job): JobDraft {
  const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = j;
  return rest;
}

export default function JobForm({ initial, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<JobDraft>(() => (initial ? toDraft(initial) : emptyDraft()));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof JobDraft>(key: K, value: JobDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload: JobDraft = {
      ...draft,
      salary_range: draft.salary_range?.trim() || null,
      apply_email: draft.apply_email?.trim() || null,
      apply_url: draft.apply_url?.trim() || null,
      deadline: draft.deadline || null,
    };
    const op = initial
      ? supabase.from('jobs').update(payload).eq('id', initial.id)
      : supabase.from('jobs').insert(payload);
    const { error: err } = await op;
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  };

  return (
    <form onSubmit={onSubmit} className="bg-surface border-l-4 border-brand-500 p-6 md:p-8 space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="font-display font-heavy text-xl text-ink">
          {initial ? 'Edit job' : 'New job'}
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

      <Field label="Title" required>
        <input
          type="text"
          required
          value={draft.title}
          onChange={(e) => update('title', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Department" required>
        <input
          type="text"
          required
          list="department-suggestions"
          value={draft.department}
          onChange={(e) => update('department', e.currentTarget.value)}
          className={inputClass}
        />
        <datalist id="department-suggestions">
          {DEPARTMENT_SUGGESTIONS.map((d) => <option key={d} value={d} />)}
        </datalist>
      </Field>

      <Field label="Employment type" required>
        <select
          required
          value={draft.employment_type}
          onChange={(e) => update('employment_type', e.currentTarget.value as EmploymentType)}
          className={inputClass}
        >
          {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>

      <Field label="Location" required>
        <input
          type="text"
          required
          value={draft.location}
          onChange={(e) => update('location', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Salary range">
        <input
          type="text"
          value={draft.salary_range ?? ''}
          onChange={(e) => update('salary_range', e.currentTarget.value)}
          placeholder="€35,000 — €45,000"
          className={inputClass}
        />
      </Field>

      <Field label="Application deadline">
        <input
          type="date"
          value={draft.deadline ?? ''}
          onChange={(e) => update('deadline', e.currentTarget.value || null)}
          className={inputClass}
        />
      </Field>

      <Field label="Apply email">
        <input
          type="email"
          value={draft.apply_email ?? ''}
          onChange={(e) => update('apply_email', e.currentTarget.value)}
          placeholder="careers@elysee.com.cy"
          className={inputClass}
        />
      </Field>

      <Field label="Apply URL">
        <input
          type="url"
          value={draft.apply_url ?? ''}
          onChange={(e) => update('apply_url', e.currentTarget.value)}
          placeholder="https://…"
          className={inputClass}
        />
      </Field>

      <Field label="Description" required hint="Markdown supported (bold, lists, links).">
        <textarea
          required
          rows={10}
          value={draft.description}
          onChange={(e) => update('description', e.currentTarget.value)}
          className={`${inputClass} resize-y`}
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
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create job'}
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
