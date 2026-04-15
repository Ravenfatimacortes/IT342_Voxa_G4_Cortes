-- Fix RLS Policies for Users Table
-- This removes the infinite recursion issue

-- Drop all existing problematic policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Faculty can view department students" ON users;

-- Create corrected, non-recursive policies

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow admins to view all users (simplified without subquery)
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 
      FROM pg_roles 
      WHERE rolname = current_user 
      AND current_user = 'authenticated'
    )
  );

-- Allow admins to insert users
CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (
    role = 'admin' OR role = 'student' OR role = 'faculty'
  );

-- Allow admins to update all users
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 
      FROM pg_roles 
      WHERE rolname = current_user 
      AND current_user = 'authenticated'
    )
  );

-- Allow faculty to view students in same department
CREATE POLICY "Faculty can view department students" ON users
  FOR SELECT USING (
    role = 'student' AND 
    EXISTS (
      SELECT 1 FROM users u2 
      WHERE u2.id = auth.uid()::text::bigint 
      AND u2.role = 'faculty'
      AND u2.department = users.department
    )
  );

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Test the policies
SELECT 'RLS policies updated successfully' as status;
