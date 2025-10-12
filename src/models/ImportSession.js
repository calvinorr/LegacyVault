const mongoose = require('mongoose');
const { Schema } = mongoose;

const TransactionSchema = new Schema({
  date: { type: Date, required: true },
  description: { type: String, required: true },
  reference: { type: String },
  amount: { type: Number, required: true }, // Negative for debits, positive for credits
  balance: { type: Number },
  originalText: { type: String }, // Raw text from PDF for debugging

  // Track if domain record has been created from this transaction
  recordCreated: { type: Boolean, default: false },
  createdRecordId: { type: Schema.Types.ObjectId }, // Reference to created domain record
  createdRecordDomain: { type: String }, // Which domain the record was created in
  createdAt: { type: Date }, // When the record was created
}, { _id: false });

const RecurringPaymentSuggestionSchema = new Schema({
  payee: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['utilities', 'bills', 'council_tax', 'insurance', 'subscription', 'rent', 'mortgage', 'other'],
    default: 'other'
  },
  subcategory: { type: String }, // e.g., 'electricity', 'gas', 'internet'
  amount: { type: Number, required: true },
  frequency: { 
    type: String, 
    enum: ['weekly', 'monthly', 'quarterly', 'annually', 'irregular'],
    default: 'monthly'
  },
  confidence: { type: Number, min: 0, max: 1 }, // Algorithm confidence score
  transactions: [TransactionSchema], // Supporting transactions
  suggested_entry: {
    title: { type: String },
    provider: { type: String },
    type: { type: String, enum: ['utility', 'bill', 'account', 'policy', 'other'], default: 'bill' },
    accountDetails: { type: Schema.Types.Mixed }
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'modified'],
    default: 'pending'
  },
  user_modifications: { type: Schema.Types.Mixed } // User edits to suggestion
}, { _id: false });

const ImportSessionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  file_size: { type: Number }, // In bytes
  file_hash: { type: String }, // For duplicate PDF detection (file-level)
  statement_hash: { type: String }, // For duplicate statement detection (content-level)

  // Processing status
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'failed', 'expired'],
    default: 'uploading'
  },
  processing_stage: {
    type: String,
    enum: ['pdf_parsing', 'transaction_extraction', 'pattern_analysis', 'suggestion_generation', 'complete'],
  },
  error_message: { type: String },

  // Extracted data
  bank_name: { type: String }, // Detected bank
  account_number: { type: String }, // Last 4 digits or partial
  statement_period: {
    start_date: { type: Date },
    end_date: { type: Date }
  },

  // DEPRECATED: Embedded transactions (kept for backwards compatibility during migration)
  // Use transaction_refs instead - this field will be removed after migration
  transactions: [TransactionSchema],

  // NEW: References to Transaction collection (Epic 5)
  transaction_refs: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],

  // Analysis results
  recurring_payments: [RecurringPaymentSuggestionSchema],
  statistics: {
    total_transactions: { type: Number, default: 0 },
    new_transactions: { type: Number, default: 0 }, // NEW: After duplicate detection
    duplicate_transactions: { type: Number, default: 0 }, // NEW: Duplicates skipped
    recurring_detected: { type: Number, default: 0 },
    date_range_days: { type: Number },
    total_debits: { type: Number, default: 0 },
    total_credits: { type: Number, default: 0 },
    records_created: { type: Number, default: 0 } // NEW: Domain records created from transactions
  },

  // Privacy and cleanup
  expires_at: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  auto_cleanup: { type: Boolean, default: true },

}, {
  timestamps: true,
});

// TTL index for automatic cleanup
ImportSessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Index for user queries
ImportSessionSchema.index({ user: 1, createdAt: -1 });

// Index for status queries
ImportSessionSchema.index({ status: 1 });

// NEW: Index for duplicate statement detection (Epic 5)
ImportSessionSchema.index({ user: 1, statement_hash: 1 });

/**
 * Virtual field for backwards compatibility (Epic 5)
 * Populates transactions from Transaction collection via transaction_refs
 *
 * Usage:
 *   const session = await ImportSession.findById(id).populate('transactions');
 *   session.transactions // Returns array of Transaction documents
 */
ImportSessionSchema.virtual('transactionsVirtual', {
  ref: 'Transaction',
  localField: 'transaction_refs',
  foreignField: '_id'
});

// Enable virtuals in JSON/Object output
ImportSessionSchema.set('toJSON', { virtuals: true });
ImportSessionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ImportSession', ImportSessionSchema);