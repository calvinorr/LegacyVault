# Story 1.3: Child Record API Endpoints

**Epic**: 6 - Hierarchical Domain Model Refactor
**Story**: 1.3
**Status**: Ready for Review
**Assigned**: James (Dev Agent)
**Estimated**: 4 hours
**Actual**: 4 hours
**Priority**: P0 - Blocking
**Depends On**: Story 1.1 (Database Schema), Story 1.2 (Parent Entity API)

---

## Story

**As a** developer,
**I want** RESTful API endpoints for child record CRUD operations,
**so that** the frontend can manage contact info, service history, finance, insurance records under parent entities.

---

## Context

This story builds on Story 1.2's parent entity API by creating endpoints for managing child records that attach to parent entities. Child records represent critical continuity planning information such as:

- **Contact Info**: Phone numbers, email addresses, account numbers, policy numbers
- **Service History**: Service dates, provider details, work completed, next service due
- **Finance**: Loans, payments, costs attached to parent entities
- **Insurance**: Policies, renewals, coverage details
- **Government**: MOT, tax, licenses, registrations
- **Pension**: Workplace pensions, contributions, provider info

**6 Record Types**: Contact, ServiceHistory, Finance, Insurance, Government, Pension

All endpoints enforce parent entity existence validation and user ownership to maintain data integrity and security.

---

## Acceptance Criteria

- [x] AC1: `GET /api/v2/:domain/:parentId/records` endpoint returns all child records for parent
- [x] AC2: `POST /api/v2/:domain/:parentId/records` endpoint creates new child record
- [x] AC3: `GET /api/v2/:domain/:parentId/records/:recordId` endpoint returns single child record
- [x] AC4: `PUT /api/v2/:domain/:parentId/records/:recordId` endpoint updates child record
- [x] AC5: `DELETE /api/v2/:domain/:parentId/records/:recordId` endpoint deletes child record
- [x] AC6: Endpoints validate that parentId exists before creating child
- [x] AC7: Endpoints enforce user ownership of both parent and child
- [x] AC8: Child records grouped by recordType in GET response, sorted by renewalDate/createdAt

---

## Integration Verification

- [x] IV1: Parent entity existence - Verify 404 error when attempting to create child for non-existent parent
- [x] IV2: Referential integrity - Test that deleting parent cascades to children
- [x] IV3: MongoDB populate performance - Measure query time for parent with 50+ children (<100ms)

---

## Tasks

### Task 1: Create Child Record Routes
- [x] Create `src/routes/childRecord.js`
- [x] Define router with domain and parent validation middleware
- [x] Add authentication middleware to all routes
- [x] Export router

### Task 2: Implement Parent Validation Middleware
- [x] Create `validateParent` middleware function
- [x] Validate ObjectId format for parentId parameter
- [x] Query parent entity with userId and domainType authorization
- [x] Return 404 if parent not found or not authorized
- [x] Attach parent entity to request for use in handlers

### Task 3: Implement List Endpoint (GET /api/v2/:domain/:parentId/records)
- [x] Create route handler for listing child records
- [x] Query ChildRecord model filtered by parentId and userId
- [x] Add sorting support (default: createdAt desc)
- [x] Add optional recordType filter query parameter
- [x] Group results by recordType
- [x] Return: `{ parentId, parentName, records: { Contact: [], Finance: [], ... }, total }`

### Task 4: Implement Create Endpoint (POST /api/v2/:domain/:parentId/records)
- [x] Create route handler for creating child records
- [x] Validate required fields: recordType, name
- [x] Validate recordType against enum values
- [x] Create new ChildRecord with userId, parentId from validated parent
- [x] Return 201 with created record

### Task 5: Implement Get by ID Endpoint (GET /api/v2/:domain/:parentId/records/:recordId)
- [x] Create route handler for getting single child record
- [x] Validate recordId ObjectId format
- [x] Query ChildRecord with parentId and userId authorization
- [x] Return 404 if not found or not authorized

### Task 6: Implement Update Endpoint (PUT /api/v2/:domain/:parentId/records/:recordId)
- [x] Create route handler for updating child records
- [x] Validate recordId ObjectId format
- [x] Prevent changes to userId, parentId, recordType fields
- [x] Validate name field if provided (cannot be empty)
- [x] Update allowed fields only
- [x] Return updated record

### Task 7: Implement Delete Endpoint (DELETE /api/v2/:domain/:parentId/records/:recordId)
- [x] Create route handler for deleting child records
- [x] Validate recordId ObjectId format
- [x] Query and authorize (parentId and userId must match)
- [x] Delete child record
- [x] Return 204 No Content on success

### Task 8: Write Comprehensive Tests
- [x] Test parent validation middleware (4 tests)
- [x] Test LIST endpoint - grouping, filtering, sorting (5 tests)
- [x] Test CREATE endpoint - all record types, validation (7 tests)
- [x] Test GET BY ID - authorization, parent matching (5 tests)
- [x] Test UPDATE - field updates, immutable fields (6 tests)
- [x] Test DELETE - authorization, referential integrity (5 tests)
- [x] Test multi-domain support (1 test)
- [x] Test record type grouping (1 test)
- [x] Test user isolation and authorization

### Task 9: Register Routes in Server
- [x] Import childRecord routes in `src/server.js`
- [x] Mount routes: `app.use('/api/v2', childRecordRouter)`
- [x] Verify routes work with existing parent entity endpoints

---

## Dev Notes

**API Endpoint Pattern**:
```
GET    /api/v2/:domain/:parentId/records           # List all child records (grouped by type)
POST   /api/v2/:domain/:parentId/records           # Create new child record
GET    /api/v2/:domain/:parentId/records/:recordId # Get single child record
PUT    /api/v2/:domain/:parentId/records/:recordId # Update child record
DELETE /api/v2/:domain/:parentId/records/:recordId # Delete child record
```

**Example Request/Response**:

**GET /api/v2/vehicles/:parentId/records**
```json
{
  "parentId": "60a1b2c3d4e5f6g7h8i9j0k1",
  "parentName": "2019 Honda Civic",
  "records": {
    "Contact": [],
    "ServiceHistory": [],
    "Finance": [
      {
        "_id": "...",
        "recordType": "Finance",
        "name": "Car Loan",
        "contactName": "Finance Company",
        "phone": "0800-123-4567",
        "accountNumber": "ACC-12345",
        "amount": 15000,
        "frequency": "monthly"
      }
    ],
    "Insurance": [
      {
        "_id": "...",
        "recordType": "Insurance",
        "name": "Car Insurance",
        "provider": "Direct Line",
        "policyNumber": "POL-123456",
        "renewalDate": "2025-06-15"
      }
    ],
    "Government": [],
    "Pension": []
  },
  "total": 2
}
```

**POST /api/v2/vehicles/:parentId/records**
```json
{
  "recordType": "Insurance",
  "name": "Car Insurance",
  "provider": "Direct Line",
  "policyNumber": "POL-123456",
  "renewalDate": "2025-06-15",
  "amount": 850,
  "frequency": "annual"
}
```

**Record Type Grouping Logic**:
- All child records are returned grouped by their `recordType` field
- Empty arrays returned for record types with no records
- Maintains consistent structure for frontend consumption
- Sorted by `createdAt` descending by default within each group

**Parent Validation Flow**:
```javascript
1. Validate domain parameter (vehicles, properties, employments, services, finance)
2. Validate parentId ObjectId format
3. Query ParentEntity where:
   - _id = parentId
   - userId = authenticated user
   - domainType = mapped from domain parameter
4. If not found, return 404
5. Attach parent to request for use in route handlers
```

---

## Testing

### Unit Tests
- Route handler functions (list, create, get, update, delete)
- Parent validation middleware
- Record type grouping logic
- Authorization checks

### Integration Tests
- Full request/response cycle for each endpoint
- Parent existence validation
- User ownership enforcement
- Multi-domain support
- RecordType filtering and grouping

### API Tests (Supertest)
- All HTTP methods and status codes
- All 6 record types
- All 5 domains (vehicles, properties, employments, services, finance)
- Authorization (users can only access their own records)
- Parent-child relationship integrity

---

## Dev Agent Record

### Agent Model Used
- Model: claude-sonnet-4-5-20250929

### Debug Log References
- None

### Completion Notes
Successfully implemented Story 1.3 with all acceptance criteria met:

**API Endpoints Created:**
- ✅ LIST (GET /api/v2/:domain/:parentId/records) - Grouped by recordType, filtered, sorted
- ✅ CREATE (POST /api/v2/:domain/:parentId/records) - Validation, parent existence check
- ✅ GET BY ID (GET /api/v2/:domain/:parentId/records/:recordId) - Authorization, parent matching
- ✅ UPDATE (PUT /api/v2/:domain/:parentId/records/:recordId) - Immutable field protection
- ✅ DELETE (DELETE /api/v2/:domain/:parentId/records/:recordId) - Authorization enforcement

**Key Features:**
- Parent validation middleware ensures parent entity exists and user has access
- RecordType grouping provides structured response for frontend consumption
- Support for 6 record types: Contact, ServiceHistory, Finance, Insurance, Government, Pension
- Multi-domain support across all 5 parent domains
- User ownership enforced at both parent and child levels
- Immutable field protection (userId, parentId, recordType cannot be changed)
- Comprehensive error handling with appropriate HTTP status codes

**Tests:**
- ✅ 36 comprehensive tests covering all endpoints and edge cases
- ✅ Parent validation (4 tests)
- ✅ LIST endpoint (5 tests) - grouping, filtering, sorting, user isolation
- ✅ CREATE endpoint (7 tests) - all record types, validation, trimming
- ✅ GET BY ID (5 tests) - authorization, parent matching, not found
- ✅ UPDATE (6 tests) - field updates, immutable protection, authorization
- ✅ DELETE (5 tests) - authorization, referential integrity, not found
- ✅ Multi-domain support (1 test)
- ✅ Record type grouping (1 test)
- ✅ All tests passing

**Implementation Notes:**
- Parent validation runs before all child record operations
- RecordType enum validated on create to ensure data integrity
- Child records automatically inherit userId from authenticated user
- Grouped response structure optimized for UI consumption
- Empty arrays returned for record types with no records (consistent structure)

### File List
**Routes:**
- src/routes/childRecord.js (336 lines)

**Modified Files:**
- src/server.js (Added childRecord route registration)

**Tests:**
- tests/api/childRecord.test.js (608 lines, 36 tests)

### Change Log
| Date | Change | Author |
|------|--------|--------|
| 2025-01-17 | Story created for Child Record API | James (Dev) |
| 2025-01-17 | Story completed - All endpoints, tests, and integration | James (Dev) |

---

**Implementation Complete**: All 8 acceptance criteria met, 36 tests passing
