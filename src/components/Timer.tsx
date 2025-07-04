import React from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime }) => {
  const percentage = (timeLeft / totalTime) * 100;
  const isUrgent = timeLeft <= 5;
  
  return (
    <div className={`fixed top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-white transition-all duration-300 ${
      isUrgent ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' : 'bg-gradient-to-r from-orange-500 to-red-500'
    }`}>
      <Clock className="w-5 h-5" />
      <span className="text-lg">{timeLeft}s</span>
      <div className="w-16 h-2 bg-white/30 rounded-full overflow-hidden ml-2">
        <div 
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};