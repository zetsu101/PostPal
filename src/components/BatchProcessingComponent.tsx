'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  BarChart3, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Trash2,
  Plus,
  Download,
  Eye,
  TrendingUp,
  Users,
  Clock,
  Zap
} from 'lucide-react';

interface ContentItem {
  id: string;
  text: string;
  platform: string;
  scheduledTime?: string;
}

interface BatchResult {
  index: number;
  contentScore?: number;
  engagementPrediction?: {
    predictedEngagement: number;
    confidence: number;
    factors: any;
  };
  features?: any;
  recommendations?: string[];
  error?: string;
  processingTime: number;
}

interface BatchStats {
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  averageContentScore: number;
  averageEngagement: number;
  processingTimeMs: number;
}

interface BatchResponse {
  results: BatchResult[];
  batchStats: BatchStats;
  platform: string;
  timestamp: string;
}

export default function BatchProcessingComponent() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [platform, setPlatform] = useState('instagram');
  const [results, setResults] = useState<BatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null);

  // Add new content item
  const addContentItem = () => {
    if (contentItems.length >= 10) {
      setError('Maximum 10 content items allowed per batch');
      return;
    }

    const newItem: ContentItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: '',
      platform: platform
    };

    setContentItems(prev => [...prev, newItem]);
  };

  // Update content item
  const updateContentItem = (id: string, field: keyof ContentItem, value: any) => {
    setContentItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Remove content item
  const removeContentItem = (id: string) => {
    setContentItems(prev => prev.filter(item => item.id !== id));
    setSelectedItems(new Set());
  };

  // Toggle item selection
  const toggleItemSelection = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.size === contentItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(contentItems.map((_, index) => index)));
    }
  };

  // Process batch analysis
  const processBatch = async () => {
    const validItems = contentItems.filter(item => item.text.trim());
    
    if (validItems.length === 0) {
      setError('Please add at least one content item with text');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/ai/batch-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contentItems: validItems.map(item => ({
            content: {
              text: item.text,
              sentiment: 0,
              readability: 60,
              urgency: 0,
              callToAction: item.text.toLowerCase().includes('click') || item.text.toLowerCase().includes('learn more'),
              trendingTopics: [],
              scheduledTime: item.scheduledTime || new Date().toISOString()
            }
          })),
          platform,
          audienceData: null,
          historicalData: []
        })
      });

      // Extract rate limit info
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
        throw new Error(errorData.error?.message || 'Failed to process batch analysis');
      }

      const data = await response.json();
      setResults(data.data);

    } catch (error) {
      console.error('Batch processing error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process batch analysis');
    } finally {
      setLoading(false);
    }
  };

  // Clear all content
  const clearAll = () => {
    setContentItems([]);
    setResults(null);
    setError(null);
    setSelectedItems(new Set());
  };

  // Export results
  const exportResults = () => {
    if (!results) return;

    const exportData = {
      platform: results.platform,
      timestamp: results.timestamp,
      batchStats: results.batchStats,
      results: results.results.map(result => ({
        index: result.index,
        contentScore: result.contentScore,
        engagement: result.engagementPrediction?.predictedEngagement,
        confidence: result.engagementPrediction?.confidence,
        recommendations: result.recommendations,
        error: result.error
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Batch Content Analysis
              </h1>
              <p className="text-gray-600">
                Analyze up to 10 content items simultaneously with AI-powered insights
              </p>
            </div>
            
            {rateLimitInfo && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{rateLimitInfo.remaining}</span> requests remaining
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-500" />
                  Content Items
                </h2>
                <div className="text-sm text-gray-500">
                  {contentItems.length}/10
                </div>
              </div>

              {/* Platform Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              {/* Content Items */}
              <div className="space-y-3 mb-4">
                {contentItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(index)}
                          onChange={() => toggleItemSelection(index)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Item {index + 1}
                        </span>
                      </div>
                      <button
                        onClick={() => removeContentItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={item.text}
                      onChange={(e) => updateContentItem(item.id, 'text', e.target.value)}
                      placeholder="Enter content here..."
                      rows={3}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={addContentItem}
                  disabled={contentItems.length >= 10}
                  className="w-full flex items-center justify-center px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Content Item
                </button>

                {contentItems.length > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={selectAllItems}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      {selectedItems.size === contentItems.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={clearAll}
                      className="flex-1 px-3 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                    >
                      Clear All
                    </button>
                  </div>
                )}

                <button
                  onClick={processBatch}
                  disabled={loading || contentItems.filter(item => item.text.trim()).length === 0}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Processing...' : 'Process Batch'}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">Processing Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {results ? (
              <div className="space-y-6">
                {/* Batch Statistics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                      Batch Statistics
                    </h3>
                    <button
                      onClick={exportResults}
                      className="flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {results.batchStats.totalItems}
                      </div>
                      <div className="text-sm text-gray-600">Total Items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {results.batchStats.successfulItems}
                      </div>
                      <div className="text-sm text-gray-600">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {results.batchStats.averageContentScore}
                      </div>
                      <div className="text-sm text-gray-600">Avg Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {(results.batchStats.averageEngagement * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Avg Engagement</div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    Processing time: {results.batchStats.processingTimeMs}ms
                  </div>
                </motion.div>

                {/* Individual Results */}
                <div className="space-y-4">
                  {results.results.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Content Item {result.index + 1}
                        </h4>
                        {result.error ? (
                          <div className="flex items-center text-red-600">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">Error</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">Success</span>
                          </div>
                        )}
                      </div>

                      {result.error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-700">{result.error}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Content Score */}
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(result.contentScore || 0)}`}>
                              {result.contentScore}
                            </div>
                            <div className="text-sm text-gray-600">Content Score</div>
                          </div>

                          {/* Engagement */}
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {((result.engagementPrediction?.predictedEngagement || 0) * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">Engagement</div>
                            <div className="text-xs text-gray-500">
                              {(result.engagementPrediction?.confidence || 0) * 100}% confidence
                            </div>
                          </div>

                          {/* Recommendations Count */}
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {result.recommendations?.length || 0}
                            </div>
                            <div className="text-sm text-gray-600">Recommendations</div>
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {result.recommendations && result.recommendations.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Top Recommendations:</h5>
                          <div className="space-y-1">
                            {result.recommendations.slice(0, 3).map((rec, recIndex) => (
                              <div key={recIndex} className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                                {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready for Batch Analysis
                </h3>
                <p className="text-gray-600">
                  Add content items above to analyze multiple pieces of content simultaneously
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
