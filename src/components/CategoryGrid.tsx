import React from 'react';
import { Clock, Calculator, Globe2, MapPin, Trophy, Dice6 } from 'lucide-react';

interface CategoryGridProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categories = [
  { id: 'current', name: 'Atualizados', icon: Clock, color: 'from-blue-500 to-cyan-600', badge: 'Novo!' },
  { id: 'math', name: 'Matemática', icon: Calculator, color: 'from-green-500 to-emerald-600', badge: 'Popular' },
  { id: 'english', name: 'Inglês', icon: Globe2, color: 'from-red-500 to-pink-600' },
  { id: 'culture', name: 'Países/Cultura', icon: MapPin, color: 'from-purple-500 to-indigo-600' },
  { id: 'sports', name: 'Esporte', icon: Trophy, color: 'from-orange-500 to-red-600', badge: '🔥' },
  { id: 'general', name: 'Geral', icon: Dice6, color: 'from-gray-500 to-slate-600' }
];

export const CategoryGrid: React.FC<CategoryGridProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {categories.map(category => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`relative p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 active:scale-95 group overflow-hidden
              ${isSelected ? `bg-gradient-to-r ${category.color} text-white shadow-lg ring-4 ring-indigo-200` : 'bg-white shadow-md hover:shadow-2xl text-gray-700'}`}
          >
            {category.badge && (
              <span className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full shadow animate-pulse">
                {category.badge}
              </span>
            )}
            <span className="flex items-center justify-center mb-2">
              <span className="bg-gradient-to-r p-3 rounded-full transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                style={{ backgroundImage: isSelected ? undefined : undefined }}>
                <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-gray-600'} group-hover:animate-bounce`} />
              </span>
            </span>
            <div className="text-sm font-medium group-hover:text-white transition-colors">{category.name}</div>
          </button>
        );
      })}
    </div>
  );
};