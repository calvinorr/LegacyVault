const crypto = require('crypto');
const ImportSession = require('../models/ImportSession');
const Transaction = require('../models/Transaction');
// Story 2.3: Entry model no longer used - Bank Import creates domain records
const pdfProcessor = require('../services/pdfProcessor');
const recurringDetector = require('../services/recurringDetector');
const backgroundProcessor = require('../services/backgroundProcessor');
// Story 2.4: Domain suggestion engine for intelligent domain detection
const { suggestDomain, getDomainModel } = require('../services/domainSuggestionEngine');
// Epic 5: Duplicate detection service
const duplicateDetector = require('../services/duplicateDetector');

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

      // TESTING: Duplicate check temporarily disabled for easier testing
      // Check for existing import with same hash
      // const existingSession = await ImportSession.findOne({
      //   user: user._id,
      //   file_hash: fileHash,
      //   status: { $ne: 'failed' }
      // });

      // if (existingSession) {
      //   return res.status(409).json({
      //     error: 'This file has already been processed',
      //     existingSessionId: existingSession._id
      //   });
      // }

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
          if (!suggestion) {
            console.warn(`Skipping undefined suggestion at index ${i}`);
            continue;
          }
          if (suggestion.status === 'pending') {
            const entry = await ImportController._createEntryFromSuggestion(suggestion, session, user);
            createdEntries.push({ suggestion_index: i, entry_id: entry._id });

            // Update suggestion status
            session.recurring_payments[i].status = 'accepted';
          }
        }
      } else if (bulk_action === 'reject_all') {
        for (let i = 0; i < session.recurring_payments.length; i++) {
          const suggestion = session.recurring_payments[i];
          if (!suggestion) {
            console.warn(`Skipping undefined suggestion at index ${i}`);
            continue;
          }
          if (suggestion.status === 'pending') {
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

          if (!suggestion) {
            return res.status(400).json({ error: `Suggestion at index ${suggestion_index} is undefined` });
          }

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
  // Story 2.4: Added intelligent domain suggestion logic
  static async _createEntryFromSuggestion(suggestion, session, user, overrideDomain = null) {
    const { suggested_entry } = suggestion;

    // Story 2.4: Use domain suggestion engine for intelligent domain detection
    const domainSuggestion = suggestDomain({
      payee: suggestion.payee,
      category: suggestion.category,
      subcategory: suggestion.subcategory,
      amount: suggestion.amount
    });

    // Allow override from user selection, otherwise use suggestion
    const targetDomain = overrideDomain || domainSuggestion.domain;
    const recordType = domainSuggestion.recordType;

    // Get the appropriate domain model
    const DomainModel = getDomainModel(targetDomain);

    // Build common fields for all domain records
    const commonFields = {
      user: user._id,
      name: suggested_entry.title || `${suggestion.payee} - ${suggestion.category}`,
      priority: 'Standard',
      createdBy: user._id,

      // Bank Import metadata (all domains support this via FinanceRecord pattern)
      import_metadata: {
        source: 'bank_import',
        import_session_id: session._id,
        created_from_suggestion: true,
        original_payee: suggestion.payee,
        confidence_score: suggestion.confidence,
        import_date: new Date(),
        detected_frequency: suggestion.frequency,
        domain_suggestion: {
          suggested_domain: domainSuggestion.domain,
          confidence: domainSuggestion.confidence,
          reasoning: domainSuggestion.reasoning,
          actual_domain: targetDomain
        },
        amount_pattern: {
          typical_amount: Math.abs(suggestion.amount),
          variance: 0.1,
          currency: 'GBP'
        }
      }
    };

    // Build domain-specific fields based on target domain
    const domainSpecificFields = ImportController._buildDomainFields(
      targetDomain,
      recordType,
      suggestion,
      suggested_entry
    );

    // Create domain record
    const record = new DomainModel({
      ...commonFields,
      ...domainSpecificFields
    });

    await record.save();
    return record;
  }

  // Helper to build domain-specific fields
  static _buildDomainFields(domain, recordType, suggestion, suggested_entry) {
    const provider = suggested_entry.provider || suggestion.payee;
    const amount = Math.abs(suggestion.amount);

    const fieldMap = {
      property: {
        recordType: recordType,
        provider: provider,
        monthlyAmount: amount,
        notes: `Created from Bank Import\nOriginal payee: ${suggestion.payee}\nCategory: ${suggestion.category}`
      },
      vehicles: {
        recordType: recordType,
        name: suggested_entry.title || `${suggestion.payee}`,
        notes: `Created from Bank Import\nOriginal payee: ${suggestion.payee}\nCategory: ${suggestion.category}`
      },
      finance: {
        accountType: recordType,
        institution: provider,
        balance: amount,
        notes: `Created from Bank Import\nOriginal payee: ${suggestion.payee}\nCategory: ${suggestion.category}`
      },
      insurance: {
        recordType: recordType,
        provider: provider,
        premium: amount,
        notes: `Created from Bank Import\nOriginal payee: ${suggestion.payee}\nCategory: ${suggestion.category}`
      },
      services: {
        recordType: recordType,
        provider: provider,
        monthlyFee: amount,
        notes: `Created from Bank Import\nOriginal payee: ${suggestion.payee}\nCategory: ${suggestion.category}`
      },
      government: {
        recordType: recordType,
        issuingAuthority: provider,
        notes: `Created from Bank Import\nOriginal payee: ${suggestion.payee}\nCategory: ${suggestion.category}`
      },
      employment: {
        recordType: recordType,
        employer: provider,
        notes: `Created from Bank Import\nOriginal payee: ${suggestion.payee}\nCategory: ${suggestion.category}`
      },
      legal: {
        recordType: recordType,
        provider: provider,
        notes: `Created from Bank Import\nOriginal payee: ${suggestion.payee}\nCategory: ${suggestion.category}`
      }
    };

    return fieldMap[domain] || fieldMap.finance; // Default to finance structure
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

  // Mark a specific transaction as having a domain record created
  static async markTransactionProcessed(req, res) {
    try {
      const { id, transactionIndex } = req.params;
      const { recordId, domain } = req.body;
      const user = req.user;

      const session = await ImportSession.findById(id);

      if (!session) {
        return res.status(404).json({ error: 'Import session not found' });
      }

      if (!session.user.equals(user._id)) {
        return res.status(403).json({ error: 'Access denied to this import session' });
      }

      const index = parseInt(transactionIndex);
      if (isNaN(index) || index < 0 || index >= session.transactions.length) {
        return res.status(400).json({ error: 'Invalid transaction index' });
      }

      // Mark the transaction as processed
      session.transactions[index].recordCreated = true;
      session.transactions[index].createdRecordId = recordId;
      session.transactions[index].createdRecordDomain = domain;
      session.transactions[index].createdAt = new Date();

      await session.save();

      res.json({
        message: 'Transaction marked as processed',
        transaction: session.transactions[index]
      });

    } catch (error) {
      console.error('Mark transaction processed error:', error);
      res.status(500).json({ error: 'Failed to mark transaction as processed' });
    }
  }

  // Epic 5: Get import timeline for user
  static async getImportTimeline(req, res) {
    try {
      const user = req.user;

      const timeline = await duplicateDetector.getImportTimeline(user._id);

      res.json({
        timeline,
        totalImports: timeline.filter(m => m.imported).length
      });

    } catch (error) {
      console.error('Get import timeline error:', error);
      res.status(500).json({ error: 'Failed to retrieve import timeline' });
    }
  }

  // Epic 5: Check for duplicate before upload
  static async checkDuplicate(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const { buffer } = req.file;
      const user = req.user;

      // Calculate file hash
      const fileHash = duplicateDetector.calculateFileHash(buffer);

      // Check for duplicate
      const fileDuplicate = await duplicateDetector.checkFileDuplicate(user._id, fileHash);

      if (fileDuplicate) {
        return res.json({
          isDuplicate: true,
          duplicateSession: {
            id: fileDuplicate._id,
            filename: fileDuplicate.filename,
            uploadedAt: fileDuplicate.createdAt,
            transactionCount: fileDuplicate.statistics?.total_transactions || 0,
            statementPeriod: fileDuplicate.statement_period
          }
        });
      }

      res.json({
        isDuplicate: false,
        fileHash
      });

    } catch (error) {
      console.error('Check duplicate error:', error);
      res.status(500).json({ error: 'Failed to check for duplicates' });
    }
  }
}

module.exports = ImportController;