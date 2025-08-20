import { useState, useEffect } from 'react';
import { Question } from '../types';
import questionService from '../services/questionService';

interface UseQuestionsOptions {
  category: string;
  difficulty: string;
  count?: number;
  source?: 'local' | 'trivia' | 'quiz-api' | 'custom';
  autoFetch?: boolean;
}

interface UseQuestionsReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  fetchQuestions: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useQuestions = ({
  category,
  difficulty,
  count = 5,
  source = 'auto',
  autoFetch = false
}: UseQuestionsOptions): UseQuestionsReturn => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    if (!category || !difficulty) return;

    setLoading(true);
    setError(null);

    try {
      const fetchedQuestions = await questionService.getQuestions(
        category,
        difficulty,
        count,
        source
      );
      
      setQuestions(fetchedQuestions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar perguntas';
      setError(errorMessage);
      console.error('Erro ao buscar perguntas:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchQuestions();
  };

  useEffect(() => {
    if (autoFetch) {
      fetchQuestions();
    }
  }, [category, difficulty, count, source, autoFetch]);

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    refetch
  };
};