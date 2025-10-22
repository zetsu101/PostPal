// WebSocket Client Integration Service
// Provides a unified interface for WebSocket communication across the application

import { EventEmitter } from 'events';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: number;
  id?: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  debug: boolean;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  lastConnected?: Date;
  lastError?: Error;
}

class WebSocketClientService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private state: ConnectionState;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private subscriptions: Map<string, Set<string>> = new Map();

  constructor(config: Partial<WebSocketConfig> = {}) {
    super();
    
    this.config = {
      url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/ws/insights',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      debug: process.env.NODE_ENV === 'development',
      ...config
    };

    this.state = {
      isConnected: false,
      isConnecting: false,
      reconnectAttempts: 0
    };

    this.setupEventHandlers();
  }

  // Setup event handlers
  private setupEventHandlers(): void {
    this.on('message', (message: WebSocketMessage) => {
      this.handleMessage(message);
    });

    this.on('error', (error: Error) => {
      this.state.lastError = error;
      if (this.config.debug) {
        console.error('WebSocket error:', error);
      }
    });

    this.on('connected', () => {
      this.state.isConnected = true;
      this.state.isConnecting = false;
      this.state.reconnectAttempts = 0;
      this.state.lastConnected = new Date();
      
      // Process queued messages
      this.processMessageQueue();
      
      // Start heartbeat
      this.startHeartbeat();
      
      if (this.config.debug) {
        console.log('WebSocket connected');
      }
    });

    this.on('disconnected', () => {
      this.state.isConnected = false;
      this.state.isConnecting = false;
      
      // Stop heartbeat
      this.stopHeartbeat();
      
      if (this.config.debug) {
        console.log('WebSocket disconnected');
      }
    });
  }

  // Connect to WebSocket server
  async connect(token?: string): Promise<void> {
    if (this.state.isConnected || this.state.isConnecting) {
      return;
    }

    this.state.isConnecting = true;
    this.state.reconnectAttempts++;

    try {
      const url = token ? `${this.config.url}?token=${token}` : this.config.url;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.emit('message', message);
        } catch (error) {
          this.emit('error', new Error('Failed to parse WebSocket message'));
        }
      };

      this.ws.onclose = (event) => {
        this.emit('disconnected');
        
        if (!event.wasClean && this.state.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        this.emit('error', error as Error);
      };

    } catch (error) {
      this.state.isConnecting = false;
      this.emit('error', error as Error);
      
      if (this.state.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    }
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.state.isConnected = false;
    this.state.isConnecting = false;
    this.state.reconnectAttempts = 0;
  }

  // Send message to WebSocket server
  send(message: WebSocketMessage): boolean {
    if (!this.state.isConnected || !this.ws) {
      // Queue message for later
      this.messageQueue.push(message);
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      this.emit('error', error as Error);
      return false;
    }
  }

  // Subscribe to a topic
  subscribe(topic: string, userId?: string): void {
    const key = userId || 'global';
    
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    
    this.subscriptions.get(key)!.add(topic);

    this.send({
      type: 'subscribe',
      data: {
        topic,
        userId
      }
    });
  }

  // Unsubscribe from a topic
  unsubscribe(topic: string, userId?: string): void {
    const key = userId || 'global';
    
    if (this.subscriptions.has(key)) {
      this.subscriptions.get(key)!.delete(topic);
      
      if (this.subscriptions.get(key)!.size === 0) {
        this.subscriptions.delete(key);
      }
    }

    this.send({
      type: 'unsubscribe',
      data: {
        topic,
        userId
      }
    });
  }

  // Send ping for heartbeat
  ping(): void {
    this.send({
      type: 'ping',
      data: {
        timestamp: Date.now()
      }
    });
  }

  // Handle incoming messages
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'pong':
        // Heartbeat response
        break;
        
      case 'subscription_confirmed':
        if (this.config.debug) {
          console.log('Subscription confirmed:', message.data);
        }
        break;
        
      case 'subscription_error':
        this.emit('error', new Error(`Subscription error: ${message.data.error}`));
        break;
        
      case 'insight_update':
        this.emit('insight_update', message);
        break;
        
      case 'collaboration_update':
        this.emit('collaboration_update', message);
        break;
        
      case 'notification':
        this.emit('notification', message);
        break;
        
      case 'analytics_update':
        this.emit('analytics_update', message);
        break;
        
      default:
        // Emit generic message event
        this.emit('message', message);
    }
  }

  // Process queued messages
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  // Schedule reconnection
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      if (this.config.debug) {
        console.log(`Attempting to reconnect (${this.state.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
      }
      this.connect();
    }, this.config.reconnectInterval);
  }

  // Start heartbeat
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      this.ping();
    }, this.config.heartbeatInterval);
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Get connection state
  getState(): ConnectionState {
    return { ...this.state };
  }

  // Get subscriptions
  getSubscriptions(): Map<string, Set<string>> {
    return new Map(this.subscriptions);
  }

  // Check if connected
  isConnected(): boolean {
    return this.state.isConnected;
  }

  // Check if connecting
  isConnecting(): boolean {
    return this.state.isConnecting;
  }

  // Get connection info
  getConnectionInfo(): any {
    return {
      url: this.config.url,
      state: this.state,
      subscriptions: Array.from(this.subscriptions.entries()).map(([key, topics]) => ({
        key,
        topics: Array.from(topics)
      })),
      queuedMessages: this.messageQueue.length
    };
  }
}

// Create singleton instance
const webSocketClient = new WebSocketClientService();

// Export singleton and class
export { WebSocketClientService };
export default webSocketClient;

// React hook for WebSocket client
export function useWebSocketClient() {
  const [isConnected, setIsConnected] = React.useState(webSocketClient.isConnected());
  const [isConnecting, setIsConnecting] = React.useState(webSocketClient.isConnecting());
  const [lastMessage, setLastMessage] = React.useState<WebSocketMessage | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleMessage = (message: WebSocketMessage) => {
      setLastMessage(message);
    };

    const handleError = (err: Error) => {
      setError(err);
    };

    // Add event listeners
    webSocketClient.on('connected', handleConnected);
    webSocketClient.on('disconnected', handleDisconnected);
    webSocketClient.on('message', handleMessage);
    webSocketClient.on('error', handleError);

    // Cleanup
    return () => {
      webSocketClient.off('connected', handleConnected);
      webSocketClient.off('disconnected', handleDisconnected);
      webSocketClient.off('message', handleMessage);
      webSocketClient.off('error', handleError);
    };
  }, []);

  const connect = React.useCallback((token?: string) => {
    return webSocketClient.connect(token);
  }, []);

  const disconnect = React.useCallback(() => {
    webSocketClient.disconnect();
  }, []);

  const send = React.useCallback((message: WebSocketMessage) => {
    return webSocketClient.send(message);
  }, []);

  const subscribe = React.useCallback((topic: string, userId?: string) => {
    webSocketClient.subscribe(topic, userId);
  }, []);

  const unsubscribe = React.useCallback((topic: string, userId?: string) => {
    webSocketClient.unsubscribe(topic, userId);
  }, []);

  return {
    isConnected,
    isConnecting,
    lastMessage,
    error,
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
    client: webSocketClient
  };
}
