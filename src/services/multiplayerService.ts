import { GameRoom, Player, Bet, Question, MatchmakingRequest } from '../types';
import enhancedQuestionService from './enhancedQuestionService';
import { supabase } from '../App';

class MultiplayerService {
  private matchmakingQueue: MatchmakingRequest[] = [];
  private activeRooms: Map<string, GameRoom> = new Map();
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  private matchmakingCallbacks: Map<string, (room: GameRoom) => void> = new Map();

  // Simular conexão WebSocket
  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      this.connectionStatus = 'connecting';
      
      setTimeout(() => {
        this.connectionStatus = 'connected';
        console.log('Conectado ao servidor multiplayer');
        resolve(true);
      }, 1000);
    });
  }

  disconnect(): void {
    this.connectionStatus = 'disconnected';
    this.matchmakingQueue = [];
    this.activeRooms.clear();
    this.matchmakingCallbacks.clear();
  }

  // Adicionar jogador à fila de matchmaking
  async joinMatchmaking(request: MatchmakingRequest, onGameFound: (room: GameRoom) => void): Promise<void> {
    if (this.connectionStatus !== 'connected') {
      throw new Error('Não conectado ao servidor');
    }

    console.log('Adicionando à fila de matchmaking:', request);

    // Salvar callback
    this.matchmakingCallbacks.set(request.userId, onGameFound);

    // Procurar por jogador compatível na fila
    const compatiblePlayerIndex = this.matchmakingQueue.findIndex(
      req => 
        req.bet.amount === request.bet.amount &&
        req.bet.difficulty === request.bet.difficulty &&
        req.bet.category === request.bet.category &&
        req.userId !== request.userId
    );

    if (compatiblePlayerIndex !== -1) {
      // Encontrou oponente, criar sala
      const opponent = this.matchmakingQueue[compatiblePlayerIndex];
      this.matchmakingQueue.splice(compatiblePlayerIndex, 1);

      console.log('Oponente encontrado, criando sala');
      const room = await this.createGameRoom([request, opponent]);
      this.activeRooms.set(room.id, room);
      
      // Notificar ambos os jogadores
      const opponentCallback = this.matchmakingCallbacks.get(opponent.userId);
      if (opponentCallback) {
        setTimeout(() => opponentCallback(room), 100);
        this.matchmakingCallbacks.delete(opponent.userId);
      }
      
      setTimeout(() => onGameFound(room), 100);
      this.matchmakingCallbacks.delete(request.userId);
    } else {
      // Adicionar à fila
      this.matchmakingQueue.push(request);
      console.log('Adicionado à fila, aguardando oponente');
      
      // Simular encontrar oponente após um tempo (para demonstração)
      setTimeout(async () => {
        // Verificar se ainda está na fila
        const stillInQueue = this.matchmakingQueue.find(req => req.userId === request.userId);
        if (!stillInQueue) return;

        console.log('Criando oponente bot');
        const mockOpponent: MatchmakingRequest = {
          userId: `bot_${Date.now()}`,
          username: this.generateBotName(),
          bet: request.bet,
          timestamp: Date.now()
        };

        try {
          const room = await this.createGameRoom([request, mockOpponent]);
          this.activeRooms.set(room.id, room);
          
          // Remover da fila
          const queueIndex = this.matchmakingQueue.findIndex(req => req.userId === request.userId);
          if (queueIndex !== -1) {
            this.matchmakingQueue.splice(queueIndex, 1);
          }
          
          const callback = this.matchmakingCallbacks.get(request.userId);
          if (callback) {
            console.log('Chamando callback com sala criada');
            callback(room);
            this.matchmakingCallbacks.delete(request.userId);
          }
        } catch (error) {
          console.error('Erro ao criar sala:', error);
          this.matchmakingCallbacks.delete(request.userId);
        }
      }, Math.random() * 10000 + 3000); // 3-13 segundos
    }
  }

  // Gerar nome de bot
  private generateBotName(): string {
    const prefixes = ['Mestre', 'Pro', 'Expert', 'Ninja', 'Ace', 'Elite', 'Super', 'Mega'];
    const suffixes = ['Quiz', 'Brain', 'Mind', 'Genius', 'Master', 'Player', 'Gamer', 'Star'];
    const numbers = Math.floor(Math.random() * 999) + 1;
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix}${suffix}${numbers}`;
  }

  // Cancelar matchmaking
  cancelMatchmaking(userId: string): void {
    const index = this.matchmakingQueue.findIndex(req => req.userId === userId);
    if (index !== -1) {
      this.matchmakingQueue.splice(index, 1);
    }
    this.matchmakingCallbacks.delete(userId);
  }

  // Função utilitária para buscar perguntas já respondidas
  async buscarPerguntasRespondidas(userId: string): Promise<string[]> {
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
  async salvarHistoricoPerguntas(userId: string, questions: { id: string }[]) {
    const registros = questions.map(q => ({
      user_id: userId,
      question_id: q.id,
      answered_at: new Date().toISOString()
    }));
    await supabase.from('questions_history').insert(registros);
  }

  // Criar sala de jogo com perguntas pré-carregadas
  private async createGameRoom(requests: MatchmakingRequest[]): Promise<GameRoom> {
    console.log('Criando sala de jogo para:', requests);
    
    const players: Player[] = requests.map(req => ({
      id: req.userId,
      username: req.username,
      score: 0,
      isReady: true,
      hasAnswered: false
    }));

          // Carregar 10 perguntas iniciais
      const savedConfig = localStorage.getItem('quiz-api-config');
      const config = savedConfig ? JSON.parse(savedConfig) : { selectedSource: 'auto' };

    // Buscar perguntas já respondidas pelos dois jogadores
    const respondidas1 = await this.buscarPerguntasRespondidas(players[0]?.id);
    const respondidas2 = await this.buscarPerguntasRespondidas(players[1]?.id);
    const respondidas = Array.from(new Set([...respondidas1, ...respondidas2]));

    let questions: Question[] = [];
    try {
      console.log('Carregando perguntas para a sala');
      let tentativas = 0;
      while (questions.length < 10 && tentativas < 30) {
        const qs = await enhancedQuestionService.getQuestions(
          requests[0].bet.category,
          requests[0].bet.difficulty,
          1,
          config.selectedSource
        );
        if (qs.length > 0 && !respondidas.includes(qs[0].id) && !questions.find(q => q.id === qs[0].id)) {
          questions.push(qs[0]);
        }
        tentativas++;
      }
      console.log('Perguntas carregadas:', questions.length);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      // Fallback para perguntas locais
      const { getQuestionsByCategory } = await import('../data/questions');
      questions = getQuestionsByCategory(requests[0].bet.category, requests[0].bet.difficulty, 10);
      console.log('Usando perguntas locais:', questions.length);
    }

    if (questions.length === 0) {
      throw new Error('Não foi possível carregar perguntas para o jogo');
    }

    const room: GameRoom = {
      id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      players,
      bet: requests[0].bet,
      status: 'active',
      currentQuestion: questions[0] || null,
      questionIndex: 0,
      totalQuestions: 10, // 10 questões principais
      timeLeft: 10, // 10 segundos por questão
      createdAt: Date.now(),
      isInTiebreaker: false,
      tiebreakerRound: 0,
      questions,
      questionTimeLimit: 10, // 10 segundos por questão
      maxQuestions: 10, // Máximo de 10 questões principais
      tiebreakerQuestions: 5, // 5 questões para desempate
      roundStartTime: Date.now()
    };

    // Inserir partida na tabela matches do Supabase
    let matchId: string | null = null;
    try {
      const { data, error } = await supabase.from('matches').insert([
        {
          player1_id: players[0]?.id,
          player2_id: players[1]?.id,
          bet_amount: requests[0].bet.amount,
          category: requests[0].bet.category,
          status: 'em andamento',
          created_at: new Date().toISOString()
        }
      ]).select('id');
      if (error) {
        console.error('Erro ao inserir partida na tabela matches:', error);
      } else if (data && data[0] && data[0].id) {
        matchId = data[0].id;
      }
    } catch (e) {
      console.error('Erro ao inserir partida na tabela matches:', e);
    }

    // Inserir apostas na tabela bets para cada jogador
    if (matchId) {
      try {
        await supabase.from('bets').insert([
          {
            match_id: matchId,
            user_id: players[0]?.id,
            amount: requests[0].bet.amount
          },
          {
            match_id: matchId,
            user_id: players[1]?.id,
            amount: requests[0].bet.amount
          }
        ]);
      } catch (e) {
        console.error('Erro ao inserir apostas na tabela bets:', e);
      }
    }

    console.log('Sala criada:', room);
    return room;
  }

  // Enviar resposta do jogador
  async submitAnswer(roomId: string, playerId: string, answerIndex: number): Promise<void> {
    const room = this.activeRooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (!player || player.hasAnswered) return;

    player.currentAnswer = answerIndex;
    player.hasAnswered = true;

    // Verificar se a resposta está correta
    if (room.currentQuestion && answerIndex === room.currentQuestion.correctAnswer) {
      player.score += 1;
    }

    // Simular resposta do bot se necessário
    const botPlayer = room.players.find(p => p.id.startsWith('bot_') && !p.hasAnswered);
    if (botPlayer) {
      setTimeout(() => {
        this.simulateBotAnswerInternal(roomId, botPlayer.id);
      }, Math.random() * 3000 + 1000); // 1-4 segundos
    }

    // Verificar se todos responderam
    const allAnswered = room.players.every(p => p.hasAnswered);
    
    if (allAnswered) {
      setTimeout(() => {
        this.processNextQuestion(room);
      }, 2000); // Aguardar 2 segundos antes da próxima pergunta
    }
  }

  // Processar próxima pergunta ou fim do jogo
  private async processNextQuestion(room: GameRoom): Promise<void> {
    // Reset das respostas
    room.players.forEach(player => {
      player.currentAnswer = undefined;
      player.hasAnswered = false;
    });

    room.questionIndex += 1;

    // Verificar se acabaram as perguntas da rodada atual
    if (room.questionIndex >= room.questions.length) {
      await this.checkGameEnd(room);
    } else {
      // Próxima pergunta
      room.currentQuestion = room.questions[room.questionIndex];
      room.timeLeft = room.questionTimeLimit; // Usar o tempo limite configurado (10s)
      room.roundStartTime = Date.now(); // Registrar início da questão
    }
  }

  // Verificar fim do jogo ou necessidade de desempate
  private async checkGameEnd(room: GameRoom): Promise<void> {
    const [player1, player2] = room.players;
    
    if (player1.score === player2.score) {
      if (room.isInTiebreaker && room.tiebreakerRound >= 3) {
        // Máximo de 3 rodadas de desempate (15 questões adicionais)
        console.log('🏁 Máximo de rodadas de desempate atingido - Jogo empatado');
        room.status = 'finished';
        // Em caso de empate máximo, dividir o prêmio
        room.winner = null;
        
        // Atualizar a tabela matches no Supabase
        if (room.bet && room.bet.matchId) {
          try {
            await supabase.from('matches')
              .update({
                status: 'empatada',
                finished_at: new Date().toISOString()
              })
              .eq('id', room.bet.matchId);
          } catch (e) {
            console.error('Erro ao atualizar partida na tabela matches:', e);
          }
        }
      } else {
        // Empate - iniciar desempate
        console.log(`🤝 Empate detectado! Iniciando desempate...`);
        await this.startTiebreaker(room);
        return; // Não finalizar o jogo ainda
      }
    }
    
    // Há um vencedor ou empate máximo
    if (room.status !== 'finished') {
      room.status = 'finished';
      room.winner = player1.score > player2.score ? player1 : player2;
      
      console.log(`🏆 Vencedor: ${room.winner.username} com ${room.winner.score} pontos!`);
      
      // Atualizar a tabela matches no Supabase
      if (room.bet && room.bet.matchId && room.winner) {
        try {
          await supabase.from('matches')
            .update({
              winner_id: room.winner.id,
              status: 'finalizada',
              finished_at: new Date().toISOString()
            })
            .eq('id', room.bet.matchId);
        } catch (e) {
          console.error('Erro ao atualizar partida na tabela matches:', e);
        }
      }
    }
    
    // Salvar histórico das perguntas para ambos os jogadores
    await this.salvarHistoricoPerguntas(player1.id, room.questions);
    await this.salvarHistoricoPerguntas(player2.id, room.questions);
  }

  // Iniciar rodada de desempate
  private async startTiebreaker(room: GameRoom): Promise<void> {
    room.isInTiebreaker = true;
    room.tiebreakerRound += 1;
    room.status = 'tiebreaker';

    console.log(`🏆 Iniciando desempate - Rodada ${room.tiebreakerRound}`);

    // Buscar perguntas já respondidas pelos dois jogadores para o desempate
    const respondidas1 = await this.buscarPerguntasRespondidas(room.players[0]?.id);
    const respondidas2 = await this.buscarPerguntasRespondidas(room.players[1]?.id);
    const respondidas = Array.from(new Set([...respondidas1, ...respondidas2]));
    const savedConfig = localStorage.getItem('quiz-api-config');
    const config = savedConfig ? JSON.parse(savedConfig) : { selectedSource: 'auto' };

    let tiebreakerQuestions: Question[] = [];
    try {
      console.log('🔍 Carregando perguntas de desempate...');
      let tentativas = 0;
      while (tiebreakerQuestions.length < room.tiebreakerQuestions && tentativas < 30) {
        const qs = await enhancedQuestionService.getQuestions(
          room.bet.category,
          room.bet.difficulty,
          1,
          config.selectedSource
        );
        if (qs.length > 0 && !respondidas.includes(qs[0].id) && !tiebreakerQuestions.find(q => q.id === qs[0].id)) {
          tiebreakerQuestions.push(qs[0]);
        }
        tentativas++;
      }
      console.log(`✅ ${tiebreakerQuestions.length} perguntas de desempate carregadas`);
    } catch (error) {
      console.error('Erro ao carregar perguntas de desempate:', error);
      // Fallback para perguntas locais
      const { getQuestionsByCategory } = await import('../data/questions');
      tiebreakerQuestions = getQuestionsByCategory(room.bet.category, room.bet.difficulty, room.tiebreakerQuestions);
    }

    // Adicionar perguntas de desempate
    room.questions = [...room.questions, ...tiebreakerQuestions];
    room.totalQuestions = room.questions.length;
    
    // Reset do índice de questões para o desempate
    room.questionIndex = room.maxQuestions; // Começar após as 10 questões principais
    
    // Continuar com a próxima pergunta
    if (room.questions[room.questionIndex]) {
      room.currentQuestion = room.questions[room.questionIndex];
      room.timeLeft = room.questionTimeLimit; // 10 segundos para questões de desempate
      room.roundStartTime = Date.now();
      room.status = 'active';
      
      console.log(`🎯 Questão de desempate ${room.questionIndex + 1}/${room.totalQuestions}`);
    }
  }

  // Simular resposta do bot (método interno)
  private simulateBotAnswerInternal(roomId: string, botId: string): void {
    const room = this.activeRooms.get(roomId);
    if (!room || !room.currentQuestion) return;

    const bot = room.players.find(p => p.id === botId);
    if (!bot || bot.hasAnswered) return;

    // Bot tem 75% de chance de acertar
    const willGetCorrect = Math.random() < 0.75;
    const botAnswer = willGetCorrect 
      ? room.currentQuestion.correctAnswer 
      : Math.floor(Math.random() * 4);

    this.submitAnswer(roomId, botId, botAnswer);
  }

  // Método público para simular resposta do bot (chamado externamente)
  simulateBotAnswer(roomId: string, botId: string): void {
    this.simulateBotAnswerInternal(roomId, botId);
  }

  // Obter sala por ID
  getRoom(roomId: string): GameRoom | undefined {
    return this.activeRooms.get(roomId);
  }

  // Obter estatísticas da fila
  getQueueStats(): { playersInQueue: number; averageWaitTime: number } {
    return {
      playersInQueue: this.matchmakingQueue.length + Math.floor(Math.random() * 15) + 5,
      averageWaitTime: 30 // segundos estimados
    };
  }

  // Status da conexão
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    return this.connectionStatus;
  }

  // Simular atividade online
  getOnlinePlayersCount(): number {
    return Math.floor(Math.random() * 50) + 20; // 20-70 jogadores online
  }
}

export const multiplayerService = new MultiplayerService();
export default multiplayerService;