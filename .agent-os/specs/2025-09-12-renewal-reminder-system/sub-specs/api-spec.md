# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-12-renewal-reminder-system/spec.md

## Endpoints

### GET /api/entries/:id/renewal
**Purpose:** Get renewal information for a specific entry
**Parameters:** 
- `id` (path) - Entry ID
**Response:** 
```json
{
  "renewalInfo": {
    "startDate": "2024-03-15T00:00:00.000Z",
    "endDate": "2025-03-15T00:00:00.000Z",
    "renewalCycle": "annually",
    "isRenewalTracked": true,
    "lastReminderSent": "2025-02-15T09:00:00.000Z",
    "reminderSettings": {
      "reminderDays": [7, 14],
      "emailEnabled": true
    },
    "renewalHistory": [
      {
        "renewalDate": "2024-03-15T00:00:00.000Z",
        "action": "renewed",
        "notes": "Switched to new provider"
      }
    ]
  },
  "nextRenewalDate": "2025-03-15T00:00:00.000Z",
  "daysUntilRenewal": 45,
  "upcomingReminders": [
    {
      "reminderDate": "2025-03-01T09:00:00.000Z",
      "daysBeforeRenewal": 14
    },
    {
      "reminderDate": "2025-03-08T09:00:00.000Z",
      "daysBeforeRenewal": 7
    }
  ]
}
```
**Errors:** 404 if entry not found, 403 if user doesn't have access

### PUT /api/entries/:id/renewal
**Purpose:** Update renewal information for an entry
**Parameters:**
- `id` (path) - Entry ID
- Body:
```json
{
  "startDate": "2024-03-15T00:00:00.000Z",
  "endDate": "2025-03-15T00:00:00.000Z",
  "renewalCycle": "annually",
  "isRenewalTracked": true,
  "reminderSettings": {
    "reminderDays": [7, 14],
    "emailEnabled": true
  }
}
```
**Response:** Updated renewal information object
**Errors:** 400 for invalid dates, 404 if entry not found, 403 if user doesn't have access

### GET /api/users/me/renewals/upcoming
**Purpose:** Get all upcoming renewals for the current user
**Parameters:** 
- `days` (query, optional) - Number of days ahead to look (default: 90)
- `includeOverdue` (query, optional) - Include overdue renewals (default: true)
**Response:**
```json
{
  "renewals": [
    {
      "entryId": "60f1b2b3c4d5e6f7a8b9c0d1",
      "title": "Car Insurance - Direct Line",
      "provider": "Direct Line",
      "category": "Insurance",
      "renewalDate": "2025-03-15T00:00:00.000Z",
      "daysUntilRenewal": 45,
      "isOverdue": false,
      "reminderSettings": {
        "reminderDays": [7, 14]
      },
      "lastReminderSent": null
    }
  ],
  "summary": {
    "total": 5,
    "overdue": 1,
    "thisMonth": 2,
    "nextMonth": 2
  }
}
```
**Errors:** 401 if not authenticated

### POST /api/users/me/renewals/:entryId/actions
**Purpose:** Record user action on a renewal (handled, snoozed, dismissed)
**Parameters:**
- `entryId` (path) - Entry ID for the renewal
- Body:
```json
{
  "action": "handled", // "handled", "snoozed", "dismissed"
  "snoozeUntil": "2025-03-01T00:00:00.000Z", // Required if action is "snoozed"
  "notes": "Renewed with same provider for another year"
}
```
**Response:** 
```json
{
  "success": true,
  "message": "Action recorded successfully"
}
```
**Errors:** 400 for invalid action, 404 if entry not found

### GET /api/users/me/reminder-preferences
**Purpose:** Get user's reminder preferences
**Response:**
```json
{
  "defaultReminderDays": [7, 14],
  "emailEnabled": true,
  "reminderTime": "09:00",
  "timezone": "Europe/London",
  "customCategories": {
    "Insurance": {
      "reminderDays": [14, 7, 1]
    },
    "Subscriptions": {
      "reminderDays": [7]
    }
  }
}
```

### PUT /api/users/me/reminder-preferences
**Purpose:** Update user's reminder preferences
**Parameters:**
- Body: Same structure as GET response
**Response:** Updated preferences object
**Errors:** 400 for invalid preference values

### GET /api/admin/renewal-system/status
**Purpose:** Get renewal system health and statistics (admin only)
**Response:**
```json
{
  "lastJobRun": "2025-03-12T09:00:15.000Z",
  "nextJobRun": "2025-03-13T09:00:00.000Z",
  "jobStatus": "healthy",
  "statistics": {
    "totalRenewalEntries": 1250,
    "remindersScheduledToday": 23,
    "remindersSentToday": 20,
    "failedReminders": 3,
    "overdueRenewals": 45
  },
  "recentErrors": [
    {
      "timestamp": "2025-03-12T09:15:00.000Z",
      "error": "Email delivery failed for user@example.com",
      "entryId": "60f1b2b3c4d5e6f7a8b9c0d1"
    }
  ]
}
```

### POST /api/admin/renewal-system/run-job
**Purpose:** Manually trigger renewal reminder job (admin only)
**Response:**
```json
{
  "success": true,
  "message": "Renewal reminder job started",
  "jobId": "renewal-job-1647077155000"
}
```

## Controllers

### RenewalController
**Actions:**
- `getRenewalInfo(req, res)` - Retrieve renewal info for an entry
- `updateRenewalInfo(req, res)` - Update entry renewal settings
- `getUserRenewals(req, res)` - Get upcoming renewals for user
- `recordRenewalAction(req, res)` - Record user action on renewal

### ReminderPreferencesController
**Actions:**
- `getPreferences(req, res)` - Get user's reminder preferences
- `updatePreferences(req, res)` - Update reminder preferences
- `validatePreferences(preferences)` - Validate preference data

### RenewalSystemController (Admin)
**Actions:**
- `getSystemStatus(req, res)` - Get renewal system health
- `triggerReminderJob(req, res)` - Manually run reminder job
- `getReminderLogs(req, res)` - Get reminder delivery logs

## Background Services

### RenewalReminderService
**Methods:**
- `processRenewalReminders()` - Main job function
- `findUpcomingRenewals(date, reminderDays)` - Query for renewals needing reminders
- `sendReminderEmail(entry, user, reminderType)` - Send individual reminder
- `logReminderDelivery(entry, user, status)` - Record reminder in log

### EmailService
**Methods:**
- `sendRenewalReminder(to, entryDetails, renewalDate)` - Send renewal reminder email
- `generateReminderEmail(entry, daysUntil)` - Generate email content
- `validateEmailAddress(email)` - Validate email before sending