import { 
  suggestCategoriesFromTransaction, 
  suggestCategoriesFromPayee,
  calculateSuggestionConfidence,
  mapLegacyCategoryToDynamic,
  enhanceTransactionWithCategories
} from '../categorySuggestionService';

// Mock the API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Category Suggestion Service', () => {
  const mockTransaction = {
    date: '2025-09-01',
    description: 'British Gas Payment',
    amount: -85.50,
    originalText: 'DD BRITISH GAS ENERGY'
  };

  const mockRecurringRules = {
    bill_rules: [
      {
        name: 'British Gas Energy',
        patterns: ['BRITISH GAS', 'BG ENERGY'],
        category: 'bills',
        subcategory: 'gas',
        provider: 'British Gas',
        confidence_boost: 0.2,
        uk_specific: true,
        active: true
      }
    ]
  };

  const mockDynamicCategories = [
    {
      _id: 'cat1',
      name: 'Bills',
      parentId: null,
      children: [
        {
          _id: 'cat2', 
          name: 'Energy',
          parentId: 'cat1',
          children: [
            { _id: 'cat3', name: 'Gas', parentId: 'cat2', children: [] },
            { _id: 'cat4', name: 'Electricity', parentId: 'cat2', children: [] }
          ]
        }
      ]
    },
    {
      _id: 'cat5',
      name: 'Subscriptions',
      parentId: null,
      children: [
        {
          _id: 'cat6',
          name: 'Streaming',
          parentId: 'cat5',
          children: []
        }
      ]
    }
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    
    // Mock successful API responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ categories: mockDynamicCategories })
        });
      }
      
      if (url.includes('/api/recurring-rules')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRecurringRules)
        });
      }
      
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  describe('suggestCategoriesFromTransaction', () => {
    it('should suggest categories based on transaction description and amount', async () => {
      const suggestions = await suggestCategoriesFromTransaction(mockTransaction);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]).toEqual({
        categoryId: 'cat3',
        categoryName: 'Gas',
        categoryPath: 'Bills > Energy > Gas',
        parentCategoryId: 'cat2',
        parentCategoryName: 'Energy',
        rootCategoryId: 'cat1',
        rootCategoryName: 'Bills',
        confidence: expect.any(Number),
        reason: 'Matched recurring payment pattern for British Gas',
        provider: 'British Gas',
        suggestedBillType: 'Gas'
      });
      
      expect(suggestions[0].confidence).toBeGreaterThan(0.7);
    });

    it('should handle Netflix subscription correctly', async () => {
      const netflixTransaction = {
        date: '2025-09-02',
        description: 'Netflix Subscription',
        amount: -12.99,
        originalText: 'NETFLIX.COM'
      };

      // Add Netflix rule to mock
      mockRecurringRules.bill_rules.push({
        name: 'Netflix Streaming',
        patterns: ['NETFLIX'],
        category: 'subscriptions',
        subcategory: 'streaming',
        provider: 'Netflix',
        confidence_boost: 0.15,
        uk_specific: false,
        active: true
      });

      const suggestions = await suggestCategoriesFromTransaction(netflixTransaction);

      expect(suggestions[0].rootCategoryName).toBe('Subscriptions');
      expect(suggestions[0].categoryName).toBe('Streaming');
      expect(suggestions[0].provider).toBe('Netflix');
    });

    it('should return empty array when no patterns match', async () => {
      const unknownTransaction = {
        date: '2025-09-03',
        description: 'Random Company XYZ',
        amount: -50.00,
        originalText: 'UNKNOWN MERCHANT'
      };

      const suggestions = await suggestCategoriesFromTransaction(unknownTransaction);

      expect(suggestions).toHaveLength(0);
    });

    it('should handle API failures gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('API Error'));

      const suggestions = await suggestCategoriesFromTransaction(mockTransaction);

      expect(suggestions).toHaveLength(0);
    });
  });

  describe('suggestCategoriesFromPayee', () => {
    it('should suggest categories based on payee name only', async () => {
      const suggestions = await suggestCategoriesFromPayee('British Gas');

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].provider).toBe('British Gas');
      expect(suggestions[0].categoryName).toBe('Gas');
    });

    it('should handle fuzzy matching for payee names', async () => {
      const suggestions = await suggestCategoriesFromPayee('British Gas Energy'); // Close match

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].provider).toBe('British Gas');
    });

    it('should return multiple suggestions when multiple patterns match', async () => {
      // Add another British Gas rule
      mockRecurringRules.bill_rules.push({
        name: 'British Gas Electric',
        patterns: ['BRITISH GAS', 'BG ELECTRIC'],
        category: 'bills',
        subcategory: 'electricity',
        provider: 'British Gas',
        confidence_boost: 0.15,
        uk_specific: true,
        active: true
      });

      const suggestions = await suggestCategoriesFromPayee('British Gas');

      expect(suggestions).toHaveLength(2);
      expect(suggestions.map(s => s.categoryName)).toContain('Gas');
      expect(suggestions.map(s => s.categoryName)).toContain('Electricity');
    });
  });

  describe('calculateSuggestionConfidence', () => {
    it('should calculate confidence based on pattern match and rule boost', () => {
      const confidence = calculateSuggestionConfidence({
        patternMatchScore: 0.9,
        ruleConfidenceBoost: 0.2,
        hasAmountPattern: true,
        isFrequentPayee: false
      });

      expect(confidence).toBeGreaterThan(0.8);
      expect(confidence).toBeLessThanOrEqual(1.0);
    });

    it('should boost confidence for frequent payees', () => {
      const baseConfidence = calculateSuggestionConfidence({
        patternMatchScore: 0.7,
        ruleConfidenceBoost: 0.1,
        hasAmountPattern: false,
        isFrequentPayee: false
      });

      const boostedConfidence = calculateSuggestionConfidence({
        patternMatchScore: 0.7,
        ruleConfidenceBoost: 0.1,
        hasAmountPattern: false,
        isFrequentPayee: true
      });

      expect(boostedConfidence).toBeGreaterThan(baseConfidence);
    });

    it('should not exceed maximum confidence of 1.0', () => {
      const confidence = calculateSuggestionConfidence({
        patternMatchScore: 1.0,
        ruleConfidenceBoost: 0.5,
        hasAmountPattern: true,
        isFrequentPayee: true
      });

      expect(confidence).toBe(1.0);
    });
  });

  describe('mapLegacyCategoryToDynamic', () => {
    it('should map legacy "bills" category to dynamic categories', () => {
      const result = mapLegacyCategoryToDynamic('bills', 'gas', mockDynamicCategories);

      expect(result).toEqual({
        categoryId: 'cat3',
        categoryName: 'Gas',
        categoryPath: 'Bills > Energy > Gas',
        parentCategoryId: 'cat2',
        parentCategoryName: 'Energy',
        rootCategoryId: 'cat1',
        rootCategoryName: 'Bills'
      });
    });

    it('should map legacy "subscriptions" category', () => {
      const result = mapLegacyCategoryToDynamic('subscriptions', 'streaming', mockDynamicCategories);

      expect(result).toEqual({
        categoryId: 'cat6',
        categoryName: 'Streaming',
        categoryPath: 'Subscriptions > Streaming',
        parentCategoryId: 'cat5',
        parentCategoryName: 'Subscriptions',
        rootCategoryId: 'cat5',
        rootCategoryName: 'Subscriptions'
      });
    });

    it('should return null for unknown category mappings', () => {
      const result = mapLegacyCategoryToDynamic('unknown', 'test', mockDynamicCategories);

      expect(result).toBeNull();
    });

    it('should handle missing subcategory by returning parent category', () => {
      const result = mapLegacyCategoryToDynamic('bills', '', mockDynamicCategories);

      expect(result.categoryName).toBe('Energy'); // Should map to Energy parent
      expect(result.rootCategoryName).toBe('Bills');
    });
  });

  describe('enhanceTransactionWithCategories', () => {
    it('should enhance transaction mapping with category suggestions', async () => {
      const mockMappedEntry = {
        title: 'British Gas Payment',
        provider: 'British Gas',
        category: 'Bills',
        subCategory: 'Energy',
        accountDetails: { billType: 'Gas' }
      };

      const enhanced = await enhanceTransactionWithCategories(mockTransaction, mockMappedEntry);

      expect(enhanced).toEqual({
        ...mockMappedEntry,
        suggestedCategories: expect.any(Array),
        categoryConfidence: expect.any(Number),
        recommendedCategoryId: 'cat3'
      });

      expect(enhanced.suggestedCategories[0].categoryName).toBe('Gas');
      expect(enhanced.categoryConfidence).toBeGreaterThan(0.7);
    });

    it('should handle transactions with no category suggestions', async () => {
      const unknownTransaction = {
        date: '2025-09-03',
        description: 'Unknown Merchant',
        amount: -25.00,
        originalText: 'UNKNOWN'
      };

      const mockMappedEntry = {
        title: 'Unknown Merchant',
        provider: 'Unknown Merchant',
        category: 'Bills',
        subCategory: '',
        accountDetails: { billType: 'Other' }
      };

      const enhanced = await enhanceTransactionWithCategories(unknownTransaction, mockMappedEntry);

      expect(enhanced.suggestedCategories).toHaveLength(0);
      expect(enhanced.categoryConfidence).toBe(0);
      expect(enhanced.recommendedCategoryId).toBeNull();
    });
  });
});