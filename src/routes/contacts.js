// src/routes/contacts.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');
const User = require('../models/user');
const mongoose = require('mongoose');

// Simple auth middleware (mirrors server's requireAuth)
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

// Allow owner or admin
async function requireOwnerOrAdmin(req, res, next) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid contact id' });
  }
  
  try {
    const contact = await Contact.findById(id).lean();
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    
    if (contact.owner.toString() === req.user._id.toString()) return next();
    if (req.user.role === 'admin') return next();
    
    return res.status(403).json({ error: 'Forbidden' });
  } catch (error) {
    return res.status(500).json({ error: 'Database error' });
  }
}

// List contacts with filtering and search
router.get('/', requireAuth, requireApproved, async (req, res) => {
  try {
    const { 
      limit = 25, 
      cursor, 
      category, 
      isFavorite, 
      isEmergencyContact, 
      search,
      isActive = 'true',
      sortBy = 'lastName',
      sortOrder = 'asc'
    } = req.query;
    
    // Base query - user can see their own contacts or those shared with them
    const query = {
      $and: [
        {
          $or: [
            { owner: req.user._id },
            { sharedWith: req.user._id },
          ]
        },
        { isActive: isActive === 'true' }
      ]
    };
    
    // Add cursor for pagination
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: mongoose.Types.ObjectId(cursor) };
    }
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Add favorite filter
    if (isFavorite === 'true') {
      query.isFavorite = true;
    }
    
    // Add emergency contact filter
    if (isEmergencyContact === 'true') {
      query.isEmergencyContact = true;
    }
    
    // Add search functionality
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }
    
    // Build sort object
    const sortOptions = {};
    const validSortFields = ['firstName', 'lastName', 'company', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'lastName';
    sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    
    // Add secondary sort by firstName for consistent ordering
    if (sortField !== 'firstName') {
      sortOptions.firstName = 1;
    }
    
    const contacts = await Contact.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .lean();
    
    // Get count for pagination info
    const totalCount = await Contact.countDocuments({
      $and: [
        {
          $or: [
            { owner: req.user._id },
            { sharedWith: req.user._id },
          ]
        },
        { isActive: isActive === 'true' }
      ]
    });
    
    res.json({ 
      contacts,
      pagination: {
        total: totalCount,
        hasMore: contacts.length === Number(limit),
        cursor: contacts.length > 0 ? contacts[contacts.length - 1]._id : null
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get contacts by category (quick access endpoint)
router.get('/by-category/:category', requireAuth, requireApproved, async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = [
      'Family', 'Professional', 'Financial', 'Medical', 'Legal', 
      'Emergency', 'Services', 'Educational', 'Social', 'Other'
    ];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    const contacts = await Contact.find({
      $and: [
        {
          $or: [
            { owner: req.user._id },
            { sharedWith: req.user._id },
          ]
        },
        { category: category },
        { isActive: true }
      ]
    })
    .sort({ lastName: 1, firstName: 1 })
    .lean();
    
    res.json({ contacts, category });
  } catch (error) {
    console.error('Error fetching contacts by category:', error);
    res.status(500).json({ error: 'Failed to fetch contacts by category' });
  }
});

// Get favorites
router.get('/favorites', requireAuth, requireApproved, async (req, res) => {
  try {
    const contacts = await Contact.find({
      $and: [
        {
          $or: [
            { owner: req.user._id },
            { sharedWith: req.user._id },
          ]
        },
        { isFavorite: true },
        { isActive: true }
      ]
    })
    .sort({ lastName: 1, firstName: 1 })
    .lean();
    
    res.json({ contacts });
  } catch (error) {
    console.error('Error fetching favorite contacts:', error);
    res.status(500).json({ error: 'Failed to fetch favorite contacts' });
  }
});

// Get emergency contacts
router.get('/emergency', requireAuth, requireApproved, async (req, res) => {
  try {
    const contacts = await Contact.find({
      $and: [
        {
          $or: [
            { owner: req.user._id },
            { sharedWith: req.user._id },
          ]
        },
        { isEmergencyContact: true },
        { isActive: true }
      ]
    })
    .sort({ lastName: 1, firstName: 1 })
    .lean();
    
    res.json({ contacts });
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({ error: 'Failed to fetch emergency contacts' });
  }
});

// Search contacts
router.get('/search', requireAuth, requireApproved, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    
    const contacts = await Contact.find({
      $and: [
        {
          $or: [
            { owner: req.user._id },
            { sharedWith: req.user._id },
          ]
        },
        { isActive: true },
        { $text: { $search: q.trim() } }
      ]
    })
    .sort({ score: { $meta: 'textScore' }, lastName: 1 })
    .limit(Number(limit))
    .lean();
    
    res.json({ contacts, query: q.trim() });
  } catch (error) {
    console.error('Error searching contacts:', error);
    res.status(500).json({ error: 'Failed to search contacts' });
  }
});

// Create contact
router.post('/', requireAuth, requireApproved, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      company,
      jobTitle,
      email,
      phones,
      website,
      address,
      category,
      relationship,
      birthday,
      notes,
      isFavorite,
      isEmergencyContact,
      tags,
      socialMedia,
      importantDates,
      professionalDetails,
      confidential
    } = req.body;
    
    // Validation
    if (!firstName || firstName.trim().length === 0) {
      return res.status(400).json({ error: 'First name is required' });
    }
    
    // Check for duplicate email if provided
    if (email && email.trim()) {
      const existingContact = await Contact.findOne({
        owner: req.user._id,
        email: email.toLowerCase().trim(),
        isActive: true
      });
      
      if (existingContact) {
        return res.status(400).json({ 
          error: 'A contact with this email address already exists',
          existingContactId: existingContact._id
        });
      }
    }
    
    const contact = await Contact.create({
      firstName: firstName.trim(),
      lastName: lastName?.trim(),
      company: company?.trim(),
      jobTitle: jobTitle?.trim(),
      email: email?.toLowerCase().trim(),
      phones: phones || [],
      website: website?.trim(),
      address,
      category: category || 'Other',
      relationship: relationship?.trim(),
      birthday,
      notes: notes?.trim(),
      isFavorite: Boolean(isFavorite),
      isEmergencyContact: Boolean(isEmergencyContact),
      tags: Array.isArray(tags) ? tags.filter(tag => tag && tag.trim()) : [],
      socialMedia: socialMedia || {},
      importantDates: Array.isArray(importantDates) ? importantDates : [],
      professionalDetails: professionalDetails || {},
      confidential: confidential !== undefined ? Boolean(confidential) : false,
      owner: req.user._id,
      lastUpdatedBy: req.user._id,
    });
    
    res.status(201).json({ contact });
  } catch (error) {
    console.error('Error creating contact:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Get single contact
router.get('/:id', requireAuth, requireApproved, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid contact id' });
    }
    
    const contact = await Contact.findById(id).lean();
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    
    // Authorization: owner, sharedWith, or admin
    const isOwner = contact.owner && contact.owner.toString() === req.user._id.toString();
    const isShared = Array.isArray(contact.sharedWith) && 
      contact.sharedWith.map(String).includes(req.user._id.toString());
    
    if (!isOwner && !isShared && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json({ contact });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Update contact
router.put('/:id', requireAuth, requireApproved, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.owner;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    // Always update lastUpdatedBy
    updateData.lastUpdatedBy = req.user._id;
    
    // Validate firstName if provided
    if (updateData.firstName !== undefined) {
      if (!updateData.firstName || updateData.firstName.trim().length === 0) {
        return res.status(400).json({ error: 'First name is required' });
      }
      updateData.firstName = updateData.firstName.trim();
    }
    
    // Check for duplicate email if being updated
    if (updateData.email && updateData.email.trim()) {
      const existingContact = await Contact.findOne({
        _id: { $ne: id },
        owner: req.user._id,
        email: updateData.email.toLowerCase().trim(),
        isActive: true
      });
      
      if (existingContact) {
        return res.status(400).json({ 
          error: 'A contact with this email address already exists',
          existingContactId: existingContact._id
        });
      }
      
      updateData.email = updateData.email.toLowerCase().trim();
    }
    
    // Clean up string fields
    ['lastName', 'company', 'jobTitle', 'relationship', 'notes', 'website'].forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = updateData[field]?.trim();
      }
    });
    
    // Clean up tags
    if (updateData.tags) {
      updateData.tags = Array.isArray(updateData.tags) 
        ? updateData.tags.filter(tag => tag && tag.trim()) 
        : [];
    }
    
    const contact = await Contact.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true
    }).lean();
    
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    
    res.json({ contact });
  } catch (error) {
    console.error('Error updating contact:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Soft delete contact (set isActive to false)
router.delete('/:id', requireAuth, requireApproved, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;
    
    if (permanent === 'true') {
      // Permanent delete - only allow for admins
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only administrators can permanently delete contacts' });
      }
      
      const contact = await Contact.findByIdAndDelete(id).lean();
      if (!contact) return res.status(404).json({ error: 'Contact not found' });
      
      res.json({ deleted: true, permanent: true });
    } else {
      // Soft delete - set isActive to false
      const contact = await Contact.findByIdAndUpdate(
        id, 
        { 
          isActive: false, 
          lastUpdatedBy: req.user._id 
        }, 
        { new: true }
      ).lean();
      
      if (!contact) return res.status(404).json({ error: 'Contact not found' });
      
      res.json({ deleted: true, permanent: false, contact });
    }
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Restore soft-deleted contact
router.patch('/:id/restore', requireAuth, requireApproved, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findByIdAndUpdate(
      id, 
      { 
        isActive: true, 
        lastUpdatedBy: req.user._id 
      }, 
      { new: true }
    ).lean();
    
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    
    res.json({ restored: true, contact });
  } catch (error) {
    console.error('Error restoring contact:', error);
    res.status(500).json({ error: 'Failed to restore contact' });
  }
});

// Export contacts (CSV format)
router.get('/export/csv', requireAuth, requireApproved, async (req, res) => {
  try {
    const { category, includeInactive = 'false' } = req.query;
    
    const query = {
      $or: [
        { owner: req.user._id },
        { sharedWith: req.user._id },
      ]
    };
    
    if (includeInactive !== 'true') {
      query.isActive = true;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const contacts = await Contact.find(query)
      .sort({ lastName: 1, firstName: 1 })
      .lean();
    
    // Convert to CSV format
    const csvHeaders = [
      'First Name', 'Last Name', 'Company', 'Job Title', 'Email', 
      'Primary Phone', 'Category', 'Relationship', 'Address', 
      'Birthday', 'Notes', 'Tags', 'Is Favorite', 'Is Emergency Contact'
    ].join(',');
    
    const csvRows = contacts.map(contact => {
      const primaryPhone = contact.phones?.find(p => p.isPrimary) || contact.phones?.[0];
      const address = contact.address ? 
        [contact.address.line1, contact.address.line2, contact.address.city, 
         contact.address.county, contact.address.postcode]
          .filter(Boolean)
          .join(', ') : '';
      
      return [
        `"${contact.firstName || ''}"`,
        `"${contact.lastName || ''}"`,
        `"${contact.company || ''}"`,
        `"${contact.jobTitle || ''}"`,
        `"${contact.email || ''}"`,
        `"${primaryPhone?.number || ''}"`,
        `"${contact.category || ''}"`,
        `"${contact.relationship || ''}"`,
        `"${address}"`,
        `"${contact.birthday ? contact.birthday.toISOString().split('T')[0] : ''}"`,
        `"${(contact.notes || '').replace(/"/g, '""')}"`,
        `"${(contact.tags || []).join('; ')}"`,
        `"${contact.isFavorite ? 'Yes' : 'No'}"`,
        `"${contact.isEmergencyContact ? 'Yes' : 'No'}"`
      ].join(',');
    });
    
    const csv = [csvHeaders, ...csvRows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting contacts:', error);
    res.status(500).json({ error: 'Failed to export contacts' });
  }
});

// Get contact statistics
router.get('/stats/summary', requireAuth, requireApproved, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await Contact.aggregate([
      {
        $match: {
          $or: [{ owner: userId }, { sharedWith: userId }],
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          favorites: { $sum: { $cond: ['$isFavorite', 1, 0] } },
          emergency: { $sum: { $cond: ['$isEmergencyContact', 1, 0] } },
          byCategory: {
            $push: {
              category: '$category',
              count: 1
            }
          }
        }
      }
    ]);
    
    // Get category breakdown
    const categoryStats = await Contact.aggregate([
      {
        $match: {
          $or: [{ owner: userId }, { sharedWith: userId }],
          isActive: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const summary = stats[0] || { total: 0, favorites: 0, emergency: 0 };
    delete summary._id;
    delete summary.byCategory;
    
    res.json({
      summary,
      categoryBreakdown: categoryStats
    });
  } catch (error) {
    console.error('Error fetching contact statistics:', error);
    res.status(500).json({ error: 'Failed to fetch contact statistics' });
  }
});

module.exports = router;