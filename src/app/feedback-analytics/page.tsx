import React from 'react';
import { Metadata } from 'next';
import FeedbackAnalyticsDashboard from '@/components/FeedbackAnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Feedback Analytics | PostPal',
  description: 'View and analyze user feedback on AI insights and features.',
};

export default function FeedbackAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FeedbackAnalyticsDashboard />
      </div>
    </div>
  );
}
