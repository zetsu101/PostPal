import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServerClient } from '@/lib/supabase';
import { realtimeInsightsService } from '@/lib/realtime-insights-service';
import { APIResponse } from '@/lib/api-middleware';

// WebSocket upgrade handler for real-time insights
export async function GET(request: NextRequest) {
  try {
    // Check if this is a WebSocket upgrade request
    const upgrade = request.headers.get('upgrade');
    const connection = request.headers.get('connection');
    
    if (upgrade !== 'websocket' || !connection?.includes('upgrade')) {
      return APIResponse.error('WebSocket upgrade required', 400);
    }

    // Extract and validate authorization token
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return APIResponse.unauthorized('Valid authorization token required for WebSocket connection');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return APIResponse.unauthorized('Invalid or expired token');
    }

    // Generate unique client ID
    const clientId = `client_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // For Next.js, we can't directly handle WebSocket upgrades in API routes
    // This would typically be handled by a separate WebSocket server
    // Here we'll return connection details that the client can use
    
    const connectionInfo = {
      clientId,
      userId: user.id,
      websocketUrl: process.env.WEBSOCKET_URL || 'ws://localhost:8080',
      subscriptions: [
        'content_analysis',
        'engagement_prediction', 
        'trend_update',
        'audience_insight',
        'performance_metric'
      ],
      heartbeatInterval: 30000, // 30 seconds
      reconnectDelay: 5000, // 5 seconds
      maxReconnectAttempts: 5
    };

    return APIResponse.success(connectionInfo, 'WebSocket connection details');

  } catch (error) {
    console.error('WebSocket connection error:', error);
    return APIResponse.serverError(
      'Failed to establish WebSocket connection',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// Handle WebSocket subscription management via HTTP
export async function POST(request: NextRequest) {
  try {
    // Extract and validate authorization token
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return APIResponse.unauthorized('Valid authorization token required');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return APIResponse.unauthorized('Invalid or expired token');
    }

    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      return APIResponse.error(
        'Invalid JSON in request body',
        400,
        { parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error' }
      );
    }

    const { action, clientId, topics } = requestData;

    if (!action || !clientId) {
      return APIResponse.error('Action and clientId are required', 400);
    }

    switch (action) {
      case 'subscribe':
        if (!topics || !Array.isArray(topics)) {
          return APIResponse.error('Topics array is required for subscription', 400);
        }
        
        // Validate topics
        const validTopics = [
          'content_analysis',
          'engagement_prediction',
          'trend_update',
          'audience_insight',
          'performance_metric',
          'high_priority_only'
        ];
        
        const invalidTopics = topics.filter(topic => !validTopics.includes(topic));
        if (invalidTopics.length > 0) {
          return APIResponse.error(
            `Invalid topics: ${invalidTopics.join(', ')}`,
            400,
            { validTopics }
          );
        }

        // In a real implementation, you would manage subscriptions here
        // For now, we'll just return success
        return APIResponse.success({
          clientId,
          subscribedTopics: topics,
          timestamp: new Date().toISOString()
        }, 'Successfully subscribed to topics');

      case 'unsubscribe':
        if (!topics || !Array.isArray(topics)) {
          return APIResponse.error('Topics array is required for unsubscription', 400);
        }

        // In a real implementation, you would remove subscriptions here
        return APIResponse.success({
          clientId,
          unsubscribedTopics: topics,
          timestamp: new Date().toISOString()
        }, 'Successfully unsubscribed from topics');

      case 'get_status':
        const stats = realtimeInsightsService.getStats();
        const userClients = realtimeInsightsService.getUserClients(user.id);
        
        return APIResponse.success({
          clientId,
          isConnected: userClients.includes(clientId),
          userClients,
          serviceStats: stats,
          timestamp: new Date().toISOString()
        }, 'WebSocket status retrieved');

      default:
        return APIResponse.error(`Unknown action: ${action}`, 400);
    }

  } catch (error) {
    console.error('WebSocket management error:', error);
    return APIResponse.serverError(
      'Failed to manage WebSocket connection',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// Send test message to user's WebSocket connections
export async function PUT(request: NextRequest) {
  try {
    // Extract and validate authorization token
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return APIResponse.unauthorized('Valid authorization token required');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return APIResponse.unauthorized('Invalid or expired token');
    }

    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      return APIResponse.error(
        'Invalid JSON in request body',
        400,
        { parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error' }
      );
    }

    const { message, type = 'test_message' } = requestData;

    if (!message) {
      return APIResponse.error('Message is required', 400);
    }

    // Send message to user's WebSocket connections
    realtimeInsightsService.sendToUser(user.id, {
      type,
      data: message,
      timestamp: new Date().toISOString()
    });

    return APIResponse.success({
      sent: true,
      userId: user.id,
      messageType: type,
      timestamp: new Date().toISOString()
    }, 'Message sent to WebSocket connections');

  } catch (error) {
    console.error('WebSocket message error:', error);
    return APIResponse.serverError(
      'Failed to send WebSocket message',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}
