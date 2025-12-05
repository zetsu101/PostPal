import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { 
  contentScoringModel,
  engagementPredictionModel,
  type ContentFeatures,
  type AudienceInsight
} from '@/lib/ai-ml-models';
import { APIResponse } from '@/lib/api-middleware';
import { createServerClient } from '@/lib/supabase';
import { 
  contentScoringCache, 
  engagementPredictionCache, 
  createAIKey 
} from '@/lib/cache-service';
import { 
  createRateLimitMiddleware, 
  addRateLimitHeaders, 
  rateLimitService 
} from '@/lib/rate-limit-service';

// Enhanced error types for batch processing
class BatchProcessingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'BatchProcessingError';
  }
}

// Input validation for batch requests
function validateBatchRequest(data: any): void {
  if (!data) {
    throw new BatchProcessingError('Request body is required', 'MISSING_REQUEST_BODY', 400);
  }

  if (!data.contentItems || !Array.isArray(data.contentItems)) {
    throw new BatchProcessingError('contentItems array is required', 'MISSING_CONTENT_ITEMS', 400);
  }

  if (data.contentItems.length === 0) {
    throw new BatchProcessingError('At least one content item is required', 'EMPTY_CONTENT_ITEMS', 400);
  }

  if (data.contentItems.length > 10) {
    throw new BatchProcessingError('Maximum 10 content items allowed per batch', 'TOO_MANY_ITEMS', 400);
  }

  if (!data.platform) {
    throw new BatchProcessingError('Platform is required', 'MISSING_PLATFORM', 400);
  }

  const validPlatforms = ['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok'];
  if (!validPlatforms.includes(data.platform.toLowerCase())) {
    throw new BatchProcessingError(
      `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`, 
      'INVALID_PLATFORM', 
      400
    );
  }

  // Validate each content item
  data.contentItems.forEach((item: any, index: number) => {
    if (!item.content) {
      throw new BatchProcessingError(`Content item ${index + 1} is missing content`, 'MISSING_CONTENT', 400);
    }

    if (!item.content.text && !item.content.media?.length) {
      throw new BatchProcessingError(`Content item ${index + 1} must have text or media`, 'INVALID_CONTENT', 400);
    }
  });
}

// Process a single content item
async function processContentItem(
  contentItem: any,
  platform: string,
  audience: AudienceInsight,
  historicalData: any[],
  userId: string,
  index: number
): Promise<any> {
  try {
    const { content } = contentItem;

    // Extract content features
    const features: ContentFeatures = {
      textLength: content.text?.length || 0,
      hashtagCount: (content.text?.match(/#\w+/g) || []).length,
      mentionCount: (content.text?.match(/@\w+/g) || []).length,
      emojiCount: (content.text?.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length,
      questionCount: (content.text?.match(/\?/g) || []).length,
      exclamationCount: (content.text?.match(/!/g) || []).length,
      linkCount: (content.text?.match(/https?:\/\/[^\s]+/g) || []).length,
      imageCount: content.media?.filter((m: any) => m.type === 'image').length || 0,
      videoCount: content.media?.filter((m: any) => m.type === 'video').length || 0,
      sentiment: content.sentiment || 0,
      readability: content.readability || 60,
      urgency: content.urgency || 0,
      callToAction: content.callToAction || false,
      trendingTopics: content.trendingTopics || [],
      timeOfDay: content.scheduledTime ? new Date(content.scheduledTime).getHours() : new Date().getHours(),
      dayOfWeek: content.scheduledTime ? new Date(content.scheduledTime).getDay() : new Date().getDay(),
      platform: platform
    };

    // Generate cache keys
    const contentKey = createAIKey('contentScoring', content.text || '', { platform, userId, index });
    const engagementKey = createAIKey('engagementPrediction', content.text || '', { platform, userId, index });

    // Get content score (with caching)
    let contentScore: number = contentScoringCache.get(contentKey) as number;
    if (contentScore === null || typeof contentScore !== 'number') {
      contentScore = contentScoringModel.calculateContentScore(features, historicalData);
      contentScoringCache.set(contentKey, contentScore);
    }

    // Get engagement prediction (with caching)
    let engagementPrediction = engagementPredictionCache.get(engagementKey);
    if (engagementPrediction === null) {
      engagementPrediction = engagementPredictionModel.predictEngagement(
        content.text || '',
        features,
        audience,
        historicalData || []
      );
      engagementPredictionCache.set(engagementKey, engagementPrediction);
    }

    // Generate recommendations
    const recommendations = generateRecommendations(
      contentScore,
      engagementPrediction,
      features,
      audience
    );

    return {
      index,
      contentScore,
      engagementPrediction,
      features,
      recommendations,
      processingTime: Date.now()
    };

  } catch (error) {
    console.error(`Error processing content item ${index + 1}:`, error);
    return {
      index,
      error: `Failed to process content item ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      processingTime: Date.now()
    };
  }
}

// Generate recommendations for batch processing
function generateRecommendations(
  contentScore: number,
  engagementPrediction: any,
  features: ContentFeatures,
  audience: AudienceInsight
): string[] {
  const recommendations: string[] = [];

  // Content quality recommendations
  if (contentScore < 60) {
    recommendations.push('Improve content quality - focus on engaging visuals and compelling copy');
  }

  if (features.imageCount === 0 && features.videoCount === 0) {
    recommendations.push('Add visual content (images or videos) to increase engagement by 25-40%');
  }

  if (features.hashtagCount < 3) {
    recommendations.push('Include 3-5 relevant hashtags for better discoverability');
  }

  if (features.hashtagCount > 10) {
    recommendations.push('Reduce hashtag count - too many can appear spammy and reduce reach');
  }

  if (features.callToAction === false) {
    recommendations.push('Add a clear call-to-action to encourage audience interaction');
  }

  // Timing recommendations
  const optimalHours = audience.behavior.activeHours;
  const currentHour = features.timeOfDay;
  if (!optimalHours.includes(currentHour)) {
    recommendations.push(`Consider posting during peak hours (${optimalHours.slice(0, 3).join(', ')} o'clock) for maximum reach`);
  }

  // Platform-specific recommendations
  switch (features.platform) {
    case 'instagram':
      if (features.videoCount === 0) {
        recommendations.push('Consider using Instagram Reels or Stories for higher engagement rates');
      }
      break;
    case 'twitter':
      if (features.textLength > 200) {
        recommendations.push('Twitter performs better with concise, punchy content under 200 characters');
      }
      break;
    case 'linkedin':
      if (features.textLength < 150) {
        recommendations.push('LinkedIn audiences prefer longer, more professional content (150+ characters)');
      }
      break;
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations per item
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (more restrictive for batch operations)
    const rateLimitMiddleware = createRateLimitMiddleware('contentOptimization');
    const rateLimitResult = await rateLimitMiddleware(request);
    
    if (!rateLimitResult.allowed) {
      const response = APIResponse.error(
        'Rate limit exceeded for batch processing. Please slow down your requests.',
        429,
        { 
          retryAfter: rateLimitResult.result?.retryAfter,
          remaining: rateLimitResult.result?.remaining 
        }
      );
      
      return addRateLimitHeaders(response, rateLimitResult.result!);
    }

    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Extract and validate authorization token
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return APIResponse.unauthorized('Valid authorization token required');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return APIResponse.unauthorized('Invalid or expired token');
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

    // Validate request data
    try {
      validateBatchRequest(requestData);
    } catch (validationError) {
      if (validationError instanceof BatchProcessingError) {
        return APIResponse.error(
          validationError.message, 
          validationError.statusCode, 
          { code: validationError.code, details: validationError.details }
        );
      }
      throw validationError;
    }

    const { contentItems, platform, audienceData, historicalData } = requestData;

    // Default audience insights if not provided
    const defaultAudience: AudienceInsight = {
      demographics: {
        ageGroups: [
          { range: '25-34', percentage: 40 },
          { range: '35-44', percentage: 30 },
          { range: '18-24', percentage: 20 },
          { range: '45-54', percentage: 10 }
        ],
        genders: [
          { gender: 'Female', percentage: 55 },
          { gender: 'Male', percentage: 45 }
        ],
        locations: [
          { location: 'United States', percentage: 35 },
          { location: 'Canada', percentage: 15 },
          { location: 'United Kingdom', percentage: 12 },
          { location: 'Australia', percentage: 8 },
          { location: 'Other', percentage: 30 }
        ]
      },
      interests: [
        { category: 'Technology', affinity: 0.7 },
        { category: 'Business', affinity: 0.6 },
        { category: 'Marketing', affinity: 0.8 },
        { category: 'Lifestyle', affinity: 0.5 }
      ],
      behavior: {
        activeHours: [9, 10, 11, 13, 14, 15, 17, 18, 19, 20],
        preferredContent: ['Educational', 'Behind-the-scenes', 'Product updates'],
        engagementPatterns: [
          { type: 'likes', frequency: 0.6 },
          { type: 'comments', frequency: 0.25 },
          { type: 'shares', frequency: 0.15 },
          { type: 'saves', frequency: 0.3 }
        ]
      },
      psychographics: {
        values: ['Innovation', 'Efficiency', 'Growth'],
        lifestyle: ['Tech-savvy', 'Career-focused'],
        brandAffinity: ['SaaS', 'Tech startups', 'Marketing tools']
      }
    };

    const audience = audienceData || defaultAudience;

    // Process all content items in parallel
    const startTime = Date.now();
    const results = await Promise.allSettled(
      contentItems.map((item: any, index: number) => 
        processContentItem(item, platform, audience, historicalData, user.id, index)
      )
    );

    const processingTime = Date.now() - startTime;

    // Process results
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    const failedResults = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result, index) => ({
        index: contentItems.length + index,
        error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
        processingTime: Date.now()
      }));

    // Calculate batch statistics
    const batchStats = {
      totalItems: contentItems.length,
      successfulItems: successfulResults.length,
      failedItems: failedResults.length,
      averageContentScore: successfulResults.length > 0 
        ? Math.round(successfulResults.reduce((sum, item) => sum + (item.contentScore || 0), 0) / successfulResults.length)
        : 0,
      averageEngagement: successfulResults.length > 0
        ? Math.round(successfulResults.reduce((sum, item) => sum + (item.engagementPrediction?.predictedEngagement || 0), 0) / successfulResults.length * 100) / 100
        : 0,
      processingTimeMs: processingTime
    };

    const batchResponse = {
      results: [...successfulResults, ...failedResults].sort((a, b) => a.index - b.index),
      batchStats,
      platform,
      timestamp: new Date().toISOString()
    };

    const response = APIResponse.success(batchResponse, 'Batch analysis completed successfully');
    
    // Add rate limit headers
    const rateLimitStatus = rateLimitService.getStatus('contentOptimization', user.id);
    return addRateLimitHeaders(response, rateLimitStatus);

  } catch (error) {
    console.error('Batch Processing API Error:', error);
    
    if (error instanceof BatchProcessingError) {
      return APIResponse.error(
        error.message, 
        error.statusCode, 
        { code: error.code, details: error.details }
      );
    }
    
    return APIResponse.serverError(
      'Failed to process batch analysis. Please try again later.',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}
