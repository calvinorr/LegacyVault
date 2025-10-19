const mongoose = require('mongoose');
const ParentEntity = require('../../src/models/ParentEntity');
const ChildRecord = require('../../src/models/ChildRecord');
const User = require('../../src/models/user');

describe('ParentEntity Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = new User({
      googleId: 'test123',
      displayName: 'Test User',
      email: 'test@example.com',
      approved: true
    });
    await testUser.save();
  });

  describe('Model Creation and Validation', () => {
    test('should create a valid Vehicle parent entity', async () => {
      const vehicleData = {
        userId: testUser._id,
        domainType: 'Vehicle',
        name: '2019 Honda Civic',
        fields: {
          make: 'Honda',
          model: 'Civic',
          year: 2019,
          registration: 'ABC 1234',
          vin: '1HGBH41JXMN109186'
        }
      };

      const vehicle = new ParentEntity(vehicleData);
      const savedVehicle = await vehicle.save();

      expect(savedVehicle.name).toBe('2019 Honda Civic');
      expect(savedVehicle.domainType).toBe('Vehicle');
      expect(savedVehicle.fields.make).toBe('Honda');
      expect(savedVehicle.fields.year).toBe(2019);
      expect(savedVehicle.status).toBe('active'); // default
    });

    test('should create a valid Property parent entity', async () => {
      const propertyData = {
        userId: testUser._id,
        domainType: 'Property',
        name: '123 Main Street',
        fields: {
          address: '123 Main Street, Belfast, BT1 1AA',
          type: 'Primary Residence',
          ownership: 'Owned',
          councilTaxBand: 'C'
        }
      };

      const property = new ParentEntity(propertyData);
      const savedProperty = await property.save();

      expect(savedProperty.name).toBe('123 Main Street');
      expect(savedProperty.domainType).toBe('Property');
      expect(savedProperty.fields.address).toContain('Belfast');
    });

    test('should create a valid Employment parent entity', async () => {
      const employmentData = {
        userId: testUser._id,
        domainType: 'Employment',
        name: 'Acme Corporation',
        fields: {
          employer: 'Acme Corporation',
          jobTitle: 'Software Engineer',
          employmentType: 'Full-time',
          startDate: new Date('2020-01-15')
        }
      };

      const employment = new ParentEntity(employmentData);
      const savedEmployment = await employment.save();

      expect(savedEmployment.name).toBe('Acme Corporation');
      expect(savedEmployment.domainType).toBe('Employment');
      expect(savedEmployment.fields.jobTitle).toBe('Software Engineer');
    });

    test('should create a valid Services parent entity', async () => {
      const servicesData = {
        userId: testUser._id,
        domainType: 'Services',
        name: 'McGrath Plumbing',
        fields: {
          businessName: 'McGrath Plumbing',
          serviceType: 'Plumber',
          contactPerson: 'John McGrath',
          phone: '028-1234-5678',
          email: 'info@mcgrathplumbing.com'
        }
      };

      const service = new ParentEntity(servicesData);
      const savedService = await service.save();

      expect(savedService.name).toBe('McGrath Plumbing');
      expect(savedService.domainType).toBe('Services');
      expect(savedService.fields.phone).toBe('028-1234-5678');
    });

    test('should create a valid Finance parent entity', async () => {
      const financeData = {
        userId: testUser._id,
        domainType: 'Finance',
        name: 'NatWest Current Account',
        fields: {
          accountType: 'Current Account',
          institution: 'NatWest',
          accountNumber: '12345678',
          sortCode: '60-00-01',
          currency: 'GBP'
        }
      };

      const finance = new ParentEntity(financeData);
      const savedFinance = await finance.save();

      expect(savedFinance.name).toBe('NatWest Current Account');
      expect(savedFinance.domainType).toBe('Finance');
      expect(savedFinance.fields.accountType).toBe('Current Account');
      expect(savedFinance.fields.sortCode).toBe('60-00-01');
    });

    test('should require userId field', async () => {
      const entityData = {
        domainType: 'Vehicle',
        name: 'Test Vehicle'
      };

      const entity = new ParentEntity(entityData);

      await expect(entity.save()).rejects.toThrow();
    });

    test('should require domainType field', async () => {
      const entityData = {
        userId: testUser._id,
        name: 'Test Entity'
      };

      const entity = new ParentEntity(entityData);

      await expect(entity.save()).rejects.toThrow();
    });

    test('should require name field', async () => {
      const entityData = {
        userId: testUser._id,
        domainType: 'Vehicle'
      };

      const entity = new ParentEntity(entityData);

      await expect(entity.save()).rejects.toThrow();
    });

    test('should validate domainType enum values', async () => {
      const validDomainTypes = ['Vehicle', 'Property', 'Employment', 'Services', 'Finance'];

      for (const domainType of validDomainTypes) {
        const entity = new ParentEntity({
          userId: testUser._id,
          domainType,
          name: `Test ${domainType}`
        });

        await expect(entity.save()).resolves.toBeDefined();
        await entity.deleteOne();
      }
    });

    test('should reject invalid domainType values', async () => {
      const entity = new ParentEntity({
        userId: testUser._id,
        domainType: 'InvalidDomain',
        name: 'Test Entity'
      });

      await expect(entity.save()).rejects.toThrow();
    });

    test('should validate status enum values', async () => {
      const validStatuses = ['active', 'inactive', 'archived'];

      for (const status of validStatuses) {
        const entity = new ParentEntity({
          userId: testUser._id,
          domainType: 'Vehicle',
          name: `Test Vehicle ${status}`,
          status
        });

        await expect(entity.save()).resolves.toBeDefined();
        await entity.deleteOne();
      }
    });

    test('should default status to active', async () => {
      const entity = new ParentEntity({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Test Vehicle'
      });

      const savedEntity = await entity.save();

      expect(savedEntity.status).toBe('active');
    });

    test('should allow empty fields object', async () => {
      const entity = new ParentEntity({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Test Vehicle',
        fields: {}
      });

      const savedEntity = await entity.save();

      expect(savedEntity.fields).toEqual({});
    });

    test('should store Mixed type fields flexibly', async () => {
      const entity = new ParentEntity({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Test Vehicle',
        fields: {
          make: 'Tesla',
          model: 'Model 3',
          year: 2023,
          electric: true,
          batteryCapacity: 75.0,
          features: ['Autopilot', 'Premium Audio']
        }
      });

      const savedEntity = await entity.save();

      expect(savedEntity.fields.electric).toBe(true);
      expect(savedEntity.fields.batteryCapacity).toBe(75.0);
      expect(savedEntity.fields.features).toEqual(['Autopilot', 'Premium Audio']);
    });
  });

  describe('Indexes', () => {
    test('should have compound index on userId and domainType', async () => {
      const indexes = ParentEntity.schema.indexes();
      const hasCompoundIndex = indexes.some(index =>
        index[0].userId === 1 && index[0].domainType === 1
      );

      expect(hasCompoundIndex).toBe(true);
    });

    test('should efficiently query by userId and domainType', async () => {
      // Create multiple entities
      await ParentEntity.create([
        { userId: testUser._id, domainType: 'Vehicle', name: 'Vehicle 1' },
        { userId: testUser._id, domainType: 'Vehicle', name: 'Vehicle 2' },
        { userId: testUser._id, domainType: 'Property', name: 'Property 1' }
      ]);

      const vehicles = await ParentEntity.find({
        userId: testUser._id,
        domainType: 'Vehicle'
      });

      expect(vehicles).toHaveLength(2);
    });
  });

  describe('Instance Methods', () => {
    let parentEntity, childRecord1, childRecord2;

    beforeEach(async () => {
      parentEntity = new ParentEntity({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Test Vehicle'
      });
      await parentEntity.save();

      childRecord1 = new ChildRecord({
        userId: testUser._id,
        parentId: parentEntity._id,
        recordType: 'Finance',
        name: 'Car Loan'
      });
      await childRecord1.save();

      childRecord2 = new ChildRecord({
        userId: testUser._id,
        parentId: parentEntity._id,
        recordType: 'Insurance',
        name: 'Car Insurance'
      });
      await childRecord2.save();
    });

    test('getChildRecords should return all child records', async () => {
      const childRecords = await parentEntity.getChildRecords();

      expect(childRecords).toHaveLength(2);
      const names = childRecords.map(r => r.name).sort();
      expect(names).toEqual(['Car Insurance', 'Car Loan']);
    });

    test('countChildRecordsByType should return counts by record type', async () => {
      const counts = await parentEntity.countChildRecordsByType();

      expect(counts.Finance).toBe(1);
      expect(counts.Insurance).toBe(1);
    });

    test('countChildRecordsByType should handle no child records', async () => {
      const emptyParent = new ParentEntity({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Empty Vehicle'
      });
      await emptyParent.save();

      const counts = await emptyParent.countChildRecordsByType();

      expect(counts).toEqual({});
    });
  });

  describe('Static Methods', () => {
    test('findWithChildren should populate userId', async () => {
      const entity = new ParentEntity({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Test Vehicle'
      });
      await entity.save();

      const results = await ParentEntity.findWithChildren({
        _id: entity._id
      });

      expect(results).toHaveLength(1);
      expect(results[0].userId.displayName).toBe('Test User');
      expect(results[0].userId.email).toBe('test@example.com');
    });
  });

  describe('Timestamps', () => {
    test('should automatically set createdAt and updatedAt', async () => {
      const entity = new ParentEntity({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Test Vehicle'
      });

      const savedEntity = await entity.save();

      expect(savedEntity.createdAt).toBeDefined();
      expect(savedEntity.updatedAt).toBeDefined();
      expect(savedEntity.createdAt).toEqual(savedEntity.updatedAt);
    });

    test('should update updatedAt on modification', async () => {
      const entity = new ParentEntity({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Test Vehicle'
      });

      const savedEntity = await entity.save();
      const originalUpdatedAt = savedEntity.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      savedEntity.name = 'Updated Vehicle';
      const updatedEntity = await savedEntity.save();

      expect(updatedEntity.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Audit Fields', () => {
    test('should store lastUpdatedBy reference', async () => {
      const entity = new ParentEntity({
        userId: testUser._id,
        domainType: 'Vehicle',
        name: 'Test Vehicle',
        lastUpdatedBy: testUser._id
      });

      const savedEntity = await entity.save();

      expect(savedEntity.lastUpdatedBy).toEqual(testUser._id);
    });
  });

  describe('Querying', () => {
    beforeEach(async () => {
      // Create test data
      await ParentEntity.create([
        { userId: testUser._id, domainType: 'Vehicle', name: 'Honda Civic' },
        { userId: testUser._id, domainType: 'Vehicle', name: 'Ford Focus' },
        { userId: testUser._id, domainType: 'Property', name: 'Main Residence' },
        { userId: testUser._id, domainType: 'Employment', name: 'Acme Corp' },
        { userId: testUser._id, domainType: 'Services', name: 'McGrath Plumbing' },
        { userId: testUser._id, domainType: 'Finance', name: 'NatWest Current Account' }
      ]);
    });

    test('should find entities by domainType', async () => {
      const vehicles = await ParentEntity.find({ domainType: 'Vehicle' });

      expect(vehicles).toHaveLength(2);
    });

    test('should find entities by userId', async () => {
      const userEntities = await ParentEntity.find({ userId: testUser._id });

      expect(userEntities).toHaveLength(6);
    });

    test('should find entities by name pattern', async () => {
      const results = await ParentEntity.find({
        name: { $regex: 'McGrath', $options: 'i' }
      });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('McGrath Plumbing');
    });

    test('should find active entities', async () => {
      const activeEntities = await ParentEntity.find({ status: 'active' });

      expect(activeEntities).toHaveLength(6); // all default to active
    });
  });
});
