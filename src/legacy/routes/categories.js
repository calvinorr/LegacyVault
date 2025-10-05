// src/routes/categories.js
const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');

// Middleware for authentication and authorization
function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
}

// Require that the user is approved
function requireApproved(req, res, next) {
  if (req.user && req.user.approved) {
    return next();
  }
  return res.status(403).json({ error: 'Account requires approval' });
}

// All category routes require authentication and approval
router.use(requireAuth, requireApproved);

// GET /api/categories - Get all categories in hierarchical structure
router.get('/', CategoryController.getCategories);

// GET /api/categories/stats - Get category usage statistics
router.get('/stats', CategoryController.getCategoryStats);

// POST /api/categories - Create a new category
router.post('/', CategoryController.createCategory);

// GET /api/categories/:id - Get a specific category with details
router.get('/:id', CategoryController.getCategory);

// PUT /api/categories/:id - Update a category
router.put('/:id', CategoryController.updateCategory);

// DELETE /api/categories/:id - Soft delete a category
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;