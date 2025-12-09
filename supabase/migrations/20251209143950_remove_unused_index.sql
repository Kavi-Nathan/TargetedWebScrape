/*
  # Remove Unused Index

  ## Overview
  Removing the unused index `idx_scrapes_user_id_with_status` to reduce database overhead.
  The index is not being utilized by any queries and adds unnecessary overhead to write operations.

  ## Changes
  1. Drop the unused covering index on scrapes table
  2. Keep a simple index on user_id for basic filtering needs
  
  ## Impact
  - Reduces storage overhead
  - Improves INSERT and UPDATE performance on scrapes table
  - Maintains necessary indexing for user_id queries
*/

-- Drop the unused covering index
DROP INDEX IF EXISTS idx_scrapes_user_id_with_status;

-- Create a simpler, more efficient index for the actual query patterns
-- This index will be used for queries filtering by user_id
CREATE INDEX IF NOT EXISTS idx_scrapes_user_id ON scrapes(user_id);

-- Update statistics
ANALYZE scrapes;