const fuzzball = require('fuzzball');
const RecurringDetectionRules = require('../models/RecurringDetectionRules');

/**
 * Detect recurring payments from transaction list
 * @param {Array} transactions - Array of transaction objects
 * @returns {Promise<Array>} Array of recurring payment suggestions
 */
async function detectRecurringPayments(transactions) {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  // Load detection rules
  const rules = await RecurringDetectionRules.findOne({ is_default: true });
  if (!rules) {
    console.warn('No default detection rules found');
    return [];
  }

  // Filter valid transactions
  const validTransactions = transactions.filter(t => 
    t.date && 
    t.description && 
    t.amount !== null && 
    !isNaN(t.amount)
  );

  if (validTransactions.length === 0) {
    return [];
  }

  // Group similar transactions
  const transactionGroups = groupSimilarTransactions(validTransactions, rules);

  // Analyze each group for recurring patterns
  const suggestions = [];
  for (const group of transactionGroups) {
    const suggestion = await analyzeTransactionGroup(group, rules);
    if (suggestion) {
      if (suggestion.confidence >= rules.settings.min_confidence_threshold) {
        suggestions.push(suggestion);
      }
    }
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Group similar transactions together
 * @param {Array} transactions - Valid transactions
 * @param {Object} rules - Detection rules
 * @returns {Array} Array of transaction groups
 */
function groupSimilarTransactions(transactions, rules) {
  const groups = [];
  
  for (const transaction of transactions) {
    let foundGroup = false;
    
    for (const group of groups) {
      const representative = group[0];
      
      // Check if transaction belongs to this group
      if (areSimilarTransactions(transaction, representative, rules)) {
        group.push(transaction);
        foundGroup = true;
        break;
      }
    }
    
    if (!foundGroup) {
      groups.push([transaction]);
    }
  }
  
  // Filter groups with minimum occurrences
  return groups.filter(group => group.length >= 2);
}

/**
 * Check if two transactions are similar enough to be grouped
 * @param {Object} t1 - First transaction
 * @param {Object} t2 - Second transaction
 * @param {Object} rules - Detection rules
 * @returns {boolean} True if similar
 */
function areSimilarTransactions(t1, t2, rules) {
  // Fuzzy match descriptions
  const descriptionSimilarity = fuzzball.ratio(
    t1.description.toLowerCase(), 
    t2.description.toLowerCase()
  ) / 100;
  
  if (descriptionSimilarity < rules.settings.fuzzy_match_threshold) {
    return false;
  }
  
  // Check amount variance
  const amount1 = Math.abs(t1.amount);
  const amount2 = Math.abs(t2.amount);
  const amountVariance = Math.abs(amount1 - amount2) / Math.max(amount1, amount2);
  
  return amountVariance <= rules.settings.amount_variance_tolerance;
}

/**
 * Analyze a group of transactions for recurring patterns
 * @param {Array} transactions - Group of similar transactions
 * @param {Object} rules - Detection rules
 * @returns {Promise<Object|null>} Suggestion object or null
 */
async function analyzeTransactionGroup(transactions, rules) {
  if (transactions.length < 2) {
    return null;
  }
  
  // Sort by date
  transactions.sort((a, b) => a.date - b.date);
  
  // Analyze frequency
  const frequency = analyzeTransactionFrequency(transactions);
  
  // Find matching rule
  const ruleMatch = findMatchingRule(transactions[0].description, rules);
  
  // Calculate confidence
  const confidence = calculateGroupConfidence(transactions, frequency, ruleMatch, rules);
  
  // Generate suggestion
  const suggestion = {
    payee: ruleMatch.provider || extractPayeeName(transactions[0].description),
    category: ruleMatch.category || 'other', 
    subcategory: ruleMatch.subcategory || null,
    amount: calculateTypicalAmount(transactions),
    frequency,
    confidence,
    transactions: transactions.map(t => ({
      date: t.date,
      description: t.description,
      amount: t.amount,
      originalText: t.originalText
    })),
    suggested_entry: {
      title: generateEntryTitle(ruleMatch, transactions[0]),
      provider: ruleMatch.provider || extractPayeeName(transactions[0].description),
      type: mapCategoryToType(ruleMatch.category),
      accountDetails: {}
    },
    status: 'pending'
  };
  
  return suggestion;
}

/**
 * Analyze transaction frequency
 * @param {Array} transactions - Sorted transactions
 * @returns {string} Frequency (weekly, monthly, quarterly, annually, irregular)
 */
function analyzeTransactionFrequency(transactions) {
  if (transactions.length < 2) {
    return 'irregular';
  }
  
  const intervals = [];
  for (let i = 1; i < transactions.length; i++) {
    const daysDiff = Math.round((transactions[i].date - transactions[i-1].date) / (1000 * 60 * 60 * 24));
    intervals.push(daysDiff);
  }
  
  const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - averageInterval, 2), 0) / intervals.length;
  const standardDeviation = Math.sqrt(variance);
  
  // If variance is too high, it's irregular
  if (standardDeviation > averageInterval * 0.3) {
    return 'irregular';
  }
  
  // Classify by average interval
  if (averageInterval <= 10) return 'weekly';
  if (averageInterval <= 35) return 'monthly';
  if (averageInterval <= 100) return 'quarterly';
  if (averageInterval <= 400) return 'annually';
  
  return 'irregular';
}

/**
 * Find matching rule for transaction description
 * @param {String} description - Transaction description
 * @param {Object} rules - Detection rules
 * @returns {Object} Matched rule or default
 */
function findMatchingRule(description, rules) {
  const allRules = [
    ...(rules.utility_rules || []),
    ...(rules.council_tax_rules || []),
    ...(rules.telecoms_rules || []),
    ...(rules.subscription_rules || []),
    ...(rules.insurance_rules || []),
    ...(rules.general_rules || [])
  ];
  
  for (const rule of allRules) {
    if (rule.active !== false) {
      const match = fuzzyMatchPayee(description, rule.patterns);
      if (match.match) {
        // Extract plain object data from Mongoose document
        const plainRule = rule.toObject ? rule.toObject() : rule;
        return { ...plainRule, fuzzyScore: match.score };
      }
    }
  }
  
  return { category: 'other', provider: null, confidence_boost: 0 };
}

/**
 * Fuzzy match payee against patterns
 * @param {String} payee - Payee description
 * @param {Array} patterns - Array of pattern strings
 * @returns {Object} Match result with score
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
    
    // Check for exact match first
    if (payeeUpper.includes(patternUpper) || patternUpper.includes(payeeUpper)) {
      return { match: true, score: 1.0, matchedPattern: pattern };
    }
    
    // Fuzzy match
    const score = fuzzball.ratio(payeeUpper, patternUpper) / 100;
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
 * Calculate confidence score for transaction group
 * @param {Array} transactions - Transaction group
 * @param {String} frequency - Detected frequency
 * @param {Object} ruleMatch - Matched rule
 * @param {Object} rules - Detection rules
 * @returns {number} Confidence score (0-1)
 */
function calculateGroupConfidence(transactions, frequency, ruleMatch, rules) {
  return calculateConfidenceScore({
    frequencyConsistency: calculateFrequencyConsistency(transactions, frequency),
    amountConsistency: calculateAmountConsistency(transactions),
    patternMatch: ruleMatch.fuzzyScore || 0.5,
    occurrenceCount: transactions.length,
    ruleBoost: ruleMatch.confidence_boost || 0
  });
}

/**
 * Calculate confidence score from components
 * @param {Object} data - Confidence data components
 * @returns {number} Overall confidence score
 */
function calculateConfidenceScore(data) {
  const {
    frequencyConsistency = 0.5,
    amountConsistency = 0.5,
    patternMatch = 0.5,
    occurrenceCount = 2,
    ruleBoost = 0
  } = data;
  
  // Base score from components
  let baseScore = (
    frequencyConsistency * 0.3 +
    amountConsistency * 0.25 +
    patternMatch * 0.35 +
    Math.min(occurrenceCount / 5, 1) * 0.1 // Occurrence bonus up to 5 occurrences
  );
  
  // Apply rule boost
  baseScore += ruleBoost;
  
  // Penalize low occurrence counts
  if (occurrenceCount < 3) {
    baseScore *= 0.8;
  }
  
  return Math.min(baseScore, 1.0);
}

/**
 * Calculate frequency consistency score
 * @param {Array} transactions - Sorted transactions
 * @param {String} frequency - Expected frequency
 * @returns {number} Consistency score (0-1)
 */
function calculateFrequencyConsistency(transactions, frequency) {
  if (transactions.length < 3) {
    return 0.6; // Default for small sample
  }
  
  const expectedIntervals = {
    'weekly': 7,
    'monthly': 30,
    'quarterly': 91,
    'annually': 365
  };
  
  const expectedInterval = expectedIntervals[frequency];
  if (!expectedInterval) {
    return 0.3; // Low score for irregular
  }
  
  const intervals = [];
  for (let i = 1; i < transactions.length; i++) {
    const daysDiff = Math.round((transactions[i].date - transactions[i-1].date) / (1000 * 60 * 60 * 24));
    intervals.push(daysDiff);
  }
  
  const deviations = intervals.map(interval => Math.abs(interval - expectedInterval) / expectedInterval);
  const averageDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  
  return Math.max(0, 1 - averageDeviation * 2);
}

/**
 * Calculate amount consistency score
 * @param {Array} transactions - Transactions
 * @returns {number} Consistency score (0-1)
 */
function calculateAmountConsistency(transactions) {
  if (transactions.length < 2) {
    return 1.0;
  }
  
  const amounts = transactions.map(t => Math.abs(t.amount));
  const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / amounts.length;
  const coefficientOfVariation = Math.sqrt(variance) / average;
  
  return Math.max(0, 1 - coefficientOfVariation * 2);
}

/**
 * Calculate typical amount from transactions
 * @param {Array} transactions - Transactions
 * @returns {number} Typical amount (negative for debits)
 */
function calculateTypicalAmount(transactions) {
  const amounts = transactions.map(t => t.amount);
  amounts.sort((a, b) => a - b);
  
  // Return median
  const mid = Math.floor(amounts.length / 2);
  return amounts.length % 2 === 0 
    ? (amounts[mid - 1] + amounts[mid]) / 2
    : amounts[mid];
}

/**
 * Extract payee name from description
 * @param {String} description - Transaction description
 * @returns {String} Cleaned payee name
 */
function extractPayeeName(description) {
  // Remove common prefixes and suffixes
  let payee = description
    .replace(/^(DD|SO|TFR|CHQ|FPO|ATM|POS)\s+/i, '') // Payment type prefixes
    .replace(/\s+(DD|SO|TFR|CHQ|FPO|ATM|POS)$/i, '') // Payment type suffixes
    .replace(/\s+\d{2}[/-]\d{2}[/-]\d{2,4}.*$/, '') // Remove dates at end
    .replace(/\s+£?\d+\.?\d*$/, '') // Remove amounts at end
    .replace(/\s+REF\s+\w+$/, '') // Remove reference numbers
    .trim();
  
  // Capitalize first letter of each word
  return payee.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Generate entry title from rule and transaction
 * @param {Object} ruleMatch - Matched rule
 * @param {Object} transaction - Transaction
 * @returns {String} Generated title
 */
function generateEntryTitle(ruleMatch, transaction) {
  if (ruleMatch.provider && ruleMatch.subcategory) {
    return `${ruleMatch.provider} - ${ruleMatch.subcategory}`;
  }
  
  if (ruleMatch.provider) {
    return ruleMatch.provider;
  }
  
  const payee = extractPayeeName(transaction.description);
  const category = ruleMatch.category === 'other' ? 'Service' : ruleMatch.category;
  
  return `${payee} - ${category}`;
}

/**
 * Map category to Entry type enum
 * @param {String} category - Category from rules
 * @returns {String} Entry type
 */
function mapCategoryToType(category) {
  const mapping = {
    'utilities': 'utility',
    'council_tax': 'utility',
    'telecoms': 'utility',
    'subscription': 'utility',
    'insurance': 'policy',
    'other': 'other'
  };
  
  return mapping[category] || 'other';
}

module.exports = {
  detectRecurringPayments,
  analyzeTransactionFrequency,
  fuzzyMatchPayee,
  calculateConfidenceScore
};