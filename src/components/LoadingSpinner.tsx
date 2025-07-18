import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin ${sizeClasses[size]}`} />
      {text && <p className="text-gray-600 font-medium">{text}</p>}
    </div>
  );
};