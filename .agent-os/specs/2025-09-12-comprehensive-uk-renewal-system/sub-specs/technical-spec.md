# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-12-comprehensive-uk-renewal-system/spec.md

## Technical Requirements

### Database Schema Extensions

**Category Model Enhancement:**
```javascript
// Extend existing Category model with renewal configuration
renewalSettings: {
  defaultEndDateType: {
    type: String,
    enum: ['renewal', 'expiry', 'contract_end', 'review', 'completion'],
    default: 'renewal'
  },
  defaultReminderDays: [Number], // e.g., [60, 30, 14, 7, 1]
  escalationLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  ukSpecificRules: {
    regulatoryCompliance: Boolean,
    earlyRenewalAllowed: Boolean,
    maxAdvanceDays: Number,
    weekendRestrictions: Boolean,
    autoRenewalCommon: Boolean
  },
  formConfiguration: {
    endDateLabel: String, // "Renewal Date", "Expiry Date", etc.
    helperText: String,
    requiredFields: [String],
    conditionalFields: [String]
  }
}
```

**Entry Model Renewal Info Enhancement:**
```javascript
// Extend existing renewalInfo with new end date type system
renewalInfo: {
  endDateType: {
    type: String,
    enum: ['renewal', 'expiry', 'contract_end', 'review', 'completion'],
    required: true
  },
  primaryEndDate: Date, // Main date (renewal/expiry/review)
  secondaryDates: [{
    type: String, // 'cancellation_deadline', 'early_renewal_available'
    date: Date,
    description: String
  }],
  autoRenewalEnabled: Boolean,
  customReminderDays: [Number], // Override category defaults
  productSpecificData: {
    // MOT specific
    testCentreBooked: Boolean,
    vehicleRegistration: String,
    
    // Insurance specific  
    policyNumber: String,
    noClaimsDiscount: Number,
    
    // Finance specific
    finalPaymentAmount: Number,
    earlySettlementQuote: Number,
    
    // Contract specific
    cancellationNoticeRequired: Number, // days
    earlyTerminationFee: Number
  },
  
  // Enhanced tracking
  complianceLevel: {
    type: String,
    enum: ['optional', 'recommended', 'required', 'legal_requirement']
  },
  marketVolatilityFlag: Boolean, // For energy/finance products
  seasonalConsiderations: String // e.g., "Winter lay-up available"
}
```

### UK Product Category Seeding

**Comprehensive Category Population:**
```javascript
// Categories with full renewal configuration
const ukProductCategories = [
  {
    name: "Vehicle Insurance",
    parentCategory: "Insurance", 
    renewalSettings: {
      defaultEndDateType: 'renewal',
      defaultReminderDays: [60, 30, 14, 7, 1],
      escalationLevel: 'critical', // Legal requirement
      ukSpecificRules: {
        regulatoryCompliance: true,
        autoRenewalCommon: true,
        earlyRenewalAllowed: false
      },
      formConfiguration: {
        endDateLabel: "Policy Renewal Date",
        helperText: "Your policy will automatically renew unless cancelled",
        requiredFields: ['vehicleRegistration', 'policyNumber'],
        conditionalFields: ['noClaimsDiscount']
      }
    }
  },
  
  {
    name: "MOT Certificate",
    parentCategory: "Vehicle Compliance",
    renewalSettings: {
      defaultEndDateType: 'expiry',
      defaultReminderDays: [30, 14, 7, 3, 1],
      escalationLevel: 'critical',
      ukSpecificRules: {
        regulatoryCompliance: true,
        earlyRenewalAllowed: true,
        maxAdvanceDays: 30,
        weekendRestrictions: true
      },
      formConfiguration: {
        endDateLabel: "MOT Expiry Date",
        helperText: "Book MOT test up to 1 month before expiry",
        requiredFields: ['vehicleRegistration'],
        conditionalFields: ['preferredTestCentre']
      }
    }
  },
  
  {
    name: "Fixed Rate Mortgage",
    parentCategory: "Property Finance",
    renewalSettings: {
      defaultEndDateType: 'review',
      defaultReminderDays: [180, 90, 60, 30, 14, 7],
      escalationLevel: 'high',
      ukSpecificRules: {
        earlyRenewalAllowed: true,
        maxAdvanceDays: 180
      },
      formConfiguration: {
        endDateLabel: "Rate Review Date", 
        helperText: "Fixed rate ends - compare new deals up to 6 months early",
        requiredFields: ['currentRate', 'loanAmount'],
        conditionalFields: ['brokerContact', 'earlyExitFees']
      }
    }
  }
  // ... 100+ more categories
];
```

### Intelligent Reminder Engine

**Smart Reminder Assignment:**
```javascript
class ReminderEngine {
  static assignReminderSchedule(entry) {
    const category = entry.category;
    const endDateType = entry.renewalInfo.endDateType;
    
    // Get base schedule from category
    let reminderDays = category.renewalSettings.defaultReminderDays;
    
    // Apply end date type adjustments
    if (endDateType === 'expiry' && category.ukSpecificRules.regulatoryCompliance) {
      // Add extra early warning for compliance items
      reminderDays = [90, ...reminderDays];
    }
    
    // Market volatility adjustments
    if (entry.renewalInfo.marketVolatilityFlag) {
      // Earlier reminders for volatile markets (energy, finance)
      reminderDays = reminderDays.map(days => days + 14);
    }
    
    // User behaviour learning
    const userHistory = this.getUserReminderHistory(entry.userId);
    if (userHistory.averageActionDays < 14) {
      // User acts quickly - reduce early reminders
      reminderDays = reminderDays.filter(days => days <= 30);
    }
    
    return reminderDays;
  }
  
  static generateReminderContent(entry, daysUntilEnd) {
    const templates = {
      critical_compliance: {
        subject: "URGENT: {product} {action} in {days} days",
        body: "Your {product} {terminolgy} on {date}. {compliance_note} {action_required}"
      },
      strategic_planning: {
        subject: "{product} {terminology} in {days} days - time to compare options",
        body: "Your {product} {terminology} on {date}. Now's a good time to {recommended_actions}"
      },
      standard_renewal: {
        subject: "{product} {terminology} in {days} days",
        body: "Your {product} {terminology} on {date}. {auto_renewal_info} {action_options}"
      }
    };
    
    const template = templates[this.getMessageType(entry, daysUntilEnd)];
    return this.populateTemplate(template, entry, daysUntilEnd);
  }
}
```

### UK-Specific Business Logic

**Regulatory Compliance Engine:**
```javascript
class ComplianceEngine {
  static validateRenewalDate(entry) {
    const rules = entry.category.renewalSettings.ukSpecificRules;
    const endDate = entry.renewalInfo.primaryEndDate;
    
    // MOT-specific validation
    if (entry.category.name === 'MOT Certificate') {
      return this.validateMOTRenewal(endDate);
    }
    
    // Insurance-specific validation  
    if (entry.category.parentCategory === 'Insurance') {
      return this.validateInsuranceRenewal(entry);
    }
    
    return { valid: true };
  }
  
  static validateMOTRenewal(endDate) {
    const today = new Date();
    const daysDiff = this.calculateDays(today, endDate);
    
    if (daysDiff > 30) {
      return {
        valid: false,
        message: "MOT test can only be booked up to 1 month in advance"
      };
    }
    
    if (this.isWeekend(endDate) && daysDiff < 5) {
      return {
        valid: false,
        warning: "Most MOT stations closed weekends - consider booking weekday"
      };
    }
    
    return { valid: true };
  }
  
  static getComplianceImplications(entry) {
    const implications = {
      'MOT Certificate': "Driving without valid MOT invalidates insurance and incurs penalties",
      'Vehicle Tax': "ANPR cameras enforce vehicle tax - penalties apply immediately",
      'TV Licence': "Risk of prosecution and court fines up to £1,000",
      'Vehicle Insurance': "Driving without insurance: 6 points, unlimited fine, possible disqualification"
    };
    
    return implications[entry.category.name] || null;
  }
}
```

### Enhanced Background Processing

**Multi-Tier Reminder Processing:**
```javascript
// Enhanced background job with category-aware processing
class RenewalReminderJob {
  static async processRenewalReminders() {
    // Process by escalation level for prioritisation
    const escalationLevels = ['critical', 'high', 'medium', 'low'];
    
    for (const level of escalationLevels) {
      await this.processEscalationLevel(level);
    }
  }
  
  static async processEscalationLevel(escalationLevel) {
    const categories = await Category.find({
      'renewalSettings.escalationLevel': escalationLevel
    });
    
    for (const category of categories) {
      const entries = await Entry.findEntriesNeedingReminders(category._id);
      await this.processCategoryReminders(category, entries);
    }
  }
  
  static async processCategoryReminders(category, entries) {
    const batchSize = category.renewalSettings.escalationLevel === 'critical' ? 10 : 50;
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      await this.processBatch(batch);
      
      // Rate limiting for non-critical items
      if (category.renewalSettings.escalationLevel !== 'critical') {
        await this.sleep(1000); // 1 second between batches
      }
    }
  }
}
```

### Frontend Dynamic Forms

**Category-Driven Form Generation:**
```typescript
interface CategoryFormConfig {
  endDateLabel: string;
  helperText: string;
  showAutoRenewToggle: boolean;
  showCancellationNotice: boolean;
  requiredFields: string[];
  conditionalFields: string[];
  validationRules: ValidationRule[];
}

class DynamicRenewalForm {
  static generateFormConfig(category: Category): CategoryFormConfig {
    const config = category.renewalSettings.formConfiguration;
    
    return {
      endDateLabel: config.endDateLabel || 'End Date',
      helperText: config.helperText || '',
      showAutoRenewToggle: category.renewalSettings.autoRenewalCommon,
      showCancellationNotice: category.renewalSettings.defaultEndDateType === 'renewal',
      requiredFields: config.requiredFields || [],
      conditionalFields: config.conditionalFields || [],
      validationRules: this.generateValidationRules(category)
    };
  }
  
  static generateValidationRules(category: Category): ValidationRule[] {
    const rules: ValidationRule[] = [];
    const ukRules = category.renewalSettings.ukSpecificRules;
    
    if (ukRules.maxAdvanceDays) {
      rules.push({
        type: 'maxAdvanceDays',
        value: ukRules.maxAdvanceDays,
        message: `Can only be set up to ${ukRules.maxAdvanceDays} days in advance`
      });
    }
    
    if (ukRules.weekendRestrictions) {
      rules.push({
        type: 'weekendRestriction',
        message: 'Weekend dates not recommended for this service'
      });
    }
    
    return rules;
  }
}
```

## Performance Optimizations

### Database Indexing Strategy
```javascript
// Optimized indexes for UK product categories
const renewalIndexes = [
  // Primary reminder query optimization
  { 'category.renewalSettings.escalationLevel': 1, 'renewalInfo.primaryEndDate': 1 },
  
  // UK compliance tracking
  { 'category.renewalSettings.ukSpecificRules.regulatoryCompliance': 1, 'renewalInfo.primaryEndDate': 1 },
  
  // End date type grouping
  { 'renewalInfo.endDateType': 1, 'renewalInfo.primaryEndDate': 1 },
  
  // User-specific reminder queries
  { userId: 1, 'renewalInfo.endDateType': 1, 'renewalInfo.primaryEndDate': 1 }
];
```

### Caching Strategy
```javascript
// Cache frequently accessed UK category configurations
const CategoryConfigCache = {
  async getCategoryConfig(categoryId) {
    const cacheKey = `category_config:${categoryId}`;
    let config = await Redis.get(cacheKey);
    
    if (!config) {
      const category = await Category.findById(categoryId);
      config = category.renewalSettings;
      await Redis.setex(cacheKey, 3600, JSON.stringify(config)); // 1 hour cache
    }
    
    return JSON.parse(config);
  }
};
```

## External Dependencies

**Enhanced Email Templates:**
- **Handlebars.js** - Advanced template engine for UK-specific content
- **Justification:** Support for complex conditional logic needed for category-specific messaging

**UK Market Data:**
- **UK Bank Holidays API** - For reminder scheduling around public holidays
- **Justification:** Avoid sending reminders on days when services are unavailable

**Enhanced Date Processing:**
- **date-fns-tz** - Timezone-aware date functions for UK regions
- **Justification:** Handle BST/GMT transitions and regional variations

This comprehensive technical specification supports the full spectrum of UK household financial products with intelligent categorisation, appropriate reminder patterns, and sophisticated business logic tailored to UK regulatory and market requirements.