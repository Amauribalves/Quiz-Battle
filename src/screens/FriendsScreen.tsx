import React, { useState, useEffect } from 'react';
import { supabase } from '../App';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { User, Screen } from '../types';

interface FriendsScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
}

interface Amigo {
  id: string;
  username: string;
  email: string;
}

export const FriendsScreen: React.FC<FriendsScreenProps> = ({ user, onNavigate }) => {
  const [amigos, setAmigos] = useState<Amigo[]>([]);
  const [emailNovo, setEmailNovo] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    buscarAmigos();
    // eslint-disable-next-line
  }, []);

  async function buscarAmigos() {
    setCarregando(true);
    setMsg(null);
    const { data, error } = await supabase
      .from('amigos')
      .select('id, amigo_id, users:amigo_id (username, email)')
      .eq('user_id', user.id);
    if (!error && data) {
      setAmigos(data.map((a: any) => ({
        id: a.amigo_id,
        username: a.users?.username || '',
        email: a.users?.email || '',
      })));
    } else {
      setMsg('Erro ao buscar amigos.');
    }
    setCarregando(false);
  }

  async function adicionarAmigo() {
    setMsg(null);
    if (!emailNovo) return;
    // Buscar usuário pelo email
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('email', emailNovo)
      .single();
    if (error || !users) {
      setMsg('Usuário não encontrado.');
      return;
    }
    // Salvar amizade
    const { error: errInsert } = await supabase
      .from('amigos')
      .insert({ user_id: user.id, amigo_id: users.id });
    if (!errInsert) {
      setMsg('Amigo adicionado!');
      setEmailNovo('');
      buscarAmigos();
    } else {
      setMsg('Erro ao adicionar amigo.');
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-violet-400 to-fuchsia-500 p-4">
      <Card className="w-full max-w-md flex flex-col items-center py-8">
        <h2 className="text-2xl font-bold mb-4">Meus Amigos</h2>
        <div className="w-full mb-4">
          <input
            type="email"
            placeholder="Email do amigo"
            value={emailNovo}
            onChange={e => setEmailNovo(e.target.value)}
            className="w-full rounded px-3 py-2 border mb-2"
          />
          <Button onClick={adicionarAmigo} variant="success" className="w-full mb-2">Adicionar/Convidar</Button>
        </div>
        {msg && <div className={`mb-2 text-sm ${msg.includes('adicionado') ? 'text-green-600' : 'text-red-600'}`}>{msg}</div>}
        <div className="w-full">
          {carregando ? <div>Carregando...</div> : amigos.length === 0 ? <div>Nenhum amigo ainda.</div> : (
            <ul className="divide-y">
              {amigos.map(a => (
                <li key={a.id} className="py-2 flex flex-col">
                  <span className="font-semibold">{a.username}</span>
                  <span className="text-xs text-gray-500">{a.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button onClick={() => onNavigate('home')} className="mt-4">Voltar</Button>
      </Card>
    </div>
  );
}; 