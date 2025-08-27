# 🗄️ Diagrama de Integração Completa do Banco de Dados

## 🔗 **Estrutura de Relacionamentos Atualizada**

```
                    ┌─────────────────┐
                    │      USERS      │ ← Tabela Central
                    └─────────────────┘
                           │
                           ├─── UUID (id)
                           ├─── username, email
                           ├─── balance, wins, losses
                           └─── achievements (JSONB)
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   MATCHES    │  │   GAMES      │  │  WITHDRAWS   │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    BETS      │  │USER_QUESTION │  │  PROCESSED   │
│              │  │   STATS      │  │     BY       │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   PLAYER1    │  │USER_CATEGORY │  │  TRANSACTION │
│   PLAYER2    │  │PERFORMANCE   │  │      ID      │
│   WINNER     │  └──────────────┘  └──────────────┘
└──────────────┘
        │
        │
        ▼
┌──────────────┐
│HISTORICO_    │
│   JOGOS      │
└──────────────┘
        │
        │
        ▼
┌──────────────┐
│   AMIGOS     │
└──────────────┘
```

## 🆕 **Novas Tabelas e Relacionamentos**

### **1. GAMES (Questões) - Agora Integrada!**
```
┌─────────────────────────────────────────────────────────────┐
│                        GAMES                               │
├─────────────────────────────────────────────────────────────┤
│ id (int8) PK                                              │
│ question (text)                                            │
│ option_a, option_b, option_c, option_d (text)             │
│ correct_option (text)                                      │
│ category (text)                                            │
│ created_at (timestamptz)                                   │
│ created_by (UUID) → users(id) ← NOVO!                     │
│ is_active (boolean) ← NOVO!                               │
│ difficulty_level (integer) ← NOVO!                        │
│ times_used (integer) ← NOVO!                              │
│ success_rate (decimal) ← NOVO!                            │
│ last_used (timestamptz) ← NOVO!                           │
└─────────────────────────────────────────────────────────────┘
```

### **2. BETS (Apostas) - Agora Integrada!**
```
┌─────────────────────────────────────────────────────────────┐
│                        BETS                                │
├─────────────────────────────────────────────────────────────┤
│ id (int8) PK                                              │
│ amount (numeric)                                           │
│ match_id (UUID) → matches(id)                             │
│ user_id (UUID) → users(id)                                │
│ created_at (timestamptz)                                  │
│ game_id (integer) → games(id) ← NOVO!                     │
│ bet_type (varchar) ← NOVO!                                │
│ status (varchar) ← NOVO!                                  │
│ odds (decimal) ← NOVO!                                    │
│ potential_winnings (decimal) ← NOVO!                      │
└─────────────────────────────────────────────────────────────┘
```

### **3. WITHDRAWS (Saques) - Agora Integrada!**
```
┌─────────────────────────────────────────────────────────────┐
│                      WITHDRAWS                             │
├─────────────────────────────────────────────────────────────┤
│ id (int8) PK                                              │
│ user_id (UUID) → users(id)                                │
│ amount (numeric)                                           │
│ method (text)                                              │
│ pix_key, pix_key_type (text)                              │
│ bank_account, bank_agency, bank_name (text)               │
│ status (text)                                              │
│ paid_at, requested_at (timestamptz)                       │
│ processed_by (UUID) → users(id) ← NOVO!                   │
│ transaction_id (varchar) ← NOVO!                          │
│ fee_amount (decimal) ← NOVO!                              │
│ net_amount (decimal) ← NOVO!                              │
└─────────────────────────────────────────────────────────────┘
```

## 🆕 **Novas Tabelas Criadas**

### **4. USER_QUESTION_STATS**
```
┌─────────────────────────────────────────────────────────────┐
│                 USER_QUESTION_STATS                        │
├─────────────────────────────────────────────────────────────┤
│ id (UUID) PK                                              │
│ user_id (UUID) → users(id)                                │
│ question_id (integer) → games(id)                         │
│ answered_correctly (boolean)                               │
│ time_taken_seconds (decimal)                               │
│ category (varchar)                                         │
│ difficulty_level (integer)                                 │
│ answered_at (timestamptz)                                  │
└─────────────────────────────────────────────────────────────┘
```

### **5. GAME_SESSIONS**
```
┌─────────────────────────────────────────────────────────────┐
│                    GAME_SESSIONS                           │
├─────────────────────────────────────────────────────────────┤
│ id (UUID) PK                                              │
│ user_id (UUID) → users(id)                                │
│ session_type (varchar) - solo/multiplayer/practice        │
│ category (varchar)                                         │
│ questions_answered (integer)                               │
│ correct_answers (integer)                                  │
│ total_score (integer)                                      │
│ time_spent_seconds (integer)                               │
│ started_at, ended_at (timestamptz)                        │
│ is_completed (boolean)                                     │
└─────────────────────────────────────────────────────────────┘
```

### **6. USER_CATEGORY_PERFORMANCE**
```
┌─────────────────────────────────────────────────────────────┐
│              USER_CATEGORY_PERFORMANCE                     │
├─────────────────────────────────────────────────────────────┤
│ id (UUID) PK                                              │
│ user_id (UUID) → users(id)                                │
│ category (varchar)                                         │
│ questions_answered (integer)                               │
│ correct_answers (integer)                                  │
│ total_score (integer)                                      │
│ best_score (integer)                                       │
│ average_time_seconds (decimal)                             │
│ last_played (timestamptz)                                  │
│ created_at, updated_at (timestamptz)                      │
└─────────────────────────────────────────────────────────────┘
```

### **7. ACHIEVEMENTS_PROGRESS**
```
┌─────────────────────────────────────────────────────────────┐
│                ACHIEVEMENTS_PROGRESS                       │
├─────────────────────────────────────────────────────────────┤
│ id (UUID) PK                                              │
│ user_id (UUID) → users(id)                                │
│ achievement_type (varchar)                                 │
│ current_progress (integer)                                 │
│ required_progress (integer)                                │
│ is_completed (boolean)                                     │
│ completed_at (timestamptz)                                 │
│ created_at, updated_at (timestamptz)                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 **Fluxo de Dados Integrado**

### **Fluxo 1: Jogador Responde Questão**
```
1. Usuário responde questão → user_question_stats
2. Trigger atualiza → games (times_used, success_rate)
3. Trigger atualiza → user_category_performance
4. Sistema atualiza → achievements_progress
5. Sistema atualiza → game_sessions
```

### **Fluxo 2: Usuário Faz Aposta**
```
1. Usuário faz aposta → bets
2. Sistema deduz → users.balance
3. Trigger calcula → potential_winnings
4. Após resultado → atualiza users.balance
5. Sistema registra → historico_jogos
```

### **Fluxo 3: Usuário Solicita Saque**
```
1. Usuário solicita saque → withdraws
2. Trigger calcula → fee_amount, net_amount
3. Sistema gera → transaction_id
4. Admin processa → processed_by
5. Sistema atualiza → users.balance
```

## 📊 **Views para Analytics**

### **1. user_comprehensive_stats**
- Estatísticas completas de cada usuário
- Total de sessões, questões, apostas, saques
- Percentual de acerto geral

### **2. category_performance_overview**
- Performance média por categoria
- Total de jogadores por categoria
- Tempo médio por questão

### **3. popular_questions**
- Questões mais utilizadas
- Taxa de sucesso por questão
- Dificuldade e popularidade

### **4. detailed_betting_history**
- Histórico completo de apostas
- Detalhes de cada aposta
- Resultados e ganhos

## 🚀 **Benefícios da Integração**

### **Para o Sistema:**
- ✅ Dados consistentes e relacionados
- ✅ Triggers automáticos para atualizações
- ✅ Analytics completos e integrados
- ✅ Rastreamento de performance

### **Para os Usuários:**
- ✅ Histórico completo de atividades
- ✅ Estatísticas detalhadas por categoria
- ✅ Sistema de conquistas integrado
- ✅ Rastreamento de progresso

### **Para o Negócio:**
- ✅ Analytics avançados
- ✅ Rastreamento de engajamento
- ✅ Métricas de performance
- ✅ Sistema escalável

## 🔧 **Como Aplicar**

1. **Execute o script `supabase_integration_complete.sql`**
2. **Verifique se todas as tabelas foram criadas**
3. **Teste os relacionamentos**
4. **Verifique os triggers funcionando**
5. **Teste as views de analytics**

---

**🎉 Agora seu sistema está completamente integrado e funcional!**
