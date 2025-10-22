// WebSocket Configuration for PostPal
// Environment variables and configuration settings

export const WEBSOCKET_CONFIG = {
  // Server Configuration
  PORT: process.env.WEBSOCKET_PORT || 8080,
  PATH: process.env.WEBSOCKET_PATH || '/ws/insights',
  URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080',
  
  // Security Settings
  CORS_ORIGINS: process.env.WEBSOCKET_CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://postpal.app'
  ],
  MAX_CONNECTIONS: parseInt(process.env.WEBSOCKET_MAX_CONNECTIONS || '1000'),
  
  // Connection Management
  HEARTBEAT_INTERVAL: parseInt(process.env.WEBSOCKET_HEARTBEAT_INTERVAL || '30000'),
  RECONNECT_DELAY: parseInt(process.env.WEBSOCKET_RECONNECT_DELAY || '5000'),
  MAX_RECONNECT_ATTEMPTS: parseInt(process.env.WEBSOCKET_MAX_RECONNECT_ATTEMPTS || '5'),
  
  // Authentication
  AUTH_TIMEOUT: parseInt(process.env.WEBSOCKET_AUTH_TIMEOUT || '10000'),
  TOKEN_EXPIRY_CHECK: process.env.WEBSOCKET_TOKEN_EXPIRY_CHECK === 'true',
  
  // Monitoring & Logging
  ENABLE_LOGGING: process.env.WEBSOCKET_ENABLE_LOGGING === 'true',
  LOG_LEVEL: process.env.WEBSOCKET_LOG_LEVEL || 'info',
  METRICS_ENABLED: process.env.WEBSOCKET_METRICS_ENABLED === 'true',
  
  // Production Settings
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  SSL_ENABLED: process.env.WEBSOCKET_SSL_ENABLED === 'true',
  
  // Rate Limiting
  RATE_LIMIT_ENABLED: process.env.WEBSOCKET_RATE_LIMIT_ENABLED === 'true',
  RATE_LIMIT_WINDOW: parseInt(process.env.WEBSOCKET_RATE_LIMIT_WINDOW || '60000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.WEBSOCKET_RATE_LIMIT_MAX_REQUESTS || '100'),
};

// WebSocket Message Types
export const WEBSOCKET_MESSAGE_TYPES = {
  // Connection Management
  CONNECTION_ESTABLISHED: 'connection_established',
  CONNECTION_CLOSED: 'connection_closed',
  PING: 'ping',
  PONG: 'pong',
  
  // Subscription Management
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  SUBSCRIPTION_CONFIRMED: 'subscription_confirmed',
  UNSUBSCRIPTION_CONFIRMED: 'unsubscription_confirmed',
  
  // Status & Monitoring
  GET_STATUS: 'get_status',
  STATUS_RESPONSE: 'status_response',
  HEARTBEAT: 'heartbeat',
  
  // AI Insights Updates
  INSIGHT_UPDATE: 'insight_update',
  CONTENT_ANALYSIS: 'content_analysis',
  ENGAGEMENT_PREDICTION: 'engagement_prediction',
  TREND_UPDATE: 'trend_update',
  AUDIENCE_INSIGHT: 'audience_insight',
  PERFORMANCE_METRIC: 'performance_metric',
  
  // Error Handling
  ERROR: 'error',
  WARNING: 'warning',
  NOTIFICATION: 'notification',
  
  // Custom Messages
  CUSTOM_MESSAGE: 'custom_message',
  TEST_MESSAGE: 'test_message',
};

// WebSocket Subscription Topics
export const WEBSOCKET_TOPICS = {
  CONTENT_ANALYSIS: 'content_analysis',
  ENGAGEMENT_PREDICTION: 'engagement_prediction',
  TREND_UPDATE: 'trend_update',
  AUDIENCE_INSIGHT: 'audience_insight',
  PERFORMANCE_METRIC: 'performance_metric',
  HIGH_PRIORITY_ONLY: 'high_priority_only',
  ALL_UPDATES: 'all_updates',
};

// WebSocket Priority Levels
export const WEBSOCKET_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// WebSocket Error Codes
export const WEBSOCKET_ERROR_CODES = {
  AUTHENTICATION_FAILED: 1001,
  INVALID_TOKEN: 1002,
  TOKEN_EXPIRED: 1003,
  RATE_LIMIT_EXCEEDED: 1004,
  INVALID_MESSAGE_FORMAT: 1005,
  SUBSCRIPTION_FAILED: 1006,
  SERVER_ERROR: 1007,
  MAINTENANCE_MODE: 1008,
};

// WebSocket Client States
export const WEBSOCKET_CLIENT_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
};

// Helper function to get WebSocket URL based on environment
export function getWebSocketURL(): string {
  if (WEBSOCKET_CONFIG.IS_PRODUCTION) {
    return process.env.NEXT_PUBLIC_WEBSOCKET_URL_PROD || 'wss://ws.postpal.app';
  }
  return WEBSOCKET_CONFIG.URL;
}

// Helper function to validate WebSocket configuration
export function validateWebSocketConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!WEBSOCKET_CONFIG.URL) {
    errors.push('WebSocket URL is required');
  }
  
  if (WEBSOCKET_CONFIG.MAX_CONNECTIONS <= 0) {
    errors.push('Max connections must be greater than 0');
  }
  
  if (WEBSOCKET_CONFIG.HEARTBEAT_INTERVAL <= 0) {
    errors.push('Heartbeat interval must be greater than 0');
  }
  
  if (WEBSOCKET_CONFIG.RECONNECT_DELAY <= 0) {
    errors.push('Reconnect delay must be greater than 0');
  }
  
  if (WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS < 0) {
    errors.push('Max reconnect attempts cannot be negative');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Helper function to create WebSocket connection URL with token
export function createWebSocketURL(token: string): string {
  const baseURL = getWebSocketURL();
  const url = new URL(baseURL);
  url.searchParams.set('token', token);
  return url.toString();
}

// Helper function to check if WebSocket is supported
export function isWebSocketSupported(): boolean {
  return typeof WebSocket !== 'undefined';
}

// Helper function to get WebSocket connection status
export function getWebSocketStatus(ws: WebSocket | null): string {
  if (!ws) return WEBSOCKET_CLIENT_STATES.DISCONNECTED;
  
  switch (ws.readyState) {
    case WebSocket.CONNECTING:
      return WEBSOCKET_CLIENT_STATES.CONNECTING;
    case WebSocket.OPEN:
      return WEBSOCKET_CLIENT_STATES.CONNECTED;
    case WebSocket.CLOSING:
      return WEBSOCKET_CLIENT_STATES.DISCONNECTED;
    case WebSocket.CLOSED:
      return WEBSOCKET_CLIENT_STATES.DISCONNECTED;
    default:
      return WEBSOCKET_CLIENT_STATES.ERROR;
  }
}

export default WEBSOCKET_CONFIG;
