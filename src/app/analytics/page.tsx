"use client";
import { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";
import AIInsightsDashboard from "@/components/AIInsightsDashboard";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { motion } from 'framer-motion';
import { BarChart3, Brain } from 'lucide-react';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'insights'>('analytics');

  return (
    <DashboardLayout>
      <Container className="py-8">
        <PageHeader
          title="Analytics & Insights"
          subtitle="Comprehensive performance analysis and AI-powered insights"
        />

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8"
        >
          {[
            {
              id: 'analytics',
              label: 'Performance Analytics',
              icon: <BarChart3 className="w-4 h-4" />,
            },
            {
              id: 'insights',
              label: 'AI Insights',
              icon: <Brain className="w-4 h-4" />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'analytics' | 'insights')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Content */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AdvancedAnalytics />
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AIInsightsDashboard />
          </motion.div>
        )}
      </Container>
    </DashboardLayout>
  );
} 