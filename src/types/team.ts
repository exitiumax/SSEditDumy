export interface TeamMember {
  id: string;
  name: string;
  title: string;
  image_url: string;
  degrees: string[];
  bio: string;
  created_at: string;
  updated_at: string;
  position?: number;
  tags?: {
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }[];
}