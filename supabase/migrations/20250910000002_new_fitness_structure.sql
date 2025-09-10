-- Drop existing tables that will be recreated with new structure
DROP TABLE IF EXISTS challenge_progress CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS body_metrics CASCADE;
DROP TABLE IF EXISTS meals CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;

-- Drop and recreate profiles table with new structure
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table with new structure
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('aluno', 'academia', 'admin')),
  gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro')),
  birth_date DATE,
  contact TEXT,
  address TEXT,
  academy_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraint: academy_id should only be filled for type = 'aluno'
  CONSTRAINT academy_id_constraint CHECK (
    (type = 'aluno' AND academy_id IS NOT NULL) OR 
    (type != 'aluno' AND academy_id IS NULL)
  )
);

-- Create workouts table
CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_profiles UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- em minutos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create exercises table
CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  video TEXT, -- URL do vídeo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create workout_exercises table (junction table)
CREATE TABLE workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_workout UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  id_exercise UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  series INTEGER NOT NULL,
  repetitions INTEGER NOT NULL,
  weight NUMERIC(8,2), -- pode ser null
  ordem INTEGER, -- pode ser null
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
  
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Academias can view their students
CREATE POLICY "Academias can view their students" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND type = 'academia'
    ) AND academy_id = auth.uid()
  );

-- Students can view their academy
CREATE POLICY "Students can view their academy" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND type = 'aluno' AND academy_id = profiles.id
    )
  );

-- Create RLS policies for workouts
CREATE POLICY "Users can view their own workouts" ON workouts
  FOR SELECT USING (auth.uid() = id_profiles);
  
CREATE POLICY "Users can manage their own workouts" ON workouts
  FOR ALL USING (auth.uid() = id_profiles);

-- Academias can view workouts of their students
CREATE POLICY "Academias can view student workouts" ON workouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = workouts.id_profiles 
      AND profiles.academy_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM profiles academy
        WHERE academy.id = auth.uid() AND academy.type = 'academia'
      )
    )
  );

-- Create RLS policies for exercises (all users can view)
CREATE POLICY "Everyone can view exercises" ON exercises
  FOR SELECT USING (true);

-- Admins can manage exercises
CREATE POLICY "Admins can manage exercises" ON exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Create RLS policies for workout_exercises
CREATE POLICY "Users can view their workout exercises" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.id_workout 
      AND workouts.id_profiles = auth.uid()
    )
  );

CREATE POLICY "Users can manage their workout exercises" ON workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.id_workout 
      AND workouts.id_profiles = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_profiles_type ON profiles(type);
CREATE INDEX idx_profiles_academy_id ON profiles(academy_id);
CREATE INDEX idx_workouts_id_profiles ON workouts(id_profiles);
CREATE INDEX idx_workout_exercises_id_workout ON workout_exercises(id_workout);
CREATE INDEX idx_workout_exercises_id_exercise ON workout_exercises(id_exercise);
CREATE INDEX idx_workout_exercises_ordem ON workout_exercises(id_workout, ordem);

-- Create triggers for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert some sample exercises
INSERT INTO exercises (name, video) VALUES
('Flexão de braço', 'https://example.com/flexao'),
('Agachamento', 'https://example.com/agachamento'),
('Prancha', 'https://example.com/prancha'),
('Burpee', 'https://example.com/burpee'),
('Abdominais', 'https://example.com/abdominais'),
('Polichinelo', 'https://example.com/polichinelo'),
('Afundo', 'https://example.com/afundo'),
('Mountain Climber', 'https://example.com/mountain-climber');

-- Insert admin user for existing user (update the existing profile)
UPDATE profiles SET type = 'admin' WHERE id = '12c84232-74e8-4923-86dc-b1812f9b30cd';

-- If the update didn't work (profile doesn't exist), insert it
INSERT INTO profiles (id, name, type) 
VALUES ('12c84232-74e8-4923-86dc-b1812f9b30cd', 'Luiz Gustavo Frota Santos', 'admin')
ON CONFLICT (id) DO UPDATE SET type = 'admin';