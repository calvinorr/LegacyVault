#!/bin/bash

# ============================================
# LegacyLock Production Deployment Script
# ============================================
# This script automates deployment to Vercel
# with proper security checks and validation

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ============================================
# Pre-flight Checks
# ============================================

print_header "Pre-flight Checks"

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found!"
    echo "Install with: npm install -g vercel"
    exit 1
fi
print_success "Vercel CLI found ($(vercel --version))"

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ required (you have $(node -v))"
    exit 1
fi
print_success "Node.js version $(node -v)"

# Check Git status
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes"
    echo ""
    git status --short
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "Git working directory clean"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "pre-production-polish" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "You're on branch: $CURRENT_BRANCH"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
print_success "Current branch: $CURRENT_BRANCH"

# ============================================
# Environment Setup
# ============================================

print_header "Environment Configuration"

# Check if .env exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    exit 1
fi

# Load current .env to get MongoDB URI
source .env

if [ -z "$MONGO_URI" ]; then
    print_error "MONGO_URI not found in .env"
    exit 1
fi
print_success "MongoDB URI loaded from .env"

# Generate production SESSION_SECRET
print_info "Generating production SESSION_SECRET..."
PROD_SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
print_success "Generated new SESSION_SECRET"

# ============================================
# Deployment Type Selection
# ============================================

print_header "Deployment Configuration"

echo "Choose deployment type:"
echo "1) Preview deployment (test before production)"
echo "2) Production deployment (live!)"
echo ""
read -p "Enter choice (1 or 2): " DEPLOY_TYPE

if [ "$DEPLOY_TYPE" = "2" ]; then
    DEPLOY_MODE="production"
    DEPLOY_CMD="vercel --prod"
    print_warning "PRODUCTION DEPLOYMENT SELECTED"
    read -p "Are you sure? This will go live! (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    DEPLOY_MODE="preview"
    DEPLOY_CMD="vercel"
    print_info "Preview deployment selected"
fi

# ============================================
# Check Vercel Project Linkage
# ============================================

print_header "Vercel Project Setup"

if [ ! -d ".vercel" ]; then
    print_info "First time deployment - linking to Vercel..."
    echo ""
    echo "You'll be prompted to:"
    echo "  1. Login to Vercel (if not already)"
    echo "  2. Choose your scope/team"
    echo "  3. Link or create project"
    echo ""
    read -p "Press Enter to continue..."

    vercel link

    if [ $? -ne 0 ]; then
        print_error "Failed to link Vercel project"
        exit 1
    fi
    print_success "Vercel project linked"
else
    print_success "Vercel project already linked"
fi

# ============================================
# Environment Variables Setup
# ============================================

print_header "Environment Variables"

echo "We need to set up environment variables in Vercel."
echo ""
echo "The following will be configured:"
echo "  - SESSION_SECRET (new, secure)"
echo "  - MONGO_URI (from your .env)"
echo "  - GOOGLE_CLIENT_ID (from your .env)"
echo "  - GOOGLE_CLIENT_SECRET (from your .env)"
echo "  - NODE_ENV=production"
echo ""
echo "You'll need to manually set these Vercel-specific vars after first deploy:"
echo "  - GOOGLE_CALLBACK_URL=https://YOUR-DOMAIN.vercel.app/auth/google/callback"
echo "  - FRONTEND_URL=https://YOUR-DOMAIN.vercel.app"
echo "  - ALLOWED_ORIGIN=https://YOUR-DOMAIN.vercel.app"
echo ""
read -p "Set environment variables now? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Setting environment variables..."

    # Set SESSION_SECRET
    echo "$PROD_SESSION_SECRET" | vercel env add SESSION_SECRET $DEPLOY_MODE --force 2>/dev/null || \
        echo "$PROD_SESSION_SECRET" | vercel env add SESSION_SECRET $DEPLOY_MODE

    # Set MONGO_URI
    echo "$MONGO_URI" | vercel env add MONGO_URI $DEPLOY_MODE --force 2>/dev/null || \
        echo "$MONGO_URI" | vercel env add MONGO_URI $DEPLOY_MODE

    # Set GOOGLE credentials if available
    if [ -n "$GOOGLE_CLIENT_ID" ]; then
        echo "$GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID $DEPLOY_MODE --force 2>/dev/null || \
            echo "$GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID $DEPLOY_MODE
    fi

    if [ -n "$GOOGLE_CLIENT_SECRET" ]; then
        echo "$GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET $DEPLOY_MODE --force 2>/dev/null || \
            echo "$GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET $DEPLOY_MODE
    fi

    # Set NODE_ENV
    echo "production" | vercel env add NODE_ENV $DEPLOY_MODE --force 2>/dev/null || \
        echo "production" | vercel env add NODE_ENV $DEPLOY_MODE

    print_success "Environment variables configured"
else
    print_warning "Skipping environment variable setup"
    print_warning "You'll need to set these manually in Vercel dashboard"
fi

# ============================================
# Build Test (Optional)
# ============================================

print_header "Build Verification"

read -p "Test build locally before deploying? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Testing frontend build..."
    cd web
    npm run build
    if [ $? -ne 0 ]; then
        print_error "Frontend build failed!"
        exit 1
    fi
    cd ..
    print_success "Frontend build successful"
fi

# ============================================
# Git Commit (if needed)
# ============================================

if [ -n "$(git status --porcelain)" ]; then
    print_header "Git Commit"

    echo "Uncommitted changes detected:"
    git status --short
    echo ""
    read -p "Commit these changes? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " COMMIT_MSG
        git add .
        git commit -m "$COMMIT_MSG"
        print_success "Changes committed"
    fi
fi

# ============================================
# Deploy!
# ============================================

print_header "Deploying to Vercel"

print_info "Running: $DEPLOY_CMD"
echo ""

$DEPLOY_CMD

DEPLOY_EXIT_CODE=$?

# ============================================
# Post-deployment
# ============================================

if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
    print_header "Deployment Successful!"

    echo ""
    print_success "Deployment completed successfully"
    echo ""

    if [ "$DEPLOY_MODE" = "preview" ]; then
        print_info "This is a PREVIEW deployment"
        echo ""
        echo "Next steps:"
        echo "  1. Test the preview URL thoroughly"
        echo "  2. Update Google OAuth with preview URL:"
        echo "     - Go to: https://console.cloud.google.com/apis/credentials"
        echo "     - Add preview URL to authorized origins & redirect URIs"
        echo "  3. Set these env vars in Vercel dashboard:"
        echo "     GOOGLE_CALLBACK_URL=https://YOUR-URL.vercel.app/auth/google/callback"
        echo "     FRONTEND_URL=https://YOUR-URL.vercel.app"
        echo "     ALLOWED_ORIGIN=https://YOUR-URL.vercel.app"
        echo "  4. When ready, run: ./scripts/deploy.sh and choose Production"
    else
        print_success "PRODUCTION DEPLOYMENT LIVE!"
        echo ""
        echo "Post-deployment checklist:"
        echo "  [ ] Test Google OAuth login"
        echo "  [ ] Verify first user becomes admin"
        echo "  [ ] Test all domain pages"
        echo "  [ ] Check security logs"
        echo "  [ ] Test on mobile"
    fi

    echo ""
    print_info "View deployment: vercel ls"
    print_info "View logs: vercel logs"
    print_info "View env vars: vercel env ls"

else
    print_error "Deployment failed!"
    echo ""
    echo "Common issues:"
    echo "  - Build errors: Check logs above"
    echo "  - Missing env vars: Run 'vercel env ls'"
    echo "  - Vercel not logged in: Run 'vercel login'"
    exit 1
fi
