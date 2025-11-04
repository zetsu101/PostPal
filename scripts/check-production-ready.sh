#!/bin/bash
# Production Readiness Checker
# Verifies that PostPal is ready for production deployment

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 PostPal Production Readiness Check${NC}"
echo "======================================"
echo ""

SCORE=0
TOTAL=0

check_item() {
  TOTAL=$((TOTAL + 1))
  if [ "$1" -eq 1 ]; then
    echo -e "${GREEN}✅ $2${NC}"
    SCORE=$((SCORE + 1))
  else
    echo -e "${RED}❌ $2${NC}"
  fi
}

check_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Environment Variables
echo "📝 Checking Environment Variables..."
if [ -f ".env.production" ]; then
  check_item 1 ".env.production exists"
  
  # Check critical variables
  if grep -q "NEXT_PUBLIC_SUPABASE_URL=https://" .env.production; then
    check_item 1 "Supabase URL configured"
  else
    check_item 0 "Supabase URL configured"
  fi
  
  if grep -q "OPENAI_API_KEY=sk-" .env.production; then
    check_item 1 "OpenAI API key configured"
  else
    check_warning "OpenAI API key may not be configured"
  fi
else
  check_item 0 ".env.production exists"
fi

# Database
echo ""
echo "🗄️  Checking Database..."
if [ -f "database/schema.sql" ]; then
  check_item 1 "Database schema file exists"
else
  check_item 0 "Database schema file exists"
fi

# Tests
echo ""
echo "🧪 Checking Tests..."
if [ -f "src/lib/__tests__/ai-insights-api-test.ts" ]; then
  check_item 1 "Test files exist"
else
  check_item 0 "Test files exist"
fi

# Security
echo ""
echo "🔒 Checking Security..."
if [ -f ".env.production" ] && ! grep -q "your_" .env.production; then
  check_item 1 "Environment variables not using placeholders"
else
  check_item 0 "Environment variables not using placeholders"
fi

# Documentation
echo ""
echo "📚 Checking Documentation..."
if [ -f "PRODUCTION_READINESS.md" ]; then
  check_item 1 "Production readiness guide exists"
else
  check_item 0 "Production readiness guide exists"
fi

if [ -f "ENVIRONMENT_SETUP.md" ]; then
  check_item 1 "Environment setup guide exists"
else
  check_item 0 "Environment setup guide exists"
fi

if [ -f "README.md" ]; then
  check_item 1 "README exists"
else
  check_item 0 "README exists"
fi

# Build
echo ""
echo "📦 Checking Build..."
if [ -d ".next" ] || npm run build --dry-run 2>/dev/null; then
  check_item 1 "Application can build"
else
  check_item 0 "Application can build"
fi

# Summary
echo ""
echo "======================================"
echo -e "${BLUE}📊 Readiness Score: $SCORE/$TOTAL${NC}"
echo ""

PERCENTAGE=$((SCORE * 100 / TOTAL))

if [ $PERCENTAGE -ge 80 ]; then
  echo -e "${GREEN}🎉 Ready for production! ($PERCENTAGE%)${NC}"
elif [ $PERCENTAGE -ge 60 ]; then
  echo -e "${YELLOW}⚠️  Almost ready ($PERCENTAGE%) - review warnings above${NC}"
else
  echo -e "${RED}❌ Not ready ($PERCENTAGE%) - fix critical issues first${NC}"
fi

echo ""
echo "Next steps:"
echo "1. Review PRODUCTION_READINESS.md"
echo "2. Fix all ❌ items above"
echo "3. Run: npm run build"
echo "4. Deploy to staging first"
echo "5. Test thoroughly"
echo "6. Deploy to production"
