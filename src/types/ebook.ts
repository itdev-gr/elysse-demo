export interface Ebook {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  year: string | null;
  cover_image: string | null;
  image_alt: string | null;
  download_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
export type EbookDraft = Omit<Ebook, 'id' | 'created_at' | 'updated_at'>;
