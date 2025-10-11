"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Instagram, 
  Linkedin, 
  Facebook, 
  Twitter, 
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Save,
  TestTube
} from 'lucide-react';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface SocialMediaConfig {
  instagram?: {
    accessToken: string;
    userId: string;
    businessAccountId: string;
    connected: boolean;
  };
  linkedin?: {
    accessToken: string;
    personId: string;
    organizationId?: string;
    connected: boolean;
  };
  facebook?: {
    accessToken: string;
    pageId: string;
    connected: boolean;
  };
  twitter?: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
    bearerToken: string;
    connected: boolean;
  };
  tiktok?: {
    accessToken: string;
    openId: string;
    clientKey: string;
    clientSecret: string;
    connected: boolean;
  };
}

const PLATFORMS = [
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: Instagram, 
    color: 'from-purple-500 to-pink-500',
    description: 'Connect your Instagram Business account for posting and analytics'
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: Linkedin, 
    color: 'from-blue-600 to-blue-700',
    description: 'Connect your LinkedIn profile for professional content sharing'
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: Facebook, 
    color: 'from-blue-500 to-blue-600',
    description: 'Connect your Facebook page for content distribution'
  },
  { 
    id: 'twitter', 
    name: 'Twitter', 
    icon: Twitter, 
    color: 'from-blue-400 to-blue-500',
    description: 'Connect your Twitter account for real-time updates'
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: MessageCircle, 
    color: 'from-black to-gray-800',
    description: 'Connect your TikTok Business account for video content'
  },
] as const;

export default function SocialMediaSettings() {
  const [config, setConfig] = useState<SocialMediaConfig>({});
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = localStorage.getItem('socialMediaConfig');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Failed to load social media config:', error);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      localStorage.setItem('socialMediaConfig', JSON.stringify(config));
      showToast('Social media settings saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save config:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (platform: string) => {
    setTesting(platform);
    try {
      const platformConfig = config[platform as keyof SocialMediaConfig];
      if (!platformConfig) {
        throw new Error('Platform not configured');
      }

      let response;
      switch (platform) {
        case 'instagram':
          response = await fetch(`/api/social/instagram?accessToken=${platformConfig.accessToken}&userId=${platformConfig.userId}`);
          break;
        case 'linkedin':
          response = await fetch(`/api/social/linkedin?accessToken=${platformConfig.accessToken}`);
          break;
        case 'facebook':
          response = await fetch(`/api/social/facebook?accessToken=${platformConfig.accessToken}&pageId=${platformConfig.pageId}`);
          break;
        case 'twitter':
          response = await fetch(`/api/social/twitter?bearerToken=${platformConfig.bearerToken}`);
          break;
        case 'tiktok':
          response = await fetch(`/api/social/tiktok?accessToken=${platformConfig.accessToken}&openId=${platformConfig.openId}`);
          break;
        default:
          throw new Error('Unknown platform');
      }

      const data = await response.json();
      
      if (data.success) {
        showToast(`${platform} connection successful!`, 'success');
        setConfig(prev => ({
          ...prev,
          [platform]: { ...prev[platform as keyof SocialMediaConfig], connected: true }
        }));
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (error) {
      console.error(`${platform} connection test failed:`, error);
      showToast(`${platform} connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setConfig(prev => ({
        ...prev,
        [platform]: { ...prev[platform as keyof SocialMediaConfig], connected: false }
      }));
    } finally {
      setTesting(null);
    }
  };

  const updateConfig = (platform: string, field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof SocialMediaConfig],
        [field]: value
      }
    }));
  };

  const toggleTokenVisibility = (platform: string, field: string) => {
    const key = `${platform}-${field}`;
    setShowTokens(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getFieldValue = (platform: string, field: string) => {
    return config[platform as keyof SocialMediaConfig]?.[field as keyof any] || '';
  };

  const isConnected = (platform: string) => {
    return config[platform as keyof SocialMediaConfig]?.connected || false;
  };

  return (
    <Container>
      <PageHeader
        title="Social Media Integration"
        description="Connect your social media accounts to enable cross-platform posting and analytics"
      />

      <div className="space-y-8">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const isPlatformConnected = isConnected(platform);
          const isTesting = testing === platform.id;

          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${platform.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
                    <p className="text-sm text-gray-600">{platform.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isPlatformConnected ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-gray-400">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm">Not Connected</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection(platform.id)}
                    disabled={isTesting}
                  >
                    {isTesting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                    <span className="ml-2">Test</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platform.id === 'instagram' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Access Token
                      </label>
                      <div className="relative">
                        <input
                          type={showTokens[`${platform.id}-accessToken`] ? 'text' : 'password'}
                          value={getFieldValue(platform.id, 'accessToken')}
                          onChange={(e) => updateConfig(platform.id, 'accessToken', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="Enter Instagram access token"
                        />
                        <button
                          type="button"
                          onClick={() => toggleTokenVisibility(platform.id, 'accessToken')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showTokens[`${platform.id}-accessToken`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User ID
                      </label>
                      <input
                        type="text"
                        value={getFieldValue(platform.id, 'userId')}
                        onChange={(e) => updateConfig(platform.id, 'userId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter Instagram user ID"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Account ID
                      </label>
                      <input
                        type="text"
                        value={getFieldValue(platform.id, 'businessAccountId')}
                        onChange={(e) => updateConfig(platform.id, 'businessAccountId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter Instagram business account ID"
                      />
                    </div>
                  </>
                )}

                {platform.id === 'linkedin' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Access Token
                      </label>
                      <div className="relative">
                        <input
                          type={showTokens[`${platform.id}-accessToken`] ? 'text' : 'password'}
                          value={getFieldValue(platform.id, 'accessToken')}
                          onChange={(e) => updateConfig(platform.id, 'accessToken', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="Enter LinkedIn access token"
                        />
                        <button
                          type="button"
                          onClick={() => toggleTokenVisibility(platform.id, 'accessToken')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showTokens[`${platform.id}-accessToken`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Person ID
                      </label>
                      <input
                        type="text"
                        value={getFieldValue(platform.id, 'personId')}
                        onChange={(e) => updateConfig(platform.id, 'personId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter LinkedIn person ID"
                      />
                    </div>
                  </>
                )}

                {platform.id === 'facebook' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Access Token
                      </label>
                      <div className="relative">
                        <input
                          type={showTokens[`${platform.id}-accessToken`] ? 'text' : 'password'}
                          value={getFieldValue(platform.id, 'accessToken')}
                          onChange={(e) => updateConfig(platform.id, 'accessToken', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="Enter Facebook access token"
                        />
                        <button
                          type="button"
                          onClick={() => toggleTokenVisibility(platform.id, 'accessToken')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showTokens[`${platform.id}-accessToken`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page ID
                      </label>
                      <input
                        type="text"
                        value={getFieldValue(platform.id, 'pageId')}
                        onChange={(e) => updateConfig(platform.id, 'pageId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter Facebook page ID"
                      />
                    </div>
                  </>
                )}

                {platform.id === 'twitter' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showTokens[`${platform.id}-apiKey`] ? 'text' : 'password'}
                          value={getFieldValue(platform.id, 'apiKey')}
                          onChange={(e) => updateConfig(platform.id, 'apiKey', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="Enter Twitter API key"
                        />
                        <button
                          type="button"
                          onClick={() => toggleTokenVisibility(platform.id, 'apiKey')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showTokens[`${platform.id}-apiKey`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showTokens[`${platform.id}-apiSecret`] ? 'text' : 'password'}
                          value={getFieldValue(platform.id, 'apiSecret')}
                          onChange={(e) => updateConfig(platform.id, 'apiSecret', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="Enter Twitter API secret"
                        />
                        <button
                          type="button"
                          onClick={() => toggleTokenVisibility(platform.id, 'apiSecret')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showTokens[`${platform.id}-apiSecret`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Access Token
                      </label>
                      <div className="relative">
                        <input
                          type={showTokens[`${platform.id}-accessToken`] ? 'text' : 'password'}
                          value={getFieldValue(platform.id, 'accessToken')}
                          onChange={(e) => updateConfig(platform.id, 'accessToken', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="Enter Twitter access token"
                        />
                        <button
                          type="button"
                          onClick={() => toggleTokenVisibility(platform.id, 'accessToken')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showTokens[`${platform.id}-accessToken`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bearer Token
                      </label>
                      <div className="relative">
                        <input
                          type={showTokens[`${platform.id}-bearerToken`] ? 'text' : 'password'}
                          value={getFieldValue(platform.id, 'bearerToken')}
                          onChange={(e) => updateConfig(platform.id, 'bearerToken', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="Enter Twitter bearer token"
                        />
                        <button
                          type="button"
                          onClick={() => toggleTokenVisibility(platform.id, 'bearerToken')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showTokens[`${platform.id}-bearerToken`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {platform.id === 'tiktok' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Access Token
                      </label>
                      <div className="relative">
                        <input
                          type={showTokens[`${platform.id}-accessToken`] ? 'text' : 'password'}
                          value={getFieldValue(platform.id, 'accessToken')}
                          onChange={(e) => updateConfig(platform.id, 'accessToken', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="Enter TikTok access token"
                        />
                        <button
                          type="button"
                          onClick={() => toggleTokenVisibility(platform.id, 'accessToken')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showTokens[`${platform.id}-accessToken`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Open ID
                      </label>
                      <input
                        type="text"
                        value={getFieldValue(platform.id, 'openId')}
                        onChange={(e) => updateConfig(platform.id, 'openId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter TikTok open ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Key
                      </label>
                      <input
                        type="text"
                        value={getFieldValue(platform.id, 'clientKey')}
                        onChange={(e) => updateConfig(platform.id, 'clientKey', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter TikTok client key"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showTokens[`${platform.id}-clientSecret`] ? 'text' : 'password'}
                          value={getFieldValue(platform.id, 'clientSecret')}
                          onChange={(e) => updateConfig(platform.id, 'clientSecret', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder="Enter TikTok client secret"
                        />
                        <button
                          type="button"
                          onClick={() => toggleTokenVisibility(platform.id, 'clientSecret')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showTokens[`${platform.id}-clientSecret`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}

        <div className="flex justify-end">
          <Button
            onClick={saveConfig}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="ml-2">Save Settings</span>
          </Button>
        </div>
      </div>
    </Container>
  );
}
