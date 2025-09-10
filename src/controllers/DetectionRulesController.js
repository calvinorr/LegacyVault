const RecurringDetectionRules = require('../models/RecurringDetectionRules');

class DetectionRulesController {
  // Get default detection rules
  static async getDefaultRules(req, res) {
    try {
      const rules = await RecurringDetectionRules.findOne({ is_default: true });
      
      if (!rules) {
        return res.status(404).json({ error: 'Default rules not found' });
      }

      res.json({ rules });

    } catch (error) {
      console.error('Get default rules error:', error);
      res.status(500).json({ error: 'Failed to retrieve default rules' });
    }
  }

  // Get user-specific rules
  static async getUserRules(req, res) {
    try {
      const user = req.user;
      const rules = await RecurringDetectionRules.find({ custom_user: user._id });

      res.json({ rules });

    } catch (error) {
      console.error('Get user rules error:', error);
      res.status(500).json({ error: 'Failed to retrieve user rules' });
    }
  }

  // Create custom detection rule
  static async createCustomRule(req, res) {
    try {
      const user = req.user;
      const { name, description, utility_rules, bill_rules, council_tax_rules, telecoms_rules, subscription_rules, insurance_rules, general_rules, settings } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Rule name is required' });
      }

      const customRules = new RecurringDetectionRules({
        name,
        description,
        custom_user: user._id,
        utility_rules: utility_rules || [], // Legacy support
        bill_rules: bill_rules || [],
        council_tax_rules: council_tax_rules || [],
        telecoms_rules: telecoms_rules || [],
        subscription_rules: subscription_rules || [],
        insurance_rules: insurance_rules || [],
        general_rules: general_rules || [],
        settings: settings || {
          min_confidence_threshold: 0.6,
          fuzzy_match_threshold: 0.8,
          amount_variance_tolerance: 0.1,
          frequency_detection_window_days: 90
        },
        created_by: user.email || 'user',
        last_updated_by: user.email || 'user'
      });

      await customRules.save();

      res.status(201).json({ 
        message: 'Custom detection rules created successfully',
        rules: customRules 
      });

    } catch (error) {
      console.error('Create custom rule error:', error);
      res.status(500).json({ error: 'Failed to create custom rules' });
    }
  }

  // Update custom detection rule
  static async updateCustomRule(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const updates = req.body;

      const rules = await RecurringDetectionRules.findById(id);

      if (!rules) {
        return res.status(404).json({ error: 'Rules not found' });
      }

      if (!rules.custom_user || !rules.custom_user.equals(user._id)) {
        return res.status(403).json({ error: 'Access denied to these rules' });
      }

      // Update allowed fields
      const allowedFields = [
        'name', 'description', 'utility_rules', 'bill_rules', 'council_tax_rules', 
        'telecoms_rules', 'subscription_rules', 'insurance_rules', 
        'general_rules', 'settings'
      ];

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          rules[field] = updates[field];
        }
      }

      rules.last_updated_by = user.email || 'user';
      await rules.save();

      res.json({ 
        message: 'Custom detection rules updated successfully',
        rules 
      });

    } catch (error) {
      console.error('Update custom rule error:', error);
      res.status(500).json({ error: 'Failed to update custom rules' });
    }
  }

  // Delete custom detection rule
  static async deleteCustomRule(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const rules = await RecurringDetectionRules.findById(id);

      if (!rules) {
        return res.status(404).json({ error: 'Rules not found' });
      }

      if (!rules.custom_user || !rules.custom_user.equals(user._id)) {
        return res.status(403).json({ error: 'Access denied to these rules' });
      }

      if (rules.is_default) {
        return res.status(400).json({ error: 'Cannot delete default rules' });
      }

      await RecurringDetectionRules.findByIdAndDelete(id);

      res.json({ message: 'Custom detection rules deleted successfully' });

    } catch (error) {
      console.error('Delete custom rule error:', error);
      res.status(500).json({ error: 'Failed to delete custom rules' });
    }
  }

  // Add pattern to existing rule category
  static async addPattern(req, res) {
    try {
      const { id } = req.params;
      const { category, pattern, provider, subcategory, confidence_boost } = req.body;
      const user = req.user;

      if (!category || !pattern) {
        return res.status(400).json({ error: 'Category and pattern are required' });
      }

      const rules = await RecurringDetectionRules.findById(id);

      if (!rules) {
        return res.status(404).json({ error: 'Rules not found' });
      }

      if (!rules.custom_user || !rules.custom_user.equals(user._id)) {
        return res.status(403).json({ error: 'Access denied to these rules' });
      }

      // Determine which rule array to add to
      const categoryField = `${category}_rules`;
      if (!rules[categoryField]) {
        return res.status(400).json({ error: `Invalid category: ${category}` });
      }

      // Create new pattern rule
      const newPatternRule = {
        name: `Custom ${provider || pattern}`,
        patterns: [pattern],
        category: category === 'utility' ? 'bills' : category,
        subcategory,
        provider: provider || pattern,
        confidence_boost: confidence_boost || 0.1,
        active: true
      };

      rules[categoryField].push(newPatternRule);
      rules.last_updated_by = user.email || 'user';
      await rules.save();

      res.json({ 
        message: 'Pattern added successfully',
        added_pattern: newPatternRule
      });

    } catch (error) {
      console.error('Add pattern error:', error);
      res.status(500).json({ error: 'Failed to add pattern' });
    }
  }

  // Test detection rules against sample transactions
  static async testRules(req, res) {
    try {
      const { rules_id, sample_transactions } = req.body;
      const user = req.user;

      if (!sample_transactions || !Array.isArray(sample_transactions)) {
        return res.status(400).json({ error: 'Sample transactions array is required' });
      }

      // Get rules to test with
      let rules;
      if (rules_id) {
        rules = await RecurringDetectionRules.findById(rules_id);
        if (!rules || (rules.custom_user && !rules.custom_user.equals(user._id))) {
          return res.status(403).json({ error: 'Access denied to these rules' });
        }
      } else {
        rules = await RecurringDetectionRules.findOne({ is_default: true });
      }

      if (!rules) {
        return res.status(404).json({ error: 'No rules found for testing' });
      }

      // Use the recurring detector to test
      const recurringDetector = require('../services/recurringDetector');
      
      // Mock the rules to use for testing
      const originalFind = RecurringDetectionRules.findOne;
      RecurringDetectionRules.findOne = jest.fn().mockResolvedValue(rules);

      const suggestions = await recurringDetector.detectRecurringPayments(sample_transactions);

      // Restore original method
      RecurringDetectionRules.findOne = originalFind;

      res.json({
        message: 'Rules testing completed',
        rules_used: {
          id: rules._id,
          name: rules.name
        },
        sample_transactions_count: sample_transactions.length,
        detected_suggestions: suggestions.length,
        suggestions: suggestions.map(s => ({
          payee: s.payee,
          category: s.category,
          confidence: s.confidence,
          frequency: s.frequency,
          transaction_count: s.transactions.length
        }))
      });

    } catch (error) {
      console.error('Test rules error:', error);
      res.status(500).json({ error: 'Failed to test rules' });
    }
  }

  // Get detection statistics
  static async getDetectionStats(req, res) {
    try {
      const user = req.user;

      // Get user's import sessions with detection stats
      const ImportSession = require('../models/ImportSession');
      const sessions = await ImportSession.find({ 
        user: user._id,
        status: 'completed' 
      }).select('statistics recurring_payments');

      const stats = {
        total_sessions: sessions.length,
        total_transactions_processed: 0,
        total_recurring_detected: 0,
        average_detection_rate: 0,
        category_breakdown: {}
      };

      for (const session of sessions) {
        stats.total_transactions_processed += session.statistics?.total_transactions || 0;
        stats.total_recurring_detected += session.statistics?.recurring_detected || 0;

        // Count by category
        for (const payment of session.recurring_payments || []) {
          if (!stats.category_breakdown[payment.category]) {
            stats.category_breakdown[payment.category] = 0;
          }
          stats.category_breakdown[payment.category]++;
        }
      }

      if (stats.total_transactions_processed > 0) {
        stats.average_detection_rate = Math.round(
          (stats.total_recurring_detected / stats.total_transactions_processed) * 100 * 100
        ) / 100; // Round to 2 decimal places
      }

      res.json({ stats });

    } catch (error) {
      console.error('Get detection stats error:', error);
      res.status(500).json({ error: 'Failed to retrieve detection statistics' });
    }
  }
}

module.exports = DetectionRulesController;