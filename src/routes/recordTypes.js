const express = require('express');
const router = express.Router();
const {
  getRecordTypes,
  createRecordType,
  updateRecordType,
  deleteRecordType
} = require('../controllers/recordTypeController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// All routes are protected
router.use(ensureAuthenticated);

router.route('/')
  .get(getRecordTypes)
  .post(ensureAdmin, createRecordType);

router.route('/:id')
  .put(ensureAdmin, updateRecordType)
  .delete(ensureAdmin, deleteRecordType);

module.exports = router;
