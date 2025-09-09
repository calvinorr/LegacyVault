const express = require('express');
const DetectionRulesController = require('../controllers/DetectionRulesController');

const router = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

router.use(requireAuth);

// GET /api/detection-rules/default - Get default detection rules
router.get('/default', DetectionRulesController.getDefaultRules);

// GET /api/detection-rules/user - Get user's custom rules
router.get('/user', DetectionRulesController.getUserRules);

// POST /api/detection-rules - Create custom detection rule
router.post('/', DetectionRulesController.createCustomRule);

// PUT /api/detection-rules/:id - Update custom detection rule
router.put('/:id', DetectionRulesController.updateCustomRule);

// DELETE /api/detection-rules/:id - Delete custom detection rule
router.delete('/:id', DetectionRulesController.deleteCustomRule);

// POST /api/detection-rules/:id/patterns - Add pattern to rule category
router.post('/:id/patterns', DetectionRulesController.addPattern);

// POST /api/detection-rules/test - Test rules against sample transactions
router.post('/test', DetectionRulesController.testRules);

// GET /api/detection-rules/stats - Get detection statistics
router.get('/stats', DetectionRulesController.getDetectionStats);

module.exports = router;