# 🚀 PostPal Production Setup - Step-by-Step Guide

## Step 1: Set Up Supabase Database (CRITICAL - Do This First!)

### 1.1 Create or Access Your Supabase Project

1. **Go to https://supabase.com**
2. **Sign in** (or create an account if you don't have one)
3. **Create a new project** OR select an existing project
   - Click "New Project"
   - Choose a name (e.g., "PostPal")
   - Set a database password (save this somewhere safe!)
   - Select a region close to you
   - Wait for project to finish creating (~2 minutes)

### 1.2 Run Database Migrations

1. **Open SQL Editor** in Supabase Dashboard
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Run First Migration** (`database/schema.sql`)
   - Open the file `database/schema.sql` in your project
   - Copy ALL contents
   - Paste into Supabase SQL Editor
   - Click "Run" button (or press Cmd/Ctrl + Enter)
   - ✅ Should see "Success. No rows returned"

3. **Run Second Migration** (`database/schema-extended.sql`)
   - Open `database/schema-extended.sql`
   - Copy ALL contents
   - Paste into a NEW query in SQL Editor
   - Click "Run"
   - ✅ Should see "Success. No rows returned"

4. **Run Third Migration** (`database/feedback-schema.sql`)
   - Open `database/feedback-schema.sql`
   - Copy ALL contents
   - Paste into a NEW query in SQL Editor
   - Click "Run"
   - ✅ Should see "Success. No rows returned"

5. **Verify Tables Were Created**
   - Go to "Table Editor" in Supabase dashboard
   - You should see these tables:
     - ✅ users
     - ✅ posts
     - ✅ analytics
     - ✅ organizations
     - ✅ team_members
     - ✅ ai_optimizations
     - ✅ ai_insights_feedback
     - ✅ (and more...)

### 1.3 Get Your Supabase Credentials

1. **Go to Project Settings**
   - Click the gear icon ⚙️ in left sidebar
   - Click "API" under Project Settings

2. **Copy These Values:**
   - **Project URL** → Copy this (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key → Copy this (long string starting with `eyJ...`)
   - **service_role secret** key → Copy this (long string starting with `eyJ...`)
     - ⚠️ **WARNING:** Keep service_role key secret! Never expose it publicly.

3. **Now edit `.env.production`** file:
   ```bash
   # Replace these lines in .env.production:
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## Step 2: Fill in Critical Environment Variables

### 2.1 Edit `.env.production` File

Open `.env.production` in your editor and fill in the Supabase values you just copied.

**Minimum Required (Must Have):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co  # ← Your Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...                 # ← Your anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ...                     # ← Your service_role key
```

### 2.2 Optional but Recommended

**OpenAI API Key** (for AI features):
1. Go to https://platform.openai.com
2. Sign in → API Keys → Create new secret key
3. Copy the key (starts with `sk-`)
4. Add to `.env.production`:
   ```env
   OPENAI_API_KEY=sk-xxxxx...
   ```

**Application URL** (for local testing, use localhost):
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For local testing
# Later change to: https://your-domain.com
```

**WebSocket URL** (for local testing):
```env
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080  # For local testing
# Later change to: wss://your-domain.com
```

---

## Step 3: Generate Security Keys

Run these commands in your terminal:

```bash
# Generate Session Secret
openssl rand -base64 32

# Generate JWT Secret
openssl rand -base64 32

# Generate Encryption Key (32 characters exactly)
openssl rand -hex 16
```

Copy each output and add to `.env.production`:
```env
SESSION_SECRET=<paste first output>
JWT_SECRET=<paste second output>
ENCRYPTION_KEY=<paste third output>
```

---

## Step 4: Test Locally

### 4.1 Verify Environment File

```bash
# Check if file exists and has values
cd /Users/magid/CODE/PostPal/postpal
cat .env.production | grep -E "SUPABASE_URL|SUPABASE_ANON_KEY" | head -2
```

### 4.2 Run Production Readiness Check

```bash
npm run check:production
```

**Expected Output:**
- Should show 80%+ readiness
- ✅ `.env.production exists`
- ✅ `Supabase URL configured`
- ✅ `Environment variables not using placeholders`

### 4.3 Test Build

```bash
npm run build
```

**Expected:** Should build successfully without errors

### 4.4 Test Locally (Optional)

```bash
# Start development server
npm run dev

# In another terminal, test API
curl http://localhost:3000/api/health
```

---

## Step 5: Deploy to Production

### Option A: Vercel (Easiest - Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   - Follow prompts
   - Choose your project
   - Don't override settings

4. **Set Environment Variables in Vercel:**
   - Go to https://vercel.com → Your Project → Settings → Environment Variables
   - Copy ALL variables from `.env.production`
   - Add each one (make sure to select "Production" environment)
   - Click "Save"

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Option B: Railway

1. Go to https://railway.app
2. Sign up/login
3. Click "New Project"
4. Click "Deploy from GitHub repo"
5. Select your PostPal repository
6. Railway auto-detects Next.js
7. Go to Variables tab
8. Copy all variables from `.env.production`
9. Railway auto-deploys!

---

## 🎯 Quick Checklist

Before deploying, make sure:
- [ ] Database migrations run successfully in Supabase
- [ ] `.env.production` has real Supabase credentials
- [ ] `npm run check:production` shows 80%+
- [ ] `npm run build` succeeds
- [ ] All tests pass (optional but recommended)

---

## 🆘 Troubleshooting

### "Database connection failed"
- ✅ Check Supabase URL is correct (should start with `https://`)
- ✅ Verify keys are copied correctly (no extra spaces)
- ✅ Make sure Supabase project is active

### "Build fails"
- ✅ Check Node.js version: `node --version` (need 18+)
- ✅ Clear cache: `rm -rf .next node_modules && npm install`
- ✅ Check for TypeScript errors: `npm run lint`

### "Production check still shows errors"
- ✅ Make sure `.env.production` file exists (not just template)
- ✅ Verify values don't have `your_` or `xxxxx` placeholders
- ✅ Restart terminal after creating `.env.production`

---

## 📞 Need Help?

If you get stuck:
1. Check `ENVIRONMENT_SETUP.md` for detailed variable explanations
2. Check `SETUP_NEXT_STEPS.md` for more guidance
3. Run `npm run check:production` to see what's missing

**You're almost there!** 🚀

