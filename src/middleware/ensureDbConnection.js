// src/middleware/ensureDbConnection.js
// Middleware to ensure MongoDB connection is established before handling requests
// Critical for serverless environments where connection state may vary

const db = require('../db');
const { logger } = require('../utils/logger');

let connectionPromise = null;

/**
 * Middleware that ensures MongoDB connection is established before proceeding
 * Uses a shared promise to avoid race conditions with concurrent requests
 */
const ensureDbConnection = async (req, res, next) => {
  try {
    // If there's no ongoing connection attempt, start one
    if (!connectionPromise) {
      connectionPromise = db.connect().catch(err => {
        connectionPromise = null; // Reset on error
        throw err;
      });
    }

    // Wait for connection to be established
    await connectionPromise;
    next();
  } catch (error) {
    logger.error('Database connection failed in middleware', {
      error: error.message,
      stack: error.stack
    });

    res.status(503).json({
      error: 'Database connection unavailable. Please try again later.'
    });
  }
};

module.exports = ensureDbConnection;
