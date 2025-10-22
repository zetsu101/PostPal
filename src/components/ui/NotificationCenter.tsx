"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, TrendingUp, Users, Eye, Heart, MessageCircle, Settings, CreditCard, Zap, Sparkles } from 'lucide-react';
import { useNotifications, type NotificationData } from '@/lib/notification-service';

interface NotificationCenterProps {
  className?: string;
}

const getNotificationIcon = (category?: string, type?: string) => {
  const iconProps = { className: "w-5 h-5" };
  
  switch (category) {
    case 'analytics':
      return <TrendingUp {...iconProps} className="w-5 h-5 text-purple-500" />;
    case 'team':
      return <Users {...iconProps} className="w-5 h-5 text-blue-500" />;
    case 'post':
      return <MessageCircle {...iconProps} className="w-5 h-5 text-green-500" />;
    case 'billing':
      return <CreditCard {...iconProps} className="w-5 h-5 text-orange-500" />;
    case 'system':
      return <Settings {...iconProps} className="w-5 h-5 text-gray-500" />;
    default:
      switch (type) {
        case 'success':
          return <Heart {...iconProps} className="w-5 h-5 text-green-500" />;
        case 'error':
          return <X {...iconProps} className="w-5 h-5 text-red-500" />;
        case 'warning':
          return <Zap {...iconProps} className="w-5 h-5 text-yellow-500" />;
        case 'info':
          return <Sparkles {...iconProps} className="w-5 h-5 text-blue-500" />;
        default:
          return <Bell {...iconProps} className="w-5 h-5 text-gray-500" />;
      }
  }
};

const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'analytics':
      return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700';
    case 'team':
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
    case 'post':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
    case 'billing':
      return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700';
    case 'system':
      return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
    default:
      return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
  }
};

export default function NotificationCenter({ className = "" }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'category'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const {
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    subscribe,
  } = useNotifications();

  const unreadCount = getUnreadCount();

  useEffect(() => {
    const unsubscribe = subscribe(setNotifications);
    return unsubscribe;
  }, [subscribe]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'category' && selectedCategory) return notification.category === selectedCategory;
    return true;
  });

  const categories = Array.from(new Set(notifications.map(n => n.category).filter(Boolean))) as string[];

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filter === 'unread'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Category Filters */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setFilter('category');
                        setSelectedCategory(category);
                      }}
                      className={`px-2 py-1 text-xs rounded-full transition-colors capitalize ${
                        filter === 'category' && selectedCategory === category
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="font-medium">No notifications</p>
                  <p className="text-sm">
                    {filter === 'unread' 
                      ? "You're all caught up!" 
                      : "We'll notify you when something important happens"
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.id);
                        }
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.category, notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {notification.message}
                              </p>
                              {notification.category && (
                                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 border ${getCategoryColor(notification.category)}`}>
                                  {notification.category}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(notification.timestamp)}
                              </span>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          {notification.actionLabel && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (notification.actionUrl) {
                                  window.location.href = notification.actionUrl;
                                }
                              }}
                              className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                            >
                              {notification.actionLabel} →
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <button
                  onClick={() => {
                    // Clear all notifications
                    setNotifications([]);
                    setIsOpen(false);
                  }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
