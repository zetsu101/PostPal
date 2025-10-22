"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import APIIntegration from "@/components/APIIntegration";
import EmailSettings from "@/components/EmailSettings";

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  displayName: string;
  avatar: string;
  isConnected: boolean;
  lastSync: string;
  followers: number;
  posts: number;
  color: string;
  status: "connected" | "disconnected" | "error" | "syncing";
}

interface IntegrationSettings {
  autoPost: boolean;
  crossPost: boolean;
  hashtagOptimization: boolean;
  bestTimePosting: boolean;
  engagementTracking: boolean;
  analyticsSync: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("accounts");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const [socialAccounts] = useState<SocialAccount[]>([
    {
      id: "1",
      platform: "Instagram",
      username: "@postpal_official",
      displayName: "PostPal Official",
      avatar: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&h=100&fit=crop&crop=face",
      isConnected: true,
      lastSync: "2 minutes ago",
      followers: 15420,
      posts: 47,
      color: "from-[#E4405F] to-[#F77737]",
      status: "connected"
    },
    {
      id: "2",
      platform: "Facebook",
      username: "postpal.official",
      displayName: "PostPal",
      avatar: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&h=100&fit=crop&crop=face",
      isConnected: true,
      lastSync: "5 minutes ago",
      followers: 8920,
      posts: 32,
      color: "from-[#1877F2] to-[#42A5F5]",
      status: "connected"
    },
    {
      id: "3",
      platform: "Twitter",
      username: "@postpal_app",
      displayName: "PostPal App",
      avatar: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&h=100&fit=crop&crop=face",
      isConnected: false,
      lastSync: "Never",
      followers: 0,
      posts: 0,
      color: "from-[#1DA1F2] to-[#64B5F6]",
      status: "disconnected"
    },
    {
      id: "4",
      platform: "LinkedIn",
      username: "postpal-company",
      displayName: "PostPal Company",
      avatar: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&h=100&fit=crop&crop=face",
      isConnected: true,
      lastSync: "1 hour ago",
      followers: 5670,
      posts: 23,
      color: "from-[#0A66C2] to-[#1976D2]",
      status: "connected"
    },
    {
      id: "5",
      platform: "TikTok",
      username: "@postpal",
      displayName: "PostPal",
      avatar: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&h=100&fit=crop&crop=face",
      isConnected: false,
      lastSync: "Never",
      followers: 0,
      posts: 0,
      color: "from-[#000000] to-[#25F4EE]",
      status: "disconnected"
    },
    {
      id: "6",
      platform: "YouTube",
      username: "PostPal Official",
      displayName: "PostPal Official",
      avatar: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&h=100&fit=crop&crop=face",
      isConnected: false,
      lastSync: "Never",
      followers: 0,
      posts: 0,
      color: "from-[#FF0000] to-[#FF6B6B]",
      status: "disconnected"
    }
  ]);

  const [integrationSettings] = useState<IntegrationSettings>({
    autoPost: true,
    crossPost: false,
    hashtagOptimization: true,
    bestTimePosting: true,
    engagementTracking: true,
    analyticsSync: true
  });

  const platforms = [
    { name: "Instagram", icon: "📷", color: "from-[#E4405F] to-[#F77737]", description: "Share photos and stories" },
    { name: "Facebook", icon: "📘", color: "from-[#1877F2] to-[#42A5F5]", description: "Connect with friends and family" },
    { name: "Twitter", icon: "🐦", color: "from-[#1DA1F2] to-[#64B5F6]", description: "Share thoughts and updates" },
    { name: "LinkedIn", icon: "💼", color: "from-[#0A66C2] to-[#1976D2]", description: "Professional networking" },
    { name: "TikTok", icon: "🎵", color: "from-[#000000] to-[#25F4EE]", description: "Short-form videos" },
    { name: "YouTube", icon: "📺", color: "from-[#FF0000] to-[#FF6B6B]", description: "Video content platform" }
  ];

  const handleConnectAccount = (platform: string) => {
    setSelectedPlatform(platform);
    setShowConnectModal(true);
  };

  const simulateConnection = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setShowConnectModal(false);
      // In a real app, this would update the account status
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "text-[#34D399]";
      case "disconnected": return "text-[#6B7280]";
      case "error": return "text-[#EF4444]";
      case "syncing": return "text-[#F59E0B]";
      default: return "text-[#6B7280]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": return "✅";
      case "disconnected": return "❌";
      case "error": return "⚠️";
      case "syncing": return "🔄";
      default: return "❌";
    }
  };

  return (
    <DashboardLayout>
      <Container className="py-8">
        <PageHeader
          title="Settings & Integrations"
          subtitle="Manage your social media accounts and platform integrations"
        />

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8"
        >
          {[
            { id: "accounts", label: "Social Accounts", icon: "🔗" },
            { id: "integrations", label: "Integrations", icon: "⚙️" },
            { id: "automation", label: "Automation", icon: "🤖" },
            { id: "notifications", label: "Notifications", icon: "🔔" },
            { id: "email", label: "Email Settings", icon: "📧" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#64748B] shadow-md"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Content Based on Active Tab */}
        <AnimatePresence mode="wait">
          {activeTab === "accounts" && (
            <APIIntegration />
          )}

          {activeTab === "integrations" && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Connected Accounts */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#1F2937]">Connected Accounts</h2>
                  <button
                    onClick={() => setShowConnectModal(true)}
                    className="bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] text-[#1F2937] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    + Connect Account
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {socialAccounts.map((account) => (
                    <motion.div
                      key={account.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-6 rounded-xl border border-gray-200 hover:border-[#C7D2FE]/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-r ${account.color} rounded-xl flex items-center justify-center`}>
                            <span className="text-white font-bold text-lg">
                              {account.platform.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-[#1F2937]">{account.platform}</div>
                            <div className="text-sm text-[#6B7280]">{account.username}</div>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${getStatusColor(account.status)}`}>
                          <span>{getStatusIcon(account.status)}</span>
                          <span className="capitalize">{account.status}</span>
                        </div>
                      </div>

                      {account.isConnected ? (
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#6B7280]">Followers</span>
                            <span className="font-semibold text-[#1F2937]">{account.followers.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#6B7280]">Posts</span>
                            <span className="font-semibold text-[#1F2937]">{account.posts}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#6B7280]">Last Sync</span>
                            <span className="font-semibold text-[#1F2937]">{account.lastSync}</span>
                          </div>
                          <div className="flex gap-2 pt-3">
                            <button className="flex-1 bg-gray-100 text-[#1F2937] py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                              Sync Now
                            </button>
                            <button className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                              Disconnect
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-[#6B7280] mb-3">Not connected</p>
                          <button
                            onClick={() => handleConnectAccount(account.platform)}
                            className="w-full bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] text-[#1F2937] py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                          >
                            Connect {account.platform}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Account Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#34D399] to-[#6EE7B7] rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🔗</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#1F2937]">3</div>
                      <div className="text-sm text-[#6B7280]">Connected Accounts</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#60A5FA] to-[#93C5FD] rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">👥</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#1F2937]">30,010</div>
                      <div className="text-sm text-[#6B7280]">Total Followers</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#FACC15] to-[#FDE047] rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">📝</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#1F2937]">102</div>
                      <div className="text-sm text-[#6B7280]">Total Posts</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "integrations" && (
            <motion.div
              key="integrations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Integration Settings */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Integration Settings</h2>
                <div className="space-y-6">
                  {[
                    { key: "autoPost", label: "Auto Posting", description: "Automatically publish scheduled posts", icon: "🚀" },
                    { key: "crossPost", label: "Cross-Platform Posting", description: "Share content across multiple platforms", icon: "🔄" },
                    { key: "hashtagOptimization", label: "Hashtag Optimization", description: "Automatically suggest relevant hashtags", icon: "🏷️" },
                    { key: "bestTimePosting", label: "Best Time Posting", description: "Schedule posts at optimal times", icon: "⏰" },
                    { key: "engagementTracking", label: "Engagement Tracking", description: "Track likes, comments, and shares", icon: "📊" },
                    { key: "analyticsSync", label: "Analytics Sync", description: "Sync analytics data from all platforms", icon: "📈" }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{setting.icon}</span>
                        <div>
                          <div className="font-semibold text-[#1F2937]">{setting.label}</div>
                          <div className="text-sm text-[#6B7280]">{setting.description}</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={integrationSettings[setting.key as keyof IntegrationSettings]}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C7D2FE]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C7D2FE]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "automation" && (
            <motion.div
              key="automation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Automation Rules</h2>
                <p className="text-[#6B7280] mb-6">Set up automated workflows for your social media management</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-gray-200 rounded-xl">
                    <h3 className="font-semibold text-[#1F2937] mb-3">Content Recycling</h3>
                    <p className="text-sm text-[#6B7280] mb-4">Automatically repost your best performing content</p>
                    <button className="bg-[#C7D2FE] text-[#1F2937] px-4 py-2 rounded-lg text-sm font-medium">
                      Configure
                    </button>
                  </div>
                  
                  <div className="p-6 border border-gray-200 rounded-xl">
                    <h3 className="font-semibold text-[#1F2937] mb-3">Engagement Responses</h3>
                    <p className="text-sm text-[#6B7280] mb-4">Auto-respond to common comments and messages</p>
                    <button className="bg-[#C7D2FE] text-[#1F2937] px-4 py-2 rounded-lg text-sm font-medium">
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: "Post Published", description: "When a post is successfully published" },
                    { label: "Engagement Alerts", description: "When posts receive high engagement" },
                    { label: "Account Sync", description: "When account data is synced" },
                    { label: "Error Notifications", description: "When posting fails or errors occur" },
                    { label: "Weekly Reports", description: "Weekly performance summaries" }
                  ].map((notification, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                      <div>
                        <div className="font-semibold text-[#1F2937]">{notification.label}</div>
                        <div className="text-sm text-[#6B7280]">{notification.description}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C7D2FE]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C7D2FE]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "email" && (
            <EmailSettings />
          )}
        </AnimatePresence>

        {/* Connect Account Modal */}
        <AnimatePresence>
          {showConnectModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#1F2937]">Connect Social Account</h2>
                  <button
                    onClick={() => setShowConnectModal(false)}
                    className="text-[#64748B] hover:text-[#1F2937] text-2xl"
                  >
                    ×
                  </button>
                </div>

                {!selectedPlatform ? (
                  <div className="grid grid-cols-2 gap-4">
                    {platforms.map((platform) => (
                      <motion.button
                        key={platform.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPlatform(platform.name)}
                        className="p-6 border border-gray-200 rounded-xl hover:border-[#C7D2FE]/50 transition-all text-left"
                      >
                        <div className={`w-12 h-12 bg-gradient-to-r ${platform.color} rounded-xl flex items-center justify-center mb-4`}>
                          <span className="text-white text-2xl">{platform.icon}</span>
                        </div>
                        <div className="font-semibold text-[#1F2937] mb-2">{platform.name}</div>
                        <div className="text-sm text-[#6B7280]">{platform.description}</div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className={`w-20 h-20 bg-gradient-to-r ${platforms.find(p => p.name === selectedPlatform)?.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <span className="text-white text-4xl">{platforms.find(p => p.name === selectedPlatform)?.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#1F2937] mb-4">Connect {selectedPlatform}</h3>
                                         <p className="text-[#6B7280] mb-6">
                       You&apos;ll be redirected to {selectedPlatform} to authorize PostPal to manage your account.
                     </p>
                    
                    {isConnecting ? (
                      <div className="flex items-center justify-center gap-3 text-[#64748B]">
                        <div className="w-6 h-6 border-2 border-[#C7D2FE] border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting to {selectedPlatform}...</span>
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        <button
                          onClick={() => setSelectedPlatform("")}
                          className="flex-1 px-6 py-3 bg-gray-100 text-[#1F2937] rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={simulateConnection}
                          className="flex-1 bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] text-[#1F2937] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                          Connect {selectedPlatform}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </DashboardLayout>
  );
} 