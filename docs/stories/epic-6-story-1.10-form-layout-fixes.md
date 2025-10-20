# Story 1.10: Fix Form Scrolling and Layout Issues

**Epic**: 6 - Hierarchical Domain Model Refactor
**Story**: 1.10
**Status**: Draft
**Assigned**: TBD
**Estimated**: 2-3 hours
**Actual**: TBD
**Priority**: P1 - High (UX Quality)
**Depends On**: Story 1.6 (Child Record Frontend)

---

## Story

**As a** user,
**I want** all modal forms to fit within my viewport and scroll properly,
**so that** I can complete forms without content overflowing or losing context (headers/footers).

---

## Context

During development of Epic 6 features, multiple forms were created with inconsistent scroll behavior:

**Current Problems:**
1. **ChildRecordForm**: Entire modal scrolls (header/footer disappear)
2. **AddBillModal**: Massive form (40+ fields) with no scroll container
3. **Legacy Domain Forms**: 5 forms without max-height constraints
4. **ParentEntityForm**: Missing browser-specific flex fixes

**Root Cause**: No standardized modal pattern documented

**Impact**:
- Users lose context when scrolling
- Submit buttons scroll out of view
- Forms overflow viewport on desktop (1440px)
- Inconsistent UX across application

**Technical Debt**: Forms built incrementally without scroll pattern enforcement

---

## Acceptance Criteria

### Modal Structure
- [ ] AC1: All modal forms constrained to `maxHeight: 90vh`
- [ ] AC2: Modal headers remain fixed (visible) during content scroll
- [ ] AC3: Modal footers (Cancel/Submit buttons) remain fixed (visible) during content scroll
- [ ] AC4: Only form content area scrolls independently
- [ ] AC5: Scroll behavior consistent across Chrome, Firefox, Safari

### Specific Forms Fixed
- [ ] AC6: ChildRecordForm uses 3-section layout (Header/Scrollable Content/Footer)
- [ ] AC7: AddBillModal uses 3-section layout with collapsible renewal section
- [ ] AC8: ParentEntityForm includes Firefox flex fixes (`minHeight: 0`, `flexShrink: 0`)
- [ ] AC9: All 5 legacy domain forms audited and fixed if needed:
  - PropertyRecordForm
  - VehicleRecordForm
  - FinanceRecordForm
  - EmploymentRecordForm
  - ServicesRecordForm

### Visual Indicators
- [ ] AC10: Scrollable areas show visual scroll indicators (scrollbar visible)
- [ ] AC11: Scroll position resets to top when modal opens

---

## Integration Verification

- [ ] IV1: Test all forms at 1440px viewport (desktop target)
- [ ] IV2: Verify forms with 5+ fields scroll properly
- [ ] IV3: Verify forms with 30+ fields (AddBillModal) scroll properly
- [ ] IV4: Test rapid open/close of modals (no scroll state leaks)
- [ ] IV5: Test keyboard navigation (Tab, Enter, Esc)

---

## Tasks

### Task 1: Fix ChildRecordForm Critical Scroll Issue
**File**: `web/src/components/child-records/ChildRecordForm.tsx`

**Current Structure (BROKEN):**
```typescript
<div style={{ maxHeight: '90vh', overflow: 'auto' }}>
  <header>...</header>
  <form>...</form>
</div>
```

**Required Changes:**
- [ ] Wrap modal in flexbox container
- [ ] Set header `flexShrink: 0` to prevent compression
- [ ] Set form wrapper `flex: 1, minHeight: 0` for proper sizing
- [ ] Move `overflow: 'auto'` to form content div only
- [ ] Set footer `flexShrink: 0` to prevent compression

**Target Structure:**
```typescript
<div style={{
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column'
}}>
  <header style={{ flexShrink: 0 }}>...</header>
  <form style={{
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0
  }}>
    <div style={{
      flex: 1,
      overflowY: 'auto',
      minHeight: 0
    }}>
      {/* Content scrolls here */}
    </div>
    <footer style={{ flexShrink: 0 }}>...</footer>
  </form>
</div>
```

**Lines to Change**: ~20-30
**Testing**: Open ChildRecordForm → Scroll content → Verify header/footer stay visible

---

### Task 2: Fix AddBillModal Massive Form Overflow
**File**: `web/src/components/AddBillModal.tsx`

**Current Issues:**
- 40+ fields with no scroll container
- renewalInfo section (16 fields) always expanded
- No maxHeight constraint found

**Required Changes:**
- [ ] Add `maxHeight: 90vh` to modal container
- [ ] Implement 3-section flexbox layout
- [ ] Make renewalInfo section collapsible (default: collapsed)
- [ ] Move `overflow: 'auto'` to content wrapper
- [ ] Add section headers: "Basic Info", "Renewal Tracking" (collapsible)

**Additional Enhancement:**
- [ ] Consider splitting into tabs: "Details" | "Renewal" | "Advanced"
- [ ] Add scroll-to-section navigation if tabs not used

**Lines to Change**: ~40-50
**Testing**: Open AddBillModal → Expand renewal section → Verify scrolling

---

### Task 3: Audit and Fix Legacy Domain Forms
**Files**:
1. `web/src/components/property/PropertyRecordForm.tsx`
2. `web/src/components/vehicles/VehicleRecordForm.tsx`
3. `web/src/components/finance/FinanceRecordForm.tsx`
4. `web/src/components/employment/EmploymentRecordForm.tsx`
5. `web/src/components/services/ServicesRecordForm.tsx`

**Audit Checklist (per form):**
- [ ] Check if `maxHeight: 90vh` exists
- [ ] Check if header/footer have `flexShrink: 0`
- [ ] Check if content uses `overflow: 'auto'`
- [ ] Count total fields (if >10, scroll is required)

**Fix Pattern**: Apply same 3-section structure as Task 1

**Lines to Change**: ~20-30 per form (100-150 total)
**Testing**: Open each form → Add max fields → Verify scrolling

---

### Task 4: Enhance ParentEntityForm Browser Compatibility
**File**: `web/src/components/parent-entities/ParentEntityForm.tsx:272`

**Current Status**: ⚠️ Partial (works Chrome, may break Firefox/Safari)

**Required Additions:**
```typescript
// Header section
<div style={{
  padding: '20px 24px',
  borderBottom: '1px solid #e2e8f0',
  flexShrink: 0  // ADD THIS
}}>

// Form wrapper
<form style={{
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0  // ADD THIS (Firefox fix)
}}>

// Content section
<div style={{
  padding: '24px',
  overflowY: 'auto',
  flex: 1,
  minHeight: 0  // ADD THIS (Firefox fix)
}}>

// Footer section
<div style={{
  padding: '20px 24px',
  borderTop: '1px solid #e2e8f0',
  flexShrink: 0,  // ADD THIS
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end'
}}>
```

**Lines to Change**: ~6-8
**Testing**: Test on Firefox and Safari specifically

---

### Task 5: Document Standard Modal Pattern
**File**: `docs/architecture/ui-patterns.md` (create if not exists)

**Content to Add:**

```markdown
## Modal Form Pattern - "Swiss Spa Modal"

### Standard Structure

All modal forms MUST follow this 3-section layout:

1. **Fixed Header** (never scrolls)
2. **Scrollable Content** (only this scrolls)
3. **Fixed Footer** (never scrolls)

### Implementation Template

[Include the full code template from audit report]

### Key CSS Properties

- Container: `maxHeight: 90vh`, `display: flex`, `flexDirection: column`
- Header: `flexShrink: 0`
- Form: `flex: 1`, `minHeight: 0`, `display: flex`, `flexDirection: column`
- Content: `flex: 1`, `overflowY: auto`, `minHeight: 0`
- Footer: `flexShrink: 0`

### Browser-Specific Notes

- **Firefox**: Requires `minHeight: 0` on flex children
- **Safari**: Requires explicit `flexShrink: 0` on fixed sections
- **Chrome**: Works without fixes but include for consistency

### Testing Checklist

- [ ] Form fits within 90vh at 1440px
- [ ] Header visible during scroll
- [ ] Footer visible during scroll
- [ ] Content scrolls smoothly
- [ ] Tested on Chrome, Firefox, Safari
```

**Lines to Add**: ~80-100
**Testing**: N/A (documentation only)

---

## Testing

### Manual Test Scenarios

**Test 1: ChildRecordForm Scrolling**
1. Open Vehicles → Select vehicle → Click "Add Record"
2. Select "Insurance" record type
3. Fill all fields (name, provider, phone, email, policy, renewal, amount, frequency, notes)
4. **Expected**: Header stays visible, footer stays visible, middle scrolls

**Test 2: AddBillModal Large Form**
1. Open Bills → Click "Add Bill"
2. Expand "Renewal Tracking" section
3. Fill all 40+ fields
4. Scroll to bottom
5. **Expected**: Can see submit button without scrolling modal

**Test 3: ParentEntityForm Long Form**
1. Open Finance → Click "Add Account"
2. Fill all Finance fields (institution, type, account, sort code, holder, date)
3. Upload image
4. Add notes (300+ characters)
5. **Expected**: Content scrolls, header/footer fixed

**Test 4: Legacy Forms Audit**
1. Open each domain: Property, Vehicles (legacy), Finance (legacy), Employment, Services
2. Open "Add [Domain]" form
3. **Expected**: All forms fit within viewport

### Browser Testing Matrix

| Form | Chrome | Firefox | Safari |
|------|--------|---------|--------|
| ChildRecordForm | ✅ | ✅ | ✅ |
| AddBillModal | ✅ | ✅ | ✅ |
| ParentEntityForm | ✅ | ✅ | ✅ |
| PropertyRecordForm | ✅ | ✅ | ✅ |
| VehicleRecordForm | ✅ | ✅ | ✅ |

### Automated Tests (Optional - Future)

```typescript
describe('Modal Scroll Behavior', () => {
  it('should keep header visible during content scroll', () => {
    // Test implementation
  });

  it('should keep footer visible during content scroll', () => {
    // Test implementation
  });
});
```

---

## Dev Notes

### Why This Pattern?

**Problem**: Inline styles with inconsistent patterns
**Solution**: Documented pattern + enforcement in code review

**Why Not a Component?**
- Each form has unique header/footer content
- Inline styles already used throughout app
- Pattern is simple enough to copy/paste
- Component would add unnecessary abstraction

**Future**: If we add 10+ more forms, consider extracting `<FormModal>` component

### CSS Flex Gotchas

1. **Firefox Flex Bug**: Without `minHeight: 0`, flex children don't shrink
2. **Safari Flex**: Without `flexShrink: 0`, fixed sections compress
3. **Scroll Container**: Must be on middle div, NOT outer container

### Performance Notes

- Scroll performance is excellent (GPU-accelerated)
- No JavaScript scroll listeners needed
- Pure CSS solution

---

## Definition of Done

- [ ] All 3 critical issues fixed (ChildRecordForm, AddBillModal, Legacy forms)
- [ ] ParentEntityForm enhanced with browser fixes
- [ ] UI patterns documented in `docs/architecture/ui-patterns.md`
- [ ] Manual testing completed on Chrome, Firefox, Safari
- [ ] All forms fit within 90vh at 1440px
- [ ] Header/footer stay visible during scroll
- [ ] Code committed with descriptive message
- [ ] Story status updated to "Done"

---

## Dev Agent Record

### Agent Model Used
- TBD

### Debug Log References
- TBD

### Completion Notes
- TBD

### File List
**Modified:**
- [ ] `web/src/components/child-records/ChildRecordForm.tsx`
- [ ] `web/src/components/AddBillModal.tsx`
- [ ] `web/src/components/parent-entities/ParentEntityForm.tsx`
- [ ] `web/src/components/property/PropertyRecordForm.tsx`
- [ ] `web/src/components/vehicles/VehicleRecordForm.tsx`
- [ ] `web/src/components/finance/FinanceRecordForm.tsx`
- [ ] `web/src/components/employment/EmploymentRecordForm.tsx`
- [ ] `web/src/components/services/ServicesRecordForm.tsx`

**Created:**
- [ ] `docs/architecture/ui-patterns.md`

### Change Log
- TBD

---

## References

**Audit Report**: See Winston's UI Form Audit (October 20, 2025)
**Pattern Source**: "Swiss Spa Modal" - 3-section flexbox layout
**Browser Compatibility**: https://caniuse.com/flexbox
**Related Stories**: Story 1.6 (Child Record Frontend), Story 1.5 (Parent Entity Frontend)
