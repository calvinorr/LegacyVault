const mongoose = require('mongoose');
const { Schema } = mongoose;

const PatternRuleSchema = new Schema({
  name: { type: String, required: true }, // e.g., "British Gas Energy"
  patterns: [{ type: String, required: true }], // Regex patterns to match
  category: { 
    type: String, 
    enum: ['utilities', 'council_tax', 'insurance', 'subscription', 'rent', 'mortgage', 'telecoms', 'other'],
    required: true
  },
  subcategory: { type: String }, // e.g., 'electricity', 'gas', 'internet'
  provider: { type: String }, // Normalized provider name
  confidence_boost: { type: Number, default: 0.1 }, // Extra confidence for matching this rule
  min_occurrences: { type: Number, default: 2 }, // Minimum occurrences to suggest
  expected_frequency: { 
    type: String, 
    enum: ['weekly', 'monthly', 'quarterly', 'annually'],
    default: 'monthly'
  },
  uk_specific: { type: Boolean, default: true },
  active: { type: Boolean, default: true }
}, { _id: false });

const RecurringDetectionRulesSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  version: { type: String, default: '1.0' },
  
  // Rule categories
  utility_rules: [PatternRuleSchema],
  council_tax_rules: [PatternRuleSchema],
  insurance_rules: [PatternRuleSchema],
  subscription_rules: [PatternRuleSchema],
  telecoms_rules: [PatternRuleSchema],
  general_rules: [PatternRuleSchema],
  
  // Global settings
  settings: {
    min_confidence_threshold: { type: Number, default: 0.6 },
    fuzzy_match_threshold: { type: Number, default: 0.8 },
    amount_variance_tolerance: { type: Number, default: 0.1 }, // 10% variance
    frequency_detection_window_days: { type: Number, default: 90 },
    require_uk_sort_code: { type: Boolean, default: false }
  },
  
  // Metadata
  created_by: { type: String, default: 'system' },
  last_updated_by: { type: String, default: 'system' },
  is_default: { type: Boolean, default: false },
  custom_user: { type: Schema.Types.ObjectId, ref: 'User' }, // If user-specific rules
  
}, {
  timestamps: true,
});

// Only one default ruleset allowed
RecurringDetectionRulesSchema.index({ is_default: 1 }, { unique: true, partialFilterExpression: { is_default: true } });

// User-specific rules index
RecurringDetectionRulesSchema.index({ custom_user: 1 });

module.exports = mongoose.model('RecurringDetectionRules', RecurringDetectionRulesSchema);