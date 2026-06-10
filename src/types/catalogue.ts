export interface Catalogue {
  id: string;
  /** Null for top-level categories; set to a category id for subcategories. */
  parent_id: string | null;
  name: string;
  description: string | null;
  pdf_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CatalogueDraft = Omit<Catalogue, 'id' | 'created_at' | 'updated_at'>;
