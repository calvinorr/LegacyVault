const Category = require('../models/category');
const Entry = require('../models/entry');
const mongoose = require('mongoose');

class CategoryController {
  // Get all categories for a user (hierarchical tree structure)
  static async getCategories(req, res) {
    try {
      const userId = req.user._id;
      
      // Build hierarchical tree structure
      const tree = await Category.buildTree(userId);
      
      res.json({
        categories: tree,
        total: await Category.countDocuments({ 
          userId: userId, 
          isDeleted: false 
        })
      });

    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Failed to retrieve categories' });
    }
  }

  // Create a new category
  static async createCategory(req, res) {
    try {
      const { name, description, parentId } = req.body;
      const userId = req.user._id;

      // Validate required fields
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      // Validate parent category if provided
      if (parentId) {
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
          return res.status(400).json({ error: 'Invalid parent category ID' });
        }

        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
          return res.status(400).json({ error: 'Parent category not found' });
        }

        // Verify parent belongs to the same user or is a system category
        if (!parentCategory.userId.equals(userId) && !parentCategory.isSystemCategory) {
          return res.status(403).json({ error: 'Cannot use another user\'s category as parent' });
        }
      }

      // Check for duplicate name under same parent for same user
      const existingCategory = await Category.findOne({
        userId: userId,
        name: name.trim(),
        parentId: parentId || null,
        isDeleted: false
      });

      if (existingCategory) {
        return res.status(409).json({ 
          error: 'A category with this name already exists at this level' 
        });
      }

      const category = new Category({
        name: name.trim(),
        description: description?.trim(),
        parentId: parentId || null,
        userId: userId,
        isSystemCategory: false
      });

      const savedCategory = await category.save();

      res.status(201).json({ 
        category: savedCategory,
        message: 'Category created successfully'
      });

    } catch (error) {
      console.error('Create category error:', error);
      
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Failed to create category' });
    }
  }

  // Update a category
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description, parentId } = req.body;
      const userId = req.user._id;

      // Validate ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      // Find the category
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Check ownership (users can only update their own categories, not system categories)
      if (!category.userId.equals(userId)) {
        return res.status(403).json({ error: 'You can only update your own categories' });
      }

      if (category.isSystemCategory && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only administrators can update system categories' });
      }

      // Validate name if provided
      if (name !== undefined) {
        if (!name || !name.trim()) {
          return res.status(400).json({ error: 'Category name cannot be empty' });
        }

        // Check for duplicate name (excluding current category)
        const existingCategory = await Category.findOne({
          _id: { $ne: id },
          userId: userId,
          name: name.trim(),
          parentId: parentId !== undefined ? (parentId || null) : category.parentId,
          isDeleted: false
        });

        if (existingCategory) {
          return res.status(409).json({ 
            error: 'A category with this name already exists at this level' 
          });
        }
      }

      // Validate parent category if provided
      if (parentId !== undefined && parentId !== null) {
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
          return res.status(400).json({ error: 'Invalid parent category ID' });
        }

        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
          return res.status(400).json({ error: 'Parent category not found' });
        }

        // Verify parent belongs to the same user or is a system category
        if (!parentCategory.userId.equals(userId) && !parentCategory.isSystemCategory) {
          return res.status(403).json({ error: 'Cannot use another user\'s category as parent' });
        }
      }

      // Update fields
      if (name !== undefined) category.name = name.trim();
      if (description !== undefined) category.description = description?.trim() || '';
      if (parentId !== undefined) category.parentId = parentId || null;

      const updatedCategory = await category.save();

      res.json({ 
        category: updatedCategory,
        message: 'Category updated successfully'
      });

    } catch (error) {
      console.error('Update category error:', error);

      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Failed to update category' });
    }
  }

  // Delete a category (soft delete)
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const { deleteChildren = false } = req.query;

      // Validate ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      // Find the category
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Check ownership
      if (!category.userId.equals(userId)) {
        return res.status(403).json({ error: 'You can only delete your own categories' });
      }

      if (category.isSystemCategory && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only administrators can delete system categories' });
      }

      // Check if category is already deleted
      if (category.isDeleted) {
        return res.status(410).json({ error: 'Category is already deleted' });
      }

      // Check for child categories
      const childCategories = await Category.find({
        parentId: id,
        isDeleted: false
      });

      if (childCategories.length > 0 && deleteChildren !== 'true') {
        return res.status(400).json({
          error: 'Category has child categories',
          childCount: childCategories.length,
          message: 'Use deleteChildren=true parameter to delete all child categories'
        });
      }

      // Check if any entries are using this category
      const entriesUsingCategory = await Entry.countDocuments({
        categoryId: id,
        owner: userId
      });

      if (entriesUsingCategory > 0) {
        return res.status(400).json({
          error: 'Category is being used by entries',
          entriesCount: entriesUsingCategory,
          message: 'Cannot delete a category that is assigned to entries'
        });
      }

      // Perform soft delete
      category.isDeleted = true;
      await category.save();

      let deletedChildrenCount = 0;
      
      // Delete children if requested
      if (deleteChildren === 'true' && childCategories.length > 0) {
        // Get all descendant categories recursively
        const allChildren = await category.getAllChildren();
        
        // Soft delete all children
        for (const child of allChildren) {
          child.isDeleted = true;
          await child.save();
          deletedChildrenCount++;
        }
      }

      res.json({
        message: 'Category deleted successfully',
        deletedCategory: {
          id: category._id,
          name: category.name
        },
        deletedChildrenCount: deletedChildrenCount
      });

    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }

  // Get a specific category with its full path
  static async getCategory(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      // Validate ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      // Find the category
      const category = await Category.findById(id)
        .populate('parentId', 'name')
        .populate('userId', 'displayName email');

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Check access (user can view their own categories and system categories)
      if (!category.userId.equals(userId) && !category.isSystemCategory) {
        return res.status(403).json({ error: 'Access denied to this category' });
      }

      // Get full path and children
      const fullPath = await category.getFullPath();
      const children = await Category.findChildren(id, userId);
      
      // Count entries using this category
      const entriesCount = await Entry.countDocuments({
        categoryId: id,
        owner: userId
      });

      res.json({
        category: {
          ...category.toObject(),
          fullPath,
          childrenCount: children.length,
          entriesCount
        },
        children
      });

    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({ error: 'Failed to retrieve category' });
    }
  }

  // Get categories usage statistics
  static async getCategoryStats(req, res) {
    try {
      const userId = req.user._id;

      // Get total categories count
      const totalCategories = await Category.countDocuments({
        userId: userId,
        isDeleted: false
      });

      // Get root categories count
      const rootCategories = await Category.countDocuments({
        userId: userId,
        parentId: null,
        isDeleted: false
      });

      // Get system categories accessible to user
      const systemCategories = await Category.countDocuments({
        isSystemCategory: true,
        isDeleted: false
      });

      // Get categories with entries
      const categoriesWithEntries = await Entry.aggregate([
        {
          $match: {
            owner: userId,
            categoryId: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$categoryId',
            entriesCount: { $sum: 1 }
          }
        }
      ]);

      res.json({
        totalCategories,
        rootCategories,
        systemCategories,
        categoriesInUse: categoriesWithEntries.length,
        categoryUsage: categoriesWithEntries
      });

    } catch (error) {
      console.error('Get category stats error:', error);
      res.status(500).json({ error: 'Failed to retrieve category statistics' });
    }
  }
}

module.exports = CategoryController;