# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-09-07-bank-import-functionality/spec.md

> Created: 2025-09-07
> Version: 1.0.0

## Schema Changes

### New Collection: ImportSession

```javascript
const importSessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now,
    expires: '7d' // Auto-delete after 7 days
  },
  status: { 
    type: String, 
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  extractedTransactions: [{
    date: Date,
    payee: String,
    reference: String,
    amount: Number,
    balance: Number,
    type: { type: String, enum: ['debit', 'credit'] }
  }],
  detectedRecurring: [{
    payee: String,
    normalizedPayee: String,
    category: { 
      type: String, 
      enum: ['utility', 'council-tax', 'insurance', 'subscription', 
             'rent', 'mortgage', 'direct-debit', 'standing-order', 'other'] 
    },
    frequency: { 
      type: String, 
      enum: ['weekly', 'monthly', 'quarterly', 'annual'] 
    },
    averageAmount: Number,
    transactionCount: Number,
    firstSeen: Date,
    lastSeen: Date,
    confidence: Number, // 0-100 confidence score
    transactions: [Number] // Indices into extractedTransactions array
  }],
  processedAt: Date,
  deletedAt: Date
}, {
  timestamps: true
});
```

### Extended Entry Model Fields

```javascript
// Add to existing Entry schema in src/models/entry.js
const entrySchemaExtension = {
  importMetadata: {
    importedFrom: { 
      type: String, 
      enum: ['manual', 'bank-import', 'csv-import'] 
    },
    importSessionId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'ImportSession' 
    },
    detectedFrequency: { 
      type: String, 
      enum: ['weekly', 'monthly', 'quarterly', 'annual'] 
    },
    detectedAmount: Number,
    confidenceScore: Number,
    importedAt: Date,
    sourceTransactions: [String] // Transaction references for audit trail
  }
};
```

### New Collection: RecurringDetectionRules

```javascript
const detectionRulesSchema = new mongoose.Schema({
  ruleName: { 
    type: String, 
    required: true, 
    unique: true 
  },
  payeePatterns: [String], // Regex patterns for payee matching
  category: { 
    type: String, 
    required: true,
    enum: ['utility', 'council-tax', 'insurance', 'subscription', 
           'rent', 'mortgage', 'direct-debit', 'standing-order', 'other']
  },
  subcategory: String, // e.g., 'electricity', 'gas', 'broadband'
  keywords: [String], // Additional identifying keywords
  amountRange: {
    min: Number,
    max: Number
  },
  frequency: { 
    type: String, 
    enum: ['weekly', 'monthly', 'quarterly', 'annual'] 
  },
  confidence: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 80 
  },
  enabled: { 
    type: Boolean, 
    default: true 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});
```

## Migrations

### Migration 1: Add Import Metadata to Existing Entries

```javascript
// Migration script: migrations/001-add-import-metadata.js
db.entries.updateMany(
  { importMetadata: { $exists: false } },
  { 
    $set: { 
      'importMetadata.importedFrom': 'manual',
      'importMetadata.importedAt': new Date()
    } 
  }
);
```

### Migration 2: Create Default Detection Rules

```javascript
// Migration script: migrations/002-create-detection-rules.js
const defaultRules = [
  {
    ruleName: 'British Gas',
    payeePatterns: ['BRITISH GAS', 'BT GAS', 'BRITISHGAS'],
    category: 'utility',
    subcategory: 'gas',
    keywords: ['gas', 'energy'],
    frequency: 'monthly',
    confidence: 95
  },
  {
    ruleName: 'Council Tax',
    payeePatterns: ['COUNCIL TAX', '.*COUNCIL.*TAX', '.*BOROUGH.*COUNCIL'],
    category: 'council-tax',
    keywords: ['council', 'tax', 'borough', 'city'],
    frequency: 'monthly',
    confidence: 98
  },
  {
    ruleName: 'BT Broadband',
    payeePatterns: ['BT GROUP', 'BT PLC', 'BRITISH TELECOM'],
    category: 'utility',
    subcategory: 'broadband',
    keywords: ['bt', 'broadband', 'internet'],
    frequency: 'monthly',
    confidence: 90
  },
  {
    ruleName: 'Direct Debit Generic',
    payeePatterns: ['DD .*', 'DIRECT DEBIT.*'],
    category: 'direct-debit',
    keywords: ['dd', 'direct debit'],
    frequency: 'monthly',
    confidence: 75
  }
];

db.recurringdetectionrules.insertMany(defaultRules);
```

### Migration 3: Add Indexes for Performance

```javascript
// Migration script: migrations/003-add-indexes.js
db.importsessions.createIndex({ userId: 1, uploadedAt: -1 });
db.importsessions.createIndex({ status: 1, uploadedAt: -1 });
db.entries.createIndex({ 'importMetadata.importSessionId': 1 });
db.entries.createIndex({ 'importMetadata.importedFrom': 1 });
db.recurringdetectionrules.createIndex({ category: 1, enabled: 1 });
```

## Data Relationships

### Import Session → User
- Each import session belongs to a specific user
- Users can have multiple import sessions
- Sessions auto-expire after 7 days for privacy

### Import Session → Entries
- Entries created from import session reference the session ID
- Enables audit trail and batch operations on imported entries
- Supports rollback functionality if needed

### Detection Rules → Categories
- Rules define patterns for automatic categorization
- Enables customization and improvement of detection accuracy
- Supports A/B testing of different rule configurations

## Privacy Considerations

### Automatic Data Cleanup
- ImportSession documents auto-expire after 7 days using MongoDB TTL
- extractedTransactions field contains sensitive data with automatic cleanup
- Optional immediate deletion after user confirmation

### Data Minimization
- Only store essential fields for audit trail and user review
- Transaction details not stored long-term unless explicitly saved as entries
- Raw PDF content never stored in database

### User Control
- Users can manually trigger deletion of import session data
- Clear visibility into what data is stored and for how long
- Option to disable import history tracking entirely