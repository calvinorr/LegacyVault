const mongoose = require('mongoose');
const RecurringDetectionRules = require('../../src/models/RecurringDetectionRules');
const { seedUKDetectionRules } = require('../../src/migrations/001_add_import_support');
const recurringDetector = require('../../src/services/recurringDetector');

describe('Debug Recurring Detection', () => {
  beforeEach(async () => {
    await seedUKDetectionRules();
  });

  test('debug British Gas detection', async () => {
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

    // Check if rules exist
    const rules = await RecurringDetectionRules.findOne({ is_default: true });
    console.log('Rules found:', !!rules);
    console.log('Utility rules count:', rules?.utility_rules?.length || 0);
    
    if (rules) {
      const bgRule = rules.utility_rules.find(r => r.name === 'British Gas Energy');
      console.log('British Gas rule found:', !!bgRule);
      if (bgRule) {
        console.log('British Gas patterns:', bgRule.patterns);
        console.log('British Gas category:', bgRule.category);
      }
    }

    const suggestions = await recurringDetector.detectRecurringPayments(transactions);
    console.log('Suggestions count:', suggestions.length);
    
    if (suggestions.length > 0) {
      console.log('First suggestion:', {
        payee: suggestions[0].payee,
        category: suggestions[0].category,
        confidence: suggestions[0].confidence,
        frequency: suggestions[0].frequency
      });
    }

    // Test the fuzzy matching directly
    const { fuzzyMatchPayee } = require('../../src/services/recurringDetector');
    const match = fuzzyMatchPayee('BRITISH GAS DD', ['BRITISH GAS', 'BG ENERGY']);
    console.log('Direct fuzzy match result:', match);

    expect(suggestions.length).toBeGreaterThanOrEqual(0); // Just check it doesn't crash
  });
});