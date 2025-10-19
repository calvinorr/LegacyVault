#!/usr/bin/env node
/**
 * Hierarchical Migration Rollback Script
 *
 * Restores legacy collections from backup created by migrateToHierarchical.js
 *
 * Features:
 * - Backup verification and integrity checks
 * - Restores deleted collections (Insurance, Finance, Services, Government, Legal)
 * - Optionally removes new hierarchical collections
 * - Confirmation prompts for safety
 * - Comprehensive logging
 *
 * Usage:
 *   # Rollback from specific backup
 *   node src/scripts/rollbackHierarchicalMigration.js /path/to/backup.json
 *
 *   # Rollback from latest backup
 *   node src/scripts/rollbackHierarchicalMigration.js
 *
 *   # Rollback without removing new collections
 *   node src/scripts/rollbackHierarchicalMigration.js --keep-new
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuration
const BACKUP_DIR = process.env.MIGRATION_BACKUP_PATH || './backups';
const KEEP_NEW_COLLECTIONS = process.argv.includes('--keep-new');

// Rollback state
const rollbackLog = {
  startTime: new Date(),
  backupPath: null,
  collectionsRestored: [],
  recordsRestored: 0,
  collectionsRemoved: [],
  errors: [],
  keepNewCollections: KEEP_NEW_COLLECTIONS
};

/**
 * Find latest backup file
 */
function findLatestBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    throw new Error(`Backup directory does not exist: ${BACKUP_DIR}`);
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('legacy-collections-') && f.endsWith('.json'))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    throw new Error('No backup files found in backup directory');
  }

  return files[0].path;
}

/**
 * Load and verify backup file
 */
function loadBackup(backupPath) {
  console.log(`\n📦 Loading backup from: ${backupPath}`);

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file does not exist: ${backupPath}`);
  }

  let backup;
  try {
    const contents = fs.readFileSync(backupPath, 'utf8');
    backup = JSON.parse(contents);
  } catch (error) {
    throw new Error(`Failed to parse backup file: ${error.message}`);
  }

  // Verify backup structure
  if (!backup.collections || typeof backup.collections !== 'object') {
    throw new Error('Invalid backup file: missing or invalid collections data');
  }

  // Summary
  console.log(`✅ Backup loaded successfully`);
  console.log(`   Timestamp: ${backup.timestamp}`);
  console.log(`   Collections in backup:`);

  let totalRecords = 0;
  for (const [collectionName, data] of Object.entries(backup.collections)) {
    console.log(`     • ${collectionName}: ${data.count} records`);
    totalRecords += data.count;
  }
  console.log(`   Total records: ${totalRecords}`);

  return backup;
}

/**
 * Preview rollback actions
 */
async function previewRollback(backup) {
  console.log('\n📊 Rollback Preview:');
  console.log('='.repeat(60));

  const collections = await mongoose.connection.db.listCollections().toArray();
  const existingCollectionNames = collections.map(c => c.name);

  console.log('\n✅ COLLECTIONS TO RESTORE:');
  for (const [collectionName, data] of Object.entries(backup.collections)) {
    const exists = existingCollectionNames.includes(collectionName);
    const status = exists ? '⚠️  (will overwrite existing)' : '(new)';
    console.log(`   • ${collectionName}: ${data.count} records ${status}`);
  }

  if (!KEEP_NEW_COLLECTIONS) {
    console.log('\n❌ NEW COLLECTIONS TO REMOVE:');
    const newCollections = ['parententities', 'childrecords', 'domainconfigs'];
    for (const collectionName of newCollections) {
      if (existingCollectionNames.includes(collectionName)) {
        const collection = mongoose.connection.db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`   • ${collectionName}: ${count} records`);
      }
    }
  } else {
    console.log('\n✓ NEW COLLECTIONS WILL BE PRESERVED (--keep-new flag)');
  }

  console.log('='.repeat(60));
}

/**
 * Restore collections from backup
 */
async function restoreCollections(backup) {
  console.log('\n🔄 Restoring collections...');

  for (const [collectionName, data] of Object.entries(backup.collections)) {
    if (data.count === 0) {
      console.log(`   ⊘ Skipped: ${collectionName} (was empty in backup)`);
      continue;
    }

    try {
      const collection = mongoose.connection.db.collection(collectionName);

      // Check if collection exists and drop it
      const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
      if (collections.length > 0) {
        await collection.drop();
        console.log(`   ↻ Dropped existing: ${collectionName}`);
      }

      // Restore documents
      if (data.documents && data.documents.length > 0) {
        await collection.insertMany(data.documents);
        console.log(`   ✓ Restored: ${collectionName} (${data.documents.length} records)`);

        rollbackLog.collectionsRestored.push({
          name: collectionName,
          count: data.documents.length
        });
        rollbackLog.recordsRestored += data.documents.length;
      }
    } catch (error) {
      const errorMsg = `Failed to restore ${collectionName}: ${error.message}`;
      console.error(`   ❌ ${errorMsg}`);
      rollbackLog.errors.push({ collection: collectionName, error: errorMsg });
    }
  }

  console.log(`\n✅ Restored ${rollbackLog.collectionsRestored.length} collections (${rollbackLog.recordsRestored} total records)`);
}

/**
 * Remove new hierarchical collections
 */
async function removeNewCollections() {
  if (KEEP_NEW_COLLECTIONS) {
    console.log('\n✓ Keeping new hierarchical collections (--keep-new flag)');
    return;
  }

  console.log('\n🗑️  Removing new hierarchical collections...');

  const newCollections = ['parententities', 'childrecords', 'domainconfigs'];
  const collections = await mongoose.connection.db.listCollections().toArray();
  const existingCollectionNames = collections.map(c => c.name);

  for (const collectionName of newCollections) {
    if (!existingCollectionNames.includes(collectionName)) {
      console.log(`   ⊘ Skipped: ${collectionName} (does not exist)`);
      continue;
    }

    try {
      const collection = mongoose.connection.db.collection(collectionName);
      const count = await collection.countDocuments();
      await collection.drop();
      console.log(`   ✓ Removed: ${collectionName} (${count} records)`);

      rollbackLog.collectionsRemoved.push({
        name: collectionName,
        count
      });
    } catch (error) {
      const errorMsg = `Failed to remove ${collectionName}: ${error.message}`;
      console.error(`   ❌ ${errorMsg}`);
      rollbackLog.errors.push({ collection: collectionName, error: errorMsg });
    }
  }
}

/**
 * Verify rollback success
 */
async function verifyRollback(backup) {
  console.log('\n🔍 Verifying rollback...');

  const collections = await mongoose.connection.db.listCollections().toArray();
  const existingCollectionNames = collections.map(c => c.name);

  let allRestored = true;

  // Check that legacy collections are restored
  for (const [collectionName, data] of Object.entries(backup.collections)) {
    if (data.count === 0) continue;

    if (!existingCollectionNames.includes(collectionName)) {
      console.error(`   ❌ Collection not restored: ${collectionName}`);
      allRestored = false;
    } else {
      const collection = mongoose.connection.db.collection(collectionName);
      const count = await collection.countDocuments();
      if (count !== data.count) {
        console.error(`   ⚠️  Record count mismatch for ${collectionName}: expected ${data.count}, got ${count}`);
      } else {
        console.log(`   ✓ Verified: ${collectionName} (${count} records)`);
      }
    }
  }

  if (allRestored) {
    console.log('\n✅ Verification passed: All collections restored successfully');
    return true;
  } else {
    console.error('\n❌ Verification failed: Some collections were not restored');
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
  const logPath = path.join(BACKUP_DIR, `rollback-log-${timestamp}.json`);

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  fs.writeFileSync(logPath, JSON.stringify(rollbackLog, null, 2));

  console.log(`\n📝 Rollback log written: ${logPath}`);
}

/**
 * Main rollback function
 */
async function rollback() {
  console.log('='.repeat(60));
  console.log('↩️  HIERARCHICAL MIGRATION ROLLBACK');
  console.log('='.repeat(60));
  console.log(`Keep new collections: ${KEEP_NEW_COLLECTIONS ? 'YES' : 'NO'}`);
  console.log('='.repeat(60));

  try {
    // Determine backup path
    let backupPath = process.argv.find(arg => arg.endsWith('.json'));
    if (!backupPath) {
      backupPath = findLatestBackup();
      console.log(`\nℹ️  No backup path specified, using latest: ${path.basename(backupPath)}`);
    }

    rollbackLog.backupPath = backupPath;

    // Load backup
    const backup = loadBackup(backupPath);

    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Preview rollback
    await previewRollback(backup);

    // Confirmation prompt
    console.log('\n⚠️  WARNING: This will restore legacy collections and may remove new data!');
    console.log('   Press Ctrl+C within 5 seconds to abort...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Restore collections
    await restoreCollections(backup);

    // Remove new collections (unless --keep-new)
    await removeNewCollections();

    // Verify
    const verified = await verifyRollback(backup);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 ROLLBACK SUMMARY');
    console.log('='.repeat(60));
    console.log(`Backup used: ${path.basename(backupPath)}`);
    console.log(`Collections restored: ${rollbackLog.collectionsRestored.length}`);
    console.log(`Records restored: ${rollbackLog.recordsRestored}`);
    console.log(`Collections removed: ${rollbackLog.collectionsRemoved.length}`);
    console.log(`Errors: ${rollbackLog.errors.length}`);
    console.log(`Verification: ${verified ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Duration: ${Math.round(rollbackLog.duration / 1000)}s`);
    console.log('='.repeat(60));

    if (rollbackLog.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      rollbackLog.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.collection}: ${err.error}`);
      });
    }

    // Write log
    writeRollbackLog();

    if (verified && rollbackLog.errors.length === 0) {
      console.log('\n✅ ROLLBACK COMPLETE - Legacy collections restored');
      console.log('   Database has been returned to pre-migration state');
    } else {
      console.error('\n⚠️  ROLLBACK COMPLETED WITH WARNINGS - Review errors above');
    }

  } catch (error) {
    console.error('\n❌ ROLLBACK FAILED:', error.message);
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
