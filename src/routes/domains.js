// src/routes/domains.js
// Domain-based API routes for 8 life domains
// Provides CRUD operations for domain-specific records

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getDomainValidator } = require('../middleware/domainValidation');
const { getDuplicateChecker } = require('../middleware/duplicateDetection');
const { Parser } = require('json2csv');

// Valid domain names
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
 * Validates domain parameter and normalizes to lowercase
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
 * Get domain model dynamically based on domain name
 * @param {string} domain - Domain name (lowercase)
 * @returns {Model} Mongoose model for the domain
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
 * Get domain-specific searchable fields
 */
const getSearchFields = (domain) => {
  const fieldMap = {
    finance: ['name', 'institution', 'accountType', 'accountNumber', 'sortCode'],
    vehicles: ['name', 'make', 'model', 'registration'],
    property: ['name', 'address', 'provider', 'postcode'],
    employment: ['name', 'employer', 'jobTitle'],
    insurance: ['name', 'provider', 'policyType', 'policyNumber'],
    government: ['name', 'benefitType', 'licenceNumber'],
    legal: ['name', 'documentType', 'solicitorName'],
    services: ['name', 'serviceName', 'serviceType', 'tradesperson']
  };

  return fieldMap[domain] || ['name'];
};

/**
 * SEARCH - Search domain records (must come before GET /:id route)
 * GET /api/domains/:domain/records/search?q=searchTerm
 */
router.get('/:domain/records/search', requireAuth, validateDomain, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters'
      });
    }

    const Model = getDomainModel(req.domain);
    const searchRegex = new RegExp(q, 'i'); // case-insensitive
    const searchFields = getSearchFields(req.domain);

    const searchQuery = {
      user: req.user._id,
      $or: searchFields.map(field => ({ [field]: searchRegex }))
    };

    const records = await Model.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * EXPORT - Export domain records
 * GET /api/domains/:domain/records/export?format=csv|json
 */
router.get('/:domain/records/export', requireAuth, validateDomain, async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const Model = getDomainModel(req.domain);

    // Get all user's records
    const records = await Model.find({ user: req.user._id })
      .select('-__v')
      .lean();

    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      // Convert to CSV
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(records);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${req.domain}-records-${timestamp}.csv"`);
      return res.send(csv);
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${req.domain}-records-${timestamp}.json"`);
      return res.json(records);
    }

    return res.status(400).json({
      error: 'Invalid format. Supported formats: csv, json'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Middleware wrapper to apply domain-specific validation and duplicate checks
 */
const applyDomainMiddleware = (req, res, next) => {
  const validator = getDomainValidator(req.domain);
  const duplicateChecker = getDuplicateChecker(req.domain);

  // Chain validator and duplicate checker
  validator(req, res, (err) => {
    if (err) return next(err);
    duplicateChecker(req, res, next);
  });
};

/**
 * CREATE - Create new domain record
 * POST /api/domains/:domain/records
 */
router.post('/:domain/records', requireAuth, validateDomain, applyDomainMiddleware, async (req, res) => {
  try {
    const Model = getDomainModel(req.domain);
    const record = new Model({
      ...req.body,
      user: req.user._id
    });
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * READ - Get all domain records for authenticated user with filtering and sorting
 * GET /api/domains/:domain/records?priority=high&sort=renewalDate&order=asc
 */
router.get('/:domain/records', requireAuth, validateDomain, async (req, res) => {
  try {
    const {
      priority,
      renewalDateStart,
      renewalDateEnd,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const Model = getDomainModel(req.domain);

    // Build filter query
    const filter = { user: req.user._id };

    if (priority) {
      filter.priority = priority;
    }

    if (renewalDateStart || renewalDateEnd) {
      filter.renewalDate = {};
      if (renewalDateStart) {
        filter.renewalDate.$gte = new Date(renewalDateStart);
      }
      if (renewalDateEnd) {
        filter.renewalDate.$lte = new Date(renewalDateEnd);
      }
    }

    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };

    const records = await Model.find(filter).sort(sortObj);

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * READ - Get single domain record by ID
 * GET /api/domains/:domain/records/:id
 */
router.get('/:domain/records/:id', requireAuth, validateDomain, async (req, res) => {
  try {
    const Model = getDomainModel(req.domain);
    const record = await Model.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * UPDATE - Update domain record by ID
 * PUT /api/domains/:domain/records/:id
 */
router.put('/:domain/records/:id', requireAuth, validateDomain, applyDomainMiddleware, async (req, res) => {
  try {
    const Model = getDomainModel(req.domain);

    // Remove user field from update to prevent changing ownership
    const { user, ...updateData } = req.body;

    // Set lastModifiedBy for audit trail
    updateData.lastModifiedBy = req.user._id;

    const record = await Model.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE - Delete domain record by ID
 * DELETE /api/domains/:domain/records/:id
 */
router.delete('/:domain/records/:id', requireAuth, validateDomain, async (req, res) => {
  try {
    const Model = getDomainModel(req.domain);
    const record = await Model.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Record deleted successfully', deletedRecord: record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
