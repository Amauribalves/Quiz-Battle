import { Question, APISource } from '../types';
import { apiCache } from './apiCache';
import { APIValidator } from './apiValidator';
import { apiMetrics } from './apiMetrics';
import { supabase } from '../App';
import { API_CONFIG, getBestStrategy, getCategoryUrls } from '../config/apiConfig';

// Configuração avançada da API
const ENHANCED_API_CONFIG = {
  TRIVIA_DB: 'https://opentdb.com/api.php',
  QUIZ_API: 'https://quizapi.io/api/v1/questions',
  CUSTOM_API: import.meta.env.VITE_QUIZ_API_URL || 'http://localhost:3001/api',
  JSERVICE: 'https://jservice.io/api/clues',
  TRIVIA_API: 'https://the-trivia-api.com/api/questions',
  // Novas APIs gratuitas
  TRIVIA_DB_PT: 'https://opentdb.com/api.php?amount=50&lang=pt',
  QUIZ_DB: 'https://opentdb.com/api.php?amount=50&type=multiple',
  // API brasileira gratuita
  BRAZIL_QUIZ: 'https://opentdb.com/api.php?amount=50&category=22&lang=pt'
};

// Mapeamento avançado de categorias
const ENHANCED_CATEGORY_MAP = {
  trivia: {
    current: 9,      // General Knowledge
    math: 19,        // Mathematics
    english: 9,      // General Knowledge
    culture: 22,     // Geography
    sports: 21,      // Sports
    general: 9       // General Knowledge
  },
  'trivia-api': {
    current: 'general_knowledge',
    math: 'science',
    english: 'general_knowledge',
    culture: 'geography',
    sports: 'sport_and_leisure',
    general: 'general_knowledge'
  },
  // Mapeamento para Open Trivia DB com mais categorias
  'trivia-db-extended': {
    current: [9, 10, 11, 12],           // General Knowledge + Books + Film + Music
    math: [19, 25, 27],                  // Mathematics + Art + Animals
    english: [9, 10, 11, 12, 15],       // General + Books + Film + Music + Video Games
    culture: [22, 23, 24, 26],          // Geography + History + Politics + Celebrities
    sports: [21, 32],                    // Sports + Cartoons & Animations
    general: [9, 10, 11, 12, 15, 17]   // General + Books + Film + Music + Games + Science
  }
};

class EnhancedQuestionService {
  private apiKey: string | null = null;
  private retryAttempts = 3;
  private timeout = 10000; // 10 segundos

  constructor() {
    this.apiKey = import.meta.env.VITE_QUIZ_API_KEY || null;
  }

  async getQuestions(
    category: string,
    difficulty: string,
    count: number = 5,
    source: APISource = 'auto'
  ): Promise<Question[]> {
    const cacheKey = `questions_${source}_${category}_${difficulty}_${count}`;
    
    // Verificar cache primeiro
    const cachedQuestions = apiCache.get(cacheKey);
    if (cachedQuestions) {
      console.log('Usando perguntas do cache');
      return cachedQuestions;
    }

    const startTime = Date.now();
    let questions: Question[] = [];

    try {
      switch (source) {
        case 'auto':
          questions = await this.getQuestionsAuto(category, difficulty, count);
          break;
        case 'trivia':
          questions = await this.getQuestionsFromTriviaDB(category, difficulty, count);
          break;
        case 'trivia-api':
          questions = await this.getQuestionsFromTriviaAPI(category, difficulty, count);
          break;
        case 'jservice':
          questions = await this.getQuestionsFromJService(category, difficulty, count);
          break;
        case 'quiz-api':
          questions = await this.getQuestionsFromQuizAPI(category, difficulty, count);
          break;
        case 'custom':
          questions = await this.getQuestionsFromCustomAPI(category, difficulty, count);
          break;
        case 'supabase':
          questions = await this.getQuestionsFromSupabase(category, count);
          break;
        default:
          questions = await this.getLocalQuestions(category, difficulty, count);
      }

      // Validar perguntas
      const validation = APIValidator.validateAPIResponse(questions);
      if (!validation.isValid) {
        throw new Error(`Perguntas inválidas: ${validation.errors.join(', ')}`);
      }

      // Filtrar apenas questões em português
      const portugueseQuestions = questions.filter(q => this.isPortugueseQuestion(q.text));
      
      // Se não houver questões suficientes em português, usar fallback local
      if (portugueseQuestions.length < count) {
        console.log(`Apenas ${portugueseQuestions.length} questões em português encontradas, usando fallback local`);
        // Limpar o cache para esta chave para evitar problemas futuros
        apiCache.delete(cacheKey);
        return await this.getLocalQuestions(category, difficulty, count);
      }

      // Cache das perguntas válidas em português
      apiCache.set(cacheKey, portugueseQuestions, 10 * 60 * 1000); // 10 minutos

      // Registrar métrica de sucesso
      apiMetrics.recordMetric({
        endpoint: source,
        method: 'GET',
        status: 200,
        responseTime: Date.now() - startTime,
        success: true
      });

      return portugueseQuestions;

    } catch (error) {
      // Registrar métrica de erro
      apiMetrics.recordMetric({
        endpoint: source,
        method: 'GET',
        status: 500,
        responseTime: Date.now() - startTime,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
      });

      console.error(`Erro ao buscar perguntas de ${source}:`, error);
      
      // Fallback para perguntas locais
      return await this.getLocalQuestions(category, difficulty, count);
    }
  }

  // Nova API: The Trivia API
  private async getQuestionsFromTriviaAPI(
    category: string,
    difficulty: string,
    count: number
  ): Promise<Question[]> {
    const categoryMap = ENHANCED_CATEGORY_MAP['trivia-api'];
    const apiCategory = categoryMap[category as keyof typeof categoryMap] || 'general_knowledge';
    
    const url = `${ENHANCED_API_CONFIG.TRIVIA_API}?limit=${count}&categories=${apiCategory}&difficulty=${difficulty}`;
    
    const response = await this.fetchWithTimeout(url);
    const data = await response.json();
    
    return data.map((item: any, index: number) => {
      const options = [...item.incorrectAnswers, item.correctAnswer].sort(() => Math.random() - 0.5);
      const correctAnswer = options.indexOf(item.correctAnswer);
      
      return {
        id: `trivia_api_${Date.now()}_${index}`,
        text: item.question,
        options,
        correctAnswer,
        category,
        difficulty: difficulty as 'easy' | 'medium' | 'hard'
      };
    });
  }

  // Nova API: JService (Jeopardy!)
  private async getQuestionsFromJService(
    category: string,
    difficulty: string,
    count: number
  ): Promise<Question[]> {
    const url = `${ENHANCED_API_CONFIG.JSERVICE}?count=${count}`;
    
    const response = await this.fetchWithTimeout(url);
    const data = await response.json();
    
    return data.slice(0, count).map((item: any, index: number) => {
      // JService retorna perguntas no formato Jeopardy, precisamos adaptar
      const fakeOptions = this.generateFakeOptions(item.answer, 3);
      const options = [...fakeOptions, item.answer].sort(() => Math.random() - 0.5);
      const correctAnswer = options.indexOf(item.answer);
      
      return {
        id: `jservice_${item.id}`,
        text: item.question,
        options,
        correctAnswer,
        category,
        difficulty: difficulty as 'easy' | 'medium' | 'hard'
      };
    });
  }

  // Método inteligente que escolhe automaticamente a melhor fonte
  private async getQuestionsAuto(category: string, difficulty: string, count: number): Promise<Question[]> {
    // Obter a melhor estratégia baseada na categoria
    const strategy = getBestStrategy(category, difficulty, count);
    
    if (strategy === 'auto') {
      // Estratégia automática inteligente
      const sources = [
        { name: 'trivia-db-extended', priority: 1 },
        { name: 'trivia', priority: 2 },
        { name: 'trivia-api', priority: 3 },
        { name: 'jservice', priority: 4 },
        { name: 'local', priority: 5 }
      ];

      // Tentar cada fonte em ordem de prioridade
      for (const source of sources) {
        try {
          let questions: Question[] = [];
          
          switch (source.name) {
            case 'trivia-db-extended':
              questions = await this.getQuestionsFromTriviaDBExtended(category, difficulty, count);
              break;
            case 'trivia':
              questions = await this.getQuestionsFromTriviaDB(category, difficulty, count);
              break;
            case 'trivia-api':
              questions = await this.getQuestionsFromTriviaAPI(category, difficulty, count);
              break;
            case 'jservice':
              questions = await this.getQuestionsFromJService(category, difficulty, count);
              break;
            case 'local':
              questions = await this.getLocalQuestions(category, difficulty, count);
              break;
          }

          if (questions.length >= count) {
            console.log(`Usando fonte: ${source.name} - ${questions.length} perguntas encontradas`);
            return questions.slice(0, count);
          }
        } catch (error) {
          console.log(`Fonte ${source.name} falhou, tentando próxima...`);
          continue;
        }
      }
    } else {
      // Usar estratégia específica
      for (const source of strategy) {
        try {
          let questions: Question[] = [];
          
          switch (source) {
            case 'trivia-db-extended':
              questions = await this.getQuestionsFromTriviaDBExtended(category, difficulty, count);
              break;
            case 'trivia':
              questions = await this.getQuestionsFromTriviaDB(category, difficulty, count);
              break;
            case 'trivia-api':
              questions = await this.getQuestionsFromTriviaAPI(category, difficulty, count);
              break;
            case 'jservice':
              questions = await this.getQuestionsFromJService(category, difficulty, count);
              break;
            case 'quiz-api':
              questions = await this.getQuestionsFromQuizAPI(category, difficulty, count);
              break;
            case 'local':
              questions = await this.getLocalQuestions(category, difficulty, count);
              break;
          }

          if (questions.length >= count) {
            console.log(`Usando fonte: ${source} - ${questions.length} perguntas encontradas`);
            return questions.slice(0, count);
          }
        } catch (error) {
          console.log(`Fonte ${source} falhou, tentando próxima...`);
          continue;
        }
      }
    }

    // Se todas falharem, usar perguntas locais
    console.log('Todas as fontes falharam, usando perguntas locais');
    return await this.getLocalQuestions(category, difficulty, count);
  }

  // Método auxiliar para gerar opções falsas (para APIs que não fornecem)
  private generateFakeOptions(correctAnswer: string, count: number): string[] {
    const fakeOptions = [
      'Opção A', 'Opção B', 'Opção C', 'Opção D',
      'Alternativa 1', 'Alternativa 2', 'Alternativa 3'
    ];
    
    return fakeOptions
      .filter(opt => opt !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }

  // Fetch com timeout e retry
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Método com retry automático
  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await this.fetchWithTimeout(url, options);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.retryAttempts) {
          const delay = Math.pow(2, attempt) * 1000; // Backoff exponencial
          await new Promise(resolve => setTimeout(resolve, delay));
          console.log(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms...`);
        }
      }
    }

    throw lastError!;
  }

  // Método que busca perguntas de múltiplas categorias relacionadas
  private async getQuestionsFromTriviaDBExtended(
    category: string,
    difficulty: string,
    count: number
  ): Promise<Question[]> {
    const categoryIds = ENHANCED_CATEGORY_MAP['trivia-db-extended'][category as keyof typeof ENHANCED_CATEGORY_MAP['trivia-db-extended']] || [9];
    let allQuestions: Question[] = [];

    // Buscar perguntas de todas as categorias relacionadas
    for (const categoryId of categoryIds) {
      try {
        const url = `${ENHANCED_API_CONFIG.TRIVIA_DB}?amount=20&category=${categoryId}&difficulty=${difficulty}&type=multiple&lang=pt`;
        const response = await this.fetchWithRetry(url);
        const data = await response.json();
        
        if (data.response_code === 0 && data.results.length > 0) {
          const questions = data.results.map((item: any, index: number) => {
            const options = [...item.incorrect_answers, item.correct_answer].sort(() => Math.random() - 0.5);
            const correctAnswer = options.indexOf(item.correct_answer);
            
            return {
              id: `trivia_ext_${categoryId}_${Date.now()}_${index}`,
              text: this.decodeHtml(item.question),
              options: options.map(opt => this.decodeHtml(opt)),
              correctAnswer,
              category,
              difficulty: difficulty as 'easy' | 'medium' | 'hard'
            };
          });
          
          allQuestions.push(...questions);
        }
      } catch (error) {
        console.log(`Erro ao buscar categoria ${categoryId}:`, error);
        continue;
      }
    }

    // Embaralhar e retornar as perguntas
    return allQuestions.sort(() => Math.random() - 0.5);
  }

  // Métodos existentes atualizados...
  private async getQuestionsFromTriviaDB(
    category: string,
    difficulty: string,
    count: number
  ): Promise<Question[]> {
    const categoryId = ENHANCED_CATEGORY_MAP.trivia[category as keyof typeof ENHANCED_CATEGORY_MAP.trivia] || 9;
    const url = `${ENHANCED_API_CONFIG.TRIVIA_DB}?amount=${count}&category=${categoryId}&difficulty=${difficulty}&type=multiple&lang=pt`;
    
    const response = await this.fetchWithRetry(url);
    const data = await response.json();
    
    if (data.response_code !== 0) {
      throw new Error(`Trivia DB Error: ${data.response_code}`);
    }
    
    return data.results.map((item: any, index: number) => {
      const options = [...item.incorrect_answers, item.correct_answer].sort(() => Math.random() - 0.5);
      const correctAnswer = options.indexOf(item.correct_answer);
      
      return {
        id: `trivia_${Date.now()}_${index}`,
        text: this.decodeHtml(item.question),
        options: options.map(opt => this.decodeHtml(opt)),
        correctAnswer,
        category,
        difficulty: difficulty as 'easy' | 'medium' | 'hard'
      };
    });
  }

  private async getQuestionsFromQuizAPI(
    category: string,
    difficulty: string,
    count: number
  ): Promise<Question[]> {
    if (!this.apiKey) {
      throw new Error('API Key necessária para Quiz API');
    }

    const url = `${ENHANCED_API_CONFIG.QUIZ_API}?apiKey=${this.apiKey}&limit=${count}&difficulty=${difficulty}`;
    
    const response = await this.fetchWithRetry(url);
    const data = await response.json();
    
    return data.map((item: any, index: number) => {
      const options = [
        item.answers.answer_a,
        item.answers.answer_b,
        item.answers.answer_c,
        item.answers.answer_d
      ].filter(answer => answer !== null);
      
      let correctAnswer = 0;
      if (item.correct_answers.answer_b_correct === 'true') correctAnswer = 1;
      else if (item.correct_answers.answer_c_correct === 'true') correctAnswer = 2;
      else if (item.correct_answers.answer_d_correct === 'true') correctAnswer = 3;
      
      return {
        id: `quiz_api_${item.id}`,
        text: item.question,
        options,
        correctAnswer,
        category,
        difficulty: difficulty as 'easy' | 'medium' | 'hard'
      };
    });
  }

  private async getQuestionsFromCustomAPI(
    category: string,
    difficulty: string,
    count: number
  ): Promise<Question[]> {
    const url = `${ENHANCED_API_CONFIG.CUSTOM_API}/questions?category=${category}&difficulty=${difficulty}&limit=${count}`;
    
    const response = await this.fetchWithRetry(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      }
    });
    
    const data = await response.json();
    return data.questions || data;
  }

  private async getLocalQuestions(
    category: string,
    difficulty: string,
    count: number
  ): Promise<Question[]> {
    const { getQuestionsByCategory } = await import('../data/questions');
    return getQuestionsByCategory(category, difficulty, count);
  }

  private decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  // Método para verificar se uma questão está em português
  private isPortugueseQuestion(text: string): boolean {
    // Palavras comuns em inglês que indicam que a questão não está em português
    const englishWords = [
      'what', 'when', 'where', 'who', 'which', 'how', 'why',
      'is', 'are', 'was', 'were', 'has', 'have', 'had',
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
      'to', 'for', 'of', 'with', 'by', 'from', 'about', 'into',
      'through', 'during', 'before', 'after', 'above', 'below',
      'between', 'among', 'inside', 'outside', 'up', 'down',
      'left', 'right', 'north', 'south', 'east', 'west'
    ];
    
    // Palavras comuns em português que indicam que a questão está em português
    const portugueseWords = [
      'qual', 'quem', 'quando', 'onde', 'como', 'por que', 'porque',
      'é', 'são', 'era', 'eram', 'tem', 'têm', 'tinha', 'tinham',
      'o', 'a', 'os', 'as', 'um', 'uma', 'e', 'ou', 'mas', 'em', 'no', 'na',
      'para', 'por', 'de', 'com', 'sem', 'sobre', 'entre', 'dentro', 'fora',
      'cima', 'baixo', 'esquerda', 'direita', 'norte', 'sul', 'leste', 'oeste'
    ];
    
    const lowerText = text.toLowerCase();
    
    // Contar palavras em inglês vs português
    let englishCount = 0;
    let portugueseCount = 0;
    
    englishWords.forEach(word => {
      if (lowerText.includes(word.toLowerCase())) {
        englishCount++;
      }
    });
    
    portugueseWords.forEach(word => {
      if (lowerText.includes(word.toLowerCase())) {
        portugueseCount++;
      }
    });
    
    // Se há mais palavras em português ou se não há palavras em inglês, considerar português
    // Também verificar se há caracteres específicos do português
    const hasPortugueseChars = /[áàâãéèêíìîóòôõúùûç]/i.test(text);
    
    return (portugueseCount >= englishCount || englishCount === 0) || hasPortugueseChars;
  }

  // Métodos de diagnóstico
  async testAPIConnection(source: 'trivia' | 'quiz-api' | 'custom' | 'jservice' | 'trivia-api'): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      let response: Response;
      
      switch (source) {
        case 'trivia':
          response = await this.fetchWithTimeout(`${ENHANCED_API_CONFIG.TRIVIA_DB}?amount=1`);
          break;
        case 'trivia-api':
          response = await this.fetchWithTimeout(`${ENHANCED_API_CONFIG.TRIVIA_API}?limit=1`);
          break;
        case 'jservice':
          response = await this.fetchWithTimeout(`${ENHANCED_API_CONFIG.JSERVICE}?count=1`);
          break;
        case 'quiz-api':
          if (!this.apiKey) return false;
          response = await this.fetchWithTimeout(`${ENHANCED_API_CONFIG.QUIZ_API}?apiKey=${this.apiKey}&limit=1`);
          break;
        case 'custom':
          response = await this.fetchWithTimeout(`${ENHANCED_API_CONFIG.CUSTOM_API}/health`);
          break;
        default:
          return false;
      }

      const success = response.ok;
      
      apiMetrics.recordMetric({
        endpoint: source,
        method: 'GET',
        status: response.status,
        responseTime: Date.now() - startTime,
        success
      });

      return success;
    } catch (error) {
      apiMetrics.recordMetric({
        endpoint: source,
        method: 'GET',
        status: 0,
        responseTime: Date.now() - startTime,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      return false;
    }
  }

  // Métodos de estatísticas
  getAPIStats() {
    return apiMetrics.getStats();
  }

  getCacheStats() {
    return apiCache.getStats();
  }

  clearCache() {
    apiCache.clear();
  }

  clearMetrics() {
    apiMetrics.clear();
  }

  // Buscar perguntas da tabela 'games' do Supabase
  private async getQuestionsFromSupabase(
    category: string,
    count: number
  ): Promise<Question[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(count);
    if (error) {
      throw new Error('Erro ao buscar perguntas do Supabase: ' + error.message);
    }
    return (data || []).map((q: any) => ({
      id: q.id,
      text: q.question,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      correctAnswer: ['a', 'b', 'c', 'd'].indexOf(q.correct_option),
      category: q.category,
      difficulty: 'easy'
    }));
  }
}

export const enhancedQuestionService = new EnhancedQuestionService();
export default enhancedQuestionService;