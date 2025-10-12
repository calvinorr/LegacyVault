const crypto = require('crypto');
const ImportSession = require('../models/ImportSession');
const Transaction = require('../models/Transaction');

/**
 * Duplicate Detection Service
 *
 * Handles file-level and transaction-level duplicate detection
 * for bank statement imports.
 */

/**
 * Calculate SHA-256 hash of file buffer
 *
 * @param {Buffer} fileBuffer - PDF file buffer
 * @returns {string} - Hex hash string
 */
function calculateFileHash(fileBuffer) {
  return crypto
    .createHash('sha256')
    .update(fileBuffer)
    .digest('hex');
}

/**
 * Calculate statement hash from statement period
 *
 * @param {ObjectId} userId - User ID
 * @param {Date} startDate - Statement period start
 * @param {Date} endDate - Statement period end
 * @param {string} accountNumber - Account number (last 4 digits)
 * @returns {string} - Hex hash string
 */
function calculateStatementHash(userId, startDate, endDate, accountNumber = '') {
  const hashInput = `${userId}${startDate.toISOString()}${endDate.toISOString()}${accountNumber}`;
  return crypto
    .createHash('sha256')
    .update(hashInput)
    .digest('hex');
}

/**
 * Check if file has been uploaded before (exact file duplicate)
 *
 * @param {ObjectId} userId - User ID
 * @param {string} fileHash - SHA-256 hash of PDF file
 * @returns {Promise<Object|null>} - Duplicate session or null
 */
async function checkFileDuplicate(userId, fileHash) {
  const existingSession = await ImportSession.findOne({
    user: userId,
    file_hash: fileHash
  });

  return existingSession;
}

/**
 * Check if statement period has been imported before (overlapping period)
 *
 * @param {ObjectId} userId - User ID
 * @param {string} statementHash - Statement hash
 * @returns {Promise<Object|null>} - Duplicate session or null
 */
async function checkStatementDuplicate(userId, statementHash) {
  const existingSession = await ImportSession.findOne({
    user: userId,
    statement_hash: statementHash
  });

  return existingSession;
}

/**
 * Check for duplicate transactions in batch
 *
 * @param {ObjectId} userId - User ID
 * @param {Array} transactions - Array of transaction objects
 * @returns {Promise<Object>} - { duplicates: [], new: [] }
 */
async function checkTransactionDuplicates(userId, transactions) {
  const duplicates = [];
  const newTransactions = [];

  for (const txn of transactions) {
    const transactionHash = Transaction.calculateHash(
      userId,
      txn.amount,
      txn.description
    );

    // Check if transaction already exists
    const existing = await Transaction.findOne({
      user: userId,
      transactionHash
    });

    if (existing) {
      duplicates.push({
        transaction: txn,
        existingId: existing._id,
        existingDate: existing.date
      });
    } else {
      newTransactions.push({
        ...txn,
        transactionHash
      });
    }
  }

  return { duplicates, new: newTransactions };
}

/**
 * Comprehensive duplicate check for import
 *
 * @param {Object} params
 * @param {ObjectId} params.userId - User ID
 * @param {Buffer} params.fileBuffer - PDF file buffer
 * @param {Date} params.startDate - Statement period start
 * @param {Date} params.endDate - Statement period end
 * @param {string} params.accountNumber - Account number
 * @param {Array} params.transactions - Array of transactions
 * @returns {Promise<Object>} - Duplicate detection results
 */
async function performDuplicateCheck({ userId, fileBuffer, startDate, endDate, accountNumber, transactions }) {
  const results = {
    hasFileDuplicate: false,
    hasStatementDuplicate: false,
    fileDuplicateSession: null,
    statementDuplicateSession: null,
    transactionDuplicates: [],
    newTransactions: [],
    fileHash: null,
    statementHash: null
  };

  // Calculate hashes
  results.fileHash = calculateFileHash(fileBuffer);
  results.statementHash = calculateStatementHash(userId, startDate, endDate, accountNumber);

  // Check file duplicate
  const fileDuplicate = await checkFileDuplicate(userId, results.fileHash);
  if (fileDuplicate) {
    results.hasFileDuplicate = true;
    results.fileDuplicateSession = fileDuplicate;
  }

  // Check statement duplicate
  const statementDuplicate = await checkStatementDuplicate(userId, results.statementHash);
  if (statementDuplicate) {
    results.hasStatementDuplicate = true;
    results.statementDuplicateSession = statementDuplicate;
  }

  // Check transaction duplicates (if not blocking on file/statement duplicate)
  if (!results.hasFileDuplicate && transactions && transactions.length > 0) {
    const txnResults = await checkTransactionDuplicates(userId, transactions);
    results.transactionDuplicates = txnResults.duplicates;
    results.newTransactions = txnResults.new;
  }

  return results;
}

/**
 * Get import timeline for user (months with imports)
 *
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Array>} - Array of month objects with import status
 */
async function getImportTimeline(userId) {
  const sessions = await ImportSession.find({ user: userId })
    .select('statement_period createdAt statistics')
    .sort({ 'statement_period.start_date': -1 })
    .lean();

  // Group by month
  const monthMap = new Map();

  for (const session of sessions) {
    if (session.statement_period && session.statement_period.start_date) {
      const date = new Date(session.statement_period.start_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: monthKey,
          year: date.getFullYear(),
          monthNumber: date.getMonth() + 1,
          imported: true,
          sessionId: session._id,
          importedAt: session.createdAt,
          transactionCount: session.statistics?.total_transactions || 0,
          recordsCreated: session.statistics?.records_created || 0
        });
      }
    }
  }

  // Convert to sorted array
  const timeline = Array.from(monthMap.values())
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.monthNumber - a.monthNumber;
    });

  return timeline;
}

module.exports = {
  calculateFileHash,
  calculateStatementHash,
  checkFileDuplicate,
  checkStatementDuplicate,
  checkTransactionDuplicates,
  performDuplicateCheck,
  getImportTimeline
};
