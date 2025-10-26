// src/db/index.js
// Serverless-compatible MongoDB connection helper using mongoose.
// Designed for Vercel serverless functions with connection caching.

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/household_vault';

// Global connection cache for serverless environments
let cachedConnection = null;
let connectionPromise = null;

const connect = async (retries = 3) => {
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
    serverSelectionTimeoutMS: 5000, // Reduced to 5 seconds for faster failure
    socketTimeoutMS: 45000, // 45 seconds
    // Serverless-friendly connection pooling
    maxPoolSize: 1, // Minimal for serverless
    minPoolSize: 0, // Allow zero connections
    // Additional options for better serverless compatibility
    bufferCommands: false, // Disable buffering
    autoCreate: false, // Don't auto-create collections
    // Add retry options
    retryWrites: true,
    w: 'majority',
    // Force IPv4 (sometimes helps with Vercel)
    family: 4,
  };

  connectionPromise = (async () => {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`MongoDB connection attempt ${attempt}/${retries} to ${MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}...`);
        console.log('Connection state before:', mongoose.connection.readyState);
        
        // Clear any existing connection first
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close();
        }
        
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
        lastError = err;
        console.error(`MongoDB connection attempt ${attempt} failed:`, err.message);
        
        if (attempt < retries) {
          console.log(`Retrying in ${attempt} seconds...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
        
        cachedConnection = null;
        connectionPromise = null;
      }
    }
    
    // All retries failed
    console.error('All MongoDB connection attempts failed');
    throw lastError;
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
