-- Fix RLS policies that are causing infinite recursion

-- Remove the problematic admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a simpler admin policy using auth.jwt() to avoid recursion
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  (auth.jwt()->>'email') IN ('fitlevel2025@gmail.com', 'admin@fitlevel.com')
);

-- Add policy for admins to insert profiles (for creating academies)
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (
  (auth.jwt()->>'email') IN ('fitlevel2025@gmail.com', 'admin@fitlevel.com')
);

-- Also add policy for admins to update profiles
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE USING (
  (auth.jwt()->>'email') IN ('fitlevel2025@gmail.com', 'admin@fitlevel.com')
);