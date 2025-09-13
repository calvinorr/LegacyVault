# Comprehensive Technical Specification

This is the technical specification for the comprehensive UK financial product renewal system detailed in @.agent-os/specs/2025-09-12-comprehensive-renewal-system/spec.md

## Enhanced Database Schema

### Extended Entry Model - Enhanced renewalInfo Structure

```javascript
// Enhanced renewalInfo object in accountDetails
renewalInfo: {
  // Core Date Information
  startDate: Date,           // When product/contract started
  endDate: Date,             // When product/contract ends
  reviewDate: Date,          // Optional review/rate change date
  noticeDate: Date,          // Deadline for giving notice
  
  // Product Classification
  productType: String,       // Specific product type (e.g., 'Car Finance PCP')
  productCategory: String,   // Major category (e.g., 'Finance')
  endDateType: String,       // 'hard_end', 'auto_renewal', 'review_date', 'expiry_date', 'notice_deadline'
  
  // Renewal Behavior
  renewalCycle: String,      // 'annual', 'monthly', 'quarterly', 'custom', 'one_time'
  isAutoRenewal: Boolean,    // Does it auto-renew unless cancelled?
  requiresAction: Boolean,   // Must user take action or automatic?
  noticePeriod: Number,      // Days notice required for changes/cancellation
  
  // Reminder Configuration
  reminderDays: [Number],    // Custom reminder schedule (overrides category defaults)
  urgencyLevel: String,      // 'critical', 'important', 'strategic'
  isActive: Boolean,         // Is tracking currently enabled?
  
  // UK-Specific Fields
  regulatoryType: String,    // 'fca_regulated', 'government_required', 'contractual', 'voluntary'
  complianceNotes: String,   // Special compliance requirements
  
  // Reference Information
  referenceNumbers: [{
    type: String,            // 'policy_number', 'agreement_number', 'licence_number'
    value: String,
    issuer: String
  }],
  
  // Document Links
  linkedDocuments: [ObjectId], // References to Document model
  
  // History Tracking
  renewalHistory: [{
    date: Date,
    action: String,          // 'renewed', 'switched', 'cancelled', 'expired'
    notes: String,
    costChange: Number       // Price difference from previous term
  }],
  
  // Last Processing
  lastReminderSent: Date,
  lastProcessedDate: Date,
  nextReminderDue: Date
}
```

### UK Financial Product Configuration

```javascript
// Complete UK product configuration
const UK_FINANCIAL_PRODUCTS = {
  'Finance': {
    'Car Finance PCP': {
      reminderDays: [120, 90, 60, 30, 14],
      urgencyLevel: 'important',
      endDateType: 'hard_end',
      requiresAction: true,
      regulatoryType: 'fca_regulated',
      averageTerm: '36 months',
      renewalNotes: 'Consider buying, returning, or new PCP deal'
    },
    'Car Finance HP': {
      reminderDays: [90, 60, 30, 14],
      urgencyLevel: 'important', 
      endDateType: 'hard_end',
      requiresAction: false,
      averageTerm: '48 months'
    },
    'Personal Loan': {
      reminderDays: [90, 60, 30],
      urgencyLevel: 'important',
      endDateType: 'hard_end',
      requiresAction: false,
      averageTerm: '5 years'
    },
    'Mortgage Fixed Rate': {
      reminderDays: [180, 120, 90, 60, 30],
      urgencyLevel: 'strategic',
      endDateType: 'review_date',
      requiresAction: true,
      regulatoryType: 'fca_regulated',
      renewalNotes: 'Review rates 6 months before end'
    }
  },
  
  'Contracts': {
    'Mobile Contract': {
      reminderDays: [90, 60, 30, 14],
      urgencyLevel: 'important',
      endDateType: 'hard_end',
      requiresAction: true,
      noticePeriod: 30,
      averageTerm: '24 months'
    },
    'Broadband Contract': {
      reminderDays: [90, 60, 30],
      urgencyLevel: 'important',
      endDateType: 'hard_end',
      requiresAction: true,
      noticePeriod: 30,
      averageTerm: '18 months'
    },
    'Energy Fixed Deal': {
      reminderDays: [60, 30, 14, 7],
      urgencyLevel: 'important',
      endDateType: 'review_date',
      requiresAction: true,
      regulatoryType: 'ofgem_regulated',
      renewalNotes: 'Switch before default tariff applies'
    },
    'Tenancy Agreement': {
      reminderDays: [60, 30, 14],
      urgencyLevel: 'critical',
      endDateType: 'hard_end',
      requiresAction: true,
      noticePeriod: 30,
      averageTerm: '12 months'
    }
  },
  
  'Insurance': {
    'Car Insurance': {
      reminderDays: [60, 30, 14, 7],
      urgencyLevel: 'critical',
      endDateType: 'auto_renewal',
      requiresAction: true,
      regulatoryType: 'fca_regulated',
      renewalNotes: 'Compare prices before auto-renewal'
    },
    'Home Insurance': {
      reminderDays: [60, 30, 14, 7],
      urgencyLevel: 'critical',
      endDateType: 'auto_renewal',
      requiresAction: true,
      regulatoryType: 'fca_regulated'
    },
    'Travel Insurance': {
      reminderDays: [30, 14, 7],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: false
    }
  },
  
  'Official': {
    'MOT Certificate': {
      reminderDays: [30, 14, 7, 3, 1],
      urgencyLevel: 'critical',
      endDateType: 'expiry_date',
      requiresAction: true,
      regulatoryType: 'government_required',
      renewalNotes: 'Legal requirement - book MOT test'
    },
    'TV Licence': {
      reminderDays: [30, 14, 7],
      urgencyLevel: 'critical',
      endDateType: 'expiry_date',
      requiresAction: true,
      regulatoryType: 'government_required',
      renewalNotes: 'Required for live TV/BBC iPlayer'
    },
    'Driving Licence': {
      reminderDays: [365, 180, 90, 30],
      urgencyLevel: 'critical',
      endDateType: 'expiry_date',
      requiresAction: true,
      regulatoryType: 'government_required',
      renewalNotes: 'Cannot drive with expired licence'
    },
    'Passport': {
      reminderDays: [365, 180, 90],
      urgencyLevel: 'important',
      endDateType: 'expiry_date',
      requiresAction: true,
      regulatoryType: 'government_required',
      renewalNotes: 'Some countries require 6+ months validity'
    },
    'Vehicle Tax VED': {
      reminderDays: [14, 7, 3, 1],
      urgencyLevel: 'critical',
      endDateType: 'expiry_date',
      requiresAction: true,
      regulatoryType: 'government_required'
    }
  },
  
  'Savings': {
    'Fixed Rate Bond': {
      reminderDays: [60, 30, 14, 7],
      urgencyLevel: 'strategic',
      endDateType: 'hard_end',
      requiresAction: true,
      regulatoryType: 'fca_regulated',
      renewalNotes: 'Compare rates before auto-renewal'
    },
    'ISA Annual Limit': {
      reminderDays: [90, 60, 30, 14],
      urgencyLevel: 'strategic',
      endDateType: 'review_date',
      requiresAction: false,
      renewalNotes: 'Use full allowance before April 5th'
    },
    'Savings Bonus Rate': {
      reminderDays: [30, 14, 7],
      urgencyLevel: 'strategic',
      endDateType: 'review_date',
      requiresAction: true,
      renewalNotes: 'Rate may drop significantly after bonus period'
    }
  },
  
  'Warranties': {
    'Appliance Extended Warranty': {
      reminderDays: [90, 60, 30],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: false,
      renewalNotes: 'Consider if still cost-effective'
    },
    'Car Extended Warranty': {
      reminderDays: [90, 60, 30, 14],
      urgencyLevel: 'important',
      endDateType: 'hard_end',
      requiresAction: true,
      renewalNotes: 'Compare with independent warranty providers'
    },
    'Boiler Service Plan': {
      reminderDays: [30, 14, 7],
      urgencyLevel: 'important',
      endDateType: 'auto_renewal',
      requiresAction: false
    }
  },
  
  'Professional': {
    'Professional Body Membership': {
      reminderDays: [60, 30, 14],
      urgencyLevel: 'important',
      endDateType: 'expiry_date',
      requiresAction: true,
      renewalNotes: 'Required for professional status'
    },
    'Professional Qualification CPD': {
      reminderDays: [90, 60, 30],
      urgencyLevel: 'important',
      endDateType: 'expiry_date',
      requiresAction: true,
      renewalNotes: 'Complete CPD hours before deadline'
    }
  }
};
```

### Enhanced ReminderPreference Model

```javascript
const ReminderPreferenceSchema = new Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  
  // Global Settings
  globalEnabled: { type: Boolean, default: true },
  defaultReminderTime: { type: String, default: '09:00' }, // 24-hour format
  timezone: { type: String, default: 'Europe/London' },
  
  // UK-Specific Preferences
  dateFormat: { type: String, default: 'DD/MM/YYYY', enum: ['DD/MM/YYYY', 'MM/DD/YYYY'] },
  excludeBankHolidays: { type: Boolean, default: true },
  quietHours: {
    enabled: { type: Boolean, default: false },
    start: { type: String, default: '22:00' },
    end: { type: String, default: '08:00' }
  },
  
  // Category-Specific Overrides
  categorySettings: {
    'Finance': {
      enabled: { type: Boolean, default: true },
      reminderDays: [Number],  // Override default for entire category
      urgencyBoost: { type: Boolean, default: false } // Add extra reminders
    },
    'Contracts': {
      enabled: { type: Boolean, default: true },
      reminderDays: [Number],
      urgencyBoost: { type: Boolean, default: false }
    },
    'Insurance': {
      enabled: { type: Boolean, default: true },
      reminderDays: [Number],
      urgencyBoost: { type: Boolean, default: true } // Insurance is critical
    },
    'Official': {
      enabled: { type: Boolean, default: true },
      reminderDays: [Number],
      urgencyBoost: { type: Boolean, default: true } // Government docs critical
    },
    'Savings': {
      enabled: { type: Boolean, default: true },
      reminderDays: [Number],
      urgencyBoost: { type: Boolean, default: false }
    },
    'Warranties': {
      enabled: { type: Boolean, default: true },
      reminderDays: [Number],
      urgencyBoost: { type: Boolean, default: false }
    },
    'Professional': {
      enabled: { type: Boolean, default: true },
      reminderDays: [Number],
      urgencyBoost: { type: Boolean, default: false }
    }
  },
  
  // Email Preferences
  emailSettings: {
    individualReminders: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
    monthlyDigest: { type: Boolean, default: true },
    urgentOnly: { type: Boolean, default: false }
  },
  
  // Notification Content Preferences
  contentSettings: {
    includeActionButtons: { type: Boolean, default: true },
    includeDocumentLinks: { type: Boolean, default: true },
    includeRenewalTips: { type: Boolean, default: true },
    includePriceComparisonTips: { type: Boolean, default: true }
  }
});
```

## External Dependencies

**Enhanced Email Service:**
- **AWS SES** with **Amazon Simple Notification Service (SNS)** for delivery tracking
- **Justification:** Professional delivery with bounce/complaint handling for 40+ product types

**Advanced Date Processing:**
- **date-fns-tz** for UK timezone handling
- **uk-bank-holidays** npm package for British bank holiday exclusions
- **Justification:** Accurate UK-specific date handling for government and financial deadlines

**Product Intelligence:**
- **Custom UK Financial Product Database** (JSON configuration)
- **Justification:** No existing library covers comprehensive UK household financial product patterns