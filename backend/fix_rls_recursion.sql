-- Fix RLS Recursion Issues
-- This script fixes the infinite recursion in RLS policies

-- First, disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE surveys DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
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

-- Create a helper function to check user role without recursion
CREATE OR REPLACE FUNCTION is_user_role(user_id_param BIGINT, role_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id_param 
        AND role = role_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable RLS with fixed policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Fixed Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (is_user_role(auth.uid()::text::bigint, 'admin'));

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (is_user_role(auth.uid()::text::bigint, 'admin'));

-- Fixed Surveys table policies
CREATE POLICY "Everyone can view published surveys" ON surveys
  FOR SELECT USING (status = 'PUBLISHED');

CREATE POLICY "Survey creators can view own surveys" ON surveys
  FOR SELECT USING (created_by = auth.uid()::text::bigint);

CREATE POLICY "Faculty/Admin can create surveys" ON surveys
  FOR INSERT WITH CHECK (
    created_by = auth.uid()::text::bigint AND
    (is_user_role(auth.uid()::text::bigint, 'faculty') OR 
     is_user_role(auth.uid()::text::bigint, 'admin'))
  );

CREATE POLICY "Survey creators can update own surveys" ON surveys
  FOR UPDATE USING (created_by = auth.uid()::text::bigint);

-- Fixed Questions table policies
CREATE POLICY "Everyone can view questions of published surveys" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = questions.survey_id 
      AND surveys.status = 'PUBLISHED'
    )
  );

CREATE POLICY "Survey creators can manage questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = questions.survey_id 
      AND surveys.created_by = auth.uid()::text::bigint
    )
  );

-- Fixed Responses table policies
CREATE POLICY "Users can view own responses" ON responses
  FOR SELECT USING (user_id = auth.uid()::text::bigint);

CREATE POLICY "Users can create own responses" ON responses
  FOR INSERT WITH CHECK (user_id = auth.uid()::text::bigint);

CREATE POLICY "Survey creators can view survey responses" ON responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = responses.survey_id 
      AND surveys.created_by = auth.uid()::text::bigint
    )
  );

-- Fixed Answers table policies
CREATE POLICY "Users can view own answers" ON answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM responses 
      WHERE responses.id = answers.response_id 
      AND responses.user_id = auth.uid()::text::bigint
    )
  );

CREATE POLICY "Users can create own answers" ON answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM responses 
      WHERE responses.id = answers.response_id 
      AND responses.user_id = auth.uid()::text::bigint
    )
  );

CREATE POLICY "Survey creators can view survey answers" ON answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM responses 
      WHERE responses.id = answers.response_id
      AND EXISTS (
        SELECT 1 FROM surveys 
        WHERE surveys.id = responses.survey_id 
        AND surveys.created_by = auth.uid()::text::bigint
      )
    )
  );

-- Fixed Comments table policies
CREATE POLICY "Everyone can view comments on published surveys" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = comments.survey_id 
      AND surveys.status = 'PUBLISHED'
    )
  );

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (user_id = auth.uid()::text::bigint);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid()::text::bigint);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (user_id = auth.uid()::text::bigint);

-- Fixed Likes table policies
CREATE POLICY "Users can view likes on published surveys" ON likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = likes.survey_id 
      AND surveys.status = 'PUBLISHED'
    )
  );

CREATE POLICY "Users can manage own likes" ON likes
  FOR ALL USING (user_id = auth.uid()::text::bigint);
