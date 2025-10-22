import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

const crossPlatformRequestSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  platforms: z.array(z.object({
    platform: z.enum(['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok']),
    content: z.string().min(1).max(5000),
    scheduledTime: z.string().datetime(),
    optimization: z.object({
      hashtags: z.array(z.string()).optional(),
      mentions: z.array(z.string()).optional(),
      callToAction: z.string().optional()
    }).optional()
  })).min(1),
  teamCollaboration: z.object({
    assignedTo: z.string().optional(),
    reviewers: z.array(z.string()).optional(),
    status: z.enum(['draft', 'review', 'approved', 'rejected']).default('draft')
  }).optional(),
  aiOptimization: z.object({
    goals: z.array(z.enum(['engagement', 'reach', 'clicks', 'conversions'])).optional(),
    targetAudience: z.string().optional(),
    tone: z.enum(['professional', 'casual', 'friendly', 'authoritative']).optional()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = crossPlatformRequestSchema.parse(body);

    // Get user from Supabase
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Create cross-platform post
    const { data: post, error: postError } = await supabase
      .from('cross_platform_posts')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        content: validatedData.content,
        platforms: validatedData.platforms,
        team_collaboration: validatedData.teamCollaboration || {
          status: 'draft',
          reviewers: [],
          comments: []
        },
        ai_optimization: validatedData.aiOptimization || {},
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (postError) {
      console.error('Database error:', postError);
      return NextResponse.json(
        { error: { message: 'Failed to create cross-platform post' } },
        { status: 500 }
      );
    }

    // Generate AI optimization scores
    const aiScores = await generateAIOptimizationScores(validatedData.platforms);

    // Update post with AI scores
    const { error: updateError } = await supabase
      .from('cross_platform_posts')
      .update({
        ai_scores: aiScores,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        aiScores
      }
    });

  } catch (error) {
    console.error('Cross-platform post creation error:', error);
    
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
        // Get cross-platform posts
        const { data: posts, error: postsError } = await supabase
          .from('cross_platform_posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (postsError) {
          return NextResponse.json(
            { error: { message: 'Failed to fetch cross-platform posts' } },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: posts
        });

      case 'calendar':
        // Get content calendar
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: { message: 'Start date and end date are required' } },
            { status: 400 }
          );
        }

        const { data: calendarPosts, error: calendarError } = await supabase
          .from('cross_platform_posts')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: true });

        if (calendarError) {
          return NextResponse.json(
            { error: { message: 'Failed to fetch calendar data' } },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: calendarPosts
        });

      case 'analytics':
        // Get cross-platform analytics
        const analytics = await generateCrossPlatformAnalytics(user.id, supabase);
        return NextResponse.json({
          success: true,
          data: analytics
        });

      default:
        return NextResponse.json(
          { error: { message: 'Invalid action parameter' } },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Get cross-platform data error:', error);
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

    // Update cross-platform post
    const { error: updateError } = await supabase
      .from('cross_platform_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: { message: 'Failed to update cross-platform post' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cross-platform post updated successfully'
    });

  } catch (error) {
    console.error('Update cross-platform post error:', error);
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

    // Delete cross-platform post
    const { error: deleteError } = await supabase
      .from('cross_platform_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: { message: 'Failed to delete cross-platform post' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cross-platform post deleted successfully'
    });

  } catch (error) {
    console.error('Delete cross-platform post error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// Helper functions
async function generateAIOptimizationScores(platforms: any[]): Promise<Record<string, number>> {
  const scores: Record<string, number> = {};
  
  for (const platform of platforms) {
    let score = 50; // Base score
    
    // Length optimization
    const length = platform.content.length;
    const optimalLengths = {
      instagram: 150,
      twitter: 200,
      linkedin: 1000,
      facebook: 200,
      tiktok: 100
    };
    
    const optimalLength = optimalLengths[platform.platform as keyof typeof optimalLengths] || 200;
    const lengthScore = Math.max(0, 100 - Math.abs(length - optimalLength) / optimalLength * 50);
    score += lengthScore * 0.3;
    
    // Hashtag optimization
    const hashtagCount = (platform.content.match(/#\w+/g) || []).length;
    const optimalHashtags = {
      instagram: 15,
      twitter: 2,
      linkedin: 5,
      facebook: 3,
      tiktok: 5
    };
    
    const optimalHashtagCount = optimalHashtags[platform.platform as keyof typeof optimalHashtags] || 3;
    const hashtagScore = Math.max(0, 100 - Math.abs(hashtagCount - optimalHashtagCount) * 10);
    score += hashtagScore * 0.2;
    
    // Engagement triggers
    const engagementScore = calculateEngagementScore(platform.content);
    score += engagementScore * 0.3;
    
    // Platform-specific optimization
    const platformScore = calculatePlatformScore(platform.platform, platform.content);
    score += platformScore * 0.2;
    
    scores[platform.platform] = Math.min(100, Math.max(0, score));
  }
  
  return scores;
}

function calculateEngagementScore(content: string): number {
  let score = 0;
  
  // Question marks
  if (content.includes('?')) score += 20;
  
  // Call to action words
  const ctaWords = ['click', 'learn', 'discover', 'try', 'get', 'buy', 'shop', 'visit'];
  const hasCTA = ctaWords.some(word => content.toLowerCase().includes(word));
  if (hasCTA) score += 25;
  
  // Emotional words
  const emotionalWords = ['amazing', 'incredible', 'unbelievable', 'wow', 'love', 'excited'];
  const hasEmotion = emotionalWords.some(word => content.toLowerCase().includes(word));
  if (hasEmotion) score += 15;
  
  // Numbers and statistics
  if (/\d+/.test(content)) score += 10;
  
  // Emojis
  const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
  score += Math.min(20, emojiCount * 5);
  
  return Math.min(100, score);
}

function calculatePlatformScore(platform: string, content: string): number {
  let score = 0;
  
  switch (platform) {
    case 'instagram':
      // Visual content indicators
      if (content.includes('📸') || content.includes('photo') || content.includes('image')) score += 20;
      // Story-style content
      if (content.includes('behind the scenes') || content.includes('BTS')) score += 15;
      break;
      
    case 'twitter':
      // News and trending content
      if (content.includes('breaking') || content.includes('news') || content.includes('trending')) score += 20;
      // Thread indicators
      if (content.includes('thread') || content.includes('🧵')) score += 15;
      break;
      
    case 'linkedin':
      // Professional tone indicators
      if (content.includes('industry') || content.includes('professional') || content.includes('career')) score += 20;
      // Business-related content
      if (content.includes('business') || content.includes('strategy') || content.includes('leadership')) score += 15;
      break;
      
    case 'facebook':
      // Community-focused content
      if (content.includes('community') || content.includes('local') || content.includes('event')) score += 20;
      // Personal touch
      if (content.includes('personal') || content.includes('story') || content.includes('experience')) score += 15;
      break;
      
    case 'tiktok':
      // Trendy content
      if (content.includes('trending') || content.includes('viral') || content.includes('challenge')) score += 20;
      // Entertainment focus
      if (content.includes('fun') || content.includes('entertainment') || content.includes('dance')) score += 15;
      break;
  }
  
  return Math.min(100, score);
}

async function generateCrossPlatformAnalytics(userId: string, supabase: any): Promise<any> {
  // Get all posts for the user
  const { data: posts, error } = await supabase
    .from('cross_platform_posts')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error('Failed to fetch posts for analytics');
  }

  const totalPosts = posts.length;
  const publishedPosts = posts.filter((post: any) => post.status === 'published').length;
  const draftPosts = posts.filter((post: any) => post.status === 'draft').length;
  const scheduledPosts = posts.filter((post: any) => post.status === 'scheduled').length;

  // Platform distribution
  const platformDistribution: Record<string, number> = {};
  posts.forEach((post: any) => {
    post.platforms.forEach((platform: any) => {
      platformDistribution[platform.platform] = (platformDistribution[platform.platform] || 0) + 1;
    });
  });

  // Average AI scores
  const avgAIScores: Record<string, number> = {};
  posts.forEach((post: any) => {
    if (post.ai_scores) {
      Object.entries(post.ai_scores).forEach(([platform, score]) => {
        avgAIScores[platform] = (avgAIScores[platform] || 0) + (score as number);
      });
    }
  });

  Object.keys(avgAIScores).forEach(platform => {
    avgAIScores[platform] = avgAIScores[platform] / (platformDistribution[platform] || 1);
  });

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    scheduledPosts,
    successRate: totalPosts > 0 ? (publishedPosts / totalPosts) * 100 : 0,
    platformDistribution,
    avgAIScores,
    teamCollaboration: {
      totalReviews: posts.filter((post: any) => post.team_collaboration?.status === 'review').length,
      approvedPosts: posts.filter((post: any) => post.team_collaboration?.status === 'approved').length,
      rejectedPosts: posts.filter((post: any) => post.team_collaboration?.status === 'rejected').length
    }
  };
}
