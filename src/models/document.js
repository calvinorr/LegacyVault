// src/models/document.js
// Mongoose model for document management in household vault
// Stores document metadata, file information, and supports sharing between users

const mongoose = require('mongoose');
const { Schema } = mongoose;

const DocumentSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  
  // Categorization
  category: { 
    type: String, 
    enum: ['Financial', 'Legal', 'Insurance', 'Property', 'Medical', 'Tax', 'Personal', 'Other'], 
    default: 'Other' 
  },
  tags: { type: [String], default: [] }, // e.g., ['important', 'tax-2024', 'mortgage']
  
  // File information
  fileName: { type: String, required: true },
  originalFileName: { type: String, required: true }, // Store original filename
  fileSize: { type: Number, required: true }, // in bytes
  mimeType: { type: String, required: true },
  filePath: { type: String }, // Internal file storage path
  fileUrl: { type: String }, // External URL if using cloud storage
  
  // Upload and modification tracking
  uploadDate: { type: Date, default: Date.now },
  lastAccessDate: { type: Date, default: Date.now },
  
  // Ownership and sharing (follows same pattern as Entry model)
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  
  // Document lifecycle
  isArchived: { type: Boolean, default: false },
  archivedDate: { type: Date },
  archivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Security and access control
  confidential: { type: Boolean, default: true },
  accessLevel: { 
    type: String, 
    enum: ['private', 'shared', 'household'], 
    default: 'private' 
  },
  
  // Document metadata (flexible storage for document-specific data)
  metadata: { 
    type: Schema.Types.Mixed, 
    default: {} 
  },
  
  // Audit trail
  lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

// Indexes for efficient queries
DocumentSchema.index({ owner: 1, createdAt: -1 });
DocumentSchema.index({ category: 1 });
DocumentSchema.index({ tags: 1 });
DocumentSchema.index({ isArchived: 1 });
DocumentSchema.index({ 'metadata.relatedEntryId': 1 }); // For linking to Entry documents

// Virtual for file size in human readable format
DocumentSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for checking if document is accessible to user
DocumentSchema.methods.isAccessibleBy = function(userId) {
  const userIdStr = userId.toString();
  const ownerIdStr = this.owner.toString();
  const sharedWithIds = this.sharedWith.map(id => id.toString());
  
  return ownerIdStr === userIdStr || sharedWithIds.includes(userIdStr);
};

// Pre-save middleware to update lastAccessDate when document is accessed
DocumentSchema.pre('findOne', function() {
  this.set({ lastAccessDate: new Date() });
});

DocumentSchema.pre('findOneAndUpdate', function() {
  this.set({ lastAccessDate: new Date() });
});

module.exports = mongoose.model('Document', DocumentSchema);