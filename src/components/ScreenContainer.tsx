import React from 'react';

interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800 ${className}`}>
      <div className="w-full max-w-full sm:max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden animate-fadeIn px-0 sm:px-4">
        {children}
      </div>
    </div>
  );
};