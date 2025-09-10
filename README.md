# FitLevel 💪

Aplicativo fitness completo para acompanhamento do desenvolvimento físico, nutrição e metas de saúde. Desenvolvido com React e Capacitor para funcionar tanto na web quanto em dispositivos móveis (iOS/Android).

## 🎯 Objetivo do Aplicativo

O FitLevel é uma plataforma completa para alunos acompanharem seu desenvolvimento fitness, oferecendo:

### Funcionalidades Principais

- **📊 Contador de Calorias Integrado**: Acompanhe sua dieta diária com controle detalhado de macronutrientes
- **💪 Progressão de Carga**: Registre a evolução de peso e repetições nos exercícios
- **🎥 Vídeos de Execução**: Biblioteca de vídeos demonstrando a forma correta de realizar exercícios
- **📝 Personalização de Treino**: Crie e customize seus próprios treinos
- **🏆 Desafios Gamificados**: Participe de desafios diários e semanais com sistema de pontos
- **🏢 Integração com Academias**: Espaço para academias lançarem desafios exclusivos
- **🎟️ Cupons de Desconto**: Acesse benefícios e descontos de parceiros
- **📈 Monitoramento de Métricas**: Acompanhe peso, medidas corporais e evolução
- **🍽️ Plano Alimentar**: Sugestões de receitas e refeições compatíveis com suas metas
- **🔥 Sistema de Streaks**: Mantenha sequências diárias e compita com amigos
- **🔔 Notificações Inteligentes**: Lembretes de treino, refeição, hidratação e descanso
- **🎯 Metas Personalizadas**: Defina e acompanhe objetivos específicos
- **📊 Relatórios Detalhados**: Visualize sua evolução e aderência ao programa

## 🎨 Design

- **Cor Principal**: Azul Ciano (#00B8D9)
- **Interface**: Moderna, limpa e focada em UX
- **Animações**: Transições suaves e responsivas com Framer Motion
- **Responsividade**: Adaptado para web e mobile

## 🚀 Configuração e Instalação

### Pré-requisitos

- Node.js 18+ instalado
- NPM ou Yarn
- Conta no [Supabase](https://supabase.com) para banco de dados
- (Opcional) Android Studio para desenvolvimento Android
- (Opcional) Xcode para desenvolvimento iOS (apenas macOS)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/FitLevel.git
cd FitLevel
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 🖥️ Executando o Projeto

### Desenvolvimento Web

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# O app estará disponível em http://localhost:5173
```

### Build para Produção

```bash
# Criar build otimizada
npm run build

# Visualizar build localmente
npm run preview
```

## 📱 Desenvolvimento Mobile com Capacitor

### Preparação Inicial

```bash
# Sincronizar projeto com Capacitor
npx cap sync
```

### Android

```bash
# Adicionar plataforma Android (apenas primeira vez)
npx cap add android

# Abrir no Android Studio
npx cap open android

# Ou executar diretamente
npx cap run android
```

### iOS (apenas macOS)

```bash
# Adicionar plataforma iOS (apenas primeira vez)
npx cap add ios

# Abrir no Xcode
npx cap open ios

# Ou executar diretamente
npx cap run ios
```

### Live Reload Mobile

Para desenvolvimento com hot reload no dispositivo:

```bash
# Descubra seu IP local
ipconfig # Windows
ifconfig # Mac/Linux

# Execute o dev server com seu IP
npm run dev -- --host YOUR_IP

# Em outro terminal, execute o app
npx cap run android --livereload --external --server-url=http://YOUR_IP:5173
```

## 🗄️ Configuração do Banco de Dados (Supabase)

### 1. Criar Projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Crie um novo projeto
3. Copie a URL e a chave anônima para o arquivo `.env`

### 2. Estrutura das Tabelas

Execute o seguinte SQL no editor do Supabase:

```sql
-- Tabela de perfis de usuário
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT,
  avatar TEXT,
  age INTEGER,
  weight DECIMAL,
  height DECIMAL,
  goal TEXT,
  level TEXT,
  points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  gym TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de exercícios
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  equipment TEXT,
  video_url TEXT,
  instructions TEXT[],
  muscles_worked TEXT[]
);

-- Tabela de treinos
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER,
  calories_burned INTEGER,
  date DATE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de refeições
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  type TEXT NOT NULL,
  date DATE,
  total_calories INTEGER,
  total_protein DECIMAL,
  total_carbs DECIMAL,
  total_fat DECIMAL
);

-- Tabela de métricas corporais
CREATE TABLE body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  date DATE,
  weight DECIMAL,
  body_fat DECIMAL,
  muscle_mass DECIMAL,
  chest DECIMAL,
  waist DECIMAL,
  hips DECIMAL,
  biceps DECIMAL,
  thighs DECIMAL,
  calves DECIMAL,
  notes TEXT
);

-- Tabela de desafios
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  points INTEGER,
  requirements TEXT[],
  start_date DATE,
  end_date DATE,
  gym_id TEXT,
  image_url TEXT
);

-- Tabela de progresso nos desafios
CREATE TABLE challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  challenge_id UUID REFERENCES challenges,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);
```

### 3. Configurar Autenticação

No painel do Supabase:
1. Vá para Authentication > Settings
2. Configure os provedores desejados (Email/Password recomendado)
3. Configure as URLs de redirecionamento se necessário

## 🛠️ Tecnologias Utilizadas

- **React 19** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Capacitor** - Framework para apps híbridos
- **Emotion** - Estilização CSS-in-JS
- **Framer Motion** - Animações
- **React Router** - Roteamento
- **Supabase** - Backend as a Service
- **React Hook Form** - Gerenciamento de formulários
- **Chart.js** - Gráficos e visualizações
- **Lucide React** - Ícones

## 📂 Estrutura do Projeto

```
FitLevel/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── contexts/       # Contextos React (Auth, etc)
│   ├── services/       # Serviços e APIs
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Funções utilitárias
│   ├── types/          # Definições TypeScript
│   └── styles/         # Estilos globais e tema
├── public/             # Arquivos públicos
├── capacitor.config.ts # Configuração Capacitor
└── package.json        # Dependências
```

## 🧪 Testes

```bash
# Executar testes (quando implementados)
npm run test

# Executar linting
npm run lint
```

## 🚀 Deploy

### Deploy Web (Vercel/Netlify)

1. Faça build do projeto: `npm run build`
2. Deploy da pasta `dist`

### Deploy Mobile

#### Android
1. Gere o APK/AAB no Android Studio
2. Publique na Google Play Store

#### iOS
1. Archive no Xcode
2. Publique na App Store

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Suporte

Para suporte, envie um email para suporte@fitlevel.com ou abra uma issue no GitHub.

## 🤖 Integração MCP (Model Context Protocol)

O projeto inclui integração MCP com Supabase para operações de banco de dados aprimoradas através do Claude Code.

### Configuração MCP

1. **Gere um Token de Acesso do Supabase**:
   - Acesse seu dashboard do Supabase
   - Vá para Settings > Access Tokens
   - Gere um novo token pessoal de acesso
   - **IMPORTANTE**: Mantenha esse token seguro e nunca o comita no repositório

2. **Use a Configuração MCP**:
   - O arquivo `mcp-config.json` está incluído no projeto
   - Configure o `project-ref` com a referência do seu projeto Supabase
   - Use o token gerado quando solicitado pelo Claude Code

### Benefícios do MCP

Com a integração MCP, o Claude Code pode:
- ✅ Consultar esquemas e estruturas do banco de dados
- ✅ Analisar padrões e relacionamentos de dados
- ✅ Sugerir otimizações e melhorias
- ✅ Ajudar com migrações e atualizações do banco
- ✅ Fornecer insights sobre padrões de uso de dados

### Segurança MCP

- 🔒 Configurado com `--read-only` para máxima segurança
- 🔑 Tokens são solicitados via prompt seguro (não armazenados)
- 🔄 Recomenda-se rotacionar tokens regularmente

## 🔗 Links Úteis

- [Documentação React](https://react.dev)
- [Documentação Capacitor](https://capacitorjs.com)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vite](https://vitejs.dev)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

---

Desenvolvido com ❤️ por Luiz Gustavo
