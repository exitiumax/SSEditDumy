/*
  # Clear team members table

  1. Changes
    - Remove all existing team members from the table
    - Keep the table structure intact
    - Maintain all existing policies and security settings

  2. Security
    - No changes to RLS policies
    - No changes to table structure
*/

-- Clear all records from team_members table
DELETE FROM team_members;