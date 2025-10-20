import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCreatePropertyRecord } from '../../hooks/usePropertyRecords';
import { PropertyRecord } from '../../services/api/domains';
import { isValidPostcode } from '../../utils/ukValidation';

import { useRecordTypes } from '../../hooks/useRecordTypes';

interface PropertyRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PropertyRecordForm: React.FC<PropertyRecordFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const { recordTypes, loading: recordTypesLoading } = useRecordTypes('Property');
  const createMutation = useCreatePropertyRecord();
  const [formData, setFormData] = useState<Partial<PropertyRecord>>({
    name: '',
    recordType: '',
    provider: '',
    accountNumber: '',
    postcode: '',
    contactPhone: '',
    contactEmail: '',
    monthlyAmount: undefined,
    renewalDate: '',
    priority: 'Standard',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof PropertyRecord, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.recordType) {
      newErrors.recordType = 'Record type is required';
    }

    if (formData.postcode && !isValidPostcode(formData.postcode)) {
      newErrors.postcode = 'Invalid UK postcode format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      // Reset form
      setFormData({
        name: '',
        recordType: '',
        provider: '',
        accountNumber: '',
        postcode: '',
        contactPhone: '',
        contactEmail: '',
        monthlyAmount: undefined,
        renewalDate: '',
        priority: 'Standard',
        notes: ''
      });
      setErrors({});
      onSuccess();
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create record' });
    }
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
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '95%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '15px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    color: '#0f172a', // Dark text color for visibility
    backgroundColor: '#ffffff'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#334155',
    marginBottom: '6px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
              Add Property Record
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={24} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errors.submit && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              {errors.submit}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              style={inputStyle}
              placeholder="e.g., Main Mortgage, Electric Bill"
            />
            {errors.name && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '4px' }}>{errors.name}</p>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Record Type *</label>
            <select
              value={formData.recordType}
              onChange={(e) => handleChange('recordType', e.target.value)}
              style={inputStyle}
              disabled={recordTypesLoading}
            >
              <option value="">Select type...</option>
              {recordTypes.map((type) => (
                <option key={type._id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.recordType && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '4px' }}>{errors.recordType}</p>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Provider</label>
            <input
              type="text"
              value={formData.provider}
              onChange={(e) => handleChange('provider', e.target.value)}
              style={inputStyle}
              placeholder="e.g., Santander, British Gas"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Account Number</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => handleChange('accountNumber', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Postcode</label>
            <input
              type="text"
              value={formData.postcode}
              onChange={(e) => handleChange('postcode', e.target.value)}
              style={inputStyle}
              placeholder="e.g., SW1A 1AA"
            />
            {errors.postcode && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '4px' }}>{errors.postcode}</p>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Contact Phone</label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Contact Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Monthly Amount (£)</label>
            <input
              type="number"
              step="0.01"
              value={formData.monthlyAmount || ''}
              onChange={(e) => handleChange('monthlyAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Renewal Date</label>
            <input
              type="date"
              value={formData.renewalDate}
              onChange={(e) => handleChange('renewalDate', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value as 'Critical' | 'Important' | 'Standard')}
              style={inputStyle}
            >
              <option value="Standard">Standard</option>
              <option value="Important">Important</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' as const }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: createMutation.isPending ? 0.6 : 1,
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
            >
              {createMutation.isPending ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyRecordForm;
