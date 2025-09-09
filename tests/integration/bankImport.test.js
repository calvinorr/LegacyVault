const mongoose = require('mongoose');
const User = require('../../src/models/user');
const ImportSession = require('../../src/models/ImportSession');
const RecurringDetectionRules = require('../../src/models/RecurringDetectionRules');
const Entry = require('../../src/models/entry');
const { seedUKDetectionRules } = require('../../src/migrations/001_add_import_support');
const recurringDetector = require('../../src/services/recurringDetector');

describe('Bank Import Integration', () => {
  let testUser;
  let defaultRules;

  beforeEach(async () => {
    // Create test user
    testUser = new User({
      googleId: 'integration-test-user',
      displayName: 'Integration Test User',
      email: 'integration@test.com',
      approved: true
    });
    await testUser.save();

    // Seed detection rules
    await seedUKDetectionRules();
    defaultRules = await RecurringDetectionRules.findOne({ is_default: true });
  });

  describe('End-to-end recurring payment detection', () => {
    test('should detect British Gas utility payments', async () => {
      const transactions = [
        {
          date: new Date('2023-08-15'),
          description: 'BRITISH GAS DD',
          amount: -85.50,
          originalText: 'BRITISH GAS DD £85.50'
        },
        {
          date: new Date('2023-09-15'),
          description: 'BRITISH GAS DD',
          amount: -85.50,
          originalText: 'BRITISH GAS DD £85.50'
        },
        {
          date: new Date('2023-10-15'),
          description: 'BRITISH GAS DD',
          amount: -87.00,
          originalText: 'BRITISH GAS DD £87.00'
        }
      ];

      const suggestions = await recurringDetector.detectRecurringPayments(transactions);

      expect(suggestions).toHaveLength(1);
      const suggestion = suggestions[0];

      expect(suggestion.payee).toBe('British Gas');
      expect(suggestion.category).toBe('utilities');
      expect(suggestion.subcategory).toBe('gas');
      expect(suggestion.frequency).toBe('monthly');
      expect(suggestion.confidence).toBeGreaterThan(0.8);
      expect(suggestion.transactions).toHaveLength(3);
    });

    test('should detect council tax payments', async () => {
      const transactions = [
        {
          date: new Date('2023-08-01'),
          description: 'COUNCIL TAX',
          amount: -125.50,
          originalText: 'COUNCIL TAX £125.50'
        },
        {
          date: new Date('2023-09-01'),
          description: 'COUNCIL TAX',
          amount: -125.50,
          originalText: 'COUNCIL TAX £125.50'
        },
        {
          date: new Date('2023-10-01'),
          description: 'COUNCIL-TAX',
          amount: -125.50,
          originalText: 'COUNCIL-TAX £125.50'
        }
      ];

      const suggestions = await recurringDetector.detectRecurringPayments(transactions);

      expect(suggestions).toHaveLength(1);
      const suggestion = suggestions[0];

      expect(suggestion.category).toBe('council_tax');
      expect(suggestion.frequency).toBe('monthly');
      expect(suggestion.confidence).toBeGreaterThan(0.8);
    });

    test('should detect Netflix subscription', async () => {
      const transactions = [
        {
          date: new Date('2023-08-05'),
          description: 'NETFLIX.COM',
          amount: -9.99,
          originalText: 'NETFLIX.COM £9.99'
        },
        {
          date: new Date('2023-09-05'),
          description: 'NETFLIX',
          amount: -9.99,
          originalText: 'NETFLIX £9.99'
        },
        {
          date: new Date('2023-10-05'),
          description: 'NETFLIX',
          amount: -9.99,
          originalText: 'NETFLIX £9.99'
        }
      ];

      const suggestions = await recurringDetector.detectRecurringPayments(transactions);

      expect(suggestions).toHaveLength(1);
      const suggestion = suggestions[0];

      expect(suggestion.payee).toBe('Netflix');
      expect(suggestion.category).toBe('subscription');
      expect(suggestion.subcategory).toBe('streaming');
      expect(suggestion.frequency).toBe('monthly');
    });

    test('should handle mixed transaction types', async () => {
      const transactions = [
        // British Gas (utility)
        {
          date: new Date('2023-08-15'),
          description: 'BRITISH GAS DD',
          amount: -85.50
        },
        {
          date: new Date('2023-09-15'),
          description: 'BRITISH GAS DD',
          amount: -87.00
        },
        {
          date: new Date('2023-10-15'),
          description: 'BRITISH GAS DD',
          amount: -86.25
        },
        // Netflix (subscription)
        {
          date: new Date('2023-08-05'),
          description: 'NETFLIX',
          amount: -9.99
        },
        {
          date: new Date('2023-09-05'),
          description: 'NETFLIX',
          amount: -9.99
        },
        {
          date: new Date('2023-10-05'),
          description: 'NETFLIX',
          amount: -9.99
        },
        // One-off transactions (should be ignored)
        {
          date: new Date('2023-08-20'),
          description: 'TESCO STORES',
          amount: -45.67
        },
        {
          date: new Date('2023-09-03'),
          description: 'SAINSBURYS',
          amount: -32.10
        }
      ];

      const suggestions = await recurringDetector.detectRecurringPayments(transactions);

      expect(suggestions).toHaveLength(2);

      const gasProvider = suggestions.find(s => s.category === 'utilities');
      const streaming = suggestions.find(s => s.category === 'subscription');

      expect(gasProvider).toBeTruthy();
      expect(gasProvider.payee).toBe('British Gas');
      expect(gasProvider.transactions).toHaveLength(3);

      expect(streaming).toBeTruthy();
      expect(streaming.payee).toBe('Netflix');
      expect(streaming.transactions).toHaveLength(3);
    });
  });

  describe('Import session workflow', () => {
    test('should create and complete import session', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'test-statement.pdf',
        status: 'processing',
        processing_stage: 'pdf_parsing'
      });
      await session.save();

      expect(session._id).toBeDefined();
      expect(session.user).toEqual(testUser._id);
      expect(session.status).toBe('processing');
      expect(session.expires_at).toBeInstanceOf(Date);

      // Simulate processing completion
      const transactions = [
        {
          date: new Date('2023-10-15'),
          description: 'BRITISH GAS DD',
          amount: -85.50
        },
        {
          date: new Date('2023-09-15'),
          description: 'BRITISH GAS DD',
          amount: -85.50
        }
      ];

      const suggestions = await recurringDetector.detectRecurringPayments(transactions);

      session.status = 'completed';
      session.processing_stage = 'complete';
      session.transactions = transactions;
      session.recurring_payments = suggestions;
      session.statistics = {
        total_transactions: transactions.length,
        recurring_detected: suggestions.length,
        date_range_days: 30,
        total_debits: 171.00,
        total_credits: 0
      };

      await session.save();

      const completedSession = await ImportSession.findById(session._id);
      expect(completedSession.status).toBe('completed');
      expect(completedSession.transactions).toHaveLength(2);
      expect(completedSession.recurring_payments).toHaveLength(1);
    });

    test('should create vault entries from suggestions', async () => {
      // Create a completed session with suggestions
      const session = new ImportSession({
        user: testUser._id,
        filename: 'test-statement.pdf',
        status: 'completed',
        recurring_payments: [
          {
            payee: 'British Gas',
            category: 'utilities',
            subcategory: 'gas',
            amount: -85.50,
            frequency: 'monthly',
            confidence: 0.95,
            suggested_entry: {
              title: 'British Gas - Gas Supply',
              provider: 'British Gas',
              type: 'utility'
            },
            status: 'pending'
          }
        ]
      });
      await session.save();

      // Simulate confirming the suggestion
      const suggestion = session.recurring_payments[0];
      
      const entry = new Entry({
        title: suggestion.suggested_entry.title,
        type: suggestion.suggested_entry.type,
        provider: suggestion.suggested_entry.provider,
        category: 'Utilities',
        subCategory: suggestion.subcategory,
        owner: testUser._id,
        import_metadata: {
          source: 'bank_import',
          import_session_id: session._id,
          created_from_suggestion: true,
          original_payee: suggestion.payee,
          confidence_score: suggestion.confidence,
          import_date: new Date(),
          detected_frequency: suggestion.frequency,
          amount_pattern: {
            typical_amount: Math.abs(suggestion.amount),
            variance: 0.1,
            currency: 'GBP'
          }
        }
      });

      await entry.save();

      // Verify entry was created correctly
      expect(entry._id).toBeDefined();
      expect(entry.title).toBe('British Gas - Gas Supply');
      expect(entry.category).toBe('Utilities');
      expect(entry.import_metadata.source).toBe('bank_import');
      expect(entry.import_metadata.import_session_id).toEqual(session._id);
      expect(entry.import_metadata.confidence_score).toBe(0.95);

      // Verify relationship
      const entriesFromSession = await Entry.find({
        'import_metadata.import_session_id': session._id
      });

      expect(entriesFromSession).toHaveLength(1);
      expect(entriesFromSession[0]._id).toEqual(entry._id);
    });
  });

  describe('Detection rules customization', () => {
    test('should create custom detection rules', async () => {
      const customRules = new RecurringDetectionRules({
        name: 'Custom Test Rules',
        custom_user: testUser._id,
        utility_rules: [
          {
            name: 'Local Utility Company',
            patterns: ['LOCAL UTILITY', 'LOCAL POWER'],
            category: 'utilities',
            subcategory: 'electricity',
            provider: 'Local Utility Co',
            confidence_boost: 0.3
          }
        ],
        settings: {
          min_confidence_threshold: 0.8,
          fuzzy_match_threshold: 0.9
        }
      });

      await customRules.save();

      expect(customRules._id).toBeDefined();
      expect(customRules.custom_user).toEqual(testUser._id);
      expect(customRules.utility_rules).toHaveLength(1);
      expect(customRules.is_default).toBe(false);

      // Verify user can only have one default, but multiple custom
      const userRules = await RecurringDetectionRules.find({ custom_user: testUser._id });
      expect(userRules).toHaveLength(1);
    });

    test('should use custom rules for detection when available', async () => {
      // Create custom rules with specific pattern
      const customRules = new RecurringDetectionRules({
        name: 'Test Custom Rules',
        custom_user: testUser._id,
        utility_rules: [
          {
            name: 'Special Utility',
            patterns: ['SPECIAL ENERGY CO'],
            category: 'utilities',
            provider: 'Special Energy',
            confidence_boost: 0.4
          }
        ]
      });
      await customRules.save();

      // Test transactions that match custom pattern
      const transactions = [
        {
          date: new Date('2023-08-15'),
          description: 'SPECIAL ENERGY CO DD',
          amount: -95.00
        },
        {
          date: new Date('2023-09-15'),
          description: 'SPECIAL ENERGY CO DD',
          amount: -95.00
        }
      ];

      // Mock the rules finder to return custom rules
      const originalFind = RecurringDetectionRules.findOne;
      RecurringDetectionRules.findOne = jest.fn().mockResolvedValue(customRules);

      const suggestions = await recurringDetector.detectRecurringPayments(transactions);

      // Restore original method
      RecurringDetectionRules.findOne = originalFind;

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].payee).toBe('Special Energy');
      expect(suggestions[0].confidence).toBeGreaterThan(0.8); // Should be boosted
    });
  });
});