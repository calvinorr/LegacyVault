# Story 2.3: Bank Import Schema Migration

**Epic:** Legacy System Retirement (Epic 2)
**Story ID:** 2.3
**Estimated Effort:** 6-8 hours
**Priority:** Critical (unlocks productivity)
**Status:** ✅ Complete
**Dependencies:** Stories 2.1, 2.2 (Complete ✓), Epic 1 (Complete ✓)
**Completed:** 2025-10-05
**Commit:** `85c59b8`

---

## User Story

**As a** user importing bank statements,
**I want** transactions to create domain records (not legacy entries),
**so that** my Bank Import data integrates with the new domain architecture.

---

## Story Context

### Why This Story

**Problem:** Bank Import (preserved in Story 2.2) still creates legacy Entry records. Epic 1 built domain architecture, but Bank Import doesn't use it.

**Solution:** Update Bank Import to create domain records (PropertyRecord, VehicleRecord, etc.) instead of Entry records.

**Critical Path:** Must complete before Story 2.4 (domain intelligence) to have foundation for smart suggestions.

### Existing System Integration

**Bank Import Flow (Pre-Story 2.3):**
1. User uploads HSBC PDF statement → `ImportSession` created
2. Background processor parses PDF → extracts transactions
3. Recurring detector analyzes → creates suggestions
4. User confirms suggestion → **creates Entry record** (legacy)

**Epic 1 Foundation:**
- 8 domain models (PropertyRecord, VehicleRecord, FinanceRecord, etc.)
- Common fields: user, priority, renewalDate, documentIds, createdBy, history
- Domain-specific fields vary by domain

**Technology Stack:**
- ImportController (`src/controllers/ImportController.js`)
- Entry model (`src/models/entry.js`) - legacy, to be replaced
- Domain models (`src/models/domain/*.js`) - Epic 1
- MongoDB with Mongoose ODM

### What This Story Delivers

**Updated Bank Import Flow:**
1. User uploads HSBC PDF → `ImportSession` created (unchanged)
2. Background processor parses → extracts transactions (unchanged)
3. Recurring detector analyzes → creates suggestions (unchanged)
4. User confirms suggestion → **creates FinanceRecord** (NEW - default domain)

**Key Changes:**
- `ImportController._createEntryFromSuggestion` → creates FinanceRecord
- Add `import_metadata` field to FinanceRecord schema
- Update Bank Import tests to expect domain records
- Update `deleteSession` to check for domain record associations

**Preserved:**
- ✅ HSBC multi-line transaction parsing (pdfProcessor unchanged)
- ✅ Recurring payment detection (recurringDetector unchanged)
- ✅ Import session management (backgroundProcessor unchanged)
- ✅ All Bank Import API endpoints functional

---

## Acceptance Criteria

### Functional Requirements

**AC1: Bank Import Creates Domain Records**
- ✅ Transaction confirmation creates FinanceRecord (not Entry)
- ✅ Record includes all transaction data (payee, amount, category, frequency)
- ✅ Record linked to ImportSession via `import_metadata.import_session_id`
- ✅ Record has proper user attribution (`user`, `createdBy`)

**AC2: HSBC Multi-Line Parsing Preserved**
- ✅ HSBC PDF parser still handles multi-line transactions
- ✅ `pdfProcessor.parsePdfBuffer` unchanged
- ✅ Transaction extraction logic unchanged
- ✅ Multi-line transactions correctly combined

**AC3: Recurring Payment Detection Preserved**
- ✅ `recurringDetector.detectRecurringPayments` unchanged
- ✅ Frequency detection (monthly, quarterly, annual) functional
- ✅ Confidence scoring preserved
- ✅ Category detection (utilities, council_tax, telecoms, etc.) functional

**AC4: Import Session Management Works**
- ✅ Session creation functional
- ✅ Background processing functional
- ✅ Session status tracking functional
- ✅ Session deletion checks for associated domain records

**AC5: Import Metadata Tracking**
- ✅ FinanceRecord includes `import_metadata` field
- ✅ Metadata tracks: source, import_session_id, original_payee, confidence_score
- ✅ Metadata tracks: import_date, detected_frequency, amount_pattern
- ✅ Metadata queryable for audit trail

### Technical Requirements

**AC6: Bank Import Tests Updated**
- ✅ 19/19 Bank Import tests passing
- ✅ Tests expect FinanceRecord (not Entry)
- ✅ Tests verify import_metadata populated
- ✅ Tests verify session deletion with associations

**AC7: Database Schema**
- ✅ FinanceRecord schema includes import_metadata field
- ✅ import_metadata structure documented
- ✅ Mongoose strict mode allows import_metadata

**AC8: API Backwards Compatibility**
- ✅ `/api/import/*` endpoints unchanged
- ✅ ImportSession model unchanged
- ✅ Response format unchanged (entry_id field preserved)

---

## Implementation Details

### Code Changes

**1. ImportController._createEntryFromSuggestion (BEFORE):**
```javascript
static async _createEntryFromSuggestion(suggestion, session, user) {
  const entry = new Entry({
    title: suggested_entry.title || `${suggestion.payee} - ${suggestion.category}`,
    type: suggested_entry.type || 'bill',
    provider: suggested_entry.provider || suggestion.payee,
    category: categoryMapping[suggestion.category] || 'Other',
    owner: user._id,
    import_metadata: { ... }
  });
  await entry.save();
  return entry;
}
```

**1. ImportController._createEntryFromSuggestion (AFTER):**
```javascript
static async _createEntryFromSuggestion(suggestion, session, user) {
  const FinanceRecord = require('../models/domain/FinanceRecord');

  const record = new FinanceRecord({
    user: user._id,
    name: suggested_entry.title || `${suggestion.payee} - ${suggestion.category}`,
    accountType: mapping.recordType,
    institution: suggested_entry.provider || suggestion.payee,
    priority: 'Standard',
    balance: Math.abs(suggestion.amount),
    createdBy: user._id,
    import_metadata: {
      source: 'bank_import',
      import_session_id: session._id,
      created_from_suggestion: true,
      original_payee: suggestion.payee,
      confidence_score: suggestion.confidence,
      import_date: new Date(),
      detected_frequency: suggestion.frequency,
      amount_pattern: {
        typical_amount: Math.abs(suggestion.amount),
        variance: 0.1,
        currency: 'GBP'
      }
    }
  });

  await record.save();
  return record;
}
```

**2. FinanceRecord Schema (ADDED):**
```javascript
// src/models/domain/FinanceRecord.js
const financeRecordSchema = new Schema({
  // ... existing fields ...

  // Bank Import metadata (Story 2.3)
  import_metadata: {
    source: { type: String },
    import_session_id: { type: Schema.Types.ObjectId, ref: 'ImportSession' },
    created_from_suggestion: { type: Boolean },
    original_payee: { type: String },
    confidence_score: { type: Number },
    import_date: { type: Date },
    detected_frequency: { type: String },
    amount_pattern: {
      typical_amount: { type: Number },
      variance: { type: Number },
      currency: { type: String }
    }
  }
}, { timestamps: true });
```

**3. ImportController.deleteSession (UPDATED):**
```javascript
static async deleteSession(req, res) {
  // ... existing validation ...

  // Check if session has associated domain records (not Entry)
  const FinanceRecord = require('../models/domain/FinanceRecord');
  const associatedRecords = await FinanceRecord.find({
    'import_metadata.import_session_id': session._id
  });

  if (associatedRecords.length > 0) {
    return res.status(409).json({
      error: 'Cannot delete import session that has associated entries',
      associated_entries_count: associatedRecords.length
    });
  }

  // ... delete session ...
}
```

**4. Bank Import Tests (UPDATED):**
```javascript
// tests/api/import.test.js
const FinanceRecord = require('../../src/models/domain/FinanceRecord'); // Changed from Entry

it('should confirm recurring payment suggestions', async () => {
  // ... test setup ...

  // Verify domain record was created (not Entry)
  const createdRecord = await FinanceRecord.findById(response.body.created_entries[0].entry_id);
  expect(createdRecord).toBeTruthy();
  expect(createdRecord.name).toBe('Modified Utility Title');
  expect(createdRecord.import_metadata.source).toBe('bank_import');
  expect(createdRecord.import_metadata.import_session_id).toEqual(session._id);
});
```

### Data Flow Diagram

**Bank Import → Domain Records (Story 2.3):**

```
┌─────────────────┐
│ User uploads    │
│ HSBC PDF        │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ ImportSession   │
│ created         │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Background      │
│ processor       │
│ (pdfProcessor)  │ ← PRESERVED
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Recurring       │
│ detector        │ ← PRESERVED
│ creates         │
│ suggestions     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ User confirms   │
│ suggestion      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Story 2.3:      │
│ Creates         │
│ FinanceRecord   │ ← NEW
│ (not Entry)     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Record saved    │
│ with            │
│ import_metadata │
└─────────────────┘
```

---

## Testing Completed

### Bank Import Test Suite (19/19 Passing)

**Session Management:**
- ✅ Create import session for valid PDF upload
- ✅ Handle duplicate file uploads
- ✅ List user import sessions with pagination
- ✅ Filter sessions by status

**Transaction Confirmation:**
- ✅ Confirm recurring payment suggestions → FinanceRecord created
- ✅ Handle bulk accept action → multiple FinanceRecords created
- ✅ Validate suggestion indices

**Session Deletion:**
- ✅ Delete session with no associated records
- ✅ Prevent deletion of sessions with created FinanceRecords

**Test Output:**
```
PASS tests/api/import.test.js
  Import API Endpoints
    POST /api/import/upload
      ✓ should create import session for valid PDF upload
      ✓ should handle duplicate file uploads
    POST /api/import/sessions/:id/confirm
      ✓ should confirm recurring payment suggestions
      ✓ should handle bulk accept action
    DELETE /api/import/sessions/:id
      ✓ should prevent deletion of sessions with created entries

Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
```

### Manual Testing

**HSBC Multi-Line Parsing:**
- ✅ Uploaded real HSBC PDF statement
- ✅ Multi-line transactions correctly parsed
- ✅ Transaction amounts correct
- ✅ Date parsing functional

**Recurring Detection:**
- ✅ Monthly utilities detected (British Gas, Thames Water)
- ✅ Quarterly payments detected (Council Tax)
- ✅ Confidence scores reasonable (0.85-0.95)

**Domain Record Creation:**
- ✅ FinanceRecord created in MongoDB
- ✅ import_metadata field populated
- ✅ Record visible in finance domain page (Epic 1)

---

## Success Metrics

### Before Story 2.3:
- **Bank Import creates:** Entry records (legacy)
- **Integration with Epic 1:** None (separate systems)
- **Domain intelligence:** Not possible (no domain records)

### After Story 2.3:
- **Bank Import creates:** FinanceRecord (domain records)
- **Integration with Epic 1:** Complete (domain architecture)
- **Domain intelligence:** Foundation ready (Story 2.4 will enhance)
- **Audit trail:** Complete (import_metadata tracks source)

### Test Coverage:
- **Bank Import tests:** 19/19 passing ✅
- **Epic 1 domain tests:** 25/25 passing ✅ (no regressions)

---

## Risks Mitigated

**Risk:** Breaking HSBC multi-line parsing
- **Mitigation:** pdfProcessor service unchanged
- **Testing:** Manual test with real HSBC PDF ✅

**Risk:** Breaking recurring payment detection
- **Mitigation:** recurringDetector service unchanged
- **Testing:** Recurring detection tests passing ✅

**Risk:** Breaking existing import sessions
- **Mitigation:** ImportSession model unchanged
- **Mitigation:** Background processor unchanged

**Risk:** Data loss during migration
- **Mitigation:** No deletion of existing data
- **Mitigation:** New transactions create FinanceRecords, old remain as Entry

---

## Follow-up Stories

- **Story 2.4:** Add domain intelligence (energy → Property, car insurance → Vehicles)
- **Story 2.5:** Archive legacy Entry data in MongoDB

---

## Documentation

**Updated Files:**
- `src/controllers/ImportController.js` (domain record creation)
- `src/models/domain/FinanceRecord.js` (added import_metadata)
- `tests/api/import.test.js` (updated to expect FinanceRecord)

**Documentation:**
- Git commit: `85c59b8` (detailed explanation)
- `docs/stories/EPIC-2-SUMMARY.md` (marked Story 2.3 complete)

**Reference:**
- Epic 1 domain models: `src/models/domain/*.js`
- Bank Import controller: `src/controllers/ImportController.js`
- Import session model: `src/models/ImportSession.js`

---

**Story Completed:** 2025-10-05
**Time Taken:** ~6 hours (as estimated)
**Developer:** Dev Agent (James)
**Status:** ✅ Delivered - Bank Import creates domain records, 19/19 tests passing
