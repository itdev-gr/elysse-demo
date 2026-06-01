export type CountryKind = 'subsidiary' | 'partner';

export interface Country {
  code: string;
  country: string;
  label: string;
  kind: CountryKind;
  lat: number;
  lng: number;
  nudge_x: number | null;
  nudge_y: number | null;
  address: string;
  phone: string;
  email: string;
  website: string | null;
  note: string | null;
  prefilled_message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CountryDraft = Omit<Country, 'created_at' | 'updated_at'>;
