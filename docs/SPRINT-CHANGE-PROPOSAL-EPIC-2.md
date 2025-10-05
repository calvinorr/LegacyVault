# Sprint Change Proposal: Epic 2 - Legacy System Retirement

**Date:** 2025-10-05
**PM Agent:** John
**Trigger:** Post-Epic 1 completion review revealed legacy navigation coexistence
**Status:** Proposed - Awaiting User Approval

---

## Executive Summary

**Issue:** Epic 1 successfully delivered the domain architecture foundation (8 domains, cross-domain features, 180+ tests) but did not remove the legacy Bills/Accounts/Categories system. Users currently see **two parallel navigation systems**, creating confusion about which system to use.

**Solution:** Create Epic 2 to systematically retire legacy components, migrate Bank Import functionality to domain architecture, and establish clean domain-first navigation.

**Impact:** Medium effort (4-6 weeks part-time), Low risk (Epic 1 stable, legacy data preserved as safety net), High value (eliminates user confusion, unlocks Bank Import productivity).

---

## 1. Identified Issue Summary

### Problem Statement

After completing Epic 1 (9/9 stories delivered), the application contains:
- ✅ **New System:** 8 domain pages (Property, Vehicles, Finance, etc.) with full CRUD
- ❌ **Old System:** Legacy Accounts/Bills/Categories navigation still visible in Layout.tsx
- ❌ **Confusion:** Users don't know whether to use "Accounts" vs "Finance domain" or "Bills" vs "domain records"

### Root Cause

Epic 1 was correctly scoped to "build new domain architecture" but the PRD **assumed** (but didn't explicitly require) legacy system removal would happen as part of Epic 1. Story 1.9 (Bank Import Enhancement) was defined in the PRD but never implemented in Epic 1.

### Evidence

- **Layout.tsx** (lines 150-169): Shows Accounts, Bills, Categories, Contacts, Documents navigation items
- **PRD** (lines 200-202): Expected navigation to be "Home, Renewals, Emergency View, Settings" only
- **EPIC-1-SUMMARY.md**: Shows 9/9 stories complete but no legacy retirement stories

### Severity

**Medium** - Application is functional but user experience degraded by dual navigation. Bank Import (valuable HSBC parser) currently writes to legacy schema and needs migration to remain useful.

---

## 2. Epic Impact Summary

### Current Epic (Epic 1)

**Status:** ✅ **COMPLETE** (9/9 stories delivered)
**Modification Required:** ❌ NO - Epic 1 delivered exactly what it promised
**Epic 1 Achievement:** Domain architecture foundation with comprehensive testing

### Future Epics

**New Epic Required:** ✅ YES - **Epic 2: Legacy System Retirement & Bank Import Migration**

**Epic 2 Goal:** Remove legacy Bills/Accounts/Categories system, migrate Bank Import to domain architecture, and establish clean domain-first user experience.

**Why Epic 2 (not extension of Epic 1):**
1. **Clean separation:** Epic 1 = "Build New", Epic 2 = "Retire Old"
2. **Risk isolation:** New system validated before removing old safety net
3. **Bank Import complexity:** Requires careful migration of working parser
4. **User decision:** User confirmed preference for fresh start approach

---

## 3. Artifact Adjustment Needs

### Documents Requiring Updates

| Artifact | Current State | Required Updates | Priority |
|----------|---------------|------------------|----------|
| **docs/prd.md** | Version 1.0, Epic 1 only | Add Epic 2 section with 5 stories, move Story 1.9 to Epic 2, update version to 2.0, add change log entry | HIGH |
| **docs/architecture/source-tree.md** | Shows legacy routes as active | Mark `entry.js`, `category.js`, `entries.js` as deprecated, add Bank Import routes documentation, update frontend structure | MEDIUM |
| **CLAUDE.md** | Documents `/api/entries/*` routes | Update API Routes section to reflect domain architecture, document Epic 1 complete, add Epic 2 status | MEDIUM |
| **docs/stories/epic-1-life-domain-architecture-foundation.md** | "What's Next" section generic | Update to reference Epic 2 specifically | LOW |
| **docs/MY-TODO.md** | Epic 1 tracking only | Add Epic 2 tracking section | LOW |

### Code Components Requiring Updates

| Component | Action | Story |
|-----------|--------|-------|
| **web/src/components/Layout.tsx** | Remove Accounts/Bills/Categories/Contacts/Documents nav items | Story 2.1 |
| **src/routes/entries.js** | Archive (don't delete - safety net) | Story 2.2 |
| **src/models/entry.js** | Mark as deprecated, keep for Bank Import migration reference | Story 2.3 |
| **src/controllers/ImportController.js** | Update to create domain records instead of entries | Story 2.3 |
| **web/src/pages/BankImport.tsx** | Add domain selection UI for transactions | Story 2.4 |

---

## 4. Recommended Path Forward

### Selected Path: Option 1 - Direct Adjustment

**Approach:** Add Epic 2 to project plan with 5 incremental stories.

**Rationale:**
- ✅ Epic 1 stable and complete - no rollback needed
- ✅ User confirmed preferences align with this approach:
  - Bank Import priority (Option A) - Fix early for productivity
  - Legacy data preservation (Option B) - Safety net approach
  - 5 smaller stories (Option A) - Granular progress tracking
- ✅ Clean separation reduces risk of breaking Epic 1 work
- ✅ Bank Import migration preserves valuable HSBC parser investment

---

## 5. Epic 2 Story Breakdown

### Story 2.1: Navigation Cleanup & Domain-First Experience

**As a** household administrator,
**I want** to see only domain-based navigation (no legacy Accounts/Bills/Categories),
**so that** I have a clear, unconfused navigation experience.

**Acceptance Criteria:**
1. Remove Accounts, Bills, Categories, Contacts, Documents navigation items from Layout.tsx
2. Update navigation to show: Home, Renewals, Emergency, Settings (as per PRD)
3. HomePage displays 8 domain cards as primary interface (already built in Epic 1)
4. No broken links or console errors after removal
5. Breadcrumb navigation works correctly for all domain pages

**Files Modified:**
- `web/src/components/Layout.tsx` (lines 150-209)

**Integration Verification:**
- All Epic 1 domain pages still accessible via domain cards
- Renewals and Emergency pages still accessible via navigation
- Mobile responsive navigation maintained

**Estimated Effort:** 1-2 hours (simple UI cleanup)

---

### Story 2.2: Legacy Route & Component Removal

**As a** developer,
**I want** to remove unused legacy routes and components (while preserving Bank Import),
**so that** the codebase is clean and maintainable.

**Acceptance Criteria:**
1. Archive (don't delete) legacy routes: `src/routes/entries.js`
2. Archive legacy page components: `web/src/pages/Accounts.tsx`, `web/src/pages/Bills.tsx`, `web/src/pages/Categories.tsx`, `web/src/pages/Contacts.tsx`, `web/src/pages/Documents.tsx` (if they exist)
3. **Preserve Bank Import routes:** `src/routes/import.js` remains fully functional
4. Remove route registrations from `src/server.js` for archived routes
5. Update React Router in `web/src/App.tsx` to remove legacy page routes
6. No console errors or broken references after cleanup
7. All Epic 1 tests still pass (180+ tests)

**Files Modified:**
- `src/server.js` (route registrations)
- `web/src/App.tsx` (React Router configuration)
- Move legacy files to `src/legacy/` directory (safety net)

**Integration Verification:**
- Bank Import page still accessible at `/import` or `/settings`
- Epic 1 domain pages unaffected
- Authentication flow unchanged

**Estimated Effort:** 3-4 hours (careful removal with testing)

---

### Story 2.3: Bank Import Schema Migration

**As a** developer,
**I want** to update Bank Import to create domain records instead of legacy entries,
**so that** parsed transactions flow into the new domain architecture.

**Acceptance Criteria:**
1. Update `ImportController.js` to create records in domain collections (not legacy `entries` collection)
2. Transaction confirmation creates domain record with appropriate schema (PropertyRecord, VehicleRecord, etc.)
3. Import sessions still track transactions correctly (preserve existing ImportSession model)
4. HSBC multi-line transaction parsing still works (no regression)
5. Recurring payment detection preserved
6. Background processing via `backgroundProcessor.js` still functional
7. All Bank Import tests pass (verify with `npm test -- import`)

**Files Modified:**
- `src/controllers/ImportController.js` (confirmSuggestions method)
- `src/services/backgroundProcessor.js` (if needed)

**Integration Verification:**
- Upload HSBC statement → transactions parsed correctly
- Confirm transaction → creates record in correct domain collection
- ImportSession shows correct transaction count and status

**Estimated Effort:** 6-8 hours (complex migration, requires understanding both schemas)

---

### Story 2.4: Bank Import Domain Intelligence

**As a** household administrator,
**I want** bank transactions to suggest the appropriate domain when creating records,
**so that** I can quickly populate domains with intelligent defaults.

**Acceptance Criteria:**
1. Transaction table in BankImport.tsx shows "Create Record" button per transaction
2. Click "Create Record" opens domain selection dialog with intelligent suggestion:
   - Energy bill transaction (British Gas, EDF, OVO) → suggests Property domain
   - Car insurance transaction (Direct Line, Admiral) → suggests Vehicles domain
   - Pension contribution (Aviva, Standard Life) → suggests Employment domain
   - Council Tax → suggests Property domain
3. After domain selection, opens domain-specific form pre-populated with:
   - Provider name extracted from transaction description
   - Amount from transaction
   - Date from transaction
4. User can edit pre-populated fields before saving
5. Transaction marked as "record created" to avoid duplicates
6. Domain suggestion accuracy ≥80% for common UK providers

**Files Modified:**
- `web/src/pages/BankImport.tsx` (add domain suggestion logic)
- `web/src/services/domainSuggestionEngine.ts` (new file - UK provider matching)
- `web/src/components/domain/DomainSelectionModal.tsx` (new component)

**Integration Verification:**
- Test with real HSBC statement containing various transaction types
- Verify domain suggestions match expected domains
- Verify form pre-population reduces data entry time
- Measure: Create 10 domain records in <5 minutes (vs ~20 minutes manual entry)

**Estimated Effort:** 8-10 hours (new UI component + suggestion engine)

---

### Story 2.5: Legacy Data Archive & Safety Net

**As a** developer,
**I want** to archive legacy data collections (keep in database but hidden from UI),
**so that** we have a safety net if migration issues arise.

**Acceptance Criteria:**
1. Legacy collections (`entries`, `categories`) remain in MongoDB (not deleted)
2. Add `_archived: true` field to all documents in legacy collections (migration script)
3. Legacy API routes return 410 Gone status (not 404) with message: "This API has been replaced by domain-based endpoints"
4. Database backup script created before archival (safety precaution)
5. README documentation updated with instructions for accessing archived data if needed
6. Storage monitoring confirms legacy data size (verify within MongoDB Atlas 512MB limit)

**Files Modified:**
- `src/scripts/archive-legacy-data.js` (new migration script)
- `src/routes/entries.js` (update to return 410 Gone)
- `README.md` (add Legacy Data Access section)

**Integration Verification:**
- Run migration script on test database
- Verify legacy data still in MongoDB collections
- Verify API endpoints return appropriate 410 status
- Test database backup/restore process

**Estimated Effort:** 4-5 hours (careful data handling)

---

## 6. PRD MVP Impact

### MVP Scope Changes

**Original PRD MVP (Epic 1):** ✅ DELIVERED
- 8 life domains with domain-specific schemas
- GridFS document storage
- Cross-domain renewals dashboard
- Emergency view for critical records

**Epic 2 Scope:** ✅ ENHANCEMENT (not MVP expansion)
- Epic 2 is cleanup/completion work, not new MVP features
- Retiring legacy system completes the migration vision from PRD
- Bank Import enhancement (PRD Story 1.9) delivers originally planned functionality

**MVP Status:** ✅ Epic 1 delivered MVP core, Epic 2 completes migration vision

---

## 7. High-Level Action Plan

### Phase 1: Planning & Documentation (Week 1)

1. **Update PRD** (PM Agent)
   - Add Epic 2 section with 5 stories
   - Update PRD version to 2.0
   - Add change log entry

2. **Create Epic 2 Tracking Document** (PM Agent)
   - Create `docs/stories/epic-2-legacy-system-retirement.md`
   - Create `docs/stories/EPIC-2-SUMMARY.md` (for session persistence)
   - Update `docs/MY-TODO.md` with Epic 2 tasks

3. **Update Architecture Docs** (PM Agent)
   - Update `docs/architecture/source-tree.md`
   - Update `CLAUDE.md` API Routes section

### Phase 2: Implementation (Weeks 2-5)

**Week 2:** Story 2.1 + Story 2.2 (Navigation cleanup, legacy route removal)
**Week 3:** Story 2.3 (Bank Import schema migration) - PRIORITY
**Week 4:** Story 2.4 (Bank Import domain intelligence)
**Week 5:** Story 2.5 (Legacy data archive)

### Phase 3: Validation & Completion (Week 6)

1. **End-to-End Testing**
   - Test all 8 domains with real data
   - Test Bank Import with actual HSBC statements
   - Verify legacy data archived correctly

2. **Epic 2 Completion Review**
   - Update EPIC-2-SUMMARY.md with completion status
   - Create Epic 2 completion PR (Git Agent)
   - Plan Epic 3 (if needed)

---

## 8. Agent Handoff Plan

### Immediate Next Steps (Post-Approval)

1. **PM Agent (John):** Update PRD with Epic 2 section
2. **PM Agent (John):** Create Epic 2 story specifications
3. **PM Agent (John):** Create Epic 2 tracking documents
4. **Dev Agent (James):** Begin Story 2.1 implementation (Navigation cleanup)

### Ongoing Roles

- **PM Agent:** Track Epic 2 progress, update story statuses, answer story clarifications
- **Dev Agent:** Implement stories sequentially, run tests, create PRs
- **Git Agent:** Manage commits, create PRs for story completion
- **User (Calvin):** Approve stories, test with real data, provide feedback

---

## 9. Success Criteria

### Epic 2 Success Metrics

**Functional:**
- ✅ Legacy navigation (Accounts/Bills/Categories) removed from UI
- ✅ Bank Import creates domain records (not legacy entries)
- ✅ Domain suggestions ≥80% accurate for common UK providers
- ✅ Legacy data archived and accessible if needed

**Technical:**
- ✅ All Epic 1 tests still passing (180+)
- ✅ No console errors or broken links
- ✅ Bank Import tests updated and passing

**User Experience:**
- ✅ Navigation clear and unconfused (only domain-based)
- ✅ Bank Import accelerates domain population (<5 minutes for 10 records)
- ✅ User can complete Epic 2 tasks without external help

---

## 10. Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Bank Import Migration Breaks Parser** | Medium | High | Preserve existing ImportSession model, test with real HSBC statements, incremental changes |
| **Legacy Data Accidentally Deleted** | Low | Critical | Archive (don't delete), backup before migration, migration script with dry-run mode |
| **Domain Suggestion Accuracy Low** | Medium | Medium | Start with common UK providers, iterate based on real usage, allow manual override |
| **Epic 1 Tests Fail After Cleanup** | Low | Medium | Run full test suite after each story, preserve Epic 1 code paths |

### Mitigation Strategies

1. **Bank Import Safety:** Test Story 2.3 thoroughly on development database before production
2. **Data Backup:** Create MongoDB backup before Story 2.5 (legacy data archive)
3. **Incremental Approach:** Complete Story 2.1-2.2 before touching Bank Import (validate cleanup doesn't break existing features)
4. **Rollback Plan:** Keep legacy code in `src/legacy/` directory for easy restoration if needed

---

## 11. Timeline Estimate

**Total Epic 2 Effort:** 22-29 hours (4-6 weeks part-time at 5-7 hours/week)

**Story Breakdown:**
- Story 2.1: 1-2 hours
- Story 2.2: 3-4 hours
- Story 2.3: 6-8 hours (most complex)
- Story 2.4: 8-10 hours
- Story 2.5: 4-5 hours

**Critical Path:** Story 2.3 (Bank Import migration) - Must complete before Story 2.4

---

## 12. Final Recommendations

### Approve Epic 2?

**✅ RECOMMENDED: APPROVE**

**Rationale:**
1. Epic 2 completes the migration vision from PRD
2. Removes user confusion from dual navigation systems
3. Unlocks Bank Import productivity (valuable HSBC parser preserved)
4. Low risk (Epic 1 stable, legacy data preserved)
5. Aligns with user preferences (fresh start, Bank Import priority, granular stories)

### Next Actions (Upon Approval)

1. User approves this Sprint Change Proposal
2. PM Agent updates PRD with Epic 2 section
3. PM Agent creates Epic 2 story files (`docs/stories/story-2.1-navigation-cleanup.md`, etc.)
4. PM Agent creates Epic 2 tracking document (`docs/stories/EPIC-2-SUMMARY.md`)
5. Dev Agent begins Story 2.1 implementation

---

**Document Status:** ✅ Ready for User Review
**Approval Required:** User (Calvin) approval to proceed with Epic 2
**Next Review:** After Epic 2 completion (estimated 4-6 weeks)

---

**PM Agent:** John
**Date Created:** 2025-10-05
**Version:** 1.0
