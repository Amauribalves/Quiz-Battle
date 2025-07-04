export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  wins: number;
  losses: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  date?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Bet {
  amount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  multiplier: number;
  matchId: string;
}

export interface GameState {
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  score: number;
  isGameActive: boolean;
  bet: Bet | null;
  gameMode: 'solo' | 'multiplayer';
  room?: GameRoom;
  opponent?: Player;
  isInTiebreaker?: boolean;
  tiebreakerRound?: number;
}

// Interfaces para multiplayer
export interface Player {
  id: string;
  username: string;
  score: number;
  isReady: boolean;
  currentAnswer?: number;
  timeToAnswer?: number;
  hasAnswered?: boolean;
}

export interface GameRoom {
  id: string;
  players: Player[];
  bet: Bet;
  status: 'waiting' | 'starting' | 'active' | 'tiebreaker' | 'finished';
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  winner?: Player;
  createdAt: number;
  isInTiebreaker: boolean;
  tiebreakerRound: number;
  questions: Question[];
}

export interface MatchmakingRequest {
  userId: string;
  username: string;
  bet: Bet;
  timestamp: number;
}

export type Screen = 
  | 'login' 
  | 'register' 
  | 'home' 
  | 'game-mode-select'
  | 'bet' 
  | 'solo-practice'
  | 'matchmaking'
  | 'game' 
  | 'deposit' 
  | 'withdraw' 
  | 'achievements'
  | 'api-config'
  | 'admin';

// Interfaces existentes para APIs
export interface APIMetric {
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: number;
  success: boolean;
  errorMessage?: string;
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
}

export interface APIValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface APIStats {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  lastRequest: number | null;
}

export interface CacheStats {
  size: number;
  keys: string[];
}