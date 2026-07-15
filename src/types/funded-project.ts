export interface FundedProject {
  id: string;
  slug: string;
  name: string;
  status: 'Ongoing' | 'Completed';
  duration: string;
  total_funding: string;
  elysee_funding: string | null;
  partners: string[];
  image: string | null;
  image_alt: string | null;
  excerpt: string;
  body: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type FundedProjectDraft = Omit<FundedProject, 'id' | 'created_at' | 'updated_at'>;
