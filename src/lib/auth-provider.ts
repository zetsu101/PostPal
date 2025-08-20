// Authentication Provider System
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  provider: 'email' | 'google' | 'github' | 'twitter';
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
  role: 'user' | 'admin' | 'moderator';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
}

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// OAuth Provider Configurations
export const OAUTH_CONFIGS = {
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/google`,
    scope: 'openid email profile',
    authUrl: 'https://accounts.google.com/oauth/authorize',
    tokenUrl: 'https://oauth2.googleapis.com/token',
  },
  github: {
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'your-github-client-id',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/github`,
    scope: 'user:email read:user',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
  },
  twitter: {
    clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || 'your-twitter-client-id',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/twitter`,
    scope: 'tweet.read users.read offline.access',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
  },
} as const;

// JWT Token Management
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'postpal_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'postpal_refresh_token';
  private static readonly TOKEN_EXPIRY_KEY = 'postpal_token_expiry';

  static setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    
    const expiry = Date.now() + (tokens.expiresIn * 1000);
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
  }

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true;
    
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    return Date.now() > parseInt(expiry);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Authentication Service
export class AuthService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.postpal.app';
  private static readonly API_VERSION = 'v1';

  // Email/Password Authentication
  static async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await fetch(`${this.API_BASE}/${this.API_VERSION}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    TokenManager.setTokens(data.tokens);
    return data;
  }

  static async register(credentials: RegisterCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await fetch(`${this.API_BASE}/${this.API_VERSION}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    TokenManager.setTokens(data.tokens);
    return data;
  }

  static async logout(): Promise<void> {
    try {
      const token = TokenManager.getAccessToken();
      if (token) {
        await fetch(`${this.API_BASE}/${this.API_VERSION}/auth/logout`, {
          method: 'POST',
          headers: { ...TokenManager.getAuthHeaders() },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      TokenManager.clearTokens();
    }
  }

  static async refreshToken(): Promise<AuthTokens> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.API_BASE}/${this.API_VERSION}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const tokens = await response.json();
    TokenManager.setTokens(tokens);
    return tokens;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.API_BASE}/${this.API_VERSION}/auth/me`, {
      headers: { ...TokenManager.getAuthHeaders() },
    });

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    return response.json();
  }

  static async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await fetch(`${this.API_BASE}/${this.API_VERSION}/auth/profile`, {
      method: 'PUT',
      headers: { ...TokenManager.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Profile update failed');
    }

    return response.json();
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${this.API_BASE}/${this.API_VERSION}/auth/change-password`, {
      method: 'POST',
      headers: { ...TokenManager.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password change failed');
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${this.API_BASE}/${this.API_VERSION}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset failed');
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${this.API_BASE}/${this.API_VERSION}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset failed');
    }
  }

  // OAuth Authentication
  static getOAuthUrl(provider: keyof typeof OAUTH_CONFIGS): string {
    const config = OAUTH_CONFIGS[provider];
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      response_type: 'code',
      state: this.generateState(),
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  static async handleOAuthCallback(
    provider: keyof typeof OAUTH_CONFIGS,
    code: string,
    state: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    // Verify state parameter for security
    if (!this.verifyState(state)) {
      throw new Error('Invalid state parameter');
    }

    const response = await fetch(`${this.API_BASE}/${this.API_VERSION}/auth/${provider}/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `${provider} authentication failed`);
    }

    const data = await response.json();
    TokenManager.setTokens(data.tokens);
    return data;
  }

  // Security utilities
  private static generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private static verifyState(state: string): boolean {
    // In a real app, you'd store and verify the state parameter
    // For now, we'll just check if it exists and has the right format
    return Boolean(state && state.length === 64);
  }

  // Token validation
  static async validateToken(): Promise<boolean> {
    try {
      if (TokenManager.isTokenExpired()) {
        await this.refreshToken();
      }
      
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  // Session management
  static async checkSession(): Promise<User | null> {
    try {
      if (!TokenManager.getAccessToken()) {
        return null;
      }

      if (TokenManager.isTokenExpired()) {
        await this.refreshToken();
      }

      return await this.getCurrentUser();
    } catch (error) {
      TokenManager.clearTokens();
      return null;
    }
  }
}

// Mock authentication for development
export class MockAuthService {
  private static users: Map<string, User> = new Map();
  private static sessions: Map<string, { user: User; expiresAt: number }> = new Map();

  static async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock user validation
    if (credentials.email === 'demo@postpal.app' && credentials.password === 'demo123') {
      const user: User = {
        id: '1',
        email: credentials.email,
        name: 'Demo User',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        emailVerified: true,
        provider: 'email',
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date(),
        isActive: true,
        role: 'user',
      };

      const tokens: AuthTokens = {
        accessToken: this.generateMockToken(),
        refreshToken: this.generateMockToken(),
        expiresIn: 3600,
        tokenType: 'Bearer',
      };

      this.users.set(user.id, user);
      this.sessions.set(tokens.accessToken, { user, expiresAt: Date.now() + 3600000 });

      return { user, tokens };
    }

    throw new Error('Invalid credentials');
  }

  static async register(credentials: RegisterCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user: User = {
      id: Date.now().toString(),
      email: credentials.email,
      name: credentials.name,
      avatar: undefined,
      emailVerified: false,
      provider: 'email',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
      role: 'user',
    };

    const tokens: AuthTokens = {
      accessToken: this.generateMockToken(),
      refreshToken: this.generateMockToken(),
      expiresIn: 3600,
      tokenType: 'Bearer',
    };

    this.users.set(user.id, user);
    this.sessions.set(tokens.accessToken, { user, expiresAt: Date.now() + 3600000 });

    return { user, tokens };
  }



  static async logout(): Promise<void> {
    // Clear all sessions for mock service
    this.sessions.clear();
  }

  static async refreshToken(): Promise<AuthTokens> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const tokens: AuthTokens = {
      accessToken: this.generateMockToken(),
      refreshToken: this.generateMockToken(),
      expiresIn: 3600,
      tokenType: 'Bearer',
    };

    return tokens;
  }

  static async getCurrentUser(token?: string): Promise<User> {
    // For compatibility with the real service
    const accessToken = token || TokenManager.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const session = this.sessions.get(accessToken);
    if (!session || Date.now() > session.expiresAt) {
      throw new Error('User not found');
    }

    return session.user;
  }

  static async updateProfile(updates: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const token = TokenManager.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const currentUser = await this.getCurrentUser(token);
    if (!currentUser) {
      throw new Error('User not found');
    }

    const updatedUser = { ...currentUser, ...updates };
    this.users.set(currentUser.id, updatedUser);
    
    return updatedUser;
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock implementation - in real app would validate current password
  }

  static async forgotPassword(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock implementation - in real app would send reset email
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock implementation - in real app would validate reset token
  }

  static getOAuthUrl(provider: 'google' | 'github' | 'twitter'): string {
    // Mock OAuth URLs
    return `https://mock-oauth.com/${provider}?client_id=mock&redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback/${provider}`;
  }

  static async handleOAuthCallback(
    provider: 'google' | 'github' | 'twitter',
    code: string,
    state: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user: User = {
      id: Date.now().toString(),
      email: `user@${provider}.com`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      avatar: undefined,
      emailVerified: true,
      provider,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
      role: 'user',
    };

    const tokens: AuthTokens = {
      accessToken: this.generateMockToken(),
      refreshToken: this.generateMockToken(),
      expiresIn: 3600,
      tokenType: 'Bearer',
    };

    this.users.set(user.id, user);
    this.sessions.set(tokens.accessToken, { user, expiresAt: Date.now() + 3600000 });

    return { user, tokens };
  }

  private static generateMockToken(): string {
    return 'mock_token_' + Math.random().toString(36).substr(2, 9);
  }
}

// Export the appropriate service based on environment
export const authService = process.env.NODE_ENV === 'production' 
  ? AuthService 
  : MockAuthService;
