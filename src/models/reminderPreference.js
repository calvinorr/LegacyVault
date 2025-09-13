// src/models/reminderPreference.js
// User preferences for renewal reminder notifications
// Supports global settings and category-specific overrides

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Category override schema for specific reminder preferences per category
const CategoryOverrideSchema = new Schema({
  categoryId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category',
    required: true
  },
  enabled: { type: Boolean, default: true },
  reminderDays: { type: [Number], default: [30, 7] }, // Days before renewal to send reminders
  notificationMethods: {
    email: { type: Boolean, default: true },
    // Future: SMS, push notifications, etc.
  }
}, { _id: false });

const ReminderPreferenceSchema = new Schema({
  // User this preference belongs to
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // Each user has one preference document
  },
  
  // Global reminder settings
  globalEnabled: { type: Boolean, default: true }, // Master switch for all reminders
  defaultReminderDays: { type: [Number], default: [30, 7] }, // Default days before renewal
  
  // Notification methods
  notificationMethods: {
    email: { type: Boolean, default: true },
    // Future expansion: SMS, push notifications, in-app, etc.
  },
  
  // Email-specific settings
  emailSettings: {
    preferredTime: { 
      type: String, 
      enum: ['morning', 'afternoon', 'evening'], 
      default: 'morning' 
    }, // When to send daily digest
    digestFrequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'never'], 
      default: 'weekly' 
    }, // How often to send reminder digest
    individualReminders: { type: Boolean, default: true } // Send individual reminders per entry
  },
  
  // Category-specific overrides
  categoryOverrides: { type: [CategoryOverrideSchema], default: [] },
  
  // UK-specific preferences
  dateFormat: { 
    type: String, 
    enum: ['DD/MM/YYYY', 'DD-MM-YYYY', 'DD.MM.YYYY'], 
    default: 'DD/MM/YYYY' 
  },
  
  // Advanced settings
  advancedSettings: {
    excludeWeekends: { type: Boolean, default: false }, // Don't send reminders on weekends
    excludeBankHolidays: { type: Boolean, default: false }, // Don't send on UK bank holidays
    timezone: { type: String, default: 'Europe/London' }, // UK timezone
    quietHours: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: '22:00' }, // 24-hour format
      endTime: { type: String, default: '08:00' }
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
ReminderPreferenceSchema.index({ userId: 1 }, { unique: true });
ReminderPreferenceSchema.index({ 'categoryOverrides.categoryId': 1 });

// Instance method to get effective reminder settings for a category
ReminderPreferenceSchema.methods.getReminderSettingsForCategory = function(categoryId) {
  // If global reminders are disabled, return disabled
  if (!this.globalEnabled) {
    return {
      enabled: false,
      reminderDays: [],
      notificationMethods: { email: false }
    };
  }

  // Check for category-specific override
  const override = this.categoryOverrides.find(
    override => override.categoryId.toString() === categoryId.toString()
  );

  if (override) {
    return {
      enabled: override.enabled,
      reminderDays: override.reminderDays,
      notificationMethods: override.notificationMethods
    };
  }

  // Return global defaults
  return {
    enabled: true,
    reminderDays: this.defaultReminderDays,
    notificationMethods: this.notificationMethods
  };
};

// Instance method to add or update category override
ReminderPreferenceSchema.methods.setCategoryOverride = function(categoryId, settings) {
  const existingOverrideIndex = this.categoryOverrides.findIndex(
    override => override.categoryId.toString() === categoryId.toString()
  );

  const newOverride = {
    categoryId,
    enabled: settings.enabled !== undefined ? settings.enabled : true,
    reminderDays: settings.reminderDays || this.defaultReminderDays,
    notificationMethods: {
      email: settings.notificationMethods?.email !== undefined 
        ? settings.notificationMethods.email 
        : this.notificationMethods.email
    }
  };

  if (existingOverrideIndex >= 0) {
    this.categoryOverrides[existingOverrideIndex] = newOverride;
  } else {
    this.categoryOverrides.push(newOverride);
  }

  return this.save();
};

// Instance method to remove category override
ReminderPreferenceSchema.methods.removeCategoryOverride = function(categoryId) {
  this.categoryOverrides = this.categoryOverrides.filter(
    override => override.categoryId.toString() !== categoryId.toString()
  );
  return this.save();
};

// Static method to get or create user preferences
ReminderPreferenceSchema.statics.getOrCreateForUser = async function(userId) {
  let preferences = await this.findOne({ userId });
  
  if (!preferences) {
    preferences = new this({ userId });
    await preferences.save();
  }
  
  return preferences;
};

// Static method to find users with notifications enabled
ReminderPreferenceSchema.statics.findUsersWithNotificationsEnabled = function(notificationMethod = 'email') {
  const query = {
    globalEnabled: true
  };
  
  if (notificationMethod) {
    query[`notificationMethods.${notificationMethod}`] = true;
  }
  
  return this.find(query).populate('userId', 'email displayName');
};

module.exports = mongoose.model('ReminderPreference', ReminderPreferenceSchema);