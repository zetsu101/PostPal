import { NextRequest, NextResponse } from 'next/server';

export interface LinkedInPostRequest {
  text: string;
  imageUrl?: string;
  hashtags?: string[];
  accessToken: string;
  personId: string;
}

export interface LinkedInPostResponse {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('💼 LinkedIn API route called');
    
    const body: LinkedInPostRequest = await request.json();
    const { text, imageUrl, hashtags, accessToken, personId } = body;

    if (!accessToken || !personId) {
      return NextResponse.json(
        { error: 'LinkedIn access token and person ID are required' },
        { status: 400 }
      );
    }

    // Format caption with hashtags
    let caption = text;
    if (hashtags && hashtags.length > 0) {
      caption += '\n\n' + hashtags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ');
    }

    const postData = {
      author: `urn:li:person:${personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: caption,
          },
          shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE',
          media: imageUrl ? [{
            status: 'READY',
            description: {
              text: text,
            },
            media: imageUrl,
            title: {
              text: 'Post Image',
            },
          }] : undefined,
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ LinkedIn post failed:', data);
      return NextResponse.json(
        { 
          success: false, 
          error: `LinkedIn API error: ${data.message || 'Unknown error'}` 
        },
        { status: 400 }
      );
    }

    console.log('✅ LinkedIn post successful:', data);

    const responseData: LinkedInPostResponse = {
      success: true,
      postId: data.id,
      url: `https://www.linkedin.com/feed/update/${data.id}/`,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ LinkedIn API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Get LinkedIn account info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `LinkedIn API error: ${data.message || 'Unknown error'}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      accountInfo: {
        id: data.id,
        firstName: data.localizedFirstName,
        lastName: data.localizedLastName,
        displayName: `${data.localizedFirstName} ${data.localizedLastName}`,
        profilePicture: data.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
      }
    });

  } catch (error) {
    console.error('❌ LinkedIn account info error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
