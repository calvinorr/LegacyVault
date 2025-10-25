// src/middleware/rateLimiter.js
// Rate limiting middleware to prevent abuse and attacks
// Uses different limits for different types of endpoints

const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login
 *
 * Limits: 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting in test environment
  skip: (req) => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    console.warn(`⚠️  Rate limit exceeded for auth endpoint from IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many authentication attempts. Please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * General API rate limiter
 * Prevents API abuse while allowing normal usage
 *
 * Limits: 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    console.warn(`⚠️  Rate limit exceeded for API from IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests. Please slow down and try again later.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Upload rate limiter
 * Stricter limits for file uploads to prevent storage abuse
 *
 * Limits: 10 uploads per hour per IP
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    error: 'Too many uploads from this IP, please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    console.warn(`⚠️  Rate limit exceeded for uploads from IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many file uploads. Please try again in an hour.',
      retryAfter: '1 hour'
    });
  }
});

/**
 * Generous rate limiter for general usage
 * For health checks and low-risk endpoints
 *
 * Limits: 1000 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Very generous limit
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    console.warn(`⚠️  Rate limit exceeded for general endpoint from IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests. Please try again later.'
    });
  }
});

module.exports = {
  authLimiter,
  apiLimiter,
  uploadLimiter,
  generalLimiter
};
