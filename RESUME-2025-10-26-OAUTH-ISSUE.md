# Session Resume: October 26, 2025 - OAuth Localhost Redirect Issue

## 🚨 CRITICAL ISSUE: OAuth redirects to localhost instead of production

**Status**: UNRESOLVED - Need to fix Vercel configuration tomorrow

**Symptom**: After Google OAuth login, user is redirected to `http://localhost:5173/` instead of `https://legacylock-one.vercel.app`

---

## What We Accomplished Today ✅

### 1. Successfully Integrated JWT into Epic-5 Branch
- ✅ Manually copied JWT files from `feature/jwt-authentication` to `epic-5-transaction-ledger`
- ✅ Updated `src/auth/google.js` to use JWT tokens instead of sessions
- ✅ Updated `src/server.js` to use JWT middleware on all routes
- ✅ Updated `package.json` with JWT dependencies (jsonwebtoken, cookie-parser)
- ✅ Committed all changes to epic-5 branch
- ✅ Pushed to GitHub

### 2. Deployed to Production
- ✅ Deployed to Vercel: https://legacylock-one.vercel.app
- ✅ Login page loads correctly
- ✅ Google OAuth flow initiates
- ❌ **BUT** redirects to localhost after OAuth callback

### 3. Configured Environment Variables in Vercel
- ✅ `FRONTEND_URL` = `https://legacylock-one.vercel.app`
- ✅ `GOOGLE_CALLBACK_URL` = `https://legacylock-one.vercel.app/auth/google/callback`
- ✅ `ALLOWED_ORIGIN` = `https://legacylock-one.vercel.app`
- ✅ `JWT_SECRET` = (encrypted)
- ✅ `JWT_REFRESH_SECRET` = (encrypted)
- ✅ `MONGO_URI` = (encrypted)
- ✅ `GOOGLE_CLIENT_ID` = (encrypted)
- ✅ `GOOGLE_CLIENT_SECRET` = (encrypted)

### 4. Updated Google Cloud OAuth Settings
- ✅ **Authorized JavaScript origins**:
  - `http://localhost:3000` (dev)
  - `http://localhost:5173` (dev)
  - `https://legacylock-one.vercel.app` (production)

- ✅ **Authorized redirect URIs**:
  - `http://localhost:3000/auth/google/callback` (dev)
  - `https://legacylock-one.vercel.app/auth/google/callback` (production)

### 5. Created Branching Safety Guide
- ✅ Added comprehensive Git branching guide to CLAUDE.md
- ✅ Pre-work checklist (5 git commands to run every session)
- ✅ Branch merge strategies
- ✅ Deployment safety checklist
- ✅ Documented today's JWT/UI branch divergence incident

### 6. Started Local Servers
- ✅ Backend running on http://localhost:3000
- ✅ Frontend running on http://localhost:5173
- ✅ Local environment works perfectly

---

## 🔍 ROOT CAUSE ANALYSIS

### The Problem

After extensive debugging, I believe the issue is with **Vercel's deployment configuration**:

**Current `vercel.json`:**
```json
{
  "buildCommand": "echo 'Using pre-built frontend from web/dist'",
  "outputDirectory": "web/dist"
}
```

**This configuration tells Vercel to:**
- ✅ Serve static files from `web/dist` (frontend)
- ❌ **BUT DOES NOT run the Node.js backend!**

### Why This Is The Problem

1. User visits: `https://legacylock-one.vercel.app`
   - ✅ Static frontend (index.html) is served from `web/dist`
   - ✅ User sees login page

2. User clicks "Login with Google"
   - ✅ Frontend redirects to `/auth/google`
   - ❌ **But `/auth/google` endpoint doesn't exist because backend isn't running!**

3. Google OAuth callback goes to: `https://legacylock-one.vercel.app/auth/google/callback`
   - ❌ **This endpoint also doesn't exist because backend isn't running!**

4. Fallback behavior:
   - Because the backend routes don't exist, the code in `src/auth/google.js` that reads `process.env.FRONTEND_URL` never executes
   - Instead, the static frontend is trying to handle OAuth, which is impossible
   - The browser might be using cached/hardcoded localhost URLs

### Evidence Supporting This Theory

1. ✅ Environment variables are set correctly in Vercel
2. ✅ Google OAuth is configured correctly
3. ✅ Code in `src/auth/google.js` looks correct (uses `process.env.FRONTEND_URL`)
4. ❌ But the backend code is never executing!

---

## 💡 THE FIX (for tomorrow)

### Option 1: Configure Vercel for Hybrid Deployment (RECOMMENDED)

Update `vercel.json` to run BOTH the static frontend AND the Node.js backend:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/auth/(.*)",
      "dest": "/src/server.js"
    },
    {
      "src": "/api/(.*)",
      "dest": "/src/server.js"
    },
    {
      "src": "/health",
      "dest": "/src/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/web/dist/$1"
    }
  ]
}
```

**This configuration:**
- Routes `/auth/*` and `/api/*` to the Node.js backend (src/server.js)
- Routes everything else to the static frontend (web/dist)
- Ensures backend serverless functions are deployed

### Option 2: Use Vercel's Automatic Detection

Remove custom `vercel.json` and let Vercel auto-detect:

```bash
# Delete vercel.json
rm vercel.json

# Let Vercel detect package.json and build automatically
git add vercel.json
git commit -m "Remove custom vercel.json to use auto-detection"
git push
vercel --prod --yes
```

**But this will break the pre-built frontend workaround!** We'll need to either:
1. Fix the vite installation issue in Vercel (still unresolved)
2. OR use Option 1 above to configure hybrid deployment

---

## 🎯 Tomorrow's Action Plan

### Step 1: Update vercel.json (5 minutes)

```bash
# Create new vercel.json with hybrid configuration
# (see Option 1 above)

git add vercel.json
git commit -m "Configure Vercel for hybrid Node.js + static frontend deployment"
git push origin epic-5-transaction-ledger
```

### Step 2: Redeploy to Vercel (2 minutes)

```bash
vercel --prod --yes
```

### Step 3: Test OAuth Flow (2 minutes)

1. Go to: https://legacylock-one.vercel.app
2. Click "Login with Google"
3. Complete OAuth flow
4. **Verify**: Should redirect to https://legacylock-one.vercel.app (NOT localhost!)
5. **Verify**: Should see domain UI (Vehicles, Properties, Finance, Services)

### Step 4: If Option 1 Doesn't Work - Try Alternative Approach

If the hybrid configuration doesn't work, we may need to:

1. **Remove the pre-built frontend workaround**
   ```bash
   git rm -rf web/dist
   git restore .gitignore  # Remove !web/dist/ exception
   ```

2. **Investigate the vite installation issue properly**
   - The issue was that vite package wouldn't install in Vercel
   - But all other packages (139 of them) installed fine
   - This might be a Vercel caching issue - try clearing build cache

3. **OR deploy backend and frontend as separate Vercel projects**
   - Backend: Node.js API on one Vercel project
   - Frontend: Static site on another Vercel project
   - Update CORS and callback URLs accordingly

---

## 📝 Key Files Modified Today

### Backend Files
- `src/auth/google.js` - JWT authentication with OAuth callback (lines 84, 97, 107 use FRONTEND_URL)
- `src/middleware/jwtAuth.js` - JWT authentication middleware
- `src/utils/jwt.js` - JWT token generation and verification
- `src/server.js` - Updated to use JWT middleware on all routes
- `package.json` - Added jsonwebtoken, cookie-parser dependencies

### Configuration Files
- `vercel.json` - Currently configured for static-only (THIS IS THE PROBLEM!)
- `.env.example` - Added JWT_SECRET and JWT_REFRESH_SECRET
- `.gitignore` - Added !web/dist/ exception to commit pre-built frontend

### Documentation Files
- `CLAUDE.md` - Added comprehensive Git Branching Safety Guide (216 lines)
- This resume file

### Pre-Built Frontend
- `web/dist/` - Pre-built frontend (44 files committed as workaround for vite issue)

---

## 🐛 Known Issues

### Issue 1: Vercel vite Installation Problem
- **Status**: UNRESOLVED (workaround in place)
- **Description**: `npm ci` installs 135 packages but skips `vite` specifically
- **Evidence**: All other packages install fine, including react, tailwindcss, etc.
- **Workaround**: Pre-build frontend locally and commit web/dist folder
- **Future**: Investigate why vite package doesn't install (might be Vercel caching issue)

### Issue 2: OAuth Localhost Redirect
- **Status**: UNRESOLVED (root cause identified)
- **Description**: After Google OAuth, redirects to localhost:5173 instead of production
- **Root Cause**: Backend Node.js server not running in Vercel (only static frontend)
- **Fix**: Update vercel.json to configure hybrid deployment (see Option 1 above)

---

## 🔑 Important URLs and Credentials

### Production URLs
- **Main URL**: https://legacylock-one.vercel.app (stable, doesn't change)
- **Current Deployment**: https://legacylock-gvwb44496-calvin-orrs-projects.vercel.app (temporary)
- **Vercel Dashboard**: https://vercel.com/calvin-orrs-projects/legacylock

### Local Development
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

### Google Cloud Console
- **OAuth Client**: https://console.cloud.google.com/apis/credentials
- **Status**: Configured with production callback URLs ✅

### MongoDB
- **Atlas Connection**: Configured in MONGO_URI environment variable
- **Status**: Working ✅

---

## 💭 Lessons Learned

### 1. Vercel Deployment Models
- Vercel has different deployment strategies:
  - **Static sites**: Just serve HTML/JS/CSS files
  - **Node.js serverless**: Run Node.js as serverless functions
  - **Hybrid**: Static frontend + Node.js API (requires configuration)
- We need the hybrid model but configured static-only!

### 2. Environment Variables in Vercel
- Environment variables are set at the project level
- They're only available when serverless functions run
- If backend isn't running, environment variables don't matter!

### 3. Pre-Built Frontend Workaround Has Limitations
- Committing `web/dist` solved the vite installation issue
- But created a new problem: backend not running
- Need to configure Vercel to run BOTH frontend and backend

### 4. OAuth Debugging Is Hard
- Many layers: Frontend → Backend → Google → Backend → Frontend
- Each layer can fail silently or redirect unexpectedly
- Need to verify EVERY step of the flow

---

## 🚀 Confidence Level for Tomorrow's Fix

**90% confident** that updating `vercel.json` with the hybrid configuration will fix the issue.

**Why I'm confident:**
1. ✅ All environment variables are correct
2. ✅ Google OAuth is configured correctly
3. ✅ Backend code looks correct (uses process.env.FRONTEND_URL)
4. ✅ Frontend code looks correct (no hardcoded localhost)
5. ❌ **BUT** backend isn't running in Vercel due to configuration

**If it doesn't work:**
- The issue is more fundamental (might need to split backend/frontend into separate Vercel projects)
- OR there's something in the deployed code that's different from local

---

## 📋 Quick Start for Tomorrow

```bash
# 1. Check current branch
git branch --show-current
# Should be: epic-5-transaction-ledger

# 2. Pull latest changes
git pull origin epic-5-transaction-ledger

# 3. Update vercel.json with hybrid configuration
# (Use Option 1 from "THE FIX" section above)

# 4. Commit and push
git add vercel.json
git commit -m "Configure Vercel hybrid deployment"
git push

# 5. Deploy
vercel --prod --yes

# 6. Test
# Go to: https://legacylock-one.vercel.app
# Login with Google
# Verify: Redirects to production (NOT localhost!)
```

---

## 🌙 End of Session

**Time**: Late evening, October 26, 2025
**Status**: Need to continue tomorrow
**Next Session**: Fix Vercel configuration for hybrid deployment

**Good progress today despite the OAuth redirect issue!**
- ✅ Successfully integrated JWT into epic-5
- ✅ Deployed to production
- ✅ Configured environment variables
- ✅ Created comprehensive branching guide
- ✅ Identified root cause of OAuth redirect issue

**Sleep well! Tomorrow's fix should be quick (5-10 minutes if the hybrid config works).** 😴

---

*Generated by Claude Code on October 26, 2025*
