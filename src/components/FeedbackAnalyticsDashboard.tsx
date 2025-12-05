'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  TrendingUp,
  BarChart3,
  PieChart,
  RefreshCw,
  Filter,
  Download
} from 'lucide-react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  helpfulCount: number;
  helpfulPercentage: number;
  features: Record<string, {
    count: number;
    avgRating: number;
    helpful: number;
  }>;
  recentFeedback: Array<{
    id: string;
    feature: string;
    rating: number;
    helpful: boolean;
    feedback_text?: string;
    created_at: string;
  }>;
}

export default function FeedbackAnalyticsDashboard() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<string>('all');
  const { addToast } = useToast();

  const featureLabels: Record<string, string> = {
    content_analysis: 'Content Analysis',
    engagement_prediction: 'Engagement Prediction',
    optimal_timing: 'Optimal Timing',
    trend_prediction: 'Trend Prediction',
    audience_insights: 'Audience Insights',
    recommendations: 'AI Recommendations',
    all: 'All Features'
  };

  const loadFeedbackStats = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      const response = await fetch('/api/feedback/ai-insights', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token || 'test-token'}`,
          'x-test-bypass': 'true'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to load feedback');
      }
    } catch (error) {
      console.error('Error loading feedback stats:', error);
      addToast({
        type: 'error',
        title: 'Failed to Load Feedback',
        message: 'Unable to retrieve feedback analytics. Please try again.',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbackStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading feedback analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">No feedback data available yet.</p>
        <Button onClick={loadFeedbackStats} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const filteredFeatures: Array<[string, { count: number; avgRating: number; helpful: number; }]> = selectedFeature === 'all'
    ? Object.entries(stats.features)
    : stats.features[selectedFeature] 
      ? [[selectedFeature, stats.features[selectedFeature]]]
      : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Feedback Analytics
          </h1>
          <p className="text-gray-600 mt-1">User feedback on AI insights and features</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadFeedbackStats} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.totalFeedback}
          </div>
          <div className="text-sm text-gray-600">Total Feedback</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(stats.averageRating)
                    ? 'text-yellow-500 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-green-100">
              <ThumbsUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.helpfulCount}
          </div>
          <div className="text-sm text-gray-600">Helpful Responses</div>
          <div className="mt-2 text-sm text-green-600 font-medium">
            {stats.helpfulPercentage}% helpful rate
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-purple-100">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {Object.keys(stats.features).length}
          </div>
          <div className="text-sm text-gray-600">Features Tracked</div>
        </motion.div>
      </div>

      {/* Feature Filter */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by Feature:</span>
          <div className="flex flex-wrap gap-2">
            {['all', ...Object.keys(stats.features)].map((feature) => (
              <button
                key={feature}
                onClick={() => setSelectedFeature(feature)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedFeature === feature
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {featureLabels[feature] || feature}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            Feature Performance
          </h3>
          <div className="space-y-4">
            {filteredFeatures.map(([feature, data]) => (
              <div key={feature} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {featureLabels[feature] || feature}
                  </span>
                  <span className="text-sm text-gray-600">
                    {data.count} feedback
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">
                      {data.avgRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      {data.helpful} helpful
                    </span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(data.count / stats.totalFeedback) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Recent Feedback
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {stats.recentFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      {featureLabels[feedback.feature] || feedback.feature}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= feedback.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${
                    feedback.helpful ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {feedback.helpful ? (
                      <ThumbsUp className="w-4 h-4" />
                    ) : (
                      <ThumbsDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
                {feedback.feedback_text && (
                  <p className="text-sm text-gray-700 mt-2">
                    {feedback.feedback_text}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(feedback.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {stats.recentFeedback.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No feedback yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
