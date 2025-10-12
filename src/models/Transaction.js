const mongoose = require('mongoose');
const crypto = require('crypto');
const { Schema } = mongoose;

/**
 * Transaction Model - Central Ledger
 *
 * Persistent transaction records from all bank imports.
 * Replaces embedded transactions in ImportSession.
 * Enables cross-import pattern detection and duplicate prevention.
 */
const TransactionSchema = new Schema({
  // Ownership
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  importSession: {
    type: Schema.Types.ObjectId,
    ref: 'ImportSession',
    required: true,
    index: true
  },

  // Transaction Details
  date: { type: Date, required: true, index: true },
  description: { type: String, required: true },
  reference: { type: String },
  amount: { type: Number, required: true }, // Negative for debits, positive for credits
  balance: { type: Number },
  originalText: { type: String }, // Raw text from PDF for debugging

  // Duplicate Detection
  transactionHash: {
    type: String,
    index: true
  }, // SHA-256 hash of: user._id + amount + description (auto-calculated)

  // Status & Linkage
  status: {
    type: String,
    enum: ['pending', 'record_created', 'ignored'],
    default: 'pending',
    index: true
  },
  recordCreated: { type: Boolean, default: false },
  createdRecordId: { type: Schema.Types.ObjectId }, // Reference to created domain record
  createdRecordDomain: { type: String }, // Which domain the record was created in
  createdAt: { type: Date }, // When the record was created

  // Ignore Functionality
  ignoredReason: { type: String },
  ignoredAt: { type: Date },

  // Pattern Matching
  patternMatched: { type: Boolean, default: false },
  patternConfidence: { type: Number, min: 0, max: 1 }, // 0.0 to 1.0
  patternId: {
    type: Schema.Types.ObjectId,
    ref: 'Pattern',
    index: true
  },

}, {
  timestamps: true,
});

/**
 * Calculate transaction hash for duplicate detection
 * Hash = SHA-256(user._id + amount + description)
 *
 * Note: Does NOT include date - allows recurring monthly payments
 * with same amount+description to be stored with different dates
 */
TransactionSchema.statics.calculateHash = function(userId, amount, description) {
  const hashInput = `${userId}${amount}${description}`;
  return crypto
    .createHash('sha256')
    .update(hashInput)
    .digest('hex');
};

/**
 * Pre-save hook to calculate transactionHash if not provided
 */
TransactionSchema.pre('save', function(next) {
  if (!this.transactionHash && this.user && this.amount && this.description) {
    this.transactionHash = TransactionSchema.statics.calculateHash(
      this.user,
      this.amount,
      this.description
    );
  }
  next();
});

// Indexes for query optimization
// Compound index for duplicate detection (unique per user)
TransactionSchema.index({ user: 1, transactionHash: 1 }, { unique: true });

// Index for user transaction history queries
TransactionSchema.index({ user: 1, date: -1 });

// Index for status filtering
TransactionSchema.index({ user: 1, status: 1 });

// Text index for description search
TransactionSchema.index({ description: 'text' });

// Index for import session filtering
TransactionSchema.index({ importSession: 1 });

// Index for pattern matching
TransactionSchema.index({ patternId: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
