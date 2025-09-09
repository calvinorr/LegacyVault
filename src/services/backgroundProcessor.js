const ImportSession = require('../models/ImportSession');
const pdfProcessor = require('./pdfProcessor');
const recurringDetector = require('./recurringDetector');

/**
 * Background processor for PDF import tasks
 */
class BackgroundProcessor {
  constructor() {
    this.processingQueue = new Map(); // sessionId -> processing status
  }

  /**
   * Process PDF import in background
   * @param {String} sessionId - Import session ID
   * @param {Buffer} pdfBuffer - PDF file buffer
   */
  async processPdfImport(sessionId, pdfBuffer) {
    if (this.processingQueue.has(sessionId)) {
      console.warn(`Session ${sessionId} is already being processed`);
      return;
    }

    this.processingQueue.set(sessionId, 'processing');

    try {
      // Step 1: Parse PDF
      await this.updateSessionStage(sessionId, 'pdf_parsing');
      console.log(`Starting PDF parsing for session ${sessionId}`);
      
      const pdfContent = await pdfProcessor.parsePdfBuffer(pdfBuffer);
      
      // Step 2: Extract transactions
      await this.updateSessionStage(sessionId, 'transaction_extraction');
      console.log(`Extracting transactions for session ${sessionId}`);
      
      const bankName = pdfProcessor.identifyBankFromContent(pdfContent);
      const extractionResult = await pdfProcessor.extractTransactions(pdfContent, bankName);
      
      let transactions, metadata;
      if (Array.isArray(extractionResult)) {
        transactions = extractionResult;
        metadata = {};
      } else {
        transactions = extractionResult;
        metadata = {
          accountNumber: extractionResult.accountNumber,
          sortCode: extractionResult.sortCode,
          statementPeriod: extractionResult.statementPeriod
        };
      }

      // Step 3: Pattern analysis
      await this.updateSessionStage(sessionId, 'pattern_analysis');
      console.log(`Analyzing patterns for session ${sessionId}`);
      
      const recurringPayments = await recurringDetector.detectRecurringPayments(transactions);
      
      // Step 4: Generate suggestions
      await this.updateSessionStage(sessionId, 'suggestion_generation');
      console.log(`Generating suggestions for session ${sessionId}`);
      
      // Calculate statistics
      const statistics = this.calculateStatistics(transactions, recurringPayments);
      
      // Step 5: Complete processing
      await this.updateSessionStage(sessionId, 'complete');
      
      const session = await ImportSession.findByIdAndUpdate(
        sessionId,
        {
          status: 'completed',
          processing_stage: 'complete',
          bank_name: bankName,
          account_number: metadata.accountNumber,
          statement_period: metadata.statementPeriod,
          transactions,
          recurring_payments: recurringPayments,
          statistics,
          error_message: null
        },
        { new: true }
      );

      console.log(`Processing completed for session ${sessionId}. Found ${recurringPayments.length} recurring payment suggestions`);
      
    } catch (error) {
      console.error(`Processing failed for session ${sessionId}:`, error);
      
      await ImportSession.findByIdAndUpdate(sessionId, {
        status: 'failed',
        error_message: error.message || 'Processing failed'
      });
      
    } finally {
      this.processingQueue.delete(sessionId);
    }
  }

  /**
   * Update session processing stage
   * @param {String} sessionId - Session ID
   * @param {String} stage - Processing stage
   */
  async updateSessionStage(sessionId, stage) {
    await ImportSession.findByIdAndUpdate(sessionId, {
      processing_stage: stage
    });
  }

  /**
   * Calculate processing statistics
   * @param {Array} transactions - Extracted transactions
   * @param {Array} recurringPayments - Detected recurring payments
   * @returns {Object} Statistics object
   */
  calculateStatistics(transactions, recurringPayments) {
    const debits = transactions.filter(t => t.amount < 0);
    const credits = transactions.filter(t => t.amount > 0);
    
    const totalDebits = debits.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate date range
    const dates = transactions.map(t => t.date).sort((a, b) => a - b);
    const dateRangeDays = dates.length > 1 
      ? Math.round((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      total_transactions: transactions.length,
      recurring_detected: recurringPayments.length,
      date_range_days: dateRangeDays,
      total_debits: Math.round(totalDebits * 100) / 100,
      total_credits: Math.round(totalCredits * 100) / 100
    };
  }

  /**
   * Check if session is currently being processed
   * @param {String} sessionId - Session ID
   * @returns {Boolean} True if processing
   */
  isProcessing(sessionId) {
    return this.processingQueue.has(sessionId);
  }

  /**
   * Get current processing status
   * @param {String} sessionId - Session ID
   * @returns {String|null} Processing status or null
   */
  getProcessingStatus(sessionId) {
    return this.processingQueue.get(sessionId) || null;
  }

  /**
   * Cancel processing for session
   * @param {String} sessionId - Session ID
   */
  async cancelProcessing(sessionId) {
    if (this.processingQueue.has(sessionId)) {
      this.processingQueue.delete(sessionId);
      
      await ImportSession.findByIdAndUpdate(sessionId, {
        status: 'failed',
        error_message: 'Processing cancelled'
      });
      
      console.log(`Processing cancelled for session ${sessionId}`);
    }
  }

  /**
   * Get queue statistics for monitoring
   * @returns {Object} Queue statistics
   */
  getQueueStats() {
    return {
      activeProcessing: this.processingQueue.size,
      processingSessions: Array.from(this.processingQueue.keys())
    };
  }

  /**
   * Process expired sessions (cleanup job)
   */
  async processExpiredSessions() {
    try {
      const expiredSessions = await ImportSession.find({
        expires_at: { $lt: new Date() },
        auto_cleanup: true,
        status: { $ne: 'processing' } // Don't cleanup sessions being processed
      });

      let cleanedCount = 0;
      for (const session of expiredSessions) {
        // Cancel any pending processing
        if (this.processingQueue.has(session._id.toString())) {
          await this.cancelProcessing(session._id.toString());
        }

        // Delete the session
        await ImportSession.findByIdAndDelete(session._id);
        cleanedCount++;
      }

      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} expired import sessions`);
      }

    } catch (error) {
      console.error('Error processing expired sessions:', error);
    }
  }

  /**
   * Retry failed processing
   * @param {String} sessionId - Session ID
   * @param {Buffer} pdfBuffer - PDF buffer (if available)
   */
  async retryProcessing(sessionId, pdfBuffer) {
    const session = await ImportSession.findById(sessionId);
    if (!session || session.status !== 'failed') {
      throw new Error('Session not found or not in failed state');
    }

    // Reset session status
    await ImportSession.findByIdAndUpdate(sessionId, {
      status: 'processing',
      processing_stage: 'pdf_parsing',
      error_message: null,
      transactions: [],
      recurring_payments: [],
      statistics: {
        total_transactions: 0,
        recurring_detected: 0,
        date_range_days: 0,
        total_debits: 0,
        total_credits: 0
      }
    });

    // Start processing again
    await this.processPdfImport(sessionId, pdfBuffer);
  }
}

// Create singleton instance
const backgroundProcessor = new BackgroundProcessor();

// Setup periodic cleanup (run every hour)
setInterval(() => {
  backgroundProcessor.processExpiredSessions();
}, 60 * 60 * 1000);

module.exports = backgroundProcessor;