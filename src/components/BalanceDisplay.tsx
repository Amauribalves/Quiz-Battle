import React from 'react';
import { Wallet } from 'lucide-react';

interface BalanceDisplayProps {
  balance: number;
  className?: string;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ balance, className = '' }) => {
  return (
    <div className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md p-2 flex items-center gap-2 shadow ${className}`} style={{ minWidth: 0, width: 'auto', maxWidth: '180px' }}>
      <Wallet className="w-4 h-4 opacity-80" />
      <div className="flex flex-col justify-center min-w-0">
        <span className="text-[10px] font-semibold opacity-80 tracking-wide leading-none">Saldo</span>
        <span className="text-xs font-bold tracking-tight truncate">
          R$ {balance.toFixed(2).replace('.', ',')}
        </span>
      </div>
    </div>
  );
};