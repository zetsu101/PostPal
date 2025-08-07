import React from 'react';

// Authentication and User Management System
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: {
    plan: 'free' | 'pro' | 'business' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    startDate: string;
    endDate?: string;
  };
  settings: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    timezone: string;
  };
  createdAt: string;
  lastLogin: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdateProfileData {
  name?: string;
  avatar?: string;
  settings?: Partial<User['settings']>;
}

// Mock user database (in real app, this would be a database)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@postpal.com',
    name: 'Demo User',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    subscription: {
      plan: 'pro',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    },
    settings: {
      theme: 'light',
      notifications: true,
      timezone: 'America/New_York',
    },
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
];

class AuthManager {
  private static instance: AuthManager;
  private currentUser: User | null = null;
  private token: string | null = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Initialize auth state from localStorage
  init(): AuthState {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    }
    
    const token = localStorage.getItem('postpal_token');
    const userData = localStorage.getItem('postpal_user');
    
    if (token && userData) {
      try {
        this.token = token;
        this.currentUser = JSON.parse(userData);
        return {
          user: this.currentUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
      } catch (error) {
        this.logout();
      }
    }

    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthState> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user in mock database
      const user = mockUsers.find(u => u.email === credentials.email);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // In real app, verify password hash here
      if (credentials.password !== 'demo123') {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token (mock)
      const token = this.generateToken(user);
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('postpal_token', token);
        localStorage.setItem('postpal_user', JSON.stringify(user));
      }
      
      this.token = token;
      this.currentUser = user;

      return {
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  // Signup new user
  async signup(data: SignupData): Promise<AuthState> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Check if user already exists
      if (mockUsers.find(u => u.email === data.email)) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser: User = {
        id: (mockUsers.length + 1).toString(),
        email: data.email,
        name: data.name,
        subscription: {
          plan: 'free',
          status: 'active',
          startDate: new Date().toISOString(),
        },
        settings: {
          theme: 'light',
          notifications: true,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      // Add to mock database
      mockUsers.push(newUser);

      // Generate token and login
      const token = this.generateToken(newUser);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('postpal_token', token);
        localStorage.setItem('postpal_user', JSON.stringify(newUser));
      }
      
      this.token = token;
      this.currentUser = newUser;

      return {
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
    }
  }

  // Logout user
  logout(): AuthState {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('postpal_token');
      localStorage.removeItem('postpal_user');
    }
    
    this.token = null;
    this.currentUser = null;

    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }

  // Reset password
  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = mockUsers.find(u => u.email === data.email);
      if (!user) {
        throw new Error('No account found with this email');
      }

      // In real app, send reset email here
      console.log(`Password reset email sent to ${data.email}`);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      };
    }
  }

  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<AuthState> {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Update user data
      const updatedUser = {
        ...this.currentUser,
        ...(data.name && { name: data.name }),
        ...(data.avatar && { avatar: data.avatar }),
        ...(data.settings && { settings: { ...this.currentUser.settings, ...data.settings } }),
      };

      // Update in mock database
      const userIndex = mockUsers.findIndex(u => u.id === this.currentUser!.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = updatedUser;
      }

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('postpal_user', JSON.stringify(updatedUser));
      }
      
      this.currentUser = updatedUser;

      return {
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      return {
        user: this.currentUser,
        isAuthenticated: true,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Profile update failed',
      };
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get auth token
  getToken(): string | null {
    return this.token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }

  // Generate mock JWT token
  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };
    
    // In real app, this would be signed with a secret key
    return btoa(JSON.stringify(payload));
  }

  // Verify token (mock)
  verifyToken(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }
}

export const authManager = AuthManager.getInstance();

// React hook for authentication
export const useAuth = () => {
  const [authState, setAuthState] = React.useState<AuthState>(() => authManager.init());

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await authManager.login(credentials);
    setAuthState(result);
    return result;
  };

  const signup = async (data: SignupData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await authManager.signup(data);
    setAuthState(result);
    return result;
  };

  const logout = () => {
    const result = authManager.logout();
    setAuthState(result);
    return result;
  };

  const resetPassword = async (data: ResetPasswordData) => {
    return await authManager.resetPassword(data);
  };

  const updateProfile = async (data: UpdateProfileData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await authManager.updateProfile(data);
    setAuthState(result);
    return result;
  };

  return {
    ...authState,
    login,
    signup,
    logout,
    resetPassword,
    updateProfile,
  };
}; 