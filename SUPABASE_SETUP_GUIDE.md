# 🚀 Guia de Configuração do Supabase para Desafios X

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Projeto criado no Supabase
- Acesso ao SQL Editor do projeto

## 🗄️ Configuração do Banco de Dados

### Passo 1: Acessar o SQL Editor

1. Faça login no [Supabase](https://supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"**

### Passo 2: Executar o Script SQL

1. Copie todo o conteúdo do arquivo `supabase_desafios_x.sql`
2. Cole no SQL Editor
3. Clique em **"Run"** para executar

### Passo 3: Verificar as Tabelas Criadas

Após executar o script, você deve ver as seguintes tabelas:

- ✅ `challenges` - Desafios disponíveis
- ✅ `user_challenge_progress` - Progresso dos usuários
- ✅ `challenge_rewards_history` - Histórico de recompensas
- ✅ `challenge_stats` - Estatísticas dos usuários
- ✅ `challenge_activity_logs` - Logs de atividades

## 🔐 Configuração de Segurança (RLS)

### Verificar RLS Habilitado

O script já habilita RLS automaticamente, mas você pode verificar:

1. Vá para **"Table Editor"**
2. Selecione uma tabela (ex: `challenges`)
3. Verifique se **"RLS"** está habilitado

### Políticas de Segurança

As seguintes políticas são criadas automaticamente:

- **Desafios**: Visíveis para todos os usuários
- **Progresso**: Usuário só vê seu próprio progresso
- **Recompensas**: Usuário só vê suas recompensas
- **Estatísticas**: Usuário só vê suas estatísticas
- **Logs**: Usuário só vê seus logs

## 📊 Dados Iniciais

### Desafios Padrão Criados

O script cria automaticamente:

#### 🎯 Desafios Diários
- Vencedor do Dia (5 vitórias → R$ 1,00)
- Sequência Vitoriosa (3 vitórias seguidas → R$ 2,00)
- Mestre da Matemática (20 questões de matemática → R$ 3,00)
- Culto e Sabido (15 questões de cultura → R$ 2,50)

#### ⭐ Missões Semanais
- Guerreiro Semanal (25 vitórias → R$ 10,00)
- Especialista em Cultura (50 questões de cultura → R$ 15,00)
- Matemático Profissional (60 questões de matemática → R$ 20,00)
- Mestre da Sequência (10 vitórias seguidas → R$ 25,00)

## 🔧 Configuração do Projeto React

### Passo 1: Instalar Dependências

```bash
npm install @supabase/supabase-js
```

### Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Passo 3: Atualizar Configuração

No arquivo `src/App.tsx`, atualize as credenciais:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

## 🧪 Testando a Configuração

### Teste 1: Verificar Conexão

```typescript
// No console do navegador
import { supabase } from './src/App';

// Testar conexão
const { data, error } = await supabase
  .from('challenges')
  .select('*')
  .limit(1);

console.log('Conexão:', error ? '❌ Erro' : '✅ Sucesso');
console.log('Dados:', data);
```

### Teste 2: Verificar Tabelas

```sql
-- No SQL Editor do Supabase
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'challenge%';
```

### Teste 3: Verificar Dados

```sql
-- Verificar desafios criados
SELECT * FROM challenges WHERE is_active = true;

-- Verificar views criadas
SELECT * FROM active_challenges_stats;
```

## 📱 Integração com o App

### Passo 1: Atualizar o Hook

Substitua o hook antigo pelo novo:

```typescript
// Antes
import { useChallenges } from '../hooks/useChallenges';

// Depois
import { useSupabaseChallenges } from '../hooks/useSupabaseChallenges';
```

### Passo 2: Atualizar o Serviço

Substitua o serviço antigo pelo novo:

```typescript
// Antes
import challengeService from '../services/challengeService';

// Depois
import supabaseChallengeService from '../services/supabaseChallengeService';
```

### Passo 3: Atualizar as Chamadas

```typescript
// Antes
const progress = challengeService.getOverallProgress();

// Depois
const { overallProgress } = useSupabaseChallenges(user);
```

## 🚨 Troubleshooting

### Problema: "Table doesn't exist"

**Solução**: Execute o script SQL novamente no Supabase

### Problema: "RLS policy violation"

**Solução**: Verifique se as políticas RLS estão criadas corretamente

### Problema: "Connection failed"

**Solução**: Verifique as credenciais do Supabase no arquivo `.env.local`

### Problema: "Permission denied"

**Solução**: Verifique se o usuário está autenticado e se as políticas RLS estão funcionando

## 📈 Monitoramento e Analytics

### Views Úteis

O script cria views para monitoramento:

```sql
-- Estatísticas dos desafios ativos
SELECT * FROM active_challenges_stats;

-- Visão geral dos usuários
SELECT * FROM user_challenge_overview;
```

### Logs de Atividade

```sql
-- Ver logs recentes
SELECT * FROM challenge_activity_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🔄 Manutenção

### Reset Diário de Desafios

```sql
-- Criar função para reset automático
CREATE OR REPLACE FUNCTION reset_daily_challenges()
RETURNS void AS $$
BEGIN
  UPDATE challenges 
  SET expires_at = NOW() + INTERVAL '1 day'
  WHERE type = 'daily';
END;
$$ LANGUAGE plpgsql;

-- Agendar execução (cron job)
-- 0 0 * * * (todos os dias à meia-noite)
```

### Backup das Tabelas

```sql
-- Backup das tabelas importantes
SELECT * FROM challenges;
SELECT * FROM user_challenge_progress;
SELECT * FROM challenge_rewards_history;
```

## 🎯 Próximos Passos

1. **Testar a integração** com o app
2. **Configurar notificações** para desafios
3. **Implementar analytics** avançados
4. **Criar dashboard** administrativo
5. **Configurar backup** automático

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no console do navegador
2. Verifique os logs no Supabase (Logs > Database)
3. Teste as queries diretamente no SQL Editor
4. Verifique se todas as tabelas foram criadas corretamente

---

**🎉 Parabéns! Seu banco de dados Supabase está configurado para os Desafios X!**
