-- Drop the problematic policies
DROP POLICY IF EXISTS "Students can view their academy" ON profiles;
DROP POLICY IF EXISTS "Academias can view their students" ON profiles;

-- Recreate fixed policies for profiles
CREATE POLICY "Academias can view their students" ON profiles
  FOR SELECT USING (
    type = 'aluno' AND academy_id = auth.uid()
  );

-- Students can view their own academy profile
CREATE POLICY "Students can view academy" ON profiles
  FOR SELECT USING (
    type = 'academia' AND id IN (
      SELECT academy_id FROM profiles WHERE id = auth.uid() AND type = 'aluno'
    )
  );