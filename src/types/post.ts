export interface Post {
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

export type PostDraft = Omit<Post, 'id' | 'created_at' | 'updated_at'>;

export type PostStatus = 'Live' | 'Draft';
