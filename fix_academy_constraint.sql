-- Fix the academy_id constraint to allow alunos without academy_id
-- Remove the problematic constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS academy_id_constraint;

-- Add a more flexible constraint that allows alunos without academy_id initially
-- They can be assigned to an academy later by an admin
ALTER TABLE profiles ADD CONSTRAINT academy_id_constraint 
CHECK (
  (type = 'academia' AND academy_id IS NULL) OR 
  (type = 'admin' AND academy_id IS NULL) OR 
  (type = 'aluno')
);

-- Update the trigger function to not require academy_id for alunos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, type, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Usuário'),
    new.email,
    'aluno',
    'ativo'
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;