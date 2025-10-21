// src/routes/childRecord.js
// Child Record API routes for hierarchical domain model
// Supports 6 record types: Contact, ServiceHistory, Finance, Insurance, Government, Pension

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ParentEntity = require('../models/ParentEntity');
const ChildRecord = require('../models/ChildRecord');
const mongoose = require('mongoose');
const multer = require('multer');

// Configure multer for attachment uploads (max 10MB, common document types)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|gif|txt|csv|xls|xlsx/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());

    if (mimetype || extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only documents and images are allowed.'));
  }
});

/**
 * Domain mapping from URL parameter to model enum
 */
const DOMAIN_MAPPING = {
  'vehicles': 'Vehicle',
  'properties': 'Property',
  'employments': 'Employment',
  'services': 'Services',
  'finance': 'Finance'
};

const VALID_DOMAINS = Object.keys(DOMAIN_MAPPING);

/**
 * Valid record types for child records
 */
const VALID_RECORD_TYPES = [
  'Contact',
  'ServiceHistory',
  'Finance',
  'Insurance',
  'Government',
  'Pension'
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

  req.domainType = DOMAIN_MAPPING[domain];
  req.domain = domain;
  next();
};

/**
 * Parent validation middleware
 * Verifies parent entity exists and user has access
 */
const validateParent = async (req, res, next) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.parentId)) {
      return res.status(400).json({ error: 'Invalid parent ID' });
    }

    // Query parent entity with authorization check
    const parent = await ParentEntity.findOne({
      _id: req.params.parentId,
      userId: req.user._id,
      domainType: req.domainType
    });

    if (!parent) {
      return res.status(404).json({ error: 'Parent entity not found' });
    }

    // Attach parent to request for use in route handlers
    req.parent = parent;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * LIST - Get all child records for a parent entity
 * GET /api/v2/:domain/:parentId/records
 * Returns records grouped by recordType
 */
router.get(
  '/:domain/:parentId/records',
  requireAuth,
  validateDomain,
  validateParent,
  async (req, res) => {
    try {
      const { recordType, sort = 'createdAt', order = 'desc' } = req.query;

      // Build filter query
      const filter = {
        parentId: req.params.parentId,
        userId: req.user._id
      };

      // Optional filter by recordType
      if (recordType && VALID_RECORD_TYPES.includes(recordType)) {
        filter.recordType = recordType;
      }

      // Build sort object
      const sortOrder = order === 'asc' ? 1 : -1;
      const sortObj = { [sort]: sortOrder };

      // Query child records
      const records = await ChildRecord.find(filter).sort(sortObj).lean();

      // Group by recordType
      const groupedRecords = {
        Contact: [],
        ServiceHistory: [],
        Finance: [],
        Insurance: [],
        Government: [],
        Pension: []
      };

      records.forEach(record => {
        if (groupedRecords[record.recordType]) {
          groupedRecords[record.recordType].push(record);
        }
      });

      res.json({
        parentId: req.params.parentId,
        parentName: req.parent.name,
        records: groupedRecords,
        total: records.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * CREATE - Create new child record
 * POST /api/v2/:domain/:parentId/records
 * Body: { recordType, name, contactName, phone, email, ... }
 */
router.post(
  '/:domain/:parentId/records',
  requireAuth,
  validateDomain,
  validateParent,
  async (req, res) => {
    try {
      const { recordType, name } = req.body;

      // Validate required fields
      if (!recordType || !recordType.trim()) {
        return res.status(400).json({ error: 'Record type is required' });
      }

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Validate recordType enum
      if (!VALID_RECORD_TYPES.includes(recordType)) {
        return res.status(400).json({
          error: `Invalid record type: ${recordType}`,
          validRecordTypes: VALID_RECORD_TYPES
        });
      }

      // Create new child record
      // Flatten fields object if present (frontend may send nested structure)
      const { fields, ...directFields } = req.body;
      const flattenedData = {
        ...directFields,
        ...(fields && typeof fields === 'object' ? fields : {}),
        userId: req.user._id,
        parentId: req.params.parentId,
        recordType,
        name: name.trim()
      };

      const childRecord = new ChildRecord(flattenedData);

      await childRecord.save();

      res.status(201).json(childRecord);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET BY ID - Get single child record
 * GET /api/v2/:domain/:parentId/records/:recordId
 */
router.get(
  '/:domain/:parentId/records/:recordId',
  requireAuth,
  validateDomain,
  validateParent,
  async (req, res) => {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(req.params.recordId)) {
        return res.status(400).json({ error: 'Invalid record ID' });
      }

      // Query child record with authorization check
      const record = await ChildRecord.findOne({
        _id: req.params.recordId,
        parentId: req.params.parentId,
        userId: req.user._id
      });

      if (!record) {
        return res.status(404).json({ error: 'Child record not found' });
      }

      res.json(record);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * UPDATE - Update child record
 * PUT /api/v2/:domain/:parentId/records/:recordId
 * Body: { name, contactName, phone, email, ... }
 */
router.put(
  '/:domain/:parentId/records/:recordId',
  requireAuth,
  validateDomain,
  validateParent,
  async (req, res) => {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(req.params.recordId)) {
        return res.status(400).json({ error: 'Invalid record ID' });
      }

      // Extract update data (prevent changing userId, parentId, recordType)
      const { userId, parentId, recordType, fields, ...directUpdateData } = req.body;

      // Flatten fields object if present (frontend may send nested structure)
      const flattenedUpdateData = {
        ...directUpdateData,
        ...(fields && typeof fields === 'object' ? fields : {})
      };

      // Validate name if provided
      if (flattenedUpdateData.name !== undefined) {
        if (!flattenedUpdateData.name || !flattenedUpdateData.name.trim()) {
          return res.status(400).json({ error: 'Name cannot be empty' });
        }
        flattenedUpdateData.name = flattenedUpdateData.name.trim();
      }

      // Update child record
      const record = await ChildRecord.findOneAndUpdate(
        {
          _id: req.params.recordId,
          parentId: req.params.parentId,
          userId: req.user._id
        },
        flattenedUpdateData,
        {
          new: true,
          runValidators: true
        }
      );

      if (!record) {
        return res.status(404).json({ error: 'Child record not found' });
      }

      res.json(record);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * DELETE - Delete child record
 * DELETE /api/v2/:domain/:parentId/records/:recordId
 */
router.delete(
  '/:domain/:parentId/records/:recordId',
  requireAuth,
  validateDomain,
  validateParent,
  async (req, res) => {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(req.params.recordId)) {
        return res.status(400).json({ error: 'Invalid record ID' });
      }

      // Delete child record
      const record = await ChildRecord.findOneAndDelete({
        _id: req.params.recordId,
        parentId: req.params.parentId,
        userId: req.user._id
      });

      if (!record) {
        return res.status(404).json({ error: 'Child record not found' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * UPLOAD ATTACHMENT - Upload file to child record
 * POST /api/v2/:domain/:parentId/records/:recordId/attachment
 */
router.post(
  '/:domain/:parentId/records/:recordId/attachment',
  requireAuth,
  upload.single('attachment'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(req.params.parentId) ||
          !mongoose.Types.ObjectId.isValid(req.params.recordId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      const domainType = DOMAIN_MAPPING[req.params.domain];
      if (!domainType) {
        return res.status(400).json({ error: 'Invalid domain' });
      }

      // Verify parent entity exists and belongs to user
      const parentEntity = await ParentEntity.findOne({
        _id: req.params.parentId,
        userId: req.user._id,
        domainType
      });

      if (!parentEntity) {
        return res.status(404).json({ error: 'Parent entity not found' });
      }

      // Update child record with attachment
      const record = await ChildRecord.findOneAndUpdate(
        {
          _id: req.params.recordId,
          parentId: req.params.parentId,
          userId: req.user._id
        },
        {
          attachment: {
            filename: req.file.originalname,
            data: req.file.buffer,
            contentType: req.file.mimetype,
            uploadedAt: new Date()
          }
        },
        { new: true }
      );

      if (!record) {
        return res.status(404).json({ error: 'Child record not found' });
      }

      res.json({
        success: true,
        attachment: {
          filename: record.attachment.filename,
          contentType: record.attachment.contentType,
          uploadedAt: record.attachment.uploadedAt
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET ATTACHMENT - View or download attachment from child record
 * GET /api/v2/:domain/:parentId/records/:recordId/attachment?download=true (optional)
 */
router.get(
  '/:domain/:parentId/records/:recordId/attachment',
  requireAuth,
  async (req, res) => {
    try {
      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(req.params.parentId) ||
          !mongoose.Types.ObjectId.isValid(req.params.recordId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      const record = await ChildRecord.findOne({
        _id: req.params.recordId,
        parentId: req.params.parentId,
        userId: req.user._id
      });

      if (!record || !record.attachment) {
        return res.status(404).json({ error: 'Attachment not found' });
      }

      // Return file with proper content type
      res.set('Content-Type', record.attachment.contentType);

      // Use 'inline' for viewing in browser, 'attachment' for forcing download
      const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
      res.set('Content-Disposition', `${disposition}; filename="${record.attachment.filename}"`);

      res.send(record.attachment.data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * DELETE ATTACHMENT - Remove attachment from child record
 * DELETE /api/v2/:domain/:parentId/records/:recordId/attachment
 */
router.delete(
  '/:domain/:parentId/records/:recordId/attachment',
  requireAuth,
  async (req, res) => {
    try {
      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(req.params.parentId) ||
          !mongoose.Types.ObjectId.isValid(req.params.recordId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      const record = await ChildRecord.findOneAndUpdate(
        {
          _id: req.params.recordId,
          parentId: req.params.parentId,
          userId: req.user._id
        },
        {
          $unset: { attachment: '' }
        },
        { new: true }
      );

      if (!record) {
        return res.status(404).json({ error: 'Child record not found' });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
