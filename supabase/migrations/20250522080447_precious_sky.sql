-- Drop the category column if it exists
ALTER TABLE team_members DROP COLUMN IF EXISTS category;

-- Ensure team_member_tags exists and has correct schema
CREATE TABLE IF NOT EXISTS team_member_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#0085c2',
  created_at timestamptz DEFAULT now()
);

-- Ensure team_members_tags exists and has correct schema
CREATE TABLE IF NOT EXISTS team_members_tags (
  member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES team_member_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (member_id, tag_id)
);

-- Enable RLS
ALTER TABLE team_member_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow public read access to team_member_tags" ON team_member_tags;
  DROP POLICY IF EXISTS "Allow authenticated users to manage team_member_tags" ON team_member_tags;
  DROP POLICY IF EXISTS "Allow public read access to team_members_tags" ON team_members_tags;
  DROP POLICY IF EXISTS "Allow authenticated users to manage team_members_tags" ON team_members_tags;
EXCEPTION
  WHEN others THEN NULL;
END $$;

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