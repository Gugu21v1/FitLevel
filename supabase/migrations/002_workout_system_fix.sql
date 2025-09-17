-- Verificar e adicionar colunas faltantes na tabela exercises
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS public BOOLEAN DEFAULT true;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS muscle_group TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Adicionar colunas faltantes na tabela workouts
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS id_profiles UUID REFERENCES profiles(id);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('iniciante', 'intermediário', 'avançado'));

-- Verificar se a coluna correta existe em workout_exercises
-- Se a tabela usa 'id_workouts' ao invés de 'workout_id'
DO $$ 
BEGIN
    -- Adicionar colunas se não existirem
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

-- Criar tabela para histórico de peso do usuário se não existir
CREATE TABLE IF NOT EXISTS user_exercise_weights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    workout_id UUID REFERENCES workouts(id),
    exercise_id UUID REFERENCES exercises(id),
    weight DECIMAL(10, 2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, workout_id, exercise_id)
);

-- Criar índices apenas se não existirem
CREATE INDEX IF NOT EXISTS idx_exercises_public ON exercises(public);
CREATE INDEX IF NOT EXISTS idx_exercises_academy ON exercises(academy_id);
CREATE INDEX IF NOT EXISTS idx_workouts_profiles ON workouts(id_profiles);
CREATE INDEX IF NOT EXISTS idx_workouts_template ON workouts(is_template);
CREATE INDEX IF NOT EXISTS idx_workouts_academy ON workouts(academy_id);

-- RLS Policies (remover antigas se existirem e criar novas)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_weights ENABLE ROW LEVEL SECURITY;

-- Políticas para exercises
DROP POLICY IF EXISTS "Exercícios públicos visíveis para todos" ON exercises;
CREATE POLICY "Exercícios públicos visíveis para todos" ON exercises
    FOR SELECT USING (public = true);

DROP POLICY IF EXISTS "Exercícios privados visíveis para mesma academia" ON exercises;
CREATE POLICY "Exercícios privados visíveis para mesma academia" ON exercises
    FOR SELECT USING (
        public = false 
        AND academy_id IN (
            SELECT academy_id FROM profiles WHERE id = auth.uid()
            UNION
            SELECT id FROM profiles WHERE id = auth.uid() AND type = 'academia'
        )
    );

-- Políticas para workouts
DROP POLICY IF EXISTS "Usuário vê próprios treinos" ON workouts;
CREATE POLICY "Usuário vê próprios treinos" ON workouts
    FOR SELECT USING (id_profiles = auth.uid());

DROP POLICY IF EXISTS "Personal/Academia vê treinos de sua academia" ON workouts;
CREATE POLICY "Personal/Academia vê treinos de sua academia" ON workouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p1, profiles p2
            WHERE p1.id = auth.uid()
            AND p1.type IN ('personal', 'academia')
            AND p2.id = workouts.id_profiles
            AND (
                (p1.type = 'academia' AND p2.academy_id = p1.id)
                OR (p1.type = 'personal' AND p1.academy_id = p2.academy_id)
            )
        )
    );

DROP POLICY IF EXISTS "Usuário pode criar próprio treino" ON workouts;
CREATE POLICY "Usuário pode criar próprio treino" ON workouts
    FOR INSERT WITH CHECK (id_profiles = auth.uid());

DROP POLICY IF EXISTS "Personal/Academia pode criar treino para aluno" ON workouts;
CREATE POLICY "Personal/Academia pode criar treino para aluno" ON workouts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p1, profiles p2
            WHERE p1.id = auth.uid()
            AND p1.type IN ('personal', 'academia')
            AND p2.id = workouts.id_profiles
            AND (
                (p1.type = 'academia' AND p2.academy_id = p1.id)
                OR (p1.type = 'personal' AND p1.academy_id = p2.academy_id)
            )
        )
    );

-- Políticas para workout_exercises
DROP POLICY IF EXISTS "Visualizar exercícios do treino" ON workout_exercises;
CREATE POLICY "Visualizar exercícios do treino" ON workout_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workouts
            WHERE workouts.id = workout_exercises.id_workouts
            AND (
                workouts.id_profiles = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles p1, profiles p2
                    WHERE p1.id = auth.uid()
                    AND p1.type IN ('personal', 'academia')
                    AND p2.id = workouts.id_profiles
                    AND (
                        (p1.type = 'academia' AND p2.academy_id = p1.id)
                        OR (p1.type = 'personal' AND p1.academy_id = p2.academy_id)
                    )
                )
            )
        )
    );

DROP POLICY IF EXISTS "Criar exercícios do treino" ON workout_exercises;
CREATE POLICY "Criar exercícios do treino" ON workout_exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workouts
            WHERE workouts.id = workout_exercises.id_workouts
            AND (
                workouts.id_profiles = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles p1, profiles p2
                    WHERE p1.id = auth.uid()
                    AND p1.type IN ('personal', 'academia')
                    AND p2.id = workouts.id_profiles
                    AND (
                        (p1.type = 'academia' AND p2.academy_id = p1.id)
                        OR (p1.type = 'personal' AND p1.academy_id = p2.academy_id)
                    )
                )
            )
        )
    );

-- Políticas para user_exercise_weights
DROP POLICY IF EXISTS "Usuário vê próprios pesos" ON user_exercise_weights;
CREATE POLICY "Usuário vê próprios pesos" ON user_exercise_weights
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuário pode atualizar próprios pesos" ON user_exercise_weights;
CREATE POLICY "Usuário pode atualizar próprios pesos" ON user_exercise_weights
    FOR ALL USING (user_id = auth.uid());