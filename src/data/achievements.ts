import { Achievement } from '../types';

export const availableAchievements: Achievement[] = [
  {
    id: 'first_win',
    title: '🏆 Primeira Vitória',
    description: 'Ganhe seu primeiro quiz',
    unlocked: false
  },
  {
    id: 'streak_5',
    title: '🔥 Sequência de 5',
    description: 'Vença 5 jogos consecutivos',
    unlocked: false
  },
  {
    id: 'big_better',
    title: '💰 Grande Apostador',
    description: 'Faça uma aposta de R$ 100 ou mais',
    unlocked: false
  },
  {
    id: 'current_master',
    title: '📰 Antenado',
    description: 'Acerte 10 perguntas de Atualizados',
    unlocked: false
  },
  {
    id: 'math_genius',
    title: '🧮 Gênio da Matemática',
    description: 'Acerte 10 perguntas de Matemática',
    unlocked: false
  },
  {
    id: 'english_speaker',
    title: '🗣️ Poliglota',
    description: 'Acerte 10 perguntas de Inglês',
    unlocked: false
  },
  {
    id: 'culture_expert',
    title: '🌍 Conhecedor Mundial',
    description: 'Acerte 10 perguntas de Países/Cultura',
    unlocked: false
  },
  {
    id: 'sports_fan',
    title: '⚽ Fanático por Esportes',
    description: 'Acerte 10 perguntas de Esporte',
    unlocked: false
  },
  {
    id: 'general_master',
    title: '🎯 Conhecimento Geral',
    description: 'Acerte 10 perguntas Gerais',
    unlocked: false
  },
  {
    id: 'quiz_master',
    title: '👑 Mestre Quiz',
    description: 'Alcance 100 vitórias',
    unlocked: false
  },
  {
    id: 'millionaire',
    title: '💎 Milionário',
    description: 'Acumule R$ 1.000 de saldo',
    unlocked: false
  }
];

export const checkAchievements = (user: any, gameStats: any): Achievement[] => {
  const newAchievements: Achievement[] = [];
  
  availableAchievements.forEach(achievement => {
    if (user.achievements.some((a: Achievement) => a.id === achievement.id)) return;
    
    let unlocked = false;
    
    switch (achievement.id) {
      case 'first_win':
        unlocked = user.wins >= 1;
        break;
      case 'streak_5':
        unlocked = gameStats.currentStreak >= 5;
        break;
      case 'big_better':
        unlocked = gameStats.maxBet >= 100;
        break;
      case 'current_master':
        unlocked = gameStats.categoryCorrect?.current >= 10;
        break;
      case 'math_genius':
        unlocked = gameStats.categoryCorrect?.math >= 10;
        break;
      case 'english_speaker':
        unlocked = gameStats.categoryCorrect?.english >= 10;
        break;
      case 'culture_expert':
        unlocked = gameStats.categoryCorrect?.culture >= 10;
        break;
      case 'sports_fan':
        unlocked = gameStats.categoryCorrect?.sports >= 10;
        break;
      case 'general_master':
        unlocked = gameStats.categoryCorrect?.general >= 10;
        break;
      case 'quiz_master':
        unlocked = user.wins >= 100;
        break;
      case 'millionaire':
        unlocked = user.balance >= 1000;
        break;
    }
    
    if (unlocked) {
      newAchievements.push({
        ...achievement,
        unlocked: true,
        date: new Date().toLocaleDateString('pt-BR')
      });
    }
  });
  
  return newAchievements;
};