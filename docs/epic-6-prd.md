# LegacyLock Epic 6: Hierarchical Domain Model Refactor - Brownfield Enhancement PRD

**Version**: 3.0
**Date**: January 16, 2025
**Status**: Draft

---

## 1. Intro Project Analysis and Context

### 1.1 Existing Project Overview

**Analysis Source**: IDE-based analysis + conversation context + existing documentation

**Current Project State**:

LegacyLock is a **Northern Ireland-focused household continuity planning application** for couples to store critical information needed when a partner dies or becomes incapacitated. The application is a full-stack Node.js/Express + React/TypeScript system with MongoDB database and Google OAuth authentication.

**Core Purpose**: Ensure a surviving partner or executor can answer essential questions:
- "Who do I call when the boiler breaks?"
- "Where is the vehicle registration document?"
- "What's the renewal date for home insurance?"
- "Who is our solicitor and how do I contact them?"

**Recent Major Milestone** (Epic 5 - September 2025):
- Complete bank import system with PDF parsing (HSBC multi-line transaction support)
- Transaction-to-entry conversion with smart category suggestions
- Pattern detection engine for recurring payments (auto-ignore functionality)
- Transaction History page with filtering, search, and status tracking
- Import Timeline with visual calendar interface
- Premium Swiss spa aesthetic with Lucide icons and Inter font

**Current Architecture**:
- **Backend**: Node.js/Express API (`src/`), Passport.js auth, Mongoose ODM
- **Frontend**: React/TypeScript SPA (`web/`), Vite build, React Query for state management
- **Database**: MongoDB with 10+ domain collections (Property, Vehicle, Employment, Insurance, Services, Finance, Legal, Government, etc.)
- **Deployment**: Designed for managed services (Vercel, Render), MongoDB Atlas for production

### 1.2 Current Domain Model (Flat Architecture)

**Problem Identified**: The current domain model treats all records as flat, independent entities. This creates organizational problems for household continuity planning:

**Example Issue - Vehicle Domain**:
```
Current Structure (FLAT):
Vehicle Collection:
  - Record: "2019 Honda Civic" (vehicle details)
  - Record: "Car Finance Loan" (standalone finance record)
  - Record: "MOT Inspection" (standalone service record)
  - Record: "Car Tax Payment" (standalone government record)
```

**Problems for Continuity Planning**:
1. **No context**: If a partner passes away, the surviving partner sees "Car Finance Loan" but doesn't know which vehicle it's for
2. **Scattered information**: All critical details about a vehicle (registration, MOT date, insurance renewal, finance contact) are in separate unrelated records
3. **Difficult handover**: Cannot provide a complete picture of "everything related to Calvin's car" to help someone take over management
4. **Lost knowledge**: No way to group service history, contact information, and renewal dates under the asset they relate to

**This same problem exists for Property, Employment, and Services (tradespeople/providers) domains.**

### 1.3 Available Documentation Analysis

✅ **Available Documentation**:
- ✅ Tech Stack Documentation (CLAUDE.md, package.json)
- ✅ Architecture Documentation (docs/architecture/*)
- ✅ Source Tree (comprehensive codebase structure)
- ✅ API Documentation (all domain endpoints documented)
- ✅ Epic 5 specifications and remaining work analysis
- ✅ UK/NI focus notes and terminology reference

**Documentation Status**: Comprehensive technical documentation exists. This PRD will document the NEW hierarchical architecture.

### 1.4 Enhancement Scope Definition

**Enhancement Type**: ☑️ **Major Feature Modification** + **Technology Stack Upgrade** (database restructuring)

**Enhancement Description**:

Transform LegacyLock from a **flat domain model** to a **hierarchical parent-child domain model** optimized for household continuity planning where:
- **Parent Entity Domains** (Vehicle, Property, Employment, Services) contain top-level entities representing physical assets, locations, jobs, and service providers
- **Child Records** (Contact Info, Service History, Finance, Insurance, Government, Pension) attach to parent entities with critical information for continuity
- **Flexible taxonomy** allows admin configuration of which child record types are available per domain
- **Admin interface** for managing parent-child relationships and record type configurations
- **Focus on continuity**: Contact information, renewal dates, service history, and account numbers take priority over financial tracking

**Impact Assessment**: ☑️ **Major Impact (architectural changes required)**

This enhancement requires:
- Complete database schema redesign for 4 parent entity domains (added Services)
- New child record schema with parent references optimized for continuity data
- Deletion of 7 existing flat domain collections (Insurance, Finance, Services, Government, Legal, Education, and related records)
- New admin configuration system for record type taxonomy
- Complete frontend UI restructuring (domain pages, forms, navigation)
- Two-step workflow for Epic 5 transaction-to-entry conversion
- Migration strategy for users to rebuild their data in new hierarchical structure

### 1.5 Target Architecture (Hierarchical Model)

**New Structure**:

```
Vehicle Domain (Parent Entity):
  └─ Parent: "2019 Honda Civic - Calvin's Car"
      ├─ Child Record: Contact - "Finance company: 0800-FINANCE, Account #12345"
      ├─ Child Record: Government - "MOT due: March 2025, Tax renewal: April 2025"
      ├─ Child Record: Insurance - "Insurer: Direct Line, Policy #ABC123, Renewal: June 2025"
      └─ Child Record: Service History - "Last service: Joe's Garage, 028-1234-5678"

Property Domain (Parent Entity):
  └─ Parent: "123 Main Street - Primary Residence"
      ├─ Child Record: Contact - "Estate agent: Smith & Co, 028-9876-5432"
      ├─ Child Record: Government - "Domestic Rates: £1200/year, Direct debit active"
      ├─ Child Record: Services - "Heating oil: Wilson Fuels, 028-5555-1234"
      └─ Child Record: Insurance - "Home insurance: Aviva, Renewal: August 2025"

Employment Domain (Parent Entity):
  └─ Parent: "Acme Corp - Software Engineer"
      ├─ Child Record: Contact - "HR: hr@acme.com, Manager: John Smith"
      ├─ Child Record: Finance - "Salary: Monthly via BACS"
      ├─ Child Record: Insurance - "Private healthcare: Bupa, Policy #XYZ789"
      └─ Child Record: Pension - "Workplace pension: Scottish Widows, 5% contribution"

Services Domain (Parent Entity - NEW):
  └─ Parent: "McGrath Plumbing - Emergency Plumber"
      ├─ Child Record: Contact - "Mobile: 07700-900123, Email: info@mcgrathplumbing.com"
      ├─ Child Record: Service History - "Boiler repair June 2024: £150, Very reliable"
      ├─ Child Record: Finance - "Prefers cash payment, £60/hour callout"
      └─ Child Record: Notes - "Available weekends, knows our heating system well"
```

**Key Benefits for Household Continuity**:
1. **Complete context**: All information about a vehicle/property/job/tradesperson in one place
2. **Easy handover**: Surviving partner can see "everything about the house" or "everything about Calvin's employment"
3. **Critical contact info**: Phone numbers, policy numbers, account numbers grouped with what they relate to
4. **Renewal tracking**: All renewal dates, service dates, and important deadlines visible per entity
5. **Service provider directory**: Tradespeople and service contacts organized and easily accessible
6. **Financial data**: Included but secondary - costs are helpful but not the primary focus

### 1.6 Goals and Background Context

**Goals**:
- Transform flat domain model into hierarchical parent-child structure optimized for household continuity planning
- Enable users to organize critical information by parent entity (vehicle, property, employer, service provider)
- Ensure a surviving partner can quickly find contact info, renewal dates, and service history for any household entity
- Provide admin interface for configuring record type taxonomy
- Maintain Epic 5 transaction-to-entry workflow with two-step parent selection
- Delete legacy flat records and start with clean hierarchical structure
- Add Services domain for storing tradesperson and service provider information

**Background Context**:

During Epic 5 implementation (Transaction Ledger & Pattern Intelligence), a fundamental organizational issue was discovered: when creating a Vehicle record from a bank transaction (e.g., "Car Finance Payment"), the system created a standalone record with no relationship to the actual vehicle it belonged to.

The user realized the core purpose of LegacyLock is **not financial tracking** but **household continuity planning**. The critical question is:

> **"If I die tomorrow, can my partner figure out who to call when the boiler breaks, where the car insurance documents are, and when the MOT is due?"**

This requires:
1. Grouping all information about an entity (vehicle, property, job, tradesperson) in one place
2. Prioritizing contact information, renewal dates, policy numbers, and service history
3. Making it easy to provide a complete "handover package" for any household asset
4. Organizing tradespeople and service providers so they're easy to find in an emergency

**Migration Strategy**: Complete data deletion and fresh start. Existing records in Insurance, Finance, Services, Government, Legal domains will be deleted. Users will rebuild their data using the new hierarchical structure focused on continuity planning.

### 1.7 Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|--------|
| Initial PRD | 2025-01-16 | 1.0 | Created Epic 6 PRD (incorrect scope - address deduplication) | John (PM) |
| Major Revision | 2025-01-16 | 2.0 | Corrected scope - hierarchical domain model refactor | John (PM) |
| Purpose Reframe | 2025-01-16 | 3.0 | Reframed as continuity planning, added Services domain, fixed NI terminology | John (PM) |

---

## 2. Requirements

### 2.1 Functional Requirements

#### Parent Entity Management

**FR1**: System shall support four Parent Entity Domains: Vehicle, Property, Employment, Services.

**FR2**: Vehicle parent entities shall include fields: Name, Make, Model, Year, Registration Number, VIN, Purchase Date, Current Owner, Location (Property reference), Notes.

**FR3**: Property parent entities shall include fields: Name, Address (full NI/UK address with postcode), Property Type, Ownership Status, Purchase Date, Notes.

**FR4**: Employment parent entities shall include fields: Name, Employer Name, Job Title, Employment Type, Start Date, End Date (optional), Primary Contact, Notes.

**FR5**: Services parent entities shall include fields: Name, Business Name, Service Type (Plumber, Electrician, Oil Supplier, etc.), Primary Contact, Phone, Email, Address, Preferred Payment Method, Notes.

**FR6**: Each parent entity shall display a hierarchical view of all child records organized by record type (Contact, Service History, Finance, Insurance, Government, Pension).

**FR7**: Users shall be able to create, read, update, and delete parent entities via dedicated domain pages.

**FR8**: Deleting a parent entity shall cascade delete all child records with user confirmation prompt showing count of child records.

#### Child Record Management

**FR9**: Child records shall reference a parent entity via MongoDB ObjectId with Mongoose populate support.

**FR10**: Child record types shall include: Contact Info, Service History, Finance, Insurance, Government, Pension (with ability to add more via admin configuration).

**FR11**: Each child record shall include: Record Type, Name, Provider/Contact Name, Primary Contact (phone/email), Amount (optional), Frequency, Start Date, End Date/Renewal Date (optional), Status, Notes, Attachments.

**FR12**: Contact Info child records shall prioritize: Phone numbers, Email addresses, Account numbers, Policy numbers, Website URLs.

**FR13**: Service History child records shall prioritize: Date of service, Provider name, Contact details, Work completed, Cost (optional), Next service due.

**FR14**: Child records shall only be created within the context of a parent entity (no standalone child records allowed).

**FR15**: Users shall be able to create, read, update, and delete child records from the parent entity detail view.

**FR16**: Child records shall be displayed grouped by record type under their parent entity, with most recent entries shown first.

#### Flexible Taxonomy & Admin Configuration

**FR17**: System shall provide an Admin Configuration page accessible only to users with admin role.

**FR18**: Admin page shall allow configuration of which child record types are available for each parent domain (Vehicle, Property, Employment, Services).

**FR19**: Admin page shall allow creation of new custom child record types with: Type Name, Icon, Color, Description, Required Fields.

**FR20**: Admin configuration shall be stored in a new `domain_config` collection with per-user or global settings.

**FR21**: Changes to domain configuration shall take effect immediately for all users.

#### Transaction-to-Entry Workflow (Epic 5 Integration)

**FR22**: CreateEntryFromTransactionModal shall be modified to support two-step workflow:
   - Step 1: Select parent domain (Vehicle, Property, Employment, Services)
   - Step 2: Select existing parent entity OR create new parent entity inline
   - Step 3: Select child record type (Contact, Finance, Insurance, etc.)
   - Step 4: Fill child record details and submit

**FR23**: If no parent entities exist for selected domain, modal shall display "Create your first [Vehicle/Property/Employment/Service Provider]" message with inline creation form.

**FR24**: Transaction status shall update to "record_created" upon successful child record creation.

**FR25**: Pattern detection and auto-ignore functionality (Epic 5) shall continue to function unchanged.

#### Data Migration & Cleanup

**FR26**: System shall provide a one-time migration script to delete all records from legacy flat domain collections: Insurance, Finance, Services, Government, Legal.

**FR27**: Migration script shall preserve existing Vehicle, Property, Employment records but convert them to parent-only entities (strip out child record data).

**FR28**: Migration script shall include dry-run mode to preview changes before execution.

**FR29**: Migration script shall create backup of all collections before deletion.

**FR30**: After migration, users shall see a welcome screen explaining the new hierarchical structure with tutorial/onboarding flow emphasizing continuity planning purpose.

### 2.2 Non-Functional Requirements

**NFR1**: Parent-to-child queries shall use MongoDB `.populate()` with indexed `parentId` field for <100ms query performance.

**NFR2**: Parent entity list views shall support pagination (50 per page) with sorting by name, creation date, last updated.

**NFR3**: Child record counts per parent shall be efficiently calculated using aggregation pipelines and cached for dashboard views.

**NFR4**: Admin configuration changes shall invalidate relevant React Query caches to ensure UI updates immediately.

**NFR5**: Database schema changes shall include proper indexes: `userId`, `parentId`, `recordType`, `createdAt`.

**NFR6**: Migration script shall be idempotent (safe to run multiple times) and include rollback capability.

**NFR7**: Frontend forms shall implement optimistic updates for create/update/delete operations with rollback on failure.

**NFR8**: System shall maintain existing Epic 5 performance characteristics for transaction processing (<2s end-to-end for entry creation).

**NFR9**: Child record forms shall prioritize contact information fields (phone, email, policy numbers) over financial fields to support continuity planning purpose.

### 2.3 Compatibility Requirements

**CR1: Epic 5 Transaction Processing Compatibility**: Transaction History page and Import Timeline shall continue to function. CreateEntryFromTransactionModal shall be enhanced (not replaced) to support new two-step workflow while maintaining transaction status updates and pattern detection.

**CR2: Authentication & Authorization**: All parent entity and child record operations shall respect existing user ownership and sharing rules. Users can only access their own records or records shared with them.

**CR3: UI/UX Consistency**: New parent entity views and child record forms shall follow the existing premium Swiss spa aesthetic (Lucide icons, Inter font, dark gradients, sophisticated styling).

**CR4: API Versioning**: All API endpoints shall maintain backward compatibility during transition period. New hierarchical endpoints shall be namespaced (`/api/v2/vehicles`, `/api/v2/properties`, `/api/v2/services`, etc.) until migration is complete.

**CR5: Northern Ireland Terminology**: All government-related terminology shall use NI-appropriate language (Domestic Rates not Council Tax, MOT not NCT, etc.).

---

## 3. Technical Constraints and Integration Requirements

### 3.1 Existing Technology Stack

**Languages**: JavaScript (Node.js backend), TypeScript (React frontend)
**Frameworks**: Express.js 4.x, React 18.x, Vite 5.x
**Database**: MongoDB 7.x with Mongoose 8.x ODM
**Infrastructure**: Docker (local dev), MongoDB Atlas (production)
**External Dependencies**: Google OAuth 2.0, Passport.js, pdf-parse, React Query, React Hook Form

**Constraints**:
- Must maintain MongoDB as database (no SQL migration)
- Must preserve Google OAuth authentication flow
- Must work within existing Express routing structure
- Frontend must remain React SPA (no Next.js migration)

### 3.2 Database Integration Strategy

**Schema Changes**:

1. **New Collections**:
   - `parent_entities` - Generic collection for Vehicle, Property, Employment, Services parents
   - `child_records` - Generic collection for Contact, Service History, Finance, Insurance, etc. children
   - `domain_config` - Admin configuration for record type taxonomy

2. **Schema Structure**:
```javascript
// Parent Entity Schema
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  domainType: String (enum: ['Vehicle', 'Property', 'Employment', 'Services']),
  name: String,
  fields: Mixed (domain-specific fields - optimized for continuity planning),
  createdAt: Date,
  updatedAt: Date
}

// Child Record Schema (Continuity-Focused)
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  parentId: ObjectId (ref: ParentEntity),
  recordType: String (enum: ['Contact', 'ServiceHistory', 'Finance', 'Insurance', 'Government', 'Pension']),
  name: String,

  // Continuity Planning Fields (Priority)
  contactName: String,
  phone: String,
  email: String,
  accountNumber: String,
  policyNumber: String,
  renewalDate: Date,

  // Financial Fields (Secondary)
  amount: Number,
  frequency: String,

  // Common Fields
  provider: String,
  startDate: Date,
  endDate: Date,
  status: String,
  notes: String,
  attachments: [String],
  createdAt: Date,
  updatedAt: Date
}

// Domain Config Schema
{
  _id: ObjectId,
  domainType: String (enum: ['Vehicle', 'Property', 'Employment', 'Services']),
  allowedRecordTypes: [String],
  customRecordTypes: [{
    name: String,
    icon: String,
    color: String,
    description: String,
    requiredFields: [String]
  }],
  updatedAt: Date
}
```

3. **Indexes**:
   - `parent_entities`: { userId: 1, domainType: 1 }
   - `child_records`: { userId: 1, parentId: 1, recordType: 1 }
   - `child_records`: { renewalDate: 1 } (for upcoming renewal alerts)
   - `domain_config`: { domainType: 1 } (unique)

4. **Migration Strategy**:
   - Phase 1: Create new collections with schemas
   - Phase 2: Run migration script to delete legacy data
   - Phase 3: Deploy new API endpoints
   - Phase 4: Deploy new frontend UI
   - Phase 5: Remove legacy collection references from codebase

### 3.3 API Integration Strategy

**New Endpoints**:

```
# Parent Entities
GET    /api/v2/:domain                    # List parent entities (vehicles, properties, employments, services)
POST   /api/v2/:domain                    # Create parent entity
GET    /api/v2/:domain/:id                # Get parent entity with populated children
PUT    /api/v2/:domain/:id                # Update parent entity
DELETE /api/v2/:domain/:id                # Delete parent entity (cascade)

# Child Records (Continuity-Focused)
GET    /api/v2/:domain/:parentId/records           # List child records for parent
POST   /api/v2/:domain/:parentId/records           # Create child record
GET    /api/v2/:domain/:parentId/records/:recordId # Get child record
PUT    /api/v2/:domain/:parentId/records/:recordId # Update child record
DELETE /api/v2/:domain/:parentId/records/:recordId # Delete child record

# Continuity Planning Features
GET    /api/v2/renewals/upcoming          # Get upcoming renewals across all domains
GET    /api/v2/contacts/:domain           # Get all contact info for a domain
GET    /api/v2/services/directory         # Get full directory of service providers

# Admin Configuration
GET    /api/admin/domain-config           # Get all domain configurations
PUT    /api/admin/domain-config/:domain   # Update domain configuration
POST   /api/admin/domain-config/record-types # Create custom record type

# Migration
POST   /api/admin/migrate                 # Run migration script (admin only)
GET    /api/admin/migrate/preview         # Dry-run migration preview
```

**Backward Compatibility**:
- Legacy endpoints (`/api/vehicles`, `/api/properties`, etc.) will return 410 Gone after migration
- Epic 5 endpoints (`/api/transactions`, `/api/imports`) remain unchanged

### 3.4 Frontend Integration Strategy

**Component Changes**:

1. **New Components**:
   - `ParentEntityList` - List view for vehicles/properties/employments/services
   - `ParentEntityDetail` - Detail view with hierarchical child records emphasizing continuity
   - `ParentEntityForm` - Create/edit parent entity
   - `ChildRecordList` - Grouped child records under parent with contact info prominent
   - `ChildRecordForm` - Create/edit child record with continuity fields prioritized
   - `ServicesDirectory` - Directory view of all service providers (NEW)
   - `UpcomingRenewals` - Dashboard widget showing upcoming renewal dates
   - `AdminDomainConfig` - Admin configuration page
   - `OnboardingTutorial` - Post-migration welcome screen explaining continuity planning

2. **Modified Components**:
   - `CreateEntryFromTransactionModal` - Two-step workflow (select parent, then child type) with Services domain option
   - `Navigation` - Update domain links to include Services
   - `Dashboard` - Update widgets to show parent entity summaries and upcoming renewals

3. **Routing Changes**:
```
/vehicles           → List of vehicle parent entities
/vehicles/:id       → Vehicle detail with child records
/properties         → List of property parent entities
/properties/:id     → Property detail with child records
/employments        → List of employment parent entities
/services           → Services directory (tradespeople, providers) - NEW
/services/:id       → Service provider detail - NEW
/renewals           → Upcoming renewals dashboard - NEW
/admin/domains      → Admin domain configuration
```

4. **State Management**:
   - React Query cache keys updated to use v2 endpoints
   - Optimistic updates for all CRUD operations
   - Cache invalidation on parent deletion (cascade to children)

### 3.5 Code Organization and Standards

**File Structure**:
```
src/
  models/
    ParentEntity.js        # Generic parent entity model (4 domains)
    ChildRecord.js         # Generic child record model (continuity-focused)
    DomainConfig.js        # Admin configuration model
  routes/
    v2/
      vehicles.js          # V2 vehicle routes
      properties.js        # V2 property routes
      employments.js       # V2 employment routes
      services.js          # V2 services routes (NEW)
    admin/
      domainConfig.js      # Admin configuration routes
      migration.js         # Migration script routes
  services/
    parentEntityService.js # Business logic for parents
    childRecordService.js  # Business logic for children
    continuityService.js   # Renewal tracking, contact directory (NEW)
    migrationService.js    # Migration utilities

web/src/
  components/
    parent-entities/
      ParentEntityList.tsx
      ParentEntityDetail.tsx
      ParentEntityForm.tsx
    child-records/
      ChildRecordList.tsx
      ChildRecordForm.tsx
    services/
      ServicesDirectory.tsx      # NEW
      ServiceProviderCard.tsx    # NEW
    continuity/
      UpcomingRenewals.tsx       # NEW
      ContactDirectory.tsx       # NEW
    admin/
      AdminDomainConfig.tsx
  hooks/
    useParentEntities.ts   # React Query hooks for parents
    useChildRecords.ts     # React Query hooks for children
    useRenewals.ts         # React Query hooks for renewals (NEW)
    useDomainConfig.ts     # React Query hooks for config
  pages/
    Vehicles.tsx
    VehicleDetail.tsx
    Properties.tsx
    PropertyDetail.tsx
    Employments.tsx
    EmploymentDetail.tsx
    Services.tsx           # NEW
    ServiceDetail.tsx      # NEW
    Renewals.tsx           # NEW
    AdminDomains.tsx
```

**Naming Conventions**:
- Parent entities: Singular domain name (Vehicle, Property, Employment, Services)
- Child records: Generic "ChildRecord" with `recordType` field
- API routes: Pluralized domain names (vehicles, properties, employments, services)

### 3.6 Deployment and Operations

**Build Process Integration**:
- No changes to existing Vite build process
- Migration script runs as one-time admin operation (not automated deployment step)

**Deployment Strategy**:
1. Deploy backend with new API endpoints (backward compatible)
2. Run migration script via admin UI
3. Deploy frontend with new hierarchical views
4. Monitor for errors and rollback if needed

**Monitoring and Logging**:
- Log all migration operations with timestamps and affected record counts
- Monitor React Query cache performance for new parent-child queries
- Track API response times for populated parent entity queries

**Configuration Management**:
- Domain configuration stored in database (no environment variables)
- Admin page provides UI for all configuration changes

### 3.7 Risk Assessment and Mitigation

**Technical Risks**:
- **Risk**: Migration script deletes all user data from legacy domains
  - **Mitigation**: Require explicit admin confirmation, create backup before deletion, provide rollback script

- **Risk**: MongoDB populate queries slow down parent entity views
  - **Mitigation**: Implement pagination, add indexes, cache child record counts

- **Risk**: Epic 5 transaction workflow breaks after migration
  - **Mitigation**: Comprehensive integration tests, gradual rollout with feature flag

**Integration Risks**:
- **Risk**: React Query cache invalidation misses edge cases (stale data)
  - **Mitigation**: Implement cache invalidation checklist for all mutations, use optimistic updates

- **Risk**: Two-step modal workflow confuses users (increased friction)
  - **Mitigation**: Add onboarding tutorial, provide inline help text, allow "quick create" parent

**Deployment Risks**:
- **Risk**: Users lose access to their data mid-migration
  - **Mitigation**: Run migration during low-traffic window, show maintenance banner, complete in <5 minutes

- **Risk**: Rollback requires restoring deleted data
  - **Mitigation**: Keep database backups for 30 days, provide admin restore UI

**Mitigation Strategies**:
1. Comprehensive testing with realistic data volumes (100+ parent entities, 1000+ child records)
2. Feature flag for new hierarchical UI (allow gradual rollout)
3. Admin-only migration script (not automatic on deploy)
4. Database backup before migration with verified restore process
5. User communication: email notification 48 hours before migration, in-app banner, onboarding tutorial post-migration emphasizing continuity planning purpose

---

## 4. Epic and Story Structure

### 4.1 Epic Approach

**Epic Structure Decision**: Single comprehensive epic for hierarchical domain model refactor.

**Rationale**: This is a tightly coupled architectural change where all components must work together. Breaking into multiple epics would create incomplete intermediate states and increase integration risk. All stories must be completed sequentially to deliver functional system.

**Epic Dependencies**:
- ✅ Epic 5 (Transaction Ledger) must be complete and stable
- ✅ All users notified of upcoming migration and data deletion
- ✅ Database backup strategy verified and tested

---

## 5. Epic 1: Hierarchical Domain Model Refactor

**Epic Goal**: Transform LegacyLock from flat domain model to hierarchical parent-child model optimized for household continuity planning, enabling users to organize critical information by parent entity (Vehicle, Property, Employment, Services) with flexible admin-configurable record type taxonomy.

**Integration Requirements**:
- Maintain Epic 5 transaction-to-entry workflow with two-step parent selection
- Preserve Google OAuth authentication and user permission system
- Keep premium Swiss spa aesthetic and interaction patterns
- Ensure <100ms query performance for parent entity views with populated children
- Prioritize continuity planning fields (contact info, renewal dates) over financial tracking

---

### Story 1.1: Database Schema Design & Migration Scripts

**As a** system administrator,
**I want** new database schemas for parent entities and child records with migration scripts,
**so that** the system can support hierarchical domain organization for continuity planning.

#### Acceptance Criteria

1. `ParentEntity` Mongoose model created with support for Vehicle, Property, Employment, Services domain types
2. `ChildRecord` Mongoose model created with parentId reference and recordType enum (Contact, ServiceHistory, Finance, Insurance, Government, Pension)
3. ChildRecord schema prioritizes continuity fields: contactName, phone, email, accountNumber, policyNumber, renewalDate
4. `DomainConfig` Mongoose model created for admin taxonomy configuration (4 domains)
5. Database indexes created for: userId, domainType, parentId, recordType, renewalDate
6. Migration script created to delete legacy domain collections (Insurance, Finance, Services, Government, Legal)
7. Migration script includes dry-run mode showing preview of changes
8. Migration script creates database backup before deletion
9. Rollback script created to restore from backup

#### Integration Verification

**IV1: Existing Vehicle/Property/Employment records**: Verify existing records can be read (not deleted by migration)

**IV2: MongoDB connection stability**: Ensure migration script handles connection errors gracefully

**IV3: Backup verification**: Test restore from backup to confirm data integrity

---

### Story 1.2: Parent Entity API Endpoints

**As a** developer,
**I want** RESTful API endpoints for parent entity CRUD operations,
**so that** the frontend can manage vehicles, properties, employments, and services.

#### Acceptance Criteria

1. `GET /api/v2/:domain` endpoint returns paginated list of parent entities (50 per page) for all 4 domains
2. `POST /api/v2/:domain` endpoint creates new parent entity with validation
3. `GET /api/v2/:domain/:id` endpoint returns parent entity with populated child records
4. `PUT /api/v2/:domain/:id` endpoint updates parent entity fields
5. `DELETE /api/v2/:domain/:id` endpoint deletes parent with cascade to children (after confirmation)
6. All endpoints enforce user ownership (userId filter)
7. All endpoints return appropriate HTTP status codes (200, 201, 400, 403, 404)
8. API documentation updated with v2 endpoint specifications including Services domain

#### Integration Verification

**IV1: Authentication middleware**: Verify Passport.js authentication works with new v2 routes

**IV2: User authorization**: Test that users cannot access other users' parent entities

**IV3: Error handling**: Ensure validation errors return clear messages to frontend

---

### Story 1.3: Child Record API Endpoints

**As a** developer,
**I want** RESTful API endpoints for child record CRUD operations,
**so that** the frontend can manage contact info, service history, finance, insurance records under parent entities.

#### Acceptance Criteria

1. `GET /api/v2/:domain/:parentId/records` endpoint returns all child records for parent
2. `POST /api/v2/:domain/:parentId/records` endpoint creates new child record
3. `GET /api/v2/:domain/:parentId/records/:recordId` endpoint returns single child record
4. `PUT /api/v2/:domain/:parentId/records/:recordId` endpoint updates child record
5. `DELETE /api/v2/:domain/:parentId/records/:recordId` endpoint deletes child record
6. Endpoints validate that parentId exists before creating child
7. Endpoints enforce user ownership of both parent and child
8. Child records grouped by recordType in GET response, sorted by renewalDate/createdAt

#### Integration Verification

**IV1: Parent entity existence**: Verify 404 error when attempting to create child for non-existent parent

**IV2: Referential integrity**: Test that deleting parent cascades to children

**IV3: MongoDB populate performance**: Measure query time for parent with 50+ children (<100ms)

---

### Story 1.4: Admin Domain Configuration API & UI

**As a** system administrator,
**I want** an admin interface to configure record type taxonomy per domain,
**so that** I can control which child record types are available for each parent domain (including new Services domain).

#### Acceptance Criteria

1. `GET /api/admin/domain-config` endpoint returns configuration for all 4 domains (admin only)
2. `PUT /api/admin/domain-config/:domain` endpoint updates allowed record types
3. `POST /api/admin/domain-config/record-types` endpoint creates custom record type
4. Admin configuration page accessible at `/admin/domains` (admin role required)
5. UI displays current record type assignments per domain (Vehicle, Property, Employment, Services)
6. UI allows drag-and-drop or checkbox selection to assign record types to domains
7. UI allows creation of custom record types (name, icon, color, required fields)
8. Changes take effect immediately with React Query cache invalidation

#### Integration Verification

**IV1: Role-based access**: Verify non-admin users get 403 Forbidden on admin endpoints

**IV2: Cache invalidation**: Test that config changes immediately update frontend forms

**IV3: Validation**: Ensure duplicate record type names are rejected

---

### Story 1.5: Parent Entity Frontend Components

**As a** user,
**I want** to view and manage my vehicles, properties, employments, and service providers,
**so that** I can organize my household information for continuity planning.

#### Acceptance Criteria

1. `ParentEntityList` component displays paginated grid/list of parent entities for all 4 domains
2. Each parent entity card shows: name, domain icon, child record count, last updated
3. Clicking parent entity navigates to detail view (`/vehicles/:id`, `/properties/:id`, `/services/:id`, etc.)
4. "Create New" button opens `ParentEntityForm` modal
5. `ParentEntityForm` includes domain-specific fields (Services form includes: Business Name, Service Type, Contact, Phone, Email)
6. Form validation prevents duplicate names and requires all mandatory fields
7. Delete button shows confirmation modal listing child record count
8. All components follow Swiss spa aesthetic (Lucide icons, Inter font, dark gradients)

#### Integration Verification

**IV1: Navigation links**: Verify main navigation correctly links to new parent entity list pages including Services

**IV2: React Query integration**: Test optimistic updates for create/update/delete operations

**IV3: Responsive design**: Ensure components work on mobile/tablet/desktop

---

### Story 1.6: Child Record Frontend Components (Continuity-Focused)

**As a** user,
**I want** to view and manage child records under each parent entity with emphasis on contact info and renewal dates,
**so that** I can ensure my household information is accessible for continuity planning.

#### Acceptance Criteria

1. `ParentEntityDetail` component displays parent entity header with child records below
2. Child records grouped by record type (Contact, Service History, Finance, Insurance, Government, Pension) with collapsible sections
3. Each child record card shows: name, contact info (phone/email), renewal date, provider
4. Contact info and renewal dates displayed prominently (larger font, highlighted)
5. "Add Record" button opens `ChildRecordForm` modal with record type selector
6. `ChildRecordForm` prioritizes continuity fields: Contact Name, Phone, Email, Account Number, Policy Number, Renewal Date
7. Financial fields (amount, frequency) are optional and de-emphasized
8. Edit/delete buttons on each child record card
9. Child record count badge on each record type section header
10. Empty state message when no child records exist for a record type

#### Integration Verification

**IV1: Parent context**: Verify child record forms correctly associate with parent entity

**IV2: Record type filtering**: Test that only configured record types appear in dropdown

**IV3: Attachment upload**: Ensure existing attachment upload system works for child records

---

### Story 1.7: Services Directory & Transaction-to-Entry Workflow

**As a** user,
**I want** to manage a directory of service providers and create child records from bank transactions,
**so that** I can organize tradespeople information and link transactions to household entities.

#### Acceptance Criteria

1. `ServicesDirectory` component displays grid/list of service providers with search/filter
2. Service provider cards show: Business name, Service type, Contact info, Last service date
3. "Add Service Provider" button opens form with fields: Business Name, Service Type dropdown, Contact, Phone, Email, Address, Notes
4. `CreateEntryFromTransactionModal` updated with four-step workflow:
   - Step 1: Select parent domain (Vehicle, Property, Employment, Services)
   - Step 2: Select existing parent entity OR create new inline
   - Step 3: Select child record type (Contact, Finance, Insurance, etc.)
   - Step 4: Fill child record details with continuity fields prioritized
5. If no parent entities exist, show "Create your first [Vehicle/Property/Employment/Service Provider]" message
6. Inline parent creation form includes minimal required fields (name only, details added later)
7. Form pre-populates child record fields from transaction data (amount, date, provider)
8. Transaction status updates to "record_created" after successful submission
9. Modal shows success message with link to view created child record
10. Pattern detection and auto-ignore functionality continues to work unchanged

#### Integration Verification

**IV1: Epic 5 compatibility**: Verify transaction list and status badges work with new child records

**IV2: Category suggestion**: Test that category suggestion engine still functions (maps to record types)

**IV3: Transaction status update**: Confirm `/api/transactions/:id/status` endpoint works with new record IDs

---

### Story 1.8: Continuity Planning Features (Renewals & Contact Directory)

**As a** user,
**I want** to see upcoming renewal dates and access a contact directory,
**so that** I can proactively manage renewals and easily find contact information in emergencies.

#### Acceptance Criteria

1. `UpcomingRenewals` dashboard widget displays next 10 upcoming renewal dates across all domains
2. Renewal cards show: Entity name (Vehicle/Property/etc.), Renewal type (Insurance, MOT, etc.), Date, Contact info
3. Renewals grouped by urgency: Critical (<30 days), Important (30-90 days), Upcoming (>90 days)
4. Clicking renewal card navigates to parent entity detail page
5. `/renewals` page shows full list of all renewals with filtering by domain and date range
6. `ContactDirectory` component displays all contact info across all domains with search
7. Contact cards show: Name, Phone, Email, Entity name, Last interaction date
8. "Quick call" and "Quick email" buttons on contact cards (open phone dialer / email client)
9. Export contact directory as CSV/VCF for backup

#### Integration Verification

**IV1: Renewal date calculation**: Verify renewals correctly calculated from child record renewalDate field

**IV2: Cross-domain search**: Test that contact directory searches across all 4 parent domains

**IV3: Performance**: Ensure dashboard widgets load quickly (<500ms) with aggregated data

---

### Story 1.9: Data Migration Execution & User Onboarding

**As a** system administrator,
**I want** to execute the data migration and guide users through the new hierarchical structure,
**so that** users understand the continuity planning purpose and can rebuild their data efficiently.

#### Acceptance Criteria

1. Admin UI at `/admin/migrate` shows migration preview (dry-run results)
2. Preview displays: collections to delete, record counts, estimated backup size
3. "Execute Migration" button requires explicit admin confirmation (type "DELETE ALL DATA")
4. Migration script runs with progress indicator (percentage complete)
5. Post-migration, users see onboarding tutorial on first login explaining:
   - LegacyLock's continuity planning purpose (not just financial tracking)
   - New hierarchical structure (parent entities → child records)
   - How to create parent entities (including Services domain)
   - How to add child records with emphasis on contact info and renewal dates
   - How to use transaction-to-entry workflow
6. Tutorial includes video/GIF demonstrations and "Skip" option
7. Migration completion email sent to all users with summary of changes and continuity planning guidance
8. Rollback button available in admin UI (restores from backup)

#### Integration Verification

**IV1: Database backup**: Verify backup created before migration and restore process works

**IV2: Epic 5 functionality**: Test transaction import, pattern detection, and entry creation post-migration

**IV3: User permissions**: Ensure all existing users can access new hierarchical structure

---

### Story 1.10: Legacy Endpoint Deprecation & Cleanup

**As a** developer,
**I want** to remove legacy flat domain code and endpoints,
**so that** the codebase is clean and maintainable.

#### Acceptance Criteria

1. Legacy API endpoints return 410 Gone status with migration message
2. Legacy Mongoose models (Insurance, Finance, Services, Government, Legal) removed from codebase
3. Legacy frontend components removed (old domain forms, pages)
4. Legacy route references updated in navigation and internal links
5. Database collections dropped: `insurances`, `finances`, `services`, `governments`, `legals`
6. API documentation updated to remove legacy endpoints and add Services domain
7. Code comments added explaining historical context (Epic 6 migration)
8. Git commit tagged as "Epic 6 Complete - Hierarchical Domain Model"

#### Integration Verification

**IV1: No broken links**: Audit all frontend routes to ensure no 404s

**IV2: API contract compliance**: Verify no frontend code calling legacy endpoints

**IV3: Database cleanup**: Confirm legacy collections no longer exist in MongoDB

---

### Story 1.11: Performance Optimization & Monitoring

**As a** developer,
**I want** to optimize parent-child queries and monitor system performance,
**so that** the hierarchical structure performs well at scale.

#### Acceptance Criteria

1. MongoDB indexes verified for optimal query performance (userId, parentId, recordType, renewalDate)
2. Child record counts cached using MongoDB aggregation pipelines
3. Parent entity list views use pagination with "Load More" button
4. React Query cache configured with appropriate stale times (5 minutes for parent entities)
5. Performance monitoring dashboard shows:
   - Average parent entity query time
   - Child record count per parent (p50, p95, p99)
   - React Query cache hit rate
   - Renewal query performance
6. Load testing performed with 100 parent entities + 1000 child records per user
7. API response times meet target: <100ms for parent list, <150ms for populated parent detail
8. Frontend bundle size analysis ensures no significant increase (<5%)

#### Integration Verification

**IV1: Epic 5 performance**: Verify transaction processing maintains <2s end-to-end

**IV2: Dashboard widgets**: Test that dashboard loads quickly with aggregated child record data and renewals

**IV3: Mobile performance**: Ensure mobile devices (3G connection) load parent entities in <3s

---

## 6. Success Metrics

**User Adoption (Continuity Planning Focus)**:
- 90% of users create at least one parent entity within 7 days post-migration
- 80% of users complete onboarding tutorial
- 70% of child records include contact information (phone or email)
- 60% of insurance/government child records include renewal dates

**System Performance**:
- Parent entity list queries: <100ms (p95)
- Parent entity detail queries: <150ms (p95)
- Transaction-to-entry workflow: <3s end-to-end (p95)
- Renewal dashboard widget: <500ms (p95)

**Data Quality (Continuity Planning)**:
- <5% of child records orphaned (missing parent reference)
- <1% of parent entities with zero child records after 30 days
- >50% of child records have at least one contact field populated
- >30% of Service domain entities created within 30 days (validates new domain value)

**Developer Efficiency**:
- 50% reduction in domain model code complexity (fewer domain-specific files)
- Zero legacy endpoint calls detected in production logs after 7 days

---

## 7. Out of Scope

**Explicitly NOT included in Epic 6**:
- ❌ Multi-user sharing of parent entities (remains single-user or couple-shared as before)
- ❌ Advanced reporting/analytics on child records (future epic)
- ❌ Bulk import of parent entities from CSV (manual creation only)
- ❌ Mobile native app (remains web-only)
- ❌ Real-time collaboration on parent entity editing (no WebSockets)
- ❌ AI-powered categorization of child records (future enhancement)
- ❌ Integration with external APIs (bank APIs, insurance APIs) for auto-population
- ❌ Automated renewal reminders via email/SMS (manual dashboard checking only)
- ❌ Document storage system (beyond existing attachment support)

---

## 8. Post-Launch Monitoring Plan

**Week 1 Post-Migration**:
- Daily monitoring of error logs (500 errors, database connection issues)
- User feedback collection via in-app survey focused on continuity planning usability
- Performance metrics review (query times, cache hit rates)
- Track Services domain adoption (how many service providers added)

**Week 2-4 Post-Migration**:
- Analyze user adoption metrics (parent entity creation rate per domain)
- Identify common user questions/confusion points about continuity planning purpose
- Optimize slow queries identified in production
- Review contact info population rate (are users filling out continuity fields?)

**Month 2+**:
- Plan Epic 7 enhancements based on user feedback
- Consider advanced continuity features (automated renewal reminders, document storage, emergency contact export)
- Evaluate if Services domain provides value (usage metrics)

---

**Document Status**: Ready for review and story breakdown execution

**Next Steps**:
1. Review PRD with stakeholders (confirm continuity planning focus and Services domain)
2. Estimate story complexity and prioritize
3. Create sharded story files in docs/prd/epic-6/
4. Archive old documentation to docs/archive/
5. Begin Story 1.1 (Database Schema Design)
6. Schedule migration execution window (low-traffic period)

---

_Generated by John (Product Manager) - Agent OS Brownfield PRD Workflow_
_Epic 6: Hierarchical Domain Model Refactor - Continuity Planning Focus_
_Version 3.0 - January 16, 2025_
