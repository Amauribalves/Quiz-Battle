import React, { useState } from 'react';
import { DollarSign, ArrowLeft, Target } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { BalanceDisplay } from '../components/BalanceDisplay';
import { CategoryGrid } from '../components/CategoryGrid';
import { Card } from '../components/Card';
import { User, Screen, Bet } from '../types';

interface BetScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onStartGame: (bet: Bet) => void;
}

export const BetScreen: React.FC<BetScreenProps> = ({ user, onNavigate, onStartGame }) => {
  const [betAmount, setBetAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBetAmount(value);
  };

  const validateBetAmount = (amount: number): boolean => {
    return amount >= 5 && amount <= user.balance && amount % 5 === 0;
  };

  const handleStartGame = () => {
    console.log('Tentando iniciar jogo multiplayer:', { betAmount, selectedCategory });
    
    const amount = parseFloat(betAmount);
    if (validateBetAmount(amount) && selectedCategory) {
      const bet: Bet = {
        amount,
        category: selectedCategory,
        difficulty: selectedDifficulty, // Usar dificuldade selecionada
        multiplier: 2 // Sempre 2x (sua aposta + aposta do oponente)
      };
      console.log('Chamando onStartGame com bet:', bet);
      onStartGame(bet);
    } else {
      console.log('Validação falhou:', { amount, isValid: validateBetAmount(amount), selectedCategory });
    }
  };

  const currentAmount = parseFloat(betAmount) || 0;
  const isValidAmount = validateBetAmount(currentAmount);
  const canStart = betAmount && isValidAmount && selectedCategory && selectedDifficulty;

  // Sugestões de valores múltiplos de 5
  const suggestedAmounts = [5, 10, 25, 50, 100, 250, 500].filter(amount => amount <= user.balance);

  return (
    <div className="p-8">
      <Logo size="md" />
      
      <BalanceDisplay balance={user.balance} className="mb-6" />
      
      <Card className="mb-6 bg-purple-50 border-l-4 border-purple-500">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="font-semibold text-purple-800">Modo Multiplayer</h3>
            <p className="text-sm text-purple-700">
              10 perguntas + desempate • Ganhe o dobro da sua aposta!
            </p>
          </div>
        </div>
      </Card>
      
      <div className="space-y-4 mb-6">
        <div className="relative group mb-4">
          <span className="absolute inset-y-0 left-4 flex items-center text-indigo-400 transition-transform duration-300 group-focus-within:animate-bounce">
            <DollarSign className="w-5 h-5" />
          </span>
          <input
            type="number"
            placeholder="Valor da Aposta (R$)"
            min={5}
            max={user.balance}
            step={5}
            value={betAmount}
            onChange={handleBetAmountChange}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-gradient-to-r from-white via-indigo-50 to-purple-50 text-gray-800 font-semibold shadow transition-all duration-300 placeholder:text-indigo-400"
          />
          <div className="flex gap-2 mt-2">
            {[5, 10, 25, 50, 100, 250, 500].filter(val => val <= user.balance).map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setBetAmount(val.toString())}
                className={`px-3 py-1 rounded-lg font-bold transition-all duration-200
                  ${betAmount == val.toString() ? 'bg-indigo-500 text-white scale-105 shadow' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}
                `}
              >
                R$ {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Seletor de Dificuldade */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Escolha a Dificuldade</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'easy', label: 'Fácil', color: 'from-green-500 to-green-600' },
            { value: 'medium', label: 'Médio', color: 'from-yellow-500 to-yellow-600' },
            { value: 'hard', label: 'Difícil', color: 'from-red-500 to-red-600' }
          ].map(difficulty => (
            <button
              key={difficulty.value}
              onClick={() => setSelectedDifficulty(difficulty.value as 'easy' | 'medium' | 'hard')}
              className={`p-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 active:scale-95
                ${selectedDifficulty === difficulty.value 
                  ? `bg-gradient-to-r ${difficulty.color} shadow-lg ring-2 ring-white/50` 
                  : `bg-gradient-to-r ${difficulty.color} opacity-70 hover:opacity-100`
                }`}
            >
              {difficulty.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Escolha a Categoria</h3>
        <CategoryGrid 
          selectedCategory={selectedCategory}
          onSelectCategory={(category) => {
            console.log('Categoria selecionada:', category);
            setSelectedCategory(category);
          }}
        />
      </div>

      {/* Resumo da aposta */}
      {canStart && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl mb-6 border border-indigo-200">
          <h4 className="font-semibold text-gray-800 mb-2 text-center">Resumo da Aposta</h4>
          <div className="space-y-1 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Sua aposta:</span>
              <span className="font-medium">R$ {currentAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Categoria:</span>
              <span className="font-medium capitalize">
                {selectedCategory === 'current' ? 'Atualizados' :
                 selectedCategory === 'math' ? 'Matemática' :
                 selectedCategory === 'english' ? 'Inglês' :
                 selectedCategory === 'culture' ? 'Países/Cultura' :
                 selectedCategory === 'sports' ? 'Esporte' :
                 'Geral'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Dificuldade:</span>
              <span className="font-medium capitalize">
                {selectedDifficulty === 'easy' ? 'Fácil' :
                 selectedDifficulty === 'medium' ? 'Médio' : 'Difícil'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Aposta do oponente:</span>
              <span className="font-medium">R$ {currentAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-2">
              <span className="font-semibold">Prêmio total:</span>
              <span className="font-bold text-green-600">
                R$ {(currentAmount * 2).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2 text-center">
            10 perguntas + desempate se necessário
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Button 
          variant="success" 
          onClick={handleStartGame} 
          icon={Target}
          disabled={!canStart}
        >
          Buscar Oponente
        </Button>
        <Button variant="secondary" onClick={() => onNavigate('game-mode-select')} icon={ArrowLeft}>
          Voltar
        </Button>
      </div>
    </div>
  );
};