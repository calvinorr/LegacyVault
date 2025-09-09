// src/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Middleware to require authentication
function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

// Middleware to require approved user
function requireApproved(req, res, next) {
  if (req.user && req.user.approved) {
    return next();
  }
  return res.status(403).json({ error: 'Account pending approval' });
}

// Middleware to require admin role
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden - admin only' });
}

// Get current user
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// List users (admin)
router.get('/', requireAuth, requireApproved, requireAdmin, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  res.json({ users });
});

// Approve user (admin)
router.post('/:id/approve', requireAuth, requireApproved, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  user.approved = true;
  await user.save();
  res.json({ user });
});

module.exports = router;