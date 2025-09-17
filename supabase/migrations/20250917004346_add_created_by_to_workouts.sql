-- Add created_by column to workouts table
ALTER TABLE workouts
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Update existing workouts to set created_by = id_profiles (for backward compatibility)
UPDATE workouts
SET created_by = id_profiles
WHERE created_by IS NULL;

-- Make created_by NOT NULL after updating existing records
ALTER TABLE workouts
ALTER COLUMN created_by SET NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_workouts_created_by ON workouts(created_by);