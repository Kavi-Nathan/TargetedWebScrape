/*
  # Add URL Summary Field

  1. Changes
    - Add `url_summary` column to `scrapes` table to store the summary of the input URL content
  
  2. Description
    - This field will store a consolidated summary of what the input URL is trying to convey
    - The summary will be displayed as the first section in the output
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scrapes' AND column_name = 'url_summary'
  ) THEN
    ALTER TABLE scrapes ADD COLUMN url_summary text;
  END IF;
END $$;