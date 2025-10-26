#!/bin/bash

# Fix Vercel environment variables (remove newlines)
# This fixes the OAuth 400 error caused by newlines in env vars

echo "Removing all existing environment variables..."

vercel env rm SESSION_SECRET production
vercel env rm MONGO_URI production
vercel env rm GOOGLE_CLIENT_ID production
vercel env rm GOOGLE_CLIENT_SECRET production
vercel env rm NODE_ENV production
vercel env rm GOOGLE_CALLBACK_URL production
vercel env rm FRONTEND_URL production
vercel env rm ALLOWED_ORIGIN production

echo ""
echo "Adding environment variables back (without newlines)..."
echo ""

# SESSION_SECRET
printf "e7cc3f35916f89298d595f4e592e1f828669589516abb169925cae6f12dad2ba" | vercel env add SESSION_SECRET production

# MONGO_URI
printf "mongodb+srv://calvinorr_db_user:gabrA0XxpJ6T1O33@cluster0.yihimzs.mongodb.net/household_vault?retryWrites=true&w=majority&appName=Cluster0" | vercel env add MONGO_URI production

# GOOGLE_CLIENT_ID
printf "86155620173-2741kj7fqjasrf1qhr49cvt894429lmn.apps.googleusercontent.com" | vercel env add GOOGLE_CLIENT_ID production

# GOOGLE_CLIENT_SECRET
printf "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" | vercel env add GOOGLE_CLIENT_SECRET production

# NODE_ENV
printf "production" | vercel env add NODE_ENV production

# GOOGLE_CALLBACK_URL
printf "https://legacylock-one.vercel.app/auth/google/callback" | vercel env add GOOGLE_CALLBACK_URL production

# FRONTEND_URL
printf "https://legacylock-one.vercel.app" | vercel env add FRONTEND_URL production

# ALLOWED_ORIGIN
printf "https://legacylock-one.vercel.app" | vercel env add ALLOWED_ORIGIN production

echo ""
echo "✅ All environment variables set!"
echo ""
echo "Now redeploy with: vercel --prod"
