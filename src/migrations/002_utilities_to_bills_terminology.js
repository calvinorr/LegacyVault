/**
 * Migration: Utilities to Bills Terminology
 * 
 * This migration updates terminology throughout the system from "utilities" to "bills":
 * 1. Updates Entry model type enum: 'utility' → 'bill'
 * 2. Updates Entry model category enum: 'Utilities' → 'Bills' 
 * 3. Migrates existing data: converts all 'utility' types and 'Utilities' categories to 'bills'
 * 4. Updates RecurringDetectionRules utility_rules to bill_rules (legacy support maintained)
 * 5. Updates ImportSession utility types to bill types
 */

const mongoose = require('mongoose');
const Entry = require('../models/entry');
const ImportSession = require('../models/ImportSession');
const RecurringDetectionRules = require('../models/RecurringDetectionRules');

async function up() {
  console.log('Running migration: Utilities to Bills Terminology');
  
  try {
    // 1. Migrate Entry documents: utility type → bill type
    console.log('Migrating Entry documents with type "utility" to "bill"...');
    const entryTypeResult = await Entry.updateMany(
      { type: 'utility' },
      { $set: { type: 'bill' } }
    );
    console.log(`Updated ${entryTypeResult.modifiedCount} entries from type "utility" to "bill"`);
    
    // 2. Migrate Entry documents: Utilities category → Bills category  
    console.log('Migrating Entry documents with category "Utilities" to "Bills"...');
    const entryCategoryResult = await Entry.updateMany(
      { category: 'Utilities' },
      { $set: { category: 'Bills' } }
    );
    console.log(`Updated ${entryCategoryResult.modifiedCount} entries from category "Utilities" to "Bills"`);
    
    // 3. Migrate ImportSession documents: utility type → bill type
    console.log('Migrating ImportSession documents with utility types...');
    const importSessionResult = await ImportSession.updateMany(
      { 'suggestions.type': 'utility' },
      { $set: { 'suggestions.$.type': 'bill' } }
    );
    console.log(`Updated ${importSessionResult.modifiedCount} import session suggestions from "utility" to "bill"`);
    
    // 4. Update RecurringDetectionRules: ensure utility_rules are accessible as bill_rules
    console.log('Updating RecurringDetectionRules to maintain legacy utility_rules compatibility...');
    const detectionRules = await RecurringDetectionRules.find({ utility_rules: { $exists: true, $ne: [] } });
    
    for (const rule of detectionRules) {
      // Copy utility_rules to bill_rules if bill_rules doesn't exist or is empty
      if (!rule.bill_rules || rule.bill_rules.length === 0) {
        rule.bill_rules = [...(rule.utility_rules || [])];
        await rule.save();
        console.log(`Copied utility_rules to bill_rules for detection rule: ${rule.name}`);
      }
    }
    
    console.log('Migration completed successfully');
    
    // Summary of changes
    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`✓ Migrated ${entryTypeResult.modifiedCount} entries from type "utility" to "bill"`);
    console.log(`✓ Migrated ${entryCategoryResult.modifiedCount} entries from category "Utilities" to "Bills"`);
    console.log(`✓ Updated ${importSessionResult.modifiedCount} import session suggestions`);
    console.log(`✓ Updated ${detectionRules.length} detection rule sets for backward compatibility`);
    console.log('✓ All "utilities" terminology has been migrated to "bills"');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function down() {
  console.log('Rolling back migration: Bills to Utilities Terminology');
  
  try {
    // 1. Revert Entry documents: bill type → utility type (only for entries that were migrated)
    console.log('Reverting Entry documents from "bill" back to "utility"...');
    // Note: This is a simplified rollback - in practice, you'd need to track which entries were migrated
    console.log('Warning: Rollback will convert ALL bill types back to utility types');
    
    const entryTypeResult = await Entry.updateMany(
      { type: 'bill' },
      { $set: { type: 'utility' } }
    );
    console.log(`Reverted ${entryTypeResult.modifiedCount} entries from type "bill" to "utility"`);
    
    // 2. Revert Entry documents: Bills category → Utilities category
    console.log('Reverting Entry documents from "Bills" back to "Utilities"...');
    const entryCategoryResult = await Entry.updateMany(
      { category: 'Bills' },
      { $set: { category: 'Utilities' } }
    );
    console.log(`Reverted ${entryCategoryResult.modifiedCount} entries from category "Bills" to "Utilities"`);
    
    // 3. Revert ImportSession documents
    console.log('Reverting ImportSession documents...');
    const importSessionResult = await ImportSession.updateMany(
      { 'suggestions.type': 'bill' },
      { $set: { 'suggestions.$.type': 'utility' } }
    );
    console.log(`Reverted ${importSessionResult.modifiedCount} import session suggestions`);
    
    // 4. Detection rules rollback (remove bill_rules that were copied from utility_rules)
    console.log('Cleaning up duplicated bill_rules from detection rules...');
    const detectionRules = await RecurringDetectionRules.find({ 
      bill_rules: { $exists: true, $ne: [] },
      utility_rules: { $exists: true, $ne: [] }
    });
    
    for (const rule of detectionRules) {
      // Clear bill_rules if they were copied from utility_rules  
      rule.bill_rules = [];
      await rule.save();
      console.log(`Cleared bill_rules for detection rule: ${rule.name}`);
    }
    
    console.log('Migration rollback completed');
    
    // Summary
    console.log('\n=== ROLLBACK SUMMARY ===');
    console.log(`✓ Reverted ${entryTypeResult.modifiedCount} entries from type "bill" to "utility"`);
    console.log(`✓ Reverted ${entryCategoryResult.modifiedCount} entries from category "Bills" to "Utilities"`);
    console.log(`✓ Reverted ${importSessionResult.modifiedCount} import session suggestions`);
    console.log(`✓ Cleaned up ${detectionRules.length} detection rule sets`);
    
  } catch (error) {
    console.error('Migration rollback failed:', error);
    throw error;
  }
}

// Utility function to validate migration success
async function validateMigration() {
  console.log('Validating migration...');
  
  const utilityTypeCount = await Entry.countDocuments({ type: 'utility' });
  const utilitiesCategoryCount = await Entry.countDocuments({ category: 'Utilities' });
  const billTypeCount = await Entry.countDocuments({ type: 'bill' });
  const billsCategoryCount = await Entry.countDocuments({ category: 'Bills' });
  
  console.log(`\nValidation Results:`);
  console.log(`- Entries with type "utility": ${utilityTypeCount}`);
  console.log(`- Entries with category "Utilities": ${utilitiesCategoryCount}`);
  console.log(`- Entries with type "bill": ${billTypeCount}`);  
  console.log(`- Entries with category "Bills": ${billsCategoryCount}`);
  
  if (utilityTypeCount === 0 && utilitiesCategoryCount === 0) {
    console.log('✅ Migration validation passed: No "utility" types or "Utilities" categories remain');
    return true;
  } else {
    console.log('❌ Migration validation failed: Some "utility" terminology still exists');
    return false;
  }
}

module.exports = { 
  up, 
  down, 
  validateMigration 
};