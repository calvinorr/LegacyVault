const { detectRecurringPayments, analyzeTransactionFrequency, fuzzyMatchPayee, calculateConfidenceScore } = require('../../src/services/recurringDetector');
const RecurringDetectionRules = require('../../src/models/RecurringDetectionRules');

describe('Recurring Payment Detection Service', () => {
  let mockDetectionRules;

  beforeEach(async () => {
    // Create mock detection rules
    mockDetectionRules = new RecurringDetectionRules({
      name: 'Test Rules',
      is_default: true,
      utility_rules: [
        {
          name: 'British Gas',
          patterns: ['BRITISH GAS', 'BG ENERGY', 'BRITISHGAS'],
          category: 'utilities',
          subcategory: 'gas',
          provider: 'British Gas',
          confidence_boost: 0.2
        },
        {
          name: 'Thames Water',
          patterns: ['THAMES WATER', 'THAMES WTR'],
          category: 'utilities',
          subcategory: 'water',
          provider: 'Thames Water',
          confidence_boost: 0.2
        }
      ],
      council_tax_rules: [
        {
          name: 'Council Tax Generic',
          patterns: ['COUNCIL TAX', 'COUNCIL-TAX', 'CT PAYMENT'],
          category: 'council_tax',
          subcategory: 'council_tax',
          provider: 'Local Council',
          confidence_boost: 0.3
        }
      ],
      subscription_rules: [
        {
          name: 'Netflix',
          patterns: ['NETFLIX', 'NETFLIX.COM'],
          category: 'subscription',
          subcategory: 'streaming',
          provider: 'Netflix',
          confidence_boost: 0.3
        }
      ],
      general_rules: [
        {
          name: 'Direct Debit',
          patterns: ['DD$', 'DIRECT DEBIT'],
          category: 'other',
          confidence_boost: 0.1
        }
      ],
      settings: {
        min_confidence_threshold: 0.7,
        fuzzy_match_threshold: 0.85,
        amount_variance_tolerance: 0.15,
        frequency_detection_window_days: 90
      }
    });
    
    await mockDetectionRules.save();
  });

  describe('detectRecurringPayments', () => {
    test('should detect recurring utility payments', async () => {
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
          amount: -87.00, // Slight amount variation
          originalText: 'BRITISH GAS DD £87.00'
        }
      ];

      const suggestions = await detectRecurringPayments(transactions);

      expect(suggestions).toHaveLength(1);
      const bgSuggestion = suggestions[0];
      
      expect(bgSuggestion.payee).toBe('British Gas');
      expect(bgSuggestion.category).toBe('utilities');
      expect(bgSuggestion.subcategory).toBe('gas');
      expect(bgSuggestion.frequency).toBe('monthly');
      expect(bgSuggestion.confidence).toBeGreaterThan(0.8);
      expect(bgSuggestion.transactions).toHaveLength(3);
      expect(bgSuggestion.suggested_entry).toMatchObject({
        title: expect.stringContaining('British Gas'),
        provider: 'British Gas',
        type: 'utility'
      });
    });

    test('should detect council tax payments', async () => {
      const transactions = [
        {
          date: new Date('2023-07-01'),
          description: 'COUNCIL TAX',
          amount: -125.50
        },
        {
          date: new Date('2023-08-01'),
          description: 'COUNCIL TAX',
          amount: -125.50
        },
        {
          date: new Date('2023-09-01'),
          description: 'COUNCIL-TAX',
          amount: -125.50
        }
      ];

      const suggestions = await detectRecurringPayments(transactions);

      expect(suggestions).toHaveLength(1);
      const ctSuggestion = suggestions[0];
      
      expect(ctSuggestion.category).toBe('council_tax');
      expect(ctSuggestion.frequency).toBe('monthly');
      expect(ctSuggestion.confidence).toBeGreaterThan(0.9); // High confidence for council tax
    });

    test('should handle subscription services', async () => {
      const transactions = [
        {
          date: new Date('2023-08-05'),
          description: 'NETFLIX.COM',
          amount: -9.99
        },
        {
          date: new Date('2023-09-05'),
          description: 'NETFLIX.COM',
          amount: -9.99
        },
        {
          date: new Date('2023-10-05'),
          description: 'NETFLIX',
          amount: -9.99
        }
      ];

      const suggestions = await detectRecurringPayments(transactions);

      expect(suggestions).toHaveLength(1);
      const netflixSuggestion = suggestions[0];
      
      expect(netflixSuggestion.payee).toBe('Netflix');
      expect(netflixSuggestion.category).toBe('subscription');
      expect(netflixSuggestion.subcategory).toBe('streaming');
    });

    test('should group similar transactions with fuzzy matching', async () => {
      const transactions = [
        {
          date: new Date('2023-08-15'),
          description: 'BRITISH GAS ENERGY',
          amount: -85.50
        },
        {
          date: new Date('2023-09-15'),
          description: 'BG ENERGY DD',
          amount: -85.50
        },
        {
          date: new Date('2023-10-15'),
          description: 'BRITISHGAS DD',
          amount: -86.00
        }
      ];

      const suggestions = await detectRecurringPayments(transactions);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].transactions).toHaveLength(3);
    });

    test('should handle amount variance within tolerance', async () => {
      const transactions = [
        {
          date: new Date('2023-08-15'),
          description: 'THAMES WATER',
          amount: -45.00
        },
        {
          date: new Date('2023-09-15'),
          description: 'THAMES WATER',
          amount: -48.50 // ~8% variance
        },
        {
          date: new Date('2023-10-15'),
          description: 'THAMES WATER',
          amount: -46.20 // Within 15% tolerance
        }
      ];

      const suggestions = await detectRecurringPayments(transactions);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].transactions).toHaveLength(3);
    });

    test('should reject high amount variance', async () => {
      const transactions = [
        {
          date: new Date('2023-08-15'),
          description: 'VARIABLE PAYMENT',
          amount: -50.00
        },
        {
          date: new Date('2023-09-15'),
          description: 'VARIABLE PAYMENT',
          amount: -75.00 // 50% variance - too high
        },
        {
          date: new Date('2023-10-15'),
          description: 'VARIABLE PAYMENT',
          amount: -100.00 // 100% variance from first
        }
      ];

      const suggestions = await detectRecurringPayments(transactions);

      expect(suggestions).toHaveLength(0); // Should be rejected due to high variance
    });

    test('should detect different frequencies', async () => {
      // Weekly payments
      const weeklyTransactions = [
        { date: new Date('2023-10-01'), description: 'WEEKLY SERVICE', amount: -20.00 },
        { date: new Date('2023-10-08'), description: 'WEEKLY SERVICE', amount: -20.00 },
        { date: new Date('2023-10-15'), description: 'WEEKLY SERVICE', amount: -20.00 }
      ];

      // Quarterly payments  
      const quarterlyTransactions = [
        { date: new Date('2023-04-01'), description: 'QUARTERLY BILL', amount: -300.00 },
        { date: new Date('2023-07-01'), description: 'QUARTERLY BILL', amount: -300.00 },
        { date: new Date('2023-10-01'), description: 'QUARTERLY BILL', amount: -300.00 }
      ];

      const allTransactions = [...weeklyTransactions, ...quarterlyTransactions];
      const suggestions = await detectRecurringPayments(allTransactions);

      expect(suggestions).toHaveLength(2);
      
      const weeklySuggestion = suggestions.find(s => s.payee.includes('WEEKLY'));
      const quarterlySuggestion = suggestions.find(s => s.payee.includes('QUARTERLY'));
      
      expect(weeklySuggestion.frequency).toBe('weekly');
      expect(quarterlySuggestion.frequency).toBe('quarterly');
    });

    test('should filter out low confidence suggestions', async () => {
      const transactions = [
        {
          date: new Date('2023-08-15'),
          description: 'RANDOM SHOP',
          amount: -25.00
        },
        {
          date: new Date('2023-09-20'), // Irregular timing
          description: 'RANDOM SHOP',
          amount: -35.00 // Different amount
        }
      ];

      const suggestions = await detectRecurringPayments(transactions);

      expect(suggestions).toHaveLength(0); // Should be filtered out due to low confidence
    });

    test('should require minimum number of occurrences', async () => {
      const singleTransaction = [
        {
          date: new Date('2023-10-15'),
          description: 'BRITISH GAS DD',
          amount: -85.50
        }
      ];

      const suggestions = await detectRecurringPayments(singleTransaction);

      expect(suggestions).toHaveLength(0); // Single transaction should not create suggestion
    });
  });

  describe('analyzeTransactionFrequency', () => {
    test('should detect monthly frequency', () => {
      const transactions = [
        { date: new Date('2023-08-15') },
        { date: new Date('2023-09-15') },
        { date: new Date('2023-10-15') }
      ];

      const frequency = analyzeTransactionFrequency(transactions);
      expect(frequency).toBe('monthly');
    });

    test('should detect weekly frequency', () => {
      const transactions = [
        { date: new Date('2023-10-01') },
        { date: new Date('2023-10-08') },
        { date: new Date('2023-10-15') },
        { date: new Date('2023-10-22') }
      ];

      const frequency = analyzeTransactionFrequency(transactions);
      expect(frequency).toBe('weekly');
    });

    test('should detect quarterly frequency', () => {
      const transactions = [
        { date: new Date('2023-01-15') },
        { date: new Date('2023-04-15') },
        { date: new Date('2023-07-15') },
        { date: new Date('2023-10-15') }
      ];

      const frequency = analyzeTransactionFrequency(transactions);
      expect(frequency).toBe('quarterly');
    });

    test('should detect annual frequency', () => {
      const transactions = [
        { date: new Date('2021-10-15') },
        { date: new Date('2022-10-15') },
        { date: new Date('2023-10-15') }
      ];

      const frequency = analyzeTransactionFrequency(transactions);
      expect(frequency).toBe('annually');
    });

    test('should default to irregular for unclear patterns', () => {
      const transactions = [
        { date: new Date('2023-08-15') },
        { date: new Date('2023-09-20') },
        { date: new Date('2023-10-05') }
      ];

      const frequency = analyzeTransactionFrequency(transactions);
      expect(frequency).toBe('irregular');
    });
  });

  describe('fuzzyMatchPayee', () => {
    test('should match similar payee names', () => {
      const result = fuzzyMatchPayee('BRITISH GAS DD', ['BRITISH GAS', 'BG ENERGY']);
      
      expect(result.match).toBe(true);
      expect(result.score).toBeGreaterThan(0.8);
      expect(result.matchedPattern).toBe('BRITISH GAS');
    });

    test('should handle exact matches', () => {
      const result = fuzzyMatchPayee('NETFLIX', ['NETFLIX', 'SPOTIFY']);
      
      expect(result.match).toBe(true);
      expect(result.score).toBe(1.0);
      expect(result.matchedPattern).toBe('NETFLIX');
    });

    test('should reject poor matches', () => {
      const result = fuzzyMatchPayee('COMPLETELY DIFFERENT', ['NETFLIX', 'SPOTIFY']);
      
      expect(result.match).toBe(false);
      expect(result.score).toBeLessThan(0.5);
    });

    test('should handle partial matches', () => {
      const result = fuzzyMatchPayee('BRITISH GAS ENERGY SUPPLY', ['BRITISH GAS']);
      
      expect(result.match).toBe(true);
      expect(result.score).toBeGreaterThan(0.7);
    });

    test('should be case insensitive', () => {
      const result = fuzzyMatchPayee('british gas', ['BRITISH GAS']);
      
      expect(result.match).toBe(true);
      expect(result.score).toBe(1.0);
    });
  });

  describe('calculateConfidenceScore', () => {
    test('should calculate high confidence for perfect matches', () => {
      const matchData = {
        frequencyConsistency: 1.0, // Perfect monthly pattern
        amountConsistency: 1.0,    // Identical amounts
        patternMatch: 1.0,         // Exact pattern match
        occurrenceCount: 5         // Good sample size
      };

      const score = calculateConfidenceScore(matchData);
      expect(score).toBeGreaterThan(0.9);
    });

    test('should reduce confidence for irregular patterns', () => {
      const matchData = {
        frequencyConsistency: 0.6, // Somewhat irregular
        amountConsistency: 0.8,    // Some amount variation
        patternMatch: 0.9,         // Good pattern match
        occurrenceCount: 3         // Minimum occurrences
      };

      const score = calculateConfidenceScore(matchData);
      expect(score).toBeGreaterThan(0.6);
      expect(score).toBeLessThan(0.8);
    });

    test('should boost confidence for rule matches', () => {
      const matchData = {
        frequencyConsistency: 0.8,
        amountConsistency: 0.8,
        patternMatch: 0.8,
        occurrenceCount: 3,
        ruleBoost: 0.2 // Matched a high-confidence rule
      };

      const score = calculateConfidenceScore(matchData);
      const scoreWithoutBoost = calculateConfidenceScore({ ...matchData, ruleBoost: 0 });
      
      expect(score).toBeGreaterThan(scoreWithoutBoost);
    });

    test('should penalize low occurrence counts', () => {
      const highOccurrence = calculateConfidenceScore({
        frequencyConsistency: 0.8,
        amountConsistency: 0.8,
        patternMatch: 0.8,
        occurrenceCount: 8
      });

      const lowOccurrence = calculateConfidenceScore({
        frequencyConsistency: 0.8,
        amountConsistency: 0.8,
        patternMatch: 0.8,
        occurrenceCount: 2
      });

      expect(highOccurrence).toBeGreaterThan(lowOccurrence);
    });
  });

  describe('Error handling', () => {
    test('should handle empty transaction list', async () => {
      const suggestions = await detectRecurringPayments([]);
      expect(suggestions).toEqual([]);
    });

    test('should handle malformed transactions', async () => {
      const malformedTransactions = [
        { description: 'MISSING DATE', amount: -50.00 },
        { date: new Date('2023-10-15'), amount: -60.00 }, // Missing description
        { date: 'invalid date', description: 'INVALID', amount: -70.00 }
      ];

      const suggestions = await detectRecurringPayments(malformedTransactions);
      expect(suggestions).toEqual([]);
    });

    test('should handle missing detection rules gracefully', async () => {
      // Delete all rules
      await RecurringDetectionRules.deleteMany({});

      const transactions = [
        { date: new Date('2023-08-15'), description: 'TEST', amount: -50.00 },
        { date: new Date('2023-09-15'), description: 'TEST', amount: -50.00 }
      ];

      const suggestions = await detectRecurringPayments(transactions);
      expect(suggestions).toEqual([]); // Should not crash, just return empty
    });
  });
});