import React from 'react';
import { Trophy, XCircle } from 'lucide-react';
import { Card } from './Card';

interface StatsGridProps {
  wins: number;
  losses: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ wins, losses }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card hover className="text-center">
        <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
        <div className="text-3xl font-bold text-indigo-600">{wins}</div>
        <div className="text-sm text-gray-600">Vitórias</div>
      </Card>
      <Card hover className="text-center">
        <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <div className="text-3xl font-bold text-red-600">{losses}</div>
        <div className="text-sm text-gray-600">Derrotas</div>
      </Card>
    </div>
  );
};