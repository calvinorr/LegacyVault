// Renewal Reminder Processing Engine
// Processes entries and generates renewal reminders based on UK financial product configurations

const Entry = require('../models/entry');
const User = require('../models/user');
const productDetectionService = require('../utils/productDetection');

class RenewalReminderEngine {
  constructor() {
    this.processedToday = new Set();
    this.isProcessing = false;
  }

  /**
   * Main reminder processing entry point
   * Can be called daily via cron job or manually
   */
  async processAllReminders() {
    if (this.isProcessing) {
      console.log('Reminder processing already in progress, skipping...');
      return { status: 'skipped', reason: 'already_processing' };
    }

    this.isProcessing = true;
    const startTime = Date.now();
    
    try {
      console.log('Starting renewal reminder processing...');
      
      const results = {
        totalProcessed: 0,
        remindersGenerated: 0,
        errors: [],
        processed: {
          critical: 0,
          important: 0,
          strategic: 0
        },
        summary: []
      };

      // Get all active entries with renewal tracking
      const activeEntries = await this.getActiveRenewalEntries();
      console.log(`Found ${activeEntries.length} entries with active renewal tracking`);

      // Process each entry
      for (const entry of activeEntries) {
        try {
          const reminderResult = await this.processEntryReminders(entry);
          results.totalProcessed++;
          
          if (reminderResult.shouldSendReminder) {
            results.remindersGenerated++;
            results.processed[reminderResult.urgencyLevel]++;
            results.summary.push({
              entryId: entry._id,
              title: entry.title,
              daysUntilExpiry: reminderResult.daysUntilExpiry,
              urgencyLevel: reminderResult.urgencyLevel,
              reminderType: reminderResult.reminderType
            });
          }

          // Update entry processing timestamps
          await this.updateEntryProcessingInfo(entry, reminderResult);

        } catch (error) {
          console.error(`Error processing entry ${entry._id}:`, error);
          results.errors.push({
            entryId: entry._id,
            title: entry.title,
            error: error.message
          });
        }
      }

      const processingTime = Date.now() - startTime;
      console.log(`Renewal reminder processing completed in ${processingTime}ms`);
      console.log(`Processed: ${results.totalProcessed}, Reminders: ${results.remindersGenerated}`);

      return {
        status: 'completed',
        processingTime,
        ...results
      };

    } catch (error) {
      console.error('Fatal error in renewal reminder processing:', error);
      return {
        status: 'error',
        error: error.message
      };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get all entries with active renewal tracking
   */
  async getActiveRenewalEntries() {
    return await Entry.find({
      'renewalInfo.isActive': true,
      'renewalInfo.endDate': { $exists: true, $ne: null }
    })
    .populate('owner', 'email displayName')
    .sort({ 'renewalInfo.endDate': 1 }); // Process entries expiring soonest first
  }

  /**
   * Process reminders for a single entry
   */
  async processEntryReminders(entry) {
    const renewalInfo = entry.renewalInfo;
    const today = new Date();
    
    // Calculate days until expiry/renewal
    const endDate = new Date(renewalInfo.endDate);
    const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    // Check if entry has expired
    if (daysUntilExpiry < 0) {
      return this.handleExpiredEntry(entry, Math.abs(daysUntilExpiry));
    }

    // Determine if we should send a reminder today
    const shouldSendReminder = this.shouldSendReminderToday(renewalInfo, daysUntilExpiry);
    
    if (!shouldSendReminder) {
      return {
        shouldSendReminder: false,
        daysUntilExpiry,
        reason: 'no_reminder_due'
      };
    }

    // Determine reminder type and urgency
    const reminderType = this.determineReminderType(renewalInfo, daysUntilExpiry);
    const urgencyLevel = this.calculateUrgencyLevel(renewalInfo, daysUntilExpiry);

    // Check if we need compliance warnings
    const complianceWarnings = this.getComplianceWarnings(renewalInfo, daysUntilExpiry);

    // Generate reminder content
    const reminderContent = await this.generateReminderContent(entry, {
      daysUntilExpiry,
      reminderType,
      urgencyLevel,
      complianceWarnings
    });

    // Log reminder for now (would send email in production)
    console.log(`📅 Renewal Reminder: ${entry.title} (${daysUntilExpiry} days, ${urgencyLevel})`);
    
    return {
      shouldSendReminder: true,
      daysUntilExpiry,
      reminderType,
      urgencyLevel,
      complianceWarnings,
      reminderContent
    };
  }

  /**
   * Check if a reminder should be sent today
   */
  shouldSendReminderToday(renewalInfo, daysUntilExpiry) {
    // Check if today matches any of the reminder days
    const reminderDays = renewalInfo.reminderDays || [30, 7];
    
    // Check for exact match
    if (reminderDays.includes(daysUntilExpiry)) {
      return true;
    }

    // For critical items, send additional reminders if very close
    if (renewalInfo.urgencyLevel === 'critical' && daysUntilExpiry <= 3) {
      return true;
    }

    // Check if last reminder was sent more than a week ago for overdue items
    if (daysUntilExpiry <= 0 && renewalInfo.lastReminderSent) {
      const daysSinceLastReminder = Math.ceil(
        (new Date() - new Date(renewalInfo.lastReminderSent)) / (1000 * 60 * 60 * 24)
      );
      return daysSinceLastReminder >= 7; // Weekly reminders for overdue
    }

    return false;
  }

  /**
   * Determine the type of reminder needed
   */
  determineReminderType(renewalInfo, daysUntilExpiry) {
    if (daysUntilExpiry <= 0) return 'overdue';
    if (daysUntilExpiry <= 7) return 'urgent';
    if (daysUntilExpiry <= 30) return 'upcoming';
    return 'early_warning';
  }

  /**
   * Calculate urgency level based on days until expiry and product type
   */
  calculateUrgencyLevel(renewalInfo, daysUntilExpiry) {
    const baseUrgency = renewalInfo.urgencyLevel || 'important';
    
    // Escalate urgency as expiry approaches
    if (daysUntilExpiry <= 0) return 'critical'; // Overdue
    if (daysUntilExpiry <= 3) return 'critical'; // Very close
    if (daysUntilExpiry <= 7 && baseUrgency === 'critical') return 'critical';
    if (daysUntilExpiry <= 14 && baseUrgency !== 'strategic') return 'important';
    
    return baseUrgency;
  }

  /**
   * Get compliance warnings for the product type
   */
  getComplianceWarnings(renewalInfo, daysUntilExpiry) {
    const warnings = [];

    // Legal requirement warnings
    if (renewalInfo.regulatoryType === 'government_required') {
      if (daysUntilExpiry <= 7) {
        warnings.push({
          type: 'legal',
          severity: 'high',
          message: 'Legal requirement - action needed to avoid penalties'
        });
      }
    }

    // FCA regulated warnings  
    if (renewalInfo.regulatoryType === 'fca_regulated') {
      if (daysUntilExpiry <= 14) {
        warnings.push({
          type: 'regulatory',
          severity: 'medium',
          message: 'FCA regulated product - review terms before renewal'
        });
      }
    }

    // Notice period warnings
    if (renewalInfo.noticePeriod && daysUntilExpiry <= renewalInfo.noticePeriod) {
      warnings.push({
        type: 'notice_period',
        severity: 'high',
        message: `${renewalInfo.noticePeriod} days notice required - deadline approaching`
      });
    }

    // Auto-renewal warnings
    if (renewalInfo.isAutoRenewal && daysUntilExpiry <= 30) {
      warnings.push({
        type: 'auto_renewal',
        severity: 'medium',
        message: 'Auto-renewal product - compare alternatives before deadline'
      });
    }

    return warnings;
  }

  /**
   * Generate reminder content
   */
  async generateReminderContent(entry, reminderData) {
    const { daysUntilExpiry, reminderType, urgencyLevel, complianceWarnings } = reminderData;
    
    // Get product-specific guidance
    const productConfig = this.getProductGuidance(entry.renewalInfo);
    
    return {
      subject: this.generateEmailSubject(entry, reminderType, daysUntilExpiry),
      priority: urgencyLevel,
      entry: {
        id: entry._id,
        title: entry.title,
        provider: entry.provider,
        type: entry.renewalInfo.productType
      },
      timeline: {
        daysUntilExpiry,
        endDate: entry.renewalInfo.endDate,
        reminderType
      },
      actions: this.generateActionItems(entry.renewalInfo, daysUntilExpiry),
      warnings: complianceWarnings,
      guidance: productConfig?.renewalNotes || null,
      links: {
        entryUrl: `/entries/${entry._id}`,
        providerUrl: entry.accountDetails?.onlineAccountUrl || null
      }
    };
  }

  /**
   * Generate email subject line
   */
  generateEmailSubject(entry, reminderType, daysUntilExpiry) {
    const urgencyMap = {
      'overdue': '🚨 OVERDUE',
      'urgent': '⚠️ URGENT',
      'upcoming': '📅 REMINDER',
      'early_warning': '📋 UPCOMING'
    };

    const urgencyPrefix = urgencyMap[reminderType] || '📅';
    
    if (daysUntilExpiry <= 0) {
      return `${urgencyPrefix}: ${entry.title} expired ${Math.abs(daysUntilExpiry)} days ago`;
    } else {
      return `${urgencyPrefix}: ${entry.title} expires in ${daysUntilExpiry} days`;
    }
  }

  /**
   * Generate action items based on product type and timeline
   */
  generateActionItems(renewalInfo, daysUntilExpiry) {
    const actions = [];

    if (renewalInfo.requiresAction) {
      if (daysUntilExpiry <= 7) {
        actions.push('Take immediate action to renew or cancel');
      } else if (daysUntilExpiry <= 30) {
        actions.push('Start renewal process or research alternatives');
      } else {
        actions.push('Review product and prepare for renewal decision');
      }
    }

    if (renewalInfo.isAutoRenewal) {
      actions.push('Compare alternatives before auto-renewal');
    }

    if (renewalInfo.noticePeriod && daysUntilExpiry <= renewalInfo.noticePeriod) {
      actions.push(`Give ${renewalInfo.noticePeriod} days notice if cancelling`);
    }

    return actions;
  }

  /**
   * Get product-specific guidance
   */
  getProductGuidance(renewalInfo) {
    if (!renewalInfo.productCategory || !renewalInfo.productType) {
      return null;
    }

    return productDetectionService.getProductConfig(
      renewalInfo.productCategory,
      renewalInfo.productType
    );
  }

  /**
   * Handle expired entries
   */
  async handleExpiredEntry(entry, daysOverdue) {
    console.log(`⚠️ Entry expired: ${entry.title} (${daysOverdue} days overdue)`);
    
    return {
      shouldSendReminder: true,
      daysUntilExpiry: -daysOverdue,
      reminderType: 'overdue',
      urgencyLevel: 'critical',
      complianceWarnings: [{
        type: 'expired',
        severity: 'critical',
        message: `This item expired ${daysOverdue} days ago and requires immediate attention`
      }]
    };
  }

  /**
   * Update entry processing information
   */
  async updateEntryProcessingInfo(entry, reminderResult) {
    const updateData = {
      'renewalInfo.lastProcessedDate': new Date()
    };

    if (reminderResult.shouldSendReminder) {
      updateData['renewalInfo.lastReminderSent'] = new Date();
      
      // Calculate next reminder due date
      const nextReminderDays = this.calculateNextReminderDays(
        entry.renewalInfo, 
        reminderResult.daysUntilExpiry
      );
      
      if (nextReminderDays) {
        const nextReminderDate = new Date();
        nextReminderDate.setDate(nextReminderDate.getDate() + nextReminderDays);
        updateData['renewalInfo.nextReminderDue'] = nextReminderDate;
      }
    }

    await Entry.findByIdAndUpdate(entry._id, updateData);
  }

  /**
   * Calculate when the next reminder should be sent
   */
  calculateNextReminderDays(renewalInfo, currentDaysUntilExpiry) {
    const reminderDays = renewalInfo.reminderDays || [30, 7];
    
    // Find the next reminder day that's less than current days until expiry
    const nextReminder = reminderDays
      .filter(days => days < currentDaysUntilExpiry)
      .sort((a, b) => b - a)[0]; // Get the highest value that's still less
    
    if (nextReminder) {
      return currentDaysUntilExpiry - nextReminder;
    }

    // If no more scheduled reminders, check for overdue handling
    if (currentDaysUntilExpiry <= 7) {
      return 7; // Weekly reminders for urgent items
    }

    return null;
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats() {
    const totalEntries = await Entry.countDocuments({
      'renewalInfo.isActive': true
    });

    const upcomingCount = await Entry.countDocuments({
      'renewalInfo.isActive': true,
      'renewalInfo.endDate': {
        $exists: true,
        $gte: new Date(),
        $lte: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // Next 30 days
      }
    });

    const overdueCount = await Entry.countDocuments({
      'renewalInfo.isActive': true,
      'renewalInfo.endDate': {
        $exists: true,
        $lt: new Date()
      }
    });

    return {
      totalActiveEntries: totalEntries,
      upcomingRenewals: upcomingCount,
      overdueItems: overdueCount,
      lastProcessingTime: this.lastProcessingTime || null
    };
  }
}

// Export singleton instance
module.exports = new RenewalReminderEngine();