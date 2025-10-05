// src/models/domain/importMetadataSchema.js
// Story 2.4: Shared import_metadata schema for all domain models

const { Schema } = require('mongoose');

// Reusable import_metadata schema for Bank Import tracking
const importMetadataSchema = {
  source: { type: String }, // 'bank_import'
  import_session_id: { type: Schema.Types.ObjectId, ref: 'ImportSession' },
  created_from_suggestion: { type: Boolean },
  original_payee: { type: String },
  confidence_score: { type: Number },
  import_date: { type: Date },
  detected_frequency: { type: String },
  domain_suggestion: {
    suggested_domain: { type: String },
    confidence: { type: Number },
    reasoning: { type: String },
    actual_domain: { type: String }
  },
  amount_pattern: {
    typical_amount: { type: Number },
    variance: { type: Number },
    currency: { type: String }
  }
};

module.exports = importMetadataSchema;
