const mongoose = require('mongoose');
const Transaction = require('../../src/models/Transaction');
const ImportSession = require('../../src/models/ImportSession');
const User = require('../../src/models/user');

describe('Transaction Model', () => {
  let testUser;
  let testSession;

  beforeEach(async () => {
    // Create a test user
    testUser = new User({
      googleId: 'test123',
      displayName: 'Test User',
      email: 'test@example.com',
      approved: true
    });
    await testUser.save();

    // Create a test import session
    testSession = new ImportSession({
      user: testUser._id,
      filename: 'test-statement.pdf',
      status: 'completed'
    });
    await testSession.save();
  });

  describe('Basic Model Creation', () => {
    test('should create a valid transaction', async () => {
      const transactionData = {
        user: testUser._id,
        importSession: testSession._id,
        date: new Date('2025-10-15'),
        description: 'BRITISH GAS',
        reference: 'DD',
        amount: -85.50,
        balance: 1234.50,
        originalText: 'BRITISH GAS DD £85.50'
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction._id).toBeDefined();
      expect(savedTransaction.user).toEqual(testUser._id);
      expect(savedTransaction.importSession).toEqual(testSession._id);
      expect(savedTransaction.description).toBe('BRITISH GAS');
      expect(savedTransaction.amount).toBe(-85.50);
      expect(savedTransaction.status).toBe('pending'); // Default status
      expect(savedTransaction.transactionHash).toBeDefined();
    });

    test('should require user, importSession, date, description, and amount', async () => {
      const transaction = new Transaction({});

      await expect(transaction.save()).rejects.toThrow();
    });

    test('should set default status to pending', async () => {
      const transaction = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date(),
        description: 'Test Transaction',
        amount: -50.00
      });

      const savedTransaction = await transaction.save();
      expect(savedTransaction.status).toBe('pending');
      expect(savedTransaction.recordCreated).toBe(false);
    });
  });

  describe('Transaction Hash Calculation', () => {
    test('should automatically calculate transactionHash on save', async () => {
      const transaction = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date('2025-10-15'),
        description: 'NETFLIX',
        amount: -9.99
      });

      const savedTransaction = await transaction.save();

      expect(savedTransaction.transactionHash).toBeDefined();
      expect(savedTransaction.transactionHash).toHaveLength(64); // SHA-256 hex string
    });

    test('should generate same hash for same user + amount + description', async () => {
      const hash1 = Transaction.calculateHash(testUser._id, -85.50, 'BRITISH GAS');
      const hash2 = Transaction.calculateHash(testUser._id, -85.50, 'BRITISH GAS');

      expect(hash1).toBe(hash2);
    });

    test('should generate different hash for different amounts', async () => {
      const hash1 = Transaction.calculateHash(testUser._id, -85.50, 'BRITISH GAS');
      const hash2 = Transaction.calculateHash(testUser._id, -90.00, 'BRITISH GAS');

      expect(hash1).not.toBe(hash2);
    });

    test('should generate different hash for different descriptions', async () => {
      const hash1 = Transaction.calculateHash(testUser._id, -85.50, 'BRITISH GAS');
      const hash2 = Transaction.calculateHash(testUser._id, -85.50, 'SCOTTISH POWER');

      expect(hash1).not.toBe(hash2);
    });

    test('should generate different hash for different users', async () => {
      const user2 = new User({
        googleId: 'test456',
        displayName: 'User 2',
        email: 'user2@example.com',
        approved: true
      });
      await user2.save();

      const hash1 = Transaction.calculateHash(testUser._id, -85.50, 'BRITISH GAS');
      const hash2 = Transaction.calculateHash(user2._id, -85.50, 'BRITISH GAS');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Duplicate Detection', () => {
    test('should prevent duplicate transactions (same user + amount + description)', async () => {
      const transactionData = {
        user: testUser._id,
        importSession: testSession._id,
        date: new Date('2025-10-15'),
        description: 'BRITISH GAS',
        amount: -85.50
      };

      const transaction1 = new Transaction(transactionData);
      await transaction1.save();

      // Try to create duplicate (same amount + description, different date)
      const transaction2 = new Transaction({
        ...transactionData,
        date: new Date('2025-11-15') // Different date, but same amount + description
      });

      await expect(transaction2.save()).rejects.toThrow();
    });

    test('should allow same transaction from different users', async () => {
      const user2 = new User({
        googleId: 'test456',
        displayName: 'User 2',
        email: 'user2@example.com',
        approved: true
      });
      await user2.save();

      const session2 = new ImportSession({
        user: user2._id,
        filename: 'user2-statement.pdf',
        status: 'completed'
      });
      await session2.save();

      const transaction1 = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date('2025-10-15'),
        description: 'BRITISH GAS',
        amount: -85.50
      });
      await transaction1.save();

      const transaction2 = new Transaction({
        user: user2._id, // Different user
        importSession: session2._id,
        date: new Date('2025-10-15'),
        description: 'BRITISH GAS',
        amount: -85.50
      });

      await expect(transaction2.save()).resolves.toBeDefined();
    });
  });

  describe('Status Management', () => {
    test('should validate status enum values', async () => {
      const validStatuses = ['pending', 'record_created', 'ignored'];

      for (const status of validStatuses) {
        const transaction = new Transaction({
          user: testUser._id,
          importSession: testSession._id,
          date: new Date(),
          description: `Test ${status}`,
          amount: -10.00,
          status: status
        });

        await expect(transaction.save()).resolves.toBeDefined();
      }
    });

    test('should reject invalid status values', async () => {
      const transaction = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date(),
        description: 'Test',
        amount: -10.00,
        status: 'invalid_status'
      });

      await expect(transaction.save()).rejects.toThrow();
    });

    test('should store record creation metadata when status is record_created', async () => {
      const recordId = new mongoose.Types.ObjectId();
      const transaction = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date(),
        description: 'BRITISH GAS',
        amount: -85.50,
        status: 'record_created',
        recordCreated: true,
        createdRecordId: recordId,
        createdRecordDomain: 'Property',
        createdAt: new Date()
      });

      const savedTransaction = await transaction.save();
      expect(savedTransaction.status).toBe('record_created');
      expect(savedTransaction.recordCreated).toBe(true);
      expect(savedTransaction.createdRecordId).toEqual(recordId);
      expect(savedTransaction.createdRecordDomain).toBe('Property');
    });
  });

  describe('Ignore Functionality', () => {
    test('should store ignore metadata when status is ignored', async () => {
      const transaction = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date(),
        description: 'ONE-TIME PURCHASE',
        amount: -25.00,
        status: 'ignored',
        ignoredReason: 'One-time purchase',
        ignoredAt: new Date()
      });

      const savedTransaction = await transaction.save();
      expect(savedTransaction.status).toBe('ignored');
      expect(savedTransaction.ignoredReason).toBe('One-time purchase');
      expect(savedTransaction.ignoredAt).toBeInstanceOf(Date);
    });

    test('should allow undo ignore by clearing ignoredReason and ignoredAt', async () => {
      const transaction = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date(),
        description: 'TEST',
        amount: -10.00,
        status: 'ignored',
        ignoredReason: 'Test reason',
        ignoredAt: new Date()
      });

      const savedTransaction = await transaction.save();

      // Undo ignore
      savedTransaction.status = 'pending';
      savedTransaction.ignoredReason = undefined;
      savedTransaction.ignoredAt = undefined;

      await savedTransaction.save();
      expect(savedTransaction.status).toBe('pending');
      expect(savedTransaction.ignoredReason).toBeUndefined();
    });
  });

  describe('Pattern Matching', () => {
    test('should store pattern matching metadata', async () => {
      const patternId = new mongoose.Types.ObjectId();
      const transaction = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date(),
        description: 'NETFLIX',
        amount: -9.99,
        patternMatched: true,
        patternConfidence: 0.92,
        patternId: patternId
      });

      const savedTransaction = await transaction.save();
      expect(savedTransaction.patternMatched).toBe(true);
      expect(savedTransaction.patternConfidence).toBe(0.92);
      expect(savedTransaction.patternId).toEqual(patternId);
    });

    test('should validate patternConfidence is between 0 and 1', async () => {
      const transaction = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date(),
        description: 'TEST',
        amount: -10.00,
        patternConfidence: 1.5 // Invalid: > 1
      });

      await expect(transaction.save()).rejects.toThrow();
    });
  });

  describe('Indexes and Queries', () => {
    test('should find transactions by user and date range', async () => {
      const transaction1 = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date('2025-10-01'),
        description: 'Transaction 1',
        amount: -10.00
      });

      const transaction2 = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date('2025-10-15'),
        description: 'Transaction 2',
        amount: -20.00
      });

      const transaction3 = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date('2025-11-01'),
        description: 'Transaction 3',
        amount: -30.00
      });

      await transaction1.save();
      await transaction2.save();
      await transaction3.save();

      const octTransactions = await Transaction.find({
        user: testUser._id,
        date: {
          $gte: new Date('2025-10-01'),
          $lte: new Date('2025-10-31')
        }
      }).sort({ date: -1 });

      expect(octTransactions).toHaveLength(2);
      expect(octTransactions[0].description).toBe('Transaction 2');
      expect(octTransactions[1].description).toBe('Transaction 1');
    });

    test('should filter transactions by status', async () => {
      const pending = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date(),
        description: 'Pending',
        amount: -10.00,
        status: 'pending'
      });

      const created = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date(),
        description: 'Record Created',
        amount: -20.00,
        status: 'record_created',
        recordCreated: true
      });

      const ignored = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date(),
        description: 'Ignored',
        amount: -30.00,
        status: 'ignored'
      });

      await pending.save();
      await created.save();
      await ignored.save();

      const pendingTransactions = await Transaction.find({
        user: testUser._id,
        status: 'pending'
      });

      expect(pendingTransactions).toHaveLength(1);
      expect(pendingTransactions[0].description).toBe('Pending');
    });

    test('should filter transactions by import session', async () => {
      const session2 = new ImportSession({
        user: testUser._id,
        filename: 'second-statement.pdf',
        status: 'completed'
      });
      await session2.save();

      const txn1 = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date(),
        description: 'Session 1',
        amount: -10.00
      });

      const txn2 = new Transaction({
        user: testUser._id,
        importSession: session2._id,
        date: new Date(),
        description: 'Session 2',
        amount: -20.00
      });

      await txn1.save();
      await txn2.save();

      const session1Transactions = await Transaction.find({
        importSession: testSession._id
      });

      expect(session1Transactions).toHaveLength(1);
      expect(session1Transactions[0].description).toBe('Session 1');
    });
  });

  describe('Timestamps', () => {
    test('should automatically add createdAt and updatedAt timestamps', async () => {
      const transaction = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date(),
        description: 'Test',
        amount: -10.00
      });

      const savedTransaction = await transaction.save();

      expect(savedTransaction.createdAt).toBeInstanceOf(Date);
      expect(savedTransaction.updatedAt).toBeInstanceOf(Date);
    });

    test('should update updatedAt on modification', async () => {
      const transaction = new Transaction({
        user: testUser._id,
        importSession: testSession._id,
        date: new Date(),
        description: 'Test',
        amount: -10.00
      });

      const savedTransaction = await transaction.save();
      const originalUpdatedAt = savedTransaction.updatedAt;

      // Wait a moment to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      // Modify transaction
      savedTransaction.status = 'ignored';
      await savedTransaction.save();

      expect(savedTransaction.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
