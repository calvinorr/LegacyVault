# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LegacyLock** - A UK-focused secure financial vault for couples to store and manage household financial details (bank accounts, utilities, providers, policies, pensions). Built with simplicity, security, and UK financial system compatibility as core principles.

### UK Focus & Terminology
- **All forms and processes are UK-centric**
- Sort codes (XX-XX-XX format) instead of routing numbers
- Current accounts instead of checking accounts  
- UK financial products: ISAs, SIPPs, Premium Bonds, pensions
- UK date formats (DD/MM/YYYY) throughout system
- Building societies alongside banks in provider lists
- UK utilities: Council Tax, TV Licence, rates
- UK-specific categories and terminology

## Architecture

**Dual-Stack Application:**
- Backend: Node.js/Express API server (`src/`)
- Frontend: React/TypeScript SPA (`web/`)
- Database: MongoDB (local dev via Docker, Atlas for production)
- Auth: Google OAuth 2.0 with Passport.js

**Key Design Patterns:**
- Express middleware pipeline with Passport session management
- MongoDB models with Mongoose ODM (`src/models/`)
- React hooks for auth state management (`web/src/hooks/`)
- Protected routes with custom `ProtectedRoute` component

## Development Commands

**Backend Development:**
```bash
# Local development (with nodemon)
npm run dev

# Production server
npm start

# Docker development (full stack)
docker-compose up --build
```

**Frontend Development (from web/ directory):**
```bash
cd web
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview built app
npm run format       # Prettier formatting
```

**Database:**
- Local: MongoDB runs in Docker via `docker-compose.yml`
- Connection configured via `MONGO_URI` environment variable
- Models: `src/models/user.js` and `src/models/entry.js`

## Environment Setup

1. Copy `.env.example` to `.env`
2. Configure Google OAuth credentials in Google Cloud Console
3. Set `MONGO_URI` (local Docker or Atlas connection string)
4. Generate strong `SESSION_SECRET`

## Authentication Flow

**Backend OAuth Setup:**
- `src/auth/google.js` configures Passport Google OAuth20 strategy
- Session management via `cookie-session` middleware
- User approval workflow: admin must approve new users (`user.approved` field)

**Frontend Auth State:**
- `useAuth` hook manages authentication state
- `ProtectedRoute` wrapper redirects unauthenticated users
- Auth persistence via browser session cookies

## Data Models

**User Model (`src/models/user.js`):**
- Google OAuth identity (`googleId`, `email`, `displayName`)
- Role-based access (`role: 'user'|'admin'`)
- Approval workflow (`approved: boolean`)

**Entry Model (`src/models/entry.js`):**
- Flexible vault entries (accounts, utilities, policies, etc.)
- Type categorization with enum values
- Ownership and sharing (`owner`, `sharedWith` arrays)
- Attachment support with provider-agnostic storage

## API Routes

**Authentication:** `/auth/*` - Google OAuth flow
**Users:** `/api/users/*` - User management and approval
**Entries:** `/api/entries/*` - CRUD operations for vault entries
**Health:** `/health` - Service health check

## Security Considerations

- No local passwords (Google OAuth only)
- Session-based authentication with secure cookies
- CORS configured for frontend origin
- Helmet.js for security headers
- Environment variables for all secrets
- MongoDB Atlas field-level encryption recommended for production

## Testing

Currently no test framework configured. The `npm run lint` command is a placeholder.

## Authentication Debugging Guide

**Common Authentication Issues & Solutions:**

1. **Infinite Login Loops**
   - **Symptom:** User clicks login, goes through OAuth, gets redirected back to login
   - **Root Cause:** Usually duplicate `passport.serializeUser/deserializeUser` definitions
   - **Fix:** Ensure only one serialization pair exists in `src/auth/google.js`
   - **Check:** Look for multiple `passport.serializeUser()` calls

2. **Server Connectivity Issues**
   - **Symptom:** "Cannot reach localhost:5173" or frontend won't load
   - **Root Cause:** Both servers must run simultaneously for full-stack to work
   - **Fix:** Run both `npm run dev` (backend) AND `cd web && npm run dev` (frontend)
   - **Ports:** Backend on :3000, Frontend on :5173
   - **Health Check:** `curl http://localhost:3000/health` and `curl -I http://localhost:5173/`

3. **Frontend/Backend Communication**
   - **Symptom:** API calls fail, CORS errors, proxy issues
   - **Root Cause:** Frontend needs proxy config for API calls
   - **Fix:** Ensure `web/vite.config.ts` has proper proxy settings for `/api`, `/auth`, `/logout`
   - **Check:** API calls should use relative paths (`/api/users/me` not `http://localhost:3000/api/users/me`)

4. **User Approval Workflow**
   - **Symptom:** Users can't access resources after login
   - **Root Cause:** User created but not approved
   - **Fix:** First user auto-approved as admin, others need approval
   - **Check:** Database user document has `approved: true` and proper `role`

**Debugging Steps:**
1. Check both servers running: `lsof -i :3000` and `lsof -i :5173`
2. Test backend health: `curl http://localhost:3000/health`
3. Test OAuth redirect: `curl -I http://localhost:3000/auth/google`
4. Check MongoDB connection in backend console logs
5. Check browser console for frontend JavaScript errors

## Current Implementation Status

### ✅ Completed Features (Major Milestone - September 2025)
- **Bank Import System**: Complete PDF parsing with HSBC multi-line transaction support
- **Import Session Management**: Background processing with recurring payment detection  
- **Transaction-to-Entry Conversion**: Smart form pre-population with automatic provider detection
- **Category Suggestion Engine**: AI-powered suggestions with confidence scoring for 20+ UK providers
- **Dynamic Category System**: Hierarchical categories with intelligent mapping from legacy rules
- **Admin Interface**: Full Bank Import workflow with transaction table and entry creation
- **Authentication**: Google OAuth with admin approval system and role-based access
- **Security**: Repository cleaned of sensitive data, proper .gitignore protection
- **Dashboard**: Real-time data with audit trail showing actual user activity
- **UK Banking**: Full CRUD with UK banking (sort codes, current accounts)
- **UI**: UK-focused terminology throughout all forms and interfaces
- **Comprehensive Testing**: 44+ passing tests covering all transaction processing functionality
- **Premium Design System**: Swiss spa aesthetic with Lucide React icons, Inter font, and sophisticated styling

### 🎯 Current Development Phase: Premium Design Transformation
**Status**: ✅ **COMPLETED** (All Premium Styling Complete)
**Achievement**: Full Category Management system transformed to premium design
**Last Updated**: September 12, 2025

### 📋 Development Roadmap Status
**Stage 1**: ✅ **Category Management Foundation (COMPLETED)**
- ✅ Hierarchical Category System with parent/child relationships
- ✅ UK-focused financial category seed data  
- ✅ Category CRUD API endpoints
- ✅ Dynamic category integration

**Stage 2**: ✅ **Transaction-to-Entry Conversion (COMPLETED)**
- ✅ "Create Entry" buttons in Bank Import transaction table
- ✅ Smart category suggestion engine with fuzzy matching
- ✅ Pre-populated entry creation forms with validation
- ✅ Comprehensive transaction processing utilities

**Stage 3**: ✅ **Premium Design Transformation (COMPLETED)**
- ✅ Swiss spa aesthetic implementation with professional color palette
- ✅ Lucide React icons replacing Material Design icons throughout
- ✅ Inter font implementation with proper weight hierarchy
- ✅ Navigation and Layout components with premium styling
- ✅ Form components with sophisticated input styling
- ✅ Modal components with elegant overlays and animations
- ✅ Bank Import page complete transformation (1200+ lines)
- ✅ Category Management system premium styling (Final Task - COMPLETED)

**Stage 4**: 🔄 **Advanced Features (Next Phase)**  
- ⏳ Bulk operations and batch processing
- ⏳ Enhanced error handling for partial failures
- 🚀 Future: Export/import functionality and advanced reporting

### 📚 Documentation & Specifications
- `RESUME-2025-09-09-0743.md` - Complete session resume with next steps
- `.agent-os/specs/` - Agent OS specifications for systematic development
- `FUTURE_DEVELOPMENT_ROADMAP.md` - Long-term development plan
- `UK_FOCUS_NOTES.md` - UK financial terminology reference

### 🔗 Repository
- **GitHub**: https://github.com/calvinorr/LegacyVault
- **Latest Commit**: Security fixes and sensitive data removal
- **Status**: Production-ready bank import functionality

## Deployment Notes

- Designed for managed services (Vercel, Render, Heroku)
- MongoDB Atlas recommended for production
- HTTPS required for OAuth in production
- Environment variables must be configured in deployment platform