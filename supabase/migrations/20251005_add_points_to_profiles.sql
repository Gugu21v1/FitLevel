-- Add points column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Update existing profiles to have 0 points
UPDATE profiles SET points = 0 WHERE points IS NULL;
