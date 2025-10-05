# Epic 2: Legacy System Retirement - Story Summary

**Epic Status:** 📋 **Proposed - Awaiting User Approval**
**Implementation:** 0% Complete - Pending approval to begin
**Created:** 2025-10-05
**Estimated Completion:** 4-6 weeks post-approval (part-time)
**PM Agent:** John
**Dev Agent:** James (assigned upon approval)

---

## 📊 Epic Overview

**Goal:** Remove legacy Bills/Accounts/Categories system, migrate Bank Import functionality to domain architecture, and establish clean domain-first user experience.

**Context:** Epic 1 successfully delivered domain architecture (8 domains, 180+ tests) but didn't retire the old system. Users currently see two parallel navigation systems, creating confusion.

**Why Epic 2:**
- ✅ Completes migration vision from PRD
- ✅ Eliminates user confusion from dual navigation
- ✅ Preserves valuable Bank Import (HSBC parser)
- ✅ Unlocks productivity through domain-aware import

---

## 📋 Story Breakdown (5 Stories)

### Story 2.1: Navigation Cleanup & Domain-First Experience ⏳

**Status:** Pending Approval
**Estimated Effort:** 1-2 hours
**Priority:** High (user-facing confusion)

**Goal:** Remove legacy navigation (Accounts/Bills/Categories/Contacts/Documents) and establish clean domain-only navigation.

**Key Changes:**
- Update `web/src/components/Layout.tsx` (remove lines 150-169)
- Navigation becomes: Home, Renewals, Emergency, Settings
- Domain access via HomePage cards (already built in Epic 1)

**Success Criteria:**
- ✅ No legacy navigation items visible
- ✅ All Epic 1 domain pages still accessible
- ✅ Mobile responsive navigation maintained
- ✅ No broken links or console errors

---

### Story 2.2: Legacy Route & Component Removal ⏳

**Status:** Pending Approval
**Estimated Effort:** 3-4 hours
**Priority:** Medium (code cleanup)

**Goal:** Archive unused legacy routes and components while preserving Bank Import functionality.

**Key Changes:**
- Move legacy routes to `src/legacy/` directory (safety net)
- Remove route registrations from `src/server.js`
- Update React Router in `web/src/App.tsx`
- **Preserve:** `src/routes/import.js` (Bank Import routes)

**Success Criteria:**
- ✅ Legacy routes archived (not deleted)
- ✅ Bank Import routes fully functional
- ✅ All Epic 1 tests still passing (180+)
- ✅ No console errors

---

### Story 2.3: Bank Import Schema Migration ⏳ **PRIORITY**

**Status:** Pending Approval
**Estimated Effort:** 6-8 hours
**Priority:** Critical (unlocks productivity)

**Goal:** Update Bank Import to create domain records instead of legacy entries.

**Key Changes:**
- Update `src/controllers/ImportController.js` (confirmSuggestions method)
- Transaction confirmation creates PropertyRecord, VehicleRecord, etc. (not Entry)
- Preserve ImportSession model (no changes needed)
- Update Bank Import tests

**Success Criteria:**
- ✅ HSBC multi-line transaction parsing still works
- ✅ Recurring payment detection preserved
- ✅ Transaction confirmation creates domain records
- ✅ All Bank Import tests passing

**Critical Path:** Must complete before Story 2.4

---

### Story 2.4: Bank Import Domain Intelligence ⏳

**Status:** Pending Approval
**Estimated Effort:** 8-10 hours
**Priority:** High (user experience enhancement)

**Goal:** Add intelligent domain suggestions for transactions (e.g., energy bill → Property, car insurance → Vehicles).

**Key Changes:**
- Create `web/src/services/domainSuggestionEngine.ts` (UK provider matching)
- Add domain selection modal to `web/src/pages/BankImport.tsx`
- Pre-populate domain forms with transaction data
- Target ≥80% domain suggestion accuracy

**Success Criteria:**
- ✅ Click "Create Record" → domain suggested
- ✅ Form pre-populated with provider, amount, date
- ✅ User can override suggestion
- ✅ Transaction marked "record created" (no duplicates)
- ✅ Real-world test: 10 records created in <5 minutes

**Note:** This was originally PRD Story 1.9 (moved to Epic 2)

---

### Story 2.5: Legacy Data Archive & Safety Net ⏳

**Status:** Pending Approval
**Estimated Effort:** 4-5 hours
**Priority:** Medium (data safety)

**Goal:** Archive legacy data collections (keep in database, hidden from UI).

**Key Changes:**
- Create `src/scripts/archive-legacy-data.js` (migration script)
- Add `_archived: true` to legacy documents
- Legacy API routes return 410 Gone status
- Database backup before archival

**Success Criteria:**
- ✅ Legacy data still in MongoDB (not deleted)
- ✅ Database backup created
- ✅ Legacy API routes return 410 Gone
- ✅ README documents data access process
- ✅ Storage usage monitored (within 512MB limit)

---

## 🎯 Epic 2 Success Criteria - Acceptance Checklist

**Functional:** ⏳ **Pending Implementation**
- ⏳ Legacy navigation (Accounts/Bills/Categories) removed from UI
- ⏳ Bank Import creates domain records (not legacy entries)
- ⏳ Domain suggestions ≥80% accurate for common UK providers
- ⏳ Legacy data archived and accessible if needed

**Technical:** ⏳ **Pending Implementation**
- ⏳ All Epic 1 tests still passing (180+)
- ⏳ No console errors or broken links
- ⏳ Bank Import tests updated and passing

**User Experience:** ⏳ **Pending Implementation**
- ⏳ Navigation clear and unconfused (only domain-based)
- ⏳ Bank Import accelerates domain population (<5 minutes for 10 records)

**Documentation:** ⏳ **Pending Implementation**
- ⏳ PRD updated with Epic 2 section (version 2.0)
- ⏳ Architecture docs updated (source-tree.md)
- ⏳ CLAUDE.md updated with Epic 2 status
- ⏳ All story files created and updated

---

## 📅 Timeline & Milestones

**Total Estimated Effort:** 22-29 hours (4-6 weeks part-time at 5-7 hours/week)

**Phase 1: Planning & Approval (Week 0 - Current)**
- ✅ Correct Course workflow complete
- ✅ Sprint Change Proposal created
- ⏳ User approval (pending)
- ⏳ PRD updated with Epic 2
- ⏳ Story files created

**Phase 2: Navigation Cleanup (Week 1-2)**
- ⏳ Story 2.1: Navigation cleanup (1-2 hours)
- ⏳ Story 2.2: Legacy route removal (3-4 hours)

**Phase 3: Bank Import Migration (Week 2-4) - PRIORITY**
- ⏳ Story 2.3: Bank Import schema migration (6-8 hours)
- ⏳ Story 2.4: Bank Import domain intelligence (8-10 hours)

**Phase 4: Data Archive (Week 5)**
- ⏳ Story 2.5: Legacy data archive (4-5 hours)

**Phase 5: Validation & Completion (Week 6)**
- ⏳ End-to-end testing with real data
- ⏳ Epic 2 completion review
- ⏳ Update EPIC-2-SUMMARY.md with completion status
- ⏳ Create Epic 2 completion PR

---

## 🔗 Key Decisions & Rationale

**Decision 1: Epic 2 vs. Extension of Epic 1**
- **Decision:** Create separate Epic 2
- **Rationale:** Clean separation (Epic 1 = Build New, Epic 2 = Retire Old), risk isolation
- **Decided By:** PM Agent (John) + User (Calvin)
- **Date:** 2025-10-05

**Decision 2: Bank Import Priority**
- **Decision:** Prioritize Stories 2.3-2.4 early in Epic 2
- **Rationale:** Unlocks productivity, preserves valuable HSBC parser investment
- **Decided By:** User (Calvin) - Option A
- **Date:** 2025-10-05

**Decision 3: Legacy Data Handling**
- **Decision:** Archive legacy data (don't delete)
- **Rationale:** Safety net approach, reduces migration risk, allows reference if needed
- **Decided By:** User (Calvin) - Option B
- **Date:** 2025-10-05

**Decision 4: Story Granularity**
- **Decision:** 5 smaller stories (not 3 larger)
- **Rationale:** Granular progress tracking, matches Epic 1 learning style, better session persistence
- **Decided By:** User (Calvin) - Option A
- **Date:** 2025-10-05

---

## 📚 Reference Files

**Epic 2 Planning Documents:**
- `docs/SPRINT-CHANGE-PROPOSAL-EPIC-2.md` - Complete analysis and approval document
- `docs/stories/epic-2-legacy-system-retirement.md` - Epic overview
- `docs/stories/EPIC-2-SUMMARY.md` - This document

**Epic 1 Context:**
- `docs/stories/EPIC-1-SUMMARY.md` - Epic 1 completion summary (9/9 stories complete)
- `docs/stories/epic-1-life-domain-architecture-foundation.md` - Epic 1 overview

**PRD & Architecture:**
- `docs/prd.md` - Product requirements (needs Epic 2 section)
- `docs/architecture/source-tree.md` - Current structure (needs update)
- `CLAUDE.md` - Project instructions (needs update)

**Code Context:**
- `web/src/components/Layout.tsx` (lines 150-169) - Legacy navigation to remove
- `src/routes/import.js` - Bank Import routes to preserve
- `src/controllers/ImportController.js` - Needs schema migration
- `src/models/entry.js` - Legacy Entry model (reference for migration)

---

## 🚀 What's Next - Post Approval

### Immediate Actions (Once Approved):

1. **PM Agent Updates PRD**
   - Add Epic 2 section after Epic 1 Summary (after line 867 in prd.md)
   - Move Story 1.9 to Epic 2 as Story 2.4
   - Update PRD version to 2.0
   - Add change log entry

2. **PM Agent Creates Story Files**
   - `docs/stories/story-2.1-navigation-cleanup.md`
   - `docs/stories/story-2.2-legacy-route-removal.md`
   - `docs/stories/story-2.3-bank-import-schema-migration.md`
   - `docs/stories/story-2.4-bank-import-domain-intelligence.md`
   - `docs/stories/story-2.5-legacy-data-archive.md`

3. **PM Agent Updates Architecture Docs**
   - Update `docs/architecture/source-tree.md` (mark legacy components)
   - Update `CLAUDE.md` (Epic 1 complete, Epic 2 in progress)

4. **Dev Agent Begins Implementation**
   - Start with Story 2.1 (Navigation Cleanup) - Quick win
   - Test Epic 1 stability before proceeding to Story 2.2

---

## 🎓 Learning Notes (For Calvin)

**BMAD Methodology Applied:**
- ✅ Used `*correct-course` command to analyze gap between PRD and implementation
- ✅ Worked through change-checklist incrementally (learning mode)
- ✅ Created comprehensive Sprint Change Proposal for approval
- ✅ Documented decisions with rationale (not just "what" but "why")
- ✅ Created session persistence documents (Epic 2 Summary, tracking files)

**Key BMAD Concepts Used:**
- **Change Navigation:** Systematic response to discovered issues
- **Epic Scoping:** Clean separation of "Build New" (Epic 1) vs "Retire Old" (Epic 2)
- **Risk Assessment:** Identified risks early, planned mitigations
- **User Collaboration:** Your decisions (Option A/B) shaped Epic 2 structure
- **Documentation First:** PRD/Story files guide implementation, not afterthought

**Why This Works:**
- Clear separation of concerns (Epic 1 stable, Epic 2 builds on it)
- Granular stories allow stopping/starting across sessions
- Documentation captures context so you can resume anytime
- Test-driven approach ensures no regressions

---

## ✅ Current Status Summary

**Epic 2 Status:** 📋 **Proposed - Awaiting User Approval**

**What's Been Completed:**
- ✅ Correct Course workflow executed
- ✅ Sprint Change Proposal created
- ✅ Epic 2 tracking documents created
- ✅ Story breakdown defined (5 stories)

**What's Pending:**
- ⏳ User approval of Sprint Change Proposal
- ⏳ PRD update with Epic 2 section
- ⏳ Story file creation (5 detailed story specs)
- ⏳ Implementation of 5 stories

**Next User Action:** Review `docs/SPRINT-CHANGE-PROPOSAL-EPIC-2.md` and approve Epic 2

---

**Document Created:** 2025-10-05
**PM Agent:** John
**Status:** Ready for User Review
**Version:** 1.0 (Draft)
