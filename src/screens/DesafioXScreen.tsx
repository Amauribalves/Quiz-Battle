    import React, { useState } from 'react';
import { ScreenContainer } from '../components/ScreenContainer';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { User, Challenge, Mission, Screen } from '../types';
import { Trophy, Clock, Star, Zap, Target, Award } from 'lucide-react';
import { useChallenges } from '../hooks/useChallenges';

interface DesafioXScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
}

export const DesafioXScreen: React.FC<DesafioXScreenProps> = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  
  const {
    dailyChallenges,
    weeklyMissions,
    isLoading,
    claimReward
  } = useChallenges(user);

  const handleClaimReward = (item: Challenge | Mission) => {
    if (item.isCompleted && !item.isClaimed) {
      const result = claimReward(item.id);
      
      if (result.success) {
        // Em um app real, aqui você atualizaria o saldo do usuário
        console.log(result.message);
      }
    }
  };

  const getRequirementIcon = (type: string) => {
    switch (type) {
      case 'wins': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'streak': return <Zap className="w-5 h-5 text-blue-500" />;
      case 'category_wins': return <Target className="w-5 h-5 text-green-500" />;
      default: return <Star className="w-5 h-5 text-purple-500" />;
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'money': return <Award className="w-5 h-5 text-green-500" />;
      case 'bonus': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'experience': return <Zap className="w-5 h-5 text-blue-500" />;
      default: return <Award className="w-5 h-5 text-purple-500" />;
    }
  };

  const formatTimeLeft = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Menos de 1h';
  };

  const renderChallengeCard = (challenge: Challenge) => (
    <Card key={challenge.id} className="mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getRequirementIcon(challenge.requirement.type)}
            <h3 className="font-semibold text-lg">{challenge.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              challenge.type === 'daily' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-purple-100 text-purple-600'
            }`}>
              {challenge.type === 'daily' ? 'Diário' : 'Semanal'}
            </span>
          </div>
          
          <p className="text-gray-600 mb-3">{challenge.description}</p>
          
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Progresso</span>
              <span>{challenge.progress}/{challenge.requirement.value}</span>
            </div>
            <ProgressBar 
              current={challenge.progress} 
              total={challenge.requirement.value}
              className="h-2"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{formatTimeLeft(challenge.expiresAt)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {getRewardIcon(challenge.reward.type)}
              <span className="font-semibold text-green-600">
                R$ {challenge.reward.value.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {challenge.isCompleted && !challenge.isClaimed && (
        <Button 
          onClick={() => handleClaimReward(challenge)}
          className="w-full mt-3 bg-green-500 hover:bg-green-600"
        >
          Reclamar Recompensa
        </Button>
      )}
      
      {challenge.isClaimed && (
        <div className="w-full mt-3 text-center py-2 bg-gray-100 text-gray-600 rounded-lg">
          Recompensa Reclamada ✓
        </div>
      )}
    </Card>
  );

  const renderMissionCard = (mission: Mission) => (
    <Card key={mission.id} className="mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getRequirementIcon(mission.requirement.type)}
            <h3 className="font-semibold text-lg">{mission.title}</h3>
            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-600">
              Semanal
            </span>
          </div>
          
          <p className="text-gray-600 mb-3">{mission.description}</p>
          
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Progresso</span>
              <span>{mission.progress}/{mission.requirement.value}</span>
            </div>
            <ProgressBar 
              current={mission.progress} 
              total={mission.requirement.value}
              className="h-2"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{formatTimeLeft(mission.expiresAt)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {getRewardIcon(mission.reward.type)}
              <span className="font-semibold text-green-600">
                R$ {mission.reward.value.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {mission.isCompleted && !mission.isClaimed && (
        <Button 
          onClick={() => handleClaimReward(mission)}
          className="w-full mt-3 bg-green-500 hover:bg-green-600"
        >
          Reclamar Recompensa
        </Button>
      )}
      
      {mission.isClaimed && (
        <div className="w-full mt-3 text-center py-2 bg-gray-100 text-gray-600 rounded-lg">
          Recompensa Reclamada ✓
        </div>
      )}
    </Card>
  );

  if (isLoading) {
    return (
      <ScreenContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando desafios...</p>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Desafios X</h1>
          <p className="text-gray-600">Complete missões e ganhe recompensas!</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Saldo Atual</div>
          <div className="text-xl font-bold text-green-600">R$ {user.balance.toFixed(2)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'daily'
              ? 'bg-white text-violet-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Desafios Diários
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'weekly'
              ? 'bg-white text-violet-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Missões Semanais
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'daily' ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">Desafios Diários</h2>
          </div>
          {dailyChallenges.length > 0 ? (
            dailyChallenges.map(renderChallengeCard)
          ) : (
            <Card className="text-center py-8 text-gray-500">
              Nenhum desafio diário disponível no momento.
            </Card>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold">Missões Semanais</h2>
          </div>
          {weeklyMissions.length > 0 ? (
            weeklyMissions.map(renderMissionCard)
          ) : (
            <Card className="text-center py-8 text-gray-500">
              Nenhuma missão semanal disponível no momento.
            </Card>
          )}
        </div>
      )}

      {/* Botão Voltar */}
      <div className="mt-8">
        <Button 
          onClick={() => onNavigate('home')}
          className="w-full bg-gray-500 hover:bg-gray-600"
        >
          Voltar ao Início
        </Button>
      </div>
    </ScreenContainer>
  );
};
