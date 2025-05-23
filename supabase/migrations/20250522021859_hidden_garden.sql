-- Create a function to update team member positions in a transaction
CREATE OR REPLACE FUNCTION update_team_positions(position_updates json[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update positions in a single transaction
  FOR i IN 1..array_length(position_updates, 1) LOOP
    UPDATE team_members
    SET position = (position_updates[i]->>'position')::integer,
        updated_at = now()
    WHERE id = (position_updates[i]->>'id')::uuid;
  END LOOP;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_team_positions TO authenticated;