# Epic 6: Hierarchical Domain Model Refactor - Overview

**Version**: 3.0
**Date**: January 16, 2025
**Status**: Draft
**Purpose**: Household Continuity Planning

---

## Quick Links

### Stories
- [Story 1.1: Database Schema Design & Migration Scripts](./story-1.1-database-schema.md)
- [Story 1.2: Parent Entity API Endpoints](./story-1.2-parent-api.md)
- [Story 1.3: Child Record API Endpoints](./story-1.3-child-api.md)
- [Story 1.4: Admin Domain Configuration API & UI](./story-1.4-admin-config.md)
- [Story 1.5: Parent Entity Frontend Components](./story-1.5-parent-frontend.md)
- [Story 1.6: Child Record Frontend Components](./story-1.6-child-frontend.md)
- [Story 1.7: Services Directory & Transaction Workflow](./story-1.7-services-transactions.md)
- [Story 1.8: Continuity Planning Features](./story-1.8-continuity-features.md)
- [Story 1.9: Data Migration & Onboarding](./story-1.9-migration.md)
- [Story 1.10: Legacy Endpoint Deprecation](./story-1.10-legacy-cleanup.md)
- [Story 1.11: Performance Optimization](./story-1.11-performance.md)

---

## Epic Goal

Transform LegacyLock from flat domain model to hierarchical parent-child model optimized for **household continuity planning**, enabling users to organize critical information by parent entity (Vehicle, Property, Employment, Services) with flexible admin-configurable record type taxonomy.

### Core Purpose

LegacyLock is a **Northern Ireland-focused household continuity planning application** for couples to store critical information needed when a partner dies or becomes incapacitated.

**Essential Questions:**
- "Who do I call when the boiler breaks?"
- "Where is the vehicle registration document?"
- "What's the renewal date for home insurance?"
- "Who is our solicitor and how do I contact them?"

---

## Current Problem

The flat domain model treats all records as independent entities, creating organizational problems:

**Example: Vehicle Domain (Current FLAT Structure)**
```
Vehicle Collection:
  - Record: "2019 Honda Civic" (vehicle details)
  - Record: "Car Finance Loan" (standalone finance record)
  - Record: "MOT Inspection" (standalone service record)
  - Record: "Car Tax Payment" (standalone government record)
```

**Problems for Continuity Planning:**
1. **No context**: Surviving partner sees "Car Finance Loan" but doesn't know which vehicle it's for
2. **Scattered information**: Registration, MOT date, insurance renewal, finance contact are in separate unrelated records
3. **Difficult handover**: Cannot provide complete picture of "everything related to Calvin's car"
4. **Lost knowledge**: No way to group service history, contact information, and renewal dates

---

## Target Architecture

**New HIERARCHICAL Structure:**

```
Vehicle Domain (Parent Entity):
  └─ Parent: "2019 Honda Civic - Calvin's Car"
      ├─ Child Record: Contact - "Finance company: 0800-FINANCE, Account #12345"
      ├─ Child Record: Government - "MOT due: March 2025, Tax renewal: April 2025"
      ├─ Child Record: Insurance - "Insurer: Direct Line, Policy #ABC123, Renewal: June 2025"
      └─ Child Record: Service History - "Last service: Joe's Garage, 028-1234-5678"

Property Domain (Parent Entity):
  └─ Parent: "123 Main Street - Primary Residence"
      ├─ Child Record: Contact - "Estate agent: Smith & Co, 028-9876-5432"
      ├─ Child Record: Government - "Domestic Rates: £1200/year, Direct debit active"
      ├─ Child Record: Services - "Heating oil: Wilson Fuels, 028-5555-1234"
      └─ Child Record: Insurance - "Home insurance: Aviva, Renewal: August 2025"

Services Domain (Parent Entity - NEW):
  └─ Parent: "McGrath Plumbing - Emergency Plumber"
      ├─ Child Record: Contact - "Mobile: 07700-900123, Email: info@mcgrathplumbing.com"
      ├─ Child Record: Service History - "Boiler repair June 2024: £150, Very reliable"
      └─ Child Record: Notes - "Available weekends, knows our heating system well"
```

**Key Benefits:**
1. **Complete context**: All information about a vehicle/property/job/tradesperson in one place
2. **Easy handover**: See "everything about the house" or "everything about Calvin's employment"
3. **Critical contact info**: Phone numbers, policy numbers, account numbers grouped correctly
4. **Renewal tracking**: All renewal dates and important deadlines visible per entity
5. **Service provider directory**: Tradespeople organized and easily accessible

---

## Requirements Summary

### Four Parent Entity Domains
1. **Vehicle** - Individual vehicles (cars, motorcycles, etc.)
2. **Property** - Individual properties (homes, rental properties, etc.)
3. **Employment** - Individual jobs/employers
4. **Services** (NEW) - Tradespeople and service providers

### Six Child Record Types
1. **Contact Info** - Phone, email, account numbers, policy numbers
2. **Service History** - Service dates, providers, work completed
3. **Finance** - Payments, costs, financial arrangements
4. **Insurance** - Policies, renewals, coverage details
5. **Government** - Rates, MOT, tax, registrations
6. **Pension** - Workplace pensions, contributions

**Focus**: Contact information, renewal dates, and service history take priority over financial tracking.

---

## Technical Summary

### Database Changes
- **New Collections**: `parent_entities`, `child_records`, `domain_config`
- **Schema**: Continuity-focused with priority on contact fields, renewal dates
- **Indexes**: userId, domainType, parentId, recordType, renewalDate
- **Migration**: Delete legacy flat collections (Insurance, Finance, Services, Government, Legal)

### API Changes
- **New v2 Endpoints**: `/api/v2/vehicles`, `/api/v2/properties`, `/api/v2/employments`, `/api/v2/services`
- **Child Records**: `/api/v2/:domain/:parentId/records`
- **Continuity Features**: `/api/v2/renewals/upcoming`, `/api/v2/contacts/:domain`

### Frontend Changes
- **New Components**: ParentEntityList, ParentEntityDetail, ServicesDirectory, UpcomingRenewals
- **Modified**: CreateEntryFromTransactionModal (two-step workflow with Services domain)
- **New Pages**: `/services`, `/renewals`

---

## Success Metrics

**User Adoption (Continuity Focus):**
- 90% create ≥1 parent entity within 7 days
- 70% of child records include contact info
- 60% of insurance/government records include renewal dates
- 30% of Service domain entities created within 30 days

**System Performance:**
- Parent entity list: <100ms (p95)
- Parent entity detail: <150ms (p95)
- Transaction-to-entry: <3s end-to-end (p95)

---

## Story Sequence

1. **Database Schema** - Create models, migration scripts
2. **Parent API** - CRUD endpoints for vehicles/properties/employments/services
3. **Child API** - CRUD endpoints for child records
4. **Admin Config** - Taxonomy configuration UI
5. **Parent Frontend** - List/detail/form components
6. **Child Frontend** - Record management with continuity focus
7. **Services & Transactions** - Services directory + updated transaction workflow
8. **Continuity Features** - Renewals dashboard + contact directory
9. **Migration & Onboarding** - Execute migration, user tutorial
10. **Legacy Cleanup** - Remove old code and endpoints
11. **Performance** - Optimize queries and monitoring

---

_For complete requirements, technical design, and detailed acceptance criteria, see individual story files._
