import { createSwaggerSpec } from 'next-swagger-doc';

export const swaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PostPal API',
      version: '1.0.0',
      description: 'AI-powered social media management platform API',
      contact: {
        name: 'PostPal Support',
        email: 'support@postpal.app',
        url: 'https://postpal.app/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.postpal.app' 
          : 'http://localhost:3000/api',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server' 
          : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Error message',
                },
                details: {
                  type: 'object',
                  example: {},
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              example: {},
            },
            message: {
              type: 'string',
              example: 'Success message',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        PostContent: {
          type: 'object',
          required: ['text', 'platforms'],
          properties: {
            text: {
              type: 'string',
              minLength: 1,
              maxLength: 2000,
              example: 'Check out our latest AI-powered content! 🚀',
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/image.jpg',
            },
            videoUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/video.mp4',
            },
            link: {
              type: 'string',
              format: 'uri',
              example: 'https://postpal.app',
            },
            hashtags: {
              type: 'array',
              items: {
                type: 'string',
              },
              maxItems: 30,
              example: ['#AI', '#SocialMedia', '#Content'],
            },
            platforms: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok'],
              },
              example: ['instagram', 'linkedin'],
            },
          },
        },
        SocialCredentials: {
          type: 'object',
          required: ['platform', 'accessToken'],
          properties: {
            platform: {
              type: 'string',
              enum: ['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok'],
              example: 'instagram',
            },
            accessToken: {
              type: 'string',
              example: 'your_access_token_here',
            },
            refreshToken: {
              type: 'string',
              example: 'your_refresh_token_here',
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
            },
            config: {
              type: 'object',
              additionalProperties: true,
            },
          },
        },
        EmailData: {
          type: 'object',
          required: ['to', 'template'],
          properties: {
            to: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            template: {
              type: 'string',
              enum: [
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
              ],
              example: 'welcome',
            },
            data: {
              type: 'object',
              additionalProperties: true,
              example: {
                userName: 'John Doe',
                loginUrl: 'https://postpal.app/login',
              },
            },
          },
        },
        AIAnalysis: {
          type: 'object',
          required: ['content', 'platform'],
          properties: {
            content: {
              type: 'string',
              minLength: 1,
              example: 'Check out our latest AI-powered content!',
            },
            platform: {
              type: 'string',
              enum: ['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok'],
              example: 'instagram',
            },
            targetAudience: {
              type: 'string',
              example: 'Tech professionals',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              default: 1,
              example: 1,
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20,
              example: 20,
            },
            sortBy: {
              type: 'string',
              example: 'created_at',
            },
            sortOrder: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc',
              example: 'desc',
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
      {
        ApiKeyAuth: [],
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Social Media',
        description: 'Social media platform integrations',
      },
      {
        name: 'AI',
        description: 'AI-powered content analysis and optimization',
      },
      {
        name: 'Email',
        description: 'Email notification system',
      },
      {
        name: 'Payments',
        description: 'Stripe payment processing',
      },
      {
        name: 'Analytics',
        description: 'Performance analytics and insights',
      },
    ],
  },
  apis: ['./src/app/api/**/route.ts'], // Path to the API files
};

export const getSwaggerSpec = () => {
  return createSwaggerSpec(swaggerConfig);
};
