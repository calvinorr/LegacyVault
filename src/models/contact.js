// src/models/contact.js
// Mongoose model for contacts in the household vault
// Designed for UK users with UK-specific formatting and fields

const mongoose = require('mongoose');
const { Schema } = mongoose;

// UK Address Schema
const AddressSchema = new Schema({
  line1: { type: String }, // House number and street
  line2: { type: String }, // Additional address line (optional)
  city: { type: String },
  county: { type: String }, // UK counties
  postcode: { 
    type: String, 
    validate: {
      validator: function(v) {
        // Basic UK postcode validation (e.g., SW1A 1AA, M1 1AA, B33 8TH)
        if (!v) return true; // Optional field
        return /^[A-Z]{1,2}[0-9R][0-9A-Z]?\s*[0-9][A-Z]{2}$/i.test(v);
      },
      message: 'Please enter a valid UK postcode'
    }
  },
  country: { type: String, default: 'United Kingdom' }
}, { _id: false });

// Phone number schema with UK formatting support
const PhoneSchema = new Schema({
  number: { 
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        // UK phone number validation (various formats)
        return /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$|^(\+44\s?1\d{3}|\(?01\d{3}\)?)\s?\d{6}$|^(\+44\s?2\d{2}|\(?02\d{2}\)?)\s?\d{7}$/.test(v.replace(/\s/g, ''));
      },
      message: 'Please enter a valid UK phone number'
    }
  },
  type: { 
    type: String, 
    enum: ['mobile', 'home', 'work', 'other'], 
    default: 'mobile' 
  },
  isPrimary: { type: Boolean, default: false }
}, { _id: false });

const ContactSchema = new Schema({
  // Basic Information
  firstName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: { 
    type: String, 
    trim: true,
    maxlength: 50
  },
  company: { 
    type: String, 
    trim: true,
    maxlength: 100
  },
  jobTitle: { 
    type: String, 
    trim: true,
    maxlength: 100
  },
  
  // Contact Details
  email: { 
    type: String,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  phones: { 
    type: [PhoneSchema], 
    default: [],
    validate: {
      validator: function(phones) {
        // Ensure only one primary phone
        const primaryPhones = phones.filter(p => p.isPrimary);
        return primaryPhones.length <= 1;
      },
      message: 'Only one phone number can be set as primary'
    }
  },
  website: { 
    type: String,
    trim: true
  },
  
  // Address
  address: { 
    type: AddressSchema,
    default: null
  },
  
  // Categorization
  category: {
    type: String,
    enum: [
      'Family', 
      'Professional', 
      'Financial', // advisors, accountants, brokers
      'Medical', // GP, dentist, specialists
      'Legal', // solicitors, barristers
      'Emergency', // emergency contacts
      'Services', // tradesman, household services
      'Educational', // schools, tutors
      'Social', // friends, neighbours
      'Other'
    ],
    default: 'Other'
  },
  
  // Relationship context
  relationship: {
    type: String,
    maxlength: 100,
    trim: true
    // e.g., 'Financial Advisor', 'GP', 'Solicitor', 'Electrician', 'Mother', 'Colleague'
  },
  
  // Personal Information
  birthday: { 
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        // Must be in the past and reasonable (not more than 150 years ago)
        const now = new Date();
        const minDate = new Date();
        minDate.setFullYear(now.getFullYear() - 150);
        return v < now && v > minDate;
      },
      message: 'Birthday must be a valid date in the past'
    }
  },
  
  // Additional Information
  notes: { 
    type: String,
    maxlength: 1000
  },
  
  // Quick access flags
  isFavorite: { type: Boolean, default: false },
  isEmergencyContact: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }, // for soft delete/archiving
  
  // Flexible tagging system
  tags: { 
    type: [String], 
    default: [],
    validate: {
      validator: function(tags) {
        return tags.length <= 20; // Reasonable limit on tags
      },
      message: 'Cannot have more than 20 tags'
    }
  },
  
  // Social/Professional Networks
  socialMedia: {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    other: { type: Schema.Types.Mixed, default: {} }
  },
  
  // Important Dates
  importantDates: [{
    name: { type: String, required: true, maxlength: 50 }, // e.g., 'Anniversary', 'Started Role'
    date: { type: Date, required: true },
    recurring: { type: Boolean, default: true }, // annual recurring
    notes: { type: String, maxlength: 200 }
  }],
  
  // Professional/Service specific information
  professionalDetails: {
    qualifications: [String], // e.g., ['ACCA', 'Chartered Financial Planner']
    specialties: [String], // e.g., ['Pension Planning', 'Tax Advice']
    businessHours: { type: String }, // e.g., 'Mon-Fri 9-5'
    fees: { type: String }, // Fee structure if relevant
    lastService: { type: Date }, // When last used their services
    nextAppointment: { type: Date }, // Upcoming appointment
    references: { type: String, maxlength: 500 } // How we found them/referral info
  },
  
  // Ownership and sharing (consistent with other models)
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  confidential: { type: Boolean, default: false }, // Most contacts are shared by default
  lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Generic metadata for extensibility
  metadata: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true,
});

// Indexes for performance
ContactSchema.index({ owner: 1, isActive: 1 });
ContactSchema.index({ owner: 1, category: 1 });
ContactSchema.index({ owner: 1, isFavorite: 1 });
ContactSchema.index({ owner: 1, isEmergencyContact: 1 });
ContactSchema.index({ firstName: 1, lastName: 1 });
ContactSchema.index({ company: 1 });
ContactSchema.index({ email: 1 });

// Text index for search functionality
ContactSchema.index({
  firstName: 'text',
  lastName: 'text', 
  company: 'text',
  email: 'text',
  relationship: 'text',
  notes: 'text',
  tags: 'text'
});

// Virtual for full name
ContactSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.company || 'Unknown';
});

// Virtual for display name (prioritizes company for professional contacts)
ContactSchema.virtual('displayName').get(function() {
  if (this.category === 'Professional' || this.category === 'Financial' || 
      this.category === 'Legal' || this.category === 'Medical' || 
      this.category === 'Services') {
    return this.company || this.fullName;
  }
  return this.fullName;
});

// Virtual for primary phone
ContactSchema.virtual('primaryPhone').get(function() {
  if (!this.phones || this.phones.length === 0) return null;
  const primary = this.phones.find(p => p.isPrimary);
  return primary || this.phones[0];
});

// Pre-save middleware to ensure data consistency
ContactSchema.pre('save', function(next) {
  // Ensure only one primary phone
  if (this.phones && this.phones.length > 0) {
    const primaryPhones = this.phones.filter(p => p.isPrimary);
    if (primaryPhones.length > 1) {
      // Keep first primary, remove primary flag from others
      let foundFirst = false;
      this.phones.forEach(p => {
        if (p.isPrimary && foundFirst) {
          p.isPrimary = false;
        } else if (p.isPrimary) {
          foundFirst = true;
        }
      });
    }
  }
  
  // Auto-set relationship based on category if not provided
  if (!this.relationship && this.category && this.category !== 'Other') {
    const relationshipMap = {
      'Family': 'Family Member',
      'Professional': 'Professional Contact', 
      'Financial': 'Financial Advisor',
      'Medical': 'Healthcare Provider',
      'Legal': 'Legal Professional',
      'Emergency': 'Emergency Contact',
      'Services': 'Service Provider',
      'Educational': 'Educational Contact',
      'Social': 'Friend/Social'
    };
    this.relationship = relationshipMap[this.category];
  }
  
  next();
});

module.exports = mongoose.model('Contact', ContactSchema);