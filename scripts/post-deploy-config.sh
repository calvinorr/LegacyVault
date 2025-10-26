#!/bin/bash

# ============================================
# Post-Deployment Configuration
# ============================================
# Updates Vercel env vars with actual deployment URL

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ============================================
# Get Deployment URL
# ============================================

print_header "Post-Deployment Configuration"

echo "This script configures Vercel environment variables"
echo "with your actual deployment URL."
echo ""

# Ask for deployment URL
read -p "Enter your Vercel deployment URL (e.g., https://legacylock.vercel.app): " DEPLOY_URL

# Remove trailing slash if present
DEPLOY_URL=${DEPLOY_URL%/}

# Validate URL format
if [[ ! $DEPLOY_URL =~ ^https:// ]]; then
    print_error "URL must start with https://"
    exit 1
fi

print_info "Using URL: $DEPLOY_URL"

# Ask for environment (production or preview)
echo ""
echo "Which environment?"
echo "1) Production"
echo "2) Preview"
read -p "Enter choice (1 or 2): " ENV_CHOICE

if [ "$ENV_CHOICE" = "1" ]; then
    ENV_TYPE="production"
else
    ENV_TYPE="preview"
fi

print_info "Environment: $ENV_TYPE"

# ============================================
# Update Environment Variables
# ============================================

print_header "Updating Environment Variables"

# GOOGLE_CALLBACK_URL
print_info "Setting GOOGLE_CALLBACK_URL..."
echo "${DEPLOY_URL}/auth/google/callback" | vercel env add GOOGLE_CALLBACK_URL $ENV_TYPE --force 2>/dev/null || \
    echo "${DEPLOY_URL}/auth/google/callback" | vercel env add GOOGLE_CALLBACK_URL $ENV_TYPE
print_success "GOOGLE_CALLBACK_URL set"

# FRONTEND_URL
print_info "Setting FRONTEND_URL..."
echo "$DEPLOY_URL" | vercel env add FRONTEND_URL $ENV_TYPE --force 2>/dev/null || \
    echo "$DEPLOY_URL" | vercel env add FRONTEND_URL $ENV_TYPE
print_success "FRONTEND_URL set"

# ALLOWED_ORIGIN
print_info "Setting ALLOWED_ORIGIN..."
echo "$DEPLOY_URL" | vercel env add ALLOWED_ORIGIN $ENV_TYPE --force 2>/dev/null || \
    echo "$DEPLOY_URL" | vercel env add ALLOWED_ORIGIN $ENV_TYPE
print_success "ALLOWED_ORIGIN set"

# ============================================
# Google OAuth Configuration
# ============================================

print_header "Google OAuth Configuration"

echo "You need to update Google OAuth settings:"
echo ""
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Click on your OAuth 2.0 Client ID"
echo "3. Add these URLs:"
echo ""
echo -e "${YELLOW}Authorized JavaScript origins:${NC}"
echo "   $DEPLOY_URL"
echo ""
echo -e "${YELLOW}Authorized redirect URIs:${NC}"
echo "   ${DEPLOY_URL}/auth/google/callback"
echo ""
echo "4. Click 'Save'"
echo ""

read -p "Press Enter when you've updated Google OAuth..."

# ============================================
# Redeploy
# ============================================

print_header "Redeploy with New Settings"

echo "Environment variables have been updated."
echo "You need to redeploy for changes to take effect."
echo ""

read -p "Deploy now? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ "$ENV_TYPE" = "production" ]; then
        print_info "Deploying to production..."
        vercel --prod
    else
        print_info "Deploying preview..."
        vercel
    fi

    print_success "Deployment complete!"
else
    print_info "Skipping deployment"
    echo ""
    echo "Deploy manually when ready:"
    if [ "$ENV_TYPE" = "production" ]; then
        echo "  vercel --prod"
    else
        echo "  vercel"
    fi
fi

# ============================================
# Summary
# ============================================

print_header "Configuration Complete!"

echo "Environment variables set:"
echo "  GOOGLE_CALLBACK_URL=${DEPLOY_URL}/auth/google/callback"
echo "  FRONTEND_URL=$DEPLOY_URL"
echo "  ALLOWED_ORIGIN=$DEPLOY_URL"
echo ""
echo "Next steps:"
echo "  1. Verify Google OAuth is updated"
echo "  2. Test login at: $DEPLOY_URL"
echo "  3. Check logs: vercel logs"
echo ""
