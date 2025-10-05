# Epic 2: Legacy System Retirement & Bank Import Migration

**Created:** 2025-10-05
**Status:** 📋 Proposed - Awaiting User Approval
**PM Agent:** John
**Dev Agent:** James (assigned upon approval)

---

## Epic Overview

**Goal:** Remove legacy Bills/Accounts/Categories system, migrate Bank Import functionality to domain architecture, and establish clean domain-first user experience.

**Why Epic 2 Exists:** Epic 1 successfully built the domain architecture foundation but didn't retire the old system. Users currently see two parallel navigation systems (legacy + domains), creating confusion. This epic completes the migration vision from the PRD.

**Integration Requirements:**
- Preserve valuable Bank Import functionality (HSBC parser, recurring payment detection)
- Keep legacy data in database as safety net (Option B: archive, don't delete)
- Prioritize Bank Import migration early (Option A: unlock productivity)
- Maintain Epic 1 stability (180+ tests must still pass)

---

## Success Criteria

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

---

## Stories (5 Total)

### Story 2.1: Navigation Cleanup & Domain-First Experience ⏳

**Status:** Pending
**Estimated Effort:** 1-2 hours
**File:** `story-2.1-navigation-cleanup.md` (to be created upon approval)

**Goal:** Remove legacy Accounts/Bills/Categories navigation items, establish clean domain-first navigation.

**Key Deliverables:**
- Updated Layout.tsx with domain-only navigation
- No broken links or console errors
- Mobile responsive navigation maintained

---

### Story 2.2: Legacy Route & Component Removal ⏳

**Status:** Pending
**Estimated Effort:** 3-4 hours
**File:** `story-2.2-legacy-route-removal.md` (to be created upon approval)

**Goal:** Archive unused legacy routes and components while preserving Bank Import functionality.

**Key Deliverables:**
- Legacy routes moved to `src/legacy/` directory (safety net)
- React Router updated to remove legacy page routes
- Bank Import routes fully functional
- All Epic 1 tests still passing

---

### Story 2.3: Bank Import Schema Migration ⏳ PRIORITY

**Status:** Pending
**Estimated Effort:** 6-8 hours
**File:** `story-2.3-bank-import-schema-migration.md` (to be created upon approval)

**Goal:** Update Bank Import to create domain records instead of legacy entries.

**Key Deliverables:**
- ImportController.js creates domain records (PropertyRecord, VehicleRecord, etc.)
- HSBC multi-line transaction parsing preserved
- Recurring payment detection functional
- All Bank Import tests passing

**Critical Path:** Must complete before Story 2.4

---

### Story 2.4: Bank Import Domain Intelligence ⏳

**Status:** Pending
**Estimated Effort:** 8-10 hours
**File:** `story-2.4-bank-import-domain-intelligence.md` (to be created upon approval)

**Goal:** Add intelligent domain suggestions for transactions (energy bill → Property, car insurance → Vehicles).

**Key Deliverables:**
- Domain suggestion engine with UK provider matching
- Domain selection modal in BankImport.tsx
- Form pre-population with transaction data
- ≥80% domain suggestion accuracy

**Note:** This was originally PRD Story 1.9 (moved to Epic 2)

---

### Story 2.5: Legacy Data Archive & Safety Net ⏳

**Status:** Pending
**Estimated Effort:** 4-5 hours
**File:** `story-2.5-legacy-data-archive.md` (to be created upon approval)

**Goal:** Archive legacy data collections (keep in database, hidden from UI).

**Key Deliverables:**
- Migration script to add `_archived: true` to legacy documents
- Legacy API routes return 410 Gone status
- Database backup created before archival
- README documentation for accessing archived data

---

## Timeline & Milestones

**Total Estimated Effort:** 22-29 hours (4-6 weeks part-time at 5-7 hours/week)

**Phase 1: Navigation Cleanup (Week 1-2)**
- Story 2.1: Navigation cleanup
- Story 2.2: Legacy route removal

**Phase 2: Bank Import Migration (Week 2-4) - PRIORITY**
- Story 2.3: Bank Import schema migration
- Story 2.4: Bank Import domain intelligence

**Phase 3: Data Archive (Week 5)**
- Story 2.5: Legacy data archive

**Phase 4: Validation (Week 6)**
- End-to-end testing
- Epic 2 completion review

---

## Dependencies & Prerequisites

**Prerequisites:**
- ✅ Epic 1 complete (9/9 stories delivered)
- ✅ Domain architecture stable (8 domains functional)
- ✅ Epic 1 tests passing (180+)
- ✅ User approval of Sprint Change Proposal

**External Dependencies:**
- MongoDB Atlas free tier (512MB limit - monitor during archive)
- Bank Import functionality (HSBC parser must remain working)

**Story Dependencies:**
- Story 2.3 must complete before Story 2.4 (Bank Import schema before intelligence)
- Story 2.5 can run in parallel with Story 2.4 (independent)

---

## Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Bank Import breaks | Medium | High | Test with real HSBC statements, preserve ImportSession model, incremental changes |
| Legacy data deleted | Low | Critical | Archive (don't delete), backup before migration, dry-run mode |
| Domain suggestions inaccurate | Medium | Medium | Start with common UK providers, iterate based on usage, manual override |
| Epic 1 tests fail | Low | Medium | Run full test suite after each story |

---

## Progress Tracking

**Overall Progress:** 0/5 stories complete (0%)

### Completed Stories: 0/5
(None yet - awaiting approval)

### In Progress: 0/5
(None yet)

### Pending: 5/5
- Story 2.1: Navigation Cleanup
- Story 2.2: Legacy Route Removal
- Story 2.3: Bank Import Schema Migration
- Story 2.4: Bank Import Domain Intelligence
- Story 2.5: Legacy Data Archive

---

## Key Decisions

**Decision Log:**

| Date | Decision | Rationale | Decided By |
|------|----------|-----------|------------|
| 2025-10-05 | Epic 2 created (not extension of Epic 1) | Clean separation: Epic 1 = Build New, Epic 2 = Retire Old | PM Agent (John) + User (Calvin) |
| 2025-10-05 | Bank Import priority (Stories 2.3-2.4 early) | Unlocks productivity, valuable HSBC parser preserved | User (Calvin) - Option A |
| 2025-10-05 | Archive legacy data (don't delete) | Safety net approach reduces migration risk | User (Calvin) - Option B |
| 2025-10-05 | 5 smaller stories (not 3 larger) | Granular progress tracking, matches Epic 1 learning style | User (Calvin) - Option A |

---

## Reference Documents

**Sprint Change Proposal:**
- `docs/SPRINT-CHANGE-PROPOSAL-EPIC-2.md` - Complete analysis and approval document

**Related PRD Sections:**
- `docs/prd.md` (lines 818-846) - Original Story 1.9 (Bank Import Enhancement) moved to Epic 2

**Epic 1 Context:**
- `docs/stories/EPIC-1-SUMMARY.md` - Epic 1 completion summary
- `docs/stories/epic-1-life-domain-architecture-foundation.md` - Epic 1 overview

**Architecture:**
- `docs/architecture/source-tree.md` - Current structure (needs update for Epic 2)
- `CLAUDE.md` - Project instructions (needs update for Epic 2)

---

## Notes for Session Persistence

**If you're resuming after a session break:**

1. **Where We Are:** Epic 2 proposed, awaiting user approval
2. **What's Been Done:** Correct Course workflow complete, Sprint Change Proposal created
3. **What's Next:** User approval → PM Agent updates PRD → Create story files → Dev Agent begins Story 2.1
4. **Key Context:** Legacy navigation still visible, Bank Import writes to old schema, need to retire old system
5. **User Preferences:** Option A (Bank Import priority), Option B (archive legacy data), Option A (5 small stories)

**Key Files to Reference:**
- `docs/SPRINT-CHANGE-PROPOSAL-EPIC-2.md` - Full Epic 2 specification
- `docs/stories/EPIC-1-SUMMARY.md` - Context on what Epic 1 delivered
- `web/src/components/Layout.tsx` - Shows current legacy navigation (lines 150-169)

---

**Epic Status:** 📋 Awaiting User Approval
**Next Action:** User (Calvin) reviews Sprint Change Proposal and approves Epic 2
**Created By:** PM Agent (John)
**Date:** 2025-10-05
