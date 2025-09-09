// src/db/index.js
// Simple MongoDB connection helper using mongoose.
// Designed for clarity and easy replacement with MongoDB Atlas connection strings.

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/household_vault';

const connect = async () => {
  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // If using MongoDB Atlas you can pass additional options or include them in the URI.
    // For production, prefer storing the full Atlas URI in MONGO_URI (with credentials managed outside VCS).
  };

  try {
    await mongoose.connect(MONGO_URI, opts);
    console.log('MongoDB connected');
    return mongoose;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
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