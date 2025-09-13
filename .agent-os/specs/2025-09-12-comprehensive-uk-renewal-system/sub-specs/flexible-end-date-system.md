# Flexible End Date System Specification

This is the flexible end date type system specification for the spec detailed in @.agent-os/specs/2025-09-12-comprehensive-uk-renewal-system/spec.md

## End Date Type Framework

### Core End Date Classifications

The system supports five distinct end date types, each with different behaviours, terminology, and reminder patterns:

#### 1. Renewal End Dates
**Definition**: Contracts/policies that continue with new terms
**Behaviour**: Automatic or manual renewal with updated terms
**Examples**: Insurance policies, subscriptions, memberships

```yaml
renewal:
  auto_renew_default: true
  allows_cancellation: true
  terms_may_change: true
  requires_action: false # unless cancelling
  terminology: "renews"
  typical_products: ["car_insurance", "gym_membership", "energy_contract"]
```

#### 2. Expiry End Dates  
**Definition**: Fixed validity periods that cannot be extended
**Behaviour**: Becomes invalid, requires new application/test
**Examples**: MOT certificates, driving licences, warranties

```yaml
expiry:
  auto_renew_default: false
  allows_extension: false
  requires_new_application: true
  requires_action: true
  terminology: "expires"
  typical_products: ["mot_certificate", "driving_licence", "passport"]
```

#### 3. Contract End Dates
**Definition**: Minimum terms that end, allowing flexibility
**Behaviour**: Options to continue, change, or cancel without penalty
**Examples**: Mobile contracts, broadband, gym memberships

```yaml
contract_end:
  auto_renew_default: varies # depends on provider
  allows_cancellation: true
  penalty_free_from: true
  requires_action: false # unless making changes
  terminology: "contract ends"
  typical_products: ["mobile_contract", "broadband", "lease_agreement"]
```

#### 4. Review End Dates
**Definition**: Periodic assessment points for rate/term changes
**Behaviour**: Opportunity to renegotiate, rates may change
**Examples**: Mortgage rate reviews, savings account rates

```yaml
review:
  auto_continue: true
  terms_may_change: true
  renegotiation_opportunity: true
  requires_action: false # unless changing
  terminology: "review due"
  typical_products: ["mortgage_rate", "savings_account", "business_contract"]
```

#### 5. Completion End Dates
**Definition**: Final payment/end of financial commitment
**Behaviour**: Agreement concludes, ownership may transfer
**Examples**: Car finance final payments, loan completions

```yaml
completion:
  auto_continue: false
  final_payment_required: true
  ownership_may_transfer: true
  requires_action: true
  terminology: "completes"
  typical_products: ["car_finance", "personal_loan", "hire_purchase"]
```

## Smart Default Settings by Product Category

### Insurance Products
```yaml
category: insurance
default_end_date_type: renewal
default_settings:
  auto_renew: true
  reminder_pattern: "standard_renewal" # 60,30,14,7,1 days
  cancellation_notice: 14 # days required
  comparison_shopping: true
  regulatory_compliance: varies_by_type

subcategory_overrides:
  car_insurance:
    reminder_pattern: "compliance_critical" # Legal requirement
    regulatory_notes: "Driving without insurance is illegal"
  
  pet_insurance:
    reminder_pattern: "standard_renewal"
    special_considerations: "Age limits may apply"
```

### Government & Regulatory
```yaml
category: government
default_end_date_type: expiry
default_settings:
  auto_renew: false
  reminder_pattern: "compliance_critical" # 30,14,7,3,1 days
  requires_action: true
  penalty_for_late: true
  online_renewal: true

subcategory_overrides:
  mot_certificate:
    early_renewal: "up_to_1_month"
    booking_required: true
    test_location_needed: true
    
  tv_licence:
    prosecution_risk: true
    payment_methods: ["direct_debit", "online", "phone", "post"]
```

### Finance Products
```yaml
category: finance
default_end_date_type: varies
default_settings:
  significant_financial_impact: true
  comparison_shopping_recommended: true
  early_action_beneficial: true

subcategory_overrides:
  mortgage_rates:
    end_date_type: review
    reminder_pattern: "strategic_planning" # 180,90,60,30,14,7 days
    broker_consultation: recommended
    
  personal_loans:
    end_date_type: completion
    reminder_pattern: "completion" # 30,14,7,1 days
    celebration_message: true
    overpayment_savings: check
```

### Utilities & Communications
```yaml
category: utilities
default_end_date_type: contract_end
default_settings:
  switching_encouraged: true
  price_comparison: true
  cooling_off_period: 14 # days after switching

subcategory_overrides:
  energy_contracts:
    end_date_type: review # Fixed rates end, variable continues
    market_volatility_warning: true
    
  mobile_contracts:
    upgrade_options: true
    early_termination_fees: check
```

### Property & Housing
```yaml
category: property  
default_end_date_type: varies
default_settings:
  notice_periods_apply: true
  significant_life_impact: true
  legal_implications: true

subcategory_overrides:
  tenancy_agreements:
    end_date_type: contract_end
    notice_period: varies # Usually 1-2 months
    deposit_return_process: true
    
  building_warranties:
    end_date_type: expiry
    no_renewal_possible: true
    maintenance_advice: provide
```

## Dynamic Form Behaviour

### Form Field Adaptation
When a user selects a product category, the form dynamically adapts:

```javascript
// Example form adaptation logic
const formAdaptation = {
  insurance: {
    endDateLabel: "Policy Renewal Date",
    showAutoRenewToggle: true,
    showCancellationNotice: true,
    helperText: "Your policy will automatically renew unless cancelled"
  },
  
  government: {
    endDateLabel: "Expiry Date", 
    showAutoRenewToggle: false,
    showBookingRequired: true,
    helperText: "Book renewal appointment before expiry date"
  },
  
  finance_completion: {
    endDateLabel: "Final Payment Date",
    showCelebrationOption: true,
    showEarlySettlement: true,
    helperText: "Final payment completes this agreement"
  }
}
```

### Contextual Help System
```yaml
help_system:
  insurance_renewal:
    tooltip: "Most insurance policies auto-renew with updated terms"
    detailed_help: "You can cancel up to 14 days after renewal if terms change"
    
  mot_expiry:
    tooltip: "Book MOT test up to 1 month before expiry"
    detailed_help: "Driving without valid MOT invalidates insurance"
    
  mortgage_review:
    tooltip: "Rate review gives opportunity to switch to new deal"
    detailed_help: "Compare rates 6 months before review date"
```

## Smart Reminder Scheduling

### Auto-Assignment Logic
```javascript
const assignReminderPattern = (productType, endDateType, userPreferences) => {
  const patterns = {
    compliance_critical: [30, 14, 7, 3, 1],
    strategic_planning: [180, 90, 60, 30, 14, 7],
    standard_renewal: [60, 30, 14, 7, 1],
    completion: [30, 14, 7, 1]
  };
  
  // Product-specific overrides
  if (productType === 'mot_certificate') return patterns.compliance_critical;
  if (productType === 'mortgage_rate') return patterns.strategic_planning;
  if (endDateType === 'renewal') return patterns.standard_renewal;
  if (endDateType === 'completion') return patterns.completion;
  
  // Fallback to user preferences or category defaults
  return userPreferences.defaultPattern || patterns.standard_renewal;
};
```

### Escalation Rules
```yaml
escalation_rules:
  critical_compliance:
    - "Final day: Send email + in-app notification"
    - "Show red warning on dashboard"
    - "Block other notifications to prioritise"
    
  high_financial_impact:
    - "Week before: Daily reminders"
    - "Day before: Multiple reminder attempts"
    - "After deadline: Follow-up action advice"
    
  standard:
    - "Follow normal reminder schedule"
    - "Mark as overdue after deadline"
    - "Suggest review of reminder settings"
```

## Validation & Business Rules

### Date Validation Rules
```yaml
validation_rules:
  mot_certificate:
    - min_advance_days: 0
    - max_advance_days: 30 # Can only book 1 month early
    - weekend_booking: false # Most MOT stations closed weekends
    
  insurance_policies:
    - min_advance_days: 1
    - cancellation_notice_days: 14
    - cooling_off_days: 14
    
  fixed_rate_mortgages:
    - review_advance_days: 180 # Can arrange new deal 6 months early
    - no_early_exit_penalty: 0 # Usually no penalty to arrange new rate
```

### Business Logic Integration
```javascript
const validateEndDate = (productType, endDateType, proposedDate) => {
  const rules = getValidationRules(productType);
  const today = new Date();
  const daysDiff = calculateDaysDifference(today, proposedDate);
  
  // Apply product-specific rules
  if (daysDiff < rules.min_advance_days) {
    return {
      valid: false,
      message: `Minimum ${rules.min_advance_days} days notice required`
    };
  }
  
  // Check for weekend restrictions
  if (rules.weekend_booking === false && isWeekend(proposedDate)) {
    return {
      valid: false, 
      message: "Weekend dates not available for this service"
    };
  }
  
  return { valid: true };
};
```

## Integration with Existing Category System

### Database Schema Extension
```javascript
// Extend existing category model
const CategorySchema = {
  // ... existing fields ...
  
  renewalSettings: {
    defaultEndDateType: {
      type: String,
      enum: ['renewal', 'expiry', 'contract_end', 'review', 'completion'],
      default: 'renewal'
    },
    defaultReminderPattern: [Number], // Days before end date
    autoRenewDefault: Boolean,
    requiresAction: Boolean,
    allowsEarlyRenewal: Boolean,
    hasRegulatoryImplications: Boolean,
    
    formConfiguration: {
      endDateLabel: String,
      helperText: String,
      showAutoRenewToggle: Boolean,
      showCancellationNotice: Boolean,
      showBookingRequired: Boolean,
      additionalFields: [String] // Custom fields for specific categories
    },
    
    validationRules: {
      minAdvanceDays: Number,
      maxAdvanceDays: Number,
      weekendBooking: Boolean,
      cancellationNoticeDays: Number
    }
  }
};
```

### Migration Strategy
```yaml
migration_approach:
  phase_1: "Add renewalSettings to Category model with defaults"
  phase_2: "Populate settings for major UK product categories"
  phase_3: "Update frontend forms to use dynamic configuration"
  phase_4: "Implement smart reminder assignment"
  phase_5: "Add validation rules and business logic"

backward_compatibility:
  - Existing entries continue to work with current renewal system
  - New fields are optional with sensible defaults
  - Gradual migration of existing data using category matching
```

This flexible end date system ensures the renewal reminder system can handle the diverse nature of UK household financial products while providing appropriate user experiences and reminder patterns for each type.