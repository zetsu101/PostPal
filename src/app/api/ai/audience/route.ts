import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { audienceAnalysisEngine, type AudienceAnalysisRequest } from '@/lib/audience-analysis-engine';

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: AudienceAnalysisRequest = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Perform comprehensive audience analysis
    const audienceInsights = await audienceAnalysisEngine.analyzeAudience(body);

    // Get specific segment analysis if requested
    let segmentAnalysis = null;
    if (body.focusAreas?.includes('segments')) {
      segmentAnalysis = await audienceAnalysisEngine.getAudienceSegment(
        body.userId,
        'primary'
      );
    }

    // Get actionable insights
    const actionableInsights = await audienceAnalysisEngine.getAudienceInsights(body.userId);

    return NextResponse.json({
      insights: audienceInsights,
      segmentAnalysis,
      actionableInsights,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Audience Analysis API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze audience' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get quick audience insights for dashboard
    const insights = await audienceAnalysisEngine.getAudienceInsights(userId);

    return NextResponse.json({
      insights,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Audience GET API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audience insights' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, data } = await request.json();

    if (!userId || !data) {
      return NextResponse.json(
        { error: 'User ID and data are required' },
        { status: 400 }
      );
    }

    // Update audience data
    await audienceAnalysisEngine.updateAudienceData(userId, data);

    return NextResponse.json({
      message: 'Audience data updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Audience Update API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update audience data' },
      { status: 500 }
    );
  }
}
