// Migration service to move from localStorage to database
import { DatabaseService } from './supabase';

export interface LocalStorageData {
  user?: any;
  posts?: any[];
  analytics?: any[];
  socialConfigs?: any[];
  templates?: any[];
}

export class MigrationService {
  // Get data from localStorage
  static getLocalStorageData(): LocalStorageData {
    try {
      const data: LocalStorageData = {};
      
      // Get user data
      const userData = localStorage.getItem('user');
      if (userData) {
        data.user = JSON.parse(userData);
      }
      
      // Get posts data
      const postsData = localStorage.getItem('posts');
      if (postsData) {
        data.posts = JSON.parse(postsData);
      }
      
      // Get analytics data
      const analyticsData = localStorage.getItem('analytics');
      if (analyticsData) {
        data.analytics = JSON.parse(analyticsData);
      }
      
      // Get social configs
      const socialConfigsData = localStorage.getItem('socialMediaConfig');
      if (socialConfigsData) {
        data.socialConfigs = JSON.parse(socialConfigsData);
      }
      
      // Get templates
      const templatesData = localStorage.getItem('templates');
      if (templatesData) {
        data.templates = JSON.parse(templatesData);
      }
      
      return data;
    } catch (error) {
      console.error('Error reading localStorage data:', error);
      return {};
    }
  }
  
  // Migrate user data
  static async migrateUser(localUser: any): Promise<string> {
    try {
      const userData = {
        email: localUser.email || 'demo@postpal.com',
        name: localUser.name || 'Demo User',
        avatar_url: localUser.avatar_url,
        subscription_plan: localUser.subscription_plan || 'free',
      };
      
      const user = await DatabaseService.createUser(userData);
      console.log('✅ User migrated:', user.id);
      return user.id;
    } catch (error) {
      console.error('❌ User migration failed:', error);
      throw error;
    }
  }
  
  // Migrate posts data
  static async migratePosts(localPosts: any[], userId: string): Promise<void> {
    try {
      for (const post of localPosts) {
        const postData = {
          user_id: userId,
          title: post.title || 'Untitled Post',
          content: post.content || post.text || '',
          platform: post.platform || 'instagram',
          status: post.status || 'draft',
          scheduled_at: post.scheduled_at,
          published_at: post.published_at,
          post_id: post.post_id,
          url: post.url,
          image_url: post.image_url,
          hashtags: post.hashtags || [],
        };
        
        await DatabaseService.createPost(postData);
      }
      
      console.log(`✅ ${localPosts.length} posts migrated`);
    } catch (error) {
      console.error('❌ Posts migration failed:', error);
      throw error;
    }
  }
  
  // Migrate analytics data
  static async migrateAnalytics(localAnalytics: any[]): Promise<void> {
    try {
      for (const analytic of localAnalytics) {
        const analyticsData = {
          post_id: analytic.post_id,
          platform: analytic.platform,
          likes: analytic.likes || 0,
          comments: analytic.comments || 0,
          shares: analytic.shares || 0,
          reach: analytic.reach || 0,
          impressions: analytic.impressions || 0,
          engagement_rate: analytic.engagement_rate || 0,
        };
        
        await DatabaseService.createAnalytics(analyticsData);
      }
      
      console.log(`✅ ${localAnalytics.length} analytics records migrated`);
    } catch (error) {
      console.error('❌ Analytics migration failed:', error);
      throw error;
    }
  }
  
  // Migrate social media configs
  static async migrateSocialConfigs(localConfigs: any, userId: string): Promise<void> {
    try {
      const platforms = ['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok'];
      
      for (const platform of platforms) {
        const config = localConfigs[platform];
        if (config && config.accessToken) {
          const configData = {
            user_id: userId,
            platform: platform,
            access_token: config.accessToken,
            refresh_token: config.refreshToken,
            expires_at: config.expiresAt,
            account_info: {
              userId: config.userId,
              businessAccountId: config.businessAccountId,
              personId: config.personId,
              pageId: config.pageId,
              apiKey: config.apiKey,
              apiSecret: config.apiSecret,
              bearerToken: config.bearerToken,
              openId: config.openId,
              clientKey: config.clientKey,
              clientSecret: config.clientSecret,
            },
            is_active: config.connected || false,
          };
          
          await DatabaseService.createSocialConfig(configData);
        }
      }
      
      console.log('✅ Social media configs migrated');
    } catch (error) {
      console.error('❌ Social configs migration failed:', error);
      throw error;
    }
  }
  
  // Full migration process
  static async migrateAll(): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      console.log('🚀 Starting migration from localStorage to database...');
      
      const localData = this.getLocalStorageData();
      
      if (!localData.user) {
        throw new Error('No user data found in localStorage');
      }
      
      // Migrate user
      const userId = await this.migrateUser(localData.user);
      
      // Migrate posts
      if (localData.posts && localData.posts.length > 0) {
        await this.migratePosts(localData.posts, userId);
      }
      
      // Migrate analytics
      if (localData.analytics && localData.analytics.length > 0) {
        await this.migrateAnalytics(localData.analytics);
      }
      
      // Migrate social configs
      if (localData.socialConfigs) {
        await this.migrateSocialConfigs(localData.socialConfigs, userId);
      }
      
      console.log('✅ Migration completed successfully!');
      
      return { success: true, userId };
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  // Check if migration is needed
  static needsMigration(): boolean {
    const hasLocalData = 
      localStorage.getItem('user') ||
      localStorage.getItem('posts') ||
      localStorage.getItem('analytics') ||
      localStorage.getItem('socialMediaConfig') ||
      localStorage.getItem('templates');
    
    const hasMigrated = localStorage.getItem('migrated_to_database');
    
    return !!hasLocalData && !hasMigrated;
  }
  
  // Mark migration as completed
  static markMigrationCompleted(): void {
    localStorage.setItem('migrated_to_database', 'true');
  }
  
  // Clear localStorage after successful migration
  static clearLocalStorage(): void {
    const keysToKeep = ['migrated_to_database'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ localStorage cleared after migration');
  }
}
