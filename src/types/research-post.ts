export interface ResearchPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  author: string | null;
  published_at: string | null;
  reading_minutes: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type ResearchPostDraft = Omit<ResearchPost, 'id' | 'created_at' | 'updated_at'>;
