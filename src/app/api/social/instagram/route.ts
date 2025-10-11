import { NextRequest, NextResponse } from 'next/server';

export interface InstagramPostRequest {
  text: string;
  imageUrl?: string;
  hashtags?: string[];
  accessToken: string;
  businessAccountId: string;
}

export interface InstagramPostResponse {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📸 Instagram API route called');
    
    const body: InstagramPostRequest = await request.json();
    const { text, imageUrl, hashtags, accessToken, businessAccountId } = body;

    if (!accessToken || !businessAccountId) {
      return NextResponse.json(
        { error: 'Instagram access token and business account ID are required' },
        { status: 400 }
      );
    }

    // Format caption with hashtags
    let caption = text;
    if (hashtags && hashtags.length > 0) {
      caption += '\n\n' + hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
    }

    let containerId: string;

    if (imageUrl) {
      // Step 1: Create media container for image post
      const containerResponse = await fetch(`https://graph.facebook.com/v18.0/${businessAccountId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken,
        }),
      });

      const containerData = await containerResponse.json();
      
      if (!containerData.id) {
        console.error('❌ Instagram container creation failed:', containerData);
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to create media container: ${containerData.error?.message || 'Unknown error'}` 
          },
          { status: 400 }
        );
      }
      
      containerId = containerData.id;
    } else {
      // Step 1: Create text-only container
      const containerResponse = await fetch(`https://graph.facebook.com/v18.0/${businessAccountId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: caption,
          access_token: accessToken,
        }),
      });

      const containerData = await containerResponse.json();
      
      if (!containerData.id) {
        console.error('❌ Instagram text container creation failed:', containerData);
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to create text container: ${containerData.error?.message || 'Unknown error'}` 
          },
          { status: 400 }
        );
      }
      
      containerId = containerData.id;
    }

    // Step 2: Publish the container
    const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${businessAccountId}/media_publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    });

    const publishData = await publishResponse.json();
    
    if (!publishData.id) {
      console.error('❌ Instagram publish failed:', publishData);
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to publish post: ${publishData.error?.message || 'Unknown error'}` 
        },
        { status: 400 }
      );
    }

    console.log('✅ Instagram post successful:', publishData);

    const response: InstagramPostResponse = {
      success: true,
      postId: publishData.id,
      url: `https://www.instagram.com/p/${publishData.id}/`,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Instagram API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Get Instagram account info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');
    const userId = searchParams.get('userId');

    if (!accessToken || !userId) {
      return NextResponse.json(
        { error: 'Access token and user ID are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${userId}?fields=id,username,account_type,followers_count,follows_count,media_count&access_token=${accessToken}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Instagram API error: ${data.error?.message || 'Unknown error'}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      accountInfo: {
        id: data.id,
        username: data.username,
        accountType: data.account_type,
        followers: data.followers_count,
        following: data.follows_count,
        mediaCount: data.media_count,
      }
    });

  } catch (error) {
    console.error('❌ Instagram account info error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
