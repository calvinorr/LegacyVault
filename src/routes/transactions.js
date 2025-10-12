const express = require('express');
const TransactionController = require('../controllers/TransactionController');

const router = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Apply auth middleware to all routes
router.use(requireAuth);

// GET /api/transactions - List transactions with filtering
router.get('/', TransactionController.getTransactions);

// GET /api/transactions/stats - Get transaction statistics
router.get('/stats', TransactionController.getStats);

// GET /api/transactions/:id - Get specific transaction
router.get('/:id', TransactionController.getTransaction);

// PUT /api/transactions/:id/status - Update transaction status
router.put('/:id/status', TransactionController.updateStatus);

// PUT /api/transactions/:id/ignore - Ignore transaction
router.put('/:id/ignore', TransactionController.ignoreTransaction);

// DELETE /api/transactions/:id/ignore - Undo ignore
router.delete('/:id/ignore', TransactionController.undoIgnore);

// POST /api/transactions/bulk-ignore - Bulk ignore transactions
router.post('/bulk-ignore', TransactionController.bulkIgnore);

module.exports = router;
