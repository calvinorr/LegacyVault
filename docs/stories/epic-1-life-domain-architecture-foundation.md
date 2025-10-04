# Epic 1: Life Domain Architecture Foundation

**Epic ID:** 1
**Epic Name:** Life Domain Architecture Foundation
**Status:** In Progress
**Created:** 2025-10-04
**Last Updated:** 2025-10-04

---

## Epic Goal

Establish the backend infrastructure and data architecture for the 8 life domains (Property, Vehicles, Employment, Government, Finance, Insurance & Protection, Legal & Estate, Household Services), enabling domain-specific record management while preserving all existing functionality and data integrity.

---

## Epic Description

### Existing System Context

**Current Functionality:**
- Abstract "bills/categories" structure for all household records
- Google OAuth authentication with admin approval workflow
- Multi-user access and sharing capabilities
- PDF/document upload and linking to records
- Bank statement import (HSBC multi-line transaction support)
- UK financial renewal tracking (40+ product types)
- MongoDB backend with Mongoose ODM
- React/TypeScript frontend

**Technology Stack:**
- Backend: Node.js v18+ / Express v4.x / MongoDB v6.x
- ODM: Mongoose v7.x
- Auth: Passport.js + Google OAuth 2.0
- Database: MongoDB Atlas (production), Docker (local dev)
- Frontend: React 18+ / TypeScript / Vite
- Testing: Jest + Supertest + MongoDB Memory Server

**Integration Points:**
- User authentication system (preserve existing auth flow)
- Document storage system (GridFS integration needed)
- Existing bills/categories collections (maintain during transition)
- Frontend API consumption (new endpoints alongside existing)

### Enhancement Details

**What's Being Added:**

This epic transforms the abstract "bills and categories" structure into a **domain-based architecture** with 8 specialized life domains. Each domain has:

1. **Domain-Specific Mongoose Schemas** - Tailored data models with relevant fields
2. **Domain CRUD APIs** - RESTful endpoints for record management
3. **Document Storage Integration** - GridFS for attaching files to domain records
4. **Data Migration Path** - Safe transition from old structure to new domains
5. **User Isolation** - Multi-user support with proper record filtering

**How It Integrates:**

- New domain collections created **alongside** existing bills/categories (no destructive changes)
- New `/api/domains/*` endpoints registered in Express app
- GridFS integration uses existing MongoDB connection
- Existing auth middleware (`requireAuth`) used for all new endpoints
- Frontend can gradually adopt new endpoints while old ones remain functional

**Success Criteria:**

- ✅ All 8 domain Mongoose schemas created with common + domain-specific fields
- ✅ CRUD API endpoints functional for all domains with proper authentication
- ✅ Document upload/download via GridFS integrated with domain records
- ✅ Data migration utilities ready for transitioning existing bills to domains
- ✅ 100% test coverage for new domain infrastructure
- ✅ Existing Google OAuth and user management unchanged
- ✅ Zero data loss during transition
- ✅ Performance: API response times < 200ms for record queries

---

## Stories

### ✅ Story 1.1: Foundation - Domain Data Models and API Infrastructure
**Status:** Complete
**Effort:** 4-8 hours (1-2 sessions)

**What Was Delivered:**
- 8 Mongoose domain schemas (Property, Vehicle, Finance, Employment, Government, Insurance, Legal, Services)
- Common fields across all domains (user, priority, renewalDate, documentIds)
- Domain-specific fields per requirements
- Domain validation middleware (rejects invalid domains)
- Full CRUD API endpoints (`/api/domains/:domain/records`)
- User isolation and multi-user support
- 25 comprehensive tests (100% passing)

**Files Created:**
- `src/models/domain/*.js` (8 domain schemas)
- `src/routes/domains.js` (domain router)
- `tests/api/domains.test.js` (API tests)

---

### Story 1.2: GridFS Document Storage Integration
**Status:** Not Started
**Priority:** High
**Estimated Effort:** 6-10 hours (1-2 sessions)
**Dependencies:** Story 1.1 (Complete ✓)

**Goal:**
Enable file upload/download functionality using MongoDB GridFS, allowing users to attach documents (PDFs, images, etc.) to any domain record.

**Key Deliverables:**
- GridFS storage setup with MongoDB connection
- Document upload API endpoint (`POST /api/domains/:domain/records/:id/documents`)
- Document download API endpoint (`GET /api/documents/:fileId`)
- Document listing for record (`GET /api/domains/:domain/records/:id/documents`)
- Document deletion API endpoint (`DELETE /api/documents/:fileId`)
- File metadata storage (filename, mimetype, uploadDate, uploader)
- Integration with `documentIds` array in domain records
- File size limits and type validation
- Comprehensive tests for upload/download/delete

**Acceptance Criteria:**
- Users can upload multiple documents to a domain record
- Uploaded files stored in GridFS with proper metadata
- Documents can be downloaded via secure endpoint
- Document list shows all files attached to a record
- Only record owner can upload/delete documents
- File validation prevents malicious uploads
- Existing document upload functionality preserved

---

### Story 1.3: Domain Record Management & Validation
**Status:** Not Started
**Priority:** Medium
**Estimated Effort:** 4-6 hours
**Dependencies:** Story 1.1 (Complete ✓), Story 1.2 (Pending)

**Goal:**
Enhance domain record management with advanced validation, search capabilities, and business logic specific to each domain type.

**Key Deliverables:**
- Domain-specific validation rules (e.g., UK sort code format, MOT date logic)
- Search/filter endpoints for domain records
- Sorting by multiple fields (createdAt, renewalDate, priority)
- Record duplication detection (prevent duplicate accounts/policies)
- Bulk operations (export domain records to JSON/CSV)
- Record history/audit trail (who created/modified)
- Advanced query support (date ranges, text search)

**Acceptance Criteria:**
- UK-specific validation works (sort codes, NI numbers, registration plates)
- Users can search records within a domain
- Duplicate detection prevents accidental re-entry
- Audit trail shows record modification history
- Export functionality generates valid CSV/JSON

---

### Story 1.4: Data Migration Utilities & Preservation
**Status:** Not Started
**Priority:** High
**Estimated Effort:** 8-12 hours (2 sessions)
**Dependencies:** Story 1.1 (Complete ✓), Story 1.2 (Pending), Story 1.3 (Pending)

**Goal:**
Provide safe, reversible data migration from existing bills/categories structure to new life domain architecture, ensuring zero data loss and complete rollback capability.

**Key Deliverables:**
- Migration script: bills/categories → domain records
- Intelligent domain detection (map bill types to domains)
- Category → recordType mapping logic
- Document migration (preserve GridFS links)
- Dry-run mode for migration preview
- Rollback script (domain records → bills/categories)
- Migration validation reports (record counts, field mapping)
- Backup utilities before migration
- Migration testing with production data snapshots

**Acceptance Criteria:**
- Migration script correctly maps 100% of bills to appropriate domains
- All document attachments preserved during migration
- Dry-run shows accurate preview without modifying data
- Rollback script verified to restore original state
- Migration report shows all mapped/unmapped records
- Zero data loss confirmed via checksums
- Existing bills/categories remain untouched until user confirms migration

---

## Compatibility Requirements

### Existing APIs Remain Unchanged
- ✅ `/auth/*` routes (Google OAuth flow)
- ✅ `/api/users/*` routes (user management)
- ✅ `/api/entries/*` routes (legacy bills/categories)
- ✅ `/api/categories/*` routes (category management)
- ✅ `/api/import/*` routes (bank statement import)

### Database Schema Changes
- ✅ New domain collections created alongside existing collections
- ✅ Existing collections (`bills`, `categories`, `users`) untouched
- ✅ GridFS bucket created for document storage
- ✅ Backward compatible: old and new systems coexist

### UI Compatibility
- ✅ Existing UI continues to function with legacy APIs
- ✅ New domain APIs available for gradual frontend adoption
- ✅ Authentication flow unchanged

### Performance Impact
- ✅ New endpoints use proper indexing (minimal performance impact)
- ✅ GridFS streaming prevents memory issues with large files
- ✅ User filtering indexed for fast queries

---

## Risk Mitigation

### Primary Risks

**Risk 1: Data Loss During Migration**
- **Severity:** Critical
- **Mitigation:**
  - Dry-run mode required before actual migration
  - Automatic backup before migration starts
  - Rollback script tested and verified
  - Migration validation reports with checksums
  - User confirmation required at each step

**Risk 2: Breaking Existing Functionality**
- **Severity:** High
- **Mitigation:**
  - New collections created alongside old ones (no deletions)
  - Existing API routes untouched
  - Comprehensive regression testing
  - Feature flags for gradual rollout

**Risk 3: GridFS Performance Issues**
- **Severity:** Medium
- **Mitigation:**
  - File size limits enforced (e.g., 10MB per file)
  - Streaming upload/download (no memory buffering)
  - MongoDB Atlas auto-scaling for storage
  - Monitoring for slow queries

**Risk 4: User Confusion During Transition**
- **Severity:** Medium
- **Mitigation:**
  - Dual system support (old + new run side-by-side)
  - Clear migration instructions/docs
  - Rollback capability if users prefer old system
  - Admin dashboard showing migration status

### Rollback Plan

**If Epic 1 needs to be rolled back:**

1. **Stop using new endpoints** - Frontend reverts to legacy `/api/entries/*`
2. **Run rollback script** - Migrate domain records back to bills/categories
3. **Verify data integrity** - Checksum validation confirms all data restored
4. **Remove new collections** - Drop domain collections if needed
5. **Document rollback reason** - Log why rollback occurred for future planning

**Rollback Time:** < 30 minutes
**Data Loss Risk:** Zero (all data preserved in both systems during transition)

---

## Definition of Done

### Epic-Level Completion Criteria

- [x] **Story 1.1 Complete:** Domain models and API infrastructure working
- [ ] **Story 1.2 Complete:** GridFS document storage integrated and tested
- [ ] **Story 1.3 Complete:** Advanced record management and validation working
- [ ] **Story 1.4 Complete:** Migration utilities tested with production data
- [ ] **All Tests Passing:** 100% test pass rate across all stories
- [ ] **Existing Functionality Verified:** No regression in auth, documents, renewals
- [ ] **Integration Points Working:** All domain APIs functional with proper auth
- [ ] **Documentation Updated:** API docs, migration guides, rollback procedures
- [ ] **Performance Validated:** API response times < 200ms, no memory leaks
- [ ] **Security Reviewed:** No new vulnerabilities, proper user isolation
- [ ] **Migration Ready:** Dry-run validated with production data snapshot

### Epic Success Metrics

- **100% data preservation** during migration (zero records lost)
- **< 200ms API response time** for domain record queries
- **100% test coverage** for new domain infrastructure
- **Zero regression** in existing functionality
- **< 30 minute rollback time** if needed

---

## Technical Notes

### Technology Choices

**Why MongoDB GridFS for Documents?**
- Already using MongoDB (no new infrastructure)
- Handles files > 16MB (BSON document limit)
- Built-in chunking and streaming
- Metadata storage alongside file data
- Consistent with existing MongoDB patterns

**Why Domain-Specific Schemas?**
- Type safety for domain-specific fields
- Validation at database level
- Better query performance (indexes on relevant fields)
- Clear separation of concerns
- Easier to extend individual domains

**Why Gradual Migration (Not Big Bang)?**
- Reduces risk of catastrophic failure
- Allows user testing at each stage
- Rollback possible at any point
- Existing system remains functional during transition

### Architecture Decisions

1. **New collections alongside old ones** - Prevents destructive changes
2. **Common fields in all domains** - Enables cross-domain features (renewals)
3. **User-scoped records** - Multi-user support from day one
4. **GridFS for documents** - Scalable file storage without vendor lock-in

---

## Dependencies

### External Dependencies
- MongoDB Atlas (production database)
- Google OAuth (existing auth provider)
- GridFS (MongoDB built-in)

### Internal Dependencies
- Existing User model (for authentication)
- Existing auth middleware (`requireAuth`)
- MongoDB connection utilities

### Story Dependencies
- Story 1.2 depends on Story 1.1 (needs `documentIds` field)
- Story 1.3 depends on Story 1.1 (needs domain records)
- Story 1.4 depends on Stories 1.1, 1.2, 1.3 (needs full infrastructure)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-04 | Epic created with 4 stories | John (PM Agent) |
| 2025-10-04 | Story 1.1 completed by James (Dev Agent) | John (PM Agent) |

---

## Next Steps

1. **Create Story 1.2** - GridFS Document Storage Integration
2. **Dev implements Story 1.2** using `@BMad:agents:dev`
3. **Create Story 1.3** after Story 1.2 complete
4. **Create Story 1.4** after Story 1.3 complete
5. **Epic review** when all stories complete

---

**Epic Owner:** John (PM Agent)
**Development Lead:** James (Dev Agent)
**Project:** LegacyLock - Life Domain Architecture Migration
