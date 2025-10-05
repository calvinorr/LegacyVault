const crypto = require('crypto');
const ImportSession = require('../models/ImportSession');
// Story 2.3: Entry model no longer used - Bank Import creates domain records
const pdfProcessor = require('../services/pdfProcessor');
const recurringDetector = require('../services/recurringDetector');
const backgroundProcessor = require('../services/backgroundProcessor');

class ImportController {
  // Upload PDF bank statement
  static async uploadStatement(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { buffer, originalname, size } = req.file;
      const user = req.user;

      // Generate file hash for duplicate detection
      const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

      // Check for existing import with same hash
      const existingSession = await ImportSession.findOne({
        user: user._id,
        file_hash: fileHash,
        status: { $ne: 'failed' }
      });

      if (existingSession) {
        return res.status(409).json({
          error: 'This file has already been processed',
          existingSessionId: existingSession._id
        });
      }

      // Create new import session
      const importSession = new ImportSession({
        user: user._id,
        filename: originalname,
        file_size: size,
        file_hash: fileHash,
        status: 'processing',
        processing_stage: 'pdf_parsing'
      });

      await importSession.save();

      // Start background processing
      backgroundProcessor.processPdfImport(importSession._id, buffer);

      res.status(201).json({
        sessionId: importSession._id,
        status: importSession.status,
        filename: originalname,
        message: 'Upload successful. Processing started.'
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }

  // List user's import sessions
  static async listSessions(req, res) {
    try {
      const user = req.user;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Build query filters
      const query = { user: user._id };
      if (req.query.status) {
        query.status = req.query.status;
      }

      // Get sessions with pagination
      const sessions = await ImportSession.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-transactions -recurring_payments.transactions'); // Exclude heavy data

      const totalSessions = await ImportSession.countDocuments(query);
      const totalPages = Math.ceil(totalSessions / limit);

      res.json({
        sessions,
        pagination: {
          page,
          limit,
          totalPages,
          totalSessions,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });

    } catch (error) {
      console.error('List sessions error:', error);
      res.status(500).json({ error: 'Failed to retrieve sessions' });
    }
  }

  // Get specific import session
  static async getSession(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const session = await ImportSession.findById(id);

      if (!session) {
        return res.status(404).json({ error: 'Import session not found' });
      }

      if (!session.user.equals(user._id)) {
        return res.status(403).json({ error: 'Access denied to this import session' });
      }

      res.json({ session });

    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({ error: 'Failed to retrieve session' });
    }
  }

  // Confirm recurring payment suggestions
  static async confirmSuggestions(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const { confirmations, bulk_action } = req.body;

      const session = await ImportSession.findById(id);

      if (!session) {
        return res.status(404).json({ error: 'Import session not found' });
      }

      if (!session.user.equals(user._id)) {
        return res.status(403).json({ error: 'Access denied to this import session' });
      }

      if (session.status !== 'completed') {
        return res.status(400).json({ error: 'Import session is not ready for confirmation' });
      }

      let createdEntries = [];
      let rejectedSuggestions = [];

      // Handle bulk actions
      if (bulk_action === 'accept_all') {
        for (let i = 0; i < session.recurring_payments.length; i++) {
          const suggestion = session.recurring_payments[i];
          if (suggestion.status === 'pending') {
            const entry = await ImportController._createEntryFromSuggestion(suggestion, session, user);
            createdEntries.push({ suggestion_index: i, entry_id: entry._id });
            
            // Update suggestion status
            session.recurring_payments[i].status = 'accepted';
          }
        }
      } else if (bulk_action === 'reject_all') {
        for (let i = 0; i < session.recurring_payments.length; i++) {
          if (session.recurring_payments[i].status === 'pending') {
            session.recurring_payments[i].status = 'rejected';
            rejectedSuggestions.push({ suggestion_index: i });
          }
        }
      } else if (confirmations) {
        // Handle individual confirmations
        for (const confirmation of confirmations) {
          const { suggestion_index, action, modifications } = confirmation;

          if (suggestion_index >= session.recurring_payments.length) {
            return res.status(400).json({ error: `Invalid suggestion index: ${suggestion_index}` });
          }

          const suggestion = session.recurring_payments[suggestion_index];

          if (action === 'accept') {
            // Apply user modifications if provided
            if (modifications) {
              Object.assign(suggestion.suggested_entry, modifications);
              suggestion.user_modifications = modifications;
            }

            const entry = await ImportController._createEntryFromSuggestion(suggestion, session, user);
            createdEntries.push({ suggestion_index, entry_id: entry._id });
            
            session.recurring_payments[suggestion_index].status = 'accepted';
          } else if (action === 'reject') {
            session.recurring_payments[suggestion_index].status = 'rejected';
            rejectedSuggestions.push({ suggestion_index });
          }
        }
      }

      await session.save();

      res.json({
        message: 'Suggestions processed successfully',
        created_entries: createdEntries,
        rejected_suggestions: rejectedSuggestions
      });

    } catch (error) {
      console.error('Confirm suggestions error:', error);
      res.status(500).json({ error: 'Failed to process suggestions' });
    }
  }

  // Delete import session
  static async deleteSession(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const session = await ImportSession.findById(id);

      if (!session) {
        return res.status(404).json({ error: 'Import session not found' });
      }

      if (!session.user.equals(user._id)) {
        return res.status(403).json({ error: 'Access denied to this import session' });
      }

      // Check if session has associated domain records (Story 2.3: FinanceRecord instead of Entry)
      const FinanceRecord = require('../models/domain/FinanceRecord');
      const associatedRecords = await FinanceRecord.find({
        'import_metadata.import_session_id': session._id
      });

      if (associatedRecords.length > 0) {
        return res.status(409).json({
          error: 'Cannot delete import session that has associated entries',
          associated_entries_count: associatedRecords.length
        });
      }

      await ImportSession.findByIdAndDelete(id);

      res.json({ message: 'Import session deleted successfully' });

    } catch (error) {
      console.error('Delete session error:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }

  // Get processing status
  static async getStatus(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const session = await ImportSession.findById(id)
        .select('status processing_stage error_message statistics user');

      if (!session) {
        return res.status(404).json({ error: 'Import session not found' });
      }

      if (!session.user.equals(user._id)) {
        return res.status(403).json({ error: 'Access denied to this import session' });
      }

      res.json({
        status: session.status,
        processing_stage: session.processing_stage,
        error_message: session.error_message,
        statistics: session.statistics
      });

    } catch (error) {
      console.error('Get status error:', error);
      res.status(500).json({ error: 'Failed to retrieve status' });
    }
  }

  // Helper method to create domain record from suggestion
  // Story 2.3: Updated to create domain records instead of legacy Entry
  // TODO Story 2.4: Add intelligent domain suggestion logic
  static async _createEntryFromSuggestion(suggestion, session, user) {
    const { suggested_entry } = suggestion;

    // Map category to domain record type
    // Story 2.3: Default to Finance domain for all transactions
    // Story 2.4 will add intelligent domain detection (energy → Property, car insurance → Vehicles, etc.)
    const domainMapping = {
      'utilities': { domain: 'finance', recordType: 'bill' },
      'council_tax': { domain: 'finance', recordType: 'bill' },
      'telecoms': { domain: 'finance', recordType: 'bill' },
      'subscription': { domain: 'finance', recordType: 'subscription' },
      'insurance': { domain: 'finance', recordType: 'insurance' },
      'other': { domain: 'finance', recordType: 'other' }
    };

    const mapping = domainMapping[suggestion.category] || { domain: 'finance', recordType: 'other' };

    // Import domain model dynamically based on mapping
    // Story 2.3: Only Finance domain for now
    const FinanceRecord = require('../models/domain/FinanceRecord');

    // Create domain record with Bank Import metadata
    const record = new FinanceRecord({
      user: user._id,
      name: suggested_entry.title || `${suggestion.payee} - ${suggestion.category}`,
      accountType: mapping.recordType,
      institution: suggested_entry.provider || suggestion.payee,
      priority: 'Standard',
      notes: `Created from Bank Import\nOriginal payee: ${suggestion.payee}\nCategory: ${suggestion.category}\nConfidence: ${suggestion.confidence}`,

      // Finance-specific fields populated from transaction
      balance: Math.abs(suggestion.amount), // Store transaction amount as positive

      // Audit trail
      createdBy: user._id,

      // Bank Import metadata (stored in notes for Story 2.3)
      // Story 2.4 will add proper metadata field to domain schemas
      import_metadata: {
        source: 'bank_import',
        import_session_id: session._id,
        created_from_suggestion: true,
        original_payee: suggestion.payee,
        confidence_score: suggestion.confidence,
        import_date: new Date(),
        detected_frequency: suggestion.frequency,
        amount_pattern: {
          typical_amount: Math.abs(suggestion.amount),
          variance: 0.1,
          currency: 'GBP'
        }
      }
    });

    await record.save();
    return record;
  }

  // Get all raw transactions from a session 
  static async getSessionTransactions(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const session = await ImportSession.findById(id);

      if (!session) {
        return res.status(404).json({ error: 'Import session not found' });
      }

      if (!session.user.equals(user._id)) {
        return res.status(403).json({ error: 'Access denied to this import session' });
      }

      // The transactions are already stored in session.transactions from background processing
      res.json({
        session_id: session._id,
        filename: session.filename,
        bank_name: session.bank_name,
        transaction_count: session.transactions?.length || 0,
        transactions: session.transactions || []
      });

    } catch (error) {
      console.error('Get session transactions error:', error);
      res.status(500).json({ error: 'Failed to fetch session transactions' });
    }
  }
}

module.exports = ImportController;