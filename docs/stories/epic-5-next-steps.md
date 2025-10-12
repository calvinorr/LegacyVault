# Epic 5: Transaction Ledger - Next Steps

**Created:** 2025-10-12
**Status:** Ready for Front-End Specification
**Current Phase:** UX Design

---

## Current Situation

### What's Been Completed
1. ✅ **Old Code Cleanup** - Removed deprecated `recurringDetector` integration
   - Removed from `src/services/backgroundProcessor.js`
   - Removed "Recurring Payment Suggestions" UI from `BankImport.tsx`
   - Kept pattern detection badges (🔄 with confidence %)

2. ✅ **Database Reset** - Clean state for fresh testing
   - Cleared all 5 import sessions
   - Cleared all 39 transactions
   - Cleared all patterns

3. ✅ **Servers Running**
   - Backend: http://localhost:3000
   - Frontend: http://localhost:5173

### The Problem
**Current UI shows per-session transaction tables:**
```
Import Sessions (list of sessions)
  └─ Session 1
      └─ Transaction table (only Session 1's transactions)
  └─ Session 2
      └─ Transaction table (only Session 2's transactions)
```

**Epic 5 vision is unified transaction ledger:**
```
Unified Transaction Ledger
  └─ ALL transactions from all imports in one table
  └─ Filters: status, date range, session, search
  └─ Pattern detection badges
  └─ Import timeline showing months
```

---

## Next Action: Create Front-End Specification

**Agent:** UX Expert (Sally) - `/BMad:agents:ux-expert`
**Command:** `*create-front-end-spec`
**Output:** `docs/front-end-spec.md`

### Scope for Front-End Spec

The specification should focus on these key areas from Epic 5 (see lines 241-424 in `docs/stories/epic-5-transaction-ledger.md`):

1. **Bank Import Page Enhancement**
   - Import History Timeline (visual calendar of imported months)
   - Unified Transaction Table (all transactions, not per-session)
   - Filter Controls (status, date range, session selector, search)
   - Transaction Status Badges (✅ Created, ⏳ Pending, ❌ Ignored, 🔄 Pattern)

2. **Transaction History Page (NEW)**
   - Dedicated `/transactions` route
   - Full transaction ledger view
   - Filter Panel (left sidebar)
   - Pattern Insights Panel (right sidebar)
   - Transaction Detail Expansion (inline accordion)

3. **Import Timeline Component (NEW)**
   - Visual design: `[2024] Nov ✅ Dec ✅ [2025] Jan ✅ Feb ✅ Mar ⏳`
   - Hover tooltips showing transaction counts
   - Click to filter transactions

4. **Duplicate Detection UI**
   - Modal for duplicate statement warning
   - No "Import Anyway" option

5. **Pattern Suggestion Modal (ENHANCED)**
   - Pattern match indicator with confidence badge
   - Historical context display
   - Smart field pre-population
   - Batch creation option

### Design System Requirements
- **Aesthetic:** Swiss spa design (maintained from premium transformation)
- **Typography:** Inter font family with established weight hierarchy
- **Icons:** Lucide React icons
- **Color Palette:** Professional scheme from existing design system
- **Components:** Reuse existing Modal, Button, Table, Badge components

### Key Files to Reference
- `web/src/pages/BankImport.tsx` - Current implementation (per-session tables)
- `docs/stories/epic-5-transaction-ledger.md` - Full epic documentation (lines 241-424 for UI specs)
- Existing premium design system components

---

## After Front-End Spec is Complete

### Handoff to Development
1. **Agent:** Full Stack Developer (James) - `/BMad:agents:dev`
2. **Task:** Implement unified transaction ledger UI based on spec
3. **Stories to implement:**
   - Story 5.6: Import Timeline Visualization & Transaction History Page
   - Related UI enhancements from Stories 5.2-5.5

### Backend Prerequisites (Already Complete)
- ✅ Transaction Model exists (`src/models/Transaction.js`)
- ✅ Pattern Model exists (`src/models/Pattern.js`)
- ✅ Transaction API endpoints exist (`/api/transactions/*`)
- ✅ Pattern API endpoints exist (`/api/patterns/*`)
- ✅ Pattern detection service working (`src/services/patternDetector.js`)

---

## Important Context

### Epic 5 Stories Status
- **Story 5.1:** ✅ Foundation - Transaction Model & Migration (COMPLETED)
- **Story 5.2:** ✅ Duplicate Detection (COMPLETED)
- **Story 5.3:** ✅ Transaction Status Management (COMPLETED)
- **Story 5.4:** ✅ Pattern Detection (COMPLETED)
- **Story 5.5:** ⏳ Enhanced Pattern Suggestion Modal (IN PROGRESS - needs UI work)
- **Story 5.6:** ⏳ Import Timeline & Transaction History Page (NEXT - needs full spec)

### Key Design Decisions from Epic
1. **No "Import Anyway" option** for duplicate statements (prevent accidental duplicates)
2. **Pattern confidence thresholds:**
   - High (≥0.85): Green badge "Strong Match"
   - Medium (0.65-0.84): Yellow badge "Likely Match"
   - Low (<0.65): Gray badge "Possible Match"
3. **Status badges:**
   - ✅ Green "Record Created"
   - ⏳ Orange "Pending Review"
   - ❌ Gray "Ignored"
   - 🔄 Blue "Recurring Pattern"
4. **Pagination:** 50 transactions per page
5. **Filter state:** Persist in URL query params

---

## Session Resume Instructions

**If you return after clearing context:**

1. Read this file: `docs/stories/epic-5-next-steps.md`
2. Read Epic 5 doc: `docs/stories/epic-5-transaction-ledger.md` (focus on lines 241-424 for UI)
3. Activate UX Expert: `/BMad:agents:ux-expert`
4. Run command: `*create-front-end-spec`
5. Follow the interactive workflow in the create-doc template

**Key Context to Remember:**
- Project: LegacyLock (UK household financial vault for couples)
- Current task: Transform per-session transaction tables → unified ledger
- Design system: Swiss spa aesthetic with Inter font and Lucide icons
- Backend: Already built and working (Transaction + Pattern models exist)
- Frontend: Needs refactoring to show unified view

---

**Created by:** James (Dev Agent) & Sally (UX Expert)
**Last Updated:** 2025-10-12
**Next Agent:** Sally (UX Expert) - Ready for Front-End Spec creation
