export interface JobPosting {
  id: string;
  title: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  location: string;
  description: string;
  requirements: string[];
  salary_range?: string;
  status: 'active' | 'filled' | 'draft';
  created_at: string;
  updated_at: string;
}