-- Drop all existing versions of the function
DROP FUNCTION IF EXISTS update_team_positions(json[]);
DROP FUNCTION IF EXISTS update_team_positions(jsonb[]);

-- Create new function with explicit JSONB type
CREATE OR REPLACE FUNCTION update_team_positions(updates jsonb[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  update_record jsonb;
BEGIN
  -- Update positions in a single transaction
  FOR update_record IN SELECT jsonb_array_elements(updates::jsonb) LOOP
    UPDATE team_members
    SET position = (update_record->>'position')::integer,
        updated_at = now()
    WHERE id = (update_record->>'id')::uuid;
  END LOOP;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_team_positions(jsonb[]) TO authenticated;