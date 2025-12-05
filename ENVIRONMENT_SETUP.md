# Environment Variables Setup Guide

This guide explains how to configure all environment variables for PostPal in development and production.

## Quick Start

1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your values** - See sections below for where to get each value

3. **Never commit `.env.local` or `.env.production`** to version control

## Required Variables

### ✅ **Minimum Required for Development**

These are the absolute minimum to get PostPal running:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 🚀 **Required for Full Features**

For all features to work, you'll also need:

```env
OPENAI_API_KEY=your_openai_key          # AI content generation
AWS_ACCESS_KEY_ID=your_aws_key          # File uploads
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
RESEND_API_KEY=your_resend_key          # Email notifications
STRIPE_SECRET_KEY=your_stripe_key       # Payments
```

## Detailed Configuration

### 1. Supabase Setup

**Where to get values:**
1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to Project Settings → API
3. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

**Important:** The service role key has admin access. Keep it secret!

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. OpenAI API Setup

**Where to get values:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Copy the key → `OPENAI_API_KEY`

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_MODEL=gpt-4
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2000
```

**Cost Note:** GPT-4 costs more than GPT-3.5. For development, you can use `gpt-3.5-turbo`.

### 3. AWS S3 Setup (File Storage)

**Where to get values:**
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Create an S3 bucket
3. Create an IAM user with S3 access
4. Generate access keys

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=postpal-uploads
```

**Security Best Practices:**
- Use IAM roles with least privilege
- Enable bucket encryption
- Set up bucket policies for access control

### 4. WebSocket Configuration

```env
WEBSOCKET_PORT=8080
WEBSOCKET_HOST=localhost
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3000  # For development
```

**For Production:**
```env
WEBSOCKET_PORT=8080
WEBSOCKET_HOST=0.0.0.0
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-domain.com  # Use wss:// for secure WebSocket
```

### 5. Email Service (Resend)

**Where to get values:**
1. Go to [resend.com](https://resend.com)
2. Sign up and create an API key
3. Verify your domain (for production)

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM_ADDRESS=noreply@postpal.com
EMAIL_FROM_NAME=PostPal
```

### 6. Stripe (Payments)

**Where to get values:**
1. Go to [stripe.com](https://stripe.com)
2. Get API keys from Dashboard → Developers → API keys
3. For webhooks: Dashboard → Developers → Webhooks

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 7. Sentry (Error Tracking)

**Where to get values:**
1. Go to [sentry.io](https://sentry.io)
2. Create a project
3. Copy DSN from project settings

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=your_auth_token
SENTRY_ORG=your_org_slug
SENTRY_PROJECT=your_project_slug
SENTRY_ENVIRONMENT=production
```

### 8. Security Keys

Generate secure random strings:

```bash
# Generate session secret (32+ characters)
openssl rand -base64 32

# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Generate encryption key (32 characters exactly)
openssl rand -hex 16
```

```env
SESSION_SECRET=your_generated_session_secret
JWT_SECRET=your_generated_jwt_secret
ENCRYPTION_KEY=your_32_character_key
```

### 9. Redis (Optional - for rate limiting)

**Local Development:**
```env
REDIS_URL=redis://localhost:6379
```

**Production (Redis Cloud/Upstash):**
```env
REDIS_URL=rediss://username:password@host:port
```

## Environment Files by Context

### Development (`.env.local`)

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
TEST_MODE=false  # Set to true only for automated tests
```

### Production (`.env.production`)

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
TEST_MODE=false  # Always false in production
SENTRY_ENVIRONMENT=production
```

### Testing (`.env.test`)

```env
NODE_ENV=test
TEST_MODE=true
NEXT_PUBLIC_SUPABASE_URL=https://test-project.supabase.co
```

## Verification

After setting up your environment variables, verify they're loaded:

```bash
# Check if variables are loaded (don't expose secrets!)
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Supabase URL set' : '❌ Supabase URL missing')"
```

Or use the health check endpoint:
```bash
curl http://localhost:3000/api/health
```

## Common Issues

### 1. "Supabase key is required"
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in your `.env.local`
- Restart your dev server after adding environment variables

### 2. "API key not found"
- Check that `OPENAI_API_KEY` is set correctly
- Verify the key is valid at platform.openai.com

### 3. WebSocket connection failed
- Ensure `WEBSOCKET_PORT` matches your WebSocket server port
- Check firewall settings allow the port

### 4. Environment variables not loading
- Restart Next.js dev server: `npm run dev`
- Clear Next.js cache: `rm -rf .next`
- Make sure file is named exactly `.env.local` (not `.env`)

## Security Checklist

- [ ] Never commit `.env.local` or `.env.production` to git
- [ ] Use different keys for development and production
- [ ] Rotate secrets regularly
- [ ] Use environment-specific keys (test vs production)
- [ ] Store production secrets in secure vault (AWS Secrets Manager, etc.)
- [ ] Limit API key permissions to minimum required
- [ ] Enable 2FA on all service accounts
- [ ] Monitor API usage for anomalies

## Production Deployment

For production, use your hosting platform's environment variable management:

- **Vercel**: Project Settings → Environment Variables
- **Railway**: Variables tab in project settings
- **AWS**: Use AWS Secrets Manager or Parameter Store
- **Docker**: Pass via `docker-compose.yml` or secrets

See [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) for deployment instructions.

## Need Help?

If you're stuck:
1. Check the [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)
2. Review service-specific documentation
3. Check environment variable names match exactly (case-sensitive!)
4. Ensure all required variables are set before starting the server
