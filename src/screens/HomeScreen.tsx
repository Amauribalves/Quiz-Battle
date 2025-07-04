import React from 'react';
import { Target, Wallet, CreditCard, Trophy, LogOut } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { BalanceDisplay } from '../components/BalanceDisplay';
import { WithdrawBalanceDisplay } from '../components/WithdrawBalanceDisplay';
import { StatsGrid } from '../components/StatsGrid';
import { Card } from '../components/Card';
import { User, Screen } from '../types';

interface HomeScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ user, onNavigate, onLogout }) => {
  return (
    <div className="p-8">
      {/* Balance displays side by side above logo */}
      <div className="flex justify-end mb-6">
        <BalanceDisplay balance={user.balance} className="max-w-xs w-full shadow-lg" />
      </div>
      
      <Logo size="md" />
      
      <Card className="mb-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          {user.username}
        </div>
      </Card>
      
      <StatsGrid wins={user.wins} losses={user.losses} />

      <div className="space-y-3">
        <Button onClick={() => onNavigate('game-mode-select')} icon={Target}>
          Jogar Agora
        </Button>
        <Button variant="success" onClick={() => onNavigate('deposit')} icon={Wallet}>
          Depositar
        </Button>
        <Button variant="secondary" onClick={() => onNavigate('withdraw')} icon={CreditCard}>
          Sacar
        </Button>
        <Button variant="secondary" onClick={() => onNavigate('achievements')} icon={Trophy}>
          Conquistas
        </Button>
        <Button
          variant="secondary"
          onClick={() => onNavigate('admin')}
          className="mt-2"
        >
          Painel Admin (temporário)
        </Button>
        <Button variant="danger" onClick={onLogout} icon={LogOut}>
          Sair
        </Button>
      </div>
    </div>
  );
};