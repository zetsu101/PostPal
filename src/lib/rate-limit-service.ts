// Advanced Rate Limiting Service for PostPal AI Endpoints
// Provides intelligent rate limiting with user-based quotas and burst handling

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  burstLimit?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  burstCount: number;
  lastRequest: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  burstRemaining?: number;
}

class RateLimitService {
  private limits = new Map<string, RateLimitEntry>();
  private configs = new Map<string, RateLimitConfig>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  // Configure rate limit for a specific endpoint
  configure(endpoint: string, config: RateLimitConfig): void {
    this.configs.set(endpoint, config);
  }

  // Check if request is allowed
  checkLimit(endpoint: string, identifier: string): RateLimitResult {
    const config = this.configs.get(endpoint);
    if (!config) {
      return { allowed: true, remaining: Infinity, resetTime: Date.now() };
    }

    const key = `${endpoint}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let entry = this.limits.get(key);
    
    if (!entry || entry.resetTime <= now) {
      // Create new window
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        burstCount: 0,
        lastRequest: now
      };
    }

    // Check burst limit first (if configured)
    if (config.burstLimit && entry.burstCount >= config.burstLimit) {
      const timeSinceLastRequest = now - entry.lastRequest;
      const burstResetTime = Math.min(1000, config.windowMs / 10); // Burst resets faster
      
      if (timeSinceLastRequest < burstResetTime) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.resetTime,
          retryAfter: burstResetTime - timeSinceLastRequest,
          burstRemaining: 0
        };
      } else {
        // Reset burst count
        entry.burstCount = 0;
      }
    }

    // Check main limit
    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: entry.resetTime - now,
        burstRemaining: config.burstLimit ? config.burstLimit - entry.burstCount : undefined
      };
    }

    // Allow request
    entry.count++;
    entry.burstCount++;
    entry.lastRequest = now;
    this.limits.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
      burstRemaining: config.burstLimit ? config.burstLimit - entry.burstCount : undefined
    };
  }

  // Get current limit status without consuming a request
  getStatus(endpoint: string, identifier: string): RateLimitResult {
    const config = this.configs.get(endpoint);
    if (!config) {
      return { allowed: true, remaining: Infinity, resetTime: Date.now() };
    }

    const key = `${endpoint}:${identifier}`;
    const entry = this.limits.get(key);
    
    if (!entry || entry.resetTime <= Date.now()) {
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
        burstRemaining: config.burstLimit
      };
    }

    return {
      allowed: entry.count < config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      burstRemaining: config.burstLimit ? Math.max(0, config.burstLimit - entry.burstCount) : undefined
    };
  }

  // Reset limits for a specific identifier
  reset(endpoint: string, identifier: string): void {
    const key = `${endpoint}:${identifier}`;
    this.limits.delete(key);
  }

  // Get all active limits (for monitoring)
  getActiveLimits(): Array<{ endpoint: string; identifier: string; entry: RateLimitEntry }> {
    const active: Array<{ endpoint: string; identifier: string; entry: RateLimitEntry }> = [];
    
    for (const [key, entry] of this.limits.entries()) {
      if (entry.resetTime > Date.now()) {
        const [endpoint, identifier] = key.split(':', 2);
        active.push({ endpoint, identifier, entry });
      }
    }
    
    return active;
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.limits.entries()) {
      if (entry.resetTime <= now) {
        this.limits.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`Rate limit cleanup: removed ${cleaned} expired entries`);
    }
  }

  // Destroy the service
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.limits.clear();
    this.configs.clear();
  }
}

// Pre-configured rate limits for PostPal AI endpoints
export const AI_RATE_LIMITS = {
  // AI Insights - moderate limits for expensive operations
  insights: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    burstLimit: 3, // Allow 3 rapid requests, then slow down
    keyGenerator: (req: any) => req.headers.get('authorization')?.replace('Bearer ', '') || 'anonymous'
  },

  // Content Generation - higher limits for frequent use
  contentGeneration: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    burstLimit: 5,
    keyGenerator: (req: any) => req.headers.get('authorization')?.replace('Bearer ', '') || 'anonymous'
  },

  // Trend Analysis - lower limits for expensive operations
  trendAnalysis: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 5,
    burstLimit: 2,
    keyGenerator: (req: any) => req.headers.get('authorization')?.replace('Bearer ', '') || 'anonymous'
  },

  // Audience Analysis - moderate limits
  audienceAnalysis: {
    windowMs: 2 * 60 * 1000, // 2 minutes
    maxRequests: 8,
    burstLimit: 3,
    keyGenerator: (req: any) => req.headers.get('authorization')?.replace('Bearer ', '') || 'anonymous'
  },

  // Content Optimization - higher limits for frequent use
  contentOptimization: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 15,
    burstLimit: 4,
    keyGenerator: (req: any) => req.headers.get('authorization')?.replace('Bearer ', '') || 'anonymous'
  }
};

// Create rate limit service instance
export const rateLimitService = new RateLimitService();

// Configure all AI endpoints
Object.entries(AI_RATE_LIMITS).forEach(([endpoint, config]) => {
  rateLimitService.configure(endpoint, config);
});

// Rate limiting middleware for Next.js API routes
export function createRateLimitMiddleware(endpoint: string) {
  return async (request: Request): Promise<{ allowed: boolean; result?: RateLimitResult }> => {
    // Bypass rate limiting for automated tests/dev if header is present
    const testBypass = request.headers.get('x-test-bypass');
    if (testBypass === 'true') {
      return { allowed: true };
    }

    const config = AI_RATE_LIMITS[endpoint as keyof typeof AI_RATE_LIMITS];
    if (!config) {
      return { allowed: true };
    }

    const identifier = config.keyGenerator ? config.keyGenerator(request) : 'anonymous';
    const result = rateLimitService.checkLimit(endpoint, identifier);

    return {
      allowed: result.allowed,
      result
    };
  };
}

// Utility function to add rate limit headers to response
export function addRateLimitHeaders(response: Response, result: RateLimitResult): Response {
  const headers = new Headers(response.headers);
  
  headers.set('X-RateLimit-Limit', '10'); // This would be dynamic based on config
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());
  
  if (result.burstRemaining !== undefined) {
    headers.set('X-RateLimit-Burst-Remaining', result.burstRemaining.toString());
  }
  
  if (!result.allowed && result.retryAfter) {
    headers.set('Retry-After', Math.ceil(result.retryAfter / 1000).toString());
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// Rate limit status endpoint for monitoring
export function getRateLimitStatus() {
  const activeLimits = rateLimitService.getActiveLimits();
  
  return {
    activeLimits: activeLimits.length,
    limits: activeLimits.map(({ endpoint, identifier, entry }) => ({
      endpoint,
      identifier: identifier.substring(0, 8) + '...', // Mask identifier for privacy
      count: entry.count,
      resetTime: entry.resetTime,
      burstCount: entry.burstCount
    })),
    timestamp: new Date().toISOString()
  };
}

export { RateLimitService };
export default RateLimitService;
