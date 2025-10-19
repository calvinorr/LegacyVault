# Story 1.9: Data Migration Execution & User Onboarding

**Epic**: 6 - Hierarchical Domain Model Refactor
**Story**: 1.9
**Status**: Draft
**Assigned**: James (Dev Agent)
**Estimated**: 6 hours
**Actual**: TBD
**Priority**: P0 - Blocking
**Depends On**: All previous stories (1.1-1.8)

---

## Story

**As a** system administrator,
**I want** to execute the data migration and guide users through the new hierarchical structure,
**so that** users understand the continuity planning purpose and can rebuild their data efficiently.

---

## Context

This story delivers the **migration execution interface** and **user onboarding experience** for Epic 6's hierarchical domain model refactor. The migration will:

1. **Delete legacy data** from flat domain collections (Insurance, Finance, Services, Government, Legal)
2. **Preserve parent entities** (Vehicle, Property, Employment records remain but stripped of legacy child data)
3. **Provide admin UI** for previewing and executing migration with safety checks
4. **Onboard users** with tutorial explaining continuity planning purpose and new structure

**Critical**: This is a **destructive migration** that deletes user data. Multiple safety checks and confirmations are required.

---

## Acceptance Criteria

- [ ] AC1: Admin UI at `/admin/migrate` shows migration preview (dry-run results)
- [ ] AC2: Preview displays: collections to delete, record counts, estimated backup size
- [ ] AC3: "Execute Migration" button requires explicit admin confirmation (type "DELETE ALL DATA")
- [ ] AC4: Migration script runs with progress indicator (percentage complete)
- [ ] AC5: Post-migration, users see onboarding tutorial on first login explaining continuity planning purpose
- [ ] AC6: Tutorial explains: LegacyLock's continuity planning purpose, new hierarchical structure, how to create parent entities (including Services domain), how to add child records with emphasis on contact info and renewal dates, how to use transaction-to-entry workflow
- [ ] AC7: Tutorial includes video/GIF demonstrations and "Skip" option
- [ ] AC8: Migration completion email sent to all users with summary of changes and continuity planning guidance
- [ ] AC9: Rollback button available in admin UI (restores from backup)

---

## Integration Verification

- [ ] IV1: Database backup - Verify backup created before migration and restore process works
- [ ] IV2: Epic 5 functionality - Test transaction import, pattern detection, and entry creation post-migration
- [ ] IV3: User permissions - Ensure all existing users can access new hierarchical structure

---

## Tasks

### Task 1: Create Migration Admin UI Page
- [ ] Create `web/src/pages/AdminMigration.tsx`
- [ ] Add route: `/admin/migrate` (admin role required)
- [ ] Add to admin navigation menu
- [ ] Display page header: "Epic 6 Migration - Hierarchical Domain Model"
- [ ] Add warning banner: "This migration will DELETE legacy data. Backup will be created."
- [ ] Add "Preview Migration" button (runs dry-run)
- [ ] Add "Execute Migration" section (initially disabled)
- [ ] Style with Swiss spa aesthetic

### Task 2: Implement Migration Preview (Dry-Run)
- [ ] Update migration script in `src/scripts/migrateToHierarchical.js`
- [ ] Add dry-run mode flag (no database changes)
- [ ] Query collections to be deleted (Insurance, Finance, Services, Government, Legal)
- [ ] Count records per collection per user
- [ ] Calculate estimated backup size (in MB)
- [ ] Return preview data: collections, record counts, backup size, estimated duration
- [ ] Add endpoint: GET /api/admin/migrate/preview

### Task 3: Display Migration Preview Results
- [ ] Fetch preview data on "Preview Migration" button click
- [ ] Display in structured layout:
  - Total records to delete (per collection)
  - Users affected (count)
  - Estimated backup size
  - Estimated migration duration (based on record count)
- [ ] Show warning: "The following data will be permanently deleted:"
- [ ] List collections with record counts in table
- [ ] Add "Proceed to Migration" button (enables Execute section)

### Task 4: Implement Migration Execution
- [ ] Add endpoint: POST /api/admin/migrate/execute
- [ ] Require admin role and explicit confirmation parameter
- [ ] Step 1: Create database backup (MongoDB dump)
- [ ] Step 2: Delete records from legacy collections
- [ ] Step 3: Update migration status flag in database
- [ ] Step 4: Send notification emails to all users
- [ ] Return progress updates via Server-Sent Events (SSE) or WebSocket
- [ ] Log all operations to debug log
- [ ] Add error handling and rollback on failure

### Task 5: Implement Confirmation UI
- [ ] Add confirmation section to admin UI
- [ ] Display large warning: "⚠️ This action cannot be undone"
- [ ] Add text input: "Type 'DELETE ALL DATA' to confirm"
- [ ] Disable "Execute Migration" button until exact text entered
- [ ] Add final confirmation modal: "Are you absolutely sure?"
- [ ] Show checklist of safety steps completed:
  - ✅ Backup will be created
  - ✅ Users will be notified
  - ✅ Rollback available for 30 days
- [ ] Add "Cancel" and "Execute Migration" buttons

### Task 6: Implement Progress Indicator
- [ ] Use Server-Sent Events or WebSocket for real-time updates
- [ ] Display progress bar (0-100%)
- [ ] Show current step: "Creating backup...", "Deleting records...", "Sending notifications..."
- [ ] Show records processed count
- [ ] Estimate time remaining
- [ ] Show success message on completion: "✅ Migration Complete"
- [ ] Show error message on failure with rollback instructions

### Task 7: Implement Rollback Functionality
- [ ] Add endpoint: POST /api/admin/migrate/rollback
- [ ] Restore collections from backup
- [ ] Reset migration status flag
- [ ] Verify data integrity after restore
- [ ] Send rollback notification email to users
- [ ] Add "Rollback Migration" button in admin UI (only available if backup exists)
- [ ] Require confirmation (type "ROLLBACK")

### Task 8: Create User Onboarding Tutorial Component
- [ ] Create `web/src/components/onboarding/OnboardingTutorial.tsx`
- [ ] Implement multi-step modal/overlay tutorial
- [ ] Step 1: Welcome - "LegacyLock: Household Continuity Planning"
- [ ] Step 2: Purpose - Explain continuity planning goal (not just financial tracking)
- [ ] Step 3: New Structure - Show diagram of parent → child hierarchy
- [ ] Step 4: Parent Entities - How to create Vehicles, Properties, Employments, Services
- [ ] Step 5: Child Records - How to add Contact, Insurance, Service History records
- [ ] Step 6: Key Features - Renewals dashboard, Contact directory, Transaction workflow
- [ ] Step 7: Get Started - Call-to-action buttons (Create First Vehicle/Property/etc.)
- [ ] Add "Skip Tutorial" button on each step
- [ ] Add "Previous" and "Next" buttons
- [ ] Show progress indicator (Step 1 of 7)

### Task 9: Implement Onboarding Trigger Logic
- [ ] Add `hasSeenEpic6Onboarding` flag to User model
- [ ] Check flag on app load (in useAuth hook)
- [ ] If false and migration complete, show OnboardingTutorial
- [ ] Set flag to true when user completes or skips tutorial
- [ ] Add "View Tutorial Again" button in settings page

### Task 10: Create Tutorial Content and Visuals
- [ ] Write tutorial copy emphasizing continuity planning
- [ ] Create diagrams:
  - Flat structure (old) vs Hierarchical structure (new)
  - Parent-child relationship visualization
  - Example: Vehicle with child records
- [ ] Create GIF/video demonstrations (optional, can use static screenshots):
  - Creating a parent entity
  - Adding a child record
  - Using transaction-to-entry workflow
- [ ] Design with Swiss spa aesthetic (consistent branding)

### Task 11: Implement Migration Notification Email
- [ ] Create email template: `src/templates/migrationNotificationEmail.html`
- [ ] Subject: "LegacyLock Epic 6 Migration - Important Changes"
- [ ] Content:
  - Explanation of migration and continuity planning purpose
  - What data was deleted (legacy flat records)
  - What data was preserved (Vehicle, Property, Employment parent entities)
  - How to rebuild data in new hierarchical structure
  - Link to tutorial video/guide
  - Support contact information
- [ ] Send to all users using existing email service
- [ ] Add endpoint to resend email if needed

### Task 12: Write Comprehensive Tests
- [ ] Test migration preview endpoint - dry-run, record counts (3 tests)
- [ ] Test migration execution endpoint - backup, deletion, status update (5 tests)
- [ ] Test rollback endpoint - restore, data integrity (3 tests)
- [ ] Test admin UI - preview display, confirmation flow (4 tests)
- [ ] Test progress indicator - SSE updates, completion (2 tests)
- [ ] Test onboarding tutorial - step navigation, skip, completion (4 tests)
- [ ] Test onboarding trigger - flag check, display logic (2 tests)
- [ ] Test notification email - template rendering, sending (2 tests)

---

## Dev Notes

**Migration Preview Response**:
```json
{
  "collectionsToDelete": [
    { "name": "insurances", "count": 15 },
    { "name": "finances", "count": 22 },
    { "name": "services", "count": 8 },
    { "name": "governments", "count": 12 },
    { "name": "legals", "count": 3 }
  ],
  "totalRecords": 60,
  "usersAffected": 5,
  "estimatedBackupSizeMB": 2.4,
  "estimatedDurationMinutes": 3
}
```

**Migration Execution Flow**:
```
1. Admin clicks "Preview Migration"
   → GET /api/admin/migrate/preview
   → Display preview results

2. Admin types "DELETE ALL DATA" and clicks "Execute Migration"
   → Final confirmation modal
   → POST /api/admin/migrate/execute

3. Server-side execution:
   a. Create MongoDB backup (mongodump)
   b. Send SSE: { step: 'backup', progress: 20 }
   c. Delete records from legacy collections
   d. Send SSE: { step: 'delete', progress: 60 }
   e. Set migration status flag
   f. Send notification emails
   g. Send SSE: { step: 'complete', progress: 100 }

4. Admin sees success message
   → "Rollback Migration" button now available
```

**Onboarding Tutorial Steps**:
```
Step 1: Welcome
├─ Heading: "Welcome to the New LegacyLock"
├─ Subheading: "Designed for Household Continuity Planning"
└─ Image: LegacyLock logo

Step 2: Purpose
├─ Heading: "What is Continuity Planning?"
├─ Body: "LegacyLock helps ensure your partner or executor can answer critical questions..."
└─ Examples: "Who do I call when the boiler breaks?" "When does the car insurance renew?"

Step 3: New Structure
├─ Heading: "Hierarchical Organization"
├─ Diagram: Parent (Vehicle) → Children (Insurance, Finance, Service History)
└─ Body: "All information about an entity organized in one place"

Step 4: Parent Entities
├─ Heading: "Create Parent Entities"
├─ Options: Vehicles, Properties, Employments, Services
└─ GIF: Creating a vehicle parent entity

Step 5: Child Records
├─ Heading: "Add Child Records"
├─ Priority: Contact info, renewal dates, service history
└─ GIF: Adding insurance child record to vehicle

Step 6: Key Features
├─ Renewals Dashboard - See upcoming renewal dates
├─ Contact Directory - Quick access to emergency contacts
└─ Transaction Workflow - Link bank transactions to entities

Step 7: Get Started
├─ Call-to-action buttons:
│  ├─ [Create First Vehicle]
│  ├─ [Create First Property]
│  └─ [View Services Directory]
└─ [Skip Tutorial]
```

**Migration Notification Email Template**:
```html
<!DOCTYPE html>
<html>
<head>
  <title>LegacyLock Epic 6 Migration</title>
</head>
<body style="font-family: Inter, sans-serif;">
  <h1>LegacyLock Epic 6 Migration Complete</h1>

  <h2>What Changed?</h2>
  <p>We've transformed LegacyLock to better serve its core purpose: <strong>household continuity planning</strong>.</p>

  <h2>What Data Was Affected?</h2>
  <ul>
    <li><strong>Deleted:</strong> Legacy flat records (Insurance, Finance, Services, Government, Legal collections)</li>
    <li><strong>Preserved:</strong> Vehicle, Property, and Employment parent entities</li>
  </ul>

  <h2>What's New?</h2>
  <ul>
    <li><strong>Hierarchical Structure:</strong> Organize child records (insurance, finance, contacts) under parent entities</li>
    <li><strong>Services Domain:</strong> Manage tradespeople and service providers for easy emergency access</li>
    <li><strong>Renewals Dashboard:</strong> Track upcoming renewal dates proactively</li>
    <li><strong>Contact Directory:</strong> Quick access to all contact information</li>
  </ul>

  <h2>Next Steps</h2>
  <p>Log in to see the onboarding tutorial and start rebuilding your data with the new continuity-focused structure.</p>

  <a href="https://legacylock.com" style="...">Get Started</a>

  <p>Questions? Contact support@legacylock.com</p>
</body>
</html>
```

**Safety Checklist (Admin UI)**:
```
Before Migration:
☑ Database backup strategy tested
☑ Rollback procedure verified
☑ Users notified 48 hours in advance
☑ Migration scheduled for low-traffic window

During Migration:
☐ Create backup (automatic)
☐ Delete legacy records (automatic)
☐ Update migration status (automatic)
☐ Send user notifications (automatic)

After Migration:
☐ Verify Epic 5 functionality
☐ Monitor error logs
☐ Check user onboarding completion rate
☐ Keep backup for 30 days
```

---

## Testing

### Unit Tests
- Migration script - dry-run mode, record deletion
- Rollback logic - backup restore, data integrity
- Onboarding trigger - flag check, display conditions

### Integration Tests
- Full migration flow - preview → execute → completion
- Rollback flow - execute → rollback → verify data
- Email notification - template rendering, sending

### End-to-End Tests
- Admin executes migration and sees success
- User logs in and sees onboarding tutorial
- User completes tutorial and creates first parent entity

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
| 2025-01-17 | Story created for Migration Execution & User Onboarding | James (Dev) |

---

**Implementation Status**: Draft - Ready for implementation
