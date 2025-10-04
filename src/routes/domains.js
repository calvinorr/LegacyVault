// src/routes/domains.js
// Domain-based API routes for 8 life domains
// Provides CRUD operations for domain-specific records

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

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
 * CREATE - Create new domain record
 * POST /api/domains/:domain/records
 */
router.post('/:domain/records', requireAuth, validateDomain, async (req, res) => {
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
 * READ - Get all domain records for authenticated user
 * GET /api/domains/:domain/records
 */
router.get('/:domain/records', requireAuth, validateDomain, async (req, res) => {
  try {
    const Model = getDomainModel(req.domain);
    const records = await Model.find({ user: req.user._id }).sort({ createdAt: -1 });
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
router.put('/:domain/records/:id', requireAuth, validateDomain, async (req, res) => {
  try {
    const Model = getDomainModel(req.domain);

    // Remove user field from update to prevent changing ownership
    const { user, ...updateData } = req.body;

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
