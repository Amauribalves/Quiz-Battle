import React, { useState, useEffect } from 'react';
import { ScreenContainer } from './components/ScreenContainer';
import { Notification } from './components/Notification';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { HomeScreen } from './screens/HomeScreen';
import { GameModeSelectScreen } from './screens/GameModeSelectScreen';
import { BetScreen } from './screens/BetScreen';
import { SoloPracticeScreen } from './screens/SoloPracticeScreen';
import { MatchmakingScreen } from './screens/MatchmakingScreen';
import { GameScreen } from './screens/GameScreen';
import MultiplayerGameScreen from './screens/MultiplayerGameScreen';
import { DepositScreen } from './screens/DepositScreen';
import { WithdrawScreen } from './screens/WithdrawScreen';
import { AchievementsScreen } from './screens/AchievementsScreen';
import { APIConfigScreen } from './screens/APIConfigScreen';
import { User, Screen, GameState, Bet, Achievement, GameRoom, MatchmakingRequest } from './types';
import enhancedQuestionService from './services/enhancedQuestionService';
import multiplayerService from './services/multiplayerService';
import { availableAchievements, checkAchievements } from './data/achievements';
import { createClient } from '@supabase/supabase-js';
import AdminScreen from './screens/AdminScreen';

const supabaseUrl = 'https://wgklhpkuurzfesnnpdhj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indna2xocGt1dXJ6ZmVzbm5wZGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAxOTMsImV4cCI6MjA2NjI4NjE5M30.EOOa8euGb1M2XV__N7jJ3jEEV53BF-ibtfcFpKFmFbg';
export const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: null,
    questionIndex: 0,
    totalQuestions: 10,
    timeLeft: 30,
    score: 0,
    isGameActive: false,
    bet: null,
    gameMode: 'solo',
    isInTiebreaker: false,
    tiebreakerRound: 0
  });
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const [gameStats, setGameStats] = useState({
    currentStreak: 0,
    maxBet: 0,
    categoryCorrect: {
      current: 0,
      math: 0,
      english: 0,
      culture: 0,
      sports: 0,
      general: 0
    }
  });
  const [questions, setQuestions] = useState<any[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'achievement';
    message: string;
    isVisible: boolean;
  }>({
    type: 'success',
    message: '',
    isVisible: false
  });

  const showNotification = (type: 'success' | 'error' | 'achievement', message: string) => {
    setNotification({ type, message, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  // Conectar ao serviço multiplayer quando o usuário faz login
  useEffect(() => {
    if (user) {
      multiplayerService.connect().then(() => {
        console.log('Conectado ao serviço multiplayer');
      }).catch(error => {
        console.error('Erro ao conectar ao multiplayer:', error);
      });
    } else {
      multiplayerService.disconnect();
    }
  }, [user]);

  // Recuperar usuário salvo no localStorage ao iniciar o app
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showNotification('error', 'Erro ao fazer login: ' + error.message);
        return;
      }
      const userAuth = data.user;
      if (!userAuth) {
        showNotification('error', 'Usuário não encontrado.');
        return;
      }
      // Buscar dados do usuário na tabela 'users' pelo id do Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userAuth.id)
        .single();
      if (userError || !userData) {
        showNotification('error', 'Usuário não encontrado no banco.');
        return;
      }
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentScreen('home');
      showNotification('success', 'Login realizado com sucesso!');
    } catch (err: any) {
      showNotification('error', 'Erro inesperado ao fazer login.');
    }
  };

  const register = (username: string, email: string, password: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      balance: 50, // Dar saldo inicial para teste
      wins: 0,
      losses: 0,
      achievements: []
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setCurrentScreen('home');
    showNotification('success', 'Conta criada com sucesso! Você ganhou R$ 50,00 de bônus!');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentScreen('login');
    setGameState({
      currentQuestion: null,
      questionIndex: 0,
      totalQuestions: 10,
      timeLeft: 30,
      score: 0,
      isGameActive: false,
      bet: null,
      gameMode: 'solo',
      isInTiebreaker: false,
      tiebreakerRound: 0
    });
    showNotification('success', 'Logout realizado com sucesso!');
  };

  const deposit = (amount: number) => {
    if (user) {
      setUser({ ...user, balance: user.balance + amount });
      setCurrentScreen('home');
      showNotification('success', `Depósito de R$ ${amount.toFixed(2)} realizado com sucesso!`);
    }
  };

  const withdraw = async (withdrawData: {
    amount: number;
    method: 'pix' | 'bank';
    pixKey?: string;
    pixKeyType?: 'cpf' | 'email' | 'telefone' | 'aleatoria';
    bankAccount?: string;
    bankAgency?: string;
    bankName?: string;
  }) => {
    if (!user || user.balance < withdrawData.amount) return;
    const { amount, method, pixKey, pixKeyType, bankAccount, bankAgency, bankName } = withdrawData;
    const { data, error } = await supabase.from('withdraws').insert([
      {
        user_id: user.id,
        amount,
        method,
        pix_key: pixKey || null,
        pix_key_type: pixKeyType || null,
        bank_account: bankAccount || null,
        bank_agency: bankAgency || null,
        bank_name: bankName || null,
        status: 'pendente',
        requested_at: new Date().toISOString()
      }
    ]);
    if (error) {
      showNotification('error', 'Erro ao registrar saque. Tente novamente.');
      return;
    }
    setUser({ ...user, balance: user.balance - amount });
    setCurrentScreen('home');
    showNotification('success', `Saque de R$ ${(amount * 0.85).toFixed(2)} solicitado com sucesso! Aguarde a aprovação.`);
  };

  // Iniciar jogo multiplayer
  const startMultiplayerGame = async (bet: Bet) => {
    if (!user || user.balance < bet.amount) {
      showNotification('error', 'Saldo insuficiente para esta aposta!');
      return;
    }

    console.log('Iniciando jogo multiplayer com aposta:', bet);
    setCurrentBet(bet);
    setUser({ ...user, balance: user.balance - bet.amount });
    setGameStats(prev => ({ ...prev, maxBet: Math.max(prev.maxBet, bet.amount) }));
    setCurrentScreen('matchmaking');
  };

  // Quando encontrar oponente
  const onGameFound = async (room: GameRoom) => {
    try {
      console.log('Jogo encontrado, sala:', room);
      
      if (!room.currentQuestion) {
        showNotification('error', 'Erro ao carregar perguntas. Tente novamente.');
        setCurrentScreen('bet');
        return;
      }

      setGameState({
        currentQuestion: room.currentQuestion,
        questionIndex: 0,
        totalQuestions: room.totalQuestions,
        timeLeft: 30,
        score: 0,
        isGameActive: true,
        bet: currentBet,
        gameMode: 'multiplayer',
        room,
        opponent: room.players.find(p => p.id !== user?.id),
        isInTiebreaker: room.isInTiebreaker,
        tiebreakerRound: room.tiebreakerRound
      });
      
      setCurrentScreen('game');
      showNotification('success', 'Oponente encontrado! Boa sorte!');
    } catch (error) {
      console.error('Erro ao iniciar jogo:', error);
      showNotification('error', 'Erro ao iniciar jogo. Tente novamente.');
      setCurrentScreen('bet');
    }
  };

  // Iniciar jogo solo (treino)
  const startSoloGame = async (category: string) => {
    try {
      const savedConfig = localStorage.getItem('quiz-api-config');
      const config = savedConfig ? JSON.parse(savedConfig) : { selectedSource: 'local' };
      const difficulties = ['easy', 'medium', 'hard'];
      const questions: any[] = [];
      for (let i = 0; i < 5; i++) {
        const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        const qs = await enhancedQuestionService.getQuestions(
          category,
          randomDifficulty,
          1,
          'trivia'
        );
        if (qs.length > 0) questions.push(qs[0]);
      }
      if (questions.length === 0) {
        showNotification('error', 'Não foi possível carregar as perguntas. Tente novamente.');
        return;
      }
      setQuestions(questions);
      setGameState({
        currentQuestion: questions[0],
        questionIndex: 0,
        totalQuestions: questions.length,
        timeLeft: 30,
        score: 0,
        isGameActive: true,
        bet: null,
        gameMode: 'solo',
        isInTiebreaker: false,
        tiebreakerRound: 0
      });
      setCurrentScreen('game');
      showNotification('success', 'Modo treino iniciado!');
    } catch (error) {
      showNotification('error', 'Erro ao carregar perguntas. Tente novamente.');
    }
  };

  const answerQuestion = async (answerIndex: number) => {
    if (!gameState.currentQuestion) return;

    const isCorrect = answerIndex === gameState.currentQuestion.correctAnswer;
    const newScore = isCorrect ? gameState.score + 1 : gameState.score;
    
    if (isCorrect && gameState.gameMode === 'multiplayer') {
      const category = gameState.currentQuestion.category as keyof typeof gameStats.categoryCorrect;
      setGameStats(prev => ({
        ...prev,
        categoryCorrect: {
          ...prev.categoryCorrect,
          [category]: prev.categoryCorrect[category] + 1
        }
      }));
    }

    // Para modo solo, usar as perguntas locais
    if (gameState.gameMode === 'solo') {
      const nextIndex = gameState.questionIndex + 1;
      const nextQuestion = nextIndex < questions.length ? questions[nextIndex] : null;

      setGameState({
        ...gameState,
        currentQuestion: nextQuestion,
        questionIndex: nextIndex,
        score: newScore,
        isGameActive: nextQuestion !== null
      });
    } else {
      // Para multiplayer, enviar resposta e atualizar com dados da sala
      if (gameState.room && user) {
        try {
          await multiplayerService.submitAnswer(gameState.room.id, user.id, answerIndex);
          
          // Aguardar um pouco para o processamento
          setTimeout(() => {
            const updatedRoom = multiplayerService.getRoom(gameState.room!.id);
            if (updatedRoom) {
              const currentPlayer = updatedRoom.players.find(p => p.id === user.id);
              
              setGameState(prevState => ({
                ...prevState,
                currentQuestion: updatedRoom.currentQuestion,
                questionIndex: updatedRoom.questionIndex,
                score: currentPlayer?.score || newScore,
                isGameActive: updatedRoom.status === 'active' || updatedRoom.status === 'tiebreaker',
                room: updatedRoom,
                isInTiebreaker: updatedRoom.isInTiebreaker,
                tiebreakerRound: updatedRoom.tiebreakerRound
              }));
            }
          }, 1000);
        } catch (error) {
          console.error('Erro ao enviar resposta:', error);
        }
      }
    }
  };

  const endGame = (won: boolean, finalScore: number) => {
    if (!user) return;

    // Solo mode não afeta saldo nem estatísticas
    if (gameState.gameMode === 'solo') {
      setGameState({
        currentQuestion: null,
        questionIndex: 0,
        totalQuestions: 5,
        timeLeft: 30,
        score: 0,
        isGameActive: false,
        bet: null,
        gameMode: 'solo',
        isInTiebreaker: false,
        tiebreakerRound: 0
      });
      showNotification('success', `Treino concluído! Você acertou ${finalScore} de ${gameState.totalQuestions} perguntas.`);
      return;
    }

    // Multiplayer mode
    let newBalance = user.balance;
    let newWins = user.wins;
    let newLosses = user.losses;

    if (won && gameState.bet) {
      // Ganha o dobro da aposta (sua aposta + aposta do oponente)
      newBalance += gameState.bet.amount * 2;
      newWins += 1;
      setGameStats(prev => ({ ...prev, currentStreak: prev.currentStreak + 1 }));
      showNotification('success', `Parabéns! Você ganhou R$ ${(gameState.bet!.amount * 2).toFixed(2)}!`);
    } else {
      newLosses += 1;
      setGameStats(prev => ({ ...prev, currentStreak: 0 }));
      showNotification('error', 'Que pena! Você perdeu desta vez.');
    }

    const updatedUser = { ...user, balance: newBalance, wins: newWins, losses: newLosses };
    
    // Check for new achievements
    const newAchievements = checkAchievements(updatedUser, gameStats);
    if (newAchievements.length > 0) {
      updatedUser.achievements = [...updatedUser.achievements, ...newAchievements];
      setTimeout(() => {
        newAchievements.forEach(achievement => {
          showNotification('achievement', `Nova conquista desbloqueada: ${achievement.title}!`);
        });
      }, 1000);
    }

    setUser(updatedUser);
    setGameState({
      currentQuestion: null,
      questionIndex: 0,
      totalQuestions: 10,
      timeLeft: 30,
      score: 0,
      isGameActive: false,
      bet: null,
      gameMode: 'solo',
      isInTiebreaker: false,
      tiebreakerRound: 0
    });
  };

  const renderScreen = () => {
    console.log('Renderizando tela:', currentScreen);
    
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onNavigate={setCurrentScreen}
            onLogin={login}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onNavigate={setCurrentScreen}
          />
        );
      case 'home':
        return user ? (
          <HomeScreen
            user={user}
            onNavigate={setCurrentScreen}
            onLogout={logout}
          />
        ) : null;
      case 'game-mode-select':
        return (
          <GameModeSelectScreen
            onNavigate={setCurrentScreen}
          />
        );
      case 'bet':
        return user ? (
          <BetScreen
            user={user}
            onNavigate={setCurrentScreen}
            onStartGame={startMultiplayerGame}
          />
        ) : null;
      case 'solo-practice':
        return (
          <SoloPracticeScreen
            onNavigate={setCurrentScreen}
            onStartSoloGame={startSoloGame}
          />
        );
      case 'matchmaking':
        return user && currentBet ? (
          <MatchmakingScreen
            user={user}
            bet={currentBet}
            onNavigate={setCurrentScreen}
            onGameFound={onGameFound}
            onCancelMatchmaking={() => {
              multiplayerService.cancelMatchmaking(user.id);
              setCurrentScreen('bet');
            }}
          />
        ) : null;
      case 'game':
        console.log('Renderizando jogo, gameState:', gameState);
        return gameState.gameMode === 'multiplayer' ? (
          <MultiplayerGameScreen
            gameState={gameState}
            onAnswerQuestion={answerQuestion}
            onGameEnd={endGame}
            onNavigate={setCurrentScreen}
          />
        ) : (
          <GameScreen
            gameState={gameState}
            onAnswerQuestion={answerQuestion}
            onGameEnd={endGame}
            onNavigate={setCurrentScreen}
          />
        );
      case 'deposit':
        return (
          <DepositScreen
            onNavigate={setCurrentScreen}
            onDeposit={deposit}
          />
        );
      case 'withdraw':
        return user ? (
          <WithdrawScreen
            user={user}
            onNavigate={setCurrentScreen}
            onWithdraw={withdraw}
          />
        ) : null;
      case 'achievements':
        return (
          <AchievementsScreen
            achievements={user?.achievements || availableAchievements}
            onNavigate={setCurrentScreen}
          />
        );
      case 'api-config':
        return (
          <APIConfigScreen
            onNavigate={setCurrentScreen}
          />
        );
      case 'admin':
        return <AdminScreen />;
      default:
        return null;
    }
  };

  return (
    <>
      {currentScreen === 'game' ? (
        renderScreen()
      ) : (
        <ScreenContainer>
          {renderScreen()}
        </ScreenContainer>
      )}
      
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </>
  );
}

export default App;