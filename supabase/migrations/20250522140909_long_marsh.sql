/*
  # Fix team member schema

  1. Changes
    - Drop tag-related tables
    - Add category column to team_members
    - Add constraint for valid categories

  2. Security
    - No changes to RLS policies needed
*/

-- Drop tag-related tables
DROP TABLE IF EXISTS team_members_tags CASCADE;
DROP TABLE IF EXISTS team_member_tags CASCADE;

-- Add category column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'team_members' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE team_members
    ADD COLUMN category text NOT NULL DEFAULT 'leadership';
  END IF;
END $$;

-- Add check constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'team_members_category_valid'
  ) THEN
    ALTER TABLE team_members
    ADD CONSTRAINT team_members_category_valid 
    CHECK (category IN ('leadership', 'counselor', 'coach', 'tutor'));
  END IF;
END $$;