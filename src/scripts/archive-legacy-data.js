#!/usr/bin/env node
// src/scripts/archive-legacy-data.js
// Story 2.5: Archive legacy data (don't delete) with safety net

require('dotenv').config();
const mongoose = require('mongoose');
const db = require('../db');

/**
 * Archive Legacy Data Script
 *
 * Purpose: Mark legacy collections as archived (add _archived: true flag)
 * Safety: Does NOT delete data, only marks as hidden from UI
 * Reversible: Can unarchive by removing _archived flag
 */

async function archiveLegacyData() {
  console.log('🗄️  Legacy Data Archive Script - Story 2.5');
  console.log('===========================================\n');

  try {
    // Connect to MongoDB
    await db.connect();
    console.log('✅ Connected to MongoDB\n');

    // Get database statistics before archival
    const dbStats = await mongoose.connection.db.stats();
    console.log(`📊 Database stats before archival:`);
    console.log(`   - Storage size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Data size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Collections: ${dbStats.collections}\n`);

    // Legacy collections to archive
    const legacyCollections = [
      { name: 'entries', description: 'Legacy entries (bills/accounts)' },
      { name: 'categories', description: 'Legacy categories' },
      { name: 'contacts', description: 'Legacy contacts' },
      { name: 'recurringdetectionrules', description: 'Legacy detection rules' }
    ];

    let totalArchived = 0;

    for (const { name, description } of legacyCollections) {
      try {
        const collection = mongoose.connection.collection(name);

        // Check if collection exists and has documents
        const count = await collection.countDocuments();

        if (count === 0) {
          console.log(`⏭️  ${name}: No documents to archive`);
          continue;
        }

        // Count documents that are not already archived
        const unarchivedCount = await collection.countDocuments({ _archived: { $ne: true } });

        if (unarchivedCount === 0) {
          console.log(`⏭️  ${name}: Already archived (${count} documents)`);
          continue;
        }

        // Archive documents by adding _archived: true flag
        const result = await collection.updateMany(
          { _archived: { $ne: true } }, // Only update non-archived documents
          {
            $set: {
              _archived: true,
              _archivedAt: new Date(),
              _archivedBy: 'Story 2.5 - Legacy System Retirement'
            }
          }
        );

        console.log(`✅ ${name}: Archived ${result.modifiedCount} documents`);
        console.log(`   ${description}`);
        totalArchived += result.modifiedCount;

      } catch (err) {
        console.log(`⚠️  ${name}: Collection not found or error - ${err.message}`);
      }
    }

    console.log(`\n📦 Total documents archived: ${totalArchived}`);
    console.log(`\n✅ Legacy data archive complete!`);
    console.log(`\n📝 Notes:`);
    console.log(`   - Data is NOT deleted, only marked _archived: true`);
    console.log(`   - Reversible: Remove _archived flag to restore`);
    console.log(`   - Legacy API routes now return 410 Gone`);
    console.log(`   - Storage: Data remains in MongoDB (counts toward 512MB limit)`);

    // Get database statistics after archival
    const dbStatsAfter = await mongoose.connection.db.stats();
    console.log(`\n📊 Database stats after archival:`);
    console.log(`   - Storage size: ${(dbStatsAfter.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Data size: ${(dbStatsAfter.dataSize / 1024 / 1024).toFixed(2)} MB`);

    await db.close();
    console.log(`\n✅ Database connection closed`);
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Archive failed:', error.message);
    process.exit(1);
  }
}

// Only run if executed directly (not imported)
if (require.main === module) {
  archiveLegacyData();
}

module.exports = archiveLegacyData;
