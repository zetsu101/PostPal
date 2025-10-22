"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Hash, 
  Target, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Copy,
  RefreshCw
} from 'lucide-react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { aiAnalyticsService, type ContentAnalysis, type PerformancePrediction, type ContentOptimization } from '@/lib/ai-analytics';

interface SmartContentOptimizerProps {
  initialContent?: string;
  platform?: string;
  targetAudience?: string;
  onContentOptimized?: (optimizedContent: string) => void;
}

export default function SmartContentOptimizer({
  initialContent = '',
  platform = 'instagram',
  targetAudience = 'General audience',
  onContentOptimized
}: SmartContentOptimizerProps) {
  const [content, setContent] = useState(initialContent);
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null);
  const [optimization, setOptimization] = useState<ContentOptimization | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'optimization' | 'prediction'>('analysis');
  const { addToast } = useToast();

  const analyzeContent = async () => {
    if (!content.trim()) {
      addToast({
        title: 'Content Required',
        message: 'Please enter some content to analyze.',
        type: 'error',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const [analysisResult, predictionResult] = await Promise.all([
        aiAnalyticsService.analyzeContent(content, platform, targetAudience),
        aiAnalyticsService.predictPerformance(content, platform),
      ]);

      setAnalysis(analysisResult);
      setPrediction(predictionResult);
      setActiveTab('analysis');
    } catch (error) {
      console.error('Analysis failed:', error);
      addToast({
        title: 'Analysis Failed',
        message: 'Failed to analyze content. Please try again.',
        type: 'error',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const optimizeContent = async () => {
    if (!content.trim()) {
      addToast({
        title: 'Content Required',
        message: 'Please enter some content to optimize.',
        type: 'error',
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const optimizationResult = await aiAnalyticsService.optimizeContent(content, platform, 'engagement');
      setOptimization(optimizationResult);
      setActiveTab('optimization');
      
      if (onContentOptimized) {
        onContentOptimized(optimizationResult.optimizedContent);
      }
    } catch (error) {
      console.error('Optimization failed:', error);
      addToast({
        title: 'Optimization Failed',
        message: 'Failed to optimize content. Please try again.',
        type: 'error',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      title: 'Copied!',
      message: 'Content copied to clipboard.',
      type: 'success',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4" />;
    if (score >= 60) return <AlertCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Smart Content Optimizer</h2>
              <p className="text-sm text-gray-600">AI-powered content analysis and optimization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Input */}
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content to Analyze
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your social media content here..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={analyzeContent}
              disabled={isAnalyzing || !content.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
            </Button>

            <Button
              onClick={optimizeContent}
              disabled={isOptimizing || !content.trim()}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isOptimizing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {isOptimizing ? 'Optimizing...' : 'Optimize Content'}
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {(analysis || prediction || optimization) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border-t border-gray-200"
          >
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'analysis', label: 'Analysis', icon: <Brain className="w-4 h-4" />, condition: analysis },
                { id: 'optimization', label: 'Optimization', icon: <Sparkles className="w-4 h-4" />, condition: optimization },
                { id: 'prediction', label: 'Prediction', icon: <TrendingUp className="w-4 h-4" />, condition: prediction },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  disabled={!tab.condition}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : tab.condition
                      ? 'text-gray-600 hover:text-gray-900'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'analysis' && analysis && (
                <AnalysisResults analysis={analysis} />
              )}

              {activeTab === 'optimization' && optimization && (
                <OptimizationResults 
                  optimization={optimization} 
                  onCopy={() => copyToClipboard(optimization.optimizedContent)}
                />
              )}

              {activeTab === 'prediction' && prediction && (
                <PredictionResults prediction={prediction} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Analysis Results Component
function AnalysisResults({ analysis }: { analysis: ContentAnalysis }) {
  return (
    <div className="space-y-6">
      {/* Scores */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Engagement Score</span>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(analysis.engagementScore)}`}>
              {analysis.engagementScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analysis.engagementScore}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Virality Potential</span>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(analysis.viralityPotential)}`}>
              {analysis.viralityPotential}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analysis.viralityPotential}%` }}
            />
          </div>
        </div>
      </div>

      {/* Optimal Timing */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-900">Optimal Timing</span>
        </div>
        <p className="text-blue-700">{analysis.optimalTiming}</p>
      </div>

      {/* Suggested Hashtags */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Hash className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900">Suggested Hashtags</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.suggestedHashtags.map((hashtag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
            >
              {hashtag}
            </span>
          ))}
        </div>
      </div>

      {/* Improvements */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Target className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900">Suggested Improvements</span>
        </div>
        <ul className="space-y-2">
          {analysis.improvements.map((improvement, index) => (
            <li key={index} className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{improvement}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Optimization Results Component
function OptimizationResults({ 
  optimization, 
  onCopy 
}: { 
  optimization: ContentOptimization; 
  onCopy: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Improvement Score */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-purple-900">Improvement Score</span>
          <span className="text-2xl font-bold text-purple-600">
            +{optimization.improvementScore}%
          </span>
        </div>
        <p className="text-purple-700 text-sm">
          Content optimized for better engagement and performance
        </p>
      </div>

      {/* Optimized Content */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-900">Optimized Content</span>
          <Button onClick={onCopy} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-900 whitespace-pre-wrap">{optimization.optimizedContent}</p>
        </div>
      </div>

      {/* Changes Made */}
      <div>
        <span className="font-medium text-gray-900 mb-3 block">Changes Made</span>
        <div className="space-y-3">
          {optimization.changes.map((change, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                change.impact === 'high' ? 'bg-green-500' :
                change.impact === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    change.type === 'add' ? 'bg-green-100 text-green-700' :
                    change.type === 'remove' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {change.type.toUpperCase()}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    change.impact === 'high' ? 'bg-green-100 text-green-700' :
                    change.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {change.impact.toUpperCase()} IMPACT
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{change.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Prediction Results Component
function PredictionResults({ prediction }: { prediction: PerformancePrediction }) {
  return (
    <div className="space-y-6">
      {/* Confidence Score */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-blue-900">Prediction Confidence</span>
          <span className="text-xl font-bold text-blue-600">{prediction.confidence}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${prediction.confidence}%` }}
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{prediction.estimatedReach.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Estimated Reach</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{prediction.estimatedEngagement.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Engagement</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{prediction.estimatedLikes.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Likes</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{prediction.estimatedComments.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Comments</div>
        </div>
      </div>

      {/* Influencing Factors */}
      <div>
        <span className="font-medium text-gray-900 mb-3 block">Key Factors</span>
        <div className="space-y-2">
          {prediction.factors.map((factor, index) => (
            <div key={index} className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700">{factor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600 bg-green-100';
  if (score >= 60) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
}
