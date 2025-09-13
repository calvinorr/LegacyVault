# UK Financial Terminology Guide

This is the UK-specific terminology specification for the spec detailed in @.agent-os/specs/2025-09-12-comprehensive-uk-renewal-system/spec.md

## End Date Terminology Framework

### Core Terminology Categories

#### 1. Renewal Terminology
**Usage**: When a contract or policy continues with the same or similar terms
- **"renews"** - Insurance policies, subscriptions, memberships
- **"auto-renews"** - Services that continue automatically unless cancelled
- **"renewal date"** - The specific date when renewal occurs
- **"renewal notice period"** - Time required to cancel before auto-renewal
- **"renewal premium"** - New cost after renewal (insurance/subscriptions)

**Examples:**
- "Your car insurance renews on 15th March"
- "This energy contract auto-renews every 12 months"
- "30 days' notice required before renewal date"

#### 2. Expiry Terminology
**Usage**: When something becomes invalid or ceases to be effective
- **"expires"** - Government documents, certificates, licences
- **"expiry date"** - Fixed date when validity ends
- **"expires and cannot be renewed"** - One-time services/warranties
- **"expired"** - Past the validity date

**Examples:**
- "Your MOT certificate expires on 20th June"
- "Passport expires in 6 months"
- "Extended warranty expires after 3 years"

#### 3. Contract End Terminology  
**Usage**: When a contractual agreement reaches its natural conclusion
- **"contract ends"** - Mobile phones, broadband, gym memberships
- **"agreement concludes"** - Formal contracts with defined terms
- **"minimum term expires"** - When early termination fees no longer apply
- **"contract-free from"** - Date when you can leave without penalty

**Examples:**
- "Your mobile contract ends on 12th August"  
- "Minimum 24-month term expires next year"
- "You'll be contract-free from April"

#### 4. Review & Rate Change Terminology
**Usage**: When terms, rates, or conditions may change
- **"rate review"** - Mortgage deals, savings accounts
- **"deal ends"** - Promotional rates or special offers
- **"reverts to standard rate"** - When promotional rates finish
- **"rate guarantee expires"** - When fixed rates become variable

**Examples:**
- "Your fixed mortgage rate review is due in March"
- "This savings deal ends after 12 months"
- "Rate reverts to standard variable rate"

#### 5. Completion Terminology
**Usage**: When a financial commitment is fully satisfied
- **"final payment due"** - Last payment on loans/finance
- **"loan completes"** - When debt is fully paid
- **"agreement concludes"** - End of payment schedule
- **"ownership transfers"** - When hire purchase completes

**Examples:**
- "Car finance final payment due in October"
- "Personal loan completes next month"
- "Ownership transfers after final HP payment"

## Product-Specific Terminology

### Vehicle & Transport

#### MOT Certificates
- **Terminology**: "expires" (never "renews" - each is a new test)
- **Context**: Legal requirement for roadworthiness
- **Action Language**: "book MOT test", "MOT due", "test required"
- **Timing**: "expires on [date]", "due by [date]"
- **Compliance**: "invalid without MOT", "unroadworthy"

#### Vehicle Tax (VED)
- **Terminology**: "expires", "tax disc expires" (historic reference)
- **Context**: Legal requirement, continuous liability
- **Action Language**: "renew vehicle tax", "SORN if not using"
- **Timing**: "tax expires on last day of month"
- **Compliance**: "untaxed vehicle penalties apply"

#### Vehicle Insurance
- **Terminology**: "renews", "policy anniversary"
- **Context**: Legal requirement, often auto-renews
- **Action Language**: "compare quotes", "update details"
- **Timing**: "renews automatically unless cancelled"
- **Compliance**: "driving without insurance is illegal"

#### Driving Licence
- **Terminology**: "expires", "licence renewal due"
- **Context**: Legal requirement to drive
- **Action Language**: "renew licence", "update photo"
- **Age-Specific**: "3-year renewal after age 70"

### Property & Housing

#### Mortgages
- **Fixed Rate Deals**: "rate review", "deal expires", "fix ends"
- **Tracker Deals**: "rate may change", "follows base rate"
- **Context**: Major financial commitment
- **Action Language**: "compare rates", "remortgage", "product transfer"
- **Timing**: "current deal ends", "reverting to SVR"

#### Property Insurance
- **Buildings Insurance**: "policy renews", often "required by mortgage"
- **Contents Insurance**: "cover renews", "policy anniversary"
- **Landlord Insurance**: "cover renews", "property portfolio"
- **Action Language**: "review cover levels", "update property value"

#### Tenancy Agreements
- **AST (Assured Shorthold)**: "tenancy ends", "fixed term expires"
- **Context**: Housing security, notice periods apply
- **Action Language**: "give notice", "negotiate renewal"
- **Timing**: "minimum 6-month term", "periodic after fixed term"

### Finance & Credit

#### Personal Loans
- **Terminology**: "final payment", "loan completes"
- **Context**: Fixed term credit agreement
- **Action Language**: "make final payment", "loan paid off"
- **Celebration**: "congratulations, loan completed!"

#### Credit Cards
- **Promotional Rates**: "0% period ends", "promotional rate expires"
- **Balance Transfers**: "offer expires", "reverts to standard rate"
- **Action Language**: "transfer balance", "pay before rate increases"

#### Car Finance
- **PCP**: "agreement ends", "final balloon payment due", "return/purchase decision"
- **HP**: "final payment", "ownership transfers"
- **Leasing**: "lease ends", "return vehicle"
- **Context**: Options available at end of agreement

### Utilities & Communications

#### Energy Suppliers
- **Fixed Tariffs**: "fixed rate ends", "tariff expires"
- **Variable Rates**: "rates may change", "no fixed term"
- **Context**: Essential service, comparison encouraged
- **Action Language**: "switch supplier", "compare tariffs"
- **Default**: "moves to standard variable rate"

#### Communications
- **Mobile Contracts**: "contract ends", "upgrade available"
- **Broadband**: "contract expires", "out of minimum term"
- **Context**: Often has early termination fees
- **Action Language**: "upgrade", "switch provider", "negotiate new deal"

### Government & Compliance

#### TV Licence
- **Terminology**: "licence expires", "TV licence due"
- **Context**: Legal requirement for live TV/BBC iPlayer
- **Action Language**: "renew TV licence", "risk prosecution"
- **Compliance**: "required by law"

#### Passport
- **Terminology**: "expires", "passport renewal due"
- **Context**: International travel document
- **Action Language**: "renew passport", "allow extra time"
- **Travel Impact**: "many countries require 6+ months validity"

### Health & Insurance

#### Private Medical Insurance
- **Terminology**: "policy renews", "cover continues"
- **Context**: Healthcare provision
- **Action Language**: "review cover", "compare providers"
- **Changes**: "network changes", "excess adjustments"

#### Life Insurance
- **Terminology**: "policy renews", "premium review"
- **Context**: Financial protection
- **Action Language**: "review cover amount", "update beneficiaries"

## UI/UX Terminology Guidelines

### Form Field Labels
```yaml
End Date Types:
  renewal: "Renewal Date"
  expiry: "Expiry Date"  
  contract_end: "Contract End Date"
  review: "Review Date"
  completion: "Final Payment Date"

Helper Text Examples:
  MOT: "Annual roadworthiness test - book up to 1 month early"
  Insurance: "Policy automatically renews unless cancelled"
  Mobile: "End of minimum contract term - upgrade or switch options available"
  Mortgage: "Fixed rate period ends - will revert to standard variable rate"
```

### Notification Message Templates
```yaml
Early Warning (60+ days):
  format: "Your {product_type} {end_type} in {days} days on {date}"
  example: "Your car insurance renews in 92 days on 15th March"

Action Required (14-30 days):
  format: "Action needed: {product_type} {end_type} on {date}"
  example: "Action needed: MOT certificate expires on 20th June"

Urgent (1-7 days):
  format: "Urgent: {product_type} {end_type} {timing}"
  example: "Urgent: TV licence expires tomorrow"

Critical (Same day):
  format: "Today: {product_type} {end_type} today"
  example: "Today: Vehicle tax expires today"
```

### Category-Specific Action Buttons
```yaml
Insurance: "Compare Quotes", "Renew Policy", "Update Details"
Government: "Renew Online", "Book Appointment", "Check Requirements"
Contracts: "Compare Deals", "Negotiate Renewal", "Switch Provider"
Finance: "Make Payment", "Check Balance", "Review Terms"
Property: "Contact Landlord", "Search Alternatives", "Schedule Inspection"
```

## Accessibility & Clarity Guidelines

### Plain English Principles
- Use "renew" not "novation" for contracts
- Use "expires" not "terminates" for licences
- Use "final payment" not "settlement" for loans
- Use "deal ends" not "promotional period concludes"

### Avoid Financial Jargon
- "Rate review" not "product maturity"
- "Standard rate" not "variable rate margin"
- "Contract-free" not "post-minimum term flexibility"
- "Cover amount" not "sum assured"

### UK Cultural Context
- Reference UK-specific concepts (MOT, AST, VED)
- Use familiar brand names (Sky, British Gas, AA/RAC)
- Reference UK regulatory bodies (DVLA, Ofgem, FCA)
- Include UK-specific timing (tax year, academic year)

### Tone & Voice
- **Helpful**: "We'll remind you to compare quotes"
- **Non-patronising**: "Time to review your options"
- **Action-oriented**: "Book your MOT test today"
- **Reassuring**: "We'll keep track of all your important dates"

This comprehensive terminology guide ensures the renewal system uses appropriate, clear, and culturally relevant language for all UK household financial products.