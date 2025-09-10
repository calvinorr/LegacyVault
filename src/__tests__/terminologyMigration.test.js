// src/__tests__/terminologyMigration.test.js
// Test suite for utilities → bills terminology migration

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Entry = require('../models/entry');

describe('Terminology Migration: Utilities → Bills', () => {
  let mongoServer;
  let testEntries;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    if (mongoServer) {
      await mongoose.disconnect();
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Clean the database
    await Entry.deleteMany({});
    
    // Create test user ID
    const testUserId = new mongoose.Types.ObjectId();
    
    // Create test entries with utilities terminology
    testEntries = await Entry.create([
      {
        title: 'British Gas Electricity',
        type: 'utility',
        category: 'Utilities',
        provider: 'British Gas',
        owner: testUserId
      },
      {
        title: 'Thames Water',
        type: 'utility', 
        category: 'Utilities',
        provider: 'Thames Water',
        owner: testUserId
      },
      {
        title: 'Council Tax',
        type: 'bill',
        category: 'Bills',
        provider: 'Local Council',
        owner: testUserId
      },
      {
        title: 'NatWest Current Account',
        type: 'account',
        category: 'Banking',
        provider: 'NatWest',
        owner: testUserId
      }
    ]);
  });

  describe('Entry Model Type Support', () => {
    test('should support both utility and bill types', () => {
      const validTypes = Entry.schema.path('type').enumValues;
      expect(validTypes).toContain('utility');
      expect(validTypes).toContain('bill');
    });

    test('should support both Utilities and Bills categories', () => {
      const validCategories = Entry.schema.path('category').enumValues;
      expect(validCategories).toContain('Utilities');
      expect(validCategories).toContain('Bills');
    });
  });

  describe('Database Migration Logic', () => {
    test('should find all utility type entries', async () => {
      const utilityEntries = await Entry.find({ type: 'utility' });
      expect(utilityEntries).toHaveLength(2);
      expect(utilityEntries.map(e => e.title)).toEqual(
        expect.arrayContaining(['British Gas Electricity', 'Thames Water'])
      );
    });

    test('should find all Utilities category entries', async () => {
      const utilitiesCategoryEntries = await Entry.find({ category: 'Utilities' });
      expect(utilitiesCategoryEntries).toHaveLength(2);
    });

    test('should preserve non-utility entries during migration', async () => {
      const nonUtilityEntries = await Entry.find({ 
        type: { $nin: ['utility'] },
        category: { $nin: ['Utilities'] }
      });
      expect(nonUtilityEntries).toHaveLength(2); // account + existing bill
    });
  });

  describe('Migration Simulation', () => {
    test('should successfully migrate utility types to bill', async () => {
      // Simulate migration
      const result = await Entry.updateMany(
        { type: 'utility' },
        { $set: { type: 'bill' } }
      );
      
      expect(result.modifiedCount).toBe(2);
      
      // Verify migration
      const utilityEntries = await Entry.find({ type: 'utility' });
      expect(utilityEntries).toHaveLength(0);
      
      const billEntries = await Entry.find({ type: 'bill' });
      expect(billEntries).toHaveLength(3); // 2 migrated + 1 existing
    });

    test('should successfully migrate Utilities categories to Bills', async () => {
      // Simulate migration
      const result = await Entry.updateMany(
        { category: 'Utilities' },
        { $set: { category: 'Bills' } }
      );
      
      expect(result.modifiedCount).toBe(2);
      
      // Verify migration
      const utilitiesEntries = await Entry.find({ category: 'Utilities' });
      expect(utilitiesEntries).toHaveLength(0);
      
      const billsEntries = await Entry.find({ category: 'Bills' });
      expect(billsEntries).toHaveLength(3); // 2 migrated + 1 existing
    });

    test('should handle combined type and category migration', async () => {
      // Simulate combined migration
      const result = await Entry.updateMany(
        { $or: [{ type: 'utility' }, { category: 'Utilities' }] },
        { $set: { type: 'bill', category: 'Bills' } }
      );
      
      expect(result.modifiedCount).toBe(2);
      
      // Verify no utilities remain
      const utilitiesRemaining = await Entry.find({
        $or: [{ type: 'utility' }, { category: 'Utilities' }]
      });
      expect(utilitiesRemaining).toHaveLength(0);
    });
  });

  describe('Data Integrity', () => {
    test('should preserve all entry data during migration', async () => {
      const beforeMigration = await Entry.find({ type: 'utility' }).lean();
      
      // Migrate
      await Entry.updateMany(
        { type: 'utility' },
        { $set: { type: 'bill', category: 'Bills' } }
      );
      
      const afterMigration = await Entry.find({ 
        _id: { $in: beforeMigration.map(e => e._id) }
      }).lean();
      
      expect(afterMigration).toHaveLength(beforeMigration.length);
      
      // Check that only type and category changed
      afterMigration.forEach((after, index) => {
        const before = beforeMigration[index];
        expect(after.title).toBe(before.title);
        expect(after.provider).toBe(before.provider);
        expect(after.notes).toBe(before.notes);
        expect(after.owner.toString()).toBe(before.owner.toString());
        expect(after.type).toBe('bill');
        expect(after.category).toBe('Bills');
      });
    });
  });
});