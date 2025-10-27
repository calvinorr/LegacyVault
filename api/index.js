/**
 * Vercel serverless function wrapper for Express app
 * This file is required for Vercel to properly run our Express backend as serverless functions
 */

// Import the Express app
const app = require('../src/server.js');

// Export the Express app as a Vercel serverless function
module.exports = app;