# Epic 6 Stories Summary

**Note**: This is a summary of all 11 stories. For full PRD details including technical constraints, risk assessment, and success metrics, see `docs/epic-6-prd.md`.

---

## Story 1.1: Database Schema Design & Migration Scripts

**Goal**: Create Mongoose models for parent entities and child records with migration scripts

**Key Deliverables**:
- `ParentEntity` model (Vehicle, Property, Employment, Services)
- `ChildRecord` model (Contact, ServiceHistory, Finance, Insurance, Government, Pension)
- `DomainConfig` model for admin taxonomy
- Migration script with dry-run mode
- Rollback script
- Database indexes: userId, domainType, parentId, recordType, renewalDate

**Acceptance Criteria**: 9 criteria covering model creation, indexing, migration safety

---

## Story 1.2: Parent Entity API Endpoints

**Goal**: RESTful API for parent entity CRUD operations

**Endpoints**:
- `GET /api/v2/:domain` - List entities (paginated)
- `POST /api/v2/:domain` - Create entity
- `GET /api/v2/:domain/:id` - Get entity with populated children
- `PUT /api/v2/:domain/:id` - Update entity
- `DELETE /api/v2/:domain/:id` - Delete entity (cascade)

**Acceptance Criteria**: 8 criteria covering all CRUD operations, authentication, validation

---

## Story 1.3: Child Record API Endpoints

**Goal**: RESTful API for child record CRUD under parent entities

**Endpoints**:
- `GET /api/v2/:domain/:parentId/records` - List child records
- `POST /api/v2/:domain/:parentId/records` - Create child record
- `GET /api/v2/:domain/:parentId/records/:recordId` - Get child record
- `PUT /api/v2/:domain/:parentId/records/:recordId` - Update child record
- `DELETE /api/v2/:domain/:parentId/records/:recordId` - Delete child record

**Acceptance Criteria**: 8 criteria covering CRUD, referential integrity, performance

---

## Story 1.4: Admin Domain Configuration API & UI

**Goal**: Admin interface to configure record type taxonomy per domain

**Features**:
- Admin-only endpoints for domain configuration
- UI at `/admin/domains`
- Assign record types to domains (drag-and-drop or checkboxes)
- Create custom record types (name, icon, color, required fields)
- Immediate cache invalidation

**Acceptance Criteria**: 8 criteria covering API, UI, role-based access, validation

---

## Story 1.5: Parent Entity Frontend Components

**Goal**: UI for viewing and managing vehicles, properties, employments, services

**Components**:
- `ParentEntityList` - Grid/list view with pagination
- `ParentEntityForm` - Create/edit modal
- Delete confirmation

**Features**:
- Domain-specific fields (Services includes: Business Name, Service Type, Contact, Phone, Email)
- Swiss spa aesthetic (Lucide icons, Inter font)
- Optimistic updates

**Acceptance Criteria**: 8 criteria covering list view, forms, validation, styling

---

## Story 1.6: Child Record Frontend Components (Continuity-Focused)

**Goal**: UI for managing child records with emphasis on contact info and renewal dates

**Components**:
- `ParentEntityDetail` - Shows parent with child records below
- `ChildRecordForm` - Prioritizes continuity fields
- Grouped by record type with collapsible sections

**Features**:
- Contact info and renewal dates displayed prominently
- Financial fields de-emphasized (optional)
- Empty states

**Acceptance Criteria**: 10 criteria covering detail view, forms, continuity focus

---

## Story 1.7: Services Directory & Transaction-to-Entry Workflow

**Goal**: Services directory + updated transaction workflow

**Features**:
- `ServicesDirectory` - Grid/list of service providers with search
- Service provider cards (name, type, contact, last service)
- Updated `CreateEntryFromTransactionModal` with 4-step workflow:
  1. Select domain (Vehicle, Property, Employment, **Services**)
  2. Select/create parent entity
  3. Select child record type
  4. Fill child record details (continuity fields prioritized)

**Acceptance Criteria**: 10 criteria covering directory, transaction workflow, Epic 5 integration

---

## Story 1.8: Continuity Planning Features (Renewals & Contact Directory)

**Goal**: Renewals dashboard + contact directory

**Features**:
- `UpcomingRenewals` widget - Next 10 renewals across all domains
- Grouped by urgency: Critical (<30 days), Important (30-90 days), Upcoming (>90 days)
- `/renewals` page with filtering
- `ContactDirectory` - All contacts across domains with search
- Quick call/email buttons
- Export contacts as CSV/VCF

**Acceptance Criteria**: 9 criteria covering renewals, contacts, cross-domain search, performance

---

## Story 1.9: Data Migration Execution & User Onboarding

**Goal**: Execute migration and onboard users

**Features**:
- Admin UI at `/admin/migrate` with dry-run preview
- Explicit confirmation required ("DELETE ALL DATA")
- Progress indicator
- Post-migration tutorial explaining:
  - Continuity planning purpose
  - Hierarchical structure
  - How to create parents and children
  - Services domain
- Email notification to all users
- Rollback button

**Acceptance Criteria**: 8 criteria covering migration safety, onboarding, Epic 5 verification

---

## Story 1.10: Legacy Endpoint Deprecation & Cleanup

**Goal**: Remove legacy code and endpoints

**Tasks**:
- Legacy endpoints return 410 Gone
- Remove legacy models (Insurance, Finance, Services, Government, Legal)
- Remove legacy frontend components
- Drop database collections
- Update documentation
- Git tag: "Epic 6 Complete - Hierarchical Domain Model"

**Acceptance Criteria**: 8 criteria covering deprecation, cleanup, documentation

---

## Story 1.11: Performance Optimization & Monitoring

**Goal**: Optimize queries and monitor performance

**Features**:
- Verify indexes (userId, parentId, recordType, renewalDate)
- Cache child record counts
- Pagination with "Load More"
- React Query cache configuration
- Performance monitoring dashboard
- Load testing (100 parents + 1000 children per user)

**Targets**:
- Parent list: <100ms (p95)
- Parent detail: <150ms (p95)
- Transaction-to-entry: <3s (p95)

**Acceptance Criteria**: 8 criteria covering indexes, caching, monitoring, load testing

---

_For full acceptance criteria, integration verification steps, and technical details, see `docs/epic-6-prd.md`._
