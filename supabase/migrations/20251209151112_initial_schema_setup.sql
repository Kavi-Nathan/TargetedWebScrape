/*
  # Complete Database Schema Setup
  
  ## Overview
  This migration sets up the complete database schema for the web scraper application with AI analysis capabilities.
  
  ## Tables Created
  
  ### 1. profiles
  User profile data linked to authentication
  - `id` (uuid, FK to auth.users) - User ID
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `avatar_url` (text) - Profile avatar URL
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. scrapes
  Web scraping and AI analysis results
  - `id` (uuid, PK) - Unique scrape ID
  - `user_id` (uuid, FK to auth.users) - Owner of the scrape
  - `url` (text) - URL that was scraped
  - `keyword` (text) - Research keyword/phrase
  - `status` (text) - Status: pending, completed, failed
  - `content` (text) - Scraped HTML content
  - `scraped_content` (text) - Raw content from API
  - `title` (text) - Page title
  - `url_summary` (text) - Summary of the input URL content
  - `origin_analysis` (text) - AI-generated historical analysis
  - `trends_analysis` (text) - AI-generated trends/forecasts
  - `reference_links` (jsonb) - Reference URLs used in analysis
  - `social_media_posts` (text) - Generated social media content
  - `error` (text) - Error message if failed
  - `created_at` (timestamptz) - Creation timestamp
  - `completed_at` (timestamptz) - Completion timestamp
  
  ## Security
  
  ### RLS Policies
  All tables have Row Level Security enabled with strict user-based access control:
  
  **Profiles:**
  - Users can view only their own profile
  - Users can update only their own profile
  - Users can insert only their own profile
  
  **Scrapes:**
  - Authenticated users can view only their own scrapes
  - Authenticated users can insert scrapes for themselves
  - Authenticated users can update only their own scrapes
  - Service role can update any scrape (for edge function processing)
  
  ### Functions & Triggers
  - `handle_new_user()` - Automatically creates a profile when a user signs up
  - Trigger on auth.users INSERT to execute handle_new_user()
  
  ## Performance
  - Optimized RLS policies using `(select auth.uid())` for better performance
  - Secure function implementation with immutable search_path
  
  ## Notes
  - All timestamps use timestamptz for timezone awareness
  - RLS ensures complete data isolation between users
  - Service role maintains necessary permissions for background operations
*/

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scrapes table
CREATE TABLE IF NOT EXISTS scrapes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  keyword text,
  status text NOT NULL DEFAULT 'pending',
  content text,
  scraped_content text,
  title text,
  url_summary text,
  origin_analysis text,
  trends_analysis text,
  reference_links jsonb DEFAULT '[]'::jsonb,
  social_media_posts text,
  error text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrapes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES FOR PROFILES
-- ============================================================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- CREATE RLS POLICIES FOR SCRAPES
-- ============================================================================

CREATE POLICY "Users can view own scrapes"
  ON scrapes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own scrapes"
  ON scrapes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own scrapes"
  ON scrapes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Service role can update scrapes"
  ON scrapes FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- CREATE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- UPDATE STATISTICS
-- ============================================================================

ANALYZE profiles;
ANALYZE scrapes;