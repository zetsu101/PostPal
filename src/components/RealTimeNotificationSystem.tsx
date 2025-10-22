'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Zap, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  Settings,
  Filter,
  MarkAsRead,
  Archive,
  Trash2,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAIInsightsWebSocket } from '@/hooks/useWebSocket';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'ai_insight' | 'collaboration' | 'analytics';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  archived: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: any;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  categories: {
    ai_insights: boolean;
    collaboration: boolean;
    analytics: boolean;
    system: boolean;
  };
  priority: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
}

export default function RealTimeNotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    desktop: true,
    email: false,
    categories: {
      ai_insights: true,
      collaboration: true,
      analytics: true,
      system: true
    },
    priority: {
      low: true,
      medium: true,
      high: true,
      urgent: true
    }
  });
  
  const { isConnected, lastMessage } = useAIInsightsWebSocket();
  const notificationRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mock initial notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'ai_insight',
        title: 'AI Content Analysis Complete',
        message: 'Your latest Instagram post scored 87/100. Consider adding more hashtags for better reach.',
        timestamp: Date.now() - 300000, // 5 minutes ago
        read: false,
        archived: false,
        priority: 'medium',
        category: 'ai_insights',
        actionUrl: '/ai-insights',
        actionText: 'View Analysis'
      },
      {
        id: '2',
        type: 'collaboration',
        title: 'New Collaborator Joined',
        message: 'Sarah Johnson has joined your content collaboration session.',
        timestamp: Date.now() - 600000, // 10 minutes ago
        read: true,
        archived: false,
        priority: 'low',
        category: 'collaboration',
        actionUrl: '/ai-collaboration',
        actionText: 'View Session'
      },
      {
        id: '3',
        type: 'analytics',
        title: 'Performance Alert',
        message: 'Your engagement rate dropped 15% this week. Consider posting during peak hours.',
        timestamp: Date.now() - 900000, // 15 minutes ago
        read: false,
        archived: false,
        priority: 'high',
        category: 'analytics',
        actionUrl: '/advanced-analytics',
        actionText: 'View Analytics'
      },
      {
        id: '4',
        type: 'success',
        title: 'Content Published Successfully',
        message: 'Your LinkedIn post has been published and is now live.',
        timestamp: Date.now() - 1200000, // 20 minutes ago
        read: true,
        archived: false,
        priority: 'low',
        category: 'system',
        actionUrl: '/dashboard',
        actionText: 'View Post'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  // Handle real-time notifications from WebSocket
  useEffect(() => {
    if (lastMessage?.type === 'insight_update') {
      const update = lastMessage.data;
      
      if (update.type === 'notification') {
        const newNotification: Notification = {
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: update.data.type || 'info',
          title: update.data.title,
          message: update.data.message,
          timestamp: update.timestamp,
          read: false,
          archived: false,
          priority: update.data.priority || 'medium',
          category: update.data.category || 'system',
          actionUrl: update.data.actionUrl,
          actionText: update.data.actionText,
          metadata: update.data.metadata
        };

        setNotifications(prev => [newNotification, ...prev]);
        
        // Play notification sound
        if (settings.sound && audioRef.current) {
          audioRef.current.play().catch(console.error);
        }

        // Show desktop notification
        if (settings.desktop && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
              tag: newNotification.id
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
          }
        }
      }
    }
  }, [lastMessage, settings]);

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    // Filter by read status
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'archived' && !notification.archived) return false;
    if (filter === 'all' && notification.archived) return false;

    // Filter by category
    if (categoryFilter !== 'all' && notification.category !== categoryFilter) return false;

    // Filter by settings
    if (!settings.categories[notification.category as keyof typeof settings.categories]) return false;
    if (!settings.priority[notification.priority]) return false;

    return true;
  });

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'ai_insight': return <Zap className="w-5 h-5 text-purple-500" />;
      case 'collaboration': return <Users className="w-5 h-5 text-indigo-500" />;
      case 'analytics': return <TrendingUp className="w-5 h-5 text-orange-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
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

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Archive notification
  const archiveNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, archived: true }
          : notification
      )
    );
  };

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  // Get category count
  const getCategoryCount = (category: string) => {
    return notifications.filter(n => n.category === category && !n.archived).length;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
            ref={notificationRef}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="archived">Archived</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="ai_insights">AI Insights</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="analytics">Analytics</option>
                  <option value="system">System</option>
                </select>

                {filter === 'unread' && unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                  >
                    <MarkAsRead className="w-3 h-3 mr-1" />
                    Mark All Read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                        !notification.read ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                  {notification.category}
                                </span>
                                {notification.priority === 'urgent' && (
                                  <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">
                                    Urgent
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                  title="Mark as read"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              
                              <div className="relative">
                                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {/* Dropdown menu would go here */}
                              </div>
                            </div>
                          </div>
                          
                          {notification.actionUrl && (
                            <div className="mt-3">
                              <a
                                href={notification.actionUrl}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                {notification.actionText || 'View Details'} →
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>AI Insights: {getCategoryCount('ai_insights')}</span>
                  <span>Collaboration: {getCategoryCount('collaboration')}</span>
                  <span>Analytics: {getCategoryCount('analytics')}</span>
                </div>
                
                <button
                  onClick={() => {/* Open settings */}}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Notification Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio element for notification sounds */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}
