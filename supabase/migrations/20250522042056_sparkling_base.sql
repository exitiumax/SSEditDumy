/*
  # Update Events Schema

  1. Changes
    - Clear existing events table
    - Add tags support for events
    - Add color field for calendar display
    - Add online/in-person status field
    - Add registration deadline
    - Add cancellation policy
    - Add event status field

  2. Security
    - Maintain existing RLS policies
*/

-- First clear existing events
DELETE FROM events;

-- Create event_tags table
CREATE TABLE IF NOT EXISTS event_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#0085c2',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on event_tags
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for event_tags
CREATE POLICY "Allow public read access to event_tags"
  ON event_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage event_tags"
  ON event_tags
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add new columns to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS format text NOT NULL DEFAULT 'in-person'
  CHECK (format IN ('in-person', 'online', 'hybrid')),
ADD COLUMN IF NOT EXISTS registration_deadline timestamptz,
ADD COLUMN IF NOT EXISTS cancellation_policy text,
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'scheduled'
  CHECK (status IN ('scheduled', 'cancelled', 'completed')),
ADD COLUMN IF NOT EXISTS tag_id uuid REFERENCES event_tags(id);

-- Insert default event tags
INSERT INTO event_tags (name, color) VALUES
  ('Parent Workshop', '#0085c2'),
  ('College Prep', '#FFB546'),
  ('Test Prep', '#34D399'),
  ('Academic Support', '#8B5CF6'),
  ('Info Session', '#EC4899'),
  ('Special Event', '#F59E0B')
ON CONFLICT (name) DO NOTHING;