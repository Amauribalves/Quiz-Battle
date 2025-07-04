import React, { useState } from 'react';
import { Play, ArrowLeft, BookOpen } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { CategoryGrid } from '../components/CategoryGrid';
import { Card } from '../components/Card';
import { Screen } from '../types';

interface SoloPracticeScreenProps {
  onNavigate: (screen: Screen) => void;
  onStartSoloGame: (category: string) => void;
}

export const SoloPracticeScreen: React.FC<SoloPracticeScreenProps> = ({ 
  onNavigate, 
  onStartSoloGame 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleStartGame = () => {
    if (selectedCategory) {
      onStartSoloGame(selectedCategory);
    }
  };

  return (
    <div className="p-8">
      <Logo size="md" />
      
      <Card className="mb-6 bg-green-50 border-l-4 border-green-500">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-800">Modo Treino</h3>
            <p className="text-sm text-green-700">
              Pratique com 5 perguntas sem apostas e melhore seus conhecimentos!
            </p>
          </div>
        </div>
      </Card>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Escolha a Categoria</h3>
        <CategoryGrid 
          selectedCategory={selectedCategory}
          onSelectCategory={(category) => setSelectedCategory(category)}
        />
      </div>

      <div className="space-y-3">
        <Button 
          variant="success" 
          onClick={handleStartGame} 
          icon={Play}
          disabled={!selectedCategory}
        >
          Começar Treino
        </Button>
        <Button variant="secondary" onClick={() => onNavigate('game-mode-select')} icon={ArrowLeft}>
          Voltar
        </Button>
      </div>
    </div>
  );
};