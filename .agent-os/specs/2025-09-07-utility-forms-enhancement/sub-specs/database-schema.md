# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-09-07-utility-forms-enhancement/spec.md

## Database Changes

### New Collection: utilities
Create a new MongoDB collection specifically for utility entries, separate from the existing entries collection used for bank accounts.

### Schema Definition
```javascript
const utilitySchema = new mongoose.Schema({
  // Core utility information
  utilityType: {
    type: String,
    enum: ['council-tax', 'gas-electric', 'water', 'tv-licence', 'internet-phone', 'insurance'],
    required: true
  },
  providerName: {
    type: String,
    required: true,
    trim: true
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  
  // UK-specific fields
  councilTaxBand: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    required: function() { return this.utilityType === 'council-tax'; }
  },
  meterNumber: {
    type: String,
    trim: true,
    required: function() { return ['gas-electric', 'water'].includes(this.utilityType); }
  },
  policyNumber: {
    type: String,
    trim: true,
    required: function() { return this.utilityType === 'insurance'; }
  },
  tariffType: {
    type: String,
    trim: true
  },
  
  // Contact and payment information
  contactDetails: {
    phone: String,
    email: String,
    website: String,
    postalAddress: String
  },
  paymentDetails: {
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually'],
      default: 'monthly'
    },
    amount: Number,
    nextPaymentDate: Date,
    directDebit: Boolean
  },
  
  // Ownership and sharing (consistent with existing pattern)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

### Indexes
```javascript
// Compound index for efficient querying by owner and utility type
utilitySchema.index({ owner: 1, utilityType: 1 });

// Index for shared utilities
utilitySchema.index({ sharedWith: 1 });

// Text index for provider name searching
utilitySchema.index({ providerName: 'text' });
```

### Migration Considerations
- This creates a new collection alongside existing 'entries' collection
- No data migration required as utilities currently use the entries collection inappropriately
- Existing utility entries in the entries collection should be migrated to the new utilities collection in a separate migration task
- Update middleware to set updatedAt on document modification

## Rationale

**Separation from Bank Accounts**: Creating a separate collection allows for utility-specific fields and validation rules without affecting bank account entries. This provides better data integrity and allows for optimized querying patterns.

**UK-Specific Fields**: The schema includes conditional required fields based on utility type, ensuring appropriate data capture for different UK utility categories while maintaining flexibility.

**Performance**: Dedicated indexes on utility-specific query patterns (owner + utilityType) will provide better performance than filtering a mixed entries collection.

**Data Integrity**: Type-specific validation ensures that Council Tax entries have bands, energy utilities have meter numbers, and insurance entries have policy numbers as required by UK standards.