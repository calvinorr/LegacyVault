# Vercel Deployment Troubleshooting Summary

**Date:** October 26, 2025
**Status:** Deployment issues persist after multiple fix attempts

## Current Deployment URL
- **Main URL:** https://legacylock-one.vercel.app
- **Vercel Project:** legacylock
- **Latest Deployment:** https://legacylock-8qykxix5b-calvin-orrs-projects.vercel.app

## Environment Variables Set
All environment variables have been set in Vercel production environment using `printf` (to avoid newline issues):
- ✅ SESSION_SECRET
- ✅ MONGO_URI (MongoDB Atlas connection string)
- ✅ GOOGLE_CLIENT_ID
- ✅ GOOGLE_CLIENT_SECRET
- ✅ NODE_ENV=production
- ✅ GOOGLE_CALLBACK_URL=https://legacylock-one.vercel.app/auth/google/callback
- ✅ FRONTEND_URL=https://legacylock-one.vercel.app
- ✅ ALLOWED_ORIGIN=https://legacylock-one.vercel.app,https://legacylock-calvin-orrs-projects.vercel.app,https://legacylock-calvinorr-calvin-orrs-projects.vercel.app

## Fixes Attempted (in chronological order)

### 1. Rate Limiter - Vercel Proxy Headers
**Problem:** Rate limiter throwing ValidationError about Forwarded header
**Fix Applied:** Added custom keyGenerator to all rate limiters (src/middleware/rateLimiter.js:11-17)
```javascript
const vercelKeyGenerator = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.ip ||
         'unknown';
};
```
**Status:** ✅ Fixed - No more rate limiter errors
**Commit:** d097e7c

### 2. CORS Configuration
**Problem:** CORS blocking requests because of deployment URL mismatch
**Fix Applied:** Updated ALLOWED_ORIGIN to include all three Vercel alias URLs
**Status:** ✅ Fixed - CORS works when using correct URLs
**Note:** Must use https://legacylock-one.vercel.app (NOT unique deployment URLs)

### 3. MongoDB Connection - Serverless Compatibility
**Problem:** MongoDB timeout errors (30 seconds)
**Fix Applied:** Created serverless-compatible connection (src/db/index.js)
- Added connection caching with global variable
- Reduced serverSelectionTimeoutMS from 30s to 10s
- Added serverless-friendly connection pooling

```javascript
let cachedConnection = null;

const connect = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  // ... connect with serverless options
};
```
**Status:** ⚠️ Partial - Main connection works, session store connection still times out
**Commit:** 278d5bf

### 4. Database Connection Middleware
**Problem:** Requests processed before MongoDB connection established
**Fix Applied:** Created ensureDbConnection middleware (src/middleware/ensureDbConnection.js)
```javascript
const ensureDbConnection = async (req, res, next) => {
  if (!connectionPromise) {
    connectionPromise = db.connect().catch(err => {
      connectionPromise = null;
      throw err;
    });
  }
  await connectionPromise;
  next();
};
```
**Status:** ✅ Works - Ensures connection before processing requests
**Commit:** 278d5bf

### 5. Middleware Order Fix
**Problem:** Passport trying to deserialize users before DB connected
**Fix Applied:** Moved ensureDbConnection BEFORE session and passport (src/server.js:98)
```javascript
// Correct order:
app.use(ensureDbConnection);        // 1. Ensure DB ready
app.use(session(...));              // 2. Session store can access DB
app.use(passport.initialize());     // 3. Passport can query users
app.use(passport.session());
```
**Status:** ✅ Improved - But 401 errors still occurring
**Commit:** 76e0785

### 6. MongoStore Shared Connection (FAILED)
**Problem:** MongoStore creating second connection that times out
**Fix Attempted:** Use mongoose.connection.getClient() to share connection
```javascript
store: MongoStore.create({
  client: mongoose.connection.getClient(), // CRASHED!
})
```
**Status:** ❌ FAILED - Caused function crash (FUNCTION_INVOCATION_FAILED)
**Reason:** getClient() called before connection established
**Commit:** c0f5e39 (reverted in next commit)

### 7. MongoStore Serverless Options
**Problem:** MongoStore timeout and previous crash
**Fix Applied:** Added serverless-friendly options to MongoStore (src/server.js:111-116)
```javascript
store: MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  mongoOptions: {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1
  }
})
```
**Status:** ⚠️ Unknown - Latest deployment, untested
**Commit:** 628cc33

## Current Issues (Last Observed)

### Issue 1: MongoDB Timeout (Intermittent)
**Error:** `MongoServerSelectionError: Server selection timed out after 30000 ms`
**Frequency:** Intermittent
**Location:** MongoStore connection (not main connection)
**Latest Logs:** Shows both "MongoDB connected" (10s timeout) AND timeout errors (30s)

### Issue 2: 401 Unauthorized
**Error:** 401 responses on `/api/users/me` and `/api/categories`
**Possible Causes:**
1. Session not persisting (MongoStore issue)
2. Passport not deserializing users
3. OAuth callback not completing properly

### Issue 3: Function Crashes (Resolved?)
**Error:** `500: INTERNAL_SERVER_ERROR - FUNCTION_INVOCATION_FAILED`
**Status:** Should be fixed by reverting getClient() approach

## MongoDB Atlas Configuration
**Network Access:**
- ✅ 0.0.0.0/0 (Allow from anywhere) - CONFIRMED CONFIGURED
- ✅ Auto Setup IPs also present

**This is NOT the issue** - IP whitelisting is correct.

## Google OAuth Configuration
**Status:** ✅ Properly configured in Google Cloud Console
**Authorized redirect URIs:**
- https://legacylock-one.vercel.app/auth/google/callback

**This is NOT the issue** - OAuth URLs are correct.

## Next Steps to Investigate

### 1. Check if MongoStore is creating duplicate connections
**Action:** Review Vercel logs for two separate MongoDB connection attempts
**Command:** `vercel logs https://legacylock-one.vercel.app`
**Look for:**
- "MongoDB connected" messages
- "MongoServerSelectionError" messages
- Count how many connections are being attempted

### 2. Test session persistence
**Action:** Add detailed logging to session middleware
**Code to add to server.js:**
```javascript
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Is authenticated:', req.isAuthenticated?.());
  next();
});
```

### 3. Test locally with production environment variables
**Action:** Pull production env vars and test locally
```bash
vercel env pull .env.production.local
NODE_ENV=production node src/server.js
```

### 4. Simplify session store (temporary debugging)
**Action:** Try using Vercel's recommended approach with cookie-session
```javascript
// Temporarily replace MongoStore with cookie-session for testing
const cookieSession = require('cookie-session');
app.use(cookieSession({
  secret: process.env.SESSION_SECRET,
  maxAge: 24 * 60 * 60 * 1000
}));
```
**Note:** This is ONLY for debugging - not for production (session data in cookie)

### 5. Check Vercel function timeout settings
**Action:** Verify serverless function timeout in Vercel dashboard
**Location:** Vercel Dashboard → Project Settings → Functions
**Default:** 10 seconds (Hobby plan)
**Issue:** If MongoDB takes >10s, function times out

### 6. Consider alternative session stores
**Options:**
- **Vercel KV** (Redis) - Serverless-native, fast
- **Upstash Redis** - Free tier, designed for serverless
- **Cookie-session** - No external store needed (limited by cookie size)

### 7. Review Mongoose connection pooling
**Issue:** Multiple serverless instances may exhaust connection pool
**Action:** Check MongoDB Atlas metrics for connection count
**Fix:** Reduce maxPoolSize or increase Atlas connection limit

## Files Modified

### Core Changes
- `src/middleware/rateLimiter.js` - Added Vercel proxy header support
- `src/db/index.js` - Serverless connection caching
- `src/middleware/ensureDbConnection.js` - NEW FILE - Connection middleware
- `src/server.js` - Middleware order, MongoStore options

### Configuration
- `vercel.json` - Vercel deployment config
- `fix-vercel-env.sh` - Script to set env vars without newlines

### Documentation
- This file - Troubleshooting summary

## Working Local Development
**Status:** ✅ Application works perfectly in local development
**MongoDB:** Connects to same MongoDB Atlas instance
**Auth:** Google OAuth works locally

**This confirms:**
- MongoDB Atlas connection string is valid
- Code logic is correct
- Issue is specifically with Vercel serverless environment

## Key Differences: Local vs Vercel

| Aspect | Local Development | Vercel Serverless |
|--------|-------------------|-------------------|
| Server Type | Long-running process | Ephemeral functions |
| Connections | Persistent | Must be cached/reused |
| Cold starts | No | Yes (first request slower) |
| MongoDB pools | Works normally | Need careful tuning |
| Timeout | Unlimited | 10 seconds (Hobby) |

## Recommended Next Session

1. **Start fresh** - Clear browser cache, use incognito mode
2. **Check Vercel logs** immediately after testing to see exact error sequence
3. **Try cookie-session** temporarily to isolate if MongoStore is the issue
4. **Consider Vercel KV** for session storage (serverless-native solution)
5. **Contact Vercel support** - This seems like a common serverless session issue

## Useful Commands

```bash
# Check Vercel logs (live)
vercel logs https://legacylock-one.vercel.app

# Pull production environment variables
vercel env pull .env.production.local

# List deployments
vercel ls --prod

# Inspect specific deployment
vercel inspect <deployment-url>

# Redeploy (without changes)
vercel --prod --yes

# Check MongoDB Atlas connection from local
node -e "require('./src/db').connect().then(() => console.log('OK'))"
```

## Contact Information
- **Vercel Support:** https://vercel.com/support
- **MongoDB Atlas Support:** https://support.mongodb.com
- **connect-mongo Issues:** https://github.com/jdesboeufs/connect-mongo/issues

---

**Summary:** The app is very close to working. MongoDB connection is established, but session persistence is failing. The most likely culprit is MongoStore creating duplicate connections in the serverless environment. Consider switching to a serverless-native session store like Vercel KV or temporarily using cookie-session for debugging.
