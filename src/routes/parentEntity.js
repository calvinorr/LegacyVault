// src/routes/parentEntity.js
// Parent Entity API routes for hierarchical domain model
// Supports 5 domains: Vehicle, Property, Employment, Services, Finance

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const ParentEntity = require('../models/ParentEntity');
const ChildRecord = require('../models/ChildRecord');
const mongoose = require('mongoose');

// Configure multer for image uploads (max 5MB, images only)
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * Domain mapping from URL parameter to model enum
 * URL: /api/v2/vehicles -> ParentEntity { domainType: 'Vehicle' }
 */
const DOMAIN_MAPPING = {
  'vehicles': 'Vehicle',
  'properties': 'Property',
  'employments': 'Employment',
  'services': 'Services',
  'finance': 'Finance'
};

/**
 * Valid domain names (URL parameter values)
 */
const VALID_DOMAINS = Object.keys(DOMAIN_MAPPING);

/**
 * Domain validation middleware
 * Validates :domain parameter and maps to domainType
 */
const validateDomain = (req, res, next) => {
  const domain = req.params.domain.toLowerCase();

  if (!VALID_DOMAINS.includes(domain)) {
    return res.status(400).json({
      error: `Invalid domain: ${req.params.domain}`,
      validDomains: VALID_DOMAINS
    });
  }

  // Attach domainType to request for controllers
  req.domainType = DOMAIN_MAPPING[domain];
  req.domain = domain;
  next();
};

/**
 * LIST - Get all parent entities for a domain
 * GET /api/v2/:domain?page=1&limit=50&search=name&sort=createdAt&order=desc
 */
router.get('/:domain', requireAuth, validateDomain, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Pagination validation
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {
      userId: req.user._id,
      domainType: req.domainType
    };

    // Add search filter on name field
    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };

    // Execute query with pagination
    const [entities, total] = await Promise.all([
      ParentEntity.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ParentEntity.countDocuments(filter)
    ]);

    // Add child record counts to each entity
    const entitiesWithCounts = await Promise.all(
      entities.map(async (entity) => {
        const childCount = await ChildRecord.countDocuments({
          parentId: entity._id,
          userId: req.user._id
        });
        return {
          ...entity,
          childRecordCount: childCount
        };
      })
    );

    res.json({
      entities: entitiesWithCounts,
      page: pageNum,
      limit: limitNum,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * CREATE - Create new parent entity
 * POST /api/v2/:domain
 * Body: { name: string (required), fields: object (optional) }
 */
router.post('/:domain', requireAuth, validateDomain, async (req, res) => {
  try {
    const { name, fields } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'Name is required'
      });
    }

    // Create new parent entity
    const entity = new ParentEntity({
      userId: req.user._id,
      domainType: req.domainType,
      name: name.trim(),
      fields: fields !== undefined ? fields : {}
    });

    await entity.save();

    res.status(201).json(entity);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET BY ID - Get single parent entity with child records
 * GET /api/v2/:domain/:id
 * Returns entity with child records grouped by recordType
 */
router.get('/:domain/:id', requireAuth, validateDomain, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid entity ID' });
    }

    // Query parent entity with authorization check
    const entity = await ParentEntity.findOne({
      _id: req.params.id,
      userId: req.user._id,
      domainType: req.domainType
    }).lean();

    if (!entity) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    // Query child records
    const childRecords = await ChildRecord.find({
      parentId: req.params.id,
      userId: req.user._id
    }).lean();

    // Group child records by recordType
    const groupedChildren = {
      Contact: [],
      ServiceHistory: [],
      Finance: [],
      Insurance: [],
      Government: [],
      Pension: []
    };

    childRecords.forEach(record => {
      if (groupedChildren[record.recordType]) {
        groupedChildren[record.recordType].push(record);
      }
    });

    res.json({
      entity,
      childRecords: groupedChildren
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * UPDATE - Update parent entity
 * PUT /api/v2/:domain/:id
 * Body: { name: string, fields: object, status: string }
 */
router.put('/:domain/:id', requireAuth, validateDomain, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid entity ID' });
    }

    // Extract allowed fields for update
    const { name, fields, status } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name cannot be empty' });
      }
      updateData.name = name.trim();
    }

    if (fields !== undefined) {
      updateData.fields = fields;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    // Prevent userId and domainType changes
    // lastUpdatedBy is handled by Mongoose timestamps

    const entity = await ParentEntity.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
        domainType: req.domainType
      },
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!entity) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    res.json(entity);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE - Delete parent entity and cascade to child records
 * DELETE /api/v2/:domain/:id
 * Note: Uses sequential delete (child records first, then parent)
 * For production with replica sets, this could be wrapped in a transaction
 */
router.delete('/:domain/:id', requireAuth, validateDomain, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid entity ID' });
    }

    // Verify entity exists and user is authorized
    const entity = await ParentEntity.findOne({
      _id: req.params.id,
      userId: req.user._id,
      domainType: req.domainType
    });

    if (!entity) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    // Delete all child records first (cascade delete)
    await ChildRecord.deleteMany({ parentId: req.params.id });

    // Delete parent entity
    await ParentEntity.findByIdAndDelete(req.params.id);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * UPLOAD IMAGE - POST /api/v2/:domain/:id/image
 * Upload or update image for a parent entity
 */
router.post('/:domain/:id/image', requireAuth, validateDomain, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid entity ID' });
    }

    const entity = await ParentEntity.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
        domainType: req.domainType
      },
      {
        image: {
          filename: req.file.originalname,
          data: req.file.buffer,
          contentType: req.file.mimetype,
          uploadedAt: new Date()
        }
      },
      { new: true }
    );

    if (!entity) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    // Return image data as base64 for frontend
    const imageData = entity.image ? {
      filename: entity.image.filename,
      contentType: entity.image.contentType,
      data: entity.image.data.toString('base64')
    } : null;

    res.json({
      success: true,
      image: imageData
    });
  } catch (error) {
    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }
    if (error.message.includes('File too large')) {
      return res.status(413).json({ error: 'Image file too large (max 5MB)' });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET IMAGE - GET /api/v2/:domain/:id/image
 * Retrieve image for a parent entity
 */
router.get('/:domain/:id/image', requireAuth, validateDomain, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid entity ID' });
    }

    const entity = await ParentEntity.findOne({
      _id: req.params.id,
      userId: req.user._id,
      domainType: req.domainType
    });

    if (!entity || !entity.image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Return image with proper content type
    res.set('Content-Type', entity.image.contentType);
    res.send(entity.image.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
