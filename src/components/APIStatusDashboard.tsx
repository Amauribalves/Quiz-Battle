import React, { useState, useEffect } from 'react';
import { Activity, Database, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import enhancedQuestionService from '../services/enhancedQuestionService';

interface APIStatusDashboardProps {
  className?: string;
}

export const APIStatusDashboard: React.FC<APIStatusDashboardProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const apiStats = enhancedQuestionService.getAPIStats();
      const cache = enhancedQuestionService.getCacheStats();
      
      setStats(apiStats);
      setCacheStats(cache);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    enhancedQuestionService.clearCache();
    loadStats();
  };

  const clearMetrics = () => {
    enhancedQuestionService.clearMetrics();
    loadStats();
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-800">Status das APIs</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {stats?.totalRequests || 0}
            </div>
            <div className="text-sm text-gray-600">Total de Requisições</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              (stats?.successRate || 0) >= 90 ? 'text-green-600' : 
              (stats?.successRate || 0) >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {stats?.successRate?.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-gray-600">Taxa de Sucesso</div>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-lg font-semibold text-gray-700">
            {stats?.averageResponseTime?.toFixed(0) || 0}ms
          </div>
          <div className="text-sm text-gray-600">Tempo Médio de Resposta</div>
        </div>

        {stats?.lastRequest && (
          <div className="text-center text-sm text-gray-500">
            Última requisição: {new Date(stats.lastRequest).toLocaleString('pt-BR')}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-800">Cache</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {cacheStats?.size || 0}
            </div>
            <div className="text-sm text-gray-600">Entradas em Cache</div>
          </div>
          
          <div className="text-center">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-1" />
            <div className="text-sm text-gray-600">Cache Ativo</div>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            variant="secondary" 
            onClick={clearCache}
            fullWidth={false}
            className="text-sm"
          >
            Limpar Cache
          </Button>
          <Button 
            variant="secondary" 
            onClick={clearMetrics}
            fullWidth={false}
            className="text-sm"
          >
            Limpar Métricas
          </Button>
        </div>
      </Card>

      {cacheStats?.keys && cacheStats.keys.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800">Itens em Cache</h3>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {cacheStats.keys.map((key: string, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 truncate">{key}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};