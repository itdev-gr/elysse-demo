import { useEffect, useState } from 'react';
import { emptyDraft, validateDraft, submitEnquiry, type ValidationResult } from '../../lib/contact';
import { i18nAttr, i18nAttrFor } from '../../lib/i18n';
import type { ContactDraft } from '../../types/contact';

interface Props {
  /** Routes the enquiry + picks the recipient (careers | local | worldwide | general). */
  source: string;
  /** Defaults to the current pathname at submit time. */
  pagePath?: string;
  title?: string;
  subtitle?: string;
}

type FormState = 'idle' | 'submitting' | 'done' | 'error';

const fieldClass =
  'mt-1.5 w-full rounded-input border border-ink/20 bg-surface px-4 py-3 text-base text-ink placeholder:text-ink/40 transition-colors duration-fast focus:border-brand-500 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-brand-500/30';

export default function EnquiryForm({
  source,
  pagePath = '',
  title = 'Send us a message',
  subtitle = 'Fill in the form and the right Elysée team will get back to you.',
}: Props) {
  const [draft, setDraft] = useState<ContactDraft>(() => emptyDraft(source, pagePath));
  const [errors, setErrors] = useState<ValidationResult['errors']>({});
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // This island renders translated nodes after hydration; re-fire the swap so
  // the already-loaded listener applies the active language on first load.
  useEffect(() => {
    try {
      const l = localStorage.getItem('elysee.lang');
      if (l && l !== 'en') document.dispatchEvent(new CustomEvent('elysee:lang', { detail: { lang: l } }));
    } catch {}
  }, [state]);

  const set =
    (key: keyof ContactDraft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft((d) => ({ ...d, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = validateDraft(draft);
    if (!v.ok) {
      setErrors(v.errors);
      return;
    }
    setErrors({});
    setState('submitting');
    const res = await submitEnquiry({
      ...draft,
      page_path: draft.page_path || (typeof window !== 'undefined' ? window.location.pathname : ''),
    });
    if (res.kind === 'success') {
      setState('done');
    } else if (res.kind === 'invalid') {
      setErrors(res.errors);
      setState('idle');
    } else {
      setErrorMsg(res.message);
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div className="rounded-input border border-brand-500/30 bg-brand-500/10 p-8 md:p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-surface">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="font-display font-heavy text-xl md:text-2xl text-ink" data-i18n={i18nAttr('Thank you.')}>Thank you.</h3>
        <p className="mt-2 text-base text-ink/75" data-i18n={i18nAttr('Your message is on its way — a member of the Elysée team will be in touch shortly.')}>
          Your message is on its way — a member of the Elysée team will be in touch shortly.
        </p>
      </div>
    );
  }

  const submitting = state === 'submitting';

  return (
    <div>
      {(title || subtitle) && (
        <header className="mb-6">
          {title && <h3 className="font-display font-heavy text-xl md:text-2xl text-ink leading-tight" data-i18n={i18nAttr(title)}>{title}</h3>}
          {subtitle && <p className="mt-2 text-base text-ink/75" data-i18n={i18nAttr(subtitle)}>{subtitle}</p>}
        </header>
      )}

      {state === 'error' && (
        <p role="alert" className="mb-5 text-sm text-red-700 bg-red-50 border-l-2 border-red-500 px-3 py-2">
          <span data-i18n={i18nAttr('Something went wrong sending your message')}>Something went wrong sending your message</span>{errorMsg ? `: ${errorMsg}` : ''}<span data-i18n={i18nAttr('. Please try again or email us directly.')}>. Please try again or email us directly.</span>
        </p>
      )}

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5" aria-label="Contact form" data-i18n-attr={i18nAttrFor({ 'aria-label': 'Contact form' })} noValidate>
        <Field label="Name" required error={errors.name}>
          <input type="text" autoComplete="name" placeholder="Your full name" data-i18n-attr={i18nAttrFor({ placeholder: 'Your full name' })} value={draft.name} onChange={set('name')} className={fieldClass} />
        </Field>
        <Field label="Company" error={errors.company}>
          <input type="text" autoComplete="organization" placeholder="Optional" data-i18n-attr={i18nAttrFor({ placeholder: 'Optional' })} value={draft.company} onChange={set('company')} className={fieldClass} />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input type="email" autoComplete="email" placeholder="you@example.com" value={draft.email} onChange={set('email')} className={fieldClass} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input type="tel" autoComplete="tel" placeholder="Optional" data-i18n-attr={i18nAttrFor({ placeholder: 'Optional' })} value={draft.phone} onChange={set('phone')} className={fieldClass} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Message" required error={errors.message}>
            <textarea rows={6} placeholder="How can we help?" data-i18n-attr={i18nAttrFor({ placeholder: 'How can we help?' })} value={draft.message} onChange={set('message')} className={`${fieldClass} resize-y min-h-[8rem]`} />
          </Field>
        </div>

        {/* Honeypot — hidden from real users; bots that fill it are dropped. */}
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input type="text" tabIndex={-1} autoComplete="off" value={draft.website} onChange={set('website')} />
          </label>
        </div>

        <div className="sm:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-1">
          <p className="text-xs text-ink/60 max-w-sm" data-i18n={i18nAttr('By submitting, you agree to be contacted by Elysée regarding your enquiry.')}>
            By submitting, you agree to be contacted by Elysée regarding your enquiry.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 bg-brand-500 text-surface px-6 py-3 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-brand-700 transition-colors duration-200 disabled:opacity-60 cursor-pointer"
          >
            {submitting
              ? <span data-i18n={i18nAttr('Sending…')}>Sending…</span>
              : <span data-i18n={i18nAttr('Send message')}>Send message</span>}
            {!submitting && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink">
        <span data-i18n={i18nAttr(label)}>{label}</span>
        {required && <span className="text-brand-500" aria-hidden="true"> *</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
