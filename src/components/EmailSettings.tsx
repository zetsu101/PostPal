"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Bell, Send, TestTube, Save, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { notificationService, type NotificationPreferences } from '@/lib/notification-service';

export default function EmailSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    postScheduled: true,
    postPublished: false,
    postFailed: true,
    analyticsSummary: true,
    paymentNotifications: true,
    weeklyDigest: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // In a real app, fetch from API
      // For now, use default preferences
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading preferences:', error);
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real app, save to API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      addToast({
        title: 'Settings Saved',
        message: 'Your email preferences have been updated successfully.',
        type: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        message: 'Failed to save email preferences.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      addToast({
        title: 'Email Required',
        message: 'Please enter an email address to test.',
        type: 'error',
      });
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          template: 'welcome',
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast({
          title: 'Test Email Sent',
          message: `Test email sent successfully to ${testEmail}`,
          type: 'success',
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      addToast({
        title: 'Test Failed',
        message: 'Failed to send test email. Please try again.',
        type: 'error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const emailSettings = [
    {
      key: 'email' as keyof NotificationPreferences,
      title: 'Email Notifications',
      description: 'Enable or disable all email notifications',
      icon: <Mail className="w-5 h-5" />,
    },
    {
      key: 'postScheduled' as keyof NotificationPreferences,
      title: 'Post Scheduled',
      description: 'Get notified when your posts are scheduled',
      icon: <Bell className="w-5 h-5" />,
    },
    {
      key: 'postPublished' as keyof NotificationPreferences,
      title: 'Post Published',
      description: 'Get notified when your posts are published',
      icon: <Send className="w-5 h-5" />,
    },
    {
      key: 'postFailed' as keyof NotificationPreferences,
      title: 'Post Failed',
      description: 'Get notified when posts fail to publish',
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      key: 'analyticsSummary' as keyof NotificationPreferences,
      title: 'Analytics Summary',
      description: 'Receive weekly performance summaries',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      key: 'paymentNotifications' as keyof NotificationPreferences,
      title: 'Payment Notifications',
      description: 'Get notified about payments and billing',
      icon: <Mail className="w-5 h-5" />,
    },
    {
      key: 'weeklyDigest' as keyof NotificationPreferences,
      title: 'Weekly Digest',
      description: 'Receive a weekly summary of your activity',
      icon: <Bell className="w-5 h-5" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Email Notifications</h2>
              <p className="text-gray-600">Manage your email notification preferences</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Email Delivery</h3>
              <p className="text-sm text-blue-700 mt-1">
                Emails are sent from our trusted delivery system. Check your spam folder if you don't receive notifications.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
        
        <div className="space-y-4">
          {emailSettings.map((setting, index) => (
            <motion.div
              key={setting.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-gray-600">{setting.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-900">{setting.title}</h4>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences[setting.key]}
                  onChange={() => handlePreferenceChange(setting.key)}
                  disabled={setting.key === 'email' && !preferences.email}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Test Email */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Email Delivery</h3>
        <p className="text-gray-600 mb-6">
          Send a test email to verify your email delivery is working correctly.
        </p>
        
        <div className="flex space-x-4">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button
            onClick={handleTestEmail}
            disabled={isTesting || !testEmail}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isTesting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </div>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Send Test
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          {isSaving ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

