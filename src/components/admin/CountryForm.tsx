import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Country, CountryDraft, CountryKind } from '../../types/country';

type Props = {
  initial?: Country;
  onSaved: () => void;
  onCancel: () => void;
};

function emptyDraft(): CountryDraft {
  return {
    code: '',
    country: '',
    label: '',
    kind: 'partner',
    lat: 0,
    lng: 0,
    nudge_x: null,
    nudge_y: null,
    address: '',
    phone: '',
    email: '',
    website: null,
    note: null,
    prefilled_message: '',
    is_active: true,
  };
}

function toDraft(c: Country): CountryDraft {
  const { created_at: _ca, updated_at: _ua, ...rest } = c;
  return rest;
}

export default function CountryForm({ initial, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<CountryDraft>(() => initial ? toDraft(initial) : emptyDraft());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof CountryDraft>(key: K, value: CountryDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload: CountryDraft = {
      ...draft,
      code: draft.code.trim().toLowerCase(),
      website: draft.website?.trim() || null,
      note: draft.note?.trim() || null,
      nudge_x: draft.nudge_x,
      nudge_y: draft.nudge_y,
    };

    try {
      if (initial) {
        // Code is read-only on edit — keep the original PK
        const { code: _ignored, ...updateFields } = payload;
        const { error: err } = await supabase
          .from('countries')
          .update(updateFields)
          .eq('code', initial.code);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('countries').insert(payload);
        if (err) {
          if (err.code === '23505') {
            throw new Error(`A country with code "${payload.code}" already exists.`);
          }
          throw err;
        }
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
          {initial ? `Edit ${initial.country}` : 'New country'}
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

      <Field label="Code" required hint="ISO 3166-1 alpha-2, lowercase (e.g. cy, gb).">
        <input
          type="text"
          required
          pattern="[a-z]{2}"
          minLength={2}
          maxLength={2}
          value={draft.code}
          readOnly={!!initial}
          onChange={(e) => update('code', e.currentTarget.value.toLowerCase())}
          className={`${inputClass} ${initial ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
      </Field>

      <Field label="Country" required>
        <input
          type="text"
          required
          value={draft.country}
          onChange={(e) => update('country', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Label" required hint="Shown as the details-card heading.">
        <input
          type="text"
          required
          value={draft.label}
          onChange={(e) => update('label', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Kind" required>
        <select
          required
          value={draft.kind}
          onChange={(e) => update('kind', e.currentTarget.value as CountryKind)}
          className={inputClass}
        >
          <option value="subsidiary">Subsidiary</option>
          <option value="partner">Partner</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-5">
        <Field label="Latitude" required hint="-90 to 90">
          <input
            type="number"
            required
            step="any"
            min={-90}
            max={90}
            value={draft.lat}
            onChange={(e) => update('lat', Number(e.currentTarget.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Longitude" required hint="-180 to 180">
          <input
            type="number"
            required
            step="any"
            min={-180}
            max={180}
            value={draft.lng}
            onChange={(e) => update('lng', Number(e.currentTarget.value))}
            className={inputClass}
          />
        </Field>
      </div>

      <p className="text-[11px] text-ink/55 leading-relaxed -mt-2">
        Tip — paste from Google Maps. Right-click any location → the first row of the popup is the lat, lng pair.
      </p>

      <div className="grid grid-cols-2 gap-5">
        <Field label="Nudge X" hint="Pixel offset (optional)">
          <input
            type="number"
            step="any"
            value={draft.nudge_x ?? ''}
            onChange={(e) => update('nudge_x', e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Nudge Y" hint="Pixel offset (optional)">
          <input
            type="number"
            step="any"
            value={draft.nudge_y ?? ''}
            onChange={(e) => update('nudge_y', e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Address" required>
        <textarea
          required
          rows={3}
          value={draft.address}
          onChange={(e) => update('address', e.currentTarget.value)}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field label="Phone" required>
        <input
          type="text"
          required
          value={draft.phone}
          onChange={(e) => update('phone', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Email" required>
        <input
          type="email"
          required
          value={draft.email}
          onChange={(e) => update('email', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Website">
        <input
          type="text"
          value={draft.website ?? ''}
          onChange={(e) => update('website', e.currentTarget.value)}
          placeholder="www.example.com"
          className={inputClass}
        />
      </Field>

      <Field label="Note" hint="Sub-line shown under the country in the details card.">
        <input
          type="text"
          value={draft.note ?? ''}
          onChange={(e) => update('note', e.currentTarget.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Prefilled message" required hint="Pre-fills the contact form message.">
        <textarea
          required
          rows={3}
          value={draft.prefilled_message}
          onChange={(e) => update('prefilled_message', e.currentTarget.value)}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.is_active}
          onChange={(e) => update('is_active', e.currentTarget.checked)}
        />
        <span className="text-sm text-ink/85">Active (visible on the public map)</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-brand-500 text-surface px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 disabled:opacity-60 cursor-pointer"
        >
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create country'}
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
