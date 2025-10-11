"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Target, 
  Zap, 
  TrendingUp, 
  Users, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Play
} from 'lucide-react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { aiAnalyticsService } from '@/lib/ai-analytics';

interface SmartSchedulerProps {
  content: string;
  platform: string;
  targetAudience?: string;
  onSchedule?: (scheduleData: ScheduleData) => void;
}

interface ScheduleData {
  scheduledTime: Date;
  platform: string;
  content: string;
  confidence: number;
  expectedEngagement: number;
}

interface OptimalTime {
  time: string;
  day: string;
  engagement: number;
  confidence: number;
  reason: string;
}

export default function SmartScheduler({
  content,
  platform,
  targetAudience = 'General audience',
  onSchedule
}: SmartSchedulerProps) {
  const [optimalTimes, setOptimalTimes] = useState<OptimalTime[]>([]);
  const [selectedTime, setSelectedTime] = useState<OptimalTime | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customDateTime, setCustomDateTime] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (content.trim()) {
      analyzeOptimalTimes();
    }
  }, [content, platform, targetAudience]);

  const analyzeOptimalTimes = async () => {
    setIsAnalyzing(true);
    try {
      // Get AI-suggested optimal times
      const suggestedTimes = await aiAnalyticsService.suggestOptimalPostingTime(
        platform,
        undefined, // userHistory would come from user data
        targetAudience
      );

      // Transform to our format with mock engagement data
      const times: OptimalTime[] = suggestedTimes.map((time, index) => ({
        time,
        day: index === 0 ? 'weekday' : index === 1 ? 'weekday' : 'weekend',
        engagement: Math.floor(Math.random() * 30) + 70, // Mock engagement 70-100
        confidence: Math.floor(Math.random() * 20) + 80, // Mock confidence 80-100
        reason: getEngagementReason(index),
      }));

      setOptimalTimes(times);
    } catch (error) {
      console.error('Failed to analyze optimal times:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Unable to analyze optimal posting times.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getEngagementReason = (index: number): string => {
    const reasons = [
      'Peak user activity during morning commute',
      'High engagement during lunch break',
      'Evening wind-down period with active users',
      'Weekend leisure time with increased social media usage',
      'Optimal algorithm visibility window',
    ];
    return reasons[index] || 'Good engagement opportunity';
  };

  const handleTimeSelect = (time: OptimalTime) => {
    setSelectedTime(time);
    setIsCustom(false);
  };

  const handleCustomSchedule = () => {
    if (!customDateTime) {
      toast({
        title: 'Date Required',
        description: 'Please select a date and time.',
        variant: 'destructive',
      });
      return;
    }

    const customTime: OptimalTime = {
      time: new Date(customDateTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      day: new Date(customDateTime).toLocaleDateString('en-US', { weekday: 'long' }),
      engagement: 60, // Default engagement for custom times
      confidence: 70,
      reason: 'Custom scheduled time',
    };

    setSelectedTime(customTime);
    setIsCustom(true);
  };

  const handleSchedule = () => {
    if (!selectedTime) {
      toast({
        title: 'Time Required',
        description: 'Please select a time to schedule your post.',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please add content before scheduling.',
        variant: 'destructive',
      });
      return;
    }

    const scheduleData: ScheduleData = {
      scheduledTime: isCustom ? new Date(customDateTime) : getNextOccurrence(selectedTime),
      platform,
      content,
      confidence: selectedTime.confidence,
      expectedEngagement: selectedTime.engagement,
    };

    onSchedule?.(scheduleData);
    
    toast({
      title: 'Post Scheduled',
      description: `Your post is scheduled for ${scheduleData.scheduledTime.toLocaleString()}`,
      variant: 'success',
    });
  };

  const getNextOccurrence = (optimalTime: OptimalTime): Date => {
    const now = new Date();
    const [time, period] = optimalTime.time.replace(/\s/g, '').split(/(AM|PM)/i);
    const [hour, minute = '0'] = time.split(':');
    
    let targetHour = parseInt(hour);
    if (period?.toUpperCase() === 'PM' && targetHour !== 12) {
      targetHour += 12;
    } else if (period?.toUpperCase() === 'AM' && targetHour === 12) {
      targetHour = 0;
    }

    const targetDate = new Date(now);
    targetDate.setHours(targetHour, parseInt(minute), 0, 0);

    // If time has passed today, schedule for tomorrow
    if (targetDate <= now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    return targetDate;
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 90) return 'text-green-600 bg-green-100';
    if (engagement >= 80) return 'text-blue-600 bg-blue-100';
    if (engagement >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-blue-600';
    return 'text-yellow-600';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Smart Scheduler</h2>
            <p className="text-sm text-gray-600">AI-powered optimal posting time recommendations</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isAnalyzing ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Analyzing optimal posting times...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* AI Recommended Times */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-blue-500" />
                AI Recommended Times
              </h3>
              
              <div className="grid gap-4">
                {optimalTimes.map((time, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTime === time
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleTimeSelect(time)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">{time.time}</div>
                          <div className="text-sm text-gray-600 capitalize">{time.day}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(time.engagement)}`}>
                          {time.engagement}% engagement
                        </span>
                        {selectedTime === time && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-gray-500" />
                          <span className={`font-medium ${getConfidenceColor(time.confidence)}`}>
                            {time.confidence}% confidence
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-500">{time.reason}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Custom Time Option */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                Custom Schedule
              </h3>
              
              <div className="flex space-x-4">
                <input
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  onClick={handleCustomSchedule}
                  disabled={!customDateTime}
                  variant="outline"
                >
                  Set Custom Time
                </Button>
              </div>
            </div>

            {/* Schedule Button */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  {selectedTime && (
                    <div className="text-sm text-gray-600">
                      <div className="font-medium text-gray-900">
                        Scheduled for: {selectedTime.time} ({selectedTime.day})
                      </div>
                      <div className="text-xs text-gray-500">
                        Expected engagement: {selectedTime.engagement}% • 
                        Confidence: {selectedTime.confidence}%
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={handleSchedule}
                  disabled={!selectedTime || !content.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
