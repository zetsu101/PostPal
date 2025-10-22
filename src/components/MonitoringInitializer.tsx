"use client";
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { analytics } from '@/lib/analytics';
import { performanceMonitor } from '@/lib/performance-monitor';

export default function MonitoringInitializer() {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize analytics
    analytics.initialize(user?.id);

    // Start performance monitoring
    performanceMonitor.startMonitoring();

    // Track page view
    analytics.trackPageView(window.location.pathname);

    // Track user identification if logged in
    if (user?.id) {
      analytics.setUser(user.id, {
        email: user.email,
        name: user.name,
      });
    }

    // Cleanup on unmount
    return () => {
      performanceMonitor.stopMonitoring();
      analytics.flush();
    };
  }, [user]);

  // Track page changes
  useEffect(() => {
    const handleRouteChange = () => {
      analytics.trackPageView(window.location.pathname);
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return null; // This component doesn't render anything
}
