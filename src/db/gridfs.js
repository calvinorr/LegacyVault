// src/db/gridfs.js
// GridFS bucket initialization and access for document storage

const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let bucket;

/**
 * Initialize GridFS bucket
 * Call after MongoDB connection is established
 * @returns {GridFSBucket} GridFS bucket instance
 */
const initGridFS = () => {
  if (!bucket) {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('MongoDB connection not established. Cannot initialize GridFS.');
    }
    bucket = new GridFSBucket(db, {
      bucketName: 'documents'
    });
    console.log('GridFS bucket initialized: documents');
  }
  return bucket;
};

/**
 * Get GridFS bucket instance
 * @returns {GridFSBucket} GridFS bucket instance
 */
const getGridFSBucket = () => {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized. Call initGridFS() first.');
  }
  return bucket;
};

module.exports = { initGridFS, getGridFSBucket };
