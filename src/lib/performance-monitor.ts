import * as Sentry from '@sentry/nextjs';

export interface PerformanceData {
  timestamp: Date;
  page: string;
  metrics: {
    loadTime?: number;
    domContentLoaded?: number;
    firstPaint?: number;
    largestContentfulPaint?: number;
    firstInputDelay?: number;
    cumulativeLayoutShift?: number;
    memoryUsage?: number;
    networkLatency?: number;
  };
  userAgent?: string;
  connectionType?: string;
}

export interface ApiPerformanceData {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  error?: string;
}

class PerformanceMonitor {
  private performanceData: PerformanceData[] = [];
  private apiPerformanceData: ApiPerformanceData[] = [];
  private isMonitoring = false;

  public startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    if (typeof window !== 'undefined') {
      this.monitorPagePerformance();
      this.monitorMemoryUsage();
      this.monitorNetworkPerformance();
    }
    
    console.log('Performance monitoring started');
  }

  public stopMonitoring() {
    this.isMonitoring = false;
    console.log('Performance monitoring stopped');
  }

  private monitorPagePerformance() {
    if (typeof window === 'undefined') return;

    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const performanceData: PerformanceData = {
          timestamp: new Date(),
          page: window.location.pathname,
          metrics: {
            loadTime: navigation.loadEventEnd - navigation.fetchStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            firstPaint: navigation.responseEnd - navigation.fetchStart,
          },
          userAgent: navigator.userAgent,
          connectionType: (navigator as any).connection?.effectiveType,
        };

        this.recordPerformanceData(performanceData);
      }
    });

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const currentPage = window.location.pathname;
        
        if (entry.entryType === 'largest-contentful-paint') {
          this.updatePerformanceData(currentPage, 'largestContentfulPaint', entry.startTime);
        } else if (entry.entryType === 'first-input') {
          const delay = (entry as any).processingStart - entry.startTime;
          this.updatePerformanceData(currentPage, 'firstInputDelay', delay);
        } else if (entry.entryType === 'layout-shift') {
          this.updatePerformanceData(currentPage, 'cumulativeLayoutShift', (entry as any).value);
        }
      }
    });

    observer.observe({ 
      entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] 
    });
  }

  private monitorMemoryUsage() {
    if (typeof window === 'undefined') return;

    // Monitor memory usage if available
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const currentPage = window.location.pathname;
        
        this.updatePerformanceData(currentPage, 'memoryUsage', memory.usedJSHeapSize);
      }, 30000); // Check every 30 seconds
    }
  }

  private monitorNetworkPerformance() {
    if (typeof window === 'undefined') return;

    // Monitor network performance
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', () => {
        const currentPage = window.location.pathname;
        this.updatePerformanceData(currentPage, 'networkLatency', connection.rtt);
      });
    }
  }

  private recordPerformanceData(data: PerformanceData) {
    this.performanceData.push(data);
    
    // Send to Sentry
    Sentry.addBreadcrumb({
      message: 'Performance data recorded',
      data: {
        page: data.page,
        loadTime: data.metrics.loadTime,
        domContentLoaded: data.metrics.domContentLoaded,
        firstPaint: data.metrics.firstPaint,
      },
      category: 'performance',
      level: 'info',
    });

    // Send to analytics service
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('performance_metric', {
        page: data.page,
        metrics: data.metrics,
      });
    }
  }

  private updatePerformanceData(page: string, metric: string, value: number) {
    const existingData = this.performanceData.find(data => 
      data.page === page && 
      Math.abs(data.timestamp.getTime() - Date.now()) < 5000 // Within 5 seconds
    );

    if (existingData) {
      (existingData.metrics as any)[metric] = value;
    } else {
      const newData: PerformanceData = {
        timestamp: new Date(),
        page,
        metrics: {
          [metric]: value,
        },
        userAgent: navigator.userAgent,
        connectionType: (navigator as any).connection?.effectiveType,
      };
      this.performanceData.push(newData);
    }
  }

  public recordApiPerformance(data: ApiPerformanceData) {
    this.apiPerformanceData.push(data);
    
    // Send to Sentry
    Sentry.addBreadcrumb({
      message: `API Performance: ${data.method} ${data.endpoint}`,
      data: {
        duration: data.duration,
        statusCode: data.statusCode,
        error: data.error,
      },
      category: 'api',
      level: data.statusCode >= 400 ? 'error' : 'info',
    });

    // Track slow API calls
    if (data.duration > 1000) { // Slower than 1 second
      Sentry.addBreadcrumb({
        message: `Slow API call: ${data.method} ${data.endpoint}`,
        data: {
          duration: data.duration,
          statusCode: data.statusCode,
        },
        category: 'performance',
        level: 'warning',
      });
    }
  }

  public getPerformanceData(): PerformanceData[] {
    return [...this.performanceData];
  }

  public getApiPerformanceData(): ApiPerformanceData[] {
    return [...this.apiPerformanceData];
  }

  public getAverageLoadTime(): number {
    const loadTimes = this.performanceData
      .map(data => data.metrics.loadTime)
      .filter(time => time !== undefined) as number[];
    
    if (loadTimes.length === 0) return 0;
    
    return loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
  }

  public getSlowestPages(limit = 5): Array<{ page: string; loadTime: number }> {
    return this.performanceData
      .map(data => ({
        page: data.page,
        loadTime: data.metrics.loadTime || 0,
      }))
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, limit);
  }

  public getApiPerformanceSummary(): {
    totalCalls: number;
    averageDuration: number;
    errorRate: number;
    slowestEndpoints: Array<{ endpoint: string; averageDuration: number }>;
  } {
    const totalCalls = this.apiPerformanceData.length;
    const averageDuration = totalCalls > 0 
      ? this.apiPerformanceData.reduce((sum, data) => sum + data.duration, 0) / totalCalls
      : 0;
    
    const errorRate = totalCalls > 0
      ? this.apiPerformanceData.filter(data => data.statusCode >= 400).length / totalCalls
      : 0;

    // Group by endpoint and calculate average duration
    const endpointGroups = this.apiPerformanceData.reduce((groups, data) => {
      if (!groups[data.endpoint]) {
        groups[data.endpoint] = [];
      }
      groups[data.endpoint].push(data.duration);
      return groups;
    }, {} as Record<string, number[]>);

    const slowestEndpoints = Object.entries(endpointGroups)
      .map(([endpoint, durations]) => ({
        endpoint,
        averageDuration: durations.reduce((sum, duration) => sum + duration, 0) / durations.length,
      }))
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 5);

    return {
      totalCalls,
      averageDuration,
      errorRate,
      slowestEndpoints,
    };
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for use in components
export default performanceMonitor;
