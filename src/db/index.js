// src/db/index.js
// Serverless-compatible MongoDB connection helper using mongoose.
// Designed for Vercel serverless functions with connection caching.

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/household_vault';

// Global connection cache for serverless environments
let cachedConnection = null;

const connect = async () => {
  // Return cached connection if it exists and is ready
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // 10 seconds (reduced for serverless)
    socketTimeoutMS: 45000, // 45 seconds
    // Serverless-friendly connection pooling
    maxPoolSize: 10,
    minPoolSize: 1,
  };

  try {
    console.log('Establishing new MongoDB connection...');
    await mongoose.connect(MONGO_URI, opts);
    cachedConnection = mongoose;
    console.log('MongoDB connected');
    return mongoose;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    cachedConnection = null;
    throw err;
  }
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();
    cachedConnection = null;
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