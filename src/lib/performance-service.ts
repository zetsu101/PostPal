import { DatabaseService } from './supabase';
import type { PerformanceMetric } from './supabase';

export interface PerformanceData {
  metricName: string;
  metricValue: number;
  metricUnit: string;
  category: 'speed' | 'size' | 'efficiency' | 'user-experience';
  platform?: 'web' | 'mobile' | 'api';
  deviceInfo?: any;
  browserInfo?: any;
}

export interface BundleAnalysisData {
  totalSizeBytes: number;
  jsSizeBytes: number;
  cssSizeBytes: number;
  imageSizeBytes: number;
  unusedCodeBytes?: number;
  duplicatesBytes?: number;
  recommendations?: any[];
}

class PerformanceService {
  // Store performance metrics in the database
  async storeMetric(
    userId: string,
    performanceData: PerformanceData,
    organizationId?: string
  ): Promise<PerformanceMetric> {
    try {
      return await DatabaseService.createPerformanceMetric({
        user_id: userId,
        organization_id: organizationId,
        metric_name: performanceData.metricName,
        metric_value: performanceData.metricValue,
        metric_unit: performanceData.metricUnit,
        category: performanceData.category,
        platform: performanceData.platform,
        device_info: performanceData.deviceInfo,
        browser_info: performanceData.browserInfo,
      });
    } catch (error) {
      console.error('Error storing performance metric:', error);
      throw error;
    }
  }

  // Get performance metrics for a user
  async getMetrics(
    userId: string,
    category?: string,
    limit = 100
  ): Promise<PerformanceMetric[]> {
    try {
      return await DatabaseService.getPerformanceMetrics(userId, category, limit);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  }

  // Store Core Web Vitals
  async storeWebVitals(
    userId: string,
    vitals: {
      lcp?: number;
      fid?: number;
      cls?: number;
      fcp?: number;
      ttfb?: number;
    },
    deviceInfo?: any,
    browserInfo?: any
  ): Promise<PerformanceMetric[]> {
    const metrics: PerformanceMetric[] = [];

    try {
      const vitalMetrics = [
        { name: 'lcp', value: vitals.lcp, unit: 'ms', category: 'speed' as const },
        { name: 'fid', value: vitals.fid, unit: 'ms', category: 'user-experience' as const },
        { name: 'cls', value: vitals.cls, unit: 'score', category: 'user-experience' as const },
        { name: 'fcp', value: vitals.fcp, unit: 'ms', category: 'speed' as const },
        { name: 'ttfb', value: vitals.ttfb, unit: 'ms', category: 'speed' as const },
      ];

      for (const metric of vitalMetrics) {
        if (metric.value !== undefined) {
          const result = await this.storeMetric(userId, {
            metricName: metric.name,
            metricValue: metric.value,
            metricUnit: metric.unit,
            category: metric.category,
            platform: 'web',
            deviceInfo,
            browserInfo,
          });
          metrics.push(result);
        }
      }

      return metrics;
    } catch (error) {
      console.error('Error storing web vitals:', error);
      throw error;
    }
  }

  // Get performance summary for user
  async getPerformanceSummary(userId: string, timeframe = '7d'): Promise<{
    avgLCP: number;
    avgFID: number;
    avgCLS: number;
    avgFCP: number;
    totalMetrics: number;
    lastUpdated: string;
  }> {
    try {
      const metrics = await this.getMetrics(userId, 'speed', 1000);
      
      const speedMetrics = metrics.filter(m => 
        m.platform === 'web' && 
        ['lcp', 'fcp', 'ttfb'].includes(m.metric_name)
      );
      
      const uxMetrics = metrics.filter(m => 
        m.platform === 'web' && 
        ['fid', 'cls'].includes(m.metric_name)
      );

      const lcpMetrics = speedMetrics.filter(m => m.metric_name === 'lcp');
      const fidMetrics = uxMetrics.filter(m => m.metric_name === 'fid');
      const clsMetrics = uxMetrics.filter(m => m.metric_name === 'cls');
      const fcpMetrics = speedMetrics.filter(m => m.metric_name === 'fcp');

      return {
        avgLCP: lcpMetrics.length > 0 ? lcpMetrics.reduce((sum, m) => sum + m.metric_value, 0) / lcpMetrics.length : 0,
        avgFID: fidMetrics.length > 0 ? fidMetrics.reduce((sum, m) => sum + m.metric_value, 0) / fidMetrics.length : 0,
        avgCLS: clsMetrics.length > 0 ? clsMetrics.reduce((sum, m) => sum + m.metric_value, 0) / clsMetrics.length : 0,
        avgFCP: fcpMetrics.length > 0 ? fcpMetrics.reduce((sum, m) => sum + m.metric_value, 0) / fcpMetrics.length : 0,
        totalMetrics: metrics.length,
        lastUpdated: metrics.length > 0 ? metrics[0].recorded_at : new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting performance summary:', error);
      throw error;
    }
  }
}

export const performanceService = new PerformanceService();
export default performanceService;