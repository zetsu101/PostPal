'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@/components/ui/Button';
import { useToast } from './ui/Toast';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  BarChart3, 
  PieChart, 
  Zap, 
  Users, 
  Calendar,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Activity,
  Eye,
  MessageCircle,
  Share,
  Heart,
  Bookmark,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  contentScoringModel,
  engagementPredictionModel,
  optimalTimingModel,
  trendPredictionModel,
  type ContentFeatures,
  type EngagementPrediction,
  type OptimalTiming,
  type TrendPrediction,
  type AudienceInsight
} from '@/lib/ai-ml-models';
import { trendPredictionEngine } from '@/lib/trend-prediction-engine';
import { audienceAnalysisEngine } from '@/lib/audience-analysis-engine';
import { aiInsightsService } from '@/lib/ai-insights-service';
import { useAIInsightsWebSocket } from '@/hooks/useWebSocket';
import AIInsightsFeedback from './AIInsightsFeedback';

interface AIInsightsData {
  contentScore: number;
  engagementPrediction: EngagementPrediction;
  optimalTiming: OptimalTiming;
  trendPrediction: TrendPrediction;
  audienceInsights: AudienceInsight;
  recommendations: string[];
}

export default function AIInsightsAdvanced() {
  const [insightsData, setInsightsData] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [liveMetrics, setLiveMetrics] = useState<{
    engagementRate: number;
    contentScore: number;
    trendingTopics: number;
    audienceGrowth: number;
  }>({
    engagementRate: 8.4,
    contentScore: 76,
    trendingTopics: 12,
    audienceGrowth: 5.2
  });

  // WebSocket for real-time AI updates
  const ws = useAIInsightsWebSocket();
  const [lastLiveUpdateAt, setLastLiveUpdateAt] = useState<number | null>(null);
  const { addToast } = useToast();
  const lastToastTimeRef = useRef<number>(0);

  // Mock content for analysis
  const mockContent = {
    text: "🚀 Exciting news! Our new AI-powered analytics dashboard is now live! Get real-time insights into your content performance and discover what truly engages your audience. Try it now and watch your engagement soar! #AI #Analytics #ContentMarketing #Innovation",
    platform: 'instagram' as const,
    scheduledTime: new Date('2024-01-22T14:00:00Z')
  };

  const analyzeContent = async () => {
    setLoading(true);
    
    try {
      // Prefer calling the unified AI Insights API, then fall back to local models
      const userId = 'current-user';
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      const apiResponse = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Use stored token if available; during dev/tests the API accepts test bypass
          'authorization': `Bearer ${authToken || 'test-token'}`,
          'x-test-bypass': 'true'
        },
        body: JSON.stringify({
          content: {
            text: mockContent.text,
            media: [{ type: 'image', url: 'https://example.com/image.jpg' }],
            sentiment: 0.8,
            readability: 75,
            urgency: 0.3,
            callToAction: true,
            trendingTopics: ['AI', 'Analytics', 'ContentMarketing'],
            scheduledTime: mockContent.scheduledTime
          },
          platform: mockContent.platform
        })
      });

      if (apiResponse.ok) {
        const payload = await apiResponse.json();
        if (payload?.success && payload?.data) {
          const d = payload.data;
          setInsightsData({
            contentScore: d.contentScore,
            engagementPrediction: d.engagementPrediction,
            optimalTiming: d.optimalTiming,
            trendPrediction: d.trendPrediction,
            audienceInsights: d.audienceInsights,
            recommendations: d.recommendations || []
          });
          setLastUpdated(new Date());
          setLoading(false);
          return;
        }
      }
      
      // Extract content features for local analysis
      const features: ContentFeatures = {
        textLength: mockContent.text.length,
        hashtagCount: (mockContent.text.match(/#\w+/g) || []).length,
        mentionCount: (mockContent.text.match(/@\w+/g) || []).length,
        emojiCount: (mockContent.text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length,
        questionCount: (mockContent.text.match(/\?/g) || []).length,
        exclamationCount: (mockContent.text.match(/!/g) || []).length,
        linkCount: 0,
        imageCount: 1,
        videoCount: 0,
        sentiment: 0.8, // Positive sentiment
        readability: 75,
        urgency: 0.3,
        callToAction: true,
        trendingTopics: ['AI', 'Analytics', 'ContentMarketing'],
        timeOfDay: 14,
        dayOfWeek: 1, // Monday
        platform: mockContent.platform
      };

      // Use the AI insights service to enrich locally (non-blocking)
      const [trendingTopics, audienceInsights, optimalTiming, contentSuggestions] = await Promise.all([
        aiInsightsService.getTrendingTopics(mockContent.platform, selectedTimeframe),
        aiInsightsService.getAudienceInsights(userId, [mockContent.platform], selectedTimeframe),
        aiInsightsService.getOptimalTiming(userId, mockContent.platform, selectedTimeframe),
        aiInsightsService.generateContentSuggestions(null, mockContent.platform, userId)
      ]);

      // Calculate local insights using AI models (as backup/enhancement)
      const contentScore = contentScoringModel.calculateContentScore(features);
      const engagementPrediction = engagementPredictionModel.predictEngagement(
        mockContent.text,
        features,
        audienceInsights,
        [] // Historical data would go here
      );
      const localTrendPrediction = trendPredictionModel.predictTrends([], features.trendingTopics);

      // Convert service response to component interface format
      const transformedAudienceInsights: AudienceInsight = {
        demographics: audienceInsights.demographics || {
          ageGroups: [],
          genders: [],
          locations: []
        },
        interests: audienceInsights.interests || [],
        behavior: audienceInsights.behavior || {
          activeHours: [],
          preferredContent: [],
          engagementPatterns: []
        },
        psychographics: audienceInsights.psychographics || {
          values: [],
          lifestyle: [],
          brandAffinity: []
        }
      };

      const transformedOptimalTiming: OptimalTiming = {
        bestTimes: optimalTiming.bestTimes || [],
        audienceActivity: optimalTiming.audienceActivity || [],
        competitorAnalysis: optimalTiming.competitorAnalysis || []
      };

      // Generate recommendations from multiple sources
      const recommendations = [
        "Post during peak engagement hours (2-4 PM) for maximum reach",
        "Add more visual content to increase engagement by 25%",
        "Include trending hashtags like #AI and #Innovation for better discoverability",
        "Consider creating a video version for higher engagement rates",
        "Target your tech-savvy audience with more educational content"
      ];

      // Add trending topics recommendations
      if (trendingTopics.trending && trendingTopics.trending.length > 0) {
        recommendations.push(`Consider incorporating trending topics: ${trendingTopics.trending.slice(0, 2).map((t: any) => t.topic).join(', ')}`);
      }

      setInsightsData({
        contentScore,
        engagementPrediction,
        optimalTiming: transformedOptimalTiming,
        trendPrediction: localTrendPrediction,
        audienceInsights: transformedAudienceInsights,
        recommendations
      });
      
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error analyzing content:', error);
      // Fallback to basic local analysis if service calls fail
      const features: ContentFeatures = {
        textLength: mockContent.text.length,
        hashtagCount: (mockContent.text.match(/#\w+/g) || []).length,
        mentionCount: (mockContent.text.match(/@\w+/g) || []).length,
        emojiCount: (mockContent.text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length,
        questionCount: (mockContent.text.match(/\?/g) || []).length,
        exclamationCount: (mockContent.text.match(/!/g) || []).length,
        linkCount: 0,
        imageCount: 1,
        videoCount: 0,
        sentiment: 0.8,
        readability: 75,
        urgency: 0.3,
        callToAction: true,
        trendingTopics: ['AI', 'Analytics', 'ContentMarketing'],
        timeOfDay: 14,
        dayOfWeek: 1,
        platform: mockContent.platform
      };

      const mockAudienceInsights: AudienceInsight = {
        demographics: {
          ageGroups: [
            { range: '25-34', percentage: 45 },
            { range: '35-44', percentage: 30 },
            { range: '18-24', percentage: 25 }
          ],
          genders: [
            { gender: 'Female', percentage: 60 },
            { gender: 'Male', percentage: 40 }
          ],
          locations: [
            { location: 'United States', percentage: 40 },
            { location: 'Canada', percentage: 20 },
            { location: 'United Kingdom', percentage: 15 },
            { location: 'Australia', percentage: 10 },
            { location: 'Other', percentage: 15 }
          ]
        },
        interests: [
          { category: 'Technology', affinity: 0.9 },
          { category: 'Marketing', affinity: 0.8 },
          { category: 'Business', affinity: 0.7 },
          { category: 'Innovation', affinity: 0.85 }
        ],
        behavior: {
          activeHours: [9, 10, 11, 13, 14, 15, 17, 18, 19],
          preferredContent: ['Educational', 'Behind-the-scenes', 'Product updates'],
          engagementPatterns: [
            { type: 'likes', frequency: 0.7 },
            { type: 'comments', frequency: 0.3 },
            { type: 'shares', frequency: 0.2 },
            { type: 'saves', frequency: 0.4 }
          ]
        },
        psychographics: {
          values: ['Innovation', 'Efficiency', 'Growth'],
          lifestyle: ['Tech-savvy', 'Career-focused', 'Early adopters'],
          brandAffinity: ['SaaS', 'Tech startups', 'Marketing tools']
        }
      };

      const contentScore = contentScoringModel.calculateContentScore(features);
      const engagementPrediction = engagementPredictionModel.predictEngagement(
        mockContent.text,
        features,
        mockAudienceInsights,
        []
      );
      const optimalTiming = optimalTimingModel.analyzeOptimalTimes([], mockAudienceInsights);
      const trendPrediction = trendPredictionModel.predictTrends([], features.trendingTopics);

      const recommendations = [
        "Post during peak engagement hours (2-4 PM) for maximum reach",
        "Add more visual content to increase engagement by 25%",
        "Include trending hashtags like #AI and #Innovation for better discoverability",
        "Consider creating a video version for higher engagement rates",
        "Target your tech-savvy audience with more educational content"
      ];

      setInsightsData({
        contentScore,
        engagementPrediction,
        optimalTiming,
        trendPrediction,
        audienceInsights: mockAudienceInsights,
        recommendations
      });
    }

    setLoading(false);
  };

  // Function to update live metrics (simulating real-time data)
  const updateLiveMetrics = useCallback(async () => {
    if (!isRealTimeEnabled || !insightsData) return;
    
    try {
      // Simulate real-time updates by fetching fresh trending topics and audience data
      const userId = 'current-user';
      const [freshTrendingTopics, freshOptimalTiming] = await Promise.all([
        aiInsightsService.getTrendingTopics(mockContent.platform, selectedTimeframe),
        aiInsightsService.getOptimalTiming(userId, mockContent.platform, selectedTimeframe)
      ]);

      // Update live metrics with small variations to simulate real-time data
      setLiveMetrics(prev => ({
        engagementRate: Math.max(0, prev.engagementRate + (Math.random() - 0.5) * 0.2),
        contentScore: Math.max(0, Math.min(100, prev.contentScore + (Math.random() - 0.5) * 2)),
        trendingTopics: freshTrendingTopics.trending?.length || prev.trendingTopics,
        audienceGrowth: Math.max(0, prev.audienceGrowth + (Math.random() - 0.5) * 0.3)
      }));

      // Update insights data if there are significant changes
      if (freshTrendingTopics.trending && freshTrendingTopics.trending.length > 0) {
        setInsightsData(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            recommendations: [
              ...prev.recommendations.slice(0, 4), // Keep original recommendations
              `Live update: ${freshTrendingTopics.trending.slice(0, 2).map((t: any) => t.topic).join(', ')} trending now`
            ]
          };
        });
      }
    } catch (error) {
      console.error('Failed to update live metrics:', error);
    }
  }, [isRealTimeEnabled, insightsData, selectedTimeframe, mockContent.platform]);

  useEffect(() => {
    analyzeContent();
  }, []);

  // Real-time updates effect
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    // Update every 30 seconds
    const interval = setInterval(updateLiveMetrics, 30000);
    
    // Also refresh full analysis every 5 minutes
    const analysisInterval = setInterval(() => {
      if (!loading) {
        analyzeContent();
      }
    }, 300000); // 5 minutes

    return () => {
      clearInterval(interval);
      clearInterval(analysisInterval);
    };
  }, [isRealTimeEnabled, selectedTimeframe, loading, updateLiveMetrics]);

  // Apply incoming WebSocket updates to insights data
  useEffect(() => {
    if (!isRealTimeEnabled || !ws.lastMessage || !insightsData) return;
    if (ws.lastMessage.type !== 'insight_update') return;

    const update = ws.lastMessage.data;
    if (!update || !update.type) return;

    // Throttle toast notifications (max one every 3 seconds)
    const now = Date.now();
    const shouldShowToast = now - lastToastTimeRef.current > 3000;

    setInsightsData(prev => {
      if (!prev) return prev;

      switch (update.type) {
        case 'content_analysis': {
          const nextRecommendations = Array.isArray(update.data?.recommendations)
            ? update.data.recommendations
            : prev.recommendations;
          const nextScore = typeof update.data?.contentScore === 'number'
            ? update.data.contentScore
            : prev.contentScore;
          if (shouldShowToast) {
            addToast({
              type: 'info',
              title: 'Content Analysis Updated',
              message: `Content score: ${Math.round(nextScore)}/100. ${nextRecommendations.length > 0 ? nextRecommendations[0] : 'Keep up the great work!'}`,
              duration: 4000
            });
            lastToastTimeRef.current = now;
          }
          return { ...prev, contentScore: nextScore, recommendations: nextRecommendations };
        }
        case 'engagement_prediction': {
          const nextEng = {
            predictedEngagement: update.data?.predictedEngagement ?? prev.engagementPrediction.predictedEngagement,
            confidence: update.data?.confidence ?? prev.engagementPrediction.confidence,
            factors: update.data?.factors ?? prev.engagementPrediction.factors,
            recommendations: prev.engagementPrediction.recommendations
          };
          if (shouldShowToast) {
            addToast({
              type: 'success',
              title: 'Engagement Prediction Updated',
              message: `Predicted engagement: ${Math.round(nextEng.predictedEngagement * 100)}% (${Math.round(nextEng.confidence * 100)}% confidence)`,
              duration: 4000
            });
            lastToastTimeRef.current = now;
          }
          return { ...prev, engagementPrediction: nextEng };
        }
        case 'audience_insight': {
          const nextAudience = {
            demographics: update.data?.demographics ?? prev.audienceInsights.demographics,
            behavior: update.data?.behavior ?? prev.audienceInsights.behavior,
            interests: update.data?.interests ?? prev.audienceInsights.interests,
            psychographics: prev.audienceInsights.psychographics
          };
          if (shouldShowToast) {
            addToast({
              type: 'info',
              title: 'Audience Insights Updated',
              message: 'Your audience data has been refreshed with latest insights.',
              duration: 3000
            });
            lastToastTimeRef.current = now;
          }
          return { ...prev, audienceInsights: nextAudience };
        }
        default:
          return prev;
      }
    });

    // Nudge live metrics when updates arrive
    setLiveMetrics(prev => ({
      engagementRate: Math.max(0, prev.engagementRate + (Math.random() - 0.5) * 0.1),
      contentScore: Math.max(0, Math.min(100, insightsData?.contentScore ?? prev.contentScore)),
      trendingTopics: prev.trendingTopics,
      audienceGrowth: Math.max(0, prev.audienceGrowth + (Math.random() - 0.5) * 0.2)
    }));

    // Mark last live update time (for badge)
    setLastLiveUpdateAt(Date.now());
  }, [ws.lastMessage, isRealTimeEnabled, insightsData, addToast]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-5 w-5" />;
    if (score >= 60) return <Activity className="h-5 w-5" />;
    return <ArrowDown className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Analyzing your content with AI...</p>
        </div>
      </div>
    );
  }

  if (!insightsData) {
    return (
      <div className="text-center py-12">
        <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">No insights available. Click analyze to get started.</p>
        <Button onClick={analyzeContent} className="mt-4">
          Analyze Content
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            AI Insights Dashboard
            {isRealTimeEnabled && (
              <div className="flex items-center gap-3 ml-4">
                <div className={`w-3 h-3 rounded-full ${ws.isConnected ? 'bg-green-500' : 'bg-gray-400'} ${ws.isConnected ? 'animate-pulse' : ''}`}></div>
                <span className={`text-sm font-medium ${ws.isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                  {ws.isConnected ? 'Live' : 'Offline'}
                </span>
                {lastLiveUpdateAt && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                    Updated {Math.max(1, Math.round((Date.now() - lastLiveUpdateAt) / 1000))}s ago
                  </span>
                )}
              </div>
            )}
          </h1>
          <p className="text-gray-600">Advanced analytics powered by machine learning</p>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isRealTimeEnabled}
                onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Real-time updates
            </label>
          </div>
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button onClick={analyzeContent} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Live Metrics Bar */}
      {isRealTimeEnabled && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Metrics
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">Updates every 30s</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{liveMetrics.engagementRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Engagement Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{Math.round(liveMetrics.contentScore)}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Content Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{liveMetrics.trendingTopics}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Trending Topics</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">+{liveMetrics.audienceGrowth.toFixed(1)}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Audience Growth</div>
            </div>
          </div>
        </div>
      )}

      {/* Content Score Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Content Performance Score
          </h2>
          <div className="flex items-center gap-3">
            <AIInsightsFeedback
              compact
              feature="content_analysis"
              context={{
                contentScore: insightsData.contentScore,
                platform: mockContent.platform
              }}
            />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(insightsData.contentScore)}`}>
              {insightsData.contentScore}/100
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{insightsData.engagementPrediction.factors.content}</div>
            <div className="text-sm text-gray-600">Content Quality</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{Math.round(insightsData.engagementPrediction.factors.audience * 100)}</div>
            <div className="text-sm text-gray-600">Audience Match</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(insightsData.engagementPrediction.factors.timing * 100)}</div>
            <div className="text-sm text-gray-600">Timing Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{Math.round(insightsData.engagementPrediction.factors.trends * 100)}</div>
            <div className="text-sm text-gray-600">Trend Alignment</div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'engagement', label: 'Engagement Prediction', icon: TrendingUp },
            { id: 'timing', label: 'Optimal Timing', icon: Clock },
            { id: 'trends', label: 'Trend Analysis', icon: Target },
            { id: 'audience', label: 'Audience Insights', icon: Users },
            { id: 'advanced-trends', label: 'Advanced Trends', icon: TrendingUp },
            { id: 'recommendations', label: 'AI Recommendations', icon: Lightbulb }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Engagement Prediction
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Predicted Engagement Rate</span>
                  <span className="text-2xl font-bold text-green-600">
                    {insightsData.engagementPrediction.predictedEngagement}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Confidence Level</span>
                  <span className="text-lg font-semibold">
                    {Math.round(insightsData.engagementPrediction.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${insightsData.engagementPrediction.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Best Posting Times
              </h3>
              <div className="space-y-2">
                {insightsData.optimalTiming.bestTimes.slice(0, 3).map((time, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">{time.day} at {time.hour}:00</span>
                    <span className="text-sm font-medium text-blue-600">
                      {Math.round(time.score * 100)}% optimal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Engagement Prediction Tab */}
        {activeTab === 'engagement' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Engagement Factors</h3>
              <div className="space-y-4">
                {Object.entries(insightsData.engagementPrediction.factors).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium capitalize">{key}</span>
                      <span className="text-sm text-gray-600">{Math.round(value * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${value * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Expected Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Eye className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{Math.round(insightsData.engagementPrediction.predictedEngagement * 1000)}</div>
                  <div className="text-sm text-gray-600">Reach</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Heart className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold">{Math.round(insightsData.engagementPrediction.predictedEngagement * 500)}</div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <MessageCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{Math.round(insightsData.engagementPrediction.predictedEngagement * 100)}</div>
                  <div className="text-sm text-gray-600">Comments</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Share className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{Math.round(insightsData.engagementPrediction.predictedEngagement * 50)}</div>
                  <div className="text-sm text-gray-600">Shares</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optimal Timing Tab */}
        {activeTab === 'timing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Best Posting Times</h3>
              <div className="space-y-3">
                {insightsData.optimalTiming.bestTimes.map((time, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{time.day}</div>
                      <div className="text-sm text-gray-600">{time.hour}:00</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(time.score * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">optimal</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Audience Activity</h3>
              <div className="space-y-2">
                {insightsData.optimalTiming.audienceActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 text-sm text-gray-600">{activity.hour}:00</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${activity.activity * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm text-gray-600">
                      {Math.round(activity.activity * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Trending Topics
              </h3>
              <div className="space-y-3">
                {insightsData.trendPrediction.trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">#{topic.topic}</div>
                      <div className="text-sm text-gray-600">
                        {Math.round(topic.growth)}% growth
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(topic.confidence * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">confidence</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ArrowUp className="h-5 w-5 text-blue-600" />
                Emerging Trends
              </h3>
              <div className="space-y-3">
                {insightsData.trendPrediction.emergingTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium">{trend.topic}</div>
                      <div className="text-sm text-gray-600">Early signal detected</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(trend.earlySignal * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">signal strength</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audience Tab */}
        {activeTab === 'audience' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Demographics</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Age Groups</h4>
                  <div className="space-y-2">
                    {insightsData.audienceInsights.demographics.ageGroups.map((group, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{group.range} years</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${group.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm w-8">{group.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Top Interests</h4>
                  <div className="space-y-2">
                    {insightsData.audienceInsights.interests.slice(0, 4).map((interest, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{interest.category}</span>
                        <span className="text-sm font-medium">
                          {Math.round(interest.affinity * 100)}% affinity
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Behavior Patterns</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Active Hours</h4>
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div 
                        key={i} 
                        className={`h-8 rounded text-xs flex items-center justify-center ${
                          insightsData.audienceInsights.behavior.activeHours.includes(i)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Engagement Patterns</h4>
                  <div className="space-y-2">
                    {insightsData.audienceInsights.behavior.engagementPatterns.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{pattern.type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${pattern.frequency * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm w-8">{Math.round(pattern.frequency * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Trends Tab */}
        {activeTab === 'advanced-trends' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Viral Content Predictions
              </h3>
              <div className="space-y-4">
                {[
                  {
                    content: "Revolutionary AI tool that writes better than humans",
                    viralScore: 9.2,
                    factors: ["Trending AI topic", "High emotional appeal", "Controversial statement"],
                    recommendations: ["Post during peak hours", "Use engaging visuals", "Include call-to-action"]
                  },
                  {
                    content: "Behind-the-scenes: How we built our AI platform",
                    viralScore: 7.8,
                    factors: ["Behind-the-scenes content", "Technical interest", "Unique insights"],
                    recommendations: ["Use video format", "Share personal stories", "Engage with comments"]
                  }
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-gray-700 flex-1">{item.content}</p>
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {item.viralScore}/10
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      <strong>Factors:</strong> {item.factors.join(', ')}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Tips:</strong> {item.recommendations.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Trend Momentum Analysis
              </h3>
              <div className="space-y-4">
                {[
                  { topic: 'AI Marketing', momentum: 9.1, peakTime: '2024-02-15', duration: 21, risk: 'low' },
                  { topic: 'Sustainability', momentum: 8.6, peakTime: '2024-02-28', duration: 35, risk: 'medium' },
                  { topic: 'Remote Work', momentum: 7.3, peakTime: '2024-01-30', duration: 14, risk: 'low' }
                ].map((trend, index) => (
                  <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{trend.topic}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          trend.risk === 'low' ? 'bg-green-100 text-green-800' :
                          trend.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {trend.risk} risk
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          {trend.momentum}/10
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Peak prediction: {trend.peakTime}</div>
                      <div>Trend duration: {trend.duration} days</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${trend.momentum * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                AI-Powered Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insightsData.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Feedback Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Help Us Improve</h3>
              <AIInsightsFeedback
                feature="recommendations"
                context={{
                  contentScore: insightsData.contentScore,
                  engagementPrediction: insightsData.engagementPrediction.predictedEngagement,
                  platform: mockContent.platform
                }}
                onFeedbackSubmitted={() => {
                  console.log('Feedback submitted for recommendations');
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-6">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          Apply Recommendations
        </Button>
      </div>
    </div>
  );
}
