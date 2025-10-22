'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Target,
  Brain,
  Cpu,
  Database,
  Wifi,
  WifiOff,
  Server,
  HardDrive,
  MemoryStick
} from 'lucide-react';
import { useAIInsightsWebSocket } from '@/hooks/useWebSocket';

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  trend: number[];
  unit: string;
  color: string;
  icon: React.ReactNode;
}

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
}

interface LiveEvent {
  id: string;
  type: 'content_published' | 'user_activity' | 'ai_analysis' | 'system_alert' | 'collaboration';
  title: string;
  description: string;
  timestamp: number;
  userId?: string;
  userName?: string;
  metadata?: any;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  resolved: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function RealTimeAnalyticsDashboard() {
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetric[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  
  const { isConnected: wsConnected, lastMessage } = useAIInsightsWebSocket();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  // Initialize metrics
  useEffect(() => {
    // Real-time metrics
    setRealTimeMetrics([
      {
        id: 'active_users',
        name: 'Active Users',
        value: 1247,
        previousValue: 1180,
        change: 5.7,
        changeType: 'increase',
        trend: [1000, 1050, 1100, 1150, 1180, 1247],
        unit: '',
        color: 'text-blue-600',
        icon: <Users className="w-5 h-5" />
      },
      {
        id: 'content_views',
        name: 'Content Views',
        value: 45632,
        previousValue: 42300,
        change: 7.9,
        changeType: 'increase',
        trend: [35000, 38000, 40000, 41000, 42300, 45632],
        unit: '',
        color: 'text-green-600',
        icon: <Eye className="w-5 h-5" />
      },
      {
        id: 'engagement_rate',
        name: 'Engagement Rate',
        value: 4.2,
        previousValue: 4.5,
        change: -6.7,
        changeType: 'decrease',
        trend: [4.8, 4.7, 4.6, 4.5, 4.5, 4.2],
        unit: '%',
        color: 'text-red-600',
        icon: <Heart className="w-5 h-5" />
      },
      {
        id: 'ai_analyses',
        name: 'AI Analyses',
        value: 892,
        previousValue: 756,
        change: 18.0,
        changeType: 'increase',
        trend: [500, 600, 650, 700, 756, 892],
        unit: '',
        color: 'text-purple-600',
        icon: <Brain className="w-5 h-5" />
      }
    ]);

    // System metrics
    setSystemMetrics([
      {
        id: 'cpu_usage',
        name: 'CPU Usage',
        value: 45,
        max: 100,
        unit: '%',
        color: 'text-blue-500',
        icon: <Cpu className="w-4 h-4" />
      },
      {
        id: 'memory_usage',
        name: 'Memory Usage',
        value: 68,
        max: 100,
        unit: '%',
        color: 'text-green-500',
        icon: <MemoryStick className="w-4 h-4" />
      },
      {
        id: 'disk_usage',
        name: 'Disk Usage',
        value: 32,
        max: 100,
        unit: '%',
        color: 'text-yellow-500',
        icon: <HardDrive className="w-4 h-4" />
      },
      {
        id: 'network_latency',
        name: 'Network Latency',
        value: 12,
        max: 100,
        unit: 'ms',
        color: 'text-purple-500',
        icon: <Wifi className="w-4 h-4" />
      }
    ]);

    // Mock live events
    setLiveEvents([
      {
        id: '1',
        type: 'content_published',
        title: 'New Content Published',
        description: 'AI-powered social media tips posted to Instagram',
        timestamp: Date.now() - 30000,
        userId: 'user-123',
        userName: 'Sarah Johnson'
      },
      {
        id: '2',
        type: 'ai_analysis',
        title: 'AI Analysis Complete',
        description: 'Content scoring analysis completed for 15 posts',
        timestamp: Date.now() - 60000,
        metadata: { postsAnalyzed: 15, avgScore: 87 }
      },
      {
        id: '3',
        type: 'user_activity',
        title: 'User Activity Spike',
        description: 'Unusual activity detected from user mike@postpal.com',
        timestamp: Date.now() - 90000,
        userId: 'user-456',
        userName: 'Mike Chen'
      }
    ]);

    // Mock performance alerts
    setPerformanceAlerts([
      {
        id: '1',
        type: 'warning',
        title: 'High Memory Usage',
        message: 'Memory usage has exceeded 80% threshold',
        timestamp: Date.now() - 120000,
        resolved: false,
        severity: 'medium'
      },
      {
        id: '2',
        type: 'info',
        title: 'AI Service Optimization',
        message: 'AI analysis service performance improved by 15%',
        timestamp: Date.now() - 300000,
        resolved: true,
        severity: 'low'
      }
    ]);

  }, []);

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage?.type === 'insight_update') {
      const update = lastMessage.data;
      
      if (update.type === 'analytics_update') {
        // Update real-time metrics
        setRealTimeMetrics(prev => prev.map(metric => {
          if (metric.id === update.data.metricId) {
            const newValue = update.data.value;
            const change = ((newValue - metric.previousValue) / metric.previousValue) * 100;
            
            return {
              ...metric,
              value: newValue,
              previousValue: metric.value,
              change: change,
              changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral',
              trend: [...metric.trend.slice(1), newValue]
            };
          }
          return metric;
        }));
      }
      
      if (update.type === 'system_update') {
        // Update system metrics
        setSystemMetrics(prev => prev.map(metric => {
          if (metric.id === update.data.metricId) {
            return {
              ...metric,
              value: update.data.value
            };
          }
          return metric;
        }));
      }
      
      if (update.type === 'live_event') {
        // Add new live event
        const newEvent: LiveEvent = {
          id: `event_${Date.now()}`,
          type: update.data.type,
          title: update.data.title,
          description: update.data.description,
          timestamp: update.timestamp,
          userId: update.data.userId,
          userName: update.data.userName,
          metadata: update.data.metadata
        };
        
        setLiveEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events
      }
      
      if (update.type === 'performance_alert') {
        // Add new performance alert
        const newAlert: PerformanceAlert = {
          id: `alert_${Date.now()}`,
          type: update.data.type,
          title: update.data.title,
          message: update.data.message,
          timestamp: update.timestamp,
          resolved: false,
          severity: update.data.severity || 'medium'
        };
        
        setPerformanceAlerts(prev => [newAlert, ...prev.slice(0, 19)]); // Keep last 20 alerts
      }
      
      setLastUpdate(new Date());
    }
  }, [lastMessage]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        // Simulate data refresh
        setLastUpdate(new Date());
      }, refreshInterval);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // Auto-scroll events
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveEvents]);

  // Get change icon
  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get event icon
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'content_published':
        return <Share2 className="w-4 h-4 text-blue-500" />;
      case 'user_activity':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'ai_analysis':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'system_alert':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'collaboration':
        return <Users className="w-4 h-4 text-indigo-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get alert severity color
  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  // Refresh data manually
  const refreshData = () => {
    setLastUpdate(new Date());
    // In a real implementation, this would trigger a data fetch
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Real-Time Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Live monitoring and analytics for your PostPal platform
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                wsConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {wsConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span>{wsConnected ? 'Live Data' : 'Offline'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="mr-2"
                  />
                  Auto-refresh
                </label>
                
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1000}>1s</option>
                  <option value={5000}>5s</option>
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                </select>
              </div>
              
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Real-Time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {realTimeMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${metric.color.replace('text', 'bg').replace('-600', '-100')}`}>
                  {metric.icon}
                </div>
                <div className="flex items-center space-x-1">
                  {getChangeIcon(metric.changeType)}
                  <span className={`text-sm font-medium ${
                    metric.changeType === 'increase' ? 'text-green-600' :
                    metric.changeType === 'decrease' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {Math.abs(metric.change).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value.toLocaleString()}{metric.unit}
              </h3>
              <p className="text-sm text-gray-600">{metric.name}</p>
              
              {/* Mini trend chart */}
              <div className="mt-4 h-8 flex items-end space-x-1">
                {metric.trend.map((value, i) => {
                  const maxValue = Math.max(...metric.trend);
                  const height = (value / maxValue) * 100;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${
                        metric.changeType === 'increase' ? 'bg-green-200' :
                        metric.changeType === 'decrease' ? 'bg-red-200' :
                        'bg-gray-200'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Metrics */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2 text-blue-500" />
                System Metrics
              </h3>
              
              <div className="space-y-4">
                {systemMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${metric.color.replace('text', 'bg').replace('-500', '-100')}`}>
                        {metric.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                        <p className="text-xs text-gray-500">{metric.value}{metric.unit} / {metric.max}{metric.unit}</p>
                      </div>
                    </div>
                    
                    <div className="w-16">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            metric.value > 80 ? 'bg-red-500' :
                            metric.value > 60 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${(metric.value / metric.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Events */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-500" />
                Live Events
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {liveEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getEventIcon(event.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {event.title}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                        
                        {event.userName && (
                          <p className="text-xs text-gray-500 mt-1">
                            by {event.userName}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={eventsEndRef} />
              </div>
            </div>
          </div>

          {/* Performance Alerts */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Performance Alerts
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {performanceAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.resolved ? 'bg-gray-50 border-gray-200' : getAlertSeverityColor(alert.severity)
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {alert.title}
                          </h4>
                          {alert.resolved && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {alert.message}
                        </p>
                        
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTimestamp(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              <span>•</span>
              <span>WebSocket: {wsConnected ? 'Connected' : 'Disconnected'}</span>
              <span>•</span>
              <span>Auto-refresh: {autoRefresh ? 'On' : 'Off'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-blue-600 hover:text-blue-700 flex items-center">
                <Download className="w-4 h-4 mr-1" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
