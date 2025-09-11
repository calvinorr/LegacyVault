import { mapTransactionToEntry, validateMappedEntry, inferBillTypeFromDescription, inferPaymentMethodFromAmount } from '../transactionMapper';

describe('Transaction Mapper', () => {
  const mockTransaction = {
    date: '2025-09-01',
    description: 'British Gas Payment',
    amount: -85.50,
    originalText: 'DD BRITISH GAS ENERGY'
  };

  describe('mapTransactionToEntry', () => {
    it('should map transaction to entry format correctly', () => {
      const result = mapTransactionToEntry(mockTransaction);

      expect(result).toEqual({
        title: 'British Gas Payment',
        provider: 'British Gas',
        accountDetails: {
          billType: 'Gas',
          customerNumber: '',
          meterNumber: '',
          tariffType: '',
          paymentMethod: 'Direct Debit',
          billingFrequency: 'Monthly',
          emergencyNumber: '',
          onlineAccountUrl: '',
          category: 'bill'
        },
        notes: `Transaction Date: 01/09/2025\nAmount: £85.50\nOriginal Text: DD BRITISH GAS ENERGY`,
        confidential: true,
        category: 'Bills',
        subCategory: 'Energy',
        supplier: 'British Gas',
        tags: []
      });
    });

    it('should handle Netflix subscription correctly', () => {
      const netflixTransaction = {
        date: '2025-09-02',
        description: 'Netflix Subscription',
        amount: -12.99,
        originalText: 'NETFLIX.COM'
      };

      const result = mapTransactionToEntry(netflixTransaction);

      expect(result.title).toBe('Netflix Subscription');
      expect(result.provider).toBe('Netflix');
      expect(result.accountDetails.billType).toBe('Netflix/Streaming');
      expect(result.category).toBe('Subscriptions');
      expect(result.subCategory).toBe('Streaming');
    });

    it('should handle council tax payments', () => {
      const councilTaxTransaction = {
        date: '2025-09-03',
        description: 'Westminster Council Tax',
        amount: -150.00,
        originalText: 'DD WESTMINSTER COUNCIL TAX'
      };

      const result = mapTransactionToEntry(councilTaxTransaction);

      expect(result.accountDetails.billType).toBe('Council Tax');
      expect(result.subCategory).toBe('Council Services');
    });

    it('should handle positive amounts (refunds/credits)', () => {
      const refundTransaction = {
        date: '2025-09-04',
        description: 'British Gas Refund',
        amount: 25.00,
        originalText: 'REFUND BRITISH GAS'
      };

      const result = mapTransactionToEntry(refundTransaction);

      expect(result.notes).toContain('Amount: £25.00 (Credit)');
    });
  });

  describe('inferBillTypeFromDescription', () => {
    it('should infer bill type from common energy providers', () => {
      expect(inferBillTypeFromDescription('British Gas Payment')).toBe('Gas');
      expect(inferBillTypeFromDescription('EDF Energy Bill')).toBe('Electricity');
      expect(inferBillTypeFromDescription('Octopus Energy')).toBe('Electricity');
    });

    it('should infer bill type from service descriptions', () => {
      expect(inferBillTypeFromDescription('Thames Water Direct Debit')).toBe('Water');
      expect(inferBillTypeFromDescription('BT Broadband Payment')).toBe('Internet/Broadband');
      expect(inferBillTypeFromDescription('Sky TV Subscription')).toBe('Sky TV/Satellite');
    });

    it('should handle council tax variations', () => {
      expect(inferBillTypeFromDescription('Westminster Council Tax')).toBe('Council Tax');
      expect(inferBillTypeFromDescription('COUNCIL TAX PAYMENT')).toBe('Council Tax');
    });

    it('should return "Other" for unknown descriptions', () => {
      expect(inferBillTypeFromDescription('Random Company XYZ')).toBe('Other');
    });
  });

  describe('inferPaymentMethodFromAmount', () => {
    it('should detect Direct Debit from description patterns', () => {
      expect(inferPaymentMethodFromAmount(-85.50, 'DD BRITISH GAS')).toBe('Direct Debit');
      expect(inferPaymentMethodFromAmount(-12.99, 'DIRECT DEBIT NETFLIX')).toBe('Direct Debit');
    });

    it('should detect Standing Order from description patterns', () => {
      expect(inferPaymentMethodFromAmount(-500.00, 'SO MORTGAGE PAYMENT')).toBe('Standing Order');
      expect(inferPaymentMethodFromAmount(-200.00, 'STANDING ORDER RENT')).toBe('Standing Order');
    });

    it('should default to Monthly Payment for regular amounts', () => {
      expect(inferPaymentMethodFromAmount(-50.00, 'Regular Payment')).toBe('Monthly Payment');
    });

    it('should handle card payments', () => {
      expect(inferPaymentMethodFromAmount(-25.00, 'CARD PAYMENT SAINSBURYS')).toBe('Card Payment');
    });
  });

  describe('validateMappedEntry', () => {
    it('should validate complete entry successfully', () => {
      const validEntry = mapTransactionToEntry(mockTransaction);
      const validation = validateMappedEntry(validEntry);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidEntry = {
        title: '',  // Missing required field
        provider: 'British Gas',
        accountDetails: {
          billType: 'Gas',
          customerNumber: '',
          meterNumber: '',
          tariffType: '',
          paymentMethod: 'Direct Debit',
          billingFrequency: 'Monthly',
          emergencyNumber: '',
          onlineAccountUrl: '',
          category: 'bill'
        },
        notes: 'Test',
        confidential: true,
        category: 'Bills',
        subCategory: 'Energy',
        supplier: 'British Gas',
        tags: []
      };

      const validation = validateMappedEntry(invalidEntry);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Title is required');
    });

    it('should detect invalid bill type', () => {
      const entryWithInvalidBillType = mapTransactionToEntry(mockTransaction);
      entryWithInvalidBillType.accountDetails.billType = 'Invalid Type';

      const validation = validateMappedEntry(entryWithInvalidBillType);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid bill type');
    });

    it('should detect invalid category', () => {
      const entryWithInvalidCategory = mapTransactionToEntry(mockTransaction);
      entryWithInvalidCategory.category = 'Invalid Category';

      const validation = validateMappedEntry(entryWithInvalidCategory);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid category');
    });
  });
});