// tests/api/domains.test.js
// Story 1.1 - Domain Records API Tests

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const PropertyRecord = require('../../src/models/domain/PropertyRecord');
const VehicleRecord = require('../../src/models/domain/VehicleRecord');
const FinanceRecord = require('../../src/models/domain/FinanceRecord');
const domainsRouter = require('../../src/routes/domains');

describe('Domains API (Story 1.1)', () => {
  let app, testUser, otherUser;

  beforeAll(async () => {
    app = express();
    app.use(express.json());

    // Mock authentication middleware
    app.use((req, res, next) => {
      req.isAuthenticated = () => true;
      req.user = req.headers['test-user-id']
        ? { _id: new mongoose.Types.ObjectId(req.headers['test-user-id']), approved: true }
        : testUser;
      next();
    });

    app.use('/api/domains', domainsRouter);
  });

  beforeEach(async () => {
    // Create test users
    testUser = new User({
      googleId: 'test123',
      displayName: 'Test User',
      email: 'test@example.com',
      approved: true,
      role: 'user'
    });
    await testUser.save();

    otherUser = new User({
      googleId: 'other123',
      displayName: 'Other User',
      email: 'other@example.com',
      approved: true,
      role: 'user'
    });
    await otherUser.save();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await PropertyRecord.deleteMany({});
    await VehicleRecord.deleteMany({});
    await FinanceRecord.deleteMany({});
  });

  describe('Domain Validation', () => {
    it('should reject invalid domain names', async () => {
      const res = await request(app)
        .get('/api/domains/invalid/records')
        .expect(400);

      expect(res.body.error).toContain('Invalid domain');
      expect(res.body.validDomains).toBeDefined();
    });

    it('should accept valid domain names (case-insensitive)', async () => {
      const res = await request(app)
        .get('/api/domains/PROPERTY/records')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should accept all 8 valid domains', async () => {
      const validDomains = ['property', 'vehicles', 'employment', 'government', 'finance', 'insurance', 'legal', 'services'];

      for (const domain of validDomains) {
        const res = await request(app)
          .get(`/api/domains/${domain}/records`)
          .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
      }
    });
  });

  describe('CREATE - POST /api/domains/:domain/records', () => {
    it('should create a Property record with common fields', async () => {
      const propertyData = {
        name: 'Home Electric Bill',
        recordType: 'utility-electric',
        provider: 'NIE Networks',
        accountNumber: '123456789',
        monthlyAmount: 85,
        renewalDate: '2025-12-01',
        priority: 'Important'
      };

      const res = await request(app)
        .post('/api/domains/property/records')
        .send(propertyData)
        .expect(201);

      expect(res.body.name).toBe(propertyData.name);
      expect(res.body.recordType).toBe(propertyData.recordType);
      expect(res.body.priority).toBe('Important');
      expect(res.body.user.toString()).toBe(testUser._id.toString());
      expect(res.body.documentIds).toEqual([]);
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
    });

    it('should create a Finance record with UK banking fields', async () => {
      const financeData = {
        name: 'HSBC Current Account',
        accountType: 'current',
        institution: 'HSBC',
        sortCode: '40-47-84',
        accountNumber: '12345678',
        balance: 2500,
        priority: 'Critical'
      };

      const res = await request(app)
        .post('/api/domains/finance/records')
        .send(financeData)
        .expect(201);

      expect(res.body.name).toBe(financeData.name);
      expect(res.body.accountType).toBe('current');
      expect(res.body.sortCode).toBe('40-47-84');
      expect(res.body.user.toString()).toBe(testUser._id.toString());
    });

    it('should create a Vehicle record with MOT dates', async () => {
      const vehicleData = {
        name: 'Family Car',
        recordType: 'vehicle-details',
        registration: 'AB12 CDE',
        make: 'Toyota',
        model: 'Corolla',
        motExpiryDate: '2025-06-15',
        insuranceRenewalDate: '2025-08-01',
        roadTaxExpiryDate: '2025-12-31'
      };

      const res = await request(app)
        .post('/api/domains/vehicles/records')
        .send(vehicleData)
        .expect(201);

      expect(res.body.registration).toBe(vehicleData.registration);
      expect(res.body.make).toBe('Toyota');
      expect(new Date(res.body.motExpiryDate)).toEqual(new Date('2025-06-15'));
    });

    it('should require name field', async () => {
      const res = await request(app)
        .post('/api/domains/property/records')
        .send({ recordType: 'utility-electric' })
        .expect(400);

      expect(res.body.error).toContain('name');
    });

    it('should require recordType field for Property', async () => {
      const res = await request(app)
        .post('/api/domains/property/records')
        .send({ name: 'Test Property' })
        .expect(400);

      expect(res.body.error).toContain('recordType');
    });

    it('should default priority to Standard if not provided', async () => {
      const res = await request(app)
        .post('/api/domains/property/records')
        .send({
          name: 'Test Property',
          recordType: 'mortgage'
        })
        .expect(201);

      expect(res.body.priority).toBe('Standard');
    });
  });

  describe('READ - GET /api/domains/:domain/records', () => {
    it('should return all records for authenticated user', async () => {
      // Create 3 property records for testUser
      await PropertyRecord.create([
        { name: 'Record 1', recordType: 'mortgage', user: testUser._id },
        { name: 'Record 2', recordType: 'utility-electric', user: testUser._id },
        { name: 'Record 3', recordType: 'council-tax', user: testUser._id }
      ]);

      const res = await request(app)
        .get('/api/domains/property/records')
        .expect(200);

      expect(res.body.length).toBe(3);
      expect(res.body.every(r => r.user.toString() === testUser._id.toString())).toBe(true);
    });

    it('should only return records for authenticated user (not other users)', async () => {
      // Create records for both users
      await PropertyRecord.create([
        { name: 'My Record', recordType: 'mortgage', user: testUser._id },
        { name: 'Other Record', recordType: 'mortgage', user: otherUser._id }
      ]);

      const res = await request(app)
        .get('/api/domains/property/records')
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('My Record');
    });

    it('should return empty array when no records exist', async () => {
      const res = await request(app)
        .get('/api/domains/finance/records')
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should return records sorted by createdAt descending', async () => {
      // Create records with slight time gaps
      const record1 = await PropertyRecord.create({
        name: 'First',
        recordType: 'mortgage',
        user: testUser._id
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const record2 = await PropertyRecord.create({
        name: 'Second',
        recordType: 'mortgage',
        user: testUser._id
      });

      const res = await request(app)
        .get('/api/domains/property/records')
        .expect(200);

      expect(res.body[0].name).toBe('Second'); // Most recent first
      expect(res.body[1].name).toBe('First');
    });
  });

  describe('READ - GET /api/domains/:domain/records/:id', () => {
    it('should return single record by ID', async () => {
      const record = await PropertyRecord.create({
        name: 'Test Property',
        recordType: 'mortgage',
        provider: 'Halifax',
        user: testUser._id
      });

      const res = await request(app)
        .get(`/api/domains/property/records/${record._id}`)
        .expect(200);

      expect(res.body.name).toBe('Test Property');
      expect(res.body.provider).toBe('Halifax');
    });

    it('should return 404 for non-existent record', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/domains/property/records/${fakeId}`)
        .expect(404);

      expect(res.body.error).toContain('not found');
    });

    it('should return 404 when trying to access other user\'s record', async () => {
      const otherRecord = await PropertyRecord.create({
        name: 'Other User Record',
        recordType: 'mortgage',
        user: otherUser._id
      });

      const res = await request(app)
        .get(`/api/domains/property/records/${otherRecord._id}`)
        .expect(404);

      expect(res.body.error).toContain('not found');
    });
  });

  describe('UPDATE - PUT /api/domains/:domain/records/:id', () => {
    it('should update record fields', async () => {
      const record = await PropertyRecord.create({
        name: 'Old Name',
        recordType: 'mortgage',
        provider: 'Old Provider',
        monthlyAmount: 500,
        user: testUser._id
      });

      const updates = {
        name: 'New Name',
        provider: 'New Provider',
        monthlyAmount: 750
      };

      const res = await request(app)
        .put(`/api/domains/property/records/${record._id}`)
        .send(updates)
        .expect(200);

      expect(res.body.name).toBe('New Name');
      expect(res.body.provider).toBe('New Provider');
      expect(res.body.monthlyAmount).toBe(750);
    });

    it('should not allow changing user ownership', async () => {
      const record = await PropertyRecord.create({
        name: 'Test Record',
        recordType: 'mortgage',
        user: testUser._id
      });

      const maliciousUpdate = {
        name: 'Updated Name',
        user: otherUser._id // Trying to change ownership
      };

      const res = await request(app)
        .put(`/api/domains/property/records/${record._id}`)
        .send(maliciousUpdate)
        .expect(200);

      // User should still be testUser
      expect(res.body.user.toString()).toBe(testUser._id.toString());
      expect(res.body.name).toBe('Updated Name');
    });

    it('should return 404 when updating non-existent record', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/domains/property/records/${fakeId}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(res.body.error).toContain('not found');
    });

    it('should return 404 when trying to update other user\'s record', async () => {
      const otherRecord = await PropertyRecord.create({
        name: 'Other User Record',
        recordType: 'mortgage',
        user: otherUser._id
      });

      const res = await request(app)
        .put(`/api/domains/property/records/${otherRecord._id}`)
        .send({ name: 'Hacked' })
        .expect(404);

      expect(res.body.error).toContain('not found');
    });

    it('should run validators on update', async () => {
      const record = await PropertyRecord.create({
        name: 'Test',
        recordType: 'mortgage',
        user: testUser._id
      });

      const res = await request(app)
        .put(`/api/domains/property/records/${record._id}`)
        .send({ priority: 'InvalidPriority' })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('DELETE - DELETE /api/domains/:domain/records/:id', () => {
    it('should delete record', async () => {
      const record = await PropertyRecord.create({
        name: 'To Delete',
        recordType: 'mortgage',
        user: testUser._id
      });

      const res = await request(app)
        .delete(`/api/domains/property/records/${record._id}`)
        .expect(200);

      expect(res.body.message).toContain('deleted successfully');
      expect(res.body.deletedRecord.name).toBe('To Delete');

      // Verify record is gone
      const check = await PropertyRecord.findById(record._id);
      expect(check).toBeNull();
    });

    it('should return 404 when deleting non-existent record', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/domains/property/records/${fakeId}`)
        .expect(404);

      expect(res.body.error).toContain('not found');
    });

    it('should return 404 when trying to delete other user\'s record', async () => {
      const otherRecord = await PropertyRecord.create({
        name: 'Other User Record',
        recordType: 'mortgage',
        user: otherUser._id
      });

      const res = await request(app)
        .delete(`/api/domains/property/records/${otherRecord._id}`)
        .expect(404);

      expect(res.body.error).toContain('not found');

      // Verify record still exists
      const check = await PropertyRecord.findById(otherRecord._id);
      expect(check).not.toBeNull();
    });
  });

  describe('Multi-User Isolation', () => {
    it('should maintain complete data isolation between users', async () => {
      // Create records for both users
      await PropertyRecord.create([
        { name: 'User1 Property 1', recordType: 'mortgage', user: testUser._id },
        { name: 'User1 Property 2', recordType: 'utility-electric', user: testUser._id },
        { name: 'User2 Property 1', recordType: 'mortgage', user: otherUser._id },
        { name: 'User2 Property 2', recordType: 'council-tax', user: otherUser._id }
      ]);

      // Get records as testUser
      const testUserRecords = await request(app)
        .get('/api/domains/property/records')
        .expect(200);

      expect(testUserRecords.body.length).toBe(2);
      expect(testUserRecords.body.every(r => r.name.startsWith('User1'))).toBe(true);

      // Get records as otherUser
      const otherUserRecords = await request(app)
        .get('/api/domains/property/records')
        .set('test-user-id', otherUser._id.toString())
        .expect(200);

      expect(otherUserRecords.body.length).toBe(2);
      expect(otherUserRecords.body.every(r => r.name.startsWith('User2'))).toBe(true);
    });
  });
});
