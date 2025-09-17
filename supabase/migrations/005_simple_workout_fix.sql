-- Migração simplificada sem academy_id

-- 1. Adicionar colunas faltantes na tabela exercises
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS public BOOLEAN DEFAULT true;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS muscle_group TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS instructions TEXT;

-- 2. Adicionar colunas faltantes na tabela workouts
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS id_profiles UUID REFERENCES profiles(id);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('iniciante', 'intermediário', 'avançado'));

-- 3. Verificar e adicionar colunas em workout_exercises (se necessário)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workout_exercises' 
                   AND column_name = 'series') THEN
        ALTER TABLE workout_exercises ADD COLUMN series INTEGER NOT NULL DEFAULT 3;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workout_exercises' 
                   AND column_name = 'repetitions') THEN
        ALTER TABLE workout_exercises ADD COLUMN repetitions INTEGER NOT NULL DEFAULT 10;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workout_exercises' 
                   AND column_name = 'weight') THEN
        ALTER TABLE workout_exercises ADD COLUMN weight DECIMAL(10, 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workout_exercises' 
                   AND column_name = 'rest_time') THEN
        ALTER TABLE workout_exercises ADD COLUMN rest_time INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workout_exercises' 
                   AND column_name = 'order_index') THEN
        ALTER TABLE workout_exercises ADD COLUMN order_index INTEGER;
    END IF;
END $$;

-- 4. Criar tabela para histórico de peso do usuário
CREATE TABLE IF NOT EXISTS user_exercise_weights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    workout_id UUID REFERENCES workouts(id),
    exercise_id UUID REFERENCES exercises(id),
    weight DECIMAL(10, 2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, workout_id, exercise_id)
);

-- 5. Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_exercises_public ON exercises(public);
CREATE INDEX IF NOT EXISTS idx_workouts_profiles ON workouts(id_profiles);
CREATE INDEX IF NOT EXISTS idx_workouts_template ON workouts(is_template);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(id_workouts);
CREATE INDEX IF NOT EXISTS idx_user_weights_user ON user_exercise_weights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_weights_workout ON user_exercise_weights(workout_id);

-- 6. Habilitar RLS nas tabelas
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_weights ENABLE ROW LEVEL SECURITY;

-- 7. Políticas básicas para exercises
DROP POLICY IF EXISTS "Exercícios públicos visíveis" ON exercises;
CREATE POLICY "Exercícios públicos visíveis" ON exercises
    FOR SELECT USING (public = true);

DROP POLICY IF EXISTS "Usuários podem inserir exercícios" ON exercises;
CREATE POLICY "Usuários podem inserir exercícios" ON exercises
    FOR INSERT WITH CHECK (true);

-- 8. Políticas básicas para workouts
DROP POLICY IF EXISTS "Usuário vê próprios treinos" ON workouts;
CREATE POLICY "Usuário vê próprios treinos" ON workouts
    FOR SELECT USING (id_profiles = auth.uid());

DROP POLICY IF EXISTS "Usuário pode criar treino" ON workouts;
CREATE POLICY "Usuário pode criar treino" ON workouts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuário pode editar treino" ON workouts;
CREATE POLICY "Usuário pode editar treino" ON workouts
    FOR UPDATE USING (id_profiles = auth.uid());

DROP POLICY IF EXISTS "Usuário pode deletar treino" ON workouts;
CREATE POLICY "Usuário pode deletar treino" ON workouts
    FOR DELETE USING (id_profiles = auth.uid());

-- 9. Políticas para workout_exercises
DROP POLICY IF EXISTS "Ver exercícios do treino" ON workout_exercises;
CREATE POLICY "Ver exercícios do treino" ON workout_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workouts
            WHERE workouts.id = workout_exercises.id_workouts
            AND workouts.id_profiles = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Inserir exercícios do treino" ON workout_exercises;
CREATE POLICY "Inserir exercícios do treino" ON workout_exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workouts
            WHERE workouts.id = workout_exercises.id_workouts
            AND workouts.id_profiles = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Atualizar exercícios do treino" ON workout_exercises;
CREATE POLICY "Atualizar exercícios do treino" ON workout_exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workouts
            WHERE workouts.id = workout_exercises.id_workouts
            AND workouts.id_profiles = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Deletar exercícios do treino" ON workout_exercises;
CREATE POLICY "Deletar exercícios do treino" ON workout_exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workouts
            WHERE workouts.id = workout_exercises.id_workouts
            AND workouts.id_profiles = auth.uid()
        )
    );

-- 10. Políticas para user_exercise_weights
DROP POLICY IF EXISTS "Ver próprios pesos" ON user_exercise_weights;
CREATE POLICY "Ver próprios pesos" ON user_exercise_weights
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Inserir próprios pesos" ON user_exercise_weights;
CREATE POLICY "Inserir próprios pesos" ON user_exercise_weights
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Atualizar próprios pesos" ON user_exercise_weights;
CREATE POLICY "Atualizar próprios pesos" ON user_exercise_weights
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Deletar próprios pesos" ON user_exercise_weights;
CREATE POLICY "Deletar próprios pesos" ON user_exercise_weights
    FOR DELETE USING (user_id = auth.uid());