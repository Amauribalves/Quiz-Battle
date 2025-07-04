import React, { useState, useEffect } from 'react';
import { Timer } from '../components/Timer';
import { ProgressBar } from '../components/ProgressBar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BookOpen, Trophy } from 'lucide-react';
import { GameState, Question, Screen } from '../types';

interface GameScreenProps {
  gameState: GameState;
  onAnswerQuestion: (answerIndex: number) => void;
  onGameEnd: (won: boolean, score: number) => void;
  onNavigate: (screen: Screen) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ 
  gameState, 
  onAnswerQuestion, 
  onGameEnd,
  onNavigate 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

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
  }, [gameState.currentQuestion]);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || !gameState.currentQuestion) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    setTimeout(() => {
      onAnswerQuestion(answerIndex);
      
      if (gameState.questionIndex + 1 >= gameState.totalQuestions) {
        // Para modo solo, sempre "ganha" (completa o treino)
        const won = gameState.gameMode === 'solo' ? true : gameState.score >= 3;
        onGameEnd(won, gameState.score);
      }
    }, 2000);
  };

  if (!gameState.currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <p>Carregando pergunta...</p>
        </Card>
      </div>
    );
  }

  const isSoloMode = gameState.gameMode === 'solo';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800 p-4">
      {gameState.isGameActive && <Timer timeLeft={timeLeft} totalTime={30} />}
      
      <div className="max-w-2xl mx-auto pt-16">
        {/* Header diferente para cada modo */}
        {isSoloMode ? (
          <Card className="mb-4 bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-800">Modo Treino</div>
                  <div className="text-sm text-green-600">Sem apostas • Aprendizado</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{gameState.score}</div>
                <div className="text-sm text-green-600">Acertos</div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="mb-4 bg-purple-50 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-purple-600" />
                <div>
                  <div className="font-semibold text-purple-800">Modo Competitivo</div>
                  <div className="text-sm text-purple-600">
                    Prêmio: R$ {gameState.bet ? (gameState.bet.amount * gameState.bet.multiplier).toFixed(2) : '0,00'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{gameState.score}</div>
                <div className="text-sm text-purple-600">Pontos</div>
              </div>
            </div>
          </Card>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 text-white">
            <span>Pergunta {gameState.questionIndex + 1} de {gameState.totalQuestions}</span>
            <span>
              {isSoloMode ? 'Treino' : `Aposta: R$ ${gameState.bet?.amount.toFixed(2) || '0,00'}`}
            </span>
          </div>
          <ProgressBar current={gameState.questionIndex + 1} total={gameState.totalQuestions} />
        </div>

        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">
            {gameState.currentQuestion.text}
          </h2>
          
          <div className="grid gap-3">
            {gameState.currentQuestion.options.map((option, index) => {
              let buttonClass = 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-2 border-gray-200';
              
              if (showResult) {
                if (index === gameState.currentQuestion!.correctAnswer) {
                  buttonClass = 'bg-green-500 text-white border-green-500';
                } else if (index === selectedAnswer && selectedAnswer !== gameState.currentQuestion!.correctAnswer) {
                  buttonClass = 'bg-red-500 text-white border-red-500';
                } else {
                  buttonClass = 'bg-gray-200 text-gray-600 border-gray-200';
                }
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed ${buttonClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </Card>

        {showResult && gameState.questionIndex + 1 >= gameState.totalQuestions && (
          <Card>
            <div className="text-center">
              <div className="mb-4">
                {isSoloMode ? (
                  <div className="text-6xl mb-2">📚</div>
                ) : gameState.score >= 3 ? (
                  <div className="text-6xl mb-2">🏆</div>
                ) : (
                  <div className="text-6xl mb-2">😔</div>
                )}
              </div>
              
              <h3 className="text-2xl font-bold mb-4">
                {isSoloMode 
                  ? '📚 Treino Concluído!' 
                  : gameState.score >= 3 
                  ? '🎉 Parabéns!' 
                  : '😔 Que pena!'}
              </h3>
              
              <p className="text-lg mb-6">
                Você acertou {gameState.score} de {gameState.totalQuestions} perguntas
                {isSoloMode && (
                  <span className="block text-sm text-gray-600 mt-2">
                    Continue praticando para melhorar seus conhecimentos!
                  </span>
                )}
              </p>
              
              <Button onClick={() => {
                if (isSoloMode) {
                  onGameEnd(true, gameState.score);
                }
                onNavigate('home');
              }}>
                Voltar ao Início
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};