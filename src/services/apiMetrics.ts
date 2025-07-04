interface APIMetric {
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: number;
  success: boolean;
  errorMessage?: string;
}

class APIMetrics {
  private metrics: APIMetric[] = [];
  private readonly MAX_METRICS = 100;

  recordMetric(metric: Omit<APIMetric, 'timestamp'>): void {
    const fullMetric: APIMetric = {
      ...metric,
      timestamp: Date.now()
    };

    this.metrics.unshift(fullMetric);
    
    // Manter apenas os últimos registros
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(0, this.MAX_METRICS);
    }
  }

  getMetrics(limit?: number): APIMetric[] {
    return limit ? this.metrics.slice(0, limit) : this.metrics;
  }

  getSuccessRate(endpoint?: string): number {
    const relevantMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const successCount = relevantMetrics.filter(m => m.success).length;
    return (successCount / relevantMetrics.length) * 100;
  }

  getAverageResponseTime(endpoint?: string): number {
    const relevantMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return totalTime / relevantMetrics.length;
  }

  getStats() {
    return {
      totalRequests: this.metrics.length,
      successRate: this.getSuccessRate(),
      averageResponseTime: this.getAverageResponseTime(),
      lastRequest: this.metrics[0]?.timestamp || null
    };
  }

  clear(): void {
    this.metrics = [];
  }
}

export const apiMetrics = new APIMetrics();