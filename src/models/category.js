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
  }
}, {
  timestamps: true
});

// Indexes for performance
CategorySchema.index({ userId: 1 });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ userId: 1, parentId: 1 });
CategorySchema.index({ userId: 1, isDeleted: 1 });

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

module.exports = mongoose.model('Category', CategorySchema);