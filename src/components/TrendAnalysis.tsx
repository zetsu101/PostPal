"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Hash, 
  Clock, 
  BarChart3, 
  RefreshCw,
  ExternalLink,
  Calendar,
  Users,
  Zap,
  Target
} from 'lucide-react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { aiAnalyticsService, type TrendAnalysis } from '@/lib/ai-analytics';

interface TrendAnalysisProps {
  platforms?: string[];
  onTrendSelected?: (trend: string) => void;
  onHashtagSelected?: (hashtag: string) => void;
}

export default function TrendAnalysis({ 
  platforms = ['instagram', 'linkedin', 'facebook', 'twitter'],
  onTrendSelected,
  onHashtagSelected
}: TrendAnalysisProps) {
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'topics' | 'hashtags' | 'timing'>('topics');
  const { toast } = useToast();

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    setIsLoading(true);
    try {
      const trendData = await aiAnalyticsService.analyzeTrends(platforms);
      setTrends(trendData);
    } catch (error) {
      console.error('Failed to load trends:', error);
      toast({
        title: 'Failed to Load Trends',
        description: 'Unable to fetch trending data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (growthRate: number) => {
    if (growthRate > 20) return <Zap className="w-4 h-4 text-green-500" />;
    if (growthRate > 10) return <TrendingUp className="w-4 h-4 text-blue-500" />;
    return <BarChart3 className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (growthRate: number) => {
    if (growthRate > 20) return 'text-green-600 bg-green-100';
    if (growthRate > 10) return 'text-blue-600 bg-blue-100';
    if (growthRate > 0) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 80) return 'text-green-600';
    if (engagement >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredTrendingTopics = trends?.trendingTopics.filter(topic => 
    selectedPlatform === 'all' || topic.platform === selectedPlatform || topic.platform === 'all'
  ) || [];

  const filteredHashtags = trends?.optimalHashtags || [];

  const filteredTiming = trends?.bestPostingTimes.filter(timing => 
    selectedPlatform === 'all' || timing.platform === selectedPlatform
  ) || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Trend Analysis</h2>
              <p className="text-sm text-gray-600">Discover what's trending across social platforms</p>
            </div>
          </div>
          
          <Button
            onClick={loadTrends}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {/* Platform Filter */}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedPlatform === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Platforms
          </button>
          {platforms.map((platform) => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
                selectedPlatform === platform
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'topics', label: 'Trending Topics', icon: <Target className="w-4 h-4" /> },
          { id: 'hashtags', label: 'Optimal Hashtags', icon: <Hash className="w-4 h-4" /> },
          { id: 'timing', label: 'Best Times', icon: <Clock className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Analyzing trends...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'topics' && (
              <TrendingTopics 
                topics={filteredTrendingTopics} 
                onTrendSelected={onTrendSelected}
                getTrendIcon={getTrendIcon}
                getGrowthColor={getGrowthColor}
              />
            )}

            {activeTab === 'hashtags' && (
              <OptimalHashtags 
                hashtags={filteredHashtags} 
                onHashtagSelected={onHashtagSelected}
                getEngagementColor={getEngagementColor}
              />
            )}

            {activeTab === 'timing' && (
              <BestPostingTimes 
                timing={filteredTiming}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Trending Topics Component
function TrendingTopics({ 
  topics, 
  onTrendSelected,
  getTrendIcon,
  getGrowthColor
}: {
  topics: Array<{
    topic: string;
    popularity: number;
    growthRate: number;
    platform: string;
  }>;
  onTrendSelected?: (trend: string) => void;
  getTrendIcon: (growthRate: number) => JSX.Element;
  getGrowthColor: (growthRate: number) => string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Trending Topics</h3>
        <span className="text-sm text-gray-500">{topics.length} topics</span>
      </div>

      <div className="grid gap-4">
        {topics.map((topic, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
            onClick={() => onTrendSelected?.(topic.topic)}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {topic.topic}
              </h4>
              <div className="flex items-center space-x-2">
                {getTrendIcon(topic.growthRate)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGrowthColor(topic.growthRate)}`}>
                  +{topic.growthRate}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-sm text-gray-600">Popularity</div>
                  <div className="text-lg font-semibold text-gray-900">{topic.popularity}/100</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 max-w-32">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${topic.popularity}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {topic.platform}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Optimal Hashtags Component
function OptimalHashtags({ 
  hashtags, 
  onHashtagSelected,
  getEngagementColor
}: {
  hashtags: Array<{
    hashtag: string;
    engagement: number;
    competition: number;
    reach: number;
  }>;
  onHashtagSelected?: (hashtag: string) => void;
  getEngagementColor: (engagement: number) => string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Optimal Hashtags</h3>
        <span className="text-sm text-gray-500">{hashtags.length} hashtags</span>
      </div>

      <div className="grid gap-3">
        {hashtags.map((hashtag, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
            onClick={() => onHashtagSelected?.(hashtag.hashtag)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                {hashtag.hashtag}
              </span>
              <span className={`text-sm font-medium ${getEngagementColor(hashtag.engagement)}`}>
                {hashtag.engagement}/100
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Engagement</div>
                <div className="text-lg font-semibold text-gray-900">{hashtag.engagement}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Competition</div>
                <div className="text-lg font-semibold text-gray-900">{hashtag.competition}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Reach</div>
                <div className="text-lg font-semibold text-gray-900">{hashtag.reach}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Best Posting Times Component
function BestPostingTimes({ 
  timing 
}: {
  timing: Array<{
    platform: string;
    timeSlots: Array<{
      hour: number;
      day: string;
      engagement: number;
    }>;
  }>;
}) {
  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Best Posting Times</h3>
        <span className="text-sm text-gray-500">{timing.length} platforms</span>
      </div>

      {timing.map((platform, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 border border-gray-200 rounded-lg"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900 capitalize">{platform.platform}</h4>
          </div>

          <div className="grid gap-3">
            {platform.timeSlots.map((slot, slotIndex) => (
              <div key={slotIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-700">
                    {formatTime(slot.hour)}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {slot.day}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {slot.engagement}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
