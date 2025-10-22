"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Gauge, 
  HardDrive, 
  Network, 
  Cpu, 
  MemoryStick,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Monitor,
  Smartphone,
  Globe,
  Database,
  Image,
  Code,
  BarChart3
} from 'lucide-react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';

// Performance optimization interfaces
interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  target: number;
  improvement: number;
  category: 'speed' | 'size' | 'efficiency' | 'user-experience';
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  category: string;
  applied: boolean;
  estimatedImprovement: string;
}

interface BundleAnalysis {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  unusedCode: number;
  duplicates: number;
  recommendations: string[];
}

// Mock performance data
const mockMetrics: PerformanceMetric[] = [
  {
    id: '1',
    name: 'First Contentful Paint',
    value: 1.2,
    unit: 's',
    status: 'good',
    target: 1.5,
    improvement: 20,
    category: 'speed'
  },
  {
    id: '2',
    name: 'Largest Contentful Paint',
    value: 2.1,
    unit: 's',
    status: 'good',
    target: 2.5,
    improvement: 16,
    category: 'speed'
  },
  {
    id: '3',
    name: 'Cumulative Layout Shift',
    value: 0.08,
    unit: '',
    status: 'warning',
    target: 0.1,
    improvement: 20,
    category: 'user-experience'
  },
  {
    id: '4',
    name: 'First Input Delay',
    value: 85,
    unit: 'ms',
    status: 'good',
    target: 100,
    improvement: 15,
    category: 'user-experience'
  },
  {
    id: '5',
    name: 'Bundle Size',
    value: 245,
    unit: 'KB',
    status: 'warning',
    target: 200,
    improvement: 18,
    category: 'size'
  },
  {
    id: '6',
    name: 'Time to Interactive',
    value: 3.2,
    unit: 's',
    status: 'warning',
    target: 2.8,
    improvement: 12,
    category: 'speed'
  }
];

const mockOptimizations: OptimizationSuggestion[] = [
  {
    id: '1',
    title: 'Enable Code Splitting',
    description: 'Implement dynamic imports to reduce initial bundle size',
    impact: 'high',
    effort: 'medium',
    category: 'bundle',
    applied: false,
    estimatedImprovement: 'Reduce bundle size by 30%'
  },
  {
    id: '2',
    title: 'Optimize Images',
    description: 'Convert images to WebP format and implement lazy loading',
    impact: 'high',
    effort: 'easy',
    category: 'images',
    applied: true,
    estimatedImprovement: 'Improve LCP by 25%'
  },
  {
    id: '3',
    title: 'Implement Service Worker',
    description: 'Add service worker for caching and offline functionality',
    impact: 'medium',
    effort: 'hard',
    category: 'caching',
    applied: false,
    estimatedImprovement: 'Reduce repeat visits by 40%'
  },
  {
    id: '4',
    title: 'Remove Unused CSS',
    description: 'Purge unused CSS classes to reduce stylesheet size',
    impact: 'medium',
    effort: 'easy',
    category: 'bundle',
    applied: false,
    estimatedImprovement: 'Reduce CSS by 15%'
  },
  {
    id: '5',
    title: 'Enable Gzip Compression',
    description: 'Compress assets to reduce transfer size',
    impact: 'high',
    effort: 'easy',
    category: 'network',
    applied: true,
    estimatedImprovement: 'Reduce transfer size by 70%'
  },
  {
    id: '6',
    title: 'Implement Virtual Scrolling',
    description: 'Use virtual scrolling for large lists to improve performance',
    impact: 'medium',
    effort: 'medium',
    category: 'rendering',
    applied: false,
    estimatedImprovement: 'Improve scroll performance by 60%'
  }
];

const mockBundleAnalysis: BundleAnalysis = {
  totalSize: 245000,
  jsSize: 180000,
  cssSize: 45000,
  imageSize: 20000,
  unusedCode: 35000,
  duplicates: 12000,
  recommendations: [
    'Remove unused dependencies',
    'Implement tree shaking',
    'Split vendor and app bundles',
    'Use dynamic imports for routes'
  ]
};

export default function PerformanceOptimizer() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bundle' | 'optimizations' | 'monitoring'>('overview');
  const [metrics, setMetrics] = useState<PerformanceMetric[]>(mockMetrics);
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>(mockOptimizations);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bundleAnalysis, setBundleAnalysis] = useState<BundleAnalysis>(mockBundleAnalysis);
  const { addToast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleAnalyzePerformance = async () => {
    setIsAnalyzing(true);
    
    // Simulate performance analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      addToast({
        title: 'Analysis Complete',
        message: 'Performance analysis completed successfully!',
        type: 'success'
      });
    }, 2000);
  };

  const handleApplyOptimization = (optimizationId: string) => {
    setOptimizations(prev => prev.map(opt => 
      opt.id === optimizationId ? { ...opt, applied: true } : opt
    ));
    addToast({
      title: 'Optimization Applied',
      message: 'Performance optimization has been applied successfully!',
      type: 'success'
    });
  };

  const handleRemoveOptimization = (optimizationId: string) => {
    setOptimizations(prev => prev.map(opt => 
      opt.id === optimizationId ? { ...opt, applied: false } : opt
    ));
    addToast({
      title: 'Optimization Removed',
      message: 'Performance optimization has been removed.',
      type: 'info'
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Performance Overview',
      icon: <Gauge className="w-4 h-4" />,
      description: 'Core Web Vitals and performance metrics'
    },
    {
      id: 'bundle' as const,
      label: 'Bundle Analysis',
      icon: <HardDrive className="w-4 h-4" />,
      description: 'JavaScript bundle size and optimization'
    },
    {
      id: 'optimizations' as const,
      label: 'Optimizations',
      icon: <Zap className="w-4 h-4" />,
      description: 'Performance improvement suggestions'
    },
    {
      id: 'monitoring' as const,
      label: 'Real-time Monitoring',
      icon: <Monitor className="w-4 h-4" />,
      description: 'Live performance monitoring'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Optimizer</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Monitor and optimize your application performance
          </p>
        </div>
        <Button
          onClick={handleAnalyzePerformance}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Analyze Performance
            </>
          )}
        </Button>
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
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
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
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Performance Score */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Performance Score
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Based on Core Web Vitals and performance metrics
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-1">87</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Good</div>
                </div>
              </div>
            </div>

            {/* Core Web Vitals */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map((metric) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">{metric.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {metric.value}{metric.unit}
                      </span>
                      <span className="text-sm text-gray-500">Target: {metric.target}{metric.unit}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          metric.status === 'good' ? 'bg-green-500' : 
                          metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Improvement</span>
                      <span className="text-green-600 font-medium">+{metric.improvement}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bundle' && (
          <div className="space-y-6">
            {/* Bundle Size Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Bundle Size Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <HardDrive className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatBytes(bundleAnalysis.totalSize)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Size</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Code className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatBytes(bundleAnalysis.jsSize)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">JavaScript</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Image className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatBytes(bundleAnalysis.cssSize)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">CSS</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Image className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatBytes(bundleAnalysis.imageSize)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Images</div>
                </div>
              </div>

              {/* Bundle Breakdown Chart */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Bundle Composition</h4>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 flex overflow-hidden">
                  <div 
                    className="bg-blue-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${(bundleAnalysis.jsSize / bundleAnalysis.totalSize) * 100}%` }}
                  >
                    JS
                  </div>
                  <div 
                    className="bg-purple-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${(bundleAnalysis.cssSize / bundleAnalysis.totalSize) * 100}%` }}
                  >
                    CSS
                  </div>
                  <div 
                    className="bg-orange-500 flex items-center justify-center text-white text-sm font-medium"
                    style={{ width: `${(bundleAnalysis.imageSize / bundleAnalysis.totalSize) * 100}%` }}
                  >
                    Images
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Recommendations</h4>
                <div className="space-y-2">
                  {bundleAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <span className="text-gray-700 dark:text-gray-300">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'optimizations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance Optimizations
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{optimizations.filter(opt => opt.applied).length} applied</span>
                <span>•</span>
                <span>{optimizations.length - optimizations.filter(opt => opt.applied).length} pending</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {optimizations.map((optimization) => (
                <motion.div
                  key={optimization.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${
                    optimization.applied ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {optimization.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {optimization.description}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {optimization.estimatedImprovement}
                      </p>
                    </div>
                    {optimization.applied && (
                      <CheckCircle className="w-6 h-6 text-green-500 ml-4" />
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(optimization.impact)}`}>
                        {optimization.impact} impact
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEffortColor(optimization.effort)}`}>
                        {optimization.effort} effort
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 capitalize">{optimization.category}</span>
                  </div>

                  <Button
                    onClick={() => optimization.applied ? 
                      handleRemoveOptimization(optimization.id) : 
                      handleApplyOptimization(optimization.id)
                    }
                    variant={optimization.applied ? "outline" : "primary"}
                    size="sm"
                    className="w-full"
                  >
                    {optimization.applied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Applied
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Apply Optimization
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Real-time Performance Monitoring
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                  <Gauge className="w-8 h-8 text-green-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">98</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Performance Score</div>
                  <div className="text-xs text-green-600 mt-2">+2 from last hour</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <Network className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">245ms</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Response Time</div>
                  <div className="text-xs text-green-600 mt-2">-15ms from last hour</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                  <Cpu className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">23%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</div>
                  <div className="text-xs text-green-600 mt-2">Optimal</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
                  <MemoryStick className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">156MB</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</div>
                  <div className="text-xs text-green-600 mt-2">Stable</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
