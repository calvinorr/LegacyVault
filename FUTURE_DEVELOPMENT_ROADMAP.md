
# Future Development Roadmap - LegacyLock UK

## Phase 1: Utilities & Services Management

### Utilities-Specific Forms & Fields
- **Separate form structure** from bank accounts with utility-specific fields:
  - Account reference/customer number
  - Meter readings (gas/electric)
  - Tariff information
  - Payment method (direct debit/standing order)
  - Monthly/quarterly billing cycles
  - Supplier contact details
  - Emergency contact numbers

### Utility Categories Enhancement
- **Council Tax**: Band, local authority, payment plan
- **Energy Suppliers**: Dual fuel vs separate gas/electric
- **Water Companies**: Metered vs unmetered
- **TV/Media**: Sky, Virgin, BBC iPlayer licence
- **Telecommunications**: Broadband, mobile, landline
- **Insurance Services**: Home, contents, life, travel

## Phase 2: Pensions & Retirement Planning

### Pensions as Core Category
- **State Pension**: NI record, forecast amount, claiming date
- **Workplace Pensions**: Employer schemes, contribution rates
- **Personal Pensions**: SIPPs, stakeholder pensions
- **Final Salary**: DB schemes, transfer values
- **Pension Providers**: Contact details, policy numbers
- **Annual Statements**: Document storage integration

### Retirement Planning Tools
- **Pension Dashboard Integration**: Future API connections
- **Retirement Income Calculator**: Basic projections
- **State Pension Age**: Integration with gov.uk data
- **Annual Allowance Tracking**: For tax planning

## Phase 3: Smart Categorisation & Tagging

### Multi-Provider Tagging System
- **Supplier Groups**: Sky (TV + Mobile), British Gas (Gas + Electric)
- **Service Categories**: Insurance, Utilities, Subscriptions, Healthcare
- **Payment Methods**: Direct Debit, Standing Order, Manual
- **Billing Frequency**: Monthly, Quarterly, Annual
- **Priority Levels**: Essential, Important, Optional

### Category Management
- **Custom Categories**: User-defined groupings
- **Sub-categories**: Hierarchical organisation
- **Colour Coding**: Visual identification
- **Reporting Views**: Category-based summaries
- **Budget Tracking**: Spend by category

## Phase 4: Bank Statement Processing & Bill Recognition

### CSV Import Functionality
- **Multi-bank Format Support**: Barclays, HSBC, Lloyds, NatWest formats
- **Data Mapping**: Auto-match columns (date, description, amount)
- **Transaction Parsing**: Extract supplier names from descriptions
- **Duplicate Detection**: Avoid importing same data twice

### Recurring Payment Detection
- **Pattern Recognition**: Identify monthly/quarterly regulars
- **Amount Variation**: Handle small changes in billing
- **Supplier Matching**: Link to existing utility entries
- **Standing Order Detection**: Fixed amount, same date patterns
- **Direct Debit Recognition**: Variable amounts from same supplier

### Payment Tracking & Alerts
- **Missing Payment Alerts**: When expected DD doesn't appear
- **Amount Change Notifications**: When bills increase significantly
- **Annual Review Reminders**: Contract renewal dates
- **Price Comparison Prompts**: When to switch suppliers

## Phase 5: Document Management Enhancement

### Document-Entry Linking
- **Auto-Association**: Link uploaded documents to relevant accounts
- **OCR Text Recognition**: Extract key data from PDFs
- **Annual Statement Processing**: Auto-extract policy numbers
- **Renewal Date Extraction**: Calendar integration
- **Contract Storage**: Full terms and conditions filing

### Document Intelligence
- **Bill Amount Extraction**: Auto-populate payment amounts
- **Due Date Recognition**: Calendar reminders
- **Contact Detail Extraction**: Auto-update supplier info
- **Policy Number Recognition**: Link to existing entries

## Phase 6: Reporting & Analytics

### Financial Overview Dashboard
- **Total Monthly Outgoings**: All utilities and services
- **Year-on-Year Comparisons**: Cost tracking over time
- **Supplier Spend Analysis**: Who gets most money
- **Category Breakdowns**: Visual pie charts
- **Pension Pot Valuation**: Total retirement savings

### Export & Reporting
- **Annual Summaries**: Tax year reporting
- **Category Exports**: For budgeting software
- **Pension Statements**: Consolidated view
- **Supplier Contact Lists**: Emergency contact exports
- **Payment Schedule**: When everything is due

## Phase 7: Integration & APIs

### UK Government APIs
- **HMRC Integration**: Pension tax relief tracking
- **Gov.uk Services**: State pension forecasts
- **Council Tax**: Local authority integration
- **Energy Switching**: Price comparison services

### Third-Party Integrations
- **Open Banking**: Real-time account data (future)
- **Pension Dashboard**: When available from gov.uk
- **Price Comparison**: Utility switching recommendations
- **Calendar Systems**: Reminder integration

## Phase 8: Advanced Features

### Succession Planning
- **Beneficiary Management**: Who inherits what accounts
- **Emergency Contact Systems**: Critical information access
- **Document Accessibility**: Secure family member access
- **Account Transfer Procedures**: How to hand over accounts

### Security Enhancements
- **Two-Factor Authentication**: Enhanced security options
- **Audit Trail Expansion**: Detailed change logging
- **Data Encryption**: Enhanced protection for sensitive data
- **Backup & Recovery**: Automated data protection

## Technical Implementation Notes

### Database Schema Evolution
- **Flexible Account Details**: JSON fields for different account types
- **Category System**: Hierarchical tagging structure
- **Document Relationships**: File-to-entry associations
- **Payment History**: Transaction storage for analysis

### UK-Specific Considerations
- **Postcode Integration**: Address validation
- **UK Date Formats**: DD/MM/YYYY throughout
- **Sterling Currency**: £ symbol, pence handling
- **UK Financial Years**: April to March
- **UK Pension Regulations**: HMRC compliance

## Development Priorities

### Immediate (Next Sprint)
1. Utilities-specific forms and fields
2. Basic categorisation system
3. CSV import foundation

### Short Term (Next Month)
1. Pensions category implementation
2. Enhanced document linking
3. Recurring payment detection

### Medium Term (Next Quarter)
1. Advanced reporting dashboard
2. UK government API integration
3. Supplier contact management

### Long Term (Next Year)
1. Open banking integration
2. Advanced analytics
3. Succession planning tools

## User Experience Considerations

### Accessibility
- **Large Font Options**: For older users
- **High Contrast Mode**: Visual accessibility
- **Simple Navigation**: Clear, intuitive interface
- **Help Documentation**: Context-sensitive guidance

### Mobile Responsiveness
- **Touch-Friendly**: Large buttons, easy navigation
- **Mobile Document Upload**: Camera integration
- **Responsive Design**: Works on all devices
- **Offline Capability**: Basic functionality without internet

---

*This roadmap should be updated regularly based on user feedback and changing UK financial regulations.*