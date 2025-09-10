-- Remove the foreign key constraint that requires profiles.id to reference auth.users(id)
-- This allows us to create academy profiles without auth users for demo purposes

ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;

-- Make id field not depend on auth.users
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();