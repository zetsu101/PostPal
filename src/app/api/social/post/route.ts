import { NextRequest, NextResponse } from 'next/server';

export interface MultiPlatformPostRequest {
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  link?: string;
  hashtags?: string[];
  platforms: {
    instagram?: {
      accessToken: string;
      businessAccountId: string;
    };
    linkedin?: {
      accessToken: string;
      personId: string;
    };
    facebook?: {
      accessToken: string;
      pageId: string;
    };
    twitter?: {
      bearerToken: string;
    };
    tiktok?: {
      accessToken: string;
      openId: string;
    };
  };
}

export interface PlatformPostResult {
  platform: string;
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

export interface MultiPlatformPostResponse {
  success: boolean;
  results: PlatformPostResult[];
  errors?: string[];
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Multi-platform social media API route called');
    
    const body: MultiPlatformPostRequest = await request.json();
    const { text, imageUrl, videoUrl, link, hashtags, platforms } = body;

    const results: PlatformPostResult[] = [];
    const errors: string[] = [];

    // Post to Instagram
    if (platforms.instagram) {
      try {
        const instagramResponse = await fetch(`${request.nextUrl.origin}/api/social/instagram`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            imageUrl,
            hashtags,
            accessToken: platforms.instagram.accessToken,
            businessAccountId: platforms.instagram.businessAccountId,
          }),
        });

        const instagramData = await instagramResponse.json();
        
        results.push({
          platform: 'instagram',
          success: instagramData.success,
          postId: instagramData.postId,
          url: instagramData.url,
          error: instagramData.error,
        });

        if (!instagramData.success) {
          errors.push(`Instagram: ${instagramData.error}`);
        }
      } catch (error) {
        results.push({
          platform: 'instagram',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        errors.push(`Instagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Post to LinkedIn
    if (platforms.linkedin) {
      try {
        const linkedinResponse = await fetch(`${request.nextUrl.origin}/api/social/linkedin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            imageUrl,
            hashtags,
            accessToken: platforms.linkedin.accessToken,
            personId: platforms.linkedin.personId,
          }),
        });

        const linkedinData = await linkedinResponse.json();
        
        results.push({
          platform: 'linkedin',
          success: linkedinData.success,
          postId: linkedinData.postId,
          url: linkedinData.url,
          error: linkedinData.error,
        });

        if (!linkedinData.success) {
          errors.push(`LinkedIn: ${linkedinData.error}`);
        }
      } catch (error) {
        results.push({
          platform: 'linkedin',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        errors.push(`LinkedIn: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Post to Facebook
    if (platforms.facebook) {
      try {
        const facebookResponse = await fetch(`${request.nextUrl.origin}/api/social/facebook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            imageUrl,
            link,
            hashtags,
            accessToken: platforms.facebook.accessToken,
            pageId: platforms.facebook.pageId,
          }),
        });

        const facebookData = await facebookResponse.json();
        
        results.push({
          platform: 'facebook',
          success: facebookData.success,
          postId: facebookData.postId,
          url: facebookData.url,
          error: facebookData.error,
        });

        if (!facebookData.success) {
          errors.push(`Facebook: ${facebookData.error}`);
        }
      } catch (error) {
        results.push({
          platform: 'facebook',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        errors.push(`Facebook: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Post to Twitter
    if (platforms.twitter) {
      try {
        const twitterResponse = await fetch(`${request.nextUrl.origin}/api/social/twitter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            hashtags,
            bearerToken: platforms.twitter.bearerToken,
          }),
        });

        const twitterData = await twitterResponse.json();
        
        results.push({
          platform: 'twitter',
          success: twitterData.success,
          postId: twitterData.postId,
          url: twitterData.url,
          error: twitterData.error,
        });

        if (!twitterData.success) {
          errors.push(`Twitter: ${twitterData.error}`);
        }
      } catch (error) {
        results.push({
          platform: 'twitter',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        errors.push(`Twitter: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Post to TikTok
    if (platforms.tiktok) {
      try {
        const tiktokResponse = await fetch(`${request.nextUrl.origin}/api/social/tiktok`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            videoUrl,
            hashtags,
            accessToken: platforms.tiktok.accessToken,
            openId: platforms.tiktok.openId,
          }),
        });

        const tiktokData = await tiktokResponse.json();
        
        results.push({
          platform: 'tiktok',
          success: tiktokData.success,
          postId: tiktokData.postId,
          url: tiktokData.url,
          error: tiktokData.error,
        });

        if (!tiktokData.success) {
          errors.push(`TikTok: ${tiktokData.error}`);
        }
      } catch (error) {
        results.push({
          platform: 'tiktok',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        errors.push(`TikTok: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    console.log(`✅ Multi-platform posting completed: ${successCount}/${totalCount} successful`);

    const response: MultiPlatformPostResponse = {
      success: successCount > 0,
      results,
      errors: errors.length > 0 ? errors : undefined,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Multi-platform API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        results: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      },
      { status: 500 }
    );
  }
}
