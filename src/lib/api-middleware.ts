import { NextRequest, NextResponse } from 'next/server';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

// Rate limiting configurations
export const rateLimitConfigs = {
  // General API rate limit
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Strict rate limit for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 auth requests per windowMs
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // AI endpoints rate limit
  ai: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 AI requests per minute
    message: {
      error: 'AI rate limit exceeded, please slow down.',
      retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Social media posting rate limit
  social: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // Limit each IP to 20 social media requests per 5 minutes
    message: {
      error: 'Social media posting rate limit exceeded.',
      retryAfter: '5 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
};

// Validation schemas using Zod
export const validationSchemas = {
  // User validation
  user: z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),

  // Post content validation
  postContent: z.object({
    text: z.string().min(1, 'Content cannot be empty').max(2000, 'Content too long'),
    imageUrl: z.string().url().optional(),
    videoUrl: z.string().url().optional(),
    link: z.string().url().optional(),
    hashtags: z.array(z.string()).max(30, 'Too many hashtags'),
    platforms: z.array(z.enum(['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok'])),
  }),

  // Social media credentials validation
  socialCredentials: z.object({
    platform: z.enum(['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok']),
    accessToken: z.string().min(1, 'Access token required'),
    refreshToken: z.string().optional(),
    expiresAt: z.string().datetime().optional(),
    config: z.record(z.any()).optional(),
  }),

  // Email validation
  emailData: z.object({
    to: z.string().email('Invalid recipient email'),
    template: z.enum([
      'welcome',
      'payment-confirmation',
      'payment-failed',
      'subscription-cancelled',
      'post-scheduled',
      'post-published',
      'post-failed',
      'analytics-summary',
      'password-reset',
      'account-verification',
    ]),
    data: z.record(z.any()).optional(),
  }),

  // AI analysis validation
  aiAnalysis: z.object({
    content: z.string().min(1, 'Content required for analysis'),
    platform: z.enum(['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok']),
    targetAudience: z.string().optional(),
  }),

  // Pagination validation
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};

// API Response helpers
export class APIResponse {
  static success(data: any, message?: string, statusCode = 200) {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    }, { status: statusCode });
  }

  static error(message: string, statusCode = 400, details?: any) {
    return NextResponse.json({
      success: false,
      error: {
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    }, { status: statusCode });
  }

  static validationError(errors: any) {
    return NextResponse.json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors,
        timestamp: new Date().toISOString(),
      },
    }, { status: 422 });
  }

  static unauthorized(message = 'Unauthorized access') {
    return NextResponse.json({
      success: false,
      error: {
        message,
        timestamp: new Date().toISOString(),
      },
    }, { status: 401 });
  }

  static forbidden(message = 'Forbidden access') {
    return NextResponse.json({
      success: false,
      error: {
        message,
        timestamp: new Date().toISOString(),
      },
    }, { status: 403 });
  }

  static notFound(message = 'Resource not found') {
    return NextResponse.json({
      success: false,
      error: {
        message,
        timestamp: new Date().toISOString(),
      },
    }, { status: 404 });
  }

  static rateLimited(message = 'Rate limit exceeded') {
    return NextResponse.json({
      success: false,
      error: {
        message,
        timestamp: new Date().toISOString(),
      },
    }, { status: 429 });
  }

  static serverError(message = 'Internal server error', details?: any) {
    return NextResponse.json({
      success: false,
      error: {
        message,
        details: process.env.NODE_ENV === 'development' ? details : undefined,
        timestamp: new Date().toISOString(),
      },
    }, { status: 500 });
  }
}

// Validation middleware factory
export function createValidationMiddleware(schema: z.ZodSchema) {
  return (request: NextRequest) => {
    try {
      const body = request.body ? JSON.parse(request.body as string) : {};
      const validatedData = schema.parse(body);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        };
      }
      return {
        success: false,
        errors: [{ field: 'general', message: 'Invalid request data' }],
      };
    }
  };
}

// Authentication middleware
export function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);
  
  // In a real app, you would verify the JWT token here
  // For now, we'll do a basic check
  if (!token || token.length < 10) {
    return { success: false, error: 'Invalid token' };
  }

  return { success: true, token };
}

// API key validation middleware
export function requireApiKey(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  
  if (!apiKey) {
    return { success: false, error: 'API key required' };
  }

  // In a real app, you would validate the API key against your database
  const validApiKey = process.env.API_KEY;
  
  if (!validApiKey || apiKey !== validApiKey) {
    return { success: false, error: 'Invalid API key' };
  }

  return { success: true, apiKey };
}

// CORS configuration
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://postpal.app', 'https://www.postpal.app']
    : ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
};

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Request logging middleware
export function logRequest(request: NextRequest, response: NextResponse) {
  const { method, url } = request;
  const { status } = response;
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] ${method} ${url} - ${status}`);
  
  // In a real app, you would log to a proper logging service
  // like Winston, Bunyan, or a cloud logging service
}

// Error handling middleware
export function handleApiError(error: any, request: NextRequest) {
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    timestamp: new Date().toISOString(),
  });

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    return APIResponse.serverError('Something went wrong');
  }

  return APIResponse.serverError(error.message, error.stack);
}

// Health check endpoint
export function healthCheck() {
  return APIResponse.success({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
}
