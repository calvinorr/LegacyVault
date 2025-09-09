// src/routes/entries.js
const express = require('express');
const router = express.Router();
const Entry = require('../models/entry');
const User = require('../models/user');
const mongoose = require('mongoose');

// Simple auth middleware (mirrors server's requireAuth)
function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

// Require that the user is approved
function requireApproved(req, res, next) {
  if (req.user && req.user.approved) return next();
  return res.status(403).json({ error: 'Account requires approval' });
}

// Allow owner or admin
async function requireOwnerOrAdmin(req, res, next) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const entry = await Entry.findById(id).lean();
  if (!entry) return res.status(404).json({ error: 'Not found' });
  if (entry.owner.toString() === req.user._id.toString()) return next();
  if (req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Forbidden' });
}

// List entries (simple pagination)
router.get('/', requireAuth, requireApproved, async (req, res) => {
  const { limit = 25, cursor } = req.query;
  const query = {
    $or: [
      { owner: req.user._id },
      { sharedWith: req.user._id },
    ],
  };
  if (cursor) {
    query._id = { $lt: mongoose.Types.ObjectId(cursor) };
  }
  const items = await Entry.find(query).sort({ _id: -1 }).limit(Number(limit)).lean();
  res.json({ entries: items });
});

// Create entry
router.post('/', requireAuth, requireApproved, async (req, res) => {
  const { title, type, provider, accountDetails, notes, attachments, confidential } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const entry = await Entry.create({
    title,
    type,
    provider,
    accountDetails,
    notes,
    attachments,
    confidential: confidential !== undefined ? confidential : true,
    owner: req.user._id,
    lastUpdatedBy: req.user._id,
  });
  res.status(201).json({ entry });
});

// Get single entry
router.get('/:id', requireAuth, requireApproved, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const entry = await Entry.findById(id).lean();
  if (!entry) return res.status(404).json({ error: 'Not found' });

  // Authorization: owner, sharedWith, or admin
  const isOwner = entry.owner && entry.owner.toString() === req.user._id.toString();
  const isShared = Array.isArray(entry.sharedWith) && entry.sharedWith.map(String).includes(req.user._id.toString());
  if (!isOwner && !isShared && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({ entry });
});

// Update entry
router.put('/:id', requireAuth, requireApproved, requireOwnerOrAdmin, async (req, res) => {
  const { id } = req.params;
  const update = { ...req.body, lastUpdatedBy: req.user._id };
  const entry = await Entry.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!entry) return res.status(404).json({ error: 'Not found' });
  res.json({ entry });
});

// Delete entry
router.delete('/:id', requireAuth, requireApproved, requireOwnerOrAdmin, async (req, res) => {
  const { id } = req.params;
  const entry = await Entry.findByIdAndDelete(id).lean();
  if (!entry) return res.status(404).json({ error: 'Not found' });
  res.json({ deleted: true });
});

module.exports = router;