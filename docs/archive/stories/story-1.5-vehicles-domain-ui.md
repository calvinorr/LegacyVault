# Story 1.5: Vehicles Domain UI - Homepage & Navigation

**Epic:** Life Domain Architecture Foundation (Epic 1)
**Story ID:** 1.5
**Estimated Effort:** 6-8 hours (1-2 development sessions)
**Priority:** High
**Status:** Draft
**Dependencies:** Story 1.1 (✓), Story 1.2 (✓), Story 1.3 (✓), Story 1.4 (✓)

---

## User Story

**As a** household administrator,
**I want** to manage Vehicle domain records through a dedicated UI,
**so that** I can organize vehicle details, MOT, insurance, road tax, and finance information in one place.

---

## Story Context

### Why This Story

Story 1.4 established the domain UI pattern with Property. Story 1.5 applies this proven pattern to the Vehicles domain, which is the second most valuable domain for UK households.

**Vehicles domain is important because:**
- High-value assets requiring tracking (MOT, insurance, road tax, finance)
- Multiple renewal dates to manage (MOT, insurance, tax)
- UK-specific requirements (registration plates, MOT dates)
- Significant monthly costs (finance payments, insurance premiums)

### Existing System Integration

**Backend APIs Available (from Stories 1.1-1.3):**
- `GET/POST/PUT/DELETE /api/domains/vehicles/records`
- `GET /api/domains/vehicles/records/search?q=text`
- `GET /api/domains/vehicles/records?priority=high&sort=renewalDate`
- `POST /api/domains/vehicles/records/:id/documents` (file upload)
- `GET /api/domain-documents/:fileId` (file download)
- UK and NI registration plate validation middleware
- Duplicate detection (registration number)

**Frontend Pattern Established (Story 1.4):**
- Domain card grid on HomePage
- Domain-specific pages (list/detail)
- Domain record forms with validation
- Premium design system components
- Lucide React icons

**Current Frontend State:**
- HomePage shows Vehicles card as "Coming Soon"
- Property domain fully functional
- Pattern ready to replicate for Vehicles

---

## Acceptance Criteria

### Functional Requirements

**AC1: Enable Vehicles Card on HomePage**
- ✅ Vehicles card clickable (remove "Coming Soon" overlay)
- ✅ Card shows vehicle record count
- ✅ Clicking card navigates to `/vehicles`

**AC2: Vehicles Domain Detail Page**
- ✅ Route `/vehicles` shows Vehicles domain detail view
- ✅ Page header shows: Car icon, "Vehicles" title, "Add Record" button, total record count
- ✅ Empty state message: "No vehicle records yet. Add your first vehicle to get started."
- ✅ Records display in card/list view showing: name, registration, MOT/insurance/tax status, priority badge
- ✅ Click record card navigates to record detail view

**AC3: Vehicle Record Form (Add/Edit)**
- ✅ "Add Record" button opens modal with Vehicle-specific form
- ✅ Form fields (from VehicleRecord schema):
  - Name (required) - e.g., "Family Car"
  - Record Type dropdown (vehicle-details, insurance, mot, finance, road-tax)
  - Registration Number (UK format validation)
  - Make
  - Model
  - Purchase Date (date picker)
  - Finance Provider
  - Finance Monthly Payment (£)
  - MOT Expiry Date (date picker)
  - Insurance Renewal Date (date picker)
  - Road Tax Expiry Date (date picker)
  - Priority (Critical/Important/Standard dropdown)
  - Notes (textarea)
- ✅ UK registration plate validation shows error if invalid format
- ✅ Duplicate detection: Warn if registration number matches existing record
- ✅ Form validation: Name and Record Type are required
- ✅ Save button calls `POST /api/domains/vehicles/records`
- ✅ Success: Close modal, refresh record list, show success toast
- ✅ Error: Show error message in modal, keep form open

**AC4: Vehicle Record Detail View**
- ✅ Route `/vehicles/:recordId` shows single record detail
- ✅ Display all record fields in read-only view
- ✅ Show expiry status indicators (MOT/Insurance/Tax expired/expiring soon/valid)
- ✅ "Edit" button opens form modal with pre-populated data
- ✅ "Delete" button shows confirmation dialog, then calls `DELETE /api/domains/vehicles/records/:id`
- ✅ Documents section shows linked files (from Story 1.2)
- ✅ "Upload Document" button allows PDF/image upload via GridFS
- ✅ Downloaded documents retrieve via `GET /api/domain-documents/:fileId`

**AC5: Navigation Integration**
- ✅ Breadcrumb trail shows: Home > Vehicles > [Vehicle Name]
- ✅ Current page highlighted in navigation

### Integration Requirements

**IR1: Existing Functionality Preserved**
- ✅ Google OAuth authentication still works
- ✅ Property domain page still accessible and functional
- ✅ Existing Bills/Categories/Dashboard pages still accessible
- ✅ Backend APIs unchanged

**IR2: Premium Design Consistency**
- ✅ Vehicle cards use existing Card component styling
- ✅ Forms use existing Modal, Button, Input components
- ✅ Lucide React icons throughout (Car icon for domain)
- ✅ Inter font family with established weight hierarchy
- ✅ Color palette matches premium transformation

**IR3: Responsive Design**
- ✅ Vehicle cards adapt to mobile/tablet/desktop breakpoints
- ✅ Forms are mobile-friendly
- ✅ Navigation works on all screen sizes

### Quality Requirements

**QR1: Testing**
- ✅ Component unit tests for VehicleRecordForm
- ✅ Integration test: Create vehicle record end-to-end
- ✅ Integration test: Edit existing vehicle record
- ✅ Integration test: Delete vehicle record with confirmation
- ✅ Minimum 8 frontend tests for Story 1.5

**QR2: Error Handling**
- ✅ API errors display user-friendly messages
- ✅ Network errors show retry option
- ✅ Validation errors highlight specific fields
- ✅ Loading states prevent duplicate submissions

**QR3: Performance**
- ✅ Vehicle record list loads in < 1 second
- ✅ Form submissions respond in < 2 seconds

---

## Technical Specifications

### Component Architecture

Create the following new components in `web/src/`:

```
web/src/
├── pages/
│   ├── VehiclesDomainPage.tsx          → Vehicles records list (NEW)
│   └── VehicleRecordDetailPage.tsx     → Single record view (NEW)
│
├── components/
│   ├── domain/
│   │   ├── DomainCard.tsx              → Existing (UPDATE: enable vehicles)
│   │
│   ├── vehicles/
│   │   ├── VehicleRecordForm.tsx       → Add/Edit form (NEW)
│   │   ├── VehicleRecordCard.tsx       → List item display (NEW)
│   │   └── VehicleRecordDetail.tsx     → Detail view component (NEW)
│   │
│   └── shared/
│       ├── Modal.tsx                   → Existing (REUSE)
│       ├── Button.tsx                  → Existing (REUSE)
│       └── Input.tsx                   → Existing (REUSE)
│
├── hooks/
│   └── useVehicleRecords.ts            → Fetch/mutate vehicle records (NEW)
│
├── services/
│   └── api/
│       └── domains.ts                  → Existing (ADD vehicle methods)
│
└── types/
    └── domain.ts                       → Existing (ADD VehicleRecord type)
```

---

### Routing Configuration

Update `web/src/App.tsx`:

```typescript
import VehiclesDomainPage from './pages/VehiclesDomainPage';
import VehicleRecordDetailPage from './pages/VehicleRecordDetailPage';

// Add routes:
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/property" element={<PropertyDomainPage />} />
  <Route path="/property/:recordId" element={<PropertyRecordDetailPage />} />

  {/* NEW: Vehicles routes */}
  <Route path="/vehicles" element={<VehiclesDomainPage />} />
  <Route path="/vehicles/:recordId" element={<VehicleRecordDetailPage />} />

  {/* Existing routes preserved */}
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/bills" element={<Bills />} />
</Routes>
```

---

### Update HomePage Component (Enable Vehicles Card)

**File:** `web/src/pages/HomePage.tsx`

**Change:** Update the `vehicles` domain object:

```typescript
// BEFORE (Story 1.4):
{
  id: 'vehicles',
  name: 'Vehicles',
  description: 'Car finance, MOT, insurance, road tax',
  icon: Car,
  enabled: false  // ← Currently disabled
},

// AFTER (Story 1.5):
{
  id: 'vehicles',
  name: 'Vehicles',
  description: 'Car finance, MOT, insurance, road tax',
  icon: Car,
  enabled: true  // ← Enable for Story 1.5
},
```

---

### Vehicles Domain Page Component

**File:** `web/src/pages/VehiclesDomainPage.tsx`

```typescript
import React, { useState } from 'react';
import { Plus, Car } from 'lucide-react';
import VehicleRecordCard from '../components/vehicles/VehicleRecordCard';
import VehicleRecordForm from '../components/vehicles/VehicleRecordForm';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import { useVehicleRecords } from '../hooks/useVehicleRecords';

const VehiclesDomainPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: records, isLoading } = useVehicleRecords();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100">
            <Car className="w-8 h-8 text-slate-700" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">
              Vehicles
            </h1>
            <p className="text-slate-600">
              Manage vehicle details, MOT, insurance, road tax, and finance
            </p>
          </div>
        </div>

        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Vehicle
        </Button>
      </header>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">
          Loading vehicles...
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">
            No vehicle records yet. Add your first vehicle to get started.
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            Add First Vehicle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((record) => (
            <VehicleRecordCard key={record._id} record={record} />
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Add Vehicle Record"
      >
        <VehicleRecordForm
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default VehiclesDomainPage;
```

---

### VehicleRecordForm Component

**File:** `web/src/components/vehicles/VehicleRecordForm.tsx`

```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { createVehicleRecord } from '../../services/api/domains';
import { isValidUKRegistration } from '../../utils/ukValidation';

interface VehicleFormData {
  name: string;
  recordType: string;
  registration?: string;
  make?: string;
  model?: string;
  purchaseDate?: string;
  financeProvider?: string;
  financeMonthlyPayment?: number;
  motExpiryDate?: string;
  insuranceRenewalDate?: string;
  roadTaxExpiryDate?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
}

interface VehicleRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: VehicleFormData;
}

const RECORD_TYPES = [
  { value: 'vehicle-details', label: 'Vehicle Details' },
  { value: 'insurance', label: 'Vehicle Insurance' },
  { value: 'mot', label: 'MOT' },
  { value: 'finance', label: 'Vehicle Finance' },
  { value: 'road-tax', label: 'Road Tax' }
];

const VehicleRecordForm: React.FC<VehicleRecordFormProps> = ({
  onSuccess,
  onCancel,
  initialData
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<VehicleFormData>({
    defaultValues: initialData
  });
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: VehicleFormData) => {
    setApiError('');
    setIsSubmitting(true);

    // UK registration validation
    if (data.registration && !isValidUKRegistration(data.registration)) {
      setApiError('Invalid UK registration plate format');
      setIsSubmitting(false);
      return;
    }

    try {
      await createVehicleRecord(data);
      onSuccess();
    } catch (error: any) {
      setApiError(error.message || 'Failed to create vehicle record');
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
        placeholder="e.g., Family Car, Work Van"
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Record Type *
        </label>
        <select
          {...register('recordType', { required: 'Record type is required' })}
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
        label="Registration Number"
        placeholder="AB12 CDE"
        {...register('registration')}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Make" placeholder="e.g., Ford" {...register('make')} />
        <Input label="Model" placeholder="e.g., Focus" {...register('model')} />
      </div>

      <Input label="Purchase Date" type="date" {...register('purchaseDate')} />

      <div className="border-t border-slate-200 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Finance Details</h3>
        <Input label="Finance Provider" {...register('financeProvider')} />
        <Input
          label="Monthly Payment (£)"
          type="number"
          step="0.01"
          {...register('financeMonthlyPayment')}
        />
      </div>

      <div className="border-t border-slate-200 pt-4 mt-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Renewal Dates</h3>
        <Input label="MOT Expiry Date" type="date" {...register('motExpiryDate')} />
        <Input label="Insurance Renewal Date" type="date" {...register('insuranceRenewalDate')} />
        <Input label="Road Tax Expiry Date" type="date" {...register('roadTaxExpiryDate')} />
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
          {isSubmitting ? 'Saving...' : 'Save Vehicle'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default VehicleRecordForm;
```

---

### VehicleRecordCard Component

**File:** `web/src/components/vehicles/VehicleRecordCard.tsx`

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { VehicleRecord } from '../../types/domain';

interface VehicleRecordCardProps {
  record: VehicleRecord;
}

const VehicleRecordCard: React.FC<VehicleRecordCardProps> = ({ record }) => {
  const navigate = useNavigate();

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;

    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { icon: AlertCircle, color: 'text-red-600', label: 'Expired' };
    } else if (daysUntilExpiry <= 30) {
      return { icon: Clock, color: 'text-amber-600', label: `${daysUntilExpiry} days` };
    } else {
      return { icon: CheckCircle, color: 'text-green-600', label: 'Valid' };
    }
  };

  const motStatus = getExpiryStatus(record.motExpiryDate);
  const insuranceStatus = getExpiryStatus(record.insuranceRenewalDate);
  const taxStatus = getExpiryStatus(record.roadTaxExpiryDate);

  return (
    <div
      onClick={() => navigate(`/vehicles/${record._id}`)}
      className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-slate-100">
          <Car className="w-5 h-5 text-slate-700" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {record.name}
          </h3>
          {record.registration && (
            <p className="text-sm font-mono text-slate-600 mb-1">
              {record.registration}
            </p>
          )}
          {record.make && record.model && (
            <p className="text-sm text-slate-500">
              {record.make} {record.model}
            </p>
          )}
        </div>
      </div>

      {(motStatus || insuranceStatus || taxStatus) && (
        <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
          {motStatus && (
            <div className="flex items-center gap-2">
              <motStatus.icon className={`w-4 h-4 ${motStatus.color}`} />
              <span className="text-xs text-slate-600">MOT: {motStatus.label}</span>
            </div>
          )}
          {insuranceStatus && (
            <div className="flex items-center gap-2">
              <insuranceStatus.icon className={`w-4 h-4 ${insuranceStatus.color}`} />
              <span className="text-xs text-slate-600">Insurance: {insuranceStatus.label}</span>
            </div>
          )}
          {taxStatus && (
            <div className="flex items-center gap-2">
              <taxStatus.icon className={`w-4 h-4 ${taxStatus.color}`} />
              <span className="text-xs text-slate-600">Tax: {taxStatus.label}</span>
            </div>
          )}
        </div>
      )}

      {record.priority !== 'Standard' && (
        <div className="mt-3">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            record.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {record.priority}
          </span>
        </div>
      )}
    </div>
  );
};

export default VehicleRecordCard;
```

---

### API Service Layer Updates

**File:** `web/src/services/api/domains.ts`

**Add these methods:**

```typescript
export interface VehicleRecord {
  _id: string;
  name: string;
  recordType: string;
  registration?: string;
  make?: string;
  model?: string;
  purchaseDate?: string;
  financeProvider?: string;
  financeMonthlyPayment?: number;
  motExpiryDate?: string;
  insuranceRenewalDate?: string;
  roadTaxExpiryDate?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
  documentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export const getVehicleRecords = async (): Promise<VehicleRecord[]> => {
  const response = await fetch(`${API_BASE}/vehicles/records`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch vehicle records');
  return response.json();
};

export const createVehicleRecord = async (data: Partial<VehicleRecord>): Promise<VehicleRecord> => {
  const response = await fetch(`${API_BASE}/vehicles/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create vehicle record');
  }
  return response.json();
};

export const updateVehicleRecord = async (
  id: string,
  data: Partial<VehicleRecord>
): Promise<VehicleRecord> => {
  const response = await fetch(`${API_BASE}/vehicles/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update vehicle record');
  return response.json();
};

export const deleteVehicleRecord = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/vehicles/records/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete vehicle record');
};
```

---

### React Hooks

**File:** `web/src/hooks/useVehicleRecords.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVehicleRecords,
  createVehicleRecord,
  updateVehicleRecord,
  deleteVehicleRecord
} from '../services/api/domains';

export const useVehicleRecords = () => {
  return useQuery({
    queryKey: ['vehicle-records'],
    queryFn: getVehicleRecords
  });
};

export const useCreateVehicleRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVehicleRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};

export const useUpdateVehicleRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateVehicleRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-records'] });
    }
  });
};

export const useDeleteVehicleRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVehicleRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-records'] });
      queryClient.invalidateQueries({ queryKey: ['domain-stats'] });
    }
  });
};
```

---

### UK Validation Utility Update

**File:** `web/src/utils/ukValidation.ts`

**Add UK registration validation:**

```typescript
/**
 * Validate UK vehicle registration plate
 * Supports various UK formats:
 * - Current format: AB12 CDE (2001-present)
 * - Prefix format: A123 BCD (1983-2001)
 * - Suffix format: ABC 123D (1963-1983)
 * - Dateless format: ABC 123 (pre-1963)
 */
export const isValidUKRegistration = (registration: string): boolean => {
  if (!registration) return false;

  const reg = registration.replace(/\s/g, '').toUpperCase();

  // Current format (2001-present): AB12CDE
  const currentFormat = /^[A-Z]{2}[0-9]{2}[A-Z]{3}$/;

  // Prefix format (1983-2001): A123BCD
  const prefixFormat = /^[A-Z][0-9]{1,3}[A-Z]{3}$/;

  // Suffix format (1963-1983): ABC123D
  const suffixFormat = /^[A-Z]{3}[0-9]{1,3}[A-Z]$/;

  // Dateless format (pre-1963): ABC123
  const datelessFormat = /^[A-Z]{1,3}[0-9]{1,4}$/;

  return (
    currentFormat.test(reg) ||
    prefixFormat.test(reg) ||
    suffixFormat.test(reg) ||
    datelessFormat.test(reg)
  );
};
```

---

## Testing Guide

### Manual Testing Checklist

**Homepage:**
- [ ] Navigate to `/` - Vehicles card now clickable
- [ ] Vehicles card shows record count
- [ ] Click Vehicles card → navigate to `/vehicles`

**Vehicles Domain Page:**
- [ ] See empty state message
- [ ] Click "Add Vehicle" → modal opens
- [ ] Fill form with valid data → save → vehicle appears in list
- [ ] Try invalid registration → see validation error
- [ ] Create duplicate (same registration) → see warning

**Vehicle Record Detail:**
- [ ] Click vehicle card → navigate to `/vehicles/:id`
- [ ] See all record fields displayed
- [ ] See expiry status indicators (MOT/Insurance/Tax)
- [ ] Click "Edit" → modal opens with pre-filled data
- [ ] Update field → save → changes reflected
- [ ] Click "Delete" → confirmation dialog → confirm → record removed

**Expiry Status Logic:**
- [ ] Expired dates show red alert icon + "Expired"
- [ ] Dates within 30 days show amber clock + "X days"
- [ ] Future dates show green check + "Valid"

---

## Verification Checklist

**Before marking story complete:**

- [ ] Vehicles card enabled on homepage
- [ ] Vehicles domain page functional
- [ ] Vehicle record CRUD works (Create, Read, Update, Delete)
- [ ] UK registration validation working
- [ ] Expiry status indicators showing correctly
- [ ] Forms use existing Modal/Button/Input components
- [ ] Car icon (Lucide React) used throughout
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Breadcrumb navigation works
- [ ] Backend API calls successful (check Network tab)
- [ ] No console errors
- [ ] Minimum 8 frontend tests passing
- [ ] Property domain still functional (regression check)
- [ ] Premium design system maintained

---

## Implementation Notes

### Development Workflow

**Single Session: Vehicles Domain Implementation (6-8 hours)**

1. **Enable Vehicles Card (30 min)**
   - Update HomePage.tsx to enable vehicles domain
   - Test navigation to `/vehicles`

2. **Create Core Components (2-3 hours)**
   - VehiclesDomainPage.tsx
   - VehicleRecordForm.tsx
   - VehicleRecordCard.tsx
   - Update App.tsx routing

3. **API Integration (1-2 hours)**
   - Add vehicle methods to domains.ts
   - Create useVehicleRecords hook
   - Add UK registration validation

4. **Detail View & Features (2 hours)**
   - VehicleRecordDetailPage.tsx
   - Expiry status indicators
   - Edit/delete functionality

5. **Testing & Polish (1-2 hours)**
   - Write frontend tests
   - Test mobile responsiveness
   - Regression test Property domain
   - Final polish

---

## Key Patterns to Follow

**Copy from Property Domain:**
```typescript
// Use Property components as reference
// Copy structure, rename Property → Vehicle
// Adjust fields to match VehicleRecord schema
```

**Expiry Status Pattern:**
```typescript
// Calculate days until expiry
const daysUntilExpiry = Math.floor(
  (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
);

// Show appropriate status
if (daysUntilExpiry < 0) return 'Expired';
if (daysUntilExpiry <= 30) return 'Expiring Soon';
return 'Valid';
```

**UK Registration Validation:**
```typescript
if (data.registration && !isValidUKRegistration(data.registration)) {
  setApiError('Invalid UK registration plate format');
  return;
}
```

---

## Gotchas to Avoid

❌ **Don't** skip UK registration validation
❌ **Don't** forget to enable the vehicles card on HomePage
❌ **Don't** hardcode expiry thresholds (use configurable values)
❌ **Don't** forget to invalidate domain-stats query after CRUD operations

✅ **Do** reuse Property domain components as templates
✅ **Do** show expiry status indicators for MOT/Insurance/Tax
✅ **Do** validate UK registration formats
✅ **Do** test responsive design on mobile

---

## Definition of Done

- [ ] Vehicles card enabled and clickable on homepage
- [ ] Vehicles domain page shows record list
- [ ] Vehicle record form creates new records successfully
- [ ] Vehicle record detail view shows all fields
- [ ] Expiry status indicators functional (MOT/Insurance/Tax)
- [ ] Edit functionality updates records
- [ ] Delete functionality removes records with confirmation
- [ ] UK registration validation working
- [ ] Duplicate detection warns user
- [ ] Breadcrumb navigation functional
- [ ] Premium design system maintained throughout
- [ ] Responsive on mobile/tablet/desktop
- [ ] Minimum 8 frontend tests passing
- [ ] Property domain regression tests passing
- [ ] Backend tests still passing (38 tests from 1.1-1.3)
- [ ] No console errors or warnings
- [ ] Code follows React/TypeScript best practices
- [ ] Git commit: "feat: Add Vehicles domain UI (Story 1.5)"

---

## Next Story

**Story 1.6: Employment Domain UI**
- Follows exact same pattern as Stories 1.4 and 1.5
- Enable Employment card on homepage
- Create Employment domain page
- Employment-specific fields: employer, pension, benefits
- Much faster implementation (pattern well-established)

---

**Story Created:** 2025-10-04
**Last Updated:** 2025-10-04
**Status:** Draft - Ready for Implementation
