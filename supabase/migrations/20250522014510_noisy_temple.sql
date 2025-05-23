/*
  # Update team members categories

  1. Changes
    - Rename category column to categories
    - Change type to text array
    - Add constraint to ensure at least one category
    - Add constraint to validate category values
*/

-- Rename and change type of category column
ALTER TABLE team_members 
DROP COLUMN category,
ADD COLUMN categories text[] NOT NULL DEFAULT '{}';

-- Add check constraint to ensure at least one category
ALTER TABLE team_members
ADD CONSTRAINT team_members_categories_not_empty 
CHECK (array_length(categories, 1) > 0);

-- Add check constraint to validate category values
ALTER TABLE team_members
ADD CONSTRAINT team_members_categories_valid 
CHECK (categories <@ ARRAY['leadership', 'counselor', 'coach', 'tutor']::text[]);