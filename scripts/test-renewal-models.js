#!/usr/bin/env node
// scripts/test-renewal-models.js
// Test script to verify the renewal reminder models work correctly

const mongoose = require('mongoose');
const { Entry, ReminderPreference, ReminderLog, User, Category } = require('../src/models');
const { runFullMigration } = require('../src/utils/renewalMigration');

// Use test database
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/legacy-lock-renewal-test';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to test database');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  
  await Promise.all([
    Entry.deleteMany({ title: { $regex: /^TEST:/ } }),
    ReminderPreference.deleteMany({}),
    ReminderLog.deleteMany({}),
    User.deleteMany({ email: { $regex: /^test-/ } }),
    Category.deleteMany({ name: { $regex: /^TEST:/ } })
  ]);
  
  console.log('✅ Test data cleaned up');
}

async function createTestData() {
  console.log('🏗️ Creating test data...');
  
  // Create test user
  const testUser = new User({
    googleId: 'test-123456',
    displayName: 'Test User',
    email: 'test-user@example.com',
    role: 'user',
    approved: true
  });
  await testUser.save();
  
  // Create test category
  const testCategory = new Category({
    name: 'TEST: Insurance',
    description: 'Test insurance category',
    userId: testUser._id,
    isSystemCategory: true
  });
  await testCategory.save();
  
  // Create test entry with renewal info
  const testEntry = new Entry({
    title: 'TEST: Home Insurance Policy',
    type: 'policy',
    provider: 'Direct Line',
    category: 'Insurance',
    categoryId: testCategory._id,
    renewalInfo: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      renewalCycle: 'annually',
      reminderDays: [60, 30, 14, 7],
      isActive: true,
      autoRenewal: false,
      notes: 'Test home insurance policy'
    },
    owner: testUser._id,
    confidential: true
  });
  await testEntry.save();
  
  console.log('✅ Test data created');
  return { testUser, testCategory, testEntry };
}

async function testEntryMethods(testEntry) {
  console.log('🧪 Testing Entry model methods...');
  
  // Test renewal reminder check
  const needsReminder30 = testEntry.needsRenewalReminder(30);
  const needsReminder7 = testEntry.needsRenewalReminder(7);
  
  console.log(`   - Needs 30-day reminder: ${needsReminder30}`);
  console.log(`   - Needs 7-day reminder: ${needsReminder7}`);
  
  // Test next renewal date calculation
  const nextRenewalDate = testEntry.getNextRenewalDate();
  console.log(`   - Next renewal date: ${nextRenewalDate?.toISOString().split('T')[0] || 'N/A'}`);
  
  // Test static method for finding entries needing reminders
  const entriesNeedingReminders = await Entry.findEntriesNeedingReminders();
  console.log(`   - Found ${entriesNeedingReminders.length} entries needing reminders`);
  
  console.log('✅ Entry methods tested');
}

async function testReminderPreferences(testUser, testCategory) {
  console.log('🧪 Testing ReminderPreference model...');
  
  // Create preferences for test user
  const prefs = await ReminderPreference.getOrCreateForUser(testUser._id);
  console.log(`   - Created preferences for user: ${testUser.displayName}`);
  
  // Test category override
  await prefs.setCategoryOverride(testCategory._id, {
    enabled: true,
    reminderDays: [45, 15, 3],
    notificationMethods: { email: true }
  });
  console.log('   - Set category override');
  
  // Test getting effective settings
  const effectiveSettings = prefs.getReminderSettingsForCategory(testCategory._id);
  console.log(`   - Effective settings for category: ${JSON.stringify(effectiveSettings)}`);
  
  // Test finding users with notifications enabled
  const usersWithNotifications = await ReminderPreference.findUsersWithNotificationsEnabled('email');
  console.log(`   - Found ${usersWithNotifications.length} users with email notifications enabled`);
  
  console.log('✅ ReminderPreference methods tested');
  return prefs;
}

async function testReminderLog(testUser, testEntry) {
  console.log('🧪 Testing ReminderLog model...');
  
  // Create test reminder log
  const reminderLog = new ReminderLog({
    entryId: testEntry._id,
    userId: testUser._id,
    reminderType: 'individual',
    daysAhead: 30,
    renewalDate: testEntry.renewalInfo.endDate,
    notificationMethod: 'email',
    status: 'sent',
    contentDetails: {
      templateUsed: 'standard-renewal-reminder',
      entryTitle: testEntry.title,
      entryProvider: testEntry.provider,
      reminderMessage: 'Your insurance policy expires in 30 days',
      renewalCycle: testEntry.renewalInfo.renewalCycle
    },
    deliveryDetails: {
      provider: 'test-provider',
      recipientEmail: testUser.email,
      subject: 'Renewal Reminder: Home Insurance Policy'
    }
  });
  
  await reminderLog.save();
  console.log('   - Created reminder log entry');
  
  // Test duplicate check
  const isDuplicate = await ReminderLog.wasReminderSent(
    testEntry._id, 
    testUser._id, 
    30, 
    testEntry.renewalInfo.endDate
  );
  console.log(`   - Duplicate check result: ${isDuplicate}`);
  
  // Test interaction tracking
  await reminderLog.trackInteraction('opened');
  await reminderLog.trackInteraction('clicked');
  await reminderLog.trackInteraction('acted', 'renewed');
  console.log('   - Tracked user interactions');
  
  // Test statistics
  const stats = await ReminderLog.getStats(testUser._id);
  console.log(`   - Reminder statistics: ${JSON.stringify(stats, null, 2)}`);
  
  console.log('✅ ReminderLog methods tested');
}

async function testMigrationUtilities() {
  console.log('🧪 Testing migration utilities...');
  
  // Run migration in dry-run mode
  await runFullMigration({ dryRun: true });
  console.log('✅ Migration utilities tested');
}

async function runAllTests() {
  console.log('🚀 Starting renewal reminder system tests...');
  console.log('='.repeat(60));
  
  try {
    await connectDB();
    
    await cleanupTestData();
    
    const { testUser, testCategory, testEntry } = await createTestData();
    
    await testEntryMethods(testEntry);
    console.log('');
    
    await testReminderPreferences(testUser, testCategory);
    console.log('');
    
    await testReminderLog(testUser, testEntry);
    console.log('');
    
    await testMigrationUtilities();
    console.log('');
    
    console.log('✅ All tests completed successfully!');
    console.log('='.repeat(60));
    
    // Cleanup
    await cleanupTestData();
    console.log('🧹 Test cleanup completed');
    
  } catch (error) {
    console.error('❌ Tests failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('🎉 Test suite completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  createTestData,
  testEntryMethods,
  testReminderPreferences,
  testReminderLog,
  testMigrationUtilities
};