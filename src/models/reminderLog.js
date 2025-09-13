// src/models/reminderLog.js
// Log of all sent renewal reminders for tracking and preventing duplicates
// Supports audit trail and delivery status tracking

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReminderLogSchema = new Schema({
  // Entry this reminder is for
  entryId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Entry',
    required: true,
    index: true
  },
  
  // User who received the reminder
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  
  // Reminder details
  reminderType: { 
    type: String, 
    enum: ['individual', 'digest', 'urgent'], 
    default: 'individual' 
  },
  
  // Days ahead this reminder was sent for
  daysAhead: { 
    type: Number, 
    required: true 
  },
  
  // Renewal date this reminder was for
  renewalDate: { 
    type: Date, 
    required: true,
    index: true
  },
  
  // When reminder was sent
  sentAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  
  // Notification method used
  notificationMethod: { 
    type: String, 
    enum: ['email', 'sms', 'push', 'in-app'], 
    default: 'email' 
  },
  
  // Delivery status
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'delivered', 'failed', 'bounced', 'unsubscribed'], 
    default: 'pending',
    index: true
  },
  
  // External provider details (e.g., email service)
  deliveryDetails: {
    providerId: { type: String }, // External provider's message ID
    provider: { type: String }, // e.g., 'sendgrid', 'ses', 'nodemailer'
    recipientEmail: { type: String }, // Email address used
    subject: { type: String }, // Email subject line
    errorMessage: { type: String }, // If failed, error details
    deliveredAt: { type: Date }, // When marked as delivered
    openedAt: { type: Date }, // If email was opened (tracking)
    clickedAt: { type: Date } // If links were clicked (tracking)
  },
  
  // Content details
  contentDetails: {
    templateUsed: { type: String }, // Template identifier
    entryTitle: { type: String, required: true }, // Entry title at time of sending
    entryProvider: { type: String }, // Provider name at time of sending
    reminderMessage: { type: String }, // Generated reminder text
    renewalCycle: { type: String }, // Renewal cycle at time of sending
    customMessage: { type: String } // Any custom message added
  },
  
  // User interaction tracking
  userInteraction: {
    wasOpened: { type: Boolean, default: false },
    wasClicked: { type: Boolean, default: false },
    wasActedUpon: { type: Boolean, default: false }, // User took action (renewed, etc.)
    actionTakenAt: { type: Date },
    actionType: { type: String, enum: ['renewed', 'cancelled', 'postponed', 'ignored'] }
  },
  
  // System tracking
  systemInfo: {
    jobId: { type: String }, // Background job ID if applicable
    batchId: { type: String }, // Batch processing ID for digest emails
    retryCount: { type: Number, default: 0 },
    scheduledFor: { type: Date }, // When this reminder was scheduled to be sent
    processingTime: { type: Number } // Time taken to process (milliseconds)
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
ReminderLogSchema.index({ entryId: 1, daysAhead: 1, renewalDate: 1 }); // Prevent duplicate reminders
ReminderLogSchema.index({ userId: 1, sentAt: -1 }); // User's reminder history
ReminderLogSchema.index({ status: 1, sentAt: -1 }); // Failed deliveries
ReminderLogSchema.index({ 'systemInfo.batchId': 1 }); // Batch tracking
ReminderLogSchema.index({ renewalDate: 1, reminderType: 1 }); // Reminders by renewal date
ReminderLogSchema.index({ sentAt: 1 }, { expireAfterSeconds: 31536000 }); // Auto-delete after 1 year

// Instance method to mark as delivered
ReminderLogSchema.methods.markAsDelivered = function(deliveredAt = new Date()) {
  this.status = 'delivered';
  this.deliveryDetails.deliveredAt = deliveredAt;
  return this.save();
};

// Instance method to mark as failed
ReminderLogSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.deliveryDetails.errorMessage = errorMessage;
  return this.save();
};

// Instance method to track user interaction
ReminderLogSchema.methods.trackInteraction = function(interactionType, actionType = null) {
  switch (interactionType) {
    case 'opened':
      this.userInteraction.wasOpened = true;
      this.deliveryDetails.openedAt = new Date();
      break;
    case 'clicked':
      this.userInteraction.wasClicked = true;
      this.deliveryDetails.clickedAt = new Date();
      break;
    case 'acted':
      this.userInteraction.wasActedUpon = true;
      this.userInteraction.actionTakenAt = new Date();
      if (actionType) {
        this.userInteraction.actionType = actionType;
      }
      break;
  }
  return this.save();
};

// Static method to check if reminder was already sent
ReminderLogSchema.statics.wasReminderSent = async function(entryId, userId, daysAhead, renewalDate) {
  const existingReminder = await this.findOne({
    entryId,
    userId,
    daysAhead,
    renewalDate: {
      $gte: new Date(renewalDate.getFullYear(), renewalDate.getMonth(), renewalDate.getDate()),
      $lt: new Date(renewalDate.getFullYear(), renewalDate.getMonth(), renewalDate.getDate() + 1)
    },
    status: { $in: ['sent', 'delivered'] }
  });
  
  return !!existingReminder;
};

// Static method to get reminder statistics
ReminderLogSchema.statics.getStats = async function(userId = null, startDate = null, endDate = null) {
  const matchStage = {};
  
  if (userId) {
    matchStage.userId = userId;
  }
  
  if (startDate || endDate) {
    matchStage.sentAt = {};
    if (startDate) matchStage.sentAt.$gte = startDate;
    if (endDate) matchStage.sentAt.$lte = endDate;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSent: { $sum: 1 },
        delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        opened: { $sum: { $cond: ['$userInteraction.wasOpened', 1, 0] } },
        clicked: { $sum: { $cond: ['$userInteraction.wasClicked', 1, 0] } },
        actedUpon: { $sum: { $cond: ['$userInteraction.wasActedUpon', 1, 0] } },
        byType: {
          $push: {
            type: '$reminderType',
            method: '$notificationMethod'
          }
        }
      }
    },
    {
      $addFields: {
        deliveryRate: { $multiply: [{ $divide: ['$delivered', '$totalSent'] }, 100] },
        openRate: { $multiply: [{ $divide: ['$opened', '$delivered'] }, 100] },
        clickRate: { $multiply: [{ $divide: ['$clicked', '$opened'] }, 100] },
        actionRate: { $multiply: [{ $divide: ['$actedUpon', '$delivered'] }, 100] }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalSent: 0,
    delivered: 0,
    failed: 0,
    opened: 0,
    clicked: 0,
    actedUpon: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    actionRate: 0,
    byType: []
  };
};

// Static method to get failed deliveries for retry
ReminderLogSchema.statics.getFailedReminders = function(retryLimit = 3, hoursAgo = 24) {
  const cutoffDate = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000));
  
  return this.find({
    status: 'failed',
    'systemInfo.retryCount': { $lt: retryLimit },
    sentAt: { $gte: cutoffDate }
  }).populate('entryId userId');
};

// Static method to clean up old logs (called by maintenance job)
ReminderLogSchema.statics.cleanupOldLogs = function(monthsOld = 12) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);
  
  return this.deleteMany({
    sentAt: { $lt: cutoffDate },
    status: { $in: ['delivered', 'failed'] },
    'userInteraction.wasActedUpon': false
  });
};

module.exports = mongoose.model('ReminderLog', ReminderLogSchema);