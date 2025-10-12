#!/usr/bin/env node
/**
 * Cleanup Import Data Script
 *
 * Removes all ImportSessions and Transactions for fresh testing
 *
 * Usage:
 *   node src/scripts/cleanupImports.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ImportSession = require('../models/ImportSession');
const Transaction = require('../models/Transaction');

// Check if running with --force flag for non-interactive mode
const forceMode = process.argv.includes('--force');

async function cleanup() {
  console.log('='.repeat(60));
  console.log('🗑️  IMPORT DATA CLEANUP SCRIPT');
  console.log('='.repeat(60));
  console.log('⚠️  WARNING: This will DELETE all ImportSessions and Transactions');
  console.log('='.repeat(60));

  try {
    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Count current data
    const sessionCount = await ImportSession.countDocuments();
    const transactionCount = await Transaction.countDocuments();

    console.log('📊 Current Data:');
    console.log(`   Import Sessions: ${sessionCount}`);
    console.log(`   Transactions: ${transactionCount}`);
    console.log('');

    if (sessionCount === 0 && transactionCount === 0) {
      console.log('✅ No data to clean up. Database is already clean.');
      await mongoose.disconnect();
      return;
    }

    // Skip confirmation in force mode
    if (!forceMode) {
      console.log('\n⚠️  Add --force flag to run without confirmation');
      console.log('Example: node src/scripts/cleanupImports.js --force\n');
      await mongoose.disconnect();
      return;
    }

    console.log('\n🗑️  Deleting data...\n');

    // Delete Transactions
    const txnResult = await Transaction.deleteMany({});
    console.log(`✅ Deleted ${txnResult.deletedCount} Transactions`);

    // Delete ImportSessions
    const sessionResult = await ImportSession.deleteMany({});
    console.log(`✅ Deleted ${sessionResult.deletedCount} ImportSessions`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ CLEANUP COMPLETE');
    console.log('='.repeat(60));
    console.log('Database is now clean and ready for testing.\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run cleanup
cleanup();
