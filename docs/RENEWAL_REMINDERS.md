# Renewal Reminder System Documentation

## Overview

Phase 1 of the renewal reminder system has been implemented with database models and schema changes to support tracking renewal dates and sending notifications for financial products, utilities, insurance policies, and subscriptions.

## Database Models

### 1. Extended Entry Model
The existing `Entry` model now includes a `renewalInfo` field with the following structure:

```javascript
renewalInfo: {
  startDate: Date,           // Contract/policy start date
  endDate: Date,             // Next renewal/expiry date  
  renewalCycle: String,      // 'monthly', 'quarterly', 'bi-annually', 'annually', 'custom'
  customCycleDays: Number,   // For custom cycles, number of days
  reminderDays: [Number],    // Days before renewal to send reminders [30, 7]
  isActive: Boolean,         // Whether renewal tracking is active
  autoRenewal: Boolean,      // Whether it auto-renews
  lastRenewalDate: Date,     // When it was last renewed
  notes: String              // Additional renewal notes
}
```

#### New Methods:
- `needsRenewalReminder(daysAhead)` - Check if entry needs reminder
- `getNextRenewalDate()` - Calculate next renewal date based on cycle
- `Entry.findEntriesNeedingReminders(daysAhead)` - Find entries needing reminders

### 2. ReminderPreference Model
User-specific notification preferences with category overrides:

```javascript
{
  userId: ObjectId,                    // Reference to User
  globalEnabled: Boolean,              // Master switch for all reminders
  defaultReminderDays: [Number],       // Default days before renewal [30, 7]
  notificationMethods: {
    email: Boolean                     // Email notifications enabled
  },
  emailSettings: {
    preferredTime: String,             // 'morning', 'afternoon', 'evening'
    digestFrequency: String,           // 'daily', 'weekly', 'never'
    individualReminders: Boolean       // Send individual reminders per entry
  },
  categoryOverrides: [{
    categoryId: ObjectId,              // Reference to Category
    enabled: Boolean,                  // Override enabled for this category
    reminderDays: [Number],            // Custom reminder days for category
    notificationMethods: { email: Boolean }
  }],
  dateFormat: String,                  // UK date format preference
  advancedSettings: {
    excludeWeekends: Boolean,          // Don't send reminders on weekends
    excludeBankHolidays: Boolean,      // Don't send on UK bank holidays
    timezone: String,                  // 'Europe/London'
    quietHours: {
      enabled: Boolean,
      startTime: String,               // '22:00'
      endTime: String                  // '08:00'
    }
  }
}
```

#### Key Methods:
- `getReminderSettingsForCategory(categoryId)` - Get effective settings for category
- `setCategoryOverride(categoryId, settings)` - Set category-specific preferences
- `ReminderPreference.getOrCreateForUser(userId)` - Get or create user preferences

### 3. ReminderLog Model
Comprehensive logging of all sent reminders:

```javascript
{
  entryId: ObjectId,                   // Entry this reminder is for
  userId: ObjectId,                    // User who received reminder
  reminderType: String,                // 'individual', 'digest', 'urgent'
  daysAhead: Number,                   // Days ahead this reminder was sent for
  renewalDate: Date,                   // Renewal date this reminder was for
  sentAt: Date,                        // When reminder was sent
  notificationMethod: String,          // 'email', 'sms', 'push', 'in-app'
  status: String,                      // 'pending', 'sent', 'delivered', 'failed'
  deliveryDetails: {
    providerId: String,                // External provider's message ID
    provider: String,                  // 'sendgrid', 'ses', 'nodemailer'
    recipientEmail: String,            // Email address used
    subject: String,                   // Email subject line
    errorMessage: String,              // Error details if failed
    deliveredAt: Date,                 // When marked as delivered
    openedAt: Date,                    // If email was opened
    clickedAt: Date                    // If links were clicked
  },
  contentDetails: {
    templateUsed: String,              // Template identifier
    entryTitle: String,                // Entry title at time of sending
    entryProvider: String,             // Provider name at time of sending
    reminderMessage: String,           // Generated reminder text
    renewalCycle: String,              // Renewal cycle at time of sending
    customMessage: String              // Any custom message added
  },
  userInteraction: {
    wasOpened: Boolean,                // Email was opened
    wasClicked: Boolean,               // Links were clicked
    wasActedUpon: Boolean,             // User took action
    actionTakenAt: Date,               // When action was taken
    actionType: String                 // 'renewed', 'cancelled', 'postponed', 'ignored'
  }
}
```

#### Key Methods:
- `markAsDelivered()` - Mark reminder as delivered
- `markAsFailed(errorMessage)` - Mark reminder as failed
- `trackInteraction(type, actionType)` - Track user interactions
- `ReminderLog.wasReminderSent()` - Check if reminder already sent (prevent duplicates)
- `ReminderLog.getStats()` - Get reminder statistics

## Database Indexes

Optimized indexes have been added for efficient querying:

- Entry: `renewalInfo.endDate`, `renewalInfo.isActive + endDate`, `owner + renewalInfo.isActive + endDate`
- ReminderPreference: `userId` (unique), `categoryOverrides.categoryId`
- ReminderLog: Compound indexes for duplicate prevention and performance

## Migration Utilities

### Installation Commands

```bash
# Test the renewal models (creates test data)
npm run test:renewal

# Run migration analysis (dry run)
npm run migrate:renewal:dry

# Apply migration (live)
npm run migrate:renewal
```

### Migration Features

The migration utility (`src/utils/renewalMigration.js`) provides:

1. **Initialize Reminder Preferences** - Creates default preferences for all users
2. **Suggest Renewal Info** - Analyzes existing entries and suggests renewal tracking
3. **Category-Specific Defaults** - Sets up UK-specific reminder schedules
4. **Data Validation** - Checks for data integrity issues

#### UK-Specific Defaults

The system includes UK-focused renewal suggestions:

- **Insurance/Policies**: 60, 30, 14, 7 days notice (multiple reminders)
- **Utilities**: 60, 30, 7 days notice (early notice for contract changes)
- **Subscriptions**: 7, 1 days notice (short notice for monthly subscriptions)
- **Annual Providers**: British Gas, Sky, Direct Line, TV Licence, etc.

## Usage Examples

### Adding Renewal Info to an Entry

```javascript
const entry = await Entry.findById(entryId);
entry.renewalInfo = {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2025-01-01'),
  renewalCycle: 'annually',
  reminderDays: [60, 30, 7],
  isActive: true,
  autoRenewal: false,
  notes: 'Home insurance policy'
};
await entry.save();
```

### Setting User Preferences

```javascript
const prefs = await ReminderPreference.getOrCreateForUser(userId);

// Set global preferences
prefs.defaultReminderDays = [30, 14, 7];
prefs.emailSettings.digestFrequency = 'weekly';

// Set category override for insurance
await prefs.setCategoryOverride(insuranceCategoryId, {
  enabled: true,
  reminderDays: [60, 30, 14, 7],
  notificationMethods: { email: true }
});
```

### Finding Entries That Need Reminders

```javascript
// Find all entries needing 30-day reminders
const entries = await Entry.findEntriesNeedingReminders(30);

// Check if specific entry needs reminder
const needsReminder = entry.needsRenewalReminder(7);
```

### Logging Reminder Sent

```javascript
const reminderLog = new ReminderLog({
  entryId: entry._id,
  userId: user._id,
  reminderType: 'individual',
  daysAhead: 30,
  renewalDate: entry.renewalInfo.endDate,
  notificationMethod: 'email',
  status: 'sent',
  contentDetails: {
    templateUsed: 'standard-renewal-reminder',
    entryTitle: entry.title,
    entryProvider: entry.provider,
    reminderMessage: 'Your insurance policy expires in 30 days'
  }
});
await reminderLog.save();
```

## Testing

A comprehensive test suite is available:

```bash
npm run test:renewal
```

This creates test data, validates all model methods, and cleans up afterward.

## Next Steps

Phase 1 provides the foundation for the renewal reminder system. Future phases will implement:

- **Phase 2**: Background job processing for sending reminders
- **Phase 3**: Email templates and notification services
- **Phase 4**: User interface for managing renewal settings
- **Phase 5**: Advanced features (SMS, push notifications, calendar integration)

## File Structure

```
src/
├── models/
│   ├── entry.js              # Extended with renewalInfo
│   ├── reminderPreference.js  # New - User notification preferences
│   ├── reminderLog.js         # New - Reminder delivery tracking
│   └── index.js               # New - Central model exports
├── utils/
│   └── renewalMigration.js    # New - Migration and setup utilities
└── ...

scripts/
└── test-renewal-models.js     # New - Test suite for renewal system

docs/
└── RENEWAL_REMINDERS.md       # This documentation
```

## Database Compatibility

- **Backward Compatible**: Existing entries continue to work normally
- **Optional Fields**: `renewalInfo` is optional and doesn't affect existing functionality
- **Graceful Degradation**: System works with or without renewal data
- **UK Date Support**: All dates respect UK formatting (DD/MM/YYYY)

The renewal reminder system is now ready for Phase 2 implementation!