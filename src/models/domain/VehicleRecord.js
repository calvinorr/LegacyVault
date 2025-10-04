// src/models/domain/VehicleRecord.js
// Vehicle domain records: vehicle details, insurance, MOT, road tax, finance, etc.

const mongoose = require('mongoose');
const { Schema } = mongoose;

const vehicleRecordSchema = new Schema({
  // Common fields (all domains)
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  priority: { type: String, enum: ['Critical', 'Important', 'Standard'], default: 'Standard' },
  renewalDate: { type: Date },
  documentIds: [{ type: Schema.Types.ObjectId }], // Ready for Story 1.2 GridFS

  // Vehicle-specific fields
  name: { type: String, required: true }, // e.g., "Family Car", "Car Insurance"
  recordType: { type: String, required: true }, // e.g., "vehicle-details", "insurance", "mot", "finance"
  registration: { type: String },
  make: { type: String },
  model: { type: String },
  purchaseDate: { type: Date },
  financeProvider: { type: String },
  financeMonthlyPayment: { type: Number },
  motExpiryDate: { type: Date },
  insuranceRenewalDate: { type: Date },
  roadTaxExpiryDate: { type: Date },
  notes: { type: String },
}, { timestamps: true });

// Indexes for common queries
vehicleRecordSchema.index({ user: 1, recordType: 1 });
vehicleRecordSchema.index({ motExpiryDate: 1 });
vehicleRecordSchema.index({ insuranceRenewalDate: 1 });
vehicleRecordSchema.index({ roadTaxExpiryDate: 1 });

module.exports = mongoose.model('VehicleRecord', vehicleRecordSchema);
