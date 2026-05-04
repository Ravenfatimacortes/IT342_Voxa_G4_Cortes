-- Add profile_picture column to users table
-- Run this in your Supabase SQL Editor

ALTER TABLE users 
ADD COLUMN profile_picture TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.profile_picture IS 'Profile picture stored as base64 data URL';
