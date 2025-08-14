"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { socialMediaAPI, SOCIAL_PLATFORMS, type APICredentials } from "@/lib/socialMediaAPI";

interface PlatformStatus {
  platform: string;
  connected: boolean;
  credentials?: APICredentials;
  profile?: {
    username: string;
    followers: number;
    following: number;
    posts: number;
    verified: boolean;
  };
  lastSync?: string;
  rateLimitRemaining?: number;
}

export default function APIIntegration() {
  const [platformStatuses, setPlatformStatuses] = useState<PlatformStatus[]>([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState<string | null>(null);
  const [showTestPost, setShowTestPost] = useState<string | null>(null);
  const [testPostContent, setTestPostContent] = useState("");
  const [postResult, setPostResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadPlatformStatuses();
  }, []);

  const loadPlatformStatuses = async () => {
    const statuses: PlatformStatus[] = await Promise.all(
      SOCIAL_PLATFORMS.map(async (platform) => {
        const connected = socialMediaAPI.isConnected(platform.id);
        let credentials, profile;

        if (connected) {
          // Get profile data for connected platforms
          const profileResponse = await socialMediaAPI.getProfile(platform.id);
          if (profileResponse.success && profileResponse.data) {
            profile = profileResponse.data as {
              username: string;
              followers: number;
              following: number;
              posts: number;
              verified: boolean;
            };
          }
        }

        return {
          platform: platform.id,
          connected,
          credentials,
          profile,
          lastSync: connected ? "Just now" : undefined
        };
      })
    );

    setPlatformStatuses(statuses);
  };

  const handleConnect = async (platform: string) => {
    setIsConnecting(platform);
    setPostResult(null);

    try {
      const response = await socialMediaAPI.authenticate(platform);
      
      if (response.success) {
        // Reload platform statuses
        await loadPlatformStatuses();
        
        // Show success message
        setPostResult({
          success: true,
          message: `${SOCIAL_PLATFORMS.find(p => p.id === platform)?.name} connected successfully!`
        });
      } else {
        setPostResult({
          success: false,
          message: response.error || 'Connection failed'
        });
      }
    } catch {
      setPostResult({
        success: false,
        message: 'Connection failed - please try again'
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      const response = await socialMediaAPI.disconnect(platform);
      
      if (response.success) {
        await loadPlatformStatuses();
        setPostResult({
          success: true,
          message: `${SOCIAL_PLATFORMS.find(p => p.id === platform)?.name} disconnected successfully!`
        });
      } else {
        setPostResult({
          success: false,
          message: response.error || 'Disconnection failed'
        });
      }
    } catch {
      setPostResult({
        success: false,
        message: 'Disconnection failed - please try again'
      });
    }
  };

  const handleTestPost = async (platform: string) => {
    if (!testPostContent.trim()) {
      setPostResult({
        success: false,
        message: 'Please enter some content to post'
      });
      return;
    }

    setIsPosting(platform);
    setPostResult(null);

    try {
      const postData = {
        content: testPostContent,
        platform,
        hashtags: ['#PostPal', '#SocialMedia', '#Test']
      };

      const response = await socialMediaAPI.postContent(platform, postData);
      
      if (response.success) {
        setPostResult({
          success: true,
          message: `Post published successfully! Rate limit remaining: ${response.rateLimitRemaining} posts/hour`
        });
        setTestPostContent("");
        setShowTestPost(null);
        
        // Reload platform statuses to update rate limits
        await loadPlatformStatuses();
      } else {
        setPostResult({
          success: false,
          message: response.error || 'Posting failed'
        });
      }
    } catch {
      setPostResult({
        success: false,
        message: 'Posting failed - please try again'
      });
    } finally {
      setIsPosting(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    return SOCIAL_PLATFORMS.find(p => p.id === platform)?.icon || "📱";
  };

  const getPlatformColor = (platform: string) => {
    return SOCIAL_PLATFORMS.find(p => p.id === platform)?.color || "#6B7280";
  };

  const getPlatformName = (platform: string) => {
    return SOCIAL_PLATFORMS.find(p => p.id === platform)?.name || platform;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1F2937] mb-2">API Integrations</h2>
        <p className="text-[#6B7280]">
          Connect your social media accounts to enable real posting and scheduling
        </p>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {postResult && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg ${
              postResult.success 
                ? 'bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]' 
                : 'bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444]'
            }`}
          >
            {postResult.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform Connections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platformStatuses.map((status) => (
          <motion.div
            key={status.platform}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:border-[#87CEFA]/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: getPlatformColor(status.platform) }}
                >
                  {getPlatformIcon(status.platform)}
                </div>
                <div>
                  <div className="font-semibold text-[#1F2937]">
                    {getPlatformName(status.platform)}
                  </div>
                  <div className="text-sm text-[#6B7280]">
                    {status.connected ? 'Connected' : 'Not connected'}
                  </div>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                status.connected ? 'bg-[#10B981]' : 'bg-[#6B7280]'
              }`}></div>
            </div>

            {status.connected && status.profile && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-[#6B7280] mb-2">Account Info:</div>
                <div className="text-sm font-medium text-[#1F2937]">
                  @{status.profile.username}
                </div>
                <div className="text-xs text-[#6B7280]">
                  {status.profile.followers.toLocaleString()} followers
                </div>
                {status.rateLimitRemaining !== undefined && (
                  <div className="text-xs text-[#6B7280] mt-1">
                    {status.rateLimitRemaining} posts remaining this hour
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              {status.connected ? (
                <>
                  <button
                    onClick={() => setShowTestPost(showTestPost === status.platform ? null : status.platform)}
                    disabled={isPosting === status.platform}
                    className="w-full px-4 py-2 bg-[#87CEFA] text-white rounded-lg text-sm font-medium hover:bg-[#5F9EC7] transition-colors disabled:opacity-50"
                  >
                    {isPosting === status.platform ? 'Posting...' : 'Test Post'}
                  </button>
                  <button
                    onClick={() => handleDisconnect(status.platform)}
                    className="w-full px-4 py-2 bg-gray-100 text-[#6B7280] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleConnect(status.platform)}
                  disabled={isConnecting === status.platform}
                  className="w-full px-4 py-2 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isConnecting === status.platform ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>

            {/* Test Post Modal */}
            <AnimatePresence>
              {showTestPost === status.platform && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="text-sm font-medium text-[#1F2937] mb-2">
                    Test Post to {getPlatformName(status.platform)}
                  </div>
                  <textarea
                    value={testPostContent}
                    onChange={(e) => setTestPostContent(e.target.value)}
                    placeholder="Enter your test post content..."
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleTestPost(status.platform)}
                      disabled={isPosting === status.platform}
                      className="flex-1 px-3 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors disabled:opacity-50"
                    >
                      {isPosting === status.platform ? 'Posting...' : 'Post Now'}
                    </button>
                    <button
                      onClick={() => setShowTestPost(null)}
                      className="px-3 py-2 bg-gray-100 text-[#6B7280] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* API Status */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-[#1F2937] mb-4">API Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#87CEFA]">
              {platformStatuses.filter(s => s.connected).length}
            </div>
            <div className="text-sm text-[#6B7280]">Connected Platforms</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#10B981]">
              {SOCIAL_PLATFORMS.length}
            </div>
            <div className="text-sm text-[#6B7280]">Available Platforms</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#40E0D0]">
              {platformStatuses.filter(s => s.connected).length > 0 ? 'Active' : 'Inactive'}
            </div>
            <div className="text-sm text-[#6B7280]">API Status</div>
          </div>
        </div>
      </div>

      {/* API Information */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-[#1F2937] mb-4">API Information</h3>
        <div className="space-y-3 text-sm text-[#6B7280]">
          <div className="flex justify-between">
            <span>Authentication:</span>
            <span className="text-[#10B981] font-medium">OAuth 2.0</span>
          </div>
          <div className="flex justify-between">
            <span>Rate Limiting:</span>
            <span className="text-[#10B981] font-medium">Platform-specific</span>
          </div>
          <div className="flex justify-between">
            <span>Data Sync:</span>
            <span className="text-[#10B981] font-medium">Real-time</span>
          </div>
          <div className="flex justify-between">
            <span>Security:</span>
            <span className="text-[#10B981] font-medium">Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
} 