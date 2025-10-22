import React from 'react';
import { Metadata } from 'next';
import AIInsightsAdvanced from '@/components/AIInsightsAdvanced';

export const metadata: Metadata = {
  title: 'AI Insights Dashboard | PostPal',
  description: 'Advanced AI-powered analytics and insights for your social media content performance.',
};

export default function AIInsightsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AIInsightsAdvanced />
      </div>
    </div>
  );
}
