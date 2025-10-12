const express = require('express');
const PatternController = require('../controllers/PatternController');

const router = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

router.use(requireAuth);

// GET /api/patterns/recurring - Get all detected patterns
router.get('/recurring', PatternController.getRecurringPatterns);

// POST /api/patterns/detect - Trigger pattern detection
router.post('/detect', PatternController.detectPatterns);

// POST /api/patterns/suggest - Get suggestion from transaction
router.post('/suggest', PatternController.suggestFromTransaction);

// POST /api/patterns/apply - Apply pattern (batch create records)
router.post('/apply', PatternController.applyPattern);

// GET /api/patterns/:id/transactions - Get transactions for pattern
router.get('/:id/transactions', PatternController.getPatternTransactions);

// DELETE /api/patterns/:id - Delete pattern
router.delete('/:id', PatternController.deletePattern);

module.exports = router;
