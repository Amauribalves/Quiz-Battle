import React from 'react';
import { Globe, Database, Server, HardDrive, Zap, Trophy } from 'lucide-react';
import { Card } from './Card';

interface APISourceSelectorProps {
  selectedSource: 'local' | 'trivia' | 'quiz-api' | 'custom' | 'jservice' | 'trivia-api';
  onSourceChange: (source: 'local' | 'trivia' | 'quiz-api' | 'custom' | 'jservice' | 'trivia-api') => void;
  className?: string;
}

const sources = [
  {
    id: 'auto' as const,
    name: 'Modo Automático',
    description: 'Escolhe a melhor fonte automaticamente',
    icon: Zap,
    color: 'from-green-500 to-emerald-600',
    free: true,
    speed: 'Inteligente',
    recommended: true
  },
  {
    id: 'trivia-db-extended' as const,
    name: 'Open Trivia DB+',
    description: 'API gratuita com +4000 perguntas em português',
    icon: Globe,
    color: 'from-blue-500 to-cyan-600',
    free: true,
    speed: 'Muito Rápido'
  },
  {
    id: 'trivia' as const,
    name: 'Open Trivia DB',
    description: 'API gratuita com milhares de perguntas',
    icon: Globe,
    color: 'from-blue-500 to-cyan-600',
    free: true,
    speed: 'Rápido'
  },
  {
    id: 'trivia-api' as const,
    name: 'The Trivia API',
    description: 'API moderna e rápida (+1000 perguntas)',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
    free: true,
    speed: 'Muito Rápido'
  },
  {
    id: 'jservice' as const,
    name: 'JService (Jeopardy!)',
    description: 'Perguntas do programa Jeopardy! (+200k)',
    icon: Trophy,
    color: 'from-indigo-500 to-purple-600',
    free: true,
    speed: 'Médio'
  },
  {
    id: 'quiz-api' as const,
    name: 'Quiz API',
    description: 'API premium com +10k perguntas por categoria',
    icon: Database,
    color: 'from-purple-500 to-indigo-600',
    free: false,
    speed: 'Rápido'
  },
  {
    id: 'local' as const,
    name: 'Perguntas Locais',
    description: 'Banco de dados interno (fallback)',
    icon: HardDrive,
    color: 'from-gray-500 to-slate-600',
    free: true,
    speed: 'Muito Rápido'
  },
  {
    id: 'custom' as const,
    name: 'API Customizada',
    description: 'Sua própria API de perguntas',
    icon: Server,
    color: 'from-green-500 to-emerald-600',
    free: true,
    speed: 'Variável'
  }
];

export const APISourceSelector: React.FC<APISourceSelectorProps> = ({
  selectedSource,
  onSourceChange,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Fonte das Perguntas</h3>
      
      <div className="grid gap-3">
        {sources.map(source => {
          const Icon = source.icon;
          const isSelected = selectedSource === source.id;
          
          return (
            <Card
              key={source.id}
              className={`cursor-pointer transition-all duration-300 ${
                isSelected 
                  ? `bg-gradient-to-r ${source.color} text-white transform scale-105` 
                  : 'hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              <div onClick={() => onSourceChange(source.id)} style={{ cursor: 'pointer' }} className="flex items-center gap-3">
                <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                      {source.name}
                    </h4>
                    {source.recommended && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        ★ RECOMENDADO
                      </span>
                    )}
                    {source.free && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        GRÁTIS
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-600'} mb-1`}>
                    {source.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                      Velocidade: {source.speed}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};