/*
  # Revert team members to single category system

  1. Changes
    - Drop tags tables
    - Add category column back to team_members
    - Add category constraint
*/

-- Drop the tags tables
DROP TABLE IF EXISTS team_members_tags;
DROP TABLE IF EXISTS team_member_tags;

-- Add category column back to team_members
ALTER TABLE team_members
ADD COLUMN category text NOT NULL DEFAULT 'leadership';

-- Add check constraint to validate category values
ALTER TABLE team_members
ADD CONSTRAINT team_members_category_valid 
CHECK (category IN ('leadership', 'counselor', 'coach', 'tutor'));