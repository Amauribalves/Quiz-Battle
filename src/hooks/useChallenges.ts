import { useState, useEffect } from 'react';
import { Challenge, Mission, User } from '../types';
import challengeService from '../services/challengeService';

export const useChallenges = (user: User | null) => {
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<Mission[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar desafios e missões
  const loadChallenges = () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const daily = challengeService.getDailyChallenges();
      const weekly = challengeService.getWeeklyMissions();
      const progress = challengeService.getOverallProgress();
      
      setDailyChallenges(daily);
      setWeeklyMissions(weekly);
      setOverallProgress(progress);
    } catch (error) {
      console.error('Erro ao carregar desafios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar progresso baseado no resultado de um jogo
  const updateProgress = (gameResult: {
    won: boolean;
    category?: string;
    questionsAnswered: number;
    correctAnswers: number;
  }) => {
    if (!user) return;
    
    challengeService.updateProgress(user, gameResult);
    loadChallenges(); // Recarregar para mostrar progresso atualizado
  };

  // Reclamar recompensa
  const claimReward = (challengeId: string) => {
    const result = challengeService.claimReward(challengeId);
    
    if (result.success) {
      // Recarregar desafios para mostrar status atualizado
      loadChallenges();
      return result;
    }
    
    return result;
  };

  // Resetar desafios diários (para admin)
  const resetDailyChallenges = () => {
    challengeService.resetDailyChallenges();
    loadChallenges();
  };

  // Resetar missões semanais (para admin)
  const resetWeeklyMissions = () => {
    challengeService.resetWeeklyMissions();
    loadChallenges();
  };

  // Carregar desafios quando o usuário mudar
  useEffect(() => {
    loadChallenges();
  }, [user]);

  return {
    dailyChallenges,
    weeklyMissions,
    overallProgress,
    isLoading,
    updateProgress,
    claimReward,
    resetDailyChallenges,
    resetWeeklyMissions,
    loadChallenges
  };
};
