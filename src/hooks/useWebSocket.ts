'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  WEBSOCKET_CONFIG, 
  WEBSOCKET_MESSAGE_TYPES, 
  WEBSOCKET_TOPICS,
  createWebSocketURL,
  getWebSocketStatus,
  isWebSocketSupported 
} from '@/lib/websocket-config';

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: number;
}

interface WebSocketConfig {
  url?: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  token?: string;
}

interface WebSocketHookReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  subscribe: (topics: string[]) => void;
  unsubscribe: (topics: string[]) => void;
  connect: () => void;
  disconnect: () => void;
  reconnectAttempts: number;
}

export function useWebSocket(config: WebSocketConfig = {}): WebSocketHookReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set());

  const {
    url = WEBSOCKET_CONFIG.URL,
    reconnectDelay = WEBSOCKET_CONFIG.RECONNECT_DELAY,
    maxReconnectAttempts = WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS,
    heartbeatInterval = WEBSOCKET_CONFIG.HEARTBEAT_INTERVAL,
    token
  } = config;

  // Send message
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        setError('Failed to send message');
      }
    } else {
      setError('WebSocket not connected');
    }
  }, []);

  // Subscribe to topics
  const subscribe = useCallback((topics: string[]) => {
    topics.forEach(topic => subscriptionsRef.current.add(topic));
    
    if (isConnected) {
      sendMessage({
        type: 'subscribe',
        topics: Array.from(subscriptionsRef.current)
      });
    }
  }, [isConnected, sendMessage]);

  // Unsubscribe from topics
  const unsubscribe = useCallback((topics: string[]) => {
    topics.forEach(topic => subscriptionsRef.current.delete(topic));
    
    if (isConnected) {
      sendMessage({
        type: 'unsubscribe',
        topics: Array.from(subscriptionsRef.current)
      });
    }
  }, [isConnected, sendMessage]);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    heartbeatTimeoutRef.current = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'ping' });
        startHeartbeat(); // Schedule next heartbeat
      }
    }, heartbeatInterval);
  }, [sendMessage, heartbeatInterval]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || isConnecting) {
      return;
    }

    if (!isWebSocketSupported()) {
      setError('WebSocket is not supported in this browser');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const wsUrl = token ? createWebSocketURL(token) : url;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0);
        setError(null);
        
        // Resubscribe to topics
        if (subscriptionsRef.current.size > 0) {
          sendMessage({
            type: 'subscribe',
            topics: Array.from(subscriptionsRef.current)
          });
        }
        
        // Start heartbeat
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
          
          // Handle pong responses
          if (message.type === WEBSOCKET_MESSAGE_TYPES.PONG) {
            // Heartbeat received, continue
            return;
          }
          
          // Handle subscription confirmations
          if (message.type === WEBSOCKET_MESSAGE_TYPES.SUBSCRIPTION_CONFIRMED) {
            console.log('Subscribed to topics:', message.topics);
            return;
          }
          
          if (message.type === WEBSOCKET_MESSAGE_TYPES.UNSUBSCRIPTION_CONFIRMED) {
            console.log('Unsubscribed from topics:', message.topics);
            return;
          }
          
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          setError('Failed to parse message');
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Clear heartbeat
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
        }
        
        // Attempt to reconnect if not a manual disconnect
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          setReconnectAttempts(prev => prev + 1);
          retryTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectAttempts);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          setError('Max reconnection attempts reached');
        }
      };

      ws.onerror = (error) => {
        // Silently handle WebSocket errors - connection is optional
        setIsConnected(false);
        setIsConnecting(false);
        setError('WebSocket connection error');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setIsConnecting(false);
      setError('Failed to create WebSocket connection');
    }
  }, [url, reconnectDelay, maxReconnectAttempts, reconnectAttempts, isConnecting, startHeartbeat]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setReconnectAttempts(0);
  }, []);

  // Auto-connect on mount (disabled by default - enable when WebSocket server is running)
  useEffect(() => {
    // Uncomment the line below to enable auto-connect
    // connect();
    
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    lastMessage,
    sendMessage,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
    reconnectAttempts
  };
}

// Hook for AI insights WebSocket
export function useAIInsightsWebSocket() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const config: WebSocketConfig = {
    token: token || undefined,
    reconnectDelay: WEBSOCKET_CONFIG.RECONNECT_DELAY,
    maxReconnectAttempts: WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS,
    heartbeatInterval: WEBSOCKET_CONFIG.HEARTBEAT_INTERVAL
  };

  const ws = useWebSocket(config);

  // Subscribe to AI insights topics
  useEffect(() => {
    if (ws.isConnected) {
      ws.subscribe([
        WEBSOCKET_TOPICS.CONTENT_ANALYSIS,
        WEBSOCKET_TOPICS.ENGAGEMENT_PREDICTION,
        WEBSOCKET_TOPICS.TREND_UPDATE,
        WEBSOCKET_TOPICS.AUDIENCE_INSIGHT,
        WEBSOCKET_TOPICS.PERFORMANCE_METRIC
      ]);
    }
  }, [ws.isConnected]);

  return ws;
}

// Hook for real-time updates with filtering
export function useRealtimeUpdates(filter?: {
  types?: string[];
  userId?: string;
}) {
  const ws = useAIInsightsWebSocket();
  const [updates, setUpdates] = useState<any[]>([]);
  const [filteredUpdates, setFilteredUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (ws.lastMessage?.type === 'insight_update') {
      const update = ws.lastMessage.data;
      
      // Apply filters
      let shouldInclude = true;
      
      if (filter?.types && !filter.types.includes(update.type)) {
        shouldInclude = false;
      }
      
      if (filter?.userId && update.userId !== filter.userId) {
        shouldInclude = false;
      }
      
      if (shouldInclude) {
        setUpdates(prev => [...prev.slice(-9), update]); // Keep last 10 updates
      }
    }
  }, [ws.lastMessage, filter]);

  // Update filtered updates when updates or filter changes
  useEffect(() => {
    let filtered = updates;
    
    if (filter?.types) {
      filtered = filtered.filter(update => filter.types!.includes(update.type));
    }
    
    if (filter?.userId) {
      filtered = filtered.filter(update => update.userId === filter.userId);
    }
    
    setFilteredUpdates(filtered);
  }, [updates, filter]);

  return {
    ...ws,
    updates: filteredUpdates,
    allUpdates: updates
  };
}

export default useWebSocket;
