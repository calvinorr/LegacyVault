# Epic 5: Transaction Ledger - Development Handoff

**Created:** 2025-10-11
**Branch:** `epic-5-transaction-ledger`
**Status:** Ready for Development
**Estimated Effort:** 56-71 hours (6 stories)

---

## Quick Overview

Transform Bank Import from stateless single-statement processor to intelligent transaction ledger that accumulates history across all imports, detects recurring patterns, prevents duplicates, and helps users efficiently identify regular payments requiring domain records.

**Key Problem Solved:** Current system processes monthly statements in isolation. Recurring detection within one statement is useless - real value is detecting patterns ACROSS monthly imports.

---

## Architecture Changes

### New Data Model

**Transaction Collection (NEW):**
- Persistent ledger of ALL user transactions across ALL imports
- Replaces embedded `ImportSession.transactions` array
- Enables cross-import pattern detection and duplicate prevention

**Pattern Collection (NEW):**
- Stores detected recurring payment patterns
- Confidence scoring (≥85% for auto-suggest)
- Learning from user overrides

**ImportSession (MODIFIED):**
- Remove embedded `transactions` array
- Add `transaction_refs` (ObjectId references)
- Add `statement_hash` for duplicate detection
- Virtual field for backwards compatibility

### Key Technical Decisions

1. **Duplicate Detection:** `amount + description` hash (not date - allows recurring monthly payments)
2. **Pattern Matching:** Fuzzball library, 85% threshold, normalized descriptions
3. **Migration Strategy:** Transaction-based (all-or-nothing), dry-run mode, rollback script
4. **Backwards Compatibility:** Mongoose virtual field `transactions` preserves existing code
5. **Storage:** Estimate 10 years ≈ 120MB (well within 512MB MongoDB Atlas M0 limit)

---

## Stories - Implementation Order

### ⚡ **Story 5.1: Foundation - Transaction Model & Migration** (8-12h)
**Priority:** CRITICAL PATH - Must complete first

**Deliverables:**
- Create `src/models/Transaction.js` with full schema
- Migration script: `src/scripts/migrateTransactions.js` (dry-run mode)
- Rollback script: `src/scripts/rollbackTransactionMigration.js`
- Update `src/models/ImportSession.js` (add `transaction_refs`, virtual field)
- MongoDB indexes: `{ user: 1, transactionHash: 1 }`, `{ user: 1, date: -1 }`, etc.

**Success Criteria:**
- Migration tested on staging database
- 100% transaction data preservation verified
- Backwards compatibility maintained (virtual field works)
- Performance: Query 10,000 transactions in <1s

**Files to Create:**
```
src/models/Transaction.js
src/scripts/migrateTransactions.js
src/scripts/rollbackTransactionMigration.js
```

**Files to Modify:**
```
src/models/ImportSession.js
```

---

### 🚀 **Story 5.2: Duplicate Detection** (6-8h)
**Priority:** QUICK WIN - High value, low complexity

**Deliverables:**
- File-level duplicate detection (PDF hash)
- Transaction-level duplicate detection (transactionHash)
- Duplicate warning UI modal
- Import timeline component (calendar visualization)

**Success Criteria:**
- Upload same PDF twice → blocked with message
- Overlapping statements → only new transactions created
- Timeline shows correct months with accurate counts

**Files to Create:**
```
src/services/duplicateDetector.js
web/src/components/bank-import/DuplicateWarningModal.tsx
web/src/components/bank-import/ImportTimeline.tsx
web/src/hooks/useDuplicateDetection.ts
web/src/hooks/useImportTimeline.ts
```

**Files to Modify:**
```
src/controllers/ImportController.js
```

---

### 📊 **Story 5.3: Transaction Status Management** (8-10h)
**Priority:** CORE WORKFLOW - Essential functionality

**Deliverables:**
- Transaction status enum (pending/record_created/ignored)
- Transaction API endpoints (GET, PUT status, ignore)
- Enhanced transaction table with filters
- Status badges component
- Bulk operations (ignore multiple transactions)

**Success Criteria:**
- Mark transaction as ignored → status persists
- Filter by status + date range → correct results
- Bulk ignore 10 transactions → all updated correctly

**Files to Create:**
```
src/controllers/TransactionController.js
src/routes/transactions.js
web/src/components/bank-import/TransactionStatusBadge.tsx
web/src/components/bank-import/TransactionFilters.tsx
web/src/hooks/useTransactions.ts
web/src/hooks/useTransactionStatus.ts
```

**Files to Modify:**
```
web/src/components/bank-import/TransactionTable.tsx
```

---

### 🧠 **Story 5.4: Pattern Detection** (12-15h)
**Priority:** GAME CHANGER - Differentiated feature

**Deliverables:**
- Pattern detection service (cross-import analysis)
- Pattern model with confidence scoring
- Fuzzy matching rules (fuzzball, 85% threshold)
- Pattern API endpoints
- Pattern insights panel UI

**Success Criteria:**
- Import 3+ months with recurring payees → patterns detected ≥85% accuracy
- Frequency detection works (monthly/quarterly/annual)
- Fuzzy matching handles description variations

**Files to Create:**
```
src/models/Pattern.js
src/services/patternDetector.js
src/controllers/PatternController.js
src/routes/patterns.js
web/src/components/bank-import/PatternInsightsPanel.tsx
web/src/hooks/usePatternDetection.ts
```

**Files to Modify:**
```
src/controllers/ImportController.js (run pattern detection after import)
```

---

### 💡 **Story 5.5: Smart Suggestions** (10-12h)
**Priority:** PRODUCTIVITY BOOST - UX enhancement

**Deliverables:**
- Enhanced pattern suggestion modal
- Smart field pre-population (domain, recordType, provider)
- Pattern learning controls (apply to all, remember pattern)
- Batch record creation
- User override tracking

**Success Criteria:**
- Transaction with pattern → modal shows correct suggestions
- Batch create from 3-5 similar transactions → all records created
- Override suggestion → future suggestions adapt

**Files to Create:**
```
web/src/components/bank-import/PatternSuggestionModal.tsx
```

**Files to Modify:**
```
src/controllers/PatternController.js (batch creation endpoint)
src/services/domainSuggestionEngine.js (use Pattern model)
web/src/pages/Settings.tsx (pattern management section)
```

---

### 🎨 **Story 5.6: Timeline & Transaction History** (12-14h)
**Priority:** UX POLISH - Discoverability

**Deliverables:**
- Transaction History page (/transactions route)
- Full import timeline component
- Transaction detail expansion
- Pattern insights panel (sidebar)
- Filter persistence (URL query params)

**Success Criteria:**
- Import 3-5 months → timeline shows correct states
- Click month → filters to that month's transactions
- Load 1000+ transactions → smooth pagination (<2s)

**Files to Create:**
```
web/src/pages/TransactionHistory.tsx
web/src/components/bank-import/TransactionDetailRow.tsx
```

**Files to Modify:**
```
web/src/components/bank-import/ImportTimeline.tsx (enhance)
web/src/components/Layout.tsx (add Transactions link)
web/src/App.tsx (add /transactions route)
```

---

## Critical Implementation Notes

### Migration (Story 5.1)

**MUST DO:**
1. Create full backup before migration: `backups/import-sessions-[timestamp].json`
2. Test dry-run mode first: `MIGRATION_DRY_RUN=true`
3. Batch processing: 1000 transactions per batch
4. Validation: Count transactions before/after, verify match
5. Keep rollback script ready

**Transaction Hash Calculation:**
```javascript
const crypto = require('crypto');
const transactionHash = crypto
  .createHash('sha256')
  .update(`${user._id}${amount}${description}`)
  .digest('hex');
```

### Pattern Detection (Story 5.4)

**Fuzzy Matching Rules:**
```javascript
// Normalize description
const normalize = (desc) => {
  return desc
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Remove special chars
    .replace(/^(DD|SO)/, '')   // Remove prefixes
    .replace(/(LTD|LIMITED)$/, ''); // Remove suffixes
};

// Example: "DD BRITISH GAS LTD" → "BRITISHGAS"
```

**Confidence Score Formula:**
```javascript
const confidence =
  (frequencyScore * 0.4) +
  (amountConsistency * 0.3) +
  (occurrenceCount * 0.3);

// Threshold: ≥0.85 for auto-suggest
```

### Duplicate Detection (Story 5.2)

**File Hash (PDF):**
```javascript
const fileHash = crypto
  .createHash('sha256')
  .update(pdfBuffer)
  .digest('hex');
```

**Transaction Hash (amount + description):**
```javascript
// Use user._id to scope to user
// Use amount + description (NOT date - allows recurring monthly)
const transactionHash = crypto
  .createHash('sha256')
  .update(`${user._id}${transaction.amount}${transaction.description}`)
  .digest('hex');
```

---

## MongoDB Indexes

**Transaction Collection:**
```javascript
Transaction.index({ user: 1, transactionHash: 1 }, { unique: true });
Transaction.index({ user: 1, date: -1 });
Transaction.index({ user: 1, status: 1 });
Transaction.index({ user: 1, description: 'text' });
Transaction.index({ importSession: 1 });
Transaction.index({ patternId: 1 });
```

**ImportSession Collection:**
```javascript
ImportSession.index({ user: 1, statement_hash: 1 });
ImportSession.index({ user: 1, createdAt: -1 });
```

**Pattern Collection:**
```javascript
Pattern.index({ user: 1, normalizedDescription: 1 });
Pattern.index({ user: 1, confidence: -1 });
```

---

## API Endpoints Summary

### Transaction Management
```
GET    /api/transactions
GET    /api/transactions/:id
PUT    /api/transactions/:id/ignore
PUT    /api/transactions/:id/status
DELETE /api/transactions/:id/ignore
POST   /api/transactions/bulk-ignore
```

### Import Session Enhancement
```
POST   /api/import/upload (enhanced)
GET    /api/import/timeline
GET    /api/import/sessions/:id/transactions
```

### Pattern Detection
```
GET    /api/patterns/recurring
POST   /api/patterns/suggest
POST   /api/patterns/apply
GET    /api/patterns/:id/transactions
```

---

## Testing Strategy

### Story 5.1 (Migration)
- Test on copy of production data (staging)
- Verify transaction count matches embedded count
- Test virtual field backwards compatibility
- Performance test: 10,000 transactions query

### Story 5.2 (Duplicate Detection)
- Upload same PDF twice → verify blocked
- Upload overlapping periods → verify only new transactions created
- Import 3-5 months → verify timeline accurate

### Story 5.4 (Pattern Detection)
- Import 3+ months with recurring payees (British Gas, Netflix, Council Tax)
- Verify ≥85% accuracy
- Test fuzzy matching with description variations

### Story 5.5 (Smart Suggestions)
- Test batch creation (3-5 transactions)
- Override suggestion → verify learning (confidence reduced)

### Story 5.6 (Transaction History)
- Load 1000+ transactions → verify pagination smooth
- Test filter combinations
- Verify pattern panel accurate

---

## Performance Targets

- **API Response:** <2s for transaction lists
- **Duplicate Detection:** <500ms for 500 transactions
- **Pattern Detection:** <1s (run in background, don't block import)
- **Transaction Query:** <1s for 10,000 transactions (with indexes)

---

## Success Metrics

- ✅ Migration: 100% data preservation
- ✅ Pattern accuracy: ≥85% for common UK providers
- ✅ User efficiency: 50% faster record creation from recurring patterns
- ✅ Performance: All targets met
- ✅ Storage: <100MB for 5 years of transaction history

---

## Risk Mitigation

**TR1: Data Migration Complexity (HIGH)**
- Mitigation: Backup, dry-run, batch processing, rollback script
- Contingency: Restore from backup, fix script, retry

**TR2: Pattern Detection Performance (MEDIUM)**
- Mitigation: Background jobs, MongoDB indexes, time limits
- Contingency: Disable pattern detection if >5s, run offline

**IR1: Breaking Change - ImportSession Schema (HIGH)**
- Mitigation: Virtual field for backwards compatibility, comprehensive testing
- Contingency: Rollback migration, add virtual field, redeploy

---

## Handoff Checklist

- ✅ PRD created: `docs/stories/epic-5-transaction-ledger.md`
- ✅ Branch created: `epic-5-transaction-ledger`
- ✅ Branch pushed to remote
- ✅ Development handoff document created
- ✅ All Epic 1-3 tests passing (baseline: 180+ tests)
- ✅ Existing Bank Import functionality working

---

## Next Actions for Dev Agent

1. **Read full PRD:** `docs/stories/epic-5-transaction-ledger.md`
2. **Start Story 5.1:** Transaction model + migration (CRITICAL PATH)
3. **Create Transaction.js model** with schema from PRD
4. **Write migration script** with dry-run mode
5. **Test migration** on staging database
6. **Verify backwards compatibility** with virtual field

---

**Questions?** Reference the full PRD at `docs/stories/epic-5-transaction-ledger.md` for complete technical specifications, acceptance criteria, and integration verification steps.

**Branch:** `epic-5-transaction-ledger`
**Current Status:** Clean working directory, ready for development
**GitHub PR:** https://github.com/calvinorr/LegacyVault/pull/new/epic-5-transaction-ledger

---

**Good luck! 🚀**
