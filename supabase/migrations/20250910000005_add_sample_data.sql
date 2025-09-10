-- Criar usuário de exemplo para academia (usando service_role)
-- Como não podemos usar auth.admin aqui, vamos criar uma entrada manual para demonstração

-- Vamos temporariamente desabilitar RLS para inserir dados de exemplo
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Inserir academias de exemplo (sem vincular a usuários auth por enquanto)
INSERT INTO profiles (id, name, type, address, contact) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Academia Fitness Pro', 'academia', 'Rua das Flores, 123 - Centro', '(11) 99999-9999'),
('550e8400-e29b-41d4-a716-446655440002', 'Gold Gym Academia', 'academia', 'Av. Paulista, 456 - Bela Vista', '(11) 88888-8888'),
('550e8400-e29b-41d4-a716-446655440003', 'Corpo & Mente Fitness', 'academia', 'Rua dos Esportes, 789 - Vila Madalena', '(11) 77777-7777');

-- Inserir alunos de exemplo vinculados às academias
INSERT INTO profiles (id, name, type, gender, birth_date, contact, academy_id) VALUES 
('550e8400-e29b-41d4-a716-446655440010', 'João Silva', 'aluno', 'masculino', '1990-05-15', '(11) 66666-6666', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440011', 'Maria Santos', 'aluno', 'feminino', '1985-08-22', '(11) 55555-5555', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440012', 'Carlos Oliveira', 'aluno', 'masculino', '1992-12-10', '(11) 44444-4444', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440013', 'Ana Costa', 'aluno', 'feminino', '1988-03-18', '(11) 33333-3333', '550e8400-e29b-41d4-a716-446655440003');

-- Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;