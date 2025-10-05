# Story 2.1: Navigation Cleanup & Domain-First Experience

**Epic:** Legacy System Retirement (Epic 2)
**Story ID:** 2.1
**Estimated Effort:** 1-2 hours
**Priority:** High (user-facing confusion)
**Status:** ✅ Complete
**Dependencies:** Epic 1 (Complete ✓)
**Completed:** 2025-10-05
**Commit:** `7a8ec2c`

---

## User Story

**As a** user navigating the LegacyLock application,
**I want** a single, clear navigation structure based on life domains,
**so that** I'm not confused by two parallel navigation systems (legacy + new domains).

---

## Story Context

### Why This Story

Epic 1 successfully built the domain architecture (8 domains, 180+ tests) but didn't remove the legacy navigation. Users see:
- **Legacy nav items:** Accounts, Bills, Categories, Contacts, Documents (pre-Epic 1)
- **Domain access:** Via HomePage cards (Epic 1)
- **Result:** Confusion from dual navigation systems

Story 2.1 establishes a clean domain-first user experience by removing legacy navigation.

### Existing System Integration

**From Epic 1:**
- HomePage with domain cards (Property, Vehicles, Finance, etc.)
- Domain pages accessible via cards (e.g., `/property`, `/vehicles`)
- Layout component with top navigation

**Current Navigation (Confusing):**
```tsx
// Legacy items (remove these)
<Link to="/accounts">Accounts</Link>
<Link to="/bills">Bills</Link>
<Link to="/categories">Categories</Link>
<Link to="/contacts">Contacts</Link>
<Link to="/documents">Documents</Link>

// New items (keep these)
<Link to="/">Home</Link>
<Link to="/renewals">Renewals</Link>
<Link to="/emergency">Emergency</Link>
<Link to="/settings">Settings</Link>
```

**Technology Stack:**
- React Router for navigation
- Layout.tsx component for top navigation
- Lucide React icons for navigation items

### What This Story Delivers

**Updated Navigation:**
- **Remove:** Accounts, Bills, Categories, Contacts, Documents (5 legacy items)
- **Keep:** Home, Renewals, Emergency, Settings (4 domain-first items)
- **Access Domains:** Via HomePage cards (already built in Epic 1)

**Code Changes:**
- `web/src/components/Layout.tsx` - Remove lines 150-169 (legacy nav items)
- Clean up unused icon imports (Wallet, Receipt, FolderTree, Users, FileText)

---

## Acceptance Criteria

### Functional Requirements

**AC1: Legacy Navigation Removed**
- ✅ No "Accounts" navigation item visible
- ✅ No "Bills" navigation item visible
- ✅ No "Categories" navigation item visible
- ✅ No "Contacts" navigation item visible
- ✅ No "Documents" navigation item visible

**AC2: Domain-First Navigation Present**
- ✅ "Home" navigation item visible and functional
- ✅ "Renewals" navigation item visible and functional
- ✅ "Emergency" navigation item visible and functional
- ✅ "Settings" navigation item visible and functional

**AC3: Domain Access via HomePage**
- ✅ HomePage displays 8 domain cards (Property, Vehicles, Finance, Employment, Government, Insurance, Legal, Services)
- ✅ Clicking domain card navigates to domain page (e.g., `/property`)
- ✅ All Epic 1 domain pages still accessible

**AC4: Mobile Responsiveness**
- ✅ Navigation responsive on mobile devices
- ✅ No horizontal overflow
- ✅ Touch targets appropriately sized

### Technical Requirements

**AC5: Code Quality**
- ✅ No console errors after navigation removal
- ✅ No broken links (404 errors)
- ✅ Unused imports removed (Wallet, Receipt, FolderTree, Users, FileText)
- ✅ TypeScript types correct

**AC6: Build & Deploy**
- ✅ `npm run build` succeeds
- ✅ No ESLint warnings related to navigation changes
- ✅ Production bundle size not increased

---

## Implementation Details

### Files Modified

**web/src/components/Layout.tsx**
```tsx
// REMOVED (lines 150-169):
// - 5 legacy navigation Link components
// - 5 unused icon imports

// KEPT:
<div style={navLinksStyle}>
  <Link to="/" style={navLinkStyle(location.pathname === "/")}>
    <LayoutDashboard size={18} strokeWidth={1.5} />
    Home
  </Link>
  <Link to="/renewals" style={navLinkStyle(location.pathname === "/renewals")}>
    <Calendar size={18} strokeWidth={1.5} />
    Renewals
  </Link>
  <Link to="/emergency" style={{ ...navLinkStyle(location.pathname === "/emergency"), backgroundColor: "#fef2f2", color: "#dc2626" }}>
    <AlertCircle size={18} strokeWidth={1.5} />
    Emergency
  </Link>
  <Link to="/settings" style={navLinkStyle(location.pathname === "/settings")}>
    <Settings size={18} strokeWidth={1.5} />
    Settings
  </Link>
</div>
```

### Navigation Flow

**User Journey (After Story 2.1):**
1. User lands on HomePage (/)
2. Sees 8 life domain cards (Property, Vehicles, Finance, etc.)
3. Clicks "Property" card → Navigates to /property
4. Sees top nav: Home, Renewals, Emergency, Settings
5. Clicks "Home" → Returns to HomePage
6. **No confusion from legacy nav items ✅**

---

## Testing Completed

### Manual Testing
- ✅ Verified legacy nav items removed (visual inspection)
- ✅ Tested all 4 remaining nav items functional
- ✅ Tested all 8 domain cards navigate correctly
- ✅ Tested mobile responsiveness
- ✅ No console errors in browser

### Build Verification
- ✅ `npm run build` successful
- ✅ No TypeScript errors
- ✅ No ESLint warnings

---

## Success Metrics

### Before Story 2.1:
- **Navigation items:** 9 (5 legacy + 4 new)
- **User confusion:** High (two parallel systems)
- **Domain access:** Via HomePage cards (hidden behind legacy nav)

### After Story 2.1:
- **Navigation items:** 4 (Home, Renewals, Emergency, Settings)
- **User confusion:** None (single coherent structure)
- **Domain access:** Clear via HomePage cards (primary workflow)

---

## Risks Mitigated

**Risk:** Users lose access to legacy functionality
- **Mitigation:** Story 2.2 will archive (not delete) legacy routes
- **Mitigation:** HomePage cards provide access to all Epic 1 functionality

**Risk:** Breaking changes to navigation
- **Mitigation:** Only removed UI elements, routes preserved until Story 2.2
- **Mitigation:** Build verification ensures no runtime errors

---

## Follow-up Stories

- **Story 2.2:** Remove legacy routes from backend (archive code)
- **Story 2.3:** Migrate Bank Import to domain records
- **Story 2.4:** Add domain intelligence to Bank Import
- **Story 2.5:** Archive legacy data collections

---

## Documentation

**Updated Files:**
- `docs/stories/EPIC-2-SUMMARY.md` - Marked Story 2.1 complete
- Git commit message - Detailed changes and reasoning

**Reference:**
- Epic 1 HomePage: `web/src/pages/HomePage.tsx`
- Navigation component: `web/src/components/Layout.tsx`

---

**Story Completed:** 2025-10-05
**Time Taken:** ~30 minutes
**Developer:** Dev Agent (James)
**Status:** ✅ Delivered - Clean domain-first navigation established
