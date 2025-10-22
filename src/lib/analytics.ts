import * as Sentry from '@sentry/nextjs';

export interface UserEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: Date;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  tags?: Record<string, string>;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  pageViews: number;
  events: UserEvent[];
  userAgent?: string;
  referrer?: string;
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private session: UserSession;
  private eventQueue: UserEvent[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.session = {
      sessionId: this.sessionId,
      startTime: new Date(),
      lastActivity: new Date(),
      pageViews: 0,
      events: [],
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
    };
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  public initialize(userId?: string) {
    this.userId = userId;
    this.session.userId = userId;
    this.isInitialized = true;

    // Set user context in Sentry
    if (userId) {
      Sentry.setUser({ id: userId });
    }

    // Track page load performance
    if (typeof window !== 'undefined') {
      this.trackPageLoad();
      this.trackWebVitals();
    }

    console.log('Analytics initialized', { sessionId: this.sessionId, userId });
  }

  public track(event: string, properties?: Record<string, any>) {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized');
      return;
    }

    const userEvent: UserEvent = {
      event,
      properties,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
    };

    this.session.events.push(userEvent);
    this.session.lastActivity = new Date();
    this.eventQueue.push(userEvent);

    // Send to Sentry as breadcrumb
    Sentry.addBreadcrumb({
      message: event,
      data: properties,
      category: 'user-action',
      level: 'info',
    });

    // Send to analytics endpoint
    this.sendEvent(userEvent);

    console.log('Event tracked:', event, properties);
  }

  public trackPageView(page: string, properties?: Record<string, any>) {
    this.session.pageViews++;
    
    this.track('page_view', {
      page,
      pageViews: this.session.pageViews,
      ...properties,
    });

    // Set Sentry context
    Sentry.setContext('page', {
      page,
      pageViews: this.session.pageViews,
    });
  }

  public trackError(error: Error, context?: Record<string, any>) {
    // Send to Sentry
    Sentry.captureException(error, {
      tags: {
        component: context?.component || 'unknown',
      },
      extra: context,
    });

    // Track as custom event
    this.track('error', {
      error: error.message,
      stack: error.stack,
      ...context,
    });
  }

  public trackPerformance(metric: PerformanceMetric) {
    this.performanceMetrics.push(metric);

    // Send to Sentry
    Sentry.addBreadcrumb({
      message: `Performance: ${metric.name}`,
      data: {
        value: metric.value,
        unit: metric.unit,
        tags: metric.tags,
      },
      category: 'performance',
      level: 'info',
    });

    console.log('Performance metric:', metric);
  }

  public setUser(userId: string, properties?: Record<string, any>) {
    this.userId = userId;
    this.session.userId = userId;

    // Set user context in Sentry
    Sentry.setUser({
      id: userId,
      ...properties,
    });

    this.track('user_identified', { userId, ...properties });
  }

  public trackConversion(event: string, value?: number, currency?: string) {
    this.track('conversion', {
      event,
      value,
      currency,
    });

    // Send to Sentry as transaction
    Sentry.addBreadcrumb({
      message: `Conversion: ${event}`,
      data: { value, currency },
      category: 'conversion',
      level: 'info',
    });
  }

  private trackPageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.trackPerformance({
          name: 'page_load_time',
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: 'ms',
        });

        this.trackPerformance({
          name: 'dom_content_loaded',
          value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          unit: 'ms',
        });

        this.trackPerformance({
          name: 'first_paint',
          value: navigation.responseEnd - navigation.fetchStart,
          unit: 'ms',
        });
      }
    });
  }

  private trackWebVitals() {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          this.trackPerformance({
            name: 'largest_contentful_paint',
            value: entry.startTime,
            unit: 'ms',
          });
        } else if (entry.entryType === 'first-input') {
          this.trackPerformance({
            name: 'first_input_delay',
            value: (entry as any).processingStart - entry.startTime,
            unit: 'ms',
          });
        } else if (entry.entryType === 'layout-shift') {
          this.trackPerformance({
            name: 'cumulative_layout_shift',
            value: (entry as any).value,
            unit: 'count',
          });
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  }

  private async sendEvent(event: UserEvent) {
    try {
      // In a real implementation, you would send this to your analytics service
      // For now, we'll just log it and send to Sentry
      console.log('Sending event to analytics service:', event);
      
      // You could send to services like:
      // - Google Analytics
      // - Mixpanel
      // - Amplitude
      // - Custom analytics API
      
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  public getSession(): UserSession {
    return { ...this.session };
  }

  public getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }

  public flush() {
    // Send all queued events
    this.eventQueue.forEach(event => this.sendEvent(event));
    this.eventQueue = [];
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// Export for use in components
export default analytics;