# Session Resume: October 26, 2025 (Evening) - OAuth Issue Still Unresolved

## 🚨 CRITICAL ISSUE: OAuth still redirects to localhost after vercel.json fix

**Status**: UNRESOLVED - Hybrid configuration deployed but issue persists

**Symptom**: After Google OAuth login, user is still redirected to `http://localhost:5173/` instead of `https://legacylock-one.vercel.app`

---

## What We Tried This Evening ✅

### 1. Updated vercel.json for Hybrid Deployment
- ✅ Changed from static-only to hybrid configuration
- ✅ Added Node.js backend serverless function support
- ✅ Configured routes:
  - `/auth/*` → Node.js backend
  - `/api/*` → Node.js backend
  - `/health` → Node.js backend
  - `/*` → Static frontend
- ✅ Committed and pushed to GitHub
- ✅ Deployed to Vercel production

### 2. Deployment Successful
- ✅ Build completed without errors
- ✅ 131 packages installed
- ✅ Deployment status: Ready
- ✅ URL: https://legacylock-one.vercel.app

### 3. Testing Result
- ❌ **STILL redirects to localhost after OAuth**

---

## 🔍 Why The Fix Didn't Work

The hybrid vercel.json configuration should have worked, but it didn't. Here are possible reasons:

### Theory 1: Serverless Functions Not Created Correctly
**Problem**: Vercel might not be creating serverless functions from `src/server.js`

**Why**: The `@vercel/node` builder expects specific file structure:
- Typically looks for `api/*.js` files
- Our setup routes to `src/server.js` which might not be compatible

**Evidence Needed**:
- Check if serverless functions were created in deployment
- Test if `/health` endpoint works: `curl https://legacylock-one.vercel.app/health`
- Test if `/auth/google` endpoint exists

### Theory 2: Environment Variables Not Available to Serverless Functions
**Problem**: `process.env.FRONTEND_URL` might not be accessible in serverless context

**Why**: Vercel serverless functions sometimes have different environment variable access patterns

**Evidence Needed**:
- Add logging to check if `FRONTEND_URL` is undefined
- Verify environment variables are set for "Production" environment (not just preview)

### Theory 3: Browser/Google OAuth Caching
**Problem**: Browser or Google OAuth might be caching the redirect URL

**Why**: OAuth redirect URLs can be cached by the browser or Google's systems

**Evidence Needed**:
- Try in incognito/private browser window
- Clear all site data for legacylock-one.vercel.app
- Check if Google OAuth console shows correct callback URL

### Theory 4: Express App Not Compatible with Serverless
**Problem**: Our Express app (`src/server.js`) might not be compatible with Vercel's serverless environment

**Why**:
- Express apps need to export the app without starting the server
- Our `src/server.js` has `app.listen()` which shouldn't run in serverless

**Evidence**:
- `src/server.js` line 197: `app.listen(port, '0.0.0.0', ...)`
- This needs to be conditional: only listen if not in Vercel

---

## 💡 NEXT DEBUGGING STEPS (For When You Return)

### Step 1: Verify Serverless Functions Exist (2 minutes)

Test if backend endpoints are accessible:

```bash
# Test health endpoint
curl -I https://legacylock-one.vercel.app/health

# Test OAuth endpoint (should redirect to Google)
curl -I https://legacylock-one.vercel.app/auth/google

# Check deployment logs for serverless function creation
vercel logs https://legacylock-one.vercel.app --since 1h
```

**Expected**:
- `/health` should return 200 and JSON
- `/auth/google` should return 302 redirect to Google
- Logs should show serverless function invocations

**If endpoints don't work**: The serverless functions aren't being created correctly

### Step 2: Fix Express App for Serverless (5 minutes)

Update `src/server.js` to export app without listening in Vercel:

```javascript
// At the end of src/server.js, replace app.listen() with:

// Export for Vercel serverless
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // Only listen when running locally
  const port = process.env.PORT || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}
```

Then redeploy:
```bash
git add src/server.js
git commit -m "Fix Express app for Vercel serverless environment"
git push
vercel --prod --yes
```

### Step 3: Alternative Vercel Configuration (10 minutes)

If above doesn't work, try a different Vercel configuration that uses `api/` directory:

**Option A: Create API Directory Structure**

```bash
# Create api directory
mkdir -p api

# Create serverless function wrapper
cat > api/[...path].js << 'EOF'
// Import the Express app
const app = require('../src/server.js');

// Export as serverless function
module.exports = app;
EOF
```

Update `vercel.json`:
```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/[...path]" },
    { "source": "/auth/(.*)", "destination": "/api/[...path]" },
    { "source": "/health", "destination": "/api/[...path]" }
  ]
}
```

### Step 4: Add Debugging to OAuth Callback (5 minutes)

Add logging to see what's happening:

Update `src/auth/google.js` around line 107:

```javascript
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    // ADD DEBUGGING
    console.log('OAuth callback triggered');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('VERCEL env:', process.env.VERCEL);

    if (!req.user.approved) {
      const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
      console.log('User not approved, redirecting to:', frontend);
      return res.redirect(`${frontend}?message=pending-approval`);
    }

    const accessToken = generateAccessToken(req.user);
    const refreshToken = generateRefreshToken(req.user);

    setTokenCookie(res, 'accessToken', accessToken, false);
    setTokenCookie(res, 'refreshToken', refreshToken, true);

    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    console.log('Redirecting to:', frontend);
    res.redirect(frontend);
  });
```

Then check logs after OAuth:
```bash
vercel logs https://legacylock-one.vercel.app --since 5m
```

---

## 🎯 ALTERNATIVE SOLUTION: Split Frontend/Backend (Last Resort)

If serverless functions continue to fail, consider splitting into two Vercel projects:

### Backend Project
1. Create new Vercel project: `legacylock-api`
2. Deploy only backend (`src/`)
3. Configure as Node.js application

### Frontend Project
1. Keep existing `legacylock` project
2. Deploy only frontend (`web/dist`)
3. Update `VITE_API_URL` to point to backend project

### Benefits
- Clearer separation of concerns
- Easier to debug
- Backend can use traditional Node.js deployment (not serverless)

### Drawbacks
- Two projects to manage
- More complex CORS configuration
- Additional Vercel project costs (if exceeding free tier)

---

## 📝 Key Files Status

### `/vercel.json` (Updated This Session)
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

### `src/server.js` (Potential Issue)
- Line 197: `app.listen()` might prevent serverless function export
- Needs conditional export for Vercel environment

### `src/auth/google.js` (OAuth callback)
- Lines 84, 97, 107: Use `process.env.FRONTEND_URL`
- Need to add logging to debug

---

## 🔑 Important URLs

### Production URLs
- **Main URL**: https://legacylock-one.vercel.app
- **Latest Deployment**: https://legacylock-bg3x3ijpi-calvin-orrs-projects.vercel.app
- **Vercel Dashboard**: https://vercel.com/calvin-orrs-projects/legacylock

### Environment Variables (Set in Vercel)
- ✅ `FRONTEND_URL` = `https://legacylock-one.vercel.app`
- ✅ `GOOGLE_CALLBACK_URL` = `https://legacylock-one.vercel.app/auth/google/callback`
- ✅ All other env vars configured correctly

### Google Cloud Console
- ✅ OAuth redirect URIs configured correctly

---

## 💭 Reflection

**Why I Was Wrong:**
Yesterday I was 90% confident the hybrid vercel.json would fix the issue. I was wrong because:

1. I assumed Vercel would automatically create serverless functions from `src/server.js`
2. I didn't consider that Express apps need special handling for serverless
3. I didn't verify the `/health` endpoint was working before testing OAuth

**What I Learned:**
- Vercel serverless functions require specific file structure or configuration
- Express apps need conditional exports for serverless environments
- Always test simpler endpoints (like `/health`) before testing complex flows (like OAuth)

**Confidence Now:**
- 70% confident that fixing `src/server.js` to properly export for serverless will fix the issue
- If that doesn't work, the split frontend/backend approach will definitely work (but more complex)

---

## 🚀 Quick Start For Next Session

```bash
# 1. Check current branch
git branch --show-current
# Should be: epic-5-transaction-ledger

# 2. Test if backend endpoints work
curl -I https://legacylock-one.vercel.app/health
curl -I https://legacylock-one.vercel.app/auth/google

# 3. If endpoints don't work, fix src/server.js (see Step 2 above)

# 4. If endpoints DO work, add debugging to OAuth callback (see Step 4 above)

# 5. Redeploy and check logs
vercel --prod --yes
vercel logs https://legacylock-one.vercel.app --since 5m
```

---

## 🌙 End of Session

**Time**: Evening, October 26, 2025
**Status**: Frustrated but not giving up
**Next Session**: Debug serverless functions and OAuth callback

**Take a Break**: This is frustrating, and that's completely valid. The good news is we're narrowing down the problem. The next session will focus on methodical debugging to understand exactly what's happening in production.

**You've Got This**: We'll figure this out. Sometimes deployment issues require multiple iterations. Take your break, and when you're ready, we'll tackle this step by step.

---

*Generated by Claude Code on October 26, 2025*
