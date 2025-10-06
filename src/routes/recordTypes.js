const express = require('express');
const router = express.Router();
const {
  getRecordTypes,
  createRecordType,
  updateRecordType,
  deleteRecordType
} = require('../controllers/recordTypeController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All routes are protected
router.use(requireAuth);

router.route('/')
  .get(getRecordTypes)
  .post(requireAdmin, createRecordType);

router.route('/:id')
  .put(requireAdmin, updateRecordType)
  .delete(requireAdmin, deleteRecordType);

module.exports = router;
