// src/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Note: authenticateToken middleware is already applied at the router level in server.js
// So req.user and req.userId are already available here

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
router.get('/me', async (req, res) => {
  try {
    // req.user is already populated by authenticateToken middleware
    if (!req.user) {
      // If user object not loaded, try to fetch it
      const user = await User.findById(req.userId).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({ 
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          approved: user.approved
        }
      });
    }
    
    res.json({ 
      user: {
        id: req.user._id,
        email: req.user.email,
        displayName: req.user.displayName,
        role: req.user.role,
        approved: req.user.approved
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// List users (admin)
router.get('/', requireApproved, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.json({ users });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// Approve user (admin)
router.post('/:id/approve', requireApproved, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.approved = true;
    await user.save();
    
    res.json({ 
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        approved: user.approved
      }
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

module.exports = router;
