// src/routes/renewals.js
// Renewal Dashboard API - Cross-domain renewal aggregation

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

/**
 * GET /api/renewals/summary
 * Returns renewal counts by time period (overdue, next 7 days, next 30 days)
 */
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const summary = {
      overdue: 0,
      next7Days: 0,
      next30Days: 0,
      total: 0
    };

    // Aggregate from all domains
    for (const [domain, Model] of Object.entries(DOMAIN_MODELS)) {
      const overdueCount = await Model.countDocuments({
        user: userId,
        renewalDate: { $lt: now, $ne: null }
      });

      const next7DaysCount = await Model.countDocuments({
        user: userId,
        renewalDate: { $gte: now, $lte: next7Days }
      });

      const next30DaysCount = await Model.countDocuments({
        user: userId,
        renewalDate: { $gt: next7Days, $lte: next30Days }
      });

      summary.overdue += overdueCount;
      summary.next7Days += next7DaysCount;
      summary.next30Days += next30DaysCount;
    }

    summary.total = summary.overdue + summary.next7Days + summary.next30Days;

    res.json(summary);
  } catch (error) {
    console.error('Error fetching renewal summary:', error);
    res.status(500).json({ error: 'Failed to fetch renewal summary' });
  }
});

/**
 * GET /api/renewals/timeline
 * Returns all renewals with optional filtering by domain, priority, date range
 * Query params:
 *   - domain: Filter by specific domain (property, vehicles, etc.)
 *   - priority: Filter by priority (Critical, Important, Standard)
 *   - from: Start date filter (ISO string)
 *   - to: End date filter (ISO string)
 */
router.get('/timeline', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { domain, priority, from, to } = req.query;

    const renewals = [];

    // Build query filters
    const baseQuery = { user: userId, renewalDate: { $ne: null } };

    if (priority) {
      baseQuery.priority = priority;
    }

    if (from || to) {
      baseQuery.renewalDate = { $ne: null };
      if (from) baseQuery.renewalDate.$gte = new Date(from);
      if (to) baseQuery.renewalDate.$lte = new Date(to);
    }

    // Filter by domain or query all domains
    const domainsToQuery = domain ? [domain] : Object.keys(DOMAIN_MODELS);

    for (const domainName of domainsToQuery) {
      const Model = DOMAIN_MODELS[domainName];
      if (!Model) continue;

      const records = await Model.find(baseQuery)
        .select('name recordType renewalDate priority createdAt')
        .sort({ renewalDate: 1 });

      records.forEach((record) => {
        renewals.push({
          id: record._id,
          domain: domainName,
          name: record.name,
          recordType: record.recordType,
          renewalDate: record.renewalDate,
          priority: record.priority,
          domainUrl: `/${domainName}/${record._id}`
        });
      });
    }

    // Sort by renewal date
    renewals.sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate));

    res.json({ renewals });
  } catch (error) {
    console.error('Error fetching renewal timeline:', error);
    res.status(500).json({ error: 'Failed to fetch renewal timeline' });
  }
});

module.exports = router;
