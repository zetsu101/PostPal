// WebSocket Server Configuration for PostPal
// Integrates with Next.js API routes and provides real-time functionality

import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { createServerClient } from '@/lib/supabase';
import { realtimeInsightsService } from '@/lib/realtime-insights-service';

interface WebSocketClient {
  id: string;
  userId: string;
  socket: any;
  subscriptions: Set<string>;
  lastPing: number;
  isAlive: boolean;
}

class PostPalWebSocketServer {
  private wss: WebSocketServer;
  private clients = new Map<string, WebSocketClient>();
  private userClients = new Map<string, Set<string>>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/insights',
      verifyClient: this.verifyClient.bind(this)
    });

    this.setupEventHandlers();
    this.startHeartbeat();
    
    console.log('PostPal WebSocket Server initialized');
  }

  // Verify client connection (authentication)
  private async verifyClient(info: { origin: string; secure: boolean; req: IncomingMessage }): Promise<boolean> {
    try {
      const url = parse(info.req.url || '', true);
      const token = url.query.token as string;
      
      if (!token) {
        console.log('WebSocket connection rejected: No token provided');
        return false;
      }

      // Verify token with Supabase
      const supabase = createServerClient();
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        console.log('WebSocket connection rejected: Invalid token');
        return false;
      }

      // Store user info in request for later use
      (info.req as any).user = user;
      return true;
    } catch (error) {
      console.error('WebSocket verification error:', error);
      return false;
    }
  }

  // Setup WebSocket event handlers
  private setupEventHandlers() {
    this.wss.on('connection', (ws, req) => {
      const user = (req as any).user;
      const clientId = `client_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const client: WebSocketClient = {
        id: clientId,
        userId: user.id,
        socket: ws,
        subscriptions: new Set(),
        lastPing: Date.now(),
        isAlive: true
      };

      this.clients.set(clientId, client);
      
      // Track user's clients
      if (!this.userClients.has(user.id)) {
        this.userClients.set(user.id, new Set());
      }
      this.userClients.get(user.id)!.add(clientId);

      console.log(`WebSocket client connected: ${clientId} for user ${user.id}`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connection_established',
        clientId,
        userId: user.id,
        timestamp: Date.now()
      });

      // Setup message handlers
      ws.on('message', (data: Buffer | string) => {
        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
        this.handleMessage(clientId, buffer);
      });
      ws.on('close', () => this.handleDisconnect(clientId));
      ws.on('error', (error) => this.handleError(clientId, error));
      ws.on('pong', () => this.handlePong(clientId));
    });
  }

  // Handle incoming messages
  private handleMessage(clientId: string, data: Buffer) {
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
        case 'get_status':
          this.handleGetStatus(clientId);
          break;
        default:
          console.warn(`Unknown message type from ${clientId}: ${message.type}`);
      }
    } catch (error) {
      console.error(`Error handling message from ${clientId}:`, error);
    }
  }

  // Handle subscription requests
  private handleSubscribe(clientId: string, topics: string[]) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const validTopics = [
      'content_analysis',
      'engagement_prediction',
      'trend_update',
      'audience_insight',
      'performance_metric',
      'high_priority_only'
    ];

    const validSubscriptions = topics.filter(topic => validTopics.includes(topic));
    
    validSubscriptions.forEach(topic => {
      client.subscriptions.add(topic);
    });

    this.sendToClient(clientId, {
      type: 'subscription_confirmed',
      topics: Array.from(client.subscriptions),
      timestamp: Date.now()
    });

    console.log(`Client ${clientId} subscribed to: ${validSubscriptions.join(', ')}`);
  }

  // Handle unsubscription requests
  private handleUnsubscribe(clientId: string, topics: string[]) {
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
  private handlePing(clientId: string) {
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
  private handlePong(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.isAlive = true;
  }

  // Handle status request
  private handleGetStatus(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    this.sendToClient(clientId, {
      type: 'status_response',
      data: {
        clientId: client.id,
        userId: client.userId,
        subscriptions: Array.from(client.subscriptions),
        isConnected: true,
        timestamp: Date.now()
      }
    });
  }

  // Handle client disconnect
  private handleDisconnect(clientId: string) {
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
    console.log(`WebSocket client disconnected: ${clientId}`);
  }

  // Handle client error
  private handleError(clientId: string, error: Error) {
    console.error(`WebSocket error for client ${clientId}:`, error);
    this.handleDisconnect(clientId);
  }

  // Send message to specific client
  private sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client || !client.isAlive) return;

    try {
      client.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Error sending message to client ${clientId}:`, error);
      this.handleDisconnect(clientId);
    }
  }

  // Send message to all clients of a user
  public sendToUser(userId: string, message: any) {
    const userClients = this.userClients.get(userId);
    if (!userClients) return;

    userClients.forEach(clientId => {
      this.sendToClient(clientId, message);
    });
  }

  // Send insight update to relevant clients
  public sendInsightUpdate(update: any) {
    const { userId, type, priority } = update;
    
    const userClients = this.userClients.get(userId);
    if (!userClients) return;

    userClients.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (!client || !client.isAlive) return;

      // Check if client is subscribed to this update type
      if (!client.subscriptions.has(type)) {
        return;
      }

      // Check priority filters
      if (client.subscriptions.has('high_priority_only') && priority === 'low') {
        return;
      }

      this.sendToClient(clientId, {
        type: 'insight_update',
        data: update,
        timestamp: Date.now()
      });
    });
  }

  // Broadcast to all connected clients
  public broadcast(message: any) {
    this.clients.forEach((client, clientId) => {
      this.sendToClient(clientId, message);
    });
  }

  // Start heartbeat to keep connections alive
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          console.log(`Client ${clientId} is not alive, removing`);
          this.handleDisconnect(clientId);
          return;
        }

        try {
          client.socket.ping();
          client.isAlive = false; // Will be set to true on pong
        } catch (error) {
          console.error(`Error pinging client ${clientId}:`, error);
          this.handleDisconnect(clientId);
        }
      });
    }, 30000); // 30 seconds
  }

  // Get server statistics
  public getStats() {
    return {
      totalClients: this.clients.size,
      totalUsers: this.userClients.size,
      timestamp: new Date().toISOString()
    };
  }

  // Get clients for a specific user
  public getUserClients(userId: string): string[] {
    const userClients = this.userClients.get(userId);
    return userClients ? Array.from(userClients) : [];
  }

  // Cleanup
  public destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Close all connections
    this.clients.forEach((client) => {
      try {
        client.socket.close();
      } catch (error) {
        console.error('Error closing client socket:', error);
      }
    });

    this.clients.clear();
    this.userClients.clear();
    this.wss.close();

    console.log('PostPal WebSocket Server destroyed');
  }
}

// Global WebSocket server instance
let wsServer: PostPalWebSocketServer | null = null;

// Initialize WebSocket server
export function initializeWebSocketServer(server: any) {
  if (!wsServer) {
    wsServer = new PostPalWebSocketServer(server);
  }
  return wsServer;
}

// Get WebSocket server instance
export function getWebSocketServer(): PostPalWebSocketServer | null {
  return wsServer;
}

// Send insight update (used by API routes)
export function sendInsightUpdate(update: any) {
  if (wsServer) {
    wsServer.sendInsightUpdate(update);
  }
}

// Send message to user (used by API routes)
export function sendToUser(userId: string, message: any) {
  if (wsServer) {
    wsServer.sendToUser(userId, message);
  }
}

// Get server stats (used by monitoring)
export function getWebSocketStats() {
  return wsServer ? wsServer.getStats() : null;
}

export default PostPalWebSocketServer;
