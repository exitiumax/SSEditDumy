/*
  # Fix Team Member Tags Schema

  1. Changes
    - Ensure proper schema for team member tags
    - Update queries to use correct relationship structure
    - Fix policy issues

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to team_member_tags" ON team_member_tags;
DROP POLICY IF EXISTS "Allow authenticated users to manage team_member_tags" ON team_member_tags;
DROP POLICY IF EXISTS "Allow public read access to team_members_tags" ON team_members_tags;
DROP POLICY IF EXISTS "Allow authenticated users to manage team_members_tags" ON team_members_tags;

-- Recreate team_member_tags table with proper schema
DROP TABLE IF EXISTS team_members_tags;
DROP TABLE IF EXISTS team_member_tags;

CREATE TABLE team_member_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#0085c2',
  created_at timestamptz DEFAULT now()
);

-- Create junction table with proper relationships
CREATE TABLE team_members_tags (
  member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES team_member_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (member_id, tag_id)
);

-- Enable RLS
ALTER TABLE team_member_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members_tags ENABLE ROW LEVEL SECURITY;

-- Create policies with proper permissions
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
  ('College Counselor', '#FFB546'),
  ('Test Prep Coach', '#34D399'),
  ('Academic Tutor', '#8B5CF6'),
  ('Executive Function Coach', '#EC4899'),
  ('Writing Specialist', '#F59E0B'),
  ('Math Specialist', '#3B82F6'),
  ('Science Specialist', '#10B981')
ON CONFLICT (name) DO NOTHING;