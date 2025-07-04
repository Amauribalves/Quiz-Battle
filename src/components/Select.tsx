import React from 'react';

interface SelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  children,
  className = ''
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-center focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-300 appearance-none cursor-pointer ${className}`}
    >
      {children}
    </select>
  );
};