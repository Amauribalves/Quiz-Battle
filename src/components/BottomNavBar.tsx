import React from 'react';
import { Home, User as UserIcon, Wallet, CreditCard, History } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavBarProps {
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ onNavigate, currentScreen }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 z-50">
      <button onClick={() => onNavigate('home')} className={`flex flex-col items-center text-xs focus:outline-none ${currentScreen === 'home' ? 'text-violet-600' : ''}`}>
        <Home size={22} />
        Início
      </button>
      <button onClick={() => onNavigate('profile')} className={`flex flex-col items-center text-xs focus:outline-none ${currentScreen === 'profile' ? 'text-violet-600' : ''}`}>
        <UserIcon size={22} />
        Perfil
      </button>
      <button onClick={() => onNavigate('deposit')} className={`flex flex-col items-center text-xs focus:outline-none ${currentScreen === 'deposit' ? 'text-violet-600' : ''}`}>
        <Wallet size={22} />
        Depositar
      </button>
      <button onClick={() => onNavigate('withdraw')} className={`flex flex-col items-center text-xs focus:outline-none ${currentScreen === 'withdraw' ? 'text-violet-600' : ''}`}>
        <CreditCard size={22} />
        Sacar
      </button>
      <button onClick={() => onNavigate('history')} className={`flex flex-col items-center text-xs focus:outline-none ${currentScreen === 'history' ? 'text-violet-600' : ''}`}>
        <History size={22} />
        Histórico
      </button>
    </nav>
  );
}; 