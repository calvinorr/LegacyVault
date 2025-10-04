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
}, { timestamps: true });

// Indexes for common queries
propertyRecordSchema.index({ user: 1, recordType: 1 });
propertyRecordSchema.index({ renewalDate: 1 });

module.exports = mongoose.model('PropertyRecord', propertyRecordSchema);
