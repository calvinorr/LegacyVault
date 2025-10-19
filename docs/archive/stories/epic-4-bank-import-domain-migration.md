# Epic 4: Bank Import Domain Migration - Brownfield Enhancement

**Created:** 2025-10-10
**Status:** 📋 Proposed - Awaiting User Approval
**PM Agent:** Sarah (Product Owner)
**Epic Type:** Brownfield Enhancement

---

## Epic Overview

**Goal:** Restore and adapt existing Bank Import functionality to work with the new domain/record architecture, making it accessible to users and fully integrated with the 8 life domains.

**Why This Epic Exists:** The application was migrated from a legacy Bills/Accounts system to a domain-based architecture (Property, Vehicles, Finance, Employment, Government, Insurance, Legal, Services). The Bank Import feature exists in the codebase with sophisticated PDF parsing and transaction detection, but:
- It's not accessible (no route or navigation)
- It was designed for the old Entry-based schema
- Needs adaptation to create domain records instead

**Business Value:** Bank Import is a productivity accelerator that allows users to upload bank statements and automatically populate their domain records with detected recurring payments (utilities, subscriptions, insurance, council tax, etc.).

---

## Existing System Context

### Current Relevant Functionality

**Bank Import Infrastructure (Already Built):**
- `web/src/pages/BankImport.tsx` - Premium UI with Swiss spa aesthetic ✅
- `src/routes/import.js` - API routes registered ✅
- `src/controllers/ImportController.js` - Controller with domain logic ✅
- `src/models/ImportSession.js` - Session management model ✅
- PDF processor, recurring detector, background processor services ✅

**Technology Stack:**
- Backend: Node.js/Express with MongoDB
- Frontend: React/TypeScript with Vite
- Current Architecture: 8 life domains with domain-specific record models

**Integration Points:**
- Needs to integrate with all 8 domain models: PropertyRecord, VehicleRecord, FinanceRecord, EmploymentRecord, GovernmentRecord, InsuranceRecord, LegalRecord, ServicesRecord
- Needs navigation integration in Layout.tsx
- Needs route registration in App.tsx

---

## Stories (3 Total)

This epic follows the **1-3 story brownfield enhancement** approach as this is an isolated feature restoration.

### Story 4.1: Make Bank Import Accessible ⏳

**Status:** Pending
**Estimated Effort:** 1-2 hours
**Priority:** High (blocks all other work)

**Goal:** Add Bank Import to navigation and routing so users can access the feature.

**Key Deliverables:**
1. Add `/bank-import` route to `web/src/App.tsx`
2. Import BankImport page component
3. Add "Bank Import" navigation link to `web/src/components/Layout.tsx`
4. Use appropriate icon (Upload or FileUp from lucide-react)
5. Position link in navigation (suggest: between Domains and Renewals)
6. Admin-only access (Bank Import is admin feature per existing code)

**Acceptance Criteria:**
- ✅ User can click "Bank Import" in navigation and reach the page
- ✅ Page loads without console errors
- ✅ Navigation link highlights when active
- ✅ Non-admin users see appropriate access denied message
- ✅ Route is protected with ProtectedRoute wrapper

**Files to Modify:**
- `web/src/App.tsx` (add route)
- `web/src/components/Layout.tsx` (add navigation link)

---

### Story 4.2: Verify Domain Record Creation from Bank Import ⏳

**Status:** Pending
**Estimated Effort:** 3-4 hours
**Priority:** Critical (core functionality)

**Goal:** Verify and fix the existing domain record creation logic in ImportController so bank transactions can create records in appropriate domains.

**Key Deliverables:**
1. Test existing `ImportController._createEntryFromSuggestion()` method
2. Verify domain suggestion engine works with current schema
3. Ensure all 8 domain models support `import_metadata` field
4. Test transaction-to-domain-record workflow end-to-end
5. Fix any schema mismatches between ImportController and domain models
6. Verify `CreateEntryFromTransactionModal` works correctly

**Domain Models to Verify:**
- PropertyRecord - utility bills, council tax, rent/mortgage
- VehicleRecord - car insurance, MOT, vehicle tax, fuel subscriptions
- FinanceRecord - bank fees, credit card payments, loan payments
- EmploymentRecord - payroll deposits, pension contributions
- GovernmentRecord - council tax, TV licence, HMRC payments
- InsuranceRecord - all insurance types (home, car, life, health)
- LegalRecord - legal service fees, solicitor payments
- ServicesRecord - subscriptions (Netflix, utilities, broadband, mobile)

**Acceptance Criteria:**
- ✅ Upload test bank statement (PDF) successfully
- ✅ Transactions are parsed and displayed in table
- ✅ Click "Create Entry" on a transaction opens modal
- ✅ Modal suggests appropriate domain for transaction
- ✅ Can override domain suggestion if incorrect
- ✅ Saving modal creates record in correct domain collection
- ✅ Record has proper `import_metadata` with session reference
- ✅ Created record is visible in respective domain page
- ✅ Transaction status changes to "Entry Created" after processing

**Testing Approach:**
1. Test with real HSBC/UK bank statement (if available)
2. Test common UK recurring payments:
   - British Gas (Property > Utility Bill)
   - Council Tax (Government > Council Tax)
   - Car Insurance (Insurance > Motor Insurance)
   - Netflix (Services > Streaming)
   - Mobile Phone (Services > Mobile Contract)

**Files to Test/Modify:**
- `src/controllers/ImportController.js` (verify domain record creation)
- `src/services/domainSuggestionEngine.js` (verify suggestions)
- `web/src/components/CreateEntryFromTransactionModal.tsx` (verify modal)
- All 8 domain models in `src/models/domain/` (verify import_metadata support)

---

### Story 4.3: Bank Import End-to-End Integration Testing ⏳

**Status:** Pending
**Estimated Effort:** 2-3 hours
**Priority:** Medium (validation)

**Goal:** Comprehensive end-to-end testing of Bank Import workflow to ensure production readiness.

**Key Deliverables:**
1. Create test plan for Bank Import workflow
2. Test with multiple UK bank statement formats (HSBC, NatWest, Barclays)
3. Verify recurring payment detection accuracy
4. Test bulk operations (select multiple transactions)
5. Verify session management (upload, view, delete)
6. Test error handling (invalid PDF, large files, duplicate uploads)
7. Verify data integrity (no orphaned records, proper cleanup)

**Test Scenarios:**
1. **Happy Path:**
   - Upload bank statement → Parse successfully → View transactions
   - Create domain record from transaction → Verify in domain page
   - Accept recurring payment suggestion → Record created automatically
   - Delete import session → Verify cleanup

2. **Edge Cases:**
   - Upload duplicate statement → Should reject with message
   - Upload non-PDF file → Should reject with error
   - Upload corrupted PDF → Should fail gracefully
   - Create record from same transaction twice → Should prevent duplicates

3. **UK-Specific Testing:**
   - HSBC multi-line transactions (known complexity)
   - UK date format (DD/MM/YYYY)
   - GBP currency formatting
   - Sort codes in transaction descriptions
   - Common UK payees (British Gas, O2, Sky, Netflix, Council)

**Acceptance Criteria:**
- ✅ All test scenarios pass
- ✅ No console errors during normal workflow
- ✅ Appropriate error messages for failure cases
- ✅ Session cleanup works correctly
- ✅ Created records have complete data
- ✅ Import metadata properly links records to sessions
- ✅ Recurring payment detection ≥80% accurate for common UK providers

**Deliverables:**
- Test plan document (can be in comments/story file)
- List of tested scenarios with results
- Any bug fixes required
- Updated documentation if needed

---

### Story 4.4: Inline Record Type Creation in Transaction Modal 💡

**Status:** Future Enhancement
**Estimated Effort:** 2-3 hours
**Priority:** Low (nice-to-have, not blocking)

**Goal:** Allow users to create new record types on-the-fly within the CreateEntryFromTransactionModal without leaving the Bank Import workflow.

**Problem Statement:**
Currently, if a user doesn't have record types set up for a domain, they must:
1. Leave the Bank Import page
2. Go to Settings → Record Types
3. Create the record type
4. Return to Bank Import
5. Resume creating the entry

This breaks the workflow and creates friction.

**Proposed Solution:**
Add a "+ Add New Record Type" button below the Record Type dropdown that:
1. Opens an inline mini-form (or small modal-within-modal)
2. Allows user to quickly create a record type (name + domain)
3. Saves the record type
4. Automatically selects it in the dropdown
5. User continues with entry creation seamlessly

**Key Deliverables:**
1. Add "+ Add New Record Type" button in CreateEntryFromTransactionModal
2. Create inline record type creation UI (mini-form or nested modal)
3. Integrate with existing `/api/record-types` POST endpoint
4. Refresh record types list after creation
5. Auto-select newly created record type

**Acceptance Criteria:**
- ✅ Button appears below Record Type dropdown
- ✅ Clicking button opens inline creation form
- ✅ Form validates record type name (required)
- ✅ Successfully creates record type via API
- ✅ New record type appears in dropdown immediately
- ✅ New record type is auto-selected
- ✅ User can cancel inline creation and return to main form
- ✅ Works smoothly within modal (no layout issues)

**Technical Approach:**
```typescript
// Option 1: Inline form (simpler)
<div style={{ marginBottom: "24px" }}>
  <select>...</select>
  <button onClick={() => setShowRecordTypeForm(true)}>
    + Add New Record Type
  </button>
  {showRecordTypeForm && (
    <div>
      <input placeholder="Record Type Name" />
      <button>Save</button>
      <button>Cancel</button>
    </div>
  )}
</div>

// Option 2: Nested modal (cleaner but more complex)
{showRecordTypeModal && <RecordTypeQuickCreate ... />}
```

**Files to Modify:**
- `web/src/components/CreateEntryFromTransactionModal.tsx` - Add inline creation UI
- Reuse existing `/api/record-types` endpoint (no backend changes needed)

**Alternative Workaround (Current):**
Record type field is already **optional**, so users can:
1. Skip record type selection
2. Create the record without a type
3. Edit record later to add type

This works but isn't ideal UX.

**Decision:** Defer to Story 4.4 (post-Epic 4) unless user requests it for Epic 4.

---

## Compatibility Requirements

- [ ] Existing domain architecture remains unchanged
- [ ] Bank Import creates domain records (not legacy Entry objects)
- [ ] All 8 domain pages continue to work normally
- [ ] Import sessions are user-scoped (admin only)
- [ ] No breaking changes to existing API routes
- [ ] Premium UI styling matches current design system

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Schema mismatch between ImportController and domain models | Medium | High | Test each domain model individually, update schemas if needed |
| Existing domain data gets corrupted | Low | Critical | Test in dev environment first, verify import_metadata doesn't conflict |
| Bank statement parsing fails | Medium | Medium | Test with multiple UK bank formats, improve error messages |
| Performance issues with large statements | Low | Medium | Existing background processor handles this, monitor session timeouts |
| CreateEntryFromTransactionModal incomplete | Medium | High | May need to rebuild modal if existing implementation is broken |

---

## Definition of Done

- [ ] Bank Import page accessible from main navigation
- [ ] Admin users can upload PDF bank statements
- [ ] Transactions are parsed and displayed correctly
- [ ] Users can create domain records from transactions
- [ ] Domain suggestion engine works accurately
- [ ] Records appear in correct domain pages
- [ ] Import metadata properly tracks record origins
- [ ] Session management (list, view, delete) works
- [ ] End-to-end workflow tested with real UK statements
- [ ] No console errors or warnings
- [ ] No regression in existing domain functionality

---

## Success Criteria

The epic is successful when:

1. **Accessibility:** Users can access Bank Import from navigation
2. **Core Workflow:** Upload PDF → Parse → View → Create Records → Verify in Domains
3. **Integration:** Records created in correct domains with proper metadata
4. **Usability:** Intuitive UI for transaction review and record creation
5. **Reliability:** Handles UK bank statements (HSBC, NatWest, Barclays) accurately
6. **Domain Intelligence:** Suggests correct domain ≥80% of the time
7. **No Regressions:** Existing domain functionality unaffected

---

## Timeline & Milestones

**Total Estimated Effort:** 6-9 hours (1-2 sessions at 4-5 hours/session)

**Phase 1: Accessibility (Story 4.1)**
- Add routing and navigation (~1-2 hours)
- Quick win to enable testing

**Phase 2: Core Functionality (Story 4.2)**
- Verify and fix domain record creation (~3-4 hours)
- Most complex work, critical path

**Phase 3: Validation (Story 4.3)**
- End-to-end testing (~2-3 hours)
- Ensure production readiness

---

## Dependencies & Prerequisites

**Prerequisites:**
- ✅ Epic 1 complete (8 domains functional)
- ✅ Domain models stable and tested
- ✅ BankImport.tsx page exists
- ✅ ImportController and services exist

**External Dependencies:**
- UK bank statement PDFs for testing
- Admin user account for testing

**Story Dependencies:**
- Story 4.2 depends on Story 4.1 (need access to page to test)
- Story 4.3 depends on Story 4.2 (need working functionality to test end-to-end)

---

## Reference Documents

**Existing Code:**
- `web/src/pages/BankImport.tsx` - Frontend page (1354 lines)
- `src/controllers/ImportController.js` - Backend controller (443 lines)
- `src/routes/import.js` - API routes
- `src/services/domainSuggestionEngine.js` - Domain suggestion logic
- `web/src/components/CreateEntryFromTransactionModal.tsx` - Record creation modal

**Related Architecture:**
- `docs/architecture/source-tree.md` - Current project structure
- `docs/stories/epic-1-life-domain-architecture-foundation.md` - Domain architecture
- Domain models: `src/models/domain/*.js` (8 models)

**Project Context:**
- `CLAUDE.md` - Project instructions
- `docs/prd.md` - Product requirements

---

## Notes for Session Persistence

**If you're resuming after a session break:**

1. **Where We Are:** Epic 4 proposed for Bank Import domain migration
2. **What's Been Done:** Epic planning complete, awaiting user approval
3. **What's Next:** User approves → Begin Story 4.1 (add routing/navigation)
4. **Key Context:** Bank Import exists but not accessible, needs domain integration
5. **Testing Strategy:** Test with real UK bank statements for each domain

**Key Files to Reference:**
- `web/src/App.tsx` - Add route here (Story 4.1)
- `web/src/components/Layout.tsx` - Add navigation here (Story 4.1)
- `src/controllers/ImportController.js` - Verify domain logic (Story 4.2)
- `src/models/domain/*.js` - Verify import_metadata support (Story 4.2)

---

**Epic Status:** 📋 Awaiting User Approval
**Next Action:** User (Calvin) reviews and approves Epic 4
**Created By:** PM Agent (Sarah)
**Date:** 2025-10-10
