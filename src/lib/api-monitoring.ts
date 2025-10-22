import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance-monitor';
import * as Sentry from '@sentry/nextjs';

export interface ApiMonitoringOptions {
  trackPerformance?: boolean;
  trackErrors?: boolean;
  trackSlowRequests?: boolean;
  slowRequestThreshold?: number; // in milliseconds
  excludePaths?: string[];
}

export function withApiMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: ApiMonitoringOptions = {}
) {
  const {
    trackPerformance = true,
    trackErrors = true,
    trackSlowRequests = true,
    slowRequestThreshold = 1000,
    excludePaths = [],
  } = options;

  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const endpoint = req.nextUrl.pathname;
    const method = req.method;

    // Skip monitoring for excluded paths
    if (excludePaths.some(path => endpoint.includes(path))) {
      return handler(req);
    }

    try {
      // Execute the handler
      const response = await handler(req);
      const duration = Date.now() - startTime;

      // Track performance
      if (trackPerformance) {
        performanceMonitor.recordApiPerformance({
          endpoint,
          method,
          duration,
          statusCode: response.status,
          timestamp: new Date(),
        });
      }

      // Track slow requests
      if (trackSlowRequests && duration > slowRequestThreshold) {
        Sentry.addBreadcrumb({
          message: `Slow API request: ${method} ${endpoint}`,
          data: {
            duration,
            statusCode: response.status,
            threshold: slowRequestThreshold,
          },
          category: 'performance',
          level: 'warning',
        });
      }

      // Track errors
      if (trackErrors && response.status >= 400) {
        Sentry.addBreadcrumb({
          message: `API error: ${method} ${endpoint}`,
          data: {
            statusCode: response.status,
            duration,
          },
          category: 'api',
          level: 'error',
        });
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Track error performance
      if (trackPerformance) {
        performanceMonitor.recordApiPerformance({
          endpoint,
          method,
          duration,
          statusCode: 500,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Track errors
      if (trackErrors) {
        Sentry.captureException(error, {
          tags: {
            endpoint,
            method,
            duration,
          },
          extra: {
            url: req.url,
            userAgent: req.headers.get('user-agent'),
          },
        });
      }

      // Re-throw the error
      throw error;
    }
  };
}

// Utility function to wrap API routes
export function monitorApiRoute(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: ApiMonitoringOptions
) {
  return withApiMonitoring(handler, options);
}

// Middleware for automatic API monitoring
export function apiMonitoringMiddleware(req: NextRequest) {
  const startTime = Date.now();
  const endpoint = req.nextUrl.pathname;
  const method = req.method;

  // Add performance tracking headers
  const response = NextResponse.next();
  
  response.headers.set('X-Request-ID', `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  // Track the request start time
  (req as any).startTime = startTime;
  (req as any).endpoint = endpoint;
  (req as any).method = method;

  return response;
}

// Function to track custom metrics
export function trackCustomMetric(
  name: string,
  value: number,
  tags?: Record<string, string>
) {
  Sentry.addBreadcrumb({
    message: `Custom metric: ${name}`,
    data: {
      value,
      tags,
    },
    category: 'custom-metric',
    level: 'info',
  });
}

// Function to track business events
export function trackBusinessEvent(
  event: string,
  properties?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message: `Business event: ${event}`,
    data: properties,
    category: 'business',
    level: 'info',
  });
}

export default {
  withApiMonitoring,
  monitorApiRoute,
  apiMonitoringMiddleware,
  trackCustomMetric,
  trackBusinessEvent,
};
