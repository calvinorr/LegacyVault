# Brainstorming Session Results: LegacyLock Cleanup & Roadmap Refinement

**Date:** 2025-10-04
**Duration:** ~45 minutes
**Participants:** Calvin (Product Owner/Developer), Mary (Business Analyst)
**Session Goal:** Identify cleanup priorities and refine roadmap for LegacyLock using BMAD methodology

---

## Executive Summary

### Session Context
LegacyLock is a brownfield project - a UK-focused secure financial vault for families to store critical household information (bank accounts, utilities, providers, policies, pensions, tradespeople) in case of death or incapacitation. Built pre-BMAD methodology, the app works but suffers from unclear information architecture, terminology confusion, and overwhelming data collection workflows.

### Techniques Used
1. **What If Scenarios** (20 min) - Explored new user experience and architectural possibilities
2. **Five Whys** (25 min) - Investigated root causes of data collection challenges

### Key Outcomes
- **Major architectural insight**: Shift from abstract "bills/categories" to **life domain organization** (Property, Cars, Employment, Government)
- **Identified root cause**: Excitement-driven development without planning methodology or information architecture skills
- **Clear path forward**: Use BMAD to restructure app around domain-specific schemas with guided workflows
- **23 actionable ideas** generated across terminology, navigation, features, and data collection

### Top Priorities Identified
1. Restructure navigation around life domains (Property, Cars, Employment, Government)
2. Rename core concepts (Bills → Records, rethink Categories)
3. Implement guided onboarding workflow with motivational progress tracking
4. Design domain-specific data schemas (different fields for banks vs. utilities vs. tradespeople)

---

## Technique 1: What If Scenarios

### Ideas Generated

#### Core Problem Discovery
**What If: New family member joined LegacyLock tomorrow - what would confuse them?**

**Insights:**
- Unclear starting point for new users
- Terminology confusion: "Bills" doesn't match emergency vault purpose
- "Categories" concept is confusing - came from trying to organize data storage
- Original vision: Store critical info in case of death/incapacitation
- App scope: Information organization, NOT budget management
- Feature confusion: Bank statement import may suggest budget focus

#### Architectural Breakthrough
**What If: You could rename core concepts to match "emergency preparedness vault" purpose?**

**Ideas Generated:**
- "Bills" → **"Records"** ✨ (much clearer!)
- "Categories" → Functional domains: **Property, Cars, Employment, Government**
- Organization by life areas vs. financial categories
- Each domain contains related records + linked documents (PDFs)

**Key Features Identified:**
- Renewal dates with reminders/todo/calendar integration
- Document storage linked to records (e.g., car insurance record → renewal PDF)
- Ancillary useful info (best local tradespeople)

#### Visual & UX Enhancement
**What If: Navigation organized by life domains with visual interface?**

**Ideas Generated:**
- **Graphical interface**: Pretty icons/SVG for each domain
- **Priority marking**: Critical/Priority/Non-Critical status for records
- **Renewal highlighting**: Visual indicators for upcoming renewals
- **Emergency Mode/Death Workflow**:
  - "What do they need RIGHT NOW?" view
  - Immediate actions (bank notifications, credit cards, pensions)
  - Account name changes for utilities
  - Critical vs. non-urgent information separation

#### Data Collection Solutions
**What If: Clear onboarding workflow existed?**

**Ideas Generated:**
- Guided process for initial data collection
- Research-based checklist of vital info to gather (web research)
- Start with critical information for quick wins
- Motivational todo lists showing accomplishment + remaining work

---

## Technique 2: Five Whys - Data Collection Challenge

### Investigation Flow

#### Why #1: Why is collecting initial data one of the most challenging aspects?

**Insights Uncovered:**
- **Information overload**: Known unknowns + unknown unknowns
- **Security sensitivity**: Personal data + family sharing dynamics
- **Overwhelming scope**: Leads to abandonment risk
- **Motivation problem**: Need quick wins to continue
- **Missing information sources**:
  - Email = goldmine but buried in spam
  - Bank statements help but limited
  - Non-financial info harder (no electronic trail)
- **Solution needs**:
  - Clear progress indicators
  - Accomplishment feedback
  - Tutorial/workflow for non-financial data

#### Why #2: Why does overwhelming scope lead to giving up?

**Root Causes:**
- No clear "finish line"
- Unclear prioritization (what's most important first?)
- Time consuming with no visible progress
- **Developer distraction**: Building features vs. using the app!
- **Clarity issue**: Unclear what data to add + how it links together

**Solutions Emerging:**
- Customizable motivational todo lists
- Small chunks approach = feel benefits faster
- Rigid structure needed (life domain approach provides this!)

#### Why #3: Why isn't it clear what data to add and how they link?

**Core Problems:**
- **Abstract structure**: Bills/categories/entries too generic
- **Scatter approach**: Trying to see "complete app" too fast
- **Data schema mismatch**: Each domain needs DIFFERENT fields
  - Bank Accounts → account number, sort code, balances
  - Utilities → renewal dates, providers, contract terms
  - Tradespeople → contact info, services, ratings
- **Schema evolution**: Built on-the-fly based on latest idea
- **Missing foundation**: No structured planning

**Solution Path:**
- User story workflows to guide data input per domain
- Domain-specific schemas instead of one-size-fits-all

#### Why #4: Why generic schema instead of domain-specific from start?

**Discovery:**
- Didn't know all use cases upfront
- Kept discovering new valuable areas (feature creep)
- **Bank statement focus**: Early optimization narrowed thinking
- Underestimated breadth of information types
- Category confusion led down narrow path
- **Built from personal expertise**: Accountant + household responsibility = personal knowledge base
- **Newbie developer**: Learning to code while building

#### Why #5: Why didn't you plan architecture even after realizing broader scope?

**ROOT CAUSE IDENTIFIED:**
- ✅ **Excitement-Driven Development**: Discovered possibilities → built immediately
- ✅ **No Planning Methodology**: Classic "vibe coding" (pre-BMAD!)
- ✅ **New Developer**: Lacks engineering experience to think architecturally ahead
- ✅ **Missing Skills**: Information architecture, domain modeling, planning frameworks

**🎯 THE INSIGHT**: Accountant with deep domain expertise building genuinely useful app, but lacked software engineering methodology to structure that knowledge into sustainable architecture.

**BMAD solves exactly this problem!**

---

## Idea Categorization

### Immediate Opportunities (Ready to Implement)
1. **Rename "Bills" to "Records"** - Simple terminology fix with big clarity impact
2. **Remove Docker legacy architecture** - Cleanup constraint already identified
3. **Audit current data schema** - Document what exists before restructuring
4. **Create life domain taxonomy** - Define Property, Cars, Employment, Government + subdomains

### Strategic Innovations (Requires Planning)
5. **Life Domain Navigation Architecture** - Major restructure of app organization
6. **Domain-Specific Data Schemas** - Different fields per domain type
7. **Guided Onboarding Workflow** - Step-by-step initial data collection
8. **Emergency Mode View** - "What to do immediately after death" workflow
9. **Priority/Criticality Marking System** - Visual hierarchy for records
10. **Motivational Progress Tracking** - Todo lists + accomplishment feedback
11. **Renewal Reminder System** - Calendar integration for critical dates

### Future Enhancements (Post-BMAD Restructure)
12. **Visual/Graphical Interface** - Icons/SVG for domains
13. **Email Integration** - Smart extraction from email accounts
14. **Bank Statement Enhancement** - Better link to email + records
15. **Research-Based Checklists** - Web research for comprehensive data collection guide
16. **Document Linking System** - PDFs connected to records
17. **Tradespeople Database** - Non-financial useful information
18. **Customizable Workflows** - Personalized data collection paths
19. **Family Sharing Controls** - Sensitive data visibility management

### Insights & Learnings
20. **App purpose clarity**: Emergency preparedness vault, NOT budget management
21. **User base scope**: Personal/family use (not commercial) - maybe extend to other family members
22. **Quick wins essential**: Users need motivation through small accomplishments
23. **Domain expertise is strength**: Accountant knowledge + household responsibility = valuable personal context

---

## Action Planning

### Top 3 Priority Actions

#### 1. Create Project Brief with BMAD Methodology
**Rationale:** Document current state and strategic vision using structured approach
**Next Steps:**
- Use Business Analyst agent to create comprehensive brief
- Document existing architecture, features, and technical decisions
- Define life domain taxonomy and domain-specific requirements
- Establish clear MVP scope vs. future enhancements

**Resources Needed:**
- Complete codebase audit
- Current database schema documentation
- User story mapping for each life domain

**Timeline:** Immediate - Foundation for all other work

#### 2. Design Life Domain Information Architecture
**Rationale:** Fundamental restructure enabling all other improvements
**Next Steps:**
- Define complete domain taxonomy (Property, Cars, Employment, Government, etc.)
- Map existing data to new domain structure
- Design domain-specific schemas with required/optional fields
- Create migration plan from current structure

**Resources Needed:**
- Information architecture expertise (BMAD provides this)
- Database schema design
- Data migration strategy

**Timeline:** Post-brief, pre-development (critical planning phase)

#### 3. Implement Guided Onboarding Workflow
**Rationale:** Solve data collection challenge and prove new architecture value
**Next Steps:**
- Create prioritized data collection checklist (critical → nice-to-have)
- Design motivational progress tracking UI
- Build domain-by-domain workflow (start small, build confidence)
- Research comprehensive information checklist

**Resources Needed:**
- UX design for workflow
- Progress tracking database
- Web research for comprehensive checklist

**Timeline:** First major feature after architectural restructure

---

## Reflection & Follow-up

### What Worked Well
- **What If Scenarios** quickly surfaced terminology and navigation insights
- **Five Whys** uncovered root cause (lack of planning methodology) efficiently
- Combining techniques created full picture: problem + solution path
- User's domain expertise (accountant + household manager) provided rich context

### Areas for Further Exploration
- Specific life domain taxonomies (how many? what exactly in each?)
- Emergency workflow details (what actions in what order after death?)
- Family sharing/permission models (who sees what sensitive data?)
- Visual design language (what aesthetic matches "secure family vault"?)
- Migration strategy from current structure to domain-based

### Recommended Follow-up Techniques
- **Mind Mapping**: Visualize complete life domain taxonomy
- **Role Playing**: Think from different family member perspectives (spouse, adult child, executor)
- **Morphological Analysis**: Systematically explore domain field combinations
- **SCAMPER**: Enhance emergency workflow feature ideas

### Questions for Future Sessions
1. What are ALL the life domains we need? (Property, Cars, Employment, Government, Health, Legal, Personal, Leisure?)
2. What specific fields does each domain require? (Create comprehensive schema definitions)
3. What is the MINIMUM critical information set for MVP onboarding? (Define quick win workflow)
4. How do we handle cross-domain records? (e.g., home insurance overlaps Property + Insurance)
5. What legacy data migration challenges will we face?

---

## Next Steps

### Immediate (Today)
1. ✅ Complete this brainstorming session
2. ⏭️ Create Project Brief using Business Analyst agent
3. Review brief and validate insights

### Short Term (This Week)
4. Define complete life domain taxonomy
5. Map existing data to new structure
6. Design domain-specific schemas
7. Create migration plan

### Medium Term (This Month)
8. Begin BMAD-driven development using PM agent
9. Implement architectural restructure
10. Build guided onboarding workflow MVP

---

**Session End Time:** 2025-10-04
**Total Ideas Generated:** 23
**Key Themes:** Information architecture, domain modeling, guided workflows, motivation systems
**Critical Insight:** BMAD methodology solves exact gap (planning + structure) that caused original architectural challenges

**Status:** ✅ Ready to proceed to Project Brief creation
