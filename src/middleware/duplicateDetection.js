/**
 * Duplicate Detection Middleware
 * Prevents duplicate records based on domain-specific unique constraints
 */

/**
 * Check for duplicate Finance records (account number + sort code)
 */
const checkDuplicateFinanceRecord = async (req, res, next) => {
  try {
    const { accountNumber, sortCode } = req.body;
    const FinanceRecord = require('../models/domain/FinanceRecord');

    if (accountNumber && sortCode) {
      // When updating, exclude current record from duplicate check
      const query = {
        user: req.user._id,
        accountNumber,
        sortCode
      };

      if (req.params.id) {
        query._id = { $ne: req.params.id };
      }

      const existing = await FinanceRecord.findOne(query);

      if (existing) {
        return res.status(409).json({
          error: 'Duplicate record found',
          message: 'An account with this account number and sort code already exists',
          existingRecord: {
            _id: existing._id,
            name: existing.name,
            accountNumber: existing.accountNumber,
            sortCode: existing.sortCode
          }
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Check for duplicate Vehicle records (registration plate)
 */
const checkDuplicateVehicleRecord = async (req, res, next) => {
  try {
    const { registration } = req.body;
    const VehicleRecord = require('../models/domain/VehicleRecord');

    if (registration) {
      const query = {
        user: req.user._id,
        registration: registration.toUpperCase().replace(/\s/g, '') // Normalize
      };

      if (req.params.id) {
        query._id = { $ne: req.params.id };
      }

      const existing = await VehicleRecord.findOne(query);

      if (existing) {
        return res.status(409).json({
          error: 'Duplicate record found',
          message: 'A vehicle with this registration plate already exists',
          existingRecord: {
            _id: existing._id,
            name: existing.name,
            registration: existing.registration
          }
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Check for duplicate Insurance records (policy number + provider)
 */
const checkDuplicateInsuranceRecord = async (req, res, next) => {
  try {
    const { policyNumber, provider } = req.body;
    const InsuranceRecord = require('../models/domain/InsuranceRecord');

    if (policyNumber && provider) {
      const query = {
        user: req.user._id,
        policyNumber,
        provider
      };

      if (req.params.id) {
        query._id = { $ne: req.params.id };
      }

      const existing = await InsuranceRecord.findOne(query);

      if (existing) {
        return res.status(409).json({
          error: 'Duplicate record found',
          message: 'A policy with this policy number and provider already exists',
          existingRecord: {
            _id: existing._id,
            name: existing.name,
            policyNumber: existing.policyNumber,
            provider: existing.provider
          }
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Check for duplicate Property records (postcode + address)
 */
const checkDuplicatePropertyRecord = async (req, res, next) => {
  try {
    const { postcode, address } = req.body;
    const PropertyRecord = require('../models/domain/PropertyRecord');

    if (postcode && address) {
      const query = {
        user: req.user._id,
        postcode: postcode.toUpperCase().replace(/\s/g, ''), // Normalize
        address
      };

      if (req.params.id) {
        query._id = { $ne: req.params.id };
      }

      const existing = await PropertyRecord.findOne(query);

      if (existing) {
        return res.status(409).json({
          error: 'Duplicate record found',
          message: 'A property with this postcode and address already exists',
          existingRecord: {
            _id: existing._id,
            name: existing.name,
            address: existing.address,
            postcode: existing.postcode
          }
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get domain-specific duplicate checker
 * @param {string} domain - Domain name
 * @returns {Function} - Duplicate detection middleware function
 */
const getDuplicateChecker = (domain) => {
  const checkerMap = {
    finance: checkDuplicateFinanceRecord,
    vehicles: checkDuplicateVehicleRecord,
    insurance: checkDuplicateInsuranceRecord,
    property: checkDuplicatePropertyRecord,
    employment: (req, res, next) => next(), // No duplicate check
    government: (req, res, next) => next(), // No duplicate check
    legal: (req, res, next) => next(), // No duplicate check
    services: (req, res, next) => next() // No duplicate check
  };

  return checkerMap[domain] || ((req, res, next) => next());
};

module.exports = {
  checkDuplicateFinanceRecord,
  checkDuplicateVehicleRecord,
  checkDuplicateInsuranceRecord,
  checkDuplicatePropertyRecord,
  getDuplicateChecker
};
