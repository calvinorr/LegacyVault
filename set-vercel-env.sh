#!/bin/bash

# Quick script to set all Vercel environment variables
# Run this after your first deployment

echo "Setting Vercel environment variables for production..."
echo ""

# SESSION_SECRET (production)
echo "e7cc3f35916f89298d595f4e592e1f828669589516abb169925cae6f12dad2ba" | vercel env add SESSION_SECRET production

# MONGO_URI
echo "mongodb+srv://calvinorr_db_user:gabrA0XxpJ6T1O33@cluster0.yihimzs.mongodb.net/household_vault?retryWrites=true&w=majority&appName=Cluster0" | vercel env add MONGO_URI production

# GOOGLE_CLIENT_ID
echo "86155620173-2741kj7fqjasrf1qhr49cvt894429lmn.apps.googleusercontent.com" | vercel env add GOOGLE_CLIENT_ID production

# GOOGLE_CLIENT_SECRET
echo "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" | vercel env add GOOGLE_CLIENT_SECRET production

# NODE_ENV
echo "production" | vercel env add NODE_ENV production

# GOOGLE_CALLBACK_URL (with your actual URL)
echo "https://legacylock-one.vercel.app/auth/google/callback" | vercel env add GOOGLE_CALLBACK_URL production

# FRONTEND_URL
echo "https://legacylock-one.vercel.app" | vercel env add FRONTEND_URL production

# ALLOWED_ORIGIN
echo "https://legacylock-one.vercel.app" | vercel env add ALLOWED_ORIGIN production

echo ""
echo "✅ All environment variables set!"
echo ""
echo "Next step: Update Google OAuth Console"
echo "  1. Go to: https://console.cloud.google.com/apis/credentials"
echo "  2. Click your OAuth 2.0 Client ID"
echo "  3. Add to Authorized JavaScript origins:"
echo "     https://legacylock-one.vercel.app"
echo "  4. Add to Authorized redirect URIs:"
echo "     https://legacylock-one.vercel.app/auth/google/callback"
echo "  5. Click Save"
echo ""
