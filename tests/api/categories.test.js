const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Category = require('../../src/models/category');
const User = require('../../src/models/user');
const Entry = require('../../src/models/entry');
const categoriesRouter = require('../../src/routes/categories');

describe('Categories API', () => {
  let app, testUser, adminUser, otherUser;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware
    app.use((req, res, next) => {
      req.isAuthenticated = () => true;
      req.user = req.headers['test-user-id'] 
        ? { _id: new mongoose.Types.ObjectId(req.headers['test-user-id']), approved: true }
        : testUser;
      next();
    });
    
    app.use('/api/categories', categoriesRouter);
  });

  beforeEach(async () => {
    // Create test users
    testUser = new User({
      googleId: 'test123',
      displayName: 'Test User',
      email: 'test@example.com',
      approved: true,
      role: 'user'
    });
    await testUser.save();

    adminUser = new User({
      googleId: 'admin123',
      displayName: 'Admin User', 
      email: 'admin@example.com',
      approved: true,
      role: 'admin'
    });
    await adminUser.save();

    otherUser = new User({
      googleId: 'other123',
      displayName: 'Other User',
      email: 'other@example.com', 
      approved: true,
      role: 'user'
    });
    await otherUser.save();
  });

  describe('POST /api/categories', () => {
    test('should create a new category', async () => {
      const categoryData = {
        name: 'Banking',
        description: 'All banking accounts'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(categoryData);

      expect(response.status).toBe(201);
      expect(response.body.category.name).toBe('Banking');
      expect(response.body.category.description).toBe('All banking accounts');
      expect(response.body.category.userId).toBe(testUser._id.toString());
      expect(response.body.category.parentId).toBeNull();
      expect(response.body.category.isSystemCategory).toBe(false);
    });

    test('should create category with parent', async () => {
      const parentCategory = new Category({
        name: 'Banking',
        userId: testUser._id
      });
      await parentCategory.save();

      const categoryData = {
        name: 'Current Accounts',
        description: 'Day-to-day banking',
        parentId: parentCategory._id
      };

      const response = await request(app)
        .post('/api/categories')
        .send(categoryData);

      expect(response.status).toBe(201);
      expect(response.body.category.name).toBe('Current Accounts');
      expect(response.body.category.parentId).toBe(parentCategory._id.toString());
    });

    test('should require category name', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ description: 'No name provided' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Category name is required');
    });

    test('should reject empty category name', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ name: '   ', description: 'Empty name' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Category name is required');
    });

    test('should prevent duplicate names at same level', async () => {
      const existingCategory = new Category({
        name: 'Banking',
        userId: testUser._id
      });
      await existingCategory.save();

      const response = await request(app)
        .post('/api/categories')
        .send({ name: 'Banking', description: 'Duplicate name' });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('A category with this name already exists at this level');
    });

    test('should allow same name under different parents', async () => {
      const parent1 = new Category({ name: 'Parent1', userId: testUser._id });
      const parent2 = new Category({ name: 'Parent2', userId: testUser._id });
      await parent1.save();
      await parent2.save();

      // Create first child
      const response1 = await request(app)
        .post('/api/categories')
        .send({ name: 'Child', parentId: parent1._id });

      expect(response1.status).toBe(201);

      // Create second child with same name under different parent
      const response2 = await request(app)
        .post('/api/categories')
        .send({ name: 'Child', parentId: parent2._id });

      expect(response2.status).toBe(201);
    });

    test('should reject invalid parent ID', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ 
          name: 'Test Category',
          parentId: 'invalid-id'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid parent category ID');
    });

    test('should reject non-existent parent', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post('/api/categories')
        .send({ 
          name: 'Test Category',
          parentId: nonExistentId
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Parent category not found');
    });

    test('should reject using another user\'s category as parent', async () => {
      const otherUserCategory = new Category({
        name: 'Other User Category',
        userId: otherUser._id
      });
      await otherUserCategory.save();

      const response = await request(app)
        .post('/api/categories')
        .send({ 
          name: 'Test Category',
          parentId: otherUserCategory._id
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Cannot use another user\'s category as parent');
    });

    test('should allow using system category as parent', async () => {
      const systemCategory = new Category({
        name: 'System Category',
        userId: adminUser._id,
        isSystemCategory: true
      });
      await systemCategory.save();

      const response = await request(app)
        .post('/api/categories')
        .send({ 
          name: 'User Category',
          parentId: systemCategory._id
        });

      expect(response.status).toBe(201);
      expect(response.body.category.parentId).toBe(systemCategory._id.toString());
    });
  });

  describe('GET /api/categories', () => {
    let banking, currentAccounts, savings, insurance;

    beforeEach(async () => {
      banking = new Category({
        name: 'Banking',
        description: 'Banking services',
        userId: testUser._id
      });
      await banking.save();

      currentAccounts = new Category({
        name: 'Current Accounts',
        parentId: banking._id,
        userId: testUser._id
      });
      await currentAccounts.save();

      savings = new Category({
        name: 'Savings',
        parentId: banking._id,
        userId: testUser._id
      });
      await savings.save();

      insurance = new Category({
        name: 'Insurance',
        userId: testUser._id
      });
      await insurance.save();
    });

    test('should return hierarchical category tree', async () => {
      const response = await request(app)
        .get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body.categories).toHaveLength(2); // Banking and Insurance

      const bankingNode = response.body.categories.find(c => c.name === 'Banking');
      expect(bankingNode.children).toHaveLength(2);
      expect(bankingNode.children.map(c => c.name)).toEqual(
        expect.arrayContaining(['Current Accounts', 'Savings'])
      );

      const insuranceNode = response.body.categories.find(c => c.name === 'Insurance');
      expect(insuranceNode.children).toHaveLength(0);
    });

    test('should return total count', async () => {
      const response = await request(app)
        .get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(4); // Banking, Current Accounts, Savings, Insurance
    });

    test('should only return user\'s categories', async () => {
      // Create category for other user
      const otherUserCategory = new Category({
        name: 'Other User Category',
        userId: otherUser._id
      });
      await otherUserCategory.save();

      const response = await request(app)
        .get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(4); // Should not include other user's category
      
      const categoryNames = response.body.categories.flatMap(getCategoryNames);
      expect(categoryNames).not.toContain('Other User Category');
    });

    test('should exclude deleted categories', async () => {
      banking.isDeleted = true;
      await banking.save();

      const response = await request(app)
        .get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(3); // Current Accounts, Savings (orphaned), and Insurance
      expect(response.body.categories).toHaveLength(3); // The children become root nodes when parent is deleted
      
      const categoryNames = response.body.categories.map(c => c.name);
      expect(categoryNames).toContain('Insurance');
      expect(categoryNames).toContain('Current Accounts');
      expect(categoryNames).toContain('Savings');
      expect(categoryNames).not.toContain('Banking');
    });

    // Helper function to get all category names from tree
    function getCategoryNames(category) {
      const names = [category.name];
      if (category.children) {
        category.children.forEach(child => {
          names.push(...getCategoryNames(child));
        });
      }
      return names;
    }
  });

  describe('GET /api/categories/:id', () => {
    let banking, currentAccounts;

    beforeEach(async () => {
      banking = new Category({
        name: 'Banking',
        description: 'Banking services',
        userId: testUser._id
      });
      await banking.save();

      currentAccounts = new Category({
        name: 'Current Accounts',
        description: 'Day-to-day accounts',
        parentId: banking._id,
        userId: testUser._id
      });
      await currentAccounts.save();
    });

    test('should return category with details', async () => {
      const response = await request(app)
        .get(`/api/categories/${banking._id}`);

      expect(response.status).toBe(200);
      expect(response.body.category.name).toBe('Banking');
      expect(response.body.category.description).toBe('Banking services');
      expect(response.body.category.fullPath).toBe('Banking');
      expect(response.body.category.childrenCount).toBe(1);
      expect(response.body.children).toHaveLength(1);
      expect(response.body.children[0].name).toBe('Current Accounts');
    });

    test('should return full path for nested category', async () => {
      const response = await request(app)
        .get(`/api/categories/${currentAccounts._id}`);

      expect(response.status).toBe(200);
      expect(response.body.category.fullPath).toBe('Banking > Current Accounts');
      expect(response.body.category.childrenCount).toBe(0);
    });

    test('should return 404 for non-existent category', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/categories/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Category not found');
    });

    test('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/categories/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid category ID');
    });

    test('should reject access to other user\'s category', async () => {
      const otherUserCategory = new Category({
        name: 'Other User Category',
        userId: otherUser._id
      });
      await otherUserCategory.save();

      const response = await request(app)
        .get(`/api/categories/${otherUserCategory._id}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied to this category');
    });

    test('should allow access to system categories', async () => {
      const systemCategory = new Category({
        name: 'System Category',
        userId: adminUser._id,
        isSystemCategory: true
      });
      await systemCategory.save();

      const response = await request(app)
        .get(`/api/categories/${systemCategory._id}`);

      expect(response.status).toBe(200);
      expect(response.body.category.name).toBe('System Category');
    });

    test('should include entries count', async () => {
      // Create entry using this category
      const entry = new Entry({
        title: 'Test Entry',
        type: 'account',
        owner: testUser._id,
        categoryId: banking._id
      });
      await entry.save();

      const response = await request(app)
        .get(`/api/categories/${banking._id}`);

      expect(response.status).toBe(200);
      expect(response.body.category.entriesCount).toBe(1);
    });
  });

  describe('PUT /api/categories/:id', () => {
    let banking, insurance;

    beforeEach(async () => {
      banking = new Category({
        name: 'Banking',
        description: 'Banking services',
        userId: testUser._id
      });
      await banking.save();

      insurance = new Category({
        name: 'Insurance',
        userId: testUser._id
      });
      await insurance.save();
    });

    test('should update category name', async () => {
      const updateData = { name: 'Updated Banking' };

      const response = await request(app)
        .put(`/api/categories/${banking._id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.category.name).toBe('Updated Banking');
      expect(response.body.message).toBe('Category updated successfully');
    });

    test('should update category description', async () => {
      const updateData = { description: 'Updated description' };

      const response = await request(app)
        .put(`/api/categories/${banking._id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.category.description).toBe('Updated description');
    });

    test('should update parent category', async () => {
      const updateData = { parentId: insurance._id };

      const response = await request(app)
        .put(`/api/categories/${banking._id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.category.parentId).toBe(insurance._id.toString());
    });

    test('should allow removing parent (making it root)', async () => {
      // First make banking a child of insurance
      banking.parentId = insurance._id;
      await banking.save();

      const updateData = { parentId: null };

      const response = await request(app)
        .put(`/api/categories/${banking._id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.category.parentId).toBeNull();
    });

    test('should reject empty name', async () => {
      const response = await request(app)
        .put(`/api/categories/${banking._id}`)
        .send({ name: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Category name cannot be empty');
    });

    test('should prevent duplicate names at same level', async () => {
      const response = await request(app)
        .put(`/api/categories/${banking._id}`)
        .send({ name: 'Insurance' }); // Insurance already exists at root level

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('A category with this name already exists at this level');
    });

    test('should reject invalid parent ID', async () => {
      const response = await request(app)
        .put(`/api/categories/${banking._id}`)
        .send({ parentId: 'invalid-id' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid parent category ID');
    });

    test('should prevent circular reference', async () => {
      // Create child category
      const child = new Category({
        name: 'Child',
        parentId: banking._id,
        userId: testUser._id
      });
      await child.save();

      // Try to make banking a child of its own child
      const response = await request(app)
        .put(`/api/categories/${banking._id}`)
        .send({ parentId: child._id });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Circular reference detected in category hierarchy');
    });

    test('should return 404 for non-existent category', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/categories/${nonExistentId}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Category not found');
    });

    test('should reject updating another user\'s category', async () => {
      const otherUserCategory = new Category({
        name: 'Other User Category',
        userId: otherUser._id
      });
      await otherUserCategory.save();

      const response = await request(app)
        .put(`/api/categories/${otherUserCategory._id}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('You can only update your own categories');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    let banking, currentAccounts, savings;

    beforeEach(async () => {
      banking = new Category({
        name: 'Banking',
        userId: testUser._id
      });
      await banking.save();

      currentAccounts = new Category({
        name: 'Current Accounts',
        parentId: banking._id,
        userId: testUser._id
      });
      await currentAccounts.save();

      savings = new Category({
        name: 'Savings',
        parentId: banking._id,
        userId: testUser._id
      });
      await savings.save();
    });

    test('should soft delete category without children', async () => {
      const response = await request(app)
        .delete(`/api/categories/${currentAccounts._id}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Category deleted successfully');
      expect(response.body.deletedCategory.name).toBe('Current Accounts');

      // Verify it's soft deleted
      const deletedCategory = await Category.findById(currentAccounts._id);
      expect(deletedCategory.isDeleted).toBe(true);
    });

    test('should prevent deleting category with children', async () => {
      const response = await request(app)
        .delete(`/api/categories/${banking._id}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Category has child categories');
      expect(response.body.childCount).toBe(2);
    });

    test('should delete category with children when deleteChildren=true', async () => {
      const response = await request(app)
        .delete(`/api/categories/${banking._id}?deleteChildren=true`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Category deleted successfully');
      expect(response.body.deletedChildrenCount).toBe(2);

      // Verify all are soft deleted
      const deletedCategories = await Category.find({
        _id: { $in: [banking._id, currentAccounts._id, savings._id] }
      });
      
      deletedCategories.forEach(category => {
        expect(category.isDeleted).toBe(true);
      });
    });

    test('should prevent deleting category with associated entries', async () => {
      // Create entry using this category
      const entry = new Entry({
        title: 'Test Entry',
        type: 'account',
        owner: testUser._id,
        categoryId: currentAccounts._id
      });
      await entry.save();

      const response = await request(app)
        .delete(`/api/categories/${currentAccounts._id}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Category is being used by entries');
      expect(response.body.entriesCount).toBe(1);
    });

    test('should return 404 for non-existent category', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/categories/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Category not found');
    });

    test('should return 410 for already deleted category', async () => {
      currentAccounts.isDeleted = true;
      await currentAccounts.save();

      const response = await request(app)
        .delete(`/api/categories/${currentAccounts._id}`);

      expect(response.status).toBe(410);
      expect(response.body.error).toBe('Category is already deleted');
    });

    test('should reject deleting another user\'s category', async () => {
      const otherUserCategory = new Category({
        name: 'Other User Category',
        userId: otherUser._id
      });
      await otherUserCategory.save();

      const response = await request(app)
        .delete(`/api/categories/${otherUserCategory._id}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('You can only delete your own categories');
    });
  });

  describe('GET /api/categories/stats', () => {
    beforeEach(async () => {
      // Create category hierarchy
      const banking = new Category({ name: 'Banking', userId: testUser._id });
      await banking.save();
      
      const currentAccounts = new Category({
        name: 'Current Accounts', 
        parentId: banking._id,
        userId: testUser._id
      });
      await currentAccounts.save();

      const insurance = new Category({ name: 'Insurance', userId: testUser._id });
      await insurance.save();

      // Create system category
      const systemCategory = new Category({
        name: 'System Category',
        userId: adminUser._id,
        isSystemCategory: true
      });
      await systemCategory.save();

      // Create entry using category
      const entry = new Entry({
        title: 'Test Entry',
        type: 'account',
        owner: testUser._id,
        categoryId: banking._id
      });
      await entry.save();
    });

    test('should return category statistics', async () => {
      const response = await request(app)
        .get('/api/categories/stats');

      expect(response.status).toBe(200);
      expect(response.body.totalCategories).toBe(3); // Banking, Current Accounts, Insurance
      expect(response.body.rootCategories).toBe(2); // Banking, Insurance
      expect(response.body.systemCategories).toBe(1);
      expect(response.body.categoriesInUse).toBe(1); // Banking has entry
      expect(response.body.categoryUsage).toHaveLength(1);
    });
  });

  describe('Authentication and Authorization', () => {
    test('should require authentication', async () => {
      const app = express();
      app.use(express.json());
      
      // No authentication middleware
      app.use('/api/categories', categoriesRouter);

      const response = await request(app)
        .get('/api/categories');

      expect(response.status).toBe(401);
    });

    test('should require approved user', async () => {
      const unapprovedApp = express();
      unapprovedApp.use(express.json());
      
      // Mock unapproved user
      unapprovedApp.use((req, res, next) => {
        req.isAuthenticated = () => true;
        req.user = { _id: testUser._id, approved: false };
        next();
      });
      
      unapprovedApp.use('/api/categories', categoriesRouter);

      const response = await request(unapprovedApp)
        .get('/api/categories');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Account requires approval');
    });
  });
});