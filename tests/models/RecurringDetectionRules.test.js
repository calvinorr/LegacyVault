const mongoose = require('mongoose');
const RecurringDetectionRules = require('../../src/models/RecurringDetectionRules');
const User = require('../../src/models/user');

describe('RecurringDetectionRules Model', () => {
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

  describe('Basic Model Creation', () => {
    test('should create a valid detection rules set', async () => {
      const rulesData = {
        name: 'UK Banking Rules v1.0',
        description: 'Standard UK bank transaction detection rules',
        version: '1.0'
      };

      const rules = new RecurringDetectionRules(rulesData);
      const savedRules = await rules.save();

      expect(savedRules._id).toBeDefined();
      expect(savedRules.name).toBe('UK Banking Rules v1.0');
      expect(savedRules.version).toBe('1.0');
      expect(savedRules.is_default).toBe(false);
    });

    test('should require name field', async () => {
      const rules = new RecurringDetectionRules({
        description: 'Test rules'
      });

      await expect(rules.save()).rejects.toThrow();
    });

    test('should set default values', async () => {
      const rules = new RecurringDetectionRules({
        name: 'Test Rules'
      });

      const savedRules = await rules.save();
      expect(savedRules.version).toBe('1.0');
      expect(savedRules.created_by).toBe('system');
      expect(savedRules.is_default).toBe(false);
    });
  });

  describe('Pattern Rules', () => {
    test('should store utility rules with valid patterns', async () => {
      const rulesData = {
        name: 'Utility Rules',
        utility_rules: [
          {
            name: 'British Gas Energy',
            patterns: ['BRITISH GAS', 'BG ENERGY', 'BRITISHGAS'],
            category: 'utilities',
            subcategory: 'gas',
            provider: 'British Gas',
            confidence_boost: 0.2,
            min_occurrences: 2,
            expected_frequency: 'monthly'
          }
        ]
      };

      const rules = new RecurringDetectionRules(rulesData);
      const savedRules = await rules.save();

      expect(savedRules.utility_rules).toHaveLength(1);
      const rule = savedRules.utility_rules[0];
      expect(rule.name).toBe('British Gas Energy');
      expect(rule.patterns).toContain('BRITISH GAS');
      expect(rule.category).toBe('utilities');
      expect(rule.confidence_boost).toBe(0.2);
    });

    test('should validate pattern rule categories', async () => {
      const rulesData = {
        name: 'Test Rules',
        utility_rules: [
          {
            name: 'Test Rule',
            patterns: ['TEST PATTERN'],
            category: 'invalid_category' // Invalid category
          }
        ]
      };

      const rules = new RecurringDetectionRules(rulesData);
      await expect(rules.save()).rejects.toThrow();
    });

    test('should store multiple rule types', async () => {
      const rulesData = {
        name: 'Multi-Type Rules',
        utility_rules: [
          {
            name: 'Electric Company',
            patterns: ['ELECTRIC CO'],
            category: 'utilities'
          }
        ],
        insurance_rules: [
          {
            name: 'Car Insurance',
            patterns: ['AUTO INSURANCE'],
            category: 'insurance'
          }
        ],
        subscription_rules: [
          {
            name: 'Netflix',
            patterns: ['NETFLIX'],
            category: 'subscription'
          }
        ]
      };

      const rules = new RecurringDetectionRules(rulesData);
      const savedRules = await rules.save();

      expect(savedRules.utility_rules).toHaveLength(1);
      expect(savedRules.insurance_rules).toHaveLength(1);
      expect(savedRules.subscription_rules).toHaveLength(1);
    });

    test('should validate frequency values', async () => {
      const validFrequencies = ['weekly', 'monthly', 'quarterly', 'annually'];

      for (const frequency of validFrequencies) {
        const rules = new RecurringDetectionRules({
          name: `Test Rules ${frequency}`,
          utility_rules: [
            {
              name: 'Test Provider',
              patterns: ['TEST'],
              category: 'utilities',
              expected_frequency: frequency
            }
          ]
        });

        await expect(rules.save()).resolves.toBeDefined();
        await rules.deleteOne();
      }
    });

    test('should have default values for pattern rules', async () => {
      const rules = new RecurringDetectionRules({
        name: 'Test Rules',
        utility_rules: [
          {
            name: 'Minimal Rule',
            patterns: ['TEST'],
            category: 'utilities'
          }
        ]
      });

      const savedRules = await rules.save();
      const rule = savedRules.utility_rules[0];
      
      expect(rule.confidence_boost).toBe(0.1);
      expect(rule.min_occurrences).toBe(2);
      expect(rule.expected_frequency).toBe('monthly');
      expect(rule.uk_specific).toBe(true);
      expect(rule.active).toBe(true);
    });
  });

  describe('Settings', () => {
    test('should store global detection settings', async () => {
      const rulesData = {
        name: 'Custom Settings Rules',
        settings: {
          min_confidence_threshold: 0.8,
          fuzzy_match_threshold: 0.7,
          amount_variance_tolerance: 0.15,
          frequency_detection_window_days: 120,
          require_uk_sort_code: true
        }
      };

      const rules = new RecurringDetectionRules(rulesData);
      const savedRules = await rules.save();

      expect(savedRules.settings.min_confidence_threshold).toBe(0.8);
      expect(savedRules.settings.fuzzy_match_threshold).toBe(0.7);
      expect(savedRules.settings.require_uk_sort_code).toBe(true);
    });

    test('should have default settings values', async () => {
      const rules = new RecurringDetectionRules({
        name: 'Default Settings'
      });

      const savedRules = await rules.save();
      expect(savedRules.settings.min_confidence_threshold).toBe(0.6);
      expect(savedRules.settings.fuzzy_match_threshold).toBe(0.8);
      expect(savedRules.settings.amount_variance_tolerance).toBe(0.1);
      expect(savedRules.settings.frequency_detection_window_days).toBe(90);
      expect(savedRules.settings.require_uk_sort_code).toBe(false);
    });
  });

  describe('Default Rules Constraint', () => {
    test('should allow only one default ruleset', async () => {
      const defaultRules1 = new RecurringDetectionRules({
        name: 'Default Rules 1',
        is_default: true
      });

      const defaultRules2 = new RecurringDetectionRules({
        name: 'Default Rules 2',
        is_default: true
      });

      await defaultRules1.save();
      
      // Second default should fail due to unique constraint
      await expect(defaultRules2.save()).rejects.toThrow();
    });

    test('should allow multiple non-default rulesets', async () => {
      const rules1 = new RecurringDetectionRules({
        name: 'Custom Rules 1',
        is_default: false
      });

      const rules2 = new RecurringDetectionRules({
        name: 'Custom Rules 2',
        is_default: false
      });

      await expect(rules1.save()).resolves.toBeDefined();
      await expect(rules2.save()).resolves.toBeDefined();
    });
  });

  describe('User-Specific Rules', () => {
    test('should support user-specific custom rules', async () => {
      const userRules = new RecurringDetectionRules({
        name: 'User Custom Rules',
        custom_user: testUser._id,
        utility_rules: [
          {
            name: 'My Local Utility',
            patterns: ['LOCAL UTILITY CO'],
            category: 'utilities'
          }
        ]
      });

      const savedRules = await userRules.save();
      expect(savedRules.custom_user).toEqual(testUser._id);
    });

    test('should find rules by user', async () => {
      const userRules = new RecurringDetectionRules({
        name: 'User Rules',
        custom_user: testUser._id
      });

      const systemRules = new RecurringDetectionRules({
        name: 'System Rules'
      });

      await userRules.save();
      await systemRules.save();

      const foundUserRules = await RecurringDetectionRules.find({ 
        custom_user: testUser._id 
      });

      expect(foundUserRules).toHaveLength(1);
      expect(foundUserRules[0].name).toBe('User Rules');
    });
  });

  describe('Council Tax Specific Rules', () => {
    test('should store UK council tax detection rules', async () => {
      const rules = new RecurringDetectionRules({
        name: 'UK Council Tax Rules',
        council_tax_rules: [
          {
            name: 'Manchester City Council',
            patterns: ['MANCHESTER CITY', 'MAN CITY COUNCIL', 'MCC COUNCIL TAX'],
            category: 'council_tax',
            subcategory: 'council_tax',
            provider: 'Manchester City Council',
            expected_frequency: 'monthly',
            uk_specific: true
          }
        ]
      });

      const savedRules = await rules.save();
      expect(savedRules.council_tax_rules).toHaveLength(1);
      expect(savedRules.council_tax_rules[0].category).toBe('council_tax');
      expect(savedRules.council_tax_rules[0].uk_specific).toBe(true);
    });
  });

  describe('Telecoms Rules', () => {
    test('should store UK telecoms provider rules', async () => {
      const rules = new RecurringDetectionRules({
        name: 'UK Telecoms Rules',
        telecoms_rules: [
          {
            name: 'Sky Broadband',
            patterns: ['SKY BROADBAND', 'SKY DIGITAL', 'SKY SUBSCRIPTION'],
            category: 'telecoms',
            subcategory: 'broadband',
            provider: 'Sky',
            expected_frequency: 'monthly'
          },
          {
            name: 'BT Internet',
            patterns: ['BT INTERNET', 'BRITISH TELECOM', 'BT BROADBAND'],
            category: 'telecoms',
            subcategory: 'broadband',
            provider: 'BT'
          }
        ]
      });

      const savedRules = await rules.save();
      expect(savedRules.telecoms_rules).toHaveLength(2);
    });
  });

  describe('Rule Management', () => {
    test('should update rule metadata on save', async () => {
      const rules = new RecurringDetectionRules({
        name: 'Updatable Rules',
        last_updated_by: 'admin_user'
      });

      const savedRules = await rules.save();
      expect(savedRules.last_updated_by).toBe('admin_user');
      expect(savedRules.createdAt).toBeInstanceOf(Date);
      expect(savedRules.updatedAt).toBeInstanceOf(Date);
    });

    test('should deactivate rules', async () => {
      const rules = new RecurringDetectionRules({
        name: 'Deactivatable Rules',
        utility_rules: [
          {
            name: 'Inactive Provider',
            patterns: ['OLD PROVIDER'],
            category: 'utilities',
            active: false
          }
        ]
      });

      const savedRules = await rules.save();
      expect(savedRules.utility_rules[0].active).toBe(false);
    });
  });
});