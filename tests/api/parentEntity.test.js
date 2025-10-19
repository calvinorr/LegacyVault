// tests/api/parentEntity.test.js
// Epic 6 - Story 1.2 - Parent Entity API Tests

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const ParentEntity = require('../../src/models/ParentEntity');
const ChildRecord = require('../../src/models/ChildRecord');
const parentEntityRouter = require('../../src/routes/parentEntity');

describe('Parent Entity API (Story 1.2)', () => {
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

    app.use('/api/v2', parentEntityRouter);
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
    await ParentEntity.deleteMany({});
    await ChildRecord.deleteMany({});
  });

  describe('Domain Validation', () => {
    it('should reject invalid domain names', async () => {
      const res = await request(app)
        .get('/api/v2/invalid')
        .expect(400);

      expect(res.body.error).toContain('Invalid domain');
      expect(res.body.validDomains).toBeDefined();
      expect(res.body.validDomains).toContain('vehicles');
    });

    it('should accept valid domain names (case-insensitive)', async () => {
      const res = await request(app)
        .get('/api/v2/VEHICLES')
        .expect(200);

      expect(res.body.entities).toBeDefined();
      expect(Array.isArray(res.body.entities)).toBe(true);
    });

    it('should accept all 5 valid domains', async () => {
      const validDomains = ['vehicles', 'properties', 'employments', 'services', 'finance'];

      for (const domain of validDomains) {
        const res = await request(app)
          .get(`/api/v2/${domain}`)
          .expect(200);

        expect(res.body.entities).toBeDefined();
        expect(Array.isArray(res.body.entities)).toBe(true);
      }
    });
  });

  describe('LIST - GET /api/v2/:domain', () => {
    beforeEach(async () => {
      // Create test entities
      await ParentEntity.create([
        { userId: testUser._id, domainType: 'Vehicle', name: '2019 Honda Civic' },
        { userId: testUser._id, domainType: 'Vehicle', name: '2020 Toyota Corolla' },
        { userId: testUser._id, domainType: 'Vehicle', name: '2018 Ford Focus' },
        { userId: testUser._id, domainType: 'Property', name: '123 Main Street' },
        { userId: otherUser._id, domainType: 'Vehicle', name: 'Other User Vehicle' }
      ]);
    });

    it('should return paginated list of entities for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v2/vehicles')
        .expect(200);

      expect(res.body.entities).toHaveLength(3);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(50);
      expect(res.body.total).toBe(3);
      expect(res.body.entities.every(e => e.userId.toString() === testUser._id.toString())).toBe(true);
    });

    it('should filter entities by domain type', async () => {
      const res = await request(app)
        .get('/api/v2/properties')
        .expect(200);

      expect(res.body.entities).toHaveLength(1);
      expect(res.body.entities[0].name).toBe('123 Main Street');
      expect(res.body.entities[0].domainType).toBe('Property');
    });

    it('should support pagination with page and limit', async () => {
      const res = await request(app)
        .get('/api/v2/vehicles?page=1&limit=2')
        .expect(200);

      expect(res.body.entities).toHaveLength(2);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(2);
      expect(res.body.total).toBe(3);
    });

    it('should support search filter on name field', async () => {
      const res = await request(app)
        .get('/api/v2/vehicles?search=Honda')
        .expect(200);

      expect(res.body.entities).toHaveLength(1);
      expect(res.body.entities[0].name).toBe('2019 Honda Civic');
    });

    it('should support case-insensitive search', async () => {
      const res = await request(app)
        .get('/api/v2/vehicles?search=honda')
        .expect(200);

      expect(res.body.entities).toHaveLength(1);
      expect(res.body.entities[0].name).toBe('2019 Honda Civic');
    });

    it('should support sorting by createdAt descending (default)', async () => {
      const res = await request(app)
        .get('/api/v2/vehicles')
        .expect(200);

      // Should return 3 entities with descending sort by createdAt
      expect(res.body.entities).toHaveLength(3);

      // Verify dates are in descending order
      const dates = res.body.entities.map(e => new Date(e.createdAt).getTime());
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });

    it('should support sorting by name ascending', async () => {
      const res = await request(app)
        .get('/api/v2/vehicles?sort=name&order=asc')
        .expect(200);

      const names = res.body.entities.map(e => e.name);
      expect(names[0]).toBe('2018 Ford Focus');
    });

    it('should return empty array when no entities exist', async () => {
      const res = await request(app)
        .get('/api/v2/employments')
        .expect(200);

      expect(res.body.entities).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    it('should enforce maximum limit of 100', async () => {
      const res = await request(app)
        .get('/api/v2/vehicles?limit=200')
        .expect(200);

      expect(res.body.limit).toBe(100);
    });

    it('should only return entities for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v2/vehicles')
        .expect(200);

      expect(res.body.entities).toHaveLength(3);
      expect(res.body.entities.every(e => e.userId.toString() === testUser._id.toString())).toBe(true);
      expect(res.body.entities.some(e => e.name === 'Other User Vehicle')).toBe(false);
    });
  });

  describe('CREATE - POST /api/v2/:domain', () => {
    it('should create a new Vehicle parent entity', async () => {
      const vehicleData = {
        name: '2019 Honda Civic',
        fields: {
          make: 'Honda',
          model: 'Civic',
          year: 2019,
          registration: 'ABC 1234',
          vin: '1HGBH41JXMN109186'
        }
      };

      const res = await request(app)
        .post('/api/v2/vehicles')
        .send(vehicleData)
        .expect(201);

      expect(res.body.name).toBe('2019 Honda Civic');
      expect(res.body.domainType).toBe('Vehicle');
      expect(res.body.userId.toString()).toBe(testUser._id.toString());
      expect(res.body.fields.make).toBe('Honda');
      expect(res.body.fields.year).toBe(2019);
      expect(res.body.status).toBe('active');
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
    });

    it('should create a new Property parent entity', async () => {
      const propertyData = {
        name: '123 Main Street',
        fields: {
          address: '123 Main Street, Belfast, BT1 1AA',
          type: 'Primary Residence',
          ownership: 'Owned',
          councilTaxBand: 'C'
        }
      };

      const res = await request(app)
        .post('/api/v2/properties')
        .send(propertyData)
        .expect(201);

      expect(res.body.name).toBe('123 Main Street');
      expect(res.body.domainType).toBe('Property');
      expect(res.body.fields.councilTaxBand).toBe('C');
    });

    it('should create a new Employment parent entity', async () => {
      const employmentData = {
        name: 'Acme Corporation',
        fields: {
          employer: 'Acme Corporation',
          jobTitle: 'Software Engineer',
          employmentType: 'Full-time'
        }
      };

      const res = await request(app)
        .post('/api/v2/employments')
        .send(employmentData)
        .expect(201);

      expect(res.body.name).toBe('Acme Corporation');
      expect(res.body.domainType).toBe('Employment');
    });

    it('should create a new Services parent entity', async () => {
      const servicesData = {
        name: 'McGrath Plumbing',
        fields: {
          businessName: 'McGrath Plumbing',
          serviceType: 'Plumber',
          phone: '028-1234-5678'
        }
      };

      const res = await request(app)
        .post('/api/v2/services')
        .send(servicesData)
        .expect(201);

      expect(res.body.name).toBe('McGrath Plumbing');
      expect(res.body.domainType).toBe('Services');
    });

    it('should create a new Finance parent entity', async () => {
      const financeData = {
        name: 'NatWest Current Account',
        fields: {
          accountType: 'Current Account',
          institution: 'NatWest',
          accountNumber: '12345678',
          sortCode: '60-00-01'
        }
      };

      const res = await request(app)
        .post('/api/v2/finance')
        .send(financeData)
        .expect(201);

      expect(res.body.name).toBe('NatWest Current Account');
      expect(res.body.domainType).toBe('Finance');
      expect(res.body.fields.sortCode).toBe('60-00-01');
    });

    it('should require name field', async () => {
      const res = await request(app)
        .post('/api/v2/vehicles')
        .send({ fields: { make: 'Honda' } })
        .expect(400);

      expect(res.body.error).toContain('Name is required');
    });

    it('should reject empty name', async () => {
      const res = await request(app)
        .post('/api/v2/vehicles')
        .send({ name: '   ', fields: {} })
        .expect(400);

      expect(res.body.error).toContain('Name is required');
    });

    it('should allow entity creation without fields object', async () => {
      const res = await request(app)
        .post('/api/v2/vehicles')
        .send({ name: 'Test Vehicle' })
        .expect(201);

      // Entity should be created successfully
      expect(res.body._id).toBeDefined();
      expect(res.body.name).toBe('Test Vehicle');
      expect(res.body.domainType).toBe('Vehicle');

      // Fields may be undefined or empty object - both are valid
      if (res.body.fields !== undefined) {
        expect(typeof res.body.fields).toBe('object');
      }
    });

    it('should trim name whitespace', async () => {
      const res = await request(app)
        .post('/api/v2/vehicles')
        .send({ name: '  Test Vehicle  ' })
        .expect(201);

      expect(res.body.name).toBe('Test Vehicle');
    });
  });

  describe('GET BY ID - GET /api/v2/:domain/:id', () => {
    it('should return single entity with child records', async () => {
      // Create parent entity
      const entity = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: '2019 Honda Civic'
      });

      // Create child records
      await ChildRecord.create([
        {
          userId: testUser._id,
          parentId: entity._id,
          recordType: 'Finance',
          name: 'Car Loan',
          amount: 15000
        },
        {
          userId: testUser._id,
          parentId: entity._id,
          recordType: 'Insurance',
          name: 'Car Insurance',
          policyNumber: 'POL-123456'
        }
      ]);

      const res = await request(app)
        .get(`/api/v2/vehicles/${entity._id}`)
        .expect(200);

      expect(res.body.entity).toBeDefined();
      expect(res.body.entity.name).toBe('2019 Honda Civic');
      expect(res.body.childRecords).toBeDefined();
      expect(res.body.childRecords.Finance).toHaveLength(1);
      expect(res.body.childRecords.Insurance).toHaveLength(1);
      expect(res.body.childRecords.Finance[0].name).toBe('Car Loan');
      expect(res.body.childRecords.Insurance[0].policyNumber).toBe('POL-123456');
    });

    it('should return empty child record groups when no children exist', async () => {
      const entity = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: '2019 Honda Civic'
      });

      const res = await request(app)
        .get(`/api/v2/vehicles/${entity._id}`)
        .expect(200);

      expect(res.body.childRecords.Contact).toEqual([]);
      expect(res.body.childRecords.ServiceHistory).toEqual([]);
      expect(res.body.childRecords.Finance).toEqual([]);
      expect(res.body.childRecords.Insurance).toEqual([]);
      expect(res.body.childRecords.Government).toEqual([]);
      expect(res.body.childRecords.Pension).toEqual([]);
    });

    it('should return 404 for non-existent entity', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/v2/vehicles/${fakeId}`)
        .expect(404);

      expect(res.body.error).toContain('not found');
    });

    it('should return 404 when trying to access other user\'s entity', async () => {
      const otherEntity = await ParentEntity.create({
        userId: otherUser._id,
        domainType: 'Vehicle',
        name: 'Other User Vehicle'
      });

      const res = await request(app)
        .get(`/api/v2/vehicles/${otherEntity._id}`)
        .expect(404);

      expect(res.body.error).toContain('not found');
    });

    it('should return 400 for invalid ObjectId format', async () => {
      const res = await request(app)
        .get('/api/v2/vehicles/invalid-id')
        .expect(400);

      expect(res.body.error).toContain('Invalid entity ID');
    });

    it('should enforce domain type matching', async () => {
      const propertyEntity = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Property',
        name: '123 Main Street'
      });

      // Try to access as vehicle
      const res = await request(app)
        .get(`/api/v2/vehicles/${propertyEntity._id}`)
        .expect(404);

      expect(res.body.error).toContain('not found');
    });
  });

  describe('UPDATE - PUT /api/v2/:domain/:id', () => {
    it('should update entity name', async () => {
      const entity = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Old Name'
      });

      const res = await request(app)
        .put(`/api/v2/vehicles/${entity._id}`)
        .send({ name: 'New Name' })
        .expect(200);

      expect(res.body.name).toBe('New Name');
    });

    it('should update entity fields', async () => {
      const entity = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Test Vehicle',
        fields: { make: 'Honda', model: 'Civic' }
      });

      const res = await request(app)
        .put(`/api/v2/vehicles/${entity._id}`)
        .send({
          fields: {
            make: 'Honda',
            model: 'Civic',
            year: 2019,
            registration: 'ABC 1234'
          }
        })
        .expect(200);

      expect(res.body.fields.year).toBe(2019);
      expect(res.body.fields.registration).toBe('ABC 1234');
    });

    it('should update entity status', async () => {
      const entity = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Test Vehicle',
        status: 'active'
      });

      const res = await request(app)
        .put(`/api/v2/vehicles/${entity._id}`)
        .send({ status: 'inactive' })
        .expect(200);

      expect(res.body.status).toBe('inactive');
    });

    it('should prevent userId changes', async () => {
      const entity = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Test Vehicle'
      });

      const res = await request(app)
        .put(`/api/v2/vehicles/${entity._id}`)
        .send({ name: 'Updated', userId: otherUser._id })
        .expect(200);

      expect(res.body.userId.toString()).toBe(testUser._id.toString());
      expect(res.body.name).toBe('Updated');
    });

    it('should prevent domainType changes', async () => {
      const entity = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Test Vehicle'
      });

      const res = await request(app)
        .put(`/api/v2/vehicles/${entity._id}`)
        .send({ domainType: 'Property' })
        .expect(200);

      expect(res.body.domainType).toBe('Vehicle');
    });

    it('should reject empty name', async () => {
      const entity = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Test Vehicle'
      });

      const res = await request(app)
        .put(`/api/v2/vehicles/${entity._id}`)
        .send({ name: '  ' })
        .expect(400);

      expect(res.body.error).toContain('cannot be empty');
    });

    it('should return 404 for non-existent entity', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/v2/vehicles/${fakeId}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(res.body.error).toContain('not found');
    });

    it('should return 404 when trying to update other user\'s entity', async () => {
      const otherEntity = await ParentEntity.create({
        userId: otherUser._id,
        domainType: 'Vehicle',
        name: 'Other User Vehicle'
      });

      const res = await request(app)
        .put(`/api/v2/vehicles/${otherEntity._id}`)
        .send({ name: 'Hacked' })
        .expect(404);

      expect(res.body.error).toContain('not found');
    });

    it('should return 400 for invalid ObjectId format', async () => {
      const res = await request(app)
        .put('/api/v2/vehicles/invalid-id')
        .send({ name: 'Updated' })
        .expect(400);

      expect(res.body.error).toContain('Invalid entity ID');
    });

    it('should run validators on update', async () => {
      const entity = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Test Vehicle'
      });

      const res = await request(app)
        .put(`/api/v2/vehicles/${entity._id}`)
        .send({ status: 'InvalidStatus' })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('DELETE - DELETE /api/v2/:domain/:id', () => {
    it('should delete entity without child records', async () => {
      const entity = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'To Delete'
      });

      await request(app)
        .delete(`/api/v2/vehicles/${entity._id}`)
        .expect(204);

      // Verify entity is deleted
      const check = await ParentEntity.findById(entity._id);
      expect(check).toBeNull();
    });

    it('should cascade delete to child records', async () => {
      const entity = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'To Delete'
      });

      // Create child records
      const child1 = await ChildRecord.create({
        userId: testUser._id,
        parentId: entity._id,
        recordType: 'Finance',
        name: 'Car Loan'
      });

      const child2 = await ChildRecord.create({
        userId: testUser._id,
        parentId: entity._id,
        recordType: 'Insurance',
        name: 'Car Insurance'
      });

      await request(app)
        .delete(`/api/v2/vehicles/${entity._id}`)
        .expect(204);

      // Verify parent is deleted
      const parentCheck = await ParentEntity.findById(entity._id);
      expect(parentCheck).toBeNull();

      // Verify children are deleted
      const child1Check = await ChildRecord.findById(child1._id);
      const child2Check = await ChildRecord.findById(child2._id);
      expect(child1Check).toBeNull();
      expect(child2Check).toBeNull();
    });

    it('should return 404 for non-existent entity', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/v2/vehicles/${fakeId}`)
        .expect(404);

      expect(res.body.error).toContain('not found');
    });

    it('should return 404 when trying to delete other user\'s entity', async () => {
      const otherEntity = await ParentEntity.create({
        userId: otherUser._id,
        domainType: 'Vehicle',
        name: 'Other User Vehicle'
      });

      const res = await request(app)
        .delete(`/api/v2/vehicles/${otherEntity._id}`)
        .expect(404);

      expect(res.body.error).toContain('not found');

      // Verify entity still exists
      const check = await ParentEntity.findById(otherEntity._id);
      expect(check).not.toBeNull();
    });

    it('should return 400 for invalid ObjectId format', async () => {
      const res = await request(app)
        .delete('/api/v2/vehicles/invalid-id')
        .expect(400);

      expect(res.body.error).toContain('Invalid entity ID');
    });

    it('should not delete children of other entities', async () => {
      // Create two parent entities
      const entity1 = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Vehicle 1'
      });

      const entity2 = await ParentEntity.create({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Vehicle 2'
      });

      // Create child for entity2
      const child2 = await ChildRecord.create({
        userId: testUser._id,
        parentId: entity2._id,
        recordType: 'Finance',
        name: 'Vehicle 2 Finance'
      });

      // Delete entity1
      await request(app)
        .delete(`/api/v2/vehicles/${entity1._id}`)
        .expect(204);

      // Verify entity2's child still exists
      const childCheck = await ChildRecord.findById(child2._id);
      expect(childCheck).not.toBeNull();
    });
  });

  describe('Multi-User Isolation', () => {
    it('should maintain complete data isolation between users', async () => {
      // Create entities for both users
      await ParentEntity.create([
        { userId: testUser._id, domainType: 'Vehicle', name: 'User1 Vehicle 1' },
        { userId: testUser._id, domainType: 'Vehicle', name: 'User1 Vehicle 2' },
        { userId: otherUser._id, domainType: 'Vehicle', name: 'User2 Vehicle 1' },
        { userId: otherUser._id, domainType: 'Vehicle', name: 'User2 Vehicle 2' }
      ]);

      // Get entities as testUser
      const testUserEntities = await request(app)
        .get('/api/v2/vehicles')
        .expect(200);

      expect(testUserEntities.body.entities).toHaveLength(2);
      expect(testUserEntities.body.entities.every(e => e.name.startsWith('User1'))).toBe(true);

      // Get entities as otherUser
      const otherUserEntities = await request(app)
        .get('/api/v2/vehicles')
        .set('test-user-id', otherUser._id.toString())
        .expect(200);

      expect(otherUserEntities.body.entities).toHaveLength(2);
      expect(otherUserEntities.body.entities.every(e => e.name.startsWith('User2'))).toBe(true);
    });
  });

  describe('All Domains Integration', () => {
    it('should handle all 5 domains independently', async () => {
      // Create one entity for each domain
      await ParentEntity.create([
        { userId: testUser._id, domainType: 'Vehicle', name: 'Test Vehicle' },
        { userId: testUser._id, domainType: 'Property', name: 'Test Property' },
        { userId: testUser._id, domainType: 'Employment', name: 'Test Employment' },
        { userId: testUser._id, domainType: 'Services', name: 'Test Service' },
        { userId: testUser._id, domainType: 'Finance', name: 'Test Finance' }
      ]);

      // Verify each domain returns only its entities
      const domains = [
        { url: 'vehicles', expected: 'Test Vehicle' },
        { url: 'properties', expected: 'Test Property' },
        { url: 'employments', expected: 'Test Employment' },
        { url: 'services', expected: 'Test Service' },
        { url: 'finance', expected: 'Test Finance' }
      ];

      for (const domain of domains) {
        const res = await request(app)
          .get(`/api/v2/${domain.url}`)
          .expect(200);

        expect(res.body.entities).toHaveLength(1);
        expect(res.body.entities[0].name).toBe(domain.expected);
      }
    });
  });
});
