const Pattern = require('../models/Pattern');
const Transaction = require('../models/Transaction');
const patternDetector = require('../services/patternDetector');
const { getDomainModel } = require('../services/domainSuggestionEngine');

class PatternController {
  /**
   * GET /api/patterns/recurring
   * Get all detected recurring patterns for user
   */
  static async getRecurringPatterns(req, res) {
    try {
      const user = req.user;
      const { minConfidence = 0.65 } = req.query;

      const patterns = await Pattern.find({
        user: user._id,
        confidence: { $gte: parseFloat(minConfidence) }
      })
        .sort({ confidence: -1, occurrences: -1 })
        .populate('transactions', 'date description amount');

      res.json({
        patterns,
        totalCount: patterns.length
      });

    } catch (error) {
      console.error('Get recurring patterns error:', error);
      res.status(500).json({ error: 'Failed to retrieve patterns' });
    }
  }

  /**
   * POST /api/patterns/detect
   * Trigger pattern detection for user (background job)
   */
  static async detectPatterns(req, res) {
    try {
      const user = req.user;

      // Detect patterns from all user transactions
      const detectedPatterns = await patternDetector.detectPatternsForUser(user._id);

      // Save patterns to database
      const savedPatterns = await patternDetector.savePatterns(detectedPatterns);

      // Update transactions with pattern matches
      for (const pattern of savedPatterns) {
        await Transaction.updateMany(
          { _id: { $in: pattern.transactions } },
          {
            $set: {
              patternMatched: true,
              patternConfidence: pattern.confidence,
              patternId: pattern._id
            }
          }
        );
      }

      res.json({
        message: 'Pattern detection completed',
        patternsDetected: savedPatterns.length,
        patterns: savedPatterns
      });

    } catch (error) {
      console.error('Detect patterns error:', error);
      res.status(500).json({ error: 'Pattern detection failed' });
    }
  }

  /**
   * POST /api/patterns/suggest
   * Get domain suggestion from transaction
   */
  static async suggestFromTransaction(req, res) {
    try {
      const user = req.user;
      const { transactionId } = req.body;

      if (!transactionId) {
        return res.status(400).json({ error: 'Transaction ID required' });
      }

      const transaction = await Transaction.findOne({
        _id: transactionId,
        user: user._id
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Match against existing patterns
      const pattern = await patternDetector.matchTransaction(transaction);

      if (pattern) {
        // Return pattern-based suggestion
        res.json({
          pattern: {
            id: pattern._id,
            payee: pattern.payee,
            frequency: pattern.frequency,
            confidence: pattern.confidence,
            occurrences: pattern.occurrences
          },
          suggestion: {
            domain: pattern.suggestedDomain,
            recordType: pattern.suggestedRecordType,
            fields: {
              name: pattern.payee,
              provider: pattern.payee,
              amount: pattern.averageAmount,
              frequency: pattern.frequency
            }
          }
        });
      } else {
        // No pattern match - use basic extraction
        const payee = patternDetector.extractPayeeName(transaction.description);
        const normalizedDesc = Pattern.normalizeDescription(transaction.description);
        const domainSuggestion = patternDetector.suggestDomain(payee, normalizedDesc);

        res.json({
          pattern: null,
          suggestion: {
            domain: domainSuggestion.domain,
            recordType: domainSuggestion.recordType,
            fields: {
              name: payee,
              provider: payee,
              amount: Math.abs(transaction.amount)
            }
          }
        });
      }

    } catch (error) {
      console.error('Suggest from transaction error:', error);
      res.status(500).json({ error: 'Failed to generate suggestion' });
    }
  }

  /**
   * POST /api/patterns/apply
   * Apply pattern to create domain records (batch creation)
   */
  static async applyPattern(req, res) {
    try {
      const user = req.user;
      const { patternId, transactionIds, domain, recordType, remember = false } = req.body;

      if (!patternId || !transactionIds || !domain || !recordType) {
        return res.status(400).json({ error: 'Pattern ID, transaction IDs, domain, and record type required' });
      }

      const pattern = await Pattern.findOne({
        _id: patternId,
        user: user._id
      });

      if (!pattern) {
        return res.status(404).json({ error: 'Pattern not found' });
      }

      // Get transactions
      const transactions = await Transaction.find({
        _id: { $in: transactionIds },
        user: user._id
      });

      if (transactions.length === 0) {
        return res.status(400).json({ error: 'No valid transactions found' });
      }

      // Get domain model
      const DomainModel = getDomainModel(domain);

      // Create records for each transaction
      const createdRecords = [];
      const updatedTransactions = [];

      for (const transaction of transactions) {
        // Build record fields
        const recordData = PatternController._buildRecordFromPattern(
          pattern,
          transaction,
          domain,
          recordType,
          user
        );

        // Create domain record
        const record = new DomainModel(recordData);
        await record.save();
        createdRecords.push(record);

        // Update transaction status
        transaction.status = 'record_created';
        transaction.recordCreated = true;
        transaction.createdRecordId = record._id;
        transaction.createdRecordDomain = domain;
        transaction.createdAt = new Date();
        await transaction.save();
        updatedTransactions.push(transaction);
      }

      // Update pattern if user wants to remember
      if (remember) {
        pattern.autoSuggest = true;
        pattern.userConfirmed = true;
        pattern.suggestionAccepted = true;
        await pattern.save();
      }

      res.json({
        message: `Created ${createdRecords.length} records from pattern`,
        createdRecords,
        updatedTransactions,
        pattern
      });

    } catch (error) {
      console.error('Apply pattern error:', error);
      res.status(500).json({ error: 'Failed to apply pattern' });
    }
  }

  /**
   * Helper: Build domain record from pattern
   */
  static _buildRecordFromPattern(pattern, transaction, domain, recordType, user) {
    const commonFields = {
      user: user._id,
      name: pattern.payee,
      priority: 'Standard',
      createdBy: user._id,
      import_metadata: {
        source: 'bank_import_pattern',
        import_session_id: transaction.importSession,
        created_from_pattern: true,
        pattern_id: pattern._id,
        transaction_id: transaction._id,
        confidence_score: pattern.confidence,
        import_date: new Date()
      }
    };

    // Domain-specific fields
    const domainFields = {
      property: {
        recordType: recordType,
        provider: pattern.payee,
        monthlyAmount: pattern.averageAmount,
        notes: `Created from recurring pattern\nFrequency: ${pattern.frequency}\nConfidence: ${Math.round(pattern.confidence * 100)}%`
      },
      vehicles: {
        recordType: recordType,
        notes: `Created from recurring pattern\nFrequency: ${pattern.frequency}\nConfidence: ${Math.round(pattern.confidence * 100)}%`
      },
      finance: {
        accountType: recordType,
        institution: pattern.payee,
        balance: pattern.averageAmount,
        notes: `Created from recurring pattern\nFrequency: ${pattern.frequency}\nConfidence: ${Math.round(pattern.confidence * 100)}%`
      },
      insurance: {
        recordType: recordType,
        provider: pattern.payee,
        premium: pattern.averageAmount,
        notes: `Created from recurring pattern\nFrequency: ${pattern.frequency}\nConfidence: ${Math.round(pattern.confidence * 100)}%`
      },
      services: {
        recordType: recordType,
        provider: pattern.payee,
        monthlyFee: pattern.averageAmount,
        notes: `Created from recurring pattern\nFrequency: ${pattern.frequency}\nConfidence: ${Math.round(pattern.confidence * 100)}%`
      },
      government: {
        recordType: recordType,
        issuingAuthority: pattern.payee,
        notes: `Created from recurring pattern\nFrequency: ${pattern.frequency}\nConfidence: ${Math.round(pattern.confidence * 100)}%`
      }
    };

    return {
      ...commonFields,
      ...(domainFields[domain] || domainFields.services)
    };
  }

  /**
   * GET /api/patterns/:id/transactions
   * Get all transactions matching pattern
   */
  static async getPatternTransactions(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const pattern = await Pattern.findOne({
        _id: id,
        user: user._id
      });

      if (!pattern) {
        return res.status(404).json({ error: 'Pattern not found' });
      }

      const transactions = await Transaction.find({
        _id: { $in: pattern.transactions }
      }).sort({ date: -1 });

      res.json({
        pattern,
        transactions
      });

    } catch (error) {
      console.error('Get pattern transactions error:', error);
      res.status(500).json({ error: 'Failed to retrieve pattern transactions' });
    }
  }

  /**
   * DELETE /api/patterns/:id
   * Delete pattern and unlink transactions
   */
  static async deletePattern(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const pattern = await Pattern.findOne({
        _id: id,
        user: user._id
      });

      if (!pattern) {
        return res.status(404).json({ error: 'Pattern not found' });
      }

      // Unlink transactions
      await Transaction.updateMany(
        { patternId: pattern._id },
        {
          $unset: { patternId: '', patternMatched: '', patternConfidence: '' }
        }
      );

      await Pattern.findByIdAndDelete(id);

      res.json({ message: 'Pattern deleted successfully' });

    } catch (error) {
      console.error('Delete pattern error:', error);
      res.status(500).json({ error: 'Failed to delete pattern' });
    }
  }
}

module.exports = PatternController;
