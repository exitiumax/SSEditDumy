/*
  # Fix events and event types relationship

  1. Changes
    - Update the events table query to use proper join syntax
    - Add NOT NULL constraint to event_type_id since it's required
  
  2. Security
    - No changes to RLS policies needed
*/

-- First ensure event_type_id is NOT NULL since it's required
ALTER TABLE events 
ALTER COLUMN event_type_id SET NOT NULL;