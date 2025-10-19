// tests/api/admin/domainConfig.test.js
// Epic 6 - Story 1.4 - Admin Domain Config API Tests

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../../src/models/user');
const DomainConfig = require('../../../src/models/DomainConfig');
const domainConfigRouter = require('../../../src/routes/admin/domainConfig');

describe('Admin Domain Config API (Story 1.4)', () => {
  let app, adminUser, regularUser;

  beforeAll(async () => {
    app = express();
    app.use(express.json());

    // Mock authentication middleware with role check
    app.use((req, res, next) => {
      const userId = req.headers['test-user-id'];
      const userRole = req.headers['test-user-role'] || 'user';

      if (!userId) {
        // Default to admin user for most tests
        req.user = adminUser || {
          _id: new mongoose.Types.ObjectId(),
          role: 'admin',
          approved: true
        };
      } else {
        req.user = {
          _id: new mongoose.Types.ObjectId(userId),
          role: userRole,
          approved: true
        };
      }

      req.isAuthenticated = () => true;
      next();
    });

    app.use('/api/admin', domainConfigRouter);
  });

  beforeEach(async () => {
    // Create test users
    adminUser = new User({
      googleId: 'admin123',
      displayName: 'Admin User',
      email: 'admin@example.com',
      approved: true,
      role: 'admin'
    });
    await adminUser.save();

    regularUser = new User({
      googleId: 'user123',
      displayName: 'Regular User',
      email: 'user@example.com',
      approved: true,
      role: 'user'
    });
    await regularUser.save();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await DomainConfig.deleteMany({});
  });

  describe('GET /api/admin/domain-config - List All Domain Configurations', () => {
    it('should return default configuration for all 5 domains when no configs exist', async () => {
      const res = await request(app)
        .get('/api/admin/domain-config')
        .expect(200);

      expect(res.body).toHaveLength(5);
      expect(res.body.map(c => c.domainType).sort()).toEqual([
        'Employment',
        'Finance',
        'Property',
        'Services',
        'Vehicle'
      ]);

      // Check default configuration structure
      res.body.forEach(config => {
        expect(config.domainType).toBeDefined();
        expect(config.allowedRecordTypes).toEqual([
          'Contact',
          'ServiceHistory',
          'Finance',
          'Insurance',
          'Government',
          'Pension'
        ]);
        expect(config.customRecordTypes).toEqual([]);
        expect(config.updatedAt).toBeNull();
      });
    });

    it('should return existing configuration when configs exist', async () => {
      // Create a custom config for Vehicle domain
      await DomainConfig.create({
        domainType: 'Vehicle',
        allowedRecordTypes: ['Contact', 'Finance', 'Insurance', 'Government'],
        customRecordTypes: []
      });

      const res = await request(app)
        .get('/api/admin/domain-config')
        .expect(200);

      expect(res.body).toHaveLength(5);

      const vehicleConfig = res.body.find(c => c.domainType === 'Vehicle');
      expect(vehicleConfig.allowedRecordTypes).toEqual([
        'Contact',
        'Finance',
        'Insurance',
        'Government'
      ]);
      expect(vehicleConfig.updatedAt).toBeDefined();

      // Other domains should have default config
      const propertyConfig = res.body.find(c => c.domainType === 'Property');
      expect(propertyConfig.allowedRecordTypes).toHaveLength(6);
      expect(propertyConfig.updatedAt).toBeNull();
    });

    it('should include custom record types in response', async () => {
      await DomainConfig.create({
        domainType: 'Vehicle',
        allowedRecordTypes: ['Contact', 'Finance'],
        customRecordTypes: [
          {
            name: 'Warranty',
            icon: 'shield-check',
            color: '#10b981',
            description: 'Extended warranty plans',
            requiredFields: ['provider', 'policyNumber']
          }
        ]
      });

      const res = await request(app)
        .get('/api/admin/domain-config')
        .expect(200);

      const vehicleConfig = res.body.find(c => c.domainType === 'Vehicle');
      expect(vehicleConfig.customRecordTypes).toHaveLength(1);
      expect(vehicleConfig.customRecordTypes[0].name).toBe('Warranty');
      expect(vehicleConfig.customRecordTypes[0].icon).toBe('shield-check');
    });
  });

  describe('PUT /api/admin/domain-config/:domain - Update Domain Configuration', () => {
    it('should update domain configuration with valid data', async () => {
      const res = await request(app)
        .put('/api/admin/domain-config/vehicles')
        .send({
          allowedRecordTypes: ['Contact', 'ServiceHistory', 'Finance', 'Insurance', 'Government']
        })
        .expect(200);

      expect(res.body.domainType).toBe('Vehicle');
      expect(res.body.allowedRecordTypes).toEqual([
        'Contact',
        'ServiceHistory',
        'Finance',
        'Insurance',
        'Government'
      ]);
      expect(res.body.customRecordTypes).toEqual([]);
      expect(res.body.updatedAt).toBeDefined();

      // Verify in database
      const config = await DomainConfig.findOne({ domainType: 'Vehicle' });
      expect(config).not.toBeNull();
      expect(config.allowedRecordTypes).toHaveLength(5);
    });

    it('should create new config if none exists (upsert)', async () => {
      const res = await request(app)
        .put('/api/admin/domain-config/properties')
        .send({
          allowedRecordTypes: ['Contact', 'Finance', 'Insurance', 'Government']
        })
        .expect(200);

      expect(res.body.domainType).toBe('Property');
      expect(res.body.allowedRecordTypes).toHaveLength(4);

      // Verify created in database
      const config = await DomainConfig.findOne({ domainType: 'Property' });
      expect(config).not.toBeNull();
    });

    it('should reject invalid domain parameter', async () => {
      const res = await request(app)
        .put('/api/admin/domain-config/invalid')
        .send({ allowedRecordTypes: ['Contact'] })
        .expect(400);

      expect(res.body.error).toContain('Invalid domain parameter');
      expect(res.body.validDomains).toContain('vehicles');
      expect(res.body.validDomains).toContain('properties');
    });

    it('should reject non-array allowedRecordTypes', async () => {
      const res = await request(app)
        .put('/api/admin/domain-config/vehicles')
        .send({ allowedRecordTypes: 'Contact' })
        .expect(400);

      expect(res.body.error).toContain('must be an array');
    });

    it('should reject invalid record types', async () => {
      const res = await request(app)
        .put('/api/admin/domain-config/vehicles')
        .send({
          allowedRecordTypes: ['Contact', 'InvalidType', 'Finance']
        })
        .expect(400);

      expect(res.body.error).toContain('Invalid record types');
      expect(res.body.invalidTypes).toContain('InvalidType');
      expect(res.body.validTypes).toContain('Contact');
    });

    it('should allow empty allowedRecordTypes array', async () => {
      const res = await request(app)
        .put('/api/admin/domain-config/services')
        .send({ allowedRecordTypes: [] })
        .expect(200);

      expect(res.body.allowedRecordTypes).toEqual([]);
    });

    it('should update all 5 domains independently', async () => {
      const domains = [
        { url: 'vehicles', types: ['Contact', 'Finance'] },
        { url: 'properties', types: ['Contact', 'Government'] },
        { url: 'employments', types: ['Contact', 'Pension'] },
        { url: 'services', types: ['Contact', 'ServiceHistory'] },
        { url: 'finance', types: ['Contact'] }
      ];

      for (const domain of domains) {
        await request(app)
          .put(`/api/admin/domain-config/${domain.url}`)
          .send({ allowedRecordTypes: domain.types })
          .expect(200);
      }

      // Verify all configs in database
      const configs = await DomainConfig.find({});
      expect(configs).toHaveLength(5);
    });
  });

  describe('POST /api/admin/domain-config/record-types - Create Custom Record Type', () => {
    it('should create custom record type with valid data', async () => {
      const customType = {
        name: 'Warranty',
        icon: 'shield-check',
        color: '#10b981',
        description: 'Extended warranty and protection plans',
        requiredFields: ['provider', 'policyNumber', 'renewalDate']
      };

      const res = await request(app)
        .post('/api/admin/domain-config/record-types')
        .send(customType)
        .expect(201);

      expect(res.body.message).toContain('created successfully');
      expect(res.body.customRecordType.name).toBe('Warranty');
      expect(res.body.customRecordType.icon).toBe('shield-check');

      // Verify added to all domain configs
      const configs = await DomainConfig.find({});
      expect(configs.length).toBeGreaterThan(0);
      configs.forEach(config => {
        const warranty = config.customRecordTypes.find(rt => rt.name === 'Warranty');
        expect(warranty).toBeDefined();
        expect(warranty.color).toBe('#10b981');
      });
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/admin/domain-config/record-types')
        .send({
          name: 'Warranty',
          icon: 'shield-check'
          // Missing color and description
        })
        .expect(400);

      expect(res.body.error).toContain('Missing required fields');
      expect(res.body.required).toContain('color');
      expect(res.body.required).toContain('description');
    });

    it('should reject invalid name format', async () => {
      const res = await request(app)
        .post('/api/admin/domain-config/record-types')
        .send({
          name: 'Invalid@Name!',
          icon: 'shield',
          color: '#10b981',
          description: 'Test'
        })
        .expect(400);

      expect(res.body.error).toContain('Invalid name format');
    });

    it('should reject invalid color format', async () => {
      const res = await request(app)
        .post('/api/admin/domain-config/record-types')
        .send({
          name: 'Warranty',
          icon: 'shield',
          color: 'red',
          description: 'Test'
        })
        .expect(400);

      expect(res.body.error).toContain('Invalid color format');
      expect(res.body.details).toContain('hex color');
    });

    it('should reject duplicate default record type name', async () => {
      const res = await request(app)
        .post('/api/admin/domain-config/record-types')
        .send({
          name: 'Contact',
          icon: 'phone',
          color: '#10b981',
          description: 'Duplicate of default type'
        })
        .expect(400);

      expect(res.body.error).toContain('already exists');
    });

    it('should reject duplicate custom record type name', async () => {
      // Create first custom type
      await request(app)
        .post('/api/admin/domain-config/record-types')
        .send({
          name: 'Warranty',
          icon: 'shield',
          color: '#10b981',
          description: 'Warranties'
        })
        .expect(201);

      // Try to create duplicate
      const res = await request(app)
        .post('/api/admin/domain-config/record-types')
        .send({
          name: 'Warranty',
          icon: 'shield-check',
          color: '#ff0000',
          description: 'Duplicate'
        })
        .expect(400);

      expect(res.body.error).toContain('already exists');
    });

    it('should allow custom type without requiredFields', async () => {
      const res = await request(app)
        .post('/api/admin/domain-config/record-types')
        .send({
          name: 'Notes',
          icon: 'file-text',
          color: '#6366f1',
          description: 'General notes'
        })
        .expect(201);

      expect(res.body.customRecordType.requiredFields).toEqual([]);
    });

    it('should accept valid hex color variations', async () => {
      const colors = ['#10b981', '#FF0000', '#abc123'];

      for (let i = 0; i < colors.length; i++) {
        const res = await request(app)
          .post('/api/admin/domain-config/record-types')
          .send({
            name: `Type${i}`,
            icon: 'file',
            color: colors[i],
            description: 'Test'
          })
          .expect(201);

        expect(res.body.customRecordType.color).toBe(colors[i]);
      }
    });
  });

  describe('Admin Role Enforcement', () => {
    it('should allow admin user to access GET endpoint', async () => {
      const res = await request(app)
        .get('/api/admin/domain-config')
        .set('test-user-id', adminUser._id.toString())
        .set('test-user-role', 'admin')
        .expect(200);

      expect(res.body).toHaveLength(5);
    });

    it('should reject non-admin user on GET endpoint', async () => {
      const res = await request(app)
        .get('/api/admin/domain-config')
        .set('test-user-id', regularUser._id.toString())
        .set('test-user-role', 'user')
        .expect(403);

      expect(res.body.error).toContain('Admin access required');
    });

    it('should reject non-admin user on PUT endpoint', async () => {
      const res = await request(app)
        .put('/api/admin/domain-config/vehicles')
        .set('test-user-id', regularUser._id.toString())
        .set('test-user-role', 'user')
        .send({ allowedRecordTypes: ['Contact'] })
        .expect(403);

      expect(res.body.error).toContain('Admin access required');
    });

    it('should reject non-admin user on POST endpoint', async () => {
      const res = await request(app)
        .post('/api/admin/domain-config/record-types')
        .set('test-user-id', regularUser._id.toString())
        .set('test-user-role', 'user')
        .send({
          name: 'Warranty',
          icon: 'shield',
          color: '#10b981',
          description: 'Test'
        })
        .expect(403);

      expect(res.body.error).toContain('Admin access required');
    });
  });

  describe('Integration Tests', () => {
    it('should maintain custom record types when updating domain config', async () => {
      // Create custom record type
      await request(app)
        .post('/api/admin/domain-config/record-types')
        .send({
          name: 'Warranty',
          icon: 'shield',
          color: '#10b981',
          description: 'Warranties'
        })
        .expect(201);

      // Update Vehicle domain config
      await request(app)
        .put('/api/admin/domain-config/vehicles')
        .send({ allowedRecordTypes: ['Contact', 'Finance'] })
        .expect(200);

      // Verify custom record type still exists
      const res = await request(app)
        .get('/api/admin/domain-config')
        .expect(200);

      const vehicleConfig = res.body.find(c => c.domainType === 'Vehicle');
      expect(vehicleConfig.customRecordTypes).toHaveLength(1);
      expect(vehicleConfig.customRecordTypes[0].name).toBe('Warranty');
    });

    it('should handle multiple custom record types', async () => {
      const customTypes = [
        { name: 'Warranty', icon: 'shield', color: '#10b981', description: 'Warranties' },
        { name: 'Maintenance', icon: 'wrench', color: '#f59e0b', description: 'Maintenance records' },
        { name: 'Notes', icon: 'file-text', color: '#6366f1', description: 'General notes' }
      ];

      for (const type of customTypes) {
        await request(app)
          .post('/api/admin/domain-config/record-types')
          .send(type)
          .expect(201);
      }

      const res = await request(app)
        .get('/api/admin/domain-config')
        .expect(200);

      res.body.forEach(config => {
        expect(config.customRecordTypes).toHaveLength(3);
      });
    });
  });
});
