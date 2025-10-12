#!/usr/bin/env node
/**
 * Transaction Migration Script
 *
 * Migrates embedded transactions from ImportSession to standalone Transaction collection.
 *
 * Features:
 * - Dry-run mode (MIGRATION_DRY_RUN=true)
 * - Batch processing (1000 transactions per batch)
 * - Backup creation before migration
 * - Integrity validation (transaction count verification)
 * - Comprehensive logging
 *
 * Usage:
 *   # Dry run (no writes)
 *   MIGRATION_DRY_RUN=true node src/scripts/migrateTransactions.js
 *
 *   # Actual migration
 *   node src/scripts/migrateTransactions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const ImportSession = require('../models/ImportSession');
const Transaction = require('../models/Transaction');

// Configuration
const DRY_RUN = process.env.MIGRATION_DRY_RUN === 'true';
const BATCH_SIZE = parseInt(process.env.MIGRATION_BATCH_SIZE || '1000');
const BACKUP_DIR = process.env.MIGRATION_BACKUP_PATH || './backups';

// Migration state
const migrationLog = {
  startTime: new Date(),
  dryRun: DRY_RUN,
  sessionsProcessed: 0,
  transactionsCreated: 0,
  errors: [],
  batches: []
};

/**
 * Create backup of ImportSession collection
 */
async function createBackup() {
  console.log('📦 Creating backup...');

  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `import-sessions-${timestamp}.json`);

  const sessions = await ImportSession.find({}).lean();
  fs.writeFileSync(backupPath, JSON.stringify(sessions, null, 2));

  console.log(`✅ Backup created: ${backupPath}`);
  console.log(`   Sessions backed up: ${sessions.length}`);

  return backupPath;
}

/**
 * Count total embedded transactions across all sessions
 */
async function countEmbeddedTransactions() {
  const result = await ImportSession.aggregate([
    { $project: { transactionCount: { $size: { $ifNull: ['$transactions', []] } } } },
    { $group: { _id: null, total: { $sum: '$transactionCount' } } }
  ]);

  return result.length > 0 ? result[0].total : 0;
}

/**
 * Migrate transactions from one ImportSession
 */
async function migrateSession(session) {
  const sessionId = session._id;
  const userId = session.user;
  const transactions = session.transactions || [];

  if (transactions.length === 0) {
    return { sessionId, transactionsCreated: 0, transactionRefs: [] };
  }

  const transactionRefs = [];
  const createdTransactions = [];

  for (const txn of transactions) {
    try {
      // Calculate transaction hash
      const transactionHash = Transaction.calculateHash(
        userId,
        txn.amount,
        txn.description
      );

      // Check for duplicate (skip if exists)
      const existing = await Transaction.findOne({ user: userId, transactionHash });
      if (existing) {
        console.log(`⚠️  Duplicate detected: ${txn.description} (${txn.amount}) - Skipping`);
        transactionRefs.push(existing._id);
        continue;
      }

      // Create Transaction document
      const transactionDoc = {
        user: userId,
        importSession: sessionId,
        date: txn.date,
        description: txn.description,
        reference: txn.reference,
        amount: txn.amount,
        balance: txn.balance,
        originalText: txn.originalText,
        transactionHash,
        status: txn.recordCreated ? 'record_created' : 'pending',
        recordCreated: txn.recordCreated || false,
        createdRecordId: txn.createdRecordId,
        createdRecordDomain: txn.createdRecordDomain,
        createdAt: txn.createdAt
      };

      if (!DRY_RUN) {
        const created = await Transaction.create(transactionDoc);
        transactionRefs.push(created._id);
        createdTransactions.push(created);
      } else {
        // Dry run: simulate ID
        transactionRefs.push(new mongoose.Types.ObjectId());
        createdTransactions.push(transactionDoc);
      }
    } catch (error) {
      migrationLog.errors.push({
        sessionId,
        transaction: txn,
        error: error.message
      });
      console.error(`❌ Error migrating transaction: ${error.message}`);
    }
  }

  return {
    sessionId,
    transactionsCreated: createdTransactions.length,
    transactionRefs
  };
}

/**
 * Update ImportSession with transaction references
 */
async function updateSession(sessionId, transactionRefs) {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would update session ${sessionId} with ${transactionRefs.length} refs`);
    return;
  }

  await ImportSession.findByIdAndUpdate(sessionId, {
    transaction_refs: transactionRefs,
    'statistics.new_transactions': transactionRefs.length
  });
}

/**
 * Process sessions in batches
 */
async function processBatches() {
  const totalSessions = await ImportSession.countDocuments();
  console.log(`\n📊 Total ImportSessions: ${totalSessions}`);

  const totalEmbedded = await countEmbeddedTransactions();
  console.log(`📊 Total embedded transactions: ${totalEmbedded}\n`);

  let processedCount = 0;
  let skip = 0;

  while (processedCount < totalSessions) {
    const sessions = await ImportSession.find({})
      .skip(skip)
      .limit(BATCH_SIZE)
      .lean();

    if (sessions.length === 0) break;

    console.log(`\n🔄 Processing batch: ${processedCount + 1} to ${processedCount + sessions.length}`);

    const batchResults = {
      sessionsProcessed: 0,
      transactionsCreated: 0,
      startTime: new Date()
    };

    for (const session of sessions) {
      const result = await migrateSession(session);
      await updateSession(result.sessionId, result.transactionRefs);

      batchResults.sessionsProcessed++;
      batchResults.transactionsCreated += result.transactionsCreated;

      migrationLog.sessionsProcessed++;
      migrationLog.transactionsCreated += result.transactionsCreated;
    }

    batchResults.endTime = new Date();
    batchResults.duration = batchResults.endTime - batchResults.startTime;
    migrationLog.batches.push(batchResults);

    console.log(`✅ Batch complete: ${batchResults.sessionsProcessed} sessions, ${batchResults.transactionsCreated} transactions (${batchResults.duration}ms)`);

    processedCount += sessions.length;
    skip += BATCH_SIZE;
  }

  return totalEmbedded;
}

/**
 * Validate migration integrity
 */
async function validateMigration(expectedCount) {
  if (DRY_RUN) {
    console.log('\n[DRY RUN] Skipping validation (no actual writes performed)');
    return true;
  }

  console.log('\n🔍 Validating migration...');

  const actualCount = await Transaction.countDocuments();
  console.log(`   Expected transactions: ${expectedCount}`);
  console.log(`   Actual transactions: ${actualCount}`);

  if (actualCount === expectedCount) {
    console.log('✅ Validation passed: Transaction count matches!');
    return true;
  } else {
    console.error(`❌ Validation failed: Count mismatch (expected ${expectedCount}, got ${actualCount})`);
    return false;
  }
}

/**
 * Write migration log
 */
function writeMigrationLog() {
  migrationLog.endTime = new Date();
  migrationLog.duration = migrationLog.endTime - migrationLog.startTime;

  const timestamp = migrationLog.startTime.toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(BACKUP_DIR, `migration-log-${timestamp}.json`);

  fs.writeFileSync(logPath, JSON.stringify(migrationLog, null, 2));

  console.log(`\n📝 Migration log written: ${logPath}`);
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('='.repeat(60));
  console.log('🚀 TRANSACTION MIGRATION SCRIPT');
  console.log('='.repeat(60));
  console.log(`Mode: ${DRY_RUN ? '🧪 DRY RUN (no writes)' : '⚡ LIVE MIGRATION'}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`Backup directory: ${BACKUP_DIR}`);
  console.log('='.repeat(60));

  try {
    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Create backup
    if (!DRY_RUN) {
      await createBackup();
    } else {
      console.log('\n[DRY RUN] Skipping backup creation');
    }

    // Process batches
    const expectedCount = await processBatches();

    // Validate
    const valid = await validateMigration(expectedCount);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
    console.log(`Sessions processed: ${migrationLog.sessionsProcessed}`);
    console.log(`Transactions created: ${migrationLog.transactionsCreated}`);
    console.log(`Errors: ${migrationLog.errors.length}`);
    console.log(`Validation: ${valid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Duration: ${Math.round(migrationLog.duration / 1000)}s`);
    console.log('='.repeat(60));

    if (migrationLog.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      migrationLog.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. Session ${err.sessionId}: ${err.error}`);
      });
    }

    // Write log
    writeMigrationLog();

    if (DRY_RUN) {
      console.log('\n✅ DRY RUN COMPLETE - No changes made to database');
    } else if (valid) {
      console.log('\n✅ MIGRATION COMPLETE - All transactions migrated successfully');
    } else {
      console.error('\n❌ MIGRATION FAILED - Validation errors detected');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
    migrationLog.errors.push({ error: error.message, stack: error.stack });
    writeMigrationLog();
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run migration
if (require.main === module) {
  migrate();
}

module.exports = { migrate };
