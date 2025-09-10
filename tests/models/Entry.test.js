const mongoose = require('mongoose');
const Entry = require('../../src/models/entry');
const User = require('../../src/models/user');
const ImportSession = require('../../src/models/ImportSession');
const Category = require('../../src/models/category');

describe('Extended Entry Model (Import Features)', () => {
  let testUser, testImportSession;

  beforeEach(async () => {
    testUser = new User({
      googleId: 'test123',
      displayName: 'Test User',
      email: 'test@example.com',
      approved: true
    });
    await testUser.save();

    testImportSession = new ImportSession({
      user: testUser._id,
      filename: 'test-statement.pdf',
      status: 'completed'
    });
    await testImportSession.save();
  });

  describe('Manual Entry Creation (Existing Functionality)', () => {
    test('should create manual entry without import metadata', async () => {
      const entryData = {
        title: 'NatWest Current Account',
        type: 'account',
        provider: 'NatWest',
        owner: testUser._id,
        category: 'Banking'
      };

      const entry = new Entry(entryData);
      const savedEntry = await entry.save();

      expect(savedEntry.title).toBe('NatWest Current Account');
      expect(savedEntry.import_metadata.source).toBe('manual');
      expect(savedEntry.import_metadata.created_from_suggestion).toBe(false);
    });
  });

  describe('Bank Import Metadata', () => {
    test('should store import metadata for bank-imported entries', async () => {
      const entryData = {
        title: 'British Gas - Gas Supply',
        type: 'utility',
        provider: 'British Gas',
        owner: testUser._id,
        category: 'Utilities',
        import_metadata: {
          source: 'bank_import',
          import_session_id: testImportSession._id,
          created_from_suggestion: true,
          original_payee: 'BRITISH GAS DD',
          confidence_score: 0.95,
          import_date: new Date('2023-10-15'),
          detected_frequency: 'monthly',
          amount_pattern: {
            typical_amount: -85.50,
            variance: 0.05,
            currency: 'GBP'
          }
        }
      };

      const entry = new Entry(entryData);
      const savedEntry = await entry.save();

      expect(savedEntry.import_metadata.source).toBe('bank_import');
      expect(savedEntry.import_metadata.import_session_id).toEqual(testImportSession._id);
      expect(savedEntry.import_metadata.created_from_suggestion).toBe(true);
      expect(savedEntry.import_metadata.original_payee).toBe('BRITISH GAS DD');
      expect(savedEntry.import_metadata.confidence_score).toBe(0.95);
      expect(savedEntry.import_metadata.detected_frequency).toBe('monthly');
    });

    test('should validate import source enum values', async () => {
      const validSources = ['manual', 'bank_import', 'csv_import'];

      for (const source of validSources) {
        const entry = new Entry({
          title: `Test Entry ${source}`,
          owner: testUser._id,
          import_metadata: { source }
        });

        await expect(entry.save()).resolves.toBeDefined();
        await entry.deleteOne();
      }
    });

    test('should reject invalid import source values', async () => {
      const entry = new Entry({
        title: 'Invalid Source Entry',
        owner: testUser._id,
        import_metadata: {
          source: 'invalid_source'
        }
      });

      await expect(entry.save()).rejects.toThrow();
    });

    test('should validate detected frequency enum values', async () => {
      const validFrequencies = ['weekly', 'monthly', 'quarterly', 'annually', 'irregular'];

      for (const frequency of validFrequencies) {
        const entry = new Entry({
          title: `Test Entry ${frequency}`,
          owner: testUser._id,
          import_metadata: {
            detected_frequency: frequency
          }
        });

        await expect(entry.save()).resolves.toBeDefined();
        await entry.deleteOne();
      }
    });
  });

  describe('CSV Import Support', () => {
    test('should support CSV import metadata', async () => {
      const entryData = {
        title: 'Sky Broadband',
        type: 'utility',
        provider: 'Sky',
        owner: testUser._id,
        import_metadata: {
          source: 'csv_import',
          import_date: new Date('2023-10-20'),
          original_payee: 'SKY DIGITAL SERVICES'
        }
      };

      const entry = new Entry(entryData);
      const savedEntry = await entry.save();

      expect(savedEntry.import_metadata.source).toBe('csv_import');
      expect(savedEntry.import_metadata.original_payee).toBe('SKY DIGITAL SERVICES');
    });
  });

  describe('Amount Pattern Tracking', () => {
    test('should store typical amount and variance', async () => {
      const entryData = {
        title: 'Council Tax',
        type: 'utility',
        owner: testUser._id,
        import_metadata: {
          source: 'bank_import',
          amount_pattern: {
            typical_amount: -125.67,
            variance: 0.02,
            currency: 'GBP'
          }
        }
      };

      const entry = new Entry(entryData);
      const savedEntry = await entry.save();

      expect(savedEntry.import_metadata.amount_pattern.typical_amount).toBe(-125.67);
      expect(savedEntry.import_metadata.amount_pattern.variance).toBe(0.02);
      expect(savedEntry.import_metadata.amount_pattern.currency).toBe('GBP');
    });

    test('should default currency to GBP', async () => {
      const entry = new Entry({
        title: 'Test Entry',
        owner: testUser._id,
        import_metadata: {
          amount_pattern: {
            typical_amount: -50.00,
            variance: 0.1
          }
        }
      });

      const savedEntry = await entry.save();
      expect(savedEntry.import_metadata.amount_pattern.currency).toBe('GBP');
    });
  });

  describe('Relationship to Import Session', () => {
    test('should populate import session reference', async () => {
      const entry = new Entry({
        title: 'Imported Utility',
        owner: testUser._id,
        import_metadata: {
          source: 'bank_import',
          import_session_id: testImportSession._id
        }
      });

      const savedEntry = await entry.save();
      
      const populatedEntry = await Entry.findById(savedEntry._id)
        .populate('import_metadata.import_session_id')
        .exec();

      expect(populatedEntry.import_metadata.import_session_id.filename).toBe('test-statement.pdf');
    });
  });

  describe('Querying Import-Related Entries', () => {
    test('should find entries by import source', async () => {
      const manualEntry = new Entry({
        title: 'Manual Entry',
        owner: testUser._id
      });

      const importedEntry = new Entry({
        title: 'Imported Entry',
        owner: testUser._id,
        import_metadata: {
          source: 'bank_import',
          created_from_suggestion: true
        }
      });

      await manualEntry.save();
      await importedEntry.save();

      const bankImportedEntries = await Entry.find({
        'import_metadata.source': 'bank_import'
      });

      expect(bankImportedEntries).toHaveLength(1);
      expect(bankImportedEntries[0].title).toBe('Imported Entry');
    });

    test('should find entries created from suggestions', async () => {
      const suggestedEntry = new Entry({
        title: 'From Suggestion',
        owner: testUser._id,
        import_metadata: {
          created_from_suggestion: true,
          confidence_score: 0.85
        }
      });

      const manualEntry = new Entry({
        title: 'Manual Entry',
        owner: testUser._id
      });

      await suggestedEntry.save();
      await manualEntry.save();

      const fromSuggestions = await Entry.find({
        'import_metadata.created_from_suggestion': true
      });

      expect(fromSuggestions).toHaveLength(1);
      expect(fromSuggestions[0].title).toBe('From Suggestion');
    });

    test('should find entries by import session', async () => {
      const entry1 = new Entry({
        title: 'Entry 1 from Session',
        owner: testUser._id,
        import_metadata: {
          import_session_id: testImportSession._id
        }
      });

      const entry2 = new Entry({
        title: 'Entry 2 from Session',
        owner: testUser._id,
        import_metadata: {
          import_session_id: testImportSession._id
        }
      });

      const otherEntry = new Entry({
        title: 'Other Entry',
        owner: testUser._id
      });

      await entry1.save();
      await entry2.save();
      await otherEntry.save();

      const sessionEntries = await Entry.find({
        'import_metadata.import_session_id': testImportSession._id
      });

      expect(sessionEntries).toHaveLength(2);
    });
  });

  describe('Confidence Scoring', () => {
    test('should store and query by confidence score', async () => {
      const highConfidenceEntry = new Entry({
        title: 'High Confidence',
        owner: testUser._id,
        import_metadata: {
          confidence_score: 0.95
        }
      });

      const lowConfidenceEntry = new Entry({
        title: 'Low Confidence',
        owner: testUser._id,
        import_metadata: {
          confidence_score: 0.65
        }
      });

      await highConfidenceEntry.save();
      await lowConfidenceEntry.save();

      const highConfidenceEntries = await Entry.find({
        'import_metadata.confidence_score': { $gte: 0.9 }
      });

      expect(highConfidenceEntries).toHaveLength(1);
      expect(highConfidenceEntries[0].title).toBe('High Confidence');
    });
  });

  describe('Category Integration', () => {
    let testCategory;

    beforeEach(async () => {
      testCategory = new Category({
        name: 'Test Banking Category',
        description: 'Test category for banking entries',
        userId: testUser._id
      });
      await testCategory.save();
    });

    test('should support categoryId reference to Category model', async () => {
      const entryData = {
        title: 'NatWest Account with Category',
        type: 'account',
        provider: 'NatWest',
        owner: testUser._id,
        categoryId: testCategory._id
      };

      const entry = new Entry(entryData);
      const savedEntry = await entry.save();

      expect(savedEntry.categoryId).toEqual(testCategory._id);
    });

    test('should populate category reference', async () => {
      const entry = new Entry({
        title: 'Account with Category',
        owner: testUser._id,
        categoryId: testCategory._id
      });

      const savedEntry = await entry.save();
      
      const populatedEntry = await Entry.findById(savedEntry._id)
        .populate('categoryId')
        .exec();

      expect(populatedEntry.categoryId.name).toBe('Test Banking Category');
      expect(populatedEntry.categoryId.description).toBe('Test category for banking entries');
    });

    test('should default categoryId to null', async () => {
      const entry = new Entry({
        title: 'Account without Category',
        owner: testUser._id
      });

      const savedEntry = await entry.save();
      expect(savedEntry.categoryId).toBeNull();
    });

    test('should allow removing category reference', async () => {
      const entry = new Entry({
        title: 'Account with Category',
        owner: testUser._id,
        categoryId: testCategory._id
      });

      const savedEntry = await entry.save();
      
      // Remove category reference
      savedEntry.categoryId = null;
      const updatedEntry = await savedEntry.save();

      expect(updatedEntry.categoryId).toBeNull();
    });

    test('should support both old category system and new categoryId', async () => {
      const entry = new Entry({
        title: 'Hybrid Category Entry',
        type: 'account',
        owner: testUser._id,
        category: 'Banking', // Old string-based category
        subCategory: 'Current Accounts', // Old sub-category
        categoryId: testCategory._id // New category reference
      });

      const savedEntry = await entry.save();

      // Both systems should work together
      expect(savedEntry.category).toBe('Banking');
      expect(savedEntry.subCategory).toBe('Current Accounts');
      expect(savedEntry.categoryId).toEqual(testCategory._id);
    });
  });

  describe('Backward Compatibility', () => {
    test('should work with existing entries without import metadata', async () => {
      // Simulate an existing entry created before import metadata was added
      const existingEntry = new Entry({
        title: 'Legacy Entry',
        type: 'account',
        provider: 'Old Bank',
        owner: testUser._id
      });

      const savedEntry = await existingEntry.save();

      // Should have default import metadata
      expect(savedEntry.import_metadata.source).toBe('manual');
      expect(savedEntry.import_metadata.created_from_suggestion).toBe(false);
    });

    test('should preserve existing entry fields with import metadata', async () => {
      const entry = new Entry({
        title: 'Full Featured Entry',
        type: 'utility',
        provider: 'British Gas',
        accountDetails: {
          accountNumber: '123456789',
          sortCode: '12-34-56'
        },
        notes: 'Monthly gas bill',
        category: 'Utilities',
        subCategory: 'Gas',
        tags: ['Monthly', 'Direct Debit'],
        supplier: 'British Gas',
        owner: testUser._id,
        sharedWith: [],
        confidential: true,
        import_metadata: {
          source: 'bank_import',
          original_payee: 'BG ENERGY DD'
        }
      });

      const savedEntry = await entry.save();

      // All existing functionality should work
      expect(savedEntry.accountDetails.sortCode).toBe('12-34-56');
      expect(savedEntry.tags).toContain('Direct Debit');
      expect(savedEntry.category).toBe('Utilities');
      
      // New import metadata should also work
      expect(savedEntry.import_metadata.source).toBe('bank_import');
      expect(savedEntry.import_metadata.original_payee).toBe('BG ENERGY DD');
    });
  });
});