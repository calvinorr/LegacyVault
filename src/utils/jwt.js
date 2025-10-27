// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Use environment variable or generate a strong secret
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex');

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes for sensitive financial data
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

/**
 * Generate an access token for a user
 * @param {Object} user - User object with id and email
 * @returns {string} JWT access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id || user.id,
      email: user.email,
      type: 'access',
      iat: Date.now()
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'legacylock',
      audience: 'legacylock-api'
    }
  );
};

/**
 * Generate a refresh token for a user
 * @param {Object} user - User object with id
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id || user.id,
      type: 'refresh',
      iat: Date.now()
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'legacylock'
    }
  );
};

/**
 * Verify an access token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'legacylock',
      audience: 'legacylock-api'
    });

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expired');
    }
    throw new Error('Invalid access token');
  }
};

/**
 * Verify a refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'legacylock'
    });

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    }
    throw new Error('Invalid refresh token');
  }
};

/**
 * Set secure cookie with token
 * @param {Object} res - Express response object
 * @param {string} name - Cookie name
 * @param {string} token - Token value
 * @param {boolean} isRefreshToken - Whether this is a refresh token (longer expiry)
 */
const setTokenCookie = (res, name, token, isRefreshToken = false) => {
  const maxAge = isRefreshToken
    ? 7 * 24 * 60 * 60 * 1000 // 7 days for refresh token
    : 15 * 60 * 1000; // 15 minutes for access token

  const cookieOptions = {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // CSRF protection
    maxAge,
    path: '/' // Available for all routes
  };

  // In production, explicitly set domain to ensure cookies work with Vercel
  if (process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN;
  }

  res.cookie(name, token, cookieOptions);
};

/**
 * Clear authentication cookies
 * @param {Object} res - Express response object
 */
const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setTokenCookie,
  clearAuthCookies,
  JWT_SECRET,
  JWT_REFRESH_SECRET
};
