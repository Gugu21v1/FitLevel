-- Adicionar coluna public na tabela exercises se não existir
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS public BOOLEAN DEFAULT true;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES profiles(id);
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS muscle_group TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Adicionar coluna is_template na tabela workouts se não existir
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS id_profiles UUID REFERENCES profiles(id);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS duration INTEGER; -- em minutos
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('iniciante', 'intermediário', 'avançado'));
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES profiles(id);

-- Criar tabela workout_exercises se não existir
CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id),
    series INTEGER NOT NULL,
    repetitions INTEGER NOT NULL,
    weight DECIMAL(10, 2),
    rest_time INTEGER, -- em segundos
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para histórico de peso do usuário
CREATE TABLE IF NOT EXISTS user_exercise_weights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    workout_id UUID REFERENCES workouts(id),
    exercise_id UUID REFERENCES exercises(id),
    weight DECIMAL(10, 2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, workout_id, exercise_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_exercises_public ON exercises(public);
CREATE INDEX IF NOT EXISTS idx_exercises_academy ON exercises(academy_id);
CREATE INDEX IF NOT EXISTS idx_workouts_profiles ON workouts(id_profiles);
CREATE INDEX IF NOT EXISTS idx_workouts_template ON workouts(is_template);
CREATE INDEX IF NOT EXISTS idx_workouts_academy ON workouts(academy_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_user_weights ON user_exercise_weights(user_id, workout_id);

-- RLS Policies
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_weights ENABLE ROW LEVEL SECURITY;

-- Policies para exercises
CREATE POLICY "Exercícios públicos visíveis para todos" ON exercises
    FOR SELECT USING (public = true);

CREATE POLICY "Exercícios privados visíveis para mesma academia" ON exercises
    FOR SELECT USING (
        public = false 
        AND academy_id IN (
            SELECT academy_id FROM profiles WHERE id = auth.uid()
            UNION
            SELECT id FROM profiles WHERE id = auth.uid() AND type = 'academia'
        )
    );

CREATE POLICY "Admin pode criar exercícios públicos" ON exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND type = 'admin'
        ) AND public = true
    );

CREATE POLICY "Personal/Academia pode criar exercícios privados" ON exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND type IN ('personal', 'academia')
        ) AND public = false
    );

-- Policies para workouts
CREATE POLICY "Usuário vê próprios treinos" ON workouts
    FOR SELECT USING (id_profiles = auth.uid());

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

CREATE POLICY "Usuário pode criar próprio treino" ON workouts
    FOR INSERT WITH CHECK (id_profiles = auth.uid());

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

CREATE POLICY "Usuário pode editar próprio treino" ON workouts
    FOR UPDATE USING (id_profiles = auth.uid());

CREATE POLICY "Personal/Academia pode editar treino de sua academia" ON workouts
    FOR UPDATE USING (
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

-- Policies para workout_exercises
CREATE POLICY "Visualizar exercícios do treino" ON workout_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workouts
            WHERE workouts.id = workout_exercises.workout_id
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

CREATE POLICY "Criar exercícios do treino" ON workout_exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workouts
            WHERE workouts.id = workout_exercises.workout_id
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

-- Policies para user_exercise_weights
CREATE POLICY "Usuário vê próprios pesos" ON user_exercise_weights
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuário pode atualizar próprios pesos" ON user_exercise_weights
    FOR ALL USING (user_id = auth.uid());