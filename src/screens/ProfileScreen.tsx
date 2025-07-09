import React, { useState } from 'react';
import { supabase } from '../App';
import { User, Screen } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { User as UserIcon } from 'lucide-react';

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
  const [avatarIndex, setAvatarIndex] = useState(user.avatar ?? 0);
  const [showAvatars, setShowAvatars] = useState(false);
  const [idade, setIdade] = useState(user.idade || '');
  const [sexo, setSexo] = useState(user.sexo || '');
  const [endereco, setEndereco] = useState(user.endereco || '');
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const salvarPerfil = async () => {
    setSalvando(true);
    setMsg(null);
    const { error } = await supabase
      .from('users')
      .update({ idade: idade ? Number(idade) : null, sexo, endereco, avatar: avatarIndex })
      .eq('id', user.id);
    if (!error) {
      setMsg('Perfil salvo com sucesso!');
      const novoUser = { ...user, idade: idade ? Number(idade) : undefined, sexo, endereco, avatar: avatarIndex };
      if (setUser) {
        setUser(novoUser);
      }
      localStorage.setItem('user', JSON.stringify(novoUser));
    } else {
      setMsg('Erro ao salvar perfil.');
    }
    setSalvando(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-violet-400 to-fuchsia-500 p-4">
      <Card className="w-full max-w-md flex flex-col items-center py-8">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-5xl">
          {avatarOptions[avatarIndex]}
        </div>
        <Button variant="secondary" className="mb-4" onClick={() => setShowAvatars(v => !v)}>
          Alterar avatar
        </Button>
        {showAvatars && (
          <div className="flex flex-wrap gap-3 mb-4 justify-center">
            {avatarOptions.map((avatar, idx) => (
              <button
                key={idx}
                className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition ${avatarIndex === idx ? 'border-violet-500 ring-2 ring-violet-300' : 'border-gray-300'} bg-white hover:border-violet-400`}
                onClick={() => { setAvatarIndex(idx); setShowAvatars(false); }}
                aria-label={`Selecionar avatar ${idx+1}`}
              >
                {avatar}
              </button>
            ))}
          </div>
        )}
        <div className="w-full max-w-xs flex flex-col gap-2 mb-4">
          <label className="text-sm font-semibold text-gray-700">Nome</label>
          <input type="text" value={user.username} disabled className="bg-gray-100 rounded px-3 py-2 mb-1" />
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <input type="email" value={user.email} disabled className="bg-gray-100 rounded px-3 py-2 mb-1" />
          <label className="text-sm font-semibold text-gray-700">Idade</label>
          <input type="number" value={idade} onChange={e => setIdade(e.target.value)} className="bg-white rounded px-3 py-2 mb-1 border" />
          <label className="text-sm font-semibold text-gray-700">Sexo</label>
          <select value={sexo} onChange={e => setSexo(e.target.value)} className="bg-white rounded px-3 py-2 mb-1 border">
            <option value="">Selecione</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
          </select>
          <label className="text-sm font-semibold text-gray-700">Endereço</label>
          <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} className="bg-white rounded px-3 py-2 mb-1 border" />
        </div>
        <div className="text-lg font-semibold text-green-600 mb-4">Saldo: R$ {user.balance.toFixed(2)}</div>
        <Button onClick={salvarPerfil} variant="success" className="mb-2" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </Button>
        {msg && <div className={`mb-2 text-sm ${msg.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{msg}</div>}
        <Button onClick={() => onNavigate('home')}>Voltar</Button>
      </Card>
    </div>
  );
}; 