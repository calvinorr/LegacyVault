#!/bin/bash

# ============================================
# Pre-Deployment Checklist
# ============================================
# Quick verification before deploying

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_check() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
    fi
}

print_header() {
    echo -e "\n${BLUE}$1${NC}\n"
}

echo "╔════════════════════════════════════════╗"
echo "║   Pre-Deployment Checklist             ║"
echo "╔════════════════════════════════════════╝"

# ============================================
# System Checks
# ============================================

print_header "System Requirements"

# Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    print_check "Node.js 18+ installed ($(node -v))" 0
else
    print_check "Node.js 18+ required (have $(node -v))" 1
fi

# Vercel CLI
if command -v vercel &> /dev/null; then
    print_check "Vercel CLI installed ($(vercel --version))" 0
else
    print_check "Vercel CLI installed" 1
    echo "   Install: npm install -g vercel"
fi

# Git
if command -v git &> /dev/null; then
    print_check "Git installed" 0
else
    print_check "Git installed" 1
fi

# ============================================
# Project Checks
# ============================================

print_header "Project Configuration"

# .env exists
if [ -f .env ]; then
    print_check ".env file exists" 0
    source .env

    # Check required env vars
    [ -n "$MONGO_URI" ] && print_check "MONGO_URI configured" 0 || print_check "MONGO_URI configured" 1
    [ -n "$GOOGLE_CLIENT_ID" ] && print_check "GOOGLE_CLIENT_ID configured" 0 || print_check "GOOGLE_CLIENT_ID configured" 1
    [ -n "$GOOGLE_CLIENT_SECRET" ] && print_check "GOOGLE_CLIENT_SECRET configured" 0 || print_check "GOOGLE_CLIENT_SECRET configured" 1
    [ -n "$SESSION_SECRET" ] && print_check "SESSION_SECRET configured" 0 || print_check "SESSION_SECRET configured" 1
else
    print_check ".env file exists" 1
fi

# package.json
[ -f package.json ] && print_check "package.json exists" 0 || print_check "package.json exists" 1

# vercel.json
[ -f vercel.json ] && print_check "vercel.json exists" 0 || print_check "vercel.json exists" 1

# web directory
[ -d web ] && print_check "Frontend directory exists" 0 || print_check "Frontend directory exists" 1

# Dependencies installed
if [ -d node_modules ] && [ -d web/node_modules ]; then
    print_check "Dependencies installed" 0
else
    print_check "Dependencies installed" 1
    echo "   Run: npm install && cd web && npm install"
fi

# ============================================
# Code Checks
# ============================================

print_header "Code Quality"

# Git status
if [ -z "$(git status --porcelain)" ]; then
    print_check "No uncommitted changes" 0
else
    print_check "Uncommitted changes detected" 1
    echo "   Changes: $(git status --short | wc -l | tr -d ' ') files"
fi

# Current branch
BRANCH=$(git branch --show-current)
print_check "Current branch: $BRANCH" 0

# Untracked files
UNTRACKED=$(git ls-files --others --exclude-standard | wc -l | tr -d ' ')
if [ "$UNTRACKED" -eq 0 ]; then
    print_check "No untracked files" 0
else
    print_check "Untracked files found: $UNTRACKED" 1
fi

# ============================================
# Security Checks
# ============================================

print_header "Security Configuration"

# Check if express-session is installed
if grep -q "express-session" package.json; then
    print_check "express-session installed" 0
else
    print_check "express-session installed" 1
fi

# Check if connect-mongo is installed
if grep -q "connect-mongo" package.json; then
    print_check "connect-mongo installed" 0
else
    print_check "connect-mongo installed" 1
fi

# Check logs directory
[ -d logs ] && print_check "Logs directory exists" 0 || print_check "Logs directory exists" 1

# Check security.log
[ -f logs/security.log ] && print_check "Security logging configured" 0 || print_check "Security logging configured" 1

# ============================================
# MongoDB Connection Test
# ============================================

print_header "Database Connection"

if [ -n "$MONGO_URI" ]; then
    # Check if MongoDB is accessible
    if command -v mongosh &> /dev/null 2>&1; then
        if timeout 5 mongosh "$MONGO_URI" --eval "db.adminCommand('ping')" &> /dev/null; then
            print_check "MongoDB connection successful" 0
        else
            print_check "MongoDB connection test" 1
            echo "   (Install mongosh or skip this check)"
        fi
    else
        print_check "MongoDB URI configured (connection not tested)" 0
        echo "   (Install mongosh to test connection)"
    fi
fi

# ============================================
# Summary
# ============================================

print_header "Summary"

echo "Ready to deploy? Run:"
echo -e "${BLUE}  ./scripts/deploy.sh${NC}"
echo ""
echo "First time deploying?"
echo "  1. The script will guide you through setup"
echo "  2. You'll need to update Google OAuth after first deploy"
echo "  3. Preview deployment recommended before production"
echo ""
