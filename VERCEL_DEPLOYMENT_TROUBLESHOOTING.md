# Vercel Deployment Troubleshooting Summary

**Date:** October 26, 2025
**Status:** Deployment issues persist - Session persistence not working

## Current Deployment URL
- **Main URL:** https://legacylock-one.vercel.app
- **Vercel Project:** legacylock
- **Latest Deployment:** https://legacylock-4phmje9po-calvin-orrs-projects.vercel.app

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
const vercelKeyGenerator = (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
             req.headers['x-real-ip'] ||
             req.ip ||
             'unknown';
  return ip.replace(/:\d+[^:]*$/, '');
};
```
**Status:** ✅ Fixed - No more rate limiter errors
**Commit:** d097e7c, b9f2f34

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
- Added connection promise handling

```javascript
let cachedConnection = null;
let connectionPromise = null;

const connect = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  // ... connect with serverless options
};
```
**Status:** ✅ Fixed - Main connection works
**Commit:** 278d5bf, b9f2f34

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
**Status:** ⚠️ Partial - Connection works but sessions not persisting
**Commit:** 628cc33

### 8. Lazy-Initialized Session Middleware (Oct 26, 2025)
**Problem:** Race condition between MongoDB connections in serverless
**Fix Applied:** Created lazy-initialized session middleware with connection sharing
```javascript
const sessionMiddleware = (() => {
  let middleware = null;
  let initializationPromise = null;
  
  return async (req, res, next) => {
    if (!middleware) {
      // Initialize session store after DB connection
      await db.connect();
      middleware = session({
        // ... session config
        store: MongoStore.create({
          mongoUrl: process.env.MONGO_URI,
          // ... mongo options
        })
      });
    }
    middleware(req, res, next);
  };
})();
```
**Status:** ⚠️ Partial - MongoDB connects but sessions still not persisting
**Commit:** b9f2f34, 1e0e760

### 9. Cookie Configuration Fix (Oct 26, 2025)
**Problem:** Cookie domain `.vercel.app` too broad, sameSite issues
**Fix Applied:** Updated cookie configuration
```javascript
cookie: {
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: 'lax',
  // Removed domain setting - let it default
},
name: 'connect.sid', // Use default session name
proxy: process.env.NODE_ENV === 'production',
rolling: true // Reset expiry on activity
```
**Status:** ❌ FAILED - Sessions still not persisting, 401 errors continue
**Commit:** 7350a6f

## Current Issues (Last Observed - Oct 26, 2025)

### Issue 1: Session Not Persisting
**Error:** 401 responses on `/api/users/me` and `/api/categories`
**Symptoms:**
- MongoDB connects successfully
- Session store initializes successfully
- But sessions are not maintained between requests
- Each request seems to create a new session

### Issue 2: Serverless Function Isolation
**Problem:** Each serverless function invocation is isolated
**Impact:** 
- Sessions created in one function may not be accessible in another
- Cookie/session state not properly shared between function invocations

### Issue 3: MongoStore Connection Issues
**Problem:** Even with connection sharing attempts, MongoStore may be creating issues
**Observation:** Session store initializes but doesn't persist data properly

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

## Root Cause Analysis

The core issue appears to be **session persistence in Vercel's serverless environment**:

1. **Serverless Function Isolation**: Each request may be handled by a different serverless function instance
2. **Session Store Issues**: MongoStore is connecting but not properly persisting/retrieving sessions
3. **Cookie Issues**: Sessions cookies may not be properly set or read in the serverless environment

## Next Steps to Investigate

### 1. Alternative Session Storage Solutions
**Consider switching from MongoStore to:**
- **Vercel KV** (Redis) - Serverless-native, designed for Vercel
- **Upstash Redis** - Free tier, serverless-optimized
- **JWT Tokens** - Stateless authentication (no session store needed)

### 2. Debug Session Cookie Behavior
**Add detailed logging:**
```javascript
app.use((req, res, next) => {
  console.log('Request headers:', req.headers);
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  console.log('Cookies:', req.cookies);
  next();
});
```

### 3. Test with Simpler Session Configuration
**Try memory store temporarily (for debugging only):**
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  // No store specified - uses memory store
}));
```

### 4. Consider Stateless Authentication
**Switch to JWT-based authentication:**
- No session store needed
- Works perfectly in serverless
- Each request is self-contained

### 5. Use Vercel KV for Sessions
**Install and configure Vercel KV:**
```bash
npm install @vercel/kv
```
```javascript
import { kv } from '@vercel/kv';
// Use KV for session storage
```

## Files Modified

### Core Changes
- `src/middleware/rateLimiter.js` - Added Vercel proxy header support
- `src/db/index.js` - Serverless connection caching with promises
- `src/middleware/ensureDbConnection.js` - Connection middleware
- `src/server.js` - Lazy session initialization, cookie configuration

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
| Session State | In-memory/MongoDB | Needs external store |
| Function Isolation | Single process | Multiple isolated functions |

## Recommended Solution

Based on the persistent issues with MongoDB session storage in Vercel's serverless environment, the recommended approach is to:

1. **Switch to Vercel KV (Redis)** for session storage
   - Designed specifically for Vercel's serverless environment
   - Low latency, high performance
   - Built-in support for session management

2. **Or implement JWT-based authentication**
   - Completely stateless
   - No session store needed
   - Perfect for serverless environments

3. **As a last resort**: Consider moving to a different hosting platform that supports traditional Node.js applications (not serverless)

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

**Summary:** The application successfully connects to MongoDB and initializes the session store, but sessions are not persisting between requests in Vercel's serverless environment. This is a fundamental limitation of using traditional session-based authentication with MongoDB in a serverless architecture. The solution is to either switch to a serverless-native session store (Vercel KV/Redis) or implement stateless authentication (JWT).
