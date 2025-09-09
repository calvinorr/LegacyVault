# LegacyVault Feature Specification: Import PDF Bank Statement & Detect Recurring Bills

## Feature Overview

Enable users to import their UK bank statements in PDF format. Automatically extract transaction data, identify recurring bills (utilities, subscriptions, direct debits, standing orders), and suggest these as entries to add to LegacyVault's Utilities/Recurring Payments section.

---

## User Story

As a user of LegacyVault,  
I want to upload a PDF bank statement  
So that the system can automatically identify all recurring charges (direct debits, standing orders, subscriptions, utilities, etc.)  
And suggest these as utility or recurring bill entries to add to my household financial information dashboard.

---

## Objectives

- Securely import PDF bank statements.
- Extract and parse all transactional data, including dates, payees, amounts, and references.
- Automatically detect recurring payments (e.g. utilities, council tax, broadband, subscriptions, insurance, rent/mortgage).
- For each detected recurring payment:
  - Extract details (provider, reference, frequency, amount, date range).
  - Present a preview to the user with edit/confirmation options.
- Allow user to confirm, merge, ignore, or tag entries before addition.
- Seamlessly create new Utility/Recurring Bill records from accepted suggestions.

---

## Requirements

### PDF Import/Extraction
- Upload and parse various UK PDF bank statement formats.
- Extract transaction details:
  - Date
  - Payee/Description
  - Reference
  - Debit/Credit Amount
  - Balance

### Recurring Payment Detection
- Detect matching payees or references, stable amounts, and consistent payment intervals.
- Categorize as: direct debit, standing order, subscription, rent, mortgage, etc.
- Group and summarize series of payments.
- Exclude one-off or irregular transactions.

### User Workflow
- After extraction and analysis, present a suggested list of recurring bills with details.
- Let the user review, edit, tag, or ignore each suggested bill.
- On acceptance, add to Utilities/Recurring Bills in the app.
- Allow users to merge, edit, or delete draft suggestions.

### Privacy & Security
- All processing must be local and secure (no third-party cloud uploads).
- Delete raw statement data after processing if user requests.

### Extensibility
- Design modular extraction—support CSV, OFX, and other statement types in future.

---

## Deliverables

- Detailed plan and technical spec for the workflow.
- Library/tool recommendations (PDF parsing, recurring detection, UK-specific statement handling).
- Wireframes/user journey for import, analysis, and confirmation.
- Data model outline for storing extracted bills/recurring payment info.

---

## Goal

When a user uploads a PDF bank statement, LegacyVault will help them instantly discover, review, and record all regular household bills, ensuring up-to-date financial and estate planning records with minimal effort.
