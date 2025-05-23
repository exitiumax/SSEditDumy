interface TeamMember {
  id: string;
  name: string;
  title: string;
  image: string;
  degrees: string[];
  bio: string;
  category: 'leadership' | 'counselor' | 'coach' | 'tutor';
}

export const teamMembers: TeamMember[] = [];