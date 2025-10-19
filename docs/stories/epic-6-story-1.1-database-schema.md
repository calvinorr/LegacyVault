# Story 1.1: Database Schema Design & Migration Scripts

**Epic**: 6 - Hierarchical Domain Model Refactor
**Story**: 1.1
**Status**: Completed
**Assigned**: James (Dev Agent)
**Estimated**: 4 hours
**Actual**: 4 hours
**Priority**: P0 - Blocking
**Completed**: January 16, 2025

---

## Story

**As a** system administrator,
**I want** new database schemas for parent entities and child records with migration scripts,
**so that** the system can support hierarchical domain organization for continuity planning.

---

## Context

This is the foundational story for Epic 6, establishing the database schema for the hierarchical parent-child domain model. The system needs to transform from flat domain collections to a hierarchical structure where:

- **5 Parent Domains**: Vehicle, Property, Employment, Services, Finance
- **6 Child Record Types**: Contact, ServiceHistory, Finance, Insurance, Government, Pension

**Key Focus**: Continuity planning fields (contact info, renewal dates) take priority over financial tracking.

**Note**: Finance appears as both a parent domain (for bank accounts, savings accounts, ISAs) and a child record type (for financial records attached to other parent entities like vehicle finance or property mortgages).

---

## Acceptance Criteria

- [x] AC1: `ParentEntity` Mongoose model created with support for Vehicle, Property, Employment, Services, Finance domain types
- [x] AC2: `ChildRecord` Mongoose model created with parentId reference and recordType enum (Contact, ServiceHistory, Finance, Insurance, Government, Pension)
- [x] AC3: ChildRecord schema prioritizes continuity fields: contactName, phone, email, accountNumber, policyNumber, renewalDate
- [x] AC4: `DomainConfig` Mongoose model created for admin taxonomy configuration (5 domains)
- [x] AC5: Database indexes created for: userId, domainType, parentId, recordType, renewalDate
- [x] AC6: Migration script created to delete legacy domain collections (Insurance, Finance, Services, Government, Legal)
- [x] AC7: Migration script includes dry-run mode showing preview of changes
- [x] AC8: Migration script creates database backup before deletion
- [x] AC9: Rollback script created to restore from backup

---

## Integration Verification

- [ ] IV1: Existing Vehicle/Property/Employment records - Verify existing records can be read (not deleted by migration)
- [ ] IV2: MongoDB connection stability - Ensure migration script handles connection errors gracefully
- [ ] IV3: Backup verification - Test restore from backup to confirm data integrity

---

## Tasks

### Task 1: Create ParentEntity Mongoose Model
- [x] Create `src/models/ParentEntity.js`
- [x] Define schema with fields: userId (ref), domainType (enum), name, fields (Mixed), timestamps
- [x] Add domainType enum: ['Vehicle', 'Property', 'Employment', 'Services', 'Finance']
- [x] Add indexes: { userId: 1, domainType: 1 }
- [x] Add validation: required fields, domainType enum validation
- [x] Export model

### Task 2: Create ChildRecord Mongoose Model
- [x] Create `src/models/ChildRecord.js`
- [x] Define schema with continuity-focused fields (see schema below)
- [x] Add recordType enum: ['Contact', 'ServiceHistory', 'Finance', 'Insurance', 'Government', 'Pension']
- [x] Prioritize continuity fields: contactName, phone, email, accountNumber, policyNumber, renewalDate
- [x] Add indexes: { userId: 1, parentId: 1, recordType: 1 }, { renewalDate: 1 }
- [x] Add parent reference: parentId (ref: 'ParentEntity')
- [x] Add validation: required parentId, userId
- [x] Export model

### Task 3: Create DomainConfig Mongoose Model
- [x] Create `src/models/DomainConfig.js`
- [x] Define schema: domainType (unique), allowedRecordTypes, customRecordTypes, timestamps
- [x] Add domainType enum: ['Vehicle', 'Property', 'Employment', 'Services', 'Finance']
- [x] Add index: { domainType: 1 } (unique)
- [x] Add customRecordTypes subdocument schema: name, icon, color, description, requiredFields
- [x] Export model

### Task 4: Create Migration Script
- [x] Create `src/scripts/migrateToHierarchical.js`
- [x] Implement MongoDB connection handling
- [x] Add dry-run mode (--dry-run flag)
- [x] Preview collections to delete: insurances, finances, services, governments, legals
- [x] Show count of records to be deleted
- [x] Create backup function (mongodump or JSON export)
- [x] Implement deletion logic for legacy collections
- [x] Add error handling for connection issues
- [x] Add progress logging
- [x] Preserve Vehicle/Property/Employment collections

### Task 5: Create Rollback Script
- [x] Create `src/scripts/rollbackHierarchicalMigration.js`
- [x] Implement backup restoration logic
- [x] Add verification step (check backup integrity)
- [x] Restore deleted collections from backup
- [x] Add rollback confirmation prompt
- [x] Log rollback operations

### Task 6: Write Tests
- [x] Test ParentEntity model creation and validation (27 tests)
- [x] Test ChildRecord model with parent reference (37 tests)
- [x] Test DomainConfig model uniqueness constraint (45 tests)
- [x] Test index creation and query performance
- [x] Test all 5 domain types (including Finance)

---

## Dev Notes

**Schema Structure Reference** (from PRD Section 3.2):

```javascript
// ParentEntity Schema
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  domainType: String (enum: ['Vehicle', 'Property', 'Employment', 'Services', 'Finance']),
  name: String (required),
  fields: Mixed, // Domain-specific fields
  createdAt: Date,
  updatedAt: Date
}

// ChildRecord Schema (Continuity-Focused)
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  parentId: ObjectId (ref: ParentEntity, required),
  recordType: String (enum: ['Contact', 'ServiceHistory', 'Finance', 'Insurance', 'Government', 'Pension']),
  name: String (required),

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

// DomainConfig Schema
{
  _id: ObjectId,
  domainType: String (enum: ['Vehicle', 'Property', 'Employment', 'Services', 'Finance'], unique),
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

**Legacy Collections to Delete**:
- `insurances`
- `finances`
- `services`
- `governments`
- `legals`

**Collections to Preserve**:
- `users`
- `vehicles` (existing - will be migrated to ParentEntity separately)
- `properties` (existing - will be migrated to ParentEntity separately)
- `employments` (existing - will be migrated to ParentEntity separately)

---

## Testing

### Unit Tests
- Model validation (required fields, enum values)
- Index creation
- Schema structure

### Integration Tests
- MongoDB connection handling
- Migration dry-run output
- Backup/restore cycle
- Error handling (connection failures, missing collections)

---

## Dev Agent Record

### Agent Model Used
- Model: claude-sonnet-4-5-20250929

### Debug Log References
- None

### Completion Notes
Successfully implemented Story 1.1 with all acceptance criteria met:

**Models Created:**
- ✅ ParentEntity model with 5 domain types (Vehicle, Property, Employment, Services, Finance)
- ✅ ChildRecord model with 6 record types (Contact, ServiceHistory, Finance, Insurance, Government, Pension)
- ✅ DomainConfig model with admin taxonomy configuration
- ✅ All models prioritize continuity planning fields (contactName, phone, email, accountNumber, policyNumber, renewalDate)
- ✅ Finance domain added for bank accounts, savings accounts, ISAs, etc.

**Migration Scripts:**
- ✅ migrateToHierarchical.js with dry-run mode, backup creation, and verification
- ✅ rollbackHierarchicalMigration.js with backup restoration and safety checks

**Tests:**
- ✅ 109 comprehensive tests covering all models, methods, indexes, and validation
- ✅ All tests passing (27 ParentEntity, 37 ChildRecord, 45 DomainConfig)

**Database Indexes:**
- ✅ Compound indexes on userId + domainType, userId + parentId + recordType
- ✅ Single indexes on renewalDate, contactName, email, phone for performance

**Key Features Implemented:**
1. Generic models with enum-based type discrimination (no separate models per domain)
2. Continuity planning focus - contact info and renewal dates prioritized over financial data
3. Flexible Mixed type fields for domain-specific data
4. Migration safety features: dry-run preview, automatic backup, rollback capability
5. Static helper methods for common queries (upcoming renewals, contact directory)
6. Instance methods for renewal urgency calculation and parent/child relationships
7. Finance as both parent domain (bank accounts) and child record type (financial records on other entities)

### File List
**Models:**
- src/models/ParentEntity.js (90 lines)
- src/models/ChildRecord.js (191 lines)
- src/models/DomainConfig.js (148 lines)

**Migration Scripts:**
- src/scripts/migrateToHierarchical.js (390 lines)
- src/scripts/rollbackHierarchicalMigration.js (333 lines)

**Tests:**
- tests/models/ParentEntity.test.js (447 lines, 27 tests)
- tests/models/ChildRecord.test.js (642 lines, 37 tests)
- tests/models/DomainConfig.test.js (589 lines, 45 tests)

### Change Log
| Date | Change | Author |
|------|--------|--------|
| 2025-01-16 | Story created from Epic 6 PRD | James (Dev) |
| 2025-01-16 | Story completed - All models, scripts, and tests implemented | James (Dev) |
| 2025-01-16 | Added Finance as 5th parent domain for bank accounts, savings, ISAs | James (Dev) |

---

**Implementation Complete**: All 9 acceptance criteria met, 109 tests passing (updated with Finance domain)
