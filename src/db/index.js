// src/db/index.js
// MongoDB connection helper optimized for Vercel serverless environment.
// Implements connection caching to avoid reconnecting on every serverless function invocation.

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/household_vault';

// Cache the connection for serverless reuse
let cachedConnection = null;

const connect = async () => {
  // Reuse existing connection if already connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Serverless-optimized settings
    serverSelectionTimeoutMS: 5000, // Fail fast on connection issues
    maxPoolSize: 10, // Limit connections for serverless
    minPoolSize: 1, // Keep at least one connection alive
    socketTimeoutMS: 45000, // Socket timeout
    // If using MongoDB Atlas you can pass additional options or include them in the URI.
    // For production, prefer storing the full Atlas URI in MONGO_URI (with credentials managed outside VCS).
  };

  try {
    await mongoose.connect(MONGO_URI, opts);
    console.log('MongoDB connected (new connection)');
    cachedConnection = mongoose;
    return mongoose;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    cachedConnection = null; // Clear cache on error
    throw err;
  }
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err.message);
  }
};

module.exports = {
  connect,
  disconnect,
  mongoose,
};