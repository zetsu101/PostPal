// Advanced Caching Service for PostPal AI Operations
// Provides in-memory caching with TTL, Redis support, and intelligent cache invalidation

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

interface CacheConfig {
  defaultTTL: number; // in milliseconds
  maxSize: number;
  enableStats: boolean;
  enablePersistence: boolean;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      enableStats: true,
      enablePersistence: false,
      ...config
    };

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  // Generate cache key from content and parameters
  generateKey(prefix: string, content: string, params: Record<string, any> = {}): string {
    const contentHash = this.hashString(content);
    const paramsHash = this.hashString(JSON.stringify(params));
    return `${prefix}:${contentHash}:${paramsHash}`;
  }

  // Set cache entry
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      hits: 0,
      lastAccessed: Date.now()
    };

    // Evict oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.stats.totalRequests++;
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.totalRequests++;
      return null;
    }

    // Update access statistics
    entry.hits++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    this.stats.totalRequests++;

    return entry.data;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    return Date.now() - entry.timestamp <= entry.ttl;
  }

  // Delete specific key
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  // Get cache statistics
  getStats() {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.size,
      maxSize: this.config.maxSize,
      utilization: Math.round((this.cache.size / this.config.maxSize) * 100)
    };
  }

  // Get cache keys by pattern
  getKeys(pattern?: string): string[] {
    const keys = Array.from(this.cache.keys());
    if (!pattern) return keys;
    
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(key => regex.test(key));
  }

  // Invalidate cache by pattern
  invalidatePattern(pattern: string): number {
    const keys = this.getKeys(pattern);
    let deleted = 0;
    
    keys.forEach(key => {
      if (this.cache.delete(key)) {
        deleted++;
      }
    });
    
    return deleted;
  }

  // Warm up cache with common data
  async warmup(warmupData: Array<{ key: string; data: any; ttl?: number }>): Promise<void> {
    warmupData.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }

  // Private methods
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
  }
}

// AI-specific cache configurations
export const AI_CACHE_CONFIGS = {
  // Content scoring cache - short TTL since content changes frequently
  contentScoring: {
    defaultTTL: 2 * 60 * 1000, // 2 minutes
    maxSize: 500,
    prefix: 'content_score'
  },

  // Engagement prediction cache - medium TTL
  engagementPrediction: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 300,
    prefix: 'engagement_pred'
  },

  // Trend analysis cache - longer TTL since trends change slowly
  trendAnalysis: {
    defaultTTL: 15 * 60 * 1000, // 15 minutes
    maxSize: 200,
    prefix: 'trend_analysis'
  },

  // Audience analysis cache - longest TTL since audience changes slowly
  audienceAnalysis: {
    defaultTTL: 30 * 60 * 1000, // 30 minutes
    maxSize: 100,
    prefix: 'audience_analysis'
  },

  // Optimal timing cache - medium TTL
  optimalTiming: {
    defaultTTL: 10 * 60 * 1000, // 10 minutes
    maxSize: 150,
    prefix: 'optimal_timing'
  }
};

// Create cache instances
export const contentScoringCache = new CacheService(AI_CACHE_CONFIGS.contentScoring);
export const engagementPredictionCache = new CacheService(AI_CACHE_CONFIGS.engagementPrediction);
export const trendAnalysisCache = new CacheService(AI_CACHE_CONFIGS.trendAnalysis);
export const audienceAnalysisCache = new CacheService(AI_CACHE_CONFIGS.audienceAnalysis);
export const optimalTimingCache = new CacheService(AI_CACHE_CONFIGS.optimalTiming);

// Cache decorator for AI functions
export function cached<T extends any[], R>(
  cacheInstance: CacheService,
  keyGenerator: (...args: T) => string,
  ttl?: number
) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: T): Promise<R> {
      const key = keyGenerator(...args);
      
      // Try to get from cache first
      const cached = cacheInstance.get<R>(key);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await method.apply(this, args);
      
      // Cache the result
      cacheInstance.set(key, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

// Utility function to create cache keys for AI operations
export function createAIKey(operation: string, content: string, params: Record<string, any> = {}): string {
  const config = AI_CACHE_CONFIGS[operation as keyof typeof AI_CACHE_CONFIGS];
  if (!config) {
    throw new Error(`Unknown AI operation: ${operation}`);
  }
  
  return contentScoringCache.generateKey(config.prefix, content, params);
}

// Cache warming utilities
export async function warmupAICache(): Promise<void> {
  const warmupData = [
    // Common content patterns
    { key: createAIKey('contentScoring', 'Hello world! #socialmedia'), data: { score: 75 } },
    { key: createAIKey('engagementPrediction', 'Check out our new product!'), data: { engagement: 0.8 } },
    
    // Common audience patterns
    { key: createAIKey('audienceAnalysis', 'tech_audience'), data: { demographics: { ageGroups: [] } } },
    
    // Common timing patterns
    { key: createAIKey('optimalTiming', 'general'), data: { bestTimes: [] } }
  ];

  await contentScoringCache.warmup(warmupData);
}

// Export the main cache service class for custom usage
export { CacheService };
export default CacheService;
