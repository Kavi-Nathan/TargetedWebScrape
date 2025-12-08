/*
  # Add Keyword Search and AI Analysis Fields

  1. Changes to `scrapes` table
    - Add `keyword` (text) - The keyword/phrase to research
    - Add `scraped_content` (text) - Raw content from Firecrawl API
    - Add `origin_analysis` (text) - AI-generated origin/historical analysis
    - Add `trends_analysis` (text) - AI-generated trends/future forecast
    - Add `reference_links` (jsonb) - Array of reference URLs used in analysis
    - Modify `content` to be optional (we'll use scraped_content instead)

  2. Notes
    - These fields support AI-powered research with keyword targeting
    - origin_analysis contains the historical "Moment of Truth" analysis
    - trends_analysis contains current trends and future forecasts
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scrapes' AND column_name = 'keyword'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN keyword text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scrapes' AND column_name = 'scraped_content'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN scraped_content text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scrapes' AND column_name = 'origin_analysis'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN origin_analysis text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scrapes' AND column_name = 'trends_analysis'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN trends_analysis text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scrapes' AND column_name = 'reference_links'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN reference_links jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;