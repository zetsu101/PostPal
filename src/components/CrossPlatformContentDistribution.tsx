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

interface CrossPlatformPost {
  id: string;
  title: string;
  content: string;
  platforms: {
    platform: string;
    content: string;
    scheduledTime: Date;
    status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
    metrics?: {
      views: number;
      likes: number;
      comments: number;
      shares: number;
    };
  }[];
  aiOptimization: {
    overallScore: number;
    platformScores: Record<string, number>;
    suggestions: string[];
  };
  teamCollaboration: {
    assignedTo?: string;
    reviewers: string[];
    status: 'draft' | 'review' | 'approved' | 'rejected';
    comments: {
      id: string;
      userId: string;
      userName: string;
      content: string;
      timestamp: Date;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'reviewer' | 'viewer';
  avatar?: string;
  isOnline: boolean;
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canApprove: boolean;
    canPublish: boolean;
  };
}

interface ContentCalendar {
  date: Date;
  posts: CrossPlatformPost[];
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
}

export default function CrossPlatformContentDistribution() {
  const [posts, setPosts] = useState<CrossPlatformPost[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [contentCalendar, setContentCalendar] = useState<ContentCalendar[]>([]);
  const [selectedView, setSelectedView] = useState<'calendar' | 'posts' | 'team' | 'analytics'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const { isConnected: wsConnected, lastMessage } = useAIInsightsWebSocket();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize data
  useEffect(() => {
    // Mock cross-platform posts
    setPosts([
      {
        id: '1',
        title: 'AI-Powered Social Media Revolution',
        content: 'Discover how AI is transforming social media marketing! #AI #SocialMedia #Innovation',
        platforms: [
          {
            platform: 'instagram',
            content: 'Discover how AI is transforming social media marketing! 🚀 #AI #SocialMedia #Innovation #Tech #Future',
            scheduledTime: new Date(Date.now() + 3600000),
            status: 'scheduled'
          },
          {
            platform: 'twitter',
            content: 'AI is revolutionizing social media marketing! 🚀 #AI #SocialMedia #Innovation',
            scheduledTime: new Date(Date.now() + 3600000),
            status: 'scheduled'
          },
          {
            platform: 'linkedin',
            content: 'How AI is transforming social media marketing strategies. Discover the future of digital marketing. #AI #SocialMedia #Innovation #Marketing #Technology',
            scheduledTime: new Date(Date.now() + 3600000),
            status: 'scheduled'
          }
        ],
        aiOptimization: {
          overallScore: 89,
          platformScores: {
            instagram: 92,
            twitter: 85,
            linkedin: 90
          },
          suggestions: [
            'Add more hashtags for Instagram',
            'Shorten content for Twitter',
            'Add professional tone for LinkedIn'
          ]
        },
        teamCollaboration: {
          assignedTo: 'user-1',
          reviewers: ['user-2', 'user-3'],
          status: 'approved',
          comments: [
            {
              id: '1',
              userId: 'user-2',
              userName: 'Sarah Johnson',
              content: 'Great content! Consider adding a call-to-action.',
              timestamp: new Date(Date.now() - 3600000)
            }
          ]
        },
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        title: 'Behind the Scenes: Product Launch',
        content: 'Excited to share the behind-the-scenes of our latest product launch!',
        platforms: [
          {
            platform: 'instagram',
            content: 'Excited to share the behind-the-scenes of our latest product launch! 🚀 #BehindTheScenes #ProductLaunch #Innovation',
            scheduledTime: new Date(Date.now() + 7200000),
            status: 'scheduled'
          },
          {
            platform: 'facebook',
            content: 'Excited to share the behind-the-scenes of our latest product launch! 🚀',
            scheduledTime: new Date(Date.now() + 7200000),
            status: 'scheduled'
          }
        ],
        aiOptimization: {
          overallScore: 78,
          platformScores: {
            instagram: 82,
            facebook: 74
          },
          suggestions: [
            'Add more engaging visuals',
            'Include user testimonials'
          ]
        },
        teamCollaboration: {
          assignedTo: 'user-3',
          reviewers: ['user-1'],
          status: 'review',
          comments: []
        },
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 7200000)
      }
    ]);

    // Mock team members
    setTeamMembers([
      {
        id: 'user-1',
        name: 'Sarah Johnson',
        email: 'sarah@postpal.com',
        role: 'admin',
        isOnline: true,
        permissions: {
          canCreate: true,
          canEdit: true,
          canApprove: true,
          canPublish: true
        }
      },
      {
        id: 'user-2',
        name: 'Mike Chen',
        email: 'mike@postpal.com',
        role: 'editor',
        isOnline: true,
        permissions: {
          canCreate: true,
          canEdit: true,
          canApprove: false,
          canPublish: false
        }
      },
      {
        id: 'user-3',
        name: 'Emily Davis',
        email: 'emily@postpal.com',
        role: 'reviewer',
        isOnline: false,
        permissions: {
          canCreate: false,
          canEdit: false,
          canApprove: true,
          canPublish: false
        }
      }
    ]);

    // Generate content calendar
    const calendar: ContentCalendar[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const dayPosts = posts.filter(post => 
        post.platforms.some(platform => 
          platform.scheduledTime.toDateString() === date.toDateString()
        )
      );
      
      calendar.push({
        date,
        posts: dayPosts,
        totalPosts: dayPosts.length,
        publishedPosts: dayPosts.filter(post => 
          post.platforms.every(platform => platform.status === 'published')
        ).length,
        scheduledPosts: dayPosts.filter(post => 
          post.platforms.some(platform => platform.status === 'scheduled')
        ).length
      });
    }
    
    setContentCalendar(calendar);

  }, [posts]);

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage?.type === 'insight_update') {
      const update = lastMessage.data;
      
      if (update.type === 'cross_platform_update') {
        // Update cross-platform post status
        setPosts(prev => prev.map(post => {
          if (post.id === update.data.postId) {
            return {
              ...post,
              platforms: post.platforms.map(platform => 
                platform.platform === update.data.platform
                  ? { ...platform, status: update.data.status, metrics: update.data.metrics }
                  : platform
              )
            };
          }
          return post;
        }));
      }
      
      if (update.type === 'team_collaboration_update') {
        // Update team collaboration status
        setPosts(prev => prev.map(post => {
          if (post.id === update.data.postId) {
            return {
              ...post,
              teamCollaboration: {
                ...post.teamCollaboration,
                status: update.data.status,
                comments: [...post.teamCollaboration.comments, update.data.comment]
              }
            };
          }
          return post;
        }));
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
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'publishing':
        return 'bg-yellow-100 text-yellow-700';
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'review':
        return 'bg-orange-100 text-orange-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit3 className="w-4 h-4" />;
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'publishing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'published':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      case 'review':
        return <Eye className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleString();
  };

  // Create new post
  const createNewPost = () => {
    setIsCreatingPost(true);
    // In a real implementation, this would open a modal or navigate to a form
    setTimeout(() => setIsCreatingPost(false), 2000);
  };

  // Publish to all platforms
  const publishToAllPlatforms = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            platforms: post.platforms.map(platform => ({
              ...platform,
              status: 'publishing'
            }))
          }
        : post
    ));
  };

  // Approve post
  const approvePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            teamCollaboration: {
              ...post.teamCollaboration,
              status: 'approved'
            }
          }
        : post
    ));
  };

  // Reject post
  const rejectPost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            teamCollaboration: {
              ...post.teamCollaboration,
              status: 'rejected'
            }
          }
        : post
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cross-Platform Content Distribution
              </h1>
              <p className="text-gray-600">
                Create, optimize, and distribute content across all social media platforms
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
              { id: 'calendar', name: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
              { id: 'posts', name: 'Posts', icon: <FileText className="w-4 h-4" /> },
              { id: 'team', name: 'Team', icon: <Users className="w-4 h-4" /> },
              { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === tab.id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Calendar View */}
        {selectedView === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                  Content Calendar
                </h2>
                
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-gray-900">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {contentCalendar.slice(0, 28).map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className={`p-2 min-h-[100px] border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      day.date.toDateString() === selectedDate.toDateString()
                        ? 'bg-purple-100 border-purple-300'
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {day.date.getDate()}
                    </div>
                    
                    {day.posts.length > 0 && (
                      <div className="space-y-1">
                        {day.posts.slice(0, 2).map(post => (
                          <div key={post.id} className="text-xs p-1 bg-blue-100 text-blue-700 rounded truncate">
                            {post.title}
                          </div>
                        ))}
                        {day.posts.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{day.posts.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Posts View */}
        {selectedView === 'posts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-500" />
                  Cross-Platform Posts
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
              
              <div className="space-y-6">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{post.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full flex items-center ${getStatusColor(post.teamCollaboration.status)}`}>
                            {getStatusIcon(post.teamCollaboration.status)}
                            <span className="ml-1">{post.teamCollaboration.status}</span>
                          </span>
                          <span className="text-xs text-purple-600">
                            AI Score: {post.aiOptimization.overallScore}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">{post.content}</p>
                        
                        {/* Platform-specific content */}
                        <div className="space-y-3">
                          {post.platforms.map((platform, platformIndex) => (
                            <div key={platformIndex} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0">
                                {getPlatformIcon(platform.platform)}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900 capitalize">
                                    {platform.platform}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(platform.status)}`}>
                                    {platform.status}
                                  </span>
                                  <span className="text-xs text-purple-600">
                                    Score: {post.aiOptimization.platformScores[platform.platform]}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-2">{platform.content}</p>
                                
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>{formatTime(platform.scheduledTime)}</span>
                                  {platform.metrics && (
                                    <>
                                      <span>•</span>
                                      <span>{platform.metrics.views} views</span>
                                      <span>•</span>
                                      <span>{platform.metrics.likes} likes</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* AI Suggestions */}
                        {post.aiOptimization.suggestions.length > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">AI Suggestions:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {post.aiOptimization.suggestions.map((suggestion, suggestionIndex) => (
                                <li key={suggestionIndex} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Team Collaboration */}
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-green-900">Team Collaboration</h4>
                            <div className="flex items-center space-x-2">
                              {post.teamCollaboration.status === 'review' && (
                                <>
                                  <button
                                    onClick={() => approvePost(post.id)}
                                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => rejectPost(post.id)}
                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm text-green-700">
                            <p>Assigned to: {teamMembers.find(m => m.id === post.teamCollaboration.assignedTo)?.name}</p>
                            <p>Reviewers: {post.teamCollaboration.reviewers.map(id => teamMembers.find(m => m.id === id)?.name).join(', ')}</p>
                          </div>
                          
                          {post.teamCollaboration.comments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {post.teamCollaboration.comments.map(comment => (
                                <div key={comment.id} className="text-xs text-green-600 p-2 bg-white rounded">
                                  <span className="font-medium">{comment.userName}:</span> {comment.content}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => publishToAllPlatforms(post.id)}
                          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Publish All
                        </button>
                        
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded" title="Copy">
                          <Copy className="w-4 h-4" />
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

        {/* Team View */}
        {selectedView === 'team' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-500" />
                  Team Members
                </h2>
                
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        {member.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Role:</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          member.role === 'admin' ? 'bg-red-100 text-red-700' :
                          member.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                          member.role === 'reviewer' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <div className="grid grid-cols-2 gap-1">
                          <span>Create: {member.permissions.canCreate ? '✓' : '✗'}</span>
                          <span>Edit: {member.permissions.canEdit ? '✓' : '✗'}</span>
                          <span>Approve: {member.permissions.canApprove ? '✓' : '✗'}</span>
                          <span>Publish: {member.permissions.canPublish ? '✓' : '✗'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {member.isOnline ? 'Online' : 'Offline'}
                        </span>
                        
                        <button className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                          <Settings className="w-3 h-3 mr-1" />
                          Settings
                        </button>
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
                Cross-Platform Analytics
              </h2>
              
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Analytics coming soon...</p>
                <p className="text-sm">Track cross-platform performance and optimization opportunities</p>
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
              <span>Total Posts: {posts.length}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-purple-600 hover:text-purple-700 flex items-center">
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
