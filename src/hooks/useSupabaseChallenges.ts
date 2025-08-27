import { useState, useEffect } from 'react';
import { User } from '../types';
import supabaseChallengeService, { 
  SupabaseChallenge, 
  UserChallengeProgress, 
  ChallengeStats 
} from '../services/supabaseChallengeService';

export const useSupabaseChallenges = (user: User | null) => {
  const [dailyChallenges, setDailyChallenges] = useState<SupabaseChallenge[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<SupabaseChallenge[]>([]);
  const [userProgress, setUserProgress] = useState<UserChallengeProgress[]>([]);
  const [userStats, setUserStats] = useState<ChallengeStats | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar todos os dados dos desafios
  const loadChallengesData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Carregar desafios diários e semanais
      const [daily, weekly] = await Promise.all([
        supabaseChallengeService.getChallengesByType('daily'),
        supabaseChallengeService.getChallengesByType('weekly')
      ]);
      
      setDailyChallenges(daily);
      setWeeklyChallenges(weekly);
      
      // Carregar progresso do usuário
      const progress = await supabaseChallengeService.getUserAllChallengeProgress(user.id);
      setUserProgress(progress);
      
      // Carregar estatísticas do usuário
      const stats = await supabaseChallengeService.getUserChallengeStats(user.id);
      setUserStats(stats);
      
      // Calcular progresso geral
      const overall = await supabaseChallengeService.getUserOverallProgress(user.id);
      setOverallProgress(overall);
      
    } catch (err) {
      console.error('Erro ao carregar dados dos desafios:', err);
      setError('Erro ao carregar desafios. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar progresso baseado no resultado de um jogo
  const updateProgressFromGame = async (gameResult: {
    won: boolean;
    category?: string;
    questionsAnswered: number;
    correctAnswers: number;
  }) => {
    if (!user) return;
    
    try {
      await supabaseChallengeService.updateProgressFromGame(user.id, gameResult);
      
      // Recarregar dados para mostrar progresso atualizado
      await loadChallengesData();
    } catch (err) {
      console.error('Erro ao atualizar progresso:', err);
      setError('Erro ao atualizar progresso. Tente novamente.');
    }
  };

  // Reclamar recompensa
  const claimReward = async (challengeId: string) => {
    if (!user) return { success: false, message: 'Usuário não autenticado' };
    
    try {
      const result = await supabaseChallengeService.claimReward(user.id, challengeId);
      
      if (result.success) {
        // Recarregar dados para mostrar status atualizado
        await loadChallengesData();
      }
      
      return result;
    } catch (err) {
      console.error('Erro ao reclamar recompensa:', err);
      return { success: false, message: 'Erro interno ao reclamar recompensa' };
    }
  };

  // Função para obter progresso de um desafio específico
  const getChallengeProgress = (challengeId: string): UserChallengeProgress | null => {
    return userProgress.find(p => p.challenge_id === challengeId) || null;
  };

  // Função para verificar se um desafio está completo
  const isChallengeCompleted = (challengeId: string): boolean => {
    const progress = getChallengeProgress(challengeId);
    return progress?.is_completed || false;
  };

  // Função para verificar se uma recompensa foi reclamada
  const isRewardClaimed = (challengeId: string): boolean => {
    const progress = getChallengeProgress(challengeId);
    return progress?.is_claimed || false;
  };

  // Função para obter progresso atual de um desafio
  const getChallengeCurrentProgress = (challengeId: string): number => {
    const progress = getChallengeProgress(challengeId);
    return progress?.progress || 0;
  };

  // Função para calcular progresso em porcentagem
  const getChallengeProgressPercentage = (challengeId: string): number => {
    const challenge = [...dailyChallenges, ...weeklyChallenges].find(c => c.id === challengeId);
    if (!challenge) return 0;
    
    const currentProgress = getChallengeCurrentProgress(challengeId);
    return Math.round((currentProgress / challenge.requirement_value) * 100);
  };

  // Função para obter desafios com progresso combinado
  const getChallengesWithProgress = (type: 'daily' | 'weekly') => {
    const challenges = type === 'daily' ? dailyChallenges : weeklyChallenges;
    
    return challenges.map(challenge => ({
      ...challenge,
      progress: getChallengeCurrentProgress(challenge.id),
      isCompleted: isChallengeCompleted(challenge.id),
      isClaimed: isRewardClaimed(challenge.id),
      progressPercentage: getChallengeProgressPercentage(challenge.id)
    }));
  };

  // Função para resetar dados (útil para testes)
  const resetChallengesData = () => {
    setDailyChallenges([]);
    setWeeklyChallenges([]);
    setUserProgress([]);
    setUserStats(null);
    setOverallProgress(0);
    setError(null);
  };

  // Função para forçar recarregamento
  const refreshChallenges = () => {
    loadChallengesData();
  };

  // Carregar dados quando o usuário mudar
  useEffect(() => {
    loadChallengesData();
  }, [user]);

  return {
    // Dados dos desafios
    dailyChallenges,
    weeklyChallenges,
    userProgress,
    userStats,
    overallProgress,
    
    // Estado de carregamento
    isLoading,
    error,
    
    // Funções principais
    updateProgressFromGame,
    claimReward,
    refreshChallenges,
    
    // Funções utilitárias
    getChallengeProgress,
    isChallengeCompleted,
    isRewardClaimed,
    getChallengeCurrentProgress,
    getChallengeProgressPercentage,
    getChallengesWithProgress,
    
    // Funções de controle
    resetChallengesData
  };
};
