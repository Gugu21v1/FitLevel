-- Remover políticas existentes que podem estar causando recursão
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authentication users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- Criar políticas RLS mais simples e seguras
-- Política para SELECT: usuários podem ver todos os perfis (necessário para funcionalidade da academia)
CREATE POLICY "Allow read access for authenticated users" ON profiles
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Política para INSERT: apenas usuários autenticados podem criar perfis
CREATE POLICY "Allow insert for authenticated users" ON profiles
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Política para UPDATE: usuários podem atualizar próprio perfil OU admins podem atualizar qualquer perfil
CREATE POLICY "Allow update own profile or admin update any" ON profiles
  FOR UPDATE 
  TO authenticated 
  USING (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND type = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND type = 'admin'
    )
  );

-- Política para DELETE: apenas admins podem deletar perfis
CREATE POLICY "Allow delete for admins only" ON profiles
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND type = 'admin'
    )
  );