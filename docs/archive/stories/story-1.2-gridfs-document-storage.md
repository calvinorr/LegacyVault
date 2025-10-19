# Story 1.2: GridFS Document Storage Integration

**Epic:** Life Domain Architecture Foundation (Epic 1)
**Story ID:** 1.2
**Estimated Effort:** 6-10 hours (1-2 development sessions)
**Priority:** High
**Status:** Not Started
**Dependencies:** Story 1.1 (Complete ✓)

---

## User Story

**As a** developer,
**I want** to integrate MongoDB GridFS for document storage and link documents to domain records,
**so that** users can attach files (PDFs, images, etc.) to any domain record and retrieve them securely.

---

## Story Context

### Why This Story

Story 1.1 created the foundation with 8 domain schemas, each containing a `documentIds` array ready for file attachments. Story 1.2 makes that array functional by:
- Storing uploaded files in MongoDB GridFS
- Providing upload/download API endpoints
- Linking documents to domain records via the `documentIds` array
- Enabling secure file retrieval with user authentication

### Existing System Integration

**From Story 1.1:**
- 8 domain schemas with `documentIds: [{ type: Schema.Types.ObjectId }]` field
- Domain CRUD API at `/api/domains/:domain/records`
- User authentication via `requireAuth` middleware
- MongoDB connection already established

**Existing Document System:**
- Current system has document upload capabilities (from brief)
- PDF upload and linking to records already exists
- Bank statement import uses PDF parsing (`pdf2json`)

**Technology Stack:**
- MongoDB GridFS (built-in MongoDB feature for large files)
- Multer (file upload middleware - already in dependencies)
- Express v4.x (existing routing)
- Mongoose v7.x (GridFS integration via mongoose)

### What This Story Delivers

**New Capabilities:**
1. **Upload Documents to Domain Records** - Users can attach PDFs, images to any domain record
2. **Download Documents** - Secure retrieval of uploaded files
3. **List Documents** - View all files attached to a record
4. **Delete Documents** - Remove unwanted files
5. **File Metadata** - Track filename, size, type, upload date, uploader

**Integration Points:**
- New `/api/domains/:domain/records/:id/documents` endpoint (upload)
- New `/api/documents/:fileId` endpoint (download)
- New `/api/documents/:fileId` endpoint (delete)
- Updates to domain records (populate `documentIds` array)

---

## Acceptance Criteria

### Functional Requirements

**AC1: GridFS Storage Setup**
- ✅ GridFS bucket configured with MongoDB connection
- ✅ Bucket name: `documents` (consistent with existing system)
- ✅ File chunking handled automatically by GridFS
- ✅ Metadata schema includes: `filename`, `contentType`, `uploadDate`, `uploadedBy`, `recordId`, `domain`

**AC2: Document Upload API**
- ✅ `POST /api/domains/:domain/records/:id/documents` endpoint accepts file uploads
- ✅ Multer middleware processes multipart/form-data
- ✅ File validation (size limit: 10MB per file, allowed types: PDF, PNG, JPG, JPEG)
- ✅ Uploaded file stored in GridFS with metadata
- ✅ Domain record's `documentIds` array updated with new file ID
- ✅ Returns file metadata: `{ fileId, filename, size, contentType, uploadDate }`

**AC3: Document Download API**
- ✅ `GET /api/documents/:fileId` endpoint streams file from GridFS
- ✅ Proper Content-Type header set based on file metadata
- ✅ Content-Disposition header for download (e.g., `attachment; filename="document.pdf"`)
- ✅ Streaming prevents memory issues with large files

**AC4: Document List API**
- ✅ `GET /api/domains/:domain/records/:id/documents` returns all files for a record
- ✅ Returns array of file metadata (no file content, just info)
- ✅ Sorted by upload date (newest first)

**AC5: Document Delete API**
- ✅ `DELETE /api/documents/:fileId` removes file from GridFS
- ✅ Removes file ID from domain record's `documentIds` array
- ✅ Only record owner can delete documents
- ✅ Returns confirmation message

**AC6: User Authentication & Authorization**
- ✅ All document endpoints require authentication (`requireAuth` middleware)
- ✅ Users can only upload to their own records
- ✅ Users can only download/delete files from their own records
- ✅ Attempting to access other user's files returns 403 Forbidden

**AC7: File Validation & Security**
- ✅ File size limit enforced (10MB max)
- ✅ File type validation (only PDF, PNG, JPG, JPEG allowed)
- ✅ Malicious file detection (basic MIME type check)
- ✅ Proper error messages for validation failures

### Integration Requirements

**IR1: Existing Functionality Preserved**
- ✅ Domain CRUD endpoints from Story 1.1 unchanged
- ✅ Existing authentication flow works
- ✅ No changes to domain schemas (only using existing `documentIds` field)

**IR2: Domain Record Integration**
- ✅ Domain records properly updated when documents uploaded
- ✅ Deleting a document removes reference from domain record
- ✅ Deleting a domain record orphans documents (or optionally cascades delete)

**IR3: MongoDB Atlas Compatibility**
- ✅ GridFS works with MongoDB Atlas (production database)
- ✅ GridFS works with local Docker MongoDB (development)
- ✅ No additional infrastructure required

### Quality Requirements

**QR1: Comprehensive Testing**
- ✅ Unit tests for file upload (valid files)
- ✅ Unit tests for file validation (invalid size, invalid type)
- ✅ Unit tests for download (file streaming)
- ✅ Unit tests for delete (file removal + record update)
- ✅ Integration tests for full upload-download-delete cycle
- ✅ Tests for user authorization (can't access other user's files)
- ✅ Test coverage: minimum 90% for new code

**QR2: Error Handling**
- ✅ Graceful handling of missing files (404 Not Found)
- ✅ Graceful handling of file too large (413 Payload Too Large)
- ✅ Graceful handling of invalid file type (400 Bad Request)
- ✅ Proper error messages returned in JSON format

**QR3: Performance**
- ✅ File streaming prevents memory issues (no buffering entire file)
- ✅ Upload response time < 2 seconds for 5MB file
- ✅ Download streaming starts immediately (no delay)

---

## Technical Specifications

### GridFS Setup

#### Create GridFS Bucket

```javascript
// src/db/gridfs.js
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let bucket;

/**
 * Initialize GridFS bucket
 * Call after MongoDB connection established
 */
const initGridFS = () => {
  if (!bucket) {
    const db = mongoose.connection.db;
    bucket = new GridFSBucket(db, {
      bucketName: 'documents'
    });
  }
  return bucket;
};

/**
 * Get GridFS bucket instance
 */
const getGridFSBucket = () => {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized. Call initGridFS() first.');
  }
  return bucket;
};

module.exports = { initGridFS, getGridFSBucket };
```

#### Initialize in Server

```javascript
// src/server.js (or wherever MongoDB connects)
const { initGridFS } = require('./db/gridfs');

db.connect().then(() => {
  console.log('MongoDB connected');
  initGridFS();
  console.log('GridFS bucket initialized');
}).catch((err) => {
  console.error('MongoDB connection error:', err.message);
});
```

---

### Document Upload Endpoint

#### Multer Configuration

```javascript
// src/middleware/upload.js
const multer = require('multer');

// Configure multer for memory storage (files stored in memory before GridFS)
const storage = multer.memoryStorage();

// File filter: only allow PDF, PNG, JPG, JPEG
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PNG, JPG, JPEG allowed.'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;
```

#### Upload Route

```javascript
// src/routes/documents.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getGridFSBucket } = require('../db/gridfs');
const mongoose = require('mongoose');

/**
 * Upload document to domain record
 * POST /api/domains/:domain/records/:id/documents
 */
router.post(
  '/:domain/records/:id/documents',
  requireAuth,
  upload.single('file'), // 'file' is the form field name
  async (req, res) => {
    try {
      const { domain, id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Get domain model dynamically
      const Model = getDomainModel(domain);

      // Verify record exists and user owns it
      const record = await Model.findOne({ _id: id, user: req.user._id });
      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }

      // Upload to GridFS
      const bucket = getGridFSBucket();
      const uploadStream = bucket.openUploadStream(file.originalname, {
        metadata: {
          contentType: file.mimetype,
          uploadedBy: req.user._id,
          recordId: id,
          domain: domain
        }
      });

      // Write file buffer to GridFS
      uploadStream.end(file.buffer);

      uploadStream.on('finish', async () => {
        // Update domain record with file ID
        record.documentIds.push(uploadStream.id);
        await record.save();

        res.status(201).json({
          fileId: uploadStream.id,
          filename: file.originalname,
          size: file.size,
          contentType: file.mimetype,
          uploadDate: new Date()
        });
      });

      uploadStream.on('error', (error) => {
        res.status(500).json({ error: 'File upload failed', details: error.message });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
```

---

### Document Download Endpoint

```javascript
// src/routes/documents.js

/**
 * Download document by file ID
 * GET /api/documents/:fileId
 */
router.get('/:fileId', requireAuth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const bucket = getGridFSBucket();

    // Find file metadata
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();

    if (files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[0];

    // Verify user owns the file (via metadata)
    if (file.metadata.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Set headers for download
    res.set('Content-Type', file.metadata.contentType);
    res.set('Content-Disposition', `attachment; filename="${file.filename}"`);

    // Stream file from GridFS
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

    downloadStream.on('error', (error) => {
      res.status(500).json({ error: 'File download failed', details: error.message });
    });

    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### Document List Endpoint

```javascript
// src/routes/documents.js

/**
 * List all documents for a domain record
 * GET /api/domains/:domain/records/:id/documents
 */
router.get('/:domain/records/:id/documents', requireAuth, async (req, res) => {
  try {
    const { domain, id } = req.params;
    const Model = getDomainModel(domain);

    // Verify record exists and user owns it
    const record = await Model.findOne({ _id: id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const bucket = getGridFSBucket();

    // Get all files for this record
    const fileMetadata = [];
    for (const fileId of record.documentIds) {
      const files = await bucket.find({ _id: fileId }).toArray();
      if (files.length > 0) {
        const file = files[0];
        fileMetadata.push({
          fileId: file._id,
          filename: file.filename,
          size: file.length,
          contentType: file.metadata.contentType,
          uploadDate: file.uploadDate
        });
      }
    }

    // Sort by upload date (newest first)
    fileMetadata.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    res.json(fileMetadata);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### Document Delete Endpoint

```javascript
// src/routes/documents.js

/**
 * Delete document by file ID
 * DELETE /api/documents/:fileId
 */
router.delete('/:fileId', requireAuth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const bucket = getGridFSBucket();

    // Find file metadata
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();

    if (files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[0];

    // Verify user owns the file
    if (file.metadata.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete from GridFS
    await bucket.delete(new mongoose.Types.ObjectId(fileId));

    // Remove from domain record's documentIds array
    const { domain, recordId } = file.metadata;
    const Model = getDomainModel(domain);
    await Model.findByIdAndUpdate(recordId, {
      $pull: { documentIds: new mongoose.Types.ObjectId(fileId) }
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### Register Routes in Server

```javascript
// src/server.js

const documentsRouter = require('./routes/documents');

// ... existing routes ...

// Document Management API (Story 1.2)
app.use('/api/documents', documentsRouter);
app.use('/api/domains', documentsRouter); // For upload endpoint
```

---

## Testing Guide

### Manual Testing with Postman/curl

**1. Upload a Document:**
```bash
curl -X POST http://localhost:3000/api/domains/property/records/{recordId}/documents \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -F "file=@/path/to/document.pdf"
```

**Expected Response:**
```json
{
  "fileId": "507f1f77bcf86cd799439011",
  "filename": "document.pdf",
  "size": 1024000,
  "contentType": "application/pdf",
  "uploadDate": "2025-10-04T12:00:00.000Z"
}
```

**2. List Documents for a Record:**
```bash
curl http://localhost:3000/api/domains/property/records/{recordId}/documents \
  -H "Cookie: session=YOUR_SESSION_COOKIE"
```

**Expected Response:**
```json
[
  {
    "fileId": "507f1f77bcf86cd799439011",
    "filename": "document.pdf",
    "size": 1024000,
    "contentType": "application/pdf",
    "uploadDate": "2025-10-04T12:00:00.000Z"
  }
]
```

**3. Download a Document:**
```bash
curl http://localhost:3000/api/documents/{fileId} \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  --output downloaded-document.pdf
```

**4. Delete a Document:**
```bash
curl -X DELETE http://localhost:3000/api/documents/{fileId} \
  -H "Cookie: session=YOUR_SESSION_COOKIE"
```

**Expected Response:**
```json
{
  "message": "Document deleted successfully"
}
```

**5. Test File Validation (Too Large):**
```bash
# Create a 15MB dummy file (exceeds 10MB limit)
dd if=/dev/zero of=large.pdf bs=1M count=15

curl -X POST http://localhost:3000/api/domains/property/records/{recordId}/documents \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -F "file=@large.pdf"
```

**Expected Response:**
```json
{
  "error": "File too large. Maximum size is 10MB."
}
```

**6. Test Invalid File Type:**
```bash
curl -X POST http://localhost:3000/api/domains/property/records/{recordId}/documents \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -F "file=@document.exe"
```

**Expected Response:**
```json
{
  "error": "Invalid file type. Only PDF, PNG, JPG, JPEG allowed."
}
```

---

### Automated Tests (Jest + Supertest)

Create comprehensive test suite at `tests/api/documents.test.js`:

**Test Coverage:**
1. ✅ Upload valid PDF document
2. ✅ Upload valid image (PNG, JPG)
3. ✅ Reject file exceeding size limit
4. ✅ Reject invalid file type
5. ✅ List documents for a record
6. ✅ Download document successfully
7. ✅ Delete document successfully
8. ✅ Verify document removed from record's `documentIds`
9. ✅ Prevent uploading to other user's records (403)
10. ✅ Prevent downloading other user's files (403)
11. ✅ Prevent deleting other user's files (403)
12. ✅ Handle non-existent file IDs (404)
13. ✅ Handle missing file in upload request (400)

**Minimum Test Count:** 15-20 tests

---

## Verification Checklist

**Before marking story complete:**

- [ ] GridFS bucket initialized successfully
- [ ] Upload endpoint accepts PDF, PNG, JPG, JPEG files
- [ ] File size validation works (10MB limit)
- [ ] File type validation works (reject .exe, .zip, etc.)
- [ ] Uploaded files stored in GridFS with correct metadata
- [ ] Domain records updated with file IDs
- [ ] Download endpoint streams files correctly
- [ ] Downloaded files match uploaded files (checksum verification)
- [ ] List endpoint returns all files for a record
- [ ] Delete endpoint removes files from GridFS
- [ ] Delete endpoint removes file ID from record's `documentIds` array
- [ ] User authorization works (can't access other users' files)
- [ ] All tests passing (minimum 15 tests)
- [ ] No errors in server logs
- [ ] MongoDB Atlas shows `documents.files` and `documents.chunks` collections
- [ ] Existing domain CRUD endpoints still work (regression test)

---

## Implementation Notes

### Development Workflow

**Step 1: GridFS Setup (30-60 minutes)**
1. Create `src/db/gridfs.js` module
2. Initialize GridFS bucket in server startup
3. Test bucket creation

**Step 2: Upload Middleware (45 minutes)**
1. Create `src/middleware/upload.js` with Multer config
2. Test file validation logic

**Step 3: Upload Endpoint (1-2 hours)**
1. Create `src/routes/documents.js`
2. Implement `POST /:domain/records/:id/documents`
3. Test with Postman/curl

**Step 4: Download Endpoint (45-60 minutes)**
1. Implement `GET /api/documents/:fileId`
2. Test file streaming with large files

**Step 5: List Endpoint (30 minutes)**
1. Implement `GET /:domain/records/:id/documents`
2. Test with multiple files

**Step 6: Delete Endpoint (45 minutes)**
1. Implement `DELETE /api/documents/:fileId`
2. Verify record update and GridFS deletion

**Step 7: Testing (2-3 hours)**
1. Write comprehensive test suite
2. Test user authorization
3. Test edge cases (large files, invalid types)

**Step 8: Integration Testing (30-45 minutes)**
1. Test full upload-download-delete cycle
2. Verify existing domain endpoints still work
3. Check MongoDB collections

**Total Estimated Time: 6-10 hours**

---

### Key Patterns to Follow

**GridFS Streaming Pattern:**
```javascript
// ALWAYS stream, never buffer entire file in memory
const downloadStream = bucket.openDownloadStream(fileId);
downloadStream.pipe(res);
```

**User Authorization Pattern:**
```javascript
// ALWAYS verify user owns the resource
if (file.metadata.uploadedBy.toString() !== req.user._id.toString()) {
  return res.status(403).json({ error: 'Access denied' });
}
```

**File Validation Pattern:**
```javascript
// Validate BEFORE processing
const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
if (!allowedTypes.includes(file.mimetype)) {
  return res.status(400).json({ error: 'Invalid file type' });
}
```

---

### Gotchas to Avoid

❌ **Don't** buffer files in memory (use streaming)
❌ **Don't** skip file type validation (security risk)
❌ **Don't** forget to update domain record's `documentIds` array
❌ **Don't** allow unlimited file sizes (enforce 10MB limit)
❌ **Don't** skip user authorization checks
❌ **Don't** forget to remove file ID from record when deleting

✅ **Do** use GridFS streaming for upload/download
✅ **Do** validate file type and size
✅ **Do** store metadata (uploadedBy, recordId, domain)
✅ **Do** test with production-sized files (5-10MB)
✅ **Do** verify user owns record before upload
✅ **Do** clean up both GridFS and record when deleting

---

## Definition of Done

- [x] GridFS bucket configured and initialized
- [x] Upload endpoint functional with file validation
- [x] Download endpoint streams files correctly
- [x] List endpoint returns file metadata
- [x] Delete endpoint removes files and updates records
- [x] User authorization enforced on all endpoints
- [x] File size and type validation working
- [x] Comprehensive tests written (minimum 15 tests)
- [x] All tests passing (100% pass rate)
- [x] Existing domain CRUD endpoints verified working
- [x] MongoDB shows `documents.files` and `documents.chunks` collections
- [x] No errors in server logs
- [x] Code follows existing patterns
- [x] Documentation updated (API endpoints documented)
- [x] Git commit with clear message: "feat: Add GridFS document storage integration (Story 1.2)"

---

## Next Story

**Story 1.3: Domain Record Management & Validation**
- Builds on domain records (Story 1.1) and documents (Story 1.2)
- Adds advanced validation (UK sort codes, NI numbers)
- Adds search/filter capabilities
- Adds record duplication detection
- Adds audit trail for record changes

---

---

## Dev Agent Record

**Agent Model Used:** Claude Sonnet 4.5
**Development Session:** 2025-10-04
**Status:** Ready for Review

### File List

**Created Files:**
1. `src/db/gridfs.js` - GridFS bucket initialization and singleton access
2. `src/middleware/upload.js` - Multer file upload configuration with validation
3. `src/routes/domain-documents.js` - Complete CRUD API for GridFS documents
4. `tests/api/domain-documents.test.js` - Comprehensive test suite (22 tests)

**Modified Files:**
1. `src/server.js` - Added GridFS initialization and route registration

### Completion Notes

**What Was Delivered:**
- Complete MongoDB GridFS integration for document storage across all 8 domain types
- Upload endpoint with file validation (PDF, PNG, JPG, JPEG; 10MB limit)
- Download endpoint with streaming to prevent memory issues
- List endpoint returning sorted file metadata
- Delete endpoint with cleanup of both GridFS and domain record references
- Comprehensive user authentication and authorization at all levels
- Full test coverage with 22 passing tests covering all CRUD operations, validation, authorization, and multi-user isolation

**Test Results:**
- Story 1.2 Tests: 22/22 passing
- Story 1.1 Regression Tests: 25/25 passing
- Total Coverage: All acceptance criteria validated

**Key Implementation Details:**
- Used singleton pattern for GridFS bucket access
- Implemented file streaming for upload/download to handle large files efficiently
- Custom error handling middleware for Multer validation errors
- Metadata tracking: filename, contentType, uploadedBy, recordId, domain
- Security: User-scoped authorization preventing cross-user file access
- GridFS collections: `documents.files` and `documents.chunks`

### Change Log

**2025-10-04:**
- Implemented GridFS storage system with bucket initialization
- Created Multer middleware with file type and size validation
- Built domain-documents router with 4 CRUD endpoints:
  - POST /api/domains/:domain/records/:id/documents (upload)
  - GET /api/domains/:domain/records/:id/documents (list)
  - GET /api/domain-documents/:fileId (download)
  - DELETE /api/domain-documents/:fileId (delete)
- Registered routes in server.js on two paths for different endpoint patterns
- Wrote 22 comprehensive tests covering all functionality
- Fixed Multer error handling to return proper JSON responses (400, 413 status codes)
- Verified all Story 1.1 regression tests still passing (25/25)
- All acceptance criteria met and validated

### Debug Log

**Issue 1: Multer Error Handling**
- **Problem:** Tests for invalid file type and file size limit were failing (expected 400/413, received 500)
- **Root Cause:** Multer errors weren't being caught and formatted as JSON responses
- **Solution:** Wrapped `upload.single('file')` in custom middleware:
  ```javascript
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  }
  ```
- **Result:** All validation tests now passing with correct status codes

**Issue 2: Route Naming Conflict**
- **Observation:** Existing `src/routes/documents.js` already exists for filesystem-based document storage
- **Decision:** Created new `src/routes/domain-documents.js` to avoid conflicts and maintain backward compatibility
- **Result:** Both document systems can coexist

---

**Story Created:** 2025-10-04
**Last Updated:** 2025-10-04
**Status:** Ready for Review
