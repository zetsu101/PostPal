import { useState, useEffect, useCallback, useRef } from 'react';
import { analyticsAPI, contentAPI, userAPI } from '@/lib/api';
import { localStorage, STORAGE_KEYS } from '@/lib/storage';

// Data loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'refreshing';

// Data management hook
export function useData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    persist?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    persist = true,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load data from cache or fetch fresh
  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(forceRefresh ? 'refreshing' : 'loading');
      setError(null);

      // Check cache first (unless forcing refresh)
      if (!forceRefresh && persist) {
        const cached = localStorage.get<T>(key);
        if (cached) {
          setData(cached);
          setLoading('success');
          setLastUpdated(new Date());
          onSuccess?.(cached);
          return;
        }
      }

      // Fetch fresh data
      const result = await fetcher();
      
      if (result) {
        setData(result);
        setLoading('success');
        setLastUpdated(new Date());
        
        // Cache the data
        if (persist) {
          localStorage.set(key, result, ttl);
        }
        
        onSuccess?.(result);
      } else {
        throw new Error('No data received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      setLoading('error');
      onError?.(errorMessage);
    }
  }, [key, fetcher, ttl, persist, onSuccess, onError]);

  // Refresh data
  const refresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  // Clear data and cache
  const clear = useCallback(() => {
    setData(null);
    setError(null);
    setLastUpdated(null);
    setLoading('idle');
    if (persist) {
      localStorage.remove(key);
    }
  }, [key, persist]);

  // Update data manually
  const update = useCallback((updates: Partial<T>) => {
    if (data) {
      const updatedData = { ...data, ...updates };
      setData(updatedData);
      if (persist) {
        localStorage.set(key, updatedData, ttl);
      }
    }
  }, [data, key, ttl, persist]);

  // Set up auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimeoutRef.current = setInterval(() => {
        loadData(true);
      }, refreshInterval);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadData]);

  // Initial load
  useEffect(() => {
    loadData();
    
    return () => {
      const controller = abortControllerRef.current;
      if (controller) {
        controller.abort();
      }
    };
  }, [loadData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    clear,
    update,
    isLoading: loading === 'loading',
    isRefreshing: loading === 'refreshing',
    isSuccess: loading === 'success',
    isError: loading === 'error',
  };
}

// Analytics data hook
export function useAnalytics(timeRange: string = '7d') {
  return useData(
    `${STORAGE_KEYS.ANALYTICS_DATA}_${timeRange}`,
    () => analyticsAPI.getDashboardAnalytics(timeRange).then(res => res.data),
    {
      ttl: 2 * 60 * 1000, // 2 minutes
      autoRefresh: true,
      refreshInterval: 2 * 60 * 1000, // 2 minutes
    }
  );
}

// Chart data hook
export function useChartData(days: number = 7) {
  return useData(
    `${STORAGE_KEYS.CHART_DATA}_${days}`,
    () => analyticsAPI.getChartData(days).then(res => res.data),
    {
      ttl: 2 * 60 * 1000, // 2 minutes
      autoRefresh: true,
      refreshInterval: 2 * 60 * 1000, // 2 minutes
    }
  );
}

// Platform performance hook
export function usePlatformPerformance() {
  return useData(
    STORAGE_KEYS.PLATFORM_DATA,
    () => analyticsAPI.getPlatformPerformance().then(res => res.data),
    {
      ttl: 5 * 60 * 1000, // 5 minutes
      autoRefresh: true,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// Top posts hook
export function useTopPosts(limit: number = 10) {
  return useData(
    `${STORAGE_KEYS.TOP_POSTS}_${limit}`,
    () => analyticsAPI.getTopPosts(limit).then(res => res.data),
    {
      ttl: 5 * 60 * 1000, // 5 minutes
      autoRefresh: true,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// User profile hook
export function useUserProfile() {
  return useData(
    STORAGE_KEYS.USER_PROFILE,
    () => userAPI.getProfile().then(res => res.data),
    {
      ttl: 10 * 60 * 1000, // 10 minutes
      autoRefresh: false,
    }
  );
}

// Saved posts hook
export function useSavedPosts(page: number = 1, limit: number = 20) {
  return useData(
    `${STORAGE_KEYS.SAVED_POSTS}_${page}_${limit}`,
    () => contentAPI.getSavedPosts(page, limit).then(res => res.data),
    {
      ttl: 5 * 60 * 1000, // 5 minutes
      autoRefresh: false,
    }
  );
}

// Content generation hook
export function useContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, options: Record<string, unknown> = {}) => {
    try {
      setIsGenerating(true);
      setError(null);

      const result = await contentAPI.generateContent(prompt, options);
      
      if (result.success && result.data) {
        setGeneratedContent(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to generate content');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearGenerated = useCallback(() => {
    setGeneratedContent([]);
    setError(null);
  }, []);

  return {
    generate,
    clearGenerated,
    isGenerating,
    generatedContent,
    error,
  };
}

// Real-time data hook with WebSocket support
export function useRealtimeData<T>(
  key: string,
  initialData: T,
  options: {
    wsUrl?: string;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
  } = {}
) {
  const { wsUrl, reconnectInterval = 5000, maxReconnectAttempts = 5 } = options;
  
  const [data, setData] = useState<T>(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!wsUrl) return;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setReconnectAttempts(0);
      };

      ws.onmessage = (event) => {
        try {
          const newData = JSON.parse(event.data);
          setData(newData);
          
          // Cache the updated data
          localStorage.set(key, newData);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
    }
  }, [wsUrl, reconnectAttempts, maxReconnectAttempts, reconnectInterval, key]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  const send = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, [isConnected]);

  useEffect(() => {
    if (wsUrl) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [wsUrl, connect, disconnect]);

  return {
    data,
    isConnected,
    reconnectAttempts,
    send,
    connect,
    disconnect,
  };
}

// Optimistic updates hook
export function useOptimisticUpdate<T>(
  key: string,
  initialData: T,
  updateFn: (data: T, updates: Partial<T>) => T
) {
  const [data, setData] = useState<T>(initialData);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<T>[]>([]);

  const update = useCallback((updates: Partial<T>) => {
    // Apply optimistic update immediately
    const optimisticData = updateFn(data, updates);
    setData(optimisticData);
    
    // Add to pending updates
    setPendingUpdates(prev => [...prev, updates]);
    
    // Cache the optimistic data
    localStorage.set(key, optimisticData);
  }, [data, updateFn, key]);

  const commitUpdate = useCallback((updates: Partial<T>) => {
    // Remove from pending updates
    setPendingUpdates(prev => prev.filter(update => update !== updates));
  }, []);

  const rollbackUpdate = useCallback((updates: Partial<T>) => {
    // Revert the optimistic update
    const revertedData = updateFn(data, updates);
    setData(revertedData);
    
    // Remove from pending updates
    setPendingUpdates(prev => prev.filter(update => update !== updates));
    
    // Cache the reverted data
    localStorage.set(key, revertedData);
  }, [data, updateFn, key]);

  return {
    data,
    pendingUpdates,
    update,
    commitUpdate,
    rollbackUpdate,
    hasPendingUpdates: pendingUpdates.length > 0,
  };
}
