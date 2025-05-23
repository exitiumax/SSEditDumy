/*
  # Team Member Tags Schema

  1. New Tables
    - `team_member_tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `color` (text, default blue)
      - `created_at` (timestamp)
    
    - `team_members_tags` (junction table)
      - `team_member_id` (uuid, foreign key to team_members)
      - `tag_id` (uuid, foreign key to team_member_tags)
      - Primary key is composite of both columns

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Public read access
      - Authenticated users can manage tags
*/

-- Create the tags table
CREATE TABLE IF NOT EXISTS team_member_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#0085c2',
  created_at timestamptz DEFAULT now()
);

-- Create the junction table
CREATE TABLE IF NOT EXISTS team_members_tags (
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES team_member_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (team_member_id, tag_id)
);

-- Enable RLS
ALTER TABLE team_member_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members_tags ENABLE ROW LEVEL SECURITY;

-- Policies for team_member_tags
CREATE POLICY "Allow public read access to team_member_tags"
  ON team_member_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage team_member_tags"
  ON team_member_tags
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for team_members_tags
CREATE POLICY "Allow public read access to team_members_tags"
  ON team_members_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage team_members_tags"
  ON team_members_tags
  TO authenticated
  USING (true)
  WITH CHECK (true);