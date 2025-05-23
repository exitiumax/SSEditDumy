/*
  # Remove status field from events table

  1. Changes
    - Remove status column from events table
    - Remove status check constraint
*/

-- Remove status column
ALTER TABLE events DROP COLUMN IF EXISTS status;