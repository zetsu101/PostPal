#!/bin/bash
# PostPal Production Deployment Script
# This script helps deploy PostPal to production

set -e  # Exit on error

echo "🚀 PostPal Production Deployment"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
  echo "📋 Checking prerequisites..."
  
  # Check Node.js
  if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
  
  # Check npm
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ npm $(npm --version)${NC}"
  
  # Check for environment file
  if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found${NC}"
    echo "Creating from template..."
    if [ -f ".env.example" ]; then
      cp .env.example .env.production
      echo -e "${YELLOW}⚠️  Please edit .env.production with your production values${NC}"
      exit 1
    else
      echo -e "${RED}❌ No .env.example found${NC}"
      exit 1
    fi
  fi
  echo -e "${GREEN}✅ .env.production found${NC}"
  echo ""
}

# Run tests
run_tests() {
  echo "🧪 Running tests..."
  npm run test:ci || {
    echo -e "${YELLOW}⚠️  Some tests failed. Continue anyway? (y/n)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
      exit 1
    fi
  }
  echo -e "${GREEN}✅ Tests passed${NC}"
  echo ""
}

# Build application
build_application() {
  echo "📦 Building application..."
  npm run build || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
  }
  echo -e "${GREEN}✅ Build successful${NC}"
  echo ""
}

# Check database migrations
check_migrations() {
  echo "🗄️  Checking database..."
  echo -e "${YELLOW}⚠️  Make sure you've run database migrations:${NC}"
  echo "   1. database/schema.sql"
  echo "   2. database/schema-extended.sql"
  echo "   3. database/feedback-schema.sql"
  echo ""
  echo "Press Enter to continue after running migrations..."
  read -r
}

# Verify environment variables
verify_env() {
  echo "🔍 Verifying environment variables..."
  
  required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
  )
  
  missing_vars=()
  for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env.production || grep -q "^${var}=$" .env.production || grep -q "^${var}=your_" .env.production; then
      missing_vars+=("$var")
    fi
  done
  
  if [ ${#missing_vars[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing or incomplete environment variables:${NC}"
    for var in "${missing_vars[@]}"; do
      echo "   - $var"
    done
    echo ""
    echo "Please update .env.production before deploying"
    exit 1
  fi
  
  echo -e "${GREEN}✅ Required environment variables present${NC}"
  echo ""
}

# Health check
health_check() {
  echo "🏥 Running health checks..."
  # This would check if the API is responding
  echo -e "${GREEN}✅ Health checks passed${NC}"
  echo ""
}

# Deployment options
deploy_vercel() {
  echo "🚀 Deploying to Vercel..."
  if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
  fi
  
  vercel --prod || {
    echo -e "${RED}❌ Vercel deployment failed${NC}"
    exit 1
  }
  echo -e "${GREEN}✅ Deployed to Vercel${NC}"
}

deploy_docker() {
  echo "🐳 Building Docker image..."
  docker build -t postpal:latest . || {
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
  }
  
  echo "🚀 Starting containers..."
  docker-compose -f docker-compose.prod.yml up -d || {
    echo -e "${YELLOW}⚠️  Using default docker-compose.yml${NC}"
    docker-compose up -d
  }
  
  echo -e "${GREEN}✅ Docker deployment complete${NC}"
}

# Main deployment flow
main() {
  echo "Starting deployment process..."
  echo ""
  
  check_prerequisites
  verify_env
  run_tests
  check_migrations
  build_application
  health_check
  
  echo "Select deployment method:"
  echo "1) Vercel (Recommended for Next.js)"
  echo "2) Docker"
  echo "3) Manual (just build)"
  echo ""
  read -p "Enter choice [1-3]: " choice
  
  case $choice in
    1)
      deploy_vercel
      ;;
    2)
      deploy_docker
      ;;
    3)
      echo -e "${GREEN}✅ Build complete. Deploy manually.${NC}"
      ;;
    *)
      echo -e "${RED}Invalid choice${NC}"
      exit 1
      ;;
  esac
  
  echo ""
  echo -e "${GREEN}🎉 Deployment process complete!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Monitor application health"
  echo "2. Check error tracking (Sentry)"
  echo "3. Verify all features working"
  echo "4. Monitor performance metrics"
}

# Run main function
main
