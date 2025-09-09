// src/models/user.js
// Minimal User model for Household Finance Vault.
// Stores OAuth identity, a simple role, and an approval flag.
// For production, consider adding validation, indexes, and field-level encryption for sensitive fields.

const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  googleId: { type: String, index: true, unique: true, sparse: true },
  displayName: { type: String },
  email: { type: String, index: true, sparse: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  // approved indicates whether an admin has approved this user to access the shared vault
  approved: { type: Boolean, default: false },
  // Generic metadata for provider-specific data, avatars, etc.
  metadata: { type: Schema.Types.Mixed, default: {} },
}, {
  timestamps: true,
});

// Note: In a real deployment you may want to:
// - Use field-level encryption for sensitive fields via MongoDB Atlas.
// - Add validation and stricter schema constraints.
// - Avoid storing full tokens unless necessary; store only identifiers required for the app.

module.exports = mongoose.model('User', UserSchema);