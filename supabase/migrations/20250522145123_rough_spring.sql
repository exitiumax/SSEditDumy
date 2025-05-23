-- Drop all existing versions of the function
DROP FUNCTION IF EXISTS update_team_positions(json[]);
DROP FUNCTION IF EXISTS update_team_positions(jsonb[]);
DROP FUNCTION IF EXISTS update_team_positions(position_updates json[]);
DROP FUNCTION IF EXISTS update_team_positions(position_updates jsonb[]);

-- Create new function with a single parameter
CREATE OR REPLACE FUNCTION update_team_positions(updates jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update positions in a single transaction
  FOR i IN 0..jsonb_array_length(updates) - 1 LOOP
    UPDATE team_members
    SET position = (updates->i->>'position')::integer,
        updated_at = now()
    WHERE id = (updates->i->>'id')::uuid;
  END LOOP;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_team_positions(jsonb) TO authenticated;