import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServerClient } from '@/lib/supabase';
import { APIResponse } from '@/lib/api-middleware';

// WebSocket connection handler for Next.js
export async function GET(request: NextRequest) {
  try {
    // Check if this is a WebSocket upgrade request
    const upgrade = request.headers.get('upgrade');
    const connection = request.headers.get('connection');
    
    if (upgrade !== 'websocket' || !connection?.includes('upgrade')) {
      return APIResponse.error('WebSocket upgrade required', 400);
    }

    // Extract token from query parameters
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return APIResponse.error('Authentication token required', 401);
    }

    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return APIResponse.error('Invalid or expired token', 401);
    }

    // Generate unique client ID
    const clientId = `client_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Return WebSocket upgrade response
    // Note: In a real implementation, you would handle the WebSocket upgrade here
    // For Next.js, this typically requires a separate WebSocket server
    return new NextResponse('WebSocket upgrade initiated', {
      status: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
        'Sec-WebSocket-Accept': 'dummy', // This would be properly calculated
        'X-Client-ID': clientId,
        'X-User-ID': user.id
      }
    });

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
        return APIResponse.success({
          clientId,
          subscribedTopics: topics,
          timestamp: new Date().toISOString()
        }, 'Successfully subscribed to topics');

      case 'unsubscribe':
        if (!topics || !Array.isArray(topics)) {
          return APIResponse.error('Topics array is required for unsubscription', 400);
        }

        return APIResponse.success({
          clientId,
          unsubscribedTopics: topics,
          timestamp: new Date().toISOString()
        }, 'Successfully unsubscribed from topics');

      case 'get_status':
        // Get WebSocket server stats
        const { getWebSocketStats } = await import('@/lib/websocket-server');
        const stats = getWebSocketStats();
        
        return APIResponse.success({
          clientId,
          isConnected: true, // This would be checked against actual WebSocket server
          serverStats: stats,
          timestamp: new Date().toISOString()
        }, 'WebSocket status retrieved');

      case 'send_test_message':
        // Send test message to user's WebSocket connections
        const { sendToUser } = await import('@/lib/websocket-server');
        const testMessage = {
          type: 'test_message',
          data: {
            message: 'Test message from API',
            timestamp: Date.now()
          }
        };
        
        sendToUser(user.id, testMessage);
        
        return APIResponse.success({
          clientId,
          messageSent: true,
          timestamp: new Date().toISOString()
        }, 'Test message sent to WebSocket connections');

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

// Send message to user's WebSocket connections
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

    const { message, type = 'custom_message', targetUserId } = requestData;

    if (!message) {
      return APIResponse.error('Message is required', 400);
    }

    // Import WebSocket server functions
    const { sendToUser, sendInsightUpdate } = await import('@/lib/websocket-server');

    // Send message to user's WebSocket connections
    const wsMessage = {
      type,
      data: message,
      timestamp: new Date().toISOString()
    };

    if (targetUserId) {
      // Send to specific user
      sendToUser(targetUserId, wsMessage);
    } else {
      // Send to current user
      sendToUser(user.id, wsMessage);
    }

    return APIResponse.success({
      sent: true,
      userId: targetUserId || user.id,
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
