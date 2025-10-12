#!/usr/bin/env node
/**
 * Transaction Migration Rollback Script
 *
 * Restores ImportSession documents from backup and removes Transaction collection.
 *
 * Features:
 * - Restores ImportSession from backup JSON
 * - Deletes Transaction collection (optional)
 * - Validation and integrity checks
 * - Dry-run mode
 *
 * Usage:
 *   # Specify backup file to restore
 *   BACKUP_FILE=./backups/import-sessions-2025-10-11.json node src/scripts/rollbackTransactionMigration.js
 *
 *   # Dry run
 *   MIGRATION_DRY_RUN=true BACKUP_FILE=./backups/import-sessions-2025-10-11.json node src/scripts/rollbackTransactionMigration.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const ImportSession = require('../models/ImportSession');
const Transaction = require('../models/Transaction');

// Configuration
const DRY_RUN = process.env.MIGRATION_DRY_RUN === 'true';
const BACKUP_FILE = process.env.BACKUP_FILE;
const DELETE_TRANSACTIONS = process.env.DELETE_TRANSACTIONS !== 'false'; // Default: true

// Rollback state
const rollbackLog = {
  startTime: new Date(),
  dryRun: DRY_RUN,
  backupFile: BACKUP_FILE,
  sessionsRestored: 0,
  transactionsDeleted: 0,
  errors: []
};

/**
 * Validate backup file exists and is readable
 */
function validateBackupFile() {
  if (!BACKUP_FILE) {
    throw new Error('BACKUP_FILE environment variable is required');
  }

  if (!fs.existsSync(BACKUP_FILE)) {
    throw new Error(`Backup file not found: ${BACKUP_FILE}`);
  }

  console.log(`✅ Backup file found: ${BACKUP_FILE}`);
}

/**
 * Load backup data
 */
function loadBackup() {
  console.log('📂 Loading backup...');

  const backupData = fs.readFileSync(BACKUP_FILE, 'utf8');
  const sessions = JSON.parse(backupData);

  console.log(`✅ Loaded ${sessions.length} sessions from backup`);

  return sessions;
}

/**
 * Restore ImportSession documents
 */
async function restoreSessions(sessions) {
  console.log('\n🔄 Restoring ImportSession documents...');

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would restore ${sessions.length} sessions`);
    rollbackLog.sessionsRestored = sessions.length;
    return;
  }

  // Clear existing ImportSessions
  const deleteResult = await ImportSession.deleteMany({});
  console.log(`   Deleted ${deleteResult.deletedCount} existing sessions`);

  // Insert backup sessions
  const inserted = await ImportSession.insertMany(sessions, { ordered: false });
  rollbackLog.sessionsRestored = inserted.length;

  console.log(`✅ Restored ${inserted.length} sessions`);
}

/**
 * Delete Transaction collection
 */
async function deleteTransactions() {
  if (!DELETE_TRANSACTIONS) {
    console.log('\n⏭️  Skipping Transaction deletion (DELETE_TRANSACTIONS=false)');
    return;
  }

  console.log('\n🗑️  Deleting Transaction collection...');

  if (DRY_RUN) {
    const count = await Transaction.countDocuments();
    console.log(`[DRY RUN] Would delete ${count} transactions`);
    rollbackLog.transactionsDeleted = count;
    return;
  }

  const deleteResult = await Transaction.deleteMany({});
  rollbackLog.transactionsDeleted = deleteResult.deletedCount;

  console.log(`✅ Deleted ${deleteResult.deletedCount} transactions`);
}

/**
 * Validate restoration
 */
async function validateRollback(expectedSessions) {
  if (DRY_RUN) {
    console.log('\n[DRY RUN] Skipping validation');
    return true;
  }

  console.log('\n🔍 Validating rollback...');

  const sessionCount = await ImportSession.countDocuments();
  console.log(`   Expected sessions: ${expectedSessions}`);
  console.log(`   Actual sessions: ${sessionCount}`);

  if (sessionCount === expectedSessions) {
    console.log('✅ Validation passed: Session count matches!');
    return true;
  } else {
    console.error(`❌ Validation failed: Count mismatch`);
    return false;
  }
}

/**
 * Write rollback log
 */
function writeRollbackLog() {
  rollbackLog.endTime = new Date();
  rollbackLog.duration = rollbackLog.endTime - rollbackLog.startTime;

  const timestamp = rollbackLog.startTime.toISOString().replace(/[:.]/g, '-');
  const logDir = path.dirname(BACKUP_FILE);
  const logPath = path.join(logDir, `rollback-log-${timestamp}.json`);

  fs.writeFileSync(logPath, JSON.stringify(rollbackLog, null, 2));

  console.log(`\n📝 Rollback log written: ${logPath}`);
}

/**
 * Main rollback function
 */
async function rollback() {
  console.log('='.repeat(60));
  console.log('⏪ TRANSACTION MIGRATION ROLLBACK');
  console.log('='.repeat(60));
  console.log(`Mode: ${DRY_RUN ? '🧪 DRY RUN (no writes)' : '⚡ LIVE ROLLBACK'}`);
  console.log(`Backup file: ${BACKUP_FILE}`);
  console.log(`Delete transactions: ${DELETE_TRANSACTIONS ? 'YES' : 'NO'}`);
  console.log('='.repeat(60));

  try {
    // Validate backup file
    validateBackupFile();

    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Load backup
    const sessions = loadBackup();

    // Confirm rollback
    if (!DRY_RUN) {
      console.log('\n⚠️  WARNING: This will DELETE current ImportSessions and restore from backup!');
      console.log('⚠️  Press Ctrl+C to cancel, or wait 5 seconds to continue...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Restore sessions
    await restoreSessions(sessions);

    // Delete transactions
    await deleteTransactions();

    // Validate
    const valid = await validateRollback(sessions.length);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 ROLLBACK SUMMARY');
    console.log('='.repeat(60));
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
    console.log(`Sessions restored: ${rollbackLog.sessionsRestored}`);
    console.log(`Transactions deleted: ${rollbackLog.transactionsDeleted}`);
    console.log(`Validation: ${valid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Duration: ${Math.round(rollbackLog.duration / 1000)}s`);
    console.log('='.repeat(60));

    // Write log
    writeRollbackLog();

    if (DRY_RUN) {
      console.log('\n✅ DRY RUN COMPLETE - No changes made to database');
    } else if (valid) {
      console.log('\n✅ ROLLBACK COMPLETE - Database restored to pre-migration state');
    } else {
      console.error('\n❌ ROLLBACK FAILED - Validation errors detected');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ROLLBACK FAILED:', error);
    rollbackLog.errors.push({ error: error.message, stack: error.stack });
    writeRollbackLog();
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run rollback
if (require.main === module) {
  rollback();
}

module.exports = { rollback };
