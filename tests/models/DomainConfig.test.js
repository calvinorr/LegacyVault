const mongoose = require('mongoose');
const DomainConfig = require('../../src/models/DomainConfig');

describe('DomainConfig Model', () => {
  describe('Model Creation and Validation', () => {
    test('should create a valid Vehicle domain config', async () => {
      const configData = {
        domainType: 'Vehicle',
        allowedRecordTypes: ['Contact', 'Finance', 'Insurance', 'ServiceHistory', 'Government']
      };

      const config = new DomainConfig(configData);
      const savedConfig = await config.save();

      expect(savedConfig.domainType).toBe('Vehicle');
      expect(savedConfig.allowedRecordTypes).toHaveLength(5);
      expect(savedConfig.isActive).toBe(true); // default
    });

    test('should create a valid Property domain config', async () => {
      const configData = {
        domainType: 'Property',
        allowedRecordTypes: ['Contact', 'Finance', 'Insurance', 'ServiceHistory', 'Government']
      };

      const config = new DomainConfig(configData);
      const savedConfig = await config.save();

      expect(savedConfig.domainType).toBe('Property');
      expect(savedConfig.allowedRecordTypes).toContain('Government');
    });

    test('should create a valid Employment domain config', async () => {
      const configData = {
        domainType: 'Employment',
        allowedRecordTypes: ['Contact', 'Finance', 'Pension']
      };

      const config = new DomainConfig(configData);
      const savedConfig = await config.save();

      expect(savedConfig.domainType).toBe('Employment');
      expect(savedConfig.allowedRecordTypes).toHaveLength(3);
    });

    test('should create a valid Services domain config', async () => {
      const configData = {
        domainType: 'Services',
        allowedRecordTypes: ['Contact', 'ServiceHistory']
      };

      const config = new DomainConfig(configData);
      const savedConfig = await config.save();

      expect(savedConfig.domainType).toBe('Services');
      expect(savedConfig.allowedRecordTypes).toContain('ServiceHistory');
    });

    test('should create a valid Finance domain config', async () => {
      const configData = {
        domainType: 'Finance',
        allowedRecordTypes: ['Contact', 'Finance', 'Insurance']
      };

      const config = new DomainConfig(configData);
      const savedConfig = await config.save();

      expect(savedConfig.domainType).toBe('Finance');
      expect(savedConfig.allowedRecordTypes).toContain('Finance');
      expect(savedConfig.allowedRecordTypes).toContain('Insurance');
    });

    test('should require domainType field', async () => {
      const configData = {
        allowedRecordTypes: ['Contact']
      };

      const config = new DomainConfig(configData);

      await expect(config.save()).rejects.toThrow();
    });

    test('should validate domainType enum values', async () => {
      const validDomainTypes = ['Vehicle', 'Property', 'Employment', 'Services', 'Finance'];

      for (const domainType of validDomainTypes) {
        const config = new DomainConfig({
          domainType,
          allowedRecordTypes: ['Contact']
        });

        await expect(config.save()).resolves.toBeDefined();
        await config.deleteOne();
      }
    });

    test('should reject invalid domainType values', async () => {
      const config = new DomainConfig({
        domainType: 'InvalidDomain',
        allowedRecordTypes: ['Contact']
      });

      await expect(config.save()).rejects.toThrow();
    });

    test('should enforce unique domainType constraint', async () => {
      const config1 = new DomainConfig({
        domainType: 'Vehicle',
        allowedRecordTypes: ['Contact']
      });
      await config1.save();

      const config2 = new DomainConfig({
        domainType: 'Vehicle',
        allowedRecordTypes: ['Finance']
      });

      await expect(config2.save()).rejects.toThrow();
    });

    test('should default to all record types if not specified', async () => {
      const config = new DomainConfig({
        domainType: 'Vehicle'
      });

      const savedConfig = await config.save();

      expect(savedConfig.allowedRecordTypes).toHaveLength(6);
      expect(savedConfig.allowedRecordTypes).toEqual([
        'Contact',
        'ServiceHistory',
        'Finance',
        'Insurance',
        'Government',
        'Pension'
      ]);
    });

    test('should validate allowedRecordTypes enum values', async () => {
      const validRecordTypes = ['Contact', 'ServiceHistory', 'Finance', 'Insurance', 'Government', 'Pension'];

      const config = new DomainConfig({
        domainType: 'Vehicle',
        allowedRecordTypes: validRecordTypes
      });

      await expect(config.save()).resolves.toBeDefined();
    });

    test('should reject invalid allowedRecordTypes values', async () => {
      const config = new DomainConfig({
        domainType: 'Vehicle',
        allowedRecordTypes: ['Contact', 'InvalidType']
      });

      await expect(config.save()).rejects.toThrow();
    });
  });

  describe('Custom Record Types', () => {
    test('should add custom record types', async () => {
      const config = new DomainConfig({
        domainType: 'Vehicle',
        allowedRecordTypes: ['Contact', 'Finance'],
        customRecordTypes: [
          {
            name: 'Warranty',
            icon: 'shield',
            color: '#3B82F6',
            description: 'Vehicle warranty information',
            requiredFields: ['provider', 'expiryDate'],
            displayOrder: 1
          }
        ]
      });

      const savedConfig = await config.save();

      expect(savedConfig.customRecordTypes).toHaveLength(1);
      expect(savedConfig.customRecordTypes[0].name).toBe('Warranty');
      expect(savedConfig.customRecordTypes[0].icon).toBe('shield');
      expect(savedConfig.customRecordTypes[0].requiredFields).toContain('provider');
    });

    test('should allow multiple custom record types', async () => {
      const config = new DomainConfig({
        domainType: 'Property',
        allowedRecordTypes: ['Contact'],
        customRecordTypes: [
          {
            name: 'Maintenance',
            icon: 'wrench',
            color: '#10B981',
            description: 'Property maintenance records'
          },
          {
            name: 'Inspection',
            icon: 'clipboard-check',
            color: '#F59E0B',
            description: 'Property inspection reports'
          }
        ]
      });

      const savedConfig = await config.save();

      expect(savedConfig.customRecordTypes).toHaveLength(2);
    });

    test('should require name for custom record types', async () => {
      const config = new DomainConfig({
        domainType: 'Vehicle',
        customRecordTypes: [
          {
            icon: 'shield',
            description: 'Missing name'
          }
        ]
      });

      await expect(config.save()).rejects.toThrow();
    });

    test('should default requiredFields to empty array', async () => {
      const config = new DomainConfig({
        domainType: 'Vehicle',
        customRecordTypes: [
          {
            name: 'CustomType'
          }
        ]
      });

      const savedConfig = await config.save();

      expect(savedConfig.customRecordTypes[0].requiredFields).toEqual([]);
    });
  });

  describe('UI Configuration', () => {
    test('should set default view', async () => {
      const config = new DomainConfig({
        domainType: 'Vehicle',
        defaultView: 'grid'
      });

      const savedConfig = await config.save();

      expect(savedConfig.defaultView).toBe('grid');
    });

    test('should validate defaultView enum values', async () => {
      const validViews = ['list', 'grid', 'table'];
      const validDomainTypes = ['Vehicle', 'Property', 'Employment'];

      for (let i = 0; i < validViews.length; i++) {
        const config = new DomainConfig({
          domainType: validDomainTypes[i],
          defaultView: validViews[i]
        });

        await expect(config.save()).resolves.toBeDefined();
        await config.deleteOne();
      }
    });

    test('should default to list view', async () => {
      const config = new DomainConfig({
        domainType: 'Vehicle'
      });

      const savedConfig = await config.save();

      expect(savedConfig.defaultView).toBe('list');
    });

    test('should set sortOrder', async () => {
      const config = new DomainConfig({
        domainType: 'Vehicle',
        sortOrder: 1
      });

      const savedConfig = await config.save();

      expect(savedConfig.sortOrder).toBe(1);
    });

    test('should default sortOrder to 0', async () => {
      const config = new DomainConfig({
        domainType: 'Vehicle'
      });

      const savedConfig = await config.save();

      expect(savedConfig.sortOrder).toBe(0);
    });
  });

  describe('Feature Flags', () => {
    test('should set feature flags', async () => {
      const config = new DomainConfig({
        domainType: 'Employment',
        features: {
          enableRenewalTracking: false,
          enableContactDirectory: true,
          enableFinancialTracking: true,
          enableDocumentAttachments: false
        }
      });

      const savedConfig = await config.save();

      expect(savedConfig.features.enableRenewalTracking).toBe(false);
      expect(savedConfig.features.enableContactDirectory).toBe(true);
      expect(savedConfig.features.enableDocumentAttachments).toBe(false);
    });

    test('should default all features to true', async () => {
      const config = new DomainConfig({
        domainType: 'Vehicle'
      });

      const savedConfig = await config.save();

      expect(savedConfig.features.enableRenewalTracking).toBe(true);
      expect(savedConfig.features.enableContactDirectory).toBe(true);
      expect(savedConfig.features.enableFinancialTracking).toBe(true);
      expect(savedConfig.features.enableDocumentAttachments).toBe(true);
    });
  });

  describe('Instance Methods', () => {
    describe('isRecordTypeAllowed', () => {
      let config;

      beforeEach(async () => {
        config = new DomainConfig({
          domainType: 'Vehicle',
          allowedRecordTypes: ['Contact', 'Finance', 'Insurance'],
          customRecordTypes: [
            { name: 'Warranty', description: 'Warranty info' }
          ]
        });
        await config.save();
      });

      test('should return true for allowed standard record types', () => {
        expect(config.isRecordTypeAllowed('Contact')).toBe(true);
        expect(config.isRecordTypeAllowed('Finance')).toBe(true);
        expect(config.isRecordTypeAllowed('Insurance')).toBe(true);
      });

      test('should return false for disallowed standard record types', () => {
        expect(config.isRecordTypeAllowed('ServiceHistory')).toBe(false);
        expect(config.isRecordTypeAllowed('Government')).toBe(false);
      });

      test('should return true for custom record types', () => {
        expect(config.isRecordTypeAllowed('Warranty')).toBe(true);
      });

      test('should return false for unknown record types', () => {
        expect(config.isRecordTypeAllowed('NonExistent')).toBe(false);
      });
    });

    describe('getAllAllowedRecordTypes', () => {
      let config;

      beforeEach(async () => {
        config = new DomainConfig({
          domainType: 'Vehicle',
          allowedRecordTypes: ['Contact', 'Finance'],
          customRecordTypes: [
            {
              name: 'Warranty',
              icon: 'shield',
              color: '#3B82F6',
              description: 'Warranty information',
              requiredFields: ['provider'],
              displayOrder: 1
            }
          ]
        });
        await config.save();
      });

      test('should return both standard and custom record types', () => {
        const allTypes = config.getAllAllowedRecordTypes();

        expect(allTypes).toHaveLength(3); // 2 standard + 1 custom
      });

      test('should mark standard types correctly', () => {
        const allTypes = config.getAllAllowedRecordTypes();
        const contactType = allTypes.find(t => t.name === 'Contact');

        expect(contactType.isCustom).toBe(false);
      });

      test('should mark custom types correctly', () => {
        const allTypes = config.getAllAllowedRecordTypes();
        const warrantyType = allTypes.find(t => t.name === 'Warranty');

        expect(warrantyType.isCustom).toBe(true);
        expect(warrantyType.icon).toBe('shield');
        expect(warrantyType.color).toBe('#3B82F6');
        expect(warrantyType.description).toBe('Warranty information');
        expect(warrantyType.requiredFields).toContain('provider');
      });
    });
  });

  describe('Static Methods', () => {
    describe('getOrCreateDefaultConfig', () => {
      test('should create default Vehicle config', async () => {
        const config = await DomainConfig.getOrCreateDefaultConfig('Vehicle');

        expect(config.domainType).toBe('Vehicle');
        expect(config.allowedRecordTypes).toContain('Contact');
        expect(config.allowedRecordTypes).toContain('Finance');
        expect(config.allowedRecordTypes).toContain('Insurance');
        expect(config.sortOrder).toBe(1);
      });

      test('should create default Property config', async () => {
        const config = await DomainConfig.getOrCreateDefaultConfig('Property');

        expect(config.domainType).toBe('Property');
        expect(config.sortOrder).toBe(2);
      });

      test('should create default Employment config', async () => {
        const config = await DomainConfig.getOrCreateDefaultConfig('Employment');

        expect(config.domainType).toBe('Employment');
        expect(config.allowedRecordTypes).toContain('Pension');
        expect(config.allowedRecordTypes).toHaveLength(3); // Contact, Finance, Pension
        expect(config.sortOrder).toBe(3);
      });

      test('should create default Services config', async () => {
        const config = await DomainConfig.getOrCreateDefaultConfig('Services');

        expect(config.domainType).toBe('Services');
        expect(config.allowedRecordTypes).toContain('Contact');
        expect(config.allowedRecordTypes).toContain('ServiceHistory');
        expect(config.allowedRecordTypes).toHaveLength(2);
        expect(config.sortOrder).toBe(4);
      });

      test('should create default Finance config', async () => {
        const config = await DomainConfig.getOrCreateDefaultConfig('Finance');

        expect(config.domainType).toBe('Finance');
        expect(config.allowedRecordTypes).toContain('Contact');
        expect(config.allowedRecordTypes).toContain('Finance');
        expect(config.allowedRecordTypes).toContain('Insurance');
        expect(config.sortOrder).toBe(5);
      });

      test('should return existing config if already exists', async () => {
        // Create initial config
        const initialConfig = await DomainConfig.create({
          domainType: 'Vehicle',
          allowedRecordTypes: ['Contact'],
          sortOrder: 99
        });

        // Try to get or create again
        const config = await DomainConfig.getOrCreateDefaultConfig('Vehicle');

        expect(config._id).toEqual(initialConfig._id);
        expect(config.sortOrder).toBe(99); // Unchanged
        expect(config.allowedRecordTypes).toEqual(['Contact']); // Unchanged
      });
    });

    describe('seedDefaultConfigs', () => {
      test('should create configs for all five domains', async () => {
        const configs = await DomainConfig.seedDefaultConfigs();

        expect(configs).toHaveLength(5);

        const domainTypes = configs.map(c => c.domainType);
        expect(domainTypes).toContain('Vehicle');
        expect(domainTypes).toContain('Property');
        expect(domainTypes).toContain('Employment');
        expect(domainTypes).toContain('Services');
        expect(domainTypes).toContain('Finance');
      });

      test('should be idempotent (safe to run multiple times)', async () => {
        // First run
        await DomainConfig.seedDefaultConfigs();

        const countAfterFirst = await DomainConfig.countDocuments();
        expect(countAfterFirst).toBe(5);

        // Second run
        await DomainConfig.seedDefaultConfigs();

        const countAfterSecond = await DomainConfig.countDocuments();
        expect(countAfterSecond).toBe(5); // Should not create duplicates
      });

      test('should return configs in correct sort order', async () => {
        const configs = await DomainConfig.seedDefaultConfigs();

        expect(configs[0].domainType).toBe('Vehicle'); // sortOrder 1
        expect(configs[1].domainType).toBe('Property'); // sortOrder 2
        expect(configs[2].domainType).toBe('Employment'); // sortOrder 3
        expect(configs[3].domainType).toBe('Services'); // sortOrder 4
        expect(configs[4].domainType).toBe('Finance'); // sortOrder 5
      });
    });
  });

  describe('Indexes', () => {
    test('should have unique index on domainType', async () => {
      const indexes = DomainConfig.schema.indexes();
      const hasUniqueIndex = indexes.some(index =>
        index[0].domainType === 1 && index[1]?.unique === true
      );

      expect(hasUniqueIndex).toBe(true);
    });
  });

  describe('Timestamps', () => {
    test('should automatically set createdAt and updatedAt', async () => {
      const config = new DomainConfig({
        domainType: 'Vehicle',
        allowedRecordTypes: ['Contact']
      });

      const savedConfig = await config.save();

      expect(savedConfig.createdAt).toBeDefined();
      expect(savedConfig.updatedAt).toBeDefined();
    });

    test('should update updatedAt on modification', async () => {
      const config = new DomainConfig({
        domainType: 'Vehicle',
        allowedRecordTypes: ['Contact']
      });

      const savedConfig = await config.save();
      const originalUpdatedAt = savedConfig.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      savedConfig.allowedRecordTypes.push('Finance');
      const updatedConfig = await savedConfig.save();

      expect(updatedConfig.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Querying', () => {
    beforeEach(async () => {
      await DomainConfig.seedDefaultConfigs();
    });

    test('should find config by domainType', async () => {
      const config = await DomainConfig.findOne({ domainType: 'Vehicle' });

      expect(config).toBeDefined();
      expect(config.domainType).toBe('Vehicle');
    });

    test('should find active configs', async () => {
      const activeConfigs = await DomainConfig.find({ isActive: true });

      expect(activeConfigs).toHaveLength(5);
    });

    test('should sort by sortOrder', async () => {
      const configs = await DomainConfig.find({}).sort({ sortOrder: 1 });

      expect(configs[0].domainType).toBe('Vehicle');
      expect(configs[3].domainType).toBe('Services');
      expect(configs[4].domainType).toBe('Finance');
    });
  });
});
