"use client";

import React from 'react';
import Button from './ui/Button';
import { useNotifications } from '@/lib/notification-service';

export default function NotificationDemo() {
  const {
    postPublished,
    postFailed,
    analyticsMilestone,
    teamMemberJoined,
    billingAlert,
    systemUpdate,
    aiInsight,
    contentSuggestion,
    highEngagement,
    trendingHashtag,
    showToast,
  } = useNotifications();

  const demoNotifications = [
    {
      label: 'Post Published',
      action: () => postPublished('Instagram', 'Amazing sunset photo from yesterday!'),
      color: 'success' as const,
    },
    {
      label: 'Post Failed',
      action: () => postFailed('Twitter', 'Rate limit exceeded'),
      color: 'danger' as const,
    },
    {
      label: 'Analytics Milestone',
      action: () => analyticsMilestone('followers', '10,000'),
      color: 'primary' as const,
    },
    {
      label: 'Team Member Joined',
      action: () => teamMemberJoined('Sarah Johnson'),
      color: 'primary' as const,
    },
    {
      label: 'Billing Alert',
      action: () => billingAlert('Your subscription will expire in 3 days'),
      color: 'danger' as const,
    },
    {
      label: 'System Update',
      action: () => systemUpdate('New AI features are now available!'),
      color: 'primary' as const,
    },
    {
      label: 'AI Insight',
      action: () => aiInsight('Your posts perform 23% better on weekdays'),
      color: 'primary' as const,
    },
    {
      label: 'Content Suggestion',
      action: () => contentSuggestion('Share behind-the-scenes content', 'LinkedIn'),
      color: 'primary' as const,
    },
    {
      label: 'High Engagement',
      action: () => highEngagement('Morning Motivation', '12.5%'),
      color: 'success' as const,
    },
    {
      label: 'Trending Hashtag',
      action: () => trendingHashtag('AI', 15000),
      color: 'primary' as const,
    },
    {
      label: 'Custom Toast',
      action: () => showToast({
        type: 'success',
        title: 'Demo Toast! 🎉',
        message: 'This is a custom toast notification',
      }),
      color: 'success' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Notification System Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Click the buttons below to trigger different types of notifications
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {demoNotifications.map((notification, index) => (
          <Button
            key={index}
            variant={notification.color}
            size="sm"
            onClick={notification.action}
            className="text-xs"
          >
            {notification.label}
          </Button>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Notification Features:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Real-time notifications with categories</li>
          <li>• Browser notifications (with permission)</li>
          <li>• Toast notifications for immediate feedback</li>
          <li>• Mark as read/unread functionality</li>
          <li>• Filter by category and read status</li>
          <li>• Action buttons for navigation</li>
          <li>• Dark mode support</li>
          <li>• Smooth animations and transitions</li>
        </ul>
      </div>
    </div>
  );
}
