# 🔄 Guia de Migração: Sistema Local → Supabase

## 📋 Visão Geral da Migração

Este guia mostra como migrar do sistema de desafios local (em memória) para o sistema persistente no Supabase.

## 🎯 O que Será Migrado

- ✅ Sistema de desafios local → Banco de dados Supabase
- ✅ Progresso em memória → Tabelas persistentes
- ✅ Recompensas simuladas → Sistema real de recompensas
- ✅ Estatísticas locais → Analytics completos

## 🚀 Passo a Passo da Migração

### Passo 1: Configurar o Banco Supabase

1. Execute o script `supabase_desafios_x.sql` no seu projeto Supabase
2. Verifique se todas as tabelas foram criadas
3. Confirme que os dados iniciais estão presentes

### Passo 2: Atualizar Dependências

```bash
# Instalar Supabase (se ainda não tiver)
npm install @supabase/supabase-js

# Verificar se já está instalado
npm list @supabase/supabase-js
```

### Passo 3: Configurar Variáveis de Ambiente

Crie/atualize o arquivo `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Passo 4: Atualizar Imports

#### Antes (Sistema Local)
```typescript
import challengeService from '../services/challengeService';
import { useChallenges } from '../hooks/useChallenges';
```

#### Depois (Sistema Supabase)
```typescript
import supabaseChallengeService from '../services/supabaseChallengeService';
import { useSupabaseChallenges } from '../hooks/useSupabaseChallenges';
```

### Passo 5: Atualizar o App.tsx

#### Antes
```typescript
// Função para atualizar progresso dos desafios após um jogo
const updateChallengeProgress = (gameResult: {
  won: boolean;
  category?: string;
  questionsAnswered: number;
  correctAnswers: number;
}) => {
  if (user) {
    challengeService.updateProgress(user, gameResult);
  }
};
```

#### Depois
```typescript
// Função para atualizar progresso dos desafios após um jogo
const updateChallengeProgress = async (gameResult: {
  won: boolean;
  category?: string;
  questionsAnswered: number;
  correctAnswers: number;
}) => {
  if (user) {
    await supabaseChallengeService.updateProgressFromGame(user.id, gameResult);
  }
};
```

### Passo 6: Atualizar a HomeScreen

#### Antes
```typescript
import { useChallenges } from '../hooks/useChallenges';

export const HomeScreen: React.FC<HomeScreenProps> = ({ user, onNavigate, onLogout }) => {
  const { overallProgress } = useChallenges(user);
  // ... resto do código
};
```

#### Depois
```typescript
import { useSupabaseChallenges } from '../hooks/useSupabaseChallenges';

export const HomeScreen: React.FC<HomeScreenProps> = ({ user, onNavigate, onLogout }) => {
  const { overallProgress } = useSupabaseChallenges(user);
  // ... resto do código
};
```

### Passo 7: Atualizar a DesafioXScreen

#### Antes
```typescript
import { useChallenges } from '../hooks/useChallenges';

export const DesafioXScreen: React.FC<DesafioXScreenProps> = ({ user, onNavigate }) => {
  const {
    dailyChallenges,
    weeklyMissions,
    isLoading,
    claimReward
  } = useChallenges(user);
  // ... resto do código
};
```

#### Depois
```typescript
import { useSupabaseChallenges } from '../hooks/useSupabaseChallenges';

export const DesafioXScreen: React.FC<DesafioXScreenProps> = ({ user, onNavigate }) => {
  const {
    dailyChallenges,
    weeklyChallenges,
    isLoading,
    claimReward
  } = useSupabaseChallenges(user);
  
  // Converter para o formato esperado pela interface
  const dailyMissions = dailyChallenges.map(challenge => ({
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    type: challenge.type,
    requirement: {
      type: challenge.requirement_type,
      value: challenge.requirement_value,
      category: challenge.requirement_category
    },
    reward: {
      type: challenge.reward_type,
      value: challenge.reward_value
    },
    progress: 0, // Será calculado pelo hook
    isCompleted: false, // Será calculado pelo hook
    isClaimed: false, // Será calculado pelo hook
    expiresAt: challenge.expires_at,
    createdAt: challenge.created_at
  }));
  
  // ... resto do código usando dailyMissions e weeklyChallenges
};
```

## 🔧 Adaptações Necessárias

### 1. Estrutura de Dados

O Supabase usa uma estrutura ligeiramente diferente:

```typescript
// Estrutura Local
interface Challenge {
  requirement: { type: string; value: number; category?: string };
  reward: { type: string; value: number };
}

// Estrutura Supabase
interface SupabaseChallenge {
  requirement_type: string;
  requirement_value: number;
  requirement_category?: string;
  reward_type: string;
  reward_value: number;
}
```

### 2. Funções Assíncronas

Todas as operações do Supabase são assíncronas:

```typescript
// Antes (Síncrono)
const progress = challengeService.getOverallProgress();

// Depois (Assíncrono)
const { overallProgress } = useSupabaseChallenges(user);
```

### 3. Tratamento de Erros

O Supabase retorna erros estruturados:

```typescript
// Antes
try {
  challengeService.updateProgress(user, gameResult);
} catch (error) {
  console.error('Erro:', error);
}

// Depois
try {
  await supabaseChallengeService.updateProgressFromGame(user.id, gameResult);
} catch (error) {
  console.error('Erro Supabase:', error);
  // Tratar erro específico do Supabase
}
```

## 🧪 Testando a Migração

### Teste 1: Verificar Conexão

```typescript
// No console do navegador
import { supabase } from './src/App';

const { data, error } = await supabase
  .from('challenges')
  .select('*')
  .limit(1);

console.log('Conexão Supabase:', error ? '❌' : '✅');
```

### Teste 2: Verificar Dados

```typescript
// Verificar se os desafios estão sendo carregados
const { dailyChallenges, weeklyChallenges } = useSupabaseChallenges(user);
console.log('Desafios diários:', dailyChallenges.length);
console.log('Desafios semanais:', weeklyChallenges.length);
```

### Teste 3: Verificar Progresso

```typescript
// Verificar se o progresso está sendo salvo
const gameResult = { won: true, category: 'math', questionsAnswered: 10, correctAnswers: 8 };
await supabaseChallengeService.updateProgressFromGame(user.id, gameResult);
```

## 🚨 Problemas Comuns e Soluções

### Problema: "Hook não está funcionando"

**Solução**: Verifique se o hook está sendo importado corretamente e se o usuário está autenticado.

### Problema: "Dados não aparecem"

**Solução**: Verifique se as tabelas foram criadas no Supabase e se as políticas RLS estão funcionando.

### Problema: "Erro de permissão"

**Solução**: Verifique se o usuário está logado e se as políticas de segurança estão configuradas.

### Problema: "Progresso não atualiza"

**Solução**: Verifique se a função `updateProgressFromGame` está sendo chamada corretamente.

## 📊 Comparação de Performance

### Sistema Local
- ✅ Instantâneo
- ❌ Dados perdidos ao recarregar
- ❌ Sem persistência
- ❌ Sem sincronização entre dispositivos

### Sistema Supabase
- ⚠️ Ligeiramente mais lento (rede)
- ✅ Dados persistentes
- ✅ Sincronização automática
- ✅ Backup automático
- ✅ Analytics em tempo real

## 🔄 Rollback (Se Necessário)

Se precisar voltar ao sistema local:

1. Comente os imports do Supabase
2. Descomente os imports locais
3. Reverta as mudanças nos componentes
4. Teste se tudo está funcionando

## 🎯 Benefícios da Migração

### Para Usuários
- ✅ Progresso salvo permanentemente
- ✅ Sincronização entre dispositivos
- ✅ Histórico completo de recompensas
- ✅ Estatísticas detalhadas

### Para Desenvolvedores
- ✅ Dados persistentes
- ✅ Analytics avançados
- ✅ Sistema escalável
- ✅ Backup automático
- ✅ Monitoramento em tempo real

### Para Negócio
- ✅ Engajamento dos usuários
- ✅ Dados para tomada de decisão
- ✅ Sistema confiável
- ✅ Possibilidade de expansão

## 📈 Próximos Passos Após a Migração

1. **Implementar notificações push** para desafios
2. **Criar dashboard administrativo** para gerenciar desafios
3. **Implementar sistema de ranking** baseado em desafios
4. **Adicionar desafios especiais** por eventos
5. **Implementar sistema de convites** para desafios em grupo

---

**🎉 Parabéns! Sua migração para o Supabase está completa!**

O sistema agora é muito mais robusto e escalável, oferecendo uma experiência muito melhor para seus usuários.
