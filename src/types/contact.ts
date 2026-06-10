export type ContactStatus = 'new' | 'read' | 'archived';

export interface ContactSubmission {
  id: string;
  source: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  page_path: string | null;
  status: ContactStatus;
  notified_at: string | null;
  created_at: string;
}

export interface ContactSetting {
  source: string;
  label: string;
  recipient_email: string;
  updated_at: string;
}

/** The fields a public form collects before server columns are added. */
export interface ContactDraft {
  source: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  page_path: string;
  /** Honeypot — real users never see or fill this; must stay empty. */
  website: string;
}
