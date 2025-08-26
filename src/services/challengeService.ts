import { Challenge, Mission, User } from '../types';

export interface ChallengeProgress {
  challengeId: string;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  lastUpdated: string;
}

export interface MissionProgress {
  missionId: string;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  lastUpdated: string;
}

class ChallengeService {
  private challenges: Challenge[] = [];
  private missions: Mission[] = [];
  private userProgress: Map<string, ChallengeProgress | MissionProgress> = new Map();

  constructor() {
    this.initializeChallenges();
    this.initializeMissions();
  }

  private initializeChallenges() {
    this.challenges = [
      {
        id: 'daily-wins-1',
        title: 'Vencedor do Dia',
        description: 'Vence 5 partidas hoje',
        type: 'daily',
        requirement: { type: 'wins', value: 5 },
        reward: { type: 'money', value: 1 },
        progress: 0,
        isCompleted: false,
        isClaimed: false,
        expiresAt: this.getDailyExpiry(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'daily-streak-1',
        title: 'Sequência Vitoriosa',
        description: 'Mantenha uma sequência de 3 vitórias',
        type: 'daily',
        requirement: { type: 'streak', value: 3 },
        reward: { type: 'money', value: 2 },
        progress: 0,
        isCompleted: false,
        isClaimed: false,
        expiresAt: this.getDailyExpiry(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'daily-math-1',
        title: 'Mestre da Matemática',
        description: 'Acerte 20 questões de matemática',
        type: 'daily',
        requirement: { type: 'category_wins', value: 20, category: 'math' },
        reward: { type: 'money', value: 3 },
        progress: 0,
        isCompleted: false,
        isClaimed: false,
        expiresAt: this.getDailyExpiry(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'daily-culture-1',
        title: 'Culto e Sabido',
        description: 'Acerte 15 questões de cultura geral',
        type: 'daily',
        requirement: { type: 'category_wins', value: 15, category: 'culture' },
        reward: { type: 'money', value: 2.5 },
        progress: 0,
        isCompleted: false,
        isClaimed: false,
        expiresAt: this.getDailyExpiry(),
        createdAt: new Date().toISOString()
      }
    ];
  }

  private initializeMissions() {
    this.missions = [
      {
        id: 'weekly-wins-1',
        title: 'Guerreiro Semanal',
        description: 'Vence 25 partidas esta semana',
        type: 'weekly',
        requirement: { type: 'wins', value: 25 },
        reward: { type: 'money', value: 10 },
        progress: 0,
        isCompleted: false,
        isClaimed: false,
        expiresAt: this.getWeeklyExpiry(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'weekly-culture-1',
        title: 'Especialista em Cultura',
        description: 'Acerte 50 questões de cultura geral',
        type: 'weekly',
        requirement: { type: 'category_wins', value: 50, category: 'culture' },
        reward: { type: 'money', value: 15 },
        progress: 0,
        isCompleted: false,
        isClaimed: false,
        expiresAt: this.getWeeklyExpiry(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'weekly-math-1',
        title: 'Matemático Profissional',
        description: 'Acerte 60 questões de matemática',
        type: 'weekly',
        requirement: { type: 'category_wins', value: 60, category: 'math' },
        reward: { type: 'money', value: 20 },
        progress: 0,
        isCompleted: false,
        isClaimed: false,
        expiresAt: this.getWeeklyExpiry(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'weekly-streak-1',
        title: 'Mestre da Sequência',
        description: 'Mantenha uma sequência de 10 vitórias',
        type: 'weekly',
        requirement: { type: 'streak', value: 10 },
        reward: { type: 'money', value: 25 },
        progress: 0,
        isCompleted: false,
        isClaimed: false,
        expiresAt: this.getWeeklyExpiry(),
        createdAt: new Date().toISOString()
      }
    ];
  }

  private getDailyExpiry(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }

  private getWeeklyExpiry(): string {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(0, 0, 0, 0);
    return nextWeek.toISOString();
  }

  public getDailyChallenges(): Challenge[] {
    return this.challenges.filter(c => c.type === 'daily');
  }

  public getWeeklyMissions(): Mission[] {
    return this.missions.filter(m => m.type === 'weekly');
  }

  public updateProgress(user: User, gameResult: {
    won: boolean;
    category?: string;
    questionsAnswered: number;
    correctAnswers: number;
  }): void {
    // Atualizar progresso dos desafios diários
    this.challenges.forEach(challenge => {
      if (challenge.isCompleted || challenge.isClaimed) return;

      let progress = this.getProgressForChallenge(challenge, user, gameResult);
      
      if (progress >= challenge.requirement.value) {
        challenge.isCompleted = true;
      }
      
      challenge.progress = progress;
    });

    // Atualizar progresso das missões semanais
    this.missions.forEach(mission => {
      if (mission.isCompleted || mission.isClaimed) return;

      let progress = this.getProgressForMission(mission, user, gameResult);
      
      if (progress >= mission.requirement.value) {
        mission.isCompleted = true;
      }
      
      mission.progress = progress;
    });
  }

  private getProgressForChallenge(challenge: Challenge, user: User, gameResult: any): number {
    switch (challenge.requirement.type) {
      case 'wins':
        return Math.min(user.wins, challenge.requirement.value);
      case 'streak':
        // Simular sequência atual (em um app real, isso viria do estado do jogo)
        return Math.min(Math.floor(Math.random() * 5), challenge.requirement.value);
      case 'category_wins':
        if (challenge.requirement.category === gameResult.category && gameResult.won) {
          // Em um app real, você rastrearia vitórias por categoria
          return Math.min(Math.floor(Math.random() * 25), challenge.requirement.value);
        }
        return Math.min(Math.floor(Math.random() * 25), challenge.requirement.value);
      default:
        return 0;
    }
  }

  private getProgressForMission(mission: Mission, user: User, gameResult: any): number {
    switch (mission.requirement.type) {
      case 'wins':
        return Math.min(user.wins, mission.requirement.value);
      case 'streak':
        return Math.min(Math.floor(Math.random() * 15), mission.requirement.value);
      case 'category_wins':
        if (mission.requirement.category === gameResult.category && gameResult.won) {
          return Math.min(Math.floor(Math.random() * 60), mission.requirement.value);
        }
        return Math.min(Math.floor(Math.random() * 60), mission.requirement.value);
      default:
        return 0;
    }
  }

  public claimReward(challengeId: string): { success: boolean; reward?: number; message: string } {
    const challenge = this.challenges.find(c => c.id === challengeId);
    const mission = this.missions.find(m => m.id === challengeId);

    const item = challenge || mission;
    if (!item) {
      return { success: false, message: 'Desafio não encontrado' };
    }

    if (!item.isCompleted) {
      return { success: false, message: 'Desafio ainda não foi completado' };
    }

    if (item.isClaimed) {
      return { success: false, message: 'Recompensa já foi reclamada' };
    }

    // Marcar como reclamada
    item.isClaimed = true;

    return {
      success: true,
      reward: item.reward.value,
      message: `Recompensa de R$ ${item.reward.value.toFixed(2)} reclamada com sucesso!`
    };
  }

  public getOverallProgress(): number {
    const totalChallenges = this.challenges.length + this.missions.length;
    const completedChallenges = this.challenges.filter(c => c.isCompleted).length;
    const completedMissions = this.missions.filter(m => m.isCompleted).length;
    
    return Math.round(((completedChallenges + completedMissions) / totalChallenges) * 100);
  }

  public resetDailyChallenges(): void {
    this.challenges.forEach(challenge => {
      if (challenge.type === 'daily') {
        challenge.progress = 0;
        challenge.isCompleted = false;
        challenge.isClaimed = false;
        challenge.expiresAt = this.getDailyExpiry();
        challenge.createdAt = new Date().toISOString();
      }
    });
  }

  public resetWeeklyMissions(): void {
    this.missions.forEach(mission => {
      if (mission.type === 'weekly') {
        mission.progress = 0;
        mission.isCompleted = false;
        mission.isClaimed = false;
        mission.expiresAt = this.getWeeklyExpiry();
        mission.createdAt = new Date().toISOString();
      }
    });
  }
}

export const challengeService = new ChallengeService();
export default challengeService;
