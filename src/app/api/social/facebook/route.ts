import { NextRequest, NextResponse } from 'next/server';

export interface FacebookPostRequest {
  text: string;
  imageUrl?: string;
  link?: string;
  hashtags?: string[];
  accessToken: string;
  pageId: string;
}

export interface FacebookPostResponse {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📘 Facebook API route called');
    
    const body: FacebookPostRequest = await request.json();
    const { text, imageUrl, link, hashtags, accessToken, pageId } = body;

    if (!accessToken || !pageId) {
      return NextResponse.json(
        { error: 'Facebook access token and page ID are required' },
        { status: 400 }
      );
    }

    // Format message with hashtags
    let message = text;
    if (hashtags && hashtags.length > 0) {
      message += '\n\n' + hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
    }

    const postData: any = {
      message: message,
      access_token: accessToken,
    };

    if (imageUrl) {
      postData.source = imageUrl;
    }

    if (link) {
      postData.link = link;
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();

    if (!data.id) {
      console.error('❌ Facebook post failed:', data);
      return NextResponse.json(
        { 
          success: false, 
          error: `Facebook API error: ${data.error?.message || 'Unknown error'}` 
        },
        { status: 400 }
      );
    }

    console.log('✅ Facebook post successful:', data);

    const responseData: FacebookPostResponse = {
      success: true,
      postId: data.id,
      url: `https://www.facebook.com/${data.id}`,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Facebook API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Get Facebook page info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');
    const pageId = searchParams.get('pageId');

    if (!accessToken || !pageId) {
      return NextResponse.json(
        { error: 'Access token and page ID are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}?fields=id,name,username,fan_count,followers_count,link&access_token=${accessToken}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Facebook API error: ${data.error?.message || 'Unknown error'}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      accountInfo: {
        id: data.id,
        name: data.name,
        username: data.username,
        followers: data.followers_count || data.fan_count,
        link: data.link,
      }
    });

  } catch (error) {
    console.error('❌ Facebook page info error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
