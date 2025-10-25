import React, { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Phone, 
  Mail, 
  Building, 
  MapPin, 
  Star,
  AlertTriangle,
  Edit,
  Trash2,
  X,
  Save
} from 'lucide-react';

interface Contact {
  _id: string;
  firstName: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  email?: string;
  phones: Array<{
    number: string;
    type: 'mobile' | 'home' | 'work' | 'other';
    isPrimary: boolean;
  }>;
  website?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    county?: string;
    postcode?: string;
    country: string;
  };
  category: 'Family' | 'Professional' | 'Financial' | 'Medical' | 'Legal' | 'Emergency' | 'Services' | 'Educational' | 'Social' | 'Other';
  relationship?: string;
  birthday?: string;
  notes?: string;
  isFavorite: boolean;
  isEmergencyContact: boolean;
  isActive: boolean;
  tags: string[];
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    other?: any;
  };
  importantDates: Array<{
    name: string;
    date: string;
    recurring: boolean;
    notes?: string;
  }>;
  professionalDetails?: {
    qualifications: string[];
    specialties: string[];
    businessHours?: string;
    fees?: string;
    lastService?: string;
    nextAppointment?: string;
    references?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface NewContact {
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  email: string;
  phone: string;
  category: Contact['category'];
  relationship: string;
  notes: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    county: string;
    postcode: string;
  };
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Contact['category'] | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [newContact, setNewContact] = useState<NewContact>({
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    email: '',
    phone: '',
    category: 'Other',
    relationship: '',
    notes: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      county: '',
      postcode: ''
    }
  });

  const categories: Contact['category'][] = [
    'Family', 'Professional', 'Financial', 'Medical', 'Legal', 
    'Emergency', 'Services', 'Educational', 'Social', 'Other'
  ];

  // Load contacts from MongoDB
  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contacts', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load contacts');
      }

      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  // Create new contact
  const createContact = async () => {
    try {
      const contactData = {
        firstName: newContact.firstName,
        lastName: newContact.lastName || undefined,
        company: newContact.company || undefined,
        jobTitle: newContact.jobTitle || undefined,
        email: newContact.email || undefined,
        phones: newContact.phone ? [{
          number: newContact.phone,
          type: 'mobile' as const,
          isPrimary: true
        }] : [],
        address: (newContact.address.line1 || newContact.address.city || newContact.address.postcode) ? {
          ...newContact.address,
          country: 'United Kingdom'
        } : undefined,
        category: newContact.category,
        relationship: newContact.relationship || undefined,
        notes: newContact.notes || undefined,
        isFavorite: false,
        isEmergencyContact: false,
        isActive: true,
        tags: [],
        importantDates: []
      };

      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        throw new Error('Failed to create contact');
      }

      // Reset form and reload
      setNewContact({
        firstName: '',
        lastName: '',
        company: '',
        jobTitle: '',
        email: '',
        phone: '',
        category: 'Other',
        relationship: '',
        notes: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          county: '',
          postcode: ''
        }
      });
      setShowAddModal(false);
      loadContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contact');
    }
  };

  // Delete contact
  const deleteContact = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      loadContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (contact: Contact) => {
    try {
      const response = await fetch(`/api/contacts/${contact._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          isFavorite: !contact.isFavorite
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update contact');
      }

      loadContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact');
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (contact.company?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (contact.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (contact.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || contact.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: Contact['category']) => {
    const colors = {
      Family: '#f59e0b',
      Professional: '#3b82f6',
      Financial: '#10b981',
      Medical: '#ef4444',
      Legal: '#8b5cf6',
      Emergency: '#dc2626',
      Services: '#6b7280',
      Educational: '#06b6d4',
      Social: '#ec4899',
      Other: '#1e293b'
    };
    return colors[category] || '#1e293b';
  };

  const getDisplayName = (contact: Contact) => {
    if (contact.category === 'Professional' || contact.category === 'Financial' || 
        contact.category === 'Legal' || contact.category === 'Medical' || 
        contact.category === 'Services') {
      return contact.company || `${contact.firstName} ${contact.lastName || ''}`.trim();
    }
    return `${contact.firstName} ${contact.lastName || ''}`.trim();
  };

  const getPrimaryPhone = (contact: Contact) => {
    if (!contact.phones || contact.phones.length === 0) return null;
    const primary = contact.phones.find(p => p.isPrimary);
    return primary || contact.phones[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-800">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
                <p className="text-slate-800">{filteredContacts.length} professional contacts</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center space-x-2 shadow-lg shadow-slate-900/20"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Contact</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-700" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none w-80"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Contact['category'] | 'All')}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              >
                <option value="All">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 flex items-center space-x-1 ${viewMode === 'grid' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-800 hover:bg-slate-50'} transition-colors`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 flex items-center space-x-1 ${viewMode === 'list' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-800 hover:bg-slate-50'} transition-colors`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-8 py-6">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-800 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No contacts found</h3>
            <p className="text-slate-800 mb-6">
              {contacts.length === 0 
                ? "Start by adding your first professional contact." 
                : "Try adjusting your search or filter criteria."}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Contact</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContacts.map(contact => (
              <div
                key={contact._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-slate-900 leading-tight">
                          {getDisplayName(contact)}
                        </h3>
                        {contact.isFavorite && (
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                        )}
                        {contact.isEmergencyContact && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div
                        className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: `${getCategoryColor(contact.category)}20`,
                          color: getCategoryColor(contact.category)
                        }}
                      >
                        {contact.category}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleFavorite(contact)}
                        className="p-1 hover:bg-slate-100 rounded"
                      >
                        <Star className={`w-4 h-4 ${contact.isFavorite ? 'text-amber-500 fill-current' : 'text-slate-700'}`} />
                      </button>
                      <button
                        onClick={() => deleteContact(contact._id)}
                        className="p-1 hover:bg-red-50 text-red-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Company & Role */}
                  {(contact.company || contact.jobTitle) && (
                    <div className="mb-4">
                      {contact.company && (
                        <div className="flex items-center space-x-2 text-sm text-slate-800 mb-1">
                          <Building className="w-4 h-4" />
                          <span>{contact.company}</span>
                        </div>
                      )}
                      {contact.jobTitle && (
                        <div className="text-sm text-slate-800">{contact.jobTitle}</div>
                      )}
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {contact.email && (
                      <div className="flex items-center space-x-2 text-sm text-slate-800">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    {getPrimaryPhone(contact) && (
                      <div className="flex items-center space-x-2 text-sm text-slate-800">
                        <Phone className="w-4 h-4" />
                        <span>{getPrimaryPhone(contact)?.number}</span>
                      </div>
                    )}
                    {contact.address && (contact.address.line1 || contact.address.city) && (
                      <div className="flex items-center space-x-2 text-sm text-slate-800">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">
                          {contact.address.city}
                          {contact.address.postcode && `, ${contact.address.postcode}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {contact.notes && (
                    <div className="text-sm text-slate-800 line-clamp-2">
                      {contact.notes}
                    </div>
                  )}

                  {/* Tags */}
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {contact.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-slate-100 text-slate-800 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {contact.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-slate-100 text-slate-800 rounded">
                          +{contact.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContacts.map(contact => (
              <div
                key={contact._id}
                className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 group"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      {contact.isFavorite && (
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                      )}
                      {contact.isEmergencyContact && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-slate-900">{getDisplayName(contact)}</h3>
                        <span
                          className="px-2 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: `${getCategoryColor(contact.category)}20`,
                            color: getCategoryColor(contact.category)
                          }}
                        >
                          {contact.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-800">
                        {contact.company && <span>{contact.company}</span>}
                        {contact.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {getPrimaryPhone(contact) && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{getPrimaryPhone(contact)?.number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleFavorite(contact)}
                      className="p-2 hover:bg-slate-100 rounded"
                    >
                      <Star className={`w-4 h-4 ${contact.isFavorite ? 'text-amber-500 fill-current' : 'text-slate-700'}`} />
                    </button>
                    <button
                      onClick={() => deleteContact(contact._id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Add New Contact</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={newContact.firstName}
                    onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newContact.lastName}
                    onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Professional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={newContact.jobTitle}
                    onChange={(e) => setNewContact(prev => ({ ...prev, jobTitle: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    placeholder="Enter job title"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    placeholder="07123 456789"
                  />
                </div>
              </div>

              {/* Category & Relationship */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newContact.category}
                    onChange={(e) => setNewContact(prev => ({ ...prev, category: e.target.value as Contact['category'] }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    placeholder="e.g., Financial Advisor, GP, Solicitor"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newContact.address.line1}
                    onChange={(e) => setNewContact(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    placeholder="Street address"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newContact.address.city}
                      onChange={(e) => setNewContact(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
                      className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={newContact.address.county}
                      onChange={(e) => setNewContact(prev => ({ ...prev, address: { ...prev.address, county: e.target.value } }))}
                      className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                      placeholder="County"
                    />
                    <input
                      type="text"
                      value={newContact.address.postcode}
                      onChange={(e) => setNewContact(prev => ({ ...prev, address: { ...prev.address, postcode: e.target.value } }))}
                      className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                      placeholder="Postcode"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Additional notes or information..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createContact}
                disabled={!newContact.firstName.trim()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Contact</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}