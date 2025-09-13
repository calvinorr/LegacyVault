// src/models/entry.js
// Mongoose model for a household vault entry (accounts, providers, policies, etc.)
// Keep fields intentionally simple and extensible.

const mongoose = require('mongoose');
const { Schema } = mongoose;

const AttachmentSchema = new Schema({
  filename: { type: String },
  url: { type: String },
  provider: { type: String }, // e.g., 's3', 'local'
}, { _id: false });

// Enhanced Renewal Info Schema for comprehensive UK financial product tracking
const RenewalInfoSchema = new Schema({
  // Core Date Information
  startDate: { type: Date }, // When product/contract started
  endDate: { type: Date }, // When product/contract ends
  reviewDate: { type: Date }, // Optional review/rate change date
  noticeDate: { type: Date }, // Deadline for giving notice
  
  // Product Classification
  productType: { type: String }, // Specific product type (e.g., 'Car Finance PCP')
  productCategory: { 
    type: String,
    enum: ['Finance', 'Contracts', 'Insurance', 'Official', 'Savings', 'Warranties', 'Professional']
  },
  endDateType: { 
    type: String, 
    enum: ['hard_end', 'auto_renewal', 'review_date', 'expiry_date', 'notice_deadline'],
    default: 'hard_end'
  },
  
  // Renewal Behavior
  renewalCycle: { 
    type: String, 
    enum: ['annual', 'monthly', 'quarterly', 'custom', 'one_time'],
    default: 'annual'
  },
  isAutoRenewal: { type: Boolean, default: false }, // Does it auto-renew unless cancelled?
  requiresAction: { type: Boolean, default: true }, // Must user take action or automatic?
  noticePeriod: { type: Number }, // Days notice required for changes/cancellation
  
  // Reminder Configuration
  reminderDays: { type: [Number] }, // Custom reminder schedule (overrides category defaults)
  urgencyLevel: { 
    type: String, 
    enum: ['critical', 'important', 'strategic'],
    default: 'important'
  },
  isActive: { type: Boolean, default: true }, // Is tracking currently enabled?
  
  // UK-Specific Fields
  regulatoryType: { 
    type: String, 
    enum: ['fca_regulated', 'government_required', 'contractual', 'voluntary']
  },
  complianceNotes: { type: String }, // Special compliance requirements
  
  // Reference Information
  referenceNumbers: [{
    type: { type: String }, // 'policy_number', 'agreement_number', 'licence_number'
    value: { type: String },
    issuer: { type: String }
  }],
  
  // Document Links
  linkedDocuments: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
  
  // History Tracking
  renewalHistory: [{
    date: { type: Date },
    action: { 
      type: String, 
      enum: ['renewed', 'switched', 'cancelled', 'expired']
    },
    notes: { type: String },
    costChange: { type: Number } // Price difference from previous term
  }],
  
  // Last Processing
  lastReminderSent: { type: Date },
  lastProcessedDate: { type: Date },
  nextReminderDue: { type: Date },

  // Legacy fields for backward compatibility
  customCycleDays: { type: Number }, // For custom cycles, number of days
  autoRenewal: { type: Boolean, default: false }, // Legacy field mapped to isAutoRenewal
  lastRenewalDate: { type: Date }, // When it was last renewed
  notes: { type: String } // Additional renewal notes
}, { _id: false });

const EntrySchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['account', 'utility', 'bill', 'pension', 'policy', 'provider', 'note', 'other'], default: 'other' },
  provider: { type: String }, // e.g., 'NatWest', 'British Gas', insurer name
  accountDetails: { type: Schema.Types.Mixed }, // store provider-specific structured data
  
  // Renewal tracking information (stored within accountDetails structure for flexibility)
  renewalInfo: { type: RenewalInfoSchema }, // Optional renewal tracking data
  
  notes: { type: String },
  attachments: { type: [AttachmentSchema], default: [] },
  // Categorization system (legacy string-based categories for backward compatibility)
  category: { 
    type: String, 
    enum: ['Banking', 'Insurance', 'Utilities', 'Bills', 'Subscriptions', 'Investments', 'Property', 'Pensions', 'Other'], 
    default: 'Other' 
  },
  subCategory: { type: String }, // e.g., 'Home Insurance', 'Car Insurance' under 'Insurance'
  
  // New hierarchical category system (optional reference to Category model)
  categoryId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category',
    default: null
  },
  
  tags: { type: [String], default: [] }, // e.g., ['Sky', 'Monthly', 'Direct Debit']
  supplier: { type: String }, // Normalized supplier name for grouping (e.g., 'Sky', 'British Gas')
  
  // Import tracking
  import_metadata: {
    source: { type: String, enum: ['manual', 'bank_import', 'csv_import'], default: 'manual' },
    import_session_id: { type: Schema.Types.ObjectId, ref: 'ImportSession' },
    created_from_suggestion: { type: Boolean, default: false },
    original_payee: { type: String }, // Original payee name from bank statement
    confidence_score: { type: Number }, // Algorithm confidence when created from import
    import_date: { type: Date },
    detected_frequency: { type: String, enum: ['weekly', 'monthly', 'quarterly', 'annually', 'irregular'] },
    amount_pattern: {
      typical_amount: { type: Number },
      variance: { type: Number },
      currency: { type: String, default: 'GBP' }
    }
  },
  
  //
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // user who created the entry
  sharedWith: { type: [Schema.Types.ObjectId], ref: 'User', default: [] }, // optional sharing
  confidential: { type: Boolean, default: true },
  lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

// Indexes for performance
EntrySchema.index({ owner: 1 });
EntrySchema.index({ categoryId: 1 });
EntrySchema.index({ 'import_metadata.import_session_id': 1 });

// Enhanced renewal tracking indexes for efficient querying
EntrySchema.index({ 'renewalInfo.endDate': 1 }); // Find entries expiring soon
EntrySchema.index({ 'renewalInfo.reviewDate': 1 }); // Find entries needing review
EntrySchema.index({ 'renewalInfo.noticeDate': 1 }); // Find entries approaching notice deadline
EntrySchema.index({ 'renewalInfo.isActive': 1, 'renewalInfo.endDate': 1 }); // Active renewals by date
EntrySchema.index({ 'renewalInfo.productCategory': 1, 'renewalInfo.endDate': 1 }); // By category and date
EntrySchema.index({ 'renewalInfo.urgencyLevel': 1, 'renewalInfo.endDate': 1 }); // By urgency and date
EntrySchema.index({ owner: 1, 'renewalInfo.isActive': 1, 'renewalInfo.endDate': 1 }); // User's active renewals
EntrySchema.index({ 'renewalInfo.nextReminderDue': 1 }); // For reminder processing

// Instance method to check if entry needs renewal reminder
EntrySchema.methods.needsRenewalReminder = function(daysAhead) {
  if (!this.renewalInfo || !this.renewalInfo.isActive || !this.renewalInfo.endDate) {
    return false;
  }

  const today = new Date();
  const endDate = new Date(this.renewalInfo.endDate);
  const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  
  return this.renewalInfo.reminderDays.includes(daysAhead) && daysUntilExpiry === daysAhead;
};

// Instance method to get next renewal date based on cycle
EntrySchema.methods.getNextRenewalDate = function() {
  if (!this.renewalInfo || !this.renewalInfo.endDate) {
    return null;
  }

  const currentEndDate = new Date(this.renewalInfo.endDate);
  let nextRenewalDate = new Date(currentEndDate);

  switch (this.renewalInfo.renewalCycle) {
    case 'monthly':
      nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 3);
      break;
    case 'bi-annually':
      nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 6);
      break;
    case 'annually':
      nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
      break;
    case 'custom':
      if (this.renewalInfo.customCycleDays) {
        nextRenewalDate.setDate(nextRenewalDate.getDate() + this.renewalInfo.customCycleDays);
      }
      break;
  }

  return nextRenewalDate;
};

// Static method to find entries needing renewal reminders
EntrySchema.statics.findEntriesNeedingReminders = function(daysAhead = null) {
  const query = {
    'renewalInfo.isActive': true,
    'renewalInfo.endDate': { $exists: true }
  };

  if (daysAhead !== null) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    
    // Find entries where endDate matches the target date and reminderDays includes daysAhead
    query['renewalInfo.endDate'] = {
      $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
      $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
    };
    query['renewalInfo.reminderDays'] = daysAhead;
  }

  return this.find(query).populate('owner', 'email displayName');
};

module.exports = mongoose.model('Entry', EntrySchema);