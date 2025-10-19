# Story 1.6: Child Record Frontend Components (Continuity-Focused)

**Epic**: 6 - Hierarchical Domain Model Refactor
**Story**: 1.6
**Status**: Draft
**Assigned**: James (Dev Agent)
**Estimated**: 10 hours
**Actual**: TBD
**Priority**: P0 - Blocking
**Depends On**: Story 1.3 (Child Record API), Story 1.4 (Admin Config), Story 1.5 (Parent Frontend)

---

## Story

**As a** user,
**I want** to view and manage child records under each parent entity with emphasis on contact info and renewal dates,
**so that** I can ensure my household information is accessible for continuity planning.

---

## Context

This story creates the frontend interface for viewing and managing child records attached to parent entities. The UI emphasizes **continuity planning** by prioritizing:

- **Contact information** (phone, email, account numbers, policy numbers)
- **Renewal dates** (for proactive management)
- **Service history** (provider contacts and next service due)

Financial fields (amounts, frequencies) are included but de-emphasized as secondary information. The goal is to help a surviving partner or executor quickly find critical contact details and renewal deadlines.

**6 Record Types**: Contact, ServiceHistory, Finance, Insurance, Government, Pension

---

## Acceptance Criteria

- [ ] AC1: `ParentEntityDetail` component displays parent entity header with child records below
- [ ] AC2: Child records grouped by record type (Contact, Service History, Finance, Insurance, Government, Pension) with collapsible sections
- [ ] AC3: Each child record card shows: name, contact info (phone/email), renewal date, provider
- [ ] AC4: Contact info and renewal dates displayed prominently (larger font, highlighted)
- [ ] AC5: "Add Record" button opens `ChildRecordForm` modal with record type selector
- [ ] AC6: `ChildRecordForm` prioritizes continuity fields: Contact Name, Phone, Email, Account Number, Policy Number, Renewal Date
- [ ] AC7: Financial fields (amount, frequency) are optional and de-emphasized
- [ ] AC8: Edit/delete buttons on each child record card
- [ ] AC9: Child record count badge on each record type section header
- [ ] AC10: Empty state message when no child records exist for a record type

---

## Integration Verification

- [ ] IV1: Parent context - Verify child record forms correctly associate with parent entity
- [ ] IV2: Record type filtering - Test that only configured record types appear in dropdown
- [ ] IV3: Attachment upload - Ensure existing attachment upload system works for child records

---

## Tasks

### Task 1: Create Parent Entity Detail Page
- [ ] Create `web/src/pages/VehicleDetail.tsx` (uses ParentEntityDetail with domain="vehicles")
- [ ] Create `web/src/pages/PropertyDetail.tsx` (uses ParentEntityDetail with domain="properties")
- [ ] Create `web/src/pages/EmploymentDetail.tsx` (uses ParentEntityDetail with domain="employments")
- [ ] Create `web/src/pages/ServiceDetail.tsx` (uses ParentEntityDetail with domain="services")
- [ ] Add route params: `/:domain/:id`
- [ ] Fetch parent entity with populated child records
- [ ] Register routes in React Router

### Task 2: Create Parent Entity Detail Component
- [ ] Create `web/src/components/parent-entities/ParentEntityDetail.tsx`
- [ ] Display parent entity header section:
  - Name with domain icon
  - Domain-specific key fields (registration, address, employer, business name)
  - Last updated timestamp
  - Edit/Delete action buttons
- [ ] Add breadcrumb navigation (Domain List → Entity Detail)
- [ ] Add "Back to [Vehicles/Properties/etc.]" link
- [ ] Show total child record count badge
- [ ] Display ChildRecordList component below header
- [ ] Style with Swiss spa aesthetic

### Task 3: Create Child Record List Component
- [ ] Create `web/src/components/child-records/ChildRecordList.tsx`
- [ ] Group child records by recordType (Contact, ServiceHistory, Finance, Insurance, Government, Pension)
- [ ] Display each group as collapsible section with header
- [ ] Section header shows: Record type name, Icon, Count badge, "Add" button
- [ ] Implement expand/collapse functionality (default: all expanded)
- [ ] Sort records within each group by renewalDate (ascending) then createdAt (descending)
- [ ] Show empty state when no records in group: "No [record type] records yet. Add one to get started."
- [ ] Add "Add Record" floating action button (bottom-right)

### Task 4: Create Child Record Card Component
- [ ] Create `web/src/components/child-records/ChildRecordCard.tsx`
- [ ] Display record name as header (bold, larger font)
- [ ] **Prominently display continuity fields** (priority layout):
  - Contact Name (if present) - Large, bold
  - Phone number (if present) - Large, with "Call" icon button
  - Email (if present) - Large, with "Email" icon button
  - Policy/Account Number (if present) - Medium, monospace font
  - Renewal Date (if present) - Large, highlighted if within 30 days
- [ ] **De-emphasize financial fields** (smaller, muted):
  - Amount (if present) - Small, gray text
  - Frequency (if present) - Small, gray text
- [ ] Show provider/contact name below primary info
- [ ] Add action menu (top-right): Edit, Delete
- [ ] Add attachment count badge if attachments exist
- [ ] Style with card design (white/5 background, hover effects)
- [ ] Add color-coded border for urgency (red if renewal within 30 days)

### Task 5: Create Child Record Form Component
- [ ] Create `web/src/components/child-records/ChildRecordForm.tsx`
- [ ] Add props: `parentId`, `parentDomain`, `recordId` (optional for edit), `onClose`, `onSuccess`
- [ ] Step 1: Record Type Selector (if creating new)
  - Display record type cards with icons
  - Filter by domain configuration (use useDomainConfig hook)
  - Show custom record types
- [ ] Step 2: Record Details Form
  - Implement form with continuity fields prioritized
  - Use React Hook Form for validation
  - Show loading state during submission
  - Show error messages inline per field

### Task 6: Implement Continuity-Focused Form Fields (Priority)
- [ ] Add text input: **Name** (required, max 100 chars, e.g., "Car Insurance Policy")
- [ ] Add section header: "Contact Information" (prominent)
- [ ] Add text input: **Contact Name / Provider** (max 100 chars, e.g., "Direct Line")
- [ ] Add text input: **Phone** (format: 028-XXXX-XXXX or 07XXX-XXXXXX, with "Call" button)
- [ ] Add text input: **Email** (email validation, with "Email" button)
- [ ] Add text input: **Account Number** (max 50 chars, monospace display)
- [ ] Add text input: **Policy Number** (max 50 chars, monospace display)
- [ ] Add date picker: **Renewal Date** (with urgency indicator if <30 days)
- [ ] Add date picker: **Start Date** (optional)
- [ ] Add dropdown: **Status** (Active, Expired, Cancelled, Pending)

### Task 7: Implement Financial Fields (De-emphasized, Optional)
- [ ] Add section header: "Financial Details" (collapsible, collapsed by default)
- [ ] Add number input: Amount (optional, currency format £)
- [ ] Add dropdown: Frequency (optional: One-time, Daily, Weekly, Monthly, Quarterly, Annually)
- [ ] Add textarea: Notes (optional, max 500 chars)
- [ ] Style with muted colors (gray text, smaller font)

### Task 8: Implement Record Type-Specific Fields
- [ ] **Contact** type: Prioritize contactName, phone, email (hide amount/frequency)
- [ ] **ServiceHistory** type: Prioritize provider, phone, service date, next service due
- [ ] **Finance** type: Show amount and frequency (but still prioritize contact info)
- [ ] **Insurance** type: Prioritize provider, policyNumber, renewalDate, phone
- [ ] **Government** type: Prioritize renewalDate, accountNumber (e.g., MOT, Tax)
- [ ] **Pension** type: Prioritize provider, accountNumber, contribution amount

### Task 9: Implement Attachment Upload
- [ ] Add file upload section at bottom of form
- [ ] Support multiple file upload (documents, images)
- [ ] Show existing attachments with delete option (edit mode)
- [ ] Display file previews for images
- [ ] Add "View" button for document attachments
- [ ] Integrate with existing GridFS attachment system

### Task 10: Implement Delete Child Record Confirmation
- [ ] Create `web/src/components/child-records/DeleteChildRecordModal.tsx`
- [ ] Show record name and type
- [ ] Display warning: "This will permanently delete this record"
- [ ] Add checkbox: "I understand this action cannot be undone"
- [ ] Disable delete button until checkbox checked
- [ ] Implement delete mutation with optimistic update
- [ ] Show success toast after deletion
- [ ] Close modal and update parent entity view

### Task 11: Implement React Query Hooks
- [ ] Create `web/src/hooks/useChildRecords.ts`
- [ ] Add query hook: `useChildRecords(parentId)` - fetches all child records for parent
- [ ] Add query hook: `useChildRecord(parentId, recordId)` - fetches single child record
- [ ] Add mutation hook: `useCreateChildRecord(parentId)` - creates child record
- [ ] Add mutation hook: `useUpdateChildRecord(parentId, recordId)` - updates child record
- [ ] Add mutation hook: `useDeleteChildRecord(parentId, recordId)` - deletes child record
- [ ] Configure cache keys by parentId and recordId
- [ ] Implement optimistic updates for all mutations
- [ ] Invalidate parent entity query after child mutations (to update counts)

### Task 12: Implement Renewal Date Urgency Indicators
- [ ] Create utility function: `calculateRenewalUrgency(renewalDate)`
- [ ] Return urgency levels: Critical (<30 days), Important (30-90 days), Upcoming (>90 days), None
- [ ] Apply color-coded indicators:
  - Critical: Red border, red badge, red text
  - Important: Orange border, orange badge, orange text
  - Upcoming: Blue border, blue badge, blue text
- [ ] Show days remaining: "Renews in 15 days" (red) or "Renews in 45 days" (orange)
- [ ] Add icon indicator (AlertCircle for critical)

### Task 13: Write Comprehensive Tests
- [ ] Test ParentEntityDetail - header, child list integration (3 tests)
- [ ] Test ChildRecordList - grouping, sorting, collapsible sections (5 tests)
- [ ] Test ChildRecordCard - prominence of continuity fields, urgency indicators (6 tests)
- [ ] Test ChildRecordForm - record type selector, field validation (8 tests)
- [ ] Test continuity fields prioritization - layout, visibility (4 tests)
- [ ] Test financial fields de-emphasis - collapsed, muted styling (2 tests)
- [ ] Test record type-specific fields - correct fields shown per type (6 tests)
- [ ] Test attachment upload - file handling, previews (3 tests)
- [ ] Test delete confirmation - checkbox requirement (2 tests)
- [ ] Test React Query hooks - caching, optimistic updates, parent invalidation (5 tests)
- [ ] Test renewal urgency indicators - colors, days remaining (3 tests)

---

## Dev Notes

**Continuity Field Prioritization (Visual Hierarchy)**:
```
┌─────────────────────────────────────┐
│ Car Insurance Policy          [Edit]│ ← Name (Large, Bold)
├─────────────────────────────────────┤
│ 📞 028-9012-3456 [Call]             │ ← Phone (Large, Prominent)
│ ✉️  claims@directline.com [Email]   │ ← Email (Large, Prominent)
│ 🔖 Policy: POL-123456               │ ← Policy Number (Medium, Monospace)
│ 📅 Renews: 15 Jun 2025 (30 days)    │ ← Renewal (Large, Red if urgent)
├─────────────────────────────────────┤
│ Direct Line                         │ ← Provider (Medium)
│ £850/year                           │ ← Financial (Small, Gray, Muted)
└─────────────────────────────────────┘
```

**Record Type Icons** (Lucide React):
- Contact: `User`
- ServiceHistory: `Wrench`
- Finance: `Banknote`
- Insurance: `Shield`
- Government: `Building2`
- Pension: `PiggyBank`

**Renewal Urgency Color Scheme**:
```typescript
const urgencyColors = {
  critical: {
    border: 'border-red-500',
    badge: 'bg-red-500',
    text: 'text-red-500',
    icon: AlertCircle
  },
  important: {
    border: 'border-orange-500',
    badge: 'bg-orange-500',
    text: 'text-orange-500',
    icon: Clock
  },
  upcoming: {
    border: 'border-blue-500',
    badge: 'bg-blue-500',
    text: 'text-blue-500',
    icon: Calendar
  }
};
```

**Form Field Layout (Continuity-Focused)**:
```
Child Record Form
├─ Step 1: Record Type Selector (if creating)
│  └─ Grid of record type cards (Contact, ServiceHistory, Finance, etc.)
└─ Step 2: Record Details
   ├─ Name (required)
   ├─ Contact Information Section (PROMINENT, expanded)
   │  ├─ Contact Name / Provider
   │  ├─ Phone
   │  ├─ Email
   │  ├─ Account Number
   │  ├─ Policy Number
   │  ├─ Renewal Date
   │  └─ Status
   ├─ Financial Details Section (MUTED, collapsed)
   │  ├─ Amount
   │  ├─ Frequency
   │  └─ Notes
   └─ Attachments Section
      └─ File upload
```

**Empty State Messages**:
- Contact: "No contact records yet. Add phone numbers, emails, and account details."
- ServiceHistory: "No service history yet. Track maintenance and service provider contacts."
- Finance: "No finance records yet. Add loans, payments, and financial contact information."
- Insurance: "No insurance records yet. Track policies, renewal dates, and provider contacts."
- Government: "No government records yet. Track MOT, tax, licenses, and renewal deadlines."
- Pension: "No pension records yet. Track workplace pensions and contribution details."

**Collapsible Section Default State**:
- Sections with records: Expanded
- Sections with upcoming renewals (<90 days): Expanded
- Empty sections: Collapsed

**Quick Action Buttons**:
- Phone field: "Call" button → opens `tel:` link
- Email field: "Email" button → opens `mailto:` link
- Implementation: Native mobile dialer/email client integration

---

## Testing

### Unit Tests
- ChildRecordCard component - field prominence, urgency indicators
- ChildRecordForm component - validation, record type filtering
- Collapsible section functionality
- Renewal urgency calculation utility

### Integration Tests
- Create child record flow (type selector → form → submission)
- Edit child record flow (card menu → form → update)
- Delete child record flow (card menu → confirmation → deletion)
- Parent entity count update after child mutations

### Visual Regression Tests
- Child record cards - continuity field prominence
- Form layouts - de-emphasized financial section
- Urgency indicators - colors and borders
- Empty states for all record types

---

## Dev Agent Record

### Agent Model Used
- Model: TBD

### Debug Log References
- None

### Completion Notes
- TBD

### File List
- TBD

### Change Log
| Date | Change | Author |
|------|--------|--------|
| 2025-01-17 | Story created for Child Record Frontend (Continuity-Focused) | James (Dev) |

---

**Implementation Status**: Draft - Ready for implementation
