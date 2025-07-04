import React, { useState, useEffect } from 'react';
import { Timer } from '../components/Timer';
import { ProgressBar } from '../components/ProgressBar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Users, Trophy, Zap, Clock, Target, Swords } from 'lucide-react';
import { GameState, Question, Screen, GameRoom, Player } from '../types';
import multiplayerService from '../services/multiplayerService';

interface MultiplayerGameScreenProps {
  gameState: GameState;
  onAnswerQuestion: (answerIndex: number) => void;
  onGameEnd: (won: boolean, score: number) => void;
  onNavigate: (screen: Screen) => void;
}

const MultiplayerGameScreen: React.FC<MultiplayerGameScreenProps> = ({ 
  gameState, 
  onAnswerQuestion, 
  onGameEnd,
  onNavigate 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [room, setRoom] = useState<GameRoom | null>(gameState.room || null);

  const opponent = gameState.opponent;
  const currentPlayer = room?.players.find(p => p.id !== opponent?.id);

  useEffect(() => {
    if (gameState.isGameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleAnswer(-1); // Time's up
    }
  }, [timeLeft, gameState.isGameActive]);

  useEffect(() => {
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowResult(false);
    
    // Atualizar estado da sala
    if (gameState.room) {
      setRoom(gameState.room);
    }

    // Simular resposta do bot se necessário
    if (gameState.room && opponent?.id.startsWith('bot_')) {
      multiplayerService.simulateBotAnswer(gameState.room.id, opponent.id);
    }
  }, [gameState.currentQuestion, gameState.room]);

  const handleAnswer = async (answerIndex: number) => {
    if (selectedAnswer !== null || !gameState.currentQuestion || !room) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    // Enviar resposta para o serviço multiplayer
    if (currentPlayer) {
      await multiplayerService.submitAnswer(room.id, currentPlayer.id, answerIndex);
    }
    
    setTimeout(() => {
      onAnswerQuestion(answerIndex);
      
      // Verificar se o jogo terminou
      const updatedRoom = multiplayerService.getRoom(room.id);
      if (updatedRoom?.status === 'finished') {
        const won = updatedRoom.winner?.id === currentPlayer?.id;
        onGameEnd(won, currentPlayer?.score || 0);
      }
    }, 3000);
  };

  if (!gameState.currentQuestion || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <p>Carregando pergunta...</p>
        </Card>
      </div>
    );
  }

  const isInTiebreaker = room.isInTiebreaker;
  const tiebreakerRound = room.tiebreakerRound;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800 p-4">
      {gameState.isGameActive && <Timer timeLeft={timeLeft} totalTime={30} />}
      
      <div className="max-w-2xl mx-auto pt-16">
        {/* Status do jogo */}
        {isInTiebreaker && (
          <Card className="mb-4 bg-orange-50 border-l-4 border-orange-500">
            <div className="flex items-center justify-center gap-3">
              <Swords className="w-6 h-6 text-orange-600" />
              <div className="text-center">
                <div className="font-bold text-orange-800">DESEMPATE - Rodada {tiebreakerRound}</div>
                <div className="text-sm text-orange-600">5 perguntas para decidir o vencedor!</div>
              </div>
            </div>
          </Card>
        )}

        {/* Placar dos jogadores */}
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {currentPlayer?.username?.charAt(0).toUpperCase() || 'V'}
                </span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Você</div>
                <div className="text-sm text-gray-600">
                  {currentPlayer?.score || 0} {(currentPlayer?.score || 0) === 1 ? 'ponto' : 'pontos'}
                </div>
                {currentPlayer?.hasAnswered && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Clock className="w-3 h-3" />
                    Respondeu
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-purple-600 font-bold">VS</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-semibold text-gray-800">
                  {opponent?.username || 'Oponente'}
                </div>
                <div className="text-sm text-gray-600">
                  {opponent?.score || 0} {(opponent?.score || 0) === 1 ? 'ponto' : 'pontos'}
                </div>
                {opponent?.hasAnswered && (
                  <div className="flex items-center justify-end gap-1 text-xs text-green-600">
                    <Clock className="w-3 h-3" />
                    Respondeu
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {opponent?.username?.charAt(0).toUpperCase() || 'O'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 text-white">
            <span>
              Pergunta {gameState.questionIndex + 1} de {room.totalQuestions}
              {isInTiebreaker && ` (Desempate ${tiebreakerRound})`}
            </span>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>R$ {gameState.bet ? (gameState.bet.amount * 2).toFixed(2) : '0,00'}</span>
            </div>
          </div>
          <ProgressBar current={gameState.questionIndex + 1} total={room.totalQuestions} />
        </div>

        {/* Informações da aposta */}
        <Card className="mb-6 bg-purple-50 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-600" />
              <div>
                <div className="font-semibold text-purple-800">
                  Aposta: R$ {gameState.bet?.amount.toFixed(2)}
                </div>
                <div className="text-sm text-purple-600">
                  Categoria: {
                    gameState.bet?.category === 'current' ? 'Atualizados' :
                    gameState.bet?.category === 'math' ? 'Matemática' :
                    gameState.bet?.category === 'english' ? 'Inglês' :
                    gameState.bet?.category === 'culture' ? 'Países/Cultura' :
                    gameState.bet?.category === 'sports' ? 'Esporte' :
                    'Geral'
                  }
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                R$ {gameState.bet ? (gameState.bet.amount * 2).toFixed(2) : '0,00'}
              </div>
              <div className="text-sm text-gray-600">Prêmio Total</div>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">
            {gameState.currentQuestion.text}
          </h2>
          
          <div className="grid gap-3">
            {gameState.currentQuestion.options.map((option, index) => {
              let buttonClass = 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-2 border-gray-200';
              let iconElement = null;
              
              if (showResult) {
                if (index === gameState.currentQuestion!.correctAnswer) {
                  buttonClass = 'bg-green-500 text-white border-green-500';
                } else if (index === selectedAnswer && selectedAnswer !== gameState.currentQuestion!.correctAnswer) {
                  buttonClass = 'bg-red-500 text-white border-red-500';
                } else {
                  buttonClass = 'bg-gray-200 text-gray-600 border-gray-200';
                }

                // Mostrar indicadores de quem escolheu cada opção
                const indicators = [];
                
                if (selectedAnswer === index) {
                  indicators.push(
                    <div key="you" className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">V</span>
                    </div>
                  );
                }
                
                if (opponent?.currentAnswer === index) {
                  indicators.push(
                    <div key="opponent" className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {opponent?.username?.charAt(0).toUpperCase() || 'O'}
                      </span>
                    </div>
                  );
                }

                if (indicators.length > 0) {
                  iconElement = (
                    <div className="absolute top-2 right-2 flex gap-1">
                      {indicators}
                    </div>
                  );
                }
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`relative p-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed ${buttonClass}`}
                >
                  {option}
                  {iconElement}
                </button>
              );
            })}
          </div>
        </Card>

        {showResult && room.status === 'finished' && (
          <Card>
            <div className="text-center">
              <div className="mb-4">
                {room.winner?.id === currentPlayer?.id ? (
                  <div className="text-6xl mb-2">🏆</div>
                ) : (currentPlayer?.score || 0) === (opponent?.score || 0) ? (
                  <div className="text-6xl mb-2">🤝</div>
                ) : (
                  <div className="text-6xl mb-2">😔</div>
                )}
              </div>
              
              <h3 className="text-2xl font-bold mb-4">
                {room.winner?.id === currentPlayer?.id
                  ? '🎉 Vitória!' 
                  : (currentPlayer?.score || 0) === (opponent?.score || 0)
                  ? '🤝 Empate!'
                  : '😔 Derrota!'}
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold">Você</div>
                    <div className="text-2xl font-bold text-blue-600">{currentPlayer?.score || 0}</div>
                    <div className="text-xs text-gray-500">
                      {currentPlayer?.score || 0} de {room.totalQuestions} acertos
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">{opponent?.username || 'Oponente'}</div>
                    <div className="text-2xl font-bold text-red-600">{opponent?.score || 0}</div>
                    <div className="text-xs text-gray-500">
                      {opponent?.score || 0} de {room.totalQuestions} acertos
                    </div>
                  </div>
                </div>
              </div>

              {room.winner?.id === currentPlayer?.id && gameState.bet && (
                <div className="bg-green-50 p-4 rounded-xl mb-4 border border-green-200">
                  <div className="text-green-800 font-semibold mb-1">Prêmio Ganho!</div>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {(gameState.bet.amount * 2).toFixed(2)}
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    Sua aposta: R$ {gameState.bet.amount.toFixed(2)} + Aposta do oponente: R$ {gameState.bet.amount.toFixed(2)}
                  </div>
                </div>
              )}

              {isInTiebreaker && (
                <div className="bg-orange-50 p-4 rounded-xl mb-4 border border-orange-200">
                  <div className="text-orange-800 font-semibold mb-1">
                    Jogo decidido no desempate!
                  </div>
                  <div className="text-sm text-orange-700">
                    Rodadas de desempate: {tiebreakerRound}
                  </div>
                </div>
              )}
              
              <Button onClick={() => onNavigate('home')}>
                Voltar ao Início
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MultiplayerGameScreen;