// src/db/index.js
// Serverless-compatible MongoDB connection helper using mongoose.
// Designed for Vercel serverless functions with connection caching.

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/household_vault';

// Global connection cache for serverless environments
let cachedConnection = null;
let connectionPromise = null;

const connect = async () => {
  // Return cached connection if it exists and is ready
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection (state: ready)');
    return cachedConnection;
  }

  // If a connection is in progress, wait for it
  if (connectionPromise) {
    console.log('Waiting for existing connection attempt...');
    return connectionPromise;
  }

  // Check if mongoose is already connecting
  if (mongoose.connection.readyState === 2) {
    console.log('MongoDB connection already in progress, waiting...');
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(mongoose));
      mongoose.connection.once('error', reject);
    });
  }

  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // 10 seconds (reduced for serverless)
    socketTimeoutMS: 45000, // 45 seconds
    // Serverless-friendly connection pooling
    maxPoolSize: 10,
    minPoolSize: 1,
    // Additional options for better serverless compatibility
    bufferCommands: false, // Disable buffering
    autoCreate: false, // Don't auto-create collections
  };

  connectionPromise = (async () => {
    try {
      console.log(`Establishing new MongoDB connection to ${MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}...`);
      console.log('Connection state before:', mongoose.connection.readyState);
      
      await mongoose.connect(MONGO_URI, opts);
      
      cachedConnection = mongoose;
      console.log('MongoDB connected successfully');
      console.log('Connection state after:', mongoose.connection.readyState);
      
      // Set up connection event handlers
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        cachedConnection = null;
        connectionPromise = null;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        cachedConnection = null;
        connectionPromise = null;
      });

      return mongoose;
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      cachedConnection = null;
      connectionPromise = null;
      throw err;
    }
  })();

  return connectionPromise;
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
