/*
  # Drop Unused User ID Index

  ## Overview
  The security audit has identified that the index `idx_scrapes_user_id` on the `scrapes` table
  is not currently being used. This can occur when:
  - The table has insufficient data for PostgreSQL to prefer index scans over sequential scans
  - Query patterns don't align with the index structure
  - The index overhead outweighs its benefits for current usage patterns

  ## Changes
  1. Drop the unused `idx_scrapes_user_id` index to reduce write overhead
  2. The index can be recreated in the future if query patterns change or data volume increases

  ## Impact
  - Reduces storage overhead
  - Improves INSERT, UPDATE, and DELETE performance on the scrapes table
  - Sequential scans will continue to be used for user_id filtering (optimal for current data volume)
  
  ## Future Considerations
  If the application scales and queries filtering by user_id become slow, consider recreating
  the index with: CREATE INDEX idx_scrapes_user_id ON scrapes(user_id);
*/

-- Drop the unused index
DROP INDEX IF EXISTS idx_scrapes_user_id;

-- Update table statistics
ANALYZE scrapes;
