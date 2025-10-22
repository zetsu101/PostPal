'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Server, 
  Database, 
  Users, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Memory,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Settings,
  Trash2,
  RotateCcw
} from 'lucide-react';

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
  utilization: number;
}

interface SystemHealth {
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
}

interface MonitoringData {
  systemHealth: SystemHealth;
  cacheStats: {
    contentScoring: CacheStats;
    engagementPrediction: CacheStats;
    trendAnalysis: CacheStats;
    audienceAnalysis: CacheStats;
    optimalTiming: CacheStats;
  };
  rateLimitStats: {
    activeLimits: number;
    limits: Array<{
      endpoint: string;
      identifier: string;
      count: number;
      resetTime: number;
      burstCount: number;
    }>;
  };
  realtimeStats: {
    totalClients: number;
    totalUsers: number;
    queuedMessages: number;
  };
  memoryStats: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  uptime: {
    process: number;
    timestamp: string;
  };
  timestamp: string;
}

export default function SystemMonitoringDashboard() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const user = await response.json();
          setIsAdmin(user.role === 'admin' || user.email === 'admin@postpal.com');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, []);

  // Fetch monitoring data
  const fetchMonitoringData = useCallback(async () => {
    if (!isAdmin) {
      setError('Admin access required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/monitoring/ai-services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch monitoring data');
      }

      const data = await response.json();
      setMonitoringData(data.data);
      setLastRefresh(new Date());

    } catch (error) {
      console.error('Monitoring fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch monitoring data');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !isAdmin) return;

    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, isAdmin, fetchMonitoringData]);

  // Clear cache
  const clearCache = async (cacheType?: string) => {
    if (!isAdmin) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const url = cacheType 
        ? `/api/monitoring/ai-services?type=${cacheType}`
        : '/api/monitoring/ai-services';

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchMonitoringData(); // Refresh data
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  };

  // Reset rate limits
  const resetRateLimits = async (identifier?: string) => {
    if (!isAdmin) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/monitoring/ai-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: identifier ? 'reset_user_limits' : 'reset_endpoint_limits',
          identifier: identifier || undefined,
          endpoint: identifier ? undefined : 'insights'
        })
      });

      if (response.ok) {
        await fetchMonitoringData(); // Refresh data
      }
    } catch (error) {
      console.error('Rate limit reset error:', error);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required to access system monitoring</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                System Monitoring Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time monitoring of AI services, caching, and system performance
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Auto-refresh</label>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <button
                onClick={fetchMonitoringData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {lastRefresh && (
            <div className="text-sm text-gray-500 mt-2">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">Monitoring Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {monitoringData ? (
          <div className="space-y-6">
            {/* System Health Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Server className="w-5 h-5 mr-2 text-blue-500" />
                  System Health
                </h2>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(monitoringData.systemHealth.status)}
                  <span className={`font-semibold ${getStatusColor(monitoringData.systemHealth.status)}`}>
                    {monitoringData.systemHealth.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {monitoringData.systemHealth.score}
                  </div>
                  <div className="text-sm text-gray-600">Health Score</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        monitoringData.systemHealth.score >= 90 ? 'bg-green-500' : 
                        monitoringData.systemHealth.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${monitoringData.systemHealth.score}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {monitoringData.uptime.process}
                  </div>
                  <div className="text-sm text-gray-600">Uptime (seconds)</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatUptime(monitoringData.uptime.process)}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {monitoringData.realtimeStats.totalClients}
                  </div>
                  <div className="text-sm text-gray-600">Active Connections</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {monitoringData.realtimeStats.totalUsers} users
                  </div>
                </div>
              </div>

              {/* Issues and Recommendations */}
              {(monitoringData.systemHealth.issues.length > 0 || monitoringData.systemHealth.recommendations.length > 0) && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {monitoringData.systemHealth.issues.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2">Issues</h4>
                      <ul className="space-y-1">
                        {monitoringData.systemHealth.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-red-600 flex items-start">
                            <AlertTriangle className="w-3 h-3 mr-1 mt-0.5" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {monitoringData.systemHealth.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-blue-700 mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {monitoringData.systemHealth.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-600 flex items-start">
                            <CheckCircle className="w-3 h-3 mr-1 mt-0.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Cache Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-green-500" />
                  Cache Performance
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => clearCache()}
                    className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(monitoringData.cacheStats).map(([service, stats]) => (
                  <div key={service} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 capitalize">
                        {service.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <button
                        onClick={() => clearCache(service)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Hit Rate</span>
                        <span className="font-medium">{stats.hitRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${
                            stats.hitRate >= 80 ? 'bg-green-500' : 
                            stats.hitRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${stats.hitRate}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Utilization</span>
                        <span className="font-medium">{stats.utilization}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${
                            stats.utilization >= 90 ? 'bg-red-500' : 
                            stats.utilization >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${stats.utilization}%` }}
                        />
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {stats.size}/{stats.maxSize} entries
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Memory Usage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Memory className="w-5 h-5 mr-2 text-purple-500" />
                Memory Usage
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {monitoringData.memoryStats.rss}MB
                  </div>
                  <div className="text-sm text-gray-600">RSS</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {monitoringData.memoryStats.heapTotal}MB
                  </div>
                  <div className="text-sm text-gray-600">Heap Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {monitoringData.memoryStats.heapUsed}MB
                  </div>
                  <div className="text-sm text-gray-600">Heap Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {monitoringData.memoryStats.external}MB
                  </div>
                  <div className="text-sm text-gray-600">External</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {monitoringData.memoryStats.arrayBuffers}MB
                  </div>
                  <div className="text-sm text-gray-600">Array Buffers</div>
                </div>
              </div>
            </motion.div>

            {/* Rate Limiting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-orange-500" />
                  Rate Limiting
                </h2>
                <button
                  onClick={() => resetRateLimits()}
                  className="flex items-center px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset All
                </button>
              </div>

              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {monitoringData.rateLimitStats.activeLimits}
                </div>
                <div className="text-sm text-gray-600">Active Rate Limits</div>
              </div>

              {monitoringData.rateLimitStats.limits.length > 0 && (
                <div className="space-y-2">
                  {monitoringData.rateLimitStats.limits.slice(0, 5).map((limit, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {limit.endpoint} - {limit.identifier}
                        </div>
                        <div className="text-xs text-gray-600">
                          Count: {limit.count} | Burst: {limit.burstCount}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Resets: {new Date(limit.resetTime).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {loading ? 'Loading Monitoring Data...' : 'No Data Available'}
            </h3>
            <p className="text-gray-600">
              {loading ? 'Fetching system metrics...' : 'Click refresh to load monitoring data'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
