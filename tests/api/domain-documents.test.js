// tests/api/domain-documents.test.js
// Story 1.2 - GridFS Document Storage Tests

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const User = require('../../src/models/user');
const PropertyRecord = require('../../src/models/domain/PropertyRecord');
const { initGridFS, getGridFSBucket } = require('../../src/db/gridfs');
const domainDocumentsRouter = require('../../src/routes/domain-documents');
const fs = require('fs');
const path = require('path');

describe('Domain Documents API (Story 1.2)', () => {
  let app, testUser, otherUser, testRecord, otherRecord;

  beforeAll(async () => {
    // Initialize GridFS bucket
    const db = mongoose.connection.db;
    initGridFS();

    app = express();
    app.use(express.json());

    // Mock authentication middleware
    app.use((req, res, next) => {
      req.isAuthenticated = () => true;
      req.user = req.headers['test-user-id']
        ? { _id: new mongoose.Types.ObjectId(req.headers['test-user-id']), approved: true }
        : testUser;
      next();
    });

    app.use('/api/domains', domainDocumentsRouter);
    app.use('/api/domain-documents', domainDocumentsRouter);
  });

  beforeEach(async () => {
    // Create test users
    testUser = new User({
      googleId: 'test123',
      displayName: 'Test User',
      email: 'test@example.com',
      approved: true,
      role: 'user'
    });
    await testUser.save();

    otherUser = new User({
      googleId: 'other123',
      displayName: 'Other User',
      email: 'other@example.com',
      approved: true,
      role: 'user'
    });
    await otherUser.save();

    // Create test property records
    testRecord = new PropertyRecord({
      name: 'Test Property',
      recordType: 'mortgage',
      user: testUser._id
    });
    await testRecord.save();

    otherRecord = new PropertyRecord({
      name: 'Other Property',
      recordType: 'mortgage',
      user: otherUser._id
    });
    await otherRecord.save();
  });

  afterEach(async () => {
    // Clean up
    await User.deleteMany({});
    await PropertyRecord.deleteMany({});

    // Clean up GridFS
    const bucket = getGridFSBucket();
    const files = await bucket.find({}).toArray();
    for (const file of files) {
      await bucket.delete(file._id);
    }
  });

  describe('Document Upload - POST /api/domains/:domain/records/:id/documents', () => {
    it('should upload a PDF document successfully', async () => {
      // Create a dummy PDF buffer
      const pdfBuffer = Buffer.from('%PDF-1.4 dummy content');

      const res = await request(app)
        .post(`/api/domains/property/records/${testRecord._id}/documents`)
        .attach('file', pdfBuffer, 'test.pdf')
        .expect(201);

      expect(res.body.fileId).toBeDefined();
      expect(res.body.filename).toBe('test.pdf');
      expect(res.body.contentType).toBe('application/pdf');
      expect(res.body.uploadDate).toBeDefined();

      // Verify record updated
      const updated = await PropertyRecord.findById(testRecord._id);
      expect(updated.documentIds.length).toBe(1);
      expect(updated.documentIds[0].toString()).toBe(res.body.fileId.toString());
    });

    it('should upload a PNG image successfully', async () => {
      const pngBuffer = Buffer.from('PNG dummy content');

      const res = await request(app)
        .post(`/api/domains/property/records/${testRecord._id}/documents`)
        .attach('file', pngBuffer, { filename: 'test.png', contentType: 'image/png' })
        .expect(201);

      expect(res.body.fileId).toBeDefined();
      expect(res.body.filename).toBe('test.png');
      expect(res.body.contentType).toBe('image/png');
    });

    it('should upload a JPEG image successfully', async () => {
      const jpegBuffer = Buffer.from('JPEG dummy content');

      const res = await request(app)
        .post(`/api/domains/property/records/${testRecord._id}/documents`)
        .attach('file', jpegBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' })
        .expect(201);

      expect(res.body.filename).toBe('test.jpg');
      expect(res.body.contentType).toBe('image/jpeg');
    });

    it('should reject upload without file', async () => {
      const res = await request(app)
        .post(`/api/domains/property/records/${testRecord._id}/documents`)
        .expect(400);

      expect(res.body.error).toContain('No file uploaded');
    });

    it('should reject invalid file type', async () => {
      const exeBuffer = Buffer.from('EXE content');

      const res = await request(app)
        .post(`/api/domains/property/records/${testRecord._id}/documents`)
        .attach('file', exeBuffer, { filename: 'virus.exe', contentType: 'application/x-msdownload' })
        .expect(400); // Multer throws error, caught by middleware

      expect(res.body.error).toBeDefined();
      expect(res.body.error).toContain('Invalid file type');
    });

    it('should reject file exceeding size limit', async () => {
      // Create 11MB buffer (exceeds 10MB limit)
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

      const res = await request(app)
        .post(`/api/domains/property/records/${testRecord._id}/documents`)
        .attach('file', largeBuffer, 'large.pdf')
        .expect(413); // Payload too large

      expect(res.body.error).toBeDefined();
      expect(res.body.error).toContain('File too large');
    });

    it('should return 404 for non-existent record', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const pdfBuffer = Buffer.from('%PDF-1.4 content');

      const res = await request(app)
        .post(`/api/domains/property/records/${fakeId}/documents`)
        .attach('file', pdfBuffer, 'test.pdf')
        .expect(404);

      expect(res.body.error).toContain('not found');
    });

    it('should prevent uploading to other user\'s record', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4 content');

      const res = await request(app)
        .post(`/api/domains/property/records/${otherRecord._id}/documents`)
        .attach('file', pdfBuffer, 'test.pdf')
        .expect(404); // Returns 404 instead of 403 for security

      expect(res.body.error).toContain('not found');
    });

    it('should reject invalid domain', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4 content');

      const res = await request(app)
        .post(`/api/domains/invalid/records/${testRecord._id}/documents`)
        .attach('file', pdfBuffer, 'test.pdf')
        .expect(400);

      expect(res.body.error).toContain('Invalid domain');
    });
  });

  describe('Document List - GET /api/domains/:domain/records/:id/documents', () => {
    it('should list all documents for a record', async () => {
      // Upload 2 documents
      const pdf1 = Buffer.from('%PDF-1.4 doc1');
      const pdf2 = Buffer.from('%PDF-1.4 doc2');

      await request(app)
        .post(`/api/domains/property/records/${testRecord._id}/documents`)
        .attach('file', pdf1, 'doc1.pdf')
        .expect(201);

      await request(app)
        .post(`/api/domains/property/records/${testRecord._id}/documents`)
        .attach('file', pdf2, 'doc2.pdf')
        .expect(201);

      // List documents
      const res = await request(app)
        .get(`/api/domains/property/records/${testRecord._id}/documents`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].filename).toBeDefined();
      expect(res.body[0].fileId).toBeDefined();
      expect(res.body[0].contentType).toBeDefined();
      expect(res.body[0].uploadDate).toBeDefined();
    });

    it('should return empty array when no documents', async () => {
      const res = await request(app)
        .get(`/api/domains/property/records/${testRecord._id}/documents`)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should sort documents by upload date (newest first)', async () => {
      const pdf1 = Buffer.from('%PDF-1.4 old');
      const pdf2 = Buffer.from('%PDF-1.4 new');

      await request(app)
        .post(`/api/domains/property/records/${testRecord._id}/documents`)
        .attach('file', pdf1, 'old.pdf');

      // Wait to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      await request(app)
        .post(`/api/domains/property/records/${testRecord._id}/documents`)
        .attach('file', pdf2, 'new.pdf');

      const res = await request(app)
        .get(`/api/domains/property/records/${testRecord._id}/documents`)
        .expect(200);

      expect(res.body[0].filename).toBe('new.pdf'); // Newest first
      expect(res.body[1].filename).toBe('old.pdf');
    });

    it('should return 404 for non-existent record', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/domains/property/records/${fakeId}/documents`)
        .expect(404);

      expect(res.body.error).toContain('not found');
    });

    it('should prevent listing other user\'s documents', async () => {
      const res = await request(app)
        .get(`/api/domains/property/records/${otherRecord._id}/documents`)
        .expect(404);

      expect(res.body.error).toContain('not found');
    });
  });

  describe('Document Download - GET /api/domain-documents/:fileId', () => {
    it('should download a document successfully', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4 test content');

      // Upload first
      const uploadRes = await request(app)
        .post(`/api/domains/property/records/${testRecord._id}/documents`)
        .attach('file', pdfBuffer, 'test.pdf')
        .expect(201);

      const fileId = uploadRes.body.fileId;

      // Download
      const res = await request(app)
        .get(`/api/domain-documents/${fileId}`)
        .expect(200);

      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('test.pdf');
    });

    it('should return 404 for non-existent file', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/domain-documents/${fakeId}`)
        .expect(404);

      expect(res.body.error).toContain('not found');
    });

    it('should prevent downloading other user\'s file', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4 content');

      // Upload as otherUser
      const uploadRes = await request(app)
        .post(`/api/domains/property/records/${otherRecord._id}/documents`)
        .set('test-user-id', otherUser._id.toString())
        .attach('file', pdfBuffer, 'other.pdf')
        .expect(201);

      const fileId = uploadRes.body.fileId;

      // Try to download as testUser
      const res = await request(app)
        .get(`/api/domain-documents/${fileId}`)
        .expect(403);

      expect(res.body.error).toContain('Access denied');
    });
  });

  describe('Document Delete - DELETE /api/domain-documents/:fileId', () => {
    it('should delete a document successfully', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4 content');

      // Upload first
      const uploadRes = await request(app)
        .post(`/api/domains/property/records/${testRecord._id}/documents`)
        .attach('file', pdfBuffer, 'test.pdf')
        .expect(201);

      const fileId = uploadRes.body.fileId;

      // Delete
      const res = await request(app)
        .delete(`/api/domain-documents/${fileId}`)
        .expect(200);

      expect(res.body.message).toContain('deleted successfully');

      // Verify file removed from GridFS
      const bucket = getGridFSBucket();
      const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
      expect(files.length).toBe(0);

      // Verify file ID removed from record
      const updated = await PropertyRecord.findById(testRecord._id);
      expect(updated.documentIds.length).toBe(0);
    });

    it('should return 404 for non-existent file', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/domain-documents/${fakeId}`)
        .expect(404);

      expect(res.body.error).toContain('not found');
    });

    it('should prevent deleting other user\'s file', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4 content');

      // Upload as otherUser
      const uploadRes = await request(app)
        .post(`/api/domains/property/records/${otherRecord._id}/documents`)
        .set('test-user-id', otherUser._id.toString())
        .attach('file', pdfBuffer, 'other.pdf')
        .expect(201);

      const fileId = uploadRes.body.fileId;

      // Try to delete as testUser
      const res = await request(app)
        .delete(`/api/domain-documents/${fileId}`)
        .expect(403);

      expect(res.body.error).toContain('Access denied');

      // Verify file still exists
      const bucket = getGridFSBucket();
      const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
      expect(files.length).toBe(1);
    });
  });

  describe('Full Upload-Download-Delete Cycle', () => {
    it('should complete full document lifecycle', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4 lifecycle test');

      // 1. Upload
      const uploadRes = await request(app)
        .post(`/api/domains/property/records/${testRecord._id}/documents`)
        .attach('file', pdfBuffer, 'lifecycle.pdf')
        .expect(201);

      const fileId = uploadRes.body.fileId;

      // 2. List (should show 1 file)
      const listRes = await request(app)
        .get(`/api/domains/property/records/${testRecord._id}/documents`)
        .expect(200);

      expect(listRes.body.length).toBe(1);
      expect(listRes.body[0].fileId.toString()).toBe(fileId.toString());

      // 3. Download
      await request(app)
        .get(`/api/domain-documents/${fileId}`)
        .expect(200);

      // 4. Delete
      await request(app)
        .delete(`/api/domain-documents/${fileId}`)
        .expect(200);

      // 5. Verify deleted (list should be empty)
      const finalListRes = await request(app)
        .get(`/api/domains/property/records/${testRecord._id}/documents`)
        .expect(200);

      expect(finalListRes.body.length).toBe(0);

      // 6. Verify download fails
      await request(app)
        .get(`/api/domain-documents/${fileId}`)
        .expect(404);
    });
  });

  describe('Multi-User Isolation', () => {
    it('should maintain complete document isolation between users', async () => {
      const pdf1 = Buffer.from('%PDF-1.4 user1');
      const pdf2 = Buffer.from('%PDF-1.4 user2');

      // Upload as testUser
      await request(app)
        .post(`/api/domains/property/records/${testRecord._id}/documents`)
        .attach('file', pdf1, 'user1.pdf')
        .expect(201);

      // Upload as otherUser
      await request(app)
        .post(`/api/domains/property/records/${otherRecord._id}/documents`)
        .set('test-user-id', otherUser._id.toString())
        .attach('file', pdf2, 'user2.pdf')
        .expect(201);

      // List as testUser (should only see user1.pdf)
      const testUserDocs = await request(app)
        .get(`/api/domains/property/records/${testRecord._id}/documents`)
        .expect(200);

      expect(testUserDocs.body.length).toBe(1);
      expect(testUserDocs.body[0].filename).toBe('user1.pdf');

      // List as otherUser (should only see user2.pdf)
      const otherUserDocs = await request(app)
        .get(`/api/domains/property/records/${otherRecord._id}/documents`)
        .set('test-user-id', otherUser._id.toString())
        .expect(200);

      expect(otherUserDocs.body.length).toBe(1);
      expect(otherUserDocs.body[0].filename).toBe('user2.pdf');
    });
  });
});
