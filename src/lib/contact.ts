import { supabase } from './supabase';
import type { ContactDraft } from '../types/contact';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  ok: boolean;
  errors: Partial<Record<keyof ContactDraft, string>>;
}

export function emptyDraft(source: string, pagePath = ''): ContactDraft {
  return {
    source, name: '', email: '', company: '', phone: '',
    message: '', page_path: pagePath, website: '',
  };
}

export function validateDraft(draft: ContactDraft): ValidationResult {
  const errors: ValidationResult['errors'] = {};
  if (!draft.name.trim()) errors.name = 'Please enter your name.';
  else if (draft.name.trim().length > 200) errors.name = 'Name is too long.';
  if (!draft.email.trim()) errors.email = 'Please enter your email.';
  else if (!EMAIL_RE.test(draft.email.trim())) errors.email = 'Please enter a valid email address.';
  if (!draft.message.trim()) errors.message = 'Please enter a message.';
  else if (draft.message.trim().length > 5000) errors.message = 'Message is too long (5000 characters max).';
  if (draft.company && draft.company.length > 200) errors.company = 'Company name is too long.';
  if (draft.phone && draft.phone.length > 60) errors.phone = 'Phone number is too long.';
  return { ok: Object.keys(errors).length === 0, errors };
}

/** True when the honeypot was filled — treat as a bot. */
export function isSpam(draft: ContactDraft): boolean {
  return draft.website.trim() !== '';
}

export type SubmitResult =
  | { kind: 'success' }
  | { kind: 'invalid'; errors: ValidationResult['errors'] }
  | { kind: 'error'; message: string };

export async function submitEnquiry(draft: ContactDraft): Promise<SubmitResult> {
  const validation = validateDraft(draft);
  if (!validation.ok) return { kind: 'invalid', errors: validation.errors };

  // Honeypot: silently "succeed" without touching the database.
  if (isSpam(draft)) return { kind: 'success' };

  // Generate the id client-side so we never read the row back: anon has INSERT
  // but (deliberately) no SELECT under RLS, so a RETURNING read would be
  // rejected and fail the whole submission. crypto.randomUUID() is available in
  // every secure browser context (https + localhost).
  const id = crypto.randomUUID();
  const row = {
    id,
    source: draft.source || 'general',
    name: draft.name.trim(),
    email: draft.email.trim(),
    company: draft.company.trim() || null,
    phone: draft.phone.trim() || null,
    message: draft.message.trim(),
    page_path: draft.page_path || null,
  };

  // Insert only (Prefer: return=minimal). Do NOT chain .select() — it would
  // trigger an RLS-blocked read-back of the new row.
  const { error } = await supabase.from('contact_submissions').insert(row);

  if (error) return { kind: 'error', message: error.message };

  // Best-effort notification. The submission is already saved, so we never
  // block or fail the user if the email call errors.
  try {
    await supabase.functions.invoke('contact-notify', { body: { id } });
  } catch {
    /* dashboard still shows the submission */
  }

  return { kind: 'success' };
}
