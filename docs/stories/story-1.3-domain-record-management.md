# Story 1.3: Domain Record Management & Validation

**Epic:** Life Domain Architecture Foundation (Epic 1)
**Story ID:** 1.3
**Estimated Effort:** 4-6 hours (1 development session)
**Priority:** Medium
**Status:** Not Started
**Dependencies:** Story 1.1 (Complete ✓), Story 1.2 (Complete ✓)

---

## User Story

**As a** user managing household financial records,
**I want** advanced search, validation, and duplicate detection across my domain records,
**so that** I can efficiently find records, prevent data entry errors, and maintain data quality.

---

## Story Context

### Why This Story

Stories 1.1 and 1.2 created the foundation (domain models + document storage). Story 1.3 adds the intelligence layer:
- **UK-specific validation** to catch data entry errors
- **Search and filtering** to find records quickly
- **Duplicate detection** to prevent redundant entries
- **Audit trail** to track who changed what
- **Export capabilities** for backup and reporting

### Existing System Integration

**From Story 1.1:**
- 8 domain schemas with basic CRUD operations
- Domain validation middleware
- User isolation via `requireAuth` middleware

**From Story 1.2:**
- Document storage linked to records
- File metadata tracking

**Technology Stack:**
- Mongoose query builders for search/filter
- Validator.js for UK-specific formats (sort codes, NI numbers, registration plates)
- CSV generation via json2csv library
- Mongoose middleware for audit trails

### What This Story Delivers

**New Capabilities:**
1. **UK-Specific Validation** - Sort codes (XX-XX-XX), NI numbers (XX 12 34 56 X), registration plates (AB12 CDE)
2. **Advanced Search** - Text search across record fields, filter by date ranges, priority, renewal dates
3. **Duplicate Detection** - Prevent duplicate bank accounts, insurance policies, vehicles
4. **Audit Trail** - Track creation/modification history with user attribution
5. **Export Functionality** - Download domain records as CSV or JSON

**Integration Points:**
- Enhance existing domain routes with query parameters
- Add validation to domain record creation/update
- New `/api/domains/:domain/records/search` endpoint
- New `/api/domains/:domain/records/export` endpoint

---

## Acceptance Criteria

### Functional Requirements

**AC1: UK-Specific Validation**
- ✅ Sort code validation: Format `XX-XX-XX` (e.g., `12-34-56`)
- ✅ National Insurance number validation: Format `XX 12 34 56 X` (e.g., `AB 12 34 56 C`)
- ✅ Vehicle registration plate validation: UK format (e.g., `AB12 CDE`, `AB12CDE`)
- ✅ Postcode validation: UK format (e.g., `SW1A 1AA`, `M1 1AE`)
- ✅ MOT date logic: Vehicles must have MOT date in future or within 30 days
- ✅ Validation errors return clear messages: `{ field: 'sortCode', error: 'Invalid UK sort code format' }`

**AC2: Search and Filter Endpoints**
- ✅ `GET /api/domains/:domain/records/search?q=text` - Full-text search across relevant fields
- ✅ `GET /api/domains/:domain/records?priority=high` - Filter by priority
- ✅ `GET /api/domains/:domain/records?renewalDateStart=YYYY-MM-DD&renewalDateEnd=YYYY-MM-DD` - Date range filter
- ✅ `GET /api/domains/:domain/records?sort=renewalDate&order=asc` - Sort by field (asc/desc)
- ✅ Search returns matching records with relevance scoring
- ✅ Filters are combinable (e.g., `?priority=high&sort=renewalDate`)

**AC3: Record Duplication Detection**
- ✅ Finance domain: Detect duplicate accounts by `accountNumber` + `sortCode`
- ✅ Vehicle domain: Detect duplicate vehicles by `registrationPlate`
- ✅ Insurance domain: Detect duplicate policies by `policyNumber` + `provider`
- ✅ Property domain: Detect duplicate properties by `postcode` + `addressLine1`
- ✅ Duplicate check runs before record creation
- ✅ Returns 409 Conflict with duplicate record details: `{ error: 'Duplicate found', existingRecord: {...} }`

**AC4: Audit Trail**
- ✅ All domain records track `createdBy`, `createdAt`, `lastModifiedBy`, `lastModifiedAt`
- ✅ Mongoose middleware auto-populates audit fields on save
- ✅ `GET /api/domains/:domain/records/:id/history` returns modification history
- ✅ History shows: timestamp, user (name/email), changed fields
- ✅ History endpoint requires record ownership (user can only see own record history)

**AC5: Export Functionality**
- ✅ `GET /api/domains/:domain/records/export?format=csv` - Export as CSV
- ✅ `GET /api/domains/:domain/records/export?format=json` - Export as JSON
- ✅ Export includes all user's records for the domain
- ✅ CSV headers match domain-specific field names
- ✅ File downloads with proper Content-Disposition header (e.g., `finance-records-2025-10-04.csv`)
- ✅ Export respects user isolation (only exports user's own records)

### Integration Requirements

**IR1: Existing Functionality Preserved**
- ✅ Domain CRUD endpoints from Story 1.1 unchanged (backward compatible)
- ✅ Document upload/download from Story 1.2 works with validated records
- ✅ Existing tests pass (25 Story 1.1 tests, 22 Story 1.2 tests)

**IR2: Validation Integration**
- ✅ Validation runs automatically on `POST /api/domains/:domain/records` (create)
- ✅ Validation runs automatically on `PUT /api/domains/:domain/records/:id` (update)
- ✅ Invalid data returns 400 Bad Request with specific field errors
- ✅ Valid data creates/updates record successfully

**IR3: Performance Requirements**
- ✅ Search queries return results in < 300ms for databases with 1000+ records
- ✅ Export generates CSV/JSON in < 2 seconds for 500 records
- ✅ Duplicate detection adds < 100ms overhead to record creation

### Quality Requirements

**QR1: Comprehensive Testing**
- ✅ Unit tests for UK validation functions (sort code, NI number, postcode, registration plate)
- ✅ Unit tests for duplicate detection logic
- ✅ Integration tests for search/filter endpoints
- ✅ Integration tests for export functionality (CSV and JSON)
- ✅ Tests for audit trail middleware
- ✅ Test coverage: minimum 90% for new code
- ✅ Minimum 20 new tests for Story 1.3

**QR2: Error Handling**
- ✅ Validation errors include field name and specific issue
- ✅ Duplicate detection errors include existing record ID
- ✅ Search with invalid parameters returns 400 with error details
- ✅ Export with invalid format returns 400 with supported formats

---

## Technical Specifications

### UK Validation Utilities

Create validation utilities at `src/utils/ukValidation.js`:

```javascript
// src/utils/ukValidation.js

/**
 * Validate UK sort code (XX-XX-XX format)
 * @param {string} sortCode - Sort code to validate
 * @returns {boolean} - True if valid
 */
const isValidSortCode = (sortCode) => {
  const sortCodeRegex = /^\d{2}-\d{2}-\d{2}$/;
  return sortCodeRegex.test(sortCode);
};

/**
 * Validate UK National Insurance number
 * Format: XX 12 34 56 X (or XX123456X without spaces)
 * @param {string} niNumber - NI number to validate
 * @returns {boolean} - True if valid
 */
const isValidNINumber = (niNumber) => {
  const niRegex = /^[A-CEGHJ-PR-TW-Z]{1}[A-CEGHJ-NPR-TW-Z]{1}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]{1}$/i;
  return niRegex.test(niNumber);
};

/**
 * Validate UK vehicle registration plate
 * Formats: AB12 CDE, AB12CDE (current style)
 * @param {string} regPlate - Registration plate to validate
 * @returns {boolean} - True if valid
 */
const isValidRegistrationPlate = (regPlate) => {
  const regPlateRegex = /^[A-Z]{2}\d{2}\s?[A-Z]{3}$/i;
  return regPlateRegex.test(regPlate);
};

/**
 * Validate UK postcode
 * Formats: SW1A 1AA, M1 1AE, etc.
 * @param {string} postcode - Postcode to validate
 * @returns {boolean} - True if valid
 */
const isValidPostcode = (postcode) => {
  const postcodeRegex = /^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i;
  return postcodeRegex.test(postcode);
};

/**
 * Validate MOT date is in future or within 30 days
 * @param {Date} motDate - MOT expiry date
 * @returns {Object} - { valid: boolean, error?: string }
 */
const isValidMOTDate = (motDate) => {
  const today = new Date();
  const motExpiry = new Date(motDate);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  if (motExpiry < thirtyDaysAgo) {
    return {
      valid: false,
      error: 'MOT expired more than 30 days ago'
    };
  }

  return { valid: true };
};

module.exports = {
  isValidSortCode,
  isValidNINumber,
  isValidRegistrationPlate,
  isValidPostcode,
  isValidMOTDate
};
```

### Domain-Specific Validation Middleware

Add validation to domain routes:

```javascript
// src/middleware/domainValidation.js
const {
  isValidSortCode,
  isValidNINumber,
  isValidRegistrationPlate,
  isValidPostcode,
  isValidMOTDate
} = require('../utils/ukValidation');

/**
 * Validate Finance domain records
 */
const validateFinanceRecord = (req, res, next) => {
  const { accountNumber, sortCode } = req.body;

  const errors = [];

  if (sortCode && !isValidSortCode(sortCode)) {
    errors.push({
      field: 'sortCode',
      error: 'Invalid UK sort code format. Expected: XX-XX-XX'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate Vehicle domain records
 */
const validateVehicleRecord = (req, res, next) => {
  const { registrationPlate, motExpiryDate } = req.body;

  const errors = [];

  if (registrationPlate && !isValidRegistrationPlate(registrationPlate)) {
    errors.push({
      field: 'registrationPlate',
      error: 'Invalid UK registration plate format. Expected: AB12 CDE'
    });
  }

  if (motExpiryDate) {
    const motValidation = isValidMOTDate(motExpiryDate);
    if (!motValidation.valid) {
      errors.push({
        field: 'motExpiryDate',
        error: motValidation.error
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate Employment domain records
 */
const validateEmploymentRecord = (req, res, next) => {
  const { nationalInsuranceNumber } = req.body;

  const errors = [];

  if (nationalInsuranceNumber && !isValidNINumber(nationalInsuranceNumber)) {
    errors.push({
      field: 'nationalInsuranceNumber',
      error: 'Invalid UK National Insurance number format. Expected: XX 12 34 56 X'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate Property domain records
 */
const validatePropertyRecord = (req, res, next) => {
  const { postcode } = req.body;

  const errors = [];

  if (postcode && !isValidPostcode(postcode)) {
    errors.push({
      field: 'postcode',
      error: 'Invalid UK postcode format. Expected: SW1A 1AA'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  validateFinanceRecord,
  validateVehicleRecord,
  validateEmploymentRecord,
  validatePropertyRecord
};
```

### Search and Filter Implementation

Enhance domain routes with search capabilities:

```javascript
// src/routes/domains.js (additions)

/**
 * Search domain records
 * GET /api/domains/:domain/records/search?q=searchTerm
 */
router.get('/:domain/records/search', requireAuth, async (req, res) => {
  try {
    const { domain } = req.params;
    const { q } = req.query; // search query

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters'
      });
    }

    const Model = getDomainModel(domain);

    // Build text search query (searches across relevant text fields)
    const searchRegex = new RegExp(q, 'i'); // case-insensitive

    // Domain-specific search fields
    const searchFields = getSearchFields(domain);

    const searchQuery = {
      user: req.user._id,
      $or: searchFields.map(field => ({ [field]: searchRegex }))
    };

    const records = await Model.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get domain-specific searchable fields
 */
const getSearchFields = (domain) => {
  const fieldMap = {
    finance: ['accountName', 'provider', 'accountType'],
    vehicle: ['make', 'model', 'registrationPlate'],
    property: ['addressLine1', 'city', 'postcode'],
    employment: ['employer', 'jobTitle'],
    insurance: ['provider', 'policyType', 'policyNumber'],
    government: ['documentType', 'referenceNumber'],
    legal: ['documentType', 'partyNames'],
    services: ['provider', 'serviceType']
  };

  return fieldMap[domain] || ['name', 'description'];
};

/**
 * Filter and sort domain records (enhanced GET endpoint)
 * GET /api/domains/:domain/records?priority=high&sort=renewalDate&order=asc
 */
router.get('/:domain/records', requireAuth, async (req, res) => {
  try {
    const { domain } = req.params;
    const {
      priority,
      renewalDateStart,
      renewalDateEnd,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const Model = getDomainModel(domain);

    // Build filter query
    const filter = { user: req.user._id };

    if (priority) {
      filter.priority = priority;
    }

    if (renewalDateStart || renewalDateEnd) {
      filter.renewalDate = {};
      if (renewalDateStart) {
        filter.renewalDate.$gte = new Date(renewalDateStart);
      }
      if (renewalDateEnd) {
        filter.renewalDate.$lte = new Date(renewalDateEnd);
      }
    }

    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };

    const records = await Model.find(filter).sort(sortObj);

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Duplicate Detection

Add duplicate check middleware:

```javascript
// src/middleware/duplicateDetection.js

/**
 * Check for duplicate Finance records (account number + sort code)
 */
const checkDuplicateFinanceRecord = async (req, res, next) => {
  try {
    const { accountNumber, sortCode } = req.body;
    const FinanceRecord = require('../models/domain/FinanceRecord');

    if (accountNumber && sortCode) {
      const existing = await FinanceRecord.findOne({
        user: req.user._id,
        accountNumber,
        sortCode
      });

      if (existing) {
        return res.status(409).json({
          error: 'Duplicate record found',
          message: 'An account with this account number and sort code already exists',
          existingRecord: existing
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Check for duplicate Vehicle records (registration plate)
 */
const checkDuplicateVehicleRecord = async (req, res, next) => {
  try {
    const { registrationPlate } = req.body;
    const VehicleRecord = require('../models/domain/VehicleRecord');

    if (registrationPlate) {
      const existing = await VehicleRecord.findOne({
        user: req.user._id,
        registrationPlate
      });

      if (existing) {
        return res.status(409).json({
          error: 'Duplicate record found',
          message: 'A vehicle with this registration plate already exists',
          existingRecord: existing
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Check for duplicate Insurance records (policy number + provider)
 */
const checkDuplicateInsuranceRecord = async (req, res, next) => {
  try {
    const { policyNumber, provider } = req.body;
    const InsuranceRecord = require('../models/domain/InsuranceRecord');

    if (policyNumber && provider) {
      const existing = await InsuranceRecord.findOne({
        user: req.user._id,
        policyNumber,
        provider
      });

      if (existing) {
        return res.status(409).json({
          error: 'Duplicate record found',
          message: 'A policy with this policy number and provider already exists',
          existingRecord: existing
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  checkDuplicateFinanceRecord,
  checkDuplicateVehicleRecord,
  checkDuplicateInsuranceRecord
};
```

### Audit Trail Implementation

Add audit fields to all domain schemas:

```javascript
// Add to each domain schema (e.g., src/models/domain/FinanceRecord.js)

const financeRecordSchema = new Schema({
  // ... existing fields ...

  // Audit trail fields
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  history: [{
    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    changes: {
      type: Map,
      of: Schema.Types.Mixed
    }
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Middleware to track modifications
financeRecordSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    const changes = {};
    this.modifiedPaths().forEach(path => {
      if (path !== 'history' && path !== 'lastModifiedBy') {
        changes[path] = this[path];
      }
    });

    this.history.push({
      modifiedBy: this.lastModifiedBy,
      modifiedAt: new Date(),
      changes
    });
  }
  next();
});
```

### Export Functionality

Add export endpoints:

```javascript
// src/routes/domains.js (additions)
const { Parser } = require('json2csv');

/**
 * Export domain records
 * GET /api/domains/:domain/records/export?format=csv|json
 */
router.get('/:domain/records/export', requireAuth, async (req, res) => {
  try {
    const { domain } = req.params;
    const { format = 'json' } = req.query;

    const Model = getDomainModel(domain);

    // Get all user's records
    const records = await Model.find({ user: req.user._id })
      .select('-__v -history') // Exclude internal fields
      .lean();

    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      // Convert to CSV
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(records);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${domain}-records-${timestamp}.csv"`);
      return res.send(csv);
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${domain}-records-${timestamp}.json"`);
      return res.json(records);
    }

    return res.status(400).json({
      error: 'Invalid format. Supported formats: csv, json'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Testing Guide

### Manual Testing

**1. Test UK Sort Code Validation:**
```bash
# Valid sort code
curl -X POST http://localhost:3000/api/domains/finance/records \
  -H "Cookie: session=YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Current Account",
    "accountNumber": "12345678",
    "sortCode": "12-34-56",
    "provider": "HSBC"
  }'

# Invalid sort code (should fail)
curl -X POST http://localhost:3000/api/domains/finance/records \
  -H "Cookie: session=YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Current Account",
    "accountNumber": "12345678",
    "sortCode": "123456",
    "provider": "HSBC"
  }'
```

**Expected Response (invalid):**
```json
{
  "errors": [
    {
      "field": "sortCode",
      "error": "Invalid UK sort code format. Expected: XX-XX-XX"
    }
  ]
}
```

**2. Test Search:**
```bash
curl "http://localhost:3000/api/domains/finance/records/search?q=HSBC" \
  -H "Cookie: session=YOUR_SESSION"
```

**3. Test Duplicate Detection:**
```bash
# Create first record
curl -X POST http://localhost:3000/api/domains/finance/records \
  -H "Cookie: session=YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Savings",
    "accountNumber": "11111111",
    "sortCode": "20-00-00",
    "provider": "Barclays"
  }'

# Try to create duplicate (should fail with 409)
curl -X POST http://localhost:3000/api/domains/finance/records \
  -H "Cookie: session=YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Different Name",
    "accountNumber": "11111111",
    "sortCode": "20-00-00",
    "provider": "Barclays"
  }'
```

**4. Test Export:**
```bash
# Export as CSV
curl "http://localhost:3000/api/domains/finance/records/export?format=csv" \
  -H "Cookie: session=YOUR_SESSION" \
  --output finance-records.csv

# Export as JSON
curl "http://localhost:3000/api/domains/finance/records/export?format=json" \
  -H "Cookie: session=YOUR_SESSION" \
  --output finance-records.json
```

**5. Test Advanced Filtering:**
```bash
# Filter by priority and sort by renewal date
curl "http://localhost:3000/api/domains/finance/records?priority=high&sort=renewalDate&order=asc" \
  -H "Cookie: session=YOUR_SESSION"

# Date range filter
curl "http://localhost:3000/api/domains/finance/records?renewalDateStart=2025-01-01&renewalDateEnd=2025-12-31" \
  -H "Cookie: session=YOUR_SESSION"
```

### Automated Tests

Create comprehensive test suite at `tests/api/domain-management.test.js`:

**Test Coverage:**
1. ✅ UK sort code validation (valid and invalid formats)
2. ✅ UK NI number validation (valid and invalid formats)
3. ✅ UK registration plate validation (valid and invalid formats)
4. ✅ UK postcode validation (valid and invalid formats)
5. ✅ MOT date validation (expired, valid, within 30 days)
6. ✅ Search endpoint returns matching records
7. ✅ Search with short query (< 2 chars) returns 400
8. ✅ Filter by priority works correctly
9. ✅ Filter by date range works correctly
10. ✅ Sorting by field and order works
11. ✅ Duplicate detection for finance records (account + sort code)
12. ✅ Duplicate detection for vehicle records (registration plate)
13. ✅ Duplicate detection for insurance records (policy + provider)
14. ✅ Export as CSV generates valid CSV file
15. ✅ Export as JSON generates valid JSON file
16. ✅ Export with invalid format returns 400
17. ✅ Audit trail tracks record creation
18. ✅ Audit trail tracks record modifications
19. ✅ History endpoint returns modification history
20. ✅ Users can only access their own records

**Minimum Test Count:** 20 tests

---

## Verification Checklist

**Before marking story complete:**

- [ ] UK validation functions work for all formats (sort code, NI, reg plate, postcode)
- [ ] MOT date validation prevents expired MOTs (> 30 days old)
- [ ] Search endpoint returns relevant results
- [ ] Filter endpoints work with query parameters
- [ ] Duplicate detection prevents redundant records
- [ ] Duplicate error returns existing record details
- [ ] Export as CSV generates valid downloadable file
- [ ] Export as JSON generates valid downloadable file
- [ ] Audit trail tracks all record modifications
- [ ] History endpoint shows who changed what
- [ ] All validation middleware integrated with domain routes
- [ ] All tests passing (minimum 20 new tests)
- [ ] Story 1.1 and 1.2 regression tests still pass (47 total tests)
- [ ] No errors in server logs
- [ ] Performance: Search < 300ms, export < 2s

---

## Implementation Notes

### Development Workflow

**Step 1: UK Validation Utilities (1 hour)**
1. Create `src/utils/ukValidation.js` with all validation functions
2. Write unit tests for each validation function
3. Test edge cases (with/without spaces, case sensitivity)

**Step 2: Domain Validation Middleware (1 hour)**
1. Create `src/middleware/domainValidation.js`
2. Implement domain-specific validators (Finance, Vehicle, Employment, Property)
3. Integrate with domain routes (POST/PUT endpoints)

**Step 3: Search and Filter (1-1.5 hours)**
1. Add search endpoint to `src/routes/domains.js`
2. Implement `getSearchFields()` helper for domain-specific fields
3. Enhance existing GET endpoint with filter/sort query parameters
4. Test with various query combinations

**Step 4: Duplicate Detection (45 minutes)**
1. Create `src/middleware/duplicateDetection.js`
2. Implement duplicate checks for Finance, Vehicle, Insurance domains
3. Add middleware to POST routes
4. Test duplicate scenarios

**Step 5: Audit Trail (1 hour)**
1. Add audit fields to all domain schemas
2. Add Mongoose `pre('save')` middleware to track changes
3. Create history endpoint
4. Test creation and modification tracking

**Step 6: Export Functionality (45 minutes)**
1. Install `json2csv` package: `npm install json2csv`
2. Add export endpoint to domain routes
3. Implement CSV and JSON generation
4. Test file downloads

**Step 7: Testing (1-1.5 hours)**
1. Write comprehensive test suite (20+ tests)
2. Test all validation functions
3. Test search, filter, duplicate detection
4. Test export and audit trail
5. Run regression tests for Stories 1.1 and 1.2

**Total Estimated Time: 4-6 hours**

---

### Dependencies to Add

```bash
# JSON to CSV conversion
npm install json2csv
```

### Key Patterns to Follow

**Validation Pattern:**
```javascript
// Always validate BEFORE processing
if (!isValidSortCode(sortCode)) {
  return res.status(400).json({
    errors: [{ field: 'sortCode', error: 'Invalid format' }]
  });
}
```

**Duplicate Detection Pattern:**
```javascript
// Check for duplicates BEFORE creating
const existing = await Model.findOne({ key1, key2 });
if (existing) {
  return res.status(409).json({
    error: 'Duplicate found',
    existingRecord: existing
  });
}
```

**Search Pattern:**
```javascript
// Use regex for flexible text search
const searchRegex = new RegExp(query, 'i');
const records = await Model.find({
  $or: [
    { field1: searchRegex },
    { field2: searchRegex }
  ]
});
```

---

### Gotchas to Avoid

❌ **Don't** skip validation for "admin" users (validate everyone)
❌ **Don't** expose other users' data in duplicate error messages
❌ **Don't** allow export without user isolation check
❌ **Don't** forget to test MOT date edge cases (exactly 30 days old)
❌ **Don't** skip audit trail on record creation (only track updates)

✅ **Do** validate all UK-specific fields (sort codes, NI numbers, etc.)
✅ **Do** provide clear error messages with field names
✅ **Do** test duplicate detection with edge cases (case sensitivity)
✅ **Do** ensure export respects user isolation
✅ **Do** track both creation and modification in audit trail

---

## Definition of Done

- [ ] UK validation functions implemented and tested (sort code, NI, reg plate, postcode, MOT)
- [ ] Domain-specific validation middleware integrated
- [ ] Search endpoint functional with text search
- [ ] Filter and sort endpoints work with query parameters
- [ ] Duplicate detection prevents redundant records
- [ ] Export functionality generates valid CSV and JSON files
- [ ] Audit trail tracks all record modifications
- [ ] History endpoint returns modification history
- [ ] All tests passing (minimum 20 new tests for Story 1.3)
- [ ] Regression tests pass (47 tests from Stories 1.1 and 1.2)
- [ ] No errors in server logs
- [ ] Performance validated (search < 300ms, export < 2s)
- [ ] Code follows existing patterns
- [ ] Git commit with clear message: "feat: Add domain record management and validation (Story 1.3)"

---

## Next Story

**Story 1.4: Data Migration Utilities & Preservation**
- Builds on all previous stories (1.1, 1.2, 1.3)
- Provides safe migration from bills/categories to domain records
- Includes dry-run mode and rollback capability
- Zero data loss guaranteed

---

**Story Created:** 2025-10-04
**Status:** Ready for Development
