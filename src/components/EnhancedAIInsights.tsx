'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Clock, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  BarChart3,
  Target,
  Lightbulb,
  Activity
} from 'lucide-react';

interface ContentFeatures {
  textLength: number;
  hashtagCount: number;
  mentionCount: number;
  emojiCount: number;
  questionCount: number;
  exclamationCount: number;
  linkCount: number;
  imageCount: number;
  videoCount: number;
  sentiment: number;
  readability: number;
  urgency: number;
  callToAction: boolean;
  trendingTopics: string[];
  timeOfDay: number;
  dayOfWeek: number;
  platform: string;
}

interface EngagementPrediction {
  predictedEngagement: number;
  confidence: number;
  factors: {
    content: number;
    timing: number;
    audience: number;
    trends: number;
  };
  recommendations: string[];
}

interface AIInsights {
  contentScore: number;
  engagementPrediction: EngagementPrediction;
  optimalTiming: any;
  trendPrediction: any;
  audienceInsights: any;
  recommendations: string[];
  features: ContentFeatures;
  timestamp: string;
}

interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  burstRemaining?: number;
}

interface RealtimeUpdate {
  type: 'content_analysis' | 'engagement_prediction' | 'audience_insight';
  data: any;
  timestamp: number;
}

export default function EnhancedAIInsights() {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [realtimeUpdates, setRealtimeUpdates] = useState<RealtimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080';
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Subscribe to insights updates
        ws.send(JSON.stringify({
          type: 'subscribe',
          topics: ['content_analysis', 'engagement_prediction', 'audience_insight']
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'insight_update') {
            const update: RealtimeUpdate = message.data;
            setRealtimeUpdates(prev => [...prev.slice(-4), update]); // Keep last 5 updates
            
            // Update insights if this is for current analysis
            if (update.type === 'content_analysis') {
              setInsights(prev => prev ? {
                ...prev,
                contentScore: update.data.contentScore,
                features: update.data.features,
                recommendations: [...prev.recommendations, ...update.data.recommendations]
              } : null);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          retryTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000 * reconnectAttempts.current);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  }, []);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  // Analyze content with enhanced AI insights
  const analyzeContent = async () => {
    if (!content.trim()) {
      setError('Please enter some content to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setProcessingSteps(['Initializing analysis...', 'Extracting content features...', 'Calculating AI insights...']);
    setRealtimeUpdates([]);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: {
            text: content,
            sentiment: 0, // Could be calculated client-side
            readability: 60, // Could be calculated client-side
            urgency: 0,
            callToAction: content.toLowerCase().includes('click') || content.toLowerCase().includes('learn more'),
            trendingTopics: [], // Could be populated from trending topics API
            scheduledTime: new Date().toISOString()
          },
          platform,
          audienceData: null, // Use default audience
          historicalData: [] // Could be populated from user's historical data
        })
      });

      // Extract rate limit info from headers
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const burstRemaining = response.headers.get('X-RateLimit-Burst-Remaining');

      if (remaining && resetTime) {
        setRateLimitInfo({
          remaining: parseInt(remaining),
          resetTime: parseInt(resetTime) * 1000,
          burstRemaining: burstRemaining ? parseInt(burstRemaining) : undefined
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to analyze content');
      }

      const data = await response.json();
      setInsights(data.data);
      setProcessingSteps(['Analysis complete!', 'Insights generated successfully', 'Real-time updates active']);

    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze content');
      setProcessingSteps(['Analysis failed', 'Please try again']);
    } finally {
      setLoading(false);
    }
  };

  // Clear analysis
  const clearAnalysis = () => {
    setInsights(null);
    setError(null);
    setRealtimeUpdates([]);
    setProcessingSteps([]);
  };

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Enhanced AI Insights
              </h1>
              <p className="text-gray-600">
                Advanced content analysis with real-time updates and intelligent caching
              </p>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <Activity className="w-4 h-4" />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              {rateLimitInfo && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{rateLimitInfo.remaining}</span> requests remaining
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-500" />
                Content Analysis
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your content here..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={analyzeContent}
                    disabled={loading || !content.trim()}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Analyzing...' : 'Analyze Content'}
                  </button>
                  
                  <button
                    onClick={clearAnalysis}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>

                {/* Processing Steps */}
                <AnimatePresence>
                  {processingSteps.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <h3 className="text-sm font-medium text-gray-700">Processing Steps:</h3>
                      {processingSteps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            index === processingSteps.length - 1 ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                          {step}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-red-700 font-medium">Analysis Error</p>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {insights ? (
              <div className="space-y-6">
                {/* Main Insights Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Content Score */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                        Content Score
                      </h3>
                      <div className={`text-2xl font-bold ${getScoreColor(insights.contentScore)}`}>
                        {insights.contentScore}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          insights.contentScore >= 80 ? 'bg-green-500' : 
                          insights.contentScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${insights.contentScore}%` }}
                      />
                    </div>
                  </motion.div>

                  {/* Engagement Prediction */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                        Engagement Prediction
                      </h3>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {(insights.engagementPrediction.predictedEngagement * 100).toFixed(1)}%
                        </div>
                        <div className={`text-sm ${getConfidenceColor(insights.engagementPrediction.confidence)}`}>
                          {(insights.engagementPrediction.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(insights.engagementPrediction.factors).map(([factor, score]) => (
                        <div key={factor} className="flex justify-between text-sm">
                          <span className="capitalize text-gray-600">{factor}</span>
                          <span className="font-medium">{(score * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Recommendations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                    AI Recommendations
                  </h3>
                  <div className="space-y-3">
                    {insights.recommendations.map((recommendation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-start p-3 bg-blue-50 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                        <p className="text-gray-700">{recommendation}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Real-time Updates */}
                {realtimeUpdates.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-purple-500" />
                      Real-time Updates
                    </h3>
                    <div className="space-y-2">
                      {realtimeUpdates.map((update, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center p-2 bg-purple-50 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse" />
                          <span className="text-sm text-gray-700">
                            {update.type.replace('_', ' ')} updated
                          </span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {new Date(update.timestamp).toLocaleTimeString()}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-gray-600">
                  Enter your content above to get AI-powered insights with real-time updates
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
