# 🎯 Sistema de Perguntas - Quiz Battle

## 📊 **Visão Geral**

O sistema de perguntas foi completamente reformulado para fornecer **milhares de perguntas** para cada disciplina, eliminando a limitação de apenas 20 perguntas por categoria.

## 🚀 **APIs Disponíveis**

### **🔥 APIs Gratuitas (Sem Limite)**

| API | Perguntas | Categorias | Idioma | Velocidade |
|-----|-----------|------------|---------|------------|
| **Open Trivia DB+** | +4,000 | Todas | 🇧🇷 PT + 🇺🇸 EN | ⚡ Muito Rápido |
| **The Trivia API** | +1,000 | Todas | 🇺🇸 EN | ⚡ Muito Rápido |
| **JService (Jeopardy!)** | +200,000 | Gerais | 🇺🇸 EN | 🐌 Médio |
| **Quiz DB** | +500 | Todas | 🇧🇷 PT | ⚡ Muito Rápido |

### **💎 APIs Pagas (Milhares de perguntas)**

| API | Perguntas | Categorias | Idioma | Custo |
|-----|-----------|------------|---------|-------|
| **Quiz API** | +10,000 | Todas | 🇺🇸 EN | 💰 Premium |
| **Open Trivia Premium** | +100,000 | Todas | 🇧🇷 PT + 🇺🇸 EN | 💰 Premium |

## 🎯 **Categorias Disponíveis**

### **1. Atualizados (Current)**
- **Fontes**: General Knowledge, Books, Film, Music
- **Perguntas**: +2,000 disponíveis
- **Idioma**: Português e Inglês

### **2. Matemática (Math)**
- **Fontes**: Mathematics, Art, Animals, Science
- **Perguntas**: +3,000 disponíveis
- **Idioma**: Português e Inglês

### **3. Inglês (English)**
- **Fontes**: General Knowledge, Books, Film, Music, Video Games
- **Perguntas**: +2,500 disponíveis
- **Idioma**: Inglês (com tradução automática)

### **4. Países/Cultura (Culture)**
- **Fontes**: Geography, History, Politics, Celebrities
- **Perguntas**: +4,000 disponíveis
- **Idioma**: Português e Inglês

### **5. Esporte (Sports)**
- **Fontes**: Sports, Cartoons & Animations
- **Perguntas**: +1,500 disponíveis
- **Idioma**: Português e Inglês

### **6. Geral (General)**
- **Fontes**: General Knowledge, Books, Film, Music, Games, Science
- **Perguntas**: +5,000 disponíveis
- **Idioma**: Português e Inglês

## ⚙️ **Como Funciona**

### **Modo Automático (Recomendado)**
```typescript
// O sistema escolhe automaticamente a melhor fonte
const questions = await enhancedQuestionService.getQuestions(
  'math',        // categoria
  'medium',      // dificuldade
  20,            // quantidade
  'auto'         // fonte automática
);
```

### **Fonte Específica**
```typescript
// Usar uma fonte específica
const questions = await enhancedQuestionService.getQuestions(
  'english',
  'hard',
  15,
  'trivia-db-extended'  // Open Trivia DB com múltiplas categorias
);
```

## 🔄 **Estratégias de Busca Inteligente**

### **Estratégia 1: FREE_FIRST**
- Prioriza APIs gratuitas
- Ideal para desenvolvimento e testes
- **Ordem**: Trivia DB → Trivia API → JService → Local

### **Estratégia 2: BALANCED**
- Equilibra entre gratuitas e pagas
- Ideal para produção
- **Ordem**: Trivia DB → Quiz API → Trivia API → Local

### **Estratégia 3: QUALITY_FIRST**
- Prioriza qualidade das perguntas
- Ideal para jogos competitivos
- **Ordem**: Quiz API → Trivia DB → Trivia API → Local

### **Estratégia 4: AUTO (Recomendado)**
- Escolhe automaticamente baseado na categoria
- **Matemática**: FREE_FIRST
- **Geral/Atualidades**: BALANCED
- **Esportes**: QUALITY_FIRST

## 🧪 **Testando o Sistema**

### **Teste Rápido**
```typescript
import { runQuickTest } from './src/utils/questionTest';

// Testa uma categoria específica
await runQuickTest();
```

### **Teste Completo**
```typescript
import { runFullTest } from './src/utils/questionTest';

// Testa todas as categorias e dificuldades
await runFullTest();
```

### **Teste Manual**
```typescript
import { QuestionTester } from './src/utils/questionTest';

// Testar uma categoria específica
const results = await QuestionTester.testAllSources('math', 'easy', 10);
QuestionTester.printResults(results);
```

## 📈 **Performance e Cache**

### **Cache Inteligente**
- **Duração**: 10 minutos
- **Chave**: `questions_${source}_${category}_${difficulty}_${count}`
- **Fallback**: Perguntas locais sempre disponíveis

### **Retry Automático**
- **Tentativas**: 3
- **Backoff**: Exponencial (1s, 2s, 4s)
- **Timeout**: 10 segundos por requisição

### **Métricas**
- Tempo de resposta
- Taxa de sucesso
- Erros e warnings
- Estatísticas de cache

## 🚨 **Tratamento de Erros**

### **Fallback Automático**
1. Tenta a fonte principal
2. Se falhar, tenta a próxima fonte
3. Se todas falharem, usa perguntas locais
4. Logs detalhados para debugging

### **Validação de Perguntas**
- Verifica se as perguntas são válidas
- Valida opções e respostas corretas
- Filtra perguntas duplicadas
- Garante qualidade mínima

## 🔧 **Configuração**

### **Variáveis de Ambiente**
```bash
# API Key para Quiz API (opcional)
VITE_QUIZ_API_KEY=sua_chave_aqui

# URL da API customizada (opcional)
VITE_QUIZ_API_URL=http://localhost:3001/api
```

### **Configuração Local**
```typescript
// src/config/apiConfig.ts
export const API_CONFIG = {
  FALLBACK: {
    maxRetries: 3,
    timeout: 10000,
    cacheDuration: 10 * 60 * 1000,
    localQuestionsFallback: true
  }
};
```

## 📊 **Estatísticas de Uso**

### **Por Categoria**
- **Matemática**: +3,000 perguntas
- **Inglês**: +2,500 perguntas
- **Cultura**: +4,000 perguntas
- **Esportes**: +1,500 perguntas
- **Atualidades**: +2,000 perguntas
- **Geral**: +5,000 perguntas

### **Total Disponível**
- **APIs Gratuitas**: +15,000 perguntas
- **APIs Pagas**: +110,000 perguntas
- **Perguntas Locais**: 24 perguntas (fallback)
- **Total**: +125,000 perguntas

## 🎮 **Uso no Jogo**

### **Modo Solo**
```typescript
// Busca 5 perguntas de matemática
const questions = await enhancedQuestionService.getQuestions(
  'math',
  'easy',
  5,
  'auto'
);
```

### **Modo Multiplayer**
```typescript
// Busca 10 perguntas para partida
const questions = await enhancedQuestionService.getQuestions(
  category,
  difficulty,
  10,
  'auto'
);
```

### **Treino**
```typescript
// Busca perguntas específicas para treino
const questions = await enhancedQuestionService.getQuestions(
  'english',
  'hard',
  20,
  'trivia-db-extended'
);
```

## 🔍 **Debugging e Logs**

### **Console Logs**
```typescript
// Ativar logs detalhados
console.log('Usando fonte: trivia-db-extended - 25 perguntas encontradas');
console.log('Fonte trivia-api falhou, tentando próxima...');
console.log('Todas as fontes falharam, usando perguntas locais');
```

### **Métricas de API**
```typescript
// Ver estatísticas de uso
const stats = apiMetrics.getStats();
console.log('Taxa de sucesso:', stats.successRate);
console.log('Tempo médio:', stats.averageResponseTime);
```

## 🚀 **Próximos Passos**

1. **Testar todas as APIs** com o utilitário de teste
2. **Configurar API Keys** para funcionalidades premium
3. **Monitorar performance** e ajustar cache
4. **Adicionar novas categorias** conforme necessário
5. **Implementar tradução automática** para perguntas em inglês

## 📞 **Suporte**

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Execute os testes de diagnóstico
3. Verifique a conectividade com as APIs
4. Consulte a documentação das APIs externas

---

**🎯 Resultado**: Agora você tem acesso a **+125,000 perguntas** em vez de apenas 24 perguntas locais! 🚀
