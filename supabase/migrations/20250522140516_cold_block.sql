-- Drop existing tag-related tables
DROP TABLE IF EXISTS team_members_tags CASCADE;
DROP TABLE IF EXISTS team_member_tags CASCADE;

-- Add category column to team_members
ALTER TABLE team_members
ADD COLUMN category text NOT NULL DEFAULT 'leadership';

-- Add check constraint to validate category values
ALTER TABLE team_members
ADD CONSTRAINT team_members_category_valid 
CHECK (category IN ('leadership', 'counselor', 'coach', 'tutor'));