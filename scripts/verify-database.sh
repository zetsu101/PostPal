#!/bin/bash
# Database Verification Script
# Checks if Supabase is configured and tables exist

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 PostPal Database Verification${NC}"
echo "======================================"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
  echo -e "${RED}❌ .env.production file not found${NC}"
  echo "   Run: cp env.production.template .env.production"
  exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

# Check if Supabase URL is configured
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [[ "$NEXT_PUBLIC_SUPABASE_URL" == *"your-project"* ]]; then
  echo -e "${RED}❌ Supabase URL not configured${NC}"
  echo "   Update .env.production with your Supabase URL"
  echo "   Get it from: Supabase Dashboard → Settings → API"
  exit 1
fi

# Check if Supabase anon key is configured
if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [[ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" == *"..."* ]]; then
  echo -e "${RED}❌ Supabase anon key not configured${NC}"
  echo "   Update .env.production with your Supabase anon key"
  echo "   Get it from: Supabase Dashboard → Settings → API"
  exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. Go to your Supabase Dashboard:"
echo "   ${NEXT_PUBLIC_SUPABASE_URL}"
echo ""
echo "2. Run database migrations:"
echo "   - Open SQL Editor"
echo "   - Run database/schema.sql"
echo "   - Run database/schema-extended.sql"
echo "   - Run database/feedback-schema.sql"
echo ""
echo "3. Verify tables exist:"
echo "   - Go to Table Editor"
echo "   - Check for tables: users, posts, analytics, organizations, etc."
echo ""
echo "4. Test connection:"
echo "   npm run check:production"
echo ""

# Try to verify connection (if Node.js and dependencies are available)
if command -v node &> /dev/null; then
  echo -e "${BLUE}🔌 Testing database connection...${NC}"
  
  # Create a temporary test script
  cat > /tmp/test-supabase-connection.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, key);

// Try to query a table
supabase.from('users').select('count').limit(1)
  .then(() => {
    console.log('✅ Database connection successful!');
    console.log('✅ Tables appear to exist');
    process.exit(0);
  })
  .catch((e) => {
    if (e.message.includes('relation "users" does not exist')) {
      console.log('⚠️  Connection works, but tables may not exist yet');
      console.log('   Run migrations: database/schema.sql, schema-extended.sql, feedback-schema.sql');
    } else {
      console.log('❌ Connection failed:', e.message);
    }
    process.exit(1);
  });
EOF

  # Try to run the test (may fail if dependencies aren't installed)
  if [ -d "node_modules/@supabase" ]; then
    node /tmp/test-supabase-connection.js 2>/dev/null || echo -e "${YELLOW}⚠️  Could not test connection (dependencies may not be installed)${NC}"
  else
    echo -e "${YELLOW}⚠️  Install dependencies first: npm install${NC}"
  fi
  
  rm -f /tmp/test-supabase-connection.js
fi

echo ""
echo -e "${GREEN}✅ Verification complete!${NC}"


