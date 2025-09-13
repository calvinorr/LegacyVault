// src/utils/renewalMigration.js
// Utility functions for migrating existing entries to support renewal reminders
// and setting up initial reminder preferences for users

const Entry = require('../models/entry');
const ReminderPreference = require('../models/reminderPreference');
const Category = require('../models/category');
const User = require('../models/user');

/**
 * Categories that typically have renewal dates in the UK
 */
const RENEWAL_RELEVANT_CATEGORIES = [
  'Insurance',
  'Subscriptions', 
  'Utilities',
  'Bills',
  'Policy',
  'Investments'
];

/**
 * Providers that commonly have annual renewals
 */
const ANNUAL_RENEWAL_PROVIDERS = [
  'British Gas', 'EDF Energy', 'Octopus Energy', 'Bulb', 'SSE', 'Scottish Power',
  'BT', 'Sky', 'Virgin Media', 'TalkTalk', 'Plusnet',
  'Direct Line', 'Aviva', 'LV=', 'Admiral', 'Churchill', 'Hastings Direct',
  'AA', 'RAC', 'Green Flag',
  'TV Licence', 'Netflix', 'Amazon Prime', 'Disney+', 'Spotify'
];

/**
 * Initialize reminder preferences for all existing users
 */
async function initializeReminderPreferences() {
  console.log('🔄 Initializing reminder preferences for all users...');
  
  try {
    const users = await User.find({});
    let initCount = 0;
    
    for (const user of users) {
      const existingPrefs = await ReminderPreference.findOne({ userId: user._id });
      
      if (!existingPrefs) {
        await ReminderPreference.getOrCreateForUser(user._id);
        initCount++;
        console.log(`   ✓ Created preferences for user: ${user.displayName || user.email}`);
      }
    }
    
    console.log(`✅ Initialized reminder preferences for ${initCount} users`);
    return { initialized: initCount, skipped: users.length - initCount };
  } catch (error) {
    console.error('❌ Error initializing reminder preferences:', error);
    throw error;
  }
}

/**
 * Suggest renewal info for existing entries based on category and provider
 */
async function suggestRenewalInfoForEntries(dryRun = true) {
  console.log(`🔄 ${dryRun ? 'Analyzing' : 'Updating'} entries for renewal suggestions...`);
  
  try {
    const entries = await Entry.find({
      renewalInfo: { $exists: false },
      $or: [
        { category: { $in: RENEWAL_RELEVANT_CATEGORIES } },
        { provider: { $in: ANNUAL_RENEWAL_PROVIDERS } }
      ]
    }).populate('categoryId');
    
    const suggestions = [];
    
    for (const entry of entries) {
      const suggestion = await generateRenewalSuggestion(entry);
      if (suggestion) {
        suggestions.push({
          entryId: entry._id,
          title: entry.title,
          provider: entry.provider,
          category: entry.category,
          suggestion
        });
        
        if (!dryRun) {
          entry.renewalInfo = suggestion;
          await entry.save();
          console.log(`   ✓ Updated: ${entry.title} (${entry.provider || 'No provider'})`);
        }
      }
    }
    
    if (dryRun) {
      console.log(`📊 Found ${suggestions.length} entries that could benefit from renewal tracking:`);
      suggestions.forEach(s => {
        console.log(`   - ${s.title} (${s.provider || 'No provider'}) - ${s.category}`);
        console.log(`     Suggested cycle: ${s.suggestion.renewalCycle}, reminders: ${s.suggestion.reminderDays.join(', ')} days`);
      });
    } else {
      console.log(`✅ Updated ${suggestions.length} entries with renewal info`);
    }
    
    return suggestions;
  } catch (error) {
    console.error('❌ Error processing entries for renewal suggestions:', error);
    throw error;
  }
}

/**
 * Generate renewal suggestion for a single entry
 */
async function generateRenewalSuggestion(entry) {
  // Skip if already has renewal info
  if (entry.renewalInfo) {
    return null;
  }
  
  // Determine renewal cycle based on provider and category
  let renewalCycle = 'annually'; // Default for UK financial products
  let reminderDays = [30, 7]; // Default UK reminder schedule
  let isActive = true;
  
  // Category-based logic
  if (entry.category === 'Utilities' || entry.category === 'Bills') {
    // Most UK utilities are annual contracts
    renewalCycle = 'annually';
    reminderDays = [60, 30, 7]; // Longer notice for utilities
  } else if (entry.category === 'Subscriptions') {
    // Many subscriptions are monthly, but some are annual
    if (isLikelyAnnualProvider(entry.provider)) {
      renewalCycle = 'annually';
    } else {
      renewalCycle = 'monthly';
      reminderDays = [7, 1]; // Shorter notice for monthly subscriptions
    }
  } else if (entry.category === 'Insurance' || entry.category === 'Policy') {
    // UK insurance is typically annual
    renewalCycle = 'annually';
    reminderDays = [60, 30, 14, 7]; // Multiple reminders for insurance
  } else if (entry.category === 'Investments' || entry.category === 'Pensions') {
    // These may have annual reviews but not strict renewals
    isActive = false; // Suggest but don't activate by default
    renewalCycle = 'annually';
    reminderDays = [90, 30]; // Longer notice for investment reviews
  }
  
  // Provider-specific overrides
  if (entry.provider) {
    const providerLower = entry.provider.toLowerCase();
    
    if (providerLower.includes('netflix') || providerLower.includes('spotify') || 
        providerLower.includes('amazon prime') || providerLower.includes('disney')) {
      renewalCycle = 'monthly';
      reminderDays = [7, 1];
    } else if (providerLower.includes('tv licence')) {
      renewalCycle = 'annually';
      reminderDays = [60, 30, 14, 7]; // TV licence is important in UK
    }
  }
  
  // Only suggest if it makes sense for this entry type
  if (entry.type === 'note' || entry.category === 'Other') {
    return null;
  }
  
  return {
    renewalCycle,
    reminderDays,
    isActive,
    notes: `Auto-suggested based on category: ${entry.category} and provider: ${entry.provider || 'Unknown'}`
  };
}

/**
 * Check if a provider typically has annual renewals
 */
function isLikelyAnnualProvider(provider) {
  if (!provider) return false;
  
  const providerLower = provider.toLowerCase();
  
  // UK-specific annual providers
  const annualKeywords = [
    'insurance', 'direct line', 'aviva', 'admiral', 'churchill',
    'british gas', 'edf', 'octopus energy', 'sse', 'scottish power',
    'bt', 'sky', 'virgin media', 'tv licence',
    'aa', 'rac', 'breakdown'
  ];
  
  return annualKeywords.some(keyword => providerLower.includes(keyword));
}

/**
 * Set up category-specific reminder defaults
 */
async function setupCategoryReminderDefaults(userId = null) {
  console.log('🔄 Setting up category-specific reminder defaults...');
  
  try {
    let users;
    if (userId) {
      users = [await User.findById(userId)];
    } else {
      users = await User.find({});
    }
    
    const categories = await Category.find({ 
      isDeleted: false,
      name: { $in: RENEWAL_RELEVANT_CATEGORIES }
    });
    
    let updateCount = 0;
    
    for (const user of users) {
      const prefs = await ReminderPreference.getOrCreateForUser(user._id);
      
      for (const category of categories) {
        // Set category-specific defaults based on UK financial practices
        let categorySettings = {};
        
        switch (category.name) {
          case 'Insurance':
            categorySettings = {
              enabled: true,
              reminderDays: [60, 30, 14, 7], // Multiple reminders for insurance
              notificationMethods: { email: true }
            };
            break;
          case 'Utilities':
            categorySettings = {
              enabled: true,
              reminderDays: [60, 30, 7], // Early notice for utility contracts
              notificationMethods: { email: true }
            };
            break;
          case 'Subscriptions':
            categorySettings = {
              enabled: true,
              reminderDays: [7, 1], // Short notice for subscriptions
              notificationMethods: { email: true }
            };
            break;
          default:
            categorySettings = {
              enabled: true,
              reminderDays: [30, 7],
              notificationMethods: { email: true }
            };
        }
        
        // Check if override already exists
        const existingOverride = prefs.categoryOverrides.find(
          override => override.categoryId.toString() === category._id.toString()
        );
        
        if (!existingOverride) {
          await prefs.setCategoryOverride(category._id, categorySettings);
          updateCount++;
        }
      }
    }
    
    console.log(`✅ Set up category defaults for ${updateCount} category-user combinations`);
    return { updated: updateCount };
  } catch (error) {
    console.error('❌ Error setting up category defaults:', error);
    throw error;
  }
}

/**
 * Validate existing renewal data
 */
async function validateRenewalData() {
  console.log('🔄 Validating renewal data integrity...');
  
  try {
    const issues = [];
    
    // Check for entries with invalid renewal dates
    const invalidDates = await Entry.find({
      'renewalInfo.endDate': { $lt: new Date('2020-01-01') }
    });
    
    if (invalidDates.length > 0) {
      issues.push(`Found ${invalidDates.length} entries with invalid renewal end dates`);
    }
    
    // Check for entries with future start dates but no end date
    const missingEndDates = await Entry.find({
      'renewalInfo.startDate': { $exists: true },
      'renewalInfo.endDate': { $exists: false }
    });
    
    if (missingEndDates.length > 0) {
      issues.push(`Found ${missingEndDates.length} entries with start dates but no end dates`);
    }
    
    // Check for reminder preferences without users
    const orphanedPrefs = await ReminderPreference.find().populate('userId');
    const invalidPrefs = orphanedPrefs.filter(pref => !pref.userId);
    
    if (invalidPrefs.length > 0) {
      issues.push(`Found ${invalidPrefs.length} orphaned reminder preferences`);
    }
    
    if (issues.length === 0) {
      console.log('✅ All renewal data validation passed');
    } else {
      console.log('⚠️ Validation issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    return { valid: issues.length === 0, issues };
  } catch (error) {
    console.error('❌ Error validating renewal data:', error);
    throw error;
  }
}

/**
 * Main migration runner
 */
async function runFullMigration(options = {}) {
  const { dryRun = false, userId = null } = options;
  
  console.log(`🚀 Starting renewal reminder system migration ${dryRun ? '(DRY RUN)' : '(LIVE)'}...`);
  console.log('============================================================');
  
  try {
    // Step 1: Initialize reminder preferences
    await initializeReminderPreferences();
    console.log('');
    
    // Step 2: Set up category defaults
    await setupCategoryReminderDefaults(userId);
    console.log('');
    
    // Step 3: Suggest renewal info for entries
    await suggestRenewalInfoForEntries(dryRun);
    console.log('');
    
    // Step 4: Validate data
    await validateRenewalData();
    console.log('');
    
    console.log('✅ Migration completed successfully!');
    console.log('============================================================');
    
    if (dryRun) {
      console.log('ℹ️  This was a dry run. Re-run with dryRun: false to apply changes.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

module.exports = {
  initializeReminderPreferences,
  suggestRenewalInfoForEntries,
  generateRenewalSuggestion,
  setupCategoryReminderDefaults,
  validateRenewalData,
  runFullMigration,
  RENEWAL_RELEVANT_CATEGORIES,
  ANNUAL_RENEWAL_PROVIDERS
};