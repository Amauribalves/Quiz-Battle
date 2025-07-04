import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, Gamepad2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Screen } from '../types';
import { supabase } from '../App';

interface LoginScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogin: (email: string, password: string) => void;
  onDemoLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, onDemoLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      alert('Erro ao fazer login: ' + error.message);
    } else {
      alert('Login realizado com sucesso!');
      onNavigate('home');
    }
  }

  return (
    <div className="p-8">
      <Logo size="md" />
      <form className="space-y-4" onSubmit={handleLogin}>
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
        <Button type="submit" icon={LogIn} disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
        <Button variant="secondary" onClick={() => onNavigate('register')} icon={UserPlus} type="button">
          Criar Conta
        </Button>
        <Button variant="secondary" onClick={onDemoLogin} icon={Gamepad2} type="button">
          Entrar como Demo
        </Button>
      </form>
    </div>
  );
};