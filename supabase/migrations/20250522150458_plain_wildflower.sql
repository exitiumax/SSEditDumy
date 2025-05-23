/*
  # Add updated_at column to team_member_tags table

  1. Changes
    - Add `updated_at` column to `team_member_tags` table
    - Add trigger to automatically update `updated_at` column
  
  2. Technical Details
    - Column type: timestamptz with default NOW()
    - Trigger updates `updated_at` on each row update
*/

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'team_member_tags' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE team_member_tags 
    ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_team_member_tags_updated_at'
  ) THEN
    CREATE TRIGGER update_team_member_tags_updated_at
    BEFORE UPDATE ON team_member_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;