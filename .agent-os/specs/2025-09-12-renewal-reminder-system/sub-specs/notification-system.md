# Notification System Architecture

This is the notification system architecture for the spec detailed in @.agent-os/specs/2025-09-12-renewal-reminder-system/spec.md

## Email Service Architecture

### Service Provider Configuration
**Primary:** AWS Simple Email Service (SES)
**Fallback:** Nodemailer with Gmail SMTP
**Template Engine:** Handlebars for email templates

**Configuration Structure:**
```javascript
// src/config/email.js
const emailConfig = {
  provider: process.env.EMAIL_PROVIDER || 'ses',
  ses: {
    region: process.env.AWS_REGION || 'eu-west-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    fromAddress: process.env.FROM_EMAIL || 'renewals@legacylock.co.uk'
  },
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  },
  templates: {
    directory: './src/templates/emails',
    defaultLanguage: 'en-GB'
  }
}
```

### Email Template System
**Template Directory:** `src/templates/emails/`
**Templates Required:**
- `renewal-reminder-7days.hbs` - One week before renewal
- `renewal-reminder-14days.hbs` - Two weeks before renewal  
- `renewal-reminder-1day.hbs` - Final reminder
- `renewal-overdue.hbs` - Post-expiry notification

**Template Structure:**
```handlebars
<!-- renewal-reminder-7days.hbs -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Renewal Reminder - {{entryTitle}}</title>
  <style>
    /* Swiss spa aesthetic styles matching web app */
    body { font-family: 'Inter', sans-serif; }
    .header { background-color: #9BA99E; color: white; }
    .content { background-color: #F8F9F7; }
    .cta-button { background-color: #3B5D4F; color: white; }
  </style>
</head>
<body>
  <div class="header">
    <h1>LegacyLock Renewal Reminder</h1>
  </div>
  <div class="content">
    <p>Your {{category}} with {{provider}} expires in 7 days.</p>
    <h3>{{entryTitle}}</h3>
    <p><strong>Renewal Date:</strong> {{renewalDate}}</p>
    <p><strong>Days Remaining:</strong> {{daysUntilRenewal}}</p>
    
    <a href="{{actionUrl}}/handled" class="cta-button">Mark as Handled</a>
    <a href="{{actionUrl}}/snooze" class="cta-button">Remind Me Later</a>
    <a href="{{editUrl}}" class="cta-button">Update Details</a>
  </div>
</body>
</html>
```

## Background Job System

### Cron Job Configuration
**Scheduler:** Node-cron with timezone support
**Primary Job:** Daily renewal check at 9:00 AM GMT
**Secondary Jobs:** Cleanup and health checks

```javascript
// src/jobs/renewalReminders.js
const cron = require('node-cron');
const RenewalReminderService = require('../services/RenewalReminderService');

// Daily renewal reminder job - 9:00 AM GMT
cron.schedule('0 9 * * *', async () => {
  console.log('Starting daily renewal reminder job');
  try {
    await RenewalReminderService.processRenewalReminders();
    console.log('Renewal reminder job completed successfully');
  } catch (error) {
    console.error('Renewal reminder job failed:', error);
    // Send error notification to admin
    await NotificationService.sendAdminAlert('Renewal job failed', error);
  }
}, {
  timezone: "Europe/London"
});

// Weekly cleanup job - Sundays at 2:00 AM
cron.schedule('0 2 * * 0', async () => {
  await RenewalReminderService.cleanupOldLogs();
}, {
  timezone: "Europe/London"
});
```

### Job Processing Logic
**File:** `src/services/RenewalReminderService.js`

```javascript
class RenewalReminderService {
  static async processRenewalReminders() {
    const today = new Date();
    const users = await User.find({ 'reminderPreferences.emailEnabled': true });
    
    for (const user of users) {
      const preferences = user.reminderPreferences || this.getDefaultPreferences();
      
      // Find entries needing reminders for this user
      const entriesToRemind = await this.findEntriesNeedingReminders(
        user._id, 
        today, 
        preferences.defaultReminderDays
      );
      
      for (const entry of entriesToRemind) {
        await this.processEntryReminder(entry, user, preferences);
      }
    }
  }
  
  static async findEntriesNeedingReminders(userId, today, reminderDays) {
    const reminderDates = reminderDays.map(days => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return date;
    });
    
    return Entry.find({
      $or: [
        { owner: userId },
        { sharedWith: userId }
      ],
      'accountDetails.renewalInfo.isRenewalTracked': true,
      'accountDetails.renewalInfo.endDate': {
        $in: reminderDates.map(date => ({
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999))
        }))
      },
      $or: [
        { 'accountDetails.renewalInfo.lastReminderSent': { $exists: false } },
        { 
          'accountDetails.renewalInfo.lastReminderSent': {
            $lt: new Date(today.setHours(0, 0, 0, 0))
          }
        }
      ]
    });
  }
  
  static async processEntryReminder(entry, user, preferences) {
    const daysUntilRenewal = this.calculateDaysUntilRenewal(
      entry.accountDetails.renewalInfo.endDate
    );
    
    try {
      // Send email reminder
      await EmailService.sendRenewalReminder(user.email, entry, daysUntilRenewal);
      
      // Log the reminder
      await ReminderLog.create({
        entryId: entry._id,
        userId: user._id,
        reminderType: this.getReminderType(daysUntilRenewal),
        scheduledDate: new Date(),
        sentDate: new Date(),
        emailAddress: user.email,
        status: 'sent',
        renewalDate: entry.accountDetails.renewalInfo.endDate,
        daysBeforeRenewal: daysUntilRenewal
      });
      
      // Update entry with last reminder sent
      entry.accountDetails.renewalInfo.lastReminderSent = new Date();
      await entry.save();
      
    } catch (error) {
      // Log failed reminder
      await ReminderLog.create({
        entryId: entry._id,
        userId: user._id,
        reminderType: 'reminder_failed',
        scheduledDate: new Date(),
        emailAddress: user.email,
        status: 'failed',
        renewalDate: entry.accountDetails.renewalInfo.endDate,
        daysBeforeRenewal: daysUntilRenewal,
        errorMessage: error.message
      });
      
      throw error;
    }
  }
}
```

## Error Handling and Monitoring

### Error Classification
**Email Delivery Errors:**
- Hard bounces: Invalid email addresses
- Soft bounces: Temporary delivery issues  
- Rate limiting: Too many emails sent
- Authentication: Invalid AWS credentials

**System Errors:**
- Database connection failures
- Cron job scheduling issues
- Template rendering errors
- Job timeout (processing too long)

### Error Response Strategy
```javascript
// src/middleware/renewalErrorHandler.js
const errorHandler = {
  async handleEmailDeliveryError(error, entry, user) {
    const errorType = this.classifyEmailError(error);
    
    switch (errorType) {
      case 'hard_bounce':
        // Disable email for user, log issue
        await User.updateOne(
          { _id: user._id },
          { 'reminderPreferences.emailEnabled': false }
        );
        await this.notifyAdminOfBounce(user, error);
        break;
        
      case 'rate_limit':
        // Retry with exponential backoff
        await this.scheduleRetry(entry, user, error.retryAfter || 300);
        break;
        
      case 'soft_bounce':
        // Retry up to 3 times
        if (entry.retryCount < 3) {
          await this.scheduleRetry(entry, user, 1800); // 30 minutes
        }
        break;
        
      default:
        // Log and continue
        console.error('Unknown email error:', error);
    }
  }
}
```

### Health Monitoring
**Endpoint:** `GET /api/admin/renewal-system/health`
**Monitors:**
- Last job execution time
- Success/failure rates over 24 hours
- Email delivery statistics
- Database connection status
- Queue depth and processing time

**Health Check Response:**
```json
{
  "status": "healthy",
  "lastJobRun": "2025-03-12T09:00:15.000Z",
  "jobDuration": "45s",
  "statistics": {
    "last24Hours": {
      "totalReminders": 156,
      "successfulDeliveries": 148,
      "failedDeliveries": 8,
      "hardBounces": 2,
      "softBounces": 6
    }
  },
  "queueHealth": {
    "pendingJobs": 0,
    "averageProcessingTime": "2.3s"
  }
}
```

## User Notification Preferences

### Preference Storage
**Database:** User-level reminder preferences with category overrides
**Default Settings:** Sensible UK-focused defaults

```javascript
// Default reminder preferences for new users
const defaultReminderPreferences = {
  emailEnabled: true,
  defaultReminderDays: [7, 14], // 1 and 2 weeks before
  reminderTime: '09:00',
  timezone: 'Europe/London',
  customCategories: {
    'Insurance': {
      reminderDays: [14, 7, 1], // Extra reminders for important policies
      emailEnabled: true
    },
    'Subscriptions': {
      reminderDays: [7], // Less urgent, one reminder
      emailEnabled: true
    },
    'Utilities': {
      reminderDays: [], // Usually auto-renewing, no reminders needed
      emailEnabled: false
    }
  }
};
```

### Preference Management UI
**Settings Page:** `/settings/reminders`
**Features:**
- Master toggle for all email reminders
- Default reminder timing (days before renewal)
- Time of day preference with timezone
- Category-specific overrides
- Test reminder functionality
- Unsubscribe/resubscribe options

## Deliverability and Compliance

### Email Best Practices
**Authentication:**
- SPF records configured for sending domain
- DKIM signing enabled
- DMARC policy implemented

**Content Guidelines:**
- Clear subject lines with renewal date
- Unsubscribe link in footer
- Mobile-responsive HTML templates
- Plain text fallback versions

### Data Protection
**GDPR Compliance:**
- User consent tracking for email notifications
- Right to unsubscribe/delete notification data
- Data retention policy (30 days for logs)
- Audit trail of all notification activities

**Security:**
- No sensitive financial data in emails
- Secure links with time-limited tokens
- HTTPS for all email action URLs
- User authentication required for renewal actions