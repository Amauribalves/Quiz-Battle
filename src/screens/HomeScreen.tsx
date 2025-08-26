import React from 'react';
import { Target, Wallet, CreditCard, LogOut, Users, List, Medal, User as UserIcon, Home, History } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { BalanceDisplay } from '../components/BalanceDisplay';
import { WithdrawBalanceDisplay } from '../components/WithdrawBalanceDisplay';
import { StatsGrid } from '../components/StatsGrid';
import { Card } from '../components/Card';
import { CircularProgress } from '../components/CircularProgress';
import { User, Screen } from '../types';
              import { useChallenges } from '../hooks/useChallenges';

interface HomeScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ user, onNavigate, onLogout }) => {
  const { overallProgress } = useChallenges(user);

  // Opções de avatar iguais ao ProfileScreen
  const avatarOptions = [
    <UserIcon size={36} className="text-gray-500" key="default" />, // padrão
    <span key="cat" role="img" aria-label="Gato" className="text-3xl">🐱</span>,
    <span key="dog" role="img" aria-label="Cachorro" className="text-3xl">🐶</span>,
    <span key="alien" role="img" aria-label="Alien" className="text-3xl">👽</span>,
    <span key="robot" role="img" aria-label="Robô" className="text-3xl">🤖</span>,
    <span key="ninja" role="img" aria-label="Ninja" className="text-3xl">🥷</span>,
  ];

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full px-2 sm:px-0 sm:max-w-md mx-auto">
      <div className="flex-1 overflow-auto">
        {/* Topo: Logo e Saldo */}
        <div className="flex items-center justify-between p-4 pb-0">
          <div className="flex-shrink-0">
            <Logo size="md" />
          </div>
          <div className="flex-shrink-0">
            <BalanceDisplay balance={user.balance} className="shadow-lg" />
          </div>
        </div>
        
        {/* Card com nome do usuário */}
        <Card className="mb-4 mt-0 p-2 w-full">
          <div className="flex items-center justify-between text-lg font-semibold text-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              {user.username}
            </div>
            <button
              className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center ml-2 focus:outline-none hover:ring-2 hover:ring-violet-400 transition text-3xl"
              onClick={() => onNavigate('profile')}
              title="Ver perfil"
            >
              {avatarOptions[user.avatar ?? 0]}
            </button>
          </div>
        </Card>
        
        {/* Desafio X com marcador de porcentagem */}
        <Card className="mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-between p-4">
            <Button 
              onClick={() => onNavigate('desafio-x')} 
              variant="primary" 
              className="px-3 py-1.5 text-sm font-bold min-w-0 bg-white text-blue-600 hover:bg-gray-100"
              fullWidth={false}
            >
              Desafio X
            </Button>
            <CircularProgress percentage={overallProgress} size={40} strokeWidth={3} />
          </div>
        </Card>
        {/* Vitórias e Derrotas */}
        <StatsGrid wins={user.wins} losses={user.losses} />
        {/* Botões principais */}
        <div className="space-y-3 px-0 mb-8 w-full">
          <Button onClick={() => onNavigate('game-mode-select')} icon={Target}>
            Jogar Agora
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('ranking')} icon={List}>
            Ranking geral
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('achievements')} icon={Medal}>
            Conquistas
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('friends')} icon={Users}>
            Amigos
          </Button>
        </div>
      </div>
      {/* Rodapé fixo */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 z-50">
        <button onClick={() => onNavigate('home')} className="flex flex-col items-center text-xs focus:outline-none">
          <Home size={22} />
          Início
        </button>
        <button onClick={() => onNavigate('profile')} className="flex flex-col items-center text-xs focus:outline-none">
          <UserIcon size={22} />
          Perfil
        </button>
        <button onClick={() => onNavigate('deposit')} className="flex flex-col items-center text-xs focus:outline-none">
          <Wallet size={22} />
          Depositar
        </button>
        <button onClick={() => onNavigate('withdraw')} className="flex flex-col items-center text-xs focus:outline-none">
          <CreditCard size={22} />
          Sacar
        </button>
        <button onClick={() => onNavigate('history')} className="flex flex-col items-center text-xs focus:outline-none">
          <History size={22} />
          Histórico
        </button>
      </nav>
    </div>
  );
};