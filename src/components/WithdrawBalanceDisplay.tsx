import React from 'react';
import { Banknote } from 'lucide-react';

interface WithdrawBalanceDisplayProps {
  balance: number;
  className?: string;
}

export const WithdrawBalanceDisplay: React.FC<WithdrawBalanceDisplayProps> = ({ balance, className = '' }) => {
  const withdrawableAmount = balance * 0.85; // 85% after 15% fee
  
  return (
    <div className={`bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl p-4 flex flex-col items-center justify-center gap-1 ${className}`}>
      <Banknote className="w-4 h-4" />
      <div className="text-center">
        <div className="text-xs font-medium opacity-90">Saque</div>
        <div className="text-sm font-bold">
          R$ {withdrawableAmount.toFixed(2).replace('.', ',')}
        </div>
      </div>
    </div>
  );
};