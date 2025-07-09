import React, { useEffect, useRef } from 'react';
import { supabase } from '../App';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { User, Screen } from '../types';

interface RankingUser {
  id: string;
  username: string;
  wins: number;
  avatar?: number;
}

interface RankingScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
}

export const RankingScreen: React.FC<RankingScreenProps> = ({ user, onNavigate }) => {
  const [ranking, setRanking] = React.useState<RankingUser[]>([]);
  const [carregando, setCarregando] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const userRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    buscarRanking();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Scroll até o usuário logado
    if (userRef.current) {
      userRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [ranking]);

  async function buscarRanking() {
    setCarregando(true);
    setMsg(null);
    const { data, error } = await supabase
      .from('users')
      .select('id, username, "vitórias_ganha", avatar')
      .order('vitórias_ganha', { ascending: false });
    if (!error && data) {
      setRanking(data.map((u: any) => ({
        id: u.id,
        username: u.username,
        wins: u["vitórias_ganha"],
        avatar: u.avatar
      })));
    } else {
      setMsg('Erro ao buscar ranking: ' + (error?.message || ''));
      console.error('Erro ao buscar ranking:', error);
    }
    setCarregando(false);
  }

  // Avatares iguais ao ProfileScreen
  const avatarOptions = [
    <span key="default" className="inline-block w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><svg width="24" height="24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 8-4 8-4s8 0 8 4"/></svg></span>,
    <span key="cat" role="img" aria-label="Gato" className="text-2xl">🐱</span>,
    <span key="dog" role="img" aria-label="Cachorro" className="text-2xl">🐶</span>,
    <span key="alien" role="img" aria-label="Alien" className="text-2xl">👽</span>,
    <span key="robot" role="img" aria-label="Robô" className="text-2xl">🤖</span>,
    <span key="ninja" role="img" aria-label="Ninja" className="text-2xl">🥷</span>,
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-violet-400 to-fuchsia-500 p-4">
      <Card className="w-full max-w-md flex flex-col items-center py-8">
        <h2 className="text-2xl font-bold mb-4">Classificação Geral</h2>
        {carregando ? <div>Carregando...</div> : (
          <div className="w-full max-h-96 overflow-auto">
            {ranking.length === 0 ? <div>Nenhum jogador encontrado.</div> : (
              <ul className="divide-y">
                {ranking.map((u, idx) => {
                  const isUser = u.id === user.id;
                  return (
                    <li
                      key={u.id}
                      ref={isUser ? userRef : undefined}
                      className={`flex items-center gap-3 py-2 px-2 rounded ${isUser ? 'bg-violet-100 font-bold ring-2 ring-violet-400' : ''}`}
                    >
                      <span className="w-6 text-right">{idx + 1}º</span>
                      <span className="w-10 h-10 flex items-center justify-center">{avatarOptions[u.avatar ?? 0]}</span>
                      <span className="flex-1 truncate">{u.username}</span>
                      <span className="text-indigo-700 font-semibold">{u.wins} vitórias</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
        {msg && <div className="mb-2 text-sm text-red-600">{msg}</div>}
        <Button onClick={() => onNavigate('home')} className="mt-4">Voltar</Button>
      </Card>
    </div>
  );
}; 