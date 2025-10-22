import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { trendPredictionEngine, type TrendAnalysisRequest, type TrendData } from '@/lib/trend-prediction-engine';
import { APIResponse } from '@/lib/api-middleware';

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return APIResponse.unauthorized('Valid authorization token required');
    }

    let body: TrendAnalysisRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return APIResponse.error(
        'Invalid JSON in request body',
        400,
        { parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error' }
      );
    }

    // Enhanced validation
    if (!body.platform) {
      return APIResponse.error('Platform is required', 400, { code: 'MISSING_PLATFORM' });
    }
    
    if (!body.timeframe) {
      return APIResponse.error('Timeframe is required', 400, { code: 'MISSING_TIMEFRAME' });
    }

    const validPlatforms = ['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok'];
    if (!validPlatforms.includes(body.platform.toLowerCase())) {
      return APIResponse.error(
        `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`,
        400,
        { code: 'INVALID_PLATFORM' }
      );
    }

    const validTimeframes = ['24h', '7d', '30d', '90d'];
    if (!validTimeframes.includes(body.timeframe)) {
      return APIResponse.error(
        `Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}`,
        400,
        { code: 'INVALID_TIMEFRAME' }
      );
    }

    // Get advanced trend predictions with error handling
    let trendPrediction, trendHistory: TrendData[] = [], competitorAnalysis: any[] = [];
    
    try {
      trendPrediction = await trendPredictionEngine.predictTrends(body);
    } catch (error) {
      console.error('Trend prediction error:', error);
      return APIResponse.error('Failed to predict trends', 500, { code: 'TREND_PREDICTION_FAILED' });
    }

    // Get trend history if keyword provided
    try {
      if (body.content) {
        const keywords = extractKeywords(body.content);
        if (keywords.length > 0) {
          trendHistory = await trendPredictionEngine.getTrendHistory(
            body.platform,
            keywords[0],
            30
          );
        }
      }
    } catch (error) {
      console.error('Trend history error:', error);
      // Continue without trend history rather than failing completely
      trendHistory = [];
    }

    // Get competitor analysis if requested
    try {
      if (body.audience?.competitors) {
        competitorAnalysis = await trendPredictionEngine.getCompetitorTrendAnalysis(
          body.audience.competitors
        );
      }
    } catch (error) {
      console.error('Competitor analysis error:', error);
      // Continue without competitor analysis rather than failing completely
      competitorAnalysis = [];
    }

    return APIResponse.success({
      trends: trendPrediction,
      history: trendHistory,
      competitors: competitorAnalysis,
      timestamp: new Date().toISOString()
    }, 'Trend analysis completed successfully');

  } catch (error) {
    console.error('Trend Analysis API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('network')) {
        return APIResponse.error(
          'Service temporarily unavailable. Please try again later.',
          503,
          { type: 'SERVICE_UNAVAILABLE' }
        );
      }
    }

    return APIResponse.serverError(
      'Failed to analyze trends. Please try again later.',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'instagram';
    const timeframe = searchParams.get('timeframe') || '7d';

    // Validate parameters
    const validPlatforms = ['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return APIResponse.error(
        `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`,
        400,
        { code: 'INVALID_PLATFORM' }
      );
    }

    const validTimeframes = ['24h', '7d', '30d', '90d'];
    if (!validTimeframes.includes(timeframe)) {
      return APIResponse.error(
        `Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}`,
        400,
        { code: 'INVALID_TIMEFRAME' }
      );
    }

    // Get trending topics for quick access with error handling
    let trendPrediction;
    try {
      trendPrediction = await trendPredictionEngine.predictTrends({
        platform: platform as any,
        category: 'general',
        timeframe: timeframe as any
      });
    } catch (error) {
      console.error('Trend prediction error in GET:', error);
      return APIResponse.error('Failed to fetch trending topics', 500, { code: 'TREND_FETCH_FAILED' });
    }

    return APIResponse.success({
      trendingTopics: trendPrediction.trendingTopics.slice(0, 10),
      emergingTrends: trendPrediction.emergingTrends.slice(0, 5),
      timestamp: new Date().toISOString()
    }, 'Trending topics fetched successfully');

  } catch (error) {
    console.error('Trend GET API Error:', error);
    
    if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('network'))) {
      return APIResponse.error(
        'Service temporarily unavailable. Please try again later.',
        503,
        { type: 'SERVICE_UNAVAILABLE' }
      );
    }

    return APIResponse.serverError(
      'Failed to fetch trends. Please try again later.',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

function extractKeywords(content: string): string[] {
  // Simple keyword extraction - in reality, this would use NLP
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);

  // Remove common words and return unique keywords
  const commonWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use']);
  
  return [...new Set(words.filter(word => !commonWords.has(word)))].slice(0, 5);
}
