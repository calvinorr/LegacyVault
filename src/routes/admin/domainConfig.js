const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../middleware/auth');
const DomainConfig = require('../../models/DomainConfig');

// Domain mapping for URL parameters
const DOMAIN_MAPPING = {
  'vehicles': 'Vehicle',
  'properties': 'Property',
  'employments': 'Employment',
  'services': 'Services',
  'finance': 'Finance'
};

// Default record types available
const DEFAULT_RECORD_TYPES = [
  'Contact',
  'ServiceHistory',
  'Finance',
  'Insurance',
  'Government',
  'Pension'
];

/**
 * GET /api/admin/domain-config
 * List all domain configurations for all domains
 * Returns default configuration if no custom config exists for a domain
 */
router.get('/domain-config', requireAdmin, async (req, res) => {
  try {
    const allDomains = ['Vehicle', 'Property', 'Employment', 'Services', 'Finance'];

    // Fetch all existing configs
    const existingConfigs = await DomainConfig.find({});

    // Create a map for quick lookup
    const configMap = {};
    existingConfigs.forEach(config => {
      configMap[config.domainType] = config;
    });

    // Build response array with defaults for missing configs
    const configs = allDomains.map(domainType => {
      if (configMap[domainType]) {
        return {
          domainType: configMap[domainType].domainType,
          allowedRecordTypes: configMap[domainType].allowedRecordTypes,
          customRecordTypes: configMap[domainType].customRecordTypes || [],
          updatedAt: configMap[domainType].updatedAt
        };
      } else {
        // Return default configuration
        return {
          domainType,
          allowedRecordTypes: [...DEFAULT_RECORD_TYPES],
          customRecordTypes: [],
          updatedAt: null
        };
      }
    });

    res.json(configs);
  } catch (error) {
    console.error('Error fetching domain configs:', error);
    res.status(500).json({ error: 'Failed to fetch domain configurations' });
  }
});

/**
 * PUT /api/admin/domain-config/:domain
 * Update domain configuration (allowed record types)
 */
router.put('/domain-config/:domain', requireAdmin, async (req, res) => {
  try {
    const { domain } = req.params;
    const { allowedRecordTypes } = req.body;

    // Validate domain parameter
    const domainType = DOMAIN_MAPPING[domain];
    if (!domainType) {
      return res.status(400).json({
        error: 'Invalid domain parameter',
        validDomains: Object.keys(DOMAIN_MAPPING)
      });
    }

    // Validate allowedRecordTypes
    if (!Array.isArray(allowedRecordTypes)) {
      return res.status(400).json({ error: 'allowedRecordTypes must be an array' });
    }

    // Validate each record type
    const validRecordTypes = [...DEFAULT_RECORD_TYPES];
    const invalidTypes = allowedRecordTypes.filter(type => !validRecordTypes.includes(type));
    if (invalidTypes.length > 0) {
      return res.status(400).json({
        error: 'Invalid record types',
        invalidTypes,
        validTypes: validRecordTypes
      });
    }

    // Update or create domain config (upsert)
    const updatedConfig = await DomainConfig.findOneAndUpdate(
      { domainType },
      {
        domainType,
        allowedRecordTypes,
        updatedAt: new Date()
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.json({
      domainType: updatedConfig.domainType,
      allowedRecordTypes: updatedConfig.allowedRecordTypes,
      customRecordTypes: updatedConfig.customRecordTypes || [],
      updatedAt: updatedConfig.updatedAt
    });
  } catch (error) {
    console.error('Error updating domain config:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.message
      });
    }

    res.status(500).json({ error: 'Failed to update domain configuration' });
  }
});

/**
 * POST /api/admin/domain-config/record-types
 * Create custom record type and add to all domain configs
 */
router.post('/domain-config/record-types', requireAdmin, async (req, res) => {
  try {
    const { name, icon, color, description, requiredFields } = req.body;

    // Validate required fields
    if (!name || !icon || !color || !description) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'icon', 'color', 'description']
      });
    }

    // Validate name format (alphanumeric, spaces, hyphens only)
    if (!/^[a-zA-Z0-9\s-]+$/.test(name)) {
      return res.status(400).json({
        error: 'Invalid name format',
        details: 'Name must contain only letters, numbers, spaces, and hyphens'
      });
    }

    // Validate color is hex format
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({
        error: 'Invalid color format',
        details: 'Color must be a valid hex color (e.g., #10b981)'
      });
    }

    // Check for uniqueness across default and custom record types
    const allDomainConfigs = await DomainConfig.find({});
    const existingCustomTypes = allDomainConfigs.flatMap(config =>
      (config.customRecordTypes || []).map(rt => rt.name)
    );

    if (DEFAULT_RECORD_TYPES.includes(name) || existingCustomTypes.includes(name)) {
      return res.status(400).json({
        error: 'Record type name already exists',
        details: `A record type with name "${name}" already exists`
      });
    }

    // Create custom record type object
    const customRecordType = {
      name,
      icon,
      color,
      description,
      requiredFields: requiredFields || []
    };

    // Add to all existing domain configs
    const allDomains = ['Vehicle', 'Property', 'Employment', 'Services', 'Finance'];

    for (const domainType of allDomains) {
      await DomainConfig.findOneAndUpdate(
        { domainType },
        {
          $addToSet: { customRecordTypes: customRecordType },
          updatedAt: new Date()
        },
        { upsert: true }
      );
    }

    res.status(201).json({
      message: 'Custom record type created successfully',
      customRecordType
    });
  } catch (error) {
    console.error('Error creating custom record type:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.message
      });
    }

    res.status(500).json({ error: 'Failed to create custom record type' });
  }
});

module.exports = router;
