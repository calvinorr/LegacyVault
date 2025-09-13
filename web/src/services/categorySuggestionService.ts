interface Transaction {
  date: string;
  description: string;
  amount: number;
  originalText: string;
}

interface CategorySuggestion {
  categoryId: string;
  categoryName: string;
  categoryPath: string;
  parentCategoryId: string | null;
  parentCategoryName: string | null;
  rootCategoryId: string;
  rootCategoryName: string;
  confidence: number;
  reason: string;
  provider?: string;
  suggestedBillType?: string;
}

interface MappedEntry {
  title: string;
  provider: string;
  category: string;
  subCategory: string;
  accountDetails: {
    billType: string;
  };
}

interface EnhancedMappedEntry extends MappedEntry {
  suggestedCategories: CategorySuggestion[];
  categoryConfidence: number;
  recommendedCategoryId: string | null;
}

interface RecurringRule {
  name: string;
  patterns: string[];
  category: string;
  subcategory?: string;
  provider?: string;
  confidence_boost: number;
  uk_specific: boolean;
  active: boolean;
}

interface DynamicCategory {
  _id: string;
  name: string;
  parentId: string | null;
  children?: DynamicCategory[];
}

interface CategoryMapping {
  categoryId: string;
  categoryName: string;
  categoryPath: string;
  parentCategoryId: string | null;
  parentCategoryName: string | null;
  rootCategoryId: string;
  rootCategoryName: string;
}

interface ConfidenceFactors {
  patternMatchScore: number;
  ruleConfidenceBoost: number;
  hasAmountPattern: boolean;
  isFrequentPayee: boolean;
}

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
 * Load recurring detection rules from API
 */
async function loadRecurringRules(): Promise<RecurringRule[]> {
  try {
    const response = await fetch('/api/recurring-rules', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to load recurring rules');
    }
    
    const data = await response.json();
    
    // Flatten all rule categories
    const allRules: RecurringRule[] = [
      ...(data.bill_rules || []),
      ...(data.utility_rules || []), // Legacy support
      ...(data.council_tax_rules || []),
      ...(data.insurance_rules || []),
      ...(data.subscription_rules || []),
      ...(data.telecoms_rules || []),
      ...(data.general_rules || [])
    ];
    
    return allRules.filter(rule => rule.active !== false);
  } catch (error) {
    console.error('Failed to load recurring rules:', error);
    return [];
  }
}

/**
 * Load dynamic categories from API
 */
async function loadDynamicCategories(): Promise<DynamicCategory[]> {
  try {
    const response = await fetch('/api/categories', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to load categories');
    }
    
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Failed to load dynamic categories:', error);
    return [];
  }
}

/**
 * Fuzzy match payee against rule patterns
 */
function fuzzyMatchPayee(payee: string, patterns: string[]): { match: boolean; score: number; matchedPattern?: string } {
  if (!patterns || patterns.length === 0) {
    return { match: false, score: 0 };
  }
  
  const payeeUpper = payee.toUpperCase();
  let bestScore = 0;
  let bestPattern: string | undefined;
  
  for (const pattern of patterns) {
    const patternUpper = pattern.toUpperCase();
    
    // Check for exact substring match first
    if (payeeUpper.includes(patternUpper) || patternUpper.includes(payeeUpper)) {
      return { match: true, score: 1.0, matchedPattern: pattern };
    }
    
    // Simple fuzzy matching - calculate similarity
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
 * Calculate string similarity (simplified Levenshtein-like approach)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
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
function findCategoryByPath(categories: DynamicCategory[], path: string[]): DynamicCategory | null {
  if (path.length === 0) return null;
  
  let currentLevel = categories;
  let currentCategory: DynamicCategory | null = null;
  
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
 * Build category path string
 */
function buildCategoryPath(categories: DynamicCategory[], categoryId: string): string {
  const findPath = (cats: DynamicCategory[], targetId: string, currentPath: string[] = []): string[] | null => {
    for (const cat of cats) {
      const newPath = [...currentPath, cat.name];
      
      if (cat._id === targetId) {
        return newPath;
      }
      
      if (cat.children && cat.children.length > 0) {
        const childPath = findPath(cat.children, targetId, newPath);
        if (childPath) {
          return childPath;
        }
      }
    }
    return null;
  };
  
  const path = findPath(categories, categoryId);
  return path ? path.join(' > ') : '';
}

/**
 * Get parent and root categories for a given category
 */
function getCategoryHierarchy(categories: DynamicCategory[], categoryId: string): {
  category: DynamicCategory | null;
  parent: DynamicCategory | null;
  root: DynamicCategory | null;
} {
  const findInTree = (cats: DynamicCategory[], targetId: string, parent: DynamicCategory | null = null, root: DynamicCategory | null = null): {
    category: DynamicCategory | null;
    parent: DynamicCategory | null;
    root: DynamicCategory | null;
  } => {
    for (const cat of cats) {
      if (cat._id === targetId) {
        return {
          category: cat,
          parent,
          root: root || (parent ? findRootCategory(categories, parent._id) : null)
        };
      }
      
      if (cat.children && cat.children.length > 0) {
        const result = findInTree(cat.children, targetId, cat, root || cat);
        if (result.category) {
          return result;
        }
      }
    }
    
    return { category: null, parent: null, root: null };
  };
  
  return findInTree(categories, categoryId);
}

/**
 * Find root category for a given category ID
 */
function findRootCategory(categories: DynamicCategory[], categoryId: string): DynamicCategory | null {
  for (const cat of categories) {
    if (cat._id === categoryId && !cat.parentId) {
      return cat;
    }
    
    if (cat.children && cat.children.length > 0) {
      const found = findInTree(cat.children, categoryId);
      if (found) {
        return cat; // This is the root
      }
    }
  }
  return null;
}

/**
 * Helper to find category in tree
 */
function findInTree(categories: DynamicCategory[], categoryId: string): boolean {
  for (const cat of categories) {
    if (cat._id === categoryId) {
      return true;
    }
    
    if (cat.children && cat.children.length > 0 && findInTree(cat.children, categoryId)) {
      return true;
    }
  }
  return false;
}

/**
 * Map legacy category to dynamic category structure
 */
export function mapLegacyCategoryToDynamic(
  legacyCategory: string, 
  subcategory: string, 
  dynamicCategories: DynamicCategory[]
): CategoryMapping | null {
  // Try subcategory mapping first
  if (subcategory && SUBCATEGORY_MAPPINGS[subcategory]) {
    const path = SUBCATEGORY_MAPPINGS[subcategory];
    const category = findCategoryByPath(dynamicCategories, path);
    
    if (category) {
      const hierarchy = getCategoryHierarchy(dynamicCategories, category._id);
      return {
        categoryId: category._id,
        categoryName: category.name,
        categoryPath: buildCategoryPath(dynamicCategories, category._id),
        parentCategoryId: hierarchy.parent?._id || null,
        parentCategoryName: hierarchy.parent?.name || null,
        rootCategoryId: hierarchy.root?._id || category._id,
        rootCategoryName: hierarchy.root?.name || category.name
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
          categoryPath: buildCategoryPath(dynamicCategories, defaultChild._id),
          parentCategoryId: rootCategory._id,
          parentCategoryName: rootCategory.name,
          rootCategoryId: rootCategory._id,
          rootCategoryName: rootCategory.name
        };
      }
      
      return {
        categoryId: rootCategory._id,
        categoryName: rootCategory.name,
        categoryPath: rootCategory.name,
        parentCategoryId: null,
        parentCategoryName: null,
        rootCategoryId: rootCategory._id,
        rootCategoryName: rootCategory.name
      };
    }
  }
  
  return null;
}

/**
 * Calculate suggestion confidence score
 */
export function calculateSuggestionConfidence(factors: ConfidenceFactors): number {
  const {
    patternMatchScore,
    ruleConfidenceBoost,
    hasAmountPattern,
    isFrequentPayee
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

/**
 * Suggest categories based on transaction data
 */
export async function suggestCategoriesFromTransaction(transaction: Transaction): Promise<CategorySuggestion[]> {
  try {
    const [rules, categories] = await Promise.all([
      loadRecurringRules(),
      loadDynamicCategories()
    ]);
    
    const suggestions: CategorySuggestion[] = [];
    
    for (const rule of rules) {
      const match = fuzzyMatchPayee(transaction.description, rule.patterns);
      
      if (match.match) {
        const categoryMapping = mapLegacyCategoryToDynamic(rule.category, rule.subcategory || '', categories);
        
        if (categoryMapping) {
          const confidence = calculateSuggestionConfidence({
            patternMatchScore: match.score,
            ruleConfidenceBoost: rule.confidence_boost,
            hasAmountPattern: Math.abs(transaction.amount) > 10, // Typical bill amount
            isFrequentPayee: false // Would need historical data to determine this
          });
          
          suggestions.push({
            ...categoryMapping,
            confidence,
            reason: `Matched recurring payment pattern for ${rule.provider || rule.name}`,
            provider: rule.provider,
            suggestedBillType: rule.subcategory === 'gas' ? 'Gas' : 
                              rule.subcategory === 'electricity' ? 'Electricity' :
                              rule.subcategory === 'water' ? 'Water' :
                              rule.subcategory === 'streaming' ? 'Netflix/Streaming' :
                              'Other'
          });
        }
      }
    }
    
    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3); // Return top 3 suggestions
    
  } catch (error) {
    console.error('Error in suggestCategoriesFromTransaction:', error);
    return [];
  }
}

/**
 * Suggest categories based on payee name only
 */
export async function suggestCategoriesFromPayee(payee: string): Promise<CategorySuggestion[]> {
  const mockTransaction: Transaction = {
    date: new Date().toISOString().split('T')[0],
    description: payee,
    amount: -50.00, // Default amount for suggestion purposes
    originalText: payee
  };
  
  return suggestCategoriesFromTransaction(mockTransaction);
}

/**
 * Enhance transaction mapping with category suggestions
 */
export async function enhanceTransactionWithCategories(
  transaction: Transaction, 
  mappedEntry: MappedEntry
): Promise<EnhancedMappedEntry> {
  const suggestions = await suggestCategoriesFromTransaction(transaction);
  
  const bestSuggestion = suggestions.length > 0 ? suggestions[0] : null;
  
  return {
    ...mappedEntry,
    suggestedCategories: suggestions,
    categoryConfidence: bestSuggestion?.confidence || 0,
    recommendedCategoryId: bestSuggestion?.categoryId || null
  };
}