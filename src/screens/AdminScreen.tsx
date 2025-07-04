import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../components/ScreenContainer';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase } from '../App';
import { ArrowLeft } from 'lucide-react';

const ADMIN_CODE = 'batelha2024'; // Troque por um código seguro depois

const AdminScreen: React.FC = () => {
  const [code, setCode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [withdraws, setWithdraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [processedWithdraws, setProcessedWithdraws] = useState<any[]>([]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Código incorreto.');
    }
  };

  useEffect(() => {
    if (authenticated) {
      setLoading(true);
      Promise.all([
        supabase
          .from('withdraws')
          .select('*')
          .eq('status', 'pendente')
          .order('requested_at', { ascending: true }),
        supabase
          .from('withdraws')
          .select('*')
          .in('status', ['aprovado', 'rejeitado'])
          .order('processed_at', { ascending: false }),
        supabase
          .from('users')
          .select('id, username, email')
      ]).then(([withdrawsRes, processedRes, usersRes]) => {
        if (withdrawsRes.error) {
          setFetchError('Erro ao buscar saques: ' + withdrawsRes.error.message);
          setWithdraws([]);
        } else {
          setWithdraws(withdrawsRes.data || []);
          setFetchError('');
        }
        if (processedRes.error) {
          setProcessedWithdraws([]);
        } else {
          setProcessedWithdraws(processedRes.data || []);
        }
        if (usersRes.error) {
          setUsers([]);
        } else {
          setUsers(usersRes.data || []);
        }
        setLoading(false);
      });
    }
  }, [authenticated]);

  const handleUpdateStatus = async (id: number, status: 'aprovado' | 'rejeitado') => {
    setLoading(true);
    setFetchError('');
    setSuccessMsg('');
    const { error } = await supabase
      .from('withdraws')
      .update({ status, processed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      setFetchError('Erro ao atualizar saque: ' + error.message);
    } else {
      setWithdraws(prev => prev.filter(w => w.id !== id));
      setSuccessMsg(`Saque ${status === 'aprovado' ? 'aprovado' : 'rejeitado'} com sucesso!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
    setLoading(false);
  };

  if (!authenticated) {
    return (
      <ScreenContainer>
        <div className="max-w-sm mx-auto mt-16 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-center">Painel Admin</h2>
          <form onSubmit={handleLogin}>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admin-code">Código de Admin</label>
            <Input
              id="admin-code"
              type="password"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <Button type="submit" className="w-full mt-4">Entrar</Button>
          </form>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-center flex-1">Painel Admin</h2>
          <Button
            variant="secondary"
            fullWidth={false}
            className="ml-4"
            icon={ArrowLeft}
            onClick={() => setAuthenticated(false)}
          >Sair</Button>
        </div>
        {loading && <div className="text-center text-gray-500">Carregando saques...</div>}
        {fetchError && <div className="text-center text-red-500 mb-4">{fetchError}</div>}
        {successMsg && <div className="text-center text-green-600 mb-4 font-semibold">{successMsg}</div>}
        {!loading && !fetchError && withdraws.length === 0 && (
          <div className="text-gray-500 text-center">Nenhum saque pendente.</div>
        )}
        {!loading && !fetchError && withdraws.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Usuário</th>
                  <th className="px-3 py-2 text-left">Valor</th>
                  <th className="px-3 py-2 text-left">Método</th>
                  <th className="px-3 py-2 text-left">Detalhes</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Data</th>
                  <th className="px-3 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {withdraws.map((w) => {
                  const user = users.find(u => u.id === w.user_id);
                  return (
                    <tr key={w.id} className="border-b">
                      <td className="px-3 py-2">{w.id}</td>
                      <td className="px-3 py-2">
                        {user ? (
                          <>
                            <div className="font-semibold">{user.username}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">{w.user_id}</span>
                        )}
                      </td>
                      <td className="px-3 py-2">R$ {Number(w.amount).toFixed(2)}</td>
                      <td className="px-3 py-2">{w.method === 'pix' ? `Pix (${w.pix_key_type})` : 'Bancário'}</td>
                      <td className="px-3 py-2">
                        {w.method === 'pix' ? (
                          <>
                            <div className="text-xs">Tipo: <span className="font-semibold">{w.pix_key_type}</span></div>
                            <div className="text-xs break-all">Chave: <span className="font-semibold">{w.pix_key}</span></div>
                          </>
                        ) : (
                          <>
                            <div className="text-xs">Banco: <span className="font-semibold">{w.bank_name}</span></div>
                            <div className="text-xs">Agência: <span className="font-semibold">{w.bank_agency}</span></div>
                            <div className="text-xs">Conta: <span className="font-semibold">{w.bank_account}</span></div>
                          </>
                        )}
                      </td>
                      <td className="px-3 py-2">{w.status}</td>
                      <td className="px-3 py-2">{w.requested_at ? new Date(w.requested_at).toLocaleString('pt-BR') : '-'}</td>
                      <td className="px-3 py-2 flex gap-2">
                        <Button
                          variant="success"
                          fullWidth={false}
                          disabled={loading}
                          onClick={() => handleUpdateStatus(w.id, 'aprovado')}
                        >Aprovar</Button>
                        <Button
                          variant="danger"
                          fullWidth={false}
                          disabled={loading}
                          onClick={() => handleUpdateStatus(w.id, 'rejeitado')}
                        >Rejeitar</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Histórico de saques processados */}
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4 text-center">Histórico de Saques Processados</h3>
        {loading && <div className="text-center text-gray-500">Carregando histórico...</div>}
        {!loading && processedWithdraws.length === 0 && (
          <div className="text-gray-500 text-center">Nenhum saque processado.</div>
        )}
        {!loading && processedWithdraws.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Usuário</th>
                  <th className="px-3 py-2 text-left">Valor</th>
                  <th className="px-3 py-2 text-left">Método</th>
                  <th className="px-3 py-2 text-left">Detalhes</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Solicitado em</th>
                  <th className="px-3 py-2 text-left">Processado em</th>
                </tr>
              </thead>
              <tbody>
                {processedWithdraws.map((w) => {
                  const user = users.find(u => u.id === w.user_id);
                  return (
                    <tr key={w.id} className="border-b">
                      <td className="px-3 py-2">{w.id}</td>
                      <td className="px-3 py-2">
                        {user ? (
                          <>
                            <div className="font-semibold">{user.username}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">{w.user_id}</span>
                        )}
                      </td>
                      <td className="px-3 py-2">R$ {Number(w.amount).toFixed(2)}</td>
                      <td className="px-3 py-2">{w.method === 'pix' ? `Pix (${w.pix_key_type})` : 'Bancário'}</td>
                      <td className="px-3 py-2">
                        {w.method === 'pix' ? (
                          <>
                            <div className="text-xs">Tipo: <span className="font-semibold">{w.pix_key_type}</span></div>
                            <div className="text-xs break-all">Chave: <span className="font-semibold">{w.pix_key}</span></div>
                          </>
                        ) : (
                          <>
                            <div className="text-xs">Banco: <span className="font-semibold">{w.bank_name}</span></div>
                            <div className="text-xs">Agência: <span className="font-semibold">{w.bank_agency}</span></div>
                            <div className="text-xs">Conta: <span className="font-semibold">{w.bank_account}</span></div>
                          </>
                        )}
                      </td>
                      <td className="px-3 py-2">{w.status}</td>
                      <td className="px-3 py-2">{w.requested_at ? new Date(w.requested_at).toLocaleString('pt-BR') : '-'}</td>
                      <td className="px-3 py-2">{w.processed_at ? new Date(w.processed_at).toLocaleString('pt-BR') : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};

export default AdminScreen; 