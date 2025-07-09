import React, { useEffect, useState } from 'react';
import { supabase } from '../App';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { User, Screen } from '../types';

interface HistoricoScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
}

interface Jogo {
  id: string;
  data: string;
  resultado: string;
  pontuacao: number;
  modo: string;
  adversario?: string;
  aposta?: number;
}

export const HistoricoScreen: React.FC<HistoricoScreenProps> = ({ user, onNavigate }) => {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    buscarHistorico();
    // eslint-disable-next-line
  }, []);

  async function buscarHistorico() {
    setCarregando(true);
    setMsg(null);
    const { data, error } = await supabase
      .from('historico_jogos')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false })
      .limit(10);
    if (!error && data) {
      setJogos(data);
    } else {
      setMsg('Erro ao buscar histórico.');
    }
    setCarregando(false);
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-violet-400 to-fuchsia-500 p-4">
      <Card className="w-full max-w-md flex flex-col items-center py-8">
        <h2 className="text-2xl font-bold mb-4">Histórico de Jogos</h2>
        {carregando ? <div>Carregando...</div> : (
          <div className="w-full">
            {jogos.length === 0 ? <div>Nenhum jogo encontrado.</div> : (
              <ul className="divide-y">
                {jogos.map(jogo => (
                  <li key={jogo.id} className="py-2 flex flex-col text-sm">
                    <span className="font-semibold">{new Date(jogo.data).toLocaleString('pt-BR')}</span>
                    <span>Resultado: <b className={jogo.resultado === 'vitória' ? 'text-green-600' : 'text-red-600'}>{jogo.resultado}</b></span>
                    <span>Pontuação: {jogo.pontuacao}</span>
                    <span>Modo: {jogo.modo}</span>
                    {jogo.adversario && <span>Adversário: {jogo.adversario}</span>}
                    {jogo.aposta !== undefined && <span>Aposta: R$ {jogo.aposta.toFixed(2)}</span>}
                  </li>
                ))}
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