# Setup Rápido do FitLevel

## 1. Configuração Inicial

```bash
# Instalar dependências
npm install

# Criar arquivo de ambiente
cp .env.example .env
```

## 2. Configurar Supabase

### a) Criar Projeto no Supabase
1. Acesse https://app.supabase.com
2. Crie um novo projeto
3. Anote a **URL** e **Anon Key**

### b) Executar SQL
Cole o seguinte SQL no editor do Supabase:

```sql
-- Copie e cole todo o código SQL do README.md na seção "Estrutura das Tabelas"
```

### c) Atualizar .env
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

## 3. Testar o Projeto

```bash
# Executar em desenvolvimento
npm run dev

# Testar build
npm run build
```

## 4. Configurar MCP (Opcional)

### a) Gerar Token do Supabase
1. Vá para Settings > Access Tokens no Supabase
2. Crie um novo Personal Access Token
3. **IMPORTANTE**: Mantenha seguro, não compartilhe

### b) Configurar Claude Code
- Use o arquivo `mcp-config.json` incluído
- Substitua "FitLevel" pelo seu project-ref real
- O token será solicitado via prompt seguro

## 5. Mobile (Capacitor)

```bash
# Sincronizar Capacitor
npx cap sync

# Android
npx cap add android
npx cap open android

# iOS (apenas macOS)
npx cap add ios  
npx cap open ios
```

## Problemas Comuns

### Erro de CORS no Supabase
- Verifique se as URLs estão corretas no .env
- Confirme que o projeto Supabase está ativo

### Erro de Build
- Execute `npm run lint` para verificar erros
- Confirme que todas as dependências estão instaladas

### MCP não funciona
- Verifique se o project-ref está correto
- Confirme que o token tem as permissões necessárias
- Use `--read-only` para máxima segurança

## Próximos Passos

1. ✅ Configure o Supabase
2. ✅ Teste a autenticação 
3. ✅ Personalize o design
4. ✅ Adicione suas funcionalidades específicas
5. ✅ Configure MCP para melhor desenvolvimento
6. ✅ Deploy para produção