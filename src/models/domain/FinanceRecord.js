// src/models/domain/FinanceRecord.js
// Finance domain records: bank accounts, savings, ISAs, credit cards, loans, etc.

const mongoose = require('mongoose');
const { Schema } = mongoose;

const financeRecordSchema = new Schema({
  // Common fields (all domains)
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  priority: { type: String, enum: ['Critical', 'Important', 'Standard'], default: 'Standard' },
  renewalDate: { type: Date },
  documentIds: [{ type: Schema.Types.ObjectId }], // Ready for Story 1.2 GridFS

  // Finance-specific fields
  name: { type: String, required: true }, // e.g., "HSBC Current Account", "Halifax ISA"
  accountType: { type: String, required: true }, // e.g., "current", "savings", "isa", "credit-card", "loan"
  institution: { type: String },
  sortCode: { type: String }, // Format: XX-XX-XX (UK banking)
  accountNumber: { type: String },
  balance: { type: Number },
  interestRate: { type: Number },
  creditLimit: { type: Number }, // For credit cards
  monthlyPayment: { type: Number }, // For loans
  notes: { type: String },
}, { timestamps: true });

// Indexes for common queries
financeRecordSchema.index({ user: 1, accountType: 1 });
financeRecordSchema.index({ renewalDate: 1 });

module.exports = mongoose.model('FinanceRecord', financeRecordSchema);
