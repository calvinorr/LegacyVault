const mongoose = require('mongoose');
const { Schema } = mongoose;

const TransactionSchema = new Schema({
  date: { type: Date, required: true },
  description: { type: String, required: true },
  reference: { type: String },
  amount: { type: Number, required: true }, // Negative for debits, positive for credits
  balance: { type: Number },
  originalText: { type: String }, // Raw text from PDF for debugging
}, { _id: false });

const RecurringPaymentSuggestionSchema = new Schema({
  payee: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['utilities', 'council_tax', 'insurance', 'subscription', 'rent', 'mortgage', 'other'],
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
    type: { type: String, enum: ['utility', 'account', 'policy', 'other'], default: 'utility' },
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
  file_hash: { type: String }, // For duplicate detection
  
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
  transactions: [TransactionSchema],
  
  // Analysis results
  recurring_payments: [RecurringPaymentSuggestionSchema],
  statistics: {
    total_transactions: { type: Number, default: 0 },
    recurring_detected: { type: Number, default: 0 },
    date_range_days: { type: Number },
    total_debits: { type: Number, default: 0 },
    total_credits: { type: Number, default: 0 }
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

module.exports = mongoose.model('ImportSession', ImportSessionSchema);