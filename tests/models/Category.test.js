const mongoose = require('mongoose');
const Category = require('../../src/models/category');
const User = require('../../src/models/user');

describe('Category Model', () => {
  let testUser, adminUser;

  beforeEach(async () => {
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
  });

  describe('Category Model Schema', () => {
    test('should create category with required fields', async () => {
      const categoryData = {
        name: 'Banking',
        description: 'All banking related accounts',
        userId: testUser._id
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.name).toBe('Banking');
      expect(savedCategory.description).toBe('All banking related accounts');
      expect(savedCategory.userId).toEqual(testUser._id);
      expect(savedCategory.parentId).toBeNull();
      expect(savedCategory.isSystemCategory).toBe(false);
      expect(savedCategory.isDeleted).toBe(false);
      expect(savedCategory.createdAt).toBeDefined();
      expect(savedCategory.updatedAt).toBeDefined();
    });

    test('should require name field', async () => {
      const category = new Category({
        description: 'Category without name',
        userId: testUser._id
      });

      await expect(category.save()).rejects.toThrow();
    });

    test('should require userId field', async () => {
      const category = new Category({
        name: 'Banking',
        description: 'Banking category'
      });

      await expect(category.save()).rejects.toThrow();
    });

    test('should default isSystemCategory to false', async () => {
      const category = new Category({
        name: 'Test Category',
        userId: testUser._id
      });

      const savedCategory = await category.save();
      expect(savedCategory.isSystemCategory).toBe(false);
    });

    test('should default isDeleted to false', async () => {
      const category = new Category({
        name: 'Test Category',
        userId: testUser._id
      });

      const savedCategory = await category.save();
      expect(savedCategory.isDeleted).toBe(false);
    });
  });

  describe('Hierarchical Structure', () => {
    let parentCategory, childCategory;

    beforeEach(async () => {
      parentCategory = new Category({
        name: 'Banking',
        description: 'All banking accounts',
        userId: testUser._id
      });
      await parentCategory.save();

      childCategory = new Category({
        name: 'Current Accounts',
        description: 'Current account management', 
        parentId: parentCategory._id,
        userId: testUser._id
      });
      await childCategory.save();
    });

    test('should create parent-child relationship', async () => {
      expect(childCategory.parentId).toEqual(parentCategory._id);
    });

    test('should populate parent category', async () => {
      const categoryWithParent = await Category.findById(childCategory._id)
        .populate('parentId')
        .exec();

      expect(categoryWithParent.parentId.name).toBe('Banking');
      expect(categoryWithParent.parentId.description).toBe('All banking accounts');
    });

    test('should support multiple nesting levels', async () => {
      const grandChildCategory = new Category({
        name: 'Premium Accounts',
        description: 'Premium current accounts',
        parentId: childCategory._id,
        userId: testUser._id
      });
      
      const savedGrandChild = await grandChildCategory.save();
      
      const populatedGrandChild = await Category.findById(savedGrandChild._id)
        .populate({
          path: 'parentId',
          populate: {
            path: 'parentId',
            model: 'Category'
          }
        })
        .exec();

      expect(populatedGrandChild.parentId.name).toBe('Current Accounts');
      expect(populatedGrandChild.parentId.parentId.name).toBe('Banking');
    });

    test('should allow categories without parent (root level)', async () => {
      const rootCategory = new Category({
        name: 'Insurance',
        description: 'Insurance policies',
        userId: testUser._id
      });

      const savedRoot = await rootCategory.save();
      expect(savedRoot.parentId).toBeNull();
    });
  });

  describe('User Ownership', () => {
    test('should associate category with user', async () => {
      const category = new Category({
        name: 'User Category',
        userId: testUser._id
      });

      const savedCategory = await category.save();
      
      const populatedCategory = await Category.findById(savedCategory._id)
        .populate('userId')
        .exec();

      expect(populatedCategory.userId.email).toBe('test@example.com');
    });

    test('should allow different users to have same category names', async () => {
      const category1 = new Category({
        name: 'Banking',
        userId: testUser._id
      });

      const category2 = new Category({
        name: 'Banking',
        userId: adminUser._id
      });

      const saved1 = await category1.save();
      const saved2 = await category2.save();

      expect(saved1.name).toBe(saved2.name);
      expect(saved1.userId).not.toEqual(saved2.userId);
    });
  });

  describe('System Categories', () => {
    test('should support system categories', async () => {
      const systemCategory = new Category({
        name: 'System Banking',
        description: 'System-level banking category',
        userId: adminUser._id,
        isSystemCategory: true
      });

      const savedSystem = await systemCategory.save();
      expect(savedSystem.isSystemCategory).toBe(true);
    });

    test('should allow creating system category', async () => {
      const systemCategory = new Category({
        name: 'System Category',
        userId: adminUser._id,
        isSystemCategory: true
      });

      await expect(systemCategory.save()).resolves.toBeDefined();
    });
  });

  describe('Soft Delete Functionality', () => {
    let category;

    beforeEach(async () => {
      category = new Category({
        name: 'To Be Deleted',
        userId: testUser._id
      });
      await category.save();
    });

    test('should support soft delete', async () => {
      category.isDeleted = true;
      const deletedCategory = await category.save();

      expect(deletedCategory.isDeleted).toBe(true);
    });

    test('should find non-deleted categories by default', async () => {
      const activeCategory = new Category({
        name: 'Active Category', 
        userId: testUser._id
      });
      await activeCategory.save();

      category.isDeleted = true;
      await category.save();

      const activeCategories = await Category.find({ isDeleted: false });
      expect(activeCategories).toHaveLength(1);
      expect(activeCategories[0].name).toBe('Active Category');
    });

    test('should still find deleted categories when explicitly queried', async () => {
      category.isDeleted = true;
      await category.save();

      const deletedCategories = await Category.find({ isDeleted: true });
      expect(deletedCategories).toHaveLength(1);
      expect(deletedCategories[0].name).toBe('To Be Deleted');
    });
  });

  describe('Query Methods', () => {
    let banking, currentAccounts, savings, insurance;

    beforeEach(async () => {
      banking = new Category({
        name: 'Banking',
        description: 'All banking accounts',
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
        name: 'Savings Accounts',
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

    test('should find root categories (no parent)', async () => {
      const rootCategories = await Category.find({
        userId: testUser._id,
        parentId: null,
        isDeleted: false
      });

      expect(rootCategories).toHaveLength(2);
      const names = rootCategories.map(c => c.name);
      expect(names).toContain('Banking');
      expect(names).toContain('Insurance');
    });

    test('should find child categories of a parent', async () => {
      const childCategories = await Category.find({
        parentId: banking._id,
        isDeleted: false
      });

      expect(childCategories).toHaveLength(2);
      const names = childCategories.map(c => c.name);
      expect(names).toContain('Current Accounts');
      expect(names).toContain('Savings Accounts');
    });

    test('should find categories by user', async () => {
      const otherUserCategory = new Category({
        name: 'Other User Category',
        userId: adminUser._id
      });
      await otherUserCategory.save();

      const userCategories = await Category.find({
        userId: testUser._id,
        isDeleted: false
      });

      expect(userCategories).toHaveLength(4); // banking, currentAccounts, savings, insurance
      expect(userCategories.find(c => c.name === 'Other User Category')).toBeUndefined();
    });
  });

  describe('Validation Rules', () => {
    test('should enforce maximum name length', async () => {
      const longName = 'A'.repeat(101); // Assuming 100 char limit
      const category = new Category({
        name: longName,
        userId: testUser._id
      });

      await expect(category.save()).rejects.toThrow();
    });

    test('should allow names up to maximum length', async () => {
      const maxName = 'A'.repeat(100);
      const category = new Category({
        name: maxName,
        userId: testUser._id
      });

      await expect(category.save()).resolves.toBeDefined();
    });

    test('should enforce maximum description length', async () => {
      const longDescription = 'A'.repeat(501); // Assuming 500 char limit
      const category = new Category({
        name: 'Test Category',
        description: longDescription,
        userId: testUser._id
      });

      await expect(category.save()).rejects.toThrow();
    });

    test('should trim whitespace from name', async () => {
      const category = new Category({
        name: '  Banking  ',
        userId: testUser._id
      });

      const savedCategory = await category.save();
      expect(savedCategory.name).toBe('Banking');
    });
  });

  describe('Instance Methods', () => {
    let banking, currentAccounts, premiumAccounts;

    beforeEach(async () => {
      banking = new Category({
        name: 'Banking',
        description: 'All banking services',
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

      premiumAccounts = new Category({
        name: 'Premium Accounts',
        description: 'Premium banking services',
        parentId: currentAccounts._id,
        userId: testUser._id
      });
      await premiumAccounts.save();
    });

    describe('getFullPath', () => {
      test('should return correct path for nested category', async () => {
        const path = await premiumAccounts.getFullPath();
        expect(path).toBe('Banking > Current Accounts > Premium Accounts');
      });

      test('should return just name for root category', async () => {
        const path = await banking.getFullPath();
        expect(path).toBe('Banking');
      });

      test('should handle single level nesting', async () => {
        const path = await currentAccounts.getFullPath();
        expect(path).toBe('Banking > Current Accounts');
      });
    });

    describe('getAllChildren', () => {
      test('should return all children recursively', async () => {
        const children = await banking.getAllChildren();
        expect(children).toHaveLength(2);
        
        const childNames = children.map(c => c.name);
        expect(childNames).toContain('Current Accounts');
        expect(childNames).toContain('Premium Accounts');
      });

      test('should return empty array for leaf category', async () => {
        const children = await premiumAccounts.getAllChildren();
        expect(children).toHaveLength(0);
      });

      test('should return direct children only for intermediate category', async () => {
        const children = await currentAccounts.getAllChildren();
        expect(children).toHaveLength(1);
        expect(children[0].name).toBe('Premium Accounts');
      });
    });
  });

  describe('Static Methods', () => {
    let banking, insurance, currentAccounts;

    beforeEach(async () => {
      banking = new Category({
        name: 'Banking',
        userId: testUser._id
      });
      await banking.save();

      insurance = new Category({
        name: 'Insurance',
        userId: testUser._id
      });
      await insurance.save();

      currentAccounts = new Category({
        name: 'Current Accounts',
        parentId: banking._id,
        userId: testUser._id
      });
      await currentAccounts.save();
    });

    describe('findRootCategories', () => {
      test('should find all root categories for user', async () => {
        const rootCategories = await Category.findRootCategories(testUser._id);
        expect(rootCategories).toHaveLength(2);
        
        const names = rootCategories.map(c => c.name);
        expect(names).toContain('Banking');
        expect(names).toContain('Insurance');
      });
    });

    describe('findChildren', () => {
      test('should find direct children of a category', async () => {
        const children = await Category.findChildren(banking._id);
        expect(children).toHaveLength(1);
        expect(children[0].name).toBe('Current Accounts');
      });

      test('should find children with user filter', async () => {
        const children = await Category.findChildren(banking._id, testUser._id);
        expect(children).toHaveLength(1);
        expect(children[0].name).toBe('Current Accounts');
      });
    });

    describe('buildTree', () => {
      test('should build hierarchical tree structure', async () => {
        const tree = await Category.buildTree(testUser._id);
        expect(tree).toHaveLength(2); // Banking and Insurance at root
        
        const bankingNode = tree.find(node => node.name === 'Banking');
        expect(bankingNode.children).toHaveLength(1);
        expect(bankingNode.children[0].name).toBe('Current Accounts');
        
        const insuranceNode = tree.find(node => node.name === 'Insurance');
        expect(insuranceNode.children).toHaveLength(0);
      });
    });
  });

  describe('Circular Reference Prevention', () => {
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

    test('should prevent self-reference', async () => {
      banking.parentId = banking._id;
      
      await expect(banking.save()).rejects.toThrow('Category cannot be its own parent');
    });

    test('should prevent direct circular reference', async () => {
      // Try to make banking point to currentAccounts (which already points to banking)
      banking.parentId = currentAccounts._id;
      
      await expect(banking.save()).rejects.toThrow('Circular reference detected in category hierarchy');
    });

    test('should prevent indirect circular reference (3 levels)', async () => {
      // Create: Banking -> Current Accounts -> Premium Accounts
      const premiumAccounts = new Category({
        name: 'Premium Accounts',
        parentId: currentAccounts._id,
        userId: testUser._id
      });
      await premiumAccounts.save();

      // Try to make Banking point to Premium Accounts (creating a cycle)
      banking.parentId = premiumAccounts._id;
      
      await expect(banking.save()).rejects.toThrow('Circular reference detected in category hierarchy');
    });

    test('should prevent setting non-existent parent', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      banking.parentId = nonExistentId;
      
      await expect(banking.save()).rejects.toThrow('Parent category not found');
    });

    test('should allow valid parent change', async () => {
      // This should work - making savings a child of currentAccounts
      savings.parentId = currentAccounts._id;
      
      await expect(savings.save()).resolves.toBeDefined();
      
      const updatedSavings = await Category.findById(savings._id);
      expect(updatedSavings.parentId).toEqual(currentAccounts._id);
    });

    test('should allow removing parent (making it root)', async () => {
      currentAccounts.parentId = null;
      
      await expect(currentAccounts.save()).resolves.toBeDefined();
      
      const updatedCurrentAccounts = await Category.findById(currentAccounts._id);
      expect(updatedCurrentAccounts.parentId).toBeNull();
    });
  });

  describe('Database Indexes', () => {
    test('should have compound index on userId and parentId', async () => {
      const indexes = await Category.collection.getIndexes();
      
      // Check for compound index on userId and parentId
      const hasUserParentIndex = Object.keys(indexes).some(indexName => {
        const index = indexes[indexName];
        return index.find(field => field[0] === 'userId' || field[0] === 'parentId');
      });
      
      expect(hasUserParentIndex).toBe(true);
    });

    test('should have index on userId for user queries', async () => {
      const indexes = await Category.collection.getIndexes();
      
      const hasUserIndex = Object.keys(indexes).some(indexName => {
        const index = indexes[indexName];
        return index.find(field => field[0] === 'userId');
      });
      
      expect(hasUserIndex).toBe(true);
    });
  });
});