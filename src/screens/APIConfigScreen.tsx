import React, { useState, useEffect } from 'react';
import { Settings, ArrowLeft, CheckCircle, XCircle, Key, BarChart3 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { APISourceSelector } from '../components/APISourceSelector';
import { APIStatusDashboard } from '../components/APIStatusDashboard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Screen } from '../types';
import enhancedQuestionService from '../services/enhancedQuestionService';

interface APIConfigScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const APIConfigScreen: React.FC<APIConfigScreenProps> = ({ onNavigate }) => {
  const [selectedSource, setSelectedSource] = useState<'local' | 'trivia' | 'quiz-api' | 'custom' | 'jservice' | 'trivia-api'>('local');
  const [apiKey, setApiKey] = useState('');
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    [key: string]: 'success' | 'error' | 'untested'
  }>({
    trivia: 'untested',
    'trivia-api': 'untested',
    jservice: 'untested',
    'quiz-api': 'untested',
    custom: 'untested'
  });

  const testConnection = async (source: 'trivia' | 'quiz-api' | 'custom' | 'jservice' | 'trivia-api') => {
    setTestingConnection(true);
    
    try {
      const isConnected = await enhancedQuestionService.testAPIConnection(source);
      setConnectionStatus(prev => ({
        ...prev,
        [source]: isConnected ? 'success' : 'error'
      }));
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        [source]: 'error'
      }));
    } finally {
      setTestingConnection(false);
    }
  };

  const testAllConnections = async () => {
    setTestingConnection(true);
    const sources: ('trivia' | 'trivia-api' | 'jservice' | 'quiz-api' | 'custom')[] = 
      ['trivia', 'trivia-api', 'jservice', 'quiz-api', 'custom'];
    
    for (const source of sources) {
      if (source === 'quiz-api' && !apiKey) continue;
      if (source === 'custom' && !customApiUrl) continue;
      
      try {
        const isConnected = await enhancedQuestionService.testAPIConnection(source);
        setConnectionStatus(prev => ({
          ...prev,
          [source]: isConnected ? 'success' : 'error'
        }));
      } catch (error) {
        setConnectionStatus(prev => ({
          ...prev,
          [source]: 'error'
        }));
      }
    }
    
    setTestingConnection(false);
  };

  const saveConfiguration = () => {
    const config = {
      selectedSource,
      apiKey: selectedSource === 'quiz-api' ? apiKey : '',
      customApiUrl: selectedSource === 'custom' ? customApiUrl : ''
    };
    
    localStorage.setItem('quiz-api-config', JSON.stringify(config));
    onNavigate('home');
  };

  useEffect(() => {
    const savedConfig = localStorage.getItem('quiz-api-config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setSelectedSource(config.selectedSource || 'local');
      setApiKey(config.apiKey || '');
      setCustomApiUrl(config.customApiUrl || '');
    }
  }, []);

  const getStatusIcon = (status: 'success' | 'error' | 'untested') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <Logo size="md" />
      
      <div className="flex gap-2 mb-6">
        <Button
          variant={!showDashboard ? 'primary' : 'secondary'}
          onClick={() => setShowDashboard(false)}
          fullWidth={false}
          icon={Settings}
        >
          Configuração
        </Button>
        <Button
          variant={showDashboard ? 'primary' : 'secondary'}
          onClick={() => setShowDashboard(true)}
          fullWidth={false}
          icon={BarChart3}
        >
          Dashboard
        </Button>
      </div>

      {showDashboard ? (
        <APIStatusDashboard className="mb-6" />
      ) : (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">Configuração da API</h2>
          </div>
          
          <APISourceSelector
            selectedSource={selectedSource}
            onSourceChange={setSelectedSource}
            className="mb-6"
          />

          {selectedSource === 'quiz-api' && (
            <div className="space-y-4 mb-6">
              <h4 className="font-semibold text-gray-800">Configuração Quiz API</h4>
              <Input
                type="text"
                placeholder="Sua API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                icon={Key}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => testConnection('quiz-api')}
                  disabled={!apiKey || testingConnection}
                  fullWidth={false}
                >
                  {testingConnection ? <LoadingSpinner size="sm" /> : 'Testar Conexão'}
                </Button>
                {getStatusIcon(connectionStatus['quiz-api'])}
              </div>
              <p className="text-sm text-gray-600">
                Obtenha sua API key gratuita em{' '}
                <a 
                  href="https://quizapi.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  quizapi.io
                </a>
              </p>
            </div>
          )}

          {selectedSource === 'custom' && (
            <div className="space-y-4 mb-6">
              <h4 className="font-semibold text-gray-800">API Customizada</h4>
              <Input
                type="url"
                placeholder="URL da sua API (ex: https://api.exemplo.com)"
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => testConnection('custom')}
                  disabled={!customApiUrl || testingConnection}
                  fullWidth={false}
                >
                  {testingConnection ? <LoadingSpinner size="sm" /> : 'Testar Conexão'}
                </Button>
                {getStatusIcon(connectionStatus.custom)}
              </div>
            </div>
          )}

          {['trivia', 'trivia-api', 'jservice'].includes(selectedSource) && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="secondary"
                  onClick={() => testConnection(selectedSource as any)}
                  disabled={testingConnection}
                  fullWidth={false}
                >
                  {testingConnection ? <LoadingSpinner size="sm" /> : `Testar ${selectedSource}`}
                </Button>
                {getStatusIcon(connectionStatus[selectedSource])}
              </div>
              <p className="text-sm text-gray-600">
                {selectedSource === 'trivia' && 'Open Trivia Database é uma API gratuita com milhares de perguntas.'}
                {selectedSource === 'trivia-api' && 'The Trivia API é uma API moderna e rápida com perguntas de qualidade.'}
                {selectedSource === 'jservice' && 'JService fornece perguntas do famoso programa Jeopardy!'}
              </p>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <Button
              variant="secondary"
              onClick={testAllConnections}
              disabled={testingConnection}
              fullWidth={false}
            >
              {testingConnection ? <LoadingSpinner size="sm" /> : 'Testar Todas'}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        <Button variant="success" onClick={saveConfiguration}>
          Salvar Configuração
        </Button>
        <Button variant="secondary" onClick={() => onNavigate('home')} icon={ArrowLeft}>
          Voltar
        </Button>
      </div>
    </div>
  );
};