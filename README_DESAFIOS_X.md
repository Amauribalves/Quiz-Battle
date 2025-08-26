# Sistema de Desafios X - Documentação

## Visão Geral

O Sistema de Desafios X é uma funcionalidade que permite aos usuários completar missões diárias e semanais para ganhar recompensas em dinheiro. O sistema foi projetado para aumentar o engajamento dos usuários e fornecer objetivos claros de progresso.

## Funcionalidades

### 🎯 Desafios Diários
- **Vencedor do Dia**: Vence 5 partidas hoje - Recompensa: R$ 1,00
- **Sequência Vitoriosa**: Mantenha uma sequência de 3 vitórias - Recompensa: R$ 2,00
- **Mestre da Matemática**: Acerte 20 questões de matemática - Recompensa: R$ 3,00
- **Culto e Sabido**: Acerte 15 questões de cultura geral - Recompensa: R$ 2,50

### ⭐ Missões Semanais
- **Guerreiro Semanal**: Vence 25 partidas esta semana - Recompensa: R$ 10,00
- **Especialista em Cultura**: Acerte 50 questões de cultura geral - Recompensa: R$ 15,00
- **Matemático Profissional**: Acerte 60 questões de matemática - Recompensa: R$ 20,00
- **Mestre da Sequência**: Mantenha uma sequência de 10 vitórias - Recompensa: R$ 25,00

## Arquitetura do Sistema

### 1. Tipos e Interfaces (`src/types/index.ts`)
```typescript
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  requirement: {
    type: 'wins' | 'streak' | 'games_played' | 'correct_answers' | 'category_wins';
    value: number;
    category?: string;
  };
  reward: {
    type: 'money' | 'bonus' | 'experience';
    value: number;
  };
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  expiresAt: string;
  createdAt: string;
}
```

### 2. Serviço de Desafios (`src/services/challengeService.ts`)
- Gerencia o estado dos desafios e missões
- Atualiza progresso baseado nos resultados dos jogos
- Controla recompensas e reset automático
- Calcula progresso geral

### 3. Hook Personalizado (`src/hooks/useChallenges.ts`)
- Gerencia estado local dos desafios
- Fornece métodos para interagir com o serviço
- Atualiza automaticamente quando necessário

### 4. Tela de Desafios (`src/screens/DesafioXScreen.tsx`)
- Interface principal para visualizar desafios
- Tabs para desafios diários e missões semanais
- Sistema de recompensas integrado

## Como Usar

### Para Usuários
1. **Acesse a tela inicial** - O botão "Desafio X" mostra o progresso geral
2. **Clique em "Desafio X"** - Navegue para a tela de desafios
3. **Complete missões** - Jogue partidas para progredir nos desafios
4. **Reclame recompensas** - Clique em "Reclamar Recompensa" quando completar um desafio

### Para Desenvolvedores

#### Adicionar Novo Desafio
```typescript
// No challengeService.ts
private initializeChallenges() {
  this.challenges.push({
    id: 'daily-new-1',
    title: 'Novo Desafio',
    description: 'Descrição do novo desafio',
    type: 'daily',
    requirement: { type: 'wins', value: 10 },
    reward: { type: 'money', value: 5 },
    progress: 0,
    isCompleted: false,
    isClaimed: false,
    expiresAt: this.getDailyExpiry(),
    createdAt: new Date().toISOString()
  });
}
```

#### Atualizar Progresso
```typescript
// Após um jogo
const gameResult = {
  won: true,
  category: 'math',
  questionsAnswered: 10,
  correctAnswers: 8
};

challengeService.updateProgress(user, gameResult);
```

#### Verificar Progresso
```typescript
const progress = challengeService.getOverallProgress();
const dailyChallenges = challengeService.getDailyChallenges();
const weeklyMissions = challengeService.getWeeklyMissions();
```

## Sistema de Recompensas

### Tipos de Recompensa
- **Money**: Recompensa em dinheiro (R$)
- **Bonus**: Bônus especiais
- **Experience**: Pontos de experiência

### Requisitos Suportados
- **wins**: Número de vitórias
- **streak**: Sequência de vitórias consecutivas
- **category_wins**: Vitórias em categorias específicas
- **games_played**: Partidas jogadas
- **correct_answers**: Respostas corretas

## Reset Automático

### Desafios Diários
- Resetam automaticamente à meia-noite
- Progresso é zerado
- Novos desafios são gerados

### Missões Semanais
- Resetam automaticamente no domingo à meia-noite
- Progresso é zerado
- Novas missões são geradas

## Integração com o Jogo

O sistema se integra automaticamente com:
- Resultados de partidas
- Estatísticas do usuário
- Sistema de categorias
- Histórico de jogos

## Personalização

### Modificar Recompensas
```typescript
// No challengeService.ts
reward: { type: 'money', value: 15 } // Alterar valor
```

### Adicionar Novos Tipos de Requisito
```typescript
// No types/index.ts
requirement: {
  type: 'wins' | 'streak' | 'games_played' | 'correct_answers' | 'category_wins' | 'new_type';
  value: number;
  category?: string;
}
```

### Alterar Frequência
```typescript
// No challengeService.ts
private getDailyExpiry(): string {
  // Modificar para reset a cada 12h, por exemplo
  const tomorrow = new Date();
  tomorrow.setHours(tomorrow.getHours() + 12);
  return tomorrow.toISOString();
}
```

## Monitoramento e Analytics

### Métricas Disponíveis
- Progresso geral dos usuários
- Taxa de conclusão de desafios
- Recompensas reclamadas
- Tempo médio para completar missões

### Logs do Sistema
```typescript
console.log(`Recompensa de R$ ${item.reward.value} reclamada!`);
console.log(`Desafio ${challenge.id} completado!`);
```

## Troubleshooting

### Problemas Comuns
1. **Desafios não atualizam**: Verificar se `updateProgress` está sendo chamado
2. **Recompensas não funcionam**: Verificar se `claimReward` está sendo executado
3. **Progresso não persiste**: Verificar se o serviço está sendo inicializado corretamente

### Debug
```typescript
// Habilitar logs detalhados
console.log('Estado atual dos desafios:', challengeService.getDailyChallenges());
console.log('Progresso geral:', challengeService.getOverallProgress());
```

## Próximas Funcionalidades

- [ ] Sistema de notificações push para desafios
- [ ] Desafios especiais por eventos
- [ ] Sistema de ranking de desafios
- [ ] Desafios em grupo/equipe
- [ ] Sistema de streak mais avançado
- [ ] Integração com redes sociais

## Contribuição

Para contribuir com o sistema de Desafios X:

1. Crie uma branch para sua feature
2. Implemente as mudanças seguindo os padrões existentes
3. Adicione testes se aplicável
4. Atualize a documentação
5. Abra um Pull Request

## Licença

Este sistema faz parte do projeto Quiz Battle e segue as mesmas diretrizes de licenciamento.
