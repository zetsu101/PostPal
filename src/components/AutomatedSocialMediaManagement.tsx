'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  Square as Stop, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Share2, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Zap, 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  BarChart3, 
  Filter, 
  Search, 
  Download, 
  Upload, 
  RefreshCw, 
  Save, 
  Send, 
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
  Upload as UploadIcon, 
  Download as DownloadIcon, 
  Cloud, 
  CloudOff, 
  CloudUpload, 
  CloudDownload, 
  Wifi, 
  WifiOff, 
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

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  scheduledTime: Date;
  status: 'scheduled' | 'publishing' | 'published' | 'failed';
  aiScore?: number;
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: 'time' | 'event' | 'condition';
  conditions: any[];
  actions: any[];
  enabled: boolean;
  createdAt: Date;
}

interface PlatformAccount {
  id: string;
  platform: string;
  username: string;
  connected: boolean;
  lastSync: Date;
  metrics: {
    followers: number;
    following: number;
    posts: number;
  };
}

export default function AutomatedSocialMediaManagement() {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [platformAccounts, setPlatformAccounts] = useState<PlatformAccount[]>([]);
  const [selectedView, setSelectedView] = useState<'scheduler' | 'automation' | 'accounts' | 'analytics'>('scheduler');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const { isConnected: wsConnected, lastMessage } = useAIInsightsWebSocket();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize data
  useEffect(() => {
    // Mock scheduled posts
    setScheduledPosts([
      {
        id: '1',
        title: 'AI-Powered Social Media Tips',
        content: 'Discover how AI can revolutionize your social media strategy! #AI #SocialMedia #Innovation',
        platforms: ['instagram', 'twitter', 'linkedin'],
        scheduledTime: new Date(Date.now() + 3600000), // 1 hour from now
        status: 'scheduled',
        aiScore: 87,
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        title: 'Behind the Scenes: Product Launch',
        content: 'Excited to share the behind-the-scenes of our latest product launch! 🚀',
        platforms: ['instagram', 'facebook'],
        scheduledTime: new Date(Date.now() + 7200000), // 2 hours from now
        status: 'scheduled',
        aiScore: 92,
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 7200000)
      },
      {
        id: '3',
        title: 'Quick Tutorial: Advanced Features',
        content: 'Learn how to use our advanced features in just 2 minutes! ⚡',
        platforms: ['twitter', 'tiktok'],
        scheduledTime: new Date(Date.now() - 1800000), // 30 minutes ago
        status: 'published',
        aiScore: 74,
        metrics: {
          views: 12000,
          likes: 320,
          comments: 42,
          shares: 35
        },
        createdAt: new Date(Date.now() - 259200000),
        updatedAt: new Date(Date.now() - 1800000)
      }
    ]);

    // Mock automation rules
    setAutomationRules([
      {
        id: '1',
        name: 'Peak Time Posting',
        description: 'Automatically post during peak engagement hours',
        trigger: 'time',
        conditions: [
          { type: 'time_range', start: '09:00', end: '17:00' },
          { type: 'day_of_week', days: [1, 2, 3, 4, 5] }
        ],
        actions: [
          { type: 'schedule_post', platforms: ['instagram', 'twitter'] }
        ],
        enabled: true,
        createdAt: new Date(Date.now() - 86400000)
      },
      {
        id: '2',
        name: 'High Engagement Response',
        description: 'Automatically respond to high engagement posts',
        trigger: 'event',
        conditions: [
          { type: 'engagement_threshold', metric: 'likes', value: 100 }
        ],
        actions: [
          { type: 'send_notification', message: 'High engagement detected!' }
        ],
        enabled: true,
        createdAt: new Date(Date.now() - 172800000)
      }
    ]);

    // Mock platform accounts
    setPlatformAccounts([
      {
        id: '1',
        platform: 'instagram',
        username: '@postpal_official',
        connected: true,
        lastSync: new Date(Date.now() - 300000),
        metrics: {
          followers: 12500,
          following: 850,
          posts: 245
        }
      },
      {
        id: '2',
        platform: 'twitter',
        username: '@PostPalApp',
        connected: true,
        lastSync: new Date(Date.now() - 600000),
        metrics: {
          followers: 8900,
          following: 1200,
          posts: 189
        }
      },
      {
        id: '3',
        platform: 'linkedin',
        username: 'PostPal Company',
        connected: true,
        lastSync: new Date(Date.now() - 900000),
        metrics: {
          followers: 5600,
          following: 450,
          posts: 78
        }
      },
      {
        id: '4',
        platform: 'facebook',
        username: 'PostPal',
        connected: false,
        lastSync: new Date(Date.now() - 86400000),
        metrics: {
          followers: 0,
          following: 0,
          posts: 0
        }
      }
    ]);

  }, []);

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage?.type === 'insight_update') {
      const update = lastMessage.data;
      
      if (update.type === 'post_scheduled') {
        const newPost: ScheduledPost = {
          id: `post_${Date.now()}`,
          title: update.data.title,
          content: update.data.content,
          platforms: update.data.platforms,
          scheduledTime: new Date(update.data.scheduledTime),
          status: 'scheduled',
          aiScore: update.data.aiScore,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setScheduledPosts(prev => [newPost, ...prev]);
      }
      
      if (update.type === 'post_published') {
        setScheduledPosts(prev => prev.map(post => 
          post.id === update.data.postId 
            ? { ...post, status: 'published', metrics: update.data.metrics }
            : post
        ));
      }
      
      setLastUpdate(new Date());
    }
  }, [lastMessage]);

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">IG</div>;
      case 'twitter':
        return <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">TW</div>;
      case 'linkedin':
        return <div className="w-6 h-6 bg-blue-700 rounded flex items-center justify-center text-white text-xs font-bold">LI</div>;
      case 'facebook':
        return <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">FB</div>;
      case 'tiktok':
        return <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white text-xs font-bold">TT</div>;
      default:
        return <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center text-white text-xs font-bold">?</div>;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'publishing':
        return 'bg-yellow-100 text-yellow-700';
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'publishing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'published':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleString();
  };

  // Get time until scheduled
  const getTimeUntilScheduled = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Past due';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Create new post
  const createNewPost = () => {
    setIsCreatingPost(true);
    // In a real implementation, this would open a modal or navigate to a form
    setTimeout(() => setIsCreatingPost(false), 2000);
  };

  // Pause/Resume post
  const togglePostStatus = (postId: string) => {
    setScheduledPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, status: post.status === 'scheduled' ? 'publishing' : 'scheduled' }
        : post
    ));
  };

  // Delete post
  const deletePost = (postId: string) => {
    setScheduledPosts(prev => prev.filter(post => post.id !== postId));
  };

  // Toggle automation rule
  const toggleAutomationRule = (ruleId: string) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ));
  };

  // Connect platform account
  const connectPlatformAccount = (accountId: string) => {
    setPlatformAccounts(prev => prev.map(account => 
      account.id === accountId 
        ? { ...account, connected: true, lastSync: new Date() }
        : account
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Automated Social Media Management
              </h1>
              <p className="text-gray-600">
                Schedule, automate, and manage your social media presence
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                wsConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {wsConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span>{wsConnected ? 'Live' : 'Offline'}</span>
              </div>
              
              <button
                onClick={createNewPost}
                disabled={isCreatingPost}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isCreatingPost ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isCreatingPost ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'scheduler', name: 'Scheduler', icon: <Calendar className="w-4 h-4" /> },
              { id: 'automation', name: 'Automation', icon: <Zap className="w-4 h-4" /> },
              { id: 'accounts', name: 'Accounts', icon: <Users className="w-4 h-4" /> },
              { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scheduler View */}
        {selectedView === 'scheduler' && (
          <div className="space-y-6">
            {/* Scheduled Posts */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                  Scheduled Posts
                </h2>
                
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    <Filter className="w-4 h-4 mr-1" />
                    Filter
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    <Search className="w-4 h-4 mr-1" />
                    Search
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {scheduledPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{post.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full flex items-center ${getStatusColor(post.status)}`}>
                            {getStatusIcon(post.status)}
                            <span className="ml-1">{post.status}</span>
                          </span>
                          {post.aiScore && (
                            <span className="text-xs text-purple-600">
                              AI Score: {post.aiScore}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{post.content}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(post.scheduledTime)}</span>
                          </div>
                          <span>•</span>
                          <span>{getTimeUntilScheduled(post.scheduledTime)}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            {post.platforms.map(platform => (
                              <div key={platform} className="flex items-center">
                                {getPlatformIcon(platform)}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {post.metrics && (
                          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                            <span>{post.metrics.views} views</span>
                            <span>{post.metrics.likes} likes</span>
                            <span>{post.metrics.comments} comments</span>
                            <span>{post.metrics.shares} shares</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => togglePostStatus(post.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded"
                          title={post.status === 'scheduled' ? 'Pause' : 'Resume'}
                        >
                          {post.status === 'scheduled' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => deletePost(post.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Automation View */}
        {selectedView === 'automation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Automation Rules
                </h2>
                
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </button>
              </div>
              
              <div className="space-y-4">
                {automationRules.map((rule, index) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{rule.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                        
                        <div className="text-xs text-gray-500">
                          <span>Trigger: {rule.trigger}</span>
                          <span className="mx-2">•</span>
                          <span>Created: {rule.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleAutomationRule(rule.id)}
                          className={`px-3 py-1 text-xs rounded ${
                            rule.enabled 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {rule.enabled ? 'Disable' : 'Enable'}
                        </button>
                        
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        <button className="p-2 text-gray-400 hover:text-red-600 rounded" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Accounts View */}
        {selectedView === 'accounts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-500" />
                  Platform Accounts
                </h2>
                
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Account
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platformAccounts.map((account, index) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getPlatformIcon(account.platform)}
                        <div>
                          <h3 className="font-medium text-gray-900 capitalize">{account.platform}</h3>
                          <p className="text-sm text-gray-600">{account.username}</p>
                        </div>
                      </div>
                      
                      <div className={`w-3 h-3 rounded-full ${
                        account.connected ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Followers:</span>
                        <span className="font-medium">{account.metrics.followers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Following:</span>
                        <span className="font-medium">{account.metrics.following.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Posts:</span>
                        <span className="font-medium">{account.metrics.posts}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Last sync: {account.lastSync.toLocaleTimeString()}
                        </span>
                        
                        {!account.connected ? (
                          <button
                            onClick={() => connectPlatformAccount(account.id)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Connect
                          </button>
                        ) : (
                          <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                            <Settings className="w-3 h-3 mr-1" />
                            Settings
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {selectedView === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                Automation Analytics
              </h2>
              
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Analytics coming soon...</p>
                <p className="text-sm">Track automation performance and optimization opportunities</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              <span>•</span>
              <span>WebSocket: {wsConnected ? 'Connected' : 'Disconnected'}</span>
              <span>•</span>
              <span>Scheduled Posts: {scheduledPosts.length}</span>
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
