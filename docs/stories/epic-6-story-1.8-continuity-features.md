# Story 1.8: Continuity Planning Features (Renewals & Contact Directory)

**Epic**: 6 - Hierarchical Domain Model Refactor
**Story**: 1.8
**Status**: Draft
**Assigned**: James (Dev Agent)
**Estimated**: 6 hours
**Actual**: TBD
**Priority**: P1 - High
**Depends On**: Story 1.6 (Child Record Frontend)

---

## Story

**As a** user,
**I want** to see upcoming renewal dates and access a contact directory,
**so that** I can proactively manage renewals and easily find contact information in emergencies.

---

## Context

This story delivers core **continuity planning features** that help users (and their surviving partners) stay on top of critical household responsibilities:

1. **Renewals Dashboard**: Shows upcoming renewal dates across all domains (insurance policies, MOT, vehicle tax, subscriptions) with urgency-based prioritization

2. **Contact Directory**: Provides a searchable directory of all contact information (service providers, insurers, financial institutions) for quick access in emergencies

These features address the core question: "If I die tomorrow, can my partner know when things renew and who to contact?"

---

## Acceptance Criteria

- [ ] AC1: `UpcomingRenewals` dashboard widget displays next 10 upcoming renewal dates across all domains
- [ ] AC2: Renewal cards show: Entity name (Vehicle/Property/etc.), Renewal type (Insurance, MOT, etc.), Date, Contact info
- [ ] AC3: Renewals grouped by urgency: Critical (<30 days), Important (30-90 days), Upcoming (>90 days)
- [ ] AC4: Clicking renewal card navigates to parent entity detail page
- [ ] AC5: `/renewals` page shows full list of all renewals with filtering by domain and date range
- [ ] AC6: `ContactDirectory` component displays all contact info across all domains with search
- [ ] AC7: Contact cards show: Name, Phone, Email, Entity name, Last interaction date
- [ ] AC8: "Quick call" and "Quick email" buttons on contact cards (open phone dialer / email client)
- [ ] AC9: Export contact directory as CSV/VCF for backup

---

## Integration Verification

- [ ] IV1: Renewal date calculation - Verify renewals correctly calculated from child record renewalDate field
- [ ] IV2: Cross-domain search - Test that contact directory searches across all 4 parent domains
- [ ] IV3: Performance - Ensure dashboard widgets load quickly (<500ms) with aggregated data

---

## Tasks

### Task 1: Create Renewals API Endpoints
- [ ] Create `src/routes/renewals.js`
- [ ] Add GET /api/renewals/upcoming - Returns upcoming renewals across all domains
- [ ] Add GET /api/renewals - Returns all renewals with filtering (domain, dateRange, urgency)
- [ ] Query child records with renewalDate field populated
- [ ] Populate parent entity data (name, domain, icon)
- [ ] Calculate urgency level (critical/important/upcoming)
- [ ] Sort by renewalDate ascending
- [ ] Add pagination support (50 per page)
- [ ] Add authentication middleware

### Task 2: Create Contact Directory API Endpoints
- [ ] Create `src/routes/contacts.js`
- [ ] Add GET /api/contacts - Returns all contact info across domains
- [ ] Query child records with contactName OR phone OR email populated
- [ ] Populate parent entity data
- [ ] Add search query parameter (searches contactName, phone, email, entity name)
- [ ] Add domain filter parameter
- [ ] Sort by entity name, then contactName
- [ ] Add pagination support
- [ ] Add export endpoint: GET /api/contacts/export (CSV/VCF format)

### Task 3: Implement Renewal Calculation Logic
- [ ] Create `src/utils/renewalCalculator.js`
- [ ] Function: `calculateRenewalUrgency(renewalDate)` - Returns urgency level
- [ ] Critical: <30 days from today
- [ ] Important: 30-90 days from today
- [ ] Upcoming: >90 days from today
- [ ] Function: `getDaysUntilRenewal(renewalDate)` - Returns days remaining
- [ ] Function: `formatRenewalDate(renewalDate, urgency)` - Returns formatted string with urgency
- [ ] Add unit tests for edge cases (past dates, today, future dates)

### Task 4: Register Renewals and Contacts Routes
- [ ] Import renewals and contacts routes in `src/server.js`
- [ ] Mount routes: `app.use('/api/renewals', renewalsRouter)`
- [ ] Mount routes: `app.use('/api/contacts', contactsRouter)`
- [ ] Verify routes require authentication
- [ ] Test routes with Supertest

### Task 5: Create Upcoming Renewals Dashboard Widget
- [ ] Create `web/src/components/continuity/UpcomingRenewalsWidget.tsx`
- [ ] Fetch next 10 upcoming renewals using React Query
- [ ] Display in compact card format
- [ ] Group by urgency (Critical section, Important section, Upcoming section)
- [ ] Each renewal shows: Entity icon, Entity name, Renewal type, Date, Days remaining
- [ ] Color-code by urgency (red, orange, blue)
- [ ] Add "View All Renewals" button (navigates to /renewals page)
- [ ] Show loading skeleton
- [ ] Show empty state: "No upcoming renewals. Add renewal dates to child records."

### Task 6: Create Renewals Page
- [ ] Create `web/src/pages/Renewals.tsx`
- [ ] Add route: `/renewals`
- [ ] Add to navigation menu: "Renewals" (Calendar icon)
- [ ] Display full list of renewals with filtering
- [ ] Add filter dropdown: Domain (All, Vehicle, Property, Employment, Services)
- [ ] Add filter dropdown: Urgency (All, Critical, Important, Upcoming)
- [ ] Add date range filter (optional)
- [ ] Display renewals in list/card view
- [ ] Implement pagination with "Load More" button
- [ ] Add search bar (searches entity name, renewal type)

### Task 7: Create Renewal Card Component
- [ ] Create `web/src/components/continuity/RenewalCard.tsx`
- [ ] Display entity icon and name (header)
- [ ] Show renewal type badge (Insurance, MOT, Tax, etc.)
- [ ] Show renewal date prominently with urgency indicator
- [ ] Show days remaining: "Renews in 15 days" (red) or "Renews in 45 days" (orange)
- [ ] Show contact info if available (phone, provider)
- [ ] Add "View Details" button (navigates to parent entity detail, scrolls to child record)
- [ ] Add color-coded left border (red/orange/blue based on urgency)
- [ ] Style with Swiss spa aesthetic

### Task 8: Create Contact Directory Component
- [ ] Create `web/src/components/continuity/ContactDirectory.tsx`
- [ ] Fetch all contact info using React Query
- [ ] Display in grid layout (1/2/3 columns)
- [ ] Add search bar (filters contactName, phone, email, entity name)
- [ ] Add domain filter dropdown
- [ ] Show empty state: "No contacts yet. Add contact information to child records."
- [ ] Implement loading skeleton states
- [ ] Add "Export Contacts" button (CSV/VCF download)

### Task 9: Create Contact Card Component
- [ ] Create `web/src/components/continuity/ContactCard.tsx`
- [ ] Display contact name as header
- [ ] Show entity name and domain badge (e.g., "2019 Honda Civic - Vehicle")
- [ ] Display phone prominently with "Call" icon button (`tel:` link)
- [ ] Display email prominently with "Email" icon button (`mailto:` link)
- [ ] Show account/policy number if available (monospace font)
- [ ] Show last interaction date if available (from last ServiceHistory child record)
- [ ] Add "View Entity" button (navigates to parent entity detail)
- [ ] Style with card design and hover effects

### Task 10: Implement Export Functionality
- [ ] Create `src/utils/contactExporter.js`
- [ ] Function: `exportToCSV(contacts)` - Returns CSV string
- [ ] CSV columns: Name, Phone, Email, Entity, Domain, Account Number, Policy Number
- [ ] Function: `exportToVCF(contacts)` - Returns VCF vCard string
- [ ] VCF format: Full name, phone, email, organization (entity name)
- [ ] Add export endpoint handler in contacts route
- [ ] Frontend: Trigger download with filename "legacylock-contacts-YYYY-MM-DD.csv"

### Task 11: Add Dashboard Integration
- [ ] Update `web/src/pages/Dashboard.tsx`
- [ ] Add UpcomingRenewalsWidget to dashboard layout
- [ ] Position widget in top section (high priority)
- [ ] Add "Quick Contacts" section showing 5 most used contacts
- [ ] Add statistics: Total renewals in next 30 days, Total active contacts
- [ ] Ensure dashboard loads quickly with aggregated data

### Task 12: Implement React Query Hooks
- [ ] Create `web/src/hooks/useRenewals.ts`
- [ ] Add query hook: `useUpcomingRenewals()` - Fetches next 10 renewals
- [ ] Add query hook: `useAllRenewals(filters)` - Fetches all renewals with filtering
- [ ] Add query hook: `useContacts(search, domain)` - Fetches contact directory
- [ ] Add mutation hook: `useExportContacts(format)` - Triggers export download
- [ ] Configure cache settings (stale time: 1 minute for renewals, 5 minutes for contacts)

### Task 13: Write Comprehensive Tests
- [ ] Test renewals API endpoint - upcoming, filtering, pagination (5 tests)
- [ ] Test contacts API endpoint - search, domain filter, export (5 tests)
- [ ] Test renewal calculation logic - urgency levels, days remaining (4 tests)
- [ ] Test UpcomingRenewalsWidget - grouping, color coding (3 tests)
- [ ] Test Renewals page - filtering, search, pagination (4 tests)
- [ ] Test RenewalCard - urgency indicators, navigation (3 tests)
- [ ] Test ContactDirectory - search, domain filter, export (4 tests)
- [ ] Test ContactCard - quick actions, display (3 tests)
- [ ] Test export functionality - CSV format, VCF format (2 tests)
- [ ] Test dashboard integration - widget display, statistics (2 tests)

---

## Dev Notes

**Renewals API Response**:
```json
{
  "renewals": [
    {
      "_id": "child_record_id",
      "recordType": "Insurance",
      "name": "Car Insurance",
      "renewalDate": "2025-06-15",
      "daysUntilRenewal": 15,
      "urgency": "critical",
      "contactName": "Direct Line",
      "phone": "028-9012-3456",
      "policyNumber": "POL-123456",
      "parent": {
        "_id": "parent_id",
        "name": "2019 Honda Civic",
        "domainType": "Vehicle"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

**Contacts API Response**:
```json
{
  "contacts": [
    {
      "_id": "child_record_id",
      "recordType": "Contact",
      "contactName": "McGrath Plumbing",
      "phone": "07700-900123",
      "email": "info@mcgrathplumbing.com",
      "accountNumber": null,
      "lastInteraction": "2024-06-10",
      "parent": {
        "_id": "parent_id",
        "name": "123 Main Street",
        "domainType": "Property"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

**Urgency Calculation**:
```typescript
function calculateRenewalUrgency(renewalDate: string): 'critical' | 'important' | 'upcoming' | 'none' {
  const today = new Date();
  const renewal = new Date(renewalDate);
  const daysUntil = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return 'none'; // Past date
  if (daysUntil < 30) return 'critical';
  if (daysUntil < 90) return 'important';
  return 'upcoming';
}
```

**CSV Export Format**:
```csv
Name,Phone,Email,Entity,Domain,Account Number,Policy Number
McGrath Plumbing,07700-900123,info@mcgrathplumbing.com,123 Main Street,Property,,
Direct Line,028-9012-3456,claims@directline.com,2019 Honda Civic,Vehicle,,POL-123456
```

**VCF Export Format**:
```
BEGIN:VCARD
VERSION:3.0
FN:McGrath Plumbing
TEL;TYPE=WORK:07700-900123
EMAIL:info@mcgrathplumbing.com
ORG:123 Main Street (Property)
END:VCARD
```

**Dashboard Widget Layout**:
```
┌─────────────────────────────────────┐
│ Upcoming Renewals              [All]│
├─────────────────────────────────────┤
│ CRITICAL (<30 days)                 │
│ ┌─────────────────────────────────┐ │
│ │ 🚗 2019 Honda Civic             │ │
│ │ Insurance - Renews in 15 days   │ │
│ │ 📞 028-9012-3456                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ IMPORTANT (30-90 days)              │
│ ┌─────────────────────────────────┐ │
│ │ 🏠 123 Main Street              │ │
│ │ Home Insurance - 45 days        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Contact Directory Search**:
- Searches across: contactName, phone, email, parent entity name
- Case-insensitive
- Partial match (fuzzy search optional future enhancement)
- Filters by domain (optional)
- Real-time search (debounced 300ms)

---

## Testing

### Unit Tests
- Renewal calculation utility - urgency levels, days until
- Contact export formatters - CSV, VCF
- API query builders - filtering, sorting

### Integration Tests
- Renewals API - full request/response with populated parent data
- Contacts API - search, domain filter, export
- Dashboard widget - data fetching and display

### End-to-End Tests
- View upcoming renewals on dashboard
- Filter renewals on /renewals page
- Search contact directory
- Export contacts as CSV/VCF

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
| 2025-01-17 | Story created for Continuity Planning Features | James (Dev) |

---

**Implementation Status**: Draft - Ready for implementation
