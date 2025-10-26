// src/middleware/jwtAuth.js
const { verifyAccessToken, verifyRefreshToken } = require('../utils/jwt');
const User = require('../models/user');

/**
 * Middleware to authenticate JWT tokens from cookies
 * Looks for token in httpOnly cookie
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the token
    const decoded = verifyAccessToken(token);

    // Attach user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    // Optionally load full user object (if needed by routes)
    try {
      const user = await User.findById(decoded.userId).select('-password');
      req.user = user;
    } catch (dbError) {
      console.error('Error loading user from database:', dbError);
      // Continue without full user object - routes can handle this
    }

    next();
  } catch (error) {
    console.error('JWT authentication error:', error.message);
    
    if (error.message === 'Access token expired') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware to verify refresh token
 * Used for the refresh endpoint
 */
const authenticateRefreshToken = (req, res, next) => {
  try {
    // Get refresh token from cookie
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    // Verify the refresh token
    const decoded = verifyRefreshToken(token);

    // Attach user ID to request
    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error('Refresh token error:', error.message);
    
    if (error.message === 'Refresh token expired') {
      return res.status(401).json({ error: 'Refresh token expired', code: 'REFRESH_TOKEN_EXPIRED' });
    }
    
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Sets req.user if valid token exists
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (token) {
      const decoded = verifyAccessToken(token);
      req.userId = decoded.userId;
      req.userEmail = decoded.email;

      // Try to load user
      try {
        const user = await User.findById(decoded.userId).select('-password');
        req.user = user;
      } catch (dbError) {
        console.error('Error loading user from database:', dbError);
      }
    }
  } catch (error) {
    // Silently ignore token errors for optional auth
    console.debug('Optional auth token error (ignored):', error.message);
  }

  next();
};

module.exports = {
  authenticateToken,
  authenticateRefreshToken,
  optionalAuth
};
