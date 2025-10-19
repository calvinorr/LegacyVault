# Story 1.7: Services Directory & Transaction-to-Entry Workflow

**Epic**: 6 - Hierarchical Domain Model Refactor
**Story**: 1.7
**Status**: In Progress
**Assigned**: James (Dev Agent)
**Estimated**: 8 hours
**Actual**: TBD
**Priority**: P0 - Blocking
**Depends On**: Story 1.5 (Parent Frontend), Story 1.6 (Child Record Frontend), Epic 5 (Transaction Ledger)

---

## Story

**As a** user,
**I want** to manage a directory of service providers and create child records from bank transactions,
**so that** I can organize tradespeople information and link transactions to household entities.

---

## Context

This story delivers two critical features:

1. **Services Directory**: A specialized view for managing tradespeople and service providers (plumbers, electricians, oil suppliers, cleaners, etc.) with emphasis on emergency contact accessibility

2. **Enhanced Transaction-to-Entry Workflow**: Updates the Epic 5 CreateEntryFromTransactionModal to support the new hierarchical parent-child structure with four-step workflow (select domain → select/create parent → select record type → fill details)

**Services Domain (NEW)**: A parent entity domain for organizing service providers and tradespeople, critical for household continuity planning (knowing who to call when things break).

**Epic 5 Integration**: Maintains compatibility with existing transaction processing, pattern detection, and auto-ignore functionality while adding hierarchical record creation.

---

## Acceptance Criteria

- [ ] AC1: `ServicesDirectory` component displays grid/list of service providers with search/filter
- [ ] AC2: Service provider cards show: Business name, Service type, Contact info, Last service date
- [ ] AC3: "Add Service Provider" button opens form with fields: Business Name, Service Type dropdown, Contact, Phone, Email, Address, Notes
- [ ] AC4: `CreateEntryFromTransactionModal` updated with four-step workflow
- [ ] AC5: Step 1: Select parent domain (Vehicle, Property, Employment, Services)
- [ ] AC6: Step 2: Select existing parent entity OR create new inline
- [ ] AC7: Step 3: Select child record type (Contact, Finance, Insurance, etc.)
- [ ] AC8: Step 4: Fill child record details with continuity fields prioritized
- [ ] AC9: If no parent entities exist, show "Create your first [Vehicle/Property/Employment/Service Provider]" message
- [ ] AC10: Inline parent creation form includes minimal required fields (name only, details added later)
- [ ] AC11: Form pre-populates child record fields from transaction data (amount, date, provider)
- [ ] AC12: Transaction status updates to "record_created" after successful submission
- [ ] AC13: Modal shows success message with link to view created child record
- [ ] AC14: Pattern detection and auto-ignore functionality continues to work unchanged

---

## Integration Verification

- [ ] IV1: Epic 5 compatibility - Verify transaction list and status badges work with new child records
- [ ] IV2: Category suggestion - Test that category suggestion engine still functions (maps to record types)
- [ ] IV3: Transaction status update - Confirm `/api/transactions/:id/status` endpoint works with new record IDs

---

## Tasks

### Task 1-3: Services Directory Components (COMPLETED)
- [x] `web/src/components/services/ServiceTypeBadge.tsx` (130 lines)
  - 7 service types with Lucide icons and colors
  - Pill-shaped badges with 3 sizes (sm, md, lg)
  - Plumber/Electrician/Oil Supplier/Cleaner/Gardener/Handyman/Other
- [x] `web/src/components/services/ServiceProviderCard.tsx` (200 lines)
  - Business name header with service type badge
  - Prominent contact info (phone/email) with quick action buttons
  - Last service date display
  - Hover effects with elevated shadow
  - Swiss spa aesthetic maintained
- [x] `web/src/components/services/ServicesDirectory.tsx` (330 lines)
  - Responsive grid layout (auto-fill, minmax 320px)
  - Search bar (filters by name/service type)
  - Filter dropdown (all types + 7 service types)
  - "Add Service Provider" button → /services-new
  - Empty state with onboarding message
  - Loading states and error handling
- [x] `web/src/pages/Services.tsx` - Wrapper page component
- [x] Route already exists: /services-new
- [x] Navigation menu already has Services link with Wrench icon

### Task 4-10: CreateEntryFromTransactionModal 4-Step Wizard (COMPLETED)
- [x] Update `web/src/components/CreateEntryFromTransactionModal.tsx` with complete refactor
- [x] **Step 1**: Domain Selection - 4 domain cards with icons (Car, Home, Briefcase, Wrench)
- [x] **Step 2**: Parent Entity Selection - List existing or inline creation form
- [x] **Step 3**: Record Type Selection - Filtered by domain configuration
- [x] **Step 4**: Child Record Form - Pre-populated from transaction data
- [x] Multi-step wizard with progress indicator (4-bar visual)
- [x] Inline parent creation (name only, "add details later" note)
- [x] Transaction status update to "record_created" after success
- [x] Success screen with View Record / Create Another / Close buttons
- [x] Fixed API endpoint from `/children` to `/records`
- [x] Smart domain/record type suggestion from transaction description
- [x] Continuity-first form (Essential Info section prioritized, Financial section muted)

### Task 11: Maintain Epic 5 Functionality
- [ ] Verify transaction list page still works (no regressions)
- [ ] Verify pattern detection engine still functions
- [ ] Verify auto-ignore functionality works
- [ ] Verify transaction status badges update correctly
- [ ] Test category suggestion engine (should map to record types)
- [ ] Ensure import timeline still displays transactions

### Task 12: Update Category Suggestion Mapping
- [ ] Update category suggestion engine to map legacy categories to record types
- [ ] Mapping examples:
  - "Insurance" → Insurance record type
  - "Utilities" → Government record type (if property-related)
  - "Car Finance" → Finance record type (vehicle domain)
  - "Salary" → Finance record type (employment domain)
- [ ] Suggest appropriate domain based on category (e.g., "Car Insurance" → Vehicle domain)
- [ ] Pre-select domain in Step 1 if high-confidence match

### Task 13: Write Comprehensive Tests
- [ ] Test ServicesDirectory - rendering, search, filter (4 tests)
- [ ] Test ServiceProviderCard - display, quick actions (3 tests)
- [ ] Test ServiceTypeBadge - icons, colors (2 tests)
- [ ] Test CreateEntryFromTransactionModal - 4-step workflow (10 tests)
- [ ] Test Step 1 - domain selection, card display (2 tests)
- [ ] Test Step 2 - parent selection, inline creation, empty state (5 tests)
- [ ] Test Step 3 - record type selection, domain config filtering (3 tests)
- [ ] Test Step 4 - pre-population from transaction data (4 tests)
- [ ] Test transaction status update - API call, cache invalidation (2 tests)
- [ ] Test success message - navigation, buttons (2 tests)
- [ ] Test Epic 5 integration - pattern detection, auto-ignore (3 tests)
- [ ] Test category suggestion mapping - domain/record type suggestions (4 tests)

---

## Dev Notes

**Services Directory Layout**:
```
Services Directory Page
├─ Search bar (filter by name, service type)
├─ Filter dropdown (Plumber, Electrician, Oil Supplier, etc.)
├─ "Add Service Provider" button
└─ Grid of ServiceProviderCard components
   ├─ Business name (header)
   ├─ Service type badge (icon + color)
   ├─ Phone (with Call button)
   ├─ Email (with Email button)
   └─ Last service date
```

**Service Type Taxonomy**:
```typescript
const serviceTypes = [
  { value: 'plumber', label: 'Plumber', icon: Droplet, color: 'blue' },
  { value: 'electrician', label: 'Electrician', icon: Zap, color: 'yellow' },
  { value: 'oil_supplier', label: 'Oil Supplier', icon: Fuel, color: 'orange' },
  { value: 'cleaner', label: 'Cleaner', icon: Sparkles, color: 'purple' },
  { value: 'gardener', label: 'Gardener', icon: Leaf, color: 'green' },
  { value: 'handyman', label: 'Handyman', icon: Hammer, color: 'gray' },
  { value: 'other', label: 'Other', icon: Wrench, color: 'slate' }
];
```

**CreateEntryFromTransactionModal Workflow**:
```
Step 1: Select Domain
┌────────────────────────────────┐
│ [🚗 Vehicle] [🏠 Property]     │
│ [💼 Employment] [🔧 Services]  │
└────────────────────────────────┘

Step 2: Select/Create Parent
┌────────────────────────────────┐
│ ○ 2019 Honda Civic (5 records)│
│ ○ 2022 Ford Focus (3 records) │
│ ⊕ Create New Vehicle           │
└────────────────────────────────┘

Step 3: Select Record Type
┌────────────────────────────────┐
│ [👤 Contact] [🔧 Service]      │
│ [💰 Finance] [🛡️ Insurance]    │
└────────────────────────────────┘

Step 4: Fill Details
┌────────────────────────────────┐
│ Name: Car Insurance            │
│ Provider: Direct Line          │
│ Phone: 028-9012-3456           │
│ Amount: £850                   │
│ [Create Record]                │
└────────────────────────────────┘
```

**Transaction Data Pre-population**:
```typescript
// Transaction:
{
  description: "DIRECT LINE INS - Car Insurance",
  amount: -850,
  date: "2025-01-10",
  suggestedCategory: "Insurance"
}

// Pre-populated form:
{
  name: "Car Insurance",  // Cleaned description
  provider: "Direct Line",  // Extracted from description
  amount: 850,  // Absolute value
  startDate: "2025-01-10",  // Transaction date
  recordType: "Insurance"  // From category suggestion
}
```

**Category to Record Type Mapping**:
```javascript
const categoryToRecordType = {
  'Insurance': 'Insurance',
  'Utilities': 'Government',  // e.g., rates, tax
  'Car Finance': 'Finance',
  'Mortgage': 'Finance',
  'Salary': 'Finance',
  'Pension': 'Pension',
  'Service': 'ServiceHistory',
  'Maintenance': 'ServiceHistory'
};
```

**Empty State - No Parent Entities**:
```
No [Vehicles/Properties/Employments/Service Providers] Yet

Create your first [domain] to get started organizing your
household information for continuity planning.

[Create New Vehicle]
```

**Success Message**:
```
✅ Record Created Successfully

Vehicle: 2019 Honda Civic
Record Type: Insurance
Record Name: Car Insurance

[View Record] [Create Another] [Close]
```

---

## Testing

### Unit Tests
- ServicesDirectory component - search, filter functionality
- ServiceProviderCard component - display, quick actions
- CreateEntryFromTransactionModal - step navigation
- Inline parent creation form - validation

### Integration Tests
- Full transaction-to-entry workflow (4 steps)
- Pre-population from transaction data
- Transaction status update after creation
- Domain/record type suggestion from categories

### Epic 5 Regression Tests
- Transaction list displays correctly
- Pattern detection engine functions
- Auto-ignore functionality works
- Import timeline shows transactions

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
| 2025-01-17 | Story created for Services Directory & Transaction Workflow | James (Dev) |

---

**Implementation Status**: Draft - Ready for implementation
