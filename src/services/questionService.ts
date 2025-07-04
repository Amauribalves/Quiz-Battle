import { Question } from '../types';

// Configuração da API
const API_CONFIG = {
  // Open Trivia Database (gratuita)
  TRIVIA_DB: 'https://opentdb.com/api.php',
  
  // Quiz API (alternativa)
  QUIZ_API: 'https://quizapi.io/api/v1/questions',
  
  // Sua própria API (quando implementar)
  CUSTOM_API: import.meta.env.VITE_QUIZ_API_URL || 'http://localhost:3001/api'
};

// Mapeamento de categorias para Open Trivia DB
const TRIVIA_CATEGORIES = {
  current: 9, // General Knowledge
  math: 19, // Mathematics
  english: 9, // General Knowledge (não tem categoria específica)
  culture: 22, // Geography
  sports: 21, // Sports
  general: 9 // General Knowledge
};

// Mapeamento de dificuldade
const DIFFICULTY_MAP = {
  easy: 'easy',
  medium: 'medium',
  hard: 'hard'
};

// Interface para resposta da Open Trivia DB
interface TriviaDBResponse {
  response_code: number;
  results: Array<{
    category: string;
    type: string;
    difficulty: string;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
  }>;
}

// Interface para Quiz API
interface QuizAPIResponse {
  id: number;
  question: string;
  description: string;
  answers: {
    answer_a: string;
    answer_b: string;
    answer_c: string;
    answer_d: string;
  };
  multiple_correct_answers: string;
  correct_answers: {
    answer_a_correct: string;
    answer_b_correct: string;
    answer_c_correct: string;
    answer_d_correct: string;
  };
  category: string;
  difficulty: string;
}

class QuestionService {
  private apiKey: string | null = null;

  constructor() {
    // Configurar API key se necessário
    this.apiKey = import.meta.env.VITE_QUIZ_API_KEY || null;
  }

  // Método principal para buscar perguntas
  async getQuestions(
    category: string, 
    difficulty: string, 
    count: number = 5,
    source: 'local' | 'trivia' | 'quiz-api' | 'custom' = 'local'
  ): Promise<Question[]> {
    try {
      switch (source) {
        case 'trivia':
          return await this.getQuestionsFromTriviaDB(category, difficulty, count);
        case 'quiz-api':
          return await this.getQuestionsFromQuizAPI(category, difficulty, count);
        case 'custom':
          return await this.getQuestionsFromCustomAPI(category, difficulty, count);
        default:
          return await this.getLocalQuestions(category, difficulty, count);
      }
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
      // Fallback para perguntas locais
      return await this.getLocalQuestions(category, difficulty, count);
    }
  }

  // Buscar perguntas da Open Trivia Database (gratuita)
  private async getQuestionsFromTriviaDB(
    category: string, 
    difficulty: string, 
    count: number
  ): Promise<Question[]> {
    const categoryId = TRIVIA_CATEGORIES[category as keyof typeof TRIVIA_CATEGORIES] || 9;
    const difficultyLevel = DIFFICULTY_MAP[difficulty as keyof typeof DIFFICULTY_MAP] || 'easy';
    
    const url = `${API_CONFIG.TRIVIA_DB}?amount=${count}&category=${categoryId}&difficulty=${difficultyLevel}&type=multiple`;
    
    const response = await fetch(url);
    const data: TriviaDBResponse = await response.json();
    
    if (data.response_code !== 0) {
      throw new Error('Erro na API Trivia DB');
    }
    
    return data.results.map((item, index) => {
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

  // Buscar perguntas da Quiz API (paga, mas com trial gratuito)
  private async getQuestionsFromQuizAPI(
    category: string, 
    difficulty: string, 
    count: number
  ): Promise<Question[]> {
    if (!this.apiKey) {
      throw new Error('API Key necessária para Quiz API');
    }

    const url = `${API_CONFIG.QUIZ_API}?apiKey=${this.apiKey}&limit=${count}&difficulty=${difficulty}`;
    
    const response = await fetch(url);
    const data: QuizAPIResponse[] = await response.json();
    
    return data.map((item, index) => {
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

  // Buscar perguntas de sua própria API
  private async getQuestionsFromCustomAPI(
    category: string, 
    difficulty: string, 
    count: number
  ): Promise<Question[]> {
    const url = `${API_CONFIG.CUSTOM_API}/questions?category=${category}&difficulty=${difficulty}&limit=${count}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        // Adicionar headers de autenticação se necessário
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro na API customizada');
    }
    
    const data = await response.json();
    return data.questions || data;
  }

  // Fallback para perguntas locais
  private async getLocalQuestions(
    category: string, 
    difficulty: string, 
    count: number
  ): Promise<Question[]> {
    // Importar dinamicamente as perguntas locais
    const { getQuestionsByCategory } = await import('../data/questions');
    return getQuestionsByCategory(category, difficulty, count);
  }

  // Decodificar HTML entities
  private decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  // Método para testar conectividade da API
  async testAPIConnection(source: 'trivia' | 'quiz-api' | 'custom'): Promise<boolean> {
    try {
      switch (source) {
        case 'trivia':
          const triviaResponse = await fetch(`${API_CONFIG.TRIVIA_DB}?amount=1`);
          return triviaResponse.ok;
        
        case 'quiz-api':
          if (!this.apiKey) return false;
          const quizResponse = await fetch(`${API_CONFIG.QUIZ_API}?apiKey=${this.apiKey}&limit=1`);
          return quizResponse.ok;
        
        case 'custom':
          const customResponse = await fetch(`${API_CONFIG.CUSTOM_API}/health`);
          return customResponse.ok;
        
        default:
          return false;
      }
    } catch {
      return false;
    }
  }
}

export const questionService = new QuestionService();
export default questionService;