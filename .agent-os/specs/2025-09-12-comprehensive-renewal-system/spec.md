# Comprehensive UK Financial Product Renewal System

> Spec: Comprehensive Financial Product End Date Tracking
> Created: 2025-09-12
> Status: Planning

## Overview

Implement a comprehensive end date and renewal tracking system for ALL UK household financial products with terms, contracts, or expiry dates. This system goes beyond basic insurance renewals to cover the complete spectrum of UK financial commitments including finance agreements, contracts, government documents, warranties, and time-limited products.

## User Stories

### Universal Financial Product Tracking

As a UK household manager, I want to track end dates for ALL my financial commitments (car finance, mobile contracts, MOT, insurance, fixed-rate deals, etc.), so that I never miss important deadlines that could cost me money or leave me without essential services.

**Detailed Workflow:**
- User adds any financial product/commitment with an end date
- System automatically detects product type and suggests appropriate reminder schedule
- User sees different date field types based on product (end date, renewal date, review date, expiry date)
- System provides UK-specific terminology and guidance for each product type
- Automatic linking to related documents (contracts, certificates, etc.)

### Intelligent Product Categorization

As a user entering various financial commitments, I want the system to automatically understand what type of product I'm adding and configure appropriate reminders, so that my MOT gets different treatment than my mortgage review date.

**Detailed Workflow:**
- System recognizes 40+ UK financial product types across 7 categories
- Automatically sets category-specific reminder schedules (MOT: 30,14,7,1 days vs Mortgage: 120,90,60,30 days)
- Provides product-specific terminology (renewal vs expiry vs review vs end date)
- Shows relevant fields based on product type (reference numbers, notice periods, etc.)
- Suggests documentation requirements for each product type

### Flexible Reminder Management

As a UK household with diverse financial products, I want different reminder strategies for different product types, so that urgent items like MOT get frequent reminders while long-term commitments get early strategic warnings.

**Detailed Workflow:**
- Each product category has intelligent default reminder schedules
- User can override defaults for specific products or entire categories
- Different urgency levels: Critical (MOT, insurance), Important (contracts), Strategic (finance reviews)
- Notification content adapts to product type (action required vs review opportunity)
- Integration with document vault for quick access to contracts/certificates

## Spec Scope

1. **Comprehensive Product Database** - Support for 40+ UK financial product types with category-specific configurations
2. **Flexible End Date Types** - Hard end dates, auto-renewals, review dates, expiry dates, notice deadlines
3. **Intelligent Categorization** - Automatic product type detection with UK financial terminology
4. **Advanced Reminder Engine** - Category-specific reminder schedules with urgency-based logic
5. **Document Integration** - Link financial products to related documents (contracts, certificates, statements)
6. **UK-Specific Intelligence** - British financial calendar awareness, terminology, and product patterns
7. **Comprehensive Dashboard** - Timeline view of all upcoming dates with priority categorization

## Product Categories Covered

### Finance & Credit (6 types)
- Car Finance (PCP, HP, Leasing)
- Personal Loans  
- Mortgage Fixed Rates
- Credit Card Promotional Offers
- Buy Now Pay Later Terms
- Store Finance Deals

### Contracts & Services (6 types)
- Mobile/Phone Contracts
- Broadband/Internet Contracts
- Energy Fixed Rate Deals
- Tenancy Agreements
- Gym/Fitness Memberships
- TV/Streaming Contracts

### Insurance & Protection (7 types)
- Car Insurance
- Home/Contents Insurance
- Life Insurance Terms
- Income Protection
- Travel Insurance
- Pet Insurance
- Landlord Insurance

### Government & Official (6 types)
- TV Licence
- MOT Certificates
- Driving Licence
- Passport
- Vehicle Tax (VED)
- Professional Licences

### Savings & Investments (5 types)
- Fixed Rate Bonds
- ISA Annual Limits
- Savings Account Bonus Rates
- Investment Terms
- Premium Bonds Reviews

### Warranties & Service Plans (5 types)
- Appliance Extended Warranties
- Car Extended Warranties  
- Boiler Service Contracts
- Home Emergency Cover
- Breakdown Cover (AA, RAC)

### Professional & Memberships (5 types)
- Professional Body Memberships
- Trade Union Memberships
- Professional Qualifications/CPD
- Club Memberships
- Certification Renewals

## Out of Scope

- Automatic price comparison or switching services
- Calendar integration (Google/Outlook sync)
- SMS or push notifications (email only initially)
- Bulk import from financial institution APIs
- Advanced financial planning or advice features

## Expected Deliverable

1. **Universal Product Entry** - Users can add ANY UK financial product with appropriate end date tracking and terminology
2. **Intelligent Reminders** - Category-specific notification schedules that understand the urgency and nature of each product type
3. **Comprehensive Dashboard** - Timeline view showing all upcoming dates categorized by urgency (Critical/Important/Strategic)
4. **Document Integration** - Quick access to related contracts, certificates, and documents for each tracked product