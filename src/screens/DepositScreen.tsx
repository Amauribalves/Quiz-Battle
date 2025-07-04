import React, { useState } from 'react';
import { CreditCard, User, Calendar, Shield, ArrowLeft, CheckCircle, Smartphone, QrCode, Copy, Clock } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Screen } from '../types';

interface DepositScreenProps {
  onNavigate: (screen: Screen) => void;
  onDeposit: (amount: number) => void;
}

export const DepositScreen: React.FC<DepositScreenProps> = ({ onNavigate, onDeposit }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [pixGenerated, setPixGenerated] = useState(false);
  const [pixCode, setPixCode] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
  };

  const validateAmount = (amount: number): boolean => {
    const minAmount = paymentMethod === 'pix' ? 5 : 10;
    return amount >= minAmount && amount <= 1000 && amount % 5 === 0;
  };

  const generatePixCode = () => {
    // Simular geração de código PIX
    const randomCode = `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2, 15)}@quizbattle.com52040000530398654${amount}5802BR5913Quiz Battle6009SAO PAULO62070503***6304`;
    setPixCode(randomCode);
    setPixGenerated(true);
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    // Aqui você poderia adicionar uma notificação de "copiado"
  };

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    
    if (!validateAmount(depositAmount)) return;
    
    if (paymentMethod === 'pix') {
      // Para PIX, simular confirmação após alguns segundos
      setTimeout(() => {
        onDeposit(depositAmount);
      }, 2000);
    } else {
      if (cardNumber && cardName && cardExpiry && cardCvv) {
        onDeposit(depositAmount);
      }
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const currentAmount = parseFloat(amount) || 0;
  const isValidAmount = validateAmount(currentAmount);
  const minAmount = paymentMethod === 'pix' ? 5 : 10;

  // Updated suggested amounts
  const suggestedAmounts = [10, 15, 20, 25, 50, 100, 250, 500, 1000];

  return (
    <div className="p-8">
      <Logo size="md" />
      
      {/* Seletor de método de pagamento */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => {
            setPaymentMethod('pix');
            setPixGenerated(false);
            setPixCode('');
          }}
          className={`p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            paymentMethod === 'pix'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
              : 'bg-white shadow-md hover:shadow-lg text-gray-700'
          }`}
        >
          <Smartphone className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'pix' ? 'text-white' : 'text-green-600'}`} />
          <div className="text-sm font-medium">PIX</div>
          <div className="text-xs opacity-80">Instantâneo</div>
        </button>
        
        <button
          onClick={() => setPaymentMethod('card')}
          className={`p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            paymentMethod === 'card'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
              : 'bg-white shadow-md hover:shadow-lg text-gray-700'
          }`}
        >
          <CreditCard className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'card' ? 'text-white' : 'text-blue-600'}`} />
          <div className="text-sm font-medium">Cartão</div>
          <div className="text-xs opacity-80">Crédito/Débito</div>
        </button>
      </div>

      {/* Campo de valor */}
      <div className="mb-6">
        <Input
          type="number"
          placeholder="Valor (R$)"
          value={amount}
          onChange={handleAmountChange}
          min={minAmount}
          max={1000}
          step={5}
          className={!isValidAmount && amount ? 'border-red-300 focus:border-red-500' : ''}
        />
        
        {amount && !isValidAmount && (
          <p className="text-red-500 text-sm mt-2 text-center">
            {currentAmount < minAmount 
              ? `Valor mínimo: R$ ${minAmount},00` 
              : currentAmount > 1000 
              ? 'Valor máximo: R$ 1.000,00' 
              : 'Valor deve ser múltiplo de R$ 5,00'
            }
          </p>
        )}
        
        <p className="text-gray-600 text-sm mt-2 text-center">
          {paymentMethod === 'pix' ? 'Mín: R$ 5,00' : 'Mín: R$ 10,00'} • Máx: R$ 1.000,00 • Múltiplos de R$ 5,00
        </p>

        {/* Sugestões de valores */}
        <div className="bg-gray-50 p-4 rounded-xl mt-4">
          <p className="text-sm font-medium text-gray-700 mb-3 text-center">Valores Sugeridos:</p>
          <div className="grid grid-cols-3 gap-2">
            {suggestedAmounts
              .filter(amt => amt >= minAmount)
              .map(suggestedAmount => (
              <button
                key={suggestedAmount}
                onClick={() => setAmount(suggestedAmount.toString())}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  amount === suggestedAmount.toString()
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                R$ {suggestedAmount}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Formulário PIX */}
      {paymentMethod === 'pix' && (
        <Card className="mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Smartphone className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Pagamento via PIX</h3>
            </div>
            
            {!pixGenerated ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-xl">
                  <QrCode className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">
                    Clique em "Gerar PIX" para criar o código de pagamento
                  </p>
                </div>
                
                <Button
                  variant="success"
                  onClick={generatePixCode}
                  disabled={!isValidAmount}
                  icon={QrCode}
                >
                  Gerar PIX
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="w-32 h-32 bg-white border-2 border-green-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Escaneie o QR Code ou copie o código PIX
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-600 mb-2">Código PIX:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-white p-2 rounded border text-gray-800 break-all">
                      {pixCode.substring(0, 50)}...
                    </code>
                    <Button
                      variant="secondary"
                      onClick={copyPixCode}
                      fullWidth={false}
                      icon={Copy}
                      className="text-xs px-3 py-2"
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-xl">
                  <Clock className="w-5 h-5" />
                  <p className="text-sm">
                    Aguardando confirmação do pagamento...
                  </p>
                </div>
                
                <Button
                  variant="success"
                  onClick={handleDeposit}
                  icon={CheckCircle}
                >
                  Confirmar Pagamento PIX
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Formulário Cartão */}
      {paymentMethod === 'card' && (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Dados do Cartão</h3>
          </div>
          
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Número do Cartão"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              icon={CreditCard}
              maxLength={19}
            />
            <Input
              type="text"
              placeholder="Nome no Cartão"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              icon={User}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="MM/AA"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                icon={Calendar}
                maxLength={5}
              />
              <Input
                type="text"
                placeholder="CVV"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                icon={Shield}
                maxLength={3}
              />
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {paymentMethod === 'card' && (
          <Button 
            variant="success" 
            onClick={handleDeposit} 
            icon={CheckCircle}
            disabled={!isValidAmount || !cardNumber || !cardName || !cardExpiry || !cardCvv}
          >
            Confirmar Depósito
          </Button>
        )}
        
        <Button variant="secondary" onClick={() => onNavigate('home')} icon={ArrowLeft}>
          Voltar
        </Button>
      </div>
    </div>
  );
};