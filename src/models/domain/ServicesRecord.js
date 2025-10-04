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
  serviceType: { type: String, required: true }, // e.g., "plumber", "electrician", "cleaner", "gardener"
  tradesperson: { type: String }, // Name of person/company
  contactPhone: { type: String },
  contactEmail: { type: String },
  qualityRating: { type: Number, min: 1, max: 5 }, // 1-5 star rating
  jobHistory: { type: String }, // Text field for notes about jobs done
  notes: { type: String },
}, { timestamps: true });

// Indexes for common queries
servicesRecordSchema.index({ user: 1, serviceType: 1 });
servicesRecordSchema.index({ renewalDate: 1 });

module.exports = mongoose.model('ServicesRecord', servicesRecordSchema);
