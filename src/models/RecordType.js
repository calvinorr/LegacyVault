const mongoose = require('mongoose');
const { Schema } = mongoose;

const VALID_DOMAINS = [
  'property',
  'vehicles',
  'employment',
  'government',
  'finance',
  'insurance',
  'legal',
  'services'
];

const recordTypeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    enum: VALID_DOMAINS
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, { timestamps: true });

// Compound index to ensure record type names are unique per user per domain
recordTypeSchema.index({ user: 1, domain: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('RecordType', recordTypeSchema);
