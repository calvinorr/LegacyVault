# UI Patterns & Component Guidelines

## Modal Form Pattern - "Swiss Spa Modal"

This document defines the standard pattern for all modal forms in the LegacyLock application.

### Overview

All modal forms MUST follow a 3-section flexbox layout to ensure:
- Fixed, non-scrolling header (stays visible)
- Scrollable content area (only middle scrolls)
- Fixed, non-scrolling footer with action buttons (stays visible)

This pattern is critical for UX consistency and browser compatibility across Chrome, Firefox, and Safari.

### Standard Structure

```typescript
// Outer Modal Container
<div style={{
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
}}>
  {/* Modal */}
  <div style={{
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column'
  }}>
    {/* SECTION 1: Fixed Header */}
    <div style={{
      flexShrink: 0,
      padding: '20px 24px',
      borderBottom: '1px solid #e2e8f0'
    }}>
      <h2>Title</h2>
      <button onClick={onClose}>Close</button>
    </div>

    {/* SECTION 2: Scrollable Content */}
    <div style={{
      flex: 1,
      overflowY: 'auto',
      minHeight: 0,  // CRITICAL: Firefox requires this
      padding: '24px'
    }}>
      <form>
        {/* All form fields go here */}
      </form>
    </div>

    {/* SECTION 3: Fixed Footer */}
    <div style={{
      flexShrink: 0,
      padding: '20px 24px',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end'
    }}>
      <button onClick={onClose}>Cancel</button>
      <button type="submit">Save</button>
    </div>
  </div>
</div>
```

### Key CSS Properties Explained

| Property | Purpose | Notes |
|----------|---------|-------|
| `display: 'flex'` | Enables flexbox layout | Required on container and children |
| `flexDirection: 'column'` | Stacks sections vertically | Required on main modal |
| `flex: 1` | Takes remaining space | Only on middle content section |
| `flexShrink: 0` | Prevents compression | REQUIRED on header/footer |
| `minHeight: 0` | Allows flex child to shrink | CRITICAL for Firefox |
| `overflowY: 'auto'` | Enables vertical scrolling | ONLY on content section |
| `maxHeight: '90vh'` | Limits modal height | Prevents exceeding viewport |

### Browser-Specific Notes

#### Firefox
**Problem**: Flex children don't shrink below content size without `minHeight: 0`
**Solution**: Add `minHeight: 0` to:
- Form wrapper (`display: flex` child)
- Content wrapper (overflow container)

**Example**:
```typescript
// Firefox will break without these two lines:
<form style={{ flex: 1, minHeight: 0 }}>
  <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
    {/* content */}
  </div>
</form>
```

#### Safari
**Problem**: Flex children don't respect `flexShrink: 0` without explicit declaration
**Solution**: Always add `flexShrink: 0` to fixed sections

**Example**:
```typescript
// Always include flexShrink: 0 on header/footer
<div style={{ flexShrink: 0 }}>Header</div>
<div style={{ flexShrink: 0 }}>Footer</div>
```

#### Chrome
**Behavior**: Most forgiving browser; includes fixes above anyway for consistency

### Implementation Checklist

- [ ] Container uses `display: flex` and `flexDirection: column`
- [ ] Container has `maxHeight: '90vh'` constraint
- [ ] Header has `flexShrink: 0`
- [ ] Content section has `flex: 1`, `overflowY: 'auto'`, `minHeight: 0`
- [ ] Content has proper padding (typically `24px`)
- [ ] Footer has `flexShrink: 0`
- [ ] Footer has `borderTop` for visual separation
- [ ] No `overflow: auto` or `overflow: scroll` on main container
- [ ] Form inside content, NOT inside footer

### Testing Checklist

#### Desktop (1440px viewport)
- [ ] Modal loads without content overflow
- [ ] Scrollbar appears only in middle section
- [ ] Header stays visible when scrolling
- [ ] Footer stays visible when scrolling
- [ ] Submit button always accessible (no need to scroll to find)

#### Long Forms (30+ fields)
- [ ] AddBillModal with all renewal fields visible
- [ ] Renewal section collapses and expands
- [ ] No scroll jumps when toggling sections
- [ ] Performance remains smooth

#### Browser Coverage
- [ ] Chrome: All scroll behavior works
- [ ] Firefox: Header/footer don't move, content scrolls only
- [ ] Safari: Content scrolls smoothly, buttons always visible

#### Mobile/Tablet
- [ ] Modal fits within viewport (90vh max)
- [ ] Scrolling is smooth and responsive
- [ ] Touch gestures work correctly

### Components Using This Pattern

#### Current Implementation
1. **ChildRecordForm** (`web/src/components/child-records/ChildRecordForm.tsx`)
   - 6 record type sections
   - Essential/Additional field grouping
   - Attachment upload support

2. **AddBillModal** (`web/src/components/AddBillModal.tsx`)
   - 40+ form fields
   - Collapsible renewal tracking section
   - Large form example

3. **ParentEntityForm** (`web/src/components/parent-entities/ParentEntityForm.tsx`)
   - Multi-domain support (Vehicle, Property, Employment, Service, Finance)
   - Image upload
   - Notes section

#### Future Components
All new modal forms should follow this pattern. Search codebase for `Modal` or modal-like interfaces.

### Performance Considerations

✅ **Pure CSS Solution**: No JavaScript scroll listeners needed
✅ **GPU Acceleration**: `overflowY: auto` is GPU-accelerated
✅ **No Layout Thrashing**: Flex layout calculated once
✅ **Mobile Friendly**: Touch scrolling works naturally
✅ **Accessibility**: Keyboard navigation unaffected

### Anti-Patterns to Avoid

❌ **DON'T**: Put `overflow: auto` on main modal container
```typescript
// WRONG - entire modal scrolls
<div style={{ overflow: 'auto' }}>
  <header />
  <form />
  <footer />
</div>
```

❌ **DON'T**: Forget `minHeight: 0` in Firefox
```typescript
// WRONG - Firefox won't scroll properly
<div style={{ flex: 1, overflowY: 'auto' }}>
  {/* Content */}
</div>
```

❌ **DON'T**: Put footer inside form
```typescript
// WRONG - buttons scroll away when form is long
<form>
  {/* 40 fields */}
  <footer>
    <button>Submit</button>
  </footer>
</form>
```

✅ **DO**: Follow the 3-section pattern exactly

### Quick Reference

**For New Forms: Copy This Template**

```typescript
export const ModalForm = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: '12px'
      }}>
        {/* Header - Fixed */}
        <div style={{ flexShrink: 0, padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <h2>Your Modal Title</h2>
        </div>

        {/* Content - Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '24px' }}>
          <form>
            {/* Your fields here */}
          </form>
        </div>

        {/* Footer - Fixed */}
        <div style={{ flexShrink: 0, padding: '20px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onClose}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </div>
    </div>
  );
};
```

### References

- **MDN Flexbox**: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout
- **Firefox Flex Bug**: https://bugzilla.mozilla.org/show_bug.cgi?id=1241701
- **Safari Flex Behavior**: https://webkit.org/blog/3455/new-web-features-in-safari-6-1/
- **Can I Use Flexbox**: https://caniuse.com/flexbox

---

**Last Updated**: October 21, 2025
**Related Story**: Epic 6, Story 1.10 - Fix Form Scrolling and Layout Issues
