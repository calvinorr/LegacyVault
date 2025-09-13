// Renewal Reminders API Routes
// Endpoints for managing and processing renewal reminders

const express = require('express');
const router = express.Router();
const renewalReminderEngine = require('../services/renewalReminderEngine');
const Entry = require('../models/entry');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * POST /api/renewal-reminders/process
 * Manually trigger reminder processing (admin only)
 */
router.post('/process', requireAdmin, async (req, res) => {
  try {
    console.log('Manual reminder processing triggered by admin');
    const results = await renewalReminderEngine.processAllReminders();
    
    res.json({
      success: true,
      results,
      triggeredBy: req.user.email,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Manual reminder processing failed:', error);
    res.status(500).json({
      error: 'Failed to process reminders',
      details: error.message
    });
  }
});

/**
 * GET /api/renewal-reminders/stats
 * Get renewal reminder statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await renewalReminderEngine.getProcessingStats();
    
    // Add user-specific stats
    const userStats = await getUserRenewalStats(req.user.id);
    
    res.json({
      global: stats,
      user: userStats
    });
    
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch stats',
      details: error.message
    });
  }
});

/**
 * GET /api/renewal-reminders/upcoming
 * Get upcoming renewals for the current user
 */
router.get('/upcoming', async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days) || 30;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + daysAhead);
    
    const upcomingEntries = await Entry.find({
      owner: req.user.id,
      'renewalInfo.isActive': true,
      'renewalInfo.endDate': {
        $exists: true,
        $gte: new Date(),
        $lte: maxDate
      }
    })
    .sort({ 'renewalInfo.endDate': 1 })
    .select('title provider renewalInfo type');

    // Enhance with calculated fields
    const enhancedEntries = upcomingEntries.map(entry => {
      const daysUntilExpiry = Math.ceil(
        (new Date(entry.renewalInfo.endDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        ...entry.toObject(),
        daysUntilExpiry,
        urgencyLevel: calculateEntryUrgency(entry.renewalInfo, daysUntilExpiry),
        needsAttention: daysUntilExpiry <= 14
      };
    });

    res.json({
      daysAhead,
      count: enhancedEntries.length,
      entries: enhancedEntries
    });
    
  } catch (error) {
    console.error('Upcoming renewals fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch upcoming renewals',
      details: error.message
    });
  }
});

/**
 * GET /api/renewal-reminders/overdue
 * Get overdue renewals for the current user
 */
router.get('/overdue', async (req, res) => {
  try {
    const overdueEntries = await Entry.find({
      owner: req.user.id,
      'renewalInfo.isActive': true,
      'renewalInfo.endDate': {
        $exists: true,
        $lt: new Date()
      }
    })
    .sort({ 'renewalInfo.endDate': 1 }) // Oldest first
    .select('title provider renewalInfo type');

    // Enhance with calculated fields
    const enhancedEntries = overdueEntries.map(entry => {
      const daysOverdue = Math.ceil(
        (new Date() - new Date(entry.renewalInfo.endDate)) / (1000 * 60 * 60 * 24)
      );
      
      return {
        ...entry.toObject(),
        daysOverdue,
        isLegalRequirement: entry.renewalInfo.regulatoryType === 'government_required',
        severity: daysOverdue > 30 ? 'critical' : daysOverdue > 7 ? 'high' : 'medium'
      };
    });

    res.json({
      count: enhancedEntries.length,
      entries: enhancedEntries
    });
    
  } catch (error) {
    console.error('Overdue renewals fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch overdue renewals',
      details: error.message
    });
  }
});

/**
 * GET /api/renewal-reminders/timeline
 * Get renewal timeline for dashboard visualization
 */
router.get('/timeline', async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days) || 90;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + daysAhead);
    
    const entries = await Entry.find({
      owner: req.user.id,
      'renewalInfo.isActive': true,
      'renewalInfo.endDate': {
        $exists: true,
        $gte: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)), // Include 30 days of overdue
        $lte: maxDate
      }
    })
    .sort({ 'renewalInfo.endDate': 1 })
    .select('title provider renewalInfo type');

    // Group by month for timeline visualization
    const timeline = groupEntriesByMonth(entries);
    
    res.json({
      daysAhead,
      timeline,
      totalEntries: entries.length
    });
    
  } catch (error) {
    console.error('Timeline fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch renewal timeline',
      details: error.message
    });
  }
});

/**
 * POST /api/renewal-reminders/snooze/:entryId
 * Snooze reminders for a specific entry
 */
router.post('/snooze/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const { days = 7 } = req.body;
    
    const entry = await Entry.findOne({
      _id: entryId,
      owner: req.user.id
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    if (!entry.renewalInfo?.isActive) {
      return res.status(400).json({ error: 'Entry does not have active renewal tracking' });
    }
    
    // Set next reminder date
    const nextReminderDate = new Date();
    nextReminderDate.setDate(nextReminderDate.getDate() + parseInt(days));
    
    await Entry.findByIdAndUpdate(entryId, {
      'renewalInfo.nextReminderDue': nextReminderDate,
      'renewalInfo.lastProcessedDate': new Date()
    });
    
    res.json({
      success: true,
      entryId,
      snoozedDays: parseInt(days),
      nextReminderDate
    });
    
  } catch (error) {
    console.error('Snooze reminder error:', error);
    res.status(500).json({
      error: 'Failed to snooze reminder',
      details: error.message
    });
  }
});

/**
 * PUT /api/renewal-reminders/update-schedule/:entryId
 * Update reminder schedule for a specific entry
 */
router.put('/update-schedule/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const { reminderDays, urgencyLevel } = req.body;
    
    const entry = await Entry.findOne({
      _id: entryId,
      owner: req.user.id
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    const updateData = {};
    
    if (reminderDays && Array.isArray(reminderDays)) {
      updateData['renewalInfo.reminderDays'] = reminderDays.map(d => parseInt(d)).filter(d => !isNaN(d));
    }
    
    if (urgencyLevel && ['critical', 'important', 'strategic'].includes(urgencyLevel)) {
      updateData['renewalInfo.urgencyLevel'] = urgencyLevel;
    }
    
    await Entry.findByIdAndUpdate(entryId, updateData);
    
    res.json({
      success: true,
      entryId,
      updatedFields: Object.keys(updateData)
    });
    
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      error: 'Failed to update reminder schedule',
      details: error.message
    });
  }
});

// Helper function to get user-specific renewal stats
async function getUserRenewalStats(userId) {
  const now = new Date();
  const next7Days = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
  const next30Days = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

  const [total, overdue, urgent, upcoming] = await Promise.all([
    Entry.countDocuments({
      owner: userId,
      'renewalInfo.isActive': true
    }),
    Entry.countDocuments({
      owner: userId,
      'renewalInfo.isActive': true,
      'renewalInfo.endDate': { $lt: now }
    }),
    Entry.countDocuments({
      owner: userId,
      'renewalInfo.isActive': true,
      'renewalInfo.endDate': { $gte: now, $lte: next7Days }
    }),
    Entry.countDocuments({
      owner: userId,
      'renewalInfo.isActive': true,
      'renewalInfo.endDate': { $gte: next7Days, $lte: next30Days }
    })
  ]);

  return {
    totalActiveRenewals: total,
    overdue,
    urgentNext7Days: urgent,
    upcomingNext30Days: upcoming
  };
}

// Helper function to calculate entry urgency
function calculateEntryUrgency(renewalInfo, daysUntilExpiry) {
  if (daysUntilExpiry <= 0) return 'critical';
  if (daysUntilExpiry <= 3) return 'critical';
  if (daysUntilExpiry <= 7 && renewalInfo.urgencyLevel === 'critical') return 'critical';
  if (daysUntilExpiry <= 14 && renewalInfo.urgencyLevel !== 'strategic') return 'important';
  
  return renewalInfo.urgencyLevel || 'important';
}

// Helper function to group entries by month for timeline
function groupEntriesByMonth(entries) {
  const monthGroups = {};
  
  entries.forEach(entry => {
    const endDate = new Date(entry.renewalInfo.endDate);
    const monthKey = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthGroups[monthKey]) {
      monthGroups[monthKey] = {
        month: monthKey,
        entries: [],
        counts: {
          critical: 0,
          important: 0,
          strategic: 0
        }
      };
    }
    
    const daysUntilExpiry = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    const urgency = calculateEntryUrgency(entry.renewalInfo, daysUntilExpiry);
    
    monthGroups[monthKey].entries.push({
      ...entry.toObject(),
      daysUntilExpiry,
      urgency
    });
    
    monthGroups[monthKey].counts[urgency]++;
  });
  
  return Object.values(monthGroups).sort((a, b) => a.month.localeCompare(b.month));
}

module.exports = router;