export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export interface Job {
  id: string;
  title: string;
  location: string;
  employment_type: EmploymentType;
  department: string;
  description: string;
  salary_range: string | null;
  deadline: string | null;          // ISO date "YYYY-MM-DD"
  apply_email: string | null;
  apply_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type JobDraft = Omit<Job, 'id' | 'created_at' | 'updated_at'>;
