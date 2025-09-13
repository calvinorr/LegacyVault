# Category-Specific Reminder Logic Specification

This is the intelligent reminder system specification for the spec detailed in @.agent-os/specs/2025-09-12-comprehensive-uk-renewal-system/spec.md

## Reminder Logic Framework

### Multi-Tier Reminder System

Each product category has its own reminder schedule based on:
- **Strategic Importance** (financial impact of missing renewal)
- **Regulatory Requirements** (legal consequences of non-compliance)  
- **Market Norms** (typical UK consumer behaviour patterns)
- **Action Lead Time** (time needed to research alternatives/make decisions)

## Category-Specific Reminder Schedules

### 1. Finance Products

#### Mortgages & Property Finance
```yaml
Fixed-rate mortgage deals:
  reminders: [180, 90, 60, 30, 14, 7] # 6 months to 1 week
  escalation: "high" # Financial impact is significant
  terminology: "rate review period ends"
  actions: ["Compare rates", "Contact broker", "Speak to current lender"]
  regulatory_notes: "No penalty for early action"

Remortgage deals:
  reminders: [120, 60, 30, 14] # 4 months to 2 weeks  
  escalation: "high"
  terminology: "deal expires"
  actions: ["Compare products", "Check credit score", "Gather documents"]
```

#### Car Finance & Vehicle Loans
```yaml
PCP agreements:
  reminders: [90, 60, 30, 14] # 3 months to 2 weeks
  escalation: "medium"
  terminology: "agreement ends"
  actions: ["Decide: return, purchase, or new deal", "Book inspection", "Research options"]
  final_payment_option: true

HP agreements:
  reminders: [60, 30, 14, 7] # 2 months to 1 week
  escalation: "medium" 
  terminology: "final payment due"
  actions: ["Prepare final payment", "Arrange ownership transfer"]
  completion_celebration: true
```

#### Personal Loans
```yaml
Personal loans:
  reminders: [30, 14, 7, 1] # 1 month to 1 day
  escalation: "low"
  terminology: "loan completes"
  actions: ["Prepare final payment", "Check for early settlement savings"]
  completion_celebration: true
```

### 2. Insurance Products

#### Vehicle Insurance
```yaml
Car insurance:
  reminders: [60, 30, 14, 7, 1] # 2 months to 1 day
  escalation: "high" # Legal requirement
  terminology: "policy renews"
  actions: ["Compare quotes", "Update details", "Check no claims discount"]
  regulatory_notes: "Driving without insurance is illegal"
  auto_renewal_warning: true

Motorcycle insurance:
  reminders: [60, 30, 14, 7, 1]
  escalation: "high"
  terminology: "policy renews" 
  actions: ["Compare quotes", "Check winter storage discounts"]
  seasonal_considerations: "Consider winter lay-up"
```

#### Property Insurance
```yaml
Buildings insurance:
  reminders: [60, 30, 14, 7] # 2 months to 1 week
  escalation: "high" # Mortgage requirement
  terminology: "policy renews"
  actions: ["Review cover amount", "Check rebuild costs", "Compare providers"]
  mortgage_requirement_note: true

Contents insurance:
  reminders: [45, 14, 7] # 6 weeks to 1 week
  escalation: "medium"
  terminology: "policy renews"
  actions: ["Update valuations", "Review cover levels", "Compare quotes"]
```

#### Life & Health Insurance
```yaml
Life insurance:
  reminders: [90, 30, 14] # 3 months to 2 weeks
  escalation: "medium"
  terminology: "policy renews"
  actions: ["Review cover amount", "Check beneficiaries", "Compare rates"]
  
Private medical insurance:
  reminders: [90, 60, 30, 14] # 3 months to 2 weeks
  escalation: "medium"
  terminology: "policy renews"
  actions: ["Review cover options", "Check network changes", "Consider excess levels"]
```

### 3. Government & Regulatory Obligations

#### Vehicle Licensing
```yaml
MOT certificate:
  reminders: [30, 14, 7, 3] # 1 month to 3 days
  escalation: "critical" # Legal requirement
  terminology: "MOT expires"
  actions: ["Book MOT test", "Check for recalls", "Pre-test inspection recommended"]
  regulatory_notes: "Driving without valid MOT is illegal and invalidates insurance"
  early_booking: "Can book up to 1 month early"

Vehicle tax (VED):
  reminders: [14, 7, 3, 1] # 2 weeks to 1 day
  escalation: "critical"
  terminology: "tax expires"  
  actions: ["Renew online", "Check for discounts", "Prepare V5C document"]
  regulatory_notes: "DVLA automatic number plate recognition enforces this"
  continuous_liability: true
```

#### Personal Documentation  
```yaml
Driving licence:
  reminders: [90, 60, 30, 14] # 3 months to 2 weeks
  escalation: "critical"
  terminology: "licence expires"
  actions: ["Prepare renewal documents", "Book appointment if needed", "Check photo requirements"]
  age_specific_rules: "Over 70s renew every 3 years"

Passport renewal:
  reminders: [180, 120, 90, 60] # 6 months to 2 months
  escalation: "high"
  terminology: "passport expires"
  actions: ["Check renewal requirements", "Book appointment", "Prepare documents and photos"]
  travel_impact_warning: "Many countries require 6+ months validity"
```

#### Broadcasting
```yaml
TV Licence:
  reminders: [60, 30, 14, 7, 1] # 2 months to 1 day
  escalation: "critical" # Legal requirement
  terminology: "licence expires"
  actions: ["Renew online", "Check for discounts", "Update address if moved"]
  regulatory_notes: "Required for live TV or BBC iPlayer"
  enforcement_warning: true
```

### 4. Utilities & Energy Contracts

#### Energy Suppliers
```yaml
Fixed-rate energy deals:
  reminders: [60, 30, 14, 7] # 2 months to 1 week
  escalation: "medium"
  terminology: "fixed rate ends"
  actions: ["Compare tariffs", "Check exit fees", "Review usage patterns"]
  market_volatility_warning: "Energy prices change frequently"
  automatic_rollover: "Will move to standard variable tariff"

Dual fuel contracts:
  reminders: [60, 30, 14, 7]
  escalation: "medium"
  terminology: "contract ends"
  actions: ["Compare dual fuel deals", "Consider separate suppliers", "Check for bundle discounts"]
```

### 5. Communications & Technology

#### Mobile & Internet
```yaml
Mobile phone contracts:
  reminders: [90, 60, 30, 14] # 3 months to 2 weeks
  escalation: "low"
  terminology: "contract ends"
  actions: ["Compare new deals", "Check upgrade eligibility", "Consider SIM-only options"]
  early_termination_fees: true
  network_coverage_review: "Good time to test other networks"

Broadband contracts:
  reminders: [60, 30, 14, 7] # 2 months to 1 week
  escalation: "medium"
  terminology: "contract ends" 
  actions: ["Speed test current service", "Compare providers", "Check for faster options"]
  installation_lead_time: "New provider may need 2+ weeks"
```

### 6. Property & Housing

#### Rental Agreements
```yaml
Assured Shorthold Tenancy:
  reminders: [90, 60, 30, 14] # 3 months to 2 weeks
  escalation: "high"
  terminology: "tenancy ends"
  actions: ["Discuss renewal with landlord", "Research alternative properties", "Prepare for inspection"]
  deposit_return_process: true
  notice_period_requirements: true

Commercial property leases:
  reminders: [365, 180, 90, 30] # 12 months to 1 month
  escalation: "critical" # Business continuity
  terminology: "lease expires"
  actions: ["Negotiate renewal terms", "Consider relocation", "Review break clauses"]
```

### 7. Health & Fitness

#### Gym & Fitness
```yaml
Gym memberships:
  reminders: [30, 14, 7] # 1 month to 1 week
  escalation: "low"
  terminology: "membership expires"
  actions: ["Review usage patterns", "Compare alternatives", "Check for promotional rates"]
  automatic_renewal_common: true
  cooling_off_rights: "14 days after renewal"
```

### 8. Financial Services & Savings

#### Savings Products
```yaml
Fixed-rate bonds:
  reminders: [90, 60, 30, 14] # 3 months to 2 weeks
  escalation: "medium"
  terminology: "bond matures"
  actions: ["Compare new rates", "Consider notice accounts", "Review investment options"]
  reinvestment_deadlines: "Usually 14-day window for new terms"

ISA transfers:
  reminders: [60, 30, 14] # 2 months to 2 weeks (before tax year end)
  escalation: "medium"
  terminology: "tax year ends"
  actions: ["Maximise ISA allowance", "Consider transfers", "Review investment performance"]
  annual_deadline: "5th April each year"
```

## Escalation & Urgency Framework

### Critical Priority
- **Government/Legal Requirements**: MOT, Vehicle Tax, TV Licence, Driving Licence
- **Regulatory Compliance**: Building regulations, professional licences
- **Insurance (Legal Requirements)**: Car insurance, employer liability

### High Priority  
- **Major Financial Impact**: Mortgage rates, property insurance (if required by mortgage)
- **Service Continuity**: Home insurance, broadband (if working from home)
- **Legal Consequences**: Tenancy agreements with notice requirements

### Medium Priority
- **Significant Financial Impact**: Energy contracts, mobile contracts
- **Important Services**: Health insurance, gym memberships with cancellation fees
- **Investment Opportunities**: Savings products, investment ISAs

### Low Priority
- **Convenience Services**: Entertainment subscriptions, magazine subscriptions
- **Optional Products**: Extended warranties, non-essential memberships
- **Flexible Services**: Services with easy cancellation/restart

## Smart Default Reminder Patterns

### Pattern A: Strategic Planning (Long-term financial products)
```
180 days → Initial awareness
90 days → Research phase begins  
60 days → Decision planning
30 days → Action required
14 days → Urgent action
7 days → Final notice
```

### Pattern B: Standard Renewal (Most insurance and contracts)
```
60 days → Early bird shopping
30 days → Compare options
14 days → Make decision
7 days → Confirm arrangements
1 day → Final reminder
```

### Pattern C: Compliance Critical (Government/regulatory)
```
30 days → First notice
14 days → Action required
7 days → Urgent notice
3 days → Critical notice
1 day → Final warning
```

### Pattern D: Simple Completion (Loans finishing, warranties expiring)
```
30 days → Completion notice
14 days → Prepare final arrangements
7 days → Final preparations
1 day → Due today
```

## Intelligent Reminder Customization

### Auto-Adjustment Factors
- **User Behaviour**: If user consistently acts at 7 days, reduce earlier reminders
- **Product Type**: Premium products get longer notice periods
- **Seasonal Factors**: Holiday periods get earlier reminders
- **Market Volatility**: Energy/finance products get longer lead times in volatile markets

### Context-Aware Messaging
- **First-time Users**: Include more educational content and action guidance
- **Repeat Customers**: Focus on changes from last time and quick action options
- **Premium Products**: Emphasise service continuation and loyalty benefits
- **Compliance Products**: Stress legal requirements and consequences

This comprehensive reminder logic ensures users receive appropriate, timely, and contextual notifications for their diverse UK household financial obligations.