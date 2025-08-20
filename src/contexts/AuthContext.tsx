"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials, 
  AuthTokens,
  authService,
  TokenManager 
} from '@/lib/auth-provider';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  initiateOAuth: (provider: 'google' | 'github' | 'twitter') => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    token: null,
    refreshToken: null,
  });

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Check for existing tokens
        const accessToken = TokenManager.getAccessToken();
        const refreshToken = TokenManager.getRefreshToken();

        if (accessToken && refreshToken) {
          // Validate existing session
          const user = await authService.getCurrentUser(accessToken);
          if (user) {
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              token: accessToken,
              refreshToken,
            });
            return;
          }
        }

        // No valid session found
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          token: null,
          refreshToken: null,
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize authentication',
          token: null,
          refreshToken: null,
        });
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token when it expires
  useEffect(() => {
    if (!state.isAuthenticated || !state.token) return;

    const checkTokenExpiry = async () => {
      if (TokenManager.isTokenExpired()) {
        try {
          const tokens = await authService.refreshToken();
          const user = await authService.getCurrentUser();
          
          setState(prev => ({
            ...prev,
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          }));
        } catch (error) {
          console.error('Token refresh failed:', error);
          await logout();
        }
      }
    };

    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.token]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { user, tokens } = await authService.login(credentials);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [router]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { user, tokens } = await authService.register(credentials);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      // Redirect to onboarding after successful registration
      router.push('/onboarding');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      await authService.logout();

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        token: null,
        refreshToken: null,
      });

      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        token: null,
        refreshToken: null,
      });
      router.push('/login');
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      if (!state.isAuthenticated) return;

      const user = await authService.getCurrentUser();
      setState(prev => ({ ...prev, user }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If user refresh fails, they might be logged out
      await logout();
    }
  }, [state.isAuthenticated, logout]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const updatedUser = await authService.updateProfile(updates);

      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await authService.changePassword(currentPassword, newPassword);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await authService.forgotPassword(email);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await authService.resetPassword(token, newPassword);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const initiateOAuth = useCallback((provider: 'google' | 'github' | 'twitter') => {
    try {
      const oauthUrl = authService.getOAuthUrl(provider);
      window.location.href = oauthUrl;
    } catch (error) {
      console.error(`OAuth ${provider} initiation failed:`, error);
      setState(prev => ({
        ...prev,
        error: `Failed to initiate ${provider} authentication`,
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    initiateOAuth,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protecting routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: { requireAuth?: boolean; redirectTo?: string } = {}
) => {
  const { requireAuth = true, redirectTo = '/login' } = options;

  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && requireAuth && !isAuthenticated) {
        router.push(redirectTo);
      }
    }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (requireAuth && !isAuthenticated) {
      return null; // Will redirect
    }

    return <Component {...props} />;
  };
};

// Hook for checking if user has specific role
export const useAuthRole = (requiredRole: User['role']) => {
  const { user } = useAuth();
  return user?.role === requiredRole;
};

// Hook for checking if user has permission
export const useAuthPermission = (permission: string) => {
  const { user } = useAuth();
  
  // Simple permission system - can be expanded
  const permissions: Record<string, User['role'][]> = {
    'admin:all': ['admin'],
    'moderator:content': ['admin', 'moderator'],
    'user:profile': ['admin', 'moderator', 'user'],
  };

  const requiredRoles = permissions[permission] || [];
  return requiredRoles.includes(user?.role || 'user');
};
