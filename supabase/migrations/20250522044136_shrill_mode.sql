/*
  # Page Builder System Schema

  1. New Tables
    - `pages`
      - Core page data and metadata
      - Version control support
      - SEO fields
    
    - `page_templates`
      - Reusable page templates
      - Default component configurations

    - `page_versions`
      - Version history for pages
      - Supports rollback functionality

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create pages table
CREATE TABLE pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  template_id uuid,
  components jsonb NOT NULL DEFAULT '[]',
  meta jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- Create page_templates table
CREATE TABLE page_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  thumbnail text NOT NULL,
  components jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create page_versions table
CREATE TABLE page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE,
  version integer NOT NULL,
  components jsonb NOT NULL,
  meta jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE (page_id, version)
);

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to manage pages"
  ON pages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to published pages"
  ON pages
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Allow authenticated users to manage page_templates"
  ON page_templates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to page_templates"
  ON page_templates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage page_versions"
  ON page_versions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to handle version control
CREATE OR REPLACE FUNCTION handle_page_version()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND 
      (OLD.components != NEW.components OR OLD.meta != NEW.meta)) THEN
    -- Create new version record
    INSERT INTO page_versions (
      page_id,
      version,
      components,
      meta,
      created_by
    ) VALUES (
      NEW.id,
      NEW.version,
      NEW.components,
      NEW.meta,
      auth.uid()
    );
    
    -- Increment version number
    NEW.version := OLD.version + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for version control
CREATE TRIGGER page_version_trigger
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION handle_page_version();

-- Insert default templates
INSERT INTO page_templates (name, description, thumbnail, components) VALUES
  (
    'Landing Page',
    'A template for marketing landing pages with hero section, features, and CTA',
    'https://res.cloudinary.com/davwtxoeo/image/upload/v1747888241/landing-template_ci8s6n.jpg',
    '[
      {
        "id": "hero",
        "type": "header",
        "content": {
          "title": "Welcome to Our Site",
          "subtitle": "Discover amazing features",
          "cta": "Get Started"
        },
        "settings": {
          "align": "center",
          "style": "default"
        }
      }
    ]'::jsonb
  ),
  (
    'Content Page',
    'A template for content-rich pages with sidebar navigation',
    'https://res.cloudinary.com/davwtxoeo/image/upload/v1747888241/content-template_ci8s6n.jpg',
    '[
      {
        "id": "content",
        "type": "content",
        "content": {
          "title": "Page Title",
          "body": "Add your content here"
        },
        "settings": {
          "layout": "sidebar"
        }
      }
    ]'::jsonb
  );