import {
  extractProviderFromDescription,
  generateEntryTitle,
  extractPaymentDate,
  isDirectDebit,
  determineEntryType,
  convertTransactionToEntry,
  batchConvertTransactions,
  validateEntryData,
  formatAmount,
  generateEntryPreview,
} from '../transactionToEntryConverter';

describe('Transaction to Entry Converter', () => {
  const mockTransaction = {
    date: '2025-09-01',
    description: 'British Gas Payment',
    amount: -85.50,
    originalText: 'DD BRITISH GAS ENERGY'
  };

  const mockCategorySuggestion = {
    categoryId: 'cat3',
    categoryName: 'Gas',
    categoryPath: 'Bills > Energy > Gas',
    parentCategoryId: 'cat2',
    parentCategoryName: 'Energy',
    rootCategoryId: 'cat1',
    rootCategoryName: 'Bills',
    confidence: 0.85,
    reason: 'Matched recurring payment pattern for British Gas',
    provider: 'British Gas',
    suggestedBillType: 'Gas'
  };

  describe('extractProviderFromDescription', () => {
    it('should extract British Gas variations', () => {
      expect(extractProviderFromDescription('DD BRITISH GAS ENERGY')).toBe('British Gas');
      expect(extractProviderFromDescription('BRITISH GAS PAYMENT')).toBe('British Gas');
      expect(extractProviderFromDescription('BG ENERGY DIRECT DEBIT')).toBe('British Gas');
    });

    it('should extract other UK utilities', () => {
      expect(extractProviderFromDescription('E.ON ENERGY')).toBe('E.ON');
      expect(extractProviderFromDescription('EDF ENERGY PAYMENT')).toBe('EDF Energy');
      expect(extractProviderFromDescription('THAMES WATER DD')).toBe('Thames Water');
      expect(extractProviderFromDescription('COUNCIL TAX PAYMENT')).toBe('Council Tax');
    });

    it('should extract telecoms providers', () => {
      expect(extractProviderFromDescription('BT GROUP PAYMENT')).toBe('BT');
      expect(extractProviderFromDescription('THREE UK MOBILE')).toBe('Three');
      expect(extractProviderFromDescription('VODAFONE DIRECT DEBIT')).toBe('Vodafone');
    });

    it('should extract streaming services', () => {
      expect(extractProviderFromDescription('NETFLIX.COM')).toBe('Netflix');
      expect(extractProviderFromDescription('AMAZON PRIME SUBSCRIPTION')).toBe('Amazon Prime');
      expect(extractProviderFromDescription('SPOTIFY PREMIUM')).toBe('Spotify');
    });

    it('should fallback to clean text extraction', () => {
      expect(extractProviderFromDescription('PAYMENT UNKNOWN MERCHANT LTD')).toBe('UNKNOWN MERCHANT');
      expect(extractProviderFromDescription('DD ACME SERVICES')).toBe('ACME SERVICES');
    });

    it('should handle reference codes and numbers', () => {
      expect(extractProviderFromDescription('DD PROVIDER ABC123')).toBe('PROVIDER');
      expect(extractProviderFromDescription('PAYMENT XYZ SERVICES 789')).toBe('XYZ SERVICES');
    });
  });

  describe('generateEntryTitle', () => {
    it('should generate appropriate bill titles', () => {
      expect(generateEntryTitle('British Gas Energy', 'British Gas')).toBe('British Gas Gas Bill');
      expect(generateEntryTitle('Thames Water Payment', 'Thames Water')).toBe('Thames Water Water Bill');
      expect(generateEntryTitle('Council Tax DD', 'Council Tax')).toBe('Council Tax Council Tax');
    });

    it('should generate subscription titles', () => {
      expect(generateEntryTitle('Netflix Streaming', 'Netflix')).toBe('Netflix Subscription');
      expect(generateEntryTitle('Amazon Prime', 'Amazon Prime')).toBe('Amazon Prime Subscription');
    });

    it('should fallback to payment title', () => {
      expect(generateEntryTitle('Unknown Service', 'Unknown Provider')).toBe('Unknown Provider Payment');
    });
  });

  describe('extractPaymentDate', () => {
    it('should extract day of month', () => {
      expect(extractPaymentDate('2025-09-15')).toBe('15');
      expect(extractPaymentDate('2025-01-01')).toBe('1');
      expect(extractPaymentDate('2025-12-31')).toBe('31');
    });

    it('should handle invalid dates', () => {
      expect(extractPaymentDate('invalid-date')).toBe('');
    });
  });

  describe('isDirectDebit', () => {
    it('should detect direct debit indicators', () => {
      expect(isDirectDebit('DD BRITISH GAS')).toBe(true);
      expect(isDirectDebit('DIRECT DEBIT PAYMENT')).toBe(true);
      expect(isDirectDebit('FPO HSBC PAYMENT')).toBe(true);
    });

    it('should return false for non-direct debit', () => {
      expect(isDirectDebit('CARD PAYMENT')).toBe(false);
      expect(isDirectDebit('ONLINE TRANSFER')).toBe(false);
    });
  });

  describe('determineEntryType', () => {
    it('should determine investment types', () => {
      expect(determineEntryType('Pension contribution', -500)).toBe('investment');
      expect(determineEntryType('ISA payment', -1000)).toBe('investment');
      expect(determineEntryType('SIPP transfer', -2000)).toBe('investment');
    });

    it('should determine property types', () => {
      expect(determineEntryType('Mortgage payment', -1200)).toBe('property');
      expect(determineEntryType('Council tax', -150)).toBe('property');
      expect(determineEntryType('Rent payment', -800)).toBe('property');
    });

    it('should determine policy types', () => {
      expect(determineEntryType('Car insurance', -45)).toBe('policy');
      expect(determineEntryType('Home policy', -30)).toBe('policy');
    });

    it('should determine account types', () => {
      expect(determineEntryType('Savings transfer', -500)).toBe('account');
      expect(determineEntryType('Account deposit', 1000)).toBe('account');
    });

    it('should default to bill type', () => {
      expect(determineEntryType('Gas payment', -85)).toBe('bill');
      expect(determineEntryType('Electric bill', -120)).toBe('bill');
      expect(determineEntryType('Unknown payment', -50)).toBe('bill');
    });
  });

  describe('convertTransactionToEntry', () => {
    it('should convert transaction without category suggestion', () => {
      const result = convertTransactionToEntry(mockTransaction);

      expect(result.title).toBe('British Gas Gas Bill');
      expect(result.provider).toBe('British Gas');
      expect(result.type).toBe('bill');
      expect(result.category).toBe('');
      expect(result.subCategory).toBe('');
      expect(result.accountDetails.monthlyAmount).toBe('85.50');
      expect(result.accountDetails.paymentDate).toBe('1');
      expect(result.accountDetails.directDebit).toBe(true);
      expect(result.accountDetails.billType).toBe('Other');
      expect(result.confidential).toBe(true);
      expect(result.notes).toContain('Auto-generated from bank transaction');
    });

    it('should convert transaction with category suggestion', () => {
      const result = convertTransactionToEntry(mockTransaction, mockCategorySuggestion);

      expect(result.category).toBe('Bills');
      expect(result.subCategory).toBe('Gas');
      expect(result.accountDetails.billType).toBe('Gas');
      expect(result.notes).toContain('Category suggestion: Bills > Energy > Gas');
      expect(result.notes).toContain('85% confidence');
      expect(result.notes).toContain('Matched recurring payment pattern for British Gas');
    });
  });

  describe('batchConvertTransactions', () => {
    it('should convert multiple transactions', () => {
      const transactions = [
        mockTransaction,
        {
          date: '2025-09-02',
          description: 'Netflix Subscription',
          amount: -12.99,
          originalText: 'NETFLIX.COM'
        }
      ];

      const suggestions = new Map();
      suggestions.set(`${mockTransaction.date}-${mockTransaction.description}-${mockTransaction.amount}`, mockCategorySuggestion);

      const results = batchConvertTransactions(transactions, suggestions);

      expect(results).toHaveLength(2);
      expect(results[0].provider).toBe('British Gas');
      expect(results[0].category).toBe('Bills');
      expect(results[1].provider).toBe('Netflix');
      expect(results[1].category).toBe('');
    });
  });

  describe('validateEntryData', () => {
    it('should validate correct entry data', () => {
      const validData = convertTransactionToEntry(mockTransaction);
      const errors = validateEntryData(validData);
      expect(errors).toHaveLength(0);
    });

    it('should catch validation errors', () => {
      const invalidData = convertTransactionToEntry(mockTransaction);
      invalidData.title = '';
      invalidData.provider = '';
      invalidData.accountDetails.monthlyAmount = 'invalid';
      invalidData.accountDetails.paymentDate = '35';

      const errors = validateEntryData(invalidData);
      expect(errors).toContain('Title is required');
      expect(errors).toContain('Provider is required');
      expect(errors).toContain('Monthly amount must be a valid number');
      expect(errors).toContain('Payment date must be a valid day of the month (1-31)');
    });
  });

  describe('formatAmount', () => {
    it('should format positive amounts', () => {
      expect(formatAmount(85.50)).toBe('85.50');
      expect(formatAmount('123.45')).toBe('123.45');
    });

    it('should format negative amounts as positive', () => {
      expect(formatAmount(-85.50)).toBe('85.50');
      expect(formatAmount('-123.45')).toBe('123.45');
    });

    it('should handle invalid amounts', () => {
      expect(formatAmount('invalid')).toBe('0.00');
      expect(formatAmount(NaN)).toBe('0.00');
    });
  });

  describe('generateEntryPreview', () => {
    it('should generate preview text', () => {
      const entryData = convertTransactionToEntry(mockTransaction, mockCategorySuggestion);
      const preview = generateEntryPreview(entryData);

      expect(preview).toBe('British Gas Gas Bill • British Gas • £85.50 • Gas');
    });

    it('should handle missing category', () => {
      const entryData = convertTransactionToEntry(mockTransaction);
      entryData.subCategory = '';
      entryData.category = '';
      const preview = generateEntryPreview(entryData);

      expect(preview).toBe('British Gas Gas Bill • British Gas • £85.50');
    });
  });
});