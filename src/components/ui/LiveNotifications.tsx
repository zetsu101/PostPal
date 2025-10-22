import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, TrendingUp, TrendingDown, Users, Eye, Heart, MessageCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  icon?: React.ReactNode;
  isRead: boolean;
}

interface LiveMetric {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

export default function LiveNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new notifications
      if (Math.random() > 0.7) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'success' : 'info',
          title: getRandomNotificationTitle(),
          message: getRandomNotificationMessage(),
          timestamp: new Date(),
          icon: getRandomNotificationIcon(),
          isRead: false,
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        setUnreadCount(prev => prev + 1);
      }

      // Simulate live metric updates
      setLiveMetrics([
        {
          label: 'Engagement Rate',
          value: `${(Math.random() * 5 + 8).toFixed(1)}%`,
          change: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 2 + 0.5).toFixed(1)}%`,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          icon: <TrendingUp className="w-4 h-4" />,
        },
        {
          label: 'New Followers',
          value: Math.floor(Math.random() * 50 + 10),
          change: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 20 + 5)}`,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          icon: <Users className="w-4 h-4" />,
        },
        {
          label: 'Post Reach',
          value: `${Math.floor((Math.random() * 5000 + 2000) / 1000)}k`,
          change: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 15 + 5)}%`,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          icon: <Eye className="w-4 h-4" />,
        },
      ]);
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const getRandomNotificationTitle = () => {
    const titles = [
      'New Follower Alert!',
      'Post Performance Boost',
      'Engagement Milestone',
      'Trending Hashtag',
      'Best Time to Post',
      'Audience Growth',
      'Viral Content Alert',
      'Competitor Update',
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const getRandomNotificationMessage = () => {
    const messages = [
      'Your latest post just reached 1,000+ impressions!',
      'You gained 25 new followers in the last hour',
      'Your engagement rate increased by 12% today',
      'Your content is trending in your niche',
      'Perfect timing! Your audience is most active now',
      'You\'re outperforming 85% of similar accounts',
      'Your video content is going viral!',
      'New competitor analysis available',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getRandomNotificationIcon = () => {
    const icons = [
      <TrendingUp key="trending" className="w-5 h-5 text-green-500" />,
      <Users key="users" className="w-5 h-5 text-blue-500" />,
      <Eye key="eye" className="w-5 h-5 text-purple-500" />,
      <Heart key="heart" className="w-5 h-5 text-red-500" />,
      <MessageCircle key="message" className="w-5 h-5 text-indigo-500" />,
    ];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    setUnreadCount(0);
  };



  return (
    <div className="relative">
      {/* Live Metrics Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live Metrics
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">Updates every 3s</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {liveMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                {metric.icon}
                <span className="text-xs text-gray-600 dark:text-gray-400">{metric.label}</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{metric.value}</div>
              <div className={`text-xs font-medium flex items-center justify-center gap-1 ${
                metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {metric.change}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </button>

        {/* Notifications Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No notifications yet</p>
                    <p className="text-sm">We&apos;ll notify you when something important happens</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {notification.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {notification.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
