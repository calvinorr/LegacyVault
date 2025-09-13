# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-12-renewal-reminder-system/spec.md

## Technical Requirements

### Database Schema Changes

**Entry Model Extensions:**
- Add `renewalInfo` object to `accountDetails` structure with fields:
  - `startDate: Date` - Policy or subscription start date
  - `endDate: Date` - Policy or subscription end date  
  - `renewalCycle: String` - enum: ['monthly', 'quarterly', 'annually', 'custom']
  - `reminderSettings: Object` - notification preferences
  - `isRenewalTracked: Boolean` - flag to enable/disable renewal tracking
  - `lastReminderSent: Date` - timestamp of last notification
  - `renewalHistory: Array` - historical renewal dates and actions

**New ReminderPreference Model:**
```javascript
{
  userId: ObjectId, // User who owns the preferences
  defaultReminderDays: [7, 14], // Days before renewal to send reminders
  emailEnabled: Boolean, // Master toggle for email notifications
  reminderTime: String, // Time of day to send reminders (e.g., "09:00")
  timezone: String, // User's timezone (default: "Europe/London")
  customCategories: Object // Category-specific override settings
}
```

**New ReminderLog Model:**
```javascript
{
  entryId: ObjectId, // Reference to the entry
  userId: ObjectId, // User who received the reminder
  reminderType: String, // "renewal_upcoming", "renewal_overdue"
  scheduledDate: Date, // When reminder was meant to be sent
  sentDate: Date, // When reminder was actually sent
  emailAddress: String, // Where reminder was sent
  status: String, // "sent", "failed", "bounced"
  renewalDate: Date, // The renewal date this reminder was for
  daysBeforeRenewal: Number, // How many days before renewal
  emailContent: String, // Copy of email sent (optional)
  userAction: String // "dismissed", "snoozed", "handled", null
}
```

### UK-Specific Renewal Patterns

**Smart Category Detection:**
- Insurance categories automatically enable renewal tracking
- Subscription services default to monthly/annual cycles
- Utilities and one-time bills exclude renewal features
- UK-specific cycles: TV Licence (annual), Council Tax (annual), insurance (annual)

**Date Validation:**
- UK date format display (DD/MM/YYYY)
- Validation for reasonable renewal cycles (7 days to 3 years)
- Warning for past renewal dates with option to update

### Email Notification System

**Email Service Integration:**
- Support for AWS SES, SendGrid, or Nodemailer with Gmail
- Template-based email system with UK-specific formatting
- Email content includes: entry details, renewal date, action buttons
- Configurable sender address and branding

**Notification Logic:**
- Daily cron job at configurable time (default 9:00 AM GMT)
- Check all entries with `isRenewalTracked: true`
- Send reminders based on user's `defaultReminderDays` settings
- Respect user's timezone for delivery timing
- Implement exponential backoff for failed deliveries

### Background Job Infrastructure

**Cron Job Implementation:**
- Use node-cron for scheduling daily reminder checks
- Separate job for cleanup of old reminder logs (30-day retention)
- Health check endpoint for monitoring job execution
- Error handling and logging for failed reminder processing

**Job Processing:**
```javascript
// Daily renewal reminder check
const renewalReminderJob = {
  schedule: "0 9 * * *", // 9 AM daily
  timezone: "Europe/London",
  handler: processRenewalReminders
}
```

### Performance Considerations

- Index `accountDetails.renewalInfo.endDate` for efficient renewal queries
- Batch email sending to prevent rate limiting
- Configurable batch size for large user bases
- Optional Redis cache for user preferences to reduce database queries

## External Dependencies

**Email Service Provider:**
- **AWS SES** - Production email delivery service
- **Justification:** Reliable, cost-effective, good deliverability for transactional emails

**Scheduling Library:**
- **node-cron** - Cron job scheduling for Node.js
- **Justification:** Lightweight, reliable scheduling without external dependencies

**Date Handling:**
- **date-fns** - Modern date utility library
- **Justification:** Better than moment.js, tree-shakeable, good timezone support