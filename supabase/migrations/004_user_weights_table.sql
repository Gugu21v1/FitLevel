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

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_weights_user ON user_exercise_weights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_weights_workout ON user_exercise_weights(workout_id);
CREATE INDEX IF NOT EXISTS idx_user_weights_exercise ON user_exercise_weights(exercise_id);

-- RLS Policies
ALTER TABLE user_exercise_weights ENABLE ROW LEVEL SECURITY;

-- Política para visualizar próprios pesos
DROP POLICY IF EXISTS "Usuário vê próprios pesos" ON user_exercise_weights;
CREATE POLICY "Usuário vê próprios pesos" ON user_exercise_weights
    FOR SELECT USING (user_id = auth.uid());

-- Política para inserir/atualizar próprios pesos
DROP POLICY IF EXISTS "Usuário pode inserir próprios pesos" ON user_exercise_weights;
CREATE POLICY "Usuário pode inserir próprios pesos" ON user_exercise_weights
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuário pode atualizar próprios pesos" ON user_exercise_weights;
CREATE POLICY "Usuário pode atualizar próprios pesos" ON user_exercise_weights
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuário pode deletar próprios pesos" ON user_exercise_weights;
CREATE POLICY "Usuário pode deletar próprios pesos" ON user_exercise_weights
    FOR DELETE USING (user_id = auth.uid());