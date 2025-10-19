// tests/api/childRecord.test.js
// Epic 6 - Story 1.3 - Child Record API Tests

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const ParentEntity = require('../../src/models/ParentEntity');
const ChildRecord = require('../../src/models/ChildRecord');
const childRecordRouter = require('../../src/routes/childRecord');

describe('Child Record API (Story 1.3)', () => {
  let app, testUser, otherUser, testVehicle, testProperty;

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

    app.use('/api/v2', childRecordRouter);
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

    // Create test parent entities
    testVehicle = await ParentEntity.create({
      userId: testUser._id,
      domainType: 'Vehicle',
      name: '2019 Honda Civic'
    });

    testProperty = await ParentEntity.create({
      userId: testUser._id,
      domainType: 'Property',
      name: '123 Main Street'
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await ParentEntity.deleteMany({});
    await ChildRecord.deleteMany({});
  });

  describe('Parent Validation', () => {
    it('should return 404 when parent entity does not exist', async () => {
      const fakeParentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/v2/vehicles/${fakeParentId}/records`)
        .expect(404);

      expect(res.body.error).toContain('Parent entity not found');
    });

    it('should return 400 for invalid parent ID format', async () => {
      const res = await request(app)
        .get('/api/v2/vehicles/invalid-id/records')
        .expect(400);

      expect(res.body.error).toContain('Invalid parent ID');
    });

    it('should return 404 when trying to access other user\'s parent', async () => {
      const otherVehicle = await ParentEntity.create({
        userId: otherUser._id,
        domainType: 'Vehicle',
        name: 'Other User Vehicle'
      });

      const res = await request(app)
        .get(`/api/v2/vehicles/${otherVehicle._id}/records`)
        .expect(404);

      expect(res.body.error).toContain('Parent entity not found');
    });

    it('should return 404 when domain type does not match parent', async () => {
      // Try to access vehicle as property
      const res = await request(app)
        .get(`/api/v2/properties/${testVehicle._id}/records`)
        .expect(404);

      expect(res.body.error).toContain('Parent entity not found');
    });
  });

  describe('LIST - GET /api/v2/:domain/:parentId/records', () => {
    beforeEach(async () => {
      // Create test child records
      await ChildRecord.create([
        {
          userId: testUser._id,
          parentId: testVehicle._id,
          recordType: 'Finance',
          name: 'Car Loan',
          amount: 15000
        },
        {
          userId: testUser._id,
          parentId: testVehicle._id,
          recordType: 'Insurance',
          name: 'Car Insurance',
          policyNumber: 'POL-123'
        },
        {
          userId: testUser._id,
          parentId: testVehicle._id,
          recordType: 'Finance',
          name: 'Extended Warranty',
          amount: 500
        }
      ]);
    });

    it('should return child records grouped by recordType', async () => {
      const res = await request(app)
        .get(`/api/v2/vehicles/${testVehicle._id}/records`)
        .expect(200);

      expect(res.body.parentId).toBe(testVehicle._id.toString());
      expect(res.body.parentName).toBe('2019 Honda Civic');
      expect(res.body.records).toBeDefined();
      expect(res.body.records.Finance).toHaveLength(2);
      expect(res.body.records.Insurance).toHaveLength(1);
      expect(res.body.records.Contact).toHaveLength(0);
      expect(res.body.total).toBe(3);
    });

    it('should return empty groups when no child records exist', async () => {
      await ChildRecord.deleteMany({});

      const res = await request(app)
        .get(`/api/v2/vehicles/${testVehicle._id}/records`)
        .expect(200);

      expect(res.body.records.Finance).toEqual([]);
      expect(res.body.records.Insurance).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    it('should filter by recordType query parameter', async () => {
      const res = await request(app)
        .get(`/api/v2/vehicles/${testVehicle._id}/records?recordType=Finance`)
        .expect(200);

      expect(res.body.records.Finance).toHaveLength(2);
      expect(res.body.records.Insurance).toHaveLength(0);
    });

    it('should support sorting by createdAt descending (default)', async () => {
      const res = await request(app)
        .get(`/api/v2/vehicles/${testVehicle._id}/records`)
        .expect(200);

      const allRecords = [
        ...res.body.records.Finance,
        ...res.body.records.Insurance
      ];

      // Check dates are in descending order
      const dates = allRecords.map(r => new Date(r.createdAt).getTime());
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });

    it('should only return records for authenticated user', async () => {
      // Create child record for other user
      await ChildRecord.create({
        userId: otherUser._id,
        parentId: testVehicle._id,
        recordType: 'Contact',
        name: 'Other User Record'
      });

      const res = await request(app)
        .get(`/api/v2/vehicles/${testVehicle._id}/records`)
        .expect(200);

      // Should not see other user's record
      expect(res.body.total).toBe(3);
      expect(res.body.records.Contact).toHaveLength(0);
    });
  });

  describe('CREATE - POST /api/v2/:domain/:parentId/records', () => {
    it('should create a new Finance child record', async () => {
      const recordData = {
        recordType: 'Finance',
        name: 'Car Loan',
        contactName: 'Finance Company',
        phone: '0800-123-4567',
        accountNumber: 'ACC-12345',
        amount: 15000,
        frequency: 'monthly'
      };

      const res = await request(app)
        .post(`/api/v2/vehicles/${testVehicle._id}/records`)
        .send(recordData)
        .expect(201);

      expect(res.body.name).toBe('Car Loan');
      expect(res.body.recordType).toBe('Finance');
      expect(res.body.parentId.toString()).toBe(testVehicle._id.toString());
      expect(res.body.userId.toString()).toBe(testUser._id.toString());
      expect(res.body.contactName).toBe('Finance Company');
      expect(res.body.amount).toBe(15000);
    });

    it('should create a Contact child record', async () => {
      const recordData = {
        recordType: 'Contact',
        name: 'Dealer Contact',
        contactName: 'John Smith',
        phone: '028-1234-5678',
        email: 'john@dealer.com'
      };

      const res = await request(app)
        .post(`/api/v2/vehicles/${testVehicle._id}/records`)
        .send(recordData)
        .expect(201);

      expect(res.body.recordType).toBe('Contact');
      expect(res.body.phone).toBe('028-1234-5678');
    });

    it('should create an Insurance child record with renewal date', async () => {
      const recordData = {
        recordType: 'Insurance',
        name: 'Car Insurance',
        provider: 'Direct Line',
        policyNumber: 'POL-123456',
        renewalDate: '2025-06-15',
        amount: 850
      };

      const res = await request(app)
        .post(`/api/v2/vehicles/${testVehicle._id}/records`)
        .send(recordData)
        .expect(201);

      expect(res.body.recordType).toBe('Insurance');
      expect(res.body.policyNumber).toBe('POL-123456');
      expect(new Date(res.body.renewalDate)).toEqual(new Date('2025-06-15'));
    });

    it('should create child record for all valid record types', async () => {
      const recordTypes = ['Contact', 'ServiceHistory', 'Finance', 'Insurance', 'Government', 'Pension'];

      for (const recordType of recordTypes) {
        const res = await request(app)
          .post(`/api/v2/vehicles/${testVehicle._id}/records`)
          .send({
            recordType,
            name: `Test ${recordType} Record`
          })
          .expect(201);

        expect(res.body.recordType).toBe(recordType);
      }
    });

    it('should require recordType field', async () => {
      const res = await request(app)
        .post(`/api/v2/vehicles/${testVehicle._id}/records`)
        .send({ name: 'Test Record' })
        .expect(400);

      expect(res.body.error).toContain('Record type is required');
    });

    it('should require name field', async () => {
      const res = await request(app)
        .post(`/api/v2/vehicles/${testVehicle._id}/records`)
        .send({ recordType: 'Finance' })
        .expect(400);

      expect(res.body.error).toContain('Name is required');
    });

    it('should reject invalid recordType', async () => {
      const res = await request(app)
        .post(`/api/v2/vehicles/${testVehicle._id}/records`)
        .send({
          recordType: 'InvalidType',
          name: 'Test Record'
        })
        .expect(400);

      expect(res.body.error).toContain('Invalid record type');
      expect(res.body.validRecordTypes).toBeDefined();
    });

    it('should trim name whitespace', async () => {
      const res = await request(app)
        .post(`/api/v2/vehicles/${testVehicle._id}/records`)
        .send({
          recordType: 'Finance',
          name: '  Test Record  '
        })
        .expect(201);

      expect(res.body.name).toBe('Test Record');
    });
  });

  describe('GET BY ID - GET /api/v2/:domain/:parentId/records/:recordId', () => {
    it('should return single child record', async () => {
      const childRecord = await ChildRecord.create({
        userId: testUser._id,
        parentId: testVehicle._id,
        recordType: 'Finance',
        name: 'Car Loan',
        amount: 15000
      });

      const res = await request(app)
        .get(`/api/v2/vehicles/${testVehicle._id}/records/${childRecord._id}`)
        .expect(200);

      expect(res.body.name).toBe('Car Loan');
      expect(res.body.amount).toBe(15000);
    });

    it('should return 404 for non-existent record', async () => {
      const fakeRecordId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/v2/vehicles/${testVehicle._id}/records/${fakeRecordId}`)
        .expect(404);

      expect(res.body.error).toContain('Child record not found');
    });

    it('should return 404 when record belongs to different parent', async () => {
      // Create record for testProperty
      const propertyRecord = await ChildRecord.create({
        userId: testUser._id,
        parentId: testProperty._id,
        recordType: 'Contact',
        name: 'Estate Agent'
      });

      // Try to access via testVehicle
      const res = await request(app)
        .get(`/api/v2/vehicles/${testVehicle._id}/records/${propertyRecord._id}`)
        .expect(404);

      expect(res.body.error).toContain('Child record not found');
    });

    it('should return 404 when trying to access other user\'s record', async () => {
      const otherRecord = await ChildRecord.create({
        userId: otherUser._id,
        parentId: testVehicle._id,
        recordType: 'Finance',
        name: 'Other User Record'
      });

      const res = await request(app)
        .get(`/api/v2/vehicles/${testVehicle._id}/records/${otherRecord._id}`)
        .expect(404);

      expect(res.body.error).toContain('Child record not found');
    });

    it('should return 400 for invalid record ID format', async () => {
      const res = await request(app)
        .get(`/api/v2/vehicles/${testVehicle._id}/records/invalid-id`)
        .expect(400);

      expect(res.body.error).toContain('Invalid record ID');
    });
  });

  describe('UPDATE - PUT /api/v2/:domain/:parentId/records/:recordId', () => {
    it('should update child record fields', async () => {
      const childRecord = await ChildRecord.create({
        userId: testUser._id,
        parentId: testVehicle._id,
        recordType: 'Finance',
        name: 'Old Name',
        amount: 10000
      });

      const updates = {
        name: 'Updated Name',
        amount: 15000,
        contactName: 'New Contact'
      };

      const res = await request(app)
        .put(`/api/v2/vehicles/${testVehicle._id}/records/${childRecord._id}`)
        .send(updates)
        .expect(200);

      expect(res.body.name).toBe('Updated Name');
      expect(res.body.amount).toBe(15000);
      expect(res.body.contactName).toBe('New Contact');
    });

    it('should prevent changing userId', async () => {
      const childRecord = await ChildRecord.create({
        userId: testUser._id,
        parentId: testVehicle._id,
        recordType: 'Finance',
        name: 'Test Record'
      });

      const res = await request(app)
        .put(`/api/v2/vehicles/${testVehicle._id}/records/${childRecord._id}`)
        .send({
          name: 'Updated',
          userId: otherUser._id
        })
        .expect(200);

      expect(res.body.userId.toString()).toBe(testUser._id.toString());
      expect(res.body.name).toBe('Updated');
    });

    it('should prevent changing parentId', async () => {
      const childRecord = await ChildRecord.create({
        userId: testUser._id,
        parentId: testVehicle._id,
        recordType: 'Finance',
        name: 'Test Record'
      });

      const res = await request(app)
        .put(`/api/v2/vehicles/${testVehicle._id}/records/${childRecord._id}`)
        .send({
          name: 'Updated',
          parentId: testProperty._id
        })
        .expect(200);

      expect(res.body.parentId.toString()).toBe(testVehicle._id.toString());
    });

    it('should prevent changing recordType', async () => {
      const childRecord = await ChildRecord.create({
        userId: testUser._id,
        parentId: testVehicle._id,
        recordType: 'Finance',
        name: 'Test Record'
      });

      const res = await request(app)
        .put(`/api/v2/vehicles/${testVehicle._id}/records/${childRecord._id}`)
        .send({
          name: 'Updated',
          recordType: 'Insurance'
        })
        .expect(200);

      expect(res.body.recordType).toBe('Finance');
    });

    it('should reject empty name', async () => {
      const childRecord = await ChildRecord.create({
        userId: testUser._id,
        parentId: testVehicle._id,
        recordType: 'Finance',
        name: 'Test Record'
      });

      const res = await request(app)
        .put(`/api/v2/vehicles/${testVehicle._id}/records/${childRecord._id}`)
        .send({ name: '  ' })
        .expect(400);

      expect(res.body.error).toContain('cannot be empty');
    });

    it('should return 404 for non-existent record', async () => {
      const fakeRecordId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/v2/vehicles/${testVehicle._id}/records/${fakeRecordId}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(res.body.error).toContain('Child record not found');
    });

    it('should return 404 when trying to update other user\'s record', async () => {
      const otherRecord = await ChildRecord.create({
        userId: otherUser._id,
        parentId: testVehicle._id,
        recordType: 'Finance',
        name: 'Other Record'
      });

      const res = await request(app)
        .put(`/api/v2/vehicles/${testVehicle._id}/records/${otherRecord._id}`)
        .send({ name: 'Hacked' })
        .expect(404);

      expect(res.body.error).toContain('Child record not found');
    });
  });

  describe('DELETE - DELETE /api/v2/:domain/:parentId/records/:recordId', () => {
    it('should delete child record', async () => {
      const childRecord = await ChildRecord.create({
        userId: testUser._id,
        parentId: testVehicle._id,
        recordType: 'Finance',
        name: 'To Delete'
      });

      await request(app)
        .delete(`/api/v2/vehicles/${testVehicle._id}/records/${childRecord._id}`)
        .expect(204);

      // Verify record is deleted
      const check = await ChildRecord.findById(childRecord._id);
      expect(check).toBeNull();
    });

    it('should return 404 for non-existent record', async () => {
      const fakeRecordId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/v2/vehicles/${testVehicle._id}/records/${fakeRecordId}`)
        .expect(404);

      expect(res.body.error).toContain('Child record not found');
    });

    it('should return 404 when trying to delete other user\'s record', async () => {
      const otherRecord = await ChildRecord.create({
        userId: otherUser._id,
        parentId: testVehicle._id,
        recordType: 'Finance',
        name: 'Other Record'
      });

      const res = await request(app)
        .delete(`/api/v2/vehicles/${testVehicle._id}/records/${otherRecord._id}`)
        .expect(404);

      expect(res.body.error).toContain('Child record not found');

      // Verify record still exists
      const check = await ChildRecord.findById(otherRecord._id);
      expect(check).not.toBeNull();
    });

    it('should return 400 for invalid record ID format', async () => {
      const res = await request(app)
        .delete(`/api/v2/vehicles/${testVehicle._id}/records/invalid-id`)
        .expect(400);

      expect(res.body.error).toContain('Invalid record ID');
    });

    it('should not delete records from other parents', async () => {
      // Create records for both parents
      const vehicleRecord = await ChildRecord.create({
        userId: testUser._id,
        parentId: testVehicle._id,
        recordType: 'Finance',
        name: 'Vehicle Record'
      });

      const propertyRecord = await ChildRecord.create({
        userId: testUser._id,
        parentId: testProperty._id,
        recordType: 'Finance',
        name: 'Property Record'
      });

      // Delete vehicle record
      await request(app)
        .delete(`/api/v2/vehicles/${testVehicle._id}/records/${vehicleRecord._id}`)
        .expect(204);

      // Verify property record still exists
      const check = await ChildRecord.findById(propertyRecord._id);
      expect(check).not.toBeNull();
    });
  });

  describe('Multi-Domain Support', () => {
    it('should handle child records for all domains', async () => {
      // Create parent entities for all domains
      const employment = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Employment',
        name: 'Acme Corp'
      });

      const service = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Services',
        name: 'McGrath Plumbing'
      });

      // Create child records for each domain
      const domains = [
        { domain: 'vehicles', parentId: testVehicle._id },
        { domain: 'properties', parentId: testProperty._id },
        { domain: 'employments', parentId: employment._id },
        { domain: 'services', parentId: service._id }
      ];

      for (const { domain, parentId } of domains) {
        const res = await request(app)
          .post(`/api/v2/${domain}/${parentId}/records`)
          .send({
            recordType: 'Contact',
            name: `${domain} contact`
          })
          .expect(201);

        expect(res.body.parentId.toString()).toBe(parentId.toString());
      }
    });
  });

  describe('Record Type Grouping', () => {
    it('should group complex record sets correctly', async () => {
      // Create diverse set of child records
      await ChildRecord.create([
        { userId: testUser._id, parentId: testVehicle._id, recordType: 'Contact', name: 'Dealer' },
        { userId: testUser._id, parentId: testVehicle._id, recordType: 'Contact', name: 'Mechanic' },
        { userId: testUser._id, parentId: testVehicle._id, recordType: 'Finance', name: 'Loan' },
        { userId: testUser._id, parentId: testVehicle._id, recordType: 'Finance', name: 'Warranty' },
        { userId: testUser._id, parentId: testVehicle._id, recordType: 'Insurance', name: 'Car Insurance' },
        { userId: testUser._id, parentId: testVehicle._id, recordType: 'Government', name: 'MOT' },
        { userId: testUser._id, parentId: testVehicle._id, recordType: 'ServiceHistory', name: 'Oil Change' }
      ]);

      const res = await request(app)
        .get(`/api/v2/vehicles/${testVehicle._id}/records`)
        .expect(200);

      expect(res.body.records.Contact).toHaveLength(2);
      expect(res.body.records.Finance).toHaveLength(2);
      expect(res.body.records.Insurance).toHaveLength(1);
      expect(res.body.records.Government).toHaveLength(1);
      expect(res.body.records.ServiceHistory).toHaveLength(1);
      expect(res.body.records.Pension).toHaveLength(0);
      expect(res.body.total).toBe(7);
    });
  });
});
