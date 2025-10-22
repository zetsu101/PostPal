"use client";

import { useToast } from '@/components/ui/Toast';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  category?: 'post' | 'analytics' | 'team' | 'system' | 'billing';
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationPreferences {
  email: boolean;
  postScheduled: boolean;
  postPublished: boolean;
  postFailed: boolean;
  analyticsSummary: boolean;
  paymentNotifications: boolean;
  weeklyDigest: boolean;
}

class NotificationService {
  private listeners: Array<(notifications: NotificationData[]) => void> = [];
  private notifications: NotificationData[] = [];
  private maxNotifications = 50;

  // Subscribe to notification updates
  subscribe(listener: (notifications: NotificationData[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notify() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Add a new notification
  addNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>) {
    const newNotification: NotificationData = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      isRead: false,
    };

    this.notifications.unshift(newNotification);
    
    // Keep only the latest notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    this.notify();

    // Show browser notification if permission is granted
    this.showBrowserNotification(newNotification);

    return newNotification.id;
  }

  // Mark notification as read
  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.notify();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true);
    this.notify();
  }

  // Get all notifications
  getNotifications() {
    return [...this.notifications];
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.notify();
  }

  // Show browser notification
  private async showBrowserNotification(notification: NotificationData) {
    if (typeof window === 'undefined') return;

    // Check if browser notifications are supported
    if (!('Notification' in window)) return;

    // Request permission if not already granted
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Show notification if permission is granted
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.type === 'error' || notification.type === 'warning',
      });

      // Auto-close after 5 seconds for non-critical notifications
      if (notification.type !== 'error' && notification.type !== 'warning') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }

      // Handle notification click
      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        
        // Navigate to action URL if provided
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
      };
    }
  }

  // Predefined notification types
  postPublished = (platform: string, postTitle: string) => {
    this.addNotification({
      type: 'success',
      title: 'Post Published! 🎉',
      message: `"${postTitle}" has been successfully published to ${platform}`,
      category: 'post',
    });
  };

  postFailed = (platform: string, error: string) => {
    this.addNotification({
      type: 'error',
      title: 'Post Failed ❌',
      message: `Failed to publish to ${platform}: ${error}`,
      category: 'post',
    });
  };

  analyticsMilestone = (metric: string, value: string) => {
    this.addNotification({
      type: 'info',
      title: 'Analytics Milestone 📊',
      message: `Your ${metric} reached ${value}! Great job!`,
      category: 'analytics',
    });
  };

  teamMemberJoined = (memberName: string) => {
    this.addNotification({
      type: 'info',
      title: 'New Team Member 👥',
      message: `${memberName} has joined your team`,
      category: 'team',
    });
  };

  billingAlert = (message: string) => {
    this.addNotification({
      type: 'warning',
      title: 'Billing Alert 💳',
      message,
      category: 'billing',
      actionUrl: '/billing',
      actionLabel: 'View Billing',
    });
  };

  systemUpdate = (message: string) => {
    this.addNotification({
      type: 'info',
      title: 'System Update 🔄',
      message,
      category: 'system',
    });
  };

  // AI-generated insights
  aiInsight = (insight: string, actionUrl?: string) => {
    this.addNotification({
      type: 'info',
      title: 'AI Insight 🤖',
      message: insight,
      category: 'analytics',
      actionUrl,
      actionLabel: 'View Details',
    });
  };

  // Content suggestions
  contentSuggestion = (suggestion: string, platform: string) => {
    this.addNotification({
      type: 'info',
      title: 'Content Suggestion ✨',
      message: `AI suggests: "${suggestion}" for ${platform}`,
      category: 'post',
      actionUrl: '/create',
      actionLabel: 'Create Post',
    });
  };

  // Engagement alerts
  highEngagement = (postTitle: string, engagementRate: string) => {
    this.addNotification({
      type: 'success',
      title: 'High Engagement! 🔥',
      message: `"${postTitle}" has ${engagementRate}% engagement rate`,
      category: 'analytics',
      actionUrl: '/analytics',
      actionLabel: 'View Analytics',
    });
  };

  // Trend alerts
  trendingHashtag = (hashtag: string, mentions: number) => {
    this.addNotification({
      type: 'info',
      title: 'Trending Hashtag 📈',
      message: `#${hashtag} is trending with ${mentions} mentions`,
      category: 'analytics',
      actionUrl: '/create',
      actionLabel: 'Use Hashtag',
    });
  };
}

// Create singleton instance
export const notificationService = new NotificationService();

// Hook for using notifications in React components
export function useNotifications() {
  const toast = useToast();

  const showToast = (notification: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>) => {
    // Add to notification service
    const id = notificationService.addNotification(notification);
    
    // Also show as toast
    toast.addToast({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      duration: notification.type === 'error' ? 8000 : 5000,
    });

    return id;
  };

  return {
    addNotification: notificationService.addNotification.bind(notificationService),
    markAsRead: notificationService.markAsRead.bind(notificationService),
    markAllAsRead: notificationService.markAllAsRead.bind(notificationService),
    getNotifications: notificationService.getNotifications.bind(notificationService),
    getUnreadCount: notificationService.getUnreadCount.bind(notificationService),
    clearAll: notificationService.clearAll.bind(notificationService),
    subscribe: notificationService.subscribe.bind(notificationService),
    showToast,
    // Predefined methods
    postPublished: notificationService.postPublished.bind(notificationService),
    postFailed: notificationService.postFailed.bind(notificationService),
    analyticsMilestone: notificationService.analyticsMilestone.bind(notificationService),
    teamMemberJoined: notificationService.teamMemberJoined.bind(notificationService),
    billingAlert: notificationService.billingAlert.bind(notificationService),
    systemUpdate: notificationService.systemUpdate.bind(notificationService),
    aiInsight: notificationService.aiInsight.bind(notificationService),
    contentSuggestion: notificationService.contentSuggestion.bind(notificationService),
    highEngagement: notificationService.highEngagement.bind(notificationService),
    trendingHashtag: notificationService.trendingHashtag.bind(notificationService),
  };
}