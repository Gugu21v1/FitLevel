-- Adicionar coluna created_by na tabela exercises para rastrear quem criou o exercício
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Atualizar exercícios existentes como públicos (sem criador específico)
UPDATE exercises SET public = true WHERE public IS NULL;
UPDATE exercises SET created_by = NULL WHERE public = true;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_exercises_created_by ON exercises(created_by);

-- Atualizar política para exercícios privados
DROP POLICY IF EXISTS "Exercícios privados visíveis para mesma academia" ON exercises;
CREATE POLICY "Exercícios privados visíveis para mesma academia" ON exercises
    FOR SELECT USING (
        public = false 
        AND EXISTS (
            SELECT 1 FROM profiles p1, profiles p2
            WHERE p1.id = auth.uid()
            AND p2.id = exercises.created_by
            AND (
                -- Mesmo usuário
                p1.id = p2.id
                OR
                -- Mesma academia
                (p1.academy_id = p2.academy_id AND p1.academy_id IS NOT NULL)
                OR
                -- Academia vendo exercícios de seus membros
                (p1.type = 'academia' AND p2.academy_id = p1.id)
                OR
                -- Membro vendo exercícios da academia
                (p2.type = 'academia' AND p1.academy_id = p2.id)
            )
        )
    );