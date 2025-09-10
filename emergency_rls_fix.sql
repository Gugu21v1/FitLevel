-- SOLUÇÃO DE EMERGÊNCIA PARA RLS
-- Execute este SQL no Dashboard do Supabase

-- 1. DESABILITAR RLS COMPLETAMENTE (temporário)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Limpar todas as políticas existentes
DO $$ 
DECLARE 
    policy_name TEXT;
BEGIN
    FOR policy_name IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON profiles';
    END LOOP;
END $$;

-- 3. Criar função para promover usuário (bypass RLS)
CREATE OR REPLACE FUNCTION promote_user_to_academy(
    user_id uuid,
    academy_address text,
    academy_number text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    name text,
    email text,
    type text,
    address text,
    number text,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Atualizar o perfil do usuário
    UPDATE profiles 
    SET 
        type = 'academia',
        address = academy_address,
        number = academy_number,
        updated_at = now()
    WHERE profiles.id = user_id;
    
    -- Retornar o perfil atualizado
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.email,
        p.type,
        p.address,
        p.number,
        p.updated_at
    FROM profiles p 
    WHERE p.id = user_id;
END;
$$;

-- 4. Manter função de buscar estudantes
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

-- 5. Função para buscar academias
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

-- AVISO: RLS está desabilitado! Reabilite após testes com políticas mais simples
-- Para reabilitar depois: ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;