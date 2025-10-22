// Real-time WebSocket Service for PostPal AI Insights
// Provides live updates for AI analysis, content optimization, and performance metrics

import { WebSocket } from 'ws';
import { EventEmitter } from 'events';

interface WebSocketClient {
  id: string;
  userId: string;
  socket: WebSocket;
  subscriptions: Set<string>;
  lastPing: number;
  isAlive: boolean;
}

interface InsightUpdate {
  type: 'content_analysis' | 'engagement_prediction' | 'trend_update' | 'audience_insight' | 'performance_metric';
  userId: string;
  data: any;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface SubscriptionFilter {
  userId?: string;
  types?: string[];
  platforms?: string[];
  priority?: string[];
}

class RealtimeInsightsService extends EventEmitter {
  private clients = new Map<string, WebSocketClient>();
  private userClients = new Map<string, Set<string>>();
  private messageQueue = new Map<string, InsightUpdate[]>();
  private isProcessingQueue = false;
  private heartbeatInterval: NodeJS.Timeout;
  private queueProcessorInterval: NodeJS.Timeout;

  constructor() {
    super();
    
    // Start heartbeat to keep connections alive
    this.heartbeatInterval = setInterval(() => this.pingClients(), 30000); // 30 seconds
    
    // Process message queue every 100ms
    this.queueProcessorInterval = setInterval(() => this.processMessageQueue(), 100);
    
    console.log('RealtimeInsightsService initialized');
  }

  // Add a new WebSocket client
  addClient(clientId: string, userId: string, socket: WebSocket): void {
    const client: WebSocketClient = {
      id: clientId,
      userId,
      socket,
      subscriptions: new Set(),
      lastPing: Date.now(),
      isAlive: true
    };

    this.clients.set(clientId, client);
    
    // Track user's clients
    if (!this.userClients.has(userId)) {
      this.userClients.set(userId, new Set());
    }
    this.userClients.get(userId)!.add(clientId);

    // Set up socket event handlers
    socket.on('message', (data) => this.handleMessage(clientId, data));
    socket.on('close', () => this.removeClient(clientId));
    socket.on('error', (error) => this.handleError(clientId, error));
    socket.on('pong', () => this.handlePong(clientId));

    console.log(`Client ${clientId} connected for user ${userId}`);
    this.emit('clientConnected', { clientId, userId });
  }

  // Remove a client
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from user's clients
    const userClients = this.userClients.get(client.userId);
    if (userClients) {
      userClients.delete(clientId);
      if (userClients.size === 0) {
        this.userClients.delete(client.userId);
      }
    }

    this.clients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
    this.emit('clientDisconnected', { clientId, userId: client.userId });
  }

  // Handle incoming messages
  private handleMessage(clientId: string, data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());
      const client = this.clients.get(clientId);
      if (!client) return;

      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(clientId, message.topics);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(clientId, message.topics);
          break;
        case 'ping':
          this.handlePing(clientId);
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error(`Error handling message from ${clientId}:`, error);
    }
  }

  // Handle subscription requests
  private handleSubscribe(clientId: string, topics: string[]): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    topics.forEach(topic => {
      client.subscriptions.add(topic);
    });

    this.sendToClient(clientId, {
      type: 'subscription_confirmed',
      topics: Array.from(client.subscriptions),
      timestamp: Date.now()
    });

    console.log(`Client ${clientId} subscribed to: ${topics.join(', ')}`);
  }

  // Handle unsubscription requests
  private handleUnsubscribe(clientId: string, topics: string[]): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    topics.forEach(topic => {
      client.subscriptions.delete(topic);
    });

    this.sendToClient(clientId, {
      type: 'unsubscription_confirmed',
      topics: Array.from(client.subscriptions),
      timestamp: Date.now()
    });

    console.log(`Client ${clientId} unsubscribed from: ${topics.join(', ')}`);
  }

  // Handle ping
  private handlePing(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastPing = Date.now();
    client.isAlive = true;

    this.sendToClient(clientId, {
      type: 'pong',
      timestamp: Date.now()
    });
  }

  // Handle pong
  private handlePong(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.isAlive = true;
  }

  // Handle socket errors
  private handleError(clientId: string, error: Error): void {
    console.error(`WebSocket error for client ${clientId}:`, error);
    this.removeClient(clientId);
  }

  // Send insight update to relevant clients
  broadcastInsightUpdate(update: InsightUpdate): void {
    const { userId, type, priority } = update;
    
    // Add to message queue for processing
    if (!this.messageQueue.has(userId)) {
      this.messageQueue.set(userId, []);
    }
    this.messageQueue.get(userId)!.push(update);

    console.log(`Queued insight update for user ${userId}: ${type}`);
  }

  // Process message queue
  private processMessageQueue(): void {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    try {
      for (const [userId, updates] of this.messageQueue.entries()) {
        if (updates.length === 0) continue;

        const userClients = this.userClients.get(userId);
        if (!userClients || userClients.size === 0) {
          // No clients connected, clear queue
          this.messageQueue.set(userId, []);
          continue;
        }

        // Send updates to all user's clients
        userClients.forEach(clientId => {
          const client = this.clients.get(clientId);
          if (!client || !client.isAlive) return;

          updates.forEach(update => {
            if (this.shouldSendUpdate(client, update)) {
              this.sendToClient(clientId, {
                type: 'insight_update',
                data: update,
                timestamp: Date.now()
              });
            }
          });
        });

        // Clear processed updates
        this.messageQueue.set(userId, []);
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Check if update should be sent to client
  private shouldSendUpdate(client: WebSocketClient, update: InsightUpdate): boolean {
    // Check if client is subscribed to this update type
    if (!client.subscriptions.has(update.type)) {
      return false;
    }

    // Check priority filters
    if (client.subscriptions.has('high_priority_only') && update.priority === 'low') {
      return false;
    }

    return true;
  }

  // Send message to specific client
  private sendToClient(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client || !client.isAlive) return;

    try {
      client.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Error sending message to client ${clientId}:`, error);
      this.removeClient(clientId);
    }
  }

  // Ping all clients to check if they're alive
  private pingClients(): void {
    for (const [clientId, client] of this.clients.entries()) {
      if (!client.isAlive) {
        console.log(`Client ${clientId} is not alive, removing`);
        this.removeClient(clientId);
        continue;
      }

      try {
        client.socket.ping();
        client.isAlive = false; // Will be set to true on pong
      } catch (error) {
        console.error(`Error pinging client ${clientId}:`, error);
        this.removeClient(clientId);
      }
    }
  }

  // Get service statistics
  getStats() {
    return {
      totalClients: this.clients.size,
      totalUsers: this.userClients.size,
      queuedMessages: Array.from(this.messageQueue.values()).reduce((sum, updates) => sum + updates.length, 0),
      timestamp: new Date().toISOString()
    };
  }

  // Get clients for a specific user
  getUserClients(userId: string): string[] {
    const userClients = this.userClients.get(userId);
    return userClients ? Array.from(userClients) : [];
  }

  // Send direct message to user
  sendToUser(userId: string, message: any): void {
    const userClients = this.userClients.get(userId);
    if (!userClients) return;

    userClients.forEach(clientId => {
      this.sendToClient(clientId, message);
    });
  }

  // Broadcast to all clients
  broadcast(message: any): void {
    for (const clientId of this.clients.keys()) {
      this.sendToClient(clientId, message);
    }
  }

  // Cleanup
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.queueProcessorInterval) {
      clearInterval(this.queueProcessorInterval);
    }

    // Close all connections
    for (const client of this.clients.values()) {
      try {
        client.socket.close();
      } catch (error) {
        console.error('Error closing client socket:', error);
      }
    }

    this.clients.clear();
    this.userClients.clear();
    this.messageQueue.clear();

    console.log('RealtimeInsightsService destroyed');
  }
}

// Create singleton instance
export const realtimeInsightsService = new RealtimeInsightsService();

// Utility functions for sending specific types of updates
export function sendContentAnalysisUpdate(userId: string, data: any): void {
  realtimeInsightsService.broadcastInsightUpdate({
    type: 'content_analysis',
    userId,
    data,
    timestamp: Date.now(),
    priority: 'medium'
  });
}

export function sendEngagementPredictionUpdate(userId: string, data: any): void {
  realtimeInsightsService.broadcastInsightUpdate({
    type: 'engagement_prediction',
    userId,
    data,
    timestamp: Date.now(),
    priority: 'high'
  });
}

export function sendTrendUpdate(userId: string, data: any): void {
  realtimeInsightsService.broadcastInsightUpdate({
    type: 'trend_update',
    userId,
    data,
    timestamp: Date.now(),
    priority: 'medium'
  });
}

export function sendAudienceInsightUpdate(userId: string, data: any): void {
  realtimeInsightsService.broadcastInsightUpdate({
    type: 'audience_insight',
    userId,
    data,
    timestamp: Date.now(),
    priority: 'low'
  });
}

export function sendPerformanceMetricUpdate(userId: string, data: any): void {
  realtimeInsightsService.broadcastInsightUpdate({
    type: 'performance_metric',
    userId,
    data,
    timestamp: Date.now(),
    priority: 'high'
  });
}

// WebSocket connection handler for Next.js API routes
export function handleWebSocketConnection(request: Request, userId: string): Response {
  // This would typically be handled by a WebSocket server
  // For Next.js, you might need to use a separate WebSocket server or upgrade the connection
  
  return new Response('WebSocket connection established', {
    status: 101,
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
      'Sec-WebSocket-Accept': 'dummy' // This would be properly calculated
    }
  });
}

export { RealtimeInsightsService };
export default RealtimeInsightsService;
