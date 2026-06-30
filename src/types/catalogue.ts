export interface Catalogue {
  id: string;
  /** Null for top-level categories; set to a category id for subcategories. */
  parent_id: string | null;
  name: string;
  description: string | null;
  /** Legacy single-PDF field. Read-only fallback during migration. */
  pdf_url: string | null;
  /** Primary PDF slot. Black wins when both slots match the visitor's group. */
  pdf_url_black: string | null;
  /** Secondary PDF slot. */
  pdf_url_blue: string | null;
  /** Country groups (A–E) that should see the Black PDF. */
  groups_black: string[] | null;
  /** Country groups (A–E) that should see the Blue PDF. */
  groups_blue: string[] | null;
  /** On category rows: the product_categories.slug this catalogue serves. */
  category_slug: string | null;
  /** On subcategory rows: the products.sub_category this catalogue serves. */
  product_sub_category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CatalogueDraft = Omit<Catalogue, 'id' | 'created_at' | 'updated_at'>;
