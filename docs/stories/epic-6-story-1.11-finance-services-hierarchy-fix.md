# Story 1.11: Finance & Services Domain Hierarchy Fix

**Epic**: 6 - Hierarchical Domain Model Refactor
**Story**: 1.11
**Status**: In Progress
**Assigned**: James (Dev Agent)
**Estimated**: 4 hours
**Actual**: TBD
**Priority**: P0 - Critical Bug Fix
**Depends On**: Story 1.5 (Parent Frontend), Story 1.6 (Child Record Frontend), Story 1.7 (Services Integration)

---

## Story

**As a** user,
**I want** Finance and Services domains to follow a proper category-based hierarchy,
**so that** I can organize accounts by type (Current Accounts, Savings, etc.) and services by category (Tradespeople, Home Services), with individual records as children.

---

## Context

### Problem Identified

Finance and Services domains have a **conceptual hierarchy mismatch** compared to Vehicle/Property/Employment:

**Working Domains** (Vehicle, Property):
```
Parent = Specific Physical Thing
  └─ Children = Records about that thing

Example:
  Vehicle: "2019 Honda Civic"
    ├─ Insurance record
    ├─ MOT record
    └─ Service history
```

**Broken Domains** (Finance, Services):
```
Current (WRONG):
  Parent = "HSBC Current Account" (too specific!)
    └─ Children = ??? (nothing makes sense here)

Should Be:
  Parent = "Current Accounts" (CATEGORY)
    ├─ HSBC Current Account (John)
    ├─ Barclays Current Account (Jane)
    └─ Santander Current Account (Joint)
```

### Root Cause

The **ParentEntityForm** for Finance/Services domains asks for too many granular details:
- Finance: Account Number, Sort Code, Account Holder, Opened Date
- Services: (similar overly specific fields)

These fields belong in **child records**, not parent entities.

### User Impact

Users cannot properly organize their financial accounts or service providers because:
1. Parent form asks for specific account details instead of category name
2. No clear place to add multiple accounts of the same type (e.g., multiple current accounts)
3. Hierarchy doesn't match the mental model of "account types containing individual accounts"

---

## Acceptance Criteria

### Finance Domain
- [x] AC1: Parent form shows simplified fields: Name, Account Type dropdown, Notes, Image
- [x] AC2: Account Type dropdown includes: Current Account, Savings Account, ISA, Credit Card, Pension, Investment, Mortgage, Loan
- [x] AC3: Parent form does NOT ask for Account Number, Sort Code, Account Holder, Opened Date
- [x] AC4: Child record form includes detailed fields: Institution, Account Number, Sort Code, Account Holder, Balance, Interest Rate, etc.
- [x] AC5: User can create parent "Current Accounts" and add multiple child records (HSBC, Barclays, etc.)

### Services Domain
- [x] AC6: Parent form shows simplified fields: Name, Service Category dropdown, Notes, Image
- [x] AC7: Service Category dropdown includes: Tradespeople, Home Services, Professional Services, Garden & Outdoor, Automotive Services, Other
- [x] AC8: Parent form does NOT ask for provider-specific details
- [x] AC9: Child record form includes detailed fields: Business Name, Contact Person, Phone, Email, Service Type, Rating, Last Service Date, etc.
- [x] AC10: User can create parent "Tradespeople" and add multiple child records (Plumber, Electrician, etc.)

### Data Migration
- [ ] AC11: Existing Finance parent entities (if any) are preserved or migrated gracefully
- [ ] AC12: Existing Services parent entities (if any) are preserved or migrated gracefully

---

## Tasks

### Task 1: Simplify Finance Parent Form ✅ COMPLETE
- [x] Update `ParentEntityForm.tsx` Finance section (lines 671-739)
- [x] Remove fields: Account Number, Sort Code, Account Holder, Opened Date, Financial Institution
- [x] Keep fields: Name (required), Account Type dropdown, Notes, Image
- [x] Update placeholder text to reflect category usage: "e.g., Current Accounts, Savings Accounts"
- [x] Ensure Account Type dropdown matches AC2

### Task 2: Simplify Services Parent Form ✅ COMPLETE
- [x] Update `ParentEntityForm.tsx` Services section (if exists)
- [x] If no Services section exists, add simplified one with: Name, Service Category dropdown, Notes, Image
- [x] Service Category options: Tradespeople, Home Services, Professional Services, Garden & Outdoor, Automotive Services, Other
- [x] Update placeholder text: "e.g., Tradespeople, Home Services, Professional Services"

### Task 3: Enhance Child Record Form for Finance Details ✅ COMPLETE
- [x] Update `ChildRecordForm.tsx` to show Finance-specific fields when:
  - Domain is 'finance' AND recordType is 'Finance'
- [x] Finance child fields to include:
  - Institution (e.g., "HSBC UK")
  - Account Number (8 digits, validation)
  - Sort Code (XX-XX-XX format, validation)
  - Account Holder (e.g., "John Doe")
  - Balance (optional, number)
  - Interest Rate (optional, percentage)
  - Opened Date (optional, date)
  - Credit Limit (for credit cards)
  - Monthly Payment (for loans/mortgages)
- [x] Show these in "Additional Details" collapsed section (not in Essential Info)

### Task 4: Enhance Child Record Form for Services Details ✅ COMPLETE
- [x] Update `ChildRecordForm.tsx` to show Services-specific fields when:
  - Domain is 'services' AND recordType is 'Contact'
- [x] Services child fields to include:
  - Business Name
  - Service Type (Plumber, Electrician, etc.)
  - Contact Person
  - Phone (with "Call" button)
  - Email (with "Email" button)
  - Address
  - Rating (1-5 stars)
  - Last Service Date
  - Next Service Due
  - Hourly Rate (optional)
  - Emergency Contact checkbox

### Task 5: Update Page Descriptions ✅ COMPLETE
- [x] Finance page (`web/src/pages/Finance.tsx`): Update description from "Manage your financial accounts..." to "Organize your financial accounts by type (Current Accounts, Savings, ISAs, etc.)"
- [x] Services page (`web/src/pages/Services.tsx`): Update description from "Manage service providers..." to "Organize service providers by category (Tradespeople, Home Services, etc.)"

### Task 6: Update Example Data & Placeholders ✅ COMPLETE
- [x] Finance parent form placeholder: "e.g., Current Accounts, Credit Cards"
- [x] Services parent form placeholder: "e.g., Tradespeople, Home Services"
- [x] Update any hardcoded example text in components

### Task 7: Test Complete Workflow
- [ ] Manual test: Finance domain
  - Create parent "Current Accounts"
  - Add child record "HSBC Current Account" with account details
  - Add child record "Barclays Current Account" with different details
  - Verify both appear in list under "Current Accounts"
- [ ] Manual test: Services domain
  - Create parent "Tradespeople"
  - Add child record "Emergency Plumber" with contact details
  - Add child record "Electrician" with different details
  - Verify both appear in list under "Tradespeople"

### Task 8: Data Migration (Optional)
- [ ] Check if any Finance/Services parent entities exist in database
- [ ] If yes, create migration script or manual instructions
- [ ] If no, skip this task

---

## Dev Notes

### Intended User Experience

**Finance Workflow**:
```
1. User clicks "Add Account" on Finance page
2. Form shows:
   - Name: "Current Accounts" ✓
   - Account Type: [Current Account] ✓
   - Notes: "Personal current accounts for household"
   - Image: (optional logo)
3. User saves → Parent entity created
4. User clicks on "Current Accounts" card → Detail page
5. User clicks "Add Record" → Child record form
6. Form shows record type selector (Contact, Finance, Insurance, etc.)
7. User selects "Finance" → Shows detailed fields:
   - Name: "HSBC Current Account (John)" ✓
   - Institution: "HSBC UK"
   - Account Number: "12345678"
   - Sort Code: "12-34-56"
   - Account Holder: "John Doe"
   - Balance: £5,000
   - (etc.)
8. User saves → Child record appears in list
9. Repeat steps 5-8 for each bank account
```

**Services Workflow**:
```
1. User clicks "Add Service Provider" on Services page
2. Form shows:
   - Name: "Tradespeople" ✓
   - Service Category: [Tradespeople] ✓
   - Notes: "Emergency contacts for home repairs"
   - Image: (optional)
3. User saves → Parent entity created
4. User clicks on "Tradespeople" card → Detail page
5. User clicks "Add Record" → Child record form
6. Form shows record type selector
7. User selects "Contact" → Shows detailed fields:
   - Name: "Emergency Plumber"
   - Business Name: "Smith & Sons Plumbing"
   - Contact Person: "Bob Smith"
   - Phone: "028-9012-3456" (with Call button)
   - Email: "bob@smithplumbing.com"
   - Service Type: "Plumber"
   - Rating: 5 stars
   - (etc.)
8. User saves → Child record appears in list
9. Repeat for Electrician, Heating Engineer, etc.
```

### Field Comparison

**Before (Finance Parent)**:
```javascript
// ParentEntityForm for Finance (WRONG):
- Name: "HSBC Current Account" // Too specific!
- Financial Institution: "HSBC UK"
- Account Type: "Current Account"
- Account Number: "12345678"
- Sort Code: "12-34-56"
- Account Holder: "John Doe"
- Opened Date: "2020-01-15"
- Notes: "Primary account"
```

**After (Finance Parent + Child)**:
```javascript
// ParentEntityForm for Finance (CATEGORY):
- Name: "Current Accounts" ✓
- Account Type: "Current Account" ✓
- Notes: "Personal current accounts"
- Image: (optional)

// ChildRecordForm (SPECIFIC ACCOUNT):
- Record Type: "Finance"
- Name: "HSBC Current Account (John)"
- Institution: "HSBC UK"
- Account Number: "12345678"
- Sort Code: "12-34-56"
- Account Holder: "John Doe"
- Balance: 5000
- Opened Date: "2020-01-15"
- Notes: "Primary salary account"
```

### Code Changes Required

**File**: `web/src/components/parent-entities/ParentEntityForm.tsx`

**Lines 671-739** (Finance section):
```javascript
// BEFORE (Too detailed):
{domain === 'finance' && (
  <>
    <div>
      <label>Financial Institution</label>
      <input {...register('institution')} placeholder="HSBC UK" />
    </div>
    <div>
      <label>Account Type</label>
      <select {...register('accountType')}>...</select>
    </div>
    <div>
      <label>Account Number</label>
      <input {...register('accountNumber')} pattern="^\d{8}$" />
    </div>
    <div>
      <label>Sort Code</label>
      <input {...register('sortCode')} pattern="^\d{2}-\d{2}-\d{2}$" />
    </div>
    <div>
      <label>Account Holder</label>
      <input {...register('accountHolder')} />
    </div>
    <div>
      <label>Opened Date</label>
      <input type="date" {...register('openedDate')} />
    </div>
  </>
)}

// AFTER (Simplified - category level):
{domain === 'finance' && (
  <>
    <div>
      <label>Account Type Category</label>
      <select {...register('accountType')}>
        <option value="">Select type</option>
        <option value="Current Account">Current Accounts</option>
        <option value="Savings Account">Savings Accounts</option>
        <option value="ISA">ISAs</option>
        <option value="Credit Card">Credit Cards</option>
        <option value="Pension">Pensions</option>
        <option value="Investment">Investments</option>
        <option value="Mortgage">Mortgages</option>
        <option value="Loan">Loans</option>
      </select>
      <p style={hintStyle}>
        Choose the type of accounts you'll track in this category
      </p>
    </div>
  </>
)}
```

**Add Services Section** (if doesn't exist):
```javascript
{domain === 'services' && (
  <>
    <div>
      <label>Service Category</label>
      <select {...register('serviceCategory')}>
        <option value="">Select category</option>
        <option value="Tradespeople">Tradespeople</option>
        <option value="Home Services">Home Services</option>
        <option value="Professional Services">Professional Services</option>
        <option value="Garden & Outdoor">Garden & Outdoor</option>
        <option value="Automotive Services">Automotive Services</option>
        <option value="Other">Other</option>
      </select>
      <p style={hintStyle}>
        Choose the category for the services you'll track
      </p>
    </div>
  </>
)}
```

**File**: `web/src/components/child-records/ChildRecordForm.tsx`

Add Finance-specific and Services-specific field sections:
```javascript
// In Step 2 form, after Essential Info section:

{domain === 'finance' && selectedType === 'Finance' && (
  <div style={sectionStyle}>
    <h3>Account Details</h3>
    <Controller
      name="institution"
      control={control}
      render={({ field }) => (
        <input {...field} placeholder="HSBC UK" style={inputStyle} />
      )}
    />
    <Controller
      name="accountNumber"
      control={control}
      rules={{ pattern: /^\d{8}$/ }}
      render={({ field }) => (
        <input {...field} placeholder="12345678" style={inputStyle} />
      )}
    />
    <Controller
      name="sortCode"
      control={control}
      rules={{ pattern: /^\d{2}-\d{2}-\d{2}$/ }}
      render={({ field }) => (
        <input {...field} placeholder="12-34-56" style={inputStyle} />
      )}
    />
    {/* ... more finance fields */}
  </div>
)}

{domain === 'services' && selectedType === 'Contact' && (
  <div style={sectionStyle}>
    <h3>Service Provider Details</h3>
    <Controller
      name="businessName"
      control={control}
      render={({ field }) => (
        <input {...field} placeholder="Smith & Sons Plumbing" style={inputStyle} />
      )}
    />
    <Controller
      name="serviceType"
      control={control}
      render={({ field }) => (
        <select {...field} style={inputStyle}>
          <option value="">Select service type</option>
          <option value="Plumber">Plumber</option>
          <option value="Electrician">Electrician</option>
          <option value="Heating Engineer">Heating Engineer</option>
          {/* ... more service types */}
        </select>
      )}
    />
    {/* ... more services fields */}
  </div>
)}
```

---

## Testing

### Unit Tests
- ParentEntityForm: Verify simplified fields for Finance/Services
- ChildRecordForm: Verify domain-specific fields appear correctly

### Integration Tests
- Full Finance workflow: Category creation → Multiple accounts
- Full Services workflow: Category creation → Multiple providers

### Manual Testing Checklist
- [ ] Finance: Create "Current Accounts" parent
- [ ] Finance: Add 2-3 child bank accounts with different details
- [ ] Finance: Verify all child records appear in parent detail view
- [ ] Finance: Create "Credit Cards" parent
- [ ] Finance: Add 1-2 credit card child records
- [ ] Services: Create "Tradespeople" parent
- [ ] Services: Add plumber, electrician, heating engineer child records
- [ ] Services: Verify all providers appear in parent detail view
- [ ] Verify Vehicle/Property domains still work correctly (no regression)

---

## Dev Agent Record

### Agent Model Used
- Model: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References
- None

### Session Notes

**Session Date**: October 21, 2025
**Developer**: James (Full Stack Dev Agent)

**Session 1 Progress**:

1. **Story Creation** (This file)
   - Comprehensive story document with acceptance criteria
   - Detailed before/after comparisons
   - User workflow examples
   - Code change specifications

**Next Steps**:
- Task 1: Simplify Finance parent form
- Task 2: Simplify Services parent form
- Task 3-4: Enhance child record forms with domain-specific fields
- Task 5-6: Update page descriptions and placeholders
- Task 7: Manual testing of complete workflows

### Completion Notes
- TBD

### File List

**Files to Modify**:
- `web/src/components/parent-entities/ParentEntityForm.tsx` - Simplify Finance/Services sections
- `web/src/components/child-records/ChildRecordForm.tsx` - Add Finance/Services-specific child fields
- `web/src/pages/Finance.tsx` - Update description
- `web/src/pages/Services.tsx` - Update description (if exists)

**Files Created**:
- `docs/stories/epic-6-story-1.11-finance-services-hierarchy-fix.md` - This story document

**Total Estimated Changes**: ~300 lines

### Change Log
| Date | Change | Author |
|------|--------|--------|
| 2025-10-21 | Story created for Finance/Services hierarchy fix | James (Dev) |

---

## Related Issues

- Story 1.7: Services Integration (introduced Services domain with same hierarchy issue)
- Original data structure mismatch bug: Frontend sends nested `fields`, backend expects flat

---

**Implementation Status**: In Progress (Story created, ready to begin Task 1)
