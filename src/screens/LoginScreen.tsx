import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, Gamepad2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Screen } from '../types';

// Ícone do Google
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface LoginScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogin: (email: string, password: string) => void;
  onGoogleLogin?: () => void;
  userCount?: number;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, onLogin, onGoogleLogin, userCount = 0 }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onLogin(email, password);
    setLoading(false);
  }

  return (
    <div className="p-8">
      <Logo size="md" />
      
      {/* Contador de usuários */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{userCount}</div>
          <div className="text-sm text-gray-600">usuários cadastrados</div>
          {userCount < 100 && (
            <div className="mt-2 text-xs text-green-600 font-medium">
              ⭐ Ainda há {100 - userCount} bônus de R$ 5,00 disponíveis!
            </div>
          )}
          {userCount >= 100 && (
            <div className="mt-2 text-xs text-gray-500">
              Os primeiros 100 usuários já receberam o bônus
            </div>
          )}
        </div>
      </div>
      
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
        
        {/* Separador */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>
        
        {/* Botão Google */}
        <Button 
          variant="secondary" 
          onClick={onGoogleLogin} 
          type="button"
          className="border-2 border-gray-300 hover:border-gray-400"
        >
          <GoogleIcon />
          Entrar com Google
        </Button>
        
        <Button variant="secondary" onClick={() => onNavigate('register')} icon={UserPlus} type="button">
          Criar Conta
        </Button>
      </form>
    </div>
  );
};