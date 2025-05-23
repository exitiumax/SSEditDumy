/*
  # Add event_type column to events table

  1. Changes
    - Add event_type column to events table to fix missing column error
    - Update existing events to use event_type_id for event type relationship
    - Add foreign key constraint to ensure data integrity

  2. Notes
    - Preserves existing event_type_id relationships
    - Ensures backward compatibility
*/

-- First check if the column exists to avoid errors
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'event_type'
  ) THEN
    -- Add the event_type column as a foreign key reference
    ALTER TABLE events 
    ADD COLUMN event_type uuid REFERENCES event_types(id);

    -- Update the event_type column with existing event_type_id values
    UPDATE events 
    SET event_type = event_type_id;
  END IF;
END $$;