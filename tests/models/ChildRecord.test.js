const mongoose = require('mongoose');
const ChildRecord = require('../../src/models/ChildRecord');
const ParentEntity = require('../../src/models/ParentEntity');
const User = require('../../src/models/user');

describe('ChildRecord Model', () => {
  let testUser, parentEntity;

  beforeEach(async () => {
    testUser = new User({
      googleId: 'test123',
      displayName: 'Test User',
      email: 'test@example.com',
      approved: true
    });
    await testUser.save();

    parentEntity = new ParentEntity({
      userId: testUser._id,
      domainType: 'Vehicle',
      name: '2019 Honda Civic'
    });
    await parentEntity.save();
  });

  describe('Model Creation and Validation', () => {
    test('should create a valid Contact child record', async () => {
      const contactData = {
        userId: testUser._id,
        parentId: parentEntity._id,
        recordType: 'Contact',
        name: 'Finance Company Contact',
        contactName: 'John Smith',
        phone: '0800-123-4567',
        email: 'john@financecompany.com',
        accountNumber: 'FIN-12345'
      };

      const contact = new ChildRecord(contactData);
      const savedContact = await contact.save();

      expect(savedContact.name).toBe('Finance Company Contact');
      expect(savedContact.recordType).toBe('Contact');
      expect(savedContact.contactName).toBe('John Smith');
      expect(savedContact.phone).toBe('0800-123-4567');
      expect(savedContact.status).toBe('active'); // default
    });

    test('should create a valid ServiceHistory child record', async () => {
      const serviceData = {
        userId: testUser._id,
        parentId: parentEntity._id,
        recordType: 'ServiceHistory',
        name: 'Annual Service 2024',
        provider: 'Joe\'s Garage',
        contactName: 'Joe Murphy',
        phone: '028-1234-5678',
        notes: 'Oil change, filter replacement'
      };

      const service = new ChildRecord(serviceData);
      const savedService = await service.save();

      expect(savedService.recordType).toBe('ServiceHistory');
      expect(savedService.provider).toBe('Joe\'s Garage');
      expect(savedService.notes).toContain('Oil change');
    });

    test('should create a valid Finance child record', async () => {
      const financeData = {
        userId: testUser._id,
        parentId: parentEntity._id,
        recordType: 'Finance',
        name: 'Car Finance Loan',
        provider: 'Finance Company Ltd',
        accountNumber: 'ACC-98765',
        amount: 15000,
        frequency: 'monthly',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2025-12-31')
      };

      const finance = new ChildRecord(financeData);
      const savedFinance = await finance.save();

      expect(savedFinance.recordType).toBe('Finance');
      expect(savedFinance.amount).toBe(15000);
      expect(savedFinance.frequency).toBe('monthly');
    });

    test('should create a valid Insurance child record', async () => {
      const insuranceData = {
        userId: testUser._id,
        parentId: parentEntity._id,
        recordType: 'Insurance',
        name: 'Car Insurance Policy',
        provider: 'Direct Line',
        policyNumber: 'POL-123456',
        renewalDate: new Date('2025-06-15'),
        contactName: 'Insurance Agent',
        phone: '0800-456-7890',
        amount: 450,
        frequency: 'annually'
      };

      const insurance = new ChildRecord(insuranceData);
      const savedInsurance = await insurance.save();

      expect(savedInsurance.recordType).toBe('Insurance');
      expect(savedInsurance.policyNumber).toBe('POL-123456');
      expect(savedInsurance.renewalDate).toBeDefined();
    });

    test('should create a valid Government child record', async () => {
      const governmentData = {
        userId: testUser._id,
        parentId: parentEntity._id,
        recordType: 'Government',
        name: 'MOT Certificate',
        renewalDate: new Date('2025-03-20'),
        notes: 'MOT due annually',
        amount: 35,
        frequency: 'annually'
      };

      const government = new ChildRecord(governmentData);
      const savedGovernment = await government.save();

      expect(savedGovernment.recordType).toBe('Government');
      expect(savedGovernment.renewalDate).toBeDefined();
    });

    test('should create a valid Pension child record', async () => {
      const pensionData = {
        userId: testUser._id,
        parentId: parentEntity._id,
        recordType: 'Pension',
        name: 'Workplace Pension',
        provider: 'Pension Provider Ltd',
        accountNumber: 'PEN-54321',
        amount: 500,
        frequency: 'monthly',
        contactName: 'Pension Administrator',
        phone: '0800-999-8888'
      };

      const pension = new ChildRecord(pensionData);
      const savedPension = await pension.save();

      expect(savedPension.recordType).toBe('Pension');
      expect(savedPension.provider).toBe('Pension Provider Ltd');
    });

    test('should require userId field', async () => {
      const recordData = {
        parentId: parentEntity._id,
        recordType: 'Contact',
        name: 'Test Contact'
      };

      const record = new ChildRecord(recordData);

      await expect(record.save()).rejects.toThrow();
    });

    test('should require parentId field', async () => {
      const recordData = {
        userId: testUser._id,
        recordType: 'Contact',
        name: 'Test Contact'
      };

      const record = new ChildRecord(recordData);

      await expect(record.save()).rejects.toThrow();
    });

    test('should require name field', async () => {
      const recordData = {
        userId: testUser._id,
        parentId: parentEntity._id,
        recordType: 'Contact'
      };

      const record = new ChildRecord(recordData);

      await expect(record.save()).rejects.toThrow();
    });

    test('should validate recordType enum values', async () => {
      const validRecordTypes = ['Contact', 'ServiceHistory', 'Finance', 'Insurance', 'Government', 'Pension'];

      for (const recordType of validRecordTypes) {
        const record = new ChildRecord({
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType,
          name: `Test ${recordType}`
        });

        await expect(record.save()).resolves.toBeDefined();
        await record.deleteOne();
      }
    });

    test('should reject invalid recordType values', async () => {
      const record = new ChildRecord({
        userId: testUser._id,
        parentId: parentEntity._id,
        recordType: 'InvalidType',
        name: 'Test Record'
      });

      await expect(record.save()).rejects.toThrow();
    });

    test('should validate frequency enum values', async () => {
      const validFrequencies = ['one-time', 'weekly', 'monthly', 'quarterly', 'annually', 'custom'];

      for (const frequency of validFrequencies) {
        const record = new ChildRecord({
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Finance',
          name: `Test ${frequency}`,
          frequency
        });

        await expect(record.save()).resolves.toBeDefined();
        await record.deleteOne();
      }
    });

    test('should validate status enum values', async () => {
      const validStatuses = ['active', 'inactive', 'expired', 'cancelled'];

      for (const status of validStatuses) {
        const record = new ChildRecord({
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Insurance',
          name: `Test ${status}`,
          status
        });

        await expect(record.save()).resolves.toBeDefined();
        await record.deleteOne();
      }
    });

    test('should allow attachments array', async () => {
      const record = new ChildRecord({
        userId: testUser._id,
        parentId: parentEntity._id,
        recordType: 'Insurance',
        name: 'Insurance with Attachments',
        attachments: [
          { filename: 'policy.pdf', url: '/uploads/policy.pdf', provider: 's3' },
          { filename: 'certificate.pdf', url: '/uploads/cert.pdf', provider: 'local' }
        ]
      });

      const savedRecord = await record.save();

      expect(savedRecord.attachments).toHaveLength(2);
      expect(savedRecord.attachments[0].filename).toBe('policy.pdf');
    });
  });

  describe('Continuity Planning Fields Priority', () => {
    test('should store all continuity planning fields', async () => {
      const recordData = {
        userId: testUser._id,
        parentId: parentEntity._id,
        recordType: 'Insurance',
        name: 'Comprehensive Insurance Record',
        contactName: 'Agent Smith',
        phone: '028-9876-5432',
        email: 'agent@insurance.com',
        accountNumber: 'ACC-12345',
        policyNumber: 'POL-67890',
        renewalDate: new Date('2025-08-15')
      };

      const record = new ChildRecord(recordData);
      const savedRecord = await record.save();

      // Verify all continuity fields are stored
      expect(savedRecord.contactName).toBe('Agent Smith');
      expect(savedRecord.phone).toBe('028-9876-5432');
      expect(savedRecord.email).toBe('agent@insurance.com');
      expect(savedRecord.accountNumber).toBe('ACC-12345');
      expect(savedRecord.policyNumber).toBe('POL-67890');
      expect(savedRecord.renewalDate).toBeDefined();
    });

    test('should allow financial fields as secondary', async () => {
      const recordData = {
        userId: testUser._id,
        parentId: parentEntity._id,
        recordType: 'Finance',
        name: 'Car Loan with Costs',
        amount: 15000,
        frequency: 'monthly'
      };

      const record = new ChildRecord(recordData);
      const savedRecord = await record.save();

      expect(savedRecord.amount).toBe(15000);
      expect(savedRecord.frequency).toBe('monthly');
    });
  });

  describe('Indexes', () => {
    test('should have compound index on userId, parentId, recordType', async () => {
      const indexes = ChildRecord.schema.indexes();
      const hasCompoundIndex = indexes.some(index =>
        index[0].userId === 1 && index[0].parentId === 1 && index[0].recordType === 1
      );

      expect(hasCompoundIndex).toBe(true);
    });

    test('should have index on renewalDate', async () => {
      const indexes = ChildRecord.schema.indexes();
      const hasRenewalIndex = indexes.some(index => index[0].renewalDate === 1);

      expect(hasRenewalIndex).toBe(true);
    });
  });

  describe('Instance Methods', () => {
    describe('isRenewalUpcoming', () => {
      test('should identify renewals within 30 days', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 20);

        const record = new ChildRecord({
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Insurance',
          name: 'Insurance with Upcoming Renewal',
          renewalDate: futureDate
        });

        expect(record.isRenewalUpcoming(30)).toBe(true);
      });

      test('should not identify renewals beyond threshold', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 45);

        const record = new ChildRecord({
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Insurance',
          name: 'Insurance with Distant Renewal',
          renewalDate: futureDate
        });

        expect(record.isRenewalUpcoming(30)).toBe(false);
      });

      test('should not identify past renewals', async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 10);

        const record = new ChildRecord({
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Insurance',
          name: 'Insurance with Past Renewal',
          renewalDate: pastDate
        });

        expect(record.isRenewalUpcoming(30)).toBe(false);
      });

      test('should return false if no renewal date', async () => {
        const record = new ChildRecord({
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Contact',
          name: 'Contact without Renewal'
        });

        expect(record.isRenewalUpcoming(30)).toBe(false);
      });
    });

    describe('getRenewalUrgency', () => {
      test('should return "critical" for renewals within 30 days', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 15);

        const record = new ChildRecord({
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Insurance',
          name: 'Critical Renewal',
          renewalDate: futureDate
        });

        expect(record.getRenewalUrgency()).toBe('critical');
      });

      test('should return "important" for renewals within 90 days', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 60);

        const record = new ChildRecord({
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Insurance',
          name: 'Important Renewal',
          renewalDate: futureDate
        });

        expect(record.getRenewalUrgency()).toBe('important');
      });

      test('should return "upcoming" for renewals beyond 90 days', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 120);

        const record = new ChildRecord({
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Insurance',
          name: 'Upcoming Renewal',
          renewalDate: futureDate
        });

        expect(record.getRenewalUrgency()).toBe('upcoming');
      });

      test('should return "expired" for past renewals', async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 10);

        const record = new ChildRecord({
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Insurance',
          name: 'Expired Renewal',
          renewalDate: pastDate
        });

        expect(record.getRenewalUrgency()).toBe('expired');
      });

      test('should return null if no renewal date', async () => {
        const record = new ChildRecord({
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Contact',
          name: 'No Renewal'
        });

        expect(record.getRenewalUrgency()).toBeNull();
      });
    });

    describe('getParentEntity', () => {
      test('should retrieve parent entity', async () => {
        const record = new ChildRecord({
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Insurance',
          name: 'Test Insurance'
        });
        await record.save();

        const parent = await record.getParentEntity();

        expect(parent.name).toBe('2019 Honda Civic');
        expect(parent.domainType).toBe('Vehicle');
      });
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      const today = new Date();

      // Create records with various renewal dates
      await ChildRecord.create([
        {
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Insurance',
          name: 'Critical Renewal (15 days)',
          renewalDate: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000)
        },
        {
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Insurance',
          name: 'Important Renewal (60 days)',
          renewalDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
        },
        {
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Government',
          name: 'Distant Renewal (120 days)',
          renewalDate: new Date(today.getTime() + 120 * 24 * 60 * 60 * 1000)
        },
        {
          userId: testUser._id,
          parentId: parentEntity._id,
          recordType: 'Insurance',
          name: 'Expired Renewal',
          renewalDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)
        }
      ]);
    });

    describe('findUpcomingRenewals', () => {
      test('should find renewals within specified days', async () => {
        const renewals = await ChildRecord.findUpcomingRenewals(testUser._id, 90);

        expect(renewals).toHaveLength(2); // 15 days and 60 days, not 120 or expired
        expect(renewals[0].name).toContain('15 days'); // sorted by renewalDate
      });

      test('should populate parent entity', async () => {
        const renewals = await ChildRecord.findUpcomingRenewals(testUser._id, 90);

        expect(renewals[0].parentId.name).toBe('2019 Honda Civic');
        expect(renewals[0].parentId.domainType).toBe('Vehicle');
      });

      test('should exclude expired renewals', async () => {
        const renewals = await ChildRecord.findUpcomingRenewals(testUser._id, 90);

        const hasExpired = renewals.some(r => r.name.includes('Expired'));
        expect(hasExpired).toBe(false);
      });
    });

    describe('findContacts', () => {
      beforeEach(async () => {
        await ChildRecord.create([
          {
            userId: testUser._id,
            parentId: parentEntity._id,
            recordType: 'Contact',
            name: 'Finance Contact',
            contactName: 'John Smith',
            phone: '028-1234-5678',
            email: 'john@finance.com'
          },
          {
            userId: testUser._id,
            parentId: parentEntity._id,
            recordType: 'Insurance',
            name: 'Insurance Policy',
            contactName: 'Mary Jones',
            phone: '028-9876-5432'
          },
          {
            userId: testUser._id,
            parentId: parentEntity._id,
            recordType: 'ServiceHistory',
            name: 'Service with no contact'
          }
        ]);
      });

      test('should find all records with contact information', async () => {
        const contacts = await ChildRecord.findContacts(testUser._id);

        expect(contacts.length).toBeGreaterThanOrEqual(2);
      });

      test('should filter by recordType', async () => {
        const contactsOnly = await ChildRecord.findContacts(testUser._id, {
          recordType: 'Contact'
        });

        expect(contactsOnly).toHaveLength(1);
        expect(contactsOnly[0].name).toBe('Finance Contact');
      });

      test('should support search filter', async () => {
        const searched = await ChildRecord.findContacts(testUser._id, {
          search: 'John'
        });

        expect(searched).toHaveLength(1);
        expect(searched[0].contactName).toBe('John Smith');
      });

      test('should populate parent entity', async () => {
        const contacts = await ChildRecord.findContacts(testUser._id);

        expect(contacts[0].parentId.name).toBe('2019 Honda Civic');
      });
    });

    describe('countByType', () => {
      let testParent;

      beforeEach(async () => {
        // Create a new parent entity for this test to avoid pollution
        testParent = new ParentEntity({
          userId: testUser._id,
          domainType: 'Vehicle',
          name: 'Test Vehicle for Count'
        });
        await testParent.save();

        await ChildRecord.create([
          { userId: testUser._id, parentId: testParent._id, recordType: 'Finance', name: 'Finance 1' },
          { userId: testUser._id, parentId: testParent._id, recordType: 'Finance', name: 'Finance 2' },
          { userId: testUser._id, parentId: testParent._id, recordType: 'Insurance', name: 'Insurance 1' }
        ]);
      });

      test('should count records by type', async () => {
        const counts = await ChildRecord.countByType(testParent._id);

        const financeCount = counts.find(c => c._id === 'Finance');
        const insuranceCount = counts.find(c => c._id === 'Insurance');

        expect(financeCount.count).toBe(2);
        expect(insuranceCount.count).toBe(1);
      });
    });
  });

  describe('Timestamps', () => {
    test('should automatically set createdAt and updatedAt', async () => {
      const record = new ChildRecord({
        userId: testUser._id,
        parentId: parentEntity._id,
        recordType: 'Contact',
        name: 'Test Contact'
      });

      const savedRecord = await record.save();

      expect(savedRecord.createdAt).toBeDefined();
      expect(savedRecord.updatedAt).toBeDefined();
    });
  });
});
