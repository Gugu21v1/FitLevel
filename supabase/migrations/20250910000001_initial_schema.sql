-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  avatar TEXT,
  birth_date DATE,
  height DECIMAL(5,2), -- em metros
  goal_weight DECIMAL(5,2), -- em kg
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  fitness_goal TEXT CHECK (fitness_goal IN ('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'improve_fitness')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('cardio', 'strength', 'flexibility', 'sports', 'other')),
  duration INTEGER NOT NULL, -- em minutos
  calories_burned INTEGER,
  exercises JSONB, -- array de exercícios com sets, reps, peso, etc
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  name TEXT NOT NULL,
  foods JSONB, -- array de alimentos com quantidades e calorias
  total_calories INTEGER,
  total_protein DECIMAL(8,2),
  total_carbs DECIMAL(8,2),
  total_fat DECIMAL(8,2),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create body_metrics table
CREATE TABLE IF NOT EXISTS body_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight DECIMAL(5,2), -- em kg
  body_fat DECIMAL(4,2), -- em porcentagem
  muscle_mass DECIMAL(5,2), -- em kg
  waist DECIMAL(5,2), -- em cm
  chest DECIMAL(5,2), -- em cm
  arm DECIMAL(5,2), -- em cm
  thigh DECIMAL(5,2), -- em cm
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('daily', 'weekly', 'monthly')) NOT NULL,
  goal_value INTEGER NOT NULL, -- valor objetivo (ex: 10000 passos, 5 treinos)
  goal_unit TEXT NOT NULL, -- unidade (ex: 'steps', 'workouts', 'minutes')
  points INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create challenge_progress table
CREATE TABLE IF NOT EXISTS challenge_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  current_value INTEGER DEFAULT 0,
  progress DECIMAL(5,2) DEFAULT 0, -- porcentagem de progresso
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
  
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Workouts policies
CREATE POLICY "Users can view their own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Meals policies
CREATE POLICY "Users can view their own meals" ON meals
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own meals" ON meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own meals" ON meals
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own meals" ON meals
  FOR DELETE USING (auth.uid() = user_id);

-- Body metrics policies
CREATE POLICY "Users can view their own body metrics" ON body_metrics
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own body metrics" ON body_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own body metrics" ON body_metrics
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own body metrics" ON body_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- Challenges policies (all users can read challenges)
CREATE POLICY "Anyone can view challenges" ON challenges
  FOR SELECT USING (true);

-- Challenge progress policies
CREATE POLICY "Users can view their own challenge progress" ON challenge_progress
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own challenge progress" ON challenge_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own challenge progress" ON challenge_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id_date ON workouts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meals_user_id_date ON meals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_id_date ON body_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_id ON challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_date_range ON challenges(start_date, end_date);

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

CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_challenge_progress_updated_at BEFORE UPDATE ON challenge_progress
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert some sample challenges
INSERT INTO challenges (title, description, type, goal_value, goal_unit, points, start_date, end_date) VALUES
('Passos Diários', 'Caminhe 10.000 passos por dia', 'daily', 10000, 'steps', 10, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
('Treinos Semanais', 'Complete 3 treinos por semana', 'weekly', 3, 'workouts', 25, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
('Hidratação Diária', 'Beba 2 litros de água por dia', 'daily', 2000, 'ml', 5, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
('Meta Mensal', 'Complete 20 treinos neste mês', 'monthly', 20, 'workouts', 100, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days');