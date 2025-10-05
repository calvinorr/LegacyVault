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

  // Audit trail fields
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  history: [{
    modifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    modifiedAt: { type: Date, default: Date.now },
    changes: { type: Map, of: Schema.Types.Mixed }
  }],

  // Bank Import metadata (Story 2.3)
  // This field tracks records created via Bank Import feature
  import_metadata: {
    source: { type: String }, // 'bank_import'
    import_session_id: { type: Schema.Types.ObjectId, ref: 'ImportSession' },
    created_from_suggestion: { type: Boolean },
    original_payee: { type: String },
    confidence_score: { type: Number },
    import_date: { type: Date },
    detected_frequency: { type: String },
    amount_pattern: {
      typical_amount: { type: Number },
      variance: { type: Number },
      currency: { type: String }
    }
  }
}, { timestamps: true });

// Indexes for common queries
financeRecordSchema.index({ user: 1, accountType: 1 });
financeRecordSchema.index({ renewalDate: 1 });

// Middleware to track modifications
financeRecordSchema.pre('save', function(next) {
  // Track creation
  if (this.isNew && this.user) {
    this.createdBy = this.user;
  }

  // Track modifications
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

module.exports = mongoose.model('FinanceRecord', financeRecordSchema);
