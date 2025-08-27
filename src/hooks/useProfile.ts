import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import profileService, { ProfileUpdateData, ProfileStats, ProfileActivity } from '../services/profileService';

export interface UseProfileReturn {
  // Estado do perfil
  profile: User | null;
  stats: ProfileStats | null;
  activities: ProfileActivity[];
  
  // Estados de carregamento
  isLoadingProfile: boolean;
  isLoadingStats: boolean;
  isLoadingActivities: boolean;
  isUpdating: boolean;
  
  // Funções
  updateProfile: (data: ProfileUpdateData) => Promise<{
    success: boolean;
    message: string;
  }>;
  refreshProfile: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshActivities: () => Promise<void>;
  
  // Estados de erro
  profileError: string | null;
  statsError: string | null;
  activitiesError: string | null;
  
  // Limpar erros
  clearErrors: () => void;
}

export const useProfile = (userId: string): UseProfileReturn => {
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [activities, setActivities] = useState<ProfileActivity[]>([]);
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [profileError, setProfileError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  // Carregar perfil do usuário
  const loadProfile = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoadingProfile(true);
      setProfileError(null);
      
      const userProfile = await profileService.getUserProfile(userId);
      
      if (userProfile) {
        setProfile(userProfile);
      } else {
        setProfileError('Não foi possível carregar o perfil do usuário');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setProfileError('Erro ao carregar perfil do usuário');
    } finally {
      setIsLoadingProfile(false);
    }
  }, [userId]);

  // Carregar estatísticas do perfil
  const loadStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoadingStats(true);
      setStatsError(null);
      
      const userStats = await profileService.getProfileStats(userId);
      
      if (userStats) {
        setStats(userStats);
      } else {
        setStatsError('Não foi possível carregar as estatísticas');
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStatsError('Erro ao carregar estatísticas do usuário');
    } finally {
      setIsLoadingStats(false);
    }
  }, [userId]);

  // Carregar atividades recentes
  const loadActivities = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoadingActivities(true);
      setActivitiesError(null);
      
      const userActivities = await profileService.getRecentActivity(userId, 15);
      setActivities(userActivities);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      setActivitiesError('Erro ao carregar atividades recentes');
    } finally {
      setIsLoadingActivities(false);
    }
  }, [userId]);

  // Atualizar perfil
  const updateProfile = useCallback(async (data: ProfileUpdateData): Promise<{
    success: boolean;
    message: string;
  }> => {
    if (!userId) {
      return {
        success: false,
        message: 'ID do usuário não encontrado'
      };
    }

    try {
      setIsUpdating(true);
      
      const result = await profileService.updateProfile(userId, data);
      
      if (result.success && result.updatedUser) {
        setProfile(result.updatedUser);
        // Recarregar estatísticas após atualização
        await loadStats();
        // Recarregar atividades após atualização
        await loadActivities();
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return {
        success: false,
        message: 'Erro inesperado ao atualizar perfil'
      };
    } finally {
      setIsUpdating(false);
    }
  }, [userId, loadStats, loadActivities]);

  // Funções de refresh
  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const refreshStats = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  const refreshActivities = useCallback(async () => {
    await loadActivities();
  }, [loadActivities]);

  // Limpar erros
  const clearErrors = useCallback(() => {
    setProfileError(null);
    setStatsError(null);
    setActivitiesError(null);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    if (userId) {
      loadProfile();
      loadStats();
      loadActivities();
    }
  }, [userId, loadProfile, loadStats, loadActivities]);

  return {
    // Estado
    profile,
    stats,
    activities,
    
    // Estados de carregamento
    isLoadingProfile,
    isLoadingStats,
    isLoadingActivities,
    isUpdating,
    
    // Funções
    updateProfile,
    refreshProfile,
    refreshStats,
    refreshActivities,
    
    // Estados de erro
    profileError,
    statsError,
    activitiesError,
    
    // Limpar erros
    clearErrors
  };
};
