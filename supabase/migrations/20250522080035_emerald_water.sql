-- Check and create team_member_tags table if it doesn't exist
DO $$ 
BEGIN
  -- Insert default tags if they don't exist
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

  -- Migrate existing categories to tags if not already done
  INSERT INTO team_members_tags (member_id, tag_id)
  SELECT DISTINCT
    tm.id as member_id,
    tt.id as tag_id
  FROM team_members tm
  CROSS JOIN team_member_tags tt
  WHERE 
    (tm.category = 'leadership' AND tt.name = 'Leadership') OR
    (tm.category = 'counselor' AND tt.name = 'College Counselor') OR
    (tm.category = 'coach' AND tt.name = 'Test Prep Coach') OR
    (tm.category = 'tutor' AND tt.name = 'Academic Tutor')
  ON CONFLICT (member_id, tag_id) DO NOTHING;

  -- Drop the category column if it still exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'team_members' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE team_members DROP COLUMN category;
  END IF;
END $$;