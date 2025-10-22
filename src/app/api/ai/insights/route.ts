import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { 
  contentScoringModel,
  engagementPredictionModel,
  optimalTimingModel,
  trendPredictionModel,
  type ContentFeatures,
  type AudienceInsight
} from '@/lib/ai-ml-models';
import { trendPredictionEngine } from '@/lib/trend-prediction-engine';
import { audienceAnalysisEngine } from '@/lib/audience-analysis-engine';
import { APIResponse } from '@/lib/api-middleware';
import { createServerClient } from '@/lib/supabase';
import { DatabaseService } from '@/lib/supabase';
import { 
  contentScoringCache, 
  engagementPredictionCache, 
  trendAnalysisCache, 
  audienceAnalysisCache, 
  optimalTimingCache,
  createAIKey 
} from '@/lib/cache-service';
import { 
  createRateLimitMiddleware, 
  addRateLimitHeaders, 
  rateLimitService 
} from '@/lib/rate-limit-service';
import { 
  sendContentAnalysisUpdate,
  sendEngagementPredictionUpdate,
  sendAudienceInsightUpdate
} from '@/lib/realtime-insights-service';
import { sendInsightUpdate } from '@/lib/websocket-server';

// Enhanced error types for better error handling
class AIInsightsAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AIInsightsAPIError';
  }
}

// Input validation helper
function validateInsightsRequest(data: any): void {
  if (!data) {
    throw new AIInsightsAPIError('Request body is required', 'MISSING_REQUEST_BODY', 400);
  }

  if (!data.content) {
    throw new AIInsightsAPIError('Content is required', 'MISSING_CONTENT', 400);
  }

  if (!data.platform) {
    throw new AIInsightsAPIError('Platform is required', 'MISSING_PLATFORM', 400);
  }

  const validPlatforms = ['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok'];
  if (!validPlatforms.includes(data.platform.toLowerCase())) {
    throw new AIInsightsAPIError(
      `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`, 
      'INVALID_PLATFORM', 
      400
    );
  }

  if (!data.content.text && !data.content.media?.length) {
    throw new AIInsightsAPIError('Content must have text or media', 'INVALID_CONTENT', 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitMiddleware = createRateLimitMiddleware('insights');
    const rateLimitResult = await rateLimitMiddleware(request);
    
    if (!rateLimitResult.allowed) {
      const response = APIResponse.error(
        'Rate limit exceeded. Please slow down your requests.',
        429,
        { 
          retryAfter: rateLimitResult.result?.retryAfter,
          remaining: rateLimitResult.result?.remaining 
        }
      );
      
      return addRateLimitHeaders(response, rateLimitResult.result!);
    }

    // Initialize Supabase client for server-side operations
    const supabase = createServerClient();
    
    // Extract and validate the authorization token
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
      validateInsightsRequest(requestData);
    } catch (validationError) {
      if (validationError instanceof AIInsightsAPIError) {
        return APIResponse.error(
          validationError.message, 
          validationError.statusCode, 
          { code: validationError.code, details: validationError.details }
        );
      }
      throw validationError;
    }

    const { content, platform, audienceData, historicalData } = requestData;

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

    // Calculate insights using AI models with caching and error handling
    let contentScore: number;
    let engagementPrediction: any;
    let optimalTiming: any;
    let trendPrediction: any;
    let advancedAudienceInsights: any;
    
    // Generate cache keys for each operation
    const contentKey = createAIKey('contentScoring', content.text || '', { platform, userId: user.id });
    const engagementKey = createAIKey('engagementPrediction', content.text || '', { platform, userId: user.id });
    const timingKey = createAIKey('optimalTiming', platform, { userId: user.id });
    const trendKey = createAIKey('trendAnalysis', platform, { userId: user.id });
    const audienceKey = createAIKey('audienceAnalysis', user.id, { platform });
    
    // Try to get content score from cache first
    try {
      const cachedScore = contentScoringCache.get<number>(contentKey);
      if (cachedScore === null) {
        contentScore = contentScoringModel.calculateContentScore(features, historicalData);
        contentScoringCache.set(contentKey, contentScore);
      } else {
        contentScore = cachedScore;
      }
    } catch (error) {
      console.error('Content scoring error:', error);
      throw new AIInsightsAPIError('Failed to calculate content score', 'CONTENT_SCORING_FAILED', 500, error);
    }

    // Try to get engagement prediction from cache first
    try {
      engagementPrediction = engagementPredictionCache.get(engagementKey);
      if (engagementPrediction === null) {
        engagementPrediction = engagementPredictionModel.predictEngagement(
          content.text || '',
          features,
          audience,
          historicalData || []
        );
        engagementPredictionCache.set(engagementKey, engagementPrediction);
      }
    } catch (error) {
      console.error('Engagement prediction error:', error);
      throw new AIInsightsAPIError('Failed to predict engagement', 'ENGAGEMENT_PREDICTION_FAILED', 500, error);
    }

    // Try to get optimal timing from cache first
    try {
      optimalTiming = optimalTimingCache.get(timingKey);
      if (optimalTiming === null) {
        optimalTiming = optimalTimingModel.analyzeOptimalTimes(historicalData || [], audience);
        optimalTimingCache.set(timingKey, optimalTiming);
      }
    } catch (error) {
      console.error('Optimal timing error:', error);
      throw new AIInsightsAPIError('Failed to analyze optimal timing', 'TIMING_ANALYSIS_FAILED', 500, error);
    }
    
    // Try to get trend prediction from cache first
    try {
      trendPrediction = trendAnalysisCache.get(trendKey);
      if (trendPrediction === null) {
        trendPrediction = await trendPredictionEngine.predictTrends({
          platform: platform,
          category: 'content-marketing',
          timeframe: '7d',
          audience: audience,
          content: content.text,
          existingTrends: features.trendingTopics
        });
        trendAnalysisCache.set(trendKey, trendPrediction);
      }
    } catch (error) {
      console.error('Trend prediction error:', error);
      throw new AIInsightsAPIError('Failed to predict trends', 'TREND_PREDICTION_FAILED', 500, error);
    }

    // Try to get audience analysis from cache first
    try {
      advancedAudienceInsights = audienceAnalysisCache.get(audienceKey);
      if (advancedAudienceInsights === null) {
        advancedAudienceInsights = await audienceAnalysisEngine.analyzeAudience({
          userId: user.id, // Now using the actual authenticated user ID
          platforms: [platform],
          timeframe: '30d',
          includeCompetitors: true,
          includePredictions: true
        });
        audienceAnalysisCache.set(audienceKey, advancedAudienceInsights);
      }
    } catch (error) {
      console.error('Audience analysis error:', error);
      throw new AIInsightsAPIError('Failed to analyze audience', 'AUDIENCE_ANALYSIS_FAILED', 500, error);
    }

    // Generate recommendations with error handling
    let recommendations;
    try {
      recommendations = generateRecommendations(
        contentScore,
        engagementPrediction,
        features,
        audience
      );
    } catch (error) {
      console.error('Recommendations generation error:', error);
      recommendations = ['Unable to generate recommendations at this time'];
    }

    const insights = {
      contentScore,
      engagementPrediction,
      optimalTiming,
      trendPrediction,
      audienceInsights: advancedAudienceInsights,
      recommendations,
      features,
      timestamp: new Date().toISOString()
    };

    // Send real-time updates to connected clients
    try {
      // Send via legacy real-time service
      sendContentAnalysisUpdate(user.id, {
        contentScore,
        features,
        recommendations: recommendations.slice(0, 3) // Send top 3 recommendations
      });

      sendEngagementPredictionUpdate(user.id, {
        predictedEngagement: engagementPrediction?.predictedEngagement || 0,
        confidence: engagementPrediction?.confidence || 0,
        factors: engagementPrediction?.factors || {}
      });

      sendAudienceInsightUpdate(user.id, {
        demographics: advancedAudienceInsights?.demographics || {},
        behavior: advancedAudienceInsights?.behavior || {},
        interests: advancedAudienceInsights?.interests || []
      });

      // Send via WebSocket server
      sendInsightUpdate({
        type: 'content_analysis',
        userId: user.id,
        data: {
          contentScore,
          features,
          recommendations: recommendations.slice(0, 3)
        },
        timestamp: Date.now(),
        priority: 'medium'
      });

      sendInsightUpdate({
        type: 'engagement_prediction',
        userId: user.id,
        data: {
          predictedEngagement: engagementPrediction?.predictedEngagement || 0,
          confidence: engagementPrediction?.confidence || 0,
          factors: engagementPrediction?.factors || {}
        },
        timestamp: Date.now(),
        priority: 'high'
      });

      sendInsightUpdate({
        type: 'audience_insight',
        userId: user.id,
        data: {
          demographics: advancedAudienceInsights?.demographics || {},
          behavior: advancedAudienceInsights?.behavior || {},
          interests: advancedAudienceInsights?.interests || []
        },
        timestamp: Date.now(),
        priority: 'low'
      });
    } catch (realtimeError) {
      console.error('Failed to send real-time updates:', realtimeError);
      // Don't fail the request if real-time updates fail
    }

    // Store the analysis results in the database
    try {
      const originalContent = content.text || '';
      const optimizationScore = Math.round(
        (contentScore + (engagementPrediction?.confidence || 0) * 100) / 2
      );

      await DatabaseService.createAIOptimization({
        user_id: user.id,
        original_content: originalContent,
        optimized_content: originalContent, // Could be enhanced with actual optimization
        platform: platform,
        optimization_score: optimizationScore,
        improvements_applied: recommendations || [],
        predicted_metrics: {
          engagement: engagementPrediction?.predictedEngagement || 0,
          confidence: engagementPrediction?.confidence || 0,
          contentScore: contentScore,
          factors: engagementPrediction?.factors || {},
        },
        model_used: 'gpt-4',
        processing_time_ms: 0, // Would be calculated in real implementation
      });
    } catch (dbError) {
      console.error('Failed to store AI optimization results:', dbError);
      // Don't fail the request if database storage fails
    }

    const response = APIResponse.success(insights, 'Insights generated successfully');
    
    // Add rate limit headers to successful response
    const rateLimitStatus = rateLimitService.getStatus('insights', user.id);
    return addRateLimitHeaders(response, rateLimitStatus);

  } catch (error) {
    console.error('AI Insights API Error:', error);
    
    // Handle different types of errors
    if (error instanceof AIInsightsAPIError) {
      return APIResponse.error(
        error.message, 
        error.statusCode, 
        { code: error.code, details: error.details }
      );
    }
    
    // Handle network/timeout errors
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('network')) {
        return APIResponse.error(
          'Service temporarily unavailable. Please try again later.',
          503,
          { type: 'SERVICE_UNAVAILABLE' }
        );
      }
    }

    // Generic server error
    return APIResponse.serverError(
      'Failed to generate insights. Please try again later.',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

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

  // Audience alignment recommendations
  const avgAge = audience.demographics.ageGroups.reduce((acc, group) => {
    const midAge = (parseInt(group.range.split('-')[0]) + parseInt(group.range.split('-')[1])) / 2;
    return acc + (midAge * group.percentage);
  }, 0) / 100;

  if (avgAge < 30 && features.textLength > 150) {
    recommendations.push('Consider shorter, more punchy content for younger audiences');
  }

  if (avgAge > 35 && features.textLength < 100) {
    recommendations.push('Longer, more informative content tends to perform better with older audiences');
  }

  // Engagement optimization
  if (engagementPrediction.factors.content < 0.6) {
    recommendations.push('Enhance content appeal with storytelling, emotions, or trending topics');
  }

  if (engagementPrediction.factors.audience < 0.6) {
    recommendations.push('Better align content with audience interests and preferences');
  }

  if (engagementPrediction.factors.trends < 0.6) {
    recommendations.push('Incorporate trending topics or hashtags to boost visibility');
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

  // Positive reinforcement
  if (contentScore >= 80) {
    recommendations.push('Excellent content quality! Consider creating similar content to maintain high performance');
  }

  if (engagementPrediction.confidence > 0.8) {
    recommendations.push('High confidence in this prediction - content is well-optimized for your audience');
  }

  return recommendations.slice(0, 8); // Limit to 8 recommendations
}
