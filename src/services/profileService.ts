import { supabase } from '../App';
import { User } from '../types';

export interface ProfileUpdateData {
  username?: string;
  idade?: number | null;
  sexo?: string | null;
  endereco?: string | null;
  avatar?: number;
  bio?: string | null;
  telefone?: string | null;
  data_nascimento?: string | null;
  pais?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  preferencias?: {
    notificacoes?: boolean;
    privacidade?: 'public' | 'friends' | 'private';
    tema?: 'light' | 'dark' | 'auto';
    idioma?: 'pt-BR' | 'en-US' | 'es-ES';
  } | null;
}

export interface ProfileStats {
  totalGames: number;
  winRate: number;
  averageScore: number;
  bestScore: number;
  totalPlayTime: number;
  favoriteCategory: string;
  achievementsCount: number;
  challengesCompleted: number;
  totalEarnings: number;
  totalWithdrawals: number;
  memberSince: string;
  lastActive: string;
}

export interface ProfileActivity {
  id: string;
  type: 'game' | 'bet' | 'withdrawal' | 'deposit' | 'achievement' | 'challenge';
  description: string;
  amount?: number;
  timestamp: string;
  metadata?: any;
}

class ProfileService {
  /**
   * Buscar perfil completo do usuário
   */
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          achievements:user_achievements(achievement_id, unlocked_at),
          profile_stats:user_profile_stats(*),
          category_performance:user_category_performance(*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(userId: string, profileData: ProfileUpdateData): Promise<{
    success: boolean;
    message: string;
    updatedUser?: User;
  }> {
    try {
      // Validar dados antes de enviar
      const validationResult = this.validateProfileData(profileData);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.error
        };
      }

      // Preparar dados para atualização
      const updateData: any = {};
      
      if (profileData.username !== undefined) updateData.username = profileData.username;
      if (profileData.idade !== undefined) updateData.idade = profileData.idade;
      if (profileData.sexo !== undefined) updateData.sexo = profileData.sexo;
      if (profileData.endereco !== undefined) updateData.endereco = profileData.endereco;
      if (profileData.avatar !== undefined) updateData.avatar = profileData.avatar;
      if (profileData.bio !== undefined) updateData.bio = profileData.bio;
      if (profileData.telefone !== undefined) updateData.telefone = profileData.telefone;
      if (profileData.data_nascimento !== undefined) updateData.data_nascimento = profileData.data_nascimento;
      if (profileData.pais !== undefined) updateData.pais = profileData.pais;
      if (profileData.cidade !== undefined) updateData.cidade = profileData.cidade;
      if (profileData.estado !== undefined) updateData.estado = profileData.estado;
      if (profileData.cep !== undefined) updateData.cep = profileData.cep;
      if (profileData.preferencias !== undefined) updateData.preferencias = profileData.preferencias;

      // Adicionar timestamp de atualização
      updateData.updated_at = new Date().toISOString();

      // Atualizar perfil principal
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        return {
          success: false,
          message: 'Erro ao atualizar perfil: ' + updateError.message
        };
      }

      // Atualizar estatísticas do perfil
      await this.updateProfileStats(userId);

      // Log da atividade
      await this.logProfileActivity(userId, 'profile_update', 'Perfil atualizado', updateData);

      return {
        success: true,
        message: 'Perfil atualizado com sucesso!',
        updatedUser
      };

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return {
        success: false,
        message: 'Erro inesperado ao atualizar perfil'
      };
    }
  }

  /**
   * Buscar estatísticas do perfil
   */
  async getProfileStats(userId: string): Promise<ProfileStats | null> {
    try {
      // Buscar estatísticas básicas
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('wins, losses, balance, created_at')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError);
        return null;
      }

      // Buscar estatísticas de jogos
      const { data: gameStats, error: gameError } = await supabase
        .from('user_question_stats')
        .select('score, time_taken_seconds, category')
        .eq('user_id', userId);

      if (gameError) {
        console.error('Erro ao buscar estatísticas de jogos:', gameError);
        return null;
      }

      // Buscar estatísticas de apostas
      const { data: betStats, error: betError } = await supabase
        .from('bets')
        .select('amount, status, potential_winnings')
        .eq('user_id', userId);

      if (betError) {
        console.error('Erro ao buscar estatísticas de apostas:', betError);
        return null;
      }

      // Buscar estatísticas de saques
      const { data: withdrawalStats, error: withdrawalError } = await supabase
        .from('withdraws')
        .select('amount, status')
        .eq('user_id', userId);

      if (withdrawalError) {
        console.error('Erro ao buscar estatísticas de saques:', withdrawalError);
        return null;
      }

      // Calcular estatísticas
      const totalGames = (userData.wins || 0) + (userData.losses || 0);
      const winRate = totalGames > 0 ? ((userData.wins || 0) / totalGames) * 100 : 0;
      
      const scores = gameStats?.map(g => g.score || 0) || [];
      const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
      
      const totalPlayTime = gameStats?.reduce((total, game) => total + (game.time_taken_seconds || 0), 0) || 0;
      
      // Categoria favorita
      const categoryCounts: { [key: string]: number } = {};
      gameStats?.forEach(game => {
        if (game.category) {
          categoryCounts[game.category] = (categoryCounts[game.category] || 0) + 1;
        }
      });
      const favoriteCategory = Object.keys(categoryCounts).length > 0 
        ? Object.entries(categoryCounts).sort(([,a], [,b]) => b - a)[0][0]
        : 'Nenhuma';

      // Total de ganhos e saques
      const totalEarnings = betStats?.reduce((total, bet) => {
        if (bet.status === 'won') return total + (bet.potential_winnings || 0);
        return total;
      }, 0) || 0;

      const totalWithdrawals = withdrawalStats?.reduce((total, withdrawal) => {
        if (withdrawal.status === 'completed') return total + (withdrawal.amount || 0);
        return total;
      }, 0) || 0;

      return {
        totalGames,
        winRate: Math.round(winRate * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100,
        bestScore,
        totalPlayTime,
        favoriteCategory,
        achievementsCount: 0, // TODO: Implementar quando tivermos achievements
        challengesCompleted: 0, // TODO: Implementar quando tivermos challenges
        totalEarnings,
        totalWithdrawals,
        memberSince: userData.created_at || new Date().toISOString(),
        lastActive: new Date().toISOString()
      };

    } catch (error) {
      console.error('Erro ao buscar estatísticas do perfil:', error);
      return null;
    }
  }

  /**
   * Buscar atividades recentes do usuário
   */
  async getRecentActivity(userId: string, limit: number = 10): Promise<ProfileActivity[]> {
    try {
      const activities: ProfileActivity[] = [];

      // Buscar jogos recentes
      const { data: recentGames, error: gamesError } = await supabase
        .from('user_question_stats')
        .select('id, score, category, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!gamesError && recentGames) {
        recentGames.forEach(game => {
          activities.push({
            id: game.id,
            type: 'game',
            description: `Jogou ${game.category} - Pontuação: ${game.score}`,
            amount: game.score,
            timestamp: game.created_at,
            metadata: { category: game.category }
          });
        });
      }

      // Buscar apostas recentes
      const { data: recentBets, error: betsError } = await supabase
        .from('bets')
        .select('id, amount, status, category, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!betsError && recentBets) {
        recentBets.forEach(bet => {
          activities.push({
            id: bet.id,
            type: 'bet',
            description: `Aposta em ${bet.category} - R$ ${bet.amount}`,
            amount: bet.amount,
            timestamp: bet.created_at,
            metadata: { category: bet.category, status: bet.status }
          });
        });
      }

      // Ordenar por timestamp e retornar os mais recentes
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      return [];
    }
  }

  /**
   * Validar dados do perfil
   */
  private validateProfileData(data: ProfileUpdateData): { isValid: boolean; error?: string } {
    // Validar username
    if (data.username !== undefined) {
      if (data.username.length < 3) {
        return { isValid: false, error: 'Nome de usuário deve ter pelo menos 3 caracteres' };
      }
      if (data.username.length > 30) {
        return { isValid: false, error: 'Nome de usuário deve ter no máximo 30 caracteres' };
      }
      if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        return { isValid: false, error: 'Nome de usuário só pode conter letras, números e underscore' };
      }
    }

    // Validar idade
    if (data.idade !== undefined && data.idade !== null) {
      if (data.idade < 13 || data.idade > 120) {
        return { isValid: false, error: 'Idade deve estar entre 13 e 120 anos' };
      }
    }

    // Validar telefone
    if (data.telefone !== undefined && data.telefone !== null) {
      if (data.telefone.length > 20) {
        return { isValid: false, error: 'Telefone deve ter no máximo 20 caracteres' };
      }
    }

    // Validar CEP
    if (data.cep !== undefined && data.cep !== null) {
      if (data.cep.length > 10) {
        return { isValid: false, error: 'CEP deve ter no máximo 10 caracteres' };
      }
    }

    return { isValid: true };
  }

  /**
   * Atualizar estatísticas do perfil
   */
  private async updateProfileStats(userId: string): Promise<void> {
    try {
      const stats = await this.getProfileStats(userId);
      if (stats) {
        await supabase
          .from('user_profile_stats')
          .upsert({
            user_id: userId,
            total_games: stats.totalGames,
            win_rate: stats.winRate,
            average_score: stats.averageScore,
            best_score: stats.bestScore,
            total_play_time: stats.totalPlayTime,
            favorite_category: stats.favoriteCategory,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
      }
    } catch (error) {
      console.error('Erro ao atualizar estatísticas do perfil:', error);
    }
  }

  /**
   * Log de atividade do perfil
   */
  private async logProfileActivity(userId: string, type: string, description: string, metadata?: any): Promise<void> {
    try {
      await supabase
        .from('profile_activity_logs')
        .insert({
          user_id: userId,
          activity_type: type,
          description,
          metadata,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erro ao logar atividade do perfil:', error);
    }
  }

  /**
   * Buscar usuários similares (para sugestões de amigos)
   */
  async findSimilarUsers(userId: string, limit: number = 5): Promise<User[]> {
    try {
      // Buscar usuários com categorias favoritas similares
      const { data: userCategories, error: categoriesError } = await supabase
        .from('user_category_performance')
        .select('category')
        .eq('user_id', userId)
        .order('correct_answers', { ascending: false })
        .limit(3);

      if (categoriesError || !userCategories || userCategories.length === 0) {
        return [];
      }

      const favoriteCategories = userCategories.map(c => c.category);

      // Buscar usuários que também jogam essas categorias
      const { data: similarUsers, error: usersError } = await supabase
        .from('user_category_performance')
        .select(`
          user_id,
          category,
          correct_answers,
          users!inner(username, avatar, wins, losses)
        `)
        .in('category', favoriteCategories)
        .neq('user_id', userId)
        .order('correct_answers', { ascending: false })
        .limit(limit);

      if (usersError || !similarUsers) {
        return [];
      }

      // Processar e retornar usuários similares
      const processedUsers = similarUsers.map(su => ({
        id: su.user_id,
        username: su.users.username,
        avatar: su.users.avatar,
        wins: su.users.wins,
        losses: su.users.losses,
        email: '', // Não expor email por segurança
        balance: 0, // Não expor saldo por segurança
        achievements: []
      }));

      return processedUsers;

    } catch (error) {
      console.error('Erro ao buscar usuários similares:', error);
      return [];
    }
  }
}

export default new ProfileService();
