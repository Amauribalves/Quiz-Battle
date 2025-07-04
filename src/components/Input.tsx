import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ElementType;
}

export const Input: React.FC<InputProps> = ({ icon: Icon, ...props }) => {
  return (
    <div className="relative">
      {Icon && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="w-5 h-5" />
        </span>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all ${Icon ? 'pl-10' : ''}`}
        {...props}
      />
    </div>
  );
};