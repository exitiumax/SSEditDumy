/*
  # Fix events type column

  1. Changes
    - Add type column back to events table
    - Add constraint to ensure valid type values
    - Set default type value

  2. Security
    - No changes to RLS policies
*/

-- Add type column back to events table
ALTER TABLE events
ADD COLUMN type text NOT NULL DEFAULT 'workshop';

-- Add constraint to ensure valid type values
ALTER TABLE events
ADD CONSTRAINT events_type_check
CHECK (type IN ('workshop', 'seminar', 'info-session'));