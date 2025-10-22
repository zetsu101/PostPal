"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Zap, 
  RefreshCw, 
  Cloud, 
  Shield, 
  TrendingUp, 
  Users, 
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAnalytics, useChartData, usePlatformPerformance, useTopPosts, useContentGeneration } from '@/hooks/useData';
import { analyticsAPI } from '@/lib/api';
import { localStorage, getStorageStats, sessionStorage, memoryCache } from '@/lib/storage';
import Button from '@/components/ui/Button';
import { Container } from '@/components/Container';

export default function APIDemoPage() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isConnected, setIsConnected] = useState(false);
  const [storageStats, setStorageStats] = useState(getStorageStats());

  // Data hooks
  const analytics = useAnalytics('7d');
  const chartData = useChartData(7);
  const platforms = usePlatformPerformance();
  const topPosts = useTopPosts(5);
  const contentGen = useContentGeneration();

  // Mock WebSocket connection
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(prev => !prev);
      setStorageStats(getStorageStats());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'analytics', label: 'Analytics API', icon: BarChart3 },
    { id: 'content', label: 'Content API', icon: Zap },
    { id: 'storage', label: 'Data Storage', icon: Database },
    { id: 'realtime', label: 'Real-time', icon: Cloud },
  ];

  const handleGenerateContent = async () => {
    try {
      await contentGen.generate('Create a motivational post about productivity', {
        platform: 'Instagram',
        contentType: 'educational',
        tone: 'motivational'
      });
    } catch (error) {
      console.error('Content generation failed:', error);
    }
  };

  const handleRefreshAnalytics = async () => {
    try {
      await analyticsAPI.refreshAnalytics();
      analytics.refresh();
    } catch (error) {
      console.error('Analytics refresh failed:', error);
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    setStorageStats(getStorageStats());
  };

  return (
    <Container>
      <div className="min-h-screen py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 PostPal API & Data Management Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the power of our comprehensive API layer, intelligent caching, 
            real-time updates, and robust data persistence system.
          </p>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-semibold text-gray-700">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              {isConnected ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Storage: {storageStats.localStorage} items</span>
              <span>Cache: {storageStats.memoryCache} items</span>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Analytics Status */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Analytics Status</h3>
                      <div className={`w-2 h-2 rounded-full ${analytics.isSuccess ? 'bg-green-500' : analytics.isError ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${analytics.isSuccess ? 'text-green-600' : analytics.isError ? 'text-red-600' : 'text-yellow-600'}`}>
                          {analytics.loading}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="text-gray-800">
                          {analytics.lastUpdated ? new Date(analytics.lastUpdated).toLocaleTimeString() : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auto-refresh:</span>
                        <span className="text-green-600">Active</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleRefreshAnalytics}
                      disabled={analytics.isRefreshing}
                      className="w-full mt-4"
                      loading={analytics.isRefreshing}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Analytics
                    </Button>
                  </motion.div>

                  {/* Chart Data Status */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Chart Data</h3>
                      <div className={`w-2 h-2 rounded-full ${chartData.isSuccess ? 'bg-green-500' : chartData.isError ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data Points:</span>
                        <span className="text-gray-800">
                          {chartData.data ? chartData.data.length : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cache TTL:</span>
                        <span className="text-gray-800">2 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Real-time:</span>
                        <span className="text-green-600">Enabled</span>
                      </div>
                    </div>
                    <Button
                      onClick={chartData.refresh}
                      disabled={chartData.isRefreshing}
                      className="w-full mt-4"
                      loading={chartData.isRefreshing}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Charts
                    </Button>
                  </motion.div>

                  {/* Platform Performance */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Platform Data</h3>
                      <div className={`w-2 h-2 rounded-full ${platforms.isSuccess ? 'bg-green-500' : platforms.isError ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platforms:</span>
                        <span className="text-gray-800">
                          {platforms.data ? platforms.data.length : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cache TTL:</span>
                        <span className="text-gray-800">5 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auto-refresh:</span>
                        <span className="text-green-600">Active</span>
                      </div>
                    </div>
                    <Button
                      onClick={platforms.refresh}
                      disabled={platforms.isRefreshing}
                      className="w-full mt-4"
                      loading={platforms.isRefreshing}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Platforms
                    </Button>
                  </motion.div>
                </div>

                {/* Data Flow Visualization */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                    🔄 Data Flow Architecture
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Cloud className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-800">API Layer</h4>
                      <p className="text-sm text-gray-600">RESTful endpoints</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Shield className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="font-medium text-gray-800">Cache Layer</h4>
                      <p className="text-sm text-gray-600">Smart TTL caching</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Database className="w-8 h-8 text-purple-600" />
                      </div>
                      <h4 className="font-medium text-gray-800">Storage</h4>
                      <p className="text-sm text-gray-600">Local persistence</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-8 h-8 text-orange-600" />
                      </div>
                      <h4 className="font-medium text-gray-800">Real-time</h4>
                      <p className="text-sm text-gray-600">Live updates</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Content Generation */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Content Generation</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${contentGen.isGenerating ? 'text-yellow-600' : 'text-green-600'}`}>
                          {contentGen.isGenerating ? 'Generating...' : 'Ready'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Generated:</span>
                        <span className="text-gray-800">{contentGen.generatedContent.length} items</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Error:</span>
                        <span className={`font-medium ${contentGen.error ? 'text-red-600' : 'text-green-600'}`}>
                          {contentGen.error ? 'Yes' : 'None'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={handleGenerateContent}
                        disabled={contentGen.isGenerating}
                        loading={contentGen.isGenerating}
                        className="flex-1"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Content
                      </Button>
                      <Button
                        onClick={contentGen.clearGenerated}
                        variant="outline"
                        className="flex-1"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </motion.div>

                  {/* Top Posts */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Posts</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${topPosts.isSuccess ? 'text-green-600' : topPosts.isError ? 'text-red-600' : 'text-yellow-600'}`}>
                          {topPosts.loading}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Posts:</span>
                        <span className="text-gray-800">
                          {topPosts.data ? topPosts.data.length : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auto-refresh:</span>
                        <span className="text-green-600">Active</span>
                      </div>
                    </div>
                    <Button
                      onClick={topPosts.refresh}
                      disabled={topPosts.isRefreshing}
                      className="w-full mt-4"
                      loading={topPosts.isRefreshing}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Posts
                    </Button>
                  </motion.div>
                </div>

                {/* Generated Content Display */}
                {contentGen.generatedContent.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated Content</h3>
                    <div className="space-y-3">
                                          {contentGen.generatedContent.map((content, index) => {
                      const typedContent = content as {
                        type: string;
                        platform: string;
                        content: string;
                        engagement: number;
                        difficulty: string;
                        tone: string;
                      };
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 capitalize">{typedContent.type}</span>
                            <span className="text-sm text-gray-500">{typedContent.platform}</span>
                          </div>
                          <p className="text-gray-800">{typedContent.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Engagement: {typedContent.engagement}</span>
                            <span>Difficulty: {typedContent.difficulty}</span>
                            <span>Tone: {typedContent.tone}</span>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Local Storage */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Local Storage</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items:</span>
                        <span className="text-gray-800">{storageStats.localStorage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="text-gray-800">Persistent</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">TTL:</span>
                        <span className="text-gray-800">24 hours</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        localStorage.clear();
                        setStorageStats(getStorageStats());
                      }}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Clear Storage
                    </Button>
                  </motion.div>

                  {/* Session Storage */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Storage</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items:</span>
                        <span className="text-gray-800">{storageStats.sessionStorage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="text-gray-800">Temporary</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">TTL:</span>
                        <span className="text-gray-800">1 hour</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        sessionStorage.clear();
                        setStorageStats(getStorageStats());
                      }}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Clear Session
                    </Button>
                  </motion.div>

                  {/* Memory Cache */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Memory Cache</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items:</span>
                        <span className="text-gray-800">{storageStats.memoryCache}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="text-gray-800">Volatile</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">TTL:</span>
                        <span className="text-gray-800">5 minutes</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        memoryCache.clear();
                        setStorageStats(getStorageStats());
                      }}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Clear Cache
                    </Button>
                  </motion.div>
                </div>

                {/* Storage Actions */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                    🗄️ Storage Management
                  </h3>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button
                      onClick={handleClearCache}
                      variant="outline"
                      className="bg-white"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear All Data
                    </Button>
                    <Button
                      onClick={() => setStorageStats(getStorageStats())}
                      variant="outline"
                      className="bg-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Stats
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'realtime' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* WebSocket Status */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">WebSocket Connection</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status:</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                            {isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reconnection:</span>
                        <span className="text-green-600">Auto-enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Heartbeat:</span>
                        <span className="text-green-600">Active</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => setIsConnected(true)}
                        disabled={isConnected}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                      <Button
                        onClick={() => setIsConnected(false)}
                        disabled={!isConnected}
                        variant="outline"
                        className="flex-1"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </motion.div>

                  {/* Real-time Updates */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Real-time Updates</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Analytics:</span>
                        <span className="text-green-600">Live</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Charts:</span>
                        <span className="text-green-600">Live</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platforms:</span>
                        <span className="text-green-600">Live</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Posts:</span>
                        <span className="text-green-600">Live</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">All systems operational</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Live Data Stream */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                    📡 Live Data Stream Simulation
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-800">Followers</h4>
                      <p className="text-2xl font-bold text-blue-600">+12</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="font-medium text-gray-800">Engagement</h4>
                      <p className="text-2xl font-bold text-green-600">+8.2%</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <BarChart3 className="w-8 h-8 text-purple-600" />
                      </div>
                      <h4 className="font-medium text-gray-800">Impressions</h4>
                      <p className="text-2xl font-bold text-purple-600">+1.2K</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-8 h-8 text-orange-600" />
                      </div>
                      <h4 className="font-medium text-gray-800">Last Update</h4>
                      <p className="text-sm font-bold text-orange-600">Now</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-gray-500"
        >
          <p className="text-sm">
            This demo showcases PostPal&apos;s enterprise-grade data management capabilities.
            <br />
            All data is cached locally and automatically synchronized with the backend API.
          </p>
        </motion.div>
      </div>
    </Container>
  );
}
