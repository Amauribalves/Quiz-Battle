import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Screen } from '../types';
import { supabase } from '../App';

interface RegisterScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    setLoading(false);
    if (error) {
      alert('Erro ao cadastrar: ' + error.message);
    } else {
      // Inserir na tabela users
      const user = data.user;
      if (user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              email: user.email,
              username: username,
              balance: 0 // Valor inicial para evitar erro de not-null
            }
          ]);
        if (insertError) {
          alert('Usuário criado, mas erro ao salvar na tabela users: ' + insertError.message);
        }
      }
      alert('Cadastro realizado! Verifique seu e-mail.');
      onNavigate('login');
    }
  }

  return (
    <div className="p-8">
      <Logo size="md" />
      <form className="space-y-4" onSubmit={handleRegister}>
        <Input
          icon={User}
          placeholder="Nome de usuário"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <Input
          icon={Mail}
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          icon={Lock}
          placeholder="Senha"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button type="submit" icon={UserPlus} disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
        <Button variant="secondary" onClick={() => onNavigate('login')} icon={ArrowLeft} type="button">
          Voltar
        </Button>
      </form>
    </div>
  );
};