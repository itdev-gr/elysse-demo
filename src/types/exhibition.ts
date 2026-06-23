export interface Exhibition {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  event_date: string;
  card_date: string | null;
  venue: string | null;
  stand: string | null;
  image: string | null;
  image_alt: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
export type ExhibitionDraft = Omit<Exhibition, 'id' | 'created_at' | 'updated_at'>;
