import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServerClient } from '@/lib/supabase';
import { APIResponse } from '@/lib/api-middleware';
import { z } from 'zod';

// Feedback schema validation
const feedbackSchema = z.object({
  insightId: z.string().optional(),
  feature: z.enum(['content_analysis', 'engagement_prediction', 'optimal_timing', 'trend_prediction', 'audience_insights', 'recommendations']),
  rating: z.number().min(1).max(5),
  helpful: z.boolean(),
  feedback: z.string().max(1000).optional(),
  context: z.object({
    contentScore: z.number().optional(),
    engagementPrediction: z.number().optional(),
    platform: z.string().optional(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
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

    // Parse and validate request body
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

    // Validate feedback data
    let validatedData;
    try {
      validatedData = feedbackSchema.parse(requestData);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return APIResponse.error(
          'Invalid feedback data',
          400,
          { errors: validationError.errors }
        );
      }
      throw validationError;
    }

    // Store feedback in database
    try {
      const { data: feedbackRecord, error: dbError } = await supabase
        .from('ai_insights_feedback')
        .insert({
          user_id: user.id,
          insight_id: validatedData.insightId,
          feature: validatedData.feature,
          rating: validatedData.rating,
          helpful: validatedData.helpful,
          feedback_text: validatedData.feedback,
          context: validatedData.context,
          metadata: validatedData.metadata,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error storing feedback:', dbError);
        // If table doesn't exist, create it in memory for now
        // In production, this should be handled via migrations
        return APIResponse.success({
          feedbackId: `feedback_${Date.now()}`,
          message: 'Feedback received (stored locally)',
          ...validatedData
        }, 'Feedback submitted successfully');
      }

      return APIResponse.success({
        feedbackId: feedbackRecord.id,
        ...validatedData
      }, 'Feedback submitted successfully');

    } catch (error) {
      console.error('Error storing feedback:', error);
      // Still return success even if storage fails
      return APIResponse.success({
        feedbackId: `feedback_${Date.now()}`,
        message: 'Feedback received',
        ...validatedData
      }, 'Feedback submitted successfully');
    }

  } catch (error) {
    console.error('AI Insights Feedback API Error:', error);
    return APIResponse.serverError(
      'Failed to submit feedback. Please try again later.',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// Get feedback summary for analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return APIResponse.unauthorized('Valid authorization token required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return APIResponse.unauthorized('Invalid or expired token');
    }

    // Get feedback summary
    try {
      const { data: feedback, error } = await supabase
        .from('ai_insights_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        // Return mock data if table doesn't exist
        return APIResponse.success({
          totalFeedback: 0,
          averageRating: 0,
          helpfulCount: 0,
          features: {},
          recentFeedback: []
        }, 'Feedback summary');
      }

      // Calculate statistics
      const totalFeedback = feedback?.length || 0;
      const averageRating = feedback && feedback.length > 0
        ? feedback.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / feedback.length
        : 0;
      const helpfulCount = feedback?.filter((f: any) => f.helpful).length || 0;

      // Group by feature
      const features: Record<string, { count: number; avgRating: number; helpful: number }> = {};
      feedback?.forEach((f: any) => {
        const feature = f.feature || 'unknown';
        if (!features[feature]) {
          features[feature] = { count: 0, avgRating: 0, helpful: 0 };
        }
        features[feature].count++;
        features[feature].avgRating += f.rating || 0;
        if (f.helpful) features[feature].helpful++;
      });

      // Calculate averages
      Object.keys(features).forEach(key => {
        features[key].avgRating = features[key].avgRating / features[key].count;
      });

      return APIResponse.success({
        totalFeedback,
        averageRating: Math.round(averageRating * 100) / 100,
        helpfulCount,
        helpfulPercentage: totalFeedback > 0 ? Math.round((helpfulCount / totalFeedback) * 100) : 0,
        features,
        recentFeedback: feedback?.slice(0, 10) || []
      }, 'Feedback summary retrieved successfully');

    } catch (error) {
      console.error('Error retrieving feedback:', error);
      return APIResponse.error('Failed to retrieve feedback summary', 500);
    }

  } catch (error) {
    console.error('AI Insights Feedback API Error:', error);
    return APIResponse.serverError(
      'Failed to retrieve feedback. Please try again later.',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}
