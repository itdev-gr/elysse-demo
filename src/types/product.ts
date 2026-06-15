// Mirrors public.products and the group model (migration 0016_products.sql).
export interface Product {
  code: string;
  category: string | null;        // 'A' | 'B' | 'C'
  category_name: string | null;   // 'Compression Fittings' | ...
  sub_category: string | null;
  family_code: string | null;
  configuration: string | null;
  size: string | null;
  packing_bag: number | null;
  packing_box: number | null;
  moq: number | null;
  box_size: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type ProductDraft = Omit<Product, 'created_at' | 'updated_at'>;

export interface ProductGroup {
  code: string;                   // 'A'..'E'
  label: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupCountry {
  id: string;
  group_code: string;
  country: string;
  country_code: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
export type GroupCountryDraft = Omit<GroupCountry, 'id' | 'created_at' | 'updated_at'>;

export type IssueType =
  | 'duplicate_code' | 'missing_code' | 'missing_field' | 'missing_group' | 'invalid_value';
export type IssueSeverity = 'error' | 'warning';
export type IssueStatus = 'open' | 'resolved' | 'ignored';

export interface ProductImportIssue {
  id: string;
  code: string | null;
  raw: Record<string, unknown>;
  issue_type: IssueType;
  severity: IssueSeverity;
  message: string | null;
  status: IssueStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}
