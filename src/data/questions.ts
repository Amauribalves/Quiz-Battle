import { Question } from '../types';

export const questionsDatabase: Question[] = [
  // Atualizados/Gerais
  {
    id: 'current1',
    text: 'Qual é a rede social que foi comprada por Elon Musk em 2022?',
    options: ['Facebook', 'Instagram', 'Twitter', 'TikTok'],
    correctAnswer: 2,
    category: 'current',
    difficulty: 'easy'
  },
  {
    id: 'current2',
    text: 'Qual país sediou a Copa do Mundo de 2022?',
    options: ['Rússia', 'Brasil', 'Catar', 'França'],
    correctAnswer: 2,
    category: 'current',
    difficulty: 'medium'
  },
  {
    id: 'current3',
    text: 'Qual é o nome da inteligência artificial desenvolvida pela OpenAI que se tornou popular em 2023?',
    options: ['GPT-4', 'ChatGPT', 'DALL-E', 'Codex'],
    correctAnswer: 1,
    category: 'current',
    difficulty: 'hard'
  },
  
  // Matemática
  {
    id: 'math1',
    text: 'Quanto é 15 + 27?',
    options: ['40', '42', '44', '46'],
    correctAnswer: 1,
    category: 'math',
    difficulty: 'easy'
  },
  {
    id: 'math2',
    text: 'Qual é o resultado de 8 × 9?',
    options: ['72', '81', '64', '56'],
    correctAnswer: 0,
    category: 'math',
    difficulty: 'medium'
  },
  {
    id: 'math3',
    text: 'Qual é a raiz quadrada de 144?',
    options: ['11', '12', '13', '14'],
    correctAnswer: 1,
    category: 'math',
    difficulty: 'hard'
  },
  
  // Inglês
  {
    id: 'english1',
    text: 'Como se diz "obrigado" em inglês?',
    options: ['Please', 'Thank you', 'Sorry', 'Excuse me'],
    correctAnswer: 1,
    category: 'english',
    difficulty: 'easy'
  },
  {
    id: 'english2',
    text: 'Qual é o passado do verbo "go" em inglês?',
    options: ['Goed', 'Gone', 'Went', 'Going'],
    correctAnswer: 2,
    category: 'english',
    difficulty: 'medium'
  },
  {
    id: 'english3',
    text: 'Qual é o significado de "although" em português?',
    options: ['Portanto', 'Embora', 'Porque', 'Então'],
    correctAnswer: 1,
    category: 'english',
    difficulty: 'hard'
  },
  
  // Países/Cultura
  {
    id: 'culture1',
    text: 'Qual é a capital da França?',
    options: ['Londres', 'Berlim', 'Paris', 'Roma'],
    correctAnswer: 2,
    category: 'culture',
    difficulty: 'easy'
  },
  {
    id: 'culture2',
    text: 'Qual país é famoso pela Torre de Pisa?',
    options: ['França', 'Espanha', 'Itália', 'Grécia'],
    correctAnswer: 2,
    category: 'culture',
    difficulty: 'medium'
  },
  {
    id: 'culture3',
    text: 'Qual é a moeda oficial do Japão?',
    options: ['Won', 'Yuan', 'Yen', 'Dong'],
    correctAnswer: 2,
    category: 'culture',
    difficulty: 'hard'
  },
  
  // Esporte
  {
    id: 'sport1',
    text: 'Quantos jogadores tem um time de futebol em campo?',
    options: ['10', '11', '12', '13'],
    correctAnswer: 1,
    category: 'sports',
    difficulty: 'easy'
  },
  {
    id: 'sport2',
    text: 'Em que ano o Brasil ganhou sua primeira Copa do Mundo?',
    options: ['1950', '1958', '1962', '1970'],
    correctAnswer: 1,
    category: 'sports',
    difficulty: 'medium'
  },
  {
    id: 'sport3',
    text: 'Qual atleta brasileiro é conhecido como "Rei do Futebol"?',
    options: ['Ronaldinho', 'Pelé', 'Ronaldo', 'Kaká'],
    correctAnswer: 1,
    category: 'sports',
    difficulty: 'hard'
  },
  
  // Geral
  {
    id: 'general1',
    text: 'Quantos continentes existem?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    category: 'general',
    difficulty: 'easy'
  },
  {
    id: 'general2',
    text: 'Qual é o maior planeta do sistema solar?',
    options: ['Terra', 'Marte', 'Júpiter', 'Saturno'],
    correctAnswer: 2,
    category: 'general',
    difficulty: 'medium'
  },
  {
    id: 'general3',
    text: 'Quem pintou a obra "Mona Lisa"?',
    options: ['Van Gogh', 'Picasso', 'Leonardo da Vinci', 'Michelangelo'],
    correctAnswer: 2,
    category: 'general',
    difficulty: 'hard'
  },

  // Mais perguntas para cada categoria
  {
    id: 'current4',
    text: 'Qual aplicativo de vídeos curtos se tornou muito popular nos últimos anos?',
    options: ['Instagram', 'YouTube', 'TikTok', 'Snapchat'],
    correctAnswer: 2,
    category: 'current',
    difficulty: 'easy'
  },
  {
    id: 'math4',
    text: 'Quanto é 100 ÷ 4?',
    options: ['20', '25', '30', '35'],
    correctAnswer: 1,
    category: 'math',
    difficulty: 'easy'
  },
  {
    id: 'english4',
    text: 'Como se diz "casa" em inglês?',
    options: ['Home', 'House', 'Both are correct', 'Building'],
    correctAnswer: 2,
    category: 'english',
    difficulty: 'easy'
  },
  {
    id: 'culture4',
    text: 'Qual é o maior país do mundo?',
    options: ['China', 'Estados Unidos', 'Canadá', 'Rússia'],
    correctAnswer: 3,
    category: 'culture',
    difficulty: 'easy'
  },
  {
    id: 'sport4',
    text: 'Quantos pontos vale uma cesta de 3 pontos no basquete?',
    options: ['2', '3', '4', '5'],
    correctAnswer: 1,
    category: 'sports',
    difficulty: 'easy'
  },
  {
    id: 'general4',
    text: 'Qual é o animal terrestre mais rápido do mundo?',
    options: ['Leão', 'Guepardo', 'Cavalo', 'Antílope'],
    correctAnswer: 1,
    category: 'general',
    difficulty: 'easy'
  }
];

export const getQuestionsByCategory = (category: string, difficulty: string, count: number = 5): Question[] => {
  const filtered = questionsDatabase.filter(q => q.category === category && q.difficulty === difficulty);
  return filtered.sort(() => Math.random() - 0.5).slice(0, count);
};

export const getDifficultyMultiplier = (difficulty: string): number => {
  switch (difficulty) {
    case 'easy': return 1.5;
    case 'medium': return 2.0;
    case 'hard': return 3.0;
    default: return 1.5;
  }
};