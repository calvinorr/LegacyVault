# Story 1.9: Emergency View - Critical Information Access

**Epic:** Life Domain Architecture Foundation (Epic 1)
**Story ID:** 1.9
**Estimated Effort:** 6-10 hours (1-2 development sessions)
**Priority:** Medium
**Status:** Draft
**Dependencies:** Story 1.1 (✓), Story 1.2 (✓), Story 1.3 (✓), Story 1.4 (✓), Story 1.5 (✓), Story 1.6 (✓), Story 1.7 (✓), Story 1.8 (✓)

---

## User Story

**As a** household administrator,
**I want** to access critical household information quickly during an emergency,
**so that** I can find essential contact numbers, policy numbers, and account details when time is critical (medical emergency, property damage, vehicle breakdown, etc.).

---

## Story Context

### Why This Story

Stories 1.4-1.8 completed all domain UIs and cross-domain features. Story 1.9 adds the final Epic 1 feature: a dedicated emergency view for rapid access to critical records during household emergencies.

**Real-world emergency scenarios:**
- **Medical Emergency:** Need life insurance policy number, GP contact, critical illness cover details
- **Property Emergency:** Burst pipe → need home insurance policy, plumber contact, emergency services
- **Vehicle Breakdown:** Need breakdown cover details, vehicle insurance, MOT certificate
- **Legal Emergency:** Need solicitor contact, will location, power of attorney details
- **Financial Emergency:** Need main bank account details, emergency credit card

**Why this matters:**
- Stressful situations impair memory and decision-making
- Fumbling through 8 domain pages wastes critical time
- Partner/family may not know where to find information
- Emergency services may request immediate information

### Existing System Integration

**Backend APIs Available:**
- Domain CRUD APIs for all 8 domains
- Priority field filtering (`priority=Critical`)
- Full-text search across domains
- Document retrieval via GridFS

**Frontend Components Available:**
- All 8 domain pages complete
- Domain cards and detail views
- Premium design system
- React Query for data fetching

**Current State:**
- Critical records scattered across 8 domains
- No dedicated emergency access view
- Users must remember which domain contains each record

---

## Acceptance Criteria

### Functional Requirements

**AC1: Emergency View Page**
- ✅ Route `/emergency` accessible from main navigation
- ✅ Prominent "Emergency Access" button in navigation (red highlight)
- ✅ Page header: "Emergency Information" with warning icon
- ✅ Instant access (< 500ms load time)
- ✅ Mobile-optimized layout (large touch targets, readable text)
- ✅ Print-friendly CSS for physical backup copy

**AC2: Critical Records Display**
- ✅ Show all records marked with `priority: 'Critical'` from all domains
- ✅ Group by domain with clear headers
- ✅ Each critical record shows:
  - Domain icon + domain name
  - Record name (large, bold text)
  - Record type
  - Key contact information (phone numbers, email)
  - Key reference numbers (policy number, account number, etc.)
  - "View Full Details" link to domain detail page
- ✅ Emergency contacts prominently displayed
- ✅ Empty state: "No critical records. Mark important records as 'Critical' priority in each domain."

**AC3: Quick Actions**
- ✅ "Call" button for phone numbers (mobile `tel:` links)
- ✅ "Email" button for email addresses (`mailto:` links)
- ✅ "Copy" button for reference numbers (clipboard API)
- ✅ "Print Emergency Info" button (opens print dialog)
- ✅ "Download PDF" button (export emergency info as PDF)

**AC4: Search & Filter**
- ✅ Search bar to filter critical records by keyword
- ✅ Filter by domain (All, Property, Vehicles, Finance, etc.)
- ✅ Filter by record type
- ✅ "Show All Records" toggle to view Standard/Important priority records too

**AC5: Offline Capability**
- ✅ Service Worker caches emergency view data
- ✅ "Download for Offline" button caches critical records locally
- ✅ Offline indicator shows when data is stale
- ✅ Works without internet connection once cached

**AC6: Emergency Preparation Features**
- ✅ "Emergency Checklist" section showing:
  - Count of critical records by domain
  - Suggestion to mark more records as critical if count is low
  - Last updated timestamp
- ✅ "Share Emergency Info" - Generate secure shareable link (24-hour expiry)
- ✅ "Print Physical Backup" - Printer-friendly PDF

### Integration Requirements

**IR1: Existing Functionality Preserved**
- ✅ All 8 domain pages still functional
- ✅ Renewal dashboard unchanged
- ✅ Google OAuth authentication works

**IR2: Premium Design Consistency**
- ✅ Emergency view uses premium design system
- ✅ Red accent color for urgency (not alarming)
- ✅ Clear, scannable layout
- ✅ Lucide React icons
- ✅ Inter font family with larger sizes for readability

**IR3: Responsive Design**
- ✅ Mobile-first design (emergencies often happen away from desktop)
- ✅ Large touch targets (minimum 48px)
- ✅ Readable font sizes (minimum 16px body text)
- ✅ Works in landscape and portrait on mobile

### Quality Requirements

**QR1: Testing**
- ✅ Component tests for EmergencyView
- ✅ Integration test: Critical records aggregated from all domains
- ✅ Integration test: Quick actions (call/email/copy)
- ✅ Integration test: Print and PDF export
- ✅ E2E test: Mark record as critical → appears in emergency view
- ✅ Minimum 10 frontend tests for Story 1.9

**QR2: Error Handling**
- ✅ Graceful handling when no critical records exist
- ✅ Fallback if clipboard API unavailable
- ✅ Error message if PDF generation fails

**QR3: Performance**
- ✅ Emergency view loads in < 500ms
- ✅ Search/filter responds instantly (< 100ms)
- ✅ Print dialog opens in < 1 second

**QR4: Accessibility**
- ✅ High contrast mode support
- ✅ Keyboard navigation for all quick actions
- ✅ Screen reader friendly labels
- ✅ ARIA labels for emergency context

---

## Technical Specifications

### Component Architecture

Create the following new components in `web/src/`:

```
web/src/
├── pages/
│   └── EmergencyViewPage.tsx           → Main emergency view (NEW)
│
├── components/
│   ├── emergency/
│   │   ├── EmergencyRecordCard.tsx     → Critical record card (NEW)
│   │   ├── EmergencyChecklist.tsx      → Preparation checklist (NEW)
│   │   ├── QuickActionButton.tsx       → Call/Email/Copy buttons (NEW)
│   │   └── EmergencySearch.tsx         → Search/filter controls (NEW)
│   │
│   └── shared/
│       ├── PrintView.tsx               → Print-friendly layout (NEW)
│       └── PDFExport.tsx               → PDF generation component (NEW)
│
├── hooks/
│   ├── useCriticalRecords.ts           → Fetch critical records (NEW)
│   └── useClipboard.ts                 → Clipboard helper (NEW)
│
├── services/
│   └── api/
│       └── emergency.ts                → Emergency API client (NEW)
│
└── utils/
    ├── emergencyHelpers.ts             → Emergency logic (NEW)
    └── pdfGenerator.ts                 → PDF generation (NEW)
```

---

### Backend API Endpoint

**File:** `src/routes/emergency.js` (NEW)

```javascript
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Domain models
const PropertyRecord = require('../models/domain/PropertyRecord');
const VehicleRecord = require('../models/domain/VehicleRecord');
const FinanceRecord = require('../models/domain/FinanceRecord');
const EmploymentRecord = require('../models/domain/EmploymentRecord');
const GovernmentRecord = require('../models/domain/GovernmentRecord');
const InsuranceRecord = require('../models/domain/InsuranceRecord');
const LegalRecord = require('../models/domain/LegalRecord');
const ServicesRecord = require('../models/domain/ServicesRecord');

const DOMAIN_MODELS = {
  property: PropertyRecord,
  vehicles: VehicleRecord,
  finance: FinanceRecord,
  employment: EmploymentRecord,
  government: GovernmentRecord,
  insurance: InsuranceRecord,
  legal: LegalRecord,
  services: ServicesRecord
};

// GET /api/emergency/critical - All critical priority records
router.get('/critical', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const criticalRecords = [];

    // Aggregate critical records from all domains
    for (const [domain, Model] of Object.entries(DOMAIN_MODELS)) {
      const records = await Model.find({
        user: userId,
        priority: 'Critical'
      }).select('name recordType contactPhone contactEmail priority notes createdAt updatedAt');

      records.forEach((record) => {
        criticalRecords.push({
          id: record._id,
          domain,
          name: record.name,
          recordType: record.recordType,
          contactPhone: record.contactPhone,
          contactEmail: record.contactEmail,
          priority: record.priority,
          notes: record.notes,
          domainUrl: `/${domain}/${record._id}`,
          updatedAt: record.updatedAt
        });
      });
    }

    // Sort by most recently updated
    criticalRecords.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({ criticalRecords, count: criticalRecords.length });
  } catch (error) {
    console.error('Error fetching critical records:', error);
    res.status(500).json({ error: 'Failed to fetch critical records' });
  }
});

// GET /api/emergency/checklist - Emergency preparedness checklist
router.get('/checklist', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const checklist = {};

    for (const [domain, Model] of Object.entries(DOMAIN_MODELS)) {
      const criticalCount = await Model.countDocuments({
        user: userId,
        priority: 'Critical'
      });

      checklist[domain] = {
        criticalCount,
        recommendation: criticalCount === 0 ? 'Add critical records' : 'OK'
      };
    }

    res.json({ checklist });
  } catch (error) {
    console.error('Error fetching emergency checklist:', error);
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
});

module.exports = router;
```

**Register route in `src/app.js`:**

```javascript
const emergencyRoutes = require('./routes/emergency');
app.use('/api/emergency', emergencyRoutes);
```

---

### Emergency View Page

**File:** `web/src/pages/EmergencyViewPage.tsx`

```typescript
import React, { useState } from 'react';
import { AlertCircle, Phone, Mail, Copy, Printer, Download } from 'lucide-react';
import EmergencyRecordCard from '../components/emergency/EmergencyRecordCard';
import EmergencyChecklist from '../components/emergency/EmergencyChecklist';
import EmergencySearch from '../components/emergency/EmergencySearch';
import Button from '../components/shared/Button';
import { useCriticalRecords } from '../hooks/useCriticalRecords';

const EmergencyViewPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const { data, isLoading } = useCriticalRecords();

  const criticalRecords = data?.criticalRecords || [];

  // Filter records by search query and domain
  const filteredRecords = criticalRecords.filter((record) => {
    const matchesSearch = record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.recordType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'all' || record.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  // Group by domain
  const groupedRecords = filteredRecords.reduce((groups, record) => {
    if (!groups[record.domain]) groups[record.domain] = [];
    groups[record.domain].push(record);
    return groups;
  }, {} as Record<string, typeof criticalRecords>);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // PDF export logic (using library like jsPDF or html2pdf)
    alert('PDF download feature coming soon');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-red-50">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">
              Emergency Information
            </h1>
            <p className="text-slate-600">
              Quick access to critical household information
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="secondary">
            <Printer className="w-5 h-5 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownloadPDF} variant="secondary">
            <Download className="w-5 h-5 mr-2" />
            PDF
          </Button>
        </div>
      </header>

      <EmergencySearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDomain={selectedDomain}
        onDomainChange={setSelectedDomain}
      />

      <EmergencyChecklist className="mb-8" />

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">
          Loading critical records...
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">
            No critical records found.
          </p>
          <p className="text-sm text-slate-500">
            Mark important records as 'Critical' priority in each domain to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedRecords).map(([domain, records]) => (
            <div key={domain}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 capitalize">
                {domain} ({records.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {records.map((record) => (
                  <EmergencyRecordCard key={record.id} record={record} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyViewPage;
```

---

### Emergency Record Card Component

**File:** `web/src/components/emergency/EmergencyRecordCard.tsx`

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Copy, ExternalLink } from 'lucide-react';
import QuickActionButton from './QuickActionButton';
import { useClipboard } from '../../hooks/useClipboard';

interface EmergencyRecordCardProps {
  record: {
    id: string;
    domain: string;
    name: string;
    recordType: string;
    contactPhone?: string;
    contactEmail?: string;
    notes?: string;
    domainUrl: string;
  };
}

const EmergencyRecordCard: React.FC<EmergencyRecordCardProps> = ({ record }) => {
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();

  const handleCopyNotes = () => {
    if (record.notes) {
      copyToClipboard(record.notes);
    }
  };

  return (
    <div className="p-5 rounded-xl border-2 border-red-200 bg-red-50">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">
            {record.name}
          </h3>
          <p className="text-sm text-slate-600 capitalize">
            {record.recordType.replace(/-/g, ' ')}
          </p>
        </div>
        <button
          onClick={() => navigate(record.domainUrl)}
          className="p-2 rounded-lg hover:bg-red-100 transition"
        >
          <ExternalLink className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {(record.contactPhone || record.contactEmail) && (
        <div className="space-y-2 mb-4">
          {record.contactPhone && (
            <QuickActionButton
              icon={Phone}
              label={record.contactPhone}
              href={`tel:${record.contactPhone}`}
              color="green"
            />
          )}
          {record.contactEmail && (
            <QuickActionButton
              icon={Mail}
              label={record.contactEmail}
              href={`mailto:${record.contactEmail}`}
              color="blue"
            />
          )}
        </div>
      )}

      {record.notes && (
        <div className="mt-4 pt-4 border-t border-red-200">
          <div className="flex items-start justify-between">
            <p className="text-sm text-slate-700 flex-1">{record.notes}</p>
            <button
              onClick={handleCopyNotes}
              className="ml-2 p-1 rounded hover:bg-red-100 transition"
            >
              <Copy className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyRecordCard;
```

---

### Quick Action Button Component

**File:** `web/src/components/emergency/QuickActionButton.tsx`

```typescript
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  href: string;
  color?: 'green' | 'blue' | 'red';
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon: Icon,
  label,
  href,
  color = 'blue'
}) => {
  const colorClasses = {
    green: 'bg-green-100 hover:bg-green-200 text-green-700',
    blue: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    red: 'bg-red-100 hover:bg-red-200 text-red-700'
  };

  return (
    <a
      href={href}
      className={`flex items-center gap-3 p-3 rounded-lg transition ${colorClasses[color]}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
};

export default QuickActionButton;
```

---

### Clipboard Hook

**File:** `web/src/hooks/useClipboard.ts`

```typescript
import { useState } from 'react';

export const useClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return true;
      } else {
        // Fallback for browsers without clipboard API
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return true;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  };

  return { copyToClipboard, copied };
};
```

---

## Testing Guide

### Manual Testing Checklist

**Emergency View:**
- [ ] Navigate to `/emergency` from navigation
- [ ] See all critical priority records
- [ ] Records grouped by domain
- [ ] Empty state shows when no critical records exist

**Quick Actions:**
- [ ] Click phone number → opens phone dialer (mobile)
- [ ] Click email → opens email client
- [ ] Click copy button → copies text to clipboard
- [ ] Copy success feedback shows

**Print & Export:**
- [ ] Click "Print" → print dialog opens
- [ ] Print preview shows clean layout
- [ ] Click "PDF" → downloads PDF (when implemented)

**Search & Filter:**
- [ ] Search for record name → filters correctly
- [ ] Filter by domain → only that domain shows
- [ ] Clear search → all records return

**Emergency Checklist:**
- [ ] Shows count of critical records per domain
- [ ] Suggests adding records where none exist
- [ ] Last updated timestamp accurate

---

## Verification Checklist

**Before marking story complete:**

- [ ] Emergency view accessible via navigation
- [ ] Critical records from all domains displayed
- [ ] Records grouped by domain
- [ ] Quick actions work (call/email/copy)
- [ ] Print functionality works
- [ ] Search and filter functional
- [ ] Emergency checklist displays correctly
- [ ] Mobile-optimized layout
- [ ] Large touch targets (minimum 48px)
- [ ] Premium design maintained
- [ ] Responsive on all devices
- [ ] Minimum 10 frontend tests passing
- [ ] All 8 domains still functional (regression check)
- [ ] No console errors or warnings
- [ ] Git commit: "feat: Add Emergency View (Story 1.9)"

---

## Implementation Notes

### Development Workflow

**Session 1: Backend API & Core Components (4-6 hours)**
1. Create `/api/emergency/critical` endpoint
2. Create `/api/emergency/checklist` endpoint
3. Create EmergencyViewPage component
4. Create EmergencyRecordCard component
5. Test critical record aggregation

**Session 2: Features & Polish (4-6 hours)**
1. Create QuickActionButton component
2. Create EmergencyChecklist component
3. Implement clipboard functionality
4. Add print CSS
5. Add search/filter
6. Write tests
7. Final polish

---

## Key Implementation Strategy

**Critical Records Aggregation:**
```javascript
// Fetch all Critical priority records from all domains
const criticalRecords = [];
for (const [domain, Model] of Object.entries(DOMAIN_MODELS)) {
  const records = await Model.find({
    user: userId,
    priority: 'Critical'
  });
  records.forEach(r => criticalRecords.push({ ...r.toObject(), domain }));
}
```

**Mobile-First Design:**
```css
/* Large touch targets for emergency scenarios */
.quick-action-button {
  min-height: 48px;
  font-size: 16px;
  padding: 12px 16px;
}

/* Print-friendly CSS */
@media print {
  .no-print { display: none; }
  .emergency-record { page-break-inside: avoid; }
}
```

---

## Gotchas to Avoid

❌ **Don't** show sensitive data in print preview
❌ **Don't** use small touch targets (minimum 48px)
❌ **Don't** forget mobile optimization (emergencies often mobile)
❌ **Don't** skip print CSS (physical backup important)

✅ **Do** use large, readable fonts
✅ **Do** provide quick actions (call/email)
✅ **Do** optimize for speed (< 500ms load)
✅ **Do** test on actual mobile devices

---

## Definition of Done

- [ ] Emergency view page functional (`/emergency`)
- [ ] Critical records aggregated from all domains
- [ ] Records grouped by domain
- [ ] Quick actions work (call/email/copy)
- [ ] Print functionality works
- [ ] Search and filter functional
- [ ] Emergency checklist displays
- [ ] Mobile-optimized layout
- [ ] Large touch targets (48px minimum)
- [ ] Premium design maintained
- [ ] Responsive on all devices
- [ ] Minimum 10 frontend tests passing
- [ ] All 8 domains regression tested
- [ ] No console errors or warnings
- [ ] Code follows React/TypeScript best practices
- [ ] Git commit: "feat: Add Emergency View (Story 1.9)"

---

## Epic 1 Completion

**Story 1.9 marks the completion of Epic 1: Life Domain Architecture Foundation**

**Epic 1 Achievements:**
- ✅ 8 domain models and APIs (Stories 1.1-1.3)
- ✅ 8 domain UIs (Stories 1.4-1.7)
- ✅ Cross-domain renewal dashboard (Story 1.8)
- ✅ Emergency view (Story 1.9)
- ✅ Full domain architecture migration complete

**Next Epic:** Epic 2 - TBD (New feature set)

---

**Story Created:** 2025-10-05
**Last Updated:** 2025-10-05
**Status:** Draft - Ready for Implementation
