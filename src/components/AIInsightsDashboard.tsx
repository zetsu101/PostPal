"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  BarChart3, 
  Lightbulb, 
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Heart,
  MessageCircle,
  Share,
  RefreshCw
} from 'lucide-react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { aiAnalyticsService } from '@/lib/ai-analytics';

interface AIInsightsDashboardProps {
  userId?: string;
  timeRange?: '7d' | '30d' | '90d';
}

interface PerformanceMetric {
  label: string;
  value: number;
  change: number;
  icon: React.ReactElement;
  color: string;
}

interface ContentInsight {
  type: 'performance' | 'trend' | 'optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action?: string;
  data?: any;
}

export default function AIInsightsDashboard({ 
  userId = 'current-user',
  timeRange = '30d'
}: AIInsightsDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [insights, setInsights] = useState<ContentInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<ContentInsight | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadInsights();
  }, [userId, timeRange]);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - in real app, fetch from API
      const mockMetrics: PerformanceMetric[] = [
        {
          label: 'Avg Engagement Rate',
          value: 8.4,
          change: 12.5,
          icon: <Heart className="w-5 h-5" />,
          color: 'text-red-600',
        },
        {
          label: 'Content Performance Score',
          value: 76,
          change: 8.2,
          icon: <Target className="w-5 h-5" />,
          color: 'text-blue-600',
        },
        {
          label: 'Optimal Posting Rate',
          value: 85,
          change: -2.1,
          icon: <Zap className="w-5 h-5" />,
          color: 'text-green-600',
        },
        {
          label: 'AI Optimization Impact',
          value: 23,
          change: 15.8,
          icon: <Brain className="w-5 h-5" />,
          color: 'text-purple-600',
        },
      ];

      const mockInsights: ContentInsight[] = [
        {
          type: 'performance',
          title: 'Video Content Outperforming Images',
          description: 'Your video posts are generating 34% more engagement than static images. Consider increasing video content ratio.',
          impact: 'high',
          action: 'Increase video content by 25%',
          data: { videoEngagement: 12.3, imageEngagement: 9.2 },
        },
        {
          type: 'trend',
          title: 'AI Content Trend Opportunity',
          description: 'Posts about AI and automation are trending 45% higher than usual. Your audience shows strong interest in tech topics.',
          impact: 'high',
          action: 'Create more AI-focused content',
          data: { trendGrowth: 45, audienceInterest: 87 },
        },
        {
          type: 'optimization',
          title: 'Optimal Posting Time Identified',
          description: 'Posts published between 2-4 PM on weekdays show 28% higher engagement. Your audience is most active during this window.',
          impact: 'medium',
          action: 'Schedule more posts for 2-4 PM',
          data: { timeSlot: '2-4 PM', engagementBoost: 28 },
        },
        {
          type: 'performance',
          title: 'Hashtag Strategy Needs Optimization',
          description: 'Your current hashtags have 67% competition. Consider using more niche hashtags for better reach.',
          impact: 'medium',
          action: 'Update hashtag strategy',
          data: { competition: 67, recommendedNiche: 45 },
        },
      ];

      setMetrics(mockMetrics);
      setInsights(mockInsights);
    } catch (error) {
      console.error('Failed to load insights:', error);
      addToast({
        title: 'Failed to Load Insights',
        message: 'Unable to fetch AI insights. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: ContentInsight['type']) => {
    switch (type) {
      case 'performance':
        return <BarChart3 className="w-5 h-5 text-blue-500" />;
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'optimization':
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getInsightColor = (impact: ContentInsight['impact']) => {
    switch (impact) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <ArrowUpRight className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-500" />
    );
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Analyzing your content performance...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Insights Dashboard</h2>
              <p className="text-gray-600">Intelligent analysis of your content performance</p>
            </div>
          </div>
          
          <Button onClick={loadInsights} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${metric.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                <div className={metric.color}>
                  {metric.icon}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {getChangeIcon(metric.change)}
                <span className={`text-sm font-medium ${getChangeColor(metric.change)}`}>
                  {Math.abs(metric.change)}%
                </span>
              </div>
            </div>
            
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {metric.value}{metric.label.includes('Rate') || metric.label.includes('Score') ? '%' : ''}
            </div>
            <div className="text-sm text-gray-600">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">AI-Powered Insights</h3>
          <p className="text-gray-600 mt-1">Personalized recommendations based on your content performance</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${getInsightColor(insight.impact)}`}
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {insight.impact.toUpperCase()} IMPACT
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{insight.description}</p>
                    {insight.action && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">Action:</span>
                        <span className="text-sm text-blue-600">{insight.action}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">{selectedInsight.title}</h3>
              <button
                onClick={() => setSelectedInsight(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">{selectedInsight.description}</p>
              
              {selectedInsight.data && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Supporting Data</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedInsight.data).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="ml-2 font-medium text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedInsight.action && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Recommended Action</h4>
                  <p className="text-blue-700">{selectedInsight.action}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <Button onClick={() => setSelectedInsight(null)}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
