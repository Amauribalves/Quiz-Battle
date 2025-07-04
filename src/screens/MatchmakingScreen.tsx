import React, { useState, useEffect } from 'react';
import { Users, Clock, Trophy, ArrowLeft, Zap, Wifi } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProgressBar } from '../components/ProgressBar';
import { Screen, Bet, User, GameRoom, MatchmakingRequest } from '../types';
import multiplayerService from '../services/multiplayerService';

interface MatchmakingScreenProps {
  user: User;
  bet: Bet;
  onNavigate: (screen: Screen) => void;
  onGameFound: (room: GameRoom) => void;
  onCancelMatchmaking: () => void;
}

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({ 
  user, 
  bet, 
  onNavigate, 
  onGameFound,
  onCancelMatchmaking 
}) => {
  const [searchTime, setSearchTime] = useState(0);
  const [playersInQueue, setPlayersInQueue] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Iniciar matchmaking
    setIsSearching(true);
    
    const request: MatchmakingRequest = {
      userId: user.id,
      username: user.username,
      bet,
      timestamp: Date.now()
    };

    try {
      multiplayerService.joinMatchmaking(request, (room: GameRoom) => {
        setIsSearching(false);
        onGameFound(room);
      });
    } catch (error) {
      console.error('Erro no matchmaking:', error);
      setIsSearching(false);
      onNavigate('bet');
    }

    // Atualizar estatísticas
    const updateStats = () => {
      const stats = multiplayerService.getQueueStats();
      setPlayersInQueue(stats.playersInQueue);
    };

    updateStats();
    const statsInterval = setInterval(updateStats, 2000);

    return () => {
      clearInterval(statsInterval);
      if (isSearching) {
        multiplayerService.cancelMatchmaking(user.id);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSearching) return;

    const timer = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSearching]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancel = () => {
    setIsSearching(false);
    onCancelMatchmaking();
    onNavigate('bet');
  };

  return (
    <div className="p-8">
      <Logo size="md" />
      
      <Card className="mb-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {isSearching ? 'Procurando Oponente...' : 'Conectando...'}
          </h2>
          <LoadingSpinner size="sm" />
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Tempo de busca</div>
                <div className="font-bold text-lg text-indigo-600">
                  {formatTime(searchTime)}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Na fila</div>
                <div className="font-bold text-lg text-orange-600">
                  {playersInQueue}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Online</div>
                <div className="font-bold text-lg text-green-600">
                  {multiplayerService.getOnlinePlayersCount()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">Detalhes da Partida</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div className="flex justify-between">
                <span>Categoria:</span>
                <span className="font-medium capitalize">
                  {bet.category === 'current' ? 'Atualizados' :
                   bet.category === 'math' ? 'Matemática' :
                   bet.category === 'english' ? 'Inglês' :
                   bet.category === 'culture' ? 'Países/Cultura' :
                   bet.category === 'sports' ? 'Esporte' :
                   'Geral'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Dificuldade:</span>
                <span className="font-medium capitalize">
                  {bet.difficulty === 'easy' ? 'Fácil' :
                   bet.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sua aposta:</span>
                <span className="font-medium">R$ {bet.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Prêmio total:</span>
                <span className="font-bold text-green-600">
                  R$ {(bet.amount * 2).toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-blue-600 mt-2">
                10 perguntas + desempate se necessário
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Tempo estimado: {Math.max(0, estimatedTime - searchTime)}s
              </span>
            </div>
            <ProgressBar 
              current={Math.min(searchTime, estimatedTime)} 
              total={estimatedTime} 
            />
          </div>

          <div className="bg-green-50 p-3 rounded-xl">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">
                Conectado ao servidor • Ping: {Math.floor(Math.random() * 50) + 20}ms
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <Button 
          variant="danger" 
          onClick={handleCancel}
        >
          Cancelar Busca
        </Button>
        <Button variant="secondary" onClick={() => onNavigate('home')} icon={ArrowLeft}>
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
};