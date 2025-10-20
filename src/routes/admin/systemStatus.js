const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../middleware/auth');
const DomainConfig = require('../../models/DomainConfig');
const ParentEntity = require('../../models/ParentEntity');
const ChildRecord = require('../../models/ChildRecord');
const User = require('../../models/user');
const mongoose = require('mongoose');

/**
 * GET /api/admin/system-status
 * Returns comprehensive system status including:
 * - Database connection status
 * - Collection statistics
 * - Domain configuration status
 * - Parent entity counts per domain
 * - Child record counts per type
 * - User statistics
 */
router.get('/system-status', requireAdmin, async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      database: {},
      collections: {},
      domainConfigs: {},
      parentEntities: {},
      childRecords: {},
      users: {}
    };

    // Database connection status
    status.database = {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      readyStateLabel: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Collection statistics
    for (const collectionName of collectionNames) {
      const collection = mongoose.connection.db.collection(collectionName);
      const count = await collection.countDocuments();
      status.collections[collectionName] = count;
    }

    // Domain configuration status
    const domainConfigs = await DomainConfig.find({});
    const expectedDomains = ['Vehicle', 'Property', 'Employment', 'Services', 'Finance'];

    status.domainConfigs = {
      total: domainConfigs.length,
      expected: expectedDomains.length,
      configured: domainConfigs.map(c => c.domainType),
      missing: expectedDomains.filter(d => !domainConfigs.find(c => c.domainType === d)),
      details: domainConfigs.map(config => ({
        domainType: config.domainType,
        allowedRecordTypes: config.allowedRecordTypes,
        customRecordTypesCount: (config.customRecordTypes || []).length,
        updatedAt: config.updatedAt
      }))
    };

    // Parent entity counts per domain
    const parentEntityCounts = await ParentEntity.aggregate([
      {
        $group: {
          _id: '$domainType',
          count: { $sum: 1 }
        }
      }
    ]);

    status.parentEntities = {
      total: await ParentEntity.countDocuments(),
      byDomain: parentEntityCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    // Child record counts per type
    const childRecordCounts = await ChildRecord.aggregate([
      {
        $group: {
          _id: '$recordType',
          count: { $sum: 1 }
        }
      }
    ]);

    status.childRecords = {
      total: await ChildRecord.countDocuments(),
      byType: childRecordCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    // User statistics
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const approvedUsers = await User.countDocuments({ approved: true });

    status.users = {
      total: totalUsers,
      admins: adminUsers,
      approved: approvedUsers,
      pending: totalUsers - approvedUsers
    };

    res.json(status);
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/system-status/seed-configs
 * Seeds default domain configurations if missing
 * Returns the newly created configs
 */
router.post('/system-status/seed-configs', requireAdmin, async (req, res) => {
  try {
    // Check if configs already exist
    const existingConfigs = await DomainConfig.find({});

    if (existingConfigs.length >= 5) {
      return res.status(400).json({
        error: 'Domain configurations already exist',
        count: existingConfigs.length,
        configs: existingConfigs.map(c => c.domainType)
      });
    }

    // Seed default configs
    const configs = await DomainConfig.seedDefaultConfigs();

    res.json({
      message: 'Domain configurations seeded successfully',
      count: configs.length,
      configs: configs.map(config => ({
        domainType: config.domainType,
        allowedRecordTypes: config.allowedRecordTypes,
        customRecordTypesCount: (config.customRecordTypes || []).length
      }))
    });
  } catch (error) {
    console.error('Error seeding domain configs:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/system-status/health
 * Simple health check endpoint
 * Returns 200 OK if system is operational
 */
router.get('/system-status/health', async (req, res) => {
  try {
    const dbConnected = mongoose.connection.readyState === 1;

    if (!dbConnected) {
      return res.status(503).json({
        status: 'unhealthy',
        reason: 'Database not connected'
      });
    }

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

module.exports = router;
