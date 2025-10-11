# Epic 5: Transaction Ledger & Pattern Intelligence

**Created:** 2025-10-11
**Status:** 📋 Proposed - Awaiting User Approval
**PM Agent:** John (Product Manager)
**Epic Type:** Brownfield Enhancement - Major Architecture Change

---

## Epic Overview

**Goal:** Transform Bank Import from a stateless single-statement processor to an intelligent transaction ledger system that accumulates transaction history across all imports, detects recurring payment patterns, prevents duplicates, and helps users efficiently identify regular payments requiring domain records.

**Why This Epic Exists:**

The current Bank Import system processes monthly statements in isolation with transactions embedded in `ImportSession` documents. This creates significant limitations:

- **No cross-statement intelligence:** Can't detect that "British Gas £85" appears monthly across multiple imports
- **No duplicate prevention:** Uploading the same statement twice creates duplicate transactions
- **No linkage tracking:** Can't tell which transactions already have domain records across sessions
- **Limited recurring detection:** Within-statement recurring detection has low value (same transaction in one month isn't "recurring")

**User Insight:** *"I import statements monthly, so recurring detection within one statement is useless. The real value is detecting patterns ACROSS monthly imports - that's when I know something is truly recurring."*

**Business Value:**

A central transaction ledger enables:
1. **True recurring pattern detection** - "This payee appears monthly for the past 6 months"
2. **Smart duplicate handling** - "This transaction already exists (same amount + payee)"
3. **Entry reconciliation** - "10 new transactions, 5 already processed, 5 need action"
4. **Learning & suggestions** - "British Gas detected → Suggest Property > Utility Bill"
5. **Future capabilities** - Budget planning, spending analysis, financial insights

---

## Existing System Context

### Current Bank Import Architecture

**Current Functionality:**
- `web/src/pages/BankImport.tsx` - Upload PDF, view transactions, create records
- `src/controllers/ImportController.js` - PDF processing, domain suggestions
- `src/models/ImportSession.js` - Session with **embedded transactions array**
- `src/services/pdfProcessor.js` - HSBC multi-line parsing
- `src/services/recurringDetector.js` - Within-session pattern detection

**Current Data Flow:**
```
1. Upload PDF → Parse → Embed transactions in ImportSession
2. Detect recurring within session (limited value)
3. User creates records manually from transaction table
4. Session deleted → transactions lost forever
```

**Current Limitations:**
- Transactions not persistent (deleted with session)
- No cross-import history
- No duplicate detection
- No pattern learning
- Each import is isolated silo

### Technology Stack

**Backend:**
- Node.js/Express with MongoDB (Mongoose ODM)
- PDF parsing: pdf2json
- Fuzzy matching: fuzzball
- File hashing: crypto (SHA-256)

**Frontend:**
- React/TypeScript with Vite
- Premium design system (Swiss spa aesthetic, Lucide icons, Inter font)

**Current Collections:**
- Users, Domain Records (8 collections), ImportSessions (**Transaction embedded**)

---

## Enhancement Scope

**Enhancement Type:**
- ☑ Major Feature Modification - Transform stateless tool to stateful ledger
- ☑ Integration with New Systems - Transaction database becomes core data model

**Impact Assessment:**
- ☑ Significant Impact (substantial existing code changes)

**Architectural Changes Required:**
- New `Transaction` collection (persistent, indexed)
- Modify `ImportSession` to reference (not embed) transactions
- Migration script to move embedded → standalone transactions
- Update `ImportController` for duplicate detection
- New `PatternDetector` service for cross-import analysis
- Enhanced UI with timeline, filters, pattern insights

---

## Goals and Background Context

### Goals

- Enable **true recurring payment detection** across multiple monthly statements
- **Prevent duplicate imports** (same statement uploaded twice)
- **Track entry creation status** per transaction (already processed vs new)
- **Maintain data integrity** (full transaction history retained)
- **Preserve existing Bank Import UX** (don't break current workflow)
- **Foundation for future insights** (spending analysis, budget forecasting)
- **Intelligent suggestions** (learn from user patterns, auto-suggest domains)

### Background Context

The current Bank Import was designed for **single-statement processing** with embedded transactions in `ImportSession`. This works for one-time imports but creates limitations when users import statements monthly:

1. **No cross-statement history:** Each import is isolated - can't detect that "British Gas £85" appears every month
2. **No duplicate prevention:** Uploading the same statement twice creates duplicate transactions with no warning
3. **No linkage tracking:** Can't tell which transactions already have domain records across multiple sessions
4. **Storage inefficiency:** Transactions embedded in sessions (MongoDB document size limits, no reusability)

The user's insight revealed the core problem:

> *"Recurring detection within a monthly statement is not useful - it's unlikely the same transaction appears twice in one month. The exception is savings payments, but even then it's not really 'recurring' in the useful sense. What I need is cross-month pattern detection - that's when I know something truly requires a domain record."*

**Proposed Solution:** Create a **central Transaction ledger** that persists across all imports, enabling:
- **True recurring detection:** "This payee appears monthly for the past 6 imports"
- **Smart duplicate handling:** "This transaction already exists (same date + amount + description)"
- **Entry reconciliation:** "10 new transactions, 5 already have records, 5 need review"
- **Pattern learning:** "British Gas always maps to Property > Utility - suggest automatically"

This shifts Bank Import from a **stateless tool** to a **core financial data repository**.

---

## Requirements

### Functional Requirements

**FR1: Central Transaction Ledger**
The system shall maintain a persistent `Transaction` collection that stores ALL bank transactions from ALL imports for each user, enabling cross-statement pattern analysis.

**FR2: Duplicate Transaction Detection**
The system shall prevent duplicate transactions using a composite key of `amount + description`, allowing recurring payments (e.g., monthly Direct Debits) to be stored with different dates.

**FR3: Import Session Tracking**
The system shall track which monthly statement periods have been imported, displaying a visual calendar/timeline showing imported months (e.g., "Jan 2025 ✅, Feb 2025 ✅, Mar 2025 ⏳").

**FR4: Duplicate Import Prevention**
The system shall detect duplicate PDF uploads using file hash and prevent re-importing the same monthly statement, showing message: "This statement (Jan 2025) was already imported on [date]."

**FR5: Transaction Status Management**
Each transaction shall have a status:
- **Pending** - New transaction awaiting user review
- **Record Created** - Domain record has been created from this transaction
- **Ignored** - User marked as not relevant (e.g., one-time purchases)

**FR6: Transaction History View**
The system shall provide a master transaction list view with filters:
- Show all transactions across all imports
- Filter by status (Pending/Record Created/Ignored)
- Filter by date range or import session
- Display: Date, Payee, Amount, Status, Linked Record (if created)

**FR7: Pattern Recognition & Learning**
The system shall detect recurring payment patterns across multiple imports by analyzing:
- Similar `description` values (fuzzy matching for "British Gas" vs "BRITISH GAS LTD")
- Similar `amount` values (±10% tolerance for price changes)
- Suggest domain record creation based on detected patterns

**FR8: Smart Record Suggestions**
When processing new transactions, the system shall:
- Match against historical patterns
- Suggest domain and record type (e.g., "British Gas £85 → Property > Utility Bill")
- Pre-populate record creation form with suggested values
- Require user confirmation before creating records (never auto-create)

**FR9: Transaction-to-Record Linking**
Each transaction that creates a domain record shall:
- Store reference to created record (`createdRecordId`, `createdRecordDomain`)
- Mark status as `record_created`
- Display link to domain record in transaction list

**FR10: Import Session Metadata**
Each `ImportSession` shall track:
- Filename, upload date, file hash (SHA-256)
- Statement period (start/end dates from PDF)
- Transaction count (total parsed)
- Processing status (new/duplicate/completed)
- References to transactions in central ledger (`transaction_refs`)

**FR11: Manual Transaction Ignore**
Users shall be able to mark transactions as "Not Relevant" with reasons:
- One-time purchase
- Personal transaction (not household)
- Already covered by existing record
- Other (free text)

**FR12: Import History Dashboard**
Bank Import page shall display:
- Calendar/timeline of imported months
- Summary stats per month (transactions, records created, pending)
- Click month → view transactions from that import session

### Non-Functional Requirements

**NFR1: Performance - Transaction Storage**
The central Transaction ledger shall support storage of 10,000+ transactions per user without performance degradation in queries or filtering.

**NFR2: Duplicate Detection Speed**
Duplicate transaction checking (amount + description matching) shall complete within 500ms for imports containing up to 500 transactions.

**NFR3: Pattern Recognition Accuracy**
Recurring payment pattern detection shall achieve ≥85% accuracy for common UK providers (utilities, insurance, council tax) based on historical transaction data.

**NFR4: Data Retention**
Transaction data shall be retained indefinitely to support:
- Pattern learning improvement over time
- Future budget planning features
- Historical financial analysis

**NFR5: MongoDB Storage Efficiency**
Transaction storage shall use MongoDB indexes on `user`, `amount`, `description`, `date` to optimize query performance within Atlas M0 free tier limits.

**NFR6: Backwards Compatibility**
Existing `ImportSession` model shall be preserved for current functionality, with transactions migrated from embedded structure to central ledger collection.

### Compatibility Requirements

**CR1: Existing Bank Import Preservation**
Current Bank Import functionality (PDF parsing, HSBC multi-line support, domain suggestion) shall continue to work without breaking changes during migration.

**CR2: ImportSession Model Compatibility**
Existing `ImportSession` documents shall be migrated to reference `Transaction` collection instead of embedding transactions, preserving all historical import metadata.

**CR3: Domain Record Integration**
Transaction-to-domain-record linking shall work with all 8 existing domain models without requiring schema changes to domain records.

**CR4: UI Consistency**
New transaction history views shall maintain existing premium design system (Swiss spa aesthetic, Lucide icons, Inter font).

---

## User Interface Enhancement Goals

### Integration with Existing UI

The Transaction Ledger system will integrate seamlessly with the **existing Bank Import premium design**:

**Design System Elements to Preserve:**
- **Visual Aesthetic:** Swiss spa design language maintained in all new transaction views
- **Typography:** Inter font family with established weight hierarchy
- **Icons:** Lucide React icons (Calendar, CheckCircle, XCircle, Clock, TrendingUp)
- **Color Palette:** Professional color scheme from premium transformation
- **Component Patterns:** Reuse existing Modal, Button, Table, Badge components

**New Transaction-Specific Elements:**
- **Import Timeline:** Calendar/timeline visualization showing imported months
- **Transaction Status Badges:** Visual indicators (✅ Created, ⏳ Pending, ❌ Ignored)
- **Pattern Confidence Indicators:** Visual confidence scores for pattern matching (85% = Strong Match)
- **Duplicate Warnings:** Inline alerts when duplicate statements detected

### Modified/New Screens and Views

#### **1. Bank Import Page (Major Enhancement)**

**Current State:**
- Upload PDF → Parse → View transactions in session → Create records

**Enhanced State:**

**A. Import History Section (NEW):**
- Calendar/timeline showing imported months with visual indicators
- Layout: `[2024] Nov ✅ Dec ✅ [2025] Jan ✅ Feb ✅ Mar ⏳ Apr ⏳`
- Click month → filter transaction table to that import session
- Summary stats: "12 imports, 450 transactions, 85 records created"

**B. Transaction Table (ENHANCED):**
- Shows ALL transactions (not just current session) with pagination
- Filter controls:
  - Status dropdown (All/Pending/Created/Ignored)
  - Date range picker
  - Import session selector (dropdown of months)
  - Search by payee/description (debounced)
- Status column with color-coded badges:
  - ✅ Green "Record Created" (with link to domain record)
  - ⏳ Orange "Pending Review"
  - ❌ Gray "Ignored" (hover shows reason)
  - 🔄 Blue "Recurring Pattern" (if matched)
- Action buttons contextual to status:
  - Pending: "Create Record" + "Ignore"
  - Record Created: "View Record" + "Unlink"
  - Ignored: "Undo Ignore"
- Bulk operations: Multi-select checkboxes, "Ignore Selected" action

**C. Duplicate Detection UI (NEW):**
- When uploading duplicate PDF: Modal displays
  - Message: "This statement was already imported"
  - Details: Original import date, transaction count, statement period
  - Actions: "View Original Import" or "Cancel Upload"
  - No "Import Anyway" option (prevent accidental duplicates)

#### **2. Transaction History Page (NEW)**

**Route:** `/transactions`
**Navigation:** Add "Transactions" link to main menu

**Layout:**

**Header Section:**
- Title: "Transaction History"
- Summary: Total count, date range, status breakdown
- Stats: "450 total | 85 pending | 320 records created | 45 ignored"

**Filter Panel (Left Sidebar):**
- Status filter (All/Pending/Created/Ignored)
- Date range picker
- Import session selector (dropdown of months)
- Search box (payee/description)
- "Clear Filters" button

**Transaction Table (Center):**
- Columns: Date, Payee, Amount, Status, Linked Record, Actions
- Sortable by date, amount
- Pagination: 50 transactions per page
- Click row → expand inline to show:
  - Full description, reference, balance
  - Original PDF text
  - Pattern info (if matched): Frequency, confidence, similar transactions
  - Actions: Create Record, Ignore, View in Import Session

**Pattern Insights Panel (Right Sidebar):**
- "Detected Patterns: 12"
- List of top recurring patterns:
  - British Gas - Monthly - 92% confidence - Suggest: Property > Utility
  - Netflix - Monthly - 88% confidence - Suggest: Services > Streaming
  - Car Insurance - Annual - 95% confidence - Suggest: Vehicles > Insurance
- "Create Record" button per pattern (batch create from all matching transactions)

#### **3. Import Timeline Component (NEW)**

**Visual Design:**
```
Import History Timeline
[2024]  Nov ✅  Dec ✅
[2025]  Jan ✅  Feb ✅  Mar ⏳  Apr ⏳  May ⏳  ...
```

**Interaction:**
- Hover month → tooltip: "Feb 2025: Imported on 15 Feb 2025 | 45 transactions | 12 records created | 5 pending"
- Click month → filter transaction table to that period
- Visual states:
  - ✅ Green checkmark = Imported (statement exists)
  - ⏳ Gray = Not imported yet (future or past month)
  - 🔄 Yellow spinner = Processing (if upload in progress)

#### **4. Pattern Suggestion Modal (ENHANCED)**

**Current:** Basic "Create Entry from Transaction" modal

**Enhanced:**

**Pattern Match Indicator:**
- Badge: "🔄 Recurring Pattern Detected (85% confidence)"
- Historical context: "Similar transactions found in Jan, Feb, Mar 2025 (£85 each)"

**Suggested Fields Pre-populated:**
- Domain: Property (dropdown, editable)
- Record Type: Utility Bill (dropdown, editable)
- Provider: British Gas (extracted from description)
- Amount: £85 (from transaction)
- Renewal frequency: Monthly (inferred from pattern)

**Pattern Learning Controls:**
- Checkbox: "Apply to all similar transactions in this import" (batch create)
- Checkbox: "Remember this pattern for future imports" (saves pattern rule)
- Override dropdown: User can change domain/recordType (system learns from overrides)

**Batch Preview:**
- If "Apply to all similar" checked:
  - Show list: "3 similar transactions will be processed"
  - List transactions: Feb 15 £85, Mar 15 £85, Apr 15 £85
  - Confirmation: "Create 3 records from this pattern?"

#### **5. Transaction Status Indicators**

**Visual Design:**
```
✅ Record Created    - Green badge, link to domain record
⏳ Pending Review    - Orange badge, "Create Record" button
❌ Ignored           - Gray badge, hover shows reason
🔄 Recurring Pattern - Blue badge, shows confidence %
⚠️  Duplicate        - Yellow badge, "Already imported" tooltip
```

**Badge Components:**
- Use existing Badge component from design system
- Color variants: success (green), warning (orange), secondary (gray), info (blue)
- Hover tooltips for additional context

### UI Consistency Requirements

**UC1: Visual Consistency**
All transaction views shall use existing Inter font, Lucide React icons, color palette, and spacing tokens from premium design system.

**UC2: Component Reuse**
Transaction tables, modals, and forms shall reuse existing `Modal`, `Button`, `Input`, `Badge`, `Table` components.

**UC3: Responsive Design**
Transaction history and import timeline shall adapt to mobile/tablet/desktop breakpoints using existing responsive patterns.

**UC4: Loading States**
Transaction processing, pattern matching, and duplicate detection shall show appropriate loading spinners and skeleton states.

**UC5: Error Handling**
Duplicate import warnings, parsing errors, and pattern matching failures shall use existing error message patterns and toast notifications.

**UC6: Accessibility**
Transaction status badges, import timeline, and filter controls shall maintain ARIA labels and keyboard navigation support.

**UC7: Empty States**
Transaction history with no data shall show appropriate empty state messages:
- "No transactions yet - Upload your first bank statement"
- "No pending transactions - All transactions have been processed"
- "No patterns detected yet - Upload more statements to detect recurring payments"

---

## Technical Constraints and Integration Requirements

### Existing Technology Stack

**Languages:**
- **Backend:** Node.js v18+ (JavaScript/CommonJS)
- **Frontend:** TypeScript v5.x (strict mode)

**Frameworks:**
- **Backend:** Express v4.x (REST API server)
- **Frontend:** React v18+ with Vite v5.x (build tool)
- **Database:** MongoDB v6.x with Mongoose ODM

**Database:**
- **MongoDB Atlas M0 (free tier - 512MB storage)**
- **Mongoose v7.x** for schema definitions and ODM
- **Collections:** Users, Domain Records (8 collections), ImportSessions, **Transaction (NEW)**

**External Dependencies:**
- `mongoose` - MongoDB ODM
- `pdf2json` - PDF parsing (HSBC multi-line support)
- `fuzzball` - Fuzzy string matching for pattern detection
- `crypto` - File hashing for duplicate detection (SHA-256)

### Integration Approach

#### **Database Integration Strategy**

**New Transaction Collection:**

```javascript
Transaction Schema:
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required, indexed),
  importSession: ObjectId (ref: 'ImportSession', required, indexed),

  // Transaction Details
  date: Date (required, indexed),
  description: String (required, text indexed),
  reference: String,
  amount: Number (required, indexed),
  balance: Number,
  originalText: String,

  // Duplicate Detection
  transactionHash: String (indexed, unique per user),
  // SHA-256 hash of: user._id + amount + description

  // Status & Linkage
  status: Enum ['pending', 'record_created', 'ignored'],
  recordCreated: Boolean (default: false),
  createdRecordId: ObjectId,
  createdRecordDomain: String,
  createdAt: Date,

  // Ignore Functionality
  ignoredReason: String,
  ignoredAt: Date,

  // Pattern Matching
  patternMatched: Boolean (default: false),
  patternConfidence: Number (0-1),
  patternId: ObjectId (ref: 'Pattern'),

  timestamps: true
}
```

**ImportSession Modification:**

```javascript
ImportSession Schema (MODIFIED):
{
  // Existing fields preserved
  user: ObjectId,
  filename: String,
  file_size: Number,
  file_hash: String, // PDF file hash
  statement_hash: String, // NEW - For duplicate statement detection

  status: Enum,
  processing_stage: Enum,

  bank_name: String,
  account_number: String,
  statement_period: { start_date, end_date },

  // BREAKING CHANGE: Remove embedded transactions
  // transactions: [TransactionSchema], // DEPRECATED - Remove in migration

  // NEW: References to Transaction collection
  transaction_refs: [{ type: ObjectId, ref: 'Transaction' }],

  // Keep recurring_payments for backwards compatibility
  recurring_payments: [RecurringPaymentSuggestionSchema],

  statistics: {
    total_transactions: Number,
    new_transactions: Number, // NEW - After duplicate detection
    duplicate_transactions: Number, // NEW
    recurring_detected: Number,
    records_created: Number // NEW
  },

  timestamps: true
}

// Virtual field for backwards compatibility
ImportSessionSchema.virtual('transactions', {
  ref: 'Transaction',
  localField: 'transaction_refs',
  foreignField: '_id'
});
```

**Pattern Collection (NEW):**

```javascript
Pattern Schema:
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),

  // Pattern Details
  payee: String (normalized description),
  normalizedDescription: String,
  frequency: Enum ['monthly', 'quarterly', 'annual', 'irregular'],

  // Amount Analysis
  averageAmount: Number,
  amountVariance: Number (percentage),
  minAmount: Number,
  maxAmount: Number,

  // Confidence Metrics
  confidence: Number (0-1),
  occurrences: Number,
  firstSeen: Date,
  lastSeen: Date,

  // Domain Suggestion
  suggestedDomain: String,
  suggestedRecordType: String,
  suggestionAccepted: Boolean,
  userOverrides: Number (count),

  // Pattern Learning
  autoSuggest: Boolean (default: false),
  userConfirmed: Boolean,

  // Transaction References
  transactions: [ObjectId] (ref: 'Transaction'),

  timestamps: true
}
```

**Migration Strategy:**

1. **Backup Phase:**
   - Create full backup of ImportSession collection
   - Export to `backups/import-sessions-[timestamp].json`

2. **Transaction Extraction:**
   - Script: `src/scripts/migrateTransactions.js`
   - For each ImportSession document:
     - Extract embedded `transactions` array
     - Create Transaction document for each transaction
     - Calculate `transactionHash` (SHA-256 of user + amount + description)
     - Link: `importSession` field → ImportSession._id
   - Batch processing: 1000 transactions per batch

3. **ImportSession Update:**
   - Update each ImportSession:
     - Set `transaction_refs` array with created Transaction._ids
     - Remove `transactions` embedded array
   - Update `statistics` with transaction counts

4. **Validation:**
   - Count embedded transactions before migration
   - Count Transaction documents after migration
   - Verify counts match (integrity check)
   - Test API endpoints with virtual field

5. **Rollback Plan:**
   - Keep backup until migration verified in production
   - Rollback script: `src/scripts/rollbackTransactionMigration.js`
   - Restores ImportSession documents from backup

**MongoDB Indexes:**

```javascript
Transaction Indexes:
- { user: 1, date: -1 }                    // User transaction history
- { user: 1, transactionHash: 1 }          // Duplicate detection (compound unique)
- { user: 1, status: 1 }                   // Status filtering
- { user: 1, description: 'text' }         // Text search
- { importSession: 1 }                     // Session filtering
- { patternId: 1 }                         // Pattern lookup

ImportSession Indexes:
- { user: 1, statement_hash: 1 }           // Duplicate statement detection
- { user: 1, createdAt: -1 }               // Timeline queries

Pattern Indexes:
- { user: 1, normalizedDescription: 1 }    // Pattern matching
- { user: 1, confidence: -1 }              // High-confidence patterns first
```

**Storage Estimates:**

```
Transaction Document Size:
- Average: ~500 bytes per transaction (with indexes)
- 10,000 transactions = ~5MB
- 100,000 transactions = ~50MB (10 years of monthly imports)

Total Estimated Storage:
- Existing domain data: ~50MB
- Transaction ledger (5 years): ~25MB
- ImportSessions: ~5MB
- Patterns: ~1MB
- Total: ~81MB (well within 512MB Atlas M0 limit)
```

#### **API Integration Strategy**

**New Endpoints:**

```
Transaction Management:
GET    /api/transactions                       // List all user transactions
  Query params: status, startDate, endDate, importSession, search, page, limit
  Response: { transactions: [...], pagination: {...} }

GET    /api/transactions/:id                   // Get specific transaction
  Response: { transaction: {...}, pattern: {...} }

PUT    /api/transactions/:id/ignore            // Mark transaction as ignored
  Body: { reason: String }
  Response: { transaction: {...} }

PUT    /api/transactions/:id/status            // Update transaction status
  Body: { status: Enum, recordId: ObjectId, domain: String }
  Response: { transaction: {...} }

DELETE /api/transactions/:id/ignore            // Undo ignore (restore to pending)
  Response: { transaction: {...} }

Import Session Enhancement:
POST   /api/import/upload                      // Enhanced with duplicate detection
  Response: {
    sessionId,
    duplicateDetected: Boolean,
    duplicateSession: {...} | null,
    newTransactionCount,
    duplicateTransactionCount
  }

GET    /api/import/sessions                    // List sessions with stats
  Response: { sessions: [...], pagination: {...} }

GET    /api/import/timeline                    // Get import history timeline
  Response: {
    months: [
      { month: '2025-01', imported: true, sessionId, transactionCount },
      { month: '2025-02', imported: true, sessionId, transactionCount },
      { month: '2025-03', imported: false }
    ]
  }

GET    /api/import/sessions/:id/transactions   // Get transactions for session
  Response: { sessionId, transactions: [...] }

Pattern Detection:
GET    /api/patterns/recurring                 // Get detected recurring patterns
  Response: { patterns: [...], totalCount }

POST   /api/patterns/suggest                   // Suggest domain record from pattern
  Body: { transactionId: ObjectId }
  Response: {
    pattern: {...},
    suggestion: { domain, recordType, fields: {...} }
  }

POST   /api/patterns/apply                     // Apply pattern to create records
  Body: {
    patternId: ObjectId,
    transactionIds: [ObjectId],
    domain: String,
    recordType: String,
    remember: Boolean
  }
  Response: {
    createdRecords: [...],
    updatedTransactions: [...],
    pattern: {...}
  }

GET    /api/patterns/:id/transactions          // Get all transactions matching pattern
  Response: { pattern: {...}, transactions: [...] }
```

**Modified Endpoints:**

```
Enhanced Import Controller:
POST   /api/import/upload
  1. Calculate PDF file hash (SHA-256)
  2. Check for duplicate statement: user + statement_hash
  3. If duplicate: Return { duplicateDetected: true, duplicateSession: {...} }
  4. Parse PDF → Extract transactions
  5. For each transaction:
     - Calculate transactionHash (user + amount + description)
     - Check for duplicate: Find existing Transaction with same hash
     - Create Transaction document (if not duplicate)
     - Link to ImportSession via transaction_refs
  6. Run pattern detection in background
  7. Return: { sessionId, newTransactionCount, duplicateTransactionCount }
```

#### **Frontend Integration Strategy**

**Component Architecture:**

```
New Components:
web/src/components/bank-import/
  ├── ImportTimeline.tsx               // Calendar visualization of imported months
  ├── TransactionTable.tsx             // Enhanced table with filters, pagination
  ├── TransactionStatusBadge.tsx       // Status indicators (✅⏳❌🔄)
  ├── TransactionFilters.tsx           // Filter controls panel
  ├── PatternSuggestionModal.tsx       // Enhanced pattern matching modal
  ├── DuplicateWarningModal.tsx        // Duplicate import alert
  ├── PatternInsightsPanel.tsx         // Sidebar showing detected patterns
  └── TransactionDetailRow.tsx         // Expandable row with full details

New Pages:
web/src/pages/
  └── TransactionHistory.tsx           // Dedicated transaction ledger view

Enhanced Existing:
web/src/pages/BankImport.tsx           // Add timeline + enhanced table
web/src/components/CreateEntryFromTransactionModal.tsx // Add pattern suggestions
```

**State Management:**

```typescript
New Custom Hooks:
useTransactions(filters)               // Fetch/filter transactions with pagination
  - Params: { status, dateRange, importSession, search, page, limit }
  - Returns: { transactions, loading, error, pagination, refetch }

useImportTimeline()                    // Get import history calendar
  - Returns: { months, loading, error }

usePatternDetection()                  // Get recurring patterns
  - Returns: { patterns, loading, error, refetch }

useTransactionStatus()                 // Manage status updates
  - Functions: markAsIgnored, markAsCreated, undoIgnore
  - Returns: { updating, error }

useDuplicateDetection(file)            // Check for duplicate before upload
  - Params: { file: File }
  - Returns: { isDuplicate, duplicateSession, checking }
```

**Data Flow:**

```
Upload Flow:
1. User selects PDF → useDuplicateDetection calculates hash
2. Check: POST /api/import/check-duplicate { fileHash }
3. If duplicate → Show DuplicateWarningModal
4. If not duplicate → POST /api/import/upload
5. Backend: Parse PDF → Create Transaction documents
6. Poll: GET /api/import/sessions/:id/status (check processing)
7. When complete → Fetch transactions: GET /api/transactions?importSession=:id
8. Display in TransactionTable with status badges

Transaction Processing Flow:
1. User clicks "Create Record" on transaction row
2. Check pattern match: GET /api/patterns/suggest { transactionId }
3. Open PatternSuggestionModal with:
   - Pre-populated domain, recordType (from pattern)
   - Historical context (similar transactions)
   - Batch creation option (apply to all similar)
4. User confirms/edits → POST /api/domains/:domain/records
5. Update transaction: PUT /api/transactions/:id/status { status: 'record_created', recordId, domain }
6. Refresh TransactionTable → Show ✅ status badge

Pattern Detection Flow:
1. Background job after import: Analyze all user transactions
2. Detect recurring patterns: Similar description + amount + frequency
3. Create/update Pattern documents
4. Link transactions to patterns: transaction.patternId
5. Frontend: usePatternDetection() fetches patterns
6. Display in PatternInsightsPanel with confidence scores
```

### Code Organization and Standards

**File Structure:**

```
Backend (src/):
models/
  ├── Transaction.js                   // NEW - Transaction model
  ├── Pattern.js                       // NEW - Pattern model
  ├── ImportSession.js                 // MODIFIED - Remove embedded transactions
  └── domain/*.js                      // UNCHANGED

controllers/
  ├── ImportController.js              // MODIFIED - Use Transaction model
  ├── TransactionController.js         // NEW - Transaction CRUD
  └── PatternController.js             // NEW - Pattern detection endpoints

routes/
  ├── import.js                        // MODIFIED - Enhanced endpoints
  ├── transactions.js                  // NEW - Transaction endpoints
  └── patterns.js                      // NEW - Pattern endpoints

services/
  ├── patternDetector.js               // NEW - Cross-import pattern detection
  ├── duplicateDetector.js             // NEW - Transaction deduplication
  ├── transactionHasher.js             // NEW - Hash calculation utilities
  └── recurringDetector.js             // MODIFIED - Use Transaction collection

scripts/
  ├── migrateTransactions.js           // NEW - Migration script
  └── rollbackTransactionMigration.js  // NEW - Rollback script

Frontend (web/src/):
components/bank-import/                // NEW directory (7 components)
pages/TransactionHistory.tsx           // NEW page
hooks/
  ├── useTransactions.ts               // NEW hook
  ├── useImportTimeline.ts             // NEW hook
  ├── usePatternDetection.ts           // NEW hook
  └── useTransactionStatus.ts          // NEW hook
```

**Naming Conventions:**

- **Transaction Status:** `pending`, `record_created`, `ignored` (lowercase with underscore)
- **Pattern Frequency:** `monthly`, `quarterly`, `annual`, `irregular`
- **Pattern Confidence:** 0.0 to 1.0 (decimal percentage, e.g., 0.85 = 85%)
- **Hash Format:** SHA-256 hex string (64 characters)
- **Date Format:** ISO 8601 (YYYY-MM-DD) for API, DD/MM/YYYY for UI

**Coding Standards:**

- **TypeScript:** Strict mode enabled, explicit return types for functions
- **Error Handling:** Try-catch with meaningful error messages, centralized error middleware
- **Validation:** Mongoose schema validation + express-validator for API endpoints
- **Comments:** JSDoc for public functions, inline comments for complex logic
- **Testing:** Jest for backend unit tests, React Testing Library for frontend

### Deployment and Operations

**Build Process Integration:**

- No changes to existing Vite frontend build process
- Backend: No compilation required (Node.js)
- Migration: Run `node src/scripts/migrateTransactions.js` before deployment

**Deployment Strategy:**

```
Deployment Steps (Staged Rollout):
1. Deploy to Vercel staging environment
2. Run migration script against MongoDB Atlas staging database
3. Verify:
   - Transaction count matches embedded count
   - API endpoints return correct data
   - Duplicate detection works
   - Pattern detection runs successfully
4. Test critical flows:
   - Upload PDF → Parse → Create transactions
   - Detect duplicates → Block re-import
   - Create record from transaction → Link correctly
5. Deploy to production environment
6. Run production migration (with backup!)
7. Monitor for 48 hours:
   - API response times
   - MongoDB storage usage
   - Error logs
8. Mark migration complete
```

**Monitoring and Logging:**

```javascript
Storage Monitoring (Enhanced):
// Check MongoDB storage usage
async function checkStorageUsage() {
  const stats = await mongoose.connection.db.stats();
  const usageMB = stats.dataSize / (1024 * 1024);

  const transactionStats = await Transaction.collection.stats();
  const transactionMB = transactionStats.size / (1024 * 1024);

  console.log(`Total storage: ${usageMB}MB / 512MB`);
  console.log(`Transaction collection: ${transactionMB}MB`);

  if (usageMB > 400) {
    console.warn(`⚠️  Approaching storage limit: ${usageMB}MB / 512MB`);
  }
}

Performance Monitoring:
// Log duplicate detection time
const startTime = Date.now();
const duplicates = await detectDuplicates(transactions);
const duration = Date.now() - startTime;
console.log(`Duplicate detection: ${duration}ms for ${transactions.length} transactions`);

// Log pattern matching time
const patternStart = Date.now();
const patterns = await detectPatterns(userId);
const patternDuration = Date.now() - patternStart;
console.log(`Pattern detection: ${patternDuration}ms for ${patterns.length} patterns`);

// Alert if slow
if (duration > 500) {
  console.warn(`⚠️  Duplicate detection slow: ${duration}ms (target <500ms)`);
}
```

**Configuration Management:**

```javascript
Environment Variables (Unchanged):
- MONGODB_URI (existing)
- All existing env vars preserved

Migration Configuration:
- MIGRATION_BATCH_SIZE=1000          // Process transactions in batches
- MIGRATION_DRY_RUN=true             // Test before actual migration
- MIGRATION_BACKUP_PATH=./backups   // Backup location

Feature Flags (Optional):
- ENABLE_PATTERN_DETECTION=true     // Toggle pattern detection
- ENABLE_DUPLICATE_DETECTION=true   // Toggle duplicate checking
- PATTERN_CONFIDENCE_THRESHOLD=0.85 // Minimum confidence for suggestions
```

### Risk Assessment and Mitigation

**Technical Risks:**

**TR1: Data Migration Complexity**
- **Risk:** Migrating embedded transactions from ImportSession to separate collection could fail or corrupt data
- **Impact:** HIGH - Data loss or inconsistent state
- **Likelihood:** MEDIUM
- **Mitigation:**
  - Create full backup before migration (export to JSON)
  - Dry-run mode validates migration without writing
  - Batch processing prevents memory issues
  - Transaction-based approach (all-or-nothing)
  - Integrity check: Verify transaction count matches before/after
  - Rollback script ready if migration fails
  - Keep original ImportSession documents until production verified
- **Contingency:** Restore from backup, fix migration script, retry

**TR2: MongoDB Storage Limit**
- **Risk:** Transaction ledger grows beyond 512MB Atlas free tier
- **Impact:** LOW - Affordable upgrade path
- **Likelihood:** LOW
- **Mitigation:**
  - Storage monitoring dashboard (alert at 400MB)
  - Estimate: 10 years of monthly imports ≈ 120MB (well within limit)
  - Upgrade path to Atlas M10 ($9/month) if needed
  - Data retention policy (optional): Archive transactions older than 5 years
- **Contingency:** Upgrade to M10 tier ($9/month)

**TR3: Pattern Detection Performance**
- **Risk:** Analyzing thousands of transactions for patterns could be slow, blocking import workflow
- **Impact:** MEDIUM - Poor user experience
- **Likelihood:** MEDIUM
- **Mitigation:**
  - Implement MongoDB indexes on description + amount
  - Background jobs for pattern analysis (don't block import)
  - Cache pattern results in Pattern collection
  - Batch processing: Analyze 1000 transactions at a time
  - Time limit: Skip pattern detection if takes >5s
- **Contingency:** Disable pattern detection if performance issues, run offline

**Integration Risks:**

**IR1: Breaking Change - ImportSession Schema**
- **Risk:** Removing embedded transactions breaks existing code expecting `session.transactions`
- **Impact:** HIGH - Application breaks
- **Likelihood:** HIGH
- **Mitigation:**
  - Add virtual field `session.transactions` for backwards compatibility
  - Update all references to use Transaction collection or virtual field
  - Comprehensive testing before deployment (unit + integration tests)
  - Test existing Bank Import flows in staging
  - Code review: Search codebase for all `session.transactions` references
- **Contingency:** Rollback migration, add virtual field, redeploy

**IR2: Duplicate Detection False Positives**
- **Risk:** `amount + description` matching incorrectly flags legitimate transactions as duplicates (e.g., two monthly payments with same amount)
- **Impact:** LOW - User confusion, missed transactions
- **Likelihood:** MEDIUM
- **Mitigation:**
  - Include `date` in hash for same-day duplicates only
  - Allow user override: "Import anyway" button (disable for file-level duplicates)
  - Log false positives for algorithm refinement
  - Fuzzy amount matching: Allow ±£0.01 variance (floating point rounding)
  - User feedback: "Report incorrect duplicate" button
- **Contingency:** Adjust duplicate detection algorithm based on feedback

**IR3: Pattern Learning Accuracy**
- **Risk:** Pattern detection suggests wrong domain/record type, eroding user trust
- **Impact:** LOW - User annoyance, manual correction
- **Likelihood:** MEDIUM
- **Mitigation:**
  - User always confirms suggestions (never auto-create records)
  - Track suggestion accuracy metrics (accepted vs rejected)
  - Confidence threshold: Only suggest if ≥85% confident
  - Learn from user overrides: Reduce confidence for rejected patterns
  - Fuzzy matching rules based on UK provider database
  - Manual pattern management: Settings page to edit/delete patterns
- **Contingency:** Disable auto-suggestions, allow manual pattern creation only

**Deployment Risks:**

**DR1: Migration Script Failure**
- **Risk:** Migration script fails midway, leaving database in inconsistent state (some transactions migrated, others not)
- **Impact:** HIGH - Data inconsistency
- **Likelihood:** MEDIUM
- **Mitigation:**
  - MongoDB session support for atomic operations (transaction-based migration)
  - Dry-run mode validates migration logic before execution
  - Batch processing with checkpoints (resume from last batch if failure)
  - Comprehensive logging: Every action logged to `migration-log-[timestamp].json`
  - Validation step: Count transactions before/after, verify match
  - Test migration on copy of production data in staging
- **Contingency:** Rollback script restores ImportSession documents from backup

**DR2: Performance Degradation**
- **Risk:** New Transaction queries slow down Bank Import page, frustrating users
- **Impact:** MEDIUM - Poor UX
- **Likelihood:** LOW
- **Mitigation:**
  - Implement proper MongoDB indexes **before** deployment
  - Load testing with 10,000+ transaction dataset
  - Pagination: Limit to 50 transactions per page
  - Query optimization: Select only needed fields (avoid `.select('*')`)
  - Caching: Cache frequently accessed data (Redis optional)
  - Monitor API response times: Alert if >2s
- **Contingency:** Add indexes, optimize queries, implement caching

**DR3: User Confusion - UI Complexity**
- **Risk:** New transaction management UI confuses users (too many features, unclear workflow)
- **Impact:** MEDIUM - Reduced adoption
- **Likelihood:** LOW
- **Mitigation:**
  - Maintain existing Bank Import workflow (upload PDF → create records)
  - Add features progressively (timeline, then filters, then pattern insights)
  - Empty states with helpful guidance ("Upload first statement to get started")
  - Tooltips on new features (import timeline, pattern badges)
  - User testing with spouse before production release
- **Contingency:** Simplify UI, hide advanced features behind "Advanced" toggle

**Mitigation Strategies Summary:**

1. **Comprehensive Backup:** Full export before migration (`.json` backup)
2. **Dry-Run Validation:** Test migration without writing to database
3. **Incremental Deployment:** Staging → Production with monitoring
4. **Monitoring Dashboard:** Storage usage, API performance, error rates
5. **Rollback Plan:** Documented and tested restoration procedure
6. **User Feedback Loop:** Track pattern suggestion accuracy, adjust algorithm
7. **Performance Testing:** Load test with 10,000+ transactions before deployment

---

## Epic and Story Structure

### Epic Approach

**Epic Structure Decision:** **Single Comprehensive Epic** - "Transaction Ledger & Pattern Intelligence"

**Rationale:**

This brownfield enhancement should be structured as a **single epic** because:

1. **Cohesive Data Model Change:** Transaction ledger, pattern detection, and UI enhancements are tightly coupled around the same architectural shift
2. **Shared Foundation:** Transaction collection must exist before pattern detection or UI improvements can function
3. **Incremental Value Delivery:** Stories can be sequenced to deliver value progressively (data model → migration → pattern detection → UI polish)
4. **Avoids Artificial Boundaries:** Splitting into multiple epics (Data Model, Pattern Detection, UI) creates dependencies that complicate planning
5. **Migration Context:** All work is part of transforming Bank Import from stateless to stateful - one logical unit of change

**Story Sequencing Strategy:**
- **Foundation First:** Transaction model + migration (enables everything else)
- **Core Workflow:** Duplicate detection + basic transaction management
- **Intelligence Layer:** Pattern detection + smart suggestions
- **UX Polish:** Timeline visualization + transaction history page

---

## Stories (6 Total)

### **Story 5.1: Foundation - Transaction Model & Database Migration**

**As a** developer,
**I want** to create the Transaction collection and migrate existing embedded transactions,
**so that** transaction data persists independently of import sessions.

**Acceptance Criteria:**

1. **Transaction Model Created:**
   - Mongoose schema defined with all required fields (user, importSession, date, description, amount, status, etc.)
   - Indexes created: `{ user: 1, transactionHash: 1 }`, `{ user: 1, date: -1 }`, `{ user: 1, status: 1 }`
   - `transactionHash` field calculates SHA-256 of `amount + description` for duplicate detection
   - Status enum: `pending`, `record_created`, `ignored`

2. **Migration Script Implemented:**
   - Script: `src/scripts/migrateTransactions.js`
   - Reads all existing ImportSession documents
   - Extracts embedded `transactions` arrays
   - Creates Transaction documents in new collection
   - Updates ImportSession with `transaction_refs` array (ObjectId references)
   - Dry-run mode: `MIGRATION_DRY_RUN=true` validates without writing
   - Batch processing: 1000 transactions per batch to avoid memory issues

3. **Migration Safety:**
   - Creates backup of ImportSession collection before migration
   - Exports to `backups/import-sessions-[timestamp].json`
   - Validates transaction count matches before/after (integrity check)
   - Rollback script: `src/scripts/rollbackTransactionMigration.js`
   - Migration logs all actions to `migration-log-[timestamp].json`

4. **ImportSession Model Updated:**
   - `transactions` array marked as deprecated (comments added)
   - `transaction_refs` field added: `[{ type: ObjectId, ref: 'Transaction' }]`
   - Virtual field `transactions` added for backwards compatibility (populates from Transaction collection)
   - Statement hash field added: `statement_hash` (for duplicate PDF detection)

5. **Testing:**
   - Migration tested on copy of production data (staging database)
   - Verify all existing ImportSessions have corresponding Transaction documents
   - Test API endpoints still work with virtual `transactions` field
   - Performance test: Query 10,000 transactions in <1s with indexes

**Integration Verification:**

- **IV1: Data Integrity** - Run migration on test database, verify transaction count matches embedded count, no data loss
- **IV2: Backwards Compatibility** - Existing Bank Import code using `session.transactions` still works via virtual field
- **IV3: Performance** - Transaction queries with indexes perform within acceptable limits (<500ms for filtered lists)

**Files to Create/Modify:**
- `src/models/Transaction.js` (NEW)
- `src/models/ImportSession.js` (MODIFY - add transaction_refs, virtual field)
- `src/scripts/migrateTransactions.js` (NEW)
- `src/scripts/rollbackTransactionMigration.js` (NEW)

**Estimated Effort:** 8-12 hours

---

### **Story 5.2: Duplicate Detection & Import Session Deduplication**

**As a** household administrator,
**I want** the system to prevent importing the same bank statement twice,
**so that** I don't create duplicate transactions or waste time reviewing the same data.

**Acceptance Criteria:**

1. **File-Level Duplicate Detection:**
   - On PDF upload, calculate SHA-256 hash of file contents
   - Check if `statement_hash` already exists for user's ImportSessions
   - If duplicate found: Return 409 Conflict with message: "This statement was already imported on [date]"
   - Include link to existing ImportSession in response

2. **Transaction-Level Duplicate Detection:**
   - When parsing PDF, calculate `transactionHash` for each transaction (SHA-256 of `user._id + amount + description`)
   - Query Transaction collection for matching `user + transactionHash`
   - Mark duplicate transactions with flag: `duplicate: true, originalTransactionId: <ObjectId>`
   - Display duplicate count in import summary: "45 transactions parsed, 5 duplicates skipped, 40 new"
   - Update ImportSession statistics: `new_transactions`, `duplicate_transactions`

3. **Duplicate Warning UI:**
   - Modal displays when duplicate statement detected
   - Shows: Original import date, transaction count, statement period
   - Options: "View Original Import" (navigates to session) or "Cancel Upload"
   - No "Import Anyway" option (prevent accidental duplicates)

4. **Import Timeline Indicator:**
   - Visual calendar showing imported months (Jan ✅, Feb ✅, Mar ⏳)
   - Hover tooltip: "Feb 2025: Imported on 15 Feb 2025, 45 transactions, 12 records created"
   - Clicking imported month navigates to that ImportSession detail view (filter transactions)

5. **Duplicate Handling Edge Cases:**
   - Same-day legitimate transactions (e.g., two Amazon purchases): Include date in hash
   - Partial statement uploads: Allow if statement period doesn't overlap
   - Amended statements (bank corrections): Allow user to delete original ImportSession and re-import

**Integration Verification:**

- **IV1: Duplicate Prevention** - Upload same PDF twice, verify second upload blocked with appropriate message
- **IV2: Transaction Deduplication** - Upload overlapping statement periods, verify only new transactions created
- **IV3: Timeline Accuracy** - Import multiple months, verify calendar shows correct months with accurate counts

**Files to Create/Modify:**
- `src/services/duplicateDetector.js` (NEW)
- `src/controllers/ImportController.js` (MODIFY - add duplicate detection)
- `web/src/components/bank-import/DuplicateWarningModal.tsx` (NEW)
- `web/src/components/bank-import/ImportTimeline.tsx` (NEW)
- `web/src/hooks/useDuplicateDetection.ts` (NEW)
- `web/src/hooks/useImportTimeline.ts` (NEW)

**Estimated Effort:** 6-8 hours

---

### **Story 5.3: Transaction Status Management & Ignore Functionality**

**As a** household administrator,
**I want** to mark transactions as "Not Relevant" or view their record creation status,
**so that** I can focus only on transactions requiring action.

**Acceptance Criteria:**

1. **Transaction Status Model:**
   - Status enum: `pending`, `record_created`, `ignored`
   - New transactions default to `pending`
   - Status updates via API: `PUT /api/transactions/:id/status`
   - Track status changes: `statusChangedAt`, `statusChangedBy`

2. **Ignore Transaction Feature:**
   - "Ignore" button in transaction table row
   - Modal prompts for reason: "One-time purchase", "Personal (not household)", "Already covered", "Other (specify)"
   - Updates transaction: `{ status: 'ignored', ignoredReason: '...', ignoredAt: Date }`
   - Ignored transactions shown with ❌ gray badge
   - "Undo Ignore" button to restore to `pending` status

3. **Transaction Table Enhancements:**
   - Status column with color-coded badges:
     - ✅ Green "Record Created" (with link to domain record)
     - ⏳ Orange "Pending Review"
     - ❌ Gray "Ignored" (hover shows reason tooltip)
   - Action buttons contextual to status:
     - Pending: "Create Record" + "Ignore"
     - Record Created: "View Record" + "Unlink"
     - Ignored: "Undo Ignore"

4. **Filter Controls:**
   - Status filter dropdown: "All", "Pending", "Record Created", "Ignored"
   - Date range picker (start date, end date)
   - Import session selector (dropdown of months)
   - Search by payee/description (debounced text input, 300ms delay)
   - Filter state persists in URL query params (`?status=pending&startDate=2025-01-01`)

5. **Bulk Actions:**
   - Checkbox column for multi-select
   - "Select All" checkbox in header (selects current page)
   - Bulk actions dropdown: "Ignore Selected", "Clear Selection"
   - Confirmation modal for bulk operations: "Ignore 12 transactions?"
   - Batch API request: `POST /api/transactions/bulk-ignore { transactionIds: [...], reason }`

**Integration Verification:**

- **IV1: Status Updates** - Mark transaction as ignored, verify status persists and displays correctly with badge
- **IV2: Filtering** - Apply multiple filters (status + date range), verify correct transactions shown
- **IV3: Bulk Operations** - Select 10 transactions, bulk ignore, verify all updated correctly and badges refresh

**Files to Create/Modify:**
- `src/controllers/TransactionController.js` (NEW)
- `src/routes/transactions.js` (NEW)
- `web/src/components/bank-import/TransactionTable.tsx` (ENHANCE existing)
- `web/src/components/bank-import/TransactionStatusBadge.tsx` (NEW)
- `web/src/components/bank-import/TransactionFilters.tsx` (NEW)
- `web/src/hooks/useTransactions.ts` (NEW)
- `web/src/hooks/useTransactionStatus.ts` (NEW)

**Estimated Effort:** 8-10 hours

---

### **Story 5.4: Cross-Import Pattern Detection & Recurring Payment Intelligence**

**As a** household administrator,
**I want** the system to detect recurring payment patterns across multiple imports,
**so that** I receive intelligent suggestions for creating domain records.

**Acceptance Criteria:**

1. **Pattern Detection Service:**
   - Service: `src/services/patternDetector.js`
   - Analyzes all user transactions (across all imports)
   - Groups transactions by similar description (fuzzy matching: 85% threshold using fuzzball)
   - Detects frequency: Monthly (±5 days), Quarterly (±7 days), Annual (±14 days)
   - Calculates confidence score based on:
     - Consistency of amount (±10% variance)
     - Regularity of frequency (standard deviation of intervals)
     - Number of occurrences (min 3 for pattern)

2. **Pattern Model:**
   - Created in Story 5.1 (Pattern schema defined)
   - Fields: payee, normalizedDescription, frequency, averageAmount, amountVariance, confidence, occurrences, suggestedDomain, suggestedRecordType
   - Confidence calculation: `(frequencyScore * 0.4) + (amountConsistency * 0.3) + (occurrenceCount * 0.3)`

3. **Pattern Detection API:**
   - `GET /api/patterns/recurring` - Returns detected patterns for user
   - `POST /api/patterns/suggest` - Suggests domain record from pattern (single transaction)
   - `POST /api/patterns/apply` - Applies pattern to create record + marks transactions
   - `GET /api/patterns/:id/transactions` - Get all transactions matching pattern

4. **Pattern Matching on Import:**
   - When new transactions imported, run pattern detection in background (async job)
   - Match against existing patterns (fuzzy description matching)
   - Update transaction with `patternMatched: true, patternConfidence: 0.85, patternId: <ObjectId>`
   - Display pattern badge in transaction table: "🔄 Recurring (Monthly - 85%)"

5. **Pattern Confidence Indicators:**
   - High confidence (≥0.85): Green badge "Strong Match"
   - Medium confidence (0.65-0.84): Yellow badge "Likely Match"
   - Low confidence (<0.65): Gray badge "Possible Match"
   - Tooltip shows: "Detected 6 times, average £85, monthly frequency (±5 days)"

6. **Fuzzy Matching Rules:**
   - Normalize descriptions: Uppercase, remove special chars, trim whitespace
   - Examples:
     - "BRITISH GAS LTD" = "British Gas" = "BritishGas" → "BRITISHGAS"
     - "DD NETFLIX.COM" = "NETFLIX" = "Netflix" → "NETFLIX"
   - Use fuzzball library with 85% threshold (Levenshtein distance)
   - Common prefix/suffix removal: "DD ", "SO ", " LTD", " LIMITED"

**Integration Verification:**

- **IV1: Pattern Detection Accuracy** - Import 3+ months with recurring payees (British Gas, Netflix, Council Tax), verify patterns detected with ≥85% accuracy
- **IV2: Frequency Detection** - Test monthly (30-day interval), quarterly (90-day), annual (365-day) patterns, verify correct frequency classification
- **IV3: Fuzzy Matching** - Test variations of payee names ("NETFLIX.COM", "Netflix", "DD NETFLIX"), verify normalized matching works

**Files to Create/Modify:**
- `src/models/Pattern.js` (NEW)
- `src/services/patternDetector.js` (NEW)
- `src/controllers/PatternController.js` (NEW)
- `src/routes/patterns.js` (NEW)
- `src/controllers/ImportController.js` (MODIFY - run pattern detection after import)
- `web/src/components/bank-import/PatternInsightsPanel.tsx` (NEW)
- `web/src/hooks/usePatternDetection.ts` (NEW)

**Estimated Effort:** 12-15 hours

---

### **Story 5.5: Enhanced Pattern Suggestion Modal & Smart Record Creation**

**As a** household administrator,
**I want** pattern-based suggestions when creating records from transactions,
**so that** I can quickly create domain records with pre-populated fields.

**Acceptance Criteria:**

1. **Enhanced Create Record Modal:**
   - Modal opens from "Create Record" button in transaction table
   - If transaction has `patternMatched: true`:
     - Show pattern indicator: "🔄 Recurring Pattern Detected (85% confidence)"
     - Display historical context: "Found 5 similar transactions (Jan-May 2025)"
     - Show confidence badge and score with tooltip

2. **Smart Field Pre-population:**
   - Domain suggestion based on pattern analysis:
     - "British Gas" → Property domain (Utility Bill)
     - "Admiral Insurance" → Vehicles domain (Motor Insurance)
     - "Netflix" → Services domain (Streaming)
   - Provider name extracted from description (normalized, capitalized)
   - Amount pre-filled from transaction
   - Renewal frequency inferred from pattern (monthly/quarterly/annual)
   - User can override all suggestions

3. **Pattern Learning Controls:**
   - Checkbox: "Apply to all similar transactions in this import" (batch create)
   - Checkbox: "Remember this pattern for future imports" (saves pattern rule)
   - User can override domain/recordType suggestions
   - If override: Track in Pattern model (`userOverrides++`, reduce confidence)

4. **Batch Record Creation:**
   - If "Apply to all similar" checked:
     - Find all transactions in current import matching pattern (fuzzy matching)
     - Show confirmation modal: "Create 3 records from similar transactions?"
     - List transactions to be processed (date, description, amount)
   - Create domain records for each transaction using same domain/recordType
   - Update all transaction statuses to `record_created` with linkage
   - Show success toast: "3 records created successfully"

5. **Pattern Rule Persistence:**
   - If "Remember this pattern" checked:
     - Update Pattern document: `{ autoSuggest: true, userConfirmed: true }`
     - Future imports with matching transactions auto-suggest same domain/recordType
     - Patterns managed in Settings → Bank Import Patterns (view/edit/delete)

6. **Suggestion Override:**
   - User can change suggested domain/recordType before creating
   - System learns from override:
     - Reduce pattern confidence by 10%
     - Increment `userOverrides` counter
     - If overrides > 3: Mark pattern as `autoSuggest: false`
   - Track override reason (optional): "Actually car insurance, not home insurance"

**Integration Verification:**

- **IV1: Pattern Suggestions** - Transaction with pattern shows enhanced modal with correct domain/recordType suggestions
- **IV2: Batch Creation** - Apply pattern to multiple transactions (3-5), verify all records created correctly in domain collections
- **IV3: Learning** - Override suggestion (e.g., change Property → Vehicles), verify future suggestions adapt (confidence reduced)

**Files to Create/Modify:**
- `web/src/components/bank-import/PatternSuggestionModal.tsx` (ENHANCE existing CreateEntryFromTransactionModal)
- `src/controllers/PatternController.js` (MODIFY - add batch creation endpoint)
- `src/services/domainSuggestionEngine.js` (ENHANCE - use Pattern model)
- `web/src/pages/Settings.tsx` (ADD - Bank Import Patterns management section)

**Estimated Effort:** 10-12 hours

---

### **Story 5.6: Import Timeline Visualization & Transaction History Page**

**As a** household administrator,
**I want** a visual timeline of imported statements and a dedicated transaction history view,
**so that** I can easily see what's been imported and explore all transactions.

**Acceptance Criteria:**

1. **Import Timeline Component:**
   - Visual calendar showing months with import status
   - Layout: `[2024] Nov ✅ Dec ✅ [2025] Jan ✅ Feb ✅ Mar ⏳ Apr ⏳ ...`
   - States:
     - ✅ Green checkmark = Imported (statement exists)
     - ⏳ Gray = Not imported (future or past month without import)
   - Hover tooltip: "Feb 2025: Imported on 15 Feb 2025 | 45 transactions | 12 records created | 5 pending"
   - Click month → filter transaction table to that month's transactions

2. **Timeline Integration in Bank Import Page:**
   - Timeline displayed prominently at top of Bank Import page (below upload area)
   - Summary stats: "12 imports | 450 total transactions | 85 records created | 20 pending"
   - "View All Transactions" button navigates to Transaction History page

3. **Transaction History Page (NEW):**
   - Route: `/transactions`
   - Navigation: Add "Transactions" link to main menu (between Bank Import and Settings)
   - Header: "Transaction History" with total count and date range
   - Premium design system styling (Swiss spa aesthetic)

4. **Transaction History Layout:**
   - **Header Section:**
     - Total transaction count (e.g., "450 Transactions")
     - Date range (earliest to latest, e.g., "Jan 2024 - Oct 2025")
     - Summary: "85 pending | 320 record created | 45 ignored"

   - **Filter Panel (left sidebar):**
     - Status filter (All/Pending/Created/Ignored) - dropdown
     - Date range picker (start/end dates)
     - Import session selector (dropdown of months: "Jan 2025", "Feb 2025", ...)
     - Search box (payee/description) - debounced 300ms
     - "Clear Filters" button (reset to defaults)

   - **Transaction Table (center, full width):**
     - Columns: Date, Payee, Amount, Status, Linked Record, Actions
     - Sortable by date (default: newest first), amount
     - Pagination: 50 transactions per page
     - Click row → expand inline to show full details

   - **Pattern Insights Panel (right sidebar, collapsible):**
     - "Detected Patterns: 12"
     - List of top 5 recurring patterns sorted by confidence
     - Each pattern shows: Payee, Frequency, Confidence badge, "Create Record" button
     - Click pattern → filter transactions matching that pattern

5. **Transaction Detail Expansion:**
   - Click transaction row → expand inline (accordion style)
   - Shows:
     - Full description (full text, not truncated)
     - Reference number (if exists)
     - Balance after transaction
     - Original PDF text (raw transaction text from statement)
   - Pattern info (if matched):
     - Frequency (Monthly/Quarterly/Annual)
     - Confidence score with badge
     - List of similar transactions (click to view)
   - Actions: "Create Record", "Ignore", "View in Import Session"

6. **Empty States:**
   - No transactions: "Upload your first bank statement to get started" with upload button
   - No pending: "All transactions processed! 🎉 Upload next statement to continue"
   - No patterns: "Upload more statements to detect recurring patterns (minimum 3 months recommended)"
   - No results from filters: "No transactions match your filters. Try adjusting your search criteria."

**Integration Verification:**

- **IV1: Timeline Accuracy** - Import multiple months (3-5), verify timeline shows correct visual states (✅ for imported, ⏳ for not imported)
- **IV2: Navigation** - Click timeline month, verify transaction table filters correctly to show only that month's transactions
- **IV3: Transaction History** - Load page with 1000+ transactions, verify pagination and filtering work smoothly (<2s load time)
- **IV4: Pattern Panel** - Verify pattern insights panel shows correct patterns with accurate confidence scores

**Files to Create/Modify:**
- `web/src/pages/TransactionHistory.tsx` (NEW)
- `web/src/components/bank-import/ImportTimeline.tsx` (ENHANCE - full calendar view)
- `web/src/components/bank-import/TransactionDetailRow.tsx` (NEW)
- `web/src/components/Layout.tsx` (MODIFY - add Transactions navigation link)
- `web/src/App.tsx` (MODIFY - add /transactions route)

**Estimated Effort:** 12-14 hours

---

## Epic Summary

**Total Stories:** 6
**Estimated Effort:** 56-71 hours (8-10 weeks at 7-8 hours/week part-time)

**Key Milestones:**
- ✅ Story 5.1: Foundation (Transaction model + migration) - **CRITICAL PATH**
- ✅ Story 5.2: Duplicate detection (prevent re-imports) - **QUICK WIN**
- ✅ Story 5.3: Transaction status management (core workflow) - **USER VALUE**
- ✅ Story 5.4: Pattern detection (intelligence layer) - **GAME CHANGER**
- ✅ Story 5.5: Smart suggestions (UX polish) - **PRODUCTIVITY BOOST**
- ✅ Story 5.6: Timeline & history page (discoverability) - **VISIBILITY**

**Risk Mitigation Through Sequencing:**
1. **Foundation first** (Story 5.1) - Migration must succeed before anything else
2. **Core workflow** (Stories 5.2-5.3) - Basic features before intelligence
3. **Intelligence layer** (Stories 5.4-5.5) - Pattern detection builds on stable foundation
4. **UX enhancements** (Story 5.6) - Polish comes last, non-blocking

**Dependencies:**
- Story 5.2+ depends on Story 5.1 (Transaction model must exist)
- Story 5.4 depends on Story 5.3 (Pattern detection needs transaction status)
- Story 5.5 depends on Story 5.4 (Suggestions need pattern detection)
- Story 5.6 can run in parallel with 5.4-5.5 (UI-only, no backend deps)

---

## Definition of Done

- [ ] All 6 stories completed with acceptance criteria met
- [ ] Migration script tested in staging and production
- [ ] Transaction collection populated with all historical data
- [ ] Duplicate detection prevents re-importing same statements
- [ ] Pattern detection achieves ≥85% accuracy for common UK providers
- [ ] Transaction history page loads smoothly with 1000+ transactions
- [ ] Import timeline shows accurate month-by-month import status
- [ ] All Epic 1-3 tests still passing (180+ tests)
- [ ] No console errors or warnings in browser/server logs
- [ ] MongoDB storage usage monitored (well under 512MB limit)
- [ ] Performance metrics acceptable (API <2s, duplicate detection <500ms)
- [ ] User testing completed (spouse validates workflow)

---

## Success Criteria

The epic is successful when:

1. **Data Migration:** All existing ImportSession transactions migrated to Transaction collection with 100% data preservation
2. **Duplicate Prevention:** Users cannot re-import same statement (file hash detection works)
3. **Pattern Intelligence:** Recurring payments detected across imports with ≥85% accuracy
4. **User Efficiency:** Creating records from recurring patterns is 50% faster than manual entry
5. **Transaction Management:** Users can filter, search, and manage transaction status effectively
6. **Visual Clarity:** Import timeline shows clear month-by-month import history
7. **No Regressions:** Existing Bank Import functionality preserved (HSBC parser, domain suggestions)
8. **Performance:** Transaction queries respond in <2s, duplicate detection in <500ms
9. **Storage Efficiency:** Transaction ledger stays within MongoDB Atlas M0 512MB limit

---

## Timeline & Milestones

**Total Estimated Effort:** 56-71 hours (8-10 weeks at 7-8 hours/week part-time)

**Phase 1: Foundation (Weeks 1-2) - Story 5.1**
- Create Transaction model and migration script (~8-12 hours)
- Critical path - must complete before other stories
- Milestone: Transaction collection created, migration tested in staging

**Phase 2: Core Workflow (Weeks 3-4) - Stories 5.2-5.3**
- Duplicate detection + transaction status management (~14-18 hours)
- Quick wins - immediate user value
- Milestone: Users can manage transaction status, duplicates prevented

**Phase 3: Intelligence Layer (Weeks 5-7) - Stories 5.4-5.5**
- Pattern detection + smart suggestions (~22-27 hours)
- Game changer - differentiated feature
- Milestone: Recurring patterns detected, smart record creation working

**Phase 4: UX Polish (Weeks 8-10) - Story 5.6**
- Timeline + transaction history page (~12-14 hours)
- Final polish - discoverability and visibility
- Milestone: Transaction history page complete, import timeline functional

---

## Dependencies & Prerequisites

**Prerequisites:**
- ✅ Epic 1-3 complete (domain architecture stable, 180+ tests passing)
- ✅ Bank Import infrastructure exists (controller, routes, services)
- ✅ ImportSession model with embedded transactions (migration source)
- ✅ MongoDB Atlas M0 database (512MB limit)

**External Dependencies:**
- UK bank statement PDFs for testing (HSBC, NatWest, Barclays)
- Staging database for migration testing
- Admin/user accounts for testing

**Story Dependencies:**
- Story 5.2 depends on Story 5.1 (Transaction model must exist)
- Story 5.3 depends on Story 5.1 (Transaction model must exist)
- Story 5.4 depends on Story 5.1 + 5.3 (Transaction model + status management)
- Story 5.5 depends on Story 5.4 (Pattern detection must exist)
- Story 5.6 can start after Story 5.1 (parallel development possible)

---

## Reference Documents

**Existing Code:**
- `web/src/pages/BankImport.tsx` - Current bank import page (1354 lines)
- `src/controllers/ImportController.js` - Import controller (443 lines)
- `src/models/ImportSession.js` - Current session model with embedded transactions
- `src/services/pdfProcessor.js` - PDF parsing (HSBC multi-line support)
- `src/services/recurringDetector.js` - Within-session recurring detection

**Related Architecture:**
- `docs/architecture/tech-stack.md` - Technology stack documentation
- `docs/architecture/source-tree.md` - Current project structure
- `docs/prd.md` - Main product requirements document
- `docs/stories/epic-4-bank-import-domain-migration.md` - Related epic

**Project Context:**
- `CLAUDE.md` - Project instructions and authentication debugging
- `docs/brief.md` - Original project brief

---

## Notes for Session Persistence

**If you're resuming after a session break:**

1. **Where We Are:** Epic 5 proposed for Transaction Ledger & Pattern Intelligence
2. **What's Been Done:** PRD complete, awaiting user approval
3. **What's Next:** User approves → Begin Story 5.1 (Transaction model + migration)
4. **Key Context:** Transform Bank Import from stateless (embedded transactions) to stateful (persistent ledger)
5. **Critical Success Factor:** Migration must preserve 100% of transaction data

**Key Files to Reference:**
- `src/models/Transaction.js` - Create this first (Story 5.1)
- `src/scripts/migrateTransactions.js` - Migration script (Story 5.1)
- `src/models/ImportSession.js` - Modify to add transaction_refs (Story 5.1)
- `src/services/patternDetector.js` - Pattern detection service (Story 5.4)

---

**Epic Status:** 📋 Proposed - Awaiting User Approval
**Next Action:** User (Calvin) reviews and approves Epic 5
**Created By:** PM Agent (John)
**Date:** 2025-10-11
