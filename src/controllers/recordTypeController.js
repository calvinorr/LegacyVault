const RecordType = require('../models/RecordType');

// @desc    Get all record types for a user, optionally filtered by domain
// @route   GET /api/record-types
// @access  Private
exports.getRecordTypes = async (req, res) => {
  try {
    const query = { user: req.user.id };
    if (req.query.domain) {
      query.domain = req.query.domain;
    }
    const recordTypes = await RecordType.find(query).sort('name');
    res.status(200).json(recordTypes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create a new record type
// @route   POST /api/record-types
// @access  Private (Admin)
exports.createRecordType = async (req, res) => {
  try {
    const { name, domain } = req.body;
    const recordType = new RecordType({
      name,
      domain,
      user: req.user.id
    });
    await recordType.save();
    res.status(201).json(recordType);
  } catch (error) {
    console.error('Error creating record type:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate record type name for this domain.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update a record type
// @route   PUT /api/record-types/:id
// @access  Private (Admin)
exports.updateRecordType = async (req, res) => {
  try {
    const { name } = req.body;
    const recordType = await RecordType.findById(req.params.id);

    if (!recordType) {
      return res.status(404).json({ error: 'Record type not found' });
    }

    // Ensure user owns the record type
    if (recordType.user.toString() !== req.user.id.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    recordType.name = name;
    await recordType.save();
    res.status(200).json(recordType);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete a record type
// @route   DELETE /api/record-types/:id
// @access  Private (Admin)
exports.deleteRecordType = async (req, res) => {
  try {
    const recordType = await RecordType.findById(req.params.id);

    if (!recordType) {
      return res.status(404).json({ error: 'Record type not found' });
    }

    // Ensure user owns the record type
    if (recordType.user.toString() !== req.user.id.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    await RecordType.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
