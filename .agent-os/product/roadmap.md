# Product Roadmap

## Phase 0: Already Completed

The following features have been implemented:

- [x] **Google OAuth Authentication** - Secure login with admin approval workflow `M`
- [x] **Bank Account Management** - Full CRUD with UK banking terminology and sort codes `L`
- [x] **Dashboard Interface** - Real-time overview with entry statistics and quick actions `M`
- [x] **Settings & User Management** - Profile management with admin approval system `S`
- [x] **Entry Categorization System** - Basic type system for accounts, utilities, pensions, policies `S`
- [x] **Document Attachment Support** - File upload capability with provider-agnostic storage `M`
- [x] **Responsive UI Framework** - TailwindCSS with grid/list view modes and Material icons `L`
- [x] **MongoDB Data Model** - Flexible schema with user sharing and confidentiality controls `M`
- [x] **PDF Bank Statement Import** - Complete parsing with HSBC multi-line transaction support `L`
- [x] **Recurring Payment Detection** - AI-powered pattern recognition for UK utilities and bills `L`
- [x] **Transaction-to-Entry Conversion** - Smart form pre-population with category suggestions `XL`
- [x] **Dynamic Category System** - Hierarchical categories with intelligent mapping from legacy rules `L`
- [x] **Category Suggestion Engine** - Fuzzy matching with confidence scoring for 20+ UK providers `L`
- [x] **Premium Design System** - Swiss spa aesthetic with Lucide React icons, Inter font, and sophisticated styling `XL`

## Phase 1: Utilities & Services Enhancement

**Goal:** Create specialized forms and workflows for UK utilities and services
**Success Criteria:** Separate utility forms with UK-specific fields, improved categorization

### Features

- [ ] Utilities-Specific Forms - Separate form structure from bank accounts with utility-specific fields `M`
- [ ] UK Utility Categories - Council Tax, Energy Suppliers, Water Companies, TV/Media, Insurance `S`
- [ ] Enhanced Entry Types - Better differentiation between account types with appropriate fields `S`
- [ ] Supplier Contact Management - Emergency contact numbers and customer service details `S`

### Dependencies

- Existing entry model supports flexible accountDetails field
- Current modal system can be extended for utility-specific forms

## Phase 2: Pensions & Retirement Planning

**Goal:** Add comprehensive UK pension management capabilities
**Success Criteria:** Full pension category with State, Workplace, Personal, and Final Salary support

### Features

- [ ] Pensions Core Category - State Pension, Workplace Pensions, Personal Pensions, Final Salary schemes `L`
- [ ] UK Pension Providers - Contact details, policy numbers, contribution tracking `M`
- [ ] Annual Statements Integration - Document linking with pension statement processing `M`
- [ ] Basic Retirement Planning - Simple calculators and pension forecasting `L`

### Dependencies

- Document management system
- Enhanced categorization from Phase 1

## Phase 3: Smart Categorisation & Tagging

**Goal:** Advanced organization with multi-provider tagging and custom categories
**Success Criteria:** Users can group providers, create custom categories, and generate category-based reports

### Features

- [ ] Multi-Provider Tagging - Sky (TV + Mobile), British Gas (Gas + Electric) grouping `M`
- [ ] Custom Category System - User-defined hierarchical organization with color coding `M`
- [ ] Advanced Filtering - Category-based views and reporting capabilities `S`
- [ ] Payment Method Tracking - Direct Debit, Standing Order, Manual payment categorization `S`

### Dependencies

- Enhanced data model for tagging relationships
- UI components for category management

## Phase 4: Bank Statement Processing & Bill Recognition ✅ LARGELY COMPLETED

**Goal:** Automated transaction import and payment pattern recognition
**Success Criteria:** PDF import from major UK banks with automatic supplier matching

### Features

- [x] **Multi-Bank PDF Import** - Support for HSBC, NatWest, Barclays statement formats with multi-line parsing `L`
- [x] **Transaction Pattern Recognition** - Identify recurring payments for 20+ UK suppliers with confidence scoring `XL`
- [x] **Intelligent Supplier Matching** - Link imported transactions to dynamic categories with fuzzy matching `L`
- [x] **Smart Entry Creation** - Pre-populated forms with automatic provider detection and bill type classification `L`
- [ ] Payment Tracking Alerts - Missing payment notifications and amount change alerts `M`
- [ ] CSV Import Support - Extend to support CSV formats alongside PDF parsing `S`

### Dependencies

- [x] Enhanced data model for transaction storage
- [x] Pattern recognition algorithms
- [x] Dynamic category system integration

## Phase 5: Document Management Enhancement

**Goal:** Intelligent document processing with OCR and auto-linking
**Success Criteria:** Documents automatically linked to entries with key data extraction

### Features

- [ ] Document-Entry Auto-Linking - Smart association of uploaded documents to relevant accounts `L`
- [ ] OCR Text Recognition - Extract key data from PDFs and images `XL`
- [ ] Contract Storage System - Full terms and conditions filing with renewal tracking `M`
- [ ] Bill Intelligence - Auto-extract amounts, due dates, and contact details `L`

### Dependencies

- OCR service integration
- Enhanced document storage architecture