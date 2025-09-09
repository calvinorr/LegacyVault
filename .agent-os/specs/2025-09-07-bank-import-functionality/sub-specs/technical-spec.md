# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-07-bank-import-functionality/spec.md

> Created: 2025-09-07
> Version: 1.0.0

## Technical Requirements

### PDF Processing Requirements
- Client-side PDF parsing using PDF.js or similar library for secure local processing
- Text extraction with position awareness to handle various UK bank statement formats
- Support for major UK banks: Barclays, HSBC, Lloyds, NatWest, Santander, TSB, Halifax, Nationwide
- Robust table detection and column mapping for transaction data extraction
- Error handling for malformed or unsupported PDF formats

### Transaction Data Extraction
- Parse transaction fields: date, payee/description, reference, debit/credit amounts, running balance
- Handle UK date formats (DD/MM/YYYY) and currency formatting (£ symbols, commas)
- Detect and normalize various payee name formats and abbreviations
- Extract reference numbers and sort codes where present in transaction descriptions

### Recurring Payment Detection Algorithm
- Pattern matching for payee names with fuzzy string matching to handle variations
- Amount consistency analysis allowing for minor variations (±5% tolerance)
- Frequency detection for weekly, monthly, quarterly, and annual patterns
- Minimum occurrence threshold (3+ instances) to qualify as recurring
- Exclusion filters for cash withdrawals, transfers between own accounts, and irregular one-off payments

### UK-Specific Categorization Logic
- Direct Debit identification via "DD" prefix or known DD payees
- Standing Order detection via "SO" or consistent manual payment patterns
- Utility categorization: electricity, gas, water, broadband, mobile, TV licence
- Council Tax recognition via local authority names and "COUNCIL TAX" descriptors
- Insurance detection: car, home, life, and other policy payments
- Subscription services: streaming, software, gym, membership fees
- Rent/Mortgage payments via landlord names or mortgage provider identification

### User Interface Requirements
- React components for PDF upload with drag-and-drop functionality
- Progress indicators during PDF processing and analysis phases
- Interactive review dashboard with editable suggestion cards
- Bulk actions: accept all, reject all, category filtering
- Real-time preview of how suggestions will appear as vault entries
- Mobile-responsive design following existing LegacyLock UI patterns

### Data Processing Pipeline
- Frontend: PDF upload → PDF.js parsing → transaction extraction → pattern analysis
- Backend: Store temporary analysis results → user confirmation API → vault entry creation
- Privacy controls: automatic cleanup of uploaded PDFs and temporary data after configurable period
- Error logging without storing sensitive financial data in logs

### Integration Points
- Extend existing Entry model to support import metadata and source tracking
- Leverage existing authentication and user management systems
- Integrate with current vault entry creation workflows
- Maintain compatibility with existing Utilities/Recurring Bills UI

### Performance Requirements
- Process typical 3-month bank statements (100-200 transactions) within 10 seconds
- Handle PDFs up to 50MB in size without browser crashes
- Optimize memory usage during PDF processing to prevent browser freezing
- Implement progressive loading for large transaction datasets

### Security Requirements
- All PDF processing must occur client-side with no data transmission during analysis
- Secure file upload with validation and size limits
- Temporary data encryption in browser memory
- Option to immediately delete source PDF after processing
- Audit logging for import activities without storing transaction details

## Approach

### Phase 1: Core PDF Processing
Implement client-side PDF parsing using PDF.js library with text extraction and basic table detection. Build transaction data extraction for common UK bank statement formats starting with major providers.

### Phase 2: Pattern Recognition
Develop recurring payment detection algorithm with UK-specific categorization rules. Implement fuzzy matching for payee names and frequency analysis for payment patterns.

### Phase 3: User Interface
Create React components for PDF upload, processing feedback, and interactive review dashboard. Integrate with existing LegacyLock authentication and vault entry creation systems.

### Phase 4: Data Integration
Extend backend APIs to support temporary storage of analysis results and batch creation of vault entries from confirmed suggestions. Implement privacy controls and data cleanup procedures.

## External Dependencies

**pdf2json** - Server-side PDF processing fallback
- **Justification:** Provides reliable table extraction for complex PDF layouts when client-side parsing fails

**fuse.js** - Fuzzy string matching for payee name recognition
- **Justification:** Essential for matching payee variations across transactions (e.g., "BRITISH GAS" vs "BT GAS BILL")

**date-fns** - Date parsing and manipulation for UK date formats
- **Justification:** Robust handling of DD/MM/YYYY formats and date arithmetic for frequency detection