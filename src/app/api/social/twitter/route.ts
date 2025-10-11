import { NextRequest, NextResponse } from 'next/server';

export interface TwitterPostRequest {
  text: string;
  hashtags?: string[];
  bearerToken: string;
}

export interface TwitterPostResponse {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🐦 Twitter API route called');
    
    const body: TwitterPostRequest = await request.json();
    const { text, hashtags, bearerToken } = body;

    if (!bearerToken) {
      return NextResponse.json(
        { error: 'Twitter bearer token is required' },
        { status: 400 }
      );
    }

    // Format tweet with hashtags
    let tweetText = text;
    if (hashtags && hashtags.length > 0) {
      tweetText += '\n\n' + hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
    }

    // Twitter has character limits
    if (tweetText.length > 280) {
      tweetText = tweetText.substring(0, 277) + '...';
    }

    const tweetData = {
      text: tweetText,
    };

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(tweetData),
    });

    const data = await response.json();

    if (!data.data?.id) {
      console.error('❌ Twitter post failed:', data);
      return NextResponse.json(
        { 
          success: false, 
          error: `Twitter API error: ${data.errors?.[0]?.message || 'Unknown error'}` 
        },
        { status: 400 }
      );
    }

    console.log('✅ Twitter post successful:', data);

    const responseData: TwitterPostResponse = {
      success: true,
      postId: data.data.id,
      url: `https://twitter.com/user/status/${data.data.id}`,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Twitter API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Get Twitter user info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bearerToken = searchParams.get('bearerToken');

    if (!bearerToken) {
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.twitter.com/2/users/me?user.fields=public_metrics,profile_image_url', {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Twitter API error: ${data.errors?.[0]?.message || 'Unknown error'}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      accountInfo: {
        id: data.data.id,
        username: data.data.username,
        name: data.data.name,
        followers: data.data.public_metrics?.followers_count,
        following: data.data.public_metrics?.following_count,
        tweetCount: data.data.public_metrics?.tweet_count,
        profileImage: data.data.profile_image_url,
      }
    });

  } catch (error) {
    console.error('❌ Twitter user info error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
