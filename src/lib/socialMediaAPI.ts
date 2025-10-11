// Social Media API Integration Service

// Platform definitions
export const SOCIAL_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: 'from-purple-500 to-pink-500',
    description: 'Share photos and stories with your audience'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'from-blue-600 to-blue-800',
    description: 'Professional networking and business content'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: 'from-blue-500 to-blue-700',
    description: 'Connect with friends and share updates'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '🐦',
    color: 'from-sky-400 to-blue-500',
    description: 'Share thoughts and engage in conversations'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'from-pink-500 to-red-500',
    description: 'Create and share short-form videos'
  }
] as const;

export interface APICredentials {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  apiKey?: string;
  apiSecret?: string;
  bearerToken?: string;
  userId?: string;
  businessAccountId?: string;
  organizationId?: string;
  personId?: string;
  pageId?: string;
  openId?: string;
  clientKey?: string;
  clientSecret?: string;
}

export interface SocialMediaConfig {
  instagram?: {
    accessToken: string;
    userId: string;
    businessAccountId?: string;
  };
  linkedin?: {
    accessToken: string;
    organizationId?: string;
    personId?: string;
  };
  facebook?: {
    accessToken: string;
    pageId: string;
  };
  twitter?: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
    bearerToken?: string;
  };
  tiktok?: {
    accessToken: string;
    openId: string;
    clientKey: string;
    clientSecret: string;
  };
}

export interface PostContent {
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  hashtags?: string[];
  link?: string;
  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
  scheduledTime?: Date;
}

export interface PostResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
  platform: string;
  timestamp: Date;
  metadata?: {
    likes?: number;
    comments?: number;
    shares?: number;
    reach?: number;
  };
}

export interface PlatformStatus {
  platform: string;
  connected: boolean;
  accountInfo?: {
    username?: string;
    displayName?: string;
    profilePicture?: string;
    followers?: number;
    following?: number;
  };
  rateLimit?: {
    remaining: number;
    resetTime: Date;
    limit: number;
  };
}

export interface AnalyticsData {
  platform: string;
  postId: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  timestamp: Date;
}

// Rate limiting and caching
class RateLimiter {
  private limits: Map<string, { count: number; resetTime: Date }> = new Map();

  canMakeRequest(platform: string, endpoint: string): boolean {
    const key = `${platform}:${endpoint}`;
    const now = new Date();
    const limit = this.limits.get(key);

    if (!limit || now > limit.resetTime) {
      this.limits.set(key, { count: 1, resetTime: new Date(now.getTime() + 15 * 60 * 1000) }); // 15 minutes
      return true;
    }

    if (limit.count >= this.getRateLimit(platform, endpoint)) {
      return false;
    }

    limit.count++;
    return true;
  }

  private getRateLimit(platform: string, endpoint: string): number {
    // Platform-specific rate limits
    switch (platform) {
      case 'instagram':
        return endpoint === 'post' ? 25 : 200; // 25 posts per hour, 200 API calls per hour
      case 'linkedin':
        return endpoint === 'post' ? 50 : 100; // 50 posts per day, 100 API calls per hour
      case 'facebook':
        return endpoint === 'post' ? 100 : 200; // 100 posts per day, 200 API calls per hour
      case 'twitter':
        return endpoint === 'post' ? 300 : 300; // 300 tweets per 3 hours, 300 API calls per 15 minutes
      case 'tiktok':
        return endpoint === 'post' ? 20 : 100; // 20 posts per hour, 100 API calls per hour
      default:
        return 100;
    }
  }
}

// Social Media API Service
export class SocialMediaAPIService {
  private config: SocialMediaConfig;
  private rateLimiter: RateLimiter;
  private cache: Map<string, any> = new Map();

  constructor(config: SocialMediaConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter();
  }

  // Instagram API Integration
  async postToInstagram(content: PostContent): Promise<PostResult> {
    if (!this.config.instagram) {
      return {
        success: false,
        error: 'Instagram not configured',
        platform: 'instagram',
        timestamp: new Date(),
      };
    }

    if (!this.rateLimiter.canMakeRequest('instagram', 'post')) {
      return {
        success: false,
        error: 'Rate limit exceeded for Instagram',
        platform: 'instagram',
        timestamp: new Date(),
      };
    }

    try {
      console.log('📸 Posting to Instagram via API route:', content);

      const response = await fetch('/api/social/instagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content.text,
          imageUrl: content.imageUrl,
          hashtags: content.hashtags,
          accessToken: this.config.instagram.accessToken,
          businessAccountId: this.config.instagram.businessAccountId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Instagram API error');
      }

      console.log('✅ Instagram post successful:', data);

      return {
        success: true,
        postId: data.postId,
        url: data.url,
        platform: 'instagram',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('❌ Instagram post failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        platform: 'instagram',
        timestamp: new Date(),
      };
    }
  }

  // LinkedIn API Integration
  async postToLinkedIn(content: PostContent): Promise<PostResult> {
    if (!this.config.linkedin) {
      return {
        success: false,
        error: 'LinkedIn not configured',
        platform: 'linkedin',
        timestamp: new Date(),
      };
    }

    if (!this.rateLimiter.canMakeRequest('linkedin', 'post')) {
      return {
        success: false,
        error: 'Rate limit exceeded for LinkedIn',
        platform: 'linkedin',
        timestamp: new Date(),
      };
    }

    try {
      console.log('💼 Posting to LinkedIn via API route:', content);

      const response = await fetch('/api/social/linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content.text,
          imageUrl: content.imageUrl,
          hashtags: content.hashtags,
          accessToken: this.config.linkedin.accessToken,
          personId: this.config.linkedin.personId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'LinkedIn API error');
      }

      console.log('✅ LinkedIn post successful:', data);

      return {
        success: true,
        postId: data.postId,
        url: data.url,
        platform: 'linkedin',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('❌ LinkedIn post failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        platform: 'linkedin',
        timestamp: new Date(),
      };
    }
  }

  // Facebook API Integration
  async postToFacebook(content: PostContent): Promise<PostResult> {
    if (!this.config.facebook) {
      return {
        success: false,
        error: 'Facebook not configured',
        platform: 'facebook',
        timestamp: new Date(),
      };
    }

    if (!this.rateLimiter.canMakeRequest('facebook', 'post')) {
      return {
        success: false,
        error: 'Rate limit exceeded for Facebook',
        platform: 'facebook',
        timestamp: new Date(),
      };
    }

    try {
      console.log('📘 Posting to Facebook via API route:', content);

      const response = await fetch('/api/social/facebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content.text,
          imageUrl: content.imageUrl,
          link: content.link,
          hashtags: content.hashtags,
          accessToken: this.config.facebook.accessToken,
          pageId: this.config.facebook.pageId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Facebook API error');
      }

      console.log('✅ Facebook post successful:', data);

      return {
        success: true,
        postId: data.postId,
        url: data.url,
        platform: 'facebook',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('❌ Facebook post failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        platform: 'facebook',
        timestamp: new Date(),
      };
    }
  }

  // Twitter API Integration
  async postToTwitter(content: PostContent): Promise<PostResult> {
    if (!this.config.twitter) {
      return {
        success: false,
        error: 'Twitter not configured',
        platform: 'twitter',
        timestamp: new Date(),
      };
    }

    if (!this.rateLimiter.canMakeRequest('twitter', 'post')) {
      return {
        success: false,
        error: 'Rate limit exceeded for Twitter',
        platform: 'twitter',
        timestamp: new Date(),
      };
    }

    try {
      console.log('🐦 Posting to Twitter via API route:', content);

      const response = await fetch('/api/social/twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content.text,
          hashtags: content.hashtags,
          bearerToken: this.config.twitter.bearerToken,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Twitter API error');
      }

      console.log('✅ Twitter post successful:', data);

      return {
        success: true,
        postId: data.postId,
        url: data.url,
        platform: 'twitter',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('❌ Twitter post failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        platform: 'twitter',
        timestamp: new Date(),
      };
    }
  }

  // TikTok API Integration (Limited - requires business account)
  async postToTikTok(content: PostContent): Promise<PostResult> {
    if (!this.config.tiktok) {
      return {
        success: false,
        error: 'TikTok not configured',
        platform: 'tiktok',
        timestamp: new Date(),
      };
    }

    if (!this.rateLimiter.canMakeRequest('tiktok', 'post')) {
      return {
        success: false,
        error: 'Rate limit exceeded for TikTok',
        platform: 'tiktok',
        timestamp: new Date(),
      };
    }

    try {
      console.log('🎵 Posting to TikTok via API route:', content);

      const response = await fetch('/api/social/tiktok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content.text,
          videoUrl: content.videoUrl,
          hashtags: content.hashtags,
          accessToken: this.config.tiktok.accessToken,
          openId: this.config.tiktok.openId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'TikTok API error');
      }

      console.log('✅ TikTok post successful:', data);

      return {
        success: true,
        postId: data.postId,
        url: data.url,
        platform: 'tiktok',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('❌ TikTok post failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        platform: 'tiktok',
        timestamp: new Date(),
      };
    }
  }

  // Multi-platform posting
  async postToMultiplePlatforms(content: PostContent, platforms: string[]): Promise<PostResult[]> {
    try {
      console.log('🚀 Multi-platform posting via API route:', platforms);

      // Build platform configurations
      const platformConfigs: any = {};
      
      if (platforms.includes('instagram') && this.config.instagram) {
        platformConfigs.instagram = {
          accessToken: this.config.instagram.accessToken,
          businessAccountId: this.config.instagram.businessAccountId,
        };
      }
      
      if (platforms.includes('linkedin') && this.config.linkedin) {
        platformConfigs.linkedin = {
          accessToken: this.config.linkedin.accessToken,
          personId: this.config.linkedin.personId,
        };
      }
      
      if (platforms.includes('facebook') && this.config.facebook) {
        platformConfigs.facebook = {
          accessToken: this.config.facebook.accessToken,
          pageId: this.config.facebook.pageId,
        };
      }
      
      if (platforms.includes('twitter') && this.config.twitter) {
        platformConfigs.twitter = {
          bearerToken: this.config.twitter.bearerToken,
        };
      }
      
      if (platforms.includes('tiktok') && this.config.tiktok) {
        platformConfigs.tiktok = {
          accessToken: this.config.tiktok.accessToken,
          openId: this.config.tiktok.openId,
        };
      }

      const response = await fetch('/api/social/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content.text,
          imageUrl: content.imageUrl,
          videoUrl: content.videoUrl,
          link: content.link,
          hashtags: content.hashtags,
          platforms: platformConfigs,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Multi-platform posting failed');
      }

      // Convert API response to PostResult format
      const results: PostResult[] = data.results.map((result: any) => ({
        success: result.success,
        postId: result.postId,
        url: result.url,
        error: result.error,
        platform: result.platform,
        timestamp: new Date(),
      }));

      console.log('✅ Multi-platform posting completed:', results);
      return results;

    } catch (error) {
      console.error('❌ Multi-platform posting failed:', error);
      
      // Fallback to individual platform posting
      const results: PostResult[] = [];
      const promises = platforms.map(async (platform) => {
        switch (platform) {
          case 'instagram':
            return await this.postToInstagram(content);
          case 'linkedin':
            return await this.postToLinkedIn(content);
          case 'facebook':
            return await this.postToFacebook(content);
          case 'twitter':
            return await this.postToTwitter(content);
          case 'tiktok':
            return await this.postToTikTok(content);
          default:
            return {
              success: false,
              error: `Unknown platform: ${platform}`,
              platform,
              timestamp: new Date(),
            };
        }
      });

      const platformResults = await Promise.allSettled(promises);
      
      platformResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason?.message || 'Unknown error',
            platform: platforms[index],
            timestamp: new Date(),
          });
        }
      });

      return results;
    }
  }

  // Get platform status and account info
  async getPlatformStatus(platform: string): Promise<PlatformStatus> {
    const cacheKey = `status_${platform}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes cache
      return cached.data;
    }

    try {
      let accountInfo;
      
      switch (platform) {
        case 'instagram':
          if (!this.config.instagram) {
            return { platform, connected: false };
          }
          
          const instagramResponse = await fetch(`https://graph.facebook.com/v18.0/${this.config.instagram.userId}?fields=id,username,account_type&access_token=${this.config.instagram.accessToken}`);
          const instagramData = await instagramResponse.json();
          
                     accountInfo = {
             username: instagramData.username,
             displayName: instagramData.username,
           };
          break;

        case 'linkedin':
          if (!this.config.linkedin) {
            return { platform, connected: false };
          }
          
          const linkedinResponse = await fetch('https://api.linkedin.com/v2/me', {
            headers: {
              'Authorization': `Bearer ${this.config.linkedin.accessToken}`,
            },
          });
          const linkedinData = await linkedinResponse.json();
          
          accountInfo = {
            username: linkedinData.localizedFirstName + ' ' + linkedinData.localizedLastName,
            displayName: linkedinData.localizedFirstName + ' ' + linkedinData.localizedLastName,
          };
          break;

        case 'facebook':
          if (!this.config.facebook) {
            return { platform, connected: false };
          }
          
          const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${this.config.facebook.pageId}?fields=name,username&access_token=${this.config.facebook.accessToken}`);
          const facebookData = await facebookResponse.json();
          
          accountInfo = {
            username: facebookData.username,
            displayName: facebookData.name,
          };
          break;

        case 'twitter':
          if (!this.config.twitter) {
            return { platform, connected: false };
          }
          
          const twitterResponse = await fetch('https://api.twitter.com/2/users/me', {
            headers: {
              'Authorization': `Bearer ${this.config.twitter.bearerToken}`,
            },
          });
          const twitterData = await twitterResponse.json();
          
          accountInfo = {
            username: twitterData.data.username,
            displayName: twitterData.data.name,
          };
          break;

        default:
          return { platform, connected: false };
      }

      const status: PlatformStatus = {
        platform,
        connected: true,
        accountInfo,
        rateLimit: {
          remaining: this.rateLimiter.canMakeRequest(platform, 'post') ? 1 : 0,
          resetTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
          limit: 100, // Default limit
        },
      };

      this.cache.set(cacheKey, { data: status, timestamp: Date.now() });
      return status;
    } catch (error) {
      console.error(`Failed to get ${platform} status:`, error);
      return { platform, connected: false };
    }
  }

  // Get analytics for a post
  async getPostAnalytics(platform: string, postId: string): Promise<AnalyticsData | null> {
    try {
      switch (platform) {
        case 'instagram':
          if (!this.config.instagram) return null;
          
          const instagramResponse = await fetch(`https://graph.facebook.com/v18.0/${postId}?fields=insights.metric(impressions,reach,engagement)&access_token=${this.config.instagram.accessToken}`);
          const instagramData = await instagramResponse.json();
          
          return {
            platform,
            postId,
            likes: instagramData.likes || 0,
            comments: instagramData.comments || 0,
            shares: 0, // Instagram doesn't have shares
            reach: instagramData.insights?.data?.[0]?.values?.[0]?.value || 0,
            impressions: instagramData.insights?.data?.[1]?.values?.[0]?.value || 0,
            engagementRate: ((instagramData.likes + instagramData.comments) / (instagramData.insights?.data?.[1]?.values?.[0]?.value || 1)) * 100,
            timestamp: new Date(),
          };

        case 'linkedin':
          if (!this.config.linkedin) return null;
          
          const linkedinResponse = await fetch(`https://api.linkedin.com/v2/socialMetrics/${postId}`, {
            headers: {
              'Authorization': `Bearer ${this.config.linkedin.accessToken}`,
            },
          });
          const linkedinData = await linkedinResponse.json();
          
          return {
            platform,
            postId,
            likes: linkedinData.totalShareStatistics?.likeCount || 0,
            comments: linkedinData.totalShareStatistics?.commentCount || 0,
            shares: linkedinData.totalShareStatistics?.shareCount || 0,
            reach: linkedinData.totalShareStatistics?.impressionCount || 0,
            impressions: linkedinData.totalShareStatistics?.impressionCount || 0,
            engagementRate: ((linkedinData.totalShareStatistics?.likeCount + linkedinData.totalShareStatistics?.commentCount) / (linkedinData.totalShareStatistics?.impressionCount || 1)) * 100,
            timestamp: new Date(),
          };

        default:
          return null;
      }
    } catch (error) {
      console.error(`Failed to get analytics for ${platform} post ${postId}:`, error);
      return null;
    }
  }

  // Helper methods for formatting content
  private formatInstagramCaption(content: PostContent): string {
    let caption = content.text;
    
    if (content.hashtags && content.hashtags.length > 0) {
      caption += '\n\n' + content.hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
    }
    
    if (content.link) {
      caption += `\n\n${content.link}`;
    }
    
    return caption;
  }

  private formatLinkedInCaption(content: PostContent): string {
    let caption = content.text;
    
    if (content.hashtags && content.hashtags.length > 0) {
      caption += '\n\n' + content.hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
    }
    
    return caption;
  }

  private formatFacebookCaption(content: PostContent): string {
    let caption = content.text;
    
    if (content.hashtags && content.hashtags.length > 0) {
      caption += '\n\n' + content.hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
    }
    
    return caption;
  }

  private formatTwitterCaption(content: PostContent): string {
    let caption = content.text;
    
    if (content.hashtags && content.hashtags.length > 0) {
      caption += '\n\n' + content.hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
    }
    
    // Twitter has character limits
    if (caption.length > 280) {
      caption = caption.substring(0, 277) + '...';
    }
    
    return caption;
  }

  // Schedule posts
  async schedulePost(platform: string, content: PostContent, scheduledTime: Date): Promise<PostResult> {
    // This would integrate with platform-specific scheduling APIs
    // For now, we'll simulate scheduling
    console.log(`📅 Scheduling post for ${platform} at ${scheduledTime}`);
    
    return {
      success: true,
      postId: `scheduled_${Date.now()}`,
      platform,
      timestamp: scheduledTime,
    };
  }

  // Delete posts
  async deletePost(platform: string, postId: string): Promise<PostResult> {
    try {
      switch (platform) {
        case 'instagram':
          if (!this.config.instagram) {
            throw new Error('Instagram not configured');
          }
          
          const response = await fetch(`https://graph.facebook.com/v18.0/${postId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: this.config.instagram.accessToken,
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete Instagram post');
          }
          break;

        case 'linkedin':
          if (!this.config.linkedin) {
            throw new Error('LinkedIn not configured');
          }
          
          const linkedinResponse = await fetch(`https://api.linkedin.com/v2/ugcPosts/${postId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.config.linkedin.accessToken}`,
            },
          });
          
          if (!linkedinResponse.ok) {
            throw new Error('Failed to delete LinkedIn post');
          }
          break;

        default:
          throw new Error(`Delete not supported for ${platform}`);
      }

      return {
        success: true,
        postId,
        platform,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Failed to delete ${platform} post ${postId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        platform,
        timestamp: new Date(),
      };
    }
  }

  // Additional methods for APIIntegration component
  isConnected(platform: string): boolean {
    switch (platform) {
      case 'instagram':
        return !!this.config.instagram?.accessToken;
      case 'linkedin':
        return !!this.config.linkedin?.accessToken;
      case 'facebook':
        return !!this.config.facebook?.accessToken;
      case 'twitter':
        return !!this.config.twitter?.bearerToken;
      case 'tiktok':
        return !!this.config.tiktok?.accessToken;
      default:
        return false;
    }
  }

  async getProfile(platform: string): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.isConnected(platform)) {
      return { success: false, error: 'Platform not connected' };
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockProfile = {
        username: `mock_${platform}_user`,
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 1000),
        posts: Math.floor(Math.random() * 500),
        verified: Math.random() > 0.5,
      };

      return { success: true, data: mockProfile };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async authenticate(platform: string): Promise<{ success: boolean; error?: string }> {
    console.log(`🔐 Authenticating ${platform}...`);
    
    // Simulate authentication process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  }

  async disconnect(platform: string): Promise<{ success: boolean; error?: string }> {
    console.log(`🔌 Disconnecting ${platform}...`);
    
    // Simulate disconnection process
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  }

  async postContent(platform: string, content: any): Promise<{ success: boolean; error?: string }> {
    console.log(`📝 Posting content to ${platform}...`);
    
    try {
      let result: PostResult;
      
      switch (platform) {
        case 'instagram':
          result = await this.postToInstagram(content);
          break;
        case 'linkedin':
          result = await this.postToLinkedIn(content);
          break;
        case 'facebook':
          result = await this.postToFacebook(content);
          break;
        case 'twitter':
          result = await this.postToTwitter(content);
          break;
        case 'tiktok':
          result = await this.postToTikTok(content);
          break;
        default:
          return { success: false, error: 'Unknown platform' };
      }
      
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Mock service for development
export class MockSocialMediaAPIService extends SocialMediaAPIService {
  constructor() {
    super({});
  }

  async postToInstagram(content: PostContent): Promise<PostResult> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      postId: `mock_instagram_${Date.now()}`,
      url: 'https://www.instagram.com/p/mock_post/',
      platform: 'instagram',
      timestamp: new Date(),
      metadata: {
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
        reach: Math.floor(Math.random() * 1000),
      },
    };
  }

  async postToLinkedIn(content: PostContent): Promise<PostResult> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      postId: `mock_linkedin_${Date.now()}`,
      url: 'https://www.linkedin.com/feed/update/mock_post/',
      platform: 'linkedin',
      timestamp: new Date(),
      metadata: {
        likes: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 10),
        shares: Math.floor(Math.random() * 5),
        reach: Math.floor(Math.random() * 500),
      },
    };
  }

  async postToFacebook(content: PostContent): Promise<PostResult> {
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    return {
      success: true,
      postId: `mock_facebook_${Date.now()}`,
      url: 'https://www.facebook.com/mock_post',
      platform: 'facebook',
      timestamp: new Date(),
      metadata: {
        likes: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 30),
        shares: Math.floor(Math.random() * 15),
        reach: Math.floor(Math.random() * 2000),
      },
    };
  }

  async postToTwitter(content: PostContent): Promise<PostResult> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      success: true,
      postId: `mock_twitter_${Date.now()}`,
      url: 'https://twitter.com/user/status/mock_post',
      platform: 'twitter',
      timestamp: new Date(),
      metadata: {
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
        reach: Math.floor(Math.random() * 800),
      },
    };
  }

  async postToTikTok(content: PostContent): Promise<PostResult> {
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    return {
      success: true,
      postId: `mock_tiktok_${Date.now()}`,
      url: 'https://www.tiktok.com/@user/video/mock_post',
      platform: 'tiktok',
      timestamp: new Date(),
      metadata: {
        likes: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 50),
        shares: Math.floor(Math.random() * 25),
        reach: Math.floor(Math.random() * 5000),
      },
    };
  }

  async getPlatformStatus(platform: string): Promise<PlatformStatus> {
    return {
      platform,
      connected: true,
      accountInfo: {
        username: `mock_${platform}_user`,
        displayName: `Mock ${platform} User`,
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 1000),
      },
      rateLimit: {
        remaining: Math.floor(Math.random() * 100),
        resetTime: new Date(Date.now() + 15 * 60 * 1000),
        limit: 100,
      },
    };
  }
}

// Export the appropriate service based on environment
export const socialMediaAPI = (() => {
  console.log('🔧 Initializing socialMediaAPI...');
  
  // Check if we have any real API configurations
  const hasRealConfig = process.env.INSTAGRAM_ACCESS_TOKEN || 
                       process.env.LINKEDIN_ACCESS_TOKEN || 
                       process.env.FACEBOOK_ACCESS_TOKEN || 
                       process.env.TWITTER_API_KEY;
  
  if (hasRealConfig && process.env.NODE_ENV === 'production') {
    console.log('🚀 Creating real SocialMediaAPIService...');
    const config: SocialMediaConfig = {
      instagram: process.env.INSTAGRAM_ACCESS_TOKEN ? {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        userId: process.env.INSTAGRAM_USER_ID || '',
        businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
      } : undefined,
      linkedin: process.env.LINKEDIN_ACCESS_TOKEN ? {
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
        personId: process.env.LINKEDIN_PERSON_ID,
        organizationId: process.env.LINKEDIN_ORGANIZATION_ID,
      } : undefined,
      facebook: process.env.FACEBOOK_ACCESS_TOKEN ? {
        accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
        pageId: process.env.FACEBOOK_PAGE_ID || '',
      } : undefined,
      twitter: process.env.TWITTER_API_KEY ? {
        apiKey: process.env.TWITTER_API_KEY,
        apiSecret: process.env.TWITTER_API_SECRET || '',
        accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
        accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
        bearerToken: process.env.TWITTER_BEARER_TOKEN,
      } : undefined,
    };
    
    return new SocialMediaAPIService(config);
  } else {
    console.log('🎭 Using MockSocialMediaAPIService for development...');
    return new MockSocialMediaAPIService();
  }
})(); 