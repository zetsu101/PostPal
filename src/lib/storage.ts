// Storage Layer for Data Persistence
export interface StorageItem<T = unknown> {
  data: T;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

export interface StorageConfig {
  prefix?: string;
  defaultTTL?: number;
  encryption?: boolean;
}

// Local Storage Manager
export class LocalStorageManager {
  private prefix: string;
  private defaultTTL: number;
  private encryption: boolean;

  constructor(config: StorageConfig = {}) {
    this.prefix = config.prefix || 'postpal_';
    this.defaultTTL = config.defaultTTL || 24 * 60 * 60 * 1000; // 24 hours
    this.encryption = config.encryption || false;
  }

  // Set item with TTL
  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const item: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.defaultTTL,
      };

      const serialized = this.encryption 
        ? this.encrypt(JSON.stringify(item))
        : JSON.stringify(item);

      window.localStorage.setItem(this.prefix + key, serialized);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  // Get item with TTL validation
  get<T>(key: string): T | null {
    try {
      const serialized = window.localStorage.getItem(this.prefix + key);
      if (!serialized) return null;

      const item: StorageItem<T> = this.encryption
        ? JSON.parse(this.decrypt(serialized))
        : JSON.parse(serialized);

      // Check if item has expired
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      this.remove(key);
      return null;
    }
  }

  // Remove item
  remove(key: string): void {
    try {
      window.localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  // Check if item exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Clear all items with prefix
  clear(): void {
    try {
      const keys = Object.keys(window.localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          window.localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  // Get all keys with prefix
  keys(): string[] {
    try {
      const keys = Object.keys(window.localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Failed to get localStorage keys:', error);
      return [];
    }
  }

  // Get storage size
  size(): number {
    try {
      return this.keys().length;
    } catch (error) {
      console.error('Failed to get storage size:', error);
      return 0;
    }
  }

  // Simple encryption (for development - use proper encryption in production)
  private encrypt(text: string): string {
    if (!this.encryption) return text;
    return btoa(text);
  }

  private decrypt(text: string): string {
    if (!this.encryption) return text;
    return atob(text);
  }
}

// Session Storage Manager
export class SessionStorageManager {
  private prefix: string;
  private defaultTTL: number;

  constructor(config: StorageConfig = {}) {
    this.prefix = config.prefix || 'postpal_session_';
    this.defaultTTL = config.defaultTTL || 60 * 60 * 1000; // 1 hour
  }

  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const item: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.defaultTTL,
      };

      window.sessionStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to save to sessionStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const serialized = window.sessionStorage.getItem(this.prefix + key);
      if (!serialized) return null;

      const item: StorageItem<T> = JSON.parse(serialized);

      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.remove(key);
        return null;
      }

      return item.data as T;
    } catch (error) {
      console.error('Failed to read from sessionStorage:', error);
      this.remove(key);
      return null;
    }
  }

  remove(key: string): void {
    try {
      window.sessionStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Failed to remove from sessionStorage:', error);
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    try {
      const keys = Object.keys(window.sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          window.sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
  }

  // Get all keys with prefix
  keys(): string[] {
    try {
      const keys = Object.keys(window.sessionStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Failed to get sessionStorage keys:', error);
      return [];
    }
  }

  // Get storage size
  size(): number {
    try {
      return this.keys().length;
    } catch (error) {
      console.error('Failed to get sessionStorage size:', error);
      return 0;
    }
  }
}

// Memory Cache Manager
export class MemoryCacheManager {
  private cache: Map<string, StorageItem>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const item: StorageItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  remove(key: string): void {
    this.cache.delete(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.ttl && now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Data Store for State Management
export class DataStore<T> {
  private storage: LocalStorageManager | SessionStorageManager | MemoryCacheManager;
  private key: string;
  private defaultValue: T;

  constructor(
    key: string,
    defaultValue: T,
    storage: LocalStorageManager | SessionStorageManager | MemoryCacheManager = new LocalStorageManager()
  ) {
    this.storage = storage;
    this.key = key;
    this.defaultValue = defaultValue;
  }

  // Get data with fallback to default
  get(): T {
    return this.storage.get(this.key) || this.defaultValue;
  }

  // Set data
  set(data: T): void {
    this.storage.set(this.key, data);
  }

  // Update data (merge with existing)
  update(updates: Partial<T>): void {
    const current = this.get();
    this.set({ ...current, ...updates });
  }

  // Reset to default
  reset(): void {
    this.storage.remove(this.key);
  }

  // Check if data exists
  has(): boolean {
    return this.storage.has(this.key);
  }
}

// Export default instances
export const localStorage = new LocalStorageManager();
export const sessionStorage = new SessionStorageManager();
export const memoryCache = new MemoryCacheManager();

// Common storage keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  ANALYTICS_DATA: 'analytics_data',
  CHART_DATA: 'chart_data',
  PLATFORM_DATA: 'platform_data',
  TOP_POSTS: 'top_posts',
  SAVED_POSTS: 'saved_posts',
  THEME_PREFERENCE: 'theme_preference',
  ONBOARDING_DATA: 'onboarding_data',
  RECENT_SEARCHES: 'recent_searches',
  NOTIFICATION_SETTINGS: 'notification_settings',
} as const;

// Utility functions
export const clearAllData = (): void => {
  localStorage.clear();
  sessionStorage.clear();
  memoryCache.clear();
};

export const getStorageStats = () => ({
  localStorage: localStorage.size(),
  sessionStorage: sessionStorage.size(),
  memoryCache: memoryCache.size(),
});

// Auto-cleanup expired items
setInterval(() => {
  memoryCache.cleanup();
}, 60000); // Clean every minute
