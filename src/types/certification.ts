export type CertGroup = 'green' | 'quality';

export interface Certification {
  id: string;
  cert_group: CertGroup;
  /** Quality certificates belong to a fixed category; green ones do not. */
  category: string | null;
  name: string;
  description: string | null;
  scope: string | null;
  tag: string | null;
  logo: string | null;
  pdf_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CertificationDraft = Omit<Certification, 'id' | 'created_at' | 'updated_at'>;
