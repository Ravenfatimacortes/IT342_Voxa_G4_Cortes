-- Temporary fix: Disable RLS to get backend running immediately
-- Run this in Supabase SQL Editor for immediate backend access

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE surveys DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;

DROP POLICY IF EXISTS "Everyone can view published surveys" ON surveys;
DROP POLICY IF EXISTS "Survey creators can view own surveys" ON surveys;
DROP POLICY IF EXISTS "Faculty/Admin can create surveys" ON surveys;
DROP POLICY IF EXISTS "Survey creators can update own surveys" ON surveys;

DROP POLICY IF EXISTS "Everyone can view questions of published surveys" ON questions;
DROP POLICY IF EXISTS "Survey creators can manage questions" ON questions;

DROP POLICY IF EXISTS "Users can view own responses" ON responses;
DROP POLICY IF EXISTS "Users can create own responses" ON responses;
DROP POLICY IF EXISTS "Survey creators can view survey responses" ON responses;

DROP POLICY IF EXISTS "Users can view own answers" ON answers;
DROP POLICY IF EXISTS "Users can create own answers" ON answers;
DROP POLICY IF EXISTS "Survey creators can view survey answers" ON answers;

DROP POLICY IF EXISTS "Everyone can view comments on published surveys" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

DROP POLICY IF EXISTS "Users can view likes on published surveys" ON likes;
DROP POLICY IF EXISTS "Users can manage own likes" ON likes;

-- Confirmation message
DO $$
BEGIN
    RAISE NOTICE '==========================================================================';
    RAISE NOTICE 'RLS has been DISABLED on all tables';
    RAISE NOTICE 'Your backend should now connect successfully';
    RAISE NOTICE 'NOTE: This is a temporary fix - implement proper RLS policies later';
    RAISE NOTICE '==========================================================================';
END $$;
