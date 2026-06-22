export interface NewsArticle {
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
  /** Featured in the home "Latest from Elysée" section. */
  featured_home: boolean;
  /** Sort position within the featured set (lower shows first; null = unranked). */
  featured_rank: number | null;
  created_at: string;
  updated_at: string;
}

// Featured state is managed via the home-featured toggle, not the article form.
export type NewsDraft = Omit<
  NewsArticle,
  'id' | 'created_at' | 'updated_at' | 'featured_home' | 'featured_rank'
>;
