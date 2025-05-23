/*
  # Add event types and update events schema

  1. Changes
    - Create event_types table if it doesn't exist
    - Add event_type_id to events table
    - Migrate existing event types
    - Remove old type column
    - Add RLS policies

  2. Security
    - Enable RLS on event_types table
    - Add policies for public read access
    - Add policies for authenticated users to manage
*/

-- Only create event_types if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_types') THEN
    CREATE TABLE event_types (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL UNIQUE,
      created_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Allow public read access to event_types"
      ON event_types
      FOR SELECT
      TO public
      USING (true);

    CREATE POLICY "Allow authenticated users to manage event_types"
      ON event_types
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);

    -- Add default event types
    INSERT INTO event_types (name) VALUES
      ('Workshop'),
      ('Seminar'),
      ('Info Session');
  END IF;
END $$;

-- Add event_type_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'event_type_id'
  ) THEN
    ALTER TABLE events
    ADD COLUMN event_type_id uuid REFERENCES event_types(id);

    -- Update existing events to use appropriate type
    UPDATE events
    SET event_type_id = (SELECT id FROM event_types WHERE name = 'Workshop')
    WHERE type = 'workshop';

    UPDATE events
    SET event_type_id = (SELECT id FROM event_types WHERE name = 'Seminar')
    WHERE type = 'seminar';

    UPDATE events
    SET event_type_id = (SELECT id FROM event_types WHERE name = 'Info Session')
    WHERE type = 'info-session';

    -- Make event_type_id required
    ALTER TABLE events
    ALTER COLUMN event_type_id SET NOT NULL;
  END IF;
END $$;

-- Remove old type column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE events
    DROP COLUMN type;
  END IF;
END $$;