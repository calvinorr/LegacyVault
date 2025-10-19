# Story 1.6: Finance Domain UI - Bank Accounts, Savings & Investments

**Epic:** Life Domain Architecture Foundation (Epic 1)
**Story ID:** 1.6
**Estimated Effort:** 6-8 hours (1-2 development sessions)
**Priority:** High
**Status:** Draft
**Dependencies:** Story 1.1 (✓), Story 1.2 (✓), Story 1.3 (✓), Story 1.4 (✓), Story 1.5 (✓)

---

## User Story

**As a** household administrator,
**I want** to manage Finance domain records through a dedicated UI,
**so that** I can organize bank accounts, savings accounts, ISAs, credit cards, and loans in one secure place.

---

## Story Context

### Why This Story

Stories 1.4 and 1.5 established the domain UI pattern. Story 1.6 applies this to the Finance domain - one of the most critical domains for household financial management.

**Finance domain is crucial because:**
- Central to household financial health (current accounts, savings, investments)
- UK-specific products (ISAs, Premium Bonds, SIPPs)
- Multiple accounts per household to track
- Sensitive information requiring secure management
- Integration with bank import functionality (future story)

### Existing System Integration

**Backend APIs Available (from Stories 1.1-1.3):**
- `GET/POST/PUT/DELETE /api/domains/finance/records`
- `GET /api/domains/finance/records/search?q=text`
- `GET /api/domains/finance/records?priority=high&sort=renewalDate`
- `POST /api/domains/finance/records/:id/documents` (file upload)
- `GET /api/domain-documents/:fileId` (file download)
- UK sort code validation middleware
- Duplicate detection (account number + sort code)

**Frontend Pattern Established (Stories 1.4 & 1.5):**
- Domain card grid on HomePage
- Domain-specific pages (list/detail)
- Domain record forms with UK validation
- Premium design system components
- Lucide React icons

**Current Frontend State:**
- HomePage shows Finance card as "Coming Soon"
- Property and Vehicles domains fully functional
- Pattern proven and ready to replicate

---

## Acceptance Criteria

### Functional Requirements

**AC1: Enable Finance Card on HomePage**
- ✅ Finance card clickable (remove "Coming Soon" overlay)
- ✅ Card shows finance record count
- ✅ Clicking card navigates to `/finance`

**AC2: Finance Domain Detail Page**
- ✅ Route `/finance` shows Finance domain detail view
- ✅ Page header shows: Banknote icon, "Finance" title, "Add Account" button, total record count
- ✅ Empty state message: "No finance records yet. Add your first account to get started."
- ✅ Records display in card/list view showing: name, institution, account type, sort code (masked), balance, priority badge
- ✅ Click record card navigates to record detail view
- ✅ Records grouped by type (Current Accounts, Savings, ISAs, Credit Cards, Loans)

**AC3: Finance Record Form (Add/Edit)**
- ✅ "Add Account" button opens modal with Finance-specific form
- ✅ Form fields (from FinanceRecord schema):
  - Name (required) - e.g., "Main Current Account"
  - Record Type dropdown (current-account, savings-account, isa, credit-card, loan, investment, premium-bonds, pension)
  - Financial Institution (required)
  - Account Number (masked display)
  - Sort Code (XX-XX-XX format with UK validation)
  - Current Balance (£)
  - Interest Rate (%)
  - Monthly Payment (£) - for loans/credit cards
  - Credit Limit (£) - for credit cards
  - Maturity Date (date picker) - for fixed-term products
  - Contact Phone
  - Contact Email
  - Priority (Critical/Important/Standard dropdown)
  - Notes (textarea)
- ✅ UK sort code validation shows error if invalid format (XX-XX-XX)
- ✅ Duplicate detection: Warn if account number + sort code match existing record
- ✅ Form validation: Name, Record Type, and Institution are required
- ✅ Save button calls `POST /api/domains/finance/records`
- ✅ Success: Close modal, refresh record list, show success toast
- ✅ Error: Show error message in modal, keep form open

**AC4: Finance Record Detail View**
- ✅ Route `/finance/:recordId` shows single record detail
- ✅ Display all record fields in read-only view
- ✅ Sensitive data partially masked (account number: **** **** 1234, sort code: **-**-34)
- ✅ "Show Full Details" toggle to reveal full account/sort code (with confirmation)
- ✅ "Edit" button opens form modal with pre-populated data
- ✅ "Delete" button shows confirmation dialog, then calls `DELETE /api/domains/finance/records/:id`
- ✅ Documents section shows linked files (from Story 1.2)
- ✅ "Upload Document" button allows PDF/image upload via GridFS
- ✅ Downloaded documents retrieve via `GET /api/domain-documents/:fileId`

**AC5: Navigation Integration**
- ✅ Breadcrumb trail shows: Home > Finance > [Account Name]
- ✅ Current page highlighted in navigation

### Integration Requirements

**IR1: Existing Functionality Preserved**
- ✅ Google OAuth authentication still works
- ✅ Property and Vehicles domain pages still accessible and functional
- ✅ Existing Bills/Categories/Dashboard pages still accessible
- ✅ Backend APIs unchanged

**IR2: Premium Design Consistency**
- ✅ Finance cards use existing Card component styling
- ✅ Forms use existing Modal, Button, Input components
- ✅ Lucide React icons throughout (Banknote icon for domain)
- ✅ Inter font family with established weight hierarchy
- ✅ Color palette matches premium transformation

**IR3: Responsive Design**
- ✅ Finance cards adapt to mobile/tablet/desktop breakpoints
- ✅ Forms are mobile-friendly
- ✅ Sensitive data masking works on all screen sizes

### Quality Requirements

**QR1: Testing**
- ✅ Component unit tests for FinanceRecordForm
- ✅ Integration test: Create finance record end-to-end
- ✅ Integration test: Edit existing finance record
- ✅ Integration test: Delete finance record with confirmation
- ✅ Integration test: Sensitive data masking/unmasking
- ✅ Minimum 10 frontend tests for Story 1.6

**QR2: Error Handling**
- ✅ API errors display user-friendly messages
- ✅ Network errors show retry option
- ✅ Validation errors highlight specific fields
- ✅ Loading states prevent duplicate submissions

**QR3: Performance**
- ✅ Finance record list loads in < 1 second
- ✅ Form submissions respond in < 2 seconds

**QR4: Security**
- ✅ Account numbers and sort codes never logged
- ✅ Sensitive data masked by default in list view
- ✅ Full details require explicit user action
- ✅ HTTPS enforced for all sensitive data transmission

---

## Technical Specifications

### Component Architecture

Create the following new components in `web/src/`:

```
web/src/
├── pages/
│   ├── FinanceDomainPage.tsx           → Finance records list (NEW)
│   └── FinanceRecordDetailPage.tsx     → Single record view (NEW)
│
├── components/
│   ├── domain/
│   │   ├── DomainCard.tsx              → Existing (UPDATE: enable finance)
│   │
│   ├── finance/
│   │   ├── FinanceRecordForm.tsx       → Add/Edit form (NEW)
│   │   ├── FinanceRecordCard.tsx       → List item display (NEW)
│   │   ├── FinanceRecordDetail.tsx     → Detail view component (NEW)
│   │   └── SensitiveDataField.tsx      → Masked/unmasked field component (NEW)
│   │
│   └── shared/
│       ├── Modal.tsx                   → Existing (REUSE)
│       ├── Button.tsx                  → Existing (REUSE)
│       └── Input.tsx                   → Existing (REUSE)
│
├── hooks/
│   └── useFinanceRecords.ts            → Fetch/mutate finance records (NEW)
│
├── services/
│   └── api/
│       └── domains.ts                  → Existing (ADD finance methods)
│
├── utils/
│   ├── ukValidation.ts                 → Existing (ADD sort code validation)
│   └── dataMasking.ts                  → Mask/unmask sensitive data (NEW)
│
└── types/
    └── domain.ts                       → Existing (ADD FinanceRecord type)
```

---

### Routing Configuration

Update `web/src/App.tsx`:

```typescript
import FinanceDomainPage from './pages/FinanceDomainPage';
import FinanceRecordDetailPage from './pages/FinanceRecordDetailPage';

// Add routes:
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/property" element={<PropertyDomainPage />} />
  <Route path="/property/:recordId" element={<PropertyRecordDetailPage />} />
  <Route path="/vehicles" element={<VehiclesDomainPage />} />
  <Route path="/vehicles/:recordId" element={<VehicleRecordDetailPage />} />

  {/* NEW: Finance routes */}
  <Route path="/finance" element={<FinanceDomainPage />} />
  <Route path="/finance/:recordId" element={<FinanceRecordDetailPage />} />

  {/* Existing routes preserved */}
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/bills" element={<Bills />} />
</Routes>
```

---

### Update HomePage Component (Enable Finance Card)

**File:** `web/src/pages/HomePage.tsx`

**Change:** Update the `finance` domain object:

```typescript
// BEFORE:
{
  id: 'finance',
  name: 'Finance',
  description: 'Bank accounts, savings, ISAs, loans',
  icon: Banknote,
  enabled: false  // ← Currently disabled
},

// AFTER (Story 1.6):
{
  id: 'finance',
  name: 'Finance',
  description: 'Bank accounts, savings, ISAs, loans',
  icon: Banknote,
  enabled: true  // ← Enable for Story 1.6
},
```

---

### Finance Domain Page Component

**File:** `web/src/pages/FinanceDomainPage.tsx`

```typescript
import React, { useState } from 'react';
import { Plus, Banknote } from 'lucide-react';
import FinanceRecordCard from '../components/finance/FinanceRecordCard';
import FinanceRecordForm from '../components/finance/FinanceRecordForm';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import { useFinanceRecords } from '../hooks/useFinanceRecords';

const FinanceDomainPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: records, isLoading } = useFinanceRecords();

  // Group records by type
  const groupedRecords = React.useMemo(() => {
    if (!records) return {};

    return records.reduce((groups, record) => {
      const type = record.recordType;
      if (!groups[type]) groups[type] = [];
      groups[type].push(record);
      return groups;
    }, {} as Record<string, typeof records>);
  }, [records]);

  const recordTypeLabels: Record<string, string> = {
    'current-account': 'Current Accounts',
    'savings-account': 'Savings Accounts',
    'isa': 'ISAs',
    'credit-card': 'Credit Cards',
    'loan': 'Loans',
    'investment': 'Investments',
    'premium-bonds': 'Premium Bonds',
    'pension': 'Pensions'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100">
            <Banknote className="w-8 h-8 text-slate-700" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">
              Finance
            </h1>
            <p className="text-slate-600">
              Manage bank accounts, savings, ISAs, and investments
            </p>
          </div>
        </div>

        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Account
        </Button>
      </header>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">
          Loading accounts...
        </div>
      ) : records?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">
            No finance records yet. Add your first account to get started.
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            Add First Account
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedRecords).map(([type, typeRecords]) => (
            <div key={type}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {recordTypeLabels[type] || type}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeRecords.map((record) => (
                  <FinanceRecordCard key={record._id} record={record} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Add Finance Record"
      >
        <FinanceRecordForm
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default FinanceDomainPage;
```

---

### FinanceRecordForm Component

**File:** `web/src/components/finance/FinanceRecordForm.tsx`

```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { createFinanceRecord } from '../../services/api/domains';
import { isValidSortCode } from '../../utils/ukValidation';

interface FinanceFormData {
  name: string;
  recordType: string;
  institution: string;
  accountNumber?: string;
  sortCode?: string;
  currentBalance?: number;
  interestRate?: number;
  monthlyPayment?: number;
  creditLimit?: number;
  maturityDate?: string;
  contactPhone?: string;
  contactEmail?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
}

interface FinanceRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: FinanceFormData;
}

const RECORD_TYPES = [
  { value: 'current-account', label: 'Current Account' },
  { value: 'savings-account', label: 'Savings Account' },
  { value: 'isa', label: 'ISA' },
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'loan', label: 'Loan' },
  { value: 'investment', label: 'Investment' },
  { value: 'premium-bonds', label: 'Premium Bonds' },
  { value: 'pension', label: 'Pension / SIPP' }
];

const FinanceRecordForm: React.FC<FinanceRecordFormProps> = ({
  onSuccess,
  onCancel,
  initialData
}) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FinanceFormData>({
    defaultValues: initialData || { priority: 'Standard' }
  });
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recordType = watch('recordType');

  const onSubmit = async (data: FinanceFormData) => {
    setApiError('');
    setIsSubmitting(true);

    // UK sort code validation
    if (data.sortCode && !isValidSortCode(data.sortCode)) {
      setApiError('Invalid UK sort code format (should be XX-XX-XX)');
      setIsSubmitting(false);
      return;
    }

    try {
      await createFinanceRecord(data);
      onSuccess();
    } catch (error: any) {
      setApiError(error.message || 'Failed to create finance record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {apiError}
        </div>
      )}

      <Input
        label="Account Name *"
        placeholder="e.g., Main Current Account"
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Account Type *
        </label>
        <select
          {...register('recordType', { required: 'Account type is required' })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
        >
          <option value="">Select type...</option>
          {RECORD_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.recordType && (
          <p className="mt-1 text-sm text-red-600">{errors.recordType.message}</p>
        )}
      </div>

      <Input
        label="Financial Institution *"
        placeholder="e.g., HSBC, Barclays, NatWest"
        {...register('institution', { required: 'Institution is required' })}
        error={errors.institution?.message}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Account Number"
          placeholder="12345678"
          type="password"
          {...register('accountNumber')}
        />
        <Input
          label="Sort Code"
          placeholder="12-34-56"
          {...register('sortCode')}
        />
      </div>

      <Input
        label="Current Balance (£)"
        type="number"
        step="0.01"
        placeholder="0.00"
        {...register('currentBalance')}
      />

      {(recordType === 'savings-account' || recordType === 'isa') && (
        <Input
          label="Interest Rate (%)"
          type="number"
          step="0.01"
          placeholder="e.g., 4.5"
          {...register('interestRate')}
        />
      )}

      {(recordType === 'loan' || recordType === 'credit-card') && (
        <div className="border-t border-slate-200 pt-4 mt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Payment Details</h3>
          <Input
            label="Monthly Payment (£)"
            type="number"
            step="0.01"
            {...register('monthlyPayment')}
          />
          {recordType === 'credit-card' && (
            <Input
              label="Credit Limit (£)"
              type="number"
              step="0.01"
              {...register('creditLimit')}
            />
          )}
        </div>
      )}

      {(recordType === 'savings-account' || recordType === 'isa') && (
        <Input
          label="Maturity Date"
          type="date"
          {...register('maturityDate')}
        />
      )}

      <div className="border-t border-slate-200 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact Information</h3>
        <Input label="Contact Phone" {...register('contactPhone')} />
        <Input label="Contact Email" type="email" {...register('contactEmail')} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Priority
        </label>
        <select
          {...register('priority')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
        >
          <option value="Standard">Standard</option>
          <option value="Important">Important</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notes
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          placeholder="Additional information..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Account'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default FinanceRecordForm;
```

---

### Data Masking Utility

**File:** `web/src/utils/dataMasking.ts`

```typescript
/**
 * Mask account number - show only last 4 digits
 * Example: "12345678" → "**** 5678"
 */
export const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return '****';
  const lastFour = accountNumber.slice(-4);
  return `**** ${lastFour}`;
};

/**
 * Mask sort code - show only last 2 digits
 * Example: "12-34-56" → "**-**-56"
 */
export const maskSortCode = (sortCode: string): string => {
  if (!sortCode) return '**-**-**';

  const parts = sortCode.split('-');
  if (parts.length !== 3) return '**-**-**';

  return `**-**-${parts[2]}`;
};

/**
 * Mask card number - show only last 4 digits
 * Example: "1234567812345678" → "**** **** **** 5678"
 */
export const maskCardNumber = (cardNumber: string): string => {
  if (!cardNumber || cardNumber.length < 4) return '**** **** **** ****';
  const lastFour = cardNumber.slice(-4);
  return `**** **** **** ${lastFour}`;
};
```

---

### UK Validation Update

**File:** `web/src/utils/ukValidation.ts`

**Add sort code validation:**

```typescript
/**
 * Validate UK sort code format
 * Expected format: XX-XX-XX (6 digits with hyphens)
 */
export const isValidSortCode = (sortCode: string): boolean => {
  if (!sortCode) return false;

  // Remove spaces and convert to uppercase
  const cleaned = sortCode.replace(/\s/g, '');

  // Check format: XX-XX-XX
  const sortCodePattern = /^\d{2}-\d{2}-\d{2}$/;

  return sortCodePattern.test(cleaned);
};

/**
 * Format sort code input as user types
 * Automatically adds hyphens: 123456 → 12-34-56
 */
export const formatSortCodeInput = (input: string): string => {
  // Remove all non-digits
  const digits = input.replace(/\D/g, '');

  // Add hyphens after 2nd and 4th digits
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
};
```

---

## Testing Guide

### Manual Testing Checklist

**Homepage:**
- [ ] Navigate to `/` - Finance card now clickable
- [ ] Finance card shows record count
- [ ] Click Finance card → navigate to `/finance`

**Finance Domain Page:**
- [ ] See empty state message
- [ ] Click "Add Account" → modal opens
- [ ] Fill form with valid data → save → account appears in grouped list
- [ ] Try invalid sort code → see validation error
- [ ] Create duplicate (same account number + sort code) → see warning
- [ ] Verify records grouped by type (Current Accounts, Savings, etc.)

**Finance Record Detail:**
- [ ] Click account card → navigate to `/finance/:id`
- [ ] See all record fields displayed with sensitive data masked
- [ ] Account number shows as "**** 1234"
- [ ] Sort code shows as "**-**-56"
- [ ] Click "Show Full Details" → confirm → see full account/sort code
- [ ] Click "Edit" → modal opens with pre-filled data
- [ ] Update field → save → changes reflected
- [ ] Click "Delete" → confirmation dialog → confirm → record removed

**Security:**
- [ ] Verify account numbers never visible in browser console
- [ ] Verify sort codes never visible in browser console
- [ ] Verify masked data displays correctly on mobile
- [ ] Verify HTTPS enforced for all requests

---

## Verification Checklist

**Before marking story complete:**

- [ ] Finance card enabled on homepage
- [ ] Finance domain page functional
- [ ] Finance record CRUD works (Create, Read, Update, Delete)
- [ ] UK sort code validation working
- [ ] Sensitive data masking working correctly
- [ ] "Show Full Details" toggle functional
- [ ] Records grouped by account type
- [ ] Forms use existing Modal/Button/Input components
- [ ] Banknote icon (Lucide React) used throughout
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Breadcrumb navigation works
- [ ] Backend API calls successful (check Network tab)
- [ ] No console errors
- [ ] No sensitive data in console logs
- [ ] Minimum 10 frontend tests passing
- [ ] Property and Vehicles domains still functional (regression check)
- [ ] Premium design system maintained

---

## Implementation Notes

### Development Workflow

**Single Session: Finance Domain Implementation (6-8 hours)**

1. **Enable Finance Card (30 min)**
   - Update HomePage.tsx to enable finance domain
   - Test navigation to `/finance`

2. **Create Core Components (2-3 hours)**
   - FinanceDomainPage.tsx
   - FinanceRecordForm.tsx
   - FinanceRecordCard.tsx
   - SensitiveDataField.tsx (masking component)
   - Update App.tsx routing

3. **Data Security (1-2 hours)**
   - Create dataMasking.ts utility
   - Add sort code validation to ukValidation.ts
   - Implement masked/unmasked toggle
   - Test security measures

4. **API Integration (1 hour)**
   - Add finance methods to domains.ts
   - Create useFinanceRecords hook

5. **Detail View & Features (1-2 hours)**
   - FinanceRecordDetailPage.tsx
   - Grouped records display
   - Edit/delete functionality

6. **Testing & Polish (1-2 hours)**
   - Write frontend tests
   - Security testing (masking, console logs)
   - Test mobile responsiveness
   - Regression test Property and Vehicles
   - Final polish

---

## Key Patterns to Follow

**Sensitive Data Handling:**
```typescript
// ALWAYS mask in list view
<p>{maskAccountNumber(record.accountNumber)}</p>

// Show full data only on explicit user action
{showFull ? record.accountNumber : maskAccountNumber(record.accountNumber)}

// Never log sensitive data
console.log({ ...record, accountNumber: '[REDACTED]' });
```

**Sort Code Validation:**
```typescript
if (data.sortCode && !isValidSortCode(data.sortCode)) {
  setApiError('Invalid UK sort code format (should be XX-XX-XX)');
  return;
}
```

**Grouped Display:**
```typescript
const groupedRecords = records.reduce((groups, record) => {
  const type = record.recordType;
  if (!groups[type]) groups[type] = [];
  groups[type].push(record);
  return groups;
}, {});
```

---

## Gotchas to Avoid

❌ **Don't** log account numbers or sort codes (even in development)
❌ **Don't** display full account details in list view
❌ **Don't** skip sort code validation
❌ **Don't** forget to mask sensitive data in error messages

✅ **Do** mask sensitive data by default
✅ **Do** validate UK sort codes before submission
✅ **Do** group records by account type
✅ **Do** require explicit user action to show full details
✅ **Do** test security measures thoroughly

---

## Definition of Done

- [ ] Finance card enabled and clickable on homepage
- [ ] Finance domain page shows grouped record list
- [ ] Finance record form creates new records successfully
- [ ] Finance record detail view shows masked sensitive data
- [ ] "Show Full Details" toggle reveals full account/sort code
- [ ] Sort code validation working (XX-XX-XX format)
- [ ] Duplicate detection warns user
- [ ] Edit functionality updates records
- [ ] Delete functionality removes records with confirmation
- [ ] Records grouped by account type
- [ ] Breadcrumb navigation functional
- [ ] Premium design system maintained throughout
- [ ] Responsive on mobile/tablet/desktop
- [ ] Minimum 10 frontend tests passing
- [ ] Security tests passing (no sensitive data in logs)
- [ ] Property and Vehicles regression tests passing
- [ ] No console errors or warnings
- [ ] Code follows React/TypeScript best practices
- [ ] Git commit: "feat: Add Finance domain UI (Story 1.6)"

---

## Next Story

**Story 1.7: Remaining Domains UI (Employment, Government, Insurance, Legal, Services)**
- Enable all 5 remaining domain cards
- Follows exact same pattern as Stories 1.4, 1.5, 1.6
- Batch implementation for efficiency
- Completes all 8 domain UIs

---

**Story Created:** 2025-10-05
**Last Updated:** 2025-10-05
**Status:** Draft - Ready for Implementation
