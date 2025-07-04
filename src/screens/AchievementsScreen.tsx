import React from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Achievement, Screen } from '../types';

interface AchievementsScreenProps {
  achievements: Achievement[];
  onNavigate: (screen: Screen) => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ achievements, onNavigate }) => {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="p-8">
      <Logo size="md" />
      
      <div className="space-y-4 mb-6">
        <div className="text-center mb-6">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-gray-800">
            {unlockedAchievements.length} de {achievements.length} Conquistas
          </h2>
        </div>

        {unlockedAchievements.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-green-600">🏆 Desbloqueadas</h3>
            {unlockedAchievements.map(achievement => (
              <Card key={achievement.id} className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{achievement.title.charAt(0)}</div>
                  <div>
                    <h4 className="font-bold text-gray-800">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    {achievement.date && (
                      <p className="text-xs text-gray-500 mt-1">Desbloqueado em {achievement.date}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {lockedAchievements.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-500">🔒 Bloqueadas</h3>
            {lockedAchievements.map(achievement => (
              <Card key={achievement.id} className="bg-gray-50 opacity-60">
                <div className="flex items-start gap-3">
                  <div className="text-2xl grayscale">🔒</div>
                  <div>
                    <h4 className="font-bold text-gray-600">{achievement.title}</h4>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {achievements.length === 0 && (
          <div className="text-center py-8">
            <LoadingSpinner text="Carregando conquistas..." />
          </div>
        )}
      </div>

      <Button variant="secondary" onClick={() => onNavigate('home')} icon={ArrowLeft}>
        Voltar
      </Button>
    </div>
  );
};