import { supabase } from './supabase';
import { DatabaseService } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

// Enhanced authentication types that match our database schema
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_plan: 'free' | 'pro' | 'enterprise';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  notification_preferences?: any;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
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
  avatar_url?: string;
  notification_preferences?: any;
}

// Enhanced authentication service using Supabase Auth
export class SupabaseAuthService {
  private static instance: SupabaseAuthService;
  private currentUser: AuthUser | null = null;
  private currentSession: Session | null = null;

  static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService();
    }
    return SupabaseAuthService.instance;
  }

  constructor() {
    this.initializeAuth();
  }

  // Initialize auth state and listen for changes
  private async initializeAuth() {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    this.currentSession = session;

    if (session?.user) {
      await this.loadUserProfile(session.user.id);
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      this.currentSession = session;

      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      } else {
        this.currentUser = null;
      }
    });
  }

  // Load user profile from our users table
  private async loadUserProfile(userId: string): Promise<void> {
    try {
      const userData = await DatabaseService.getUser(userId);
      this.currentUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatar_url: userData.avatar_url,
        subscription_plan: userData.subscription_plan as 'free' | 'pro' | 'enterprise',
        stripe_customer_id: userData.stripe_customer_id,
        stripe_subscription_id: userData.stripe_subscription_id,
        subscription_status: userData.subscription_status as any,
        notification_preferences: userData.notification_preferences,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      };
    } catch (error) {
      console.error('Error loading user profile:', error);
      // If user doesn't exist in our users table, create them
      if (this.currentSession?.user) {
        await this.createUserProfile(this.currentSession.user);
      }
    }
  }

  // Create user profile in our users table after Supabase auth signup
  private async createUserProfile(supabaseUser: User): Promise<void> {
    try {
      const userData = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email!.split('@')[0],
        avatar_url: supabaseUser.user_metadata?.avatar_url,
        subscription_plan: 'free' as const,
        subscription_status: 'active' as const,
        notification_preferences: {
          email: true,
          postScheduled: true,
          postPublished: false,
          postFailed: true,
          analyticsSummary: true,
          paymentNotifications: true,
          weeklyDigest: true,
        },
      };

      await DatabaseService.createUser(userData);
      await this.loadUserProfile(supabaseUser.id);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }

  // Get current auth state
  getAuthState(): AuthState {
    return {
      user: this.currentUser,
      session: this.currentSession,
      isAuthenticated: this.currentUser !== null && this.currentSession !== null,
      isLoading: false,
      error: null,
    };
  }

  // Sign in with email and password
  async signIn(credentials: LoginCredentials): Promise<AuthState> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: error.message,
        };
      }

      // Load user profile after successful auth
      if (data.user) {
        await this.loadUserProfile(data.user.id);
      }

      return {
        user: this.currentUser,
        session: this.currentSession,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      };
    }
  }

  // Sign up new user
  async signUp(data: SignupData): Promise<AuthState> {
    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        return {
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Passwords do not match',
        };
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      });

      if (error) {
        return {
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: error.message,
        };
      }

      // User profile will be created in the auth state change listener
      return {
        user: this.currentUser,
        session: this.currentSession,
        isAuthenticated: authData.user !== null && authData.session !== null,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      };
    }
  }

  // Sign out
  async signOut(): Promise<AuthState> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          user: this.currentUser,
          session: this.currentSession,
          isAuthenticated: this.isAuthenticated(),
          isLoading: false,
          error: error.message,
        };
      }

      this.currentUser = null;
      this.currentSession = null;

      return {
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      return {
        user: this.currentUser,
        session: this.currentSession,
        isAuthenticated: this.isAuthenticated(),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign out failed',
      };
    }
  }

  // Reset password
  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

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
        return {
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'User not authenticated',
        };
      }

      // Update in database
      const updatedUser = await DatabaseService.updateUser(this.currentUser.id, data);

      // Update current user
      this.currentUser = {
        ...this.currentUser,
        ...updatedUser,
      };

      // Update Supabase auth user metadata if name changed
      if (data.name) {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: data.name }
        });

        if (error) {
          console.error('Error updating auth metadata:', error);
        }
      }

      return {
        user: this.currentUser,
        session: this.currentSession,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      return {
        user: this.currentUser,
        session: this.currentSession,
        isAuthenticated: this.isAuthenticated(),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Profile update failed',
      };
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Get current session
  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentSession !== null;
  }

  // Get access token for API calls
  getAccessToken(): string | null {
    return this.currentSession?.access_token || null;
  }
}

// Export singleton instance
export const supabaseAuthService = SupabaseAuthService.getInstance();
