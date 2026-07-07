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
  // Per-language overrides for the product name (configuration) and description.
  // Keyed by language code (el | de | es | fr); English lives in the plain
  // `configuration` / `description` columns and is the fallback.
  name_i18n: Record<string, string> | null;
  description_i18n: Record<string, string> | null;
  sort_order: number;
  is_active: boolean;
  // Hidden rows are removed from BOTH the public catalog and the admin list
  // (recoverable via the admin "Show hidden" toggle), distinct from is_active.
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}
// Images live ONLY in the family galleries (product_family_images) — product
// rows carry no image links (columns retired in migrations 0039/0040).
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
  | 'duplicate_code' | 'missing_code' | 'missing_field' | 'missing_group' | 'invalid_value'
  | 'orphan_category' | 'orphan_series' | 'orphan_family' | 'letter_mismatch'
  | 'no_visible_country' | 'duplicate_category_link' | 'orphan_membership'
  | 'broken_image_ref' | 'family_gallery_empty' | 'mirror_drift';
export type IssueSeverity = 'error' | 'warning';
export type IssueStatus = 'open' | 'resolved' | 'ignored';

export interface ProductImportIssue {
  id: string;
  check_key: string | null;
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
