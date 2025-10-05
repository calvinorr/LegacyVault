// src/models/domain/GovernmentRecord.js
// Government domain records: NI number, tax, benefits, licences, passport, etc.

const mongoose = require('mongoose');
const { Schema } = mongoose;

const governmentRecordSchema = new Schema({
  // Common fields (all domains)
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  priority: { type: String, enum: ['Critical', 'Important', 'Standard'], default: 'Standard' },
  renewalDate: { type: Date },
  documentIds: [{ type: Schema.Types.ObjectId }], // Ready for Story 1.2 GridFS

  // Government-specific fields
  name: { type: String, required: true }, // e.g., "National Insurance", "Driving Licence", "Passport"
  recordType: { type: String, required: true }, // e.g., "ni", "tax", "benefit", "licence", "passport"
  niNumber: { type: String },
  taxReference: { type: String },
  benefitType: { type: String },
  benefitClaimNumber: { type: String },
  licenceNumber: { type: String },
  licenceExpiry: { type: Date },
  passportNumber: { type: String },
  passportExpiry: { type: Date },
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
governmentRecordSchema.index({ user: 1, recordType: 1 });
governmentRecordSchema.index({ licenceExpiry: 1 });
governmentRecordSchema.index({ passportExpiry: 1 });

// Middleware to track modifications
governmentRecordSchema.pre('save', function(next) {
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

module.exports = mongoose.model('GovernmentRecord', governmentRecordSchema);
