import { NextRequest, NextResponse } from 'next/server';
import { monitorApiRoute } from '@/lib/api-monitoring';
import { performanceMonitor } from '@/lib/performance-monitor';
import { analytics } from '@/lib/analytics';

async function handler(req: NextRequest) {
  try {
    const { method } = req;
    
    if (method === 'GET') {
      // Return monitoring data
      const performanceData = performanceMonitor.getPerformanceData();
      const apiPerformanceData = performanceMonitor.getApiPerformanceData();
      const session = analytics.getSession();
      
      return NextResponse.json({
        success: true,
        data: {
          performance: {
            averageLoadTime: performanceMonitor.getAverageLoadTime(),
            slowestPages: performanceMonitor.getSlowestPages(),
            apiPerformance: performanceMonitor.getApiPerformanceSummary(),
          },
          analytics: {
            sessionId: session.sessionId,
            pageViews: session.pageViews,
            events: session.events.length,
            userId: session.userId,
          },
          system: {
            uptime: Date.now() - session.startTime.getTime(),
            timestamp: new Date().toISOString(),
          },
        },
      });
    }
    
    if (method === 'POST') {
      // Track custom event
      const body = await req.json();
      const { event, properties } = body;
      
      analytics.track(event, properties);
      
      return NextResponse.json({
        success: true,
        message: 'Event tracked successfully',
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = monitorApiRoute(handler);
export const POST = monitorApiRoute(handler);
