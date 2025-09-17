# FitLevel - Estrutura do Banco de Dados

## Visão Geral
Este documento descreve a estrutura completa do banco de dados do FitLevel, incluindo todas as tabelas, colunas, tipos de dados e relacionamentos.

## Tabelas

### profiles
Tabela principal de usuários do sistema

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| name | text | Nome do usuário |
| type | text | Tipo de usuário (aluno, personal, academia, admin) |
| gender | text | Gênero |
| birth_date | date | Data de nascimento |
| number | text | Número/telefone |
| address | text | Endereço |
| academy_id | uuid | Referência para profiles.id da academia |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data de atualização |
| status | text | Status do usuário |
| photo_url | text | URL da foto do perfil |
| notes | text | Observações |
| email | text | Email do usuário |

### workouts
Tabela de treinos

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| id_profiles | uuid | Referência para profiles.id (dono do treino) |
| name | text | Nome do treino |
| duration | int4 | Duração em minutos |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data de atualização |
| description | text | Descrição do treino |
| is_template | bool | Se é um template |
| difficulty | text | Dificuldade (iniciante, intermediário, avançado) |
| created_by | uuid | Referência para profiles.id (quem criou o treino) |

### exercises
Tabela de exercícios

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| name | text | Nome do exercício |
| video | text | URL do vídeo demonstrativo |
| created_at | timestamptz | Data de criação |
| muscle_group | text | Grupo muscular |
| equipment | text | Equipamento necessário |
| instructions | text | Instruções de execução |
| public | bool | Se é público ou privado |
| created_by | uuid | Referência para profiles.id (quem criou o exercício) |

### workout_exercises
Tabela de exercícios dentro de um treino

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| id_workout | uuid | Referência para workouts.id |
| id_exercise | uuid | Referência para exercises.id |
| series | int4 | Número de séries |
| repetitions | int4 | Número de repetições |
| weight | numeric | Peso padrão |
| ordem | int4 | Ordem do exercício no treino |
| created_at | timestamptz | Data de criação |
| rest_time | text | Tempo de descanso |
| updated_at | timestamptz | Data de atualização |

### user_exercise_weights
Tabela de pesos personalizados por usuário

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| user_id | uuid | Referência para profiles.id |
| id_workout | uuid | Referência para workouts.id |
| id_exercise | uuid | Referência para exercises.id |
| weight | numeric | Peso personalizado do usuário |
| updated_at | timestamptz | Data de atualização |

## Relacionamentos

### Principais Relacionamentos

```
profiles (academia)
    ↓ (academy_id)
profiles (aluno/personal)
    ↓ (id_profiles)
workouts
    ↓ (id_workout)
workout_exercises
    ↓ (id_exercise)
exercises
```

### Detalhamento dos Relacionamentos

| Tabela Origem | Coluna | Tabela Destino | Coluna | Descrição |
|---------------|--------|----------------|--------|-----------|
| workouts | id_profiles | profiles | id | Dono do treino |
| workouts | created_by | profiles | id | Quem criou o treino |
| workout_exercises | id_workout | workouts | id | Treino ao qual pertence |
| workout_exercises | id_exercise | exercises | id | Exercício do treino |
| user_exercise_weights | user_id | profiles | id | Usuário dono do peso |
| user_exercise_weights | id_workout | workouts | id | Treino relacionado |
| user_exercise_weights | id_exercise | exercises | id | Exercício relacionado |
| profiles | academy_id | profiles | id | Academia à qual está vinculado |
| exercises | created_by | profiles | id | Quem criou o exercício |

## Conceitos Importantes

### Hierarquia de Usuários
- **admin**: Acesso total ao sistema
- **academia**: Gerencia alunos e personais
- **personal**: Trabalha dentro de uma academia
- **aluno**: Usuário final que faz treinos

### Diferença entre Dono e Criador de Treino
- **id_profiles**: Para quem é o treino (dono)
- **created_by**: Quem criou o treino (pode ser personal/academia)

### Sistema de Pesos
- **workout_exercises.weight**: Peso padrão do exercício no treino
- **user_exercise_weights.weight**: Peso personalizado do usuário para esse exercício

### Exercícios Públicos vs Privados
- **public = true**: Visível para todos
- **public = false**: Visível apenas para a academia/personal que criou

## Políticas RLS (Row Level Security)

Todas as tabelas possuem RLS habilitado com políticas específicas para cada tipo de usuário, garantindo que:

- Alunos vejam apenas seus próprios dados
- Personais vejam dados de alunos da mesma academia
- Academias vejam dados de todos seus alunos e personais
- Admins tenham acesso total

## Índices Principais

- `idx_workouts_profiles`: workouts(id_profiles)
- `idx_workout_exercises_workout`: workout_exercises(id_workout)
- `idx_user_weights_user`: user_exercise_weights(user_id)
- `idx_user_weights_workout`: user_exercise_weights(id_workout)
- `idx_exercises_created_by`: exercises(created_by)
- `idx_workouts_created_by`: workouts(created_by)