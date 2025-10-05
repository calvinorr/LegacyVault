// src/models/domain/PropertyRecord.js
// Property domain records: mortgages, utilities, home insurance, council tax, etc.

const mongoose = require('mongoose');
const { Schema } = mongoose;

const propertyRecordSchema = new Schema({
  // Common fields (all domains)
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  priority: { type: String, enum: ['Critical', 'Important', 'Standard'], default: 'Standard' },
  renewalDate: { type: Date },
  documentIds: [{ type: Schema.Types.ObjectId }], // Ready for Story 1.2 GridFS

  // Property-specific fields
  name: { type: String, required: true }, // e.g., "Home Electric", "Mortgage"
  recordType: { type: String, required: true }, // e.g., "mortgage", "utility-electric", "home-insurance"
  address: { type: String },
  provider: { type: String },
  accountNumber: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
  monthlyAmount: { type: Number },
  notes: { type: String },
  postcode: { type: String },

  // Audit trail fields
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  history: [{
    modifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    modifiedAt: { type: Date, default: Date.now },
    changes: { type: Map, of: Schema.Types.Mixed }
  }],

  // Bank Import metadata (Story 2.4)
  import_metadata: {
    source: { type: String },
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
  }
}, { timestamps: true });

// Indexes for common queries
propertyRecordSchema.index({ user: 1, recordType: 1 });
propertyRecordSchema.index({ renewalDate: 1 });

// Middleware to track modifications
propertyRecordSchema.pre('save', function(next) {
  if (this.isNew && this.user) {
    this.createdBy = this.user;
  }

  if (this.isModified() && !this.isNew) {
    const changes = {};
    this.modifiedPaths().forEach(path => {
      if (path !== 'history' && path !== 'lastModifiedBy' && path !== 'updatedAt') {
        changes[path] = this[path];
      }
    });

    if (Object.keys(changes).length > 0) {
      this.history.push({
        modifiedBy: this.lastModifiedBy || this.user,
        modifiedAt: new Date(),
        changes
      });
    }
  }
  next();
});

module.exports = mongoose.model('PropertyRecord', propertyRecordSchema);
