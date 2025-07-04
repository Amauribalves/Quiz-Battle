import React, { useState } from 'react';
import { Building2, Hash, User, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen, User as UserType } from '../types';
import { Select } from '../components/Select';

interface WithdrawScreenProps {
  user: UserType;
  onNavigate: (screen: Screen) => void;
  onWithdraw: (withdrawData: {
    amount: number;
    method: 'pix' | 'bank';
    pixKey?: string;
    pixKeyType?: 'cpf' | 'email' | 'telefone' | 'aleatoria';
    bankAccount?: string;
    bankAgency?: string;
    bankName?: string;
  }) => void;
}

export const WithdrawScreen: React.FC<WithdrawScreenProps> = ({ user, onNavigate, onWithdraw }) => {
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankAgency, setBankAgency] = useState('');
  const [bankName, setBankName] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'pix' | 'bank'>('pix');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'email' | 'telefone' | 'aleatoria'>('cpf');

  const withdrawableAmount = user.balance * 0.85; // 85% after 15% fee
  const fee = user.balance * 0.15; // 15% fee

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    if (!isValidAmount) return;
    if (withdrawMethod === 'pix') {
      if (!pixKey || !pixKeyType) return;
      onWithdraw({
        amount: withdrawAmount / 0.85,
        method: 'pix',
        pixKey,
        pixKeyType
      });
    } else {
      if (!bankAccount || !bankAgency || !bankName) return;
      onWithdraw({
        amount: withdrawAmount / 0.85,
        method: 'bank',
        bankAccount,
        bankAgency,
        bankName
      });
    }
  };

  const currentAmount = parseFloat(amount) || 0;
  const isValidAmount = currentAmount >= 10 && currentAmount <= withdrawableAmount;

  return (
    <div className="p-8">
      <Logo size="md" />
      
      {/* Fee information */}
      <Card className="mb-6 bg-orange-50 border-l-4 border-orange-500">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
          <div>
            <h3 className="font-semibold text-orange-800 mb-2">Informações sobre Saque</h3>
            <div className="space-y-1 text-sm text-orange-700">
              <p>• Taxa de saque: 15% do valor total</p>
              <p>• Saldo disponível: R$ {user.balance.toFixed(2)}</p>
              <p>• Valor máximo para saque: R$ {withdrawableAmount.toFixed(2)}</p>
              <p>• Taxa estimada: R$ {fee.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="mb-4">
        <Select
          value={withdrawMethod}
          onChange={e => setWithdrawMethod(e.target.value as 'pix' | 'bank')}
        >
          <option value="pix">Pix</option>
          <option value="bank">Conta Bancária</option>
        </Select>
      </div>
      <div className="space-y-4 mb-6">
        <Input
          type="number"
          placeholder="Valor para receber (R$)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={10}
          max={withdrawableAmount}
          step={0.01}
          className={!isValidAmount && amount ? 'border-red-300 focus:border-red-500' : ''}
        />
        {amount && !isValidAmount && (
          <p className="text-red-500 text-sm text-center">
            {currentAmount < 10 
              ? 'Valor mínimo para saque: R$ 10,00' 
              : `Valor máximo disponível: R$ ${withdrawableAmount.toFixed(2)}`
            }
          </p>
        )}
        {amount && isValidAmount && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Resumo do Saque</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div className="flex justify-between">
                <span>Valor a receber:</span>
                <span className="font-medium">R$ {currentAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa (15%):</span>
                <span className="font-medium">R$ {(currentAmount * 0.15 / 0.85).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-2">
                <span className="font-semibold">Total debitado:</span>
                <span className="font-bold">R$ {(currentAmount / 0.85).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
        {withdrawMethod === 'pix' && (
          <>
            <Select
              value={pixKeyType}
              onChange={e => setPixKeyType(e.target.value as 'cpf' | 'email' | 'telefone' | 'aleatoria')}
            >
              <option value="cpf">CPF</option>
              <option value="email">E-mail</option>
              <option value="telefone">Telefone</option>
              <option value="aleatoria">Chave Aleatória</option>
            </Select>
            <Input
              type="text"
              placeholder="Chave Pix"
              value={pixKey}
              onChange={e => setPixKey(e.target.value)}
              icon={Hash}
            />
          </>
        )}
        {withdrawMethod === 'bank' && (
          <>
            <Input
              type="text"
              placeholder="Conta Bancária"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              icon={Hash}
            />
            <Input
              type="text"
              placeholder="Agência"
              value={bankAgency}
              onChange={(e) => setBankAgency(e.target.value)}
              icon={Building2}
            />
            <Input
              type="text"
              placeholder="Banco"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              icon={User}
            />
          </>
        )}
      </div>

      <div className="space-y-3">
        <Button 
          variant="success" 
          onClick={handleWithdraw} 
          icon={CheckCircle}
          disabled={
            !isValidAmount ||
            (withdrawMethod === 'pix' && (!pixKey || !pixKeyType)) ||
            (withdrawMethod === 'bank' && (!bankAccount || !bankAgency || !bankName))
          }
        >
          Confirmar Saque
        </Button>
        <Button variant="secondary" onClick={() => onNavigate('home')} icon={ArrowLeft}>
          Voltar
        </Button>
      </div>
    </div>
  );
};