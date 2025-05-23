/*
  # Revert team members table to single category

  1. Changes
    - Replace categories array with single category column
    - Remove array constraints
    - Keep position column and trigger

  2. Security
    - Maintain existing RLS policies
*/

-- First drop the existing constraints
ALTER TABLE team_members
DROP CONSTRAINT IF EXISTS team_members_categories_not_empty,
DROP CONSTRAINT IF EXISTS team_members_categories_valid;

-- Drop categories column and add single category column
ALTER TABLE team_members 
DROP COLUMN IF EXISTS categories;

ALTER TABLE team_members
ADD COLUMN category text NOT NULL DEFAULT 'leadership';

-- Update any existing records to have a valid category
UPDATE team_members 
SET category = 'leadership' 
WHERE category IS NULL OR category = '';

-- Add check constraint to validate category values
ALTER TABLE team_members
ADD CONSTRAINT team_members_category_valid 
CHECK (category IN ('leadership', 'counselor', 'coach', 'tutor'));