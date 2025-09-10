-- Função para buscar todos os estudantes sem problemas de RLS
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
    id,
    name,
    email,
    type,
    created_at,
    status,
    academy_id,
    address,
    number
  FROM profiles 
  WHERE type = 'aluno'
  ORDER BY name;
$$;

-- Função para buscar todas as academias sem problemas de RLS
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
    id,
    name,
    email,
    type,
    created_at,
    status,
    academy_id,
    address,
    number
  FROM profiles 
  WHERE type = 'academia'
  ORDER BY name;
$$;