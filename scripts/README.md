# Deployment Scripts

Automated deployment scripts for LegacyLock to Vercel.

## Quick Start

```bash
# 1. Check you're ready to deploy
./scripts/pre-deploy-check.sh

# 2. Deploy!
./scripts/deploy.sh

# 3. Configure callback URLs (after first deploy)
./scripts/post-deploy-config.sh
```

---

## Scripts Overview

### `pre-deploy-check.sh`
**What it does:** Validates your environment before deployment

**Checks:**
- ✓ Node.js 18+ installed
- ✓ Vercel CLI installed
- ✓ Required environment variables configured
- ✓ Dependencies installed
- ✓ Git status clean
- ✓ Security features installed (express-session, logging)
- ✓ MongoDB connection (if mongosh available)

**Usage:**
```bash
./scripts/pre-deploy-check.sh
```

**Output:** Checklist with ✓ or ✗ for each requirement

---

### `deploy.sh`
**What it does:** Automated deployment to Vercel with safety checks

**Features:**
- 🔒 Pre-flight checks (Node version, Vercel CLI, Git status)
- 🔑 Automatic environment variable setup
- 🚀 Choice of preview or production deployment
- 🧪 Optional build testing before deploy
- 📝 Git commit helper (if changes detected)
- ✅ Post-deployment checklist

**Usage:**
```bash
./scripts/deploy.sh

# You'll be prompted for:
# 1. Deployment type (preview or production)
# 2. Environment variable setup (auto-configured from .env)
# 3. Optional local build test
# 4. Git commit (if uncommitted changes)
```

**What it automates:**
1. ✓ Vercel project linking (first time)
2. ✓ Generate production SESSION_SECRET
3. ✓ Copy env vars from .env to Vercel
4. ✓ Deploy to Vercel
5. ✓ Show next steps

**What you still need to do manually:**
- Update Google OAuth (after first deploy)
- Set callback URLs (use post-deploy-config.sh)

---

### `post-deploy-config.sh`
**What it does:** Updates Vercel environment variables with your actual deployment URL

**Use this:** After your first deployment to configure OAuth callback URLs

**Usage:**
```bash
./scripts/post-deploy-config.sh

# You'll be prompted for:
# 1. Your Vercel URL (e.g., https://legacylock.vercel.app)
# 2. Environment type (production or preview)
```

**What it does:**
1. ✓ Sets `GOOGLE_CALLBACK_URL`
2. ✓ Sets `FRONTEND_URL`
3. ✓ Sets `ALLOWED_ORIGIN`
4. ✓ Shows Google OAuth update instructions
5. ✓ Offers to redeploy with new settings

---

## First-Time Deployment Flow

### Step 1: Pre-flight Check
```bash
./scripts/pre-deploy-check.sh
```
Review output and fix any ✗ items.

### Step 2: Preview Deployment
```bash
./scripts/deploy.sh
# Choose: 1 (Preview)
```

This creates a preview deployment and gives you a URL like:
`https://legacylock-abc123.vercel.app`

### Step 3: Configure OAuth
```bash
./scripts/post-deploy-config.sh
# Enter your preview URL
# Choose: 2 (Preview)
```

Then update Google OAuth Console:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Add preview URL to authorized origins & redirect URIs
3. Save

### Step 4: Test Preview
Visit your preview URL and test:
- Login with Google
- Navigate pages
- Test admin features

### Step 5: Production Deploy
Once preview works:
```bash
./scripts/deploy.sh
# Choose: 2 (Production)
```

### Step 6: Configure Production
```bash
./scripts/post-deploy-config.sh
# Enter your production URL
# Choose: 1 (Production)
```

Update Google OAuth with production URL.

---

## Environment Variables

### Required (auto-configured by deploy.sh)
- `SESSION_SECRET` - Generated fresh for production
- `MONGO_URI` - Copied from your .env
- `GOOGLE_CLIENT_ID` - Copied from your .env
- `GOOGLE_CLIENT_SECRET` - Copied from your .env
- `NODE_ENV` - Set to "production"

### Set by post-deploy-config.sh
- `GOOGLE_CALLBACK_URL` - https://YOUR-DOMAIN.vercel.app/auth/google/callback
- `FRONTEND_URL` - https://YOUR-DOMAIN.vercel.app
- `ALLOWED_ORIGIN` - https://YOUR-DOMAIN.vercel.app

### Optional
- `ENCRYPTION_KEY` - If using database encryption (Task 3)

---

## Manual Commands Reference

### View deployments
```bash
vercel ls
```

### View logs
```bash
vercel logs
vercel logs --follow  # Live logs
```

### View environment variables
```bash
vercel env ls
```

### Add environment variable manually
```bash
vercel env add VARIABLE_NAME production
```

### Remove environment variable
```bash
vercel env rm VARIABLE_NAME production
```

### Rollback deployment
```bash
vercel rollback
```

---

## Troubleshooting

### Build fails
```bash
# Test build locally first
cd web
npm run build

# If that works, check Vercel logs
vercel logs
```

### OAuth not working
1. Check Google Console authorized URLs match exactly
2. Verify callback URL in Vercel env vars
3. Check CORS (ALLOWED_ORIGIN)

### Environment variables not updating
```bash
# Remove and re-add
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production

# Then redeploy
vercel --prod
```

### Database connection fails
1. Check MongoDB Atlas IP whitelist (0.0.0.0/0 for Vercel)
2. Verify MONGO_URI in Vercel env vars
3. Check database user permissions

---

## Safety Features

### deploy.sh safety checks
- ✓ Confirms before production deploy
- ✓ Shows git diff before committing
- ✓ Optional build test before deploy
- ✓ Generates new SESSION_SECRET (never reuses dev)

### What's NOT automated (intentionally)
- Google OAuth updates (requires manual verification)
- Production domain selection (you choose)
- Database selection (you decide dev vs prod DB)

---

## Files Created

- `vercel.json` - Vercel deployment configuration
- `scripts/deploy.sh` - Main deployment script
- `scripts/pre-deploy-check.sh` - Pre-flight validation
- `scripts/post-deploy-config.sh` - Post-deploy configuration
- `scripts/README.md` - This file

---

## Next Steps After Deployment

1. **Test thoroughly** - Don't skip this!
2. **Monitor logs** - `vercel logs --follow`
3. **Check security.log** - Verify logging works in production
4. **Add second test user** - Test approval workflow
5. **Consider database encryption** - Task 3 in PRE_PRODUCTION_STATUS.md

---

## Support

- Vercel Docs: https://vercel.com/docs
- Project Status: See `PRE_PRODUCTION_STATUS.md`
- GitHub Issues: https://github.com/calvinorr/LegacyVault/issues
