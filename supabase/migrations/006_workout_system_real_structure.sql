-- Migração baseada na estrutura real do banco de dados

-- 1. Adicionar coluna public na tabela exercises
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS public BOOLEAN DEFAULT true;

-- 2. Criar tabela para histórico de peso personalizado do usuário
CREATE TABLE IF NOT EXISTS user_exercise_weights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    id_workout UUID REFERENCES workouts(id),
    id_exercise UUID REFERENCES exercises(id),
    weight DECIMAL(10, 2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, id_workout, id_exercise)
);

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_exercises_public ON exercises(public);
CREATE INDEX IF NOT EXISTS idx_workouts_profiles ON workouts(id_profiles);
CREATE INDEX IF NOT EXISTS idx_workouts_template ON workouts(is_template);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(id_workout);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise ON workout_exercises(id_exercise);
CREATE INDEX IF NOT EXISTS idx_user_weights_user ON user_exercise_weights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_weights_workout ON user_exercise_weights(id_workout);
CREATE INDEX IF NOT EXISTS idx_user_weights_exercise ON user_exercise_weights(id_exercise);

-- 4. Habilitar RLS nas tabelas
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_weights ENABLE ROW LEVEL SECURITY;

-- 5. Políticas para exercises
DROP POLICY IF EXISTS "Exercícios públicos visíveis" ON exercises;
CREATE POLICY "Exercícios públicos visíveis" ON exercises
    FOR SELECT USING (public = true);

DROP POLICY IF EXISTS "Exercícios privados visíveis para mesma academia" ON exercises;
CREATE POLICY "Exercícios privados visíveis para mesma academia" ON exercises
    FOR SELECT USING (
        public = false 
        AND EXISTS (
            SELECT 1 FROM profiles p1, profiles p2
            WHERE p1.id = auth.uid()
            AND p2.id = (SELECT created_by FROM exercises WHERE exercises.id = exercises.id)
            AND (
                p1.academy_id = p2.academy_id
                OR p1.id = p2.academy_id
                OR p2.id = p1.academy_id
            )
        )
    );

DROP POLICY IF EXISTS "Admin pode criar exercícios públicos" ON exercises;
CREATE POLICY "Admin pode criar exercícios públicos" ON exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND type = 'admin'
        ) AND public = true
    );

DROP POLICY IF EXISTS "Personal/Academia pode criar exercícios privados" ON exercises;
CREATE POLICY "Personal/Academia pode criar exercícios privados" ON exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND type IN ('personal', 'academia', 'aluno')
        ) AND public = false
    );

-- 6. Políticas para workouts
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

DROP POLICY IF EXISTS "Usuário pode criar treino" ON workouts;
CREATE POLICY "Usuário pode criar treino" ON workouts
    FOR INSERT WITH CHECK (
        id_profiles = auth.uid()
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
    );

DROP POLICY IF EXISTS "Usuário pode editar treino" ON workouts;
CREATE POLICY "Usuário pode editar treino" ON workouts
    FOR UPDATE USING (
        id_profiles = auth.uid()
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
    );

DROP POLICY IF EXISTS "Usuário pode deletar treino" ON workouts;
CREATE POLICY "Usuário pode deletar treino" ON workouts
    FOR DELETE USING (
        id_profiles = auth.uid()
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
    );

-- 7. Políticas para workout_exercises
DROP POLICY IF EXISTS "Ver exercícios do treino" ON workout_exercises;
CREATE POLICY "Ver exercícios do treino" ON workout_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workouts
            WHERE workouts.id = workout_exercises.id_workout
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

DROP POLICY IF EXISTS "Inserir exercícios do treino" ON workout_exercises;
CREATE POLICY "Inserir exercícios do treino" ON workout_exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workouts
            WHERE workouts.id = workout_exercises.id_workout
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

DROP POLICY IF EXISTS "Atualizar exercícios do treino" ON workout_exercises;
CREATE POLICY "Atualizar exercícios do treino" ON workout_exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workouts
            WHERE workouts.id = workout_exercises.id_workout
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

DROP POLICY IF EXISTS "Deletar exercícios do treino" ON workout_exercises;
CREATE POLICY "Deletar exercícios do treino" ON workout_exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workouts
            WHERE workouts.id = workout_exercises.id_workout
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

-- 8. Políticas para user_exercise_weights
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