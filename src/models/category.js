// src/models/category.js
// Mongoose model for hierarchical category system for financial entries
// Supports parent-child relationships, UK financial categories, and soft delete

const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String,
    trim: true,
    maxlength: 500
  },
  // Parent category reference for hierarchical structure
  parentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category',
    default: null
  },
  // User who owns this category
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  // System categories cannot be deleted by regular users
  isSystemCategory: { 
    type: Boolean, 
    default: false
  },
  // Soft delete support to maintain entry relationships
  isDeleted: { 
    type: Boolean, 
    default: false
  },
  
  // Enhanced renewal configuration for UK financial products
  renewalSettings: {
    // Core renewal configuration
    isRenewalCategory: { type: Boolean, default: false }, // Does this category track renewals?
    defaultReminderDays: { type: [Number], default: [] }, // Default reminder schedule for this category
    urgencyLevel: { 
      type: String, 
      enum: ['critical', 'important', 'strategic'],
      default: 'important'
    },
    
    // UK-specific product categorization
    productCategory: { 
      type: String,
      enum: ['Finance', 'Contracts', 'Insurance', 'Official', 'Savings', 'Warranties', 'Professional', null],
      default: null
    },
    
    // Default product behavior for this category
    defaultEndDateType: { 
      type: String, 
      enum: ['hard_end', 'auto_renewal', 'review_date', 'expiry_date', 'notice_deadline'],
      default: 'hard_end'
    },
    defaultRenewalCycle: { 
      type: String, 
      enum: ['annual', 'monthly', 'quarterly', 'custom', 'one_time'],
      default: 'annual'
    },
    defaultNoticePeriod: { type: Number }, // Default notice period in days
    
    // UK regulatory classification
    regulatoryType: { 
      type: String, 
      enum: ['fca_regulated', 'government_required', 'contractual', 'voluntary', null],
      default: null
    },
    
    // Category-specific guidance
    renewalGuidance: { type: String }, // Guidance text for this product category
    complianceNotes: { type: String }, // Special compliance requirements
    
    // Mapping for legacy categories
    legacyCategoryMapping: { type: String }, // Maps to old category enum values
    
    // Product type detection hints
    namePatterns: [{ type: String }], // Patterns to detect this category from entry names
    providerPatterns: [{ type: String }], // Patterns to detect this category from provider names
    
    // Financial product metadata
    averageTermMonths: { type: Number }, // Typical contract length for this category
    requiresAction: { type: Boolean, default: true }, // Does renewal typically require user action?
    isAutoRenewal: { type: Boolean, default: false }, // Does this category typically auto-renew?
    
    // UK-specific features
    bankHolidayAware: { type: Boolean, default: true }, // Should reminders avoid UK bank holidays?
    taxYearRelevant: { type: Boolean, default: false }, // Is this relevant to UK tax year (April 5th)?
    
    // Processing configuration
    enabledForReminders: { type: Boolean, default: true }, // Include in reminder processing?
    urgencyBoost: { type: Boolean, default: false } // Add extra urgency to reminders?
  }
}, {
  timestamps: true
});

// Indexes for performance
CategorySchema.index({ userId: 1 });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ userId: 1, parentId: 1 });
CategorySchema.index({ userId: 1, isDeleted: 1 });

// Enhanced indexes for renewal functionality
CategorySchema.index({ 'renewalSettings.isRenewalCategory': 1 });
CategorySchema.index({ 'renewalSettings.productCategory': 1 });
CategorySchema.index({ 'renewalSettings.urgencyLevel': 1 });
CategorySchema.index({ userId: 1, 'renewalSettings.isRenewalCategory': 1 });

// Pre-save validation to prevent circular references
CategorySchema.pre('save', async function(next) {
  // Skip validation if parentId is not being modified or is null
  if (!this.isModified('parentId') || !this.parentId) {
    return next();
  }

  // Prevent self-reference
  if (this.parentId.equals(this._id)) {
    const error = new Error('Category cannot be its own parent');
    error.name = 'ValidationError';
    return next(error);
  }

  // Check for circular reference by traversing up the parent chain
  try {
    let currentParentId = this.parentId;
    const visitedIds = new Set();
    
    while (currentParentId) {
      // If we've seen this ID before, we have a circular reference
      if (visitedIds.has(currentParentId.toString())) {
        const error = new Error('Circular reference detected in category hierarchy');
        error.name = 'ValidationError';
        return next(error);
      }
      
      visitedIds.add(currentParentId.toString());
      
      // If this would create a circular reference with the current category
      if (currentParentId.equals(this._id)) {
        const error = new Error('Circular reference detected in category hierarchy');
        error.name = 'ValidationError';
        return next(error);
      }
      
      // Get the parent category
      const parentCategory = await this.constructor.findById(currentParentId);
      if (!parentCategory) {
        const error = new Error('Parent category not found');
        error.name = 'ValidationError';
        return next(error);
      }
      
      currentParentId = parentCategory.parentId;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to get full category path
CategorySchema.methods.getFullPath = async function() {
  const path = [this.name];
  let currentParentId = this.parentId;
  
  while (currentParentId) {
    const parent = await this.constructor.findById(currentParentId);
    if (!parent) break;
    path.unshift(parent.name);
    currentParentId = parent.parentId;
  }
  
  return path.join(' > ');
};

// Instance method to get all child categories (recursive)
CategorySchema.methods.getAllChildren = async function() {
  const children = [];
  
  const directChildren = await this.constructor.find({ 
    parentId: this._id,
    isDeleted: false
  });
  
  for (const child of directChildren) {
    children.push(child);
    const grandChildren = await child.getAllChildren();
    children.push(...grandChildren);
  }
  
  return children;
};

// Static method to find root categories for a user
CategorySchema.statics.findRootCategories = function(userId) {
  return this.find({
    userId: userId,
    parentId: null,
    isDeleted: false
  }).sort({ name: 1 });
};

// Static method to find children of a specific category
CategorySchema.statics.findChildren = function(parentId, userId = null) {
  const query = {
    parentId: parentId,
    isDeleted: false
  };
  
  if (userId) {
    query.userId = userId;
  }
  
  return this.find(query).sort({ name: 1 });
};

// Static method to build hierarchical tree structure
CategorySchema.statics.buildTree = async function(userId) {
  const allCategories = await this.find({
    userId: userId,
    isDeleted: false
  }).sort({ name: 1 });
  
  // Create a map for quick lookup
  const categoryMap = new Map();
  allCategories.forEach(cat => {
    categoryMap.set(cat._id.toString(), {
      ...cat.toObject(),
      children: []
    });
  });
  
  // Build the tree structure
  const rootCategories = [];
  
  allCategories.forEach(cat => {
    const categoryData = categoryMap.get(cat._id.toString());
    
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId.toString());
      if (parent) {
        parent.children.push(categoryData);
      } else {
        // Parent is not available (deleted or not accessible), make this a root category
        rootCategories.push(categoryData);
      }
    } else {
      rootCategories.push(categoryData);
    }
  });
  
  return rootCategories;
};

// Virtual for checking if category has children
CategorySchema.virtual('hasChildren').get(function() {
  // This would need to be populated separately for performance
  return this._hasChildren || false;
});

// Static method to find renewal-enabled categories
CategorySchema.statics.findRenewalCategories = function(userId) {
  return this.find({
    userId: userId,
    isDeleted: false,
    'renewalSettings.isRenewalCategory': true
  }).sort({ name: 1 });
};

// Static method to find categories by product category
CategorySchema.statics.findByProductCategory = function(productCategory, userId = null) {
  const query = {
    isDeleted: false,
    'renewalSettings.productCategory': productCategory
  };
  
  if (userId) {
    query.userId = userId;
  }
  
  return this.find(query).sort({ name: 1 });
};

// Static method to detect category from entry data
CategorySchema.statics.detectCategoryFromEntry = async function(entryData, userId) {
  if (!entryData.title && !entryData.provider) {
    return null;
  }
  
  const title = (entryData.title || '').toLowerCase();
  const provider = (entryData.provider || '').toLowerCase();
  
  // Find categories with matching patterns
  const categories = await this.find({
    userId: userId,
    isDeleted: false,
    'renewalSettings.isRenewalCategory': true,
    $or: [
      { 'renewalSettings.namePatterns': { $elemMatch: { $regex: new RegExp(title, 'i') } } },
      { 'renewalSettings.providerPatterns': { $elemMatch: { $regex: new RegExp(provider, 'i') } } }
    ]
  });
  
  // Return the first match with highest priority (system categories first)
  return categories.sort((a, b) => {
    if (a.isSystemCategory && !b.isSystemCategory) return -1;
    if (!a.isSystemCategory && b.isSystemCategory) return 1;
    return 0;
  })[0] || null;
};

// Instance method to get renewal defaults for new entries
CategorySchema.methods.getRenewalDefaults = function() {
  if (!this.renewalSettings?.isRenewalCategory) {
    return null;
  }
  
  return {
    productCategory: this.renewalSettings.productCategory,
    endDateType: this.renewalSettings.defaultEndDateType,
    renewalCycle: this.renewalSettings.defaultRenewalCycle,
    reminderDays: this.renewalSettings.defaultReminderDays,
    urgencyLevel: this.renewalSettings.urgencyLevel,
    requiresAction: this.renewalSettings.requiresAction,
    isAutoRenewal: this.renewalSettings.isAutoRenewal,
    noticePeriod: this.renewalSettings.defaultNoticePeriod,
    regulatoryType: this.renewalSettings.regulatoryType
  };
};

module.exports = mongoose.model('Category', CategorySchema);