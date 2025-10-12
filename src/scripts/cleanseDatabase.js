/**
 * Database Cleanse Script
 * Removes all transaction and pattern data while preserving user accounts and settings
 *
 * Usage: node src/scripts/cleanseDatabase.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function cleanseDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/household-finance';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Get collections
    const db = mongoose.connection.db;

    // Collections to cleanse
    const collectionsToClean = [
      'transactions',
      'patterns',
      'importsessions',
      'importedfiles'
    ];

    console.log('\n🗑️  Starting database cleanse...\n');

    for (const collectionName of collectionsToClean) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();

        if (count > 0) {
          await collection.deleteMany({});
          console.log(`✓ Deleted ${count} documents from ${collectionName}`);
        } else {
          console.log(`ℹ️  No documents in ${collectionName}`);
        }
      } catch (err) {
        console.log(`⚠️  Collection ${collectionName} does not exist or error: ${err.message}`);
      }
    }

    console.log('\n✓ Database cleanse complete!');
    console.log('\nPreserved:');
    console.log('  - User accounts');
    console.log('  - Domain records (Property, Vehicles, Finance, etc.)');
    console.log('  - Categories and RecordTypes');
    console.log('  - Settings');

    console.log('\nCleaned:');
    console.log('  - All bank import transactions');
    console.log('  - All detected patterns');
    console.log('  - All import sessions');
    console.log('  - All imported file records');

    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanseDatabase();
