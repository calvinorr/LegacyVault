const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Pattern Model - Recurring Payment Detection
 *
 * Stores detected recurring payment patterns across multiple imports.
 * Used for intelligent domain record suggestions and pattern learning.
 */
const PatternSchema = new Schema({
  // Ownership
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Pattern Details
  payee: {
    type: String,
    required: true
  }, // Normalized payee name
  normalizedDescription: {
    type: String,
    required: true,
    index: true
  }, // Uppercase, special chars removed

  frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'annually', 'irregular'],
    default: 'monthly'
  },

  // Amount Analysis
  averageAmount: { type: Number, required: true },
  amountVariance: { type: Number, default: 0 }, // Percentage (e.g., 0.1 = 10% variance)
  minAmount: { type: Number },
  maxAmount: { type: Number },

  // Confidence Metrics
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  }, // 0.0 to 1.0 (e.g., 0.85 = 85%)
  occurrences: {
    type: Number,
    default: 0
  }, // Number of matching transactions
  firstSeen: { type: Date },
  lastSeen: { type: Date },

  // Domain Suggestion
  suggestedDomain: {
    type: String,
    enum: ['property', 'vehicles', 'finance', 'employment', 'government', 'insurance', 'legal', 'services', null],
    default: null
  },
  suggestedRecordType: { type: String }, // e.g., 'Utility Bill', 'Motor Insurance'
  suggestionAccepted: { type: Boolean, default: false },
  userOverrides: { type: Number, default: 0 }, // Count of times user rejected suggestion

  // Pattern Learning
  autoSuggest: { type: Boolean, default: false }, // Auto-suggest this pattern
  userConfirmed: { type: Boolean, default: false }, // User explicitly confirmed pattern

  // Transaction References
  transactions: [{
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  }],

}, {
  timestamps: true,
});

// Indexes for query optimization
PatternSchema.index({ user: 1, normalizedDescription: 1 });
PatternSchema.index({ user: 1, confidence: -1 }); // High confidence first
PatternSchema.index({ user: 1, frequency: 1 });
PatternSchema.index({ autoSuggest: 1 });

/**
 * Normalize description for pattern matching
 * Removes special characters, prefixes, suffixes
 */
PatternSchema.statics.normalizeDescription = function(description) {
  return description
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Remove special chars
    .replace(/^(DD|SO|TFR|CHQ|FPO|ATM|POS|VIS)\s+/i, '') // Remove payment type prefixes
    .replace(/\s+(DD|SO|TFR|LTD|LIMITED|PLC)$/i, '') // Remove suffixes
    .trim();
};

/**
 * Calculate confidence score from pattern metrics
 */
PatternSchema.statics.calculateConfidence = function({
  frequencyScore = 0.5,
  amountConsistency = 0.5,
  occurrenceCount = 2
}) {
  // Base score from components
  const baseScore = (
    frequencyScore * 0.4 +
    amountConsistency * 0.3 +
    Math.min(occurrenceCount / 5, 1) * 0.3 // Occurrence bonus up to 5 occurrences
  );

  // Penalize low occurrence counts
  const occurrencePenalty = occurrenceCount < 3 ? 0.8 : 1.0;

  return Math.min(baseScore * occurrencePenalty, 1.0);
};

module.exports = mongoose.model('Pattern', PatternSchema);
