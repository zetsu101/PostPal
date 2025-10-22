# PostPal WebSocket Server Setup

This guide explains how to set up and use the WebSocket server for real-time AI insights in PostPal.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create a `.env.local` file in your project root with the following WebSocket configuration:

```env
# WebSocket Server Configuration
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080
WEBSOCKET_PORT=8080
WEBSOCKET_PATH=/ws/insights

# WebSocket Security
WEBSOCKET_CORS_ORIGINS=http://localhost:3000,https://postpal.app
WEBSOCKET_MAX_CONNECTIONS=1000
WEBSOCKET_HEARTBEAT_INTERVAL=30000
WEBSOCKET_RECONNECT_DELAY=5000
WEBSOCKET_MAX_RECONNECT_ATTEMPTS=5

# WebSocket Authentication
WEBSOCKET_AUTH_TIMEOUT=10000
WEBSOCKET_TOKEN_EXPIRY_CHECK=true

# WebSocket Monitoring
WEBSOCKET_ENABLE_LOGGING=true
WEBSOCKET_LOG_LEVEL=info
WEBSOCKET_METRICS_ENABLED=true
```

### 3. Start the Development Environment

#### Option A: Start Both Next.js and WebSocket Server
```bash
npm run dev:full
```

#### Option B: Start Services Separately
```bash
# Terminal 1: Next.js development server
npm run dev

# Terminal 2: WebSocket server
npm run dev:ws
```

### 4. Test the Connection

Visit `http://localhost:3000/enhanced-ai-insights` to test the real-time functionality.

## 📡 WebSocket API

### Connection

Connect to the WebSocket server with authentication:

```javascript
const ws = new WebSocket('ws://localhost:8080/ws/insights?token=YOUR_AUTH_TOKEN');
```

### Message Types

#### Subscribe to Topics
```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  topics: ['content_analysis', 'engagement_prediction']
}));
```

#### Unsubscribe from Topics
```javascript
ws.send(JSON.stringify({
  type: 'unsubscribe',
  topics: ['content_analysis']
}));
```

#### Ping/Heartbeat
```javascript
ws.send(JSON.stringify({
  type: 'ping'
}));
```

### Available Topics

- `content_analysis` - Content scoring and analysis updates
- `engagement_prediction` - Engagement prediction updates
- `trend_update` - Trend analysis updates
- `audience_insight` - Audience analysis updates
- `performance_metric` - Performance metrics updates
- `high_priority_only` - Filter for high-priority updates only

### Message Format

#### Insight Update Message
```javascript
{
  type: 'insight_update',
  data: {
    type: 'content_analysis',
    userId: 'user_id',
    data: {
      contentScore: 85,
      features: { ... },
      recommendations: [ ... ]
    },
    timestamp: 1640995200000,
    priority: 'medium'
  },
  timestamp: 1640995200000
}
```

## 🔧 React Hooks

### useWebSocket Hook

Basic WebSocket connection hook:

```javascript
import { useWebSocket } from '@/hooks/useWebSocket';

function MyComponent() {
  const { isConnected, lastMessage, sendMessage, subscribe } = useWebSocket({
    token: 'your_auth_token',
    reconnectDelay: 5000,
    maxReconnectAttempts: 5
  });

  useEffect(() => {
    if (isConnected) {
      subscribe(['content_analysis']);
    }
  }, [isConnected]);

  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
      {lastMessage && <div>Last message: {JSON.stringify(lastMessage)}</div>}
    </div>
  );
}
```

### useAIInsightsWebSocket Hook

Pre-configured hook for AI insights:

```javascript
import { useAIInsightsWebSocket } from '@/hooks/useWebSocket';

function AIInsightsComponent() {
  const { isConnected, lastMessage, updates } = useAIInsightsWebSocket();

  useEffect(() => {
    if (lastMessage?.type === 'insight_update') {
      console.log('New insight update:', lastMessage.data);
    }
  }, [lastMessage]);

  return (
    <div>
      {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      {updates.map((update, index) => (
        <div key={index}>
          {update.type}: {JSON.stringify(update.data)}
        </div>
      ))}
    </div>
  );
}
```

### useRealtimeUpdates Hook

Hook with filtering capabilities:

```javascript
import { useRealtimeUpdates } from '@/hooks/useWebSocket';

function FilteredUpdates() {
  const { updates, isConnected } = useRealtimeUpdates({
    types: ['content_analysis', 'engagement_prediction'],
    userId: 'current_user_id'
  });

  return (
    <div>
      {updates.map((update, index) => (
        <div key={index}>
          {update.type}: {update.data.contentScore}
        </div>
      ))}
    </div>
  );
}
```

## 🛠️ Server Configuration

### WebSocket Server Class

The `PostPalWebSocketServer` class handles:

- **Authentication**: Token-based user verification
- **Connection Management**: Automatic reconnection and heartbeat
- **Subscription Management**: Topic-based message filtering
- **Rate Limiting**: Built-in connection limits
- **Monitoring**: Connection statistics and health checks

### Key Features

1. **Automatic Authentication**: Verifies Supabase tokens on connection
2. **Heartbeat Management**: Keeps connections alive with ping/pong
3. **Subscription Filtering**: Only sends relevant updates to subscribed clients
4. **Graceful Degradation**: Handles connection failures gracefully
5. **Monitoring Integration**: Provides stats for system monitoring

## 📊 Monitoring

### Server Statistics

Access server statistics via the monitoring API:

```javascript
const response = await fetch('/api/monitoring/ai-services', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
const stats = await response.json();

console.log('WebSocket Stats:', stats.data.realtimeStats);
```

### Health Checks

The WebSocket server provides:

- **Connection Count**: Total active connections
- **User Count**: Unique connected users
- **Message Queue**: Pending messages
- **Heartbeat Status**: Connection health

## 🚀 Production Deployment

### Environment Variables for Production

```env
# Production WebSocket Configuration
NEXT_PUBLIC_WEBSOCKET_URL=wss://ws.postpal.app
WEBSOCKET_PORT=443
WEBSOCKET_SSL_ENABLED=true
WEBSOCKET_CORS_ORIGINS=https://postpal.app,https://www.postpal.app
WEBSOCKET_MAX_CONNECTIONS=5000
```

### Deployment Options

1. **Standalone Server**: Deploy WebSocket server separately
2. **Integrated Deployment**: Use Next.js API routes with WebSocket upgrade
3. **Load Balancer**: Use multiple WebSocket servers behind a load balancer

### Scaling Considerations

- **Connection Limits**: Adjust `WEBSOCKET_MAX_CONNECTIONS` based on server capacity
- **Heartbeat Interval**: Balance between connection health and server load
- **Reconnection Logic**: Configure retry attempts based on network conditions
- **Message Queuing**: Implement Redis or similar for message persistence

## 🔒 Security

### Authentication

- **Token Verification**: All connections require valid Supabase tokens
- **User Isolation**: Messages are only sent to authenticated users
- **CORS Protection**: Configure allowed origins for production

### Rate Limiting

- **Connection Limits**: Prevent connection flooding
- **Message Rate Limits**: Control message frequency per user
- **Subscription Limits**: Limit number of active subscriptions

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check WebSocket server is running
   - Verify authentication token
   - Check CORS configuration

2. **No Real-time Updates**
   - Ensure client is subscribed to topics
   - Check WebSocket connection status
   - Verify API routes are sending updates

3. **High Memory Usage**
   - Monitor connection count
   - Check for connection leaks
   - Adjust heartbeat interval

### Debug Mode

Enable debug logging:

```env
WEBSOCKET_ENABLE_LOGGING=true
WEBSOCKET_LOG_LEVEL=debug
```

### Testing

Test WebSocket functionality:

```bash
# Test connection
curl -H "Upgrade: websocket" -H "Connection: Upgrade" \
  "ws://localhost:8080/ws/insights?token=YOUR_TOKEN"

# Test API integration
curl -X POST http://localhost:3000/api/websocket \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "send_test_message", "clientId": "test", "message": "Hello"}'
```

## 📚 API Reference

### WebSocket Server Methods

- `sendToUser(userId, message)` - Send message to specific user
- `sendInsightUpdate(update)` - Send insight update to subscribed clients
- `broadcast(message)` - Send message to all connected clients
- `getStats()` - Get server statistics
- `getUserClients(userId)` - Get client IDs for a user

### Configuration Options

- `WEBSOCKET_PORT` - Server port (default: 8080)
- `WEBSOCKET_PATH` - WebSocket endpoint path (default: /ws/insights)
- `WEBSOCKET_MAX_CONNECTIONS` - Maximum concurrent connections
- `WEBSOCKET_HEARTBEAT_INTERVAL` - Heartbeat interval in milliseconds
- `WEBSOCKET_RECONNECT_DELAY` - Reconnection delay in milliseconds
- `WEBSOCKET_MAX_RECONNECT_ATTEMPTS` - Maximum reconnection attempts

## 🤝 Contributing

When adding new WebSocket features:

1. Update message types in `websocket-config.ts`
2. Add new topics to `WEBSOCKET_TOPICS`
3. Update React hooks for new functionality
4. Add tests for new features
5. Update this documentation

## 📄 License

This WebSocket implementation is part of PostPal and follows the same license terms.
