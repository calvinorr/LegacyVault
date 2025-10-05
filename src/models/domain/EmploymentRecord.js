// src/models/domain/EmploymentRecord.js
// Employment domain records: job details, pension, payroll, etc.

const mongoose = require('mongoose');
const { Schema } = mongoose;

const employmentRecordSchema = new Schema({
  // Common fields (all domains)
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  priority: { type: String, enum: ['Critical', 'Important', 'Standard'], default: 'Standard' },
  renewalDate: { type: Date },
  documentIds: [{ type: Schema.Types.ObjectId }], // Ready for Story 1.2 GridFS

  // Employment-specific fields
  name: { type: String, required: true }, // e.g., "Acme Corp Job", "Company Pension"
  recordType: { type: String, required: true }, // e.g., "employment", "pension", "payroll"
  employer: { type: String },
  jobTitle: { type: String },
  startDate: { type: Date },
  salary: { type: Number },
  payrollNumber: { type: String },
  pensionProvider: { type: String },
  pensionContribution: { type: Number },
  niNumber: { type: String },
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
employmentRecordSchema.index({ user: 1, recordType: 1 });
employmentRecordSchema.index({ renewalDate: 1 });

// Middleware to track modifications
employmentRecordSchema.pre('save', function(next) {
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

module.exports = mongoose.model('EmploymentRecord', employmentRecordSchema);
