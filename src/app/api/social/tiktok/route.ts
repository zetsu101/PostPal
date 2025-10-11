import { NextRequest, NextResponse } from 'next/server';

export interface TikTokPostRequest {
  text: string;
  videoUrl?: string;
  hashtags?: string[];
  accessToken: string;
  openId: string;
}

export interface TikTokPostResponse {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎵 TikTok API route called');
    
    const body: TikTokPostRequest = await request.json();
    const { text, videoUrl, hashtags, accessToken, openId } = body;

    if (!accessToken || !openId) {
      return NextResponse.json(
        { error: 'TikTok access token and open ID are required' },
        { status: 400 }
      );
    }

    // Format description with hashtags
    let description = text;
    if (hashtags && hashtags.length > 0) {
      description += '\n\n' + hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
    }

    // TikTok API is more complex and requires video upload
    // This is a simplified version - in production you'd need to handle video uploads
    const postData = {
      post_info: {
        title: text,
        description: description,
        privacy_level: 'public',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 0,
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: 0, // Would be actual video size
        chunk_size: 0, // Would be actual chunk size
        total_chunk_count: 0, // Would be calculated
      },
    };

    const response = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();

    if (!data.data?.publish_id) {
      console.error('❌ TikTok post failed:', data);
      return NextResponse.json(
        { 
          success: false, 
          error: `TikTok API error: ${data.error?.message || 'Unknown error'}` 
        },
        { status: 400 }
      );
    }

    console.log('✅ TikTok post successful:', data);

    const responseData: TikTokPostResponse = {
      success: true,
      postId: data.data.publish_id,
      url: `https://www.tiktok.com/@user/video/${data.data.publish_id}`,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ TikTok API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Get TikTok user info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');
    const openId = searchParams.get('openId');

    if (!accessToken || !openId) {
      return NextResponse.json(
        { error: 'Access token and open ID are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `TikTok API error: ${data.error?.message || 'Unknown error'}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      accountInfo: {
        openId: data.data.user.open_id,
        unionId: data.data.user.union_id,
        displayName: data.data.user.display_name,
        avatarUrl: data.data.user.avatar_url,
        followers: data.data.user.follower_count,
        following: data.data.user.following_count,
        likes: data.data.user.likes_count,
        videoCount: data.data.user.video_count,
      }
    });

  } catch (error) {
    console.error('❌ TikTok user info error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
