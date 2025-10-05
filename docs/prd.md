# LegacyLock Brownfield Enhancement PRD

## Intro Project Analysis and Context

### Analysis Source

**IDE-based analysis + Comprehensive Project Brief**

I have access to:
- Complete project brief at `docs/brief.md` (1,386 lines)
- Brainstorming session results at `docs/brainstorming-session-results.md`
- Project repository structure and codebase
- Core BMAD configuration at `.bmad-core/core-config.yaml`

### Current Project State

**LegacyLock** is a Northern Ireland-focused secure household information vault built with Node.js/Express backend and React/TypeScript frontend. The application currently uses an **abstract "bills/categories" structure** that creates user confusion and doesn't match the mental model of household organization.

**Current Capabilities:**
- Google OAuth authentication with admin approval
- Multi-user access (family member login/sharing)
- PDF/document upload and linking
- Bank statement import (HSBC multi-line transactions)
- UK financial renewal tracking (40+ product types)
- Northern Ireland terminology and context

**Current Architecture:**
- Backend: Node.js + Express + MongoDB (Mongoose ODM)
- Frontend: React + TypeScript + Vite
- Auth: Passport.js + Google OAuth 2.0
- Database: MongoDB Atlas (production), Docker (local dev)

### Available Documentation

✓ **Tech Stack Documentation** - Brief documents current stack
✓ **Architecture Overview** - Brief includes life domain architecture design
✓ **User Research** - 3 detailed personas documented
✓ **Competitive Analysis** - Appendix D in brief
✓ **Technical Constraints** - Section in brief
✓ **Risk Assessment** - Comprehensive risks & open questions documented
✓ **Product Vision** - Post-MVP roadmap through Phase 4

### Enhancement Scope Definition

**Enhancement Type:**
- ☑ **Major Feature Modification** - Complete architectural restructure
- ☑ **UI/UX Overhaul** - Navigation and information organization redesign

**Enhancement Description:**

Transform LegacyLock from an abstract "bills and categories" structure to a **life domain architecture** with 8 domain-specific record types (Property, Vehicles, Employment, Government, Finance, Insurance & Protection, Legal & Estate, Household Services). This addresses the root cause identified via BMAD Five Whys analysis: "excitement-driven development without planning methodology" led to poor information architecture.

**Impact Assessment:**
- ☑ **Major Impact (architectural changes required)**

This requires:
- Complete navigation restructure
- Data migration from bills/categories to life domains
- Domain-specific Mongoose schemas (8 new models)
- All existing functionality must be preserved
- Rollback mechanism required for data safety

### Goals and Background Context

**Goals:**
- Eliminate terminology confusion ("bills" doesn't match emergency vault purpose)
- Provide intuitive organization matching user mental model (life domains)
- Enable domain-specific schemas (bank accounts ≠ utilities ≠ tradespeople)
- Maintain 100% data preservation during migration
- Preserve all existing functionality (auth, documents, renewals, multi-user)
- Deliver immediate value through renewal dashboard improvements
- Enable spouse/family member independent usage without training

**Background Context:**

The BMAD brainstorming session revealed that LegacyLock suffers from poor information architecture due to "excitement-driven development" - features were built without systematic planning. Users find the abstract "bills" and "categories" terminology confusing because it suggests budget management rather than the app's true purpose: an emergency preparedness vault for household information.

The life domain architecture breakthrough came from "What If" scenarios asking: "What if new family members joined tomorrow - what would confuse them?" This revealed that organizing by **life areas** (Property, Vehicles, Employment) is far more intuitive than abstract financial categories. This brownfield enhancement will restructure the entire application around this validated insight while preserving the existing data and functionality that already works.

### Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|--------|
| Initial PRD | 2025-10-04 | 1.0 | Created from comprehensive project brief | John (PM Agent) |
| Epic 2 Added | 2025-10-05 | 2.0 | Added Epic 2 (Legacy System Retirement), moved Story 1.9 to Epic 2 as Story 2.4 | John (PM Agent) |

---

## Requirements

### Functional Requirements

**FR1**: The system shall provide 8 life domain navigation cards (Property, Vehicles, Employment, Government, Finance, Insurance & Protection, Legal & Estate, Household Services) as the primary homepage interface, replacing the current "bills" list view.

**FR2**: Each life domain shall display only records belonging to that domain with domain-specific field structures (e.g., Property records show mortgage/rates/utilities fields; Vehicle records show registration/MOT/insurance fields).

**FR3**: The system shall support manual data re-entry into new domain structure, leveraging the working bank statement parser to accelerate data population where applicable.

**FR4**: Users shall be able to create new records within each domain using domain-specific forms that present only relevant fields for that record type.

**FR5**: The renewal dashboard shall aggregate upcoming renewal dates across ALL life domains (not just bills), displaying 30/60/90 day visibility with visual urgency indicators.

**FR6**: Users shall be able to mark records with priority levels (Critical/Important/Standard) for emergency view filtering.

**FR7**: The system shall provide an "Emergency View" that filters to show only Critical priority records across all domains for executor/family emergency access.

**FR8**: All existing multi-user access functionality (Google OAuth, spouse/family login, shared household data) shall continue to function without modification.

**FR9**: Document linking (PDF upload and attachment to records) shall work within the new domain structure.

**FR10**: The system shall maintain Northern Ireland-specific terminology and financial context (domestic rates, integrated utilities, building societies) throughout all domain interfaces.

**FR11**: Bank statement import functionality shall be enhanced to map transactions directly to life domains (e.g., energy bill → Property domain, car insurance → Vehicles domain).

### Non-Functional Requirements

**NFR1**: The new architecture should be implemented cleanly without maintaining legacy bills/categories compatibility, enabling faster development and cleaner codebase.

**NFR2**: System performance (page load times, search responsiveness) should match or exceed current implementation through simplified data model.

**NFR3**: The new life domain navigation must be intuitive enough that a non-technical family member can locate and add records without instruction in 90%+ of cases.

**NFR4**: All changes must maintain existing security posture - Google OAuth flow, session management, and document access controls unchanged.

**NFR5**: The codebase must follow existing Node.js/Express/React patterns and conventions to maintain consistency.

**NFR6**: The application architecture should be optimized for Vercel Hobby (free) plan deployment with MongoDB Atlas M0 (free) tier for both data storage and document storage via GridFS. This ensures zero infrastructure costs while supporting personal/family use scale within the 512MB Atlas free tier limit.

### Compatibility Requirements

**CR1: Authentication Compatibility** - Google OAuth authentication and user management must continue to function without changes.

**CR2: Bank Import Compatibility** - Preserve and enhance the working bank statement parser, integrating it with new domain structure for faster data population.

**CR3: UI/UX Consistency** - New domain navigation interface must maintain the existing premium design system (Swiss spa aesthetic, Lucide React icons, Inter font, sophisticated styling).

**CR4: Document Storage Compatibility** - Document upload and storage mechanism must continue to work with new domain-based records.

---

## User Interface Enhancement Goals

### Integration with Existing UI

The new life domain navigation will integrate with the **existing premium design system** established during the recent design transformation:

**Design System Elements to Preserve:**
- **Visual Aesthetic:** Swiss spa design language (clean, sophisticated, calming)
- **Typography:** Inter font family with established weight hierarchy
- **Icons:** Lucide React icon library (replacing Material Design icons)
- **Color Palette:** Professional color scheme from premium transformation
- **Component Patterns:** Modal overlays, form styling, navigation patterns

**New Domain-Specific Elements:**
- **Domain Cards:** 8 large, clickable cards on homepage with domain icons and brief descriptions
- **Domain Icons:** Lucide React icons representing each life area (Home for Property, Car for Vehicles, Briefcase for Employment, etc.)
- **Domain Headers:** Consistent header pattern across all domain views showing domain name, icon, and record count
- **Domain-Specific Forms:** Tailored input forms per domain using existing form component styling

**UI Consistency Approach:**
- Reuse existing `Modal`, `Button`, `Input` components from premium design system
- Extend navigation components to support domain-based routing
- Apply existing color/spacing tokens to new domain cards
- Maintain established interaction patterns (hover effects, animations, transitions)

### Modified/New Screens and Views

**Homepage (Major Modification):**
- **Current:** Bills list view with categories filter
- **New:** 8 life domain cards in grid layout (2x4 or responsive)
- **Each Card Shows:** Domain icon, domain name, record count, brief description
- **Interaction:** Click card → navigate to domain detail view

**Domain Detail View (New Screen):**
- **Header:** Domain name, icon, "Add Record" button, record count
- **Content:** List/grid of records within that domain
- **Filters:** Priority (Critical/Important/Standard), renewal status (upcoming/expired/none)
- **Each Record Shows:** Title, key fields preview, renewal date (if applicable), priority indicator

**Add/Edit Record Form (Major Modification):**
- **Current:** Generic bill form with category dropdown
- **New:** Domain-specific forms with contextual fields
  - Property form: Address, provider, account number, renewal date
  - Vehicle form: Registration, make/model, MOT date, insurance renewal
  - Finance form: Sort code, account number, balance, interest rate
  - etc. (domain-specific schemas from Appendix A of brief)

**Renewal Dashboard (Enhancement):**
- **Current:** Shows bill renewals only
- **New:** Shows renewals across ALL domains
- **Grouped By:** Urgency (overdue, <30 days, 30-60 days, 60-90 days)
- **Domain Context:** Each renewal shows which domain it belongs to (icon + label)

**Emergency View (New Screen):**
- **Purpose:** Emergency access for executor/family during crisis
- **Content:** Only Critical priority records across all domains
- **Layout:** Simplified, print-friendly, grouped by domain
- **Access:** Prominent "Emergency View" button in navigation

**Navigation (Major Modification):**
- **Current:** Bills, Categories, Documents, Contacts, etc.
- **New:** Home (domain cards), Renewals, Emergency View, Settings
- **Domain Navigation:** Click domain → domain detail → record detail (breadcrumb trail)

### UI Consistency Requirements

**UC1: Visual Consistency** - All new domain interfaces shall use the existing Inter font, Lucide React icons, color palette, and spacing tokens from the premium design system.

**UC2: Interaction Consistency** - Domain cards, buttons, and forms shall maintain existing hover effects, animation timing, and transition patterns established in the premium design.

**UC3: Responsive Consistency** - Domain grid layout shall adapt to mobile/tablet/desktop breakpoints using the same responsive patterns as existing components.

**UC4: Accessibility Consistency** - All new domain interfaces shall maintain existing ARIA labels, keyboard navigation, and screen reader support patterns.

**UC5: Component Reuse** - New domain features shall reuse existing `Modal`, `Button`, `Input`, `Card`, and `Navigation` components rather than creating duplicates.

**UC6: Icon Language** - Domain icons shall be selected from Lucide React library to maintain visual consistency (avoid mixing icon libraries).

**UC7: Error Handling Consistency** - Domain-specific forms shall use existing error message patterns, validation styling, and user feedback mechanisms.

---

## Technical Constraints and Integration Requirements

### Existing Technology Stack

**Languages:**
- **Backend:** Node.js v18+ (JavaScript/CommonJS)
- **Frontend:** TypeScript v5.x (strict mode)

**Frameworks:**
- **Backend:** Express v4.x (REST API server)
- **Frontend:** React v18+ with Vite v5.x (build tool)
- **Database:** MongoDB v6.x with Mongoose ODM

**Authentication & Security:**
- **Auth Provider:** Google OAuth 2.0
- **Auth Library:** Passport.js v0.6.x (passport-google-oauth20 strategy)
- **Session Management:** cookie-session middleware
- **Security Headers:** Helmet.js
- **CORS:** cors middleware

**Infrastructure:**
- **Database Hosting:** MongoDB Atlas M0 (free tier - 512MB)
- **Application Hosting:** Vercel Hobby (free tier)
- **Document Storage:** MongoDB GridFS (within Atlas free tier)
- **Deployment:** Vercel serverless functions + static frontend

**External Dependencies:**
- `mongoose` - MongoDB ODM
- `passport-google-oauth20` - Google authentication
- `cookie-session` - Session management
- `helmet` - Security headers
- `cors` - CORS configuration
- `lucide-react` - Icon library (from premium design)

**Development Tools:**
- `nodemon` - Backend hot reload (dev)
- `prettier` - Code formatting
- BMAD CLI - Project management

### Integration Approach

**Database Integration Strategy:**

**Data Model Transformation:**
```
OLD: bills → categories (hierarchical, abstract)
NEW: domain-based collections (flat, specific)

Collections to Create:
- property_records
- vehicle_records
- employment_records
- government_records
- finance_records
- insurance_records
- legal_records
- services_records

Collections to Preserve:
- users (unchanged - Google OAuth profiles)
- sessions (unchanged - cookie-session storage)

Collections to Remove:
- bills (legacy - minimal data, manual re-entry)
- categories (legacy - being replaced)
```

**GridFS Integration:**
```
GridFS Buckets:
- documents.files (metadata)
- documents.chunks (binary chunks)

Linking Strategy:
- Each domain record has documentIds: [ObjectId] array
- Reference GridFS file _id for retrieval
- Cascade delete: remove record → delete linked GridFS files
```

**API Integration Strategy:**

**Endpoint Restructure:**
```
OLD Endpoints (to be removed):
POST   /api/entries          → Create bill
GET    /api/entries          → List bills
PUT    /api/entries/:id      → Update bill
DELETE /api/entries/:id      → Delete bill
GET    /api/categories       → List categories

NEW Endpoints (domain-based):
POST   /api/domains/:domain/records        → Create domain record
GET    /api/domains/:domain/records        → List domain records
GET    /api/domains/:domain/records/:id    → Get specific record
PUT    /api/domains/:domain/records/:id    → Update domain record
DELETE /api/domains/:domain/records/:id    → Delete domain record

POST   /api/domains/:domain/records/:id/documents    → Upload document (GridFS)
GET    /api/domains/:domain/records/:id/documents/:docId → Download document
DELETE /api/domains/:domain/records/:id/documents/:docId → Delete document

GET    /api/renewals         → Cross-domain renewal dashboard
GET    /api/emergency        → Emergency view (Critical records only)

Preserved Endpoints:
GET/POST /auth/*             → Google OAuth (unchanged)
GET      /api/users/me       → Current user (unchanged)
POST     /api/users/approve  → Admin approval (unchanged)
```

**Frontend Integration Strategy:**

**Component Architecture:**
```
src/
├── pages/
│   ├── HomePage.tsx              → Domain cards grid (NEW)
│   ├── DomainDetailPage.tsx      → Domain record list (NEW)
│   ├── RecordDetailPage.tsx      → Single record view (NEW)
│   ├── RenewalsPage.tsx          → Cross-domain renewals (ENHANCED)
│   └── EmergencyPage.tsx         → Critical records only (NEW)
│
├── components/
│   ├── domain/
│   │   ├── DomainCard.tsx        → Homepage domain card (NEW)
│   │   ├── DomainHeader.tsx      → Domain page header (NEW)
│   │   └── DomainIcon.tsx        → Icon mapping utility (NEW)
│   │
│   ├── records/
│   │   ├── PropertyRecordForm.tsx    → Property-specific form (NEW)
│   │   ├── VehicleRecordForm.tsx     → Vehicle-specific form (NEW)
│   │   ├── FinanceRecordForm.tsx     → Finance-specific form (NEW)
│   │   └── ... (6 more domain forms)
│   │
│   ├── documents/
│   │   ├── DocumentUpload.tsx        → GridFS upload (NEW)
│   │   ├── DocumentList.tsx          → Linked docs display (NEW)
│   │   └── DocumentPreview.tsx       → PDF viewer (NEW)
│   │
│   └── shared/
│       ├── Modal.tsx                 → Existing (REUSE)
│       ├── Button.tsx                → Existing (REUSE)
│       ├── Input.tsx                 → Existing (REUSE)
│       └── Navigation.tsx            → Existing (ENHANCE)

Routing (React Router):
/                           → HomePage (domain cards)
/:domain                    → DomainDetailPage (e.g., /property)
/:domain/:recordId          → RecordDetailPage
/renewals                   → RenewalsPage
/emergency                  → EmergencyPage
```

**State Management:**
```
React Context/Hooks (existing pattern):
- useAuth()           → Preserved (Google OAuth state)
- useDomain()         → NEW (current domain context)
- useRecords()        → NEW (domain records fetching)
- useDocuments()      → NEW (GridFS document operations)
```

**Testing Integration Strategy:**

**Test Coverage (Future - not MVP blocker):**
```
Backend:
- Unit: Mongoose schema validation
- Integration: API endpoint testing (Supertest)
- GridFS: Document upload/download flows

Frontend:
- Unit: Component rendering (React Testing Library)
- Integration: User flows (Cypress E2E)
- Manual: Spouse/family member testing (critical for MVP)
```

### Code Organization and Standards

**File Structure Approach:**

Follow existing Node.js/Express + React/TypeScript patterns:
```
Backend Structure (src/):
models/
  ├── domain/
  │   ├── PropertyRecord.js     → Mongoose schema
  │   ├── VehicleRecord.js
  │   └── ... (8 domain models)
  └── User.js                    → Preserved

routes/
  ├── domains.js                 → Domain CRUD endpoints
  ├── documents.js               → GridFS operations
  ├── renewals.js                → Cross-domain renewals
  └── auth.js                    → Preserved (Google OAuth)

services/
  ├── gridfs.js                  → GridFS helper utilities
  └── renewalEngine.js           → Preserved (existing renewal logic)

Frontend Structure (web/src/):
(Shown above in Component Architecture section)
```

**Naming Conventions:**

- **Files:** PascalCase for components (`DomainCard.tsx`), camelCase for utilities (`gridfs.js`)
- **Components:** PascalCase (`PropertyRecordForm`)
- **Functions/Variables:** camelCase (`getDomainRecords`, `recordId`)
- **Constants:** UPPER_SNAKE_CASE (`DOMAIN_TYPES`, `MAX_FILE_SIZE`)
- **Types/Interfaces:** PascalCase with `I` prefix for interfaces (`IPropertyRecord`)

**Coding Standards:**

- **TypeScript:** Strict mode enabled, explicit return types for functions
- **Formatting:** Prettier (existing config preserved)
- **Linting:** ESLint (existing rules)
- **Comments:** JSDoc for public functions, inline comments for complex logic
- **Error Handling:** Try-catch with meaningful error messages, centralized error middleware

**Documentation Standards:**

- **API Endpoints:** OpenAPI/Swagger comments (future enhancement)
- **Components:** PropTypes or TypeScript interfaces + brief description comment
- **Functions:** JSDoc with @param, @returns, @throws
- **README:** Update with new domain architecture, GridFS setup instructions

### Deployment and Operations

**Build Process Integration:**

```bash
# Frontend Build (Vite)
cd web && npm run build
→ Outputs to web/dist/

# Backend Build (No compilation - Node.js)
→ Direct deployment of src/ directory

# Vercel Deployment
vercel deploy
→ Automatically detects Vite frontend + API routes
→ Serverless functions created from /api folder
```

**Deployment Strategy:**

**Vercel Configuration (`vercel.json`):**
```json
{
  "buildCommand": "cd web && npm run build",
  "outputDirectory": "web/dist",
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "GOOGLE_CLIENT_ID": "@google-client-id",
    "GOOGLE_CLIENT_SECRET": "@google-client-secret",
    "SESSION_SECRET": "@session-secret"
  }
}
```

**Environment Variables (Vercel Dashboard):**
- `MONGODB_URI` - Atlas M0 connection string
- `GOOGLE_CLIENT_ID` - OAuth credentials
- `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `SESSION_SECRET` - Session encryption key

**Monitoring and Logging:**

**Free Tier Monitoring:**
- **Vercel Analytics:** Free tier (pageviews, web vitals)
- **MongoDB Atlas Monitoring:** Free tier (database metrics, slow queries)
- **Console Logging:** Vercel function logs (stdout/stderr)

**Storage Monitoring:**
```javascript
// Alert when approaching 512MB Atlas limit
async function checkStorageUsage() {
  const stats = await mongoose.connection.db.stats();
  const usageMB = stats.dataSize / (1024 * 1024);

  if (usageMB > 400) {
    console.warn(`Storage usage: ${usageMB}MB / 512MB limit`);
  }
}
```

**Configuration Management:**

- **Environment Variables:** Vercel dashboard + local `.env` file (gitignored)
- **Feature Flags:** None needed for MVP (simple deployment)
- **Secrets Rotation:** Manual (Google OAuth credentials, session secret)

### Risk Assessment and Mitigation

**Technical Risks:**

**TR1: GridFS Complexity**
- **Risk:** Team unfamiliar with GridFS, potential implementation delays
- **Mitigation:** Step-by-step tutorial during document upload story, reference MongoDB docs, start with simple upload/download before advanced features
- **Likelihood:** Medium | **Impact:** Low (can fall back to simpler approaches)

**TR2: MongoDB Atlas 512MB Limit**
- **Risk:** Storage exceeds free tier limit with PDF documents
- **Mitigation:** PDF optimization before upload, storage monitoring dashboard, upgrade to $9/month tier only if needed (unlikely for personal use)
- **Likelihood:** Low | **Impact:** Low (affordable upgrade path)

**TR3: Vercel Serverless Cold Starts**
- **Risk:** First request after inactivity has ~1-2s delay (MongoDB connection)
- **Mitigation:** Accept cold starts for free tier personal use, implement connection pooling, upgrade to paid tier only if becomes problematic
- **Likelihood:** High | **Impact:** Low (acceptable for family use)

**Integration Risks:**

**IR1: Domain Schema Design Errors**
- **Risk:** Domain-specific schemas don't capture all needed fields, requiring rework
- **Mitigation:** Reference Appendix A from brief (detailed field requirements), validate schemas with spouse before implementation, iterate based on real usage
- **Likelihood:** Medium | **Impact:** Medium (rework required)

**IR2: Google OAuth Breakage**
- **Risk:** Auth flow breaks during migration to new API structure
- **Mitigation:** Preserve existing `/auth/*` endpoints unchanged, test OAuth flow before touching auth code, maintain existing Passport.js patterns
- **Likelihood:** Low | **Impact:** High (blocks all access)

**IR3: Data Re-entry Burden**
- **Risk:** Manual re-entry of existing records feels tedious, impacts adoption
- **Mitigation:** Leverage bank import to accelerate data entry, prioritize "critical first" approach (3-5 records for quick wins), spouse helps with data entry
- **Likelihood:** Medium | **Impact:** Medium (motivation risk)

**Deployment Risks:**

**DR1: Vercel Free Tier Limits Exceeded**
- **Risk:** Free tier bandwidth/function limits exceeded during development
- **Mitigation:** Monitor Vercel dashboard usage, personal/family scale unlikely to exceed limits, upgrade path available if needed
- **Likelihood:** Very Low | **Impact:** Low (affordable upgrade)

**DR2: MongoDB Atlas Connection Issues**
- **Risk:** Atlas IP whitelisting blocks Vercel serverless IPs (dynamic)
- **Mitigation:** Use "Allow access from anywhere" (0.0.0.0/0) with strong auth, or Vercel IP ranges whitelist, test connection before deployment
- **Likelihood:** Medium | **Impact:** Medium (deployment blocker)

**DR3: Environment Variable Configuration Errors**
- **Risk:** Missing/incorrect env vars cause runtime failures in production
- **Mitigation:** Checklist of required env vars, test in Vercel preview deployment before production, document setup in README
- **Likelihood:** Medium | **Impact:** High (breaks functionality)

**Mitigation Strategies:**

- **Risk TR1 (GridFS):** Pair programming approach with AI guidance during implementation
- **Risk TR2 (Storage):** Implement storage dashboard early, monitor proactively
- **Risk IR1 (Schemas):** Validate with spouse before coding, iterate based on feedback
- **Risk IR2 (OAuth):** Don't touch working auth until other features stable
- **Risk DR2 (Atlas):** Test MongoDB connection from Vercel preview env first

---

## Epic and Story Structure

### Epic Approach

**Epic Structure Decision:** **Single Comprehensive Epic** - "Life Domain Architecture Migration"

**Rationale:**

This brownfield enhancement should be structured as a **single epic** because:

1. **Cohesive Architectural Change:** All work is tightly coupled around the life domain transformation - navigation, schemas, forms, and data model changes are interdependent
2. **Shared Technical Foundation:** Domain-specific schemas, GridFS integration, and API restructure must be completed together for the system to function
3. **Incremental Domain Delivery:** Stories can deliver domains incrementally (Property first, then Vehicles, etc.) while staying within one epic scope
4. **Minimal Data Context:** Clean slate approach (no complex migration) means stories flow naturally without epic boundaries
5. **Personal Use Scale:** This isn't multiple unrelated features - it's one cohesive refactor for a single-user brownfield project

**Alternative Considered (Multiple Epics):** Could split into "Architecture Refactor" + "Domain Implementation" + "Document Management" but this creates artificial boundaries for tightly coupled work. Single epic with well-sequenced stories is cleaner.

---

## Epic 1: Life Domain Architecture Migration

**Epic Goal:** Transform LegacyLock from abstract bills/categories structure to intuitive life domain organization (Property, Vehicles, Employment, Government, Finance, Insurance & Protection, Legal & Estate, Household Services) with domain-specific schemas, GridFS document storage, and enhanced renewal intelligence - while preserving Google OAuth authentication and premium design system.

**Integration Requirements:**
- Preserve existing Google OAuth authentication flow and user management
- Maintain premium design system (Swiss spa aesthetic, Inter font, Lucide React icons)
- Integrate GridFS document storage within MongoDB Atlas M0 free tier (512MB limit)
- Ensure Vercel Hobby (free) deployment compatibility with serverless architecture
- Reuse existing UI components (Modal, Button, Input) for consistency

---

### Story 1.1: Foundation - Domain Data Models and API Infrastructure

**As a** developer,
**I want** to create the domain-based MongoDB schemas and base API structure,
**so that** I can build domain-specific records without touching existing auth or UI.

**Acceptance Criteria:**

1. Eight Mongoose schemas created (PropertyRecord, VehicleRecord, EmploymentRecord, GovernmentRecord, FinanceRecord, InsuranceRecord, LegalRecord, ServicesRecord) with domain-specific fields from brief Appendix A
2. Base API routes `/api/domains/:domain/records` support CRUD operations (Create, Read, Update, Delete) for any domain
3. Domain validation middleware ensures only valid domains accepted (property, vehicles, employment, government, finance, insurance, legal, services)
4. Priority field (Critical/Important/Standard) included in all domain schemas
5. Renewal date field optional but standardized across domains where applicable
6. User association preserved (records linked to user._id, multi-user support maintained)

**Integration Verification:**

- **IV1: Existing Auth Unchanged** - Google OAuth flow, `/api/users/*` endpoints, session management untouched and functional
- **IV2: Database Coexistence** - New domain collections created alongside existing collections (no deletions)
- **IV3: API Testing** - Postman/curl tests confirm domain CRUD operations work independently of frontend

---

### Story 1.2: GridFS Document Storage Integration

**As a** household administrator,
**I want** to upload and store PDF documents using MongoDB GridFS,
**so that** I can link insurance policies, contracts, and statements to my domain records within the free tier storage limit.

**Acceptance Criteria:**

1. GridFS bucket initialized in MongoDB Atlas connection (`documents.files` and `documents.chunks` collections)
2. Document upload API endpoint `POST /api/domains/:domain/records/:id/documents` accepts PDF/image files up to 10MB
3. Document download API endpoint `GET /api/domains/:domain/records/:id/documents/:docId` streams file from GridFS to browser
4. Document delete API endpoint `DELETE /api/domains/:domain/records/:id/documents/:docId` removes file from GridFS and updates record
5. Domain records store `documentIds: [ObjectId]` array linking to GridFS files
6. Storage monitoring utility logs usage when approaching 400MB (80% of 512MB limit)
7. PDF optimization guidance added to upload UI (compress before upload)

**Integration Verification:**

- **IV1: GridFS Within Atlas Free Tier** - Confirm GridFS uses same 512MB quota as collections, monitoring dashboard functional
- **IV2: Document-Record Linking** - Upload document to record, verify `documentIds` array updated, cascade delete removes GridFS files when record deleted
- **IV3: Download Performance** - Stream large PDFs (5-10MB) from GridFS to browser without timeout on Vercel serverless (10s limit)

**GridFS Tutorial Notes (for developer):**
- Mongoose GridFSBucket API: `openUploadStream()`, `openDownloadStream()`, `delete()`
- Chunking happens automatically for files >16MB
- Store metadata (filename, contentType, uploadDate) in GridFS for retrieval

---

### Story 1.3: Property Domain MVP (End-to-End Validation)

**As a** household administrator,
**I want** to manage Property domain records (mortgage, utilities, home insurance) with full CRUD and document linking,
**so that** I can validate the life domain approach works end-to-end before adding other domains.

**Acceptance Criteria:**

1. Homepage displays single "Property" domain card with icon (Lucide `Home`), description, and record count
2. Click Property card navigates to `/property` domain detail view showing list of property records
3. "Add Record" button opens domain-specific form with Property fields: name, address, provider, account number, renewal date, priority, notes
4. Property records display in list/card view with key fields visible (name, provider, renewal date, priority indicator)
5. Click record opens detail view with all fields + linked documents section
6. Upload document to property record using GridFS (PDF/image), display in documents section with download/delete options
7. Edit/delete record functionality works with proper confirmation dialogs
8. Renewal date (if set) appears in basic renewals list view

**Integration Verification:**

- **IV1: Premium Design Consistency** - Property domain card, forms, and detail views use existing Inter font, Lucide icons, color palette, Modal/Button/Input components
- **IV2: Multi-User Access** - Spouse can log in, view property records, add new records, upload documents (shared household data preserved)
- **IV3: GridFS Integration** - Upload 5-10 test PDFs to property records, confirm storage monitoring shows usage, download/delete works correctly

**Why Property First:**
- Most complex domain (mortgage, rates, multiple utilities) - validates schema design
- High value for household (immediate usefulness)
- If Property works, other domains follow same pattern with less risk

---

### Story 1.4: Vehicles Domain Implementation

**As a** household administrator,
**I want** to manage Vehicles domain records (car finance, MOT, insurance, road tax),
**so that** I can organize all car-related information in one domain.

**Acceptance Criteria:**

1. Vehicles domain card added to homepage with icon (Lucide `Car`)
2. Vehicles domain detail view (`/vehicles`) shows vehicle records
3. Vehicle-specific form includes: registration, make/model, purchase date, finance details, MOT expiry, insurance renewal, road tax expiry, priority
4. Vehicle records display with registration, make/model, next renewal (MOT/insurance/tax - whichever is soonest)
5. Document linking works for V5C, insurance certificates, MOT certificates, service receipts

**Integration Verification:**

- **IV1: Pattern Consistency** - Vehicles domain follows exact same UI/API patterns as Property (reuse components, consistent navigation)
- **IV2: Cross-Domain Isolation** - Property records unaffected by Vehicles addition, both domains function independently
- **IV3: Renewal Dashboard** - Renewals from both Property and Vehicles appear in renewals list (cross-domain aggregation works)

---

### Story 1.5: Finance Domain Implementation

**As a** household administrator,
**I want** to manage Finance domain records (bank accounts, savings, ISAs, credit cards, loans),
**so that** I can track all financial accounts with UK-specific fields like sort codes.

**Acceptance Criteria:**

1. Finance domain card added to homepage with icon (Lucide `Banknote` or `Wallet`)
2. Finance domain detail view (`/finance`) shows financial records
3. Finance-specific form includes: account name, institution, sort code, account number, balance, interest rate, account type (current/savings/ISA/credit/loan), renewal date (for fixed-rate products), priority
4. Finance records display with institution, account type, masked account number (last 4 digits), balance
5. Critical priority flag prominent for bank accounts (emergency view requirement)

**Integration Verification:**

- **IV1: Northern Ireland Context** - Sort code format validation (XX-XX-XX), building societies in institution dropdown, ISA/current account terminology
- **IV2: Emergency View Foundation** - Critical priority records identifiable, lays groundwork for emergency view in later story
- **IV3: Three Domains Functional** - Property, Vehicles, Finance all working independently, homepage shows 3 domain cards, renewals aggregate from all 3

---

### Story 1.6: Remaining Domains Implementation (Employment, Government, Insurance, Legal, Services)

**As a** household administrator,
**I want** to manage the remaining 5 life domains with domain-specific schemas,
**so that** I have complete household information organization across all 8 domains.

**Acceptance Criteria:**

1. **Employment Domain:** Employer details, payroll number, salary, pension scheme, workplace benefits, P60 documents
2. **Government Domain:** NI number, tax records, benefits, driving licence expiry, passport expiry, certificates
3. **Insurance & Protection Domain:** Life insurance, income protection, health insurance, pet insurance, warranties
4. **Legal & Estate Domain:** Will, power of attorney, trusts, property deeds, solicitor details
5. **Household Services Domain:** Tradespeople (plumber, electrician, etc.), service providers, contact details, quality ratings, job history
6. All 8 domains appear on homepage with appropriate Lucide icons
7. Each domain follows established pattern (domain card → detail view → record CRUD → document linking)

**Integration Verification:**

- **IV1: Schema Completeness** - All domain-specific fields from brief Appendix A implemented correctly, spouse validates fields match real-world needs
- **IV2: Performance at Scale** - Homepage with 8 domain cards loads quickly, navigation smooth, no performance degradation
- **IV3: Storage Monitoring** - With 8 domains active and test data, storage usage visible in monitoring dashboard, well under 512MB limit

**Implementation Note:** This story delivers 5 domains in one batch because the pattern is established (Property/Vehicles/Finance validated the approach). Each domain is simpler than Property, so grouped for efficiency.

---

### Story 1.7: Enhanced Renewal Dashboard (Cross-Domain Intelligence)

**As a** household administrator,
**I want** to see all upcoming renewals across all domains in a unified dashboard,
**so that** I never miss important deadlines regardless of which domain they belong to.

**Acceptance Criteria:**

1. Renewals page (`/renewals`) aggregates renewal dates from ALL 8 domains
2. Renewals grouped by urgency: Overdue (red), <30 days (orange), 30-60 days (yellow), 60-90 days (green)
3. Each renewal shows: record name, domain (icon + label), renewal date, days remaining, priority indicator
4. Click renewal navigates to source record detail view in appropriate domain
5. Filter renewals by domain (show only Property renewals, only Vehicles, etc.)
6. Filter renewals by priority (Critical/Important/Standard)
7. Empty state message when no renewals upcoming

**Integration Verification:**

- **IV1: Cross-Domain Aggregation** - Add renewal dates to records across multiple domains, confirm all appear in dashboard correctly sorted by urgency
- **IV2: Navigation Context** - Click renewal from dashboard → navigate to correct domain → correct record (breadcrumb trail maintained)
- **IV3: Real-Time Updates** - Add new renewal in Property domain, immediately appears in renewals dashboard without page refresh

---

### Story 1.8: Emergency View (Critical Records Access)

**As an** emergency information seeker (executor/family in crisis),
**I want** to view only Critical priority records across all domains in a simplified interface,
**so that** I can quickly find bank accounts, insurance policies, and legal documents during an emergency.

**Acceptance Criteria:**

1. "Emergency View" button prominent in main navigation
2. Emergency view page (`/emergency`) shows only Critical priority records from all 8 domains
3. Records grouped by domain with domain headers (Property Critical Records, Finance Critical Records, etc.)
4. Simplified layout: record name, key identifier (account number/registration/policy number), contact info, linked documents
5. Print-friendly CSS (clean black/white, no unnecessary UI chrome)
6. Breadcrumb navigation to return to normal view
7. Warning message: "This view shows only Critical priority records. For complete information, return to standard view."

**Integration Verification:**

- **IV1: Priority Filtering** - Mark records as Critical across multiple domains, confirm only those appear in emergency view (Important/Standard hidden)
- **IV2: Print Functionality** - Browser print creates clean, usable emergency reference sheet (no broken layouts)
- **IV3: Spouse Validation** - Non-technical family member can locate all bank accounts within 5 minutes using emergency view (success metric from brief)

---

### Story 1.9: Bank Import Enhancement (Domain Mapping)

**As a** household administrator,
**I want** bank statement transactions to suggest appropriate life domains when creating records,
**so that** I can quickly populate domains using my existing working bank import functionality.

**Acceptance Criteria:**

1. Bank import transaction table includes "Create Record" button per transaction (existing functionality preserved)
2. Click "Create Record" opens domain selection dialog with intelligent suggestion:
   - Energy bill transaction → suggests Property domain
   - Car insurance transaction → suggests Vehicles domain
   - Pension contribution → suggests Employment domain
3. After domain selection, opens domain-specific form pre-populated with transaction details (amount, date, provider name extracted)
4. User confirms/edits fields and saves to selected domain
5. Transaction marked as "record created" to avoid duplicates
6. Import session management preserved (existing background processing)

**Integration Verification:**

- **IV1: Existing Import Preserved** - HSBC multi-line transaction parsing still works, import sessions functional, recurring payment detection intact
- **IV2: Domain Intelligence** - Test various transaction types, verify domain suggestions accurate (80%+ correct domain suggested)
- **IV3: Data Population Acceleration** - Import bank statement with 20 transactions, create 10 domain records in under 5 minutes (vs. manual entry ~20 minutes)

**Why This Story Last:**
- Builds on stable domain foundation (all 8 domains working)
- Leverages existing working feature (bank import) as accelerator
- Non-blocking: domains work fine without this, but this makes adoption faster

---

## Epic Summary

**Total Stories:** 9
**Estimated Effort:** 6-10 weeks (part-time solo developer)

**Key Milestones:**
- ✅ Story 1.1-1.2: Foundation (infrastructure, GridFS) - No user-visible changes
- ✅ Story 1.3: Property MVP - First domain end-to-end (validate approach)
- ✅ Story 1.4-1.6: Domain Expansion - All 8 domains functional
- ✅ Story 1.7-1.8: Cross-domain features (renewals, emergency view)
- ⏸️ Story 1.9: Bank import enhancement → **MOVED TO EPIC 2 as Story 2.4** (see Epic 2 below)

**Risk Mitigation Through Sequencing:**
1. Infrastructure first (no UI changes, low risk)
2. Single domain validation (Property) before scaling
3. Established pattern reuse (Vehicles/Finance follow Property)
4. Cross-domain features only after domains stable
5. Enhancement features last (bank import optional, not blocking)

---

## Epic 2: Legacy System Retirement & Bank Import Migration

**Epic Status:** 📋 **Approved - Ready for Implementation**
**Created:** 2025-10-05
**Epic Goal:** Remove legacy Bills/Accounts/Categories system, migrate Bank Import functionality to domain architecture, and establish clean domain-first user experience.

**Why Epic 2:** Epic 1 successfully built domain architecture but didn't retire the old system. Users currently see two parallel navigation systems (legacy + domains), creating confusion. Epic 2 completes the migration vision by systematically removing legacy components while preserving valuable Bank Import functionality.

**Integration Requirements:**
- Preserve Bank Import functionality (HSBC parser, recurring payment detection)
- Archive legacy data in database (safety net - don't delete)
- Prioritize Bank Import migration early (unlock productivity)
- Maintain Epic 1 stability (180+ tests must pass)

---

### Story 2.1: Navigation Cleanup & Domain-First Experience

**As a** household administrator,
**I want** to see only domain-based navigation (no legacy Accounts/Bills/Categories),
**so that** I have a clear, unconfused navigation experience.

**Acceptance Criteria:**

1. Remove Accounts, Bills, Categories, Contacts, Documents navigation items from Layout.tsx
2. Update navigation to show: Home, Renewals, Emergency, Settings (as per PRD)
3. HomePage displays 8 domain cards as primary interface (already built in Epic 1)
4. No broken links or console errors after removal
5. Breadcrumb navigation works correctly for all domain pages

**Integration Verification:**
- **IV1: Epic 1 Preservation** - All Epic 1 domain pages still accessible via domain cards
- **IV2: Cross-Domain Features** - Renewals and Emergency pages still accessible via navigation
- **IV3: Mobile Responsive** - Navigation maintained on mobile/tablet/desktop breakpoints

**Estimated Effort:** 1-2 hours

---

### Story 2.2: Legacy Route & Component Removal

**As a** developer,
**I want** to remove unused legacy routes and components (while preserving Bank Import),
**so that** the codebase is clean and maintainable.

**Acceptance Criteria:**

1. Archive (don't delete) legacy routes: `src/routes/entries.js`
2. Archive legacy page components: Accounts.tsx, Bills.tsx, Categories.tsx, Contacts.tsx, Documents.tsx (if exist)
3. **Preserve Bank Import routes:** `src/routes/import.js` remains fully functional
4. Remove route registrations from `src/server.js` for archived routes
5. Update React Router in `web/src/App.tsx` to remove legacy page routes
6. No console errors or broken references after cleanup
7. All Epic 1 tests still pass (180+ tests)

**Integration Verification:**
- **IV1: Bank Import Preserved** - Bank Import page still accessible, all functionality intact
- **IV2: Epic 1 Unaffected** - Domain pages, renewals, emergency view all functional
- **IV3: Authentication Unchanged** - Google OAuth flow continues to work

**Estimated Effort:** 3-4 hours

---

### Story 2.3: Bank Import Schema Migration

**As a** developer,
**I want** to update Bank Import to create domain records instead of legacy entries,
**so that** parsed transactions flow into the new domain architecture.

**Acceptance Criteria:**

1. Update `ImportController.js` to create records in domain collections (not legacy `entries` collection)
2. Transaction confirmation creates domain record with appropriate schema (PropertyRecord, VehicleRecord, etc.)
3. Import sessions still track transactions correctly (preserve existing ImportSession model)
4. HSBC multi-line transaction parsing still works (no regression)
5. Recurring payment detection preserved
6. Background processing via `backgroundProcessor.js` still functional
7. All Bank Import tests pass

**Integration Verification:**
- **IV1: Parser Preserved** - Upload HSBC statement → transactions parsed correctly
- **IV2: Domain Creation** - Confirm transaction → creates record in correct domain collection
- **IV3: Session Management** - ImportSession shows correct transaction count and status

**Estimated Effort:** 6-8 hours
**Priority:** CRITICAL (unlocks productivity)

---

### Story 2.4: Bank Import Domain Intelligence

**As a** household administrator,
**I want** bank transactions to suggest the appropriate domain when creating records,
**so that** I can quickly populate domains with intelligent defaults.

**Acceptance Criteria:**

1. Transaction table in BankImport.tsx shows "Create Record" button per transaction
2. Click "Create Record" opens domain selection dialog with intelligent suggestion:
   - Energy bill transaction (British Gas, EDF, OVO) → suggests Property domain
   - Car insurance transaction (Direct Line, Admiral) → suggests Vehicles domain
   - Pension contribution (Aviva, Standard Life) → suggests Employment domain
   - Council Tax → suggests Property domain
3. After domain selection, opens domain-specific form pre-populated with:
   - Provider name extracted from transaction description
   - Amount from transaction
   - Date from transaction
4. User can edit pre-populated fields before saving
5. Transaction marked as "record created" to avoid duplicates
6. Domain suggestion accuracy ≥80% for common UK providers

**Integration Verification:**
- **IV1: Domain Suggestions** - Test with real HSBC statement, verify domain suggestions accurate
- **IV2: Form Pre-population** - Verify form pre-population reduces data entry time
- **IV3: Productivity Metric** - Create 10 domain records in <5 minutes (vs ~20 minutes manual entry)

**Estimated Effort:** 8-10 hours
**Note:** Originally PRD Story 1.9, moved to Epic 2 for clean epic separation

---

### Story 2.5: Legacy Data Archive & Safety Net

**As a** developer,
**I want** to archive legacy data collections (keep in database but hidden from UI),
**so that** we have a safety net if migration issues arise.

**Acceptance Criteria:**

1. Legacy collections (`entries`, `categories`) remain in MongoDB (not deleted)
2. Add `_archived: true` field to all documents in legacy collections (migration script)
3. Legacy API routes return 410 Gone status (not 404) with message: "This API has been replaced by domain-based endpoints"
4. Database backup script created before archival (safety precaution)
5. README documentation updated with instructions for accessing archived data if needed
6. Storage monitoring confirms legacy data size (verify within MongoDB Atlas 512MB limit)

**Integration Verification:**
- **IV1: Data Preserved** - Run migration script on test database, verify legacy data still in MongoDB
- **IV2: API Status** - Verify API endpoints return appropriate 410 Gone status
- **IV3: Backup Process** - Test database backup/restore process works correctly

**Estimated Effort:** 4-5 hours

---

## Epic 2 Summary

**Total Stories:** 5
**Estimated Effort:** 22-29 hours (4-6 weeks part-time at 5-7 hours/week)

**Key Milestones:**
- Story 2.1-2.2: Navigation cleanup, legacy route removal (Quick wins)
- Story 2.3: Bank Import schema migration (Critical path - PRIORITY)
- Story 2.4: Bank Import domain intelligence (Productivity unlock)
- Story 2.5: Legacy data archive (Safety net)

**Risk Mitigation:**
1. Archive (don't delete) legacy code - easy rollback if needed
2. Bank Import migration in isolation - doesn't affect Epic 1 features
3. Incremental testing after each story - catch regressions early
4. Database backup before data archive - safety precaution

**Epic 2 Success Criteria:**
- ✅ Legacy navigation removed, clean domain-first UX
- ✅ Bank Import creates domain records (not legacy entries)
- ✅ Domain suggestions ≥80% accurate for UK providers
- ✅ Legacy data archived (safety net preserved)
- ✅ All Epic 1 tests still passing (180+)

---

**Document Version:** 2.0
**Date:** 2025-10-05
**Status:** Epic 1 Complete, Epic 2 Approved - Ready for Implementation
**Next Review:** After Epic 2 completion
