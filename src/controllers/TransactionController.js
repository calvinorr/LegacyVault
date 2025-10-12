const Transaction = require('../models/Transaction');
const ImportSession = require('../models/ImportSession');
const Pattern = require('../models/Pattern');

/**
 * Transaction Controller
 * Handles transaction status management, filtering, and bulk operations
 */
class TransactionController {
  /**
   * Get transactions with filtering and pagination
   * GET /api/transactions
   */
  static async getTransactions(req, res) {
    try {
      const user = req.user;
      const {
        status,
        startDate,
        endDate,
        importSession,
        search,
        page = 1,
        limit = 50
      } = req.query;

      // Build query
      const query = { user: user._id };

      if (status) {
        query.status = status;
      }

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      if (importSession) {
        query.importSession = importSession;
      }

      if (search) {
        query.description = { $regex: search, $options: 'i' };
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const transactions = await Transaction.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const totalTransactions = await Transaction.countDocuments(query);
      const totalPages = Math.ceil(totalTransactions / parseInt(limit));

      res.json({
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
          totalTransactions,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      });

    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to retrieve transactions' });
    }
  }

  /**
   * Get specific transaction
   * GET /api/transactions/:id
   */
  static async getTransaction(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const transaction = await Transaction.findOne({
        _id: id,
        user: user._id
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json({ transaction });

    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({ error: 'Failed to retrieve transaction' });
    }
  }

  /**
   * Update transaction status
   * PUT /api/transactions/:id/status
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, recordId, domain } = req.body;
      const user = req.user;

      const transaction = await Transaction.findOne({
        _id: id,
        user: user._id
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Validate status
      if (!['pending', 'record_created', 'ignored'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Update status
      transaction.status = status;

      if (status === 'record_created') {
        transaction.recordCreated = true;
        transaction.createdRecordId = recordId;
        transaction.createdRecordDomain = domain;
        transaction.createdAt = new Date();
      }

      await transaction.save();

      res.json({
        message: 'Transaction status updated',
        transaction
      });

    } catch (error) {
      console.error('Update transaction status error:', error);
      res.status(500).json({ error: 'Failed to update transaction status' });
    }
  }

  /**
   * Ignore transaction
   * PUT /api/transactions/:id/ignore
   */
  static async ignoreTransaction(req, res) {
    try {
      const { id } = req.params;
      const { reason, alwaysIgnore, payeeName } = req.body;
      const user = req.user;

      const transaction = await Transaction.findOne({
        _id: id,
        user: user._id
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Update transaction status
      transaction.status = 'ignored';
      transaction.ignoredReason = reason;
      transaction.ignoredAt = new Date();

      await transaction.save();

      // If alwaysIgnore is true, create or update an ignore pattern
      let pattern = null;
      if (alwaysIgnore && payeeName) {
        try {
          // Check if pattern already exists for this payee
          pattern = await Pattern.findOne({
            user: user._id,
            payeeName: payeeName,
            autoIgnore: true
          });

          if (pattern) {
            // Update existing pattern
            pattern.lastSeen = new Date();
            pattern.transactionCount = (pattern.transactionCount || 0) + 1;
            await pattern.save();
          } else {
            // Create new ignore pattern
            pattern = await Pattern.create({
              user: user._id,
              payeeName: payeeName,
              description: transaction.description,
              transactionCount: 1,
              autoIgnore: true,
              autoSuggest: false,
              confidence: 1.0,
              frequency: 'one_time',
              lastSeen: new Date(),
              createdFrom: 'user_action'
            });
          }
        } catch (patternError) {
          console.error('Error creating ignore pattern:', patternError);
          // Don't fail the request if pattern creation fails
        }
      }

      res.json({
        message: alwaysIgnore ? 'Transaction ignored and pattern created' : 'Transaction marked as ignored',
        transaction,
        pattern: pattern ? { _id: pattern._id, payeeName: pattern.payeeName } : null
      });

    } catch (error) {
      console.error('Ignore transaction error:', error);
      res.status(500).json({ error: 'Failed to ignore transaction' });
    }
  }

  /**
   * Undo ignore transaction
   * DELETE /api/transactions/:id/ignore
   */
  static async undoIgnore(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const transaction = await Transaction.findOne({
        _id: id,
        user: user._id
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      transaction.status = 'pending';
      transaction.ignoredReason = undefined;
      transaction.ignoredAt = undefined;

      await transaction.save();

      res.json({
        message: 'Transaction restored to pending',
        transaction
      });

    } catch (error) {
      console.error('Undo ignore error:', error);
      res.status(500).json({ error: 'Failed to undo ignore' });
    }
  }

  /**
   * Bulk ignore transactions
   * POST /api/transactions/bulk-ignore
   */
  static async bulkIgnore(req, res) {
    try {
      const { transactionIds, reason } = req.body;
      const user = req.user;

      if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
        return res.status(400).json({ error: 'Transaction IDs array required' });
      }

      const result = await Transaction.updateMany(
        {
          _id: { $in: transactionIds },
          user: user._id
        },
        {
          $set: {
            status: 'ignored',
            ignoredReason: reason,
            ignoredAt: new Date()
          }
        }
      );

      res.json({
        message: `${result.modifiedCount} transactions marked as ignored`,
        modifiedCount: result.modifiedCount
      });

    } catch (error) {
      console.error('Bulk ignore error:', error);
      res.status(500).json({ error: 'Failed to bulk ignore transactions' });
    }
  }

  /**
   * Get transaction statistics
   * GET /api/transactions/stats
   */
  static async getStats(req, res) {
    try {
      const user = req.user;

      const stats = await Transaction.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const statusCounts = {
        pending: 0,
        record_created: 0,
        ignored: 0,
        total: 0
      };

      stats.forEach(stat => {
        statusCounts[stat._id] = stat.count;
        statusCounts.total += stat.count;
      });

      res.json(statusCounts);

    } catch (error) {
      console.error('Get transaction stats error:', error);
      res.status(500).json({ error: 'Failed to retrieve statistics' });
    }
  }
}

module.exports = TransactionController;
