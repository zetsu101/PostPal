'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Zap,
  Brain,
  Target,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Bell,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Search,
  Plus,
  Edit3,
  Play,
  Pause,
  Square as Stop,
  CheckCircle,
  AlertCircle,
  Info,
  Wifi,
  WifiOff,
  Server,
  Database,
  Cpu,
  MemoryStick,
  HardDrive,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Camera,
  Image,
  Video,
  FileText,
  Link,
  Hash,
  AtSign,
  Send,
  Save,
  Trash2,
  Copy,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  Grid,
  List,
  Layout,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Quote,
  ListOrdered,
  Indent,
  Outdent,
  Link2,
  ImageIcon,
  VideoIcon,
  FileIcon,
  Music,
  Volume2,
  VolumeX,
  PlayCircle,
  PauseCircle,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Volume1,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  VideoOff,
  CameraOff,
  ScreenShare,
  ScreenShareOff,
  Users2,
  UserPlus,
  UserMinus,
  Shield,
  Lock,
  Unlock,
  Key,
  Mail,
  PhoneCall,
  MessageSquare,
  Mailbox,
  Inbox,
  Archive,
  Star,
  Bookmark,
  Flag,
  Tag,
  Tags,
  Folder,
  FolderOpen,
  File,
  Files,
  Upload,
  Download as DownloadIcon,
  Cloud,
  CloudOff,
  CloudUpload,
  CloudDownload,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Signal,
  Battery,
  Power,
  PowerOff,
  RotateCcw,
  RotateCw,
  RefreshCw as RefreshIcon,
  Loader2,
  Loader,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Heart as HeartIcon,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  ThumbsUp,
  ThumbsDown,
  Hand,
  Star as StarIcon,
  Moon,
  Sun,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Droplets,
  Snowflake,
  Wind,
  Thermometer,
  Compass,
  Map,
  MapPin,
  Navigation,
  Route,
  Car,
  Bus,
  Train,
  Plane,
  Ship,
  Rocket,
  Bike,
} from 'lucide-react';
import { useAIInsightsWebSocket } from '@/hooks/useWebSocket';

interface DashboardMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  trend: number[];
  unit: string;
  color: string;
  icon: React.ReactNode;
  category: 'engagement' | 'reach' | 'content' | 'ai' | 'system';
}

interface LiveActivity {
  id: string;
  type: 'content_created' | 'ai_analysis' | 'user_action' | 'system_event' | 'collaboration';
  title: string;
  description: string;
  timestamp: number;
  userId?: string;
  userName?: string;
  platform?: string;
  metadata?: any;
}

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  shortcut?: string;
}

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledTime?: Date;
  publishedTime?: Date;
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  aiScore?: number;
}

export default function ComprehensiveRealTimeDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedView, setSelectedView] = useState<'overview' | 'content' | 'analytics' | 'collaboration'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [mounted, setMounted] = useState(false);
  
  const { isConnected: wsConnected, lastMessage } = useAIInsightsWebSocket();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mount check to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize dashboard data
  useEffect(() => {
    // Dashboard metrics
    setMetrics([
      {
        id: 'total_engagement',
        name: 'Total Engagement',
        value: 45632,
        previousValue: 42300,
        change: 7.9,
        changeType: 'increase',
        trend: [35000, 38000, 40000, 41000, 42300, 45632],
        unit: '',
        color: 'text-green-600',
        icon: <Heart className="w-5 h-5" />,
        category: 'engagement'
      },
      {
        id: 'total_reach',
        name: 'Total Reach',
        value: 125000,
        previousValue: 118000,
        change: 5.9,
        changeType: 'increase',
        trend: [100000, 105000, 110000, 115000, 118000, 125000],
        unit: '',
        color: 'text-blue-600',
        icon: <Eye className="w-5 h-5" />,
        category: 'reach'
      },
      {
        id: 'content_published',
        name: 'Content Published',
        value: 24,
        previousValue: 18,
        change: 33.3,
        changeType: 'increase',
        trend: [12, 15, 16, 18, 18, 24],
        unit: '',
        color: 'text-purple-600',
        icon: <Share2 className="w-5 h-5" />,
        category: 'content'
      },
      {
        id: 'ai_analyses',
        name: 'AI Analyses',
        value: 892,
        previousValue: 756,
        change: 18.0,
        changeType: 'increase',
        trend: [500, 600, 650, 700, 756, 892],
        unit: '',
        color: 'text-orange-600',
        icon: <Brain className="w-5 h-5" />,
        category: 'ai'
      },
      {
        id: 'active_users',
        name: 'Active Users',
        value: 1247,
        previousValue: 1180,
        change: 5.7,
        changeType: 'increase',
        trend: [1000, 1050, 1100, 1150, 1180, 1247],
        unit: '',
        color: 'text-indigo-600',
        icon: <Users className="w-5 h-5" />,
        category: 'system'
      },
      {
        id: 'engagement_rate',
        name: 'Engagement Rate',
        value: 4.2,
        previousValue: 4.5,
        change: -6.7,
        changeType: 'decrease',
        trend: [4.8, 4.7, 4.6, 4.5, 4.5, 4.2],
        unit: '%',
        color: 'text-red-600',
        icon: <TrendingUp className="w-5 h-5" />,
        category: 'engagement'
      }
    ]);

    // Live activities
    setLiveActivities([
      {
        id: '1',
        type: 'content_created',
        title: 'New Content Created',
        description: 'AI-powered social media tips posted to Instagram',
        timestamp: Date.now() - 30000,
        userId: 'user-123',
        userName: 'Sarah Johnson',
        platform: 'instagram'
      },
      {
        id: '2',
        type: 'ai_analysis',
        title: 'AI Analysis Complete',
        description: 'Content scoring analysis completed for 15 posts',
        timestamp: Date.now() - 60000,
        metadata: { postsAnalyzed: 15, avgScore: 87 }
      },
      {
        id: '3',
        type: 'user_action',
        title: 'User Collaboration',
        description: 'Mike Chen joined live collaboration session',
        timestamp: Date.now() - 90000,
        userId: 'user-456',
        userName: 'Mike Chen'
      },
      {
        id: '4',
        type: 'system_event',
        title: 'System Optimization',
        description: 'AI service performance improved by 15%',
        timestamp: Date.now() - 120000
      }
    ]);

    // Recent content
    setRecentContent([
      {
        id: '1',
        title: 'AI-Powered Social Media Tips',
        platform: 'instagram',
        status: 'published',
        publishedTime: new Date(Date.now() - 3600000),
        metrics: {
          views: 15000,
          likes: 650,
          comments: 85,
          shares: 120
        },
        aiScore: 87
      },
      {
        id: '2',
        title: 'Behind the Scenes: Product Launch',
        platform: 'linkedin',
        status: 'scheduled',
        scheduledTime: new Date(Date.now() + 7200000),
        aiScore: 92
      },
      {
        id: '3',
        title: 'Quick Tutorial: Advanced Features',
        platform: 'twitter',
        status: 'draft',
        aiScore: 74
      }
    ]);

  }, []);

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage?.type === 'insight_update') {
      const update = lastMessage.data;
      
      if (update.type === 'dashboard_update') {
        // Update metrics
        setMetrics(prev => prev.map(metric => {
          if (metric.id === update.data.metricId) {
            const newValue = update.data.value;
            const change = ((newValue - metric.previousValue) / metric.previousValue) * 100;
            
            return {
              ...metric,
              value: newValue,
              previousValue: metric.value,
              change: change,
              changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral',
              trend: [...metric.trend.slice(1), newValue]
            };
          }
          return metric;
        }));
      }
      
      if (update.type === 'live_activity') {
        const newActivity: LiveActivity = {
          id: `activity_${Date.now()}`,
          type: update.data.type,
          title: update.data.title,
          description: update.data.description,
          timestamp: update.timestamp,
          userId: update.data.userId,
          userName: update.data.userName,
          platform: update.data.platform,
          metadata: update.data.metadata
        };
        
        setLiveActivities(prev => [newActivity, ...prev.slice(0, 19)]);
      }
      
      setLastUpdate(new Date());
    }
  }, [lastMessage]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        setLastUpdate(new Date());
      }, refreshInterval);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'create_content',
      name: 'Create Content',
      description: 'Start creating new social media content',
      icon: <Plus className="w-5 h-5" />,
      color: 'bg-blue-500',
      action: () => window.location.href = '/create',
      shortcut: 'Ctrl+N'
    },
    {
      id: 'ai_insights',
      name: 'AI Insights',
      description: 'Get AI-powered content insights',
      icon: <Brain className="w-5 h-5" />,
      color: 'bg-purple-500',
      action: () => window.location.href = '/ai-insights',
      shortcut: 'Ctrl+I'
    },
    {
      id: 'live_collaboration',
      name: 'Live Collaboration',
      description: 'Start real-time collaboration',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-green-500',
      action: () => window.location.href = '/live-collaboration',
      shortcut: 'Ctrl+L'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'View detailed analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'bg-orange-500',
      action: () => window.location.href = '/advanced-analytics',
      shortcut: 'Ctrl+A'
    }
  ];

  // Get change icon
  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decrease':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'content_created':
        return <Share2 className="w-4 h-4 text-blue-500" />;
      case 'ai_analysis':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'user_action':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'system_event':
        return <Server className="w-4 h-4 text-orange-500" />;
      case 'collaboration':
        return <Users className="w-4 h-4 text-indigo-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  // Refresh data
  const refreshData = () => {
    setLastUpdate(new Date());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 dark:from-black dark:to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                PostPal Real-Time Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive overview of your social media performance
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                wsConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {wsConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span>{wsConnected ? 'Live Data' : 'Offline'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="mr-2"
                  />
                  Auto-refresh
                </label>
                
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1000}>1s</option>
                  <option value={5000}>5s</option>
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                </select>
              </div>
              
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            {[
              { id: 'overview', name: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'content', name: 'Content', icon: <FileText className="w-4 h-4" /> },
              { id: 'analytics', name: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'collaboration', name: 'Collaboration', icon: <Users className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === tab.id
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={action.action}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left group border border-gray-200 dark:border-gray-800"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <div className="text-white">
                    {action.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{action.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{action.description}</p>
                {action.shortcut && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">Shortcut: {action.shortcut}</p>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        {selectedView === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-800"
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
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {metric.value.toLocaleString()}{metric.unit}
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
                            'bg-gray-200 dark:bg-gray-700'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Activities */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-500" />
                  Live Activities
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {liveActivities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.title}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {activity.description}
                          </p>
                          
                          {activity.userName && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              by {activity.userName}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Recent Content */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-500" />
                  Recent Content
                </h3>
                
                <div className="space-y-4">
                  {recentContent.map((content) => (
                    <div key={content.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{content.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{content.platform}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(content.status)}`}>
                            {content.status}
                          </span>
                          {content.aiScore && (
                            <span className="text-xs text-purple-600">
                              AI Score: {content.aiScore}
                            </span>
                          )}
                        </div>
                        
                        {content.metrics && (
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{content.metrics.views} views</span>
                            <span>{content.metrics.likes} likes</span>
                            <span>{content.metrics.comments} comments</span>
                            <span>{content.metrics.shares} shares</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-4">
              <span>Last updated: {mounted ? lastUpdate.toLocaleTimeString() : '--:--:--'}</span>
              <span>•</span>
              <span>WebSocket: {wsConnected ? 'Connected' : 'Disconnected'}</span>
              <span>•</span>
              <span>Auto-refresh: {autoRefresh ? 'On' : 'Off'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-blue-600 hover:text-blue-700 flex items-center">
                <Download className="w-4 h-4 mr-1" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
