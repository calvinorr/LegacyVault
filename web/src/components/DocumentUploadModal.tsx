import React, { useState, useEffect } from 'react';
import { X, Upload, Folder, Link } from 'lucide-react';

interface Entry {
  _id: string;
  title: string;
  provider: string;
  type: string;
  category: string;
  displayName: string;
}

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], metadata: DocumentMetadata) => Promise<void>;
  selectedFiles: File[];
}

interface DocumentMetadata {
  title: string;
  description: string;
  category: string;
  tags: string[];
  confidential: boolean;
  linkedEntryId: string;
}

const categories = [
  'Financial',
  'Legal', 
  'Insurance',
  'Property',
  'Medical',
  'Tax',
  'Personal',
  'Other'
];

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onUpload,
  selectedFiles
}: DocumentUploadModalProps) {
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    title: '',
    description: '',
    category: 'Other',
    tags: [],
    confidential: true,
    linkedEntryId: ''
  });
  
  const [linkableEntries, setLinkableEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  // Load linkable entries when modal opens
  useEffect(() => {
    if (isOpen) {
      loadLinkableEntries();
      // Auto-generate title from first file if only one file
      if (selectedFiles.length === 1) {
        setMetadata(prev => ({
          ...prev,
          title: prev.title || selectedFiles[0].name
        }));
      } else if (selectedFiles.length > 1) {
        setMetadata(prev => ({
          ...prev,
          title: prev.title || `${selectedFiles.length} documents`
        }));
      }
    } else {
      // Reset form when modal closes
      setMetadata({
        title: '',
        description: '',
        category: 'Other',
        tags: [],
        confidential: true,
        linkedEntryId: ''
      });
      setTagInput('');
      setError(null);
    }
  }, [isOpen, selectedFiles]);

  // Load linkable entries based on category
  useEffect(() => {
    if (isOpen && metadata.category) {
      loadLinkableEntries(metadata.category);
    }
  }, [metadata.category, isOpen]);

  const loadLinkableEntries = async (category?: string) => {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'Other') {
        params.append('category', category);
      }
      
      const response = await fetch(`/api/entries/linkable?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to load linkable entries');
      }
      
      const data = await response.json();
      setLinkableEntries(data.entries || []);
    } catch (err: any) {
      console.error('Error loading linkable entries:', err);
      // Don't show error for linkable entries failure - not critical
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metadata.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onUpload(selectedFiles, metadata);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload documents');
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!metadata.tags.includes(newTag)) {
        setMetadata(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 24px 0 24px',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '24px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '15px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    color: '#0f172a', // Dark text color for visibility
    backgroundColor: '#ffffff'
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Upload size={24} color="#0f172a" strokeWidth={1.5} />
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#0f172a', 
              margin: 0 
            }}>
              Upload Documents
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              color: '#1e293b',
              borderRadius: '6px',
              transition: 'background-color 0.2s'
            }}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div style={{ padding: '0 24px 24px 24px' }}>
          {/* File summary */}
          <div style={{ 
            marginBottom: '24px', 
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #0f172a'
          }}>
            <div style={{ fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </div>
            <div style={{ fontSize: '13px', color: '#9ca3af' }}>
              {selectedFiles.map(f => f.name).join(', ')}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {/* Title */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Title *
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Document title..."
                required
                style={inputStyle}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Category
              </label>
              <select
                value={metadata.category}
                onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                style={selectStyle}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Linked Entry */}
            {linkableEntries.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  <Link size={16} style={{ marginRight: '6px', verticalAlign: 'text-top' }} />
                  Link to Account/Entry
                </label>
                <select
                  value={metadata.linkedEntryId}
                  onChange={(e) => setMetadata(prev => ({ ...prev, linkedEntryId: e.target.value }))}
                  style={selectStyle}
                >
                  <option value="">No linking</option>
                  {linkableEntries.map(entry => (
                    <option key={entry._id} value={entry._id}>
                      {entry.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Description
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Tags
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagAdd}
                placeholder="Type tag and press Enter..."
                style={inputStyle}
              />
              {metadata.tags.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {metadata.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: '#0f172a',
                        color: '#475569',
                        padding: '4px 8px',
                        borderRadius: '16px',
                        fontSize: '13px',
                        border: '1px solid #0f172a'
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1e293b',
                          cursor: 'pointer',
                          padding: '0',
                          fontSize: '14px'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Confidential */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginBottom: '24px' 
            }}>
              <input
                type="checkbox"
                id="confidential"
                checked={metadata.confidential}
                onChange={(e) => setMetadata(prev => ({ ...prev, confidential: e.target.checked }))}
                style={{ width: '16px', height: '16px' }}
              />
              <label htmlFor="confidential" style={{
                fontSize: '14px',
                color: '#374151',
                cursor: 'pointer'
              }}>
                Mark as confidential
              </label>
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !metadata.title.trim()}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: loading || !metadata.title.trim() ? '#9ca3af' : '#0f172a',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: loading || !metadata.title.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Uploading...' : `Upload ${selectedFiles.length} Document${selectedFiles.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}