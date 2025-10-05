const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('../../src/models/user');
const ImportSession = require('../../src/models/ImportSession');
const RecurringDetectionRules = require('../../src/models/RecurringDetectionRules');
// Story 2.3/2.4: Updated to use domain records with intelligent domain detection
const FinanceRecord = require('../../src/models/domain/FinanceRecord');
const PropertyRecord = require('../../src/models/domain/PropertyRecord');
const { suggestDomain } = require('../../src/services/domainSuggestionEngine');

// Mock dependencies that we'll implement
jest.mock('../../src/services/pdfProcessor', () => ({
  parsePdfBuffer: jest.fn(),
  identifyBankFromContent: jest.fn(),
  extractTransactions: jest.fn(),
}));

jest.mock('../../src/services/recurringDetector', () => ({
  detectRecurringPayments: jest.fn(),
}));

jest.mock('../../src/services/backgroundProcessor', () => ({
  processPdfImport: jest.fn()
}));

describe('Import API Endpoints', () => {
  let app;
  let testUser;
  let authCookie;

  beforeAll(async () => {
    // Create Express app with basic middleware for testing
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Mock authentication middleware
    app.use('/api/import', (req, res, next) => {
      if (req.headers.authorization === 'Bearer test-token') {
        req.user = testUser;
        next();
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    });

    // Import routes will be created in the actual implementation
    // For now, create placeholder routes for testing
    const importRoutes = require('../../src/routes/import');
    app.use('/api/import', importRoutes);
  });

  beforeEach(async () => {
    // Create test user
    testUser = new User({
      googleId: 'test-import-user',
      displayName: 'Import Test User',
      email: 'import@test.com',
      approved: true,
      role: 'user'
    });
    await testUser.save();

    // Create default detection rules
    const defaultRules = new RecurringDetectionRules({
      name: 'Test UK Rules',
      is_default: true,
      utility_rules: [
        {
          name: 'Test Utility',
          patterns: ['TEST UTILITY', 'TEST POWER'],
          category: 'utilities',
          provider: 'Test Utility Co'
        }
      ],
      settings: {
        min_confidence_threshold: 0.6,
        fuzzy_match_threshold: 0.8
      }
    });
    await defaultRules.save();
  });

  describe('POST /api/import/upload', () => {
    test('should reject uploads without authentication', async () => {
      const response = await request(app)
        .post('/api/import/upload')
        .attach('statement', Buffer.from('fake pdf content'), 'statement.pdf');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    test('should reject non-PDF files', async () => {
      const response = await request(app)
        .post('/api/import/upload')
        .set('Authorization', 'Bearer test-token')
        .attach('statement', Buffer.from('not a pdf'), 'statement.txt');

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/only PDF files/i);
    });

    test('should reject files that are too large', async () => {
      // Create a buffer larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
      
      const response = await request(app)
        .post('/api/import/upload')
        .set('Authorization', 'Bearer test-token')
        .attach('statement', largeBuffer, 'large.pdf');

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/file too large/i);
    });

    test('should create import session for valid PDF upload', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf content');
      
      const response = await request(app)
        .post('/api/import/upload')
        .set('Authorization', 'Bearer test-token')
        .attach('statement', mockPdfBuffer, 'test-statement.pdf');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('status', 'processing');
      expect(response.body).toHaveProperty('filename', 'test-statement.pdf');

      // Verify session was created in database
      const session = await ImportSession.findById(response.body.sessionId);
      expect(session).toBeTruthy();
      expect(session.user).toEqual(testUser._id);
      expect(session.status).toBe('processing');
    });

    test('should handle duplicate file uploads', async () => {
      const mockPdfBuffer = Buffer.from('identical content for duplicate test');
      
      // First upload
      const response1 = await request(app)
        .post('/api/import/upload')
        .set('Authorization', 'Bearer test-token')
        .attach('statement', mockPdfBuffer, 'duplicate.pdf');

      expect(response1.status).toBe(201);

      // Second upload with same content
      const response2 = await request(app)
        .post('/api/import/upload')
        .set('Authorization', 'Bearer test-token')
        .attach('statement', mockPdfBuffer, 'duplicate.pdf');

      expect(response2.status).toBe(409);
      expect(response2.body.error).toBe('This file has already been processed');
      expect(response2.body).toHaveProperty('existingSessionId');
    });
  });

  describe('GET /api/import/sessions', () => {
    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/import/sessions');

      expect(response.status).toBe(401);
    });

    test('should return user import sessions', async () => {
      // Create test sessions
      const session1 = new ImportSession({
        user: testUser._id,
        filename: 'statement1.pdf',
        status: 'completed',
        statistics: { total_transactions: 45 }
      });

      const session2 = new ImportSession({
        user: testUser._id,
        filename: 'statement2.pdf',
        status: 'processing'
      });

      await session1.save();
      // Small delay to ensure different createdAt timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      await session2.save();

      const response = await request(app)
        .get('/api/import/sessions')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(2);
      expect(response.body.sessions[0].filename).toBe('statement2.pdf'); // Most recent first
      expect(response.body.sessions[1].filename).toBe('statement1.pdf');
    });

    test('should support pagination', async () => {
      // Create multiple sessions
      for (let i = 0; i < 15; i++) {
        const session = new ImportSession({
          user: testUser._id,
          filename: `statement${i}.pdf`,
          status: 'completed'
        });
        await session.save();
      }

      const response = await request(app)
        .get('/api/import/sessions?page=2&limit=5')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(5);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.totalPages).toBe(3);
      expect(response.body.pagination.totalSessions).toBe(15);
    });

    test('should filter by status', async () => {
      const completedSession = new ImportSession({
        user: testUser._id,
        filename: 'completed.pdf',
        status: 'completed'
      });

      const processingSession = new ImportSession({
        user: testUser._id,
        filename: 'processing.pdf',
        status: 'processing'
      });

      await completedSession.save();
      await processingSession.save();

      const response = await request(app)
        .get('/api/import/sessions?status=completed')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(1);
      expect(response.body.sessions[0].status).toBe('completed');
    });
  });

  describe('GET /api/import/sessions/:id', () => {
    test('should return specific import session', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'detailed-statement.pdf',
        status: 'completed',
        bank_name: 'Test Bank',
        statistics: {
          total_transactions: 50,
          recurring_detected: 8
        },
        recurring_payments: [
          {
            payee: 'Test Utility',
            category: 'utilities',
            amount: -85.50,
            frequency: 'monthly',
            confidence: 0.95,
            status: 'pending'
          }
        ]
      });
      await session.save();

      const response = await request(app)
        .get(`/api/import/sessions/${session._id}`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.session.filename).toBe('detailed-statement.pdf');
      expect(response.body.session.bank_name).toBe('Test Bank');
      expect(response.body.session.recurring_payments).toHaveLength(1);
      expect(response.body.session.statistics.total_transactions).toBe(50);
    });

    test('should return 404 for non-existent session', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/import/sessions/${fakeId}`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
    });

    test('should prevent access to other users sessions', async () => {
      const otherUser = new User({
        googleId: 'other-user',
        displayName: 'Other User',
        email: 'other@test.com',
        approved: true
      });
      await otherUser.save();

      const otherSession = new ImportSession({
        user: otherUser._id,
        filename: 'private-statement.pdf',
        status: 'completed'
      });
      await otherSession.save();

      const response = await request(app)
        .get(`/api/import/sessions/${otherSession._id}`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toMatch(/access denied/i);
    });
  });

  describe('POST /api/import/sessions/:id/confirm', () => {
    test('should confirm recurring payment suggestions', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'confirm-test.pdf',
        status: 'completed',
        recurring_payments: [
          {
            payee: 'Test Utility',
            category: 'utilities',
            amount: -85.50,
            frequency: 'monthly',
            confidence: 0.95,
            suggested_entry: {
              title: 'Test Utility - Gas Supply',
              provider: 'Test Utility',
              type: 'utility'
            },
            status: 'pending'
          },
          {
            payee: 'Test Insurance',
            category: 'insurance',
            amount: -45.00,
            frequency: 'monthly',
            confidence: 0.88,
            suggested_entry: {
              title: 'Test Insurance - Car Insurance',
              provider: 'Test Insurance',
              type: 'policy'
            },
            status: 'pending'
          }
        ]
      });
      await session.save();

      const confirmationData = {
        confirmations: [
          {
            suggestion_index: 0,
            action: 'accept',
            modifications: {
              title: 'Modified Utility Title'
            }
          },
          {
            suggestion_index: 1,
            action: 'reject'
          }
        ]
      };

      const response = await request(app)
        .post(`/api/import/sessions/${session._id}/confirm`)
        .set('Authorization', 'Bearer test-token')
        .send(confirmationData);

      expect(response.status).toBe(200);
      expect(response.body.created_entries).toHaveLength(1);
      expect(response.body.rejected_suggestions).toHaveLength(1);

      // Story 2.4: Domain intelligence suggests PropertyRecord for utilities
      const suggestion = suggestDomain({ payee: 'Test Utility', category: 'utilities', amount: -85.50 });
      expect(suggestion.domain).toBe('property'); // Domain intelligence at work

      // Verify domain record was created in correct domain
      const createdRecord = await PropertyRecord.findById(response.body.created_entries[0].entry_id);
      expect(createdRecord).toBeTruthy();
      expect(createdRecord.name).toBe('Modified Utility Title'); // domain records use 'name' not 'title'
      expect(createdRecord.import_metadata.source).toBe('bank_import');
      expect(createdRecord.import_metadata.import_session_id).toEqual(session._id);
      expect(createdRecord.import_metadata.domain_suggestion.suggested_domain).toBe('property');
    });

    test('should handle bulk accept action', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'bulk-test.pdf',
        status: 'completed',
        recurring_payments: [
          {
            payee: 'Utility 1',
            category: 'utilities',
            amount: -50.00,
            suggested_entry: { title: 'Utility 1', type: 'utility' },
            status: 'pending'
          },
          {
            payee: 'Utility 2', 
            category: 'utilities',
            amount: -60.00,
            suggested_entry: { title: 'Utility 2', type: 'utility' },
            status: 'pending'
          }
        ]
      });
      await session.save();

      const response = await request(app)
        .post(`/api/import/sessions/${session._id}/confirm`)
        .set('Authorization', 'Bearer test-token')
        .send({ bulk_action: 'accept_all' });

      expect(response.status).toBe(200);
      expect(response.body.created_entries).toHaveLength(2);
    });

    test('should validate suggestion indices', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'validation-test.pdf',
        status: 'completed',
        recurring_payments: [
          {
            payee: 'Test',
            category: 'utilities',
            amount: -50.00,
            status: 'pending'
          }
        ]
      });
      await session.save();

      const response = await request(app)
        .post(`/api/import/sessions/${session._id}/confirm`)
        .set('Authorization', 'Bearer test-token')
        .send({
          confirmations: [
            { suggestion_index: 99, action: 'accept' } // Invalid index
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/invalid suggestion index/i);
    });
  });

  describe('DELETE /api/import/sessions/:id', () => {
    test('should delete import session and associated data', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'to-delete.pdf',
        status: 'completed'
      });
      await session.save();

      const response = await request(app)
        .delete(`/api/import/sessions/${session._id}`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/deleted successfully/i);

      // Verify session is deleted
      const deletedSession = await ImportSession.findById(session._id);
      expect(deletedSession).toBeNull();
    });

    test('should prevent deletion of sessions with created entries', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'has-entries.pdf',
        status: 'completed'
      });
      await session.save();

      // Create a domain record linked to this session (Story 2.3: FinanceRecord instead of Entry)
      const linkedRecord = new FinanceRecord({
        user: testUser._id,
        name: 'Linked Record',
        accountType: 'bill',
        import_metadata: {
          source: 'bank_import',
          import_session_id: session._id
        }
      });
      await linkedRecord.save();

      const response = await request(app)
        .delete(`/api/import/sessions/${session._id}`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(409);
      expect(response.body.error).toMatch(/has associated entries/i);
    });
  });

  describe('GET /api/import/status/:id', () => {
    test('should return processing status', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'processing.pdf',
        status: 'processing',
        processing_stage: 'transaction_extraction'
      });
      await session.save();

      const response = await request(app)
        .get(`/api/import/status/${session._id}`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('processing');
      expect(response.body.processing_stage).toBe('transaction_extraction');
    });

    test('should return error status for failed imports', async () => {
      const session = new ImportSession({
        user: testUser._id,
        filename: 'failed.pdf',
        status: 'failed',
        error_message: 'PDF parsing failed'
      });
      await session.save();

      const response = await request(app)
        .get(`/api/import/status/${session._id}`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('failed');
      expect(response.body.error_message).toBe('PDF parsing failed');
    });
  });
});