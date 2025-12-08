/*
  # Create Web Scraper Tables

  1. New Tables
    - `scrapes`
      - `id` (uuid, primary key) - Unique identifier for each scrape
      - `url` (text, not null) - The URL that was scraped
      - `status` (text, not null) - Status of the scrape: 'pending', 'completed', 'failed'
      - `content` (text) - The scraped HTML content
      - `title` (text) - Page title extracted from the content
      - `error` (text) - Error message if scraping failed
      - `created_at` (timestamptz) - When the scrape was initiated
      - `completed_at` (timestamptz) - When the scrape was completed
  
  2. Security
    - Enable RLS on `scrapes` table
    - Add policy for anyone to insert new scrape requests
    - Add policy for anyone to read scrape results (public scraper)
    - Add policy for anyone to update scrape status (needed by edge function)

  3. Notes
    - This is a public scraper where anyone can create and view scrapes
    - In production, you may want to add authentication and user-specific policies
*/

CREATE TABLE IF NOT EXISTS scrapes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  content text,
  title text,
  error text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE scrapes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert scrapes"
  ON scrapes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read scrapes"
  ON scrapes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update scrapes"
  ON scrapes FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);