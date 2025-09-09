/**
 * Simple migration runner for LegacyLock
 * 
 * Usage:
 *   node src/scripts/runMigrations.js up
 *   node src/scripts/runMigrations.js down
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/household-finance-dev';

async function connectDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB: ${MONGO_URI}`);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

async function runMigration(direction = 'up') {
  await connectDatabase();
  
  const migrationsDir = path.join(__dirname, '../migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort();
  
  console.log(`Running migrations (${direction})...`);
  console.log(`Found ${migrationFiles.length} migration files`);
  
  for (const file of migrationFiles) {
    const migrationPath = path.join(migrationsDir, file);
    const migration = require(migrationPath);
    
    if (typeof migration[direction] === 'function') {
      console.log(`\n--- Running ${file} (${direction}) ---`);
      
      try {
        await migration[direction]();
        console.log(`✓ ${file} completed successfully`);
      } catch (error) {
        console.error(`✗ ${file} failed:`, error.message);
        process.exit(1);
      }
    } else {
      console.log(`⚠ ${file} does not have a ${direction} function, skipping`);
    }
  }
  
  console.log(`\n✓ All migrations completed successfully`);
  await mongoose.disconnect();
}

// Parse command line arguments
const direction = process.argv[2] || 'up';

if (!['up', 'down'].includes(direction)) {
  console.error('Usage: node runMigrations.js [up|down]');
  process.exit(1);
}

// Run migrations
runMigration(direction)
  .then(() => {
    console.log('Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration process failed:', error);
    process.exit(1);
  });