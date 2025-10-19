// src/models/ChildRecord.js
// Mongoose model for child records in the hierarchical domain model
// Focuses on continuity planning with contact info and renewal dates as priorities

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChildRecordSchema = new Schema({
  // User reference
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Parent entity reference (required - all child records must belong to a parent)
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'ParentEntity',
    required: true,
    index: true
  },

  // Record type - one of six child record types
  recordType: {
    type: String,
    enum: ['Contact', 'ServiceHistory', 'Finance', 'Insurance', 'Government', 'Pension'],
    required: true,
    index: true
  },

  // Display name for the record
  name: {
    type: String,
    required: true
  },

  // ===========================
  // CONTINUITY PLANNING FIELDS (Priority)
  // ===========================

  // Contact information - critical for "who do I call?" questions
  contactName: { type: String },
  phone: { type: String },
  email: { type: String },

  // Account/Policy numbers - critical for identification
  accountNumber: { type: String },
  policyNumber: { type: String },

  // Renewal tracking - critical for avoiding lapses
  renewalDate: {
    type: Date,
    index: true // Index for efficient renewal queries
  },

  // ===========================
  // FINANCIAL FIELDS (Secondary)
  // ===========================

  amount: { type: Number },
  frequency: {
    type: String,
    enum: ['one-time', 'weekly', 'monthly', 'quarterly', 'annually', 'custom']
  },

  // ===========================
  // COMMON FIELDS
  // ===========================

  provider: { type: String }, // Company/organization name
  startDate: { type: Date },
  endDate: { type: Date },

  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'cancelled'],
    default: 'active'
  },

  notes: { type: String },

  // Document attachments
  attachments: [{
    filename: { type: String },
    url: { type: String },
    provider: { type: String } // e.g., 's3', 'local'
  }],

  // Metadata for flexible storage of record-type-specific fields
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },

  // Audit fields
  lastUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
ChildRecordSchema.index({ userId: 1, parentId: 1, recordType: 1 });
ChildRecordSchema.index({ userId: 1, recordType: 1 });

// Index for renewal date queries (upcoming renewals dashboard)
ChildRecordSchema.index({ renewalDate: 1, status: 1 });

// Index for contact directory queries
ChildRecordSchema.index({ userId: 1, contactName: 1 });
ChildRecordSchema.index({ userId: 1, email: 1 });
ChildRecordSchema.index({ userId: 1, phone: 1 });

// Instance method to check if renewal is upcoming
ChildRecordSchema.methods.isRenewalUpcoming = function(daysAhead = 30) {
  if (!this.renewalDate) return false;

  const today = new Date();
  const renewal = new Date(this.renewalDate);
  const daysUntilRenewal = Math.ceil((renewal - today) / (1000 * 60 * 60 * 24));

  return daysUntilRenewal > 0 && daysUntilRenewal <= daysAhead;
};

// Instance method to get renewal urgency level
ChildRecordSchema.methods.getRenewalUrgency = function() {
  if (!this.renewalDate) return null;

  const today = new Date();
  const renewal = new Date(this.renewalDate);
  const daysUntilRenewal = Math.ceil((renewal - today) / (1000 * 60 * 60 * 24));

  if (daysUntilRenewal < 0) return 'expired';
  if (daysUntilRenewal <= 30) return 'critical';
  if (daysUntilRenewal <= 90) return 'important';
  return 'upcoming';
};

// Instance method to populate parent entity
ChildRecordSchema.methods.getParentEntity = function() {
  const ParentEntity = mongoose.model('ParentEntity');
  return ParentEntity.findById(this.parentId);
};

// Static method to find upcoming renewals across all domains
ChildRecordSchema.statics.findUpcomingRenewals = function(userId, daysAhead = 90) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);

  return this.find({
    userId,
    renewalDate: {
      $gte: today,
      $lte: futureDate
    },
    status: { $in: ['active', 'inactive'] }
  })
    .populate('parentId', 'name domainType')
    .sort({ renewalDate: 1 })
    .lean();
};

// Static method to find all contacts for a user (Contact Directory)
ChildRecordSchema.statics.findContacts = function(userId, filters = {}) {
  const query = {
    userId,
    $or: [
      { contactName: { $exists: true, $ne: '' } },
      { phone: { $exists: true, $ne: '' } },
      { email: { $exists: true, $ne: '' } }
    ]
  };

  if (filters.recordType) {
    query.recordType = filters.recordType;
  }

  if (filters.search) {
    query.$or = [
      { contactName: { $regex: filters.search, $options: 'i' } },
      { phone: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
      { provider: { $regex: filters.search, $options: 'i' } }
    ];
  }

  return this.find(query)
    .populate('parentId', 'name domainType')
    .sort({ contactName: 1 })
    .lean();
};

// Static method to count records by type for a parent entity
ChildRecordSchema.statics.countByType = function(parentId) {
  return this.aggregate([
    { $match: { parentId: new mongoose.Types.ObjectId(parentId) } },
    { $group: { _id: '$recordType', count: { $sum: 1 } } }
  ]);
};

module.exports = mongoose.model('ChildRecord', ChildRecordSchema);
