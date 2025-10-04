// src/routes/domain-documents.js
// GridFS document storage for domain records (Story 1.2)

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getGridFSBucket } = require('../db/gridfs');
const mongoose = require('mongoose');

// Valid domain names (same as domains router)
const VALID_DOMAINS = [
  'property',
  'vehicles',
  'employment',
  'government',
  'finance',
  'insurance',
  'legal',
  'services'
];

/**
 * Domain validation middleware
 */
const validateDomain = (req, res, next) => {
  const domain = req.params.domain.toLowerCase();
  if (!VALID_DOMAINS.includes(domain)) {
    return res.status(400).json({
      error: `Invalid domain: ${req.params.domain}`,
      validDomains: VALID_DOMAINS
    });
  }
  req.domain = domain;
  next();
};

/**
 * Get domain model dynamically
 */
const getDomainModel = (domain) => {
  const modelMap = {
    property: require('../models/domain/PropertyRecord'),
    vehicles: require('../models/domain/VehicleRecord'),
    employment: require('../models/domain/EmploymentRecord'),
    government: require('../models/domain/GovernmentRecord'),
    finance: require('../models/domain/FinanceRecord'),
    insurance: require('../models/domain/InsuranceRecord'),
    legal: require('../models/domain/LegalRecord'),
    services: require('../models/domain/ServicesRecord'),
  };
  return modelMap[domain];
};

/**
 * Upload document to domain record
 * POST /api/domains/:domain/records/:id/documents
 */
router.post(
  '/:domain/records/:id/documents',
  requireAuth,
  validateDomain,
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
  },
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

/**
 * List all documents for a domain record
 * GET /api/domains/:domain/records/:id/documents
 */
router.get(
  '/:domain/records/:id/documents',
  requireAuth,
  validateDomain,
  async (req, res) => {
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
        try {
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
        } catch (err) {
          // Skip files that can't be found (orphaned references)
          console.warn(`File ${fileId} not found in GridFS`);
        }
      }

      // Sort by upload date (newest first)
      fileMetadata.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

      res.json(fileMetadata);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Download document by file ID
 * GET /api/domain-documents/:fileId
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
      if (!res.headersSent) {
        res.status(500).json({ error: 'File download failed', details: error.message });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete document by file ID
 * DELETE /api/domain-documents/:fileId
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

module.exports = router;
