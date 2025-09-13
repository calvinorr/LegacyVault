// Product Detection API Routes
// Endpoints for intelligent UK financial product type detection

const express = require('express');
const router = express.Router();
const productDetectionService = require('../utils/productDetection');
const Category = require('../models/category');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * POST /api/product-detection/analyze
 * Analyze entry data and suggest product type and renewal settings
 */
router.post('/analyze', async (req, res) => {
  try {
    const { title, provider, billType } = req.body;

    if (!title && !provider) {
      return res.status(400).json({ 
        error: 'Either title or provider must be provided' 
      });
    }

    // Detect product type using our service
    const detection = productDetectionService.detectProductType(title, provider);
    
    if (!detection) {
      return res.json({
        detected: false,
        suggestion: null,
        renewalDefaults: null
      });
    }

    // Generate renewal defaults based on detection
    const renewalDefaults = productDetectionService.generateRenewalDefaults(detection);

    // Get compliance information
    const complianceInfo = productDetectionService.getComplianceInfo(
      detection.category, 
      detection.productType
    );

    // Try to find matching categories in the database
    let suggestedCategories = [];
    try {
      suggestedCategories = await Category.find({
        userId: req.user.id,
        'renewalSettings.productCategory': detection.category,
        isDeleted: false
      }).limit(5);
    } catch (error) {
      console.log('Category lookup failed:', error.message);
    }

    res.json({
      detected: true,
      confidence: detection.confidence,
      suggestion: {
        category: detection.category,
        productType: detection.productType,
        config: detection.config
      },
      renewalDefaults,
      complianceInfo,
      suggestedCategories: suggestedCategories.map(cat => ({
        id: cat._id,
        name: cat.name,
        fullPath: cat.getFullPath ? cat.getFullPath() : cat.name,
        renewalSettings: cat.renewalSettings
      })),
      recommendations: generateRecommendations(detection, complianceInfo)
    });

  } catch (error) {
    console.error('Product detection error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze product type',
      details: error.message 
    });
  }
});

/**
 * GET /api/product-detection/categories
 * Get all available UK financial product categories
 */
router.get('/categories', (req, res) => {
  try {
    const categories = productDetectionService.getCategories();
    
    const categoryDetails = categories.map(category => {
      const products = productDetectionService.getProductsByCategory(category);
      return {
        name: category,
        productCount: Object.keys(products).length,
        products: Object.keys(products)
      };
    });

    res.json({
      categories: categoryDetails,
      totalProducts: productDetectionService.getAllProductTypes().length
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      details: error.message 
    });
  }
});

/**
 * GET /api/product-detection/products/:category
 * Get all products in a specific category
 */
router.get('/products/:category', (req, res) => {
  try {
    const { category } = req.params;
    const products = productDetectionService.getProductsByCategory(category);

    if (!products || Object.keys(products).length === 0) {
      return res.status(404).json({ 
        error: 'Category not found or has no products' 
      });
    }

    const productDetails = Object.entries(products).map(([name, config]) => ({
      name,
      config,
      reminderSchedule: config.reminderDays,
      urgencyLevel: config.urgencyLevel,
      regulatoryType: config.regulatoryType,
      averageTerm: config.averageTerm,
      namePatterns: config.namePatterns,
      providerPatterns: config.providerPatterns
    }));

    res.json({
      category,
      products: productDetails
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error.message 
    });
  }
});

/**
 * POST /api/product-detection/suggest-reminders
 * Suggest reminder schedule based on category and urgency
 */
router.post('/suggest-reminders', (req, res) => {
  try {
    const { category, urgencyLevel } = req.body;

    if (!category || !urgencyLevel) {
      return res.status(400).json({ 
        error: 'Category and urgencyLevel are required' 
      });
    }

    const suggestedSchedule = productDetectionService.suggestReminderSchedule(
      category, 
      urgencyLevel
    );

    res.json({
      category,
      urgencyLevel,
      suggestedReminderDays: suggestedSchedule,
      explanation: getReminderExplanation(category, urgencyLevel)
    });

  } catch (error) {
    console.error('Reminder suggestion error:', error);
    res.status(500).json({ 
      error: 'Failed to suggest reminders',
      details: error.message 
    });
  }
});

/**
 * POST /api/product-detection/compliance-check
 * Check compliance requirements for a product type
 */
router.post('/compliance-check', (req, res) => {
  try {
    const { category, productType, daysUntilExpiry } = req.body;

    if (!category || !productType) {
      return res.status(400).json({ 
        error: 'Category and productType are required' 
      });
    }

    const complianceInfo = productDetectionService.getComplianceInfo(category, productType);
    
    if (!complianceInfo) {
      return res.status(404).json({ 
        error: 'Product type not found' 
      });
    }

    const requiresUrgent = daysUntilExpiry !== undefined ? 
      productDetectionService.requiresUrgentAttention(
        { urgencyLevel: complianceInfo.urgencyLevel }, 
        daysUntilExpiry
      ) : false;

    res.json({
      ...complianceInfo,
      requiresUrgentAttention: requiresUrgent,
      daysUntilExpiry: daysUntilExpiry || null,
      actionRequired: complianceInfo.requiresAction && requiresUrgent
    });

  } catch (error) {
    console.error('Compliance check error:', error);
    res.status(500).json({ 
      error: 'Failed to check compliance',
      details: error.message 
    });
  }
});

// Helper function to generate recommendations
function generateRecommendations(detection, complianceInfo) {
  const recommendations = [];

  if (complianceInfo?.isLegalRequirement) {
    recommendations.push({
      type: 'legal',
      priority: 'high',
      message: 'This is a legal requirement - missing renewals may result in penalties'
    });
  }

  if (detection.config.regulatoryType === 'fca_regulated') {
    recommendations.push({
      type: 'regulatory',
      priority: 'medium',
      message: 'FCA regulated product - check terms and cooling-off periods'
    });
  }

  if (detection.config.endDateType === 'auto_renewal') {
    recommendations.push({
      type: 'auto_renewal',
      priority: 'medium',
      message: 'Auto-renewal product - set early reminders to compare alternatives'
    });
  }

  if (detection.config.noticePeriod) {
    recommendations.push({
      type: 'notice_period',
      priority: 'high',
      message: `${detection.config.noticePeriod} days notice required for changes`
    });
  }

  if (detection.confidence < 0.7) {
    recommendations.push({
      type: 'confidence',
      priority: 'low',
      message: 'Product detection confidence is low - please verify settings'
    });
  }

  return recommendations;
}

// Helper function to explain reminder schedules
function getReminderExplanation(category, urgencyLevel) {
  const explanations = {
    'critical': 'Frequent reminders for legally required items',
    'important': 'Regular reminders for financial commitments',
    'strategic': 'Early warnings for planning opportunities'
  };

  const categoryNotes = {
    'Official': 'Government documents require early and frequent reminders',
    'Insurance': 'Insurance products need time for comparison shopping',
    'Finance': 'Financial products benefit from early review planning',
    'Contracts': 'Contracts need notice period planning'
  };

  return {
    urgency: explanations[urgencyLevel] || 'Standard reminder schedule',
    category: categoryNotes[category] || 'Standard category handling'
  };
}

module.exports = router;