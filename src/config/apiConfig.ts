// Configuração centralizada para todas as APIs de perguntas
export const API_CONFIG = {
  // APIs Gratuitas (Sem Limite)
  FREE_APIS: {
    // Open Trivia Database - +4000 perguntas em português
    TRIVIA_DB: {
      baseUrl: 'https://opentdb.com/api.php',
      categories: {
        current: [9, 10, 11, 12],           // General + Books + Film + Music
        math: [19, 25, 27],                  // Mathematics + Art + Animals
        english: [9, 10, 11, 12, 15],       // General + Books + Film + Music + Games
        culture: [22, 23, 24, 26],          // Geography + History + Politics + Celebrities
        sports: [21, 32],                    // Sports + Cartoons
        general: [9, 10, 11, 12, 15, 17]   // General + Books + Film + Music + Games + Science
      },
      maxQuestions: 50,
      languages: ['pt', 'en'],
      free: true,
      priority: 1
    },

    // The Trivia API - +1000 perguntas por categoria
    TRIVIA_API: {
      baseUrl: 'https://the-trivia-api.com/api/questions',
      categories: {
        current: 'general_knowledge',
        math: 'science',
        english: 'general_knowledge',
        culture: 'geography',
        sports: 'sport_and_leisure',
        general: 'general_knowledge'
      },
      maxQuestions: 20,
      free: true,
      priority: 2
    },

    // JService (Jeopardy!) - +200,000 perguntas em inglês
    JSERVICE: {
      baseUrl: 'https://jservice.io/api/clues',
      maxQuestions: 100,
      free: true,
      priority: 3
    },

    // Quiz DB - +500 perguntas gratuitas
    QUIZ_DB: {
      baseUrl: 'https://opentdb.com/api.php',
      maxQuestions: 50,
      free: true,
      priority: 4
    }
  },

  // APIs Pagas (Milhares de perguntas)
  PREMIUM_APIS: {
    // Quiz API - +10,000 perguntas por categoria
    QUIZ_API: {
      baseUrl: 'https://quizapi.io/api/v1/questions',
      requiresKey: true,
      maxQuestions: 1000,
      free: false,
      priority: 5
    },

    // Open Trivia Premium - +100,000 perguntas
    TRIVIA_PREMIUM: {
      baseUrl: 'https://opentdb.com/api.php',
      requiresKey: false,
      maxQuestions: 1000,
      free: false,
      priority: 6
    }
  },

  // Configurações de Fallback
  FALLBACK: {
    maxRetries: 3,
    timeout: 10000,
    cacheDuration: 10 * 60 * 1000, // 10 minutos
    localQuestionsFallback: true
  },

  // Estratégias de Busca
  SEARCH_STRATEGIES: {
    // Estratégia 1: Tentar APIs gratuitas primeiro
    FREE_FIRST: ['trivia-db', 'trivia-api', 'jservice', 'local'],
    
    // Estratégia 2: Balancear entre gratuitas e pagas
    BALANCED: ['trivia-db', 'quiz-api', 'trivia-api', 'local'],
    
    // Estratégia 3: Priorizar qualidade (APIs pagas)
    QUALITY_FIRST: ['quiz-api', 'trivia-db', 'trivia-api', 'local'],
    
    // Estratégia 4: Modo automático (recomendado)
    AUTO: 'auto'
  }
};

// Função para obter a melhor estratégia baseada no contexto
export const getBestStrategy = (category: string, difficulty: string, count: number) => {
  // Para categorias específicas como matemática, priorizar APIs com mais conteúdo
  if (category === 'math') {
    return API_CONFIG.SEARCH_STRATEGIES.FREE_FIRST;
  }
  
  // Para categorias gerais, usar estratégia balanceada
  if (category === 'general' || category === 'current') {
    return API_CONFIG.SEARCH_STRATEGIES.BALANCED;
  }
  
  // Para categorias específicas como esportes, priorizar APIs especializadas
  if (category === 'sports') {
    return API_CONFIG.SEARCH_STRATEGIES.QUALITY_FIRST;
  }
  
  // Padrão: estratégia automática
  return API_CONFIG.SEARCH_STRATEGIES.AUTO;
};

// Função para obter URLs de categorias específicas
export const getCategoryUrls = (category: string, difficulty: string, count: number) => {
  const urls: string[] = [];
  
  // Open Trivia DB com múltiplas categorias
  const triviaCategories = API_CONFIG.FREE_APIS.TRIVIA_DB.categories[category as keyof typeof API_CONFIG.FREE_APIS.TRIVIA_DB.categories];
  if (triviaCategories) {
    triviaCategories.forEach(catId => {
      urls.push(`${API_CONFIG.FREE_APIS.TRIVIA_DB.baseUrl}?amount=${Math.min(count * 2, API_CONFIG.FREE_APIS.TRIVIA_DB.maxQuestions)}&category=${catId}&difficulty=${difficulty}&type=multiple&lang=pt`);
    });
  }
  
  // The Trivia API
  const triviaApiCategory = API_CONFIG.FREE_APIS.TRIVIA_API.categories[category as keyof typeof API_CONFIG.FREE_APIS.TRIVIA_API.categories];
  if (triviaApiCategory) {
    urls.push(`${API_CONFIG.FREE_APIS.TRIVIA_API.baseUrl}?limit=${Math.min(count * 2, API_CONFIG.FREE_APIS.TRIVIA_API.maxQuestions)}&categories=${triviaApiCategory}&difficulty=${difficulty}`);
  }
  
  // JService para categorias gerais
  if (category === 'general' || category === 'current') {
    urls.push(`${API_CONFIG.FREE_APIS.JSERVICE.baseUrl}?count=${Math.min(count * 2, API_CONFIG.FREE_APIS.JSERVICE.maxQuestions)}`);
  }
  
  return urls;
};
