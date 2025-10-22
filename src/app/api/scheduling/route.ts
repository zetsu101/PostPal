import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AdvancedContentSchedulingSystem } from '@/lib/advanced-content-scheduling-system';
import { createServerClient } from '@/lib/supabase';

const schedulingRequestSchema = z.object({
  content: z.string().min(1).max(5000),
  platforms: z.array(z.enum(['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok'])).min(1),
  schedulingStrategy: z.enum(['optimal', 'custom', 'bulk', 'recurring']),
  customTimes: z.array(z.string().datetime()).optional(),
  timezone: z.string().optional(),
  goals: z.array(z.enum(['engagement', 'reach', 'clicks', 'conversions'])).optional(),
  targetAudience: z.string().optional()
});

const schedulingSystem = new AdvancedContentSchedulingSystem();

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = schedulingRequestSchema.parse(body);

    // Get user from Supabase
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Convert custom times to Date objects if provided
    const schedulingRequest = {
      ...validatedData,
      customTimes: validatedData.customTimes?.map(time => new Date(time))
    };

    // Schedule content
    const scheduledPosts = await schedulingSystem.scheduleContent(schedulingRequest);

    // Save scheduled posts to database
    for (const post of scheduledPosts) {
      await supabase.from('scheduled_posts').insert({
        user_id: user.id,
        content: post.content,
        platforms: post.platforms,
        scheduled_time: post.scheduledTime.toISOString(),
        timezone: post.timezone,
        status: post.status,
        optimal_score: post.optimalScore,
        expected_engagement: post.expectedMetrics.engagement,
        expected_reach: post.expectedMetrics.reach,
        expected_clicks: post.expectedMetrics.clicks,
        scheduling_strategy: validatedData.schedulingStrategy
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        scheduledPosts,
        count: scheduledPosts.length,
        strategy: validatedData.schedulingStrategy
      }
    });

  } catch (error) {
    console.error('Content scheduling error:', error);
    
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
    const action = searchParams.get('action');

    switch (action) {
      case 'posts':
        // Get scheduled posts
        const { data: posts, error: postsError } = await supabase
          .from('scheduled_posts')
          .select('*')
          .eq('user_id', user.id)
          .order('scheduled_time', { ascending: true });

        if (postsError) {
          return NextResponse.json(
            { error: { message: 'Failed to fetch scheduled posts' } },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: posts
        });

      case 'analytics':
        // Get scheduling analytics
        const analytics = schedulingSystem.getSchedulingAnalytics();
        return NextResponse.json({
          success: true,
          data: analytics
        });

      case 'optimal-times':
        // Get optimal times for platforms
        const platform = searchParams.get('platform');
        if (!platform) {
          return NextResponse.json(
            { error: { message: 'Platform parameter is required' } },
            { status: 400 }
          );
        }

        const optimalTimes = schedulingSystem.getOptimalTimes(platform);
        return NextResponse.json({
          success: true,
          data: optimalTimes
        });

      case 'recurring':
        // Get recurring schedules
        const recurringSchedules = schedulingSystem.getRecurringSchedules();
        return NextResponse.json({
          success: true,
          data: recurringSchedules
        });

      default:
        return NextResponse.json(
          { error: { message: 'Invalid action parameter' } },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Get scheduling data error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { postId, updates } = body;

    if (!postId || !updates) {
      return NextResponse.json(
        { error: { message: 'Post ID and updates are required' } },
        { status: 400 }
      );
    }

    // Get user from Supabase
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Update scheduled post
    const success = schedulingSystem.updateScheduledPost(postId, updates);

    if (!success) {
      return NextResponse.json(
        { error: { message: 'Scheduled post not found' } },
        { status: 404 }
      );
    }

    // Update in database
    const { error: dbError } = await supabase
      .from('scheduled_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .eq('user_id', user.id);

    if (dbError) {
      return NextResponse.json(
        { error: { message: 'Failed to update scheduled post' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scheduled post updated successfully'
    });

  } catch (error) {
    console.error('Update scheduled post error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: { message: 'Post ID is required' } },
        { status: 400 }
      );
    }

    // Get user from Supabase
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Delete scheduled post
    const success = schedulingSystem.deleteScheduledPost(postId);

    if (!success) {
      return NextResponse.json(
        { error: { message: 'Scheduled post not found' } },
        { status: 404 }
      );
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);

    if (dbError) {
      return NextResponse.json(
        { error: { message: 'Failed to delete scheduled post' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scheduled post deleted successfully'
    });

  } catch (error) {
    console.error('Delete scheduled post error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
