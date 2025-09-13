// Product Detection Utilities
// Helper functions for intelligent UK financial product type detection

const UK_FINANCIAL_PRODUCTS = require('../config/ukFinancialProducts');

class ProductDetectionService {
  constructor() {
    this.products = UK_FINANCIAL_PRODUCTS;
  }

  /**
   * Detect product type from entry title and provider
   * @param {string} title - Entry title/name
   * @param {string} provider - Provider/company name
   * @returns {Object|null} - Detected product info or null
   */
  detectProductType(title = '', provider = '') {
    const titleLower = title.toLowerCase().trim();
    const providerLower = provider.toLowerCase().trim();

    let bestMatch = null;
    let bestScore = 0;

    // Search through all categories and products
    for (const [categoryName, products] of Object.entries(this.products)) {
      for (const [productName, productConfig] of Object.entries(products)) {
        let score = 0;

        // Check name patterns
        if (productConfig.namePatterns) {
          for (const pattern of productConfig.namePatterns) {
            if (titleLower.includes(pattern.toLowerCase()) || 
                providerLower.includes(pattern.toLowerCase())) {
              score += 10; // High weight for name patterns
            }
          }
        }

        // Check provider patterns
        if (productConfig.providerPatterns) {
          for (const pattern of productConfig.providerPatterns) {
            if (providerLower.includes(pattern.toLowerCase())) {
              score += 8; // Good weight for provider patterns
            }
          }
        }

        // Exact matches get bonus points
        if (titleLower.includes(productName.toLowerCase())) {
          score += 15;
        }

        // Category name matches
        if (titleLower.includes(categoryName.toLowerCase())) {
          score += 5;
        }

        // Track best match
        if (score > bestScore && score >= 5) { // Minimum threshold
          bestScore = score;
          bestMatch = {
            category: categoryName,
            productType: productName,
            config: productConfig,
            confidence: Math.min(score / 20, 1.0) // Normalize to 0-1
          };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Get product configuration by category and type
   * @param {string} category - Product category
   * @param {string} productType - Specific product type
   * @returns {Object|null} - Product configuration
   */
  getProductConfig(category, productType) {
    if (this.products[category] && this.products[category][productType]) {
      return {
        category,
        productType,
        config: this.products[category][productType]
      };
    }
    return null;
  }

  /**
   * Get all products in a category
   * @param {string} category - Product category
   * @returns {Object} - All products in category
   */
  getProductsByCategory(category) {
    return this.products[category] || {};
  }

  /**
   * Get all available categories
   * @returns {Array} - List of category names
   */
  getCategories() {
    return Object.keys(this.products);
  }

  /**
   * Get all product types across all categories
   * @returns {Array} - List of all product types
   */
  getAllProductTypes() {
    const productTypes = [];
    for (const category of Object.values(this.products)) {
      productTypes.push(...Object.keys(category));
    }
    return productTypes;
  }

  /**
   * Generate renewal defaults from detected product
   * @param {Object} detection - Result from detectProductType
   * @returns {Object} - Renewal info defaults
   */
  generateRenewalDefaults(detection) {
    if (!detection || !detection.config) {
      return null;
    }

    const config = detection.config;
    const today = new Date();

    return {
      productType: detection.productType,
      productCategory: detection.category,
      endDateType: config.endDateType || 'hard_end',
      renewalCycle: 'annual', // Default to annual
      isAutoRenewal: config.endDateType === 'auto_renewal',
      requiresAction: config.requiresAction !== false,
      noticePeriod: config.noticePeriod,
      reminderDays: config.reminderDays || [30, 7],
      urgencyLevel: config.urgencyLevel || 'important',
      regulatoryType: config.regulatoryType,
      complianceNotes: config.complianceNotes,
      isActive: true,
      lastProcessedDate: today
    };
  }

  /**
   * Suggest reminder schedule based on product urgency
   * @param {string} category - Product category
   * @param {string} urgencyLevel - Urgency level (critical/important/strategic)
   * @returns {Array} - Suggested reminder days
   */
  suggestReminderSchedule(category, urgencyLevel) {
    // Base schedules by urgency
    const schedules = {
      'critical': [30, 14, 7, 3, 1],
      'important': [60, 30, 14, 7],
      'strategic': [120, 90, 60, 30]
    };

    // Category-specific adjustments
    const categoryAdjustments = {
      'Official': [30, 14, 7, 3, 1], // Government docs need frequent reminders
      'Insurance': [60, 30, 14, 7], // Insurance is critical
      'Finance': [120, 90, 60, 30], // Financial products need early planning
      'Contracts': [90, 60, 30, 14] // Contracts need notice period planning
    };

    return categoryAdjustments[category] || schedules[urgencyLevel] || schedules['important'];
  }

  /**
   * Check if product requires urgent attention
   * @param {Object} renewalInfo - Entry renewal info
   * @param {number} daysUntilExpiry - Days until expiry
   * @returns {boolean} - Whether urgent attention is required
   */
  requiresUrgentAttention(renewalInfo, daysUntilExpiry) {
    if (!renewalInfo || !renewalInfo.urgencyLevel) {
      return false;
    }

    const urgentThresholds = {
      'critical': 14, // Critical items need 2 weeks notice
      'important': 7,  // Important items need 1 week notice
      'strategic': 3   // Strategic items need 3 days notice
    };

    const threshold = urgentThresholds[renewalInfo.urgencyLevel] || 7;
    return daysUntilExpiry <= threshold;
  }

  /**
   * Get UK-specific compliance information
   * @param {string} category - Product category
   * @param {string} productType - Product type
   * @returns {Object} - Compliance information
   */
  getComplianceInfo(category, productType) {
    const config = this.getProductConfig(category, productType);
    if (!config) {
      return null;
    }

    return {
      regulatoryType: config.config.regulatoryType,
      complianceNotes: config.config.complianceNotes,
      renewalNotes: config.config.renewalNotes,
      isLegalRequirement: ['government_required', 'fca_regulated'].includes(config.config.regulatoryType),
      requiresAction: config.config.requiresAction !== false
    };
  }
}

// Export singleton instance
const productDetectionService = new ProductDetectionService();
module.exports = productDetectionService;