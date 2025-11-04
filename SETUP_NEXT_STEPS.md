# 🚀 PostPal Production Setup - Quick Start Guide

## ✅ What's Been Set Up

1. ✅ **Environment Template Created** - `env.production.template` 
   - Contains all required and optional environment variables
   - Copy to `.env.production` and fill in your values

2. ✅ **Database Migration Files Verified**
   - `database/schema.sql` - Base tables (users, posts, analytics, etc.)
   - `database/schema-extended.sql` - Team collaboration features
   - `database/feedback-schema.sql` - AI insights feedback system

## 🎯 Next Steps (In Order)

### Step 1: Set Up Supabase Database (30 minutes)

1. **Create Supabase Project** (if you don't have one)
   - Go to https://supabase.com
   - Click "New Project"
   - Choose a name and set a database password

2. **Run Database Migrations**
   - Go to Supabase Dashboard → SQL Editor
   - Run these files **in this exact order**:
     ```sql
     -- 1. First: Copy and paste contents of database/schema.sql
     -- 2. Second: Copy and paste contents of database/schema-extended.sql
     -- 3. Third: Copy and paste contents of database/feedback-schema.sql
     ```
   - Click "Run" for each file
   - Verify all tables were created successfully

3. **Get Your Supabase Credentials**
   - Go to Project Settings → API
   - Copy:
     - `Project URL` → Use for `NEXT_PUBLIC_SUPABASE_URL`
     - `anon` `public` key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` `secret` key → Use for `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Create Production Environment File (15 minutes)

```bash
# Copy the template
cp env.production.template .env.production

# Edit .env.production and fill in your values
# Use your favorite text editor
```

**Minimum Required Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Highly Recommended:**
```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-domain.com
```

### Step 3: Test Locally (30 minutes)

```bash
# Build the application
npm run build

# Run tests
npm run test:ci

# Check production readiness
npm run check:production

# Should show 80%+ readiness now!
```

### Step 4: Deploy to Staging (2-4 hours)

**Option A: Vercel (Recommended - Easiest)**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Go to Project Settings → Environment Variables
# Copy all variables from .env.production
```

**Option B: Railway**
1. Go to railway.app
2. Connect your GitHub repo
3. Railway auto-detects Next.js
4. Add environment variables in Variables tab
5. Deploy!

### Step 5: Final Testing (1 hour)

Test these core features:
- [ ] User signup/login works
- [ ] AI insights generate correctly
- [ ] Content creation works
- [ ] Dashboard displays data
- [ ] WebSocket connects (if enabled)
- [ ] No critical errors in console

### Step 6: Deploy to Production (30 minutes)

```bash
# Vercel
vercel --prod

# Or push to main branch (if auto-deploy configured)
git push origin main
```

## 📋 Quick Checklist

Before launching, ensure:
- [ ] Database migrations run successfully
- [ ] `.env.production` file exists with real values
- [ ] `npm run build` succeeds
- [ ] `npm run test:ci` passes
- [ ] `npm run check:production` shows 80%+
- [ ] Staging deployment successful
- [ ] Core features tested
- [ ] Domain configured with SSL
- [ ] Error tracking configured (Sentry)

## 🆘 Troubleshooting

### "Database connection failed"
- Check Supabase URL and keys in `.env.production`
- Verify Supabase project is active
- Check network connectivity

### "Build fails"
- Check Node.js version (need 18+): `node --version`
- Clear cache: `rm -rf .next node_modules && npm install`
- Check for TypeScript errors: `npm run lint`

### "Tests failing"
- Make sure Supabase is configured
- Check test environment variables
- Run: `npm run test:api` to see specific errors

## 📚 Additional Resources

- **Environment Setup**: See `ENVIRONMENT_SETUP.md` for detailed variable explanations
- **Production Readiness**: See `PRODUCTION_READINESS.md` for complete checklist
- **Quick Start**: See `QUICK_START_PRODUCTION.md` for 3-day launch plan
- **Launch Roadmap**: See `LAUNCH_ROADMAP.md` for detailed timeline

## 🎉 You're Ready When...

✅ `npm run check:production` shows 80%+ readiness  
✅ All tests passing  
✅ Can deploy to staging successfully  
✅ Core features work end-to-end  
✅ No critical errors  

**Then launch!** 🚀

---

**Estimated Time to Launch:**
- Fastest: 2-4 hours (just setup + deploy)
- Recommended: 1-2 days (with testing)
- Thorough: 1 week (complete polish)

