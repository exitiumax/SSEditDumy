/*
  # Team Member Tags System

  1. New Tables
    - `team_member_tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `color` (text)
      - `created_at` (timestamptz)

    - `team_members_tags` (junction table)
      - `member_id` (uuid, references team_members)
      - `tag_id` (uuid, references team_member_tags)

  2. Changes
    - Keep existing category column temporarily for backward compatibility
    - Add new tags relationship
    - Migrate existing categories to tags

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
    - Add policies for public read access
*/

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
  ('College Counselor', '#FFB546'),
  ('Test Prep Coach', '#34D399'),
  ('Academic Tutor', '#8B5CF6'),
  ('Executive Function Coach', '#EC4899'),
  ('Writing Specialist', '#F59E0B'),
  ('Math Specialist', '#3B82F6'),
  ('Science Specialist', '#10B981')
ON CONFLICT (name) DO NOTHING;

-- Migrate existing categories to tags
INSERT INTO team_members_tags (member_id, tag_id)
SELECT 
  tm.id as member_id,
  tt.id as tag_id
FROM team_members tm
CROSS JOIN team_member_tags tt
WHERE 
  (tm.category = 'leadership' AND tt.name = 'Leadership') OR
  (tm.category = 'counselor' AND tt.name = 'College Counselor') OR
  (tm.category = 'coach' AND tt.name = 'Test Prep Coach') OR
  (tm.category = 'tutor' AND tt.name = 'Academic Tutor');