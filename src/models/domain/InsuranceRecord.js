// src/models/domain/InsuranceRecord.js
// Insurance & Protection domain records: life, health, income protection, critical illness, etc.

const mongoose = require('mongoose');
const { Schema } = mongoose;

const insuranceRecordSchema = new Schema({
  // Common fields (all domains)
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  priority: { type: String, enum: ['Critical', 'Important', 'Standard'], default: 'Standard' },
  renewalDate: { type: Date },
  documentIds: [{ type: Schema.Types.ObjectId }], // Ready for Story 1.2 GridFS

  // Insurance-specific fields
  name: { type: String, required: true }, // e.g., "Life Insurance", "Income Protection"
  policyType: { type: String, required: true }, // e.g., "life", "health", "income-protection", "critical-illness"
  policyNumber: { type: String },
  provider: { type: String },
  premium: { type: Number }, // Monthly or annual premium
  coverageAmount: { type: Number },
  beneficiaries: { type: String }, // Comma-separated list or text field
  notes: { type: String },

  // Audit trail fields
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  history: [{
    modifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    modifiedAt: { type: Date, default: Date.now },
    changes: { type: Map, of: Schema.Types.Mixed }
  }]
}, { timestamps: true });

// Indexes for common queries
insuranceRecordSchema.index({ user: 1, policyType: 1 });
insuranceRecordSchema.index({ renewalDate: 1 });

// Middleware to track modifications
insuranceRecordSchema.pre('save', function(next) {
  if (this.isNew && this.user) this.createdBy = this.user;
  if (this.isModified() && !this.isNew) {
    const changes = {};
    this.modifiedPaths().forEach(path => {
      if (path !== 'history' && path !== 'lastModifiedBy' && path !== 'updatedAt') changes[path] = this[path];
    });
    if (Object.keys(changes).length > 0) {
      this.history.push({ modifiedBy: this.lastModifiedBy || this.user, modifiedAt: new Date(), changes });
    }
  }
  next();
});

module.exports = mongoose.model('InsuranceRecord', insuranceRecordSchema);
