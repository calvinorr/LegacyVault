const mongoose = require('mongoose');
const RecurringDetectionRules = require('../../src/models/RecurringDetectionRules');
const { seedUKDetectionRules } = require('../../src/migrations/001_add_import_support');

describe('Migration Integration Test', () => {
  describe('UK Detection Rules Seeding Function', () => {
    test('should create default UK detection rules when seeded', async () => {
      // First ensure no default rules exist
      await RecurringDetectionRules.deleteMany({ is_default: true });
      
      // Run the seed function
      await seedUKDetectionRules();
      
      // Now verify the rules were created
      const defaultRules = await RecurringDetectionRules.findOne({ is_default: true });
      
      expect(defaultRules).toBeTruthy();
      expect(defaultRules.name).toBe('UK Banking Detection Rules v1.0');
      expect(defaultRules.version).toBe('1.0');
    });
    
    test('should create utility detection rules', async () => {
      await RecurringDetectionRules.deleteMany({ is_default: true });
      await seedUKDetectionRules();
      const defaultRules = await RecurringDetectionRules.findOne({ is_default: true });
      
      expect(defaultRules.utility_rules).toHaveLength(7); // British Gas, EDF, E.ON, Octopus, SSE, Thames Water, Anglian Water
      
      // Check for British Gas rule
      const britishGasRule = defaultRules.utility_rules.find(rule => rule.name === 'British Gas Energy');
      expect(britishGasRule).toBeTruthy();
      expect(britishGasRule.patterns).toContain('BRITISH GAS');
      expect(britishGasRule.category).toBe('utilities');
      expect(britishGasRule.subcategory).toBe('gas');
    });
    
    test('should not create duplicate default rules', async () => {
      await RecurringDetectionRules.deleteMany({ is_default: true });
      
      // Seed twice - should only create once
      await seedUKDetectionRules();
      await seedUKDetectionRules();
      
      const defaultRules = await RecurringDetectionRules.find({ is_default: true });
      expect(defaultRules).toHaveLength(1);
    });
    
    test('should create comprehensive UK provider rules', async () => {
      await RecurringDetectionRules.deleteMany({ is_default: true });
      await seedUKDetectionRules();
      const rules = await RecurringDetectionRules.findOne({ is_default: true });
      
      // Verify all rule categories exist
      expect(rules.utility_rules.length).toBeGreaterThan(0);
      expect(rules.council_tax_rules.length).toBeGreaterThan(0);
      expect(rules.telecoms_rules.length).toBeGreaterThan(0);
      expect(rules.subscription_rules.length).toBeGreaterThan(0);
      expect(rules.insurance_rules.length).toBeGreaterThan(0);
      expect(rules.general_rules.length).toBeGreaterThan(0);
      
      // Check some specific providers
      const britishGasRule = rules.utility_rules.find(rule => rule.provider === 'British Gas');
      expect(britishGasRule).toBeTruthy();
      
      const skyRule = rules.telecoms_rules.find(rule => rule.provider === 'Sky');
      expect(skyRule).toBeTruthy();
      
      const netflixRule = rules.subscription_rules.find(rule => rule.provider === 'Netflix');
      expect(netflixRule).toBeTruthy();
    });
    
    test('should have UK-appropriate default settings', async () => {
      await RecurringDetectionRules.deleteMany({ is_default: true });
      await seedUKDetectionRules();
      const rules = await RecurringDetectionRules.findOne({ is_default: true });
      
      expect(rules.settings.min_confidence_threshold).toBe(0.7);
      expect(rules.settings.fuzzy_match_threshold).toBe(0.85);
      expect(rules.settings.amount_variance_tolerance).toBe(0.15);
      expect(rules.settings.frequency_detection_window_days).toBe(90);
      expect(rules.settings.require_uk_sort_code).toBe(false);
    });
  });
});