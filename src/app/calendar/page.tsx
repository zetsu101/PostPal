"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Filter, 
  Search,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  MessageCircle,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Share2,
  Zap,
  TrendingUp,
  BarChart3,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Download,
  Upload,
  Copy
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Moon, Sun } from 'lucide-react';

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platform: 'instagram' | 'linkedin' | 'facebook' | 'twitter' | 'tiktok';
  scheduledDate: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  imageUrl?: string;
  hashtags: string[];
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface CalendarView {
  id: 'month' | 'week' | 'day' | 'list';
  name: string;
  icon: any;
}

const CALENDAR_VIEWS: CalendarView[] = [
  { id: 'month', name: 'Month', icon: Calendar },
  { id: 'week', name: 'Week', icon: Clock },
  { id: 'day', name: 'Day', icon: Target },
  { id: 'list', name: 'List', icon: BarChart3 },
];

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-600 to-blue-700' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-500 to-blue-600' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'from-blue-400 to-blue-500' },
  { id: 'tiktok', name: 'TikTok', icon: MessageCircle, color: 'from-black to-gray-800' },
];

export default function CalendarPage() {
  const { addToast } = useToast();
  const { theme, setTheme, isDark } = useTheme();
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'list'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data generation
  useEffect(() => {
    const generateMockPosts = () => {
      const posts: ScheduledPost[] = [];
      const today = new Date();
      
      for (let i = 0; i < 20; i++) {
        const postDate = new Date(today);
        postDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
        postDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        const platforms = ['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok'] as const;
        const statuses = ['draft', 'scheduled', 'published', 'failed'] as const;
        
        posts.push({
          id: `post-${i}`,
          title: `Post ${i + 1}: ${['AI Tips', 'Business Insights', 'Product Launch', 'Behind the Scenes', 'Customer Story'][i % 5]}`,
          content: `This is a sample post content for ${platforms[i % 5]}. It includes engaging content that will resonate with our audience.`,
          platform: platforms[i % 5],
          scheduledDate: postDate,
          status: statuses[i % 4],
          hashtags: ['#business', '#innovation', '#success', '#growth'],
          engagement: {
            likes: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 100),
            shares: Math.floor(Math.random() * 50),
            reach: Math.floor(Math.random() * 5000),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      return posts.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
    };

    setTimeout(() => {
      setScheduledPosts(generateMockPosts());
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredPosts = scheduledPosts.filter(post => {
    const matchesPlatform = filterPlatform === 'all' || post.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesPlatform && matchesStatus && matchesSearch;
  });

  const getPostsForDate = (date: Date) => {
    return filteredPosts.filter(post => {
      const postDate = new Date(post.scheduledDate);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-600';
      case 'scheduled': return 'bg-blue-100 text-blue-600';
      case 'published': return 'bg-green-100 text-green-600';
      case 'failed': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = PLATFORMS.find(p => p.id === platform);
    return platformData?.icon || Instagram;
  };

  const getPlatformColor = (platform: string) => {
    const platformData = PLATFORMS.find(p => p.id === platform);
    return platformData?.color || 'from-gray-500 to-gray-600';
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowCreateModal(true);
  };

  const handlePostClick = (post: ScheduledPost) => {
    setSelectedPost(post);
  };

  const handleDeletePost = (postId: string) => {
    setScheduledPosts(prev => prev.filter(post => post.id !== postId));
    addToast({
      title: 'Post Deleted',
      message: 'The scheduled post has been removed',
      type: 'success',
    });
  };

  const handleDuplicatePost = (post: ScheduledPost) => {
    const newPost: ScheduledPost = {
      ...post,
      id: `post-${Date.now()}`,
      title: `${post.title} (Copy)`,
      scheduledDate: new Date(post.scheduledDate.getTime() + 24 * 60 * 60 * 1000), // Next day
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setScheduledPosts(prev => [...prev, newPost]);
    addToast({
      title: 'Post Duplicated',
      message: 'A copy has been created for tomorrow',
      type: 'success',
    });
  };

  const renderWeekView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayPosts = getPostsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === day.toDateString();
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
                             className={`min-h-[200px] p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                 isToday 
                   ? 'border-[#87CEFA] bg-[#87CEFA]/5 dark:bg-[#87CEFA]/10' 
                   : isSelected 
                     ? 'border-[#40E0D0] bg-[#40E0D0]/5 dark:bg-[#40E0D0]/10'
                     : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
               }`}
              onClick={() => handleDateClick(day)}
            >
              <div className="text-center mb-3">
                                 <div className={`text-sm font-medium ${
                   isToday ? 'text-[#87CEFA]' : 'text-gray-600 dark:text-gray-300'
                 }`}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                                 <div className={`text-2xl font-bold ${
                   isToday ? 'text-[#87CEFA]' : 'text-gray-900 dark:text-white'
                 }`}>
                  {day.getDate()}
                </div>
              </div>
              
              <div className="space-y-2">
                {dayPosts.slice(0, 3).map((post) => (
                  <motion.div
                    key={post.id}
                    whileHover={{ scale: 1.02 }}
                                         className={`p-2 rounded-lg text-xs cursor-pointer ${
                       post.status === 'published' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' :
                       post.status === 'scheduled' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' :
                       post.status === 'failed' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700' :
                       'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                     }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePostClick(post);
                    }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {(() => {
                        const Icon = getPlatformIcon(post.platform);
                        return <Icon className="w-3 h-3" />;
                      })()}
                      <span className="font-medium truncate">{post.title}</span>
                    </div>
                    <div className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(post.status)}`}>
                      {post.status}
                    </div>
                  </motion.div>
                ))}
                                 {dayPosts.length > 3 && (
                   <div className="text-center text-xs text-gray-500">
                     +{dayPosts.length - 3} more
                   </div>
                 )}
                 
                 {/* Quick Actions */}
                 <div className="flex gap-1 mt-2">
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       handleDateClick(day);
                     }}
                     className="flex-1 p-1 bg-[#87CEFA]/10 hover:bg-[#87CEFA]/20 rounded text-xs text-[#87CEFA] transition-colors"
                   >
                     +
                   </button>
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       // View all posts for this day
                     }}
                     className="flex-1 p-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-600 transition-colors"
                   >
                     View
                   </button>
                 </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#87CEFA]/50 transition-all duration-200 cursor-pointer"
            onClick={() => handlePostClick(post)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${getPlatformColor(post.platform)} rounded-lg flex items-center justify-center`}>
                  {(() => {
                    const Icon = getPlatformIcon(post.platform);
                    return <Icon className="w-5 h-5 text-white" />;
                  })()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-500">
                    {post.scheduledDate.toLocaleDateString()} at {post.scheduledDate.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                  {post.status}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Show more options
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.content}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-xs text-gray-500">
                <span>{post.hashtags.length} hashtags</span>
                {post.engagement && (
                  <>
                    <span>{post.engagement.likes} likes</span>
                    <span>{post.engagement.comments} comments</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicatePost(post);
                  }}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePost(post.id);
                  }}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#87CEFA]" />
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Container className="py-8">
        <PageHeader
        title="Content Calendar"
        subtitle="Schedule and manage your social media content across all platforms"
        actions={
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] hover:from-[#87CEFA]/90 hover:to-[#40E0D0]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Post
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button
              variant="outline"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="ml-2"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        }
      />

      {/* Calendar Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {CALENDAR_VIEWS.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    currentView === view.id
                      ? 'bg-white dark:bg-gray-600 text-[#87CEFA] shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {view.name}
                </button>
              );
            })}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(currentDate);
                if (currentView === 'week') newDate.setDate(currentDate.getDate() - 7);
                if (currentView === 'month') newDate.setMonth(currentDate.getMonth() - 1);
                setCurrentDate(newDate);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">
                {currentView === 'week' 
                  ? (() => {
                      const weekStart = new Date(currentDate);
                      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      return `${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
                    })()
                  : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                }
              </div>
              <div className="text-sm text-gray-500">
                {filteredPosts.length} posts scheduled
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(currentDate);
                if (currentView === 'week') newDate.setDate(currentDate.getDate() + 7);
                if (currentView === 'month') newDate.setMonth(currentDate.getMonth() + 1);
                setCurrentDate(newDate);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEFA] focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEFA] focus:border-transparent"
          >
            <option value="all">All Platforms</option>
            {PLATFORMS.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEFA] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        {currentView === 'week' && renderWeekView()}
        {currentView === 'list' && renderListView()}
        {(currentView === 'month' || currentView === 'day') && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>{currentView === 'month' ? 'Month view coming soon' : 'Day view coming soon'}</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        {[
          { label: 'Scheduled Posts', value: filteredPosts.filter(p => p.status === 'scheduled').length, icon: Clock, color: 'from-blue-500 to-blue-600' },
          { label: 'Published Posts', value: filteredPosts.filter(p => p.status === 'published').length, icon: CheckCircle, color: 'from-green-500 to-green-600' },
          { label: 'Draft Posts', value: filteredPosts.filter(p => p.status === 'draft').length, icon: Edit, color: 'from-gray-500 to-gray-600' },
          { label: 'Failed Posts', value: filteredPosts.filter(p => p.status === 'failed').length, icon: AlertCircle, color: 'from-red-500 to-red-600' },
                 ].map((stat, index) => (
           <motion.div
             key={stat.label}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: index * 0.1 }}
             className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Schedule New Post</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter post title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEFA] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    placeholder="Write your post content..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEFA] focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEFA] focus:border-transparent">
                      {PLATFORMS.map((platform) => (
                        <option key={platform.id} value={platform.id}>
                          {platform.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#87CEFA] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] hover:from-[#87CEFA]/90 hover:to-[#40E0D0]/90"
                >
                  Schedule Post
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Post Detail Modal */}
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${getPlatformColor(selectedPost.platform)} rounded-lg flex items-center justify-center`}>
                    {(() => {
                      const Icon = getPlatformIcon(selectedPost.platform);
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedPost.title}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedPost.scheduledDate.toLocaleDateString()} at {selectedPost.scheduledDate.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedPost.content}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPlatformColor(selectedPost.platform)} text-white`}>
                        {selectedPost.platform}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPost.status)}`}>
                      {selectedPost.status}
                    </span>
                  </div>
                </div>

                {selectedPost.engagement && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Engagement</label>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{selectedPost.engagement.likes}</div>
                        <div className="text-xs text-gray-500">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{selectedPost.engagement.comments}</div>
                        <div className="text-xs text-gray-500">Comments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{selectedPost.engagement.shares}</div>
                        <div className="text-xs text-gray-500">Shares</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{selectedPost.engagement.reach}</div>
                        <div className="text-xs text-gray-500">Reach</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => handleDuplicatePost(selectedPost)}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button
                  onClick={() => {
                    handleDeletePost(selectedPost.id);
                    setSelectedPost(null);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Container>
    </div>
  );
} 