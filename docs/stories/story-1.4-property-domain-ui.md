# Story 1.4: Property Domain UI - Homepage & Navigation

**Epic:** Life Domain Architecture Foundation (Epic 1)
**Story ID:** 1.4
**Estimated Effort:** 8-12 hours (2-3 development sessions)
**Priority:** High
**Status:** Draft
**Dependencies:** Story 1.1 (✓), Story 1.2 (✓), Story 1.3 (✓)

---

## User Story

**As a** household administrator,
**I want** to see life domain cards on my homepage and manage Property domain records through a dedicated UI,
**so that** I can organize my household information by life area instead of abstract bills/categories.

---

## Story Context

### Why This Story

Stories 1.1-1.3 built a comprehensive backend foundation:
- 8 domain models with CRUD APIs
- GridFS document storage
- UK validation, search, duplicate detection
- Audit trail

**Story 1.4 bridges backend to user value** by creating the first domain-specific UI. Property domain is chosen because:
- Most complex domain (validates UI can handle complexity)
- High immediate value (mortgage, utilities, rates)
- Establishes pattern for remaining 7 domains

### Existing System Integration

**Backend APIs Available (from Stories 1.1-1.3):**
- `GET/POST/PUT/DELETE /api/domains/property/records`
- `GET /api/domains/property/records/search?q=text`
- `GET /api/domains/property/records?priority=high&sort=renewalDate`
- `POST /api/domains/property/records/:id/documents` (file upload)
- `GET /api/domain-documents/:fileId` (file download)
- UK validation middleware (postcodes)
- Duplicate detection (postcode + address)

**Frontend Tech Stack:**
- React 18+ with TypeScript
- Vite build tool
- Premium design system (Inter font, Lucide React icons, Swiss spa aesthetic)
- Existing components: Modal, Button, Input, Card, Navigation

**Current Frontend State:**
- Using legacy Bills/Categories/Dashboard pages
- No domain-specific pages exist yet
- Navigation needs domain cards added

---

## Acceptance Criteria

### Functional Requirements

**AC1: Homepage with Domain Cards**
- ✅ Homepage displays 8 life domain cards in responsive grid (2x4 desktop, 1 column mobile)
- ✅ Each card shows: Domain icon (Lucide React), domain name, description, record count
- ✅ Only Property card is clickable (links to `/property`)
- ✅ Other 7 cards show "Coming Soon" overlay (greyed out)
- ✅ Card hover effect shows subtle elevation (premium design consistency)

**AC2: Property Domain Detail Page**
- ✅ Route `/property` shows Property domain detail view
- ✅ Page header shows: Property icon, "Property" title, "Add Record" button, total record count
- ✅ Empty state message when no records exist: "No property records yet. Add your first record to get started."
- ✅ Records display in card/list view showing: name, provider, renewal date, priority badge
- ✅ Click record card navigates to record detail view

**AC3: Property Record Form (Add/Edit)**
- ✅ "Add Record" button opens modal with Property-specific form
- ✅ Form fields (from PropertyRecord schema):
  - Name (required)
  - Record Type dropdown (mortgage, utility-electric, utility-gas, utility-water, home-insurance, rates)
  - Provider
  - Account Number
  - Postcode (with UK validation)
  - Contact Phone
  - Contact Email
  - Monthly Amount (£)
  - Renewal Date (date picker)
  - Priority (Critical/Important/Standard dropdown)
  - Notes (textarea)
- ✅ UK postcode validation shows error message if invalid format
- ✅ Duplicate detection: Warn if postcode + name match existing record
- ✅ Form validation: Name and Record Type are required
- ✅ Save button calls `POST /api/domains/property/records`
- ✅ Success: Close modal, refresh record list, show success toast
- ✅ Error: Show error message in modal, keep form open

**AC4: Property Record Detail View**
- ✅ Route `/property/:recordId` shows single record detail
- ✅ Display all record fields in read-only view
- ✅ "Edit" button opens form modal with pre-populated data
- ✅ "Delete" button shows confirmation dialog, then calls `DELETE /api/domains/property/records/:id`
- ✅ Documents section shows linked files (from Story 1.2)
- ✅ "Upload Document" button allows PDF/image upload via GridFS
- ✅ Downloaded documents retrieve via `GET /api/domain-documents/:fileId`

**AC5: Navigation Integration**
- ✅ Main navigation updated with "Home" link (domain cards)
- ✅ Breadcrumb trail shows: Home > Property > [Record Name]
- ✅ Current page highlighted in navigation

### Integration Requirements

**IR1: Existing Functionality Preserved**
- ✅ Google OAuth authentication still works
- ✅ Existing Bills/Categories/Dashboard pages still accessible (for now)
- ✅ Backend APIs unchanged (Story 1.1-1.3 endpoints work)

**IR2: Premium Design Consistency**
- ✅ Domain cards use existing Card component styling
- ✅ Forms use existing Modal, Button, Input components
- ✅ Lucide React icons throughout (no Material Design icons)
- ✅ Inter font family with established weight hierarchy
- ✅ Color palette matches premium transformation

**IR3: Responsive Design**
- ✅ Domain cards adapt to mobile/tablet/desktop breakpoints
- ✅ Forms are mobile-friendly
- ✅ Navigation works on all screen sizes

### Quality Requirements

**QR1: Testing**
- ✅ Component unit tests for DomainCard, PropertyRecordForm
- ✅ Integration test: Create property record end-to-end
- ✅ Integration test: Edit existing property record
- ✅ Integration test: Delete property record with confirmation
- ✅ Minimum 10 frontend tests for Story 1.4

**QR2: Error Handling**
- ✅ API errors display user-friendly messages
- ✅ Network errors show retry option
- ✅ Validation errors highlight specific fields
- ✅ Loading states prevent duplicate submissions

**QR3: Performance**
- ✅ Homepage domain cards load in < 500ms
- ✅ Property record list loads in < 1 second
- ✅ Form submissions respond in < 2 seconds

---

## Technical Specifications

### Component Architecture

Create the following new components in `web/src/`:

```
web/src/
├── pages/
│   ├── HomePage.tsx                    → Domain cards grid (NEW)
│   ├── PropertyDomainPage.tsx          → Property records list (NEW)
│   └── PropertyRecordDetailPage.tsx    → Single record view (NEW)
│
├── components/
│   ├── domain/
│   │   ├── DomainCard.tsx              → Reusable domain card (NEW)
│   │   ├── DomainGrid.tsx              → Grid layout wrapper (NEW)
│   │   └── DomainIcon.tsx              → Icon mapping utility (NEW)
│   │
│   ├── property/
│   │   ├── PropertyRecordForm.tsx      → Add/Edit form (NEW)
│   │   ├── PropertyRecordCard.tsx      → List item display (NEW)
│   │   └── PropertyRecordDetail.tsx    → Detail view component (NEW)
│   │
│   └── shared/
│       ├── Modal.tsx                   → Existing (REUSE)
│       ├── Button.tsx                  → Existing (REUSE)
│       ├── Input.tsx                   → Existing (REUSE)
│       └── Navigation.tsx              → Existing (ENHANCE with Home link)
│
├── hooks/
│   ├── usePropertyRecords.ts           → Fetch/mutate property records (NEW)
│   └── useDomainStats.ts               → Fetch record counts per domain (NEW)
│
├── services/
│   └── api/
│       └── domains.ts                  → API client for domain endpoints (NEW)
│
└── types/
    └── domain.ts                       → TypeScript types for domain records (NEW)
```

---

### Routing Configuration

Update `web/src/App.tsx` (or routing file):

```typescript
import HomePage from './pages/HomePage';
import PropertyDomainPage from './pages/PropertyDomainPage';
import PropertyRecordDetailPage from './pages/PropertyRecordDetailPage';

// Add routes:
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/property" element={<PropertyDomainPage />} />
  <Route path="/property/:recordId" element={<PropertyRecordDetailPage />} />

  {/* Existing routes preserved */}
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/bills" element={<Bills />} />
  {/* ... */}
</Routes>
```

---

### HomePage Component (Domain Cards Grid)

**File:** `web/src/pages/HomePage.tsx`

```typescript
import React from 'react';
import DomainGrid from '../components/domain/DomainGrid';
import DomainCard from '../components/domain/DomainCard';
import { useDomainStats } from '../hooks/useDomainStats';
import {
  Home,
  Car,
  Briefcase,
  FileText,
  Banknote,
  Shield,
  Scale,
  Wrench
} from 'lucide-react';

const DOMAINS = [
  {
    id: 'property',
    name: 'Property',
    description: 'Mortgage, utilities, home insurance, rates',
    icon: Home,
    enabled: true
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    description: 'Car finance, MOT, insurance, road tax',
    icon: Car,
    enabled: false
  },
  {
    id: 'employment',
    name: 'Employment',
    description: 'Payroll, pension, workplace benefits',
    icon: Briefcase,
    enabled: false
  },
  {
    id: 'government',
    name: 'Government',
    description: 'NI number, tax, licences, passports',
    icon: FileText,
    enabled: false
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Bank accounts, savings, ISAs, loans',
    icon: Banknote,
    enabled: false
  },
  {
    id: 'insurance',
    name: 'Insurance & Protection',
    description: 'Life, income protection, warranties',
    icon: Shield,
    enabled: false
  },
  {
    id: 'legal',
    name: 'Legal & Estate',
    description: 'Wills, power of attorney, deeds',
    icon: Scale,
    enabled: false
  },
  {
    id: 'services',
    name: 'Household Services',
    description: 'Tradespeople, service providers',
    icon: Wrench,
    enabled: false
  }
];

const HomePage: React.FC = () => {
  const { data: stats, isLoading } = useDomainStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Life Domains
        </h1>
        <p className="text-slate-600 mt-2">
          Organize your household information by life area
        </p>
      </header>

      <DomainGrid>
        {DOMAINS.map((domain) => (
          <DomainCard
            key={domain.id}
            domain={domain}
            recordCount={stats?.[domain.id] || 0}
            isLoading={isLoading}
          />
        ))}
      </DomainGrid>
    </div>
  );
};

export default HomePage;
```

---

### DomainCard Component

**File:** `web/src/components/domain/DomainCard.tsx`

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface Domain {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
}

interface DomainCardProps {
  domain: Domain;
  recordCount: number;
  isLoading: boolean;
}

const DomainCard: React.FC<DomainCardProps> = ({
  domain,
  recordCount,
  isLoading
}) => {
  const navigate = useNavigate();
  const Icon = domain.icon;

  const handleClick = () => {
    if (domain.enabled) {
      navigate(`/${domain.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-6 rounded-xl border transition-all
        ${domain.enabled
          ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 border-slate-200 bg-white'
          : 'cursor-not-allowed opacity-50 border-slate-100 bg-slate-50'
        }
      `}
    >
      {!domain.enabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
          <span className="text-sm font-medium text-slate-500">
            Coming Soon
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-slate-100">
          <Icon className="w-6 h-6 text-slate-700" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {domain.name}
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            {domain.description}
          </p>

          {domain.enabled && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
                {isLoading ? '...' : `${recordCount} records`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DomainCard;
```

---

### Property Domain Page Component

**File:** `web/src/pages/PropertyDomainPage.tsx`

```typescript
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PropertyRecordCard from '../components/property/PropertyRecordCard';
import PropertyRecordForm from '../components/property/PropertyRecordForm';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import { usePropertyRecords } from '../hooks/usePropertyRecords';

const PropertyDomainPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: records, isLoading } = usePropertyRecords();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">
            Property
          </h1>
          <p className="text-slate-600">
            Manage mortgage, utilities, home insurance, and rates
          </p>
        </div>

        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Record
        </Button>
      </header>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">
          Loading records...
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">
            No property records yet. Add your first record to get started.
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            Add First Record
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((record) => (
            <PropertyRecordCard key={record._id} record={record} />
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Add Property Record"
      >
        <PropertyRecordForm
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default PropertyDomainPage;
```

---

### PropertyRecordForm Component

**File:** `web/src/components/property/PropertyRecordForm.tsx`

```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { createPropertyRecord } from '../../services/api/domains';
import { isValidPostcode } from '../../utils/ukValidation';

interface PropertyFormData {
  name: string;
  recordType: string;
  provider?: string;
  accountNumber?: string;
  postcode?: string;
  contactPhone?: string;
  contactEmail?: string;
  monthlyAmount?: number;
  renewalDate?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
}

interface PropertyRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const RECORD_TYPES = [
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'utility-electric', label: 'Electricity' },
  { value: 'utility-gas', label: 'Gas' },
  { value: 'utility-water', label: 'Water' },
  { value: 'home-insurance', label: 'Home Insurance' },
  { value: 'rates', label: 'Domestic Rates' }
];

const PropertyRecordForm: React.FC<PropertyRecordFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<PropertyFormData>();
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: PropertyFormData) => {
    setApiError('');
    setIsSubmitting(true);

    // UK postcode validation
    if (data.postcode && !isValidPostcode(data.postcode)) {
      setApiError('Invalid UK postcode format');
      setIsSubmitting(false);
      return;
    }

    try {
      await createPropertyRecord(data);
      onSuccess();
    } catch (error: any) {
      setApiError(error.message || 'Failed to create record');
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
        label="Name *"
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Record Type *
        </label>
        <select
          {...register('recordType', { required: 'Record type is required' })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
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

      <Input label="Provider" {...register('provider')} />
      <Input label="Account Number" {...register('accountNumber')} />
      <Input label="Postcode" {...register('postcode')} />
      <Input label="Contact Phone" {...register('contactPhone')} />
      <Input label="Contact Email" type="email" {...register('contactEmail')} />
      <Input
        label="Monthly Amount (£)"
        type="number"
        step="0.01"
        {...register('monthlyAmount')}
      />
      <Input label="Renewal Date" type="date" {...register('renewalDate')} />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Priority
        </label>
        <select
          {...register('priority')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
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
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Record'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default PropertyRecordForm;
```

---

### API Service Layer

**File:** `web/src/services/api/domains.ts`

```typescript
const API_BASE = '/api/domains';

export interface PropertyRecord {
  _id: string;
  name: string;
  recordType: string;
  provider?: string;
  accountNumber?: string;
  postcode?: string;
  contactPhone?: string;
  contactEmail?: string;
  monthlyAmount?: number;
  renewalDate?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
  documentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export const getPropertyRecords = async (): Promise<PropertyRecord[]> => {
  const response = await fetch(`${API_BASE}/property/records`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch property records');
  return response.json();
};

export const createPropertyRecord = async (data: Partial<PropertyRecord>): Promise<PropertyRecord> => {
  const response = await fetch(`${API_BASE}/property/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create record');
  }
  return response.json();
};

export const updatePropertyRecord = async (
  id: string,
  data: Partial<PropertyRecord>
): Promise<PropertyRecord> => {
  const response = await fetch(`${API_BASE}/property/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update record');
  return response.json();
};

export const deletePropertyRecord = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/property/records/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete record');
};
```

---

### React Hooks

**File:** `web/src/hooks/usePropertyRecords.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPropertyRecords,
  createPropertyRecord,
  updatePropertyRecord,
  deletePropertyRecord
} from '../services/api/domains';

export const usePropertyRecords = () => {
  return useQuery({
    queryKey: ['property-records'],
    queryFn: getPropertyRecords
  });
};

export const useCreatePropertyRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPropertyRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-records'] });
    }
  });
};
```

---

## Testing Guide

### Manual Testing Checklist

**Homepage:**
- [ ] Navigate to `/` - see 8 domain cards
- [ ] Property card shows "0 records" initially
- [ ] Property card is clickable
- [ ] Other 7 cards show "Coming Soon" overlay
- [ ] Cards are responsive (test mobile, tablet, desktop)

**Property Domain Page:**
- [ ] Click Property card → navigate to `/property`
- [ ] See empty state message
- [ ] Click "Add Record" → modal opens
- [ ] Fill form with valid data → save → record appears in list
- [ ] Try invalid postcode → see validation error
- [ ] Create duplicate (same postcode + name) → see warning

**Property Record Detail:**
- [ ] Click record card → navigate to `/property/:id`
- [ ] See all record fields displayed
- [ ] Click "Edit" → modal opens with pre-filled data
- [ ] Update field → save → changes reflected
- [ ] Click "Delete" → confirmation dialog → confirm → record removed

---

## Verification Checklist

**Before marking story complete:**

- [ ] All 8 domain cards visible on homepage
- [ ] Property domain page functional
- [ ] Property record CRUD works (Create, Read, Update, Delete)
- [ ] UK postcode validation working
- [ ] Forms use existing Modal/Button/Input components
- [ ] Lucide React icons used throughout
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Breadcrumb navigation works
- [ ] Backend API calls successful (check Network tab)
- [ ] No console errors
- [ ] Minimum 10 frontend tests passing
- [ ] Existing backend tests still passing (regression check)
- [ ] Premium design system maintained

---

## Implementation Notes

### Development Workflow

**Session 1: Homepage & Navigation (3-4 hours)**
1. Create HomePage component with domain cards grid
2. Create DomainCard component with premium styling
3. Update Navigation with Home link
4. Create useDomainStats hook (record counts)
5. Test homepage responsiveness

**Session 2: Property Domain Page & Forms (4-5 hours)**
1. Create PropertyDomainPage component
2. Create PropertyRecordForm component
3. Create API service layer (domains.ts)
4. Create usePropertyRecords hook
5. Wire up create/list functionality
6. Test form validation

**Session 3: Detail View & Polish (3-4 hours)**
1. Create PropertyRecordDetailPage
2. Add edit functionality
3. Add delete functionality with confirmation
4. Add breadcrumb navigation
5. Polish UI/UX
6. Write frontend tests
7. Final regression testing

**Total: 8-12 hours across 2-3 sessions**

---

## Key Patterns to Follow

**Component Reuse:**
```typescript
// ALWAYS reuse existing components
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Input from '../shared/Input';
```

**API Error Handling:**
```typescript
try {
  await createPropertyRecord(data);
  onSuccess();
} catch (error: any) {
  setApiError(error.message || 'Failed to create record');
}
```

**Premium Styling Pattern:**
```typescript
// Use existing design tokens
className="rounded-xl border border-slate-200 hover:shadow-lg transition-all"
```

---

## Gotchas to Avoid

❌ **Don't** create new design tokens (use existing Inter font, slate colors)
❌ **Don't** use Material Design icons (use Lucide React only)
❌ **Don't** skip UK postcode validation
❌ **Don't** forget to test mobile responsiveness
❌ **Don't** hardcode API URLs (use relative paths)

✅ **Do** reuse existing Modal/Button/Input components
✅ **Do** validate UK postcodes before submission
✅ **Do** show loading states during API calls
✅ **Do** test on all screen sizes
✅ **Do** follow established naming conventions

---

## Definition of Done

- [ ] Homepage displays 8 domain cards (1 enabled, 7 disabled)
- [ ] Property domain page shows record list
- [ ] Property record form creates new records successfully
- [ ] Property record detail view shows all fields
- [ ] Edit functionality updates records
- [ ] Delete functionality removes records with confirmation
- [ ] UK postcode validation working
- [ ] Duplicate detection warns user
- [ ] Navigation includes Home link
- [ ] Breadcrumb trail functional
- [ ] Premium design system maintained throughout
- [ ] Responsive on mobile/tablet/desktop
- [ ] Minimum 10 frontend tests passing
- [ ] Backend regression tests passing (47 tests from 1.1-1.3)
- [ ] No console errors or warnings
- [ ] Code follows React/TypeScript best practices
- [ ] Git commit: "feat: Add Property domain UI (Story 1.4)"

---

## Next Story

**Story 1.5: Vehicles Domain UI**
- Follows exact same pattern as Story 1.4
- Enable Vehicles card on homepage
- Create Vehicles domain page
- Create Vehicles record form with vehicle-specific fields
- Much faster implementation (pattern established)

---

**Story Created:** 2025-10-04
**Last Updated:** 2025-10-04
**Status:** Draft - Ready for Review
