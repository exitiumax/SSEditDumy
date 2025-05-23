/*
  # Add event tags management

  1. New Tables
    - `event_types`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamptz)

  2. Changes
    - Add event_type_id to events table
    - Remove type column from events table
    - Add foreign key constraint

  3. Security
    - Enable RLS on event_types table
    - Add policies for authenticated users to manage event types
    - Add policy for public read access
*/

-- Create event_types table
CREATE TABLE event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add event_type_id to events table
ALTER TABLE events
ADD COLUMN event_type_id uuid REFERENCES event_types(id);

-- Copy existing type values to new table and update references
DO $$
DECLARE
  type_record RECORD;
  new_type_id uuid;
BEGIN
  -- Create entries for existing types
  FOR type_record IN SELECT DISTINCT type FROM events WHERE type IS NOT NULL LOOP
    INSERT INTO event_types (name)
    VALUES (type_record.type)
    RETURNING id INTO new_type_id;
    
    -- Update events to use new type_id
    UPDATE events
    SET event_type_id = new_type_id
    WHERE type = type_record.type;
  END LOOP;
END $$;

-- Make event_type_id required
ALTER TABLE events
ALTER COLUMN event_type_id SET NOT NULL;

-- Remove old type column
ALTER TABLE events
DROP COLUMN type;

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

-- Insert default event types
INSERT INTO event_types (name) VALUES
  ('Workshop'),
  ('Seminar'),
  ('Info Session'),
  ('Webinar'),
  ('Open House'),
  ('College Fair'),
  ('Test Prep'),
  ('Parent Night')
ON CONFLICT (name) DO NOTHING;