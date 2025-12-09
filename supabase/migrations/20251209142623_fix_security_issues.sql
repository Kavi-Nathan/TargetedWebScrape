/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses critical security and performance issues identified in RLS policies and database functions.

  ## Changes Made

  ### 1. RLS Performance Optimization
  All RLS policies now use `(select auth.uid())` instead of `auth.uid()` to prevent re-evaluation for each row.
  This significantly improves query performance at scale.

  ### 2. Remove Conflicting Policies
  The scrapes table had duplicate permissive policies that created security vulnerabilities:
  - Removed "Anyone can..." policies (too permissive)
  - Kept user-specific policies that properly restrict access

  ### 3. Function Security
  Fixed `handle_new_user()` function to use immutable search_path for security.

  ### 4. Recreate Optimized Policies
  
  **Profiles Table:**
  - Users can view their own profile
  - Users can update their own profile  
  - Users can insert their own profile
  
  **Scrapes Table:**
  - Authenticated users can view only their own scrapes
  - Authenticated users can insert scrapes (automatically assigned to them)
  - Authenticated users can update only their own scrapes
  - Service role can update any scrape (for edge function)

  ## Security Notes
  - All policies now properly enforce user ownership
  - No data leakage between users
  - Service role maintains necessary permissions for background operations
  - Function uses secure search_path to prevent SQL injection
*/

-- ============================================================================
-- 1. DROP ALL EXISTING POLICIES TO START FRESH
-- ============================================================================

-- Drop profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Drop ALL scrapes policies (both old "Anyone" and new "Users" versions)
DROP POLICY IF EXISTS "Anyone can insert scrapes" ON scrapes;
DROP POLICY IF EXISTS "Anyone can read scrapes" ON scrapes;
DROP POLICY IF EXISTS "Anyone can update scrapes" ON scrapes;
DROP POLICY IF EXISTS "Users can view own scrapes" ON scrapes;
DROP POLICY IF EXISTS "Users can insert own scrapes" ON scrapes;
DROP POLICY IF EXISTS "Users can update own scrapes" ON scrapes;
DROP POLICY IF EXISTS "Service role can update scrapes" ON scrapes;

-- ============================================================================
-- 2. CREATE OPTIMIZED PROFILES POLICIES
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
-- 3. CREATE OPTIMIZED SCRAPES POLICIES
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
-- 4. FIX FUNCTION SEARCH PATH SECURITY
-- ============================================================================

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
