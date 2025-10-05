# Story 1.8: Enhanced Renewal Dashboard - Cross-Domain Tracking

**Epic:** Life Domain Architecture Foundation (Epic 1)
**Story ID:** 1.8
**Estimated Effort:** 8-12 hours (2 development sessions)
**Priority:** High
**Status:** Draft
**Dependencies:** Story 1.1 (✓), Story 1.2 (✓), Story 1.3 (✓), Story 1.4 (✓), Story 1.5 (✓), Story 1.6 (✓), Story 1.7 (✓)

---

## User Story

**As a** household administrator,
**I want** to see all upcoming renewals across all domains in one centralized dashboard,
**so that** I never miss critical renewal dates for mortgages, insurance, MOT, vehicle tax, and other important household items.

---

## Story Context

### Why This Story

Stories 1.4-1.7 completed all 8 domain UIs. Story 1.8 adds the first major cross-domain feature: a unified renewal dashboard that aggregates renewal dates from all domains.

**Business value:**
- Prevents missed renewals that could result in:
  - Lapsed insurance coverage
  - MOT/tax penalties
  - Expired mortgages rolling to standard variable rates
  - Lost ISA allowances
  - Passport/licence expiries causing travel disruption
- Provides proactive household financial management
- Leverages the domain architecture's `renewalDate` common field

**UK-specific renewal tracking:**
- MOT (vehicles) - 1 month advance notice critical
- Road tax (vehicles) - Auto-renew or manual renewal
- Insurance (property, vehicles, life) - Compare market 3-4 weeks before
- Fixed-rate mortgages - 3-6 months notice for remortgage
- Passports - 6-12 weeks renewal time
- ISA limits - Annual allowance resets
- TV Licence - Annual renewal required

### Existing System Integration

**Backend APIs Available:**
- Domain CRUD APIs for all 8 domains
- `renewalDate` field on all domain records
- Priority field (`Critical`, `Important`, `Standard`)
- Filtering by date ranges (`/api/domains/{domain}/records?renewalDateFrom=...&renewalDateTo=...`)

**Frontend Components Available:**
- All 8 domain pages complete
- Domain cards with record counts
- Premium design system
- React Query for data fetching

**Current State:**
- Each domain shows its own renewals
- No cross-domain renewal view
- No proactive reminders

---

## Acceptance Criteria

### Functional Requirements

**AC1: Renewal Dashboard Page**
- ✅ Route `/renewals` accessible from main navigation
- ✅ Page header: "Upcoming Renewals" with filter controls
- ✅ Timeline view showing renewals grouped by time period:
  - Overdue (red alert)
  - Next 7 days (critical - red)
  - Next 30 days (important - amber)
  - Next 90 days (standard - green)
  - Beyond 90 days (info - blue)
- ✅ Each renewal item shows:
  - Domain icon
  - Record name
  - Domain name
  - Renewal date (human-friendly: "In 5 days", "Tomorrow", "Next week")
  - Priority badge
  - "View Record" link to domain detail page
- ✅ Empty state: "No upcoming renewals. Add records with renewal dates to see them here."

**AC2: Filtering & Sorting**
- ✅ Filter by domain (All, Property, Vehicles, Finance, etc.)
- ✅ Filter by priority (All, Critical, Important, Standard)
- ✅ Filter by time range (Next 7 days, Next 30 days, Next 90 days, All)
- ✅ Sort by: Date (ascending/descending), Priority, Domain
- ✅ Filters persist in URL query params

**AC3: Renewal Summary Widget (Homepage)**
- ✅ Summary widget on HomePage showing:
  - Count of overdue renewals (red badge)
  - Count of renewals in next 7 days (amber badge)
  - Count of renewals in next 30 days (blue badge)
  - "View All Renewals" link to `/renewals`
- ✅ Widget only visible if user has records with renewal dates
- ✅ Clicking counts navigates to filtered renewal dashboard

**AC4: Domain Detail Integration**
- ✅ Each domain detail page shows "Upcoming Renewals" section
- ✅ Section lists renewals for that specific domain only
- ✅ Shows renewal date with countdown ("Renews in 14 days")
- ✅ Link to full renewal dashboard

**AC5: API Endpoints**
- ✅ `GET /api/renewals/summary` - Returns renewal counts by time period
- ✅ `GET /api/renewals/timeline?domain=&priority=&from=&to=` - Returns all renewals with filters
- ✅ Endpoint aggregates data from all 8 domains
- ✅ Response includes domain name, icon identifier, record details

### Integration Requirements

**IR1: Existing Functionality Preserved**
- ✅ All 8 domain pages still functional
- ✅ Individual domain renewal tracking unchanged
- ✅ Google OAuth authentication works

**IR2: Premium Design Consistency**
- ✅ Renewal dashboard uses premium design system
- ✅ Timeline view with elegant date grouping
- ✅ Color-coded urgency (red/amber/green/blue)
- ✅ Lucide React icons for domain identification
- ✅ Inter font family

**IR3: Responsive Design**
- ✅ Timeline adapts to mobile/tablet/desktop
- ✅ Filters collapse to dropdown on mobile
- ✅ Summary widget responsive on homepage

### Quality Requirements

**QR1: Testing**
- ✅ Component tests for RenewalDashboard
- ✅ Component tests for RenewalSummaryWidget
- ✅ Integration test: Renewals aggregated from multiple domains
- ✅ Integration test: Filtering by domain/priority/time range
- ✅ API tests for /api/renewals/* endpoints
- ✅ Minimum 12 frontend tests for Story 1.8

**QR2: Error Handling**
- ✅ API errors display user-friendly messages
- ✅ Empty states for no renewals
- ✅ Loading states during data fetch

**QR3: Performance**
- ✅ Renewal dashboard loads in < 1 second
- ✅ Summary widget loads in < 500ms
- ✅ Aggregation query optimized (use indexes)

---

## Technical Specifications

### Component Architecture

Create the following new components in `web/src/`:

```
web/src/
├── pages/
│   └── RenewalDashboardPage.tsx        → Main renewal dashboard (NEW)
│
├── components/
│   ├── renewals/
│   │   ├── RenewalTimeline.tsx         → Timeline view component (NEW)
│   │   ├── RenewalItem.tsx             → Individual renewal card (NEW)
│   │   ├── RenewalFilters.tsx          → Filter controls (NEW)
│   │   └── RenewalSummaryWidget.tsx    → Homepage summary (NEW)
│   │
│   └── shared/
│       ├── TimelineSection.tsx         → Reusable timeline section (NEW)
│       └── CountBadge.tsx              → Count badge component (NEW)
│
├── hooks/
│   ├── useRenewals.ts                  → Fetch renewal data (NEW)
│   └── useRenewalSummary.ts            → Fetch summary stats (NEW)
│
├── services/
│   └── api/
│       └── renewals.ts                 → Renewal API client (NEW)
│
└── utils/
    ├── dateHelpers.ts                  → Date formatting utilities (NEW)
    └── renewalHelpers.ts               → Renewal grouping logic (NEW)
```

---

### Backend API Endpoints

**File:** `src/routes/renewals.js` (NEW)

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

// GET /api/renewals/summary - Renewal counts by time period
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const summary = {
      overdue: 0,
      next7Days: 0,
      next30Days: 0,
      total: 0
    };

    // Aggregate from all domains
    for (const [domain, Model] of Object.entries(DOMAIN_MODELS)) {
      const overdueCount = await Model.countDocuments({
        user: userId,
        renewalDate: { $lt: now, $ne: null }
      });

      const next7DaysCount = await Model.countDocuments({
        user: userId,
        renewalDate: { $gte: now, $lte: next7Days }
      });

      const next30DaysCount = await Model.countDocuments({
        user: userId,
        renewalDate: { $gt: next7Days, $lte: next30Days }
      });

      summary.overdue += overdueCount;
      summary.next7Days += next7DaysCount;
      summary.next30Days += next30DaysCount;
    }

    summary.total = summary.overdue + summary.next7Days + summary.next30Days;

    res.json(summary);
  } catch (error) {
    console.error('Error fetching renewal summary:', error);
    res.status(500).json({ error: 'Failed to fetch renewal summary' });
  }
});

// GET /api/renewals/timeline - All renewals with filtering
router.get('/timeline', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { domain, priority, from, to } = req.query;

    const renewals = [];

    // Build query filters
    const baseQuery = { user: userId, renewalDate: { $ne: null } };

    if (priority) {
      baseQuery.priority = priority;
    }

    if (from || to) {
      baseQuery.renewalDate = {};
      if (from) baseQuery.renewalDate.$gte = new Date(from);
      if (to) baseQuery.renewalDate.$lte = new Date(to);
    }

    // Filter by domain or query all domains
    const domainsToQuery = domain ? [domain] : Object.keys(DOMAIN_MODELS);

    for (const domainName of domainsToQuery) {
      const Model = DOMAIN_MODELS[domainName];
      if (!Model) continue;

      const records = await Model.find(baseQuery)
        .select('name recordType renewalDate priority createdAt')
        .sort({ renewalDate: 1 });

      records.forEach((record) => {
        renewals.push({
          id: record._id,
          domain: domainName,
          name: record.name,
          recordType: record.recordType,
          renewalDate: record.renewalDate,
          priority: record.priority,
          domainUrl: `/${domainName}/${record._id}`
        });
      });
    }

    // Sort by renewal date
    renewals.sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate));

    res.json({ renewals });
  } catch (error) {
    console.error('Error fetching renewal timeline:', error);
    res.status(500).json({ error: 'Failed to fetch renewal timeline' });
  }
});

module.exports = router;
```

**Register route in `src/app.js`:**

```javascript
const renewalsRoutes = require('./routes/renewals');
app.use('/api/renewals', renewalsRoutes);
```

---

### Renewal Dashboard Page

**File:** `web/src/pages/RenewalDashboardPage.tsx`

```typescript
import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import RenewalTimeline from '../components/renewals/RenewalTimeline';
import RenewalFilters from '../components/renewals/RenewalFilters';
import { useRenewals } from '../hooks/useRenewals';

const RenewalDashboardPage: React.FC = () => {
  const [filters, setFilters] = useState({
    domain: 'all',
    priority: 'all',
    timeRange: '90days'
  });

  const { data: renewals, isLoading } = useRenewals(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100">
            <Calendar className="w-8 h-8 text-slate-700" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">
              Upcoming Renewals
            </h1>
            <p className="text-slate-600">
              Track renewal dates across all your household domains
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <span className="text-sm text-slate-600">
            {renewals?.length || 0} renewals
          </span>
        </div>
      </header>

      <RenewalFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">
          Loading renewals...
        </div>
      ) : renewals?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">
            No upcoming renewals. Add records with renewal dates to see them here.
          </p>
        </div>
      ) : (
        <RenewalTimeline renewals={renewals} />
      )}
    </div>
  );
};

export default RenewalDashboardPage;
```

---

### Renewal Timeline Component

**File:** `web/src/components/renewals/RenewalTimeline.tsx`

```typescript
import React from 'react';
import RenewalItem from './RenewalItem';
import { groupRenewalsByPeriod } from '../../utils/renewalHelpers';

interface Renewal {
  id: string;
  domain: string;
  name: string;
  renewalDate: string;
  priority: string;
  domainUrl: string;
}

interface RenewalTimelineProps {
  renewals: Renewal[];
}

const RenewalTimeline: React.FC<RenewalTimelineProps> = ({ renewals }) => {
  const grouped = groupRenewalsByPeriod(renewals);

  const sections = [
    { key: 'overdue', title: 'Overdue', color: 'red', data: grouped.overdue },
    { key: 'next7days', title: 'Next 7 Days', color: 'red', data: grouped.next7days },
    { key: 'next30days', title: 'Next 30 Days', color: 'amber', data: grouped.next30days },
    { key: 'next90days', title: 'Next 90 Days', color: 'green', data: grouped.next90days },
    { key: 'beyond', title: 'Beyond 90 Days', color: 'blue', data: grouped.beyond }
  ];

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        if (section.data.length === 0) return null;

        return (
          <div key={section.key}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-1 h-6 rounded bg-${section.color}-500`} />
              <h2 className="text-lg font-semibold text-slate-900">
                {section.title}
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({section.data.length})
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.data.map((renewal) => (
                <RenewalItem key={renewal.id} renewal={renewal} urgency={section.color} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RenewalTimeline;
```

---

### Renewal Summary Widget (Homepage)

**File:** `web/src/components/renewals/RenewalSummaryWidget.tsx`

```typescript
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, AlertCircle } from 'lucide-react';
import { useRenewalSummary } from '../../hooks/useRenewalSummary';

const RenewalSummaryWidget: React.FC = () => {
  const { data: summary, isLoading } = useRenewalSummary();

  if (isLoading || !summary || summary.total === 0) return null;

  return (
    <div className="p-6 rounded-xl border border-slate-200 bg-white mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-6 h-6 text-slate-700" />
        <h2 className="text-lg font-semibold text-slate-900">
          Upcoming Renewals
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {summary.overdue > 0 && (
          <Link to="/renewals?filter=overdue" className="text-center p-3 rounded-lg bg-red-50 hover:bg-red-100 transition">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-2xl font-semibold text-red-600">
                {summary.overdue}
              </span>
            </div>
            <p className="text-xs text-red-700">Overdue</p>
          </Link>
        )}

        <Link to="/renewals?filter=7days" className="text-center p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition">
          <div className="text-2xl font-semibold text-amber-600 mb-1">
            {summary.next7Days}
          </div>
          <p className="text-xs text-amber-700">Next 7 Days</p>
        </Link>

        <Link to="/renewals?filter=30days" className="text-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition">
          <div className="text-2xl font-semibold text-blue-600 mb-1">
            {summary.next30Days}
          </div>
          <p className="text-xs text-blue-700">Next 30 Days</p>
        </Link>
      </div>

      <Link
        to="/renewals"
        className="block w-full text-center py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition"
      >
        View All Renewals
      </Link>
    </div>
  );
};

export default RenewalSummaryWidget;
```

---

### Renewal Helpers Utility

**File:** `web/src/utils/renewalHelpers.ts`

```typescript
interface Renewal {
  renewalDate: string;
  [key: string]: any;
}

interface GroupedRenewals {
  overdue: Renewal[];
  next7days: Renewal[];
  next30days: Renewal[];
  next90days: Renewal[];
  beyond: Renewal[];
}

export const groupRenewalsByPeriod = (renewals: Renewal[]): GroupedRenewals => {
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const next90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const grouped: GroupedRenewals = {
    overdue: [],
    next7days: [],
    next30days: [],
    next90days: [],
    beyond: []
  };

  renewals.forEach((renewal) => {
    const renewalDate = new Date(renewal.renewalDate);

    if (renewalDate < now) {
      grouped.overdue.push(renewal);
    } else if (renewalDate <= next7Days) {
      grouped.next7days.push(renewal);
    } else if (renewalDate <= next30Days) {
      grouped.next30days.push(renewal);
    } else if (renewalDate <= next90Days) {
      grouped.next90days.push(renewal);
    } else {
      grouped.beyond.push(renewal);
    }
  });

  return grouped;
};

export const getRenewalUrgency = (renewalDate: string): 'critical' | 'important' | 'standard' | 'info' => {
  const now = new Date();
  const renewal = new Date(renewalDate);
  const daysUntil = Math.floor((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return 'critical'; // Overdue
  if (daysUntil <= 7) return 'critical'; // Next 7 days
  if (daysUntil <= 30) return 'important'; // Next 30 days
  if (daysUntil <= 90) return 'standard'; // Next 90 days
  return 'info'; // Beyond 90 days
};
```

---

## Testing Guide

### Manual Testing Checklist

**Renewal Dashboard:**
- [ ] Navigate to `/renewals` from navigation
- [ ] See timeline grouped by time periods
- [ ] Verify overdue renewals show in red section
- [ ] Verify next 7 days renewals show correctly
- [ ] Click renewal item → navigate to domain detail page
- [ ] Filter by domain → only that domain's renewals show
- [ ] Filter by priority → only matching priorities show
- [ ] Empty state shows when no renewals exist

**Homepage Widget:**
- [ ] Summary widget appears on homepage (if renewals exist)
- [ ] Overdue count shows red badge
- [ ] Next 7 days count correct
- [ ] Next 30 days count correct
- [ ] Click count → navigate to filtered renewal dashboard
- [ ] "View All Renewals" link works

**Cross-Domain Aggregation:**
- [ ] Create property record with renewal date
- [ ] Create vehicle record with MOT expiry
- [ ] Create finance ISA with maturity date
- [ ] Verify all 3 appear on renewal dashboard
- [ ] Verify counts aggregate correctly

---

## Verification Checklist

**Before marking story complete:**

- [ ] Renewal dashboard accessible via navigation
- [ ] Timeline view groups renewals by time period
- [ ] Overdue renewals highlighted in red
- [ ] Filtering by domain/priority/time range works
- [ ] Summary widget appears on homepage
- [ ] Widget counts match actual renewals
- [ ] Clicking renewal items navigates to domain detail
- [ ] API endpoints return correct aggregated data
- [ ] Premium design maintained
- [ ] Responsive on mobile/tablet/desktop
- [ ] Minimum 12 frontend tests passing
- [ ] All 8 domains still functional (regression check)
- [ ] No console errors or warnings
- [ ] Git commit: "feat: Add Enhanced Renewal Dashboard (Story 1.8)"

---

## Implementation Notes

### Development Workflow

**Session 1: Backend API & Data Layer (4-6 hours)**
1. Create `/api/renewals/summary` endpoint
2. Create `/api/renewals/timeline` endpoint
3. Test aggregation from all 8 domains
4. Optimize queries with indexes
5. Write API tests

**Session 2: Frontend Components (4-6 hours)**
1. Create RenewalDashboardPage
2. Create RenewalTimeline component
3. Create RenewalSummaryWidget
4. Add renewal helpers utility
5. Integrate into HomePage
6. Add navigation link
7. Write component tests
8. Final polish and testing

---

## Key Implementation Strategy

**Cross-Domain Aggregation:**
```javascript
// Efficient aggregation from all domains
const renewals = [];
for (const [domain, Model] of Object.entries(DOMAIN_MODELS)) {
  const records = await Model.find({
    user: userId,
    renewalDate: { $ne: null }
  }).select('name renewalDate priority');

  records.forEach(r => renewals.push({ ...r.toObject(), domain }));
}
```

**Time-Based Grouping:**
```typescript
// Group renewals by urgency
const grouped = {
  overdue: renewals.filter(r => new Date(r.renewalDate) < now),
  next7days: renewals.filter(r => isWithinDays(r.renewalDate, 7)),
  next30days: renewals.filter(r => isWithinDays(r.renewalDate, 30)),
  next90days: renewals.filter(r => isWithinDays(r.renewalDate, 90))
};
```

---

## Gotchas to Avoid

❌ **Don't** forget to filter out records without renewal dates
❌ **Don't** skip indexing `renewalDate` field for performance
❌ **Don't** hard-code domain names (use dynamic list)
❌ **Don't** forget timezone handling for date comparisons

✅ **Do** aggregate efficiently from all domains
✅ **Do** use color coding for urgency (red/amber/green)
✅ **Do** provide human-friendly date formatting ("In 5 days")
✅ **Do** link back to domain detail pages

---

## Definition of Done

- [ ] Renewal dashboard page functional (`/renewals`)
- [ ] Timeline view groups renewals by time period
- [ ] Filtering by domain/priority/time range works
- [ ] Summary widget appears on homepage
- [ ] Widget counts aggregate correctly
- [ ] API endpoints return cross-domain data
- [ ] Renewal items link to domain detail pages
- [ ] Premium design maintained
- [ ] Responsive on all devices
- [ ] Minimum 12 frontend tests passing
- [ ] API tests for renewal endpoints passing
- [ ] All 8 domains regression tested
- [ ] No console errors or warnings
- [ ] Code follows React/TypeScript best practices
- [ ] Git commit: "feat: Add Enhanced Renewal Dashboard (Story 1.8)"

---

## Next Story

**Story 1.9: Emergency View**
- Critical-priority records across all domains
- Emergency contact information
- Quick access during household emergencies
- Final story to complete Epic 1

---

**Story Created:** 2025-10-05
**Last Updated:** 2025-10-05
**Status:** Draft - Ready for Implementation
