import React from 'react';
import { Clock, Calculator, Globe2, MapPin, Trophy, Dice6 } from 'lucide-react';

interface CategoryGridProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categories = [
  { id: 'current', name: 'Atualizados', icon: Clock, badge: 'Novo!' },
  { id: 'math', name: 'Matemática', icon: Calculator, badge: 'Popular' },
  { id: 'english', name: 'Inglês', icon: Globe2 },
  { id: 'culture', name: 'Países/Cultura', icon: MapPin },
  { id: 'sports', name: 'Esporte', icon: Trophy, badge: '🔥' },
  { id: 'general', name: 'Geral', icon: Dice6 }
];

export const CategoryGrid: React.FC<CategoryGridProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {categories.map(category => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`relative p-5 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 active:scale-95 group overflow-hidden
              ${isSelected 
                ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-xl ring-2 ring-purple-300' 
                : 'bg-white shadow-lg hover:shadow-2xl text-gray-700 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50'
              }`}
          >
            {category.badge && (
              <span className={`absolute -top-1 -right-1 text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10
                ${category.badge === '🔥' 
                  ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white' 
                  : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800'
                }`}
              >
                {category.badge}
              </span>
            )}
            
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className={`p-4 rounded-full transition-all duration-300 group-hover:scale-110
                ${isSelected 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : 'bg-gradient-to-br from-purple-100 to-blue-100 group-hover:from-purple-200 group-hover:to-blue-200'
                }`}
              >
                <Icon className={`w-8 h-8 transition-all duration-300 group-hover:rotate-6
                  ${isSelected ? 'text-white' : 'text-purple-600'}`} 
                />
              </div>
              
              <div className={`text-sm font-semibold transition-colors duration-300
                ${isSelected ? 'text-white' : 'text-gray-700 group-hover:text-purple-700'}`}
              >
                {category.name}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};