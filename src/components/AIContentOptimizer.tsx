"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  Clock,
  Users,
  BarChart3,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Filter,
  Download
} from 'lucide-react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';

// AI Content Optimization Interfaces
interface ContentAnalysis {
  id: string;
  originalContent: string;
  optimizedContent: string;
  platform: string;
  score: number;
  improvements: ContentImprovement[];
  predictedMetrics: PredictedMetrics;
  timestamp: Date;
  status: 'analyzing' | 'completed' | 'failed';
}

interface ContentImprovement {
  id: string;
  type: 'engagement' | 'readability' | 'hashtags' | 'timing' | 'format';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  applied: boolean;
}

interface PredictedMetrics {
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagementRate: number;
  confidence: number;
}

interface OptimizationSuggestion {
  id: string;
  type: 'hashtag' | 'timing' | 'format' | 'tone' | 'length';
  title: string;
  description: string;
  impact: number;
  effort: 'easy' | 'medium' | 'hard';
  category: string;
}

// Mock data for demonstration
const mockOptimizations: OptimizationSuggestion[] = [
  {
    id: '1',
    type: 'hashtag',
    title: 'Add Trending Hashtags',
    description: 'Include #AI, #Marketing, and #DigitalStrategy to increase reach by 25%',
    impact: 85,
    effort: 'easy',
    category: 'engagement'
  },
  {
    id: '2',
    type: 'timing',
    title: 'Optimize Posting Time',
    description: 'Post at 2 PM EST for 40% higher engagement with your audience',
    impact: 92,
    effort: 'easy',
    category: 'timing'
  },
  {
    id: '3',
    type: 'format',
    title: 'Use Carousel Format',
    description: 'Convert to carousel post to increase engagement by 60%',
    impact: 78,
    effort: 'medium',
    category: 'format'
  },
  {
    id: '4',
    type: 'tone',
    title: 'Adjust Tone',
    description: 'Make the tone more conversational to increase comments by 35%',
    impact: 65,
    effort: 'medium',
    category: 'engagement'
  },
  {
    id: '5',
    type: 'length',
    title: 'Optimize Length',
    description: 'Keep under 100 characters for maximum impact on Twitter',
    impact: 88,
    effort: 'easy',
    category: 'format'
  }
];

const mockAnalysis: ContentAnalysis = {
  id: '1',
  originalContent: 'Check out our new AI-powered social media management tool! It helps businesses create better content and grow their online presence.',
  optimizedContent: '🚀 Introducing our AI-powered social media tool! ✨ Create better content, grow your presence, and boost engagement. Ready to transform your strategy? #AI #SocialMedia #Marketing #DigitalStrategy',
  platform: 'instagram',
  score: 87,
  improvements: [
    {
      id: '1',
      type: 'engagement',
      title: 'Added Emojis',
      description: 'Emojis increase engagement by 25%',
      impact: 'high',
      applied: true
    },
    {
      id: '2',
      type: 'hashtags',
      title: 'Optimized Hashtags',
      description: 'Added relevant trending hashtags',
      impact: 'high',
      applied: true
    },
    {
      id: '3',
      type: 'readability',
      title: 'Improved Readability',
      description: 'Shortened sentences for better flow',
      impact: 'medium',
      applied: true
    }
  ],
  predictedMetrics: {
    likes: 245,
    comments: 18,
    shares: 32,
    reach: 1250,
    engagementRate: 8.7,
    confidence: 87
  },
  timestamp: new Date(),
  status: 'completed'
};

export default function AIContentOptimizer() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'suggestions' | 'predictions' | 'history'>('analyze');
  const [content, setContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>(mockOptimizations);
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);
  const { addToast } = useToast();

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' }
  ];

  const handleAnalyze = async () => {
    if (!content.trim()) {
      addToast({
        title: 'Content Required',
        message: 'Please enter some content to analyze.',
        type: 'error'
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis({
        ...mockAnalysis,
        originalContent: content,
        timestamp: new Date()
      });
      setIsAnalyzing(false);
      addToast({
        title: 'Analysis Complete',
        message: 'Your content has been analyzed and optimized!',
        type: 'success'
      });
    }, 2000);
  };

  const handleApplySuggestion = (suggestionId: string) => {
    setAppliedSuggestions(prev => [...prev, suggestionId]);
    addToast({
      title: 'Suggestion Applied',
      message: 'This optimization has been applied to your content.',
      type: 'success'
    });
  };

  const handleRemoveSuggestion = (suggestionId: string) => {
    setAppliedSuggestions(prev => prev.filter(id => id !== suggestionId));
    addToast({
      title: 'Suggestion Removed',
      message: 'This optimization has been removed from your content.',
      type: 'info'
    });
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
    if (impact >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const tabs = [
    {
      id: 'analyze' as const,
      label: 'Content Analysis',
      icon: <Brain className="w-4 h-4" />,
      description: 'Analyze and optimize your content'
    },
    {
      id: 'suggestions' as const,
      label: 'AI Suggestions',
      icon: <Lightbulb className="w-4 h-4" />,
      description: 'Get personalized optimization suggestions'
    },
    {
      id: 'predictions' as const,
      label: 'Performance Predictions',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Predict content performance metrics'
    },
    {
      id: 'history' as const,
      label: 'Analysis History',
      icon: <Clock className="w-4 h-4" />,
      description: 'View previous content analyses'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Content Optimizer
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Leverage AI to optimize your content for maximum engagement and performance
        </p>
      </div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-2 px-6 py-4 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'analyze' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Content Input
                  </h3>
                  
                  {/* Platform Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Platform
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {platforms.map((platform) => (
                        <button
                          key={platform.id}
                          onClick={() => setSelectedPlatform(platform.id)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedPlatform === platform.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="text-2xl mb-1">{platform.icon}</div>
                          <div className="text-xs font-medium">{platform.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Content
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter your content here..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !content.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze Content
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Analysis Results */}
              <div className="space-y-6">
                {analysis && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Analysis Results
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-green-600">{analysis.score}</div>
                        <div className="text-sm text-gray-500">/ 100</div>
                      </div>
                    </div>

                    {/* Optimized Content */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Optimized Content
                      </h4>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-800 dark:text-gray-200">{analysis.optimizedContent}</p>
                      </div>
                    </div>

                    {/* Improvements Applied */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Improvements Applied
                      </h4>
                      <div className="space-y-2">
                        {analysis.improvements.map((improvement) => (
                          <div key={improvement.id} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{improvement.title}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{improvement.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Predicted Metrics */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Predicted Performance
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Likes</span>
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {analysis.predictedMetrics.likes}
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Comments</span>
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {analysis.predictedMetrics.comments}
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Share2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Shares</span>
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {analysis.predictedMetrics.shares}
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Eye className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Reach</span>
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {analysis.predictedMetrics.reach.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Optimization Suggestions
                </h3>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {suggestion.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {suggestion.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(suggestion.impact)}`}>
                          {suggestion.impact}% impact
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEffortColor(suggestion.effort)}`}>
                          {suggestion.effort}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 capitalize">{suggestion.category}</span>
                      <Button
                        onClick={() => handleApplySuggestion(suggestion.id)}
                        disabled={appliedSuggestions.includes(suggestion.id)}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {appliedSuggestions.includes(suggestion.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Applied
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Apply
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Performance Predictions
                </h3>
                
                {analysis ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                      <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {analysis.predictedMetrics.likes}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Predicted Likes</div>
                      <div className="text-xs text-green-600 mt-2">+25% vs average</div>
                    </div>
                    
                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                      <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {analysis.predictedMetrics.comments}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Predicted Comments</div>
                      <div className="text-xs text-green-600 mt-2">+18% vs average</div>
                    </div>
                    
                    <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                      <Share2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {analysis.predictedMetrics.shares}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Predicted Shares</div>
                      <div className="text-xs text-green-600 mt-2">+32% vs average</div>
                    </div>
                    
                    <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
                      <Eye className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {analysis.predictedMetrics.reach.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Predicted Reach</div>
                      <div className="text-xs text-green-600 mt-2">+15% vs average</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Analysis Yet
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Analyze some content first to see performance predictions
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Analysis History
                </h3>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {analysis?.score || 87}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Instagram Post</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {analysis?.timestamp.toLocaleDateString() || new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</div>
                      <div className="text-lg font-semibold text-green-600">
                        {analysis?.predictedMetrics.engagementRate || 8.7}%
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {analysis?.optimizedContent || 'AI-optimized content with improved hashtags and engagement elements...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
