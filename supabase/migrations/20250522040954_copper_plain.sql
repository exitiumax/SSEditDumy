/*
  # Fix event types relationship

  1. Changes
    - Remove duplicate event_type column from events table
    - Ensure event_type_id is properly set up as a foreign key
    - Add NOT NULL constraint to event_type_id
    - Add cascade delete for event_type_id

  2. Security
    - Maintain existing RLS policies
*/

-- First ensure event_type_id exists and is properly typed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'event_type_id'
  ) THEN
    ALTER TABLE events ADD COLUMN event_type_id uuid NOT NULL;
  END IF;
END $$;

-- Remove the duplicate event_type column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'event_type'
  ) THEN
    ALTER TABLE events DROP COLUMN event_type;
  END IF;
END $$;

-- Ensure foreign key constraint exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'events_event_type_id_fkey'
  ) THEN
    ALTER TABLE events
    ADD CONSTRAINT events_event_type_id_fkey
    FOREIGN KEY (event_type_id)
    REFERENCES event_types(id)
    ON DELETE CASCADE;
  END IF;
END $$;