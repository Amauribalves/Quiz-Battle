import React, { useEffect, useState } from 'react';
import { supabase } from '../App';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { User, Screen } from '../types';

interface HistoricoScreenProps {
  user: User;
  onNavigate: (screen: Screen) => void;
}

interface Transacao {
  id: string;
  tipo: 'depósito' | 'saque';
  valor: number;
  data: string;
  status?: string;
}

export const HistoricoScreen: React.FC<HistoricoScreenProps> = ({ user, onNavigate }) => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    buscarTransacoes();
    // eslint-disable-next-line
  }, []);

  async function buscarTransacoes() {
    setCarregando(true);
    setMsg(null);
    // Buscar depósitos
    const { data: depositos, error: erroDep } = await supabase
      .from('depositos')
      .select('id, valor, criado_em')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(10);
    // Buscar saques
    const { data: saques, error: erroSaq } = await supabase
      .from('retire_se')
      .select('id, quantia, criado_em, status')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(10);
    if (erroDep || erroSaq) {
      setMsg('Erro ao buscar histórico.');
      setCarregando(false);
      return;
    }
    // Unir e ordenar por data
    const transacoes: Transacao[] = [
      ...(depositos || []).map((d: any) => ({
        id: d.id,
        tipo: 'depósito' as const,
        valor: d.valor,
        data: d.criado_em,
      })),
      ...(saques || []).map((s: any) => ({
        id: s.id,
        tipo: 'saque' as const,
        valor: s.quantia,
        data: s.criado_em,
        status: s.status,
      })),
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 10);
    setTransacoes(transacoes);
    setCarregando(false);
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-violet-400 to-fuchsia-500 p-4">
      <Card className="w-full max-w-md flex flex-col items-center py-8">
        <h2 className="text-2xl font-bold mb-4">Histórico Financeiro</h2>
        {carregando ? <div>Carregando...</div> : (
          <div className="w-full">
            {transacoes.length === 0 ? <div>Nenhuma movimentação encontrada.</div> : (
              <ul className="divide-y">
                {transacoes.map(t => (
                  <li key={t.id} className="py-2 flex flex-col text-sm">
                    <span className={`font-semibold ${t.tipo === 'depósito' ? 'text-green-600' : 'text-red-600'}`}>{t.tipo.toUpperCase()}</span>
                    <span>Valor: R$ {t.valor.toFixed(2)}</span>
                    <span>Data: {new Date(t.data).toLocaleString('pt-BR')}</span>
                    {t.tipo === 'saque' && t.status && <span>Status: {t.status}</span>}
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