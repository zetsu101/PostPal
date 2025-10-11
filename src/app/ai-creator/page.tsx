"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import SmartContentOptimizer from '@/components/SmartContentOptimizer';
import TrendAnalysis from '@/components/TrendAnalysis';
import SmartScheduler from '@/components/SmartScheduler';
import { Brain, Sparkles, TrendingUp, Calendar } from 'lucide-react';

export default function AICreatorPage() {
  const [activeTab, setActiveTab] = useState<'optimizer' | 'trends' | 'scheduler'>('optimizer');
  const [content, setContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [optimizedContent, setOptimizedContent] = useState('');

  const handleContentOptimized = (newContent: string) => {
    setOptimizedContent(newContent);
    setContent(newContent);
  };

  const handleTrendSelected = (trend: string) => {
    setContent(prev => prev + ` ${trend}`);
  };

  const handleHashtagSelected = (hashtag: string) => {
    setContent(prev => prev + ` ${hashtag}`);
  };

  const handleSchedule = (scheduleData: any) => {
    console.log('Scheduling post:', scheduleData);
    // In a real app, this would save to database and trigger notifications
  };

  const tabs = [
    {
      id: 'optimizer',
      label: 'Content Optimizer',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Analyze and optimize your content for better engagement',
    },
    {
      id: 'trends',
      label: 'Trend Analysis',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Discover trending topics and optimal hashtags',
    },
    {
      id: 'scheduler',
      label: 'Smart Scheduler',
      icon: <Calendar className="w-4 h-4" />,
      description: 'Find the best times to post your content',
    },
  ];

  return (
    <DashboardLayout>
      <Container className="py-8">
        <PageHeader
          title="AI Content Creator"
          subtitle="Leverage artificial intelligence to create, optimize, and schedule high-performing content"
        />

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center gap-2 px-6 py-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'optimizer' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SmartContentOptimizer
                initialContent={content}
                platform={selectedPlatform}
                onContentOptimized={handleContentOptimized}
              />
            </motion.div>
          )}

          {activeTab === 'trends' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TrendAnalysis
                platforms={['instagram', 'linkedin', 'facebook', 'twitter']}
                onTrendSelected={handleTrendSelected}
                onHashtagSelected={handleHashtagSelected}
              />
            </motion.div>
          )}

          {activeTab === 'scheduler' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SmartScheduler
                content={content || optimizedContent}
                platform={selectedPlatform}
                onSchedule={handleSchedule}
              />
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Workflow</h3>
              <p className="text-sm text-gray-600">Use these tools together for maximum impact</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl mb-2">1️⃣</div>
              <h4 className="font-medium text-gray-900 mb-1">Analyze Trends</h4>
              <p className="text-sm text-gray-600">Discover what's trending and find relevant hashtags</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl mb-2">2️⃣</div>
              <h4 className="font-medium text-gray-900 mb-1">Optimize Content</h4>
              <p className="text-sm text-gray-600">Use AI to improve engagement and performance</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl mb-2">3️⃣</div>
              <h4 className="font-medium text-gray-900 mb-1">Schedule Smart</h4>
              <p className="text-sm text-gray-600">Post at optimal times for maximum reach</p>
            </div>
          </div>
        </motion.div>
      </Container>
    </DashboardLayout>
  );
}
