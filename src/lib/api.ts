// API Configuration and Base Setup
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.postpal.app';
const API_VERSION = 'v1';

// API Response Types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Client Class
class APIClient {
  private baseURL: string;
  private version: string;
  private cache: Map<string, { data: unknown; timestamp: number; ttl: number }>;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.version = API_VERSION;
    this.cache = new Map();
  }

  // Base request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}/${this.version}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Cache management
  private getCacheKey(endpoint: string, params?: Record<string, unknown>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramString}`;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < cached.ttl;
  }

  private setCache(key: string, data: unknown, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  // GET request with caching
  async get<T>(endpoint: string, params?: Record<string, unknown>, ttl?: number): Promise<APIResponse<T>> {
    const cacheKey = this.getCacheKey(endpoint, params);
    
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return {
        success: true,
        data: cached!.data as T,
        timestamp: new Date().toISOString(),
      };
    }

    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    const response = await this.request<T>(`${endpoint}${queryString}`);
    
    if (response.success && response.data) {
      this.setCache(cacheKey, response.data, ttl);
    }

    return response;
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Clear cache
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

// Analytics API Methods
export interface AnalyticsData {
  engagementRate: number;
  followersGrowth: number;
  totalImpressions: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  bestPostingTime: string;
  topPerformingPost: string;
  audienceGrowth: number;
}

export interface PostPerformance {
  id: string;
  title: string;
  platform: string;
  date: string;
  impressions: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
}

export interface ChartPoint {
  name: string;
  engagement: number;
  followers: number;
  impressions: number;
  value: number;
}

export interface PlatformData {
  platform: string;
  followers: number;
  engagement: number;
  growth: number;
  color: string;
}

export class AnalyticsAPI {
  private client: APIClient;

  constructor() {
    this.client = new APIClient();
  }

  // Get dashboard analytics
  async getDashboardAnalytics(timeRange: string = '7d'): Promise<APIResponse<AnalyticsData>> {
    return this.client.get<AnalyticsData>('/analytics/dashboard', { timeRange }, 2 * 60 * 1000); // 2 min cache
  }

  // Get top performing posts
  async getTopPosts(limit: number = 10): Promise<APIResponse<PostPerformance[]>> {
    return this.client.get<PostPerformance[]>('/analytics/posts/top', { limit }, 5 * 60 * 1000); // 5 min cache
  }

  // Get chart data
  async getChartData(days: number = 7): Promise<APIResponse<ChartPoint[]>> {
    return this.client.get<ChartPoint[]>('/analytics/chart', { days }, 2 * 60 * 1000); // 2 min cache
  }

  // Get platform performance
  async getPlatformPerformance(): Promise<APIResponse<PlatformData[]>> {
    return this.client.get<PlatformData[]>('/analytics/platforms', {}, 5 * 60 * 1000); // 5 min cache
  }

  // Refresh analytics data
  async refreshAnalytics(): Promise<APIResponse<{ message: string }>> {
    this.client.clearCache('analytics');
    return this.client.post<{ message: string }>('/analytics/refresh');
  }
}

// Content Management API Methods
export interface PostData {
  id?: string;
  title: string;
  caption: string;
  hashtags: string[];
  imagePrompt: string;
  platform: string;
  contentType: string;
  tone: string;
  targetAudience: string;
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
}

export interface AIGeneratedContent {
  id: string;
  type: 'caption' | 'hashtags' | 'image-prompt' | 'complete-post';
  content: string;
  platform: string;
  contentType: string;
  tone: string;
  engagement: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: string;
}

export class ContentAPI {
  private client: APIClient;

  constructor() {
    this.client = new APIClient();
  }

  // Generate AI content
  async generateContent(prompt: string, options: Partial<PostData>): Promise<APIResponse<AIGeneratedContent[]>> {
    return this.client.post<AIGeneratedContent[]>('/content/generate', {
      prompt,
      ...options,
    });
  }

  // Save post
  async savePost(post: PostData): Promise<APIResponse<PostData>> {
    if (post.id) {
      return this.client.put<PostData>(`/content/posts/${post.id}`, post);
    } else {
      return this.client.post<PostData>('/content/posts', post);
    }
  }

  // Get saved posts
  async getSavedPosts(page: number = 1, limit: number = 20): Promise<APIResponse<PaginatedResponse<PostData>>> {
    return this.client.get<PaginatedResponse<PostData>>('/content/posts/saved', { page, limit });
  }

  // Delete post
  async deletePost(id: string): Promise<APIResponse<{ message: string }>> {
    return this.client.delete<{ message: string }>(`/content/posts/${id}`);
  }

  // Schedule post
  async schedulePost(id: string, scheduledFor: string): Promise<APIResponse<PostData>> {
    return this.client.put<PostData>(`/content/posts/${id}/schedule`, { scheduledFor });
  }
}

// User Management API Methods
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  brandName?: string;
  industry?: string;
  audience?: string;
  platforms: string[];
  tone?: string;
  postingFrequency?: string;
  subscription?: {
    plan: 'free' | 'pro' | 'business' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class UserAPI {
  private client: APIClient;

  constructor() {
    this.client = new APIClient();
  }

  // Get user profile
  async getProfile(): Promise<APIResponse<UserProfile>> {
    return this.client.get<UserProfile>('/user/profile', {}, 10 * 60 * 1000); // 10 min cache
  }

  // Update user profile
  async updateProfile(updates: Partial<UserProfile>): Promise<APIResponse<UserProfile>> {
    return this.client.put<UserProfile>('/user/profile', updates);
  }

  // Update onboarding data
  async completeOnboarding(data: Partial<UserProfile>): Promise<APIResponse<UserProfile>> {
    return this.client.post<UserProfile>('/user/onboarding', data);
  }
}

// Export API instances
export const analyticsAPI = new AnalyticsAPI();
export const contentAPI = new ContentAPI();
export const userAPI = new UserAPI();

// Export base client for custom requests
export const apiClient = new APIClient();

// Utility function to handle API errors
export const handleAPIError = (error: string): string => {
  // Map common API errors to user-friendly messages
  const errorMap: Record<string, string> = {
    'UNAUTHORIZED': 'Please log in to continue',
    'FORBIDDEN': 'You don\'t have permission to perform this action',
    'NOT_FOUND': 'The requested resource was not found',
    'RATE_LIMITED': 'Too many requests. Please try again later',
    'VALIDATION_ERROR': 'Please check your input and try again',
    'NETWORK_ERROR': 'Network error. Please check your connection',
  };

  return errorMap[error] || error || 'An unexpected error occurred';
};

// Mock data fallback for development
export const getMockData = () => ({
  analytics: {
    engagementRate: 8.2,
    followersGrowth: 12.5,
    totalImpressions: 124700,
    totalReach: 89200,
    totalLikes: 15600,
    totalComments: 2300,
    totalShares: 890,
    bestPostingTime: "2:00 PM",
    topPerformingPost: "Behind the Scenes: Our Creative Process",
    audienceGrowth: 15.3,
  },
  platforms: [
    { platform: "Instagram", followers: 12500, engagement: 8.5, growth: 12.3, color: "from-pink-400 to-purple-500" },
    { platform: "LinkedIn", followers: 8900, engagement: 15.2, growth: 8.7, color: "from-blue-500 to-blue-600" },
    { platform: "Facebook", followers: 6700, engagement: 9.8, growth: 5.4, color: "from-blue-600 to-blue-700" },
    { platform: "Twitter", followers: 4200, engagement: 6.2, growth: 3.1, color: "from-black to-gray-900" },
  ],
});
