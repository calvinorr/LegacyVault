// Authentication middleware
function authenticateToken(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

function requireAuth(req, res, next) {
  if (req.user && req.user.approved) {
    return next();
  }
  
  if (req.user && !req.user.approved) {
    return res.status(403).json({ error: 'Account pending approval' });
  }
  
  return res.status(401).json({ error: 'Authentication required' });
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin' && req.user.approved) {
    return next();
  }
  
  return res.status(403).json({ error: 'Admin access required' });
}

module.exports = {
  authenticateToken,
  requireAuth,
  requireAdmin
};