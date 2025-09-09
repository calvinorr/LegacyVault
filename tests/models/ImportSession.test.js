const mongoose = require('mongoose');
const ImportSession = require('../../src/models/ImportSession');
const User = require('../../src/models/user');

describe('ImportSession Model', () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user
    testUser = new User({
      googleId: 'test123',
      displayName: 'Test User',
      email: 'test@example.com',
      approved: true
    });
    await testUser.save();
  });

  describe('Basic Model Creation', () => {
    test('should create a valid import session', async () => {
      const sessionData = {
        user: testUser._id,
        filename: 'statement.pdf',
        file_size: 12345,
        file_hash: 'abc123hash',
        status: 'processing'
      };

      const session = new ImportSession(sessionData);
      const savedSession = await session.save();

      expect(savedSession._id).toBeDefined();
      expect(savedSession.user).toEqual(testUser._id);
      expect(savedSession.filename).toBe('statement.pdf');
      expect(savedSession.status).toBe('processing');
      expect(savedSession.expires_at).toBeInstanceOf(Date);
    });

    test('should require user and filename', async () => {
      const session = new ImportSession({});
      
      await expect(session.save()).rejects.toThrow();
    });

    test('should set default expires_at to 7 days from now', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'test.pdf'
      });

      const savedSession = await session.save();
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const timeDifference = Math.abs(savedSession.expires_at - sevenDaysFromNow);
      
      expect(timeDifference).toBeLessThan(1000); // Within 1 second
    });
  });

  describe('Transaction Schema', () => {
    test('should store transactions with all required fields', async () => {
      const sessionData = {
        user: testUser._id,
        filename: 'statement.pdf',
        transactions: [
          {
            date: new Date('2023-10-15'),
            description: 'BRITISH GAS',
            reference: 'DD',
            amount: -85.50,
            balance: 1234.50,
            originalText: 'BRITISH GAS DD £85.50'
          }
        ]
      };

      const session = new ImportSession(sessionData);
      const savedSession = await session.save();

      expect(savedSession.transactions).toHaveLength(1);
      expect(savedSession.transactions[0].description).toBe('BRITISH GAS');
      expect(savedSession.transactions[0].amount).toBe(-85.50);
    });

    test('should require date, description, and amount for transactions', async () => {
      const sessionData = {
        user: testUser._id,
        filename: 'statement.pdf',
        transactions: [
          {
            description: 'BRITISH GAS',
            // Missing date and amount
          }
        ]
      };

      const session = new ImportSession(sessionData);
      await expect(session.save()).rejects.toThrow();
    });
  });

  describe('Recurring Payment Suggestions', () => {
    test('should store recurring payment suggestions with all fields', async () => {
      const sessionData = {
        user: testUser._id,
        filename: 'statement.pdf',
        recurring_payments: [
          {
            payee: 'British Gas',
            category: 'utilities',
            subcategory: 'gas',
            amount: -85.50,
            frequency: 'monthly',
            confidence: 0.95,
            transactions: [
              {
                date: new Date('2023-10-15'),
                description: 'BRITISH GAS',
                amount: -85.50
              }
            ],
            suggested_entry: {
              title: 'British Gas - Gas Supply',
              provider: 'British Gas',
              type: 'utility'
            },
            status: 'pending'
          }
        ]
      };

      const session = new ImportSession(sessionData);
      const savedSession = await session.save();

      expect(savedSession.recurring_payments).toHaveLength(1);
      const suggestion = savedSession.recurring_payments[0];
      expect(suggestion.payee).toBe('British Gas');
      expect(suggestion.category).toBe('utilities');
      expect(suggestion.confidence).toBe(0.95);
      expect(suggestion.status).toBe('pending');
    });

    test('should validate recurring payment categories', async () => {
      const sessionData = {
        user: testUser._id,
        filename: 'statement.pdf',
        recurring_payments: [
          {
            payee: 'Test Provider',
            category: 'invalid_category', // Invalid category
            amount: -50.00,
            frequency: 'monthly'
          }
        ]
      };

      const session = new ImportSession(sessionData);
      await expect(session.save()).rejects.toThrow();
    });
  });

  describe('Status and Processing', () => {
    test('should validate status enum values', async () => {
      const validStatuses = ['uploading', 'processing', 'completed', 'failed', 'expired'];
      
      for (const status of validStatuses) {
        const session = new ImportSession({
          user: testUser._id,
          filename: 'test.pdf',
          status: status
        });
        
        await expect(session.save()).resolves.toBeDefined();
        await session.deleteOne();
      }
    });

    test('should reject invalid status values', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'test.pdf',
        status: 'invalid_status'
      });

      await expect(session.save()).rejects.toThrow();
    });

    test('should store processing stage information', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'test.pdf',
        status: 'processing',
        processing_stage: 'transaction_extraction',
        error_message: null
      });

      const savedSession = await session.save();
      expect(savedSession.processing_stage).toBe('transaction_extraction');
    });
  });

  describe('Statistics', () => {
    test('should store processing statistics', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'test.pdf',
        statistics: {
          total_transactions: 45,
          recurring_detected: 8,
          date_range_days: 30,
          total_debits: -1250.75,
          total_credits: 2000.00
        }
      });

      const savedSession = await session.save();
      expect(savedSession.statistics.total_transactions).toBe(45);
      expect(savedSession.statistics.recurring_detected).toBe(8);
    });

    test('should have default statistics values', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'test.pdf'
      });

      const savedSession = await session.save();
      expect(savedSession.statistics.total_transactions).toBe(0);
      expect(savedSession.statistics.recurring_detected).toBe(0);
    });
  });

  describe('Bank Information', () => {
    test('should store detected bank information', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'natwest-statement.pdf',
        bank_name: 'NatWest',
        account_number: '****1234',
        statement_period: {
          start_date: new Date('2023-10-01'),
          end_date: new Date('2023-10-31')
        }
      });

      const savedSession = await session.save();
      expect(savedSession.bank_name).toBe('NatWest');
      expect(savedSession.account_number).toBe('****1234');
      expect(savedSession.statement_period.start_date).toBeInstanceOf(Date);
    });
  });

  describe('Cleanup and Privacy', () => {
    test('should have auto_cleanup enabled by default', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'test.pdf'
      });

      const savedSession = await session.save();
      expect(savedSession.auto_cleanup).toBe(true);
    });

    test('should allow custom expiry date', async () => {
      const customExpiry = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
      const session = new ImportSession({
        user: testUser._id,
        filename: 'test.pdf',
        expires_at: customExpiry
      });

      const savedSession = await session.save();
      expect(savedSession.expires_at).toEqual(customExpiry);
    });
  });

  describe('Indexes and Queries', () => {
    test('should find sessions by user and status', async () => {
      const session1 = new ImportSession({
        user: testUser._id,
        filename: 'test1.pdf',
        status: 'completed'
      });
      
      const session2 = new ImportSession({
        user: testUser._id,
        filename: 'test2.pdf',
        status: 'processing'
      });

      await session1.save();
      await session2.save();

      const completedSessions = await ImportSession.find({ 
        user: testUser._id, 
        status: 'completed' 
      });

      expect(completedSessions).toHaveLength(1);
      expect(completedSessions[0].filename).toBe('test1.pdf');
    });

    test('should sort sessions by creation date', async () => {
      const session1 = new ImportSession({
        user: testUser._id,
        filename: 'older.pdf'
      });
      
      const session2 = new ImportSession({
        user: testUser._id,
        filename: 'newer.pdf'
      });

      await session1.save();
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      await session2.save();

      const sessions = await ImportSession.find({ user: testUser._id })
        .sort({ createdAt: -1 });

      expect(sessions).toHaveLength(2);
      expect(sessions[0].filename).toBe('newer.pdf');
      expect(sessions[1].filename).toBe('older.pdf');
    });
  });
});