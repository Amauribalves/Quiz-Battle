import { supabase } from '../App';
import { User, Challenge, Mission } from '../types';

export interface SupabaseChallenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  requirement_type: string;
  requirement_value: number;
  requirement_category?: string;
  reward_type: string;
  reward_value: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  is_completed: boolean;
  is_claimed: boolean;
  completed_at?: string;
  claimed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChallengeStats {
  id: string;
  user_id: string;
  total_challenges_completed: number;
  total_rewards_claimed: number;
  total_reward_value: number;
  current_daily_streak: number;
  current_weekly_streak: number;
  best_daily_streak: number;
  best_weekly_streak: number;
  last_challenge_completed?: string;
  created_at: string;
  updated_at: string;
}

class SupabaseChallengeService {
  /**
   * Buscar todos os desafios ativos
   */
  async getActiveChallenges(): Promise<SupabaseChallenge[]> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('type', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar desafios:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar desafios:', error);
      return [];
    }
  }

  /**
   * Buscar desafios por tipo
   */
  async getChallengesByType(type: 'daily' | 'weekly'): Promise<SupabaseChallenge[]> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error(`Erro ao buscar desafios ${type}:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar desafios ${type}:`, error);
      return [];
    }
  }

  /**
   * Buscar progresso do usuário em um desafio específico
   */
  async getUserChallengeProgress(userId: string, challengeId: string): Promise<UserChallengeProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao buscar progresso:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      return null;
    }
  }

  /**
   * Buscar progresso de todos os desafios de um usuário
   */
  async getUserAllChallengeProgress(userId: string): Promise<UserChallengeProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar progresso do usuário:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar progresso do usuário:', error);
      return [];
    }
  }

  /**
   * Criar ou atualizar progresso do usuário em um desafio
   */
  async upsertUserChallengeProgress(
    userId: string,
    challengeId: string,
    progress: number,
    isCompleted: boolean = false
  ): Promise<boolean> {
    try {
      const existingProgress = await this.getUserChallengeProgress(userId, challengeId);
      
      if (existingProgress) {
        // Atualizar progresso existente
        const { error } = await supabase
          .from('user_challenge_progress')
          .update({
            progress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);

        if (error) {
          console.error('Erro ao atualizar progresso:', error);
          return false;
        }
      } else {
        // Criar novo progresso
        const { error } = await supabase
          .from('user_challenge_progress')
          .insert({
            user_id: userId,
            challenge_id: challengeId,
            progress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          });

        if (error) {
          console.error('Erro ao criar progresso:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      return false;
    }
  }

  /**
   * Marcar recompensa como reclamada
   */
  async claimReward(userId: string, challengeId: string): Promise<{ success: boolean; reward?: number; message: string }> {
    try {
      // Verificar se o desafio foi completado
      const progress = await this.getUserChallengeProgress(userId, challengeId);
      if (!progress || !progress.is_completed || progress.is_claimed) {
        return {
          success: false,
          message: progress?.is_claimed ? 'Recompensa já foi reclamada' : 'Desafio ainda não foi completado'
        };
      }

      // Buscar informações do desafio
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('reward_type, reward_value')
        .eq('id', challengeId)
        .single();

      if (challengeError || !challengeData) {
        return { success: false, message: 'Desafio não encontrado' };
      }

      // Marcar como reclamada
      const { error: updateError } = await supabase
        .from('user_challenge_progress')
        .update({
          is_claimed: true,
          claimed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', progress.id);

      if (updateError) {
        return { success: false, message: 'Erro ao marcar recompensa como reclamada' };
      }

      // Registrar no histórico de recompensas
      const { error: historyError } = await supabase
        .from('challenge_rewards_history')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          reward_type: challengeData.reward_type,
          reward_value: challengeData.reward_value,
          user_challenge_progress_id: progress.id
        });

      if (historyError) {
        console.error('Erro ao registrar histórico de recompensa:', historyError);
      }

      // Atualizar estatísticas do usuário
      await this.updateUserChallengeStats(userId);

      return {
        success: true,
        reward: challengeData.reward_value,
        message: `Recompensa de R$ ${challengeData.reward_value.toFixed(2)} reclamada com sucesso!`
      };
    } catch (error) {
      console.error('Erro ao reclamar recompensa:', error);
      return { success: false, message: 'Erro interno ao reclamar recompensa' };
    }
  }

  /**
   * Buscar estatísticas de desafios do usuário
   */
  async getUserChallengeStats(userId: string): Promise<ChallengeStats | null> {
    try {
      const { data, error } = await supabase
        .from('challenge_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return null;
    }
  }

  /**
   * Atualizar estatísticas do usuário
   */
  async updateUserChallengeStats(userId: string): Promise<boolean> {
    try {
      // Buscar progresso atual do usuário
      const progress = await this.getUserAllChallengeProgress(userId);
      
      // Calcular estatísticas
      const totalCompleted = progress.filter(p => p.is_completed).length;
      const totalClaimed = progress.filter(p => p.is_claimed).length;
      
      // Buscar valor total das recompensas reclamadas
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('challenge_rewards_history')
        .select('reward_value')
        .eq('user_id', userId);

      if (rewardsError) {
        console.error('Erro ao buscar recompensas:', rewardsError);
        return false;
      }

      const totalRewardValue = rewardsData?.reduce((sum, reward) => sum + reward.reward_value, 0) || 0;

      // Atualizar estatísticas
      const { error } = await supabase
        .from('challenge_stats')
        .upsert({
          user_id: userId,
          total_challenges_completed: totalCompleted,
          total_rewards_claimed: totalClaimed,
          total_reward_value: totalRewardValue,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erro ao atualizar estatísticas:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      return false;
    }
  }

  /**
   * Atualizar progresso baseado no resultado de um jogo
   */
  async updateProgressFromGame(
    userId: string,
    gameResult: {
      won: boolean;
      category?: string;
      questionsAnswered: number;
      correctAnswers: number;
    }
  ): Promise<void> {
    try {
      // Buscar desafios ativos
      const activeChallenges = await this.getActiveChallenges();
      
      for (const challenge of activeChallenges) {
        let newProgress = 0;
        let shouldUpdate = false;

        // Calcular progresso baseado no tipo de requisito
        switch (challenge.requirement_type) {
          case 'wins':
            if (gameResult.won) {
              const currentProgress = await this.getUserChallengeProgress(userId, challenge.id);
              newProgress = (currentProgress?.progress || 0) + 1;
              shouldUpdate = true;
            }
            break;

          case 'category_wins':
            if (gameResult.won && challenge.requirement_category === gameResult.category) {
              const currentProgress = await this.getUserChallengeProgress(userId, challenge.id);
              newProgress = (currentProgress?.progress || 0) + 1;
              shouldUpdate = true;
            }
            break;

          case 'correct_answers':
            const currentProgress = await this.getUserChallengeProgress(userId, challenge.id);
            newProgress = (currentProgress?.progress || 0) + gameResult.correctAnswers;
            shouldUpdate = true;
            break;

          case 'games_played':
            const currentProgressGames = await this.getUserChallengeProgress(userId, challenge.id);
            newProgress = (currentProgressGames?.progress || 0) + 1;
            shouldUpdate = true;
            break;
        }

        if (shouldUpdate) {
          const isCompleted = newProgress >= challenge.requirement_value;
          await this.upsertUserChallengeProgress(userId, challenge.id, newProgress, isCompleted);
        }
      }

      // Atualizar estatísticas
      await this.updateUserChallengeStats(userId);
    } catch (error) {
      console.error('Erro ao atualizar progresso do jogo:', error);
    }
  }

  /**
   * Buscar progresso geral dos desafios do usuário
   */
  async getUserOverallProgress(userId: string): Promise<number> {
    try {
      const progress = await this.getUserAllChallengeProgress(userId);
      const activeChallenges = await this.getActiveChallenges();
      
      if (activeChallenges.length === 0) return 0;
      
      const completedChallenges = progress.filter(p => p.is_completed).length;
      return Math.round((completedChallenges / activeChallenges.length) * 100);
    } catch (error) {
      console.error('Erro ao calcular progresso geral:', error);
      return 0;
    }
  }

  /**
   * Log de atividade do desafio
   */
  async logChallengeActivity(
    userId: string,
    challengeId: string,
    action: string,
    details?: any
  ): Promise<void> {
    try {
      await supabase
        .from('challenge_activity_logs')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          action,
          details
        });
    } catch (error) {
      console.error('Erro ao registrar log de atividade:', error);
    }
  }
}

export const supabaseChallengeService = new SupabaseChallengeService();
export default supabaseChallengeService;
