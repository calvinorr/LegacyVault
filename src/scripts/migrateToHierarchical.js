#!/usr/bin/env node
/**
 * Hierarchical Domain Model Migration Script
 *
 * Migrates from flat domain model to hierarchical parent-child model by:
 * - Deleting legacy flat collections (Insurance, Finance, Services, Government, Legal)
 * - Preserving existing parent-capable collections (Vehicle, Property, Employment)
 * - Creating new collections (ParentEntity, ChildRecord, DomainConfig)
 * - Seeding default domain configurations for 5 domains (Vehicle, Property, Employment, Services, Finance)
 *
 * Features:
 * - Dry-run mode (--dry-run flag)
 * - Backup creation before deletion
 * - Preview of collections to be deleted
 * - Comprehensive logging
 * - Rollback support via backup
 *
 * Usage:
 *   # Dry run (preview only, no changes)
 *   node src/scripts/migrateToHierarchical.js --dry-run
 *
 *   # Actual migration
 *   node src/scripts/migrateToHierarchical.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Models
const DomainConfig = require('../models/DomainConfig');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BACKUP_DIR = process.env.MIGRATION_BACKUP_PATH || './backups';

// Legacy collections to DELETE
const LEGACY_COLLECTIONS = [
  'insurances',
  'finances',
  'services',
  'governments',
  'legals'
];

// Collections to PRESERVE (will be migrated to ParentEntity in future stories)
const PRESERVED_COLLECTIONS = [
  'users',
  'vehicles',
  'properties',
  'employments',
  'entries', // Current entries
  'categories',
  'transactions',
  'importsessions'
];

// Migration state
const migrationLog = {
  startTime: new Date(),
  dryRun: DRY_RUN,
  backupPath: null,
  collectionsDeleted: [],
  collectionsPreserved: [],
  recordsDeleted: 0,
  errors: [],
  configsSeeded: []
};

/**
 * Create backup of legacy collections before deletion
 */
async function createBackup() {
  console.log('\n📦 Creating backup of legacy collections...');

  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `legacy-collections-${timestamp}.json`);

  const backup = {
    timestamp: new Date().toISOString(),
    collections: {}
  };

  // Get list of existing collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  const existingCollectionNames = collections.map(c => c.name);

  // Backup each legacy collection that exists
  for (const collectionName of LEGACY_COLLECTIONS) {
    if (existingCollectionNames.includes(collectionName)) {
      const collection = mongoose.connection.db.collection(collectionName);
      const documents = await collection.find({}).toArray();
      backup.collections[collectionName] = {
        count: documents.length,
        documents
      };
      console.log(`   ✓ Backed up: ${collectionName} (${documents.length} records)`);
    } else {
      console.log(`   ⊘ Skipped: ${collectionName} (does not exist)`);
      backup.collections[collectionName] = {
        count: 0,
        documents: [],
        note: 'Collection did not exist at backup time'
      };
    }
  }

  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

  console.log(`\n✅ Backup created: ${backupPath}`);

  migrationLog.backupPath = backupPath;
  return backupPath;
}

/**
 * Preview collections and record counts
 */
async function previewCollections() {
  console.log('\n📊 Database Collection Preview:');
  console.log('='.repeat(60));

  const collections = await mongoose.connection.db.listCollections().toArray();
  const existingCollectionNames = collections.map(c => c.name);

  // Legacy collections (TO BE DELETED)
  console.log('\n❌ LEGACY COLLECTIONS (TO BE DELETED):');
  let totalToDelete = 0;
  for (const collectionName of LEGACY_COLLECTIONS) {
    if (existingCollectionNames.includes(collectionName)) {
      const collection = mongoose.connection.db.collection(collectionName);
      const count = await collection.countDocuments();
      totalToDelete += count;
      console.log(`   • ${collectionName}: ${count} records`);
    } else {
      console.log(`   • ${collectionName}: (does not exist)`);
    }
  }
  console.log(`   TOTAL RECORDS TO DELETE: ${totalToDelete}`);

  // Preserved collections
  console.log('\n✅ PRESERVED COLLECTIONS (WILL BE KEPT):');
  for (const collectionName of PRESERVED_COLLECTIONS) {
    if (existingCollectionNames.includes(collectionName)) {
      const collection = mongoose.connection.db.collection(collectionName);
      const count = await collection.countDocuments();
      console.log(`   • ${collectionName}: ${count} records`);
      migrationLog.collectionsPreserved.push({ name: collectionName, count });
    }
  }

  console.log('='.repeat(60));

  return totalToDelete;
}

/**
 * Delete legacy collections
 */
async function deleteLegacyCollections() {
  console.log('\n🗑️  Deleting legacy collections...');

  const collections = await mongoose.connection.db.listCollections().toArray();
  const existingCollectionNames = collections.map(c => c.name);

  let totalDeleted = 0;

  for (const collectionName of LEGACY_COLLECTIONS) {
    if (!existingCollectionNames.includes(collectionName)) {
      console.log(`   ⊘ Skipped: ${collectionName} (does not exist)`);
      continue;
    }

    try {
      const collection = mongoose.connection.db.collection(collectionName);
      const count = await collection.countDocuments();

      if (DRY_RUN) {
        console.log(`   [DRY RUN] Would delete: ${collectionName} (${count} records)`);
      } else {
        await collection.drop();
        console.log(`   ✓ Deleted: ${collectionName} (${count} records)`);
        totalDeleted += count;
        migrationLog.collectionsDeleted.push({ name: collectionName, count });
      }
    } catch (error) {
      const errorMsg = `Failed to delete ${collectionName}: ${error.message}`;
      console.error(`   ❌ ${errorMsg}`);
      migrationLog.errors.push({ collection: collectionName, error: errorMsg });
    }
  }

  migrationLog.recordsDeleted = totalDeleted;

  if (DRY_RUN) {
    console.log('\n[DRY RUN] No collections were actually deleted');
  } else {
    console.log(`\n✅ Deleted ${migrationLog.collectionsDeleted.length} collections (${totalDeleted} total records)`);
  }
}

/**
 * Seed default domain configurations
 */
async function seedDomainConfigs() {
  console.log('\n🌱 Seeding default domain configurations...');

  try {
    if (DRY_RUN) {
      console.log('   [DRY RUN] Would seed configs for: Vehicle, Property, Employment, Services, Finance');
      return;
    }

    const configs = await DomainConfig.seedDefaultConfigs();

    for (const config of configs) {
      console.log(`   ✓ Created config: ${config.domainType} (${config.allowedRecordTypes.length} record types)`);
      migrationLog.configsSeeded.push({
        domainType: config.domainType,
        allowedRecordTypes: config.allowedRecordTypes
      });
    }

    console.log(`\n✅ Seeded ${configs.length} domain configurations`);
  } catch (error) {
    const errorMsg = `Failed to seed domain configs: ${error.message}`;
    console.error(`   ❌ ${errorMsg}`);
    migrationLog.errors.push({ step: 'seedDomainConfigs', error: errorMsg });
  }
}

/**
 * Verify migration success
 */
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');

  const collections = await mongoose.connection.db.listCollections().toArray();
  const existingCollectionNames = collections.map(c => c.name);

  let allDeleted = true;

  // Check that legacy collections are gone
  for (const collectionName of LEGACY_COLLECTIONS) {
    if (existingCollectionNames.includes(collectionName)) {
      console.error(`   ❌ Legacy collection still exists: ${collectionName}`);
      allDeleted = false;
    }
  }

  // Check that preserved collections still exist
  for (const collectionName of PRESERVED_COLLECTIONS) {
    if (!existingCollectionNames.includes(collectionName)) {
      console.log(`   ℹ️  Preserved collection not found (may not have existed): ${collectionName}`);
    }
  }

  // Check that new models exist
  const newCollections = ['parententities', 'childrecords', 'domainconfigs'];
  for (const collectionName of newCollections) {
    if (existingCollectionNames.includes(collectionName)) {
      const collection = mongoose.connection.db.collection(collectionName);
      const count = await collection.countDocuments();
      console.log(`   ✓ New collection exists: ${collectionName} (${count} records)`);
    }
  }

  if (DRY_RUN) {
    console.log('\n[DRY RUN] Verification skipped (no actual changes made)');
    return true;
  }

  if (allDeleted) {
    console.log('\n✅ Verification passed: All legacy collections removed');
    return true;
  } else {
    console.error('\n❌ Verification failed: Some legacy collections still exist');
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
  const logPath = path.join(BACKUP_DIR, `hierarchical-migration-log-${timestamp}.json`);

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  fs.writeFileSync(logPath, JSON.stringify(migrationLog, null, 2));

  console.log(`\n📝 Migration log written: ${logPath}`);
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('='.repeat(60));
  console.log('🚀 HIERARCHICAL DOMAIN MODEL MIGRATION');
  console.log('='.repeat(60));
  console.log(`Mode: ${DRY_RUN ? '🧪 DRY RUN (preview only)' : '⚡ LIVE MIGRATION'}`);
  console.log(`Backup directory: ${BACKUP_DIR}`);
  console.log('='.repeat(60));

  try {
    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Preview collections
    const recordsToDelete = await previewCollections();

    // Confirmation in live mode
    if (!DRY_RUN && recordsToDelete > 0) {
      console.log('\n⚠️  WARNING: This will permanently delete legacy collections!');
      console.log(`   ${recordsToDelete} records will be deleted.`);
      console.log('   Press Ctrl+C within 5 seconds to abort...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Create backup
    if (!DRY_RUN) {
      await createBackup();
    } else {
      console.log('\n[DRY RUN] Skipping backup creation');
    }

    // Delete legacy collections
    await deleteLegacyCollections();

    // Seed domain configurations
    await seedDomainConfigs();

    // Verify
    const verified = await verifyMigration();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
    console.log(`Collections deleted: ${migrationLog.collectionsDeleted.length}`);
    console.log(`Records deleted: ${migrationLog.recordsDeleted}`);
    console.log(`Collections preserved: ${migrationLog.collectionsPreserved.length}`);
    console.log(`Domain configs seeded: ${migrationLog.configsSeeded.length}`);
    console.log(`Errors: ${migrationLog.errors.length}`);
    console.log(`Verification: ${verified ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Duration: ${Math.round(migrationLog.duration / 1000)}s`);
    console.log('='.repeat(60));

    if (migrationLog.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      migrationLog.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.collection || err.step}: ${err.error}`);
      });
    }

    // Write log
    writeMigrationLog();

    if (DRY_RUN) {
      console.log('\n✅ DRY RUN COMPLETE - No changes made to database');
      console.log('   Run without --dry-run flag to execute migration');
    } else if (verified && migrationLog.errors.length === 0) {
      console.log('\n✅ MIGRATION COMPLETE - Hierarchical domain model active');
      console.log(`   Backup stored at: ${migrationLog.backupPath}`);
      console.log('   Use src/scripts/rollbackMigration.js to restore if needed');
    } else {
      console.error('\n⚠️  MIGRATION COMPLETED WITH WARNINGS - Review errors above');
      console.log(`   Backup stored at: ${migrationLog.backupPath}`);
    }

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
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
