const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const ImportController = require('../controllers/ImportController');

const router = express.Router();

// Configure multer for PDF file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Only accept PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Routes
router.use(requireAuth);

// POST /api/import/upload - Upload PDF bank statement
router.post('/upload', upload.single('statement'), ImportController.uploadStatement);

// GET /api/import/sessions - List user's import sessions
router.get('/sessions', ImportController.listSessions);

// GET /api/import/sessions/:id - Get specific import session
router.get('/sessions/:id', ImportController.getSession);

// POST /api/import/sessions/:id/confirm - Confirm recurring payment suggestions
router.post('/sessions/:id/confirm', ImportController.confirmSuggestions);

// DELETE /api/import/sessions/:id - Delete import session
router.delete('/sessions/:id', ImportController.deleteSession);

// GET /api/import/status/:id - Get processing status
router.get('/status/:id', ImportController.getStatus);

// GET /api/import/sessions/:id/transactions - Get all parsed transactions from session
router.get('/sessions/:id/transactions', ImportController.getSessionTransactions);

// POST /api/import/sessions/:id/transactions/:transactionIndex/mark-processed - Mark transaction as processed
router.post('/sessions/:id/transactions/:transactionIndex/mark-processed', ImportController.markTransactionProcessed);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }
  
  next(error);
});

module.exports = router;