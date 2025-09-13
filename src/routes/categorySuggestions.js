const express = require('express');
const router = express.Router();
const RecurringDetectionRules = require('../models/RecurringDetectionRules');
const Category = require('../models/category');
const { requireAuth } = require('../middleware/auth');

// Legacy category to dynamic category mappings
const LEGACY_CATEGORY_MAPPINGS = {
  'bills': 'Bills',
  'utilities': 'Bills', // Legacy support
  'subscriptions': 'Subscriptions',
  'insurance': 'Insurance',
  'council_tax': 'Bills',
  'telecoms': 'Bills',
  'other': 'Bills'
};

const SUBCATEGORY_MAPPINGS = {
  'gas': ['Bills', 'Energy', 'Gas'],
  'electricity': ['Bills', 'Energy', 'Electricity'],
  'water': ['Bills', 'Water'],
  'internet': ['Bills', 'Communications'],
  'mobile': ['Bills', 'Communications'],
  'streaming': ['Subscriptions', 'Streaming'],
  'council_services': ['Bills', 'Council Services']
};

/**
 * Fuzzy match payee against rule patterns
 */
function fuzzyMatchPayee(payee, patterns) {
  if (!patterns || patterns.length === 0) {
    return { match: false, score: 0 };
  }
  
  const payeeUpper = payee.toUpperCase();
  let bestScore = 0;
  let bestPattern = null;
  
  for (const pattern of patterns) {
    const patternUpper = pattern.toUpperCase();
    
    // Check for exact substring match first
    if (payeeUpper.includes(patternUpper) || patternUpper.includes(payeeUpper)) {
      return { match: true, score: 1.0, matchedPattern: pattern };
    }
    
    // Simple similarity calculation
    const score = calculateStringSimilarity(payeeUpper, patternUpper);
    if (score > bestScore) {
      bestScore = score;
      bestPattern = pattern;
    }
  }
  
  const threshold = 0.75; // 75% similarity threshold
  return {
    match: bestScore >= threshold,
    score: bestScore,
    matchedPattern: bestPattern
  };
}

/**
 * Calculate string similarity
 */
function calculateStringSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance
 */
function levenshteinDistance(str1, str2) {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Find category in dynamic category tree by path
 */
function findCategoryByPath(categories, path) {
  if (path.length === 0) return null;
  
  let currentLevel = categories;
  let currentCategory = null;
  
  for (const pathSegment of path) {
    currentCategory = currentLevel.find(cat => 
      cat.name.toLowerCase() === pathSegment.toLowerCase()
    ) || null;
    
    if (!currentCategory) {
      return null;
    }
    
    currentLevel = currentCategory.children || [];
  }
  
  return currentCategory;
}

/**
 * Build hierarchical category tree
 */
async function buildCategoryTree(userId) {
  const categories = await Category.find({
    userId: userId,
    isDeleted: false
  }).sort({ name: 1 });
  
  // Create a map for quick lookup
  const categoryMap = new Map();
  categories.forEach(cat => {
    categoryMap.set(cat._id.toString(), {
      _id: cat._id.toString(),
      name: cat.name,
      parentId: cat.parentId ? cat.parentId.toString() : null,
      children: []
    });
  });
  
  // Build the tree structure
  const rootCategories = [];
  
  categories.forEach(cat => {
    const categoryData = categoryMap.get(cat._id.toString());
    
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId.toString());
      if (parent) {
        parent.children.push(categoryData);
      } else {
        rootCategories.push(categoryData);
      }
    } else {
      rootCategories.push(categoryData);
    }
  });
  
  return rootCategories;
}

/**
 * Map legacy category to dynamic category structure
 */
function mapLegacyCategoryToDynamic(legacyCategory, subcategory, dynamicCategories) {
  // Try subcategory mapping first
  if (subcategory && SUBCATEGORY_MAPPINGS[subcategory]) {
    const path = SUBCATEGORY_MAPPINGS[subcategory];
    const category = findCategoryByPath(dynamicCategories, path);
    
    if (category) {
      return {
        categoryId: category._id,
        categoryName: category.name,
        subcategoryName: subcategory
      };
    }
  }
  
  // Fallback to root category mapping
  const rootCategoryName = LEGACY_CATEGORY_MAPPINGS[legacyCategory];
  if (rootCategoryName) {
    const rootCategory = dynamicCategories.find(cat => 
      cat.name.toLowerCase() === rootCategoryName.toLowerCase()
    );
    
    if (rootCategory) {
      // If we have children, try to find a sensible default child
      if (rootCategory.children && rootCategory.children.length > 0) {
        const defaultChild = rootCategory.children[0];
        return {
          categoryId: defaultChild._id,
          categoryName: defaultChild.name,
          subcategoryName: subcategory || ''
        };
      }
      
      return {
        categoryId: rootCategory._id,
        categoryName: rootCategory.name,
        subcategoryName: subcategory || ''
      };
    }
  }
  
  return null;
}

/**
 * Calculate suggestion confidence score
 */
function calculateSuggestionConfidence(factors) {
  const {
    patternMatchScore = 0.5,
    ruleConfidenceBoost = 0,
    hasAmountPattern = false,
    isFrequentPayee = false
  } = factors;
  
  // Base confidence from pattern match
  let confidence = patternMatchScore * 0.7;
  
  // Add rule-specific boost
  confidence += ruleConfidenceBoost;
  
  // Boost for amount patterns (typical bill amounts)
  if (hasAmountPattern) {
    confidence += 0.1;
  }
  
  // Boost for frequent payees
  if (isFrequentPayee) {
    confidence += 0.15;
  }
  
  // Ensure confidence doesn't exceed 1.0
  return Math.min(confidence, 1.0);
}

// GET /api/categories/suggest/:payee
// Get category suggestions based on payee/description
router.get('/suggest/:payee', requireAuth, async (req, res) => {
  try {
    const { payee } = req.params;
    const { description } = req.query;
    const userId = req.user.id;
    
    // Load detection rules
    const rules = await RecurringDetectionRules.findOne({ is_default: true });
    if (!rules) {
      return res.json([]);
    }
    
    // Load user's dynamic categories
    const dynamicCategories = await buildCategoryTree(userId);
    
    // Get all rules
    const allRules = [
      ...(rules.bill_rules || []),
      ...(rules.utility_rules || []), // Legacy support
      ...(rules.council_tax_rules || []),
      ...(rules.insurance_rules || []),
      ...(rules.subscription_rules || []),
      ...(rules.telecoms_rules || []),
      ...(rules.general_rules || [])
    ];
    
    const suggestions = [];
    const searchText = description || payee;
    
    for (const rule of allRules) {
      if (rule.active !== false) {
        const match = fuzzyMatchPayee(searchText, rule.patterns);
        
        if (match.match) {
          const categoryMapping = mapLegacyCategoryToDynamic(
            rule.category, 
            rule.subcategory || '', 
            dynamicCategories
          );
          
          if (categoryMapping) {
            const confidence = calculateSuggestionConfidence({
              patternMatchScore: match.score,
              ruleConfidenceBoost: rule.confidence_boost,
              hasAmountPattern: true, // Assume typical bill amount for suggestions
              isFrequentPayee: false // Would need historical data
            });
            
            suggestions.push({
              categoryId: categoryMapping.categoryId,
              categoryName: categoryMapping.categoryName,
              subcategoryName: categoryMapping.subcategoryName,
              confidence,
              provider: rule.provider || rule.name,
              matchedPattern: match.matchedPattern,
              reason: `Matched pattern: ${match.matchedPattern}`
            });
          }
        }
      }
    }
    
    // Sort by confidence and return top suggestions
    const sortedSuggestions = suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Return top 5 suggestions
    
    res.json(sortedSuggestions);
    
  } catch (error) {
    console.error('Error in category suggestions:', error);
    res.status(500).json({ error: 'Failed to get category suggestions' });
  }
});

// GET /api/recurring-rules
// Get recurring detection rules (for frontend use)
router.get('/rules', requireAuth, async (req, res) => {
  try {
    const rules = await RecurringDetectionRules.findOne({ is_default: true });
    
    if (!rules) {
      return res.json({
        bill_rules: [],
        utility_rules: [],
        council_tax_rules: [],
        insurance_rules: [],
        subscription_rules: [],
        telecoms_rules: [],
        general_rules: []
      });
    }
    
    res.json({
      bill_rules: rules.bill_rules || [],
      utility_rules: rules.utility_rules || [],
      council_tax_rules: rules.council_tax_rules || [],
      insurance_rules: rules.insurance_rules || [],
      subscription_rules: rules.subscription_rules || [],
      telecoms_rules: rules.telecoms_rules || [],
      general_rules: rules.general_rules || []
    });
    
  } catch (error) {
    console.error('Error loading recurring rules:', error);
    res.status(500).json({ error: 'Failed to load recurring rules' });
  }
});

module.exports = router;