import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Screen } from '../types';

interface RegisterScreenProps {
  onNavigate: (screen: Screen) => void;
  onRegister: (username: string, email: string, password: string) => Promise<void>;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigate, onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onRegister(username, email, password);
    setLoading(false);
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