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
import { DesafioXScreen } from './screens/DesafioXScreen';
import { User, Screen, GameState, Bet, Achievement, GameRoom, MatchmakingRequest } from './types';
import enhancedQuestionService from './services/enhancedQuestionService';
import multiplayerService from './services/multiplayerService';
import { availableAchievements, checkAchievements } from './data/achievements';
import { createClient } from '@supabase/supabase-js';
import AdminScreen from './screens/AdminScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { FriendsScreen } from './screens/FriendsScreen';
import { HistoricoScreen } from './screens/HistoricoScreen';
import { BottomNavBar } from './components/BottomNavBar';
import challengeService from './services/challengeService';

const supabaseUrl = 'https://wgklhpkuurzfesnnpdhj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indna2xocGt1dXJ6ZmVzbm5wZGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTAxOTMsImV4cCI6MjA2NjI4NjE5M30.EOOa8euGb1M2XV__N7jJ3jEEV53BF-ibtfcFpKFmFbg';
export const supabase = createClient(supabaseUrl, supabaseKey);

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false); // Flag para controlar cadastro
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: null,
    questionIndex: 0,
    totalQuestions: 10,
    timeLeft: 10, // 10 segundos por questão
    score: 0,
    isGameActive: false,
    bet: null,
    gameMode: 'solo',
    isInTiebreaker: false,
    tiebreakerRound: 0,
    questionTimeLimit: 10, // 10 segundos por questão
    maxQuestions: 10, // Máximo de 10 questões
    tiebreakerQuestions: 5 // 5 questões para desempate
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
  const [userCount, setUserCount] = useState(0);

  const showNotification = (type: 'success' | 'error' | 'achievement', message: string) => {
    setNotification({ type, message, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  // Função para atualizar progresso dos desafios após um jogo
  const updateChallengeProgress = (gameResult: {
    won: boolean;
    category?: string;
    questionsAnswered: number;
    correctAnswers: number;
  }) => {
    if (user) {
      challengeService.updateProgress(user, gameResult);
    }
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

  // Buscar número de usuários cadastrados
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        if (!error && count !== null) {
          setUserCount(count);
        }
      } catch (err) {
        console.error('Erro ao buscar contagem de usuários:', err);
      }
    };

    fetchUserCount();
  }, []);

  // Lidar com retorno do OAuth (Google) - COMENTADO TEMPORARIAMENTE
  // useEffect(() => {
  //   const handleAuthChange = async () => {
  //     const { data: { session } } = await supabase.auth.getSession();
      
  //     if (session?.user) {
  //       // Verificar se o usuário já existe na tabela users
  //       const { data: userData, error: userError } = await supabase
  //         .from('users')
  //         .select('*')
  //         .eq('id', session.user.id)
  //         .single();
        
  //       if (userError || !userData) {
  //         // Verificar se está entre os primeiros 100 usuários
  //         const { hasBonus, userCount } = await checkAndGetBonus(session.user.id);
  //         const initialBalance = hasBonus ? 5 : 0;
          
  //         // Criar novo usuário se não existir
  //         const { data: newUser, error: createError } = await supabase
  //           .from('users')
  //           .insert({ 
  //             id: session.user.id, 
  //             username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
  //             email: session.user.email || '',
  //             balance: initialBalance, 
  //             wins: 0, 
  //             losses: 0, 
  //             achievements: [] 
  //           })
  //           .select()
  //           .single();
          
  //         if (createError || !newUser) {
  //           showNotification('error', 'Erro ao criar perfil do usuário.');
  //           return;
  //         }
          
  //         setUser(newUser);
  //         localStorage.setItem('user', JSON.stringify(newUser));
  //         setCurrentScreen('home');
          
  //         if (hasBonus) {
  //           showNotification('success', `Login com Google realizado com sucesso! Você foi o ${userCount + 1}º usuário e ganhou R$ 5,00 de bônus!`);
  //         } else {
  //           showNotification('success', 'Login com Google realizado com sucesso! Os primeiros 100 usuários já receberam o bônus.');
  //         }
  //       } else {
  //         // Usuário já existe
  //         setUser(userData);
  //         localStorage.setItem('user', JSON.stringify(userData));
  //         setCurrentScreen('home');
  //         showNotification('success', 'Login com Google realizado com sucesso!');
  //       }
  //     }
  //   };

  //   // Só executar handleAuthChange se não estiver cadastrando
  //   if (!isRegistering) {
  //     handleAuthChange();
  //   }

  //   // Escutar mudanças na autenticação
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
  //     // Só processar se for SIGNED_IN e não estiver cadastrando
  //     if (event === 'SIGNED_IN' && session?.user && !isRegistering) {
  //       await handleAuthChange();
  //     }
  //   });

  //   return () => subscription.unsubscribe();
  // }, [isRegistering]);

  const login = async (email: string, password: string) => {
    try {
      console.log('Tentando login com:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('Resultado do signInWithPassword:', data, error);
      if (error) {
        showNotification('error', 'Erro ao fazer login: ' + error.message);
        return;
      }
      const userAuth = data.user;
      console.log('Usuário autenticado:', userAuth);
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
      console.log('Resultado do select na tabela users:', userData, userError);
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

  // Função para verificar se o usuário está entre os primeiros 100
  const checkAndGetBonus = async (userId: string): Promise<{ hasBonus: boolean; userCount: number }> => {
    try {
      // Contar quantos usuários já existem
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Erro ao contar usuários:', error);
        return { hasBonus: false, userCount: 0 };
      }
      
      const userCount = count || 0;
      const hasBonus = userCount < 100;
      
      return { hasBonus, userCount };
    } catch (err) {
      console.error('Erro ao verificar bônus:', err);
      return { hasBonus: false, userCount: 0 };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        showNotification('error', 'Erro ao fazer login com Google: ' + error.message);
        return;
      }
      
      showNotification('success', 'Redirecionando para o Google...');
    } catch (err: any) {
      showNotification('error', 'Erro inesperado ao fazer login com Google.');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setIsRegistering(true); // Marcar que está cadastrando
      console.log('=== INICIANDO CADASTRO ===');
      console.log('Antes do signUp');
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      console.log('Depois do signUp', authData, authError);
      
      if (authError || !authData.user) {
        console.log('Erro ao criar conta:', authError);
        showNotification('error', 'Erro ao criar conta: ' + (authError?.message || ''));
        setIsRegistering(false);
        return;
      }

      console.log('Aguardando 1 segundo...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Antes do getUser');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Depois do getUser', user);
      
      if (!user) {
        console.log('Usuário não autenticado após cadastro');
        showNotification('error', 'Usuário não autenticado após cadastro.');
        setIsRegistering(false);
        return;
      }

      console.log('Verificando bônus...');
      const { hasBonus, userCount } = await checkAndGetBonus(user.id);
      const initialBalance = hasBonus ? 5 : 0;
      console.log('Bônus:', hasBonus, 'UserCount:', userCount, 'Balance:', initialBalance);

      console.log('Antes do insert na tabela users');
      const insertPromise = supabase
        .from('users')
        .insert({
          id: user.id,
          username,
          email,
          balance: initialBalance,
          wins: 0,
          losses: 0,
          achievements: [],
          idade: 0, // pode ajustar para null ou outro valor se necessário
          avatar: 0 // pode ajustar para null ou outro valor se necessário
        })
        .select();

      const timeoutPromise = timeout(5000).then(() => ({ data: null, error: { message: 'Timeout no insert!' } }));

      const { data: userDataArray, error: userError } = await Promise.race([insertPromise, timeoutPromise]);
      console.log('Depois do insert', userDataArray, userError);

      const userData = userDataArray && userDataArray[0];

      if (userError || !userData) {
        console.log('Erro ao criar perfil:', userError);
        showNotification('error', 'Erro ao criar perfil: ' + (userError?.message || ''));
        setIsRegistering(false);
        return;
      }

      console.log('Usuário criado com sucesso:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentScreen('home');
      setIsRegistering(false); // Marcar que terminou o cadastro

      if (hasBonus) {
        showNotification('success', `Conta criada com sucesso! Você foi o ${userCount + 1}º usuário e ganhou R$ 5,00 de bônus!`);
      } else {
        showNotification('success', 'Conta criada com sucesso! Os primeiros 100 usuários já receberam o bônus.');
      }
    } catch (err: any) {
      console.log('Erro inesperado:', err);
      showNotification('error', 'Erro inesperado ao criar conta.');
      setIsRegistering(false);
    }
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

  // Função utilitária para buscar perguntas já respondidas
  async function buscarPerguntasRespondidas(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('questions_history')
      .select('question_id')
      .eq('user_id', userId);
    if (error) {
      console.error('Erro ao buscar histórico de perguntas:', error);
      return [];
    }
    return data ? data.map((row: any) => row.question_id) : [];
  }

  // Função utilitária para salvar histórico
  async function salvarHistoricoPerguntas(userId: string, questions: { id: string }[]) {
    const registros = questions.map(q => ({
      user_id: userId,
      question_id: q.id,
      answered_at: new Date().toISOString()
    }));
    await supabase.from('questions_history').insert(registros);
  }

  // Iniciar jogo solo (treino)
  const startSoloGame = async (category: string) => {
    try {
      if (!user) return;
      const savedConfig = localStorage.getItem('quiz-api-config');
      const config = savedConfig ? JSON.parse(savedConfig) : { selectedSource: 'local' };
      const difficulties = ['easy', 'medium', 'hard'];
      const respondidas = await buscarPerguntasRespondidas(user.id);
      const questions: any[] = [];
      let tentativas = 0;
      while (questions.length < 5 && tentativas < 20) {
        const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        const qs = await enhancedQuestionService.getQuestions(
          category,
          randomDifficulty,
          1,
          'trivia'
        );
        if (qs.length > 0 && !respondidas.includes(qs[0].id) && !questions.find(q => q.id === qs[0].id)) {
          questions.push(qs[0]);
        }
        tentativas++;
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
        timeLeft: 10,
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

  const endGame = async (won: boolean, finalScore: number) => {
    if (!user) return;
    if (gameState.gameMode === 'solo') {
      await salvarHistoricoPerguntas(user.id, questions);
      
      // Atualizar progresso dos desafios X para modo solo
      const gameResult = {
        won: finalScore > gameState.totalQuestions / 2, // Considera vitória se acertar mais da metade
        category: gameState.currentQuestion?.category || 'general',
        questionsAnswered: gameState.totalQuestions,
        correctAnswers: finalScore
      };
      updateChallengeProgress(gameResult);
      
      setGameState({
        currentQuestion: null,
        questionIndex: 0,
        totalQuestions: 5,
        timeLeft: 10,
        score: 0,
        isGameActive: false,
        bet: null,
        gameMode: 'solo',
        isInTiebreaker: false,
        tiebreakerRound: 0
      });
      showNotification('success', `Treino concluído! Você acertou ${finalScore} de ${gameState.totalQuestions} perguntas.`);
      setCurrentScreen('home');
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

    // Atualiza wins, losses e balance no Supabase
    await supabase
      .from('users')
      .update({ wins: newWins, losses: newLosses, balance: newBalance })
      .eq('id', user.id);
    // Salvar histórico do jogo
    await supabase.from('historico_jogos').insert({
      user_id: user.id,
      data: new Date().toISOString(),
      resultado: won ? 'vitória' : 'derrota',
      pontuacao: finalScore,
      modo: gameState.gameMode,
      adversario: gameState.opponent?.username || null,
      aposta: gameState.bet?.amount || null
    });
    
    // Atualizar progresso dos desafios X
    const gameResult = {
      won,
      category: gameState.currentQuestion?.category || 'general',
      questionsAnswered: gameState.totalQuestions,
      correctAnswers: finalScore
    };
    updateChallengeProgress(gameResult);
    
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
            onGoogleLogin={loginWithGoogle}
            userCount={userCount}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onNavigate={setCurrentScreen}
            onRegister={register}
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
      case 'profile':
        return user ? (
          <ProfileScreen
            user={user}
            onNavigate={setCurrentScreen}
            setUser={setUser}
          />
        ) : null;
      case 'friends':
        return user ? (
          <FriendsScreen
            user={user}
            onNavigate={setCurrentScreen}
          />
        ) : null;
      case 'history':
        return user ? (
          <HistoricoScreen
            user={user}
            onNavigate={setCurrentScreen}
          />
        ) : null;
              case 'desafio-x':
          return user ? (
            <DesafioXScreen
              user={user}
              onNavigate={setCurrentScreen}
            />
          ) : null;
        case 'admin':
          return <AdminScreen />;
      default:
        return null;
    }
  };

  const showNavBar = !['login', 'register'].includes(currentScreen);
  return (
    <>
      {currentScreen === 'game' ? (
        renderScreen()
      ) : (
        <ScreenContainer>
          {renderScreen()}
        </ScreenContainer>
      )}
      {showNavBar && (
        <BottomNavBar onNavigate={setCurrentScreen} currentScreen={currentScreen} />
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