import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Export createClient function for server-side usage
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
};

// Enhanced Supabase client for server-side operations
export const createServerClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_plan: 'free' | 'pro' | 'team';
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  platform: 'instagram' | 'linkedin' | 'facebook' | 'twitter' | 'tiktok';
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_at?: string;
  published_at?: string;
  post_id?: string;
  url?: string;
  image_url?: string;
  hashtags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string;
  post_id: string;
  platform: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  recorded_at: string;
}

export interface SocialMediaConfig {
  id: string;
  user_id: string;
  platform: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  account_info?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Extended database types for new features
export interface Organization {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  subscription_plan: 'free' | 'pro' | 'enterprise';
  settings?: any;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'suspended' | 'invited';
  department_id?: string;
  permissions?: any;
  joined_at: string;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  manager_id?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface AIOptimization {
  id: string;
  user_id: string;
  organization_id?: string;
  original_content: string;
  optimized_content: string;
  platform: string;
  optimization_score: number;
  improvements_applied?: any;
  predicted_metrics?: any;
  actual_metrics?: any;
  model_used: string;
  processing_time_ms: number;
  created_at: string;
  updated_at: string;
}

export interface PerformanceMetric {
  id: string;
  user_id?: string;
  organization_id?: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  category: string;
  platform?: string;
  device_info?: any;
  browser_info?: any;
  recorded_at: string;
}

// Database helper functions
export class DatabaseService {
  // User operations
  static async createUser(userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUser(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Post operations
  static async createPost(postData: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getPosts(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  static async updatePost(postId: string, updates: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deletePost(postId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    return true;
  }

  // Analytics operations
  static async createAnalytics(analyticsData: Partial<Analytics>) {
    const { data, error } = await supabase
      .from('analytics')
      .insert([analyticsData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getAnalytics(postId: string) {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('post_id', postId)
      .order('recorded_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Social media config operations
  static async createSocialConfig(configData: Partial<SocialMediaConfig>) {
    const { data, error } = await supabase
      .from('social_media_configs')
      .insert([configData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getSocialConfigs(userId: string) {
    const { data, error } = await supabase
      .from('social_media_configs')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  }

  static async updateSocialConfig(configId: string, updates: Partial<SocialMediaConfig>) {
    const { data, error } = await supabase
      .from('social_media_configs')
      .update(updates)
      .eq('id', configId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteSocialConfig(configId: string) {
    const { error } = await supabase
      .from('social_media_configs')
      .delete()
      .eq('id', configId);
    
    if (error) throw error;
    return true;
  }

  // Utility functions
  static async getUserStats(userId: string) {
    const [postsResult, analyticsResult] = await Promise.all([
      supabase
        .from('posts')
        .select('id, status, platform, created_at')
        .eq('user_id', userId),
      supabase
        .from('analytics')
        .select('likes, comments, shares, reach, impressions')
        .in('post_id', []) // This would be populated with actual post IDs
    ]);

    if (postsResult.error) throw postsResult.error;
    if (analyticsResult.error) throw analyticsResult.error;

    const posts = postsResult.data || [];
    const analytics = analyticsResult.data || [];

    return {
      totalPosts: posts.length,
      publishedPosts: posts.filter(p => p.status === 'published').length,
      scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
      totalLikes: analytics.reduce((sum, a) => sum + a.likes, 0),
      totalComments: analytics.reduce((sum, a) => sum + a.comments, 0),
      totalShares: analytics.reduce((sum, a) => sum + a.shares, 0),
      totalReach: analytics.reduce((sum, a) => sum + a.reach, 0),
      totalImpressions: analytics.reduce((sum, a) => sum + a.impressions, 0),
    };
  }

  // Extended operations for new features
  
  // AI Optimization operations
  static async createAIOptimization(optimizationData: Partial<AIOptimization>) {
    const { data, error } = await supabase
      .from('ai_optimizations')
      .insert([optimizationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getAIOptimizations(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('ai_optimizations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  // Performance metrics operations
  static async createPerformanceMetric(metricData: Partial<PerformanceMetric>) {
    const { data, error } = await supabase
      .from('performance_metrics')
      .insert([metricData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getPerformanceMetrics(userId: string, category?: string, limit = 100) {
    let query = supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  // Organization operations
  static async getOrganizations(userId: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        team_members!inner(user_id)
      `)
      .eq('team_members.user_id', userId)
      .or(`owner_id.eq.${userId}`);
    
    if (error) throw error;
    return data;
  }

  static async createOrganization(orgData: Partial<Organization>) {
    const { data, error } = await supabase
      .from('organizations')
      .insert([orgData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Team member operations
  static async getTeamMembers(organizationId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user:users(id, name, email, avatar_url),
        department:departments(id, name, color)
      `)
      .eq('organization_id', organizationId);
    
    if (error) throw error;
    return data;
  }
}
