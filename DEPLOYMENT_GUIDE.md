# 🚀 LegacyLock Deployment Guide

**Quick Start:** Run `./scripts/pre-deploy-check.sh` then `./scripts/deploy.sh`

---

## What's Been Automated

✅ **Vercel Configuration** (`vercel.json`)
- Dual app setup (backend + frontend)
- Automatic routing
- Static asset serving
- Production region (US East)

✅ **Deployment Scripts**
- `scripts/deploy.sh` - Main deployment automation
- `scripts/pre-deploy-check.sh` - Pre-flight validation
- `scripts/post-deploy-config.sh` - OAuth URL configuration

✅ **Environment Variable Management**
- Auto-generates production SESSION_SECRET
- Copies MongoDB URI from .env
- Copies Google OAuth credentials
- Sets NODE_ENV=production

---

## Your Current Status

From pre-deploy check:

### ✓ Ready
- Node.js 22.19.0 (✓ 18+ required)
- Vercel CLI 44.5.0 installed
- MongoDB Atlas configured
- Google OAuth credentials set
- express-session + connect-mongo installed
- Security logging configured
- Dependencies installed

### ⚠ To Address
- **Uncommitted changes** (9 files) - Normal! These are the deployment files
- **Untracked files** (5 files) - Deployment scripts + configs

**These are expected** - the deployment script will handle committing them.

---

## Deployment Steps (5 Minutes)

### 1. Commit Deployment Files
```bash
git add .
git commit -m "feat: Add automated Vercel deployment scripts"
```

### 2. Run Deployment
```bash
./scripts/deploy.sh
```

**The script will:**
1. ✓ Run pre-flight checks
2. ✓ Link to Vercel (first time)
3. ✓ Ask preview or production (choose **preview** first!)
4. ✓ Generate new SESSION_SECRET
5. ✓ Copy env vars from .env
6. ✓ Deploy to Vercel
7. ✓ Give you deployment URL

### 3. Configure OAuth Callbacks
```bash
./scripts/post-deploy-config.sh
```

**Enter your deployment URL** (from step 2)

**Then update Google OAuth:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Add URLs shown by the script
3. Click Save

### 4. Test Preview
Visit your Vercel URL:
- [ ] Login with Google
- [ ] Check you're admin (first user)
- [ ] Navigate to Vehicles page
- [ ] Test admin features

### 5. Deploy Production (When Ready)
```bash
./scripts/deploy.sh
# Choose: 2 (Production)

./scripts/post-deploy-config.sh
# Enter production URL
# Update Google OAuth again
```

---

## What Happens During Deployment

### Deploy Script Automation
```
┌─────────────────────────────────┐
│  Pre-flight Checks              │
│  ├─ Node.js version             │
│  ├─ Vercel CLI installed        │
│  ├─ Git status                  │
│  └─ Current branch              │
└─────────────────────────────────┘
          ↓
┌─────────────────────────────────┐
│  Vercel Project Setup           │
│  └─ Link or create project      │
└─────────────────────────────────┘
          ↓
┌─────────────────────────────────┐
│  Environment Variables          │
│  ├─ Generate SESSION_SECRET     │
│  ├─ Copy MONGO_URI              │
│  ├─ Copy Google OAuth           │
│  └─ Set NODE_ENV=production     │
└─────────────────────────────────┘
          ↓
┌─────────────────────────────────┐
│  Optional Build Test            │
│  └─ Test frontend build locally │
└─────────────────────────────────┘
          ↓
┌─────────────────────────────────┐
│  Deploy to Vercel               │
│  └─ Upload & build              │
└─────────────────────────────────┘
          ↓
┌─────────────────────────────────┐
│  Post-Deploy Instructions       │
│  ├─ Deployment URL              │
│  ├─ Google OAuth update steps   │
│  └─ Next actions                │
└─────────────────────────────────┘
```

---

## Environment Variables Reference

### Auto-Configured by deploy.sh
```bash
SESSION_SECRET=<generated-32-byte-hex>    # New for production
MONGO_URI=<from-your-.env>                # Same database
GOOGLE_CLIENT_ID=<from-your-.env>         # Same OAuth app
GOOGLE_CLIENT_SECRET=<from-your-.env>     # Same OAuth app
NODE_ENV=production                        # Set automatically
```

### Set by post-deploy-config.sh
```bash
GOOGLE_CALLBACK_URL=https://YOUR-URL.vercel.app/auth/google/callback
FRONTEND_URL=https://YOUR-URL.vercel.app
ALLOWED_ORIGIN=https://YOUR-URL.vercel.app
```

---

## Database Strategy

**You're using the existing MongoDB Atlas database:**
- ✓ Already configured
- ✓ Already populated with your data
- ✓ Same connection string for preview & production

**This means:**
- Development and production share the same database
- Perfect for testing with real data
- When ready for wider use, consider separate prod database

**To create separate production database later:**
1. In MongoDB Atlas, create new database: `household_vault_prod`
2. Update `MONGO_URI` in Vercel:
   - Change `/household_vault` to `/household_vault_prod`
3. Redeploy

---

## Security Notes

### Session Storage ✓
- express-session + MongoDB (completed)
- Sessions stored server-side
- Automatic cleanup of expired sessions
- New SESSION_SECRET for production

### Rate Limiting ✓
- Auth: 5 attempts per 15 minutes
- API: 100 requests per 15 minutes
- Tested and working

### Security Logging ✓
- Winston logging to security.log
- Rate limit violations logged
- Authentication events tracked

### First User = Admin ✓
- First person to login becomes admin automatically
- Others need approval via /admin/users

---

## Troubleshooting

### "Vercel not found"
```bash
npm install -g vercel
```

### Build fails
```bash
# Test locally first
cd web && npm run build

# Check Vercel logs
vercel logs
```

### OAuth not working
1. Verify Google Console URLs match exactly
2. Check Vercel env vars: `vercel env ls`
3. Redeploy after changing env vars

### Can't login after deploy
1. Did you update Google OAuth with new URLs?
2. Check GOOGLE_CALLBACK_URL matches your domain
3. Verify ALLOWED_ORIGIN is set correctly

---

## Useful Commands

```bash
# View all deployments
vercel ls

# View live logs
vercel logs --follow

# View environment variables
vercel env ls

# Rollback to previous deployment
vercel rollback

# Remove project link (start over)
rm -rf .vercel
```

---

## What's Next After Deployment

### Immediate
1. **Test thoroughly** - All features, all pages
2. **Check logs** - `vercel logs --follow`
3. **Verify security** - Test rate limiting, check security.log
4. **Mobile test** - Responsive design working?

### Soon
1. **Add second user** - Test approval workflow
2. **Monitor usage** - Watch for errors
3. **Backup data** - MongoDB Atlas has automatic backups

### Optional
1. **Database encryption** (Task 3 in PRE_PRODUCTION_STATUS.md)
2. **Custom domain** - Configure in Vercel dashboard
3. **Separate prod database** - When you're ready for wider use

---

## Support & Resources

- **Deployment Scripts**: `scripts/README.md`
- **Project Status**: `PRE_PRODUCTION_STATUS.md`
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Issues**: https://github.com/calvinorr/LegacyVault/issues

---

## Ready to Deploy?

```bash
# 1. Check you're ready
./scripts/pre-deploy-check.sh

# 2. Commit deployment files
git add .
git commit -m "feat: Add automated Vercel deployment"

# 3. Deploy!
./scripts/deploy.sh
```

**Choose preview first, test thoroughly, then deploy to production!**
