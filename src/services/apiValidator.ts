import { Question } from '../types';

export interface APIValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class APIValidator {
  static validateQuestion(question: any): APIValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validações obrigatórias
    if (!question.text || typeof question.text !== 'string') {
      errors.push('Pergunta deve ter texto válido');
    }

    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push('Pergunta deve ter pelo menos 2 opções');
    }

    if (typeof question.correctAnswer !== 'number' || 
        question.correctAnswer < 0 || 
        question.correctAnswer >= (question.options?.length || 0)) {
      errors.push('Resposta correta deve ser um índice válido');
    }

    if (!question.category || typeof question.category !== 'string') {
      errors.push('Pergunta deve ter categoria válida');
    }

    if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
      errors.push('Dificuldade deve ser easy, medium ou hard');
    }

    // Validações de qualidade
    if (question.text && question.text.length < 10) {
      warnings.push('Pergunta muito curta');
    }

    if (question.options && question.options.some((opt: string) => opt.length < 2)) {
      warnings.push('Algumas opções são muito curtas');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateAPIResponse(response: any): APIValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(response) && !response.questions) {
      errors.push('Resposta da API deve ser um array ou conter propriedade "questions"');
      return { isValid: false, errors, warnings };
    }

    const questions = Array.isArray(response) ? response : response.questions;
    
    if (questions.length === 0) {
      warnings.push('API retornou 0 perguntas');
    }

    let validQuestions = 0;
    questions.forEach((question: any, index: number) => {
      const validation = this.validateQuestion(question);
      if (validation.isValid) {
        validQuestions++;
      } else {
        errors.push(`Pergunta ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    if (validQuestions === 0) {
      errors.push('Nenhuma pergunta válida encontrada');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}