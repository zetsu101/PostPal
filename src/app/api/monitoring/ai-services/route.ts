import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServerClient } from '@/lib/supabase';
import { APIResponse } from '@/lib/api-middleware';
import { 
  contentScoringCache, 
  engagementPredictionCache, 
  trendAnalysisCache, 
  audienceAnalysisCache, 
  optimalTimingCache 
} from '@/lib/cache-service';
import { rateLimitService, getRateLimitStatus } from '@/lib/rate-limit-service';
import { realtimeInsightsService } from '@/lib/realtime-insights-service';

// AI Services Monitoring Endpoint
export async function GET(request: NextRequest) {
  try {
    // Extract and validate authorization token
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return APIResponse.unauthorized('Valid authorization token required');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return APIResponse.unauthorized('Invalid or expired token');
    }

    // Check if user has admin privileges (you might want to implement proper role checking)
    const isAdmin = user.user_metadata?.role === 'admin' || user.email === 'admin@postpal.com';
    
    if (!isAdmin) {
      return APIResponse.forbidden('Admin access required for monitoring');
    }

    // Get cache statistics
    const cacheStats = {
      contentScoring: contentScoringCache.getStats(),
      engagementPrediction: engagementPredictionCache.getStats(),
      trendAnalysis: trendAnalysisCache.getStats(),
      audienceAnalysis: audienceAnalysisCache.getStats(),
      optimalTiming: optimalTimingCache.getStats()
    };

    // Get rate limiting statistics
    const rateLimitStats = getRateLimitStatus();

    // Get real-time service statistics
    const realtimeStats = realtimeInsightsService.getStats();

    // Calculate overall system health
    const systemHealth = calculateSystemHealth(cacheStats, rateLimitStats, realtimeStats);

    // Get memory usage (Node.js specific)
    const memoryUsage = process.memoryUsage();
    const memoryStats = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024) // MB
    };

    // Get uptime
    const uptime = {
      process: Math.round(process.uptime()), // seconds
      timestamp: new Date().toISOString()
    };

    const monitoringData = {
      systemHealth,
      cacheStats,
      rateLimitStats,
      realtimeStats,
      memoryStats,
      uptime,
      timestamp: new Date().toISOString()
    };

    return APIResponse.success(monitoringData, 'AI services monitoring data retrieved');

  } catch (error) {
    console.error('AI monitoring error:', error);
    return APIResponse.serverError(
      'Failed to retrieve monitoring data',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// Calculate overall system health score
function calculateSystemHealth(cacheStats: any, rateLimitStats: any, realtimeStats: any): {
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
} {
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check cache hit rates
  Object.entries(cacheStats).forEach(([service, stats]: [string, any]) => {
    if (stats.hitRate < 50) {
      score -= 10;
      issues.push(`Low cache hit rate for ${service}: ${stats.hitRate}%`);
      recommendations.push(`Consider increasing cache TTL for ${service}`);
    }
    
    if (stats.utilization > 90) {
      score -= 5;
      issues.push(`High cache utilization for ${service}: ${stats.utilization}%`);
      recommendations.push(`Consider increasing cache size for ${service}`);
    }
  });

  // Check rate limiting
  if (rateLimitStats.activeLimits > 50) {
    score -= 15;
    issues.push(`High number of active rate limits: ${rateLimitStats.activeLimits}`);
    recommendations.push('Monitor for potential abuse or consider adjusting rate limits');
  }

  // Check real-time connections
  if (realtimeStats.totalClients > 1000) {
    score -= 10;
    issues.push(`High number of WebSocket connections: ${realtimeStats.totalClients}`);
    recommendations.push('Consider implementing connection pooling or load balancing');
  }

  if (realtimeStats.queuedMessages > 100) {
    score -= 5;
    issues.push(`High number of queued messages: ${realtimeStats.queuedMessages}`);
    recommendations.push('Check message processing performance');
  }

  // Determine status
  let status: 'healthy' | 'warning' | 'critical';
  if (score >= 90) {
    status = 'healthy';
  } else if (score >= 70) {
    status = 'warning';
  } else {
    status = 'critical';
  }

  return {
    score: Math.max(0, score),
    status,
    issues,
    recommendations
  };
}

// Clear cache endpoint (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Extract and validate authorization token
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return APIResponse.unauthorized('Valid authorization token required');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return APIResponse.unauthorized('Invalid or expired token');
    }

    // Check if user has admin privileges
    const isAdmin = user.user_metadata?.role === 'admin' || user.email === 'admin@postpal.com';
    
    if (!isAdmin) {
      return APIResponse.forbidden('Admin access required for cache management');
    }

    // Get query parameters
    const url = new URL(request.url);
    const cacheType = url.searchParams.get('type');
    const pattern = url.searchParams.get('pattern');

    let clearedCount = 0;
    let clearedCaches: string[] = [];

    if (cacheType) {
      // Clear specific cache type
      switch (cacheType) {
        case 'contentScoring':
          contentScoringCache.clear();
          clearedCaches.push('contentScoring');
          clearedCount++;
          break;
        case 'engagementPrediction':
          engagementPredictionCache.clear();
          clearedCaches.push('engagementPrediction');
          clearedCount++;
          break;
        case 'trendAnalysis':
          trendAnalysisCache.clear();
          clearedCaches.push('trendAnalysis');
          clearedCount++;
          break;
        case 'audienceAnalysis':
          audienceAnalysisCache.clear();
          clearedCaches.push('audienceAnalysis');
          clearedCount++;
          break;
        case 'optimalTiming':
          optimalTimingCache.clear();
          clearedCaches.push('optimalTiming');
          clearedCount++;
          break;
        default:
          return APIResponse.error(`Unknown cache type: ${cacheType}`, 400);
      }
    } else if (pattern) {
      // Clear caches matching pattern
      const caches = [
        { name: 'contentScoring', cache: contentScoringCache },
        { name: 'engagementPrediction', cache: engagementPredictionCache },
        { name: 'trendAnalysis', cache: trendAnalysisCache },
        { name: 'audienceAnalysis', cache: audienceAnalysisCache },
        { name: 'optimalTiming', cache: optimalTimingCache }
      ];

      caches.forEach(({ name, cache }) => {
        const deleted = cache.invalidatePattern(pattern);
        if (deleted > 0) {
          clearedCaches.push(name);
          clearedCount += deleted;
        }
      });
    } else {
      // Clear all caches
      contentScoringCache.clear();
      engagementPredictionCache.clear();
      trendAnalysisCache.clear();
      audienceAnalysisCache.clear();
      optimalTimingCache.clear();
      
      clearedCaches = ['contentScoring', 'engagementPrediction', 'trendAnalysis', 'audienceAnalysis', 'optimalTiming'];
      clearedCount = 5;
    }

    return APIResponse.success({
      clearedCount,
      clearedCaches,
      timestamp: new Date().toISOString()
    }, `Successfully cleared ${clearedCount} cache entries`);

  } catch (error) {
    console.error('Cache clearing error:', error);
    return APIResponse.serverError(
      'Failed to clear cache',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// Reset rate limits endpoint (admin only)
export async function POST(request: NextRequest) {
  try {
    // Extract and validate authorization token
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return APIResponse.unauthorized('Valid authorization token required');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return APIResponse.unauthorized('Invalid or expired token');
    }

    // Check if user has admin privileges
    const isAdmin = user.user_metadata?.role === 'admin' || user.email === 'admin@postpal.com';
    
    if (!isAdmin) {
      return APIResponse.forbidden('Admin access required for rate limit management');
    }

    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      return APIResponse.error(
        'Invalid JSON in request body',
        400,
        { parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error' }
      );
    }

    const { action, endpoint, identifier } = requestData;

    if (!action) {
      return APIResponse.error('Action is required', 400);
    }

    switch (action) {
      case 'reset_user_limits':
        if (!identifier) {
          return APIResponse.error('Identifier is required for resetting user limits', 400);
        }
        
        // Reset rate limits for specific user across all endpoints
        const endpoints = ['insights', 'contentGeneration', 'trendAnalysis', 'audienceAnalysis', 'contentOptimization'];
        let resetCount = 0;
        
        endpoints.forEach(endpointName => {
          rateLimitService.reset(endpointName, identifier);
          resetCount++;
        });

        return APIResponse.success({
          action: 'reset_user_limits',
          identifier,
          resetCount,
          timestamp: new Date().toISOString()
        }, `Successfully reset rate limits for user ${identifier}`);

      case 'reset_endpoint_limits':
        if (!endpoint) {
          return APIResponse.error('Endpoint is required for resetting endpoint limits', 400);
        }
        
        // This would require implementing a method to reset all limits for an endpoint
        return APIResponse.success({
          action: 'reset_endpoint_limits',
          endpoint,
          timestamp: new Date().toISOString()
        }, `Rate limit reset for endpoint ${endpoint} would be implemented here`);

      default:
        return APIResponse.error(`Unknown action: ${action}`, 400);
    }

  } catch (error) {
    console.error('Rate limit management error:', error);
    return APIResponse.serverError(
      'Failed to manage rate limits',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}
