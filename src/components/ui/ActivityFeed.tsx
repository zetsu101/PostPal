import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  UserPlus, 
  TrendingUp, 
  Zap,
  Instagram,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'like' | 'comment' | 'share' | 'follower' | 'engagement' | 'viral';
  platform: 'Instagram' | 'Facebook' | 'Twitter' | 'LinkedIn';
  message: string;
  value?: string | number;
  timestamp: Date;
  isNew: boolean;
}

const platformIcons = {
  Instagram: <Instagram className="w-4 h-4 text-pink-500" />,
  Facebook: <Facebook className="w-4 h-4 text-blue-600" />,
  Twitter: <Twitter className="w-4 h-4 text-blue-400" />,
  LinkedIn: <Linkedin className="w-4 h-4 text-blue-700" />,
};

const activityIcons = {
  like: <Heart className="w-4 h-4 text-red-500" />,
  comment: <MessageCircle className="w-4 h-4 text-blue-500" />,
  share: <Share2 className="w-4 h-4 text-green-500" />,
  follower: <UserPlus className="w-4 h-4 text-purple-500" />,
  engagement: <TrendingUp className="w-4 h-4 text-orange-500" />,
  viral: <Zap className="w-4 h-4 text-yellow-500" />,
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Generate initial activities
    const initialActivities: Activity[] = [
      {
        id: '1',
        type: 'like',
        platform: 'Instagram',
        message: 'New like on your latest post',
        value: '+1',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        isNew: true,
      },
      {
        id: '2',
        type: 'follower',
        platform: 'Twitter',
        message: 'New follower gained',
        value: '+1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        isNew: true,
      },
      {
        id: '3',
        type: 'comment',
        platform: 'Facebook',
        message: 'New comment on your post',
        value: '+1',
        timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
        isNew: false,
      },
      {
        id: '4',
        type: 'share',
        platform: 'LinkedIn',
        message: 'Your post was shared',
        value: '+1',
        timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
        isNew: false,
      },
      {
        id: '5',
        type: 'engagement',
        platform: 'Instagram',
        message: 'Engagement rate increased',
        value: '+2.1%',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        isNew: false,
      },
    ];
    setActivities(initialActivities);

    // Simulate real-time activities
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newActivity: Activity = {
          id: Date.now().toString(),
          type: getRandomActivityType(),
          platform: getRandomPlatform(),
          message: getRandomActivityMessage(),
          value: getRandomActivityValue(),
          timestamp: new Date(),
          isNew: true,
        };

        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    }, 4000); // New activity every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const getRandomActivityType = (): Activity['type'] => {
    const types: Activity['type'][] = ['like', 'comment', 'share', 'follower', 'engagement', 'viral'];
    return types[Math.floor(Math.random() * types.length)];
  };

  const getRandomPlatform = (): Activity['platform'] => {
    const platforms: Activity['platform'][] = ['Instagram', 'Facebook', 'Twitter', 'LinkedIn'];
    return platforms[Math.floor(Math.random() * platforms.length)];
  };

  const getRandomActivityMessage = (): string => {
    const messages = [
      'New like on your latest post',
      'New follower gained',
      'New comment on your post',
      'Your post was shared',
      'Engagement rate increased',
      'Your content is trending',
      'Viral alert! Your post is spreading',
      'New milestone reached',
      'Audience growth detected',
      'Content performance boost',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getRandomActivityValue = (): string => {
    const values = ['+1', '+2', '+3', '+5', '+10', '+1.2%', '+2.5%', '+5.1%'];
    return values[Math.floor(Math.random() * values.length)];
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const markAsRead = (id: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id ? { ...activity, isNew: false } : activity
      )
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live Activity Feed
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Real-time updates
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer group ${
                activity.isNew 
                  ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' 
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => markAsRead(activity.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center gap-2">
                    {activityIcons[activity.type]}
                    {platformIcons[activity.platform]}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#87CEFA] transition-colors">
                      {activity.message}
                    </p>
                    {activity.value && (
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {activity.value}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                    {activity.isNew && (
                      <span className="text-xs text-blue-600 font-medium">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-gray-400" />
          </div>
          <p>No recent activity</p>
          <p className="text-sm">We&apos;ll show you real-time updates here</p>
        </div>
      )}
    </div>
  );
}
