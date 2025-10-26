# Pre-Production Status - LegacyLock
**Branch**: `pre-production-polish`
**Last Updated**: October 26, 2025
**Status**: Ready for critical security tasks before deployment

---

## 🎯 Next Session: Start Here

**Run these commands to continue:**
```bash
cd /Users/calvinorr/Dev/Projects/SimpleHomeFinance-badm
git checkout pre-production-polish
npm run dev  # Terminal 1 - Backend (port 3000)
cd web && npm run dev  # Terminal 2 - Frontend (port 5173)
```

---

## ✅ Completed This Session (13 Tasks)

### Security Hardening
- [x] Environment validation (no fallback secrets allowed)
- [x] Rate limiting (5 auth attempts/15min, 100 API calls/15min)
- [x] Security audit (68 auth checks across 16 route files)
- [x] Winston logging (security.log audit trail)
- [x] **User Management UI** (/admin/users - approve users)

### UI Polish
- [x] Admin dropdown navigation (cleaner menu structure)
- [x] Merged dashboards (HomePage + ModernDashboard → HomePage)
- [x] Cleaned up routes (removed -new suffixes)
- [x] **Fixed ALL light grey text** (WCAG AA compliance)
- [x] Standardized navigation spacing
- [x] Moved Settings to Admin dropdown

### Git Status
- 10 clean commits on `pre-production-polish` branch
- Ready to merge to main after testing

---

## 🔴 CRITICAL TASKS (Before Production)

### 1. 🔴 Upgrade Session Storage (~30 minutes)
**Why Critical**: Cookie-session stores session data in browser cookies (visible, limited to 4KB, no server-side invalidation)

**Files to modify**:
- `src/server.js` - Replace cookie-session with express-session
- `package.json` - Add express-session, connect-mongo dependencies

**Steps**:
```bash
npm install express-session connect-mongo
```

Replace in `src/server.js`:
```javascript
// REMOVE:
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET],
  maxAge: 24 * 60 * 60 * 1000
}));

// ADD:
const session = require('express-session');
const MongoStore = require('connect-mongo');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));
```

---

### 2. 🔴 Test Security Features (~1-2 hours)

**Test Checklist**:
- [ ] User approval workflow
  - [ ] First user becomes admin automatically
  - [ ] Second user redirected with "pending approval" message
  - [ ] Admin can approve user via /admin/users
  - [ ] Approved user can access app

- [ ] Rate limiting
  - [ ] Try 6 login attempts in 15 minutes → should be blocked
  - [ ] Try 101 API calls in 15 minutes → should be blocked

- [ ] Session security
  - [ ] Sessions persist after server restart
  - [ ] Logout clears session
  - [ ] Cannot access protected routes without session

- [ ] Security logging
  - [ ] Check `logs/security.log` for login events
  - [ ] Check for failed login attempts
  - [ ] Check for rate limit violations

**Test Script**:
```bash
# Test auth
curl -I http://localhost:3000/auth/google

# Test protected route
curl http://localhost:3000/api/users

# Check logs
tail -f logs/security.log
```

---

### 3. 🟡 Database Encryption (~2-3 hours)
**Why Recommended**: Financial data (bank accounts, sort codes) stored in plain text

**Option 1: Field-level encryption (mongoose-encryption)**
```bash
npm install mongoose-encryption
```

**Fields to encrypt** (in src/models/):
- `entry.js`: accountNumber, sortCode, cardNumber, pin
- `user.js`: email (optional)

**Implementation**:
```javascript
const encrypt = require('mongoose-encryption');
const encKey = process.env.ENCRYPTION_KEY; // 32-byte hex string
entrySchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: encKey,
  encryptedFields: ['accountNumber', 'sortCode', 'cardNumber', 'pin']
});
```

**Generate encryption key**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env`:
```
ENCRYPTION_KEY=<generated-key>
```

---

## 🟢 Deployment Tasks (After Testing)

### 4. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account
- [ ] Create cluster (M0 free tier for testing)
- [ ] Whitelist Vercel IPs or use 0.0.0.0/0
- [ ] Get connection string
- [ ] Add to Vercel environment variables

### 5. Vercel Environment Variables
```
SESSION_SECRET=<generate-new-32-byte-hex>
MONGO_URI=<mongodb-atlas-connection-string>
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
GOOGLE_CALLBACK_URL=https://your-domain.vercel.app/auth/google/callback
FRONTEND_URL=https://your-domain.vercel.app
NODE_ENV=production
ENCRYPTION_KEY=<32-byte-hex> (if using encryption)
```

### 6. Google OAuth Production Setup
- [ ] Add production domain to Google Console
  - Authorized JavaScript origins: `https://your-domain.vercel.app`
  - Authorized redirect URIs: `https://your-domain.vercel.app/auth/google/callback`

### 7. Final Testing
- [ ] Test all domain pages (Vehicles, Properties, Employments, etc.)
- [ ] Test admin features (Bank Import, Transactions, User Management)
- [ ] Test mobile responsiveness
- [ ] Test user approval workflow in production

### 8. Deploy
```bash
git checkout main
git merge pre-production-polish
git push origin main
vercel --prod
```

---

## 📝 Security Summary

### ✅ Already Implemented
- **Access Control**: First user = admin, others need approval
- **Rate Limiting**: 5 login attempts/15min, 100 API/15min
- **Authentication**: Google OAuth with Passport.js
- **Authorization**: Role-based (admin/user), approval workflow
- **Security Logging**: Winston audit trail in `logs/security.log`
- **API Protection**: 68 auth checks across 16 route files
- **User Management**: Admin UI to approve users (/admin/users)

### 🔴 Still Needed
- **Session Security**: Upgrade to express-session (CRITICAL)
- **Testing**: End-to-end security testing (CRITICAL)
- **Data Encryption**: Encrypt sensitive fields (RECOMMENDED)

### 🎯 Minimum Viable Security
Tasks 1-2 = ~2-3 hours = Ready for private deployment (you + partner only)

### 🏆 Production-Ready Security
Tasks 1-3 = ~5-6 hours = Ready for wider deployment

---

## 🔧 Useful Commands

**Check security logs**:
```bash
tail -f logs/security.log
cat logs/security.log | grep "Login success"
cat logs/security.log | grep "Login failure"
cat logs/security.log | grep "Rate limit"
```

**Check database users**:
```bash
# In MongoDB shell
db.users.find({}, {email: 1, approved: 1, role: 1})
```

**Test API with authentication**:
```bash
# This will fail (not authenticated)
curl http://localhost:3000/api/users

# Login first via browser, then check session
curl -c cookies.txt http://localhost:3000/auth/google
curl -b cookies.txt http://localhost:3000/api/users
```

---

## 📂 Key Files Modified This Session

### Security
- `src/utils/validateEnv.js` (NEW) - Environment validation
- `src/middleware/rateLimiter.js` (NEW) - Rate limiting
- `src/utils/logger.js` (NEW) - Winston security logging
- `src/server.js` - Security headers, rate limiting, logging
- `src/auth/google.js` - Login/logout logging
- `src/middleware/auth.js` - Access denied logging
- `.env.example` - Updated with security requirements

### UI
- `web/src/components/Layout.tsx` - Admin dropdown, navigation spacing
- `web/src/pages/AdminUserManagement.tsx` (NEW) - User approval UI
- `web/src/pages/HomePage.tsx` - Unified dashboard
- `web/src/App.tsx` - Route cleanup, admin routes
- Deleted: `Dashboard.tsx`, `ModernDashboard.tsx`

### Documentation
- `SECURITY_AUDIT.md` (NEW) - Complete security audit

---

## 🚀 Next Steps

1. **Start next session**: Run the commands at the top
2. **Priority 1**: Upgrade session storage (30 mins)
3. **Priority 2**: Test security features (1-2 hours)
4. **Priority 3**: Consider database encryption (2-3 hours)
5. **Then**: Deploy to production!

---

## 📞 Support

**Current Navigation** (Admin dropdown):
- Bank Import
- Transactions
- ─────────
- Domain Management
- System Status
- **User Management** ← NEW! Approve users here
- ─────────
- Settings

**Access User Management**: Admin dropdown → User Management → Approve pending users

**Report Issues**: https://github.com/calvinorr/LegacyVault/issues
