-- Add position column to team_member_tags if it doesn't exist
ALTER TABLE team_member_tags
ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;

-- Create index for position
CREATE INDEX IF NOT EXISTS team_member_tags_position_idx ON team_member_tags(position);

-- Update existing tags with sequential positions
WITH numbered_tags AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as new_position
  FROM team_member_tags
)
UPDATE team_member_tags
SET position = numbered_tags.new_position
FROM numbered_tags
WHERE team_member_tags.id = numbered_tags.id;

-- Create function to update tag positions
CREATE OR REPLACE FUNCTION update_tag_positions(updates jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update positions in a single transaction
  FOR i IN 0..jsonb_array_length(updates) - 1 LOOP
    UPDATE team_member_tags
    SET 
      position = (updates->i->>'position')::integer,
      updated_at = now()
    WHERE id = (updates->i->>'id')::uuid;
  END LOOP;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_tag_positions(jsonb) TO authenticated;