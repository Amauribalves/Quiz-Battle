import React, { useState, useEffect } from 'react';
import { User, Screen } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { User as UserIcon, Calendar, MapPin, Phone, Globe, Settings, Activity, Trophy, Clock, Target } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

const avatarOptions = [
  <UserIcon size={56} className="text-gray-500" key="default" />, // padrão
  <span key="cat" role="img" aria-label="Gato" className="text-5xl">🐱</span>,
  <span key="dog" role="img" aria-label="Cachorro" className="text-5xl">🐶</span>,
  <span key="alien" role="img" aria-label="Alien" className="text-5xl">👽</span>,
  <span key="robot" role="img" aria-label="Robô" className="text-5xl">🤖</span>,
  <span key="ninja" role="img" aria-label="Ninja" className="text-5xl">🥷</span>,
];

interface ProfileScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  setUser?: (user: User) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onNavigate, setUser }) => {
  const [showAvatars, setShowAvatars] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  
  // Usar o hook personalizado
  const {
    profile,
    stats,
    activities,
    isLoadingProfile,
    isLoadingStats,
    isLoadingActivities,
    isUpdating,
    updateProfile,
    profileError,
    statsError,
    activitiesError,
    clearErrors
  } = useProfile(user.id);

  // Estados locais para formulário
  const [formData, setFormData] = useState({
    username: user.username,
    idade: user.idade || '',
    sexo: user.sexo || '',
    endereco: user.endereco || '',
    avatar: user.avatar ?? 0,
    bio: (profile as any)?.bio || '',
    telefone: (profile as any)?.telefone || '',
    data_nascimento: (profile as any)?.data_nascimento || '',
    pais: (profile as any)?.pais || '',
    cidade: (profile as any)?.cidade || '',
    estado: (profile as any)?.estado || '',
    cep: (profile as any)?.cep || ''
  });

  const [msg, setMsg] = useState<string | null>(null);

  // Atualizar formData quando o perfil for carregado
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        username: profile.username,
        idade: profile.idade || '',
        sexo: profile.sexo || '',
        endereco: profile.endereco || '',
        avatar: profile.avatar ?? 0,
        bio: (profile as any)?.bio || '',
        telefone: (profile as any)?.telefone || '',
        data_nascimento: (profile as any)?.data_nascimento || '',
        pais: (profile as any)?.pais || '',
        cidade: (profile as any)?.cidade || '',
        estado: (profile as any)?.estado || '',
        cep: (profile as any)?.cep || ''
      }));
    }
  }, [profile]);

  // Limpar mensagens quando limpar erros
  useEffect(() => {
    if (profileError || statsError || activitiesError) {
      setMsg(null);
    }
  }, [profileError, statsError, activitiesError]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const salvarPerfil = async () => {
    try {
      clearErrors();
      setMsg(null);

      const result = await updateProfile({
        username: formData.username,
        idade: formData.idade ? Number(formData.idade) : null,
        sexo: formData.sexo || null,
        endereco: formData.endereco || null,
        avatar: formData.avatar,
        bio: formData.bio || null,
        telefone: formData.telefone || null,
        data_nascimento: formData.data_nascimento || null,
        pais: formData.pais || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        cep: formData.cep || null
      });

      if (result.success) {
        setMsg('Perfil salvo com sucesso!');
        // Atualizar o usuário no App.tsx se a função setUser estiver disponível
        if (setUser && profile) {
          setUser(profile);
        }
        // Atualizar localStorage
        localStorage.setItem('user', JSON.stringify(profile));
      } else {
        setMsg('Erro ao salvar perfil: ' + result.message);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setMsg('Erro inesperado ao salvar perfil');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-violet-400 to-fuchsia-500 p-4">
        <Card className="w-full max-w-md flex flex-col items-center py-8">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-violet-400 to-fuchsia-500 p-4">
      <Card className="w-full max-w-4xl flex flex-col items-center py-8">
        {/* Header do Perfil */}
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-5xl">
          {avatarOptions[formData.avatar]}
        </div>
        
        <Button variant="secondary" className="mb-4" onClick={() => setShowAvatars(v => !v)}>
          Alterar avatar
        </Button>
        
        {showAvatars && (
          <div className="flex flex-wrap gap-3 mb-4 justify-center">
            {avatarOptions.map((avatar, idx) => (
              <button
                key={idx}
                className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition ${
                  formData.avatar === idx ? 'border-violet-500 ring-2 ring-violet-300' : 'border-gray-300'
                } bg-white hover:border-violet-400`}
                onClick={() => { handleInputChange('avatar', idx); setShowAvatars(false); }}
                aria-label={`Selecionar avatar ${idx+1}`}
              >
                {avatar}
              </button>
            ))}
          </div>
        )}

        {/* Formulário Principal */}
        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Coluna Esquerda */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Nome de Usuário</label>
            <input
              type="text"
              value={formData.username}
              onChange={e => handleInputChange('username', e.target.value)}
              className="bg-white rounded px-3 py-2 border w-full"
              maxLength={30}
            />

            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="bg-gray-100 rounded px-3 py-2 w-full"
            />

            <label className="text-sm font-semibold text-gray-700">Idade</label>
            <input
              type="number"
              value={formData.idade}
              onChange={e => handleInputChange('idade', e.target.value)}
              className="bg-white rounded px-3 py-2 border w-full"
              min="13"
              max="120"
            />

            <label className="text-sm font-semibold text-gray-700">Sexo</label>
            <select
              value={formData.sexo}
              onChange={e => handleInputChange('sexo', e.target.value)}
              className="bg-white rounded px-3 py-2 border w-full"
            >
              <option value="">Selecione</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>

            <label className="text-sm font-semibold text-gray-700">Data de Nascimento</label>
            <input
              type="date"
              value={formData.data_nascimento}
              onChange={e => handleInputChange('data_nascimento', e.target.value)}
              className="bg-white rounded px-3 py-2 border w-full"
            />
          </div>

          {/* Coluna Direita */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Telefone</label>
            <input
              type="tel"
              value={formData.telefone}
              onChange={e => handleInputChange('telefone', e.target.value)}
              className="bg-white rounded px-3 py-2 border w-full"
              placeholder="(11) 99999-9999"
            />

            <label className="text-sm font-semibold text-gray-700">País</label>
            <input
              type="text"
              value={formData.pais}
              onChange={e => handleInputChange('pais', e.target.value)}
              className="bg-white rounded px-3 py-2 border w-full"
            />

            <label className="text-sm font-semibold text-gray-700">Estado</label>
            <input
              type="text"
              value={formData.estado}
              onChange={e => handleInputChange('estado', e.target.value)}
              className="bg-white rounded px-3 py-2 border w-full"
            />

            <label className="text-sm font-semibold text-gray-700">Cidade</label>
            <input
              type="text"
              value={formData.cidade}
              onChange={e => handleInputChange('cidade', e.target.value)}
              className="bg-white rounded px-3 py-2 border w-full"
            />

            <label className="text-sm font-semibold text-gray-700">CEP</label>
            <input
              type="text"
              value={formData.cep}
              onChange={e => handleInputChange('cep', e.target.value)}
              className="bg-white rounded px-3 py-2 border w-full"
              placeholder="00000-000"
            />
          </div>
        </div>

        {/* Campos Avançados */}
        <div className="w-full max-w-2xl mb-6">
          <Button
            variant="secondary"
            onClick={() => setShowAdvancedFields(v => !v)}
            className="mb-3"
          >
            {showAdvancedFields ? 'Ocultar' : 'Mostrar'} Campos Avançados
          </Button>
          
          {showAdvancedFields && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Endereço Completo</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={e => handleInputChange('endereco', e.target.value)}
                className="bg-white rounded px-3 py-2 border w-full"
                placeholder="Rua, número, complemento..."
              />

              <label className="text-sm font-semibold text-gray-700">Biografia</label>
              <textarea
                value={formData.bio}
                onChange={e => handleInputChange('bio', e.target.value)}
                className="bg-white rounded px-3 py-2 border w-full h-20 resize-none"
                placeholder="Conte um pouco sobre você..."
                maxLength={500}
              />
            </div>
          )}
        </div>

        {/* Estatísticas do Perfil */}
        {stats && (
          <div className="w-full max-w-2xl mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Estatísticas do Jogador
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalGames}</div>
                <div className="text-sm text-blue-800">Jogos</div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{stats.winRate}%</div>
                <div className="text-sm text-green-800">Taxa de Vitória</div>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.averageScore}</div>
                <div className="text-sm text-purple-800">Pontuação Média</div>
              </div>
              
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.bestScore}</div>
                <div className="text-sm text-orange-800">Melhor Pontuação</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Categoria Favorita:</span>
                <span className="font-semibold">{stats.favoriteCategory}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tempo Total de Jogo:</span>
                <span className="font-semibold">{formatTime(stats.totalPlayTime)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Membro desde:</span>
                <span className="font-semibold">{formatDate(stats.memberSince)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Atividades Recentes */}
        {activities.length > 0 && (
          <div className="w-full max-w-2xl mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Atividades Recentes
            </h3>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{activity.description}</span>
                    <span className="text-gray-500 text-xs">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saldo e Botões */}
        <div className="text-lg font-semibold text-green-600 mb-4">
          Saldo: R$ {user.balance.toFixed(2)}
        </div>

        <Button
          onClick={salvarPerfil}
          variant="success"
          className="mb-2"
          disabled={isUpdating}
        >
          {isUpdating ? 'Salvando...' : 'Salvar Perfil'}
        </Button>

        {msg && (
          <div className={`mb-2 text-sm ${
            msg.includes('sucesso') ? 'text-green-600' : 'text-red-600'
          }`}>
            {msg}
          </div>
        )}

        {/* Mensagens de Erro */}
        {(profileError || statsError || activitiesError) && (
          <div className="w-full max-w-2xl mb-4">
            {profileError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                <p className="text-red-700 text-sm">{profileError}</p>
              </div>
            )}
            {statsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                <p className="text-red-700 text-sm">{statsError}</p>
              </div>
            )}
            {activitiesError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                <p className="text-red-700 text-sm">{activitiesError}</p>
              </div>
            )}
          </div>
        )}

        <Button onClick={() => onNavigate('home')}>Voltar</Button>
      </Card>
    </div>
  );
}; 