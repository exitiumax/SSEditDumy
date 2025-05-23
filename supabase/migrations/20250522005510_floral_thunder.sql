/*
  # Add job postings table

  1. New Tables
    - `job_postings`
      - `id` (uuid, primary key)
      - `title` (text)
      - `type` (text) - Full-time, Part-time, Contract
      - `location` (text)
      - `description` (text)
      - `requirements` (text[])
      - `salary_range` (text) - Optional
      - `status` (text) - Active, Filled, Draft
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage job postings
    - Add policy for public read access to active jobs
*/

CREATE TABLE job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  requirements text[] NOT NULL DEFAULT '{}',
  salary_range text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to active job_postings"
  ON job_postings
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Allow authenticated users to manage job_postings"
  ON job_postings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);