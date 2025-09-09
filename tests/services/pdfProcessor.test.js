const fs = require('fs');
const path = require('path');
const { extractTransactions, parsePdfBuffer, identifyBankFromContent } = require('../../src/services/pdfProcessor');

// Mock PDF2JSON
jest.mock('pdf2json', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    parseBuffer: jest.fn(),
    getRawTextContent: jest.fn()
  }));
});

describe('PDF Processing Service', () => {
  const mockPdfContent = {
    Pages: [
      {
        Texts: [
          { R: [{ T: 'NATWEST%20BANK%20PLC' }] },
          { R: [{ T: 'STATEMENT%20OF%20ACCOUNT' }] },
          { R: [{ T: '15%2F10%2F2023' }] }, // 15/10/2023
          { R: [{ T: 'BRITISH%20GAS%20DD' }] },
          { R: [{ T: '%2D85%2E50' }] }, // -85.50
          { R: [{ T: '1%2C234%2E50' }] }, // 1,234.50 (balance)
          { R: [{ T: '16%2F10%2F2023' }] }, // 16/10/2023
          { R: [{ T: 'TESCO%20STORES' }] },
          { R: [{ T: '%2D25%2E67' }] }, // -25.67
          { R: [{ T: '1%2C208%2E83' }] }, // 1,208.83 (balance)
        ]
      }
    ]
  };

  describe('parsePdfBuffer', () => {
    test('should parse PDF buffer and return JSON content', async () => {
      const PDF2JSON = require('pdf2json');
      const mockPdfParser = {
        on: jest.fn(),
        parseBuffer: jest.fn()
      };
      
      PDF2JSON.mockReturnValue(mockPdfParser);

      // Mock the PDF parser events
      mockPdfParser.on.mockImplementation((event, callback) => {
        if (event === 'pdfParser_dataReady') {
          setTimeout(() => callback(mockPdfContent), 10);
        }
      });

      const mockBuffer = Buffer.from('mock pdf content');
      const result = await parsePdfBuffer(mockBuffer);

      expect(result).toEqual(mockPdfContent);
      expect(mockPdfParser.parseBuffer).toHaveBeenCalledWith(mockBuffer);
    });

    test('should handle PDF parsing errors', async () => {
      const PDF2JSON = require('pdf2json');
      const mockPdfParser = {
        on: jest.fn(),
        parseBuffer: jest.fn()
      };
      
      PDF2JSON.mockReturnValue(mockPdfParser);

      mockPdfParser.on.mockImplementation((event, callback) => {
        if (event === 'pdfParser_dataError') {
          setTimeout(() => callback(new Error('PDF parsing failed')), 10);
        }
      });

      const mockBuffer = Buffer.from('invalid pdf content');
      
      await expect(parsePdfBuffer(mockBuffer)).rejects.toThrow('PDF parsing failed');
    });

    test('should timeout for stuck PDF parsing', async () => {
      const PDF2JSON = require('pdf2json');
      const mockPdfParser = {
        on: jest.fn(),
        parseBuffer: jest.fn()
      };
      
      PDF2JSON.mockReturnValue(mockPdfParser);

      // Mock parser that never responds
      mockPdfParser.on.mockImplementation(() => {
        // Do nothing - simulate stuck parser
      });

      const mockBuffer = Buffer.from('stuck pdf content');
      
      await expect(parsePdfBuffer(mockBuffer, 100)).rejects.toThrow('timeout');
    }, 1000);
  });

  describe('identifyBankFromContent', () => {
    test('should identify NatWest from PDF content', () => {
      const bankName = identifyBankFromContent(mockPdfContent);
      expect(bankName).toBe('NatWest');
    });

    test('should identify Barclays from content', () => {
      const barclaysContent = {
        Pages: [{
          Texts: [
            { R: [{ T: 'BARCLAYS%20BANK%20UK%20PLC' }] },
            { R: [{ T: 'STATEMENT' }] }
          ]
        }]
      };
      
      const bankName = identifyBankFromContent(barclaysContent);
      expect(bankName).toBe('Barclays');
    });

    test('should identify HSBC from content', () => {
      const hsbcContent = {
        Pages: [{
          Texts: [
            { R: [{ T: 'HSBC%20UK%20BANK%20PLC' }] },
            { R: [{ T: 'CURRENT%20ACCOUNT%20STATEMENT' }] }
          ]
        }]
      };
      
      const bankName = identifyBankFromContent(hsbcContent);
      expect(bankName).toBe('HSBC');
    });

    test('should return "Unknown" for unrecognized banks', () => {
      const unknownContent = {
        Pages: [{
          Texts: [
            { R: [{ T: 'SOME%20RANDOM%20BANK' }] },
            { R: [{ T: 'STATEMENT' }] }
          ]
        }]
      };
      
      const bankName = identifyBankFromContent(unknownContent);
      expect(bankName).toBe('Unknown');
    });

    test('should handle malformed PDF content', () => {
      const malformedContent = { Pages: [] };
      
      const bankName = identifyBankFromContent(malformedContent);
      expect(bankName).toBe('Unknown');
    });
  });

  describe('extractTransactions', () => {
    test('should extract transactions from NatWest PDF content', async () => {
      const transactions = await extractTransactions(mockPdfContent, 'NatWest');

      expect(transactions).toHaveLength(2);
      
      // First transaction: British Gas
      expect(transactions[0]).toMatchObject({
        date: new Date('2023-10-15'),
        description: 'BRITISH GAS DD',
        amount: -85.50,
        balance: 1234.50,
        originalText: expect.stringContaining('BRITISH GAS')
      });

      // Second transaction: Tesco
      expect(transactions[1]).toMatchObject({
        date: new Date('2023-10-16'),
        description: 'TESCO STORES',
        amount: -25.67,
        balance: 1208.83
      });
    });

    test('should extract account number from statement', async () => {
      const contentWithAccount = {
        Pages: [{
          Texts: [
            { R: [{ T: 'Account%20Number%3A%2012345678' }] }, // Account Number: 12345678
            { R: [{ T: '15%2F10%2F2023' }] },
            { R: [{ T: 'TEST%20TRANSACTION' }] },
            { R: [{ T: '%2D50%2E00' }] }
          ]
        }]
      };

      const result = await extractTransactions(contentWithAccount, 'NatWest');
      expect(result.accountNumber).toBe('****5678'); // Masked account number
    });

    test('should extract sort code from statement', async () => {
      const contentWithSortCode = {
        Pages: [{
          Texts: [
            { R: [{ T: 'Sort%20Code%3A%2012%2D34%2D56' }] }, // Sort Code: 12-34-56
            { R: [{ T: '15%2F10%2F2023' }] },
            { R: [{ T: 'TEST%20TRANSACTION' }] },
            { R: [{ T: '%2D50%2E00' }] }
          ]
        }]
      };

      const result = await extractTransactions(contentWithSortCode, 'NatWest');
      expect(result.sortCode).toBe('12-34-56');
    });

    test('should handle different date formats', async () => {
      const contentWithDifferentDates = {
        Pages: [{
          Texts: [
            { R: [{ T: '01%20OCT%202023' }] }, // 01 OCT 2023
            { R: [{ T: 'TRANSACTION%201' }] },
            { R: [{ T: '%2D100%2E00' }] },
            { R: [{ T: '2023%2D10%2D02' }] }, // 2023-10-02 (ISO format)
            { R: [{ T: 'TRANSACTION%202' }] },
            { R: [{ T: '%2D200%2E00' }] }
          ]
        }]
      };

      const transactions = await extractTransactions(contentWithDifferentDates, 'Generic');
      expect(transactions).toHaveLength(2);
      expect(transactions[0].date).toEqual(new Date('2023-10-01'));
      expect(transactions[1].date).toEqual(new Date('2023-10-02'));
    });

    test('should handle credit transactions', async () => {
      const contentWithCredits = {
        Pages: [{
          Texts: [
            { R: [{ T: '15%2F10%2F2023' }] },
            { R: [{ T: 'SALARY%20CREDIT' }] },
            { R: [{ T: '2%2C500%2E00' }] }, // +2,500.00 (positive amount)
            { R: [{ T: '16%2F10%2F2023' }] },
            { R: [{ T: 'REFUND' }] },
            { R: [{ T: '45%2E50' }] } // +45.50
          ]
        }]
      };

      const transactions = await extractTransactions(contentWithCredits, 'Generic');
      expect(transactions).toHaveLength(2);
      expect(transactions[0].amount).toBe(2500.00);
      expect(transactions[1].amount).toBe(45.50);
    });

    test('should extract statement period dates', async () => {
      const contentWithPeriod = {
        Pages: [{
          Texts: [
            { R: [{ T: 'Statement%20Period%3A%2001%2F09%2F2023%20to%2030%2F09%2F2023' }] },
            { R: [{ T: '15%2F09%2F2023' }] },
            { R: [{ T: 'TEST%20TRANSACTION' }] },
            { R: [{ T: '%2D50%2E00' }] }
          ]
        }]
      };

      const result = await extractTransactions(contentWithPeriod, 'Generic');
      expect(result.statementPeriod).toMatchObject({
        start: new Date('2023-09-01'),
        end: new Date('2023-09-30')
      });
    });

    test('should filter out invalid transactions', async () => {
      const contentWithInvalidData = {
        Pages: [{
          Texts: [
            { R: [{ T: '15%2F10%2F2023' }] },
            { R: [{ T: 'VALID%20TRANSACTION' }] },
            { R: [{ T: '%2D50%2E00' }] },
            { R: [{ T: 'INVALID%20DATE' }] },
            { R: [{ T: 'NO%20AMOUNT' }] },
            { R: [{ T: '16%2F10%2F2023' }] },
            { R: [{ T: '' }] }, // Empty description
            { R: [{ T: '%2D25%2E00' }] }
          ]
        }]
      };

      const transactions = await extractTransactions(contentWithInvalidData, 'Generic');
      expect(transactions).toHaveLength(1); // Only one valid transaction
      expect(transactions[0].description).toBe('VALID TRANSACTION');
    });

    test('should decode URL-encoded text correctly', async () => {
      const contentWithSpecialChars = {
        Pages: [{
          Texts: [
            { R: [{ T: '15%2F10%2F2023' }] },
            { R: [{ T: 'TESCO%20STORES%20%26%20PETROL' }] }, // TESCO STORES & PETROL
            { R: [{ T: '%2D50%2E00' }] }
          ]
        }]
      };

      const transactions = await extractTransactions(contentWithSpecialChars, 'Generic');
      expect(transactions[0].description).toBe('TESCO STORES & PETROL');
    });

    test('should handle empty or malformed PDF content', async () => {
      const emptyContent = { Pages: [] };
      const transactions = await extractTransactions(emptyContent, 'Generic');
      expect(transactions).toEqual([]);
    });

    test('should handle missing required data gracefully', async () => {
      const incompleteContent = {
        Pages: [{
          Texts: [
            { R: [{ T: 'SOME%20TEXT' }] },
            { R: [{ T: 'MORE%20TEXT' }] }
          ]
        }]
      };

      const transactions = await extractTransactions(incompleteContent, 'Generic');
      expect(transactions).toEqual([]);
    });
  });

  describe('Bank-specific parsing', () => {
    test('should handle Barclays-specific format', async () => {
      const barclaysContent = {
        Pages: [{
          Texts: [
            { R: [{ T: '15%20Oct%202023' }] }, // 15 Oct 2023 format
            { R: [{ T: 'DD%20BRITISH%20GAS' }] }, // DD prefix
            { R: [{ T: '85%2E50' }] },
            { R: [{ T: 'O%2FD' }] }, // Outgoing/Debit marker
            { R: [{ T: '1%2C234%2E50' }] }
          ]
        }]
      };

      const transactions = await extractTransactions(barclaysContent, 'Barclays');
      expect(transactions).toHaveLength(1);
      expect(transactions[0].date).toEqual(new Date('2023-10-15'));
      expect(transactions[0].description).toBe('DD BRITISH GAS');
      expect(transactions[0].amount).toBe(-85.50); // Should be negative for O/D
    });

    test('should handle HSBC-specific format', async () => {
      const hsbcContent = {
        Pages: [{
          Texts: [
            { R: [{ T: '15%2F10%2F23' }] }, // Short year format
            { R: [{ T: 'BRITISH%20GAS%20DIRECT%20DEBIT' }] },
            { R: [{ T: '85%2E50%20DR' }] }, // Amount with DR suffix
            { R: [{ T: '1%2C234%2E50' }] }
          ]
        }]
      };

      const transactions = await extractTransactions(hsbcContent, 'HSBC');
      expect(transactions).toHaveLength(1);
      expect(transactions[0].date).toEqual(new Date('2023-10-15'));
      expect(transactions[0].amount).toBe(-85.50); // Should be negative for DR
    });
  });
});