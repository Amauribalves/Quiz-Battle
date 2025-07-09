import React from 'react';
import { Trophy, XCircle } from 'lucide-react';
import { Card } from './Card';

interface StatsGridProps {
  wins: number;
  losses: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ wins, losses }) => {
  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <Card hover className="text-center p-2">
        <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
        <div className="text-xl font-bold text-indigo-600">{wins}</div>
        <div className="text-xs text-gray-600">Vitórias</div>
      </Card>
      <Card hover className="text-center p-2">
        <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
        <div className="text-xl font-bold text-red-600">{losses}</div>
        <div className="text-xs text-gray-600">Derrotas</div>
      </Card>
    </div>
  );
};