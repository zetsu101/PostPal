import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { headers } from 'next/headers';

interface PerformanceMetric {
  metricName: string;
  metricValue: number;
  metricUnit: string;
  category: string;
  platform?: string;
  deviceInfo?: any;
  browserInfo?: any;
}

interface BundleAnalysis {
  totalSizeBytes: number;
  jsSizeBytes: number;
  cssSizeBytes: number;
  imageSizeBytes: number;
  unusedCodeBytes: number;
  duplicatesBytes: number;
  recommendations: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { metrics, bundleAnalysis, organizationId } = body;

    // Save performance metrics
    if (metrics && Array.isArray(metrics)) {
      const metricsData = metrics.map((metric: PerformanceMetric) => ({
        user_id: user.id,
        organization_id: organizationId || null,
        metric_name: metric.metricName,
        metric_value: metric.metricValue,
        metric_unit: metric.metricUnit,
        category: metric.category,
        platform: metric.platform || 'web',
        device_info: metric.deviceInfo || {},
        browser_info: metric.browserInfo || {}
      }));

      const { error: metricsError } = await supabase
        .from('performance_metrics')
        .insert(metricsData);

      if (metricsError) {
        console.error('Error saving performance metrics:', metricsError);
        return NextResponse.json({ error: 'Failed to save performance metrics' }, { status: 500 });
      }
    }

    // Save bundle analysis
    if (bundleAnalysis) {
      const bundleData = {
        user_id: user.id,
        organization_id: organizationId || null,
        total_size_bytes: bundleAnalysis.totalSizeBytes,
        js_size_bytes: bundleAnalysis.jsSizeBytes,
        css_size_bytes: bundleAnalysis.cssSizeBytes,
        image_size_bytes: bundleAnalysis.imageSizeBytes,
        unused_code_bytes: bundleAnalysis.unusedCodeBytes || 0,
        duplicates_bytes: bundleAnalysis.duplicatesBytes || 0,
        recommendations: bundleAnalysis.recommendations || []
      };

      const { error: bundleError } = await supabase
        .from('bundle_analyses')
        .insert(bundleData);

      if (bundleError) {
        console.error('Error saving bundle analysis:', bundleError);
        return NextResponse.json({ error: 'Failed to save bundle analysis' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Error in POST /api/performance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get performance metrics
    let metricsQuery = supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      metricsQuery = metricsQuery.eq('organization_id', organizationId);
    }

    if (category) {
      metricsQuery = metricsQuery.eq('category', category);
    }

    const { data: metrics, error: metricsError } = await metricsQuery;

    if (metricsError) {
      console.error('Error fetching performance metrics:', metricsError);
      return NextResponse.json({ error: 'Failed to fetch performance metrics' }, { status: 500 });
    }

    // Get latest bundle analysis
    let bundleQuery = supabase
      .from('bundle_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (organizationId) {
      bundleQuery = bundleQuery.eq('organization_id', organizationId);
    }

    const { data: bundleAnalyses, error: bundleError } = await bundleQuery;

    if (bundleError) {
      console.error('Error fetching bundle analysis:', bundleError);
      return NextResponse.json({ error: 'Failed to fetch bundle analysis' }, { status: 500 });
    }

    // Get performance suggestions
    let suggestionsQuery = supabase
      .from('performance_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (organizationId) {
      suggestionsQuery = suggestionsQuery.eq('organization_id', organizationId);
    }

    const { data: suggestions, error: suggestionsError } = await suggestionsQuery;

    if (suggestionsError) {
      console.error('Error fetching performance suggestions:', suggestionsError);
      return NextResponse.json({ error: 'Failed to fetch performance suggestions' }, { status: 500 });
    }

    // Calculate performance score based on Core Web Vitals
    const coreWebVitals = metrics?.filter(m => 
      ['First Contentful Paint', 'Largest Contentful Paint', 'Cumulative Layout Shift', 'First Input Delay'].includes(m.metric_name)
    ) || [];

    let performanceScore = 100;
    if (coreWebVitals.length > 0) {
      const scores = coreWebVitals.map(metric => {
        switch (metric.metric_name) {
          case 'First Contentful Paint':
            return metric.metric_value <= 1.5 ? 100 : metric.metric_value <= 2.5 ? 80 : 60;
          case 'Largest Contentful Paint':
            return metric.metric_value <= 2.5 ? 100 : metric.metric_value <= 4.0 ? 80 : 60;
          case 'Cumulative Layout Shift':
            return metric.metric_value <= 0.1 ? 100 : metric.metric_value <= 0.25 ? 80 : 60;
          case 'First Input Delay':
            return metric.metric_value <= 100 ? 100 : metric.metric_value <= 300 ? 80 : 60;
          default:
            return 100;
        }
      });
      performanceScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    return NextResponse.json({
      metrics: metrics || [],
      bundleAnalysis: bundleAnalyses?.[0] || null,
      suggestions: suggestions || [],
      performanceScore,
      summary: {
        totalMetrics: metrics?.length || 0,
        latestBundleSize: bundleAnalyses?.[0]?.total_size_bytes || 0,
        activeSuggestions: suggestions?.filter(s => !s.applied).length || 0
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/performance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { suggestionId, applied } = body;

    if (!suggestionId || applied === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: suggestionId, applied' 
      }, { status: 400 });
    }

    // Update performance suggestion
    const updateData: any = { applied };
    if (applied) {
      updateData.applied_at = new Date().toISOString();
    }

    const { data: updatedSuggestion, error: updateError } = await supabase
      .from('performance_suggestions')
      .update(updateData)
      .eq('id', suggestionId)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating performance suggestion:', updateError);
      return NextResponse.json({ error: 'Failed to update suggestion' }, { status: 500 });
    }

    return NextResponse.json({ suggestion: updatedSuggestion }, { status: 200 });

  } catch (error) {
    console.error('Error in PUT /api/performance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
