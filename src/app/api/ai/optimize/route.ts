import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AIContentOptimizationEngine } from '@/lib/ai-content-optimization-engine';
import { createServerClient } from '@/lib/supabase';

const optimizationRequestSchema = z.object({
  content: z.string().min(1).max(5000),
  platform: z.enum(['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok']),
  targetAudience: z.string().optional(),
  goals: z.array(z.enum(['engagement', 'reach', 'clicks', 'conversions'])).optional(),
  context: z.string().optional()
});

const optimizationEngine = new AIContentOptimizationEngine();

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = optimizationRequestSchema.parse(body);

    // Get user from Supabase
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Optimize content
    const result = await optimizationEngine.optimizeContent({
      content: validatedData.content,
      platform: validatedData.platform,
      targetAudience: validatedData.targetAudience,
      goals: validatedData.goals,
      context: validatedData.context
    });

    // Track optimization request
    await supabase.from('optimization_requests').insert({
      user_id: user.id,
      content: validatedData.content,
      platform: validatedData.platform,
      original_score: result.originalScore,
      optimized_score: result.optimizedScore,
      improvement: result.improvement,
      suggestions_count: result.suggestions.length
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Content optimization error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: 'Invalid request data', details: error.errors } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user from Supabase
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (contentId) {
      // Get specific optimization data
      const { data: optimization, error } = await supabase
        .from('optimization_requests')
        .select('*')
        .eq('id', contentId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return NextResponse.json(
          { error: { message: 'Optimization not found' } },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: optimization
      });
    } else {
      // Get user's optimization history
      const { data: optimizations, error } = await supabase
        .from('optimization_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return NextResponse.json(
          { error: { message: 'Failed to fetch optimizations' } },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: optimizations
      });
    }

  } catch (error) {
    console.error('Get optimization error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}