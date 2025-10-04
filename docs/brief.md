# Project Brief: LegacyLock

---

## Executive Summary

**LegacyLock** is a Northern Ireland-focused secure household information vault that helps families organize and manage critical financial, legal, and lifestyle information across all aspects of their lives—bank accounts, utilities, insurance policies, pensions, property records, vehicle documentation, and trusted service providers.

**Primary Problem:** Most households have one person who manages the majority of financial and administrative responsibilities, with critical information scattered across emails, bank statements, physical documents, provider websites, and memory. This fragmentation leads to missed renewal deadlines, forgotten policies, inefficient decision-making, and significant stress when information is urgently needed—whether for routine renewals, major life decisions, or family emergencies.

**Target Market:** Northern Ireland families seeking better household organization and information management. Initially designed for personal/family use with potential future expansion to extended family members and wider UK market.

**Key Value Proposition:** LegacyLock organizes household information by life domains (Property, Cars, Employment, Government) with renewal tracking, document linking, guided data collection workflows, and customizable views—enabling proactive household management, informed decision-making, timely renewals, and peace of mind for both daily life and unexpected emergencies.

---

## Problem Statement

### Current State and Pain Points

#### The Knowledge Holder Bottleneck

In most Northern Ireland households, one person becomes the de facto administrator for financial and household matters—managing bank accounts, utility contracts, insurance policies, pension schemes, vehicle documentation, domestic rates, and relationships with service providers. This concentration of knowledge creates multiple persistent problems:

**Daily Operational Challenges:**
- Critical information scattered across emails, bank statements, physical filing cabinets, provider websites, and memory
- Renewal deadlines missed or remembered at the last minute, leading to auto-renewals on unfavorable terms
- Difficulty making informed decisions without quick access to current contracts, rates, and provider details
- Time wasted searching for account numbers, policy details, or contact information when needed urgently
- No systematic way to track which services are connected to which accounts or properties

**Emergency Scenario Risks:**
- When the knowledge holder becomes ill, incapacitated, or dies, family members face overwhelming difficulty locating essential information
- Critical bills may go unpaid, insurance may lapse, and financial assets may be overlooked
- Executors and family members must piece together financial lives from fragments

**Data Collection Overwhelm:**
- Attempting to organize household information feels like an insurmountable task with no clear starting point
- No guidance on what information is critical vs. nice-to-have
- Existing tools (spreadsheets, note apps, password managers) require the user to invent their own organizational system
- Without visible progress or accomplishment feedback, organization efforts are frequently abandoned

### Impact of the Problem

**Quantifiable Costs:**
- NI households lose estimated £1,000+ annually through missed renewal opportunities and auto-renewals on expired promotional rates
- Executors report spending 100+ hours reconstructing financial information after a death
- Insurance claims denied due to inability to locate policy documents when needed

**Emotional Toll:**
- Constant low-level anxiety about "what if something happened to me tomorrow"
- Guilt about leaving loved ones unprepared
- Stress during already traumatic times when information urgently needed

### Why Existing Solutions Fall Short

**Password Managers (1Password, Bitwarden):** Store login credentials but don't organize household information by life context (Property, Cars, Employment). Don't track renewals, link documents, or provide guided workflows for comprehensive data collection.

**Note-Taking Apps (Notion, Evernote):** Flexible but require users to invent their own organizational structure. No Northern Ireland-specific templates, renewal tracking, or domain-specific schemas for different information types.

**Spreadsheets (Excel, Google Sheets):** Powerful but manual. No document linking, no guided onboarding, no visual interface, steep learning curve for non-technical family members.

**Physical Filing Systems:** Information still scattered, not accessible remotely, no renewal reminders, difficult to search.

### Urgency and Importance

This problem becomes critical during life transitions (death, illness, divorce, moving house) but causes daily friction through disorganization. The solution needs to provide **immediate daily value** (renewal tracking, quick information access) while building **long-term emergency preparedness** as a natural byproduct of good organization.

---

## Proposed Solution

### Core Concept and Approach

**LegacyLock** organizes household information using a **life domain architecture** rather than traditional financial categories. Instead of abstract concepts like "bills" or "categories," information is structured around the natural areas of daily life:

- **Property** - Mortgage, domestic rates, home insurance, utilities (electric, gas, broadband, phone), maintenance records
- **Vehicles** - Car finance, MOT, road tax, insurance, breakdown cover
- **Employment** - Payslips, pension schemes, P60s, employment contracts
- **Government** - PAYE records, National Insurance, benefits, driving licence, passport
- **Finance** - Bank accounts, savings accounts, ISAs, credit cards, loans
- **Insurance & Protection** - Life insurance, income protection, health insurance, warranties
- **Legal & Estate** - Wills, power of attorney, trusts, property deeds
- **Household Services** - Trusted tradespeople, service providers, local contacts

Each domain contains **records** (structured information with domain-specific fields) and **linked documents** (PDFs, images, contracts) stored together in context.

### Key Differentiators from Existing Solutions

**1. Domain-Specific Data Schemas**

Unlike generic note-taking apps or spreadsheets, LegacyLock understands that bank accounts, utilities, and tradespeople require fundamentally different information structures:
- Bank accounts need: account number, sort code, balance tracking
- Utilities need: renewal dates, contract terms, provider contact details
- Tradespeople need: services offered, contact info, quality ratings, job history

**2. Guided Onboarding Workflows**

Address the data collection overwhelm problem with:
- Prioritized checklists (critical information first for quick wins)
- Domain-by-domain guided entry (complete Property before moving to Vehicles)
- Motivational progress tracking showing accomplishments and remaining tasks
- Smart defaults and auto-population from bank statement imports

**3. Renewal Intelligence**

Proactive management of time-sensitive information:
- Visual highlighting of upcoming renewals across all domains
- Calendar/todo integration for renewal reminders
- Priority flagging (Critical/Important/Standard) for records
- "Renewal season" view showing all upcoming deadlines

**4. Emergency-Ready Views**

Multiple perspectives on the same data:
- **Daily View:** Quick access to frequently needed information
- **Renewal View:** Upcoming deadlines and actions needed
- **Emergency View:** "What someone needs to know RIGHT NOW" filtered information for executors/family members
- **Domain View:** All information about Property, Cars, etc. in one place

**5. Northern Ireland Financial Context**

Built-in understanding of NI-specific requirements:
- Domestic rates (not council tax)
- Integrated utilities (water included in rates)
- NI government services and documentation
- Local banking and financial products

### Why This Solution Will Succeed Where Others Haven't

**Structured Without Being Rigid:** Life domains provide intuitive organization while domain-specific schemas ensure the right fields are captured for each information type.

**Daily Value Drives Long-Term Preparedness:** Users adopt LegacyLock for immediate benefits (never miss renewals, find information quickly) and naturally build emergency preparedness as a byproduct.

**Guided Rather Than Blank Canvas:** Unlike Notion or spreadsheets, users don't face decision paralysis about how to structure information—the life domain architecture provides the framework.

**Personal Expertise Foundation:** Built by an accountant who manages household finances, addressing real-world pain points from lived experience rather than theoretical use cases.

### High-Level Vision for the Product

LegacyLock becomes the **single source of truth** for household information management in Northern Ireland families. It eliminates the anxiety of "where did I put that?" and "when does that renew?" while providing peace of mind that loved ones can access critical information when needed.

The application serves as both a **daily productivity tool** (find information fast, stay on top of renewals, make informed decisions) and a **family safety net** (emergency preparedness without requiring emergency motivation to use it).

---

## Target Users

### Primary User Segment: Household Administrator

**Demographic Profile:**
- Age: 35-65 years old
- Location: Northern Ireland
- Role: Primary household financial manager
- Professional Background: Often accountancy, business management, or similar detail-oriented profession
- Technical Comfort: Moderate to high (can use web applications, email, online banking)

**Current Behaviors and Workflows:**
- Manages 80-90% of household financial and administrative tasks
- Uses combination of: email folders, physical filing cabinets, spreadsheets, memory, password managers
- Regularly deals with: bank statements, renewal notices, insurance documents, utility bills, domestic rates
- Spends 2-5 hours monthly on administrative tasks (bill payments, document filing, renewals)
- Searches for information reactively when needed rather than having organized system

**Specific Needs and Pain Points:**
- **Scattered Information Anxiety:** "I know I have that document somewhere, but where?"
- **Renewal Deadline Stress:** Remembering dates in head or calendar, often discovering renewals too late to shop around
- **Family Preparedness Worry:** "If something happened to me, my spouse wouldn't know where anything is"
- **Decision-Making Friction:** Can't quickly compare current rates/policies when renewal time comes
- **Time Waste:** 20-30 minutes searching for account numbers, policy details, or documents when needed urgently
- **No Clear Organization System:** Various attempted solutions (spreadsheets, folders, notes) but no cohesive approach

**Goals They're Trying to Achieve:**
1. **Reduce Mental Load:** Stop keeping critical information "in their head"
2. **Proactive Management:** Know about renewals in advance, make informed decisions
3. **Quick Information Access:** Find any account number, policy detail, or document in under 60 seconds
4. **Family Protection:** Ensure loved ones can access critical information during emergencies
5. **Better Financial Outcomes:** Stop missing renewal opportunities and paying "loyalty tax" on auto-renewals
6. **Peace of Mind:** Eliminate the background anxiety about disorganization

**Success Criteria (What Success Looks Like for This User):**
- Can find any household information in under 1 minute
- Never misses a renewal deadline or discovers it "too late"
- Has visible progress on organizing household information (motivating continued use)
- Spouse/family member can navigate LegacyLock and find critical information independently
- Spends less time on household administration through better organization

---

### Secondary User Segment: Contributing Family Member

**Demographic Profile:**
- Age: 25-65 years old
- Relationship: Spouse, partner, or adult child living in household
- Location: Northern Ireland (same household or nearby)
- Technical Comfort: Moderate (uses smartphones, web apps, online banking)
- Role: Shares some household responsibilities, wants visibility and ability to contribute

**Current Behaviors and Workflows:**
- Manages some household tasks (may handle specific bills, insurance, or services)
- Has own relationships with some providers (mobile phone, car insurance, personal accounts)
- Wants to help organize household information but needs guidance on what to add
- May discover new documents/information the Primary User doesn't have yet
- Occasionally needs to find information when Primary User unavailable (not emergency, just convenience)

**Specific Needs and Pain Points:**
- **Unclear What to Add:** "I have this insurance renewal letter, where does it go?"
- **Don't Want to Mess Up:** Fear of adding information incorrectly or in wrong place
- **Need Visibility:** Want to see household information without always asking Primary User
- **Contribute Without Taking Over:** Want to help but not become primary administrator
- **Find Information Independently:** Should be able to locate account details, renewal dates without bothering Primary User

**Goals They're Trying to Achieve:**
1. **Contribute Effectively:** Add their own records and documents correctly
2. **Independent Access:** Find information when needed without asking Primary User
3. **Stay Informed:** Understand upcoming renewals, important deadlines
4. **Support Primary User:** Reduce burden on household administrator by sharing data entry
5. **Learn Gradually:** Build familiarity with household finances over time

**Success Criteria (What Success Looks Like for This User):**
- Can add a new record (utility bill, insurance renewal) to correct domain without help
- Finds information they need 90% of the time without asking Primary User
- Feels confident navigating the app and understanding where information lives
- Guided workflows make it clear where their information belongs
- Can update existing records (new renewal dates, changed providers) correctly

---

### Tertiary User Segment: Emergency Information Seeker

**Demographic Profile:**
- Age: 30-70 years old
- Relationship: Spouse, adult child, or executor of Primary User
- Location: Northern Ireland or elsewhere (may need remote access)
- Technical Comfort: Variable (low to high) - app must accommodate non-technical users
- Timing: Uses LegacyLock during crisis situations or when Primary User unavailable

**Current Behaviors and Workflows:**
- Normally doesn't manage household finances (relies on Primary User)
- During emergency: searches through emails, files, contacts Primary User's network
- Experiences high stress while trying to reconstruct information
- May need to contact banks, insurance companies, utility providers without having account details

**Specific Needs and Pain Points:**
- **Information Access During Crisis:** Needs critical details immediately during highly stressful time
- **Unfamiliarity with Systems:** Doesn't know which bank, which insurance company, which accounts exist
- **Time Sensitivity:** May have urgent deadlines (funeral arrangements, probate, bill payments)
- **Verification Challenges:** Proving authority to access accounts without proper documentation
- **Decision Paralysis:** Overwhelmed by scope of unknowns, doesn't know where to start

**Goals They're Trying to Achieve:**
1. **Find Critical Information Fast:** Bank accounts, insurance policies, key contacts
2. **Understand What Exists:** Complete picture of financial/administrative landscape
3. **Take Immediate Actions:** Pay urgent bills, notify relevant parties, secure accounts
4. **Navigate Without Training:** Use the app intuitively without prior experience or setup

**Success Criteria (What Success Looks Like for This User):**
- Can identify all bank accounts and access details within 5 minutes of opening LegacyLock
- Emergency view immediately surfaces most critical information
- Understands priority of actions (critical vs. can wait)
- Can locate specific documents (wills, insurance policies, property deeds) without searching entire system

---

## Goals & Success Metrics

### Business Objectives

- **Primary Adoption Goal:** Successfully migrate personal household information (100+ records across 8 domains) from scattered sources into LegacyLock within 3 months
- **Daily Usage Target:** Use LegacyLock as primary reference for household information, achieving <1 minute search time for any record within 6 months
- **Family Enablement:** Enable spouse/family member to independently find and update household information without assistance within 6 months
- **Renewal Management:** Achieve zero missed renewal deadlines and identify 3+ opportunities for better rates/terms annually
- **Architectural Cleanup:** Successfully refactor from legacy "bills/categories" structure to life domain architecture using BMAD methodology

### User Success Metrics

- **Information Retrieval Speed:** Average time to find any record drops from 5-20 minutes (current scattered system) to <60 seconds
- **Renewal Awareness:** 100% of upcoming renewals (30-90 days out) visible and tracked in dashboard
- **Data Completeness Progress:** Visible progress tracking shows percentage complete for each life domain (Property, Vehicles, Finance, etc.)
- **Family Member Confidence:** Contributing family member can successfully add new records to correct domain 90%+ of the time without assistance
- **Emergency Readiness:** Emergency information seeker can identify critical accounts and documents within 5 minutes during crisis scenario
- **Reduced Mental Load:** Qualitative assessment - reduced anxiety about "where is that information" and "what am I forgetting"

### Key Performance Indicators (KPIs)

- **Total Records Tracked:** Target 100+ household records organized across 8 life domains within first year
- **Documents Linked:** 50+ PDF documents (insurance policies, contracts, statements) linked to corresponding records
- **Active Domains:** At least 5 of 8 life domains populated with records (Property, Vehicles, Finance, Employment, Government minimum)
- **Search Success Rate:** 95%+ successful information retrieval without needing to consult external sources
- **Onboarding Workflow Completion:** 80%+ completion rate for guided domain workflows (indicates effective data collection)
- **System Usage Frequency:** Weekly active use for Primary User (information lookup, updates, renewals check)
- **Family Sharing Success:** At least 1 contributing family member adds/updates records monthly
- **Renewal Capture Rate:** 90%+ of known renewals tracked in system with reminder dates set

---

## MVP Scope

### Core Features (Must Have)

**1. Life Domain Navigation Architecture**
- **Description:** Restructure app from "bills/categories" to 8 life domains (Property, Vehicles, Employment, Government, Finance, Insurance & Protection, Legal & Estate, Household Services)
- **Rationale:** Core architectural breakthrough from brainstorming - solves terminology confusion and provides intuitive organization
- **Success Criteria:** Users can navigate to any domain and understand what belongs there without documentation
- **Effort Estimate:** High - requires data migration from current structure

**2. Domain-Specific Record Schemas**
- **Description:** Each domain has tailored fields (bank accounts ≠ utilities ≠ tradespeople). Property records capture mortgage/rates/utilities, Vehicle records capture finance/MOT/tax/insurance, etc.
- **Rationale:** Eliminates "one-size-fits-all" schema problem that caused on-the-fly modifications. Each record type knows what fields it needs.
- **Success Criteria:** Adding a new utility record presents renewal fields, adding a bank account presents sort code/account number
- **Effort Estimate:** High - requires schema redesign and data model changes

**3. Basic Record CRUD Operations**
- **Description:** Create, read, update, delete records within each domain. Simple forms with domain-appropriate fields.
- **Rationale:** Foundation for all data entry - must work reliably before adding advanced features
- **Success Criteria:** Can add/edit/delete records in any domain without errors
- **Effort Estimate:** Medium - partially exists, needs adaptation to new schema

**4. Document Linking & Storage**
- **Description:** Upload PDFs/images and link them to specific records (insurance policy PDF → car insurance record). View/download linked documents.
- **Rationale:** Critical for emergency scenarios (need to find actual policy documents, not just metadata)
- **Success Criteria:** Can upload document, link to record, retrieve document from record view
- **Effort Estimate:** Medium - existing functionality needs preservation during refactor

**5. Renewal Date Tracking**
- **Description:** Records with renewal dates display prominently. Calendar view of upcoming renewals (30/60/90 days). Visual indicators for approaching deadlines.
- **Rationale:** Primary daily value driver - prevents missed renewals and enables proactive decision-making
- **Success Criteria:** Dashboard shows all renewals in next 90 days, sorted by urgency
- **Effort Estimate:** Medium - some existing UK renewal system functionality to preserve/enhance

**6. Priority/Criticality Marking**
- **Description:** Mark records as Critical/Important/Standard. Emergency view filters to Critical items only.
- **Rationale:** Enables emergency information seeker to find vital information fast (banks, insurance, legal docs)
- **Success Criteria:** Can mark record priority, emergency view shows only Critical records
- **Effort Estimate:** Low - simple field addition with filtering

**7. Multi-User Access & Permissions**
- **Description:** Spouse/family members can log in, view household information, add/edit records. Basic permission model (all family members can view/edit).
- **Rationale:** Supports contributing family member persona - reduces burden on primary administrator
- **Success Criteria:** Second user can log in, navigate domains, add records successfully
- **Effort Estimate:** Medium - existing Google OAuth, needs family sharing model

**8. Northern Ireland Financial Context**
- **Description:** Templates and terminology reflect NI specifics (domestic rates not council tax, integrated water, NI government services)
- **Rationale:** Personal use case requires NI accuracy; demonstrates localization approach for future UK-wide expansion
- **Success Criteria:** All default templates use NI-appropriate terminology
- **Effort Estimate:** Low - configuration and content changes

### Out of Scope for MVP

**Features to Defer:**
- **Guided Onboarding Workflow** - Complex multi-step wizard with progress tracking (build after core architecture stable)
- **Bank Statement Import Enhancement** - Existing basic functionality sufficient; advanced parsing can wait
- **Calendar/Todo Integration** - Renewal dates tracked in-app first; external calendar sync is phase 2
- **Email Integration** - Smart extraction from email accounts (complex, low ROI for personal use)
- **Mobile App** - Web-responsive design sufficient for MVP; native mobile apps post-MVP
- **Advanced Search** - Basic filtering adequate; full-text search across records/documents deferred
- **Data Export/Reporting** - Nice-to-have but not critical for core use cases
- **Audit Trail/Version History** - Single household with trust; detailed change tracking unnecessary for MVP
- **UK-Wide Regional Variations** - Focus on Northern Ireland; England/Scotland/Wales support post-MVP

**Functionality to Remove:**
- **Docker Architecture** - Identified as legacy; remove during refactor
- **Unused Category Hierarchies** - Legacy structure being replaced by life domains
- **Abstract "Bills" Terminology** - Replace with "Records" throughout

### MVP Success Criteria

**Technical Milestones:**
- ✅ Data successfully migrated from old structure to life domain architecture
- ✅ All 8 life domains navigable with domain-specific schemas
- ✅ Zero data loss during migration
- ✅ Existing Google OAuth authentication preserved
- ✅ Document linking functionality maintained through refactor

**User Experience Milestones:**
- ✅ Primary user can add Property domain record (utility bill with renewal) in <2 minutes
- ✅ Contributing family member can navigate to Vehicles domain and add car insurance record without help
- ✅ Emergency information seeker can find all bank accounts within 5 minutes using Critical filter
- ✅ Renewal dashboard shows upcoming deadlines clearly
- ✅ No confusion about where information belongs (life domain organization intuitive)

**Adoption Milestones:**
- ✅ 50+ existing records migrated successfully
- ✅ At least 3 life domains actively used (Property, Vehicles, Finance minimum)
- ✅ Spouse successfully adds/updates records independently
- ✅ Zero missed renewals in first 3 months post-MVP

---

## Post-MVP Vision

### Phase 2: Enhanced Onboarding & Automation (Months 3-6)

**Guided Data Collection Workflows**
- **Domain-by-Domain Wizard:** Step-by-step guided entry starting with Property (highest value, most complex), then Vehicles, Finance, etc.
- **Progress Dashboard:** Visual completion percentage for each domain with motivational messaging ("You're 70% complete with Property!")
- **Smart Prioritization:** "Critical First" mode focuses on bank accounts, insurance policies, legal documents before moving to lower-priority records
- **Template Suggestions:** Pre-built templates for common NI scenarios (first-time homebuyer, retiree, young family)

**Enhanced Bank Import**
- **Multi-Bank Support:** Expand beyond HSBC to Ulster Bank, Danske Bank, Bank of Ireland, Santander
- **Intelligent Categorization:** ML-powered suggestion engine maps transactions to life domains automatically
- **Recurring Payment Detection:** Identify subscription services and utilities from transaction patterns
- **One-Click Record Creation:** "Create Record" button on imported transactions pre-populates domain-appropriate forms

**Renewal Intelligence Upgrades**
- **Price Comparison Integration:** Surface comparison sites (MoneySuperMarket, CompareNI) when renewal approaching
- **Historical Rate Tracking:** Show "You paid £450 last year, current quotes start at £380"
- **Auto-Renewal Alerts:** Proactive notifications 90/60/30 days before auto-renewal deadlines
- **Switching History:** Track provider changes and satisfaction to inform future decisions

### Phase 3: Family Collaboration & Emergency Preparedness (Months 6-12)

**Advanced Multi-User Features**
- **Granular Permissions:** Assign domain-specific access (spouse sees Finance, adult child sees only Estate planning)
- **Activity Feed:** "Sarah updated Car Insurance renewal date to June 2026"
- **Task Assignment:** "John, can you add the new broadband contract details to Property?"
- **Comment Threads:** Discussion on specific records ("Should we switch energy providers this year?")

**Emergency Readiness Tools**
- **Emergency Contact Designation:** Nominate executors/family members who get emergency access
- **Letter of Wishes Template:** Guide users through creating instructions for loved ones
- **Digital Estate Planning:** Integrate with existing will/solicitor, provide executor checklist
- **Quick Reference Export:** One-click PDF generation of critical information for solicitors/executors

**Decision Support Features**
- **Renewal Decision Assistant:** Compare current contract vs. market rates with recommendations
- **Household Financial Dashboard:** Net worth tracking across all accounts, pension projections
- **"What If" Scenarios:** Impact analysis (e.g., "If we switch energy providers, annual savings: £200")

### Phase 4: UK-Wide Expansion & Advanced Features (Year 2+)

**Geographic Expansion**
- **England/Scotland/Wales Support:** Regional variations (council tax vs. domestic rates, water billing differences)
- **Multi-Property Management:** Holiday homes, rental properties, family properties
- **International Accounts:** Support for expats managing UK accounts from abroad

**Advanced Automation**
- **Email Integration:** Scan inbox for renewal notices, auto-extract details, suggest record updates
- **API Integrations:** Direct connections to banks (Open Banking), insurance providers, government services
- **Smart Notifications:** "Your car MOT is due in 14 days. Garage X has availability next Tuesday."

**Ecosystem Integrations**
- **Calendar Sync:** Export renewals to Google Calendar, Outlook, Apple Calendar
- **Todo App Integration:** Create tasks in Todoist, Things, Microsoft To Do for renewal actions
- **Password Manager Links:** Deep links to 1Password/Bitwarden entries for quick login access
- **Accountant Sharing:** Export tax-relevant data to accountants/financial advisors

**Analytics & Insights**
- **Spending Analysis:** "Your utilities cost 15% more than similar NI households"
- **Contract Optimization:** "You could save £800/year by switching these 3 providers"
- **Renewal Timing Intelligence:** "Best time to renew car insurance is 21 days before expiry for optimal rates"

### Long-Term Vision (3-5 Years)

**LegacyLock becomes the comprehensive household operating system:**
- **Proactive Lifecycle Management:** AI predicts major household events (appliance replacement, mortgage remortgage timing, insurance needs changes) based on usage patterns
- **Trusted Advisor Network:** Vetted local solicitors, financial advisors, accountants integrated for seamless professional consultation
- **Generational Wealth Transfer:** Tools for passing household knowledge to next generation, gradual access expansion for adult children
- **Community Features:** Anonymized insights ("85% of NI households overpay on energy—here's how to fix it"), local provider ratings, shared tradesperson recommendations

**Revenue Model Evolution (Post-MVP):**
- **Freemium Tier:** Core life domain organization and basic renewal tracking (personal use case)
- **Premium Family Tier:** Advanced collaboration, unlimited document storage, priority support (£5-10/month)
- **Professional/Executor Tier:** Tools for solicitors, financial advisors, executors managing multiple households (£20-50/month)
- **Affiliate Revenue:** Ethically transparent referrals to comparison sites, financial services (user value first, never hidden fees)

---

## Technical Considerations

### Current Architecture Overview

**Technology Stack:**
- **Backend:** Node.js/Express API server (`src/`)
- **Frontend:** React/TypeScript SPA (`web/`)
- **Database:** MongoDB (local dev via Docker, Atlas for production)
- **Authentication:** Google OAuth 2.0 with Passport.js
- **Hosting:** Designed for managed services (Vercel, Render, Heroku)

**Current Design Patterns:**
- Express middleware pipeline with Passport session management
- MongoDB models with Mongoose ODM (`src/models/`)
- React hooks for auth state management (`web/src/hooks/`)
- Protected routes with custom `ProtectedRoute` component

**Existing Functionality to Preserve:**
- Google OAuth authentication flow with admin approval system
- Multi-user access (spouse/family member login and data sharing)
- PDF/document upload and linking to records
- Basic bank statement import (HSBC multi-line transaction support)
- UK financial renewal tracking system (40+ product types)
- Northern Ireland terminology and financial context

### Architecture Restructure: From "Bills/Categories" to "Life Domains"

**Current Problem (Identified via BMAD Five Whys):**
- Abstract "bills/categories" structure doesn't match user mental model
- Generic data schema requires on-the-fly modifications for different record types
- Terminology confusion ("bills" suggests budget management, not emergency vault)
- No clear information architecture - excitement-driven development without planning

**Proposed Solution (Life Domain Architecture):**
```
Life Domains (Top-Level Navigation)
├── Property
│   ├── Records: Mortgage, Domestic Rates, Home Insurance, Utilities
│   ├── Schema: Property-specific fields (address, renewal dates, provider contacts)
│   └── Documents: Linked PDFs (mortgage agreement, insurance policy, utility contracts)
│
├── Vehicles
│   ├── Records: Car Finance, MOT, Road Tax, Insurance, Breakdown Cover
│   ├── Schema: Vehicle-specific fields (registration, VIN, finance terms, renewal dates)
│   └── Documents: V5C, insurance certificate, MOT certificate
│
├── Employment
│   ├── Records: Payslips, Pension Schemes, P60s, Employment Contracts
│   ├── Schema: Employment-specific fields (employer, salary, pension provider)
│   └── Documents: Contract PDFs, payslips, P60s
│
├── Government
│   ├── Records: PAYE, National Insurance, Benefits, Driving Licence, Passport
│   ├── Schema: Government-specific fields (NI number, passport number, expiry dates)
│   └── Documents: Licence/passport scans, benefit letters
│
├── Finance
│   ├── Records: Bank Accounts, Savings Accounts, ISAs, Credit Cards, Loans
│   ├── Schema: Finance-specific fields (sort code, account number, balances, rates)
│   └── Documents: Statements, loan agreements
│
├── Insurance & Protection
│   ├── Records: Life Insurance, Income Protection, Health Insurance, Warranties
│   ├── Schema: Insurance-specific fields (policy number, coverage, premiums, renewal)
│   └── Documents: Policy documents, certificates
│
├── Legal & Estate
│   ├── Records: Wills, Power of Attorney, Trusts, Property Deeds
│   ├── Schema: Legal-specific fields (solicitor details, execution dates, trustee info)
│   └── Documents: Will PDFs, deed scans, legal agreements
│
└── Household Services
    ├── Records: Trusted Tradespeople, Service Providers, Local Contacts
    ├── Schema: Tradesperson-specific fields (services offered, contact, ratings, job history)
    └── Documents: Quotes, invoices, service records
```

**Key Architectural Principles:**
1. **Domain-Specific Schemas:** Each life domain has tailored data fields (bank accounts ≠ utilities ≠ tradespeople)
2. **Document Linking:** PDFs/images stored in context (car insurance record → renewal PDF linked)
3. **Renewal Intelligence:** Records with renewal dates surface prominently across all domains
4. **Emergency Filtering:** Priority/criticality marking enables "what's needed RIGHT NOW" views
5. **Northern Ireland Context:** Built-in NI-specific terminology, financial products, government services

### Data Migration Strategy

**Migration Approach (BMAD-Guided):**
1. **Audit Current Structure:** Document existing bills/categories/entries schema
2. **Create Domain Mapping:** Map existing records to appropriate life domains
3. **Design Domain Schemas:** Define field structures for each domain type
4. **Migration Scripts:** Automated transformation from old structure to domain-based
5. **Validation Phase:** Ensure zero data loss, verify all relationships preserved
6. **Rollback Plan:** Maintain old structure until new architecture proven stable

**Technical Risks & Mitigation:**
- **Data Loss Risk:** Comprehensive backup before migration, thorough validation scripts
- **Relationship Breakage:** Document links, user associations must be preserved
- **Schema Evolution:** Design flexible domain schemas to accommodate future field additions
- **Migration Downtime:** Staged rollout, background migration jobs to minimize user disruption

### Development Methodology: BMAD Integration

**Why BMAD for This Project:**
The Five Whys technique revealed the root cause of architectural challenges: **excitement-driven development without planning methodology**. BMAD provides the structured approach that was missing from initial development.

**BMAD Application:**
- **Business Analysis:** Project brief documents strategic vision and domain requirements
- **Modeling:** Life domain taxonomy, data schemas, user workflows designed before implementation
- **Agile Development:** Iterative implementation with clear milestones (domain-by-domain rollout)
- **Delivery:** MVP focuses on core restructure, post-MVP adds advanced features systematically

**Development Workflow:**
1. **Planning Phase:** Complete domain taxonomy definition, schema design, migration strategy (BMAD Modeling)
2. **Implementation Phase:** Agile sprints - one domain at a time (Property → Vehicles → Finance, etc.)
3. **Validation Phase:** User testing with real household data, family member feedback
4. **Refinement Phase:** Iterate based on actual usage patterns before moving to next domain

### Technology Decisions & Constraints

**Preserve (Working Well):**
- ✅ Node.js/Express backend (solid foundation, familiar)
- ✅ React/TypeScript frontend (modern, type-safe)
- ✅ MongoDB (flexible for evolving schemas, good fit for document-centric app)
- ✅ Google OAuth (secure, family-friendly authentication)

**Remove (Identified Constraints):**
- ❌ Docker architecture (legacy, unnecessary complexity for personal/family use)
- ❌ Abstract category hierarchies (being replaced by life domains)
- ❌ Generic "bills" data model (domain-specific schemas needed)

**Add (New Requirements):**
- ➕ Domain-specific Mongoose schemas (8 life domains × tailored fields)
- ➕ Migration tooling (safe transformation from old to new structure)
- ➕ Renewal reminder engine (cross-domain deadline tracking)
- ➕ Priority/criticality system (emergency view filtering)
- ➕ Guided onboarding workflow (domain-by-domain data collection UI)

**Northern Ireland Technical Requirements:**
- Domestic rates integration (not council tax)
- NI government services API compatibility (future: NIDirectGov integration)
- UK banking standards (sort codes, current accounts, building societies)
- Regional date formats (DD/MM/YYYY throughout)

### Performance & Scalability Considerations

**Current Scale:**
- Personal/family use: 100-200 records per household
- 2-5 concurrent users (family members)
- Document storage: ~50-100 PDFs per household
- MongoDB Atlas sufficient for foreseeable future

**Future Scale (UK-Wide Expansion):**
- Potential: 1000s of households
- Would require: Optimized queries, indexing strategy, CDN for documents
- Not MVP concern: Over-engineering for personal use case is premature

### Security & Privacy

**Current Security Measures:**
- Google OAuth (no local passwords)
- Session-based authentication with secure cookies
- HTTPS required for production
- Helmet.js security headers
- CORS configured for frontend origin

**Enhanced Security Roadmap:**
- MongoDB Atlas field-level encryption (sensitive financial data)
- Granular permissions model (domain-specific access control for family members)
- Audit trail (who accessed/modified what, when - Phase 3 feature)
- Emergency access controls (executor/family member designation with time-delayed access)

---

## Constraints & Assumptions

### Development Constraints

**Personal Project Constraints:**
- **Solo Developer:** Single developer (accountant background, moderate technical experience) - limits velocity
- **Time Availability:** Part-time development alongside professional commitments
- **Budget:** Zero-cost infrastructure preferred (free tiers, open-source tools)
- **Skillset Gaps:** Limited software architecture experience (identified via Five Whys) - BMAD addresses this

**Technical Constraints:**
- **Existing Codebase:** Must migrate from current "bills/categories" structure - cannot start greenfield
- **Data Preservation:** 100% of existing records must survive migration without loss
- **Authentication Lock-in:** Google OAuth already implemented - changing auth provider disruptive
- **MongoDB Commitment:** Existing data in MongoDB - switching databases impractical for MVP
- **Docker Legacy:** Must remove Docker architecture identified as unnecessary complexity

**Northern Ireland Market Constraints:**
- **Regional Focus:** NI-specific terminology and financial products required (domestic rates, integrated utilities)
- **Small Market:** NI population ~1.9M - limited commercial scale for paid tiers
- **UK Variations:** England/Scotland/Wales have different systems (council tax, separate water billing) - out of scope for MVP

### Key Assumptions

**User Behavior Assumptions:**
- **Primary User Has Admin Rights:** Household administrator comfortable with technology, can troubleshoot basic issues
- **Family Trust Model:** Spouse/family members trusted with full access to household information (granular permissions deferred to Phase 3)
- **Desktop-First Usage:** Users primarily access from desktop/laptop (mobile responsive adequate, native apps unnecessary for MVP)
- **Google Account Adoption:** Target users already have Google accounts or willing to create one for authentication
- **Data Collection Motivation:** Users will invest time in initial data entry if shown clear progress and immediate value (renewal tracking)

**Technical Assumptions:**
- **MongoDB Atlas Reliability:** Managed database service provides adequate uptime and performance
- **Vercel/Render Hosting:** Managed hosting platforms handle deployment, scaling, SSL without manual DevOps
- **Document Storage Scale:** 50-100 PDFs per household fits within free/cheap storage tiers (S3, Vercel blob storage)
- **Browser Compatibility:** Modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions) sufficient - no IE11 support needed
- **Internet Connectivity:** Users have reliable internet access - offline mode unnecessary for household information vault

**Market & Business Assumptions:**
- **Personal Use Case Validates Product:** If it solves Calvin's household organization problem, it solves similar problems for other NI families
- **Emergency Preparedness Resonates:** Fear of "what if something happened to me" motivates initial adoption
- **Daily Value Drives Retention:** Renewal tracking and quick information access provide enough ongoing value to maintain usage
- **Word-of-Mouth Potential:** Satisfied users (Calvin's family) will recommend to friends/extended family organically
- **Premium Tier Viability:** Users willing to pay £5-10/month for advanced features once core product proves indispensable (post-MVP validation needed)

**Domain Architecture Assumptions:**
- **8 Life Domains Comprehensive:** Property, Vehicles, Employment, Government, Finance, Insurance & Protection, Legal & Estate, Household Services cover 95%+ of household information needs
- **Domain-Specific Schemas Sufficient:** Tailored fields per domain eliminate need for custom field creation by users
- **Cross-Domain Records Rare:** Most records naturally belong to single domain (edge cases like "home insurance" overlaps Property + Insurance handled by domain choice flexibility)
- **Renewal Date Universal:** Most important records across all domains have renewal/expiry dates - justifies renewal-centric design

### Critical Dependencies

**External Dependencies:**
- **Google OAuth Service:** Availability and API stability critical for authentication
- **MongoDB Atlas:** Database uptime and data durability essential
- **Hosting Platform:** Vercel/Render/Heroku reliability impacts user access
- **UK Financial System Stability:** Changes to NI rates, government services, banking standards may require app updates

**Internal Dependencies:**
- **BMAD Methodology Success:** Structured planning approach must prevent repeat of "excitement-driven development" issues
- **Migration Script Reliability:** Data transformation from old to new structure must be bulletproof
- **User Testing Feedback:** Spouse/family member validation essential to confirm life domain architecture intuitive
- **Domain Schema Completeness:** Must identify all necessary fields for each domain before implementation (avoid post-launch schema changes)

### Risk Mitigation Strategies

**Technical Risk Mitigation:**
- **Data Migration Risk:** Comprehensive backup + validation scripts + rollback plan + staged migration
- **Architecture Risk:** BMAD modeling phase designs complete domain taxonomy before coding starts
- **Performance Risk:** MongoDB indexing strategy + lazy-loading documents + pagination for large record sets

**User Adoption Risk Mitigation:**
- **Overwhelming Data Collection:** Guided onboarding workflow + "critical first" prioritization + motivational progress tracking
- **Family Member Confusion:** Clear domain labels + contextual help + spouse user testing before broader rollout
- **Abandonment Risk:** Quick wins (renewal dashboard value) + visible progress + small chunks approach

**Business Risk Mitigation:**
- **Personal Use Trap:** Document architecture decisions for future developers if project grows beyond personal use
- **Feature Creep:** BMAD prioritization + strict MVP scope + defer advanced features to post-MVP phases
- **Market Validation:** Prove value with personal household first, then cautiously expand to extended family before considering commercial scale

---

## Risks & Open Questions

### High-Priority Risks

#### Risk 1: Data Migration Failure
**Description:** Converting existing "bills/categories" structure to life domain architecture could result in data loss, broken relationships, or corrupted records.

**Probability:** Medium
**Impact:** Critical (loss of household data would destroy trust in application)

**Mitigation Strategy:**
- Complete database backup before any migration
- Write comprehensive validation scripts to verify data integrity
- Implement rollback mechanism to restore old structure if migration fails
- Test migration on copy of production data before live deployment
- Manual verification of critical records (banks, insurance, legal docs) post-migration

**Open Questions:**
- What is the exact mapping from current categories to life domains for each existing record?
- How do we handle edge cases that don't fit cleanly into new domain structure?
- Should migration be automatic or require user review/approval per record?

---

#### Risk 2: Life Domain Architecture Doesn't Match User Mental Model
**Description:** The 8 life domains (Property, Vehicles, Employment, Government, Finance, Insurance & Protection, Legal & Estate, Household Services) might not align with how users actually think about organizing household information.

**Probability:** Medium
**Impact:** High (poor information architecture = app abandonment)

**Mitigation Strategy:**
- Validate domain structure with spouse/family member before implementation
- Build flexibility to assign records to multiple domains if needed
- Include search functionality so users can find records even if domain unclear
- Iterate on domain labels/organization based on user testing feedback
- Provide "Recently Accessed" view as escape hatch for domain navigation issues

**Open Questions:**
- Are 8 domains too many? Should we consolidate (e.g., merge Insurance into Finance)?
- Are domain names clear to non-technical users? (e.g., "Government" vs "Official Documents")
- How do we handle records that span multiple domains (home insurance = Property + Insurance)?
- Should we allow custom domains or enforce the 8-domain structure rigidly?

---

#### Risk 3: Guided Onboarding Overwhelming Users Despite Best Efforts
**Description:** Even with domain-by-domain workflow and progress tracking, initial data collection may still feel overwhelming and lead to abandonment.

**Probability:** Medium-High
**Impact:** High (no data = no value = app not used)

**Mitigation Strategy:**
- Start with absolute minimum critical information (3-5 most important records)
- Show immediate value (renewal dashboard) after entering first few records
- Gamify progress with completion percentages and motivational messaging
- Allow "skip for now" option on all non-critical fields
- Provide import options (bank statements, CSV uploads) to reduce manual entry

**Open Questions:**
- What is the absolute minimum set of records needed to demonstrate value?
- How do we balance "quick start" vs. "comprehensive data collection"?
- Should onboarding be mandatory or skippable (with persistent prompts)?
- Can we import data from common sources (email, Google Drive) to jumpstart collection?

---

#### Risk 4: Solo Developer Velocity vs. Ambitious Scope
**Description:** Life domain architecture restructure, migration tooling, guided onboarding, and renewal intelligence is significant scope for solo part-time developer.

**Probability:** High
**Impact:** Medium (delayed timeline, feature cuts, burnout risk)

**Mitigation Strategy:**
- Strict MVP scope enforcement - defer all non-essential features to post-MVP
- BMAD planning to prevent scope creep and "excitement-driven development"
- Domain-by-domain incremental delivery (Property first, then Vehicles, etc.)
- Accept that MVP timeline may stretch 3-6 months for part-time development
- Consider outsourcing specific components (migration scripts, UI design) if budget allows

**Open Questions:**
- What is realistic timeline for MVP given part-time availability?
- Which life domains are absolutely essential for MVP vs. can be added later?
- Should we simplify domain-specific schemas for MVP (generic fields, customize post-MVP)?
- Can we leverage AI/automation tools to accelerate development?

---

### Medium-Priority Risks

#### Risk 5: Family Members Don't Adopt Despite Multi-User Support
**Description:** Spouse/family members may view LegacyLock as "Calvin's system" and not actively contribute or use it.

**Probability:** Medium
**Impact:** Medium (reduces value, maintains single point of failure)

**Mitigation Strategy:**
- Explicitly design for contributing family member persona (simple workflows, clear guidance)
- Involve spouse in user testing to build ownership and familiarity
- Assign specific domains to family members (e.g., spouse manages their own car insurance)
- Demonstrate value for family members (finding information independently without asking)

**Open Questions:**
- How do we incentivize family member participation vs. passive access?
- Should we implement task assignment ("John, can you add the new broadband contract")?
- What level of hand-holding do non-technical family members need?

---

#### Risk 6: Renewal Tracking Doesn't Prevent Missed Deadlines
**Description:** Users may ignore renewal reminders or fail to act on them in time, negating primary value proposition.

**Probability:** Medium
**Impact:** Medium (undermines core value, but app still useful for information storage)

**Mitigation Strategy:**
- Multiple reminder touchpoints (90/60/30/14/7 day notifications)
- Calendar integration (export renewals to Google Calendar, Outlook)
- Visual dashboard prominence (renewals always visible on homepage)
- Email notifications in addition to in-app reminders
- "Snooze" functionality to reschedule reminders if not ready to act

**Open Questions:**
- What notification frequency balances helpfulness vs. annoyance?
- Should we integrate with external todo apps (Todoist, Things) for action tracking?
- Can we provide renewal decision support (price comparison links, historical rates)?

---

#### Risk 7: Northern Ireland Focus Limits Market Opportunity
**Description:** Building NI-specific features may make expansion to England/Scotland/Wales more difficult, limiting growth potential.

**Probability:** Low
**Impact:** Low-Medium (personal use case unaffected, but commercial viability limited)

**Mitigation Strategy:**
- Design regionalization layer in architecture (NI config = one option, not hardcoded)
- Document NI-specific assumptions clearly for future regional expansion
- Accept that personal use case justifies NI focus regardless of commercial potential
- Consider UK-wide expansion only after MVP proven valuable for personal use

**Open Questions:**
- How much effort would UK-wide support add? Is it worth it for MVP?
- Are there other regional markets with similar needs (Scotland, Wales, Ireland)?
- Should we design for internationalization from start or refactor later?

---

### Open Questions Requiring Investigation

#### Product Strategy Questions
1. **Freemium vs. Paid-Only Model:** Should basic features be free forever (freemium) or require subscription after trial? What features justify premium tier?
2. **Target Market Expansion:** After personal use validated, should we target NI families broadly, or specific segments (retirees, young families, executors/solicitors)?
3. **Distribution Strategy:** How do we acquire users beyond word-of-mouth? (Social media, content marketing, partnerships with financial advisors?)
4. **Competitive Response:** What if existing players (1Password, Notion) add household organization features? How do we differentiate?

#### Technical Architecture Questions
5. **Domain Schema Flexibility:** Should schemas be hardcoded per domain or allow custom fields? How much flexibility vs. structure?
6. **Document Storage Strategy:** Local filesystem, MongoDB GridFS, S3, Vercel Blob Storage? Cost vs. performance tradeoffs?
7. **Offline Support:** Is offline access necessary for household vault? Or is reliable internet assumed?
8. **Mobile Strategy:** Web-responsive sufficient for MVP, but when does native mobile app become necessary?

#### User Experience Questions
9. **Emergency Access Model:** How do executors/family members gain access during emergency? Time-delayed unlock? Pre-designated access codes?
10. **Privacy Controls:** What sensitive information should be hidden by default? (e.g., bank balances visible to spouse but not adult children?)
11. **Collaboration Features:** Comments/discussions on records useful? Or unnecessary complexity for household use?
12. **Notification Preferences:** How do users control reminder frequency? Per-domain settings? Global preferences?

#### Data & Content Questions
13. **Comprehensive Checklist Research:** What authoritative sources exist for "complete household information inventory"? Government guides? Financial advisor checklists?
14. **NI Provider Database:** Should we maintain database of NI utilities/insurance/service providers for auto-complete? Maintenance burden vs. user convenience?
15. **Template Scenarios:** What household archetypes should we support? (First-time homebuyer, retiree, young family, single person, blended family?)

---

## Appendices

### Appendix A: Life Domain Taxonomy (Detailed)

#### Domain 1: Property
**Purpose:** All information related to owned/rented residential property

**Record Types:**
- Mortgage/Home Loan
- Domestic Rates (NI Council Tax equivalent)
- Home Insurance (Buildings & Contents)
- Utilities: Electricity, Gas, Heating Oil
- Internet/Broadband
- Phone (Landline)
- Water (if separately billed - rare in NI)
- Home Maintenance Contracts (boiler service, etc.)

**Key Fields:**
- Property address, ownership status, purchase date, current value
- Mortgage: lender, account number, monthly payment, term end date, interest rate
- Rates: reference number, annual charge, payment method
- Insurance: policy number, coverage amount, renewal date, excess
- Utilities: account numbers, tariff details, contract end dates, provider contacts

**Documents:**
- Mortgage agreement, property deeds, home insurance policy, utility contracts, rates bills

---

#### Domain 2: Vehicles
**Purpose:** Cars, motorcycles, caravans, boats - anything with registration/insurance

**Record Types:**
- Vehicle Details (make, model, registration, VIN)
- Car Finance/Loan
- MOT Certificate
- Road Tax
- Vehicle Insurance
- Breakdown Cover
- Service History

**Key Fields:**
- Registration number, make/model, purchase date, current value
- Finance: lender, monthly payment, settlement figure, term end
- MOT: expiry date, testing station, last test result
- Insurance: policy number, renewal date, premium, excess, no-claims bonus
- Tax: expiry date, monthly/annual payment

**Documents:**
- V5C registration, insurance certificate, MOT certificate, finance agreement, service receipts

---

#### Domain 3: Employment
**Purpose:** Job-related information, payroll, workplace benefits, pensions

**Record Types:**
- Current Employment Details
- Payslips (recent 6-12 months)
- P60 Annual Tax Summary
- Employment Contract
- Workplace Pension Scheme
- Other Workplace Benefits (health insurance, life cover, etc.)

**Key Fields:**
- Employer name, job title, start date, salary
- Payroll number, tax code, NI category
- Pension: provider, contribution %, employer match, fund value
- Benefits: type, provider, coverage details

**Documents:**
- Employment contract, recent payslips, P60s, pension statements, benefits documentation

---

#### Domain 4: Government
**Purpose:** Official government records, benefits, documentation

**Record Types:**
- National Insurance Record
- PAYE Tax Records
- Benefits (Universal Credit, Child Benefit, etc.)
- Driving Licence
- Passport
- Birth/Marriage Certificates
- Electoral Registration

**Key Fields:**
- NI number, tax reference, UTR (self-employed)
- Benefit: claim number, payment amount, review dates
- Licence: number, expiry date, endorsements
- Passport: number, expiry date, issue date

**Documents:**
- NI confirmation letter, tax correspondence, benefit award letters, licence/passport scans, certificates

---

#### Domain 5: Finance
**Purpose:** Banking, savings, investments, credit, loans

**Record Types:**
- Current Accounts
- Savings Accounts
- ISAs (Cash, Stocks & Shares)
- Credit Cards
- Personal Loans
- Investment Accounts
- Premium Bonds
- Cryptocurrency Wallets

**Key Fields:**
- Account name, sort code, account number
- Balance, interest rate, monthly fees
- Credit limit (cards), outstanding balance, APR
- Loan: amount borrowed, monthly payment, settlement figure

**Documents:**
- Bank statements, loan agreements, investment reports, card statements

---

#### Domain 6: Insurance & Protection
**Purpose:** Insurance policies not covered in other domains, warranties, protection plans

**Record Types:**
- Life Insurance
- Income Protection
- Critical Illness Cover
- Health Insurance (Private Medical)
- Travel Insurance
- Pet Insurance
- Gadget/Phone Insurance
- Extended Warranties (appliances, electronics)

**Key Fields:**
- Policy number, provider, premium (monthly/annual)
- Coverage amount, exclusions, renewal date
- Beneficiaries (life insurance)
- Claim history

**Documents:**
- Policy documents, renewal notices, warranty certificates, claim correspondence

---

#### Domain 7: Legal & Estate
**Purpose:** Wills, power of attorney, trusts, property ownership, legal matters

**Record Types:**
- Will (Last Will & Testament)
- Power of Attorney (Lasting/Enduring)
- Trusts
- Property Deeds (not primary residence)
- Executor Details
- Solicitor Information

**Key Fields:**
- Document type, execution date, solicitor details
- Executor/trustee names and contact information
- Storage location (physical documents)
- Review/update dates

**Documents:**
- Will PDF, power of attorney documents, trust deeds, property deeds, solicitor correspondence

---

#### Domain 8: Household Services
**Purpose:** Trusted tradespeople, service providers, local contacts

**Record Types:**
- Tradespeople (plumber, electrician, builder, etc.)
- Regular Services (cleaner, gardener, handyman)
- Veterinarian
- Medical Contacts (GP, dentist, optician)
- Childcare Providers
- Local Suppliers (oil delivery, window cleaner, etc.)

**Key Fields:**
- Name, business name, trade/service type
- Contact: phone, email, address
- Quality rating (1-5 stars), notes on work quality
- Job history: dates, work done, costs

**Documents:**
- Quotes, invoices, service agreements, business cards (scanned)

---

### Appendix B: Glossary of Terms

**Life Domain:** Top-level organizational category representing a major area of household life (Property, Vehicles, Employment, etc.)

**Record:** A structured data entry within a life domain containing domain-specific fields (e.g., bank account record has sort code/account number fields)

**Bills (Legacy Term):** Previous terminology for records - being replaced in architectural restructure

**Categories (Legacy Term):** Previous hierarchical organization system - being replaced by life domains

**Renewal Date:** Critical date when contract/policy/service requires action (renewal, cancellation, review)

**Priority/Criticality:** Classification of record importance - Critical (emergency access needed), Important (regular access), Standard (archive)

**Emergency View:** Filtered interface showing only Critical priority records - designed for executor/family member emergency access

**Guided Onboarding:** Step-by-step workflow for initial data collection with progress tracking and motivational feedback

**Domain-Specific Schema:** Custom field structure for each life domain (bank accounts have different fields than utilities)

**Document Linking:** Ability to attach PDF/image files to records (e.g., insurance policy PDF linked to car insurance record)

**Northern Ireland (NI) Context:** Region-specific terminology and financial products (domestic rates, integrated utilities, building societies)

**BMAD Methodology:** Business Modeling, Agile Development - structured planning approach preventing "excitement-driven development"

---

### Appendix C: User Persona Summary

#### Primary Persona: Household Administrator (Calvin)
- **Age:** 35-65
- **Role:** Manages 80-90% of household finances and admin
- **Background:** Accountant, detail-oriented professional
- **Pain Points:** Scattered information, renewal stress, family preparedness worry
- **Goals:** Reduce mental load, proactive management, quick information access, family protection
- **Success Metric:** Find any information in <60 seconds, never miss renewals

#### Secondary Persona: Contributing Family Member (Spouse)
- **Age:** 25-65
- **Role:** Shares some household responsibilities, wants visibility
- **Pain Points:** Unclear what to add, fear of messing up, need visibility without always asking
- **Goals:** Contribute effectively, independent access, stay informed, support primary user
- **Success Metric:** Add records correctly 90% of time without help

#### Tertiary Persona: Emergency Information Seeker (Executor/Family in Crisis)
- **Age:** 30-70
- **Role:** Needs critical info during emergency (illness, death, incapacitation)
- **Pain Points:** High stress, unfamiliar with systems, time sensitivity, verification challenges
- **Goals:** Find critical info fast, understand what exists, take immediate actions, navigate without training
- **Success Metric:** Identify all bank accounts within 5 minutes, locate specific documents without searching entire system

---

### Appendix D: Competitive Analysis Summary

**1Password / Bitwarden (Password Managers)**
- ✅ **Strengths:** Secure credential storage, cross-device sync, family sharing, mature products
- ❌ **Weaknesses:** Login-focused, no life domain organization, no renewal tracking, no guided workflows
- 🎯 **LegacyLock Differentiator:** Household information context, renewal intelligence, emergency preparedness focus

**Notion / Evernote (Note-Taking Apps)**
- ✅ **Strengths:** Flexible, powerful, customizable, support documents/files
- ❌ **Weaknesses:** Blank canvas problem, no NI-specific templates, no renewal tracking, steep learning curve
- 🎯 **LegacyLock Differentiator:** Structured life domains, domain-specific schemas, guided onboarding

**Excel / Google Sheets (Spreadsheets)**
- ✅ **Strengths:** Powerful, familiar to many users, free/cheap
- ❌ **Weaknesses:** Manual setup, no document linking, no reminders, poor mobile experience, technical barrier
- 🎯 **LegacyLock Differentiator:** Visual interface, automatic reminders, document storage, accessible to non-technical users

**Physical Filing Systems**
- ✅ **Strengths:** Tangible, familiar, no technical barrier
- ❌ **Weaknesses:** Not searchable, not remotely accessible, no renewal reminders, difficult to share
- 🎯 **LegacyLock Differentiator:** Cloud access, search, automatic reminders, multi-user access

**Key Insight:** No existing solution combines life domain organization + renewal intelligence + emergency preparedness + NI-specific context. LegacyLock occupies unique market position.

---

### Appendix E: Technical Reference

**Current Tech Stack:**
- **Backend:** Node.js v18+, Express v4.x
- **Frontend:** React v18+, TypeScript v5.x, Vite v5.x
- **Database:** MongoDB v6.x (Atlas managed)
- **Auth:** Passport.js v0.6.x, Google OAuth 2.0
- **File Storage:** TBD (S3, Vercel Blob, or GridFS)
- **Hosting:** TBD (Vercel, Render, or Heroku)

**Key Dependencies:**
- `mongoose` - MongoDB ODM
- `passport-google-oauth20` - Google authentication
- `cookie-session` - Session management
- `helmet` - Security headers
- `cors` - Cross-origin resource sharing

**Development Tools:**
- `nodemon` - Backend hot reload
- `prettier` - Code formatting
- BMAD CLI - Project management

**Testing Strategy (Future):**
- Unit tests: Jest + React Testing Library
- Integration tests: Supertest (API), Cypress (E2E)
- Manual QA: Spouse/family member testing

---

## Next Steps

### Immediate Actions (This Week)

1. ✅ **Complete Project Brief** - Document current state and strategic vision _(COMPLETE)_

2. **Review & Validate Brief**
   - Share with spouse for user perspective validation
   - Verify life domain taxonomy resonates with non-technical user
   - Confirm terminology clarity ("Records" vs "Bills", domain names)
   - Identify any missing household information areas

3. **Define Complete Domain Schemas**
   - Map ALL current records to proposed life domains
   - Document exact field requirements for each domain type
   - Identify edge cases and cross-domain records
   - Create schema migration mapping document

4. **Audit Current Data Structure**
   - Export complete database schema documentation
   - Count records per current category
   - Identify any orphaned or problematic data
   - Assess migration complexity

---

### Short-Term Planning (Next 2-4 Weeks)

5. **Create Detailed Migration Plan**
   - Write migration scripts (old structure → life domains)
   - Design validation tests for data integrity
   - Build rollback mechanism
   - Test on copy of production database

6. **Design MVP Feature Set**
   - Prioritize which domains MUST be in MVP (Property, Vehicles, Finance minimum?)
   - Defer advanced features (guided onboarding, emergency mode) to Phase 2?
   - Define "done" criteria for MVP delivery
   - Create realistic timeline estimate

7. **BMAD Modeling Phase**
   - Use BMAD methodology to design complete architecture
   - Create formal domain models and data schemas
   - Design UI/UX workflows for each domain
   - Document all architectural decisions

8. **Establish Development Workflow**
   - Set up BMAD project structure (epics, stories, tasks)
   - Configure development environment
   - Create feature branch strategy
   - Define testing and deployment process

---

### Medium-Term Development (Next 1-3 Months)

9. **Implement Core Architecture**
   - Build life domain navigation system
   - Implement domain-specific Mongoose schemas
   - Create record CRUD operations per domain
   - Preserve existing auth and document linking

10. **Execute Data Migration**
    - Backup production database
    - Run migration scripts with validation
    - Manual verification of critical records
    - Rollback if issues detected

11. **Build MVP Features**
    - Domain-by-domain incremental delivery (Property first)
    - Renewal date tracking and dashboard
    - Priority/criticality marking
    - Multi-user access (family sharing)

12. **User Testing & Iteration**
    - Spouse/family member testing
    - Gather feedback on domain organization
    - Refine schemas based on real usage
    - Fix bugs and UX issues

---

### Long-Term Roadmap (3-6+ Months)

13. **Phase 2: Enhanced Features**
    - Guided onboarding workflow
    - Motivational progress tracking
    - Enhanced bank import
    - Calendar/todo integration

14. **Phase 3: Advanced Collaboration**
    - Granular permissions model
    - Emergency access controls
    - Activity feed and task assignment
    - Decision support tools

15. **Phase 4: Market Expansion**
    - UK-wide regional support (England, Scotland, Wales)
    - Premium tier features
    - Analytics and insights
    - API integrations (Open Banking, etc.)

---

### Success Criteria & Milestones

**MVP Success (3-6 months):**
- ✅ 100+ household records migrated successfully
- ✅ Zero missed renewals in first 3 months
- ✅ Spouse independently finds information 90%+ of time
- ✅ Average information retrieval time <60 seconds
- ✅ At least 3 life domains actively used

**Phase 2 Success (6-12 months):**
- ✅ Guided onboarding completion rate >80%
- ✅ Multi-bank import functional (HSBC + 2 others)
- ✅ Calendar integration working (Google Calendar export)
- ✅ Renewal decision support reduces missed opportunities

**Long-Term Success (1-2 years):**
- ✅ UK-wide expansion validated with non-NI users
- ✅ Premium tier revenue covers hosting costs
- ✅ Extended family adoption (3+ households using LegacyLock)
- ✅ Emergency preparedness validated through real scenario

---

### Key Decisions Needed Before Development

**Decision 1: MVP Domain Scope**
- Question: Which life domains are essential for MVP vs. can be added later?
- Options: All 8 domains, or start with 3-4 core domains (Property, Vehicles, Finance)?
- Impact: Affects migration complexity and development timeline

**Decision 2: Schema Flexibility**
- Question: Should domain schemas allow custom fields or be rigidly defined?
- Options: Hardcoded schemas vs. extensible field system
- Impact: Affects future-proofing and user flexibility vs. simplicity

**Decision 3: Migration Approach**
- Question: Automatic migration or user-reviewed per record?
- Options: Fully automated, semi-automated with user approval, manual migration wizard
- Impact: Affects migration time and data accuracy confidence

**Decision 4: Document Storage**
- Question: Where should PDFs/documents be stored?
- Options: MongoDB GridFS, S3, Vercel Blob Storage, local filesystem
- Impact: Affects costs, performance, and hosting platform choice

**Decision 5: Onboarding Priority**
- Question: Is guided onboarding essential for MVP or Phase 2 feature?
- Options: MVP must-have, Phase 2 enhancement, or Phase 3 polish
- Impact: Affects MVP scope and user adoption risk

---

## Conclusion

**LegacyLock** addresses a genuine household pain point—scattered financial and administrative information causing daily friction and emergency unpreparedness. The BMAD brainstorming session revealed that the root cause of previous architectural challenges was "excitement-driven development without planning methodology."

This project brief establishes a structured foundation using BMAD principles:

✅ **Business Analysis Complete:** User personas, pain points, value proposition, market analysis documented
✅ **Strategic Vision Clear:** Life domain architecture solves terminology confusion and information organization
✅ **Technical Approach Defined:** Migration strategy, domain-specific schemas, MVP scope established
✅ **Risks Identified:** Data migration, user adoption, solo developer velocity addressed with mitigation strategies

**The path forward is clear:**

1. **Validate** domain taxonomy with spouse/family member
2. **Design** complete domain schemas and migration plan using BMAD modeling
3. **Implement** core architecture domain-by-domain (Property → Vehicles → Finance → etc.)
4. **Test** with real household data and iterate based on family feedback
5. **Expand** to advanced features and UK-wide market only after personal use case proven

By applying BMAD methodology rigorously, LegacyLock will become the reliable household information vault that prevents the anxiety of "where did I put that?" and provides peace of mind that loved ones can access critical information when needed.

**Next Action:** Review this brief, validate life domain taxonomy with spouse, and proceed to BMAD modeling phase.

---

**Document Version:** 1.0
**Date:** 2025-10-04
**Status:** Complete - Ready for Review
**Next Review:** After spouse/family validation
