export interface Media {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  video_url: string;
  poster_image: string | null;
  image_alt: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
export type MediaDraft = Omit<Media, 'id' | 'created_at' | 'updated_at'>;
