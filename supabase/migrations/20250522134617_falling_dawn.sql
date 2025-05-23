/*
  # Team Member Tags System

  1. Changes
    - Drop existing tag-related tables
    - Create team_member_tags table with proper schema
    - Create team_members_tags junction table
    - Add proper foreign key relationships
    - Add RLS policies
    - Insert default tags

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public read access
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS team_members_tags CASCADE;
DROP TABLE IF EXISTS team_member_tags CASCADE;

-- Create team_member_tags table
CREATE TABLE team_member_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#0085c2',
  created_at timestamptz DEFAULT now()
);

-- Create junction table
CREATE TABLE team_members_tags (
  member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES team_member_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (member_id, tag_id)
);

-- Enable RLS
ALTER TABLE team_member_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to team_member_tags"
  ON team_member_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage team_member_tags"
  ON team_member_tags
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to team_members_tags"
  ON team_members_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage team_members_tags"
  ON team_members_tags
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default tags
INSERT INTO team_member_tags (name, color) VALUES
  ('Leadership', '#0085c2'),
  ('College Counseling', '#FFB546'),
  ('Tutor', '#34D399'),
  ('Executive Functioning Coach', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;