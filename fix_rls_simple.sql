-- Temporariamente desabilitar RLS para corrigir as políticas
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Dropar todas as políticas existentes
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authentication users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Allow update own profile or admin update any" ON profiles;
DROP POLICY IF EXISTS "Allow delete for admins only" ON profiles;

-- Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas simples sem recursão
CREATE POLICY "simple_read" ON profiles
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "simple_insert" ON profiles
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "simple_update" ON profiles
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Adicionar política específica para admins (sem referência recursiva à tabela profiles)
CREATE POLICY "admin_full_access" ON profiles
  FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE auth.users.raw_user_meta_data->>'type' = 'admin'
  ));

-- Criar as funções RPC para contornar problemas de RLS
CREATE OR REPLACE FUNCTION get_all_students()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  type text,
  created_at timestamp with time zone,
  status text,
  academy_id uuid,
  address text,
  number text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.email,
    p.type,
    p.created_at,
    p.status,
    p.academy_id,
    p.address,
    p.number
  FROM profiles p
  WHERE p.type = 'aluno'
  ORDER BY p.name;
$$;