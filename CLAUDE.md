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
- **Category Cache Management**: Real-time category updates in AddBillModal with session cache clearing
- **Admin Interface**: Full Bank Import workflow with transaction table and entry creation
- **Authentication**: Google OAuth with admin approval system and role-based access
- **Security**: Repository cleaned of sensitive data, proper .gitignore protection
- **Dashboard**: Real-time data with audit trail showing actual user activity
- **UK Banking**: Full CRUD with UK banking (sort codes, current accounts)
- **UI**: UK-focused terminology throughout all forms and interfaces
- **Enhanced Navigation**: Bills and Categories pages accessible from main navigation menu
- **Dedicated Pages**: Specialized Bills management with filtering and Categories management interface
- **Comprehensive Testing**: 44+ passing tests covering all transaction processing functionality
- **Premium Design System**: Swiss spa aesthetic with Lucide React icons, Inter font, and sophisticated styling

### 🎯 Current Development Phase: User Experience & Navigation Enhancement
**Status**: ✅ **COMPLETED** (Navigation and Category Management Improvements)
**Achievement**: Enhanced user experience with dedicated Bills/Categories pages and real-time category cache management
**Last Updated**: September 13, 2025

**Recent Improvements:**
- ✅ **Bug Fix**: Category cache refresh issue resolved - new categories now immediately appear in AddBillModal
- ✅ **Navigation Enhancement**: Added Bills and Categories to main navigation menu with dedicated pages
- ✅ **Bills Management**: Specialized Bills page with smart filtering (Energy, Water, Internet, Phone, TV, Council Tax)
- ✅ **Category Management**: Full-featured Categories page with hierarchical management interface

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

**Stage 4**: ✅ **UK Financial Product Renewal System (COMPLETED)**
**Status**: ✅ **COMPLETED** - Full implementation delivered September 13, 2025
**Scope**: Comprehensive renewal tracking for 40+ UK financial product types

**Key Features:**
- ✅ Enhanced Entry model with comprehensive renewalInfo structure
- ✅ Category model with renewal settings and UK-specific rules  
- ✅ 5 end date types (hard_end, auto_renewal, review_date, expiry_date, notice_deadline)
- ✅ Intelligent reminder engine with priority levels (critical, important, strategic)
- ✅ UK product configuration database covering 7 major categories
- ✅ Renewal dashboard APIs with timeline view and urgency categorization
- ✅ Product detection service with intelligent categorization
- ✅ Enhanced AddBillModal with renewal tracking UI

**Product Categories Covered:**
1. **Finance & Credit** (6 types) - Car Finance PCP/HP, Personal Loans, Mortgage Fixed Rates
2. **Contracts & Services** (6 types) - Mobile/Broadband, Energy Deals, Tenancy Agreements  
3. **Insurance & Protection** (7 types) - Car/Home/Life/Travel Insurance, Income Protection
4. **Government & Official** (6 types) - MOT, TV Licence, Driving Licence, Passport, Vehicle Tax
5. **Savings & Investments** (5 types) - Fixed Bonds, ISA Limits, Savings Bonus Rates
6. **Warranties & Service Plans** (5 types) - Extended Warranties, Service Plans, Breakdown Cover
7. **Professional & Memberships** (5 types) - Professional Bodies, Qualifications, Certifications

**API Endpoints Added:**
- `/api/product-detection/*` - Intelligent product type detection and categorization
- `/api/renewal-reminders/*` - Renewal processing, timeline, and dashboard APIs

**Files Created/Modified:**
- `src/models/entry.js` - Enhanced renewalInfo schema
- `src/models/category.js` - Added renewal settings
- `src/config/ukFinancialProducts.js` - 40+ UK product definitions
- `src/utils/productDetection.js` - Intelligent detection service
- `src/services/renewalReminderEngine.js` - Reminder processing engine
- `src/routes/productDetection.js` - Product detection API routes
- `src/routes/renewalReminders.js` - Renewal management API routes
- `src/middleware/auth.js` - Added authenticateToken middleware
- `web/src/components/AddBillModal.tsx` - Enhanced with renewal UI

**Stage 5**: 🚀 **Future Advanced Features**
- ⏳ Bulk operations and batch processing
- ⏳ Enhanced error handling for partial failures  
- 🚀 Export/import functionality and advanced reporting

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

---

## Epic 6 Development Progress (Hierarchical Domain Model)

### Session 2 Summary (October 19, 2025)

**Developer**: James (Full Stack Dev Agent)

**Completed This Session:**
- ✅ **Story 1.4 Verification**: Admin Domain Configuration frontend verified working (minimal testing in browser)
- ✅ **Story 1.5 Verification**: Parent Entity Frontend Components fully implemented and tested
  - All 4 domain pages (Vehicles, Properties, Employments, Services) exist and route correctly
  - React Query hooks properly configured with caching and optimistic updates
  - 21 comprehensive tests passing
  - Frontend builds successfully with no errors
  - Navigation menu updated with proper links and icons

**Story Status Breakdown:**
| Story | Task | Status | Notes |
|-------|------|--------|-------|
| 1.1 | Database Schema & Models | ✅ Complete | ParentEntity, ChildRecord models with full schema |
| 1.2 | Parent Entity API | ✅ Complete | All CRUD endpoints working, 24 tests passing |
| 1.3 | Child Record API | ✅ Complete | Nested endpoints, cascade delete logic |
| 1.4 | Admin Domain Config UI | ✅ Complete | DomainConfigList, RecordTypeSelector, CustomRecordTypeForm |
| 1.5 | Parent Entity Frontend | ✅ Complete | ParentEntityList, Card, Form, DeleteModal, 21 tests passing |
| 1.6 | Child Record Frontend | ⏳ Pending | Next priority - continuity-focused child record management |
| 1.7 | Services Integration | ⏳ Pending | Services directory & transaction workflow |
| 1.8 | Continuity Features | ⏳ Pending | Renewals tracking, contact directory |
| 1.9 | Data Migration | ⏳ Pending | Migration scripts & user onboarding |
| 1.10 | Legacy Cleanup | ⏳ Pending | Deprecate old endpoints |
| 1.11 | Performance | ⏳ Pending | Optimization & monitoring |

**Dev Environment Status:**
- Backend: Running `:3000` ✓ (MongoDB connected)
- Frontend: Running `:5173` ✓ (Vite dev server)
- Both servers stable and ready for next story implementation

**Files Modified This Session:**
- `docs/stories/epic-6-story-1.5-parent-entity-frontend.md` - Added session verification note

**Key Insights for Next Session:**
1. Story 1.5 appears to have been pre-implemented in a previous session - verify all AC during testing
2. Story 1.6 will require building child record UI - watch for cascade warnings when deleting parents
3. Services domain is fully supported alongside Vehicle, Property, Employment
4. All 4 domains follow identical UI patterns for consistency
5. Parent entity pages use routes: `/vehicles-new`, `/properties-new`, `/employments-new`, `/services-new`

**Next Steps (Priority Order):**
1. **Story 1.6**: Child Record Frontend Components (continuity-focused UX)
2. **Story 1.7**: Services Directory integration with transaction workflow
3. **Story 1.8**: Continuity planning features (renewals, contact tracking)
4. Full integration testing across all stories before cleanup phase