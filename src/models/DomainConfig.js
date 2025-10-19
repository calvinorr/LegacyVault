// src/models/DomainConfig.js
// Mongoose model for admin configuration of domain taxonomy
// Allows admins to customize which record types are available for each domain

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Subdocument schema for custom record types
const CustomRecordTypeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  icon: { type: String }, // Lucide icon name
  color: { type: String }, // Hex color code for UI
  description: { type: String },
  requiredFields: {
    type: [String],
    default: []
  },
  displayOrder: { type: Number, default: 0 }
}, { _id: false });

const DomainConfigSchema = new Schema({
  // Domain type - must be unique (one config per domain)
  domainType: {
    type: String,
    enum: ['Vehicle', 'Property', 'Employment', 'Services', 'Finance'],
    required: true,
    unique: true
  },

  // Allowed standard record types for this domain
  allowedRecordTypes: {
    type: [String],
    enum: ['Contact', 'ServiceHistory', 'Finance', 'Insurance', 'Government', 'Pension'],
    default: ['Contact', 'ServiceHistory', 'Finance', 'Insurance', 'Government', 'Pension']
  },

  // Custom record types defined by admin (extensible taxonomy)
  customRecordTypes: {
    type: [CustomRecordTypeSchema],
    default: []
  },

  // UI configuration
  defaultView: {
    type: String,
    enum: ['list', 'grid', 'table'],
    default: 'list'
  },

  sortOrder: { type: Number, default: 0 }, // Display order in navigation

  // Feature flags for this domain
  features: {
    enableRenewalTracking: { type: Boolean, default: true },
    enableContactDirectory: { type: Boolean, default: true },
    enableFinancialTracking: { type: Boolean, default: true },
    enableDocumentAttachments: { type: Boolean, default: true }
  },

  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },

  notes: { type: String }
}, {
  timestamps: true
});

// Unique index on domainType (enforces one config per domain)
DomainConfigSchema.index({ domainType: 1 }, { unique: true });

// Instance method to check if a record type is allowed
DomainConfigSchema.methods.isRecordTypeAllowed = function(recordType) {
  // Check standard record types
  if (this.allowedRecordTypes.includes(recordType)) {
    return true;
  }

  // Check custom record types
  return this.customRecordTypes.some(custom => custom.name === recordType);
};

// Instance method to get all allowed record types (standard + custom)
DomainConfigSchema.methods.getAllAllowedRecordTypes = function() {
  const standardTypes = this.allowedRecordTypes.map(type => ({
    name: type,
    isCustom: false
  }));

  const customTypes = this.customRecordTypes.map(type => ({
    name: type.name,
    icon: type.icon,
    color: type.color,
    description: type.description,
    requiredFields: type.requiredFields,
    isCustom: true
  }));

  return [...standardTypes, ...customTypes].sort((a, b) => {
    if (a.displayOrder && b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    return a.name.localeCompare(b.name);
  });
};

// Static method to get or create default configuration for a domain
DomainConfigSchema.statics.getOrCreateDefaultConfig = async function(domainType) {
  let config = await this.findOne({ domainType });

  if (!config) {
    // Create default configuration based on domain type
    const defaultConfigs = {
      Vehicle: {
        allowedRecordTypes: ['Contact', 'Finance', 'Insurance', 'ServiceHistory', 'Government'],
        sortOrder: 1
      },
      Property: {
        allowedRecordTypes: ['Contact', 'Finance', 'Insurance', 'ServiceHistory', 'Government'],
        sortOrder: 2
      },
      Employment: {
        allowedRecordTypes: ['Contact', 'Finance', 'Pension'],
        sortOrder: 3
      },
      Services: {
        allowedRecordTypes: ['Contact', 'ServiceHistory'],
        sortOrder: 4
      },
      Finance: {
        allowedRecordTypes: ['Contact', 'Finance', 'Insurance'],
        sortOrder: 5
      }
    };

    const defaultConfig = defaultConfigs[domainType] || {
      allowedRecordTypes: ['Contact', 'ServiceHistory', 'Finance', 'Insurance', 'Government', 'Pension']
    };

    config = await this.create({
      domainType,
      ...defaultConfig
    });
  }

  return config;
};

// Static method to seed default configurations for all domains
DomainConfigSchema.statics.seedDefaultConfigs = async function() {
  const domains = ['Vehicle', 'Property', 'Employment', 'Services', 'Finance'];
  const results = [];

  for (const domain of domains) {
    const config = await this.getOrCreateDefaultConfig(domain);
    results.push(config);
  }

  return results;
};

module.exports = mongoose.model('DomainConfig', DomainConfigSchema);
