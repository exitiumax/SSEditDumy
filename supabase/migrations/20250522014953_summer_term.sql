/*
  # Fix team members schema

  1. Changes
    - Drop existing constraints on categories column
    - Recreate categories column with proper defaults and constraints
    - Add migration to update any existing records

  2. Security
    - Maintain existing RLS policies
*/

-- First drop the existing constraints
ALTER TABLE team_members
DROP CONSTRAINT IF EXISTS team_members_categories_not_empty,
DROP CONSTRAINT IF EXISTS team_members_categories_valid;

-- Drop and recreate the categories column with proper default
ALTER TABLE team_members 
DROP COLUMN IF EXISTS categories;

ALTER TABLE team_members
ADD COLUMN categories text[] NOT NULL DEFAULT ARRAY['leadership']::text[];

-- Add constraints back
ALTER TABLE team_members
ADD CONSTRAINT team_members_categories_not_empty 
CHECK (array_length(categories, 1) > 0);

ALTER TABLE team_members
ADD CONSTRAINT team_members_categories_valid 
CHECK (categories <@ ARRAY['leadership', 'counselor', 'coach', 'tutor']::text[]);

-- Update any existing records to have at least one category
UPDATE team_members 
SET categories = ARRAY['leadership']::text[] 
WHERE array_length(categories, 1) IS NULL OR array_length(categories, 1) = 0;