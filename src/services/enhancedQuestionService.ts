import { Question } from '../types';
import { apiCache } from './apiCache';
import { APIValidator } from './apiValidator';
import { apiMetrics } from './apiMetrics';
import { supabase } from '../App';

// Configuração avançada da API
const ENHANCED_API_CONFIG = {
  TRIVIA_DB: 'https://opentdb.com/api.php',
  QUIZ_API: 'https://quizapi.io/api/v1/questions',
  CUSTOM_API: import.meta.env.VITE_QUIZ_API_URL || 'http://localhost:3001/api',
  JSERVICE: 'https://jservice.io/api/clues',
  TRIVIA_API: 'https://the-trivia-api.com/api/questions'
};

// Mapeamento avançado de categorias
const ENHANCED_CATEGORY_MAP = {
  trivia: {
    current: 9,
    math: 19,
    english: 9,
    culture: 22,
    sports: 21,
    general: 9
  },
  'trivia-api': {
    current: 'general_knowledge',
    math: 'science',
    english: 'general_knowledge',
    culture: 'geography',
    sports: 'sport_and_leisure',
    general: 'general_knowledge'
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
    source: 'local' | 'trivia' | 'quiz-api' | 'custom' | 'jservice' | 'trivia-api' | 'supabase' = 'local'
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

      // Cache das perguntas válidas
      apiCache.set(cacheKey, questions, 10 * 60 * 1000); // 10 minutos

      // Registrar métrica de sucesso
      apiMetrics.recordMetric({
        endpoint: source,
        method: 'GET',
        status: 200,
        responseTime: Date.now() - startTime,
        success: true
      });

      return questions;

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

  // Métodos existentes atualizados...
  private async getQuestionsFromTriviaDB(
    category: string,
    difficulty: string,
    count: number
  ): Promise<Question[]> {
    const categoryId = ENHANCED_CATEGORY_MAP.trivia[category as keyof typeof ENHANCED_CATEGORY_MAP.trivia] || 9;
    const url = `${ENHANCED_API_CONFIG.TRIVIA_DB}?amount=${count}&category=${categoryId}&difficulty=${difficulty}&type=multiple`;
    
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