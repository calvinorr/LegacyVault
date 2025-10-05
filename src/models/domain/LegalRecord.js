// src/models/domain/LegalRecord.js
// Legal & Estate domain records: wills, power of attorney, trusts, deeds, etc.

const mongoose = require('mongoose');
const { Schema } = mongoose;

const legalRecordSchema = new Schema({
  // Common fields (all domains)
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  priority: { type: String, enum: ['Critical', 'Important', 'Standard'], default: 'Standard' },
  renewalDate: { type: Date },
  documentIds: [{ type: Schema.Types.ObjectId }], // Ready for Story 1.2 GridFS

  // Legal-specific fields
  name: { type: String, required: true }, // e.g., "Last Will & Testament", "Lasting Power of Attorney"
  documentType: { type: String, required: true }, // e.g., "will", "poa", "trust", "deed"
  executionDate: { type: Date }, // Date the document was signed/executed
  solicitorName: { type: String },
  solicitorContact: { type: String },
  executorNames: { type: String }, // Comma-separated or text field
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
legalRecordSchema.index({ user: 1, documentType: 1 });
legalRecordSchema.index({ renewalDate: 1 });

// Middleware to track modifications
legalRecordSchema.pre('save', function(next) {
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

module.exports = mongoose.model('LegalRecord', legalRecordSchema);
