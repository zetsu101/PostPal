# 🗄️ Supabase Migration Checklist

## Migration Order (CRITICAL - Run in this exact order!)

### ✅ Step 1: Run `schema.sql` (Base Tables)
**File:** `database/schema.sql`  
**What it creates:**
- Users table
- Posts table
- Analytics table
- Social media configs table
- Content templates
- AI generations
- Row Level Security policies

**How to run:**
1. Open `database/schema.sql` in your editor
2. Copy ALL contents (Ctrl+A, Ctrl+C)
3. In Supabase SQL Editor, click the **+** button to create a new query
4. Paste the SQL
5. Click **Run** (or press ⌘+Enter)
6. ✅ Should see "Success. No rows returned"

---

### ✅ Step 2: Run `schema-extended.sql` (Team Features)
**File:** `database/schema-extended.sql`  
**What it creates:**
- Organizations table
- Team members table
- Departments table
- AI optimizations table
- Performance metrics table
- Extended relationships

**How to run:**
1. Open `database/schema-extended.sql` in your editor
2. Copy ALL contents
3. In Supabase SQL Editor, click **+** for a NEW query tab
4. Paste the SQL
5. Click **Run**
6. ✅ Should see "Success. No rows returned"

---

### ✅ Step 3: Run `feedback-schema.sql` (Feedback System)
**File:** `database/feedback-schema.sql`  
**What it creates:**
- AI insights feedback table
- Indexes for performance
- Feedback analytics views
- Row Level Security policies

**How to run:**
1. Open `database/feedback-schema.sql` in your editor
2. Copy ALL contents
3. In Supabase SQL Editor, click **+** for a NEW query tab
4. Paste the SQL
5. Click **Run**
6. ✅ Should see "Success. No rows returned"

---

## ✅ Verification

After running all 3 migrations, verify tables were created:

1. In Supabase Dashboard, click **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ `users`
   - ✅ `posts`
   - ✅ `analytics`
   - ✅ `social_media_configs`
   - ✅ `organizations`
   - ✅ `team_members`
   - ✅ `ai_optimizations`
   - ✅ `ai_insights_feedback`
   - ✅ `performance_metrics`
   - ✅ (and more...)

---

## 🚨 Troubleshooting

### Error: "relation already exists"
- This means the table already exists - that's OK!
- The `CREATE TABLE IF NOT EXISTS` statements will skip existing tables
- You can continue with the next migration

### Error: "permission denied"
- Make sure you're using the correct database role
- Should be "postgres" role (as shown in your screenshot)

### Error: "syntax error"
- Check that you copied the ENTIRE file (start to finish)
- Make sure there are no extra characters
- Try running again with a fresh copy

---

## 📝 Next Steps After Migrations

Once all migrations are complete:
1. Get your Supabase credentials (Settings → API)
2. Add them to `.env.production`
3. Run `npm run check:production`
4. Should see 80%+ readiness! 🎉

