// src/routes/documents.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();
const Document = require('../models/document');
const User = require('../models/user');
const mongoose = require('mongoose');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/documents');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and random suffix
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'doc-' + uniqueSuffix + ext);
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'text/csv'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Simple auth middleware (mirrors existing pattern)
function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

// Require that the user is approved
function requireApproved(req, res, next) {
  if (req.user && req.user.approved) return next();
  return res.status(403).json({ error: 'Account requires approval' });
}

// Allow owner or admin access to document
async function requireOwnerOrAdmin(req, res, next) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  
  try {
    const document = await Document.findById(id).lean();
    if (!document) return res.status(404).json({ error: 'Document not found' });
    
    const isOwner = document.owner.toString() === req.user._id.toString();
    const isShared = Array.isArray(document.sharedWith) && 
                    document.sharedWith.map(String).includes(req.user._id.toString());
    
    if (isOwner || isShared || req.user.role === 'admin') {
      req.document = document; // Attach document to request for later use
      return next();
    }
    
    return res.status(403).json({ error: 'Access denied' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}

// List documents with filtering and pagination
router.get('/', requireAuth, requireApproved, async (req, res) => {
  try {
    const { 
      limit = 25, 
      cursor, 
      category, 
      tags, 
      search, 
      archived = 'false' 
    } = req.query;
    
    // Build query
    const query = {
      $or: [
        { owner: req.user._id },
        { sharedWith: req.user._id },
      ],
      isArchived: archived === 'true'
    };
    
    // Add cursor-based pagination
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Add tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    // Add search functionality
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { originalFileName: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }
    
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('owner', 'displayName email')
      .populate('sharedWith', 'displayName email')
      .select('-filePath') // Don't expose internal file paths
      .lean();
    
    // Get total count for pagination info
    const totalCount = await Document.countDocuments({
      $or: [
        { owner: req.user._id },
        { sharedWith: req.user._id },
      ],
      isArchived: archived === 'true'
    });
    
    res.json({
      documents,
      pagination: {
        total: totalCount,
        hasMore: documents.length === Number(limit),
        nextCursor: documents.length > 0 ? documents[documents.length - 1]._id : null
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Upload and create document
router.post('/', requireAuth, requireApproved, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category, tags, confidential, accessLevel, linkedEntryId } = req.body;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Auto-generate title from filename if not provided
    const documentTitle = title?.trim() || req.file.originalname;
    
    // Parse tags if provided as string
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
      }
    }
    
    const document = await Document.create({
      title: documentTitle,
      description: description ? description.trim() : '',
      category: category || 'Other',
      tags: parsedTags,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      filePath: req.file.path,
      confidential: confidential !== undefined ? confidential === 'true' : true,
      accessLevel: accessLevel || 'private',
      owner: req.user._id,
      lastUpdatedBy: req.user._id,
      metadata: {
        uploadedFrom: req.get('User-Agent'),
        uploadIP: req.ip,
        ...(linkedEntryId && { relatedEntryId: linkedEntryId })
      }
    });
    
    // Populate owner information for response
    await document.populate('owner', 'displayName email');
    
    res.status(201).json({ 
      document,
      message: 'Document uploaded successfully' 
    });
  } catch (error) {
    console.error('Error creating document:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get single document metadata
router.get('/:id', requireAuth, requireApproved, requireOwnerOrAdmin, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'displayName email')
      .populate('sharedWith', 'displayName email')
      .populate('lastUpdatedBy', 'displayName')
      .select('-filePath') // Don't expose internal file path
      .lean();
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Download document file
router.get('/:id/download', requireAuth, requireApproved, requireOwnerOrAdmin, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const filePath = document.filePath;
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalFileName}"`);
    res.setHeader('Content-Type', document.mimeType);
    
    // Update last access date
    await Document.findByIdAndUpdate(req.params.id, { 
      lastAccessDate: new Date() 
    });
    
    // Stream file to client
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Update document metadata
router.put('/:id', requireAuth, requireApproved, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { title, description, category, tags, confidential, accessLevel, sharedWith } = req.body;
    
    const updateData = {
      lastUpdatedBy: req.user._id
    };
    
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }
    if (confidential !== undefined) updateData.confidential = confidential;
    if (accessLevel !== undefined) updateData.accessLevel = accessLevel;
    if (sharedWith !== undefined) {
      // Validate ObjectIds
      const validIds = sharedWith.filter(id => mongoose.Types.ObjectId.isValid(id));
      updateData.sharedWith = validIds;
    }
    
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('owner', 'displayName email')
    .populate('sharedWith', 'displayName email')
    .populate('lastUpdatedBy', 'displayName')
    .lean();
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json({ 
      document,
      message: 'Document updated successfully' 
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Archive/Unarchive document
router.patch('/:id/archive', requireAuth, requireApproved, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { archive = true } = req.body;
    
    const updateData = {
      isArchived: archive,
      lastUpdatedBy: req.user._id
    };
    
    if (archive) {
      updateData.archivedDate = new Date();
      updateData.archivedBy = req.user._id;
    } else {
      updateData.archivedDate = null;
      updateData.archivedBy = null;
    }
    
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('owner', 'displayName email')
    .lean();
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json({ 
      document,
      message: `Document ${archive ? 'archived' : 'unarchived'} successfully` 
    });
  } catch (error) {
    console.error('Error archiving document:', error);
    res.status(500).json({ error: 'Failed to archive document' });
  }
});

// Delete document (hard delete - removes file and database record)
router.delete('/:id', requireAuth, requireApproved, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check permissions - only owner or admin can delete
    const isOwner = document.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only document owner or admin can delete documents' });
    }
    
    // Delete file from filesystem
    if (document.filePath) {
      try {
        await fs.unlink(document.filePath);
      } catch (error) {
        console.warn('Could not delete file:', document.filePath, error.message);
      }
    }
    
    // Delete document record
    await Document.findByIdAndDelete(id);
    
    res.json({ 
      deleted: true,
      message: 'Document deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Get document categories (for frontend dropdowns)
router.get('/meta/categories', requireAuth, requireApproved, async (req, res) => {
  try {
    const categories = [
      'Financial', 'Legal', 'Insurance', 'Property', 
      'Medical', 'Tax', 'Personal', 'Other'
    ];
    
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get user's most used tags
router.get('/meta/tags', requireAuth, requireApproved, async (req, res) => {
  try {
    const pipeline = [
      {
        $match: {
          $or: [
            { owner: req.user._id },
            { sharedWith: req.user._id }
          ]
        }
      },
      { $unwind: '$tags' },
      { 
        $group: { 
          _id: '$tags', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ];
    
    const result = await Document.aggregate(pipeline);
    const tags = result.map(item => ({
      tag: item._id,
      count: item.count
    }));
    
    res.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

module.exports = router;