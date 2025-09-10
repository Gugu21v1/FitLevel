-- EXECUTE ESTE SQL NO DASHBOARD DO SUPABASE (SQL EDITOR)
-- Corrige o problema de recursão infinita nas políticas RLS

-- 1. Desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes que podem estar causando recursão
DO $$ 
BEGIN
    -- Dropar todas as políticas existentes na tabela profiles
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
    DROP POLICY IF EXISTS "simple_read" ON profiles;
    DROP POLICY IF EXISTS "simple_insert" ON profiles;
    DROP POLICY IF EXISTS "simple_update" ON profiles;
    DROP POLICY IF EXISTS "admin_full_access" ON profiles;
    
    -- Criar uma função para verificar se o usuário é admin sem recursão
    CREATE OR REPLACE FUNCTION is_admin(user_id uuid) 
    RETURNS boolean 
    LANGUAGE plpgsql 
    SECURITY DEFINER
    AS $$
    BEGIN
        RETURN EXISTS (
            SELECT 1 
            FROM auth.users 
            WHERE auth.users.id = user_id 
            AND (
                auth.users.raw_user_meta_data->>'type' = 'admin'
                OR 
                auth.users.email = 'admin@fitlevel.com' -- substitua pelo seu email de admin
            )
        );
    END;
    $$;
    
END $$;

-- 3. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS simples e sem recursão
CREATE POLICY "authenticated_read_all" ON profiles
    FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "authenticated_insert_own" ON profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own_or_admin_all" ON profiles
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id OR is_admin(auth.uid()))
    WITH CHECK (auth.uid() = id OR is_admin(auth.uid()));

CREATE POLICY "admin_delete_any" ON profiles
    FOR DELETE 
    TO authenticated
    USING (is_admin(auth.uid()));

-- 5. Criar função RPC para buscar estudantes (contorna problemas de RLS)
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
        COALESCE(p.status, 'ativo') as status,
        p.academy_id,
        p.address,
        p.number
    FROM profiles p
    WHERE p.type = 'aluno'
    ORDER BY p.name;
$$;

-- 6. Criar função RPC para buscar academias
CREATE OR REPLACE FUNCTION get_all_academies()
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
        COALESCE(p.status, 'ativo') as status,
        p.academy_id,
        p.address,
        p.number
    FROM profiles p
    WHERE p.type = 'academia'
    ORDER BY p.name;
$$;