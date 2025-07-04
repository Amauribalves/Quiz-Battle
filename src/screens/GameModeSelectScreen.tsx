import React from 'react';
import { Users, User, Trophy, BookOpen, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../types';

interface GameModeSelectScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const GameModeSelectScreen: React.FC<GameModeSelectScreenProps> = ({ onNavigate }) => {
  return (
    <div className="p-8">
      <Logo size="md" />
      
      <div className="space-y-4 mb-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Escolha o Modo de Jogo
        </h2>

        <Card className="relative overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:ring-4 hover:ring-indigo-300 cursor-pointer group bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-[length:200%_200%] animate-[gradientMove_3s_linear_infinite]">
          <span className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full shadow">
            Popular
          </span>
          <div onClick={() => onNavigate('bet')} style={{ cursor: 'pointer' }}>
            <div className="flex items-center gap-4 p-4">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                <Users className="w-8 h-8 text-white group-hover:animate-bounce" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-white transition-colors">Multiplayer Online</h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-100 transition-colors mb-2">
                  Compete contra outros jogadores em tempo real
                </p>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-500 group-hover:text-white">10 perguntas • Apostas • Prêmios</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:ring-4 hover:ring-green-300 cursor-pointer group bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400 bg-[length:200%_200%] animate-[gradientMove_3s_linear_infinite]">
          <span className="absolute top-2 right-2 bg-blue-400 text-xs font-bold px-2 py-1 rounded-full shadow">
            Novo!
          </span>
          <div onClick={() => onNavigate('solo-practice')} style={{ cursor: 'pointer' }}>
            <div className="flex items-center gap-4 p-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                <User className="w-8 h-8 text-white group-hover:animate-bounce" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-white transition-colors">Modo Solo</h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-100 transition-colors mb-2">
                  Pratique e aprenda sem apostas
                </p>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-500 group-hover:text-white">5 perguntas • Sem apostas • Aprendizado</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Button variant="secondary" onClick={() => onNavigate('home')} icon={ArrowLeft}>
        Voltar
      </Button>
    </div>
  );
};