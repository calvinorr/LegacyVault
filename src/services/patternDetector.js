const fuzzball = require('fuzzball');
const Transaction = require('../models/Transaction');
const Pattern = require('../models/Pattern');

/**
 * Pattern Detector Service
 *
 * Analyzes transactions across ALL imports to detect recurring payment patterns.
 * This is the intelligence layer that enables cross-import pattern recognition.
 */

/**
 * Detect recurring patterns across all user transactions
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Array>} Array of detected patterns
 */
async function detectPatternsForUser(userId) {
  // Get all user transactions sorted by date
  const transactions = await Transaction.find({ user: userId })
    .sort({ date: 1 })
    .lean();

  if (transactions.length < 3) {
    console.log(`Not enough transactions (${transactions.length}) for pattern detection`);
    return [];
  }

  // Group similar transactions
  const groups = groupSimilarTransactions(transactions);

  // Analyze each group for recurring patterns
  const patterns = [];
  for (const group of groups) {
    if (group.length >= 2) { // Minimum 2 occurrences to be a pattern
      const pattern = analyzeTransactionGroup(group, userId);
      if (pattern && pattern.confidence >= 0.65) { // Minimum confidence threshold
        patterns.push(pattern);
      }
    }
  }

  return patterns.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Group similar transactions using fuzzy matching
 * @param {Array} transactions - All user transactions
 * @returns {Array} Array of transaction groups
 */
function groupSimilarTransactions(transactions) {
  const groups = [];
  const FUZZY_THRESHOLD = 85; // 85% similarity
  const AMOUNT_VARIANCE = 0.15; // ±15% amount variance

  for (const transaction of transactions) {
    let foundGroup = false;
    const normalizedDesc = Pattern.normalizeDescription(transaction.description);

    for (const group of groups) {
      const representative = group[0];
      const repNormalizedDesc = Pattern.normalizeDescription(representative.description);

      // Fuzzy match descriptions
      const similarity = fuzzball.ratio(normalizedDesc, repNormalizedDesc);

      // Check amount variance
      const amount1 = Math.abs(transaction.amount);
      const amount2 = Math.abs(representative.amount);
      const amountVariance = Math.abs(amount1 - amount2) / Math.max(amount1, amount2);

      if (similarity >= FUZZY_THRESHOLD && amountVariance <= AMOUNT_VARIANCE) {
        group.push(transaction);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      groups.push([transaction]);
    }
  }

  return groups.filter(group => group.length >= 2);
}

/**
 * Analyze transaction group for pattern characteristics
 * @param {Array} transactions - Group of similar transactions
 * @param {ObjectId} userId - User ID
 * @returns {Object} Pattern data
 */
function analyzeTransactionGroup(transactions, userId) {
  if (transactions.length < 2) {
    return null;
  }

  // Sort by date
  transactions.sort((a, b) => a.date - b.date);

  // Analyze frequency
  const frequency = detectFrequency(transactions);
  const frequencyScore = calculateFrequencyScore(transactions, frequency);

  // Calculate amount metrics
  const amounts = transactions.map(t => Math.abs(t.amount));
  const averageAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const minAmount = Math.min(...amounts);
  const maxAmount = Math.max(...amounts);
  const amountVariance = (maxAmount - minAmount) / averageAmount;
  const amountConsistency = Math.max(0, 1 - amountVariance);

  // Calculate confidence
  const confidence = Pattern.calculateConfidence({
    frequencyScore,
    amountConsistency,
    occurrenceCount: transactions.length
  });

  // Extract payee name
  const payee = extractPayeeName(transactions[0].description);
  const normalizedDescription = Pattern.normalizeDescription(transactions[0].description);

  // Suggest domain based on payee/description
  const domainSuggestion = suggestDomain(payee, normalizedDescription);

  return {
    user: userId,
    payee,
    normalizedDescription,
    frequency,
    averageAmount: Math.round(averageAmount * 100) / 100,
    amountVariance,
    minAmount,
    maxAmount,
    confidence,
    occurrences: transactions.length,
    firstSeen: transactions[0].date,
    lastSeen: transactions[transactions.length - 1].date,
    suggestedDomain: domainSuggestion.domain,
    suggestedRecordType: domainSuggestion.recordType,
    transactions: transactions.map(t => t._id)
  };
}

/**
 * Detect frequency from transaction dates
 * @param {Array} transactions - Sorted transactions
 * @returns {String} Frequency type
 */
function detectFrequency(transactions) {
  if (transactions.length < 2) {
    return 'irregular';
  }

  const intervals = [];
  for (let i = 1; i < transactions.length; i++) {
    const daysDiff = Math.round((transactions[i].date - transactions[i - 1].date) / (1000 * 60 * 60 * 24));
    intervals.push(daysDiff);
  }

  const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - averageInterval, 2), 0) / intervals.length;
  const standardDeviation = Math.sqrt(variance);

  // High variance = irregular
  if (standardDeviation > averageInterval * 0.4) {
    return 'irregular';
  }

  // Classify by average interval (with tolerance)
  if (averageInterval >= 5 && averageInterval <= 10) return 'weekly';
  if (averageInterval >= 25 && averageInterval <= 35) return 'monthly';
  if (averageInterval >= 85 && averageInterval <= 95) return 'quarterly';
  if (averageInterval >= 350 && averageInterval <= 380) return 'annually';

  return 'irregular';
}

/**
 * Calculate frequency consistency score
 * @param {Array} transactions - Sorted transactions
 * @param {String} frequency - Expected frequency
 * @returns {Number} Score (0-1)
 */
function calculateFrequencyScore(transactions, frequency) {
  if (transactions.length < 3) {
    return 0.6; // Default for small sample
  }

  const expectedIntervals = {
    weekly: 7,
    monthly: 30,
    quarterly: 91,
    annually: 365
  };

  const expectedInterval = expectedIntervals[frequency];
  if (!expectedInterval) {
    return 0.3; // Low score for irregular
  }

  const intervals = [];
  for (let i = 1; i < transactions.length; i++) {
    const daysDiff = Math.round((transactions[i].date - transactions[i - 1].date) / (1000 * 60 * 60 * 24));
    intervals.push(daysDiff);
  }

  const deviations = intervals.map(interval => Math.abs(interval - expectedInterval) / expectedInterval);
  const averageDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;

  return Math.max(0, 1 - averageDeviation * 2);
}

/**
 * Extract clean payee name from description
 * @param {String} description - Transaction description
 * @returns {String} Cleaned payee name
 */
function extractPayeeName(description) {
  let payee = description
    .replace(/^(DD|SO|TFR|CHQ|FPO|ATM|POS|VIS|INT'L)\s+/i, '')
    .replace(/\s+(DD|SO|TFR|CHQ|FPO|ATM|POS)$/i, '')
    .replace(/\s+\d{2}[/-]\d{2}[/-]\d{2,4}.*$/, '')
    .replace(/\s+£?\d+\.?\d*$/, '')
    .replace(/\s+REF\s+\w+$/i, '')
    .trim();

  // Capitalize words
  return payee.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Suggest domain based on payee/description keywords
 * @param {String} payee - Payee name
 * @param {String} normalizedDescription - Normalized description
 * @returns {Object} Domain suggestion
 */
function suggestDomain(payee, normalizedDescription) {
  const text = `${payee} ${normalizedDescription}`.toUpperCase();

  // Utility/Property patterns
  if (/BRITISH GAS|SOUTHERN ELECTRIC|SCOTTISH POWER|EDF|OVO|OCTOPUS|BULB|ELECTRIC|GAS|WATER|THAMES|YORKSHIRE|SEVERN|UTILITY/.test(text)) {
    return { domain: 'property', recordType: 'Utility Bill' };
  }

  if (/COUNCIL TAX|RATES/.test(text)) {
    return { domain: 'property', recordType: 'Council Tax' };
  }

  // Insurance patterns
  if (/INSURANCE|ADMIRAL|AVIVA|DIRECT LINE|CHURCHILL|HASTINGS|LV|RSA/.test(text)) {
    return { domain: 'insurance', recordType: 'Motor Insurance' };
  }

  // Services patterns
  if (/NETFLIX|PRIME|SPOTIFY|DISNEY|APPLE MUSIC|AMAZON|SUBSCRIPTION/.test(text)) {
    return { domain: 'services', recordType: 'Streaming Service' };
  }

  if (/SKY|BT|VIRGIN|VODAFONE|EE|THREE|O2|BROADBAND|MOBILE|PHONE/.test(text)) {
    return { domain: 'services', recordType: 'Telecoms' };
  }

  // Government patterns
  if (/TV LICENCE|DVLA|HMRC|PASSPORT/.test(text)) {
    return { domain: 'government', recordType: 'Government Service' };
  }

  // Default to services
  return { domain: 'services', recordType: 'Service' };
}

/**
 * Save or update patterns in database
 * @param {Array} patterns - Detected patterns
 * @returns {Promise<Array>} Saved pattern documents
 */
async function savePatterns(patterns) {
  const savedPatterns = [];

  for (const patternData of patterns) {
    // Check if pattern already exists
    const existing = await Pattern.findOne({
      user: patternData.user,
      normalizedDescription: patternData.normalizedDescription
    });

    if (existing) {
      // Update existing pattern
      Object.assign(existing, patternData);
      await existing.save();
      savedPatterns.push(existing);
    } else {
      // Create new pattern
      const pattern = new Pattern(patternData);
      await pattern.save();
      savedPatterns.push(pattern);
    }
  }

  return savedPatterns;
}

/**
 * Match new transaction against existing patterns
 * @param {Object} transaction - Transaction document
 * @returns {Promise<Object|null>} Matched pattern or null
 */
async function matchTransaction(transaction) {
  const normalizedDesc = Pattern.normalizeDescription(transaction.description);

  // Find patterns for user
  const patterns = await Pattern.find({
    user: transaction.user,
    confidence: { $gte: 0.65 } // Only match high-confidence patterns
  }).sort({ confidence: -1 });

  for (const pattern of patterns) {
    const similarity = fuzzball.ratio(normalizedDesc, pattern.normalizedDescription);

    // Check amount within variance
    const amount = Math.abs(transaction.amount);
    const expectedAmount = pattern.averageAmount;
    const amountDiff = Math.abs(amount - expectedAmount) / expectedAmount;

    if (similarity >= 85 && amountDiff <= pattern.amountVariance + 0.1) {
      return pattern;
    }
  }

  return null;
}

module.exports = {
  detectPatternsForUser,
  groupSimilarTransactions,
  analyzeTransactionGroup,
  savePatterns,
  matchTransaction,
  extractPayeeName,
  suggestDomain
};
