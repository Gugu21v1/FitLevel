-- ========================================
-- COMPLETE DATABASE RESTRUCTURE
-- Adding all new columns as specified
-- ========================================

-- ========================================
-- 1. MODIFY PROFILES TABLE
-- ========================================

-- Rename contact to number
ALTER TABLE profiles RENAME COLUMN contact TO number;

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('ativo', 'inativo', 'suspenso')) DEFAULT 'ativo';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing constraint to include new status values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_type_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_type_check CHECK (type IN ('aluno', 'academia', 'admin'));

-- ========================================
-- 2. MODIFY WORKOUTS TABLE
-- ========================================

-- Add new columns to workouts table
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('iniciante', 'intermediario', 'avancado', 'expert'));

-- ========================================
-- 3. MODIFY EXERCISES TABLE
-- ========================================

-- Add new columns to exercises table
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS muscle_group TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS instructions TEXT;

-- ========================================
-- 4. MODIFY WORKOUT_EXERCISES TABLE
-- ========================================

-- Add new columns to workout_exercises table
ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS rest_time TEXT; -- Can store seconds as integer or instruction as text
ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Add updated_at trigger for workout_exercises
CREATE TRIGGER update_workout_exercises_updated_at BEFORE UPDATE ON workout_exercises
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ========================================
-- 5. UPDATE SAMPLE DATA
-- ========================================

-- Update existing profiles with new fields
UPDATE profiles SET 
  status = 'ativo',
  email = 'admin@fitlevel.com'
WHERE type = 'admin' AND email IS NULL;

-- Update exercises with additional information
UPDATE exercises SET 
  muscle_group = CASE 
    WHEN name = 'Flexão de braço' THEN 'peitoral'
    WHEN name = 'Agachamento' THEN 'pernas'
    WHEN name = 'Prancha' THEN 'core'
    WHEN name = 'Burpee' THEN 'corpo_completo'
    WHEN name = 'Abdominais' THEN 'core'
    WHEN name = 'Polichinelo' THEN 'cardio'
    WHEN name = 'Afundo' THEN 'pernas'
    WHEN name = 'Mountain Climber' THEN 'cardio'
    ELSE 'geral'
  END,
  equipment = CASE 
    WHEN name = 'Flexão de braço' THEN 'peso_corporal'
    WHEN name = 'Agachamento' THEN 'peso_corporal'
    WHEN name = 'Prancha' THEN 'peso_corporal'
    WHEN name = 'Burpee' THEN 'peso_corporal'
    WHEN name = 'Abdominais' THEN 'peso_corporal'
    WHEN name = 'Polichinelo' THEN 'peso_corporal'
    WHEN name = 'Afundo' THEN 'peso_corporal'
    WHEN name = 'Mountain Climber' THEN 'peso_corporal'
    ELSE 'variado'
  END,
  instructions = CASE 
    WHEN name = 'Flexão de braço' THEN 'Posicione-se em prancha, desça o peito em direção ao chão e empurre de volta.'
    WHEN name = 'Agachamento' THEN 'Pés afastados na largura dos ombros, desça como se fosse sentar e volte.'
    WHEN name = 'Prancha' THEN 'Mantenha o corpo reto apoiado nos antebraços e pontas dos pés.'
    WHEN name = 'Burpee' THEN 'Agache, apoie as mãos no chão, salte as pernas para trás, flexão, volte e salte.'
    WHEN name = 'Abdominais' THEN 'Deitado, eleve o tronco contraindo o abdômen.'
    WHEN name = 'Polichinelo' THEN 'Salte abrindo pernas e braços simultaneamente.'
    WHEN name = 'Afundo' THEN 'Dê um passo à frente, desça o joelho traseiro em direção ao chão.'
    WHEN name = 'Mountain Climber' THEN 'Em prancha, alterne trazendo os joelhos em direção ao peito.'
    ELSE 'Siga as instruções do seu instrutor.'
  END
WHERE muscle_group IS NULL;

-- ========================================
-- 6. INSERT ADDITIONAL SAMPLE DATA
-- ========================================

-- Insert more exercises with complete information
INSERT INTO exercises (name, video, muscle_group, equipment, instructions) VALUES
('Supino reto', 'https://example.com/supino', 'peitoral', 'barra_halteres', 'Deitado no banco, empurre a barra do peito para cima com controle.'),
('Leg Press', 'https://example.com/legpress', 'pernas', 'maquina', 'Sentado na máquina, empurre a plataforma com as pernas.'),
('Puxada alta', 'https://example.com/puxada', 'costas', 'maquina', 'Sentado, puxe a barra em direção ao peito.'),
('Desenvolvimento', 'https://example.com/desenvolvimento', 'ombros', 'halteres', 'Em pé ou sentado, empurre os halteres acima da cabeça.'),
('Rosca direta', 'https://example.com/rosca', 'biceps', 'halteres', 'Flexione os antebraços trazendo os halteres em direção aos ombros.');

-- Insert sample workouts
INSERT INTO workouts (id_profiles, name, duration, description, is_template, difficulty) 
SELECT 
  id as id_profiles,
  'Treino Iniciante Completo' as name,
  45 as duration,
  'Treino completo para iniciantes com foco em todos os grupos musculares' as description,
  true as is_template,
  'iniciante' as difficulty
FROM profiles 
WHERE type = 'admin' 
LIMIT 1;

-- Get the workout ID to add exercises
-- This will be referenced in workout_exercises

-- ========================================
-- 7. UPDATE RLS POLICIES FOR NEW COLUMNS
-- ========================================

-- No additional RLS changes needed as the existing policies cover the new columns

-- ========================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Indexes for new columns that will be frequently queried
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_workouts_difficulty ON workouts(difficulty);
CREATE INDEX IF NOT EXISTS idx_workouts_is_template ON workouts(is_template);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);

-- ========================================
-- COMPLETION MESSAGE
-- ========================================
-- All tables have been successfully updated with the new structure
-- New columns added:
-- 
-- PROFILES: status, photo_url, notes, email, contact->number
-- WORKOUTS: description, is_template, difficulty
-- EXERCISES: muscle_group, equipment, instructions  
-- WORKOUT_EXERCISES: rest_time, updated_at (with trigger)
--
-- Sample data has been updated and new records inserted