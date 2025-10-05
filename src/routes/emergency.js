// src/routes/emergency.js
const express = require('express');
const router = express.Router();

// Domain models
const PropertyRecord = require('../models/domain/PropertyRecord');
const VehicleRecord = require('../models/domain/VehicleRecord');
const FinanceRecord = require('../models/domain/FinanceRecord');
const EmploymentRecord = require('../models/domain/EmploymentRecord');
const GovernmentRecord = require('../models/domain/GovernmentRecord');
const InsuranceRecord = require('../models/domain/InsuranceRecord');
const LegalRecord = require('../models/domain/LegalRecord');
const ServicesRecord = require('../models/domain/ServicesRecord');

const DOMAIN_MODELS = {
  property: PropertyRecord,
  vehicles: VehicleRecord,
  finance: FinanceRecord,
  employment: EmploymentRecord,
  government: GovernmentRecord,
  insurance: InsuranceRecord,
  legal: LegalRecord,
  services: ServicesRecord
};

// Simple auth middleware
function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// GET /api/emergency/critical - All critical priority records
router.get('/critical', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const criticalRecords = [];

    // Aggregate critical records from all domains
    for (const [domain, Model] of Object.entries(DOMAIN_MODELS)) {
      const records = await Model.find({
        user: userId,
        priority: 'Critical'
      }).select('name recordType contactPhone contactEmail priority notes createdAt updatedAt');

      records.forEach((record) => {
        criticalRecords.push({
          id: record._id,
          domain,
          name: record.name,
          recordType: record.recordType,
          contactPhone: record.contactPhone,
          contactEmail: record.contactEmail,
          priority: record.priority,
          notes: record.notes,
          domainUrl: `/${domain}/${record._id}`,
          updatedAt: record.updatedAt
        });
      });
    }

    // Sort by most recently updated
    criticalRecords.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({ criticalRecords, count: criticalRecords.length });
  } catch (error) {
    console.error('Error fetching critical records:', error);
    res.status(500).json({ error: 'Failed to fetch critical records' });
  }
});

// GET /api/emergency/checklist - Emergency preparedness checklist
router.get('/checklist', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const checklist = {};

    for (const [domain, Model] of Object.entries(DOMAIN_MODELS)) {
      const criticalCount = await Model.countDocuments({
        user: userId,
        priority: 'Critical'
      });

      checklist[domain] = {
        criticalCount,
        recommendation: criticalCount === 0 ? 'Add critical records' : 'OK'
      };
    }

    res.json({ checklist });
  } catch (error) {
    console.error('Error fetching emergency checklist:', error);
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
});

module.exports = router;
