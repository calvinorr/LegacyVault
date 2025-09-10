/**
 * Migration: Add Bank Import Support
 * 
 * This migration adds support for bank import functionality by:
 * 1. Creating indexes for ImportSession model
 * 2. Creating indexes for RecurringDetectionRules model  
 * 3. Adding indexes to Entry model for import metadata
 * 4. Seeding default UK detection rules
 */

const mongoose = require('mongoose');
const ImportSession = require('../models/ImportSession');
const RecurringDetectionRules = require('../models/RecurringDetectionRules');
const Entry = require('../models/entry');

async function up() {
  console.log('Running migration: Add Bank Import Support');
  
  try {
    // 1. Create ImportSession indexes (these should auto-create, but let's ensure they exist)
    console.log('Creating ImportSession indexes...');
    await ImportSession.ensureIndexes();
    
    // 2. Create RecurringDetectionRules indexes
    console.log('Creating RecurringDetectionRules indexes...');
    await RecurringDetectionRules.ensureIndexes();
    
    // 3. Create Entry indexes for import metadata queries
    console.log('Creating Entry import metadata indexes...');
    const entryCollection = mongoose.connection.collection('entries');
    
    // Index for finding entries by import source
    await entryCollection.createIndex({ 'import_metadata.source': 1 });
    
    // Index for finding entries created from suggestions
    await entryCollection.createIndex({ 'import_metadata.created_from_suggestion': 1 });
    
    // Index for finding entries by import session
    await entryCollection.createIndex({ 'import_metadata.import_session_id': 1 });
    
    // Compound index for common queries
    await entryCollection.createIndex({ 
      owner: 1, 
      'import_metadata.source': 1 
    });
    
    // 4. Seed default UK detection rules
    console.log('Seeding UK detection rules...');
    await seedUKDetectionRules();
    
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function down() {
  console.log('Rolling back migration: Add Bank Import Support');
  
  try {
    // Drop the collections (this will also drop indexes)
    console.log('Dropping import-related collections...');
    await mongoose.connection.collection('importsessions').drop().catch(() => {
      console.log('ImportSession collection did not exist');
    });
    
    await mongoose.connection.collection('recurringdetectionrules').drop().catch(() => {
      console.log('RecurringDetectionRules collection did not exist');
    });
    
    // Drop import metadata indexes from Entry collection
    console.log('Dropping Entry import indexes...');
    const entryCollection = mongoose.connection.collection('entries');
    
    const indexesToDrop = [
      'import_metadata.source_1',
      'import_metadata.created_from_suggestion_1', 
      'import_metadata.import_session_id_1',
      'owner_1_import_metadata.source_1'
    ];
    
    for (const indexName of indexesToDrop) {
      try {
        await entryCollection.dropIndex(indexName);
        console.log(`Dropped index: ${indexName}`);
      } catch (error) {
        console.log(`Index ${indexName} did not exist or could not be dropped`);
      }
    }
    
    console.log('Migration rollback completed');
    
  } catch (error) {
    console.error('Migration rollback failed:', error);
    throw error;
  }
}

async function seedUKDetectionRules() {
  // Check if default rules already exist
  const existingRules = await RecurringDetectionRules.findOne({ is_default: true });
  if (existingRules) {
    console.log('Default UK detection rules already exist, skipping seed');
    return;
  }
  
  const defaultRules = new RecurringDetectionRules({
    name: 'UK Banking Detection Rules v1.0',
    description: 'Default detection rules for UK bank statements covering major bills, council tax, and services',
    version: '1.0',
    is_default: true,
    
    // UK Utility providers
    utility_rules: [
      {
        name: 'British Gas Energy',
        patterns: ['BRITISH GAS', 'BG ENERGY', 'BRITISHGAS'],
        category: 'bills',
        subcategory: 'gas',
        provider: 'British Gas',
        confidence_boost: 0.2
      },
      {
        name: 'EDF Energy',
        patterns: ['EDF ENERGY', 'EDF', 'EDFENERGY'],
        category: 'bills',
        subcategory: 'electricity',
        provider: 'EDF Energy',
        confidence_boost: 0.2
      },
      {
        name: 'E.ON Energy',
        patterns: ['E.ON', 'EON ENERGY', 'E ON'],
        category: 'bills',
        subcategory: 'dual_fuel',
        provider: 'E.ON',
        confidence_boost: 0.2
      },
      {
        name: 'Octopus Energy',
        patterns: ['OCTOPUS ENERGY', 'OCTOPUS'],
        category: 'bills',
        subcategory: 'dual_fuel',
        provider: 'Octopus Energy',
        confidence_boost: 0.2
      },
      {
        name: 'SSE Energy',
        patterns: ['SSE', 'SSE ENERGY', 'SCOTTISH & SOUTHERN'],
        category: 'bills',
        subcategory: 'dual_fuel',
        provider: 'SSE',
        confidence_boost: 0.2
      },
      {
        name: 'Thames Water',
        patterns: ['THAMES WATER', 'THAMES WTR'],
        category: 'bills',
        subcategory: 'water',
        provider: 'Thames Water',
        confidence_boost: 0.2
      },
      {
        name: 'Anglian Water',
        patterns: ['ANGLIAN WATER', 'ANGLIAN WTR'],
        category: 'bills',
        subcategory: 'water',
        provider: 'Anglian Water',
        confidence_boost: 0.2
      }
    ],
    
    // UK Council Tax
    council_tax_rules: [
      {
        name: 'Council Tax Generic',
        patterns: ['COUNCIL TAX', 'COUNCIL-TAX', 'CT PAYMENT', 'LOCAL COUNCIL'],
        category: 'council_tax',
        subcategory: 'council_tax',
        provider: 'Local Council',
        confidence_boost: 0.3,
        expected_frequency: 'monthly'
      }
    ],
    
    // UK Telecoms
    telecoms_rules: [
      {
        name: 'Sky Services',
        patterns: ['SKY DIGITAL', 'SKY BROADBAND', 'SKY SUBSCRIPTION', 'SKY UK'],
        category: 'telecoms',
        subcategory: 'tv_broadband',
        provider: 'Sky',
        confidence_boost: 0.2
      },
      {
        name: 'BT Group',
        patterns: ['BT INTERNET', 'BRITISH TELECOM', 'BT BROADBAND', 'BT GROUP'],
        category: 'telecoms',
        subcategory: 'broadband',
        provider: 'BT',
        confidence_boost: 0.2
      },
      {
        name: 'Virgin Media',
        patterns: ['VIRGIN MEDIA', 'VIRGIN M-NET', 'VIRGINMEDIA'],
        category: 'telecoms',
        subcategory: 'tv_broadband',
        provider: 'Virgin Media',
        confidence_boost: 0.2
      },
      {
        name: 'TalkTalk',
        patterns: ['TALKTALK', 'TALK TALK'],
        category: 'telecoms',
        subcategory: 'broadband',
        provider: 'TalkTalk',
        confidence_boost: 0.2
      }
    ],
    
    // Insurance providers
    insurance_rules: [
      {
        name: 'Direct Line Insurance',
        patterns: ['DIRECT LINE', 'DL INSURANCE'],
        category: 'insurance',
        subcategory: 'car_home',
        provider: 'Direct Line',
        confidence_boost: 0.2
      },
      {
        name: 'Aviva Insurance',
        patterns: ['AVIVA', 'AVIVA INSURANCE'],
        category: 'insurance',
        subcategory: 'general',
        provider: 'Aviva',
        confidence_boost: 0.2
      }
    ],
    
    // Subscription services
    subscription_rules: [
      {
        name: 'Netflix UK',
        patterns: ['NETFLIX', 'NETFLIX.COM'],
        category: 'subscription',
        subcategory: 'streaming',
        provider: 'Netflix',
        confidence_boost: 0.3
      },
      {
        name: 'Amazon Prime',
        patterns: ['AMAZON PRIME', 'AMZN PRIME', 'AMAZON.CO.UK'],
        category: 'subscription',
        subcategory: 'shopping_streaming',
        provider: 'Amazon',
        confidence_boost: 0.3
      },
      {
        name: 'Spotify',
        patterns: ['SPOTIFY', 'SPOTIFY PREMIUM'],
        category: 'subscription',
        subcategory: 'music',
        provider: 'Spotify',
        confidence_boost: 0.3
      }
    ],
    
    // General patterns for other recurring payments
    general_rules: [
      {
        name: 'Direct Debit Pattern',
        patterns: ['DD$', 'DIRECT DEBIT', 'D/D'],
        category: 'other',
        confidence_boost: 0.1,
        min_occurrences: 3
      },
      {
        name: 'Standing Order Pattern',
        patterns: ['SO$', 'STANDING ORDER', 'S/O'],
        category: 'other',
        confidence_boost: 0.1,
        min_occurrences: 2
      }
    ],
    
    settings: {
      min_confidence_threshold: 0.7,
      fuzzy_match_threshold: 0.85,
      amount_variance_tolerance: 0.15, // 15% variance allowed
      frequency_detection_window_days: 90,
      require_uk_sort_code: false
    }
  });
  
  await defaultRules.save();
  console.log('Default UK detection rules seeded successfully');
}

module.exports = { up, down, seedUKDetectionRules };