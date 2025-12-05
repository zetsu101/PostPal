# 🚀 PostPal Setup Guide

**Complete setup guide for PostPal development environment**

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Supabase account** ([Sign up](https://supabase.com))
- **OpenAI API key** (optional, for AI features) ([Get key](https://platform.openai.com))

---

## ⚡ Quick Start (5 minutes)

### 1. Clone and Install

```bash
# Navigate to project directory
cd postpal

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
# See "Environment Variables" section below
```

### 3. Database Setup

```bash
# Option A: Use Supabase Dashboard (Recommended)
# 1. Go to https://supabase.com → Your Project
# 2. Open SQL Editor
# 3. Run database/schema.sql
# 4. Run database/schema-extended.sql

# Option B: Verify database (after setup)
npm run db:verify
```

### 4. Start Development

```bash
# Start Next.js dev server
npm run dev

# In another terminal, start WebSocket server
npm run dev:ws

# Or start both together
npm run dev:full
```

### 5. Open Browser

Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔧 Detailed Setup

### Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Next.js 15.4.4
- React 19.1.0
- Supabase client
- OpenAI SDK
- And more...

### Step 2: Configure Environment Variables

Create `.env.local` file in the `postpal` directory:

```bash
cp .env.example .env.local
```

#### Required Variables

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application (REQUIRED)
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to get Supabase keys:**
1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** and **anon/public key**
5. Copy **service_role key** (keep this secret!)

#### Recommended Variables

```env
# OpenAI (for AI features)
OPENAI_API_KEY=sk-your_key_here

# WebSocket
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080
WEBSOCKET_PORT=8080
WEBSOCKET_HOST=localhost
```

#### Optional Variables

See `.env.example` for complete list of optional variables including:
- AWS S3 (for file uploads)
- Stripe (for payments)
- Resend (for emails)
- Sentry (for error tracking)
- Social media API keys

### Step 3: Database Setup

#### Option A: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

3. **Run Base Schema**
   - Copy contents of `database/schema.sql`
   - Paste into SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)

4. **Run Extended Schema**
   - Copy contents of `database/schema-extended.sql`
   - Paste into SQL Editor
   - Click **Run**

5. **Verify Setup**
   ```bash
   npm run db:verify
   ```

#### Option B: Migration API (Alternative)

```bash
# Make sure .env.local is configured
# Then run migration endpoint
curl -X POST http://localhost:3000/api/database/migrate
```

### Step 4: Start Development Servers

#### Option A: Start Separately

**Terminal 1 - Next.js:**
```bash
npm run dev
```

**Terminal 2 - WebSocket:**
```bash
npm run dev:ws
```

#### Option B: Start Together

```bash
npm run dev:full
```

This starts both servers concurrently.

### Step 5: Verify Installation

1. **Check Next.js Server**
   - Open [http://localhost:3000](http://localhost:3000)
   - You should see the landing page

2. **Check WebSocket Server**
   - Open [http://localhost:8080/health](http://localhost:8080/health)
   - Should return health status

3. **Test Authentication**
   - Go to `/login`
   - Try creating an account
   - Verify you can log in

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run WebSocket tests
npm run test:websocket

# Run API tests
npm run test:api

# Run integration tests
npm run test:integration

# Watch mode
npm run test:watch
```

### Test Database Connection

```bash
# Verify database schema
npm run db:verify
```

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase credentials"

**Solution:**
- Check that `.env.local` exists
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are set
- Restart dev server after changing `.env.local`

### Issue: "Table does not exist"

**Solution:**
- Run database migrations (see Step 3)
- Verify with `npm run db:verify`
- Check Supabase dashboard → Table Editor

### Issue: "WebSocket connection failed"

**Solution:**
- Ensure WebSocket server is running: `npm run dev:ws`
- Check `WEBSOCKET_PORT` in `.env.local`
- Verify port 8080 is not in use: `lsof -i :8080`

### Issue: "Module not found"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port already in use"

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env.local
PORT=3001
```

### Issue: "Database RLS policies blocking access"

**Solution:**
- Verify RLS policies in `database/schema.sql` are applied
- Check Supabase dashboard → Authentication → Policies
- Ensure user is authenticated

---

## 📁 Project Structure

```
postpal/
├── src/
│   ├── app/              # Next.js pages and API routes
│   ├── components/       # React components
│   ├── lib/              # Utilities and services
│   └── contexts/         # React contexts
├── database/             # SQL schema files
├── public/               # Static assets
├── scripts/             # Utility scripts
└── .env.local           # Your environment variables (gitignored)
```

---

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Never share service role keys** - Keep them secret
3. **Rotate keys if exposed** - If keys are leaked, regenerate them
4. **Use environment variables** - Never hardcode secrets

---

## 📚 Next Steps

After setup:

1. **Read Documentation**
   - [COMPLETE_INTEGRATION_GUIDE.md](./COMPLETE_INTEGRATION_GUIDE.md)
   - [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)
   - [WEBSOCKET_SETUP.md](./WEBSOCKET_SETUP.md)

2. **Explore Features**
   - `/dashboard` - Main dashboard
   - `/ai-generator` - AI content generation
   - `/calendar` - Content calendar
   - `/analytics` - Analytics dashboard

3. **API Documentation**
   - Check `src/lib/swagger-config.ts` for API docs
   - Visit `/api-demo` for API examples

---

## 🆘 Need Help?

1. **Check Documentation**
   - [PROJECT_ANALYSIS.md](../PROJECT_ANALYSIS.md) - Project overview
   - [QUICK_ACTION_PLAN.md](../QUICK_ACTION_PLAN.md) - Quick fixes

2. **Common Issues**
   - See Troubleshooting section above
   - Check Supabase dashboard for database issues
   - Review browser console for frontend errors

3. **Get Support**
   - Check existing issues
   - Review documentation
   - Contact team

---

## ✅ Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created and configured
- [ ] Database schema applied (base + extended)
- [ ] Database verified (`npm run db:verify`)
- [ ] Dev server running (`npm run dev`)
- [ ] WebSocket server running (`npm run dev:ws`)
- [ ] Can access http://localhost:3000
- [ ] Can create/login account
- [ ] Tests passing (`npm test`)

---

**Last Updated:** January 2025  
**Version:** 1.0.0

