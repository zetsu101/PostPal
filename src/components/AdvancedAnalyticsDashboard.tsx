'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAIInsightsWebSocket } from '@/hooks/useWebSocket';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  trend: number[];
  icon: React.ReactNode;
  color: string;
  format: 'number' | 'percentage' | 'currency';
}

interface ContentPerformance {
  id: string;
  title: string;
  platform: string;
  publishedAt: Date;
  metrics: {
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
    shares: number;
    comments: number;
    likes: number;
  };
  aiScore: number;
  predictedPerformance: number;
  actualPerformance: number;
  variance: number;
}

interface AudienceInsight {
  demographic: string;
  value: number;
  change: number;
  color: string;
}

interface TrendData {
  date: string;
  impressions: number;
  engagement: number;
  reach: number;
  aiScore: number;
}

export default function AdvancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState<AnalyticsMetric[]>([]);
  const [contentPerformance, setContentPerformance] = useState<ContentPerformance[]>([]);
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsight[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  
  const { isConnected, lastMessage } = useAIInsightsWebSocket();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Initialize metrics
    setRealTimeMetrics([
      {
        id: 'impressions',
        name: 'Total Impressions',
        value: 125000,
        change: 12.5,
        changeType: 'increase',
        trend: [100000, 105000, 110000, 115000, 120000, 125000],
        icon: <Eye className="w-5 h-5" />,
        color: 'text-blue-600',
        format: 'number'
      },
      {
        id: 'engagement',
        name: 'Engagement Rate',
        value: 4.2,
        change: -2.1,
        changeType: 'decrease',
        trend: [4.5, 4.4, 4.3, 4.2, 4.2, 4.2],
        icon: <Heart className="w-5 h-5" />,
        color: 'text-red-600',
        format: 'percentage'
      },
      {
        id: 'reach',
        name: 'Unique Reach',
        value: 45000,
        change: 8.3,
        changeType: 'increase',
        trend: [40000, 41000, 42000, 43000, 44000, 45000],
        icon: <Users className="w-5 h-5" />,
        color: 'text-green-600',
        format: 'number'
      },
      {
        id: 'clicks',
        name: 'Link Clicks',
        value: 3200,
        change: 15.7,
        changeType: 'increase',
        trend: [2500, 2700, 2900, 3000, 3100, 3200],
        icon: <ArrowUpRight className="w-5 h-5" />,
        color: 'text-purple-600',
        format: 'number'
      }
    ]);

    // Initialize content performance data
    setContentPerformance([
      {
        id: '1',
        title: 'AI-Powered Social Media Tips',
        platform: 'instagram',
        publishedAt: new Date(Date.now() - 86400000),
        metrics: {
          impressions: 15000,
          reach: 12000,
          engagement: 4.8,
          clicks: 450,
          shares: 120,
          comments: 85,
          likes: 650
        },
        aiScore: 87,
        predictedPerformance: 4.5,
        actualPerformance: 4.8,
        variance: 6.7
      },
      {
        id: '2',
        title: 'Behind the Scenes: Product Launch',
        platform: 'linkedin',
        publishedAt: new Date(Date.now() - 172800000),
        metrics: {
          impressions: 8500,
          reach: 7200,
          engagement: 6.2,
          clicks: 320,
          shares: 45,
          comments: 28,
          likes: 180
        },
        aiScore: 92,
        predictedPerformance: 5.8,
        actualPerformance: 6.2,
        variance: 6.9
      },
      {
        id: '3',
        title: 'Quick Tutorial: Advanced Features',
        platform: 'twitter',
        publishedAt: new Date(Date.now() - 259200000),
        metrics: {
          impressions: 12000,
          reach: 9800,
          engagement: 3.1,
          clicks: 280,
          shares: 35,
          comments: 42,
          likes: 320
        },
        aiScore: 74,
        predictedPerformance: 3.5,
        actualPerformance: 3.1,
        variance: -11.4
      }
    ]);

    // Initialize audience insights
    setAudienceInsights([
      { demographic: '18-24', value: 25, change: 2.1, color: 'bg-blue-500' },
      { demographic: '25-34', value: 35, change: -1.2, color: 'bg-green-500' },
      { demographic: '35-44', value: 22, change: 0.8, color: 'bg-purple-500' },
      { demographic: '45-54', value: 12, change: -0.5, color: 'bg-orange-500' },
      { demographic: '55+', value: 6, change: 0.3, color: 'bg-red-500' }
    ]);

    // Initialize trend data
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push({
        date: date.toISOString().split('T')[0],
        impressions: Math.floor(Math.random() * 20000) + 10000,
        engagement: Math.random() * 2 + 3,
        reach: Math.floor(Math.random() * 15000) + 8000,
        aiScore: Math.floor(Math.random() * 20) + 70
      });
    }
    setTrendData(dates);

  }, []);

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage?.type === 'insight_update') {
      const update = lastMessage.data;
      
      if (update.type === 'analytics_update') {
        // Update metrics with real-time data
        setRealTimeMetrics(prev => prev.map(metric => {
          if (metric.id === update.data.metricId) {
            return {
              ...metric,
              value: update.data.value,
              change: update.data.change,
              changeType: update.data.changeType,
              trend: [...metric.trend.slice(1), update.data.value]
            };
          }
          return metric;
        }));
      }
      
      if (update.type === 'ai_insight') {
        setAiInsights(prev => [...prev.slice(-4), {
          id: `insight_${Date.now()}`,
          type: update.data.type,
          message: update.data.message,
          confidence: update.data.confidence,
          timestamp: Date.now()
        }]);
      }
    }
  }, [lastMessage]);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        setIsRefreshing(true);
        // Simulate data refresh
        setTimeout(() => {
          setIsRefreshing(false);
        }, 1000);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected]);

  // Format metric value
  const formatMetricValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  // Get change icon
  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'decrease':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get performance variance color
  const getVarianceColor = (variance: number) => {
    if (variance > 5) return 'text-green-600';
    if (variance < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  // Refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Advanced Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time insights powered by AI analytics
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <Activity className="w-4 h-4" />
                <span>{isConnected ? 'Live Data' : 'Offline'}</span>
              </div>
              
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isRefreshing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
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
                {formatMetricValue(metric.value, metric.format)}
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
          {/* Content Performance */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                  Content Performance
                </h2>
                <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 flex items-center">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
              
              <div className="space-y-4">
                {contentPerformance.map((content, index) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{content.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="capitalize">{content.platform}</span>
                          <span>{content.publishedAt.toLocaleDateString()}</span>
                          <div className="flex items-center space-x-1">
                            <Target className="w-4 h-4" />
                            <span>AI Score: {content.aiScore}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getVarianceColor(content.variance)}`}>
                          {content.variance > 0 ? '+' : ''}{content.variance.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">vs Prediction</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Impressions</div>
                        <div className="font-medium">{content.metrics.impressions.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Engagement</div>
                        <div className="font-medium">{content.metrics.engagement.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Clicks</div>
                        <div className="font-medium">{content.metrics.clicks}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Shares</div>
                        <div className="font-medium">{content.metrics.shares}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights & Audience */}
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-purple-500" />
                AI Insights
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Performance Optimized</p>
                      <p className="text-xs text-blue-700">Your content is performing 12% above predictions</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Engagement Drop</p>
                      <p className="text-xs text-yellow-700">Consider posting during peak hours (9-11 AM)</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Trending Topic</p>
                      <p className="text-xs text-green-700">#AIContent is gaining 25% more engagement</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audience Demographics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-green-500" />
                Audience Demographics
              </h3>
              
              <div className="space-y-3">
                {audienceInsights.map((insight, index) => (
                  <div key={insight.demographic} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${insight.color}`}></div>
                      <span className="text-sm font-medium text-gray-900">
                        {insight.demographic} years
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {insight.value}%
                      </span>
                      <div className={`flex items-center text-xs ${
                        insight.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {insight.change > 0 ? (
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 mr-1" />
                        )}
                        {Math.abs(insight.change).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
