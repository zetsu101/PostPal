"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Clock, 
  Database, 
  Globe, 
  Monitor, 
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react';
import { performanceMonitor } from '@/lib/performance-monitor';
import { analytics } from '@/lib/analytics';

interface MonitoringData {
  performance: {
    averageLoadTime: number;
    slowestPages: Array<{ page: string; loadTime: number }>;
    apiPerformance: {
      totalCalls: number;
      averageDuration: number;
      errorRate: number;
      slowestEndpoints: Array<{ endpoint: string; averageDuration: number }>;
    };
  };
  analytics: {
    sessionId: string;
    pageViews: number;
    events: number;
    userId?: string;
  };
  system: {
    uptime: number;
    memoryUsage: number;
    errorCount: number;
  };
}

const MonitoringDashboard: React.FC = () => {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadMonitoringData = () => {
    try {
      const performanceData = performanceMonitor.getPerformanceData();
      const apiPerformanceData = performanceMonitor.getApiPerformanceData();
      const session = analytics.getSession();
      const performanceMetrics = analytics.getPerformanceMetrics();

      const monitoringData: MonitoringData = {
        performance: {
          averageLoadTime: performanceMonitor.getAverageLoadTime(),
          slowestPages: performanceMonitor.getSlowestPages(),
          apiPerformance: performanceMonitor.getApiPerformanceSummary(),
        },
        analytics: {
          sessionId: session.sessionId,
          pageViews: session.pageViews,
          events: session.events.length,
          userId: session.userId,
        },
        system: {
          uptime: Date.now() - session.startTime.getTime(),
          memoryUsage: performanceMetrics.find(m => m.name === 'memoryUsage')?.value || 0,
          errorCount: session.events.filter(e => e.event === 'error').length,
        },
      };

      setData(monitoringData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoringData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadMonitoringData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load monitoring data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600 mt-1">
            Real-time performance and analytics dashboard
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={loadMonitoringData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Load Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(data.performance.averageLoadTime)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">API Calls</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.performance.apiPerformance.totalCalls.toLocaleString()}
              </p>
            </div>
            <Database className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {(data.performance.apiPerformance.errorRate * 100).toFixed(1)}%
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Page Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.analytics.pageViews}
              </p>
            </div>
            <Globe className="w-8 h-8 text-purple-600" />
          </div>
        </motion.div>
      </div>

      {/* Performance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slowest Pages */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
            Slowest Pages
          </h3>
          <div className="space-y-3">
            {data.performance.slowestPages.map((page, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate">{page.page}</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDuration(page.loadTime)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* API Performance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            API Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Duration</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDuration(data.performance.apiPerformance.averageDuration)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Calls</span>
              <span className="text-sm font-medium text-gray-900">
                {data.performance.apiPerformance.totalCalls}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {(data.performance.apiPerformance.errorRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Monitor className="w-5 h-5 mr-2 text-gray-600" />
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Session ID</p>
            <p className="text-sm text-gray-900 font-mono">
              {data.analytics.sessionId}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Uptime</p>
            <p className="text-sm text-gray-900">
              {formatUptime(data.system.uptime)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Memory Usage</p>
            <p className="text-sm text-gray-900">
              {formatBytes(data.system.memoryUsage)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MonitoringDashboard;
