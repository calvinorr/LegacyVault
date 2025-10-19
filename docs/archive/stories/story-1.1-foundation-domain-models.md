# Story 1.1: Foundation - Domain Data Models and API Infrastructure

**Epic:** Life Domain Architecture Migration
**Story ID:** 1.1
**Estimated Effort:** 1-2 development sessions (4-8 hours)
**Priority:** Critical (Foundation for all other stories)
**Status:** Not Started

---

## User Story

**As a** developer,
**I want** to create the domain-based MongoDB schemas and base API structure,
**so that** I can build domain-specific records without touching existing auth or UI.

---

## Story Context

### Why This Story First

This is the **foundation story** that creates the infrastructure for all 8 life domains without touching:
- ❌ Existing Google OAuth (preserve working auth)
- ❌ Existing UI/frontend (no user-visible changes yet)
- ❌ Existing bills/categories (new collections created alongside, not replacing)

**Low Risk Approach:**
- Backend-only work (schemas + API routes)
- Can be tested via Postman/curl (no UI needed)
- Validates MongoDB + Vercel serverless integration early
- Rollback = simply don't use new endpoints (old system untouched)

### Existing System Integration

**Technology Stack:**
- MongoDB v6.x with Mongoose ODM
- Node.js v18+ / Express v4.x
- Existing patterns: `src/models/` for schemas, `src/routes/` for endpoints

**Touch Points:**
- New collections created in same MongoDB database
- New API routes alongside existing `/api/entries/*` routes
- User model referenced (records linked to `user._id`)

---

## Acceptance Criteria

### Functional Requirements

**AC1: Eight Domain Mongoose Schemas Created**
- ✅ `src/models/domain/PropertyRecord.js` - Property-specific schema
- ✅ `src/models/domain/VehicleRecord.js` - Vehicle-specific schema
- ✅ `src/models/domain/EmploymentRecord.js` - Employment-specific schema
- ✅ `src/models/domain/GovernmentRecord.js` - Government-specific schema
- ✅ `src/models/domain/FinanceRecord.js` - Finance-specific schema
- ✅ `src/models/domain/InsuranceRecord.js` - Insurance & Protection schema
- ✅ `src/models/domain/LegalRecord.js` - Legal & Estate schema
- ✅ `src/models/domain/ServicesRecord.js` - Household Services schema

**AC2: Base API Routes Support CRUD Operations**
- ✅ `POST /api/domains/:domain/records` - Create record
- ✅ `GET /api/domains/:domain/records` - List records (filtered by user)
- ✅ `GET /api/domains/:domain/records/:id` - Get single record
- ✅ `PUT /api/domains/:domain/records/:id` - Update record
- ✅ `DELETE /api/domains/:domain/records/:id` - Delete record

**AC3: Domain Validation Middleware**
- ✅ Only valid domains accepted: `property`, `vehicles`, `employment`, `government`, `finance`, `insurance`, `legal`, `services`
- ✅ Returns 400 error for invalid domain names
- ✅ Case-insensitive domain matching

**AC4: Common Fields Across All Domains**
- ✅ `priority` field (enum: 'Critical', 'Important', 'Standard')
- ✅ `renewalDate` field (Date, optional)
- ✅ `user` field (ObjectId ref to User model)
- ✅ `documentIds` field (Array of ObjectIds for GridFS - ready for Story 1.2)
- ✅ `createdAt`, `updatedAt` timestamps (Mongoose automatic)

**AC5: Domain-Specific Fields**
- ✅ Each schema includes fields from brief Appendix A (see Technical Specifications below)

**AC6: User Association Preserved**
- ✅ All records linked to `user._id`
- ✅ Multi-user support maintained (records filtered by authenticated user)
- ✅ Only user's own records returned from GET endpoints

### Integration Verification

**IV1: Existing Auth Unchanged**
- ✅ Google OAuth flow works (`/auth/google`, `/auth/google/callback`)
- ✅ `/api/users/me` endpoint returns current user
- ✅ Session management untouched
- ✅ User model unchanged

**IV2: Database Coexistence**
- ✅ New domain collections created (e.g., `propertyrecords`, `vehiclerecords`)
- ✅ Existing collections preserved (`bills`, `categories`, `users`)
- ✅ No deletions or migrations in this story
- ✅ MongoDB Atlas connection string unchanged

**IV3: API Testing (Postman/curl)**
- ✅ Can create Property record via POST to `/api/domains/property/records`
- ✅ Can retrieve records via GET `/api/domains/property/records`
- ✅ Can update record via PUT `/api/domains/property/records/:id`
- ✅ Can delete record via DELETE `/api/domains/property/records/:id`
- ✅ Invalid domain returns 400 error

---

## Technical Specifications

### Domain Schema Definitions

Reference: Brief Appendix A for complete field lists. Key fields per domain:

#### 1. PropertyRecord Schema
```javascript
// src/models/domain/PropertyRecord.js
const propertyRecordSchema = new Schema({
  // Common fields (all domains)
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['Critical', 'Important', 'Standard'], default: 'Standard' },
  renewalDate: { type: Date },
  documentIds: [{ type: Schema.Types.ObjectId }],

  // Property-specific fields
  name: { type: String, required: true }, // e.g., "Home Electric", "Mortgage"
  recordType: { type: String, required: true }, // e.g., "mortgage", "utility-electric", "home-insurance"
  address: { type: String },
  provider: { type: String },
  accountNumber: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
  monthlyAmount: { type: Number },
  notes: { type: String },
}, { timestamps: true });
```

#### 2. VehicleRecord Schema
```javascript
// src/models/domain/VehicleRecord.js
const vehicleRecordSchema = new Schema({
  // Common fields
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['Critical', 'Important', 'Standard'], default: 'Standard' },
  renewalDate: { type: Date },
  documentIds: [{ type: Schema.Types.ObjectId }],

  // Vehicle-specific fields
  name: { type: String, required: true }, // e.g., "Family Car", "Car Insurance"
  recordType: { type: String, required: true }, // e.g., "vehicle-details", "insurance", "mot", "finance"
  registration: { type: String },
  make: { type: String },
  model: { type: String },
  purchaseDate: { type: Date },
  financeProvider: { type: String },
  financeMonthlyPayment: { type: Number },
  motExpiryDate: { type: Date },
  insuranceRenewalDate: { type: Date },
  roadTaxExpiryDate: { type: Date },
  notes: { type: String },
}, { timestamps: true });
```

#### 3. FinanceRecord Schema
```javascript
// src/models/domain/FinanceRecord.js
const financeRecordSchema = new Schema({
  // Common fields
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['Critical', 'Important', 'Standard'], default: 'Standard' },
  renewalDate: { type: Date },
  documentIds: [{ type: Schema.Types.ObjectId }],

  // Finance-specific fields
  name: { type: String, required: true }, // e.g., "HSBC Current Account", "Halifax ISA"
  accountType: { type: String, required: true }, // e.g., "current", "savings", "isa", "credit-card", "loan"
  institution: { type: String },
  sortCode: { type: String }, // Format: XX-XX-XX
  accountNumber: { type: String },
  balance: { type: Number },
  interestRate: { type: Number },
  creditLimit: { type: Number }, // For credit cards
  monthlyPayment: { type: Number }, // For loans
  notes: { type: String },
}, { timestamps: true });
```

#### 4-8. Employment, Government, Insurance, Legal, Services Schemas

**Employment Fields:** employer, jobTitle, startDate, salary, payrollNumber, pensionProvider, pensionContribution

**Government Fields:** niNumber, taxReference, benefitType, benefitClaimNumber, licenceNumber, licenceExpiry, passportNumber, passportExpiry

**Insurance Fields:** policyType, policyNumber, provider, premium, coverageAmount, beneficiaries

**Legal Fields:** documentType (will, poa, trust, deed), executionDate, solicitorName, solicitorContact, executorNames

**Services Fields:** serviceName, serviceType, tradesperson, contactPhone, contactEmail, qualityRating (1-5), jobHistory

*See full implementation in code - follow same pattern as Property/Vehicle/Finance above*

---

### API Route Implementation

#### Domain Router (`src/routes/domains.js`)

```javascript
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

// Domain validation middleware
const VALID_DOMAINS = ['property', 'vehicles', 'employment', 'government', 'finance', 'insurance', 'legal', 'services'];

const validateDomain = (req, res, next) => {
  const domain = req.params.domain.toLowerCase();
  if (!VALID_DOMAINS.includes(domain)) {
    return res.status(400).json({ error: `Invalid domain: ${req.params.domain}` });
  }
  req.domain = domain;
  next();
};

// Get domain model dynamically
const getDomainModel = (domain) => {
  const modelMap = {
    property: require('../models/domain/PropertyRecord'),
    vehicles: require('../models/domain/VehicleRecord'),
    employment: require('../models/domain/EmploymentRecord'),
    government: require('../models/domain/GovernmentRecord'),
    finance: require('../models/domain/FinanceRecord'),
    insurance: require('../models/domain/InsuranceRecord'),
    legal: require('../models/domain/LegalRecord'),
    services: require('../models/domain/ServicesRecord'),
  };
  return modelMap[domain];
};

// CREATE record
router.post('/:domain/records', ensureAuthenticated, validateDomain, async (req, res) => {
  try {
    const Model = getDomainModel(req.domain);
    const record = new Model({
      ...req.body,
      user: req.user._id
    });
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ all records (for authenticated user)
router.get('/:domain/records', ensureAuthenticated, validateDomain, async (req, res) => {
  try {
    const Model = getDomainModel(req.domain);
    const records = await Model.find({ user: req.user._id });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ single record
router.get('/:domain/records/:id', ensureAuthenticated, validateDomain, async (req, res) => {
  try {
    const Model = getDomainModel(req.domain);
    const record = await Model.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE record
router.put('/:domain/records/:id', ensureAuthenticated, validateDomain, async (req, res) => {
  try {
    const Model = getDomainModel(req.domain);
    const record = await Model.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE record
router.delete('/:domain/records/:id', ensureAuthenticated, validateDomain, async (req, res) => {
  try {
    const Model = getDomainModel(req.domain);
    const record = await Model.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### Register Route in `src/index.js` (or `src/app.js`)

```javascript
// Add this line with other route imports
const domainsRouter = require('./routes/domains');

// Add this line with other route registrations
app.use('/api/domains', domainsRouter);
```

---

## Testing Guide

### Manual API Testing (Postman/curl)

**1. Create a Property Record:**
```bash
curl -X POST http://localhost:3000/api/domains/property/records \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "name": "Home Electric Bill",
    "recordType": "utility-electric",
    "provider": "NIE Networks",
    "accountNumber": "123456789",
    "monthlyAmount": 85,
    "renewalDate": "2025-12-01",
    "priority": "Important"
  }'
```

**2. Get All Property Records:**
```bash
curl http://localhost:3000/api/domains/property/records \
  -H "Cookie: session=YOUR_SESSION_COOKIE"
```

**3. Test Invalid Domain (should return 400):**
```bash
curl http://localhost:3000/api/domains/invalid/records \
  -H "Cookie: session=YOUR_SESSION_COOKIE"
```

**4. Create Finance Record (Bank Account):**
```bash
curl -X POST http://localhost:3000/api/domains/finance/records \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "name": "HSBC Current Account",
    "accountType": "current",
    "institution": "HSBC",
    "sortCode": "40-47-84",
    "accountNumber": "12345678",
    "balance": 2500,
    "priority": "Critical"
  }'
```

### Verification Checklist

**Before marking story complete:**
- [ ] All 8 domain models created in `src/models/domain/`
- [ ] Domain router created in `src/routes/domains.js`
- [ ] Router registered in main Express app
- [ ] CRUD operations tested for at least 2 domains (Property + Finance)
- [ ] Invalid domain returns 400 error
- [ ] Records filtered by authenticated user (can't see other users' records)
- [ ] Existing Google OAuth still works (test login flow)
- [ ] MongoDB shows new collections created (e.g., `propertyrecords`, `financerecords`)
- [ ] No errors in console/logs

---

## Implementation Notes

### Development Workflow

**Step 1: Create Domain Models (60-90 minutes)**
1. Create `src/models/domain/` directory
2. Copy existing model pattern from `src/models/User.js`
3. Implement PropertyRecord, VehicleRecord, FinanceRecord first (validate approach)
4. Implement remaining 5 domains (faster once pattern established)

**Step 2: Create Domain Router (45-60 minutes)**
1. Create `src/routes/domains.js`
2. Implement domain validation middleware
3. Implement CRUD endpoints
4. Test with Postman/curl

**Step 3: Register Router (5 minutes)**
1. Add route registration to Express app
2. Restart server
3. Verify routes respond

**Step 4: Testing & Verification (30-45 minutes)**
1. Test each CRUD operation
2. Verify auth still works
3. Check MongoDB collections created
4. Confirm records filtered by user

**Total Estimated Time: 4-8 hours**

### Key Patterns to Follow

**Mongoose Schema Pattern:**
```javascript
// Always include these common fields
user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
priority: { type: String, enum: ['Critical', 'Important', 'Standard'], default: 'Standard' },
renewalDate: { type: Date },
documentIds: [{ type: Schema.Types.ObjectId }], // Ready for Story 1.2 GridFS

// Always enable timestamps
{ timestamps: true }
```

**Auth Middleware Pattern:**
```javascript
// Always check user authentication
router.get('/:domain/records', ensureAuthenticated, validateDomain, async (req, res) => {
  // Always filter by req.user._id
  const records = await Model.find({ user: req.user._id });
});
```

### Gotchas to Avoid

❌ **Don't** delete or modify existing bills/categories collections
❌ **Don't** touch Google OAuth code (preserve `/auth/*` routes)
❌ **Don't** modify User model
❌ **Don't** implement GridFS yet (that's Story 1.2)
❌ **Don't** build any UI (that's Story 1.3)

✅ **Do** create new collections alongside old ones
✅ **Do** follow existing Mongoose patterns
✅ **Do** test thoroughly with Postman/curl
✅ **Do** verify auth still works after changes

---

## Definition of Done

- [x] All 8 domain Mongoose schemas created with correct fields
- [x] Domain validation middleware working (rejects invalid domains)
- [x] CRUD API endpoints functional for all domains
- [x] Records properly filtered by authenticated user (multi-user support)
- [x] Common fields (priority, renewalDate, documentIds) present in all schemas
- [x] Domain-specific fields implemented per brief Appendix A
- [x] API routes registered in Express app
- [x] Manual testing completed (Postman/curl) for at least 2 domains
- [x] Existing Google OAuth authentication verified working
- [x] MongoDB collections created (visible in Atlas/Compass)
- [x] No errors in server logs
- [x] Code follows existing patterns and conventions
- [x] Git commit with clear message: "feat: Add domain-based schemas and API infrastructure (Story 1.1)"

---

## Next Story

**Story 1.2: GridFS Document Storage Integration**
- Builds on domain records created in this story
- Adds document upload/download via MongoDB GridFS
- Uses `documentIds` array prepared in this story's schemas

---

**Story Created:** 2025-10-04
**Last Updated:** 2025-10-04
**Status:** Ready for Review

---

## Dev Agent Record

**Agent Model Used:** Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### File List
- `src/models/domain/PropertyRecord.js` - Property domain schema
- `src/models/domain/VehicleRecord.js` - Vehicle domain schema
- `src/models/domain/FinanceRecord.js` - Finance domain schema
- `src/models/domain/EmploymentRecord.js` - Employment domain schema
- `src/models/domain/GovernmentRecord.js` - Government domain schema
- `src/models/domain/InsuranceRecord.js` - Insurance domain schema
- `src/models/domain/LegalRecord.js` - Legal domain schema
- `src/models/domain/ServicesRecord.js` - Services domain schema
- `src/routes/domains.js` - Domain CRUD API router
- `src/server.js` - Modified to register domains router
- `tests/api/domains.test.js` - Comprehensive API tests (25 tests)
- `docs/architecture/tech-stack.md` - Tech stack documentation
- `docs/architecture/coding-standards.md` - Coding standards
- `docs/architecture/source-tree.md` - Source tree structure

### Completion Notes
- All 8 domain schemas created with common fields (user, priority, renewalDate, documentIds)
- Domain-specific fields implemented per story requirements
- CRUD API endpoints functional with proper authentication and user isolation
- 25 comprehensive tests created and passing (100% pass rate)
- Domain validation middleware working (rejects invalid domains, case-insensitive)
- Multi-user data isolation verified through tests
- Server tested and running without errors

### Change Log
**2025-10-04 - Implementation Complete**
- Created 8 Mongoose domain models in `src/models/domain/`
- Implemented domain router with CRUD endpoints and validation
- Registered `/api/domains` routes in Express app
- Created comprehensive test suite (25 tests, all passing)
- Created missing architecture documentation files
- Verified MongoDB connection and server startup

### Debug Log
None - Implementation completed without issues
