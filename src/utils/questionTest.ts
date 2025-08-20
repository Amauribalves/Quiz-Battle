 // Utilitário para testar o sistema de perguntas
import { enhancedQuestionService } from '../services/enhancedQuestionService';

export interface QuestionTestResult {
  category: string;
  difficulty: string;
  source: string;
  questionsFound: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

export class QuestionTester {
  private static async testSource(
    category: string,
    difficulty: string,
    count: number,
    source: string
  ): Promise<QuestionTestResult> {
    const startTime = Date.now();
    
    try {
      const questions = await enhancedQuestionService.getQuestions(category, difficulty, count, source as any);
      const responseTime = Date.now() - startTime;
      
      return {
        category,
        difficulty,
        source,
        questionsFound: questions.length,
        responseTime,
        success: true
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        category,
        difficulty,
        source,
        questionsFound: 0,
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  static async testAllSources(
    category: string,
    difficulty: string = 'easy',
    count: number = 10
  ): Promise<QuestionTestResult[]> {
    const sources = [
      'auto',
      'trivia-db-extended',
      'trivia',
      'trivia-api',
      'jservice',
      'local'
    ];

    const results: QuestionTestResult[] = [];
    
    for (const source of sources) {
      console.log(`Testando fonte: ${source}`);
      const result = await this.testSource(category, difficulty, count, source);
      results.push(result);
      
      // Aguardar um pouco entre as requisições para não sobrecarregar as APIs
      if (source !== 'local') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  static async testAllCategories(count: number = 10): Promise<Record<string, QuestionTestResult[]>> {
    const categories = ['current', 'math', 'english', 'culture', 'sports', 'general'];
    const difficulties = ['easy', 'medium', 'hard'];
    
    const results: Record<string, QuestionTestResult[]> = {};
    
    for (const category of categories) {
      console.log(`\n=== Testando categoria: ${category} ===`);
      results[category] = [];
      
      for (const difficulty of difficulties) {
        console.log(`\n--- Dificuldade: ${difficulty} ---`);
        const categoryResults = await this.testAllSources(category, difficulty, count);
        results[category].push(...categoryResults);
      }
    }
    
    return results;
  }

  static printResults(results: QuestionTestResult[], count: number): void {
    console.log('\n=== RESULTADOS DOS TESTES ===\n');
    
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const time = `${result.responseTime}ms`;
      const questions = `${result.questionsFound}/${count}`;
      
      console.log(`${status} ${result.source.padEnd(20)} | ${questions.padEnd(8)} | ${time.padEnd(8)} | ${result.category} (${result.difficulty})`);
      
      if (!result.success && result.error) {
        console.log(`   Erro: ${result.error}`);
      }
    });
  }

  static printCategorySummary(results: Record<string, QuestionTestResult[]>): void {
    console.log('\n=== RESUMO POR CATEGORIA ===\n');
    
    Object.entries(results).forEach(([category, categoryResults]) => {
      const totalQuestions = categoryResults.reduce((sum, r) => sum + r.questionsFound, 0);
      const successRate = (categoryResults.filter(r => r.success).length / categoryResults.length * 100).toFixed(1);
      
      console.log(`${category.toUpperCase().padEnd(15)} | Total: ${totalQuestions.toString().padEnd(3)} | Sucesso: ${successRate}%`);
    });
  }
}

// Função para executar testes rapidamente
export const runQuickTest = async () => {
  console.log('🚀 Iniciando teste rápido do sistema de perguntas...\n');
  
  try {
    // Teste rápido com uma categoria
    const results = await QuestionTester.testAllSources('math', 'easy', 5);
    QuestionTester.printResults(results, 5);
    
    console.log('\n✅ Teste rápido concluído!');
    console.log('\n💡 Para um teste completo, use: QuestionTester.testAllCategories()');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
};

// Função para executar teste completo
export const runFullTest = async () => {
  console.log('🚀 Iniciando teste completo do sistema de perguntas...\n');
  
  try {
    const results = await QuestionTester.testAllCategories(5);
    
          Object.entries(results).forEach(([category, categoryResults]) => {
        console.log(`\n=== ${category.toUpperCase()} ===`);
        QuestionTester.printResults(categoryResults, 5);
      });
    
    QuestionTester.printCategorySummary(results);
    
    console.log('\n✅ Teste completo concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste completo:', error);
  }
};
