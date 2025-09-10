# Spec Requirements Document

> Spec: Bank Import to Bills Integration
> Created: 2025-09-10
> Status: Planning

## Overview

Integrate bank import functionality directly with the Bills management system, allowing users to efficiently convert bank transactions into categorized bill entries using smart suggestions and pre-populated forms.

## User Stories

### Transaction to Bill Entry Conversion

As a user who has imported bank transactions, I want to create bill entries directly from transaction data, so that I can efficiently organize my financial information without manual re-entry.

**Detailed Workflow:**
1. User uploads and parses bank PDF on Bank Import page
2. Transaction table displays with new "Create Entry" button per row
3. User clicks "Create Entry" → AddBillModal opens pre-filled with transaction data
4. System suggests appropriate category based on payee/description patterns
5. User reviews, adjusts if needed, and saves → Entry created in Bills system
6. Transaction row indicates "Entry Created" status

### Bulk Transaction Processing

As a user with multiple similar transactions, I want to process multiple transactions at once, so that I can save time when categorizing regular payments.

**Detailed Workflow:**
1. User selects multiple transaction checkboxes in import table
2. User clicks "Create Entries (3)" bulk action button
3. System opens batch creation interface with smart category suggestions
4. User can review/modify suggestions before bulk creation
5. All entries created simultaneously with proper categorization

## Spec Scope

1. **Transaction Table Enhancement** - Add "Create Entry" buttons to each transaction row in Bank Import interface
2. **Smart Category Suggestions** - Use existing RecurringDetectionRules to suggest categories based on payee/description patterns
3. **Pre-populated Entry Forms** - Auto-fill AddBillModal with transaction amount, date, payee, and description
4. **Bulk Processing Interface** - Allow selection and batch creation of multiple transaction entries
5. **Transaction Status Tracking** - Mark transactions as "processed" when entries are created

## Out of Scope

- Automatic transaction categorization without user confirmation
- Modification of existing entry management functionality
- Integration with external banking APIs
- Historical transaction re-processing

## Expected Deliverable

1. Bank Import page displays "Create Entry" buttons for each transaction with functional integration
2. AddBillModal pre-populates with transaction data when accessed from bank import
3. Smart category suggestions appear based on transaction payee/description patterns
4. Bulk transaction processing allows efficient multi-transaction entry creation