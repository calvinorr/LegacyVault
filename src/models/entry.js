// src/models/entry.js
// Mongoose model for a household vault entry (accounts, providers, policies, etc.)
// Keep fields intentionally simple and extensible.

const mongoose = require('mongoose');
const { Schema } = mongoose;

const AttachmentSchema = new Schema({
  filename: { type: String },
  url: { type: String },
  provider: { type: String }, // e.g., 's3', 'local'
}, { _id: false });

const EntrySchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['account', 'utility', 'pension', 'policy', 'provider', 'note', 'other'], default: 'other' },
  provider: { type: String }, // e.g., 'NatWest', 'British Gas', insurer name
  accountDetails: { type: Schema.Types.Mixed }, // store provider-specific structured data
  notes: { type: String },
  attachments: { type: [AttachmentSchema], default: [] },
  // Categorization system
  category: { 
    type: String, 
    enum: ['Banking', 'Insurance', 'Utilities', 'Subscriptions', 'Investments', 'Property', 'Pensions', 'Other'], 
    default: 'Other' 
  },
  subCategory: { type: String }, // e.g., 'Home Insurance', 'Car Insurance' under 'Insurance'
  tags: { type: [String], default: [] }, // e.g., ['Sky', 'Monthly', 'Direct Debit']
  supplier: { type: String }, // Normalized supplier name for grouping (e.g., 'Sky', 'British Gas')
  
  // Import tracking
  import_metadata: {
    source: { type: String, enum: ['manual', 'bank_import', 'csv_import'], default: 'manual' },
    import_session_id: { type: Schema.Types.ObjectId, ref: 'ImportSession' },
    created_from_suggestion: { type: Boolean, default: false },
    original_payee: { type: String }, // Original payee name from bank statement
    confidence_score: { type: Number }, // Algorithm confidence when created from import
    import_date: { type: Date },
    detected_frequency: { type: String, enum: ['weekly', 'monthly', 'quarterly', 'annually', 'irregular'] },
    amount_pattern: {
      typical_amount: { type: Number },
      variance: { type: Number },
      currency: { type: String, default: 'GBP' }
    }
  },
  
  //
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // user who created the entry
  sharedWith: { type: [Schema.Types.ObjectId], ref: 'User', default: [] }, // optional sharing
  confidential: { type: Boolean, default: true },
  lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Entry', EntrySchema);