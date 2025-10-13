// src/models/domain/ServicesRecord.js
// Household Services domain records: plumbers, electricians, cleaners, gardeners, etc.

const mongoose = require('mongoose');
const { Schema } = mongoose;

const servicesRecordSchema = new Schema({
  // Common fields (all domains)
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  priority: { type: String, enum: ['Critical', 'Important', 'Standard'], default: 'Standard' },
  renewalDate: { type: Date },
  documentIds: [{ type: Schema.Types.ObjectId }], // Ready for Story 1.2 GridFS

  // Services-specific fields
  name: { type: String, required: true }, // e.g., "Plumber - Smith & Sons", "Gardener"
  recordType: { type: String, required: true }, // User-defined type from Settings (e.g., "Streaming", "Plumbing", "Broadband")
  serviceProvider: { type: String }, // Name of person/company (formerly tradesperson)
  contactPhone: { type: String },
  contactEmail: { type: String },
  qualityRating: { type: Number, min: 1, max: 5 }, // 1-5 star rating
  jobHistory: { type: String }, // Text field for notes about jobs done
  notes: { type: String },
  serviceName: { type: String },

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
servicesRecordSchema.index({ user: 1, recordType: 1 });
servicesRecordSchema.index({ renewalDate: 1 });

// Middleware to track modifications
servicesRecordSchema.pre('save', function(next) {
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

module.exports = mongoose.model('ServicesRecord', servicesRecordSchema);
