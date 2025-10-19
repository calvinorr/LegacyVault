// src/models/ParentEntity.js
// Mongoose model for parent entities in the hierarchical domain model
// Supports Vehicle, Property, Employment, and Services domains

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ParentEntitySchema = new Schema({
  // User reference
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Domain type - one of the five parent domains
  domainType: {
    type: String,
    enum: ['Vehicle', 'Property', 'Employment', 'Services', 'Finance'],
    required: true,
    index: true
  },

  // Display name for the parent entity
  name: {
    type: String,
    required: true
  },

  // Domain-specific fields stored as flexible Mixed type
  // Vehicle: { make, model, year, registration, vin }
  // Property: { address, type, ownership, councilTaxBand }
  // Employment: { employer, jobTitle, employmentType, startDate }
  // Services: { businessName, serviceType, contactPerson, phone, email }
  // Finance: { accountType, institution, accountNumber, sortCode, currency }
  fields: {
    type: Schema.Types.Mixed,
    default: () => ({})
  },

  // Metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },

  notes: { type: String },

  // Image field for entity thumbnail
  image: {
    filename: String,
    data: Buffer,
    contentType: String,
    uploadedAt: Date
  },

  // Audit fields
  lastUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index for efficient querying by user and domain
ParentEntitySchema.index({ userId: 1, domainType: 1 });

// Index for name search within domain
ParentEntitySchema.index({ userId: 1, domainType: 1, name: 1 });

// Instance method to get all child records
ParentEntitySchema.methods.getChildRecords = function() {
  const ChildRecord = mongoose.model('ChildRecord');
  return ChildRecord.find({ parentId: this._id }).sort({ createdAt: -1 });
};

// Instance method to count child records by type
ParentEntitySchema.methods.countChildRecordsByType = async function() {
  const ChildRecord = mongoose.model('ChildRecord');
  const counts = await ChildRecord.aggregate([
    { $match: { parentId: this._id } },
    { $group: { _id: '$recordType', count: { $sum: 1 } } }
  ]);

  return counts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
};

// Static method to find entities with populated child records
ParentEntitySchema.statics.findWithChildren = function(query) {
  return this.find(query)
    .populate({
      path: 'userId',
      select: 'displayName email'
    })
    .lean();
};

module.exports = mongoose.model('ParentEntity', ParentEntitySchema);
