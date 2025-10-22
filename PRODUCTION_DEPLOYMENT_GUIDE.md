# PostPal Production Deployment Guide

This comprehensive guide covers deploying PostPal to production with all advanced features including WebSocket servers, AI services, and real-time collaboration.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (recommended)
- Supabase account and project
- OpenAI API key
- AWS S3 bucket (for file storage)
- Domain name and SSL certificate

### 1. Environment Setup

```bash
# Clone repository
git clone <your-repo-url>
cd PostPal/postpal

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.production
```

### 2. Production Environment Variables

Create `.env.production`:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
PORT=3000

# WebSocket Server
WEBSOCKET_PORT=8080
WEBSOCKET_PATH=/ws/insights
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-domain.com:8080

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project

# Rate Limiting
RATE_LIMIT_REDIS_URL=redis://localhost:6379

# Email Service
RESEND_API_KEY=your-resend-key
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# Payment Processing
STRIPE_PUBLIC_KEY=your-stripe-public-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

## 🐳 Docker Deployment (Recommended)

### 1. Create Dockerfile

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
EXPOSE 8080

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  # Main PostPal Application
  postpal-app:
    build: .
    ports:
      - "3000:3000"
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    env_file:
      - .env.production
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis for caching and rate limiting
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

  # PostgreSQL (if not using Supabase)
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: postpal
      POSTGRES_USER: postpal
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - postpal-app
    restart: unless-stopped

volumes:
  redis_data:
  postgres_data:
```

### 3. Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream postpal_app {
        server postpal-app:3000;
    }

    upstream postpal_websocket {
        server postpal-app:8080;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=websocket:10m rate=5r/s;

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # WebSocket proxy
        location /ws/ {
            limit_req zone=websocket burst=20 nodelay;
            
            proxy_pass http://postpal_websocket;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket specific timeouts
            proxy_read_timeout 86400;
            proxy_send_timeout 86400;
        }

        # API routes
        location /api/ {
            limit_req zone=api burst=50 nodelay;
            
            proxy_pass http://postpal_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /_next/static/ {
            proxy_pass http://postpal_app;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Main application
        location / {
            proxy_pass http://postpal_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## ☁️ Cloud Platform Deployment

### Vercel Deployment

1. **Connect Repository**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   ```

2. **Environment Variables**:
   Set all production environment variables in Vercel dashboard.

3. **WebSocket Server**:
   Deploy WebSocket server separately:
   ```bash
   # Deploy to Railway/Render/DigitalOcean
   vercel --prod --target production
   ```

### AWS Deployment

1. **EC2 Instance Setup**:
   ```bash
   # Launch EC2 instance (t3.medium or larger)
   sudo yum update -y
   sudo yum install -y docker git
   sudo systemctl start docker
   sudo systemctl enable docker
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy Application**:
   ```bash
   # Clone and deploy
   git clone <your-repo>
   cd PostPal/postpal
   
   # Copy production environment
   cp .env.example .env.production
   # Edit .env.production with your values
   
   # Start services
   docker-compose up -d
   ```

3. **Load Balancer Setup**:
   ```bash
   # Create Application Load Balancer
   # Configure target groups for ports 3000 and 8080
   # Set up SSL certificate
   # Configure health checks
   ```

### DigitalOcean App Platform

1. **Create App Spec**:
   ```yaml
   # .do/app.yaml
   name: postpal
   services:
   - name: postpal-web
     source_dir: /
     github:
       repo: your-username/postpal
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 2
     instance_size_slug: basic-xxs
     http_port: 3000
     envs:
     - key: NODE_ENV
       value: production
     - key: DATABASE_URL
       value: ${db.DATABASE_URL}
     - key: REDIS_URL
       value: ${redis.REDIS_URL}
   
   - name: postpal-websocket
     source_dir: /
     github:
       repo: your-username/postpal
       branch: main
     run_command: npm run start:ws
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     http_port: 8080
     envs:
     - key: NODE_ENV
       value: production
     - key: WEBSOCKET_PORT
       value: "8080"
   
   databases:
   - name: postpal-db
     engine: PG
     version: "13"
   
   - name: postpal-redis
     engine: REDIS
     version: "6"
   ```

## 🔧 Production Configuration

### 1. Next.js Configuration

Update `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['ws', 'node-cache']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/ws/:path*',
        destination: 'http://localhost:8080/ws/:path*',
      },
    ];
  },
};

export default nextConfig;
```

### 2. WebSocket Server Production Setup

Create `websocket-server-production.ts`:

```typescript
import { createServer } from 'http';
import { PostPalWebSocketServer } from './lib/websocket-server';
import { createServerClient } from './lib/supabase';

const PORT = process.env.WEBSOCKET_PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server
const httpServer = createServer();

// Create WebSocket server
const wsServer = new PostPalWebSocketServer(httpServer);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  wsServer.destroy();
  httpServer.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  wsServer.destroy();
  httpServer.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start server
httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 WebSocket server running on ${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

// Health check endpoint
httpServer.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      connections: wsServer.getStats().totalClients
    }));
  }
});
```

### 3. Database Migration

```bash
# Run database migrations
npm run db:migrate

# Seed production data
npm run db:seed:production
```

### 4. SSL Certificate Setup

```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# Or using Cloudflare SSL
# Configure Cloudflare DNS and enable SSL/TLS encryption mode
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

```typescript
// lib/monitoring.ts
import { createClient } from '@sentry/nextjs';

export const monitoring = {
  // Performance monitoring
  trackPerformance: (name: string, duration: number) => {
    console.log(`Performance: ${name} took ${duration}ms`);
    // Send to monitoring service
  },

  // Error tracking
  trackError: (error: Error, context?: any) => {
    console.error('Error:', error.message, context);
    // Send to error tracking service
  },

  // Business metrics
  trackMetric: (name: string, value: number, tags?: Record<string, string>) => {
    console.log(`Metric: ${name} = ${value}`, tags);
    // Send to metrics service
  }
};
```

### 2. Health Checks

Create health check endpoints:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    // Check database connection
    const supabase = createServerClient();
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) throw error;

    // Check WebSocket server
    const wsHealth = await fetch('http://localhost:8080/health');
    const wsStatus = await wsHealth.json();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        websocket: wsStatus.status,
        cache: 'healthy'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

### 3. Logging Configuration

```typescript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'postpal' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

## 🔒 Security Configuration

### 1. Rate Limiting

```typescript
// lib/rate-limiting.ts
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'postpal',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

export const rateLimitMiddleware = async (req: Request) => {
  try {
    const key = req.headers.get('x-forwarded-for') || 'unknown';
    await rateLimiter.consume(key);
    return true;
  } catch (rejRes) {
    return false;
  }
};
```

### 2. CORS Configuration

```typescript
// lib/cors.ts
export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 3. Input Validation

```typescript
// lib/validation.ts
import { z } from 'zod';

export const contentSchema = z.object({
  text: z.string().min(1).max(2000),
  platform: z.enum(['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok']),
  sentiment: z.number().min(-1).max(1),
  readability: z.number().min(0).max(100),
  urgency: z.number().min(0).max(1),
  callToAction: z.boolean(),
  trendingTopics: z.array(z.string()),
  scheduledTime: z.string().datetime()
});
```

## 🚀 Deployment Scripts

### 1. Production Build Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting PostPal production deployment..."

# Build application
echo "📦 Building application..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm run test:ci

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose build

# Start services
echo "🔄 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run health checks
echo "🏥 Running health checks..."
curl -f http://localhost:3000/api/health || exit 1
curl -f http://localhost:8080/health || exit 1

echo "✅ Deployment completed successfully!"
```

### 2. Database Migration Script

```bash
#!/bin/bash
# migrate.sh

set -e

echo "🗄️ Running database migrations..."

# Run migrations
npm run db:migrate

# Verify migrations
npm run db:verify

echo "✅ Database migrations completed!"
```

## 📈 Performance Optimization

### 1. Caching Strategy

```typescript
// lib/cache-config.ts
export const cacheConfig = {
  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  },

  // Cache TTL settings
  ttl: {
    aiInsights: 300, // 5 minutes
    userData: 600,   // 10 minutes
    content: 1800,   // 30 minutes
    analytics: 3600  // 1 hour
  }
};
```

### 2. CDN Configuration

```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['your-cdn-domain.com'],
    loader: 'custom',
    loaderFile: './lib/image-loader.ts'
  },
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:ci
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Deploy to your cloud provider
          ./deploy.sh
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          REDIS_URL: ${{ secrets.REDIS_URL }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] CDN setup (if applicable)

### Security
- [ ] Rate limiting configured
- [ ] CORS properly set up
- [ ] Input validation implemented
- [ ] Authentication working
- [ ] HTTPS enforced

### Performance
- [ ] Caching configured
- [ ] Database indexes optimized
- [ ] Static assets optimized
- [ ] WebSocket server scaled
- [ ] Load balancer configured

### Monitoring
- [ ] Health checks implemented
- [ ] Logging configured
- [ ] Error tracking set up
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured

### Testing
- [ ] All tests passing
- [ ] Load testing completed
- [ ] Security testing done
- [ ] WebSocket functionality verified
- [ ] AI services working

## 🆘 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   ```bash
   # Check WebSocket server status
   curl http://localhost:8080/health
   
   # Check firewall settings
   sudo ufw status
   sudo ufw allow 8080
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   npm run db:test
   
   # Check connection pool
   npm run db:status
   ```

3. **Memory Issues**
   ```bash
   # Monitor memory usage
   docker stats
   
   # Increase memory limits
   # In docker-compose.yml:
   deploy:
     resources:
       limits:
         memory: 1G
   ```

4. **Performance Issues**
   ```bash
   # Check application logs
   docker-compose logs -f postpal-app
   
   # Monitor performance
   npm run monitor
   ```

### Emergency Procedures

1. **Rollback Deployment**
   ```bash
   # Rollback to previous version
   docker-compose down
   git checkout previous-commit
   docker-compose up -d
   ```

2. **Scale Services**
   ```bash
   # Scale application instances
   docker-compose up -d --scale postpal-app=3
   ```

3. **Emergency Maintenance**
   ```bash
   # Put application in maintenance mode
   echo "MAINTENANCE_MODE=true" >> .env.production
   docker-compose restart postpal-app
   ```

## 📞 Support

For deployment issues:

1. **Check logs**: `docker-compose logs -f`
2. **Verify health**: `curl http://localhost:3000/api/health`
3. **Monitor resources**: `docker stats`
4. **Review configuration**: Check all environment variables
5. **Contact support**: Create issue with deployment logs

---

**🎉 Congratulations!** Your PostPal platform is now ready for production with enterprise-grade features including real-time collaboration, advanced AI insights, comprehensive testing, and robust monitoring.

**Next Steps:**
- Monitor application performance
- Set up automated backups
- Configure alerting
- Plan scaling strategy
- Regular security updates
