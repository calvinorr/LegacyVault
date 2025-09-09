# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-07-utility-forms-enhancement/spec.md

## Technical Requirements

### Frontend Form Layout Requirements
- Implement CSS Grid or Flexbox layouts for multi-column form arrangements
- Forms should utilize minimum 80% of available viewport width on desktop screens
- Responsive breakpoints: Desktop (1024px+), Tablet (768px-1023px), Mobile (<768px)
- Form sections should be visually grouped with appropriate spacing and borders
- Field labels should be positioned to maximize horizontal space usage

### UK Utility Data Model Requirements
- Create separate Mongoose schema for utility entries distinct from bank account schema
- Utility types enum: ['council-tax', 'gas-electric', 'water', 'tv-licence', 'internet-phone', 'insurance']
- Include UK-specific fields: Council Tax band (A-H), energy tariff types, meter numbers, policy numbers
- Support multiple contact methods per utility (phone, email, web portal, postal address)
- Validation for UK-specific formats (Council Tax reference numbers, energy supplier codes)

### Form Component Architecture
- Create separate React components for each utility type form
- Implement reusable form sections: ProviderDetails, AccountDetails, PaymentDetails, ContactDetails
- Use consistent field validation patterns across all utility forms
- Form state management using React hooks with proper error handling
- Progressive form saving to prevent data loss during completion

### API Endpoint Requirements
- Create `/api/utilities` endpoints separate from `/api/entries` for bank accounts
- Support CRUD operations: GET, POST, PUT, DELETE for utility entries
- Implement proper validation middleware for UK utility-specific fields
- Return structured error messages for form field validation
- Include proper authentication and authorization for utility data access

### Database Schema Requirements
- Utility collection separate from bank account entries
- Required fields: utilityType, providerName, accountNumber, owner, sharedWith
- Optional fields based on utility type: councilTaxBand, meterNumber, policyNumber, tariffType
- Indexing on utilityType and owner fields for efficient querying
- Support for nested contact information and payment details