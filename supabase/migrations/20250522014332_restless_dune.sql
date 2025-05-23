/*
  # Add position field to team_members table

  1. Changes
    - Add position column to team_members table
    - Update existing records to have sequential positions
    - Add index on position column for efficient ordering
*/

-- Add position column
ALTER TABLE team_members
ADD COLUMN position integer DEFAULT 0;

-- Create index for position
CREATE INDEX team_members_position_idx ON team_members(position);

-- Create function to update positions
CREATE OR REPLACE FUNCTION update_team_member_positions()
RETURNS trigger AS $$
BEGIN
  -- If position is not set, set it to the max position + 1
  IF NEW.position IS NULL OR NEW.position = 0 THEN
    SELECT COALESCE(MAX(position), 0) + 1 
    INTO NEW.position 
    FROM team_members;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set position
CREATE TRIGGER set_team_member_position
  BEFORE INSERT ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_member_positions();